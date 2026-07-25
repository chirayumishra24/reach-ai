import { refreshAllExpiringTokens } from "@/lib/meta/connection-manager";
import { NextResponse } from "next/server";

/**
 * Cron endpoint to auto-refresh Meta tokens nearing expiry.
 * Should be called daily via Vercel Cron or external scheduler.
 * 
 * Protected by CRON_SECRET to prevent unauthorized access.
 * GET /api/cron/refresh-tokens?secret=YOUR_CRON_SECRET
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Verify cron secret
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting token refresh job...");
    const results = await refreshAllExpiringTokens();
    console.log("[Cron] Token refresh complete:", results);

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Token refresh failed:", error);
    return NextResponse.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
