import { NextResponse } from "next/server";
import { getSessionWithPlayers } from "../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/sessions/[id]
 * Fetches details for a specific session.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    if (IS_DEV) {
      return NextResponse.json({
        id: sessionId,
        status: "closed",
        startedAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
        totalRake: 50,
        players: [],
      });
    }

    const result = await getSessionWithPlayers(sessionId);
    
    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
