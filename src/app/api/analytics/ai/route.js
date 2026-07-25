import { auth } from "@/auth";
import { fetchProfileOverview, fetchPostsWithInsights } from "@/lib/meta/insights-fetcher";
import { db } from "@/lib/db";
import { analyticsCache } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getValidTokenForUser } from "@/lib/meta/connection-manager";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creds = await getValidTokenForUser(session.user.id);

    // Check cache first
    const [cached] = await db
      .select()
      .from(analyticsCache)
      .where(
        and(
          eq(analyticsCache.userId, session.user.id),
          eq(analyticsCache.igAccountId, creds.igAccountId),
          eq(analyticsCache.dataType, "ai_insights")
        )
      )
      .limit(1);

    if (cached && new Date(cached.expiresAt) > new Date()) {
      return NextResponse.json({ insights: cached.data, cached: true });
    }

    // Fetch fresh data
    const [profile, posts] = await Promise.all([
      fetchProfileOverview(session.user.id),
      fetchPostsWithInsights(session.user.id, 12),
    ]);

    // Prepare data summary for Gemini
    const dataSummary = buildDataSummary(profile, posts);

    // Call Gemini API
    const aiInsights = await generateInsights(dataSummary);

    // Cache for 6 hours
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

    const existingCache = cached
      ? [cached]
      : await db
          .select({ id: analyticsCache.id })
          .from(analyticsCache)
          .where(
            and(
              eq(analyticsCache.userId, session.user.id),
              eq(analyticsCache.igAccountId, creds.igAccountId),
              eq(analyticsCache.dataType, "ai_insights")
            )
          )
          .limit(1);

    if (existingCache.length > 0) {
      await db
        .update(analyticsCache)
        .set({ data: aiInsights, fetchedAt: new Date(), expiresAt })
        .where(eq(analyticsCache.id, existingCache[0].id));
    } else {
      await db.insert(analyticsCache).values({
        userId: session.user.id,
        igAccountId: creds.igAccountId,
        dataType: "ai_insights",
        data: aiInsights,
        fetchedAt: new Date(),
        expiresAt,
      });
    }

    return NextResponse.json({ insights: aiInsights, cached: false });
  } catch (error) {
    console.error("[Analytics/AI] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildDataSummary(profile, posts) {
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
  const engagementRate = profile.followers > 0
    ? ((totalLikes + totalComments) / posts.length / profile.followers * 100).toFixed(2)
    : "0";

  const contentBreakdown = {};
  posts.forEach((p) => {
    contentBreakdown[p.contentType] = (contentBreakdown[p.contentType] || 0) + 1;
  });

  const topPosts = [...posts]
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 3)
    .map((p) => ({
      type: p.contentType,
      likes: p.likes,
      comments: p.comments,
      reach: p.insights?.reach || 0,
      caption_preview: (p.caption || "").slice(0, 100),
      hashtags: p.hashtags?.slice(0, 5),
    }));

  const hashtagFreq = {};
  posts.forEach((p) => {
    (p.hashtags || []).forEach((tag) => {
      hashtagFreq[tag] = (hashtagFreq[tag] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return {
    username: profile.username,
    followers: profile.followers,
    following: profile.following,
    postCount: profile.postCount,
    recentPostsAnalyzed: posts.length,
    avgLikes,
    avgComments,
    engagementRate: `${engagementRate}%`,
    contentBreakdown,
    topPosts,
    topHashtags,
  };
}

async function generateInsights(dataSummary) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    // Return mock insights if no API key
    return {
      summary: `@${dataSummary.username} has ${dataSummary.followers.toLocaleString()} followers with ${dataSummary.engagementRate} engagement rate. Based on ${dataSummary.recentPostsAnalyzed} recent posts analyzed.`,
      strengths: [
        "Consistent posting frequency",
        `Average ${dataSummary.avgLikes} likes per post`,
        `${dataSummary.engagementRate} engagement rate`,
      ],
      improvements: [
        "Experiment with different content types",
        "Increase usage of trending hashtags",
        "Post during peak audience activity hours",
      ],
      contentTips: [
        "Reels tend to get 2-3x more reach than static posts",
        "Carousel posts drive higher saves and shares",
        "Use 5-10 relevant hashtags per post for optimal reach",
      ],
      growthPrediction: "Based on current trends, maintaining this engagement rate could lead to 10-15% follower growth in the next 30 days.",
      _source: "mock",
    };
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an Instagram analytics expert. Analyze this Instagram account data and provide actionable insights.

Account Data:
${JSON.stringify(dataSummary, null, 2)}

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "summary": "2-3 sentence overview of account performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "contentTips": ["tip 1", "tip 2", "tip 3"],
  "bestContentType": "the content type performing best and why",
  "hashtagStrategy": "specific hashtag recommendations based on their data",
  "growthPrediction": "data-backed growth projection for next 30 days",
  "postingSchedule": "recommended posting frequency and timing"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text || "";
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { ...JSON.parse(jsonMatch[0]), _source: "gemini" };
    }

    return { summary: text, _source: "gemini_raw" };
  } catch (err) {
    console.error("[AI Insights] Gemini API error:", err.message);
    return {
      summary: `Analysis for @${dataSummary.username}: ${dataSummary.followers.toLocaleString()} followers, ${dataSummary.engagementRate} engagement rate.`,
      strengths: ["Active posting schedule", "Engaged audience"],
      improvements: ["Diversify content formats", "Optimize posting times"],
      contentTips: ["Try Reels for higher reach", "Use carousels for education content"],
      _source: "fallback",
      _error: err.message,
    };
  }
}
