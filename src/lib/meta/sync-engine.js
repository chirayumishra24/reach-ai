import { db } from "../db";
import { socialAccounts, igPosts, igInsights, igAccountInsights } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { decryptToken } from "./token-manager";
import { syncInstagramPost } from "./instagram";

const META_GRAPH_URL = "https://graph.facebook.com";
const META_VERSION = "v22.0";

/**
 * Decrypts access token for a social account.
 */
async function getDecryptedToken(account) {
  return decryptToken(account.accessToken);
}

/**
 * Syncs the basic profile info (e.g. followers) for a connected account.
 */
export async function syncProfileInfo(socialAccountId) {
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, socialAccountId))
    .limit(1);

  if (!account) throw new Error("Account not found");

  const token = await getDecryptedToken(account);
  const url = `${META_GRAPH_URL}/${META_VERSION}/${account.metaIgAccountId}?fields=followers_count,follows_count,profile_picture_url,biography,name&access_token=${token}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to fetch Instagram profile details");
  }

  // Update account in DB
  const [updated] = await db
    .update(socialAccounts)
    .set({
      followersCount: data.followers_count || 0,
      profilePictureUrl: data.profile_picture_url || account.profilePictureUrl,
      updatedAt: new Date(),
    })
    .where(eq(socialAccounts.id, socialAccountId))
    .returning();

  return updated;
}

/**
 * Syncs recent media posts and their insights from Instagram Meta API.
 */
export async function syncAccountMedia(socialAccountId) {
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, socialAccountId))
    .limit(1);

  if (!account) throw new Error("Account not found");

  const token = await getDecryptedToken(account);
  
  // 1. Fetch recent media list from Meta Graph API
  const url = `${META_GRAPH_URL}/${META_VERSION}/${account.metaIgAccountId}/media?fields=id,caption,comments_count,like_count,media_product_type,media_type,permalink,timestamp,thumbnail_url,media_url&limit=20&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to fetch Instagram media list");
  }

  const mediaList = data.data || [];
  
  for (const media of mediaList) {
    // 2. Fetch single-post insights & metadata dynamically using the instagram client
    let syncResult;
    try {
      syncResult = await syncInstagramPost({
        postId: media.id,
        accessToken: token,
        instagramAccountId: account.metaIgAccountId,
      });
    } catch (err) {
      console.warn(`[SyncEngine] Skipping insights for post ${media.id}: ${err.message}`);
      // Fallback: just record the basic details if insights are not queryable (e.g. stories/older posts)
      syncResult = {
        mediaId: media.id,
        performance: {
          views: 0,
          likes: Number(media.like_count || 0),
          comments: Number(media.comments_count || 0),
          shares: 0,
          saves: 0,
          impressions: 0,
        },
        meta: {
          mediaType: media.media_type,
          mediaProductType: media.media_product_type,
        }
      };
    }

    // 3. Upsert into ig_posts table
    const [existingPost] = await db
      .select()
      .from(igPosts)
      .where(
        and(
          eq(igPosts.socialAccountId, socialAccountId),
          eq(igPosts.mediaId, media.id)
        )
      )
      .limit(1);

    const postValues = {
      socialAccountId,
      orgId: account.orgId,
      mediaId: media.id,
      mediaType: media.media_type,
      mediaProductType: media.media_product_type,
      permalink: media.permalink,
      caption: media.caption || null,
      thumbnailUrl: media.thumbnail_url || media.media_url || null,
      timestamp: media.timestamp ? new Date(media.timestamp) : null,
      likeCount: Number(media.like_count || 0),
      commentsCount: Number(media.comments_count || 0),
      updatedAt: new Date(),
    };

    let postRecord;

    if (existingPost) {
      const [updated] = await db
        .update(igPosts)
        .set(postValues)
        .where(eq(igPosts.id, existingPost.id))
        .returning();
      postRecord = updated;
    } else {
      const [inserted] = await db
        .insert(igPosts)
        .values({
          ...postValues,
          createdAt: new Date(),
        })
        .returning();
      postRecord = inserted;
    }

    // 4. Insert insights snapshot
    const perf = syncResult.performance;
    const engagementRate = postRecord.likeCount + postRecord.commentsCount + (perf.shares || 0) + (perf.saves || 0);

    await db.insert(igInsights).values({
      igPostId: postRecord.id,
      orgId: account.orgId,
      reach: perf.reach || perf.views || 0,
      impressions: perf.impressions || 0,
      views: perf.views || 0,
      saves: perf.saves || 0,
      shares: perf.shares || 0,
      totalInteractions: engagementRate,
      engagementRate: account.followersCount ? ((engagementRate / account.followersCount) * 100).toFixed(2) : "0.00",
    });
  }
}

/**
 * Syncs daily account-level statistics (reach, impressions, views) for the past 7 days.
 */
export async function syncAccountInsights(socialAccountId) {
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, socialAccountId))
    .limit(1);

  if (!account) throw new Error("Account not found");

  const token = await getDecryptedToken(account);
  
  // Query daily reach & impressions for the last 30 days
  const nowUnix = Math.floor(Date.now() / 1000);
  const sinceUnix = nowUnix - 30 * 24 * 60 * 60; // 30 days ago
  
  const url = `${META_GRAPH_URL}/${META_VERSION}/${account.metaIgAccountId}/insights?metric=impressions,reach&period=day&since=${sinceUnix}&until=${nowUnix}&access_token=${token}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.warn(`[SyncEngine] Account-level insights error:`, data.error?.message);
    return; // Don't throw to prevent blockages
  }

  const metrics = data.data || [];
  const reachMetric = metrics.find(m => m.name === "reach");
  const impressionsMetric = metrics.find(m => m.name === "impressions");

  const dateMap = {};

  if (reachMetric && Array.isArray(reachMetric.values)) {
    reachMetric.values.forEach(v => {
      const dateString = v.end_time.split("T")[0]; // yyyy-mm-dd
      if (!dateMap[dateString]) dateMap[dateString] = { reach: 0, impressions: 0 };
      dateMap[dateString].reach = v.value || 0;
    });
  }

  if (impressionsMetric && Array.isArray(impressionsMetric.values)) {
    impressionsMetric.values.forEach(v => {
      const dateString = v.end_time.split("T")[0];
      if (!dateMap[dateString]) dateMap[dateString] = { reach: 0, impressions: 0 };
      dateMap[dateString].impressions = v.value || 0;
    });
  }

  for (const [dateStr, values] of Object.entries(dateMap)) {
    // Check if entry already exists
    const [existing] = await db
      .select()
      .from(igAccountInsights)
      .where(
        and(
          eq(igAccountInsights.socialAccountId, socialAccountId),
          eq(igAccountInsights.date, dateStr)
        )
      )
      .limit(1);

    const valuesToInsert = {
      socialAccountId,
      orgId: account.orgId,
      date: dateStr,
      followersCount: account.followersCount,
      reach: values.reach,
      impressions: values.impressions,
      syncedAt: new Date(),
    };

    if (existing) {
      await db
        .update(igAccountInsights)
        .set(valuesToInsert)
        .where(eq(igAccountInsights.id, existing.id));
    } else {
      await db.insert(igAccountInsights).values(valuesToInsert);
    }
  }
}

/**
 * Orchestrates a complete Instagram sync for a connected account.
 */
export async function fullSync(socialAccountId) {
  console.log(`[SyncEngine] Starting full sync for account ID: ${socialAccountId}`);
  
  // 1. Sync basic profile information
  await syncProfileInfo(socialAccountId);
  
  // 2. Sync recent media + post-level insights
  await syncAccountMedia(socialAccountId);
  
  // 3. Sync account-level time series insights
  await syncAccountInsights(socialAccountId);
  
  // 4. Update sync timestamp in socialAccounts table
  await db
    .update(socialAccounts)
    .set({
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(socialAccounts.id, socialAccountId));

  console.log(`[SyncEngine] Full sync completed for account ID: ${socialAccountId}`);
}
