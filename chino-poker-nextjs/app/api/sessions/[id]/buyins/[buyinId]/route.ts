import { NextResponse } from "next/server";
import { db, sessionsTable, sessionPlayersTable, buyinsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * DELETE /api/sessions/[id]/buyins/[buyinId]
 * Undoes a specific buy-in and adjusts the player's total buy-ins.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; buyinId: string }> }
) {
  try {
    const { id, buyinId: bId } = await params;
    const sessionId = parseInt(id);
    const buyinId = parseInt(bId);

    if (isNaN(sessionId) || isNaN(buyinId)) {
      return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
    }

    if (IS_DEV) {
      return NextResponse.json({ success: true, deletedAmount: 100 });
    }

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.status, "active")));

    if (!session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const [buyin] = await db
      .select()
      .from(buyinsTable)
      .where(and(eq(buyinsTable.id, buyinId), eq(buyinsTable.sessionId, sessionId)));

    if (!buyin) {
      return NextResponse.json({ error: "Buy-in not found" }, { status: 404 });
    }

    const amount = parseFloat(buyin.amount as string);

    await db.delete(buyinsTable).where(eq(buyinsTable.id, buyinId));

    const [sp] = await db
      .select()
      .from(sessionPlayersTable)
      .where(
        and(eq(sessionPlayersTable.sessionId, sessionId), eq(sessionPlayersTable.playerId, buyin.playerId))
      );

    if (sp) {
      const currentTotal = parseFloat(sp.totalBuyins as string || "0");
      const newTotal = Math.max(0, currentTotal - amount);
      await db
        .update(sessionPlayersTable)
        .set({ totalBuyins: String(newTotal) })
        .where(eq(sessionPlayersTable.id, sp.id));
    }

    return NextResponse.json({ success: true, deletedAmount: amount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete buy-in" }, { status: 500 });
  }
}
