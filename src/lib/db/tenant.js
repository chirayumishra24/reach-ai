import { db } from "./index";
import { orgMembers, organizations } from "./schema";
import { eq, and } from "drizzle-orm";

/**
 * Gets the user's active organization ID from the session.
 * If none is set, returns the first organization the user is a member of.
 */
export async function getCurrentOrg(session) {
  if (!session?.user?.id) return null;

  // 1. If session has an active orgId, verify they are still a member
  if (session.user.orgId) {
    const membership = await db
      .select()
      .from(orgMembers)
      .where(
        and(
          eq(orgMembers.orgId, session.user.orgId),
          eq(orgMembers.userId, session.user.id)
        )
      )
      .limit(1);
    
    if (membership.length > 0) {
      return session.user.orgId;
    }
  }

  // 2. Fallback: Find the first organization this user belongs to
  const firstMember = await db
    .select()
    .from(orgMembers)
    .where(eq(orgMembers.userId, session.user.id))
    .limit(1);

  if (firstMember.length > 0) {
    return firstMember[0].orgId;
  }

  // 3. Fallback: Create a default personal organization for the user if they don't have one
  const orgSlug = `personal-${session.user.id.slice(0, 8)}`;
  
  try {
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: `${session.user.name || "Personal"}'s Workspace`,
        slug: orgSlug,
        plan: "free",
        settings: {},
      })
      .returning();

    await db.insert(orgMembers).values({
      orgId: newOrg.id,
      userId: session.user.id,
      role: "owner",
    });

    return newOrg.id;
  } catch (error) {
    console.error("Failed to create fallback personal organization:", error);
    return null;
  }
}

/**
 * Ensures that the current user has access to the specified organization.
 * Throws an error if not.
 */
export async function requireOrgMembership(session, orgId) {
  if (!session?.user?.id || !orgId) {
    throw new Error("Unauthorized: Invalid session or orgId");
  }

  const membership = await db
    .select()
    .from(orgMembers)
    .where(
      and(
        eq(orgMembers.orgId, orgId),
        eq(orgMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (membership.length === 0) {
    throw new Error("Forbidden: You are not a member of this organization");
  }

  return membership[0];
}
