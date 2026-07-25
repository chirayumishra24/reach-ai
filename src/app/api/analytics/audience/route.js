import { auth } from "@/auth";
import { fetchAudienceDemographics } from "@/lib/meta/insights-fetcher";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const demographics = await fetchAudienceDemographics(session.user.id);
    return NextResponse.json({ demographics });
  } catch (error) {
    console.error("[Analytics/Audience] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
