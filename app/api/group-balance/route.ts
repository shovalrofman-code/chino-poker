import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/group-balance
 * Returns the total rake and total sessions count.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('group_balance')
      .select('rake');

    if (error) throw error;

    const totalRake = data.reduce((sum, item: any) => sum + parseFloat(item.rake || "0"), 0);
    const sessionsCount = data.length;

    return NextResponse.json({
      totalRake,
      sessionsCount,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch group balance" }, { status: 500 });
  }
}
