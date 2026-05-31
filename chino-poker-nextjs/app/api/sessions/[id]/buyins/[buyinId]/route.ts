import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * DELETE /api/sessions/[id]/buyins/[buyinId]
 * Undoes a specific buy-in and adjusts the player's total buy-ins.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; buyinId: string }> }
) {
  try {
    const { id, buyinId: bId } = await params;
    const sessionId = parseInt(id);
    const buyinId = parseInt(bId);

    if (isNaN(sessionId) || isNaN(buyinId)) {
      return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'active')
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const { data: buyin, error: buyinFetchError } = await supabase
      .from('buyins')
      .select('*')
      .eq('id', buyinId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (buyinFetchError || !buyin) {
      return NextResponse.json({ error: "Buy-in not found" }, { status: 404 });
    }

    const amount = parseFloat(buyin.amount);

    const { error: deleteError } = await supabase
      .from('buyins')
      .delete()
      .eq('id', buyinId);

    if (deleteError) throw deleteError;

    const { data: sp, error: spFetchError } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId)
      .eq('player_id', buyin.player_id)
      .maybeSingle();

    if (sp) {
      const currentTotal = parseFloat(sp.total_buyins || "0");
      const newTotal = Math.max(0, currentTotal - amount);
      await supabase
        .from('session_players')
        .update({ total_buyins: String(newTotal) })
        .eq('id', sp.id);
    }

    return NextResponse.json({ success: true, deletedAmount: amount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete buy-in" }, { status: 500 });
  }
}
