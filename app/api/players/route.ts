import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CreatePlayerBody } from "@/lib/api-types";
import { z } from "zod";

/**
 * GET /api/players
 * Fetches all players ordered by first name.
 */
export async function GET() {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .order('first_name');

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
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

/**
 * POST /api/players
 * Registers a new player.
 */
export async function POST(request: Request) {
  try {
    const body = CreatePlayerBody.parse(await request.json());
    const { firstName, lastName, phone, isGuest } = body;

    const { data: player, error } = await supabase
      .from('players')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: phone || "",
        is_guest: !!isGuest,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        phone: player.phone,
        isGuest: player.is_guest,
        createdAt: player.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
