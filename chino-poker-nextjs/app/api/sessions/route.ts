import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatSession } from "./utils";

/**
 * GET /api/sessions
 * List all sessions.
 */
export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(sessions.map(formatSession));
  } catch (error) {
    return NextResponse.json({ error: "Failed to list sessions" }, { status: 500 });
  }
}

/**
 * POST /api/sessions
 * Starts a new session if none is active.
 */
export async function POST(request: Request) {
  try {
    const { data: existing, error: existingError } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An active session already exists" }, { status: 400 });
    }

    const body = await request.json();
    const { note } = body;

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        note: note || null,
        status: "active",
        total_rake: "0",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(formatSession(session), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
