import { auth } from "@/auth";
import { fetchAccountMetrics } from "@/lib/meta/insights-fetcher";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "day";
    const since = searchParams.get("since") || null;
    const until = searchParams.get("until") || null;

    const metrics = await fetchAccountMetrics(session.user.id, period, since, until);
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("[Analytics/Insights] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
