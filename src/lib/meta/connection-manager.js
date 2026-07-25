/**
 * Connection Manager — Central module for per-user Meta account management
 *
 * Handles the full lifecycle:
 * 1. Connect: OAuth code → token exchange → account discovery → encrypted DB store
 * 2. Get: Fetch active connection with auto-refresh
 * 3. Disconnect: Revoke + delete
 * 4. Refresh: Manual or cron-triggered token refresh
 */

import { db } from "../db";
import { metaConnections } from "../db/schema";
import { eq, and, lt } from "drizzle-orm";
import { encryptToken, decryptToken } from "./token-manager";
import { exchangeCodeForToken, getLongLivedToken, discoverInstagramAccounts } from "./oauth";

const META_GRAPH_URL = "https://graph.facebook.com";
const META_API_VERSION = process.env.META_GRAPH_VERSION || "v22.0";

/**
 * Complete OAuth flow and store the connection for a user.
 * code → short-lived token → long-lived token → discover accounts → encrypt & store
 */
export async function connectMetaAccount(userId, code) {
  // Step 1: Exchange code for short-lived token
  console.log("[ConnectionManager] Exchanging authorization code...");
  const shortLived = await exchangeCodeForToken(code);

  // Step 2: Upgrade to long-lived token (60 days)
  console.log("[ConnectionManager] Upgrading to long-lived token...");
  const longLived = await getLongLivedToken(shortLived.accessToken);

  // Step 3: Discover connected FB Pages + IG Business accounts
  console.log("[ConnectionManager] Discovering connected accounts...");
  const discoveredAccounts = await discoverInstagramAccounts(longLived.accessToken);

  // Step 4: Get user info
  const meRes = await fetch(
    `${META_GRAPH_URL}/${META_API_VERSION}/me?fields=id,name,email&access_token=${longLived.accessToken}`
  );
  const meData = await meRes.json();

  // Step 5: Auto-select primary account (first with IG)
  const primaryAccount = discoveredAccounts[0] || null;
  const expiresAt = new Date(Date.now() + (longLived.expiresIn || 5184000) * 1000);

  // Step 6: Fetch IG followers count
  let igFollowers = 0;
  if (primaryAccount?.instagramAccountId) {
    try {
      const igRes = await fetch(
        `${META_GRAPH_URL}/${META_API_VERSION}/${primaryAccount.instagramAccountId}?fields=followers_count&access_token=${longLived.accessToken}`
      );
      const igData = await igRes.json();
      igFollowers = igData.followers_count || 0;
    } catch { /* ignore */ }
  }

  // Step 7: Encrypt tokens and upsert into database
  const encryptedAccessToken = encryptToken(longLived.accessToken);
  const encryptedPageToken = primaryAccount?.facebookPageToken
    ? encryptToken(primaryAccount.facebookPageToken)
    : null;

  const connectionData = {
    userId,
    accessToken: encryptedAccessToken,
    expiresAt,
    isShortLived: false,
    fbPageId: primaryAccount?.facebookPageId || null,
    fbPageName: primaryAccount?.facebookPageName || null,
    pageAccessToken: encryptedPageToken,
    igAccountId: primaryAccount?.instagramAccountId || null,
    igUsername: primaryAccount?.instagramUsername || null,
    igName: primaryAccount?.instagramName || null,
    igProfilePic: primaryAccount?.profilePictureUrl || null,
    igFollowers,
    scopesGranted: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
    connectedAt: new Date(),
    lastRefreshedAt: new Date(),
    status: "active",
    allPagesJson: discoveredAccounts,
  };

  // Check for existing connection for this user + IG account
  const existing = primaryAccount?.instagramAccountId
    ? await db
        .select({ id: metaConnections.id })
        .from(metaConnections)
        .where(
          and(
            eq(metaConnections.userId, userId),
            eq(metaConnections.igAccountId, primaryAccount.instagramAccountId)
          )
        )
        .limit(1)
    : [];

  let connection;
  if (existing.length > 0) {
    // Update existing connection
    [connection] = await db
      .update(metaConnections)
      .set(connectionData)
      .where(eq(metaConnections.id, existing[0].id))
      .returning();
  } else {
    // Insert new connection
    [connection] = await db
      .insert(metaConnections)
      .values(connectionData)
      .returning();
  }

  console.log("[ConnectionManager] Connection saved:", {
    id: connection.id,
    igUsername: connection.igUsername,
    fbPage: connection.fbPageName,
  });

  return {
    connectionId: connection.id,
    igUsername: connection.igUsername,
    igName: connection.igName,
    igProfilePic: connection.igProfilePic,
    igFollowers: connection.igFollowers,
    fbPageName: connection.fbPageName,
    allAccounts: discoveredAccounts,
    expiresAt,
  };
}

/**
 * Get the active Meta connection for a user, with auto-refresh if needed.
 * Returns null if no active connection exists.
 */
export async function getActiveConnection(userId) {
  const [connection] = await db
    .select()
    .from(metaConnections)
    .where(
      and(
        eq(metaConnections.userId, userId),
        eq(metaConnections.status, "active")
      )
    )
    .limit(1);

  if (!connection) return null;

  // Check if token needs refresh (< 7 days remaining)
  const now = new Date();
  const expiresAt = connection.expiresAt ? new Date(connection.expiresAt) : null;

  if (expiresAt && expiresAt <= now) {
    // Token is expired — mark it
    await db
      .update(metaConnections)
      .set({ status: "expired" })
      .where(eq(metaConnections.id, connection.id));
    return { ...connection, status: "expired", _needsReconnect: true };
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (expiresAt && (expiresAt - now) < sevenDaysMs) {
    // Auto-refresh
    try {
      const refreshed = await refreshConnectionToken(connection.id);
      return refreshed;
    } catch (err) {
      console.warn("[ConnectionManager] Auto-refresh failed:", err.message);
      // Return current connection, it's still valid
    }
  }

  // Decrypt tokens for use
  return {
    ...connection,
    _decryptedAccessToken: decryptToken(connection.accessToken),
    _decryptedPageToken: connection.pageAccessToken
      ? decryptToken(connection.pageAccessToken)
      : null,
  };
}

/**
 * Get decrypted access token for a user's active connection.
 * Throws if no active connection exists.
 */
export async function getValidTokenForUser(userId) {
  const connection = await getActiveConnection(userId);

  if (!connection) {
    throw new Error("No Meta account connected. Please connect via Settings → Connect Instagram.");
  }

  if (connection._needsReconnect) {
    throw new Error("Your Meta access token has expired. Please reconnect your Instagram account.");
  }

  return {
    accessToken: connection._decryptedAccessToken || decryptToken(connection.accessToken),
    pageAccessToken: connection._decryptedPageToken || (connection.pageAccessToken ? decryptToken(connection.pageAccessToken) : null),
    igAccountId: connection.igAccountId,
    igUsername: connection.igUsername,
    fbPageId: connection.fbPageId,
    connectionId: connection.id,
  };
}

/**
 * Refresh a specific connection's token.
 */
export async function refreshConnectionToken(connectionId) {
  const [connection] = await db
    .select()
    .from(metaConnections)
    .where(eq(metaConnections.id, connectionId))
    .limit(1);

  if (!connection) throw new Error("Connection not found");

  const currentToken = decryptToken(connection.accessToken);
  const refreshed = await getLongLivedToken(currentToken);

  const newExpiresAt = new Date(Date.now() + (refreshed.expiresIn || 5184000) * 1000);
  const encryptedNewToken = encryptToken(refreshed.accessToken);

  const [updated] = await db
    .update(metaConnections)
    .set({
      accessToken: encryptedNewToken,
      expiresAt: newExpiresAt,
      lastRefreshedAt: new Date(),
      status: "active",
    })
    .where(eq(metaConnections.id, connectionId))
    .returning();

  console.log(`[ConnectionManager] Refreshed token for connection ${connectionId}`);

  return {
    ...updated,
    _decryptedAccessToken: refreshed.accessToken,
    _decryptedPageToken: updated.pageAccessToken
      ? decryptToken(updated.pageAccessToken)
      : null,
  };
}

/**
 * Disconnect a user's Meta account.
 */
export async function disconnectMetaAccount(userId, connectionId) {
  // Verify ownership
  const [connection] = await db
    .select()
    .from(metaConnections)
    .where(
      and(
        eq(metaConnections.id, connectionId),
        eq(metaConnections.userId, userId)
      )
    )
    .limit(1);

  if (!connection) throw new Error("Connection not found or you don't have access");

  // Optionally revoke the token via Meta's API
  try {
    const token = decryptToken(connection.accessToken);
    await fetch(
      `${META_GRAPH_URL}/${META_API_VERSION}/me/permissions?access_token=${token}`,
      { method: "DELETE" }
    );
  } catch (err) {
    console.warn("[ConnectionManager] Token revocation failed (may already be expired):", err.message);
  }

  // Delete from database
  await db
    .delete(metaConnections)
    .where(eq(metaConnections.id, connectionId));

  console.log(`[ConnectionManager] Disconnected connection ${connectionId} for user ${userId}`);
  return { success: true };
}

/**
 * Get connection status for display in the UI.
 */
export async function getConnectionStatus(userId) {
  const connections = await db
    .select()
    .from(metaConnections)
    .where(eq(metaConnections.userId, userId));

  if (connections.length === 0) {
    return {
      connected: false,
      connections: [],
      message: "No Instagram account connected. Click 'Connect Instagram' to get started.",
    };
  }

  return {
    connected: true,
    connections: connections.map((c) => {
      const expiresAt = c.expiresAt ? new Date(c.expiresAt) : null;
      const now = new Date();
      const daysUntilExpiry = expiresAt
        ? Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24))
        : null;

      let tokenHealth = "healthy";
      if (c.status === "revoked") tokenHealth = "revoked";
      else if (c.status === "expired" || (expiresAt && expiresAt <= now)) tokenHealth = "expired";
      else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) tokenHealth = "expiring_soon";

      return {
        id: c.id,
        igAccountId: c.igAccountId,
        igUsername: c.igUsername,
        igName: c.igName,
        igProfilePic: c.igProfilePic,
        igFollowers: c.igFollowers,
        fbPageId: c.fbPageId,
        fbPageName: c.fbPageName,
        status: c.status,
        tokenHealth,
        daysUntilExpiry,
        connectedAt: c.connectedAt,
        lastRefreshedAt: c.lastRefreshedAt,
      };
    }),
  };
}

/**
 * Refresh all tokens that are expiring within the next 7 days.
 * Called by cron job.
 */
export async function refreshAllExpiringTokens() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiringConnections = await db
    .select()
    .from(metaConnections)
    .where(
      and(
        eq(metaConnections.status, "active"),
        lt(metaConnections.expiresAt, sevenDaysFromNow)
      )
    );

  console.log(`[ConnectionManager] Found ${expiringConnections.length} expiring tokens`);

  const results = { refreshed: 0, failed: 0, errors: [] };

  for (const connection of expiringConnections) {
    try {
      await refreshConnectionToken(connection.id);
      results.refreshed++;
    } catch (err) {
      results.failed++;
      results.errors.push({ connectionId: connection.id, error: err.message });
      console.error(`[ConnectionManager] Failed to refresh ${connection.id}:`, err.message);

      // Mark as expired if refresh fails
      await db
        .update(metaConnections)
        .set({ status: "expired" })
        .where(eq(metaConnections.id, connection.id));
    }
  }

  return results;
}
