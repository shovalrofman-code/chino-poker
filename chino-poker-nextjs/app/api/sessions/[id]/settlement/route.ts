import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateSettlement } from "../../utils";

/**
 * GET /api/sessions/[id]/settlement
 * Retrieves the settlement calculation for a given session.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { data: sessionPlayers, error: spError } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId);

    if (spError || !sessionPlayers) throw spError;

    const playerIds = sessionPlayers.map((sp: any) => sp.player_id);
    
    let players: any[] = [];
    if (playerIds.length > 0) {
      const { data: playersData, error: pError } = await supabase
        .from('players')
        .select('*')
        .in('id', playerIds);
      if (!pError) players = playersData || [];
    }

    const settlement = calculateSettlement(session, sessionPlayers, players);

    return NextResponse.json(settlement);
  } catch (error) {
    console.error("Settlement API Error:", error);
    return NextResponse.json({ 
      error: "Failed to retrieve settlement",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
