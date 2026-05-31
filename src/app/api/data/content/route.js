import { db } from "@/lib/db";
import { contentItems, researchEntries } from "@/lib/db/schema";
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

    const items = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.orgId, orgId))
      .orderBy(desc(contentItems.createdAt))
      .limit(100);

    // Format to match localStorage structure
    const formattedItems = items.map((item) => ({
      id: item.id,
      keyword: item.keyword,
      format: item.format,
      script: item.script,
      originalScript: item.originalScript,
      style: item.style,
      audience: item.audience,
      location: item.location,
      stage: item.stage,
      status: item.stage, // Map stage to status for compatibility
      legacyStatus: item.legacyStatus,
      handoffNote: item.handoffNote,
      scheduledDate: item.scheduledDate,
      scheduledAt: item.scheduledAt ? item.scheduledAt.toISOString() : null,
      readyForShootAt: item.readyForShootAt ? item.readyForShootAt.toISOString() : null,
      videoApprovedAt: item.videoApprovedAt ? item.videoApprovedAt.toISOString() : null,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      seo: item.seo,
      editing: item.editing,
      metadata: item.metadata,
      tagSnapshot: item.tagSnapshot,
      publication: item.publication,
      performance: item.performance,
      savedAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("GET content history error:", error);
    return NextResponse.json({ message: "Failed to fetch content history" }, { status: 500 });
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
    const { id, keyword, format, script, ...rest } = data;

    let result;

    if (id) {
      // Check if it exists
      const [existing] = await db
        .select()
        .from(contentItems)
        .where(and(eq(contentItems.id, id), eq(contentItems.orgId, orgId)))
        .limit(1);

      if (existing) {
        // Update existing item
        const [updated] = await db
          .update(contentItems)
          .set({
            keyword: keyword || existing.keyword,
            format: format || existing.format,
            script: script || existing.script,
            originalScript: rest.originalScript !== undefined ? rest.originalScript : existing.originalScript,
            style: rest.style || existing.style,
            audience: rest.audience || existing.audience,
            location: rest.location || existing.location,
            stage: rest.stage || rest.status || existing.stage,
            handoffNote: rest.handoffNote || existing.handoffNote,
            scheduledDate: rest.scheduledDate || existing.scheduledDate,
            seo: rest.seo || existing.seo,
            editing: rest.editing || existing.editing,
            metadata: rest.metadata || existing.metadata,
            tagSnapshot: rest.tagSnapshot || existing.tagSnapshot,
            publication: { ...existing.publication, ...rest.publication },
            performance: { ...existing.performance, ...rest.performance },
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, id))
          .returning();
        
        result = updated;
      }
    }

    if (!result) {
      // Insert new item
      const [inserted] = await db
        .insert(contentItems)
        .values({
          id: id || undefined,
          orgId,
          keyword: keyword || rest.metadata?.keyword || "Untitled",
          format: format || rest.metadata?.format || "youtube_long",
          script: script || "",
          originalScript: rest.originalScript || null,
          style: rest.style || null,
          audience: rest.audience || null,
          location: rest.location || "IN",
          stage: rest.stage || rest.status || "script_review",
          legacyStatus: rest.legacyStatus || "pending",
          handoffNote: rest.handoffNote || null,
          scheduledDate: rest.scheduledDate || null,
          seo: rest.seo || {},
          editing: rest.editing || {},
          metadata: rest.metadata || {},
          tagSnapshot: rest.tagSnapshot || [],
          publication: rest.publication || {},
          performance: rest.performance || {},
          createdById: session.user.id,
        })
        .returning();
      
      result = inserted;
    }

    // Link to research if possible
    const researchId = result.metadata?.researchId;
    if (researchId) {
      const [research] = await db
        .select()
        .from(researchEntries)
        .where(and(eq(researchEntries.id, researchId), eq(researchEntries.orgId, orgId)))
        .limit(1);

      if (research) {
        const relatedContentIds = [...new Set([...(research.payload?.relatedContentIds || []), result.id])];
        await db
          .update(researchEntries)
          .set({
            payload: { ...research.payload, relatedContentIds },
            updatedAt: new Date(),
          })
          .where(eq(researchEntries.id, researchId));
      }
    }

    return NextResponse.json({
      id: result.id,
      keyword: result.keyword,
      format: result.format,
      script: result.script,
      originalScript: result.originalScript,
      style: result.style,
      audience: result.audience,
      location: result.location,
      stage: result.stage,
      status: result.stage,
      legacyStatus: result.legacyStatus,
      handoffNote: result.handoffNote,
      scheduledDate: result.scheduledDate,
      seo: result.seo,
      editing: result.editing,
      metadata: result.metadata,
      tagSnapshot: result.tagSnapshot,
      publication: result.publication,
      performance: result.performance,
      savedAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("POST content save error:", error);
    return NextResponse.json({ message: "Failed to save content" }, { status: 500 });
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

    const { id, script, publication, performance, status, stage } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(contentItems)
      .where(and(eq(contentItems.id, id), eq(contentItems.orgId, orgId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ message: "Content item not found or unauthorized" }, { status: 404 });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (script !== undefined) updateData.script = script;
    if (stage !== undefined) updateData.stage = stage;
    if (status !== undefined) updateData.stage = status; // support either status or stage
    if (publication !== undefined) updateData.publication = { ...existing.publication, ...publication };
    if (performance !== undefined) updateData.performance = { ...existing.performance, ...performance };

    const [updated] = await db
      .update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, id))
      .returning();

    return NextResponse.json({
      id: updated.id,
      keyword: updated.keyword,
      format: updated.format,
      script: updated.script,
      originalScript: updated.originalScript,
      style: updated.style,
      audience: updated.audience,
      location: updated.location,
      stage: updated.stage,
      status: updated.stage,
      legacyStatus: updated.legacyStatus,
      handoffNote: updated.handoffNote,
      scheduledDate: updated.scheduledDate,
      seo: updated.seo,
      editing: updated.editing,
      metadata: updated.metadata,
      tagSnapshot: updated.tagSnapshot,
      publication: updated.publication,
      performance: updated.performance,
      savedAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PATCH content error:", error);
    return NextResponse.json({ message: "Failed to update content" }, { status: 500 });
  }
}
