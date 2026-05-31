import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CHIPS_RATIO } from "../../utils";

/**
 * POST /api/sessions/[id]/buyins
 * Records a new buy-in for a player in an active session.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const { playerId, amount } = await request.json();

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'active')
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const chips = amount * CHIPS_RATIO;

    const { data: buyin, error: buyinError } = await supabase
      .from('buyins')
      .insert({
        session_id: sessionId,
        player_id: playerId,
        amount: String(amount),
        chips: String(chips),
      })
      .select()
      .single();

    if (buyinError) throw buyinError;

    const { data: sp, error: spFetchError } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId)
      .eq('player_id', playerId)
      .maybeSingle();

    if (sp) {
      const currentTotal = parseFloat(sp.total_buyins || "0");
      await supabase
        .from('session_players')
        .update({ total_buyins: String(currentTotal + amount) })
        .eq('id', sp.id);
    }

    return NextResponse.json(
      {
        id: buyin.id,
        sessionId: buyin.session_id,
        playerId: buyin.player_id,
        amount: parseFloat(buyin.amount),
        chips: parseFloat(buyin.chips),
        createdAt: buyin.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to record buy-in" }, { status: 500 });
  }
}
