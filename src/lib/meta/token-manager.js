import crypto from "crypto";
import { db } from "../db";
import { metaConnections, socialAccounts } from "../db/schema";
import { eq, and, lt } from "drizzle-orm";
import { getLongLivedToken } from "./oauth";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM is standard

function getEncryptionKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TOKEN_ENCRYPTION_KEY is required in production!");
    }
    // Development fallback (32 bytes hex)
    return "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  }
  
  // Hash the key to guarantee it is exactly 32 bytes
  return crypto.createHash("sha256").update(key).digest();
}

/**
 * Encrypts a text string using AES-256-GCM.
 */
export function encryptToken(text) {
  if (!text) return null;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Return format: iv:encrypted:authTag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an encrypted token string.
 */
export function decryptToken(encryptedString) {
  if (!encryptedString) return null;
  const key = getEncryptionKey();
  
  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  const authTag = Buffer.from(parts[2], "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Checks all active meta_connections and refreshes tokens nearing expiry (< 7 days).
 * This is the primary refresh function for the multi-tenant system.
 */
export async function refreshExpiringTokens() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Query new multi-tenant meta_connections table
  const expiringConnections = await db
    .select()
    .from(metaConnections)
    .where(
      and(
        eq(metaConnections.status, "active"),
        lt(metaConnections.expiresAt, sevenDaysFromNow)
      )
    );

  console.log(`[TokenManager] Found ${expiringConnections.length} expiring meta connections.`);

  for (const connection of expiringConnections) {
    try {
      const decryptedToken = decryptToken(connection.accessToken);
      
      console.log(`[TokenManager] Refreshing token for @${connection.igUsername}`);
      
      const refreshed = await getLongLivedToken(decryptedToken);
      
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (refreshed.expiresIn || 5184000));

      await db
        .update(metaConnections)
        .set({
          accessToken: encryptToken(refreshed.accessToken),
          expiresAt,
          lastRefreshedAt: new Date(),
        })
        .where(eq(metaConnections.id, connection.id));

      console.log(`[TokenManager] Successfully refreshed token for @${connection.igUsername}`);
    } catch (error) {
      console.error(`[TokenManager] Failed to refresh connection ${connection.id}:`, error.message);
      
      // Mark as expired on failure
      await db
        .update(metaConnections)
        .set({ status: "expired" })
        .where(eq(metaConnections.id, connection.id));
    }
  }

  // Also refresh legacy socialAccounts (backward compatibility)
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

  const expiringSocial = await db
    .select()
    .from(socialAccounts)
    .where(lt(socialAccounts.tokenExpiresAt, fifteenDaysFromNow));

  for (const account of expiringSocial) {
    try {
      const decryptedToken = decryptToken(account.accessToken);
      const refreshed = await getLongLivedToken(decryptedToken);
      
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (refreshed.expiresIn || 5184000));

      await db
        .update(socialAccounts)
        .set({
          accessToken: encryptToken(refreshed.accessToken),
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(socialAccounts.id, account.id));
    } catch (error) {
      console.error(`[TokenManager] Failed to refresh legacy account ${account.id}:`, error);
    }
  }
}
