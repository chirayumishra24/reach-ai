import { db } from "@/lib/db";
import { igPosts, researchEntries, contentItems, socialAccounts, igInsights } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { eq, desc, sum } from "drizzle-orm";
import { generateSocialInsights } from "@/lib/ai/insights-agent";
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

    // 1. Get recent posts for the org
    const posts = await db
      .select()
      .from(igPosts)
      .where(eq(igPosts.orgId, orgId))
      .orderBy(desc(igPosts.timestamp))
      .limit(30);

    // 2. Fetch basic stats
    const researchCount = await db
      .select()
      .from(researchEntries)
      .where(eq(researchEntries.orgId, orgId));

    const contentCount = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.orgId, orgId));

    const [insightsSums] = await db
      .select({
        totalViews: sum(igInsights.views),
      })
      .from(igInsights)
      .where(eq(igInsights.orgId, orgId));

    const stats = {
      totalResearch: researchCount.length,
      totalContent: contentCount.length,
      totalViews: parseInt(insightsSums?.totalViews || "0", 10),
    };

    // 3. Generate insights using the AI agent
    const aiInsights = await generateSocialInsights(posts, stats);

    return NextResponse.json(aiInsights);
  } catch (error) {
    console.error("AI insights generation error:", error);
    return NextResponse.json({ message: "Failed to generate AI insights" }, { status: 500 });
  }
}
