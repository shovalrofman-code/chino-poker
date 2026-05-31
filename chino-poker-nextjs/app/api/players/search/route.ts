import { NextResponse } from "next/server";
import { db, playersTable } from "@workspace/db";
import { ilike, or } from "drizzle-orm";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/players/search?q=...
 * Searches for players by name or phone.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  if (IS_DEV) {
    // Basic mock search for development
    return NextResponse.json([
      { id: 1, firstName: "שובל", lastName: "מנהל", phone: "0501234567", isGuest: false },
    ].filter(p => 
      p.firstName.includes(query) || 
      p.lastName.includes(query) || 
      p.phone.includes(query)
    ));
  }

  try {
    const players = await db
      .select()
      .from(playersTable)
      .where(
        or(
          ilike(playersTable.firstName, `%${query}%`),
          ilike(playersTable.lastName, `%${query}%`),
          ilike(playersTable.phone, `%${query}%`)
        )
      )
      .limit(50);

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
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
