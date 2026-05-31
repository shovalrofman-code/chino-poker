import { NextResponse } from "next/server";
import { db, groupBalanceTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/group-balance
 * Returns the total rake and total sessions count.
 */
export async function GET() {
  try {
    if (IS_DEV) {
      return NextResponse.json({
        totalRake: 1250.5,
        sessionsCount: 25,
      });
    }

    const result = await db
      .select({
        totalRake: sql<number>`COALESCE(SUM(${groupBalanceTable.rake}::numeric), 0)`,
        sessionsCount: sql<number>`COUNT(*)`,
      })
      .from(groupBalanceTable);

    return NextResponse.json({
      totalRake: parseFloat(String(result[0]?.totalRake || 0)),
      sessionsCount: parseInt(String(result[0]?.sessionsCount || 0)),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch group balance" }, { status: 500 });
  }
}
