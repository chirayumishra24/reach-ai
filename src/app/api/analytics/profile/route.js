import { auth } from "@/auth";
import { fetchProfileOverview } from "@/lib/meta/insights-fetcher";
import { getConnectionStatus } from "@/lib/meta/connection-manager";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getConnectionStatus(session.user.id);
    if (!status.connected) {
      return NextResponse.json({ connected: false, message: status.message });
    }

    const profile = await fetchProfileOverview(session.user.id);
    return NextResponse.json({ connected: true, profile });
  } catch (error) {
    console.error("[Analytics/Profile] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
