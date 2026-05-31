import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/players/search?q=...
 * Searches for players by name or phone.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;

    return NextResponse.json(
      players.map((p: any) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        phone: p.phone,
        isGuest: p.is_guest,
        createdAt: p.created_at,
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
