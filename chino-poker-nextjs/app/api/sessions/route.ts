import { NextResponse } from "next/server";
import { db, sessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { formatSession } from "./utils";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * GET /api/sessions
 * List all sessions.
 */
export async function GET() {
  if (IS_DEV) {
    return NextResponse.json([
      { id: 1, status: "closed", startedAt: new Date().toISOString(), totalRake: 50 },
    ]);
  }

  try {
    const sessions = await db.select().from(sessionsTable).orderBy(desc(sessionsTable.startedAt));
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
    if (IS_DEV) {
      return NextResponse.json({ id: 2, status: "active", startedAt: new Date().toISOString(), totalRake: 0 }, { status: 201 });
    }

    const [existing] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.status, "active"));

    if (existing) {
      return NextResponse.json({ error: "An active session already exists" }, { status: 400 });
    }

    const body = await request.json();
    const { note } = body;

    const [session] = await db
      .insert(sessionsTable)
      .values({
        note: note || null,
        status: "active",
        totalRake: "0",
      })
      .returning();

    return NextResponse.json(formatSession(session), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
