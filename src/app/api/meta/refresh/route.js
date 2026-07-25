import { auth } from "@/auth";
import { getActiveConnection, refreshConnectionToken } from "@/lib/meta/connection-manager";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { connectionId } = body;

    if (connectionId) {
      // Refresh a specific connection
      const refreshed = await refreshConnectionToken(connectionId);
      return NextResponse.json({
        success: true,
        expiresAt: refreshed.expiresAt,
        lastRefreshedAt: refreshed.lastRefreshedAt,
      });
    }

    // Refresh the user's active connection
    const connection = await getActiveConnection(session.user.id);
    if (!connection) {
      return NextResponse.json({ error: "No active connection found" }, { status: 404 });
    }

    const refreshed = await refreshConnectionToken(connection.id);
    return NextResponse.json({
      success: true,
      expiresAt: refreshed.expiresAt,
      lastRefreshedAt: refreshed.lastRefreshedAt,
    });
  } catch (error) {
    console.error("[Meta Refresh] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refresh token" },
      { status: 500 }
    );
  }
}
