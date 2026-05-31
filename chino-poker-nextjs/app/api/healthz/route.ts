import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@workspace/api-zod";

/**
 * Health check endpoint for the API.
 * Returns the status of the service.
 */
export async function GET() {
  try {
    const data = HealthCheckResponse.parse({ status: "ok" });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
