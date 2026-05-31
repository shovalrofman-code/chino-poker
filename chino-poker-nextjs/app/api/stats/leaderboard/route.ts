import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildPlayerStats } from "../utils";

/**
 * GET /api/stats/leaderboard
 * Returns a list of player stats ordered by total profit.
 */
export async function GET() {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .eq('is_guest', false);

    if (error) throw error;

    const statsPromises = players.map((p: any) => buildPlayerStats(p.id));
    const allStats = await Promise.all(statsPromises);

    const validStats = allStats
      .filter((s) => s !== null && s.totalGames > 0)
      .sort((a, b) => b!.totalProfit - a!.totalProfit);

    return NextResponse.json(validStats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
