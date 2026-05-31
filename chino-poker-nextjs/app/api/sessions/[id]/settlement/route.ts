import { NextResponse } from "next/server";
import { db, sessionsTable, sessionPlayersTable, playersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { calculateSettlement } from "../../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/sessions/[id]/settlement
 * Retrieves the settlement calculation for a given session.
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
        sessionId,
        totalPot: 500,
        totalRake: 50,
        players: [],
        transfers: [],
      });
    }

    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId));
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const sessionPlayers = await db
      .select()
      .from(sessionPlayersTable)
      .where(eq(sessionPlayersTable.sessionId, sessionId));

    const playerIds = sessionPlayers.map((sp) => sp.playerId);
    const players =
      playerIds.length > 0
        ? await db
            .select()
            .from(playersTable)
            .where(
              sql`${playersTable.id} = ANY(ARRAY[${sql.join(
                playerIds.map((id) => sql`${id}`),
                sql`, `
              )}]::int[])`
            )
        : [];

    const settlement = calculateSettlement(session, sessionPlayers, players);

    return NextResponse.json(settlement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve settlement" }, { status: 500 });
  }
}
