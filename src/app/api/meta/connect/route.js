import { auth } from "@/auth";
import { getMetaAuthUrl } from "@/lib/meta/oauth";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Generate CSRF state token containing userId for the callback
    const csrfToken = crypto.randomBytes(16).toString("hex");
    const state = Buffer.from(
      JSON.stringify({ userId: session.user.id, csrf: csrfToken })
    ).toString("base64url");

    const authUrl = getMetaAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Meta connect error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
