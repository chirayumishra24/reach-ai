import { db } from "@/lib/db";
import { researchEntries } from "@/lib/db/schema";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { eq, and, desc } from "drizzle-orm";
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

    const history = await db
      .select()
      .from(researchEntries)
      .where(eq(researchEntries.orgId, orgId))
      .orderBy(desc(researchEntries.createdAt))
      .limit(50);

    // Format fields to match what frontend expects from localStorage
    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      keyword: entry.keyword,
      location: entry.location,
      status: entry.status,
      savedAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      ...entry.payload, // Include research outputs (competitors, hashtags, etc.)
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("GET research history error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrg(session);
    if (!orgId) {
      return NextResponse.json({ message: "No active organization found" }, { status: 400 });
    }

    const data = await req.json();
    const { id, keyword, status, ...payload } = data;

    let result;

    if (id) {
      // Check if it exists
      const [existing] = await db
        .select()
        .from(researchEntries)
        .where(and(eq(researchEntries.id, id), eq(researchEntries.orgId, orgId)))
        .limit(1);

      if (existing) {
        // Update
        const [updated] = await db
          .update(researchEntries)
          .set({
            keyword: keyword || existing.keyword,
            status: status || existing.status,
            payload: { ...existing.payload, ...payload },
            updatedAt: new Date(),
          })
          .where(eq(researchEntries.id, id))
          .returning();
        
        result = updated;
      }
    }

    if (!result) {
      // Insert new
      const [inserted] = await db
        .insert(researchEntries)
        .values({
          id: id || undefined,
          orgId,
          keyword: keyword || "Untitled",
          status: status || "pending",
          payload,
          createdById: session.user.id,
        })
        .returning();
      
      result = inserted;
    }

    return NextResponse.json({
      id: result.id,
      keyword: result.keyword,
      location: result.location,
      status: result.status,
      savedAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      ...result.payload,
    });
  } catch (error) {
    console.error("POST research save error:", error);
    return NextResponse.json({ message: "Failed to save research" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrg(session);
    if (!orgId) {
      return NextResponse.json({ message: "No active organization found" }, { status: 400 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ message: "ID and status are required" }, { status: 400 });
    }

    const [updated] = await db
      .update(researchEntries)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(researchEntries.id, id), eq(researchEntries.orgId, orgId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ message: "Research entry not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      keyword: updated.keyword,
      status: updated.status,
      savedAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      ...updated.payload,
    });
  } catch (error) {
    console.error("PATCH research status error:", error);
    return NextResponse.json({ message: "Failed to update research status" }, { status: 500 });
  }
}
