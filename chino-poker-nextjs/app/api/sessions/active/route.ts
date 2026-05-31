import { NextResponse } from "next/server";
import { db, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getSessionWithPlayers } from "../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/sessions/active
 * Returns the currently active session with player details.
 */
export async function GET() {
  try {
    if (IS_DEV) {
      return NextResponse.json({
        id: 2,
        status: "active",
        startedAt: new Date().toISOString(),
        totalRake: 0,
        players: [
          {
            id: 1,
            playerId: 1,
            totalBuyins: 100,
            finalChips: null,
            player: { id: 1, firstName: "שובל", lastName: "מנהל", phone: "0501234567" },
            buyins: [{ id: 1, amount: 100, chips: 200, createdAt: new Date().toISOString() }],
          },
        ],
      });
    }

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.status, "active"));

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 404 });
    }

    const result = await getSessionWithPlayers(session.id);
    
    if (!result) {
      return NextResponse.json({ error: "Active session data incomplete" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active session" }, { status: 500 });
  }
}
