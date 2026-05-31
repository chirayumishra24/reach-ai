import { db } from "../db";
import { organizations, socialAccounts } from "../db/schema";
import { eq } from "drizzle-orm";
import { getPlanDetails } from "./plans";

/**
 * Checks if the organization's plan grants access to the specified feature.
 */
export async function checkFeature(orgId, featureName) {
  if (!orgId) return false;

  const [org] = await db
    .select({ plan: organizations.plan })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) return false;

  const planDetails = getPlanDetails(org.plan);
  return planDetails.features.includes(featureName) || planDetails.features.includes("*");
}

/**
 * Checks if the organization is allowed to connect another social account.
 */
export async function checkAccountLimit(orgId) {
  if (!orgId) return false;

  const [org] = await db
    .select({ plan: organizations.plan })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) return false;

  const connectedCount = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.orgId, orgId));

  const planDetails = getPlanDetails(org.plan);
  return connectedCount.length < planDetails.accountsLimit;
}
