import { db } from "@/lib/db";
import { contentItems, igPosts, igInsights } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { eq, desc } from "drizzle-orm";
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

    // 1. Get content items
    const content = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.orgId, orgId));

    // Calculate platform performance and tag metrics
    const platformMap = {};
    const tagMap = {};
    let totalClicks = 0;
    let totalViews = 0;

    content.forEach((c) => {
      const clicks = c.performance?.clicks || 0;
      const views = c.performance?.views || 0;
      const platform = c.publication?.platform || "unknown";
      const tags = Array.isArray(c.tagSnapshot) ? c.tagSnapshot : [];

      totalClicks += clicks;
      totalViews += views;

      if (!platformMap[platform]) platformMap[platform] = 0;
      platformMap[platform] += clicks;

      tags.forEach((tag) => {
        if (!tagMap[tag]) tagMap[tag] = { totalClicks: 0, posts: 0 };
        tagMap[tag].totalClicks += clicks;
        tagMap[tag].posts += 1;
      });
    });

    const platformPerformance = Object.entries(platformMap).map(([platform, totalClicks]) => ({
      platform,
      totalClicks,
    }));

    const topTags = Object.entries(tagMap)
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.totalClicks - a.totalClicks);

    const topContent = content
      .map((c) => ({
        id: c.id,
        keyword: c.keyword,
        format: c.format,
        views: c.performance?.views || 0,
        clicks: c.performance?.clicks || 0,
        ctr: c.performance?.views ? ((c.performance.clicks / c.performance.views) * 100).toFixed(1) : "0.0",
        tags: Array.isArray(c.tagSnapshot) ? c.tagSnapshot : [],
        publishedUrl: c.publication?.publishedUrl,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // 2. Fetch recent Instagram posts if available
    const dbIgPosts = await db
      .select({
        id: igPosts.id,
        mediaId: igPosts.mediaId,
        mediaType: igPosts.mediaType,
        mediaProductType: igPosts.mediaProductType,
        caption: igPosts.caption,
        permalink: igPosts.permalink,
        thumbnailUrl: igPosts.thumbnailUrl,
        timestamp: igPosts.timestamp,
        likeCount: igPosts.likeCount,
        commentsCount: igPosts.commentsCount,
      })
      .from(igPosts)
      .where(eq(igPosts.orgId, orgId))
      .orderBy(desc(igPosts.timestamp))
      .limit(10);

    return NextResponse.json({
      platformPerformance,
      topTags,
      topContent,
      instagramPosts: dbIgPosts,
      totals: {
        avgCtr: totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0",
      },
    });
  } catch (error) {
    console.error("GET insights error:", error);
    return NextResponse.json({ message: "Failed to fetch insights" }, { status: 500 });
  }
}
