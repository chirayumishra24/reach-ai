import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { fullSync } from "@/lib/meta/sync-engine";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrg(session);
    if (!orgId) {
      return NextResponse.json({ message: "No active organization found" }, { status: 400 });
    }

    // Optional: Accept a specific socialAccountId to sync only that account
    const body = await req.json().catch(() => ({}));
    const { socialAccountId } = body;

    let accountsQuery = db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.orgId, orgId),
          eq(socialAccounts.platform, "instagram")
        )
      );

    if (socialAccountId) {
      accountsQuery = db
        .select()
        .from(socialAccounts)
        .where(
          and(
            eq(socialAccounts.id, socialAccountId),
            eq(socialAccounts.orgId, orgId),
            eq(socialAccounts.platform, "instagram")
          )
        );
    }

    const accounts = await accountsQuery;

    if (accounts.length === 0) {
      return NextResponse.json({ message: "No connected Instagram accounts found" }, { status: 404 });
    }

    const results = [];

    for (const account of accounts) {
      try {
        await fullSync(account.id);
        results.push({ id: account.id, username: account.platformUsername, status: "success" });
      } catch (err) {
        console.error(`[ManualSync] Sync failed for ${account.platformUsername}:`, err);
        results.push({ id: account.id, username: account.platformUsername, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({ message: "Sync process completed", results });
  } catch (error) {
    console.error("Manual sync API error:", error);
    return NextResponse.json({ message: "Failed to perform sync" }, { status: 500 });
  }
}
