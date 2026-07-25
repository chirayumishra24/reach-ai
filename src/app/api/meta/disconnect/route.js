import { auth } from "@/auth";
import { disconnectMetaAccount } from "@/lib/meta/connection-manager";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await req.json();
    if (!connectionId) {
      return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
    }

    const result = await disconnectMetaAccount(session.user.id, connectionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Meta Disconnect] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
