import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateSettlement } from "../../utils";

/**
 * POST /api/sessions/[id]/close
 * Closes an active session, records final chips, and calculates settlements.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { finalChips } = (await request.json()) as {
      finalChips: Array<{ playerId: number; chips: number }>;
    };

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

    // Update final chips for each player in session
    for (const fc of finalChips) {
      const sp = sessionPlayers.find((sp: any) => sp.player_id === fc.playerId);
      if (sp) {
        await supabase
          .from('session_players')
          .update({ final_chips: String(fc.chips) })
          .eq('id', sp.id);
      }
    }

    // Re-fetch session players to get updated final_chips for settlement calculation
    const { data: updatedSessionPlayers } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId);

    const settlement = calculateSettlement(session, updatedSessionPlayers || [], players, finalChips);

    await supabase
      .from('sessions')
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        total_rake: String(settlement.totalRake),
      })
      .eq('id', sessionId);

    await supabase.from('group_balance').insert({ 
      session_id: sessionId, 
      rake: String(settlement.totalRake) 
    });

    return NextResponse.json(settlement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to close session" }, { status: 500 });
  }
}
