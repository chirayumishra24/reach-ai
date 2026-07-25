import { auth } from "@/auth";
import { fetchPostsWithInsights } from "@/lib/meta/insights-fetcher";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const posts = await fetchPostsWithInsights(session.user.id, Math.min(limit, 50));
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[Analytics/Posts] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
