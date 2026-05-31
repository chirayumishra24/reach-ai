import { db } from "@/lib/db";
import { researchEntries, contentItems, socialAccounts, igPosts, igInsights } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { eq, sum } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrg(session);
    if (!orgId) {
      return NextResponse.json({ message: "No active organization found" }, { status: 400 });
    }

    // 1. Get research counts
    const research = await db
      .select()
      .from(researchEntries)
      .where(eq(researchEntries.orgId, orgId));

    // 2. Get content items
    const content = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.orgId, orgId));

    // 3. Get Instagram stats if any
    const connectedAccounts = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.orgId, orgId));

    // Calculate reach & impressions sums from ig_insights
    const [insightsSums] = await db
      .select({
        totalReach: sum(igInsights.reach),
        totalImpressions: sum(igInsights.impressions),
        totalViews: sum(igInsights.views),
      })
      .from(igInsights)
      .where(eq(igInsights.orgId, orgId));

    const totalIgReach = parseInt(insightsSums?.totalReach || "0", 10);
    const totalIgViews = parseInt(insightsSums?.totalViews || "0", 10);

    const totalFollowers = connectedAccounts.reduce(
      (sum, acc) => sum + (acc.followersCount || 0),
      0
    );

    const stats = {
      totalResearch: research.length,
      pendingApproval: research.filter((r) => r.status === "pending").length,
      approved: research.filter((r) => r.status === "approved").length,
      published: research.filter((r) => r.status === "published").length,
      totalContent: content.length,
      // Fallback to legacy performance fields if no real Instagram insights synced yet
      totalClicks: content.reduce((acc, c) => acc + (c.performance?.clicks || 0), 0),
      totalViews: totalIgViews || content.reduce((acc, c) => acc + (c.performance?.views || 0), 0),
      totalReach: totalIgReach,
      totalFollowers,
      connectedAccountsCount: connectedAccounts.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET stats error:", error);
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}
