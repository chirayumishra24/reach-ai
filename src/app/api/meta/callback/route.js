import { auth } from "@/auth";
import { connectMetaAccount } from "@/lib/meta/connection-manager";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = req.nextUrl.origin;

  // Handle OAuth errors from Meta
  if (error) {
    console.error("[Meta Callback] OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/onboarding?step=error&error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/onboarding?step=error&error=missing_parameters`
    );
  }

  // Decode state to extract userId
  let stateData;
  try {
    stateData = JSON.parse(Buffer.from(stateParam, "base64url").toString());
  } catch {
    return NextResponse.redirect(
      `${baseUrl}/onboarding?step=error&error=invalid_state`
    );
  }

  const { userId } = stateData;

  // Verify the authenticated user matches the state
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.redirect(
      `${baseUrl}/onboarding?step=error&error=session_mismatch`
    );
  }

  try {
    // Complete the full OAuth flow: code → tokens → discovery → encrypted DB store
    const result = await connectMetaAccount(userId, code);

    console.log("[Meta Callback] Successfully connected:", {
      igUsername: result.igUsername,
      fbPage: result.fbPageName,
      accountsFound: result.allAccounts.length,
    });

    // Redirect to onboarding confirmation step
    const params = new URLSearchParams({
      step: "confirm",
      connectionId: result.connectionId,
      username: result.igUsername || "",
      followers: String(result.igFollowers || 0),
    });

    return NextResponse.redirect(`${baseUrl}/onboarding?${params.toString()}`);
  } catch (err) {
    console.error("[Meta Callback] OAuth flow failed:", err);
    return NextResponse.redirect(
      `${baseUrl}/onboarding?step=error&error=${encodeURIComponent(err.message || "connection_failed")}`
    );
  }
}
