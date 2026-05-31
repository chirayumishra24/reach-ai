import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { fullSync } from "@/lib/meta/sync-engine";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  // Validate cron authentication secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const activeAccounts = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.platform, "instagram"));

    console.log(`[Cron] Found ${activeAccounts.length} active Instagram accounts to sync.`);

    const results = [];

    for (const account of activeAccounts) {
      try {
        await fullSync(account.id);
        results.push({ accountId: account.id, username: account.platformUsername, status: "success" });
      } catch (err) {
        console.error(`[Cron] Sync failed for account ${account.platformUsername}:`, err);
        results.push({ accountId: account.id, username: account.platformUsername, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({ message: "Cron sync executed", results });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
