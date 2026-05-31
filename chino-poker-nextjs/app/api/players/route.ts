import { NextResponse } from "next/server";
import { db, playersTable } from "@workspace/db";

const IS_DEV = process.env.NODE_ENV === "development";

// Mock data for development mode
const MOCK_PLAYERS = [
  { id: 1, firstName: "שובל", lastName: "מנהל", phone: "0501234567", isGuest: false, createdAt: new Date().toISOString() },
  { id: 2, firstName: "ישראל", lastName: "ישראלי", phone: "0521234567", isGuest: false, createdAt: new Date().toISOString() },
];

/**
 * GET /api/players
 * Fetches all players ordered by first name.
 */
export async function GET() {
  if (IS_DEV) {
    return NextResponse.json(MOCK_PLAYERS);
  }

  try {
    const players = await db.select().from(playersTable).orderBy(playersTable.firstName);
    return NextResponse.json(
      players.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        isGuest: p.isGuest,
        createdAt: p.createdAt?.toISOString(),
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

/**
 * POST /api/players
 * Registers a new player.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, isGuest } = body;

    if (IS_DEV) {
      const mockNewPlayer = {
        id: Math.floor(Math.random() * 1000) + 10,
        firstName,
        lastName,
        phone: phone || "",
        isGuest: isGuest || false,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(mockNewPlayer, { status: 201 });
    }

    const [player] = await db
      .insert(playersTable)
      .values({
        firstName,
        lastName,
        phone: phone || "",
        isGuest: !!isGuest,
      })
      .returning();

    return NextResponse.json(
      {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        phone: player.phone,
        isGuest: player.isGuest,
        createdAt: player.createdAt?.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
