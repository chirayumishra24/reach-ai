/**
 * Insights Fetcher — Per-user Instagram analytics data fetching
 *
 * All functions require a userId and resolve credentials from meta_connections.
 * Results are cached in analytics_cache to avoid hitting API rate limits.
 */

import { db } from "../db";
import { analyticsCache } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getValidTokenForUser } from "./connection-manager";
import { buildGraphUrl, checkRateLimit, trackApiCall } from "./meta-config";

const META_GRAPH_URL = "https://graph.facebook.com";
const META_API_VERSION = process.env.META_GRAPH_VERSION || "v22.0";

// Cache TTL in minutes
const CACHE_TTL = {
  profile: 30,
  posts: 15,
  insights: 60,
  audience: 120,
  ai_insights: 360,
};

// ─── Cache Helpers ──────────────────────────────────────────────

async function getCachedData(userId, igAccountId, dataType) {
  const [cached] = await db
    .select()
    .from(analyticsCache)
    .where(
      and(
        eq(analyticsCache.userId, userId),
        eq(analyticsCache.igAccountId, igAccountId),
        eq(analyticsCache.dataType, dataType)
      )
    )
    .limit(1);

  if (!cached) return null;

  const now = new Date();
  if (new Date(cached.expiresAt) <= now) return null;

  return cached.data;
}

async function setCachedData(userId, igAccountId, dataType, data) {
  const ttlMinutes = CACHE_TTL[dataType] || 30;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // Upsert
  const [existing] = await db
    .select({ id: analyticsCache.id })
    .from(analyticsCache)
    .where(
      and(
        eq(analyticsCache.userId, userId),
        eq(analyticsCache.igAccountId, igAccountId),
        eq(analyticsCache.dataType, dataType)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(analyticsCache)
      .set({ data, fetchedAt: new Date(), expiresAt })
      .where(eq(analyticsCache.id, existing.id));
  } else {
    await db.insert(analyticsCache).values({
      userId,
      igAccountId,
      dataType,
      data,
      fetchedAt: new Date(),
      expiresAt,
    });
  }
}

// ─── Meta Graph API Request Helper ──────────────────────────────

async function metaGraphRequest(path, accessToken, params = {}) {
  const rateCheck = checkRateLimit("instagram");
  if (!rateCheck.allowed) {
    throw new Error(`Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetsIn / 60000)} min.`);
  }
  trackApiCall("instagram");

  const url = new URL(`${META_GRAPH_URL}/${META_API_VERSION}${path}`);
  url.searchParams.set("access_token", accessToken);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  });

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.error) {
    const msg = data?.error?.message || `Meta API error ${res.status}`;
    const err = new Error(msg);
    err.statusCode = data?.error?.code;
    throw err;
  }

  return data;
}

// ─── Profile Overview ───────────────────────────────────────────

export async function fetchProfileOverview(userId, forceRefresh = false) {
  const creds = await getValidTokenForUser(userId);

  if (!forceRefresh) {
    const cached = await getCachedData(userId, creds.igAccountId, "profile");
    if (cached) return cached;
  }

  const data = await metaGraphRequest(`/${creds.igAccountId}`, creds.accessToken, {
    fields: "biography,followers_count,follows_count,media_count,name,profile_picture_url,username,website,ig_id",
  });

  const profile = {
    username: data.username || "",
    name: data.name || "",
    bio: data.biography || "",
    followers: data.followers_count || 0,
    following: data.follows_count || 0,
    postCount: data.media_count || 0,
    profilePic: data.profile_picture_url || "",
    website: data.website || "",
    igId: data.ig_id || data.id,
  };

  await setCachedData(userId, creds.igAccountId, "profile", profile);
  return profile;
}

// ─── Recent Posts ───────────────────────────────────────────────

export async function fetchRecentPosts(userId, limit = 25, forceRefresh = false) {
  const creds = await getValidTokenForUser(userId);

  if (!forceRefresh) {
    const cached = await getCachedData(userId, creds.igAccountId, "posts");
    if (cached) return cached;
  }

  const data = await metaGraphRequest(`/${creds.igAccountId}/media`, creds.accessToken, {
    fields: "id,caption,comments_count,like_count,media_product_type,media_type,media_url,permalink,thumbnail_url,timestamp",
    limit: Math.min(limit, 50),
  });

  const posts = (data.data || []).map((p) => {
    let contentType = "Image";
    if (p.media_type === "VIDEO") contentType = "Reel";
    else if (p.media_type === "CAROUSEL_ALBUM") contentType = "Carousel";

    return {
      id: p.id,
      caption: p.caption || "",
      contentType,
      mediaType: p.media_type,
      mediaProductType: p.media_product_type || "",
      likes: p.like_count || 0,
      comments: p.comments_count || 0,
      timestamp: p.timestamp || null,
      thumbnail: p.media_url || p.thumbnail_url || "",
      url: p.permalink || "",
      hashtags: (p.caption || "").match(/#[\w]+/g) || [],
    };
  });

  await setCachedData(userId, creds.igAccountId, "posts", posts);
  return posts;
}

// ─── Post-Level Insights ────────────────────────────────────────

const INSIGHT_METRICS_ATTEMPTS = [
  ["views", "impressions", "reach", "saved", "shares", "total_interactions"],
  ["impressions", "reach", "saved", "shares", "total_interactions"],
  ["impressions", "reach", "saved"],
];

function readMetric(insights, name) {
  const metric = (insights || []).find((e) => e.name === name);
  if (!metric) return 0;
  if (Array.isArray(metric.values) && metric.values.length > 0) {
    return Number(metric.values[0]?.value) || 0;
  }
  return Number(metric.value) || 0;
}

export async function fetchPostInsights(userId, mediaId) {
  const creds = await getValidTokenForUser(userId);

  for (const metrics of INSIGHT_METRICS_ATTEMPTS) {
    try {
      const data = await metaGraphRequest(`/${mediaId}/insights`, creds.accessToken, {
        metric: metrics.join(","),
      });

      const insights = data.data || [];
      return {
        views: readMetric(insights, "views") || readMetric(insights, "reach"),
        impressions: readMetric(insights, "impressions"),
        reach: readMetric(insights, "reach"),
        saves: readMetric(insights, "saved"),
        shares: readMetric(insights, "shares"),
        totalInteractions: readMetric(insights, "total_interactions"),
        availableMetrics: insights.map((e) => e.name),
      };
    } catch {
      // Try next smaller set
    }
  }

  return { views: 0, impressions: 0, reach: 0, saves: 0, shares: 0, totalInteractions: 0, availableMetrics: [] };
}

// ─── Account-Level Time-Series Insights ─────────────────────────

export async function fetchAccountMetrics(userId, period = "day", since = null, until = null) {
  const creds = await getValidTokenForUser(userId);

  const cacheKey = `insights_${period}`;
  const cached = await getCachedData(userId, creds.igAccountId, cacheKey);
  if (cached) return cached;

  // Default: last 30 days
  const now = new Date();
  const defaultSince = new Date(now);
  defaultSince.setDate(defaultSince.getDate() - 30);

  const sinceTs = Math.floor((since ? new Date(since) : defaultSince).getTime() / 1000);
  const untilTs = Math.floor((until ? new Date(until) : now).getTime() / 1000);

  const metrics = [
    "impressions",
    "reach",
    "profile_views",
    "accounts_engaged",
    "follower_count",
  ];

  const results = {};

  for (const metric of metrics) {
    try {
      const data = await metaGraphRequest(`/${creds.igAccountId}/insights`, creds.accessToken, {
        metric,
        period,
        since: sinceTs,
        until: untilTs,
      });

      if (data.data && data.data.length > 0) {
        results[metric] = data.data[0].values || [];
      }
    } catch (err) {
      console.warn(`[InsightsFetcher] Metric ${metric} unavailable:`, err.message);
      results[metric] = [];
    }
  }

  await setCachedData(userId, creds.igAccountId, cacheKey, results);
  return results;
}

// ─── Audience Demographics ──────────────────────────────────────

export async function fetchAudienceDemographics(userId, forceRefresh = false) {
  const creds = await getValidTokenForUser(userId);

  if (!forceRefresh) {
    const cached = await getCachedData(userId, creds.igAccountId, "audience");
    if (cached) return cached;
  }

  const demographics = {};

  const lifetimeMetrics = [
    "audience_city",
    "audience_country",
    "audience_gender_age",
    "audience_locale",
  ];

  // Try newer v22+ metric names first, fallback to legacy
  const metricAttempts = [
    lifetimeMetrics,
    ["follower_demographics"],
    ["engaged_audience_demographics"],
  ];

  for (const metrics of metricAttempts) {
    try {
      const data = await metaGraphRequest(`/${creds.igAccountId}/insights`, creds.accessToken, {
        metric: metrics.join(","),
        period: "lifetime",
      });

      if (data.data) {
        for (const item of data.data) {
          const values = item.values?.[0]?.value || item.total_value?.breakdowns?.[0]?.results || {};
          demographics[item.name] = values;
        }
        break; // Success, stop trying
      }
    } catch {
      // Try next set
    }
  }

  await setCachedData(userId, creds.igAccountId, "audience", demographics);
  return demographics;
}

// ─── Best Posting Times ─────────────────────────────────────────

export async function fetchOnlineFollowers(userId) {
  const creds = await getValidTokenForUser(userId);

  try {
    const data = await metaGraphRequest(`/${creds.igAccountId}/insights`, creds.accessToken, {
      metric: "online_followers",
      period: "lifetime",
    });

    if (data.data && data.data.length > 0) {
      return data.data[0].values?.[0]?.value || {};
    }
  } catch (err) {
    console.warn("[InsightsFetcher] Online followers unavailable:", err.message);
  }

  return {};
}

// ─── Posts with Full Insights (enriched) ────────────────────────

export async function fetchPostsWithInsights(userId, limit = 12) {
  const posts = await fetchRecentPosts(userId, limit, false);

  const enrichedPosts = await Promise.all(
    posts.slice(0, limit).map(async (post) => {
      try {
        const insights = await fetchPostInsights(userId, post.id);
        return { ...post, insights };
      } catch {
        return { ...post, insights: null };
      }
    })
  );

  return enrichedPosts;
}

// ─── Connection Status ─────────────────────────────────────────

export async function fetchConnectionWithProfile(userId) {
  const creds = await getValidTokenForUser(userId);
  const profile = await fetchProfileOverview(userId);

  return {
    connected: true,
    igAccountId: creds.igAccountId,
    igUsername: creds.igUsername,
    connectionId: creds.connectionId,
    profile,
  };
}
