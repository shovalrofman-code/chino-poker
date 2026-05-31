import { NextResponse } from "next/server";
import { buildPlayerStats } from "../../../stats/utils";

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

    const stats = await buildPlayerStats(playerId);
    
    if (!stats) {
      return NextResponse.json({ error: "Player stats not found" }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Player Stats API Error:", error);
    return NextResponse.json({ error: "Failed to calculate player stats" }, { status: 500 });
  }
}
