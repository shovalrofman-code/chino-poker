import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionWithPlayers } from "../utils";

/**
 * GET /api/sessions/active
 * Returns the currently active session with player details.
 */
export async function GET() {
  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (error || !session) {
      return NextResponse.json(null);
    }

    const result = await getSessionWithPlayers(session.id);
    
    if (!result) {
      return NextResponse.json(null);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active session" }, { status: 500 });
  }
}
