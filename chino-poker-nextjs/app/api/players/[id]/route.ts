import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/players/[id]
 * Fetches a single player by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', parsedId)
      .single();

    if (error || !player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: player.id,
      firstName: player.first_name,
      lastName: player.last_name,
      phone: player.phone,
      isGuest: player.is_guest,
      createdAt: player.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 });
  }
}
