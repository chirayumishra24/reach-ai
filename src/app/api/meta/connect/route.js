import { auth } from "@/auth";
import { getMetaAuthUrl } from "@/lib/meta/oauth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Pass the user's active orgId as the state so we know where to save the account in callback
    const orgId = session.user.orgId;
    if (!orgId) {
      return NextResponse.json({ message: "No active organization found" }, { status: 400 });
    }

    const state = orgId;
    const authUrl = getMetaAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Meta connect error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
