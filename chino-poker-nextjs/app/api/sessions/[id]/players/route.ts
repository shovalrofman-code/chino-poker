import { NextResponse } from "next/server";
import { db, sessionsTable, sessionPlayersTable, buyinsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CHIPS_RATIO } from "../../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * POST /api/sessions/[id]/players
 * Adds a player to an active session with an initial buy-in.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { playerId, initialBuyin } = await request.json();

    if (IS_DEV) {
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        sessionId,
        playerId,
        totalBuyins: initialBuyin || 50,
        finalChips: null,
      }, { status: 201 });
    }

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.status, "active")));

    if (!session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const [existing] = await db
      .select()
      .from(sessionPlayersTable)
      .where(
        and(eq(sessionPlayersTable.sessionId, sessionId), eq(sessionPlayersTable.playerId, playerId))
      );

    if (existing) {
      return NextResponse.json({ error: "Player already in session" }, { status: 400 });
    }

    const buyinAmount = initialBuyin || 50;
    const chips = buyinAmount * CHIPS_RATIO;

    const [sp] = await db
      .insert(sessionPlayersTable)
      .values({
        sessionId,
        playerId,
        totalBuyins: String(buyinAmount),
        finalChips: null,
      })
      .returning();

    await db.insert(buyinsTable).values({
      sessionId,
      playerId,
      amount: String(buyinAmount),
      chips: String(chips),
    });

    return NextResponse.json(
      {
        id: sp.id,
        sessionId: sp.sessionId,
        playerId: sp.playerId,
        totalBuyins: parseFloat(sp.totalBuyins as string || "0"),
        finalChips: sp.finalChips !== null ? parseFloat(sp.finalChips as string) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to add player to session" }, { status: 500 });
  }
}
