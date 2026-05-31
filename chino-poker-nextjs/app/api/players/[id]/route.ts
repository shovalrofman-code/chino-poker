import { NextResponse } from "next/server";
import { db, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/players/[id]
 * Fetches a single player by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    if (IS_DEV) {
      return NextResponse.json({
        id: parsedId,
        firstName: "שובל",
        lastName: "מנהל",
        phone: "0501234567",
        isGuest: false,
        createdAt: new Date().toISOString(),
      });
    }

    const [player] = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.id, parsedId));

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      phone: player.phone,
      isGuest: player.isGuest,
      createdAt: player.createdAt?.toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 });
  }
}
