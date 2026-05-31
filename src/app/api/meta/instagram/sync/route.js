import { NextResponse } from "next/server";
import { getInstagramSyncStatus, syncInstagramPost } from "@/lib/meta/instagram";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { decryptToken } from "@/lib/meta/token-manager";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrg(session);
    if (!orgId) {
      return NextResponse.json({ error: "No active organization found" }, { status: 400 });
    }

    const { publishedUrl = "", postId = "" } = await req.json();

    if (!String(publishedUrl).trim() && !String(postId).trim()) {
      return NextResponse.json(
        { error: "Missing publishedUrl or postId" },
        { status: 400 }
      );
    }

    // Retrieve active Instagram social account for this organization
    const [account] = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.orgId, orgId),
          eq(socialAccounts.platform, "instagram"),
          eq(socialAccounts.isActive, true)
        )
      )
      .limit(1);

    if (!account) {
      return NextResponse.json(
        { error: "No active Instagram account connected to this workspace" },
        { status: 400 }
      );
    }

    const accessToken = decryptToken(account.accessToken);
    const instagramAccountId = account.metaIgAccountId;

    const result = await syncInstagramPost({
      publishedUrl: String(publishedUrl).trim(),
      postId: String(postId).trim(),
      accessToken,
      instagramAccountId,
    });

    return NextResponse.json({
      ok: true,
      ...result,
      config: getInstagramSyncStatus(accessToken, instagramAccountId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Instagram sync failed";
    const status = /Missing Meta configuration|Provide an Instagram post URL|requires an instagram\.com/i.test(message)
      ? 400
      : /not found/i.test(message)
        ? 404
        : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}
