import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { exchangeCodeForToken, getLongLivedToken, discoverInstagramAccounts } from "@/lib/meta/oauth";
import { encryptToken } from "@/lib/meta/token-manager";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // state represents the orgId
  const error = searchParams.get("error");

  const baseUrl = req.nextUrl.origin;

  if (error) {
    console.error("Meta OAuth returned error:", error);
    return NextResponse.redirect(`${baseUrl}/app?tab=accounts&error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/app?tab=accounts&error=missing_parameters`);
  }

  const orgId = state;

  try {
    // 1. Exchange auth code for short-lived token
    const shortLived = await exchangeCodeForToken(code);

    // 2. Exchange short-lived token for long-lived token (60 days)
    const longLived = await getLongLivedToken(shortLived.accessToken);

    // 3. Discover Instagram Business Accounts
    const accounts = await discoverInstagramAccounts(longLived.accessToken);

    if (accounts.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/app?tab=accounts&error=no_instagram_accounts_found`
      );
    }

    // 4. Save accounts to database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (longLived.expiresIn || 5184000));

    for (const acc of accounts) {
      // Check if account already connected to this org
      const [existing] = await db
        .select()
        .from(socialAccounts)
        .where(
          and(
            eq(socialAccounts.orgId, orgId),
            eq(socialAccounts.platformUserId, acc.instagramAccountId)
          )
        )
        .limit(1);

      const encryptedToken = encryptToken(longLived.accessToken);

      if (existing) {
        // Update credentials
        await db
          .update(socialAccounts)
          .set({
            accessToken: encryptedToken,
            tokenExpiresAt: expiresAt,
            platformUsername: acc.instagramUsername,
            profilePictureUrl: acc.profilePictureUrl,
            metaPageId: acc.facebookPageId,
            updatedAt: new Date(),
          })
          .where(eq(socialAccounts.id, existing.id));
      } else {
        // Insert new social account connection
        await db.insert(socialAccounts).values({
          orgId,
          platform: "instagram",
          platformUserId: acc.instagramAccountId,
          platformUsername: acc.instagramUsername,
          accessToken: encryptedToken,
          tokenExpiresAt: expiresAt,
          metaPageId: acc.facebookPageId,
          metaIgAccountId: acc.instagramAccountId,
          profilePictureUrl: acc.profilePictureUrl,
          followersCount: 0, // Will populate during first sync
          isActive: true,
        });
      }
    }

    // Redirect to success page
    return NextResponse.redirect(`${baseUrl}/app?tab=accounts&success=connected`);
  } catch (err) {
    console.error("Meta OAuth callback processing failed:", err);
    return NextResponse.redirect(
      `${baseUrl}/app?tab=accounts&error=${encodeURIComponent(err.message || "oauth_failed")}`
    );
  }
}
