import { db } from "@/lib/db";
import { organizations, orgMembers, users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "Workspace name is required" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let slug = baseSlug || "workspace";
    let attempts = 0;
    
    // Check uniqueness
    while (attempts < 10) {
      const currentSlug = attempts === 0 ? slug : `${slug}-${Math.floor(Math.random() * 1000)}`;
      const [existing] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, currentSlug))
        .limit(1);
      
      if (!existing) {
        slug = currentSlug;
        break;
      }
      attempts++;
    }

    // 1. Insert organization
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name,
        slug,
        plan: "free",
        settings: {},
      })
      .returning();

    // 2. Add user as owner membership
    await db.insert(orgMembers).values({
      orgId: newOrg.id,
      userId: session.user.id,
      role: "owner",
    });

    // 3. Update user's active orgId
    await db
      .update(users)
      .set({
        orgId: newOrg.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: "Workspace created successfully",
      orgId: newOrg.id,
      name: newOrg.name,
      slug: newOrg.slug,
    });
  } catch (error) {
    console.error("Onboarding workspace creation error:", error);
    return NextResponse.json({ message: "Failed to create workspace" }, { status: 500 });
  }
}
