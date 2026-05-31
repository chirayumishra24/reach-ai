const META_API_VERSION = "v22.0";
const META_GRAPH_URL = "https://graph.facebook.com";

const getAppCredentials = () => {
  const clientId = process.env.META_CLIENT_ID || process.env.AUTH_FACEBOOK_ID;
  const clientSecret = process.env.META_CLIENT_SECRET || process.env.AUTH_FACEBOOK_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/meta/callback`;
  
  return { clientId, clientSecret, redirectUri };
};

/**
 * Builds the Meta/Facebook OAuth URL for connecting Instagram Business.
 */
export function getMetaAuthUrl(state) {
  const { clientId, redirectUri } = getAppCredentials();
  const scopes = [
    "email",
    "public_profile",
    "instagram_basic",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
  ];

  return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes.join(","))}&state=${state}`;
}

/**
 * Exchanges the OAuth code for a short-lived user access token.
 */
export async function exchangeCodeForToken(code) {
  const { clientId, clientSecret, redirectUri } = getAppCredentials();
  
  const url = `${META_GRAPH_URL}/${META_API_VERSION}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&client_secret=${clientSecret}&code=${code}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to exchange authorization code for token");
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Exchanges a short-lived user access token for a long-lived user access token (lasts 60 days).
 */
export async function getLongLivedToken(shortToken) {
  const { clientId, clientSecret } = getAppCredentials();

  const url = `${META_GRAPH_URL}/${META_API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to extend access token");
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in, // typically 5184000 (60 days)
  };
}

/**
 * Discovers connected Instagram Business accounts linked to Facebook Pages.
 */
export async function discoverInstagramAccounts(accessToken) {
  // 1. Get Facebook Pages that the user manages
  const pagesUrl = `${META_GRAPH_URL}/${META_API_VERSION}/me/accounts?fields=name,access_token,tasks&access_token=${accessToken}`;
  const pagesRes = await fetch(pagesUrl);
  const pagesData = await pagesRes.json();

  if (!pagesRes.ok) {
    throw new Error(pagesData.error?.message || "Failed to fetch Facebook Pages");
  }

  const pages = pagesData.data || [];
  const discoveredAccounts = [];

  // 2. For each Page, query its linked Instagram Business Account ID
  for (const page of pages) {
    const hasAnalyzePermission = 
      page.tasks?.includes("ANALYZE") || 
      page.tasks?.includes("MANAGE") || 
      page.tasks?.includes("ADVERTISE") ||
      true; // Fallback to try anyway
      
    if (!hasAnalyzePermission) continue;

    const igUrl = `${META_GRAPH_URL}/${META_API_VERSION}/${page.id}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}`;
    const igRes = await fetch(igUrl);
    const igData = await igRes.json();

    if (igRes.ok && igData.instagram_business_account) {
      const igAccount = igData.instagram_business_account;
      discoveredAccounts.push({
        facebookPageId: page.id,
        facebookPageName: page.name,
        facebookPageToken: page.access_token, // Page-level token is sometimes useful
        instagramAccountId: igAccount.id,
        instagramUsername: igAccount.username,
        instagramName: igAccount.name,
        profilePictureUrl: igAccount.profile_picture_url,
      });
    }
  }

  return discoveredAccounts;
}
