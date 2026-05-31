import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CHIPS_RATIO } from "../../utils";

/**
 * POST /api/sessions/[id]/players
 * Adds a player to an active session with an initial buy-in.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { playerId, initialBuyin } = await request.json();

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'active')
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId)
      .eq('player_id', playerId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Player already in session" }, { status: 400 });
    }

    const buyinAmount = initialBuyin || 50;
    const chips = buyinAmount * CHIPS_RATIO;

    const { data: sp, error: spError } = await supabase
      .from('session_players')
      .insert({
        session_id: sessionId,
        player_id: playerId,
        total_buyins: String(buyinAmount),
        final_chips: null,
      })
      .select()
      .single();

    if (spError) throw spError;

    await supabase.from('buyins').insert({
      session_id: sessionId,
      player_id: playerId,
      amount: String(buyinAmount),
      chips: String(chips),
    });

    return NextResponse.json(
      {
        id: sp.id,
        sessionId: sp.session_id,
        playerId: sp.player_id,
        totalBuyins: parseFloat(sp.total_buyins || "0"),
        finalChips: sp.final_chips !== null ? parseFloat(sp.final_chips) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to add player to session" }, { status: 500 });
  }
}
