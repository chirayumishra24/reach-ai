export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: "",
    accountsLimit: 1,
    dataRetentionDays: 7,
    aiGenerationsLimit: 5,
    teamMembersLimit: 1,
    features: ["basic_analytics", "content_studio"],
  },
  pro: {
    name: "Pro",
    price: 19,
    priceId: process.env.STRIPE_PRICE_ID_PRO || "price_pro_default",
    accountsLimit: 3,
    dataRetentionDays: 90,
    aiGenerationsLimit: -1, // Unlimited
    teamMembersLimit: 3,
    features: [
      "basic_analytics",
      "advanced_analytics",
      "content_studio",
      "scheduled_reports",
      "competitor_research",
      "ai_insights",
    ],
  },
  agency: {
    name: "Agency",
    price: 49,
    priceId: process.env.STRIPE_PRICE_ID_AGENCY || "price_agency_default",
    accountsLimit: 10,
    dataRetentionDays: 365,
    aiGenerationsLimit: -1, // Unlimited
    teamMembersLimit: 10,
    features: [
      "basic_analytics",
      "advanced_analytics",
      "content_studio",
      "scheduled_reports",
      "competitor_research",
      "ai_insights",
      "white_label_reports",
      "team_collaboration",
    ],
  },
};

/**
 * Resolves plan features based on the organization's current plan string.
 */
export function getPlanDetails(plan = "free") {
  const normalizedPlan = String(plan).toLowerCase();
  return PLANS[normalizedPlan] || PLANS.free;
}
