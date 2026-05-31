import { NextResponse } from "next/server";
import { buildPlayerStats } from "../../../stats/utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/players/[id]/stats
 * Fetches calculated stats for a specific player.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    if (IS_DEV) {
      return NextResponse.json({
        playerId,
        firstName: "שובל",
        lastName: "מנהל",
        totalGames: 10,
        totalBuyins: 1000,
        totalProfit: 500,
        winRate: 70,
        biggestWin: 200,
        biggestLoss: -100,
        wins: 7,
        losses: 3,
        avgProfit: 50,
        avgBuyin: 100,
        roi: 50,
        longestWinStreak: 4,
        longestLossStreak: 1,
      });
    }

    const stats = await buildPlayerStats(playerId);
    
    if (!stats) {
      return NextResponse.json({ error: "Player stats not found" }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to calculate player stats" }, { status: 500 });
  }
}
