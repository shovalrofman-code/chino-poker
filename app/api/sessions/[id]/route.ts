import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionWithPlayers } from "../utils";

/**
 * GET /api/sessions/[id]
 * Fetches details for a specific session.
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

    const result = await getSessionWithPlayers(sessionId);
    
    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Session Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

/**
 * DELETE /api/sessions/[id]
 * Deletes a session and all its associated data (via cascade).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
