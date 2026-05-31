import { NextResponse } from "next/server";
import { db, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { buildPlayerStats } from "../utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/stats/leaderboard
 * Returns a list of player stats ordered by total profit.
 */
export async function GET() {
  try {
    if (IS_DEV) {
      return NextResponse.json([
        { playerId: 1, firstName: "שובל", lastName: "מנהל", totalProfit: 500, winRate: 70, totalGames: 10 },
        { playerId: 2, firstName: "ישראל", lastName: "ישראלי", totalProfit: 200, winRate: 60, totalGames: 8 },
      ]);
    }

    const players = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.isGuest, false));

    const statsPromises = players.map((p) => buildPlayerStats(p.id));
    const allStats = await Promise.all(statsPromises);

    const validStats = allStats
      .filter((s) => s !== null && s.totalGames > 0)
      .sort((a, b) => b!.totalProfit - a!.totalProfit);

    return NextResponse.json(validStats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
