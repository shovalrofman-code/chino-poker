import { NextResponse } from "next/server";
import { db, sessionsTable, sessionPlayersTable, buyinsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CHIPS_RATIO } from "../../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * POST /api/sessions/[id]/buyins
 * Records a new buy-in for a player in an active session.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { playerId, amount } = await request.json();

    if (IS_DEV) {
      return NextResponse.json({
        id: Math.floor(Math.random() * 1000),
        sessionId,
        playerId,
        amount,
        chips: amount * CHIPS_RATIO,
        createdAt: new Date().toISOString(),
      }, { status: 201 });
    }

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.status, "active")));

    if (!session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const chips = amount * CHIPS_RATIO;

    const [buyin] = await db
      .insert(buyinsTable)
      .values({
        sessionId,
        playerId,
        amount: String(amount),
        chips: String(chips),
      })
      .returning();

    const [sp] = await db
      .select()
      .from(sessionPlayersTable)
      .where(
        and(eq(sessionPlayersTable.sessionId, sessionId), eq(sessionPlayersTable.playerId, playerId))
      );

    if (sp) {
      const currentTotal = parseFloat(sp.totalBuyins as string || "0");
      await db
        .update(sessionPlayersTable)
        .set({ totalBuyins: String(currentTotal + amount) })
        .where(eq(sessionPlayersTable.id, sp.id));
    }

    return NextResponse.json(
      {
        id: buyin.id,
        sessionId: buyin.sessionId,
        playerId: buyin.playerId,
        amount: parseFloat(buyin.amount as string),
        chips: parseFloat(buyin.chips as string),
        createdAt: buyin.createdAt?.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to record buy-in" }, { status: 500 });
  }
}
