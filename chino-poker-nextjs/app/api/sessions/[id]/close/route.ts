import { NextResponse } from "next/server";
import { db, sessionsTable, sessionPlayersTable, playersTable, groupBalanceTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { calculateSettlement } from "../../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * POST /api/sessions/[id]/close
 * Closes an active session, records final chips, and calculates settlements.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { finalChips } = (await request.json()) as {
      finalChips: Array<{ playerId: number; chips: number }>;
    };

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

    // Update final chips for each player in session
    for (const fc of finalChips) {
      const sp = sessionPlayers.find((sp) => sp.playerId === fc.playerId);
      if (sp) {
        await db
          .update(sessionPlayersTable)
          .set({ finalChips: String(fc.chips) })
          .where(eq(sessionPlayersTable.id, sp.id));
      }
    }

    const settlement = calculateSettlement(session, sessionPlayers, players, finalChips);

    await db
      .update(sessionsTable)
      .set({
        status: "closed",
        closedAt: new Date(),
        totalRake: String(settlement.totalRake),
      })
      .where(eq(sessionsTable.id, sessionId));

    await db.insert(groupBalanceTable).values({ sessionId, rake: String(settlement.totalRake) });

    return NextResponse.json(settlement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to close session" }, { status: 500 });
  }
}
