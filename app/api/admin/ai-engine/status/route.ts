import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { checkAiEngineHealth, getAiEngineUrl } from "@/lib/ai-engine-client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ai-engine/status
 * Returns current health status, response latency, and metadata for PRISM AI Engine.
 * Restricted to administrators only.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const health = await checkAiEngineHealth(4000);

    return NextResponse.json(
      {
        ...health,
        engineUrl: getAiEngineUrl(),
        checkedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI Engine status check error:", error);
    return NextResponse.json(
      {
        isOnline: false,
        latencyMs: -1,
        error: "Internal server error while checking AI Engine status",
      },
      { status: 500 }
    );
  }
}
