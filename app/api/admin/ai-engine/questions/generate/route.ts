import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { generateQuestions, QuestionGenerateRequest } from "@/lib/ai-engine-client";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/ai-engine/questions/generate
 * Generates academic multiple-choice questions via the PRISM AI Engine (Python FastAPI).
 * Restricted to administrators and educators.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Administrator access required" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as QuestionGenerateRequest;

    if (!body.sectionType) {
      return NextResponse.json(
        { error: "Field 'sectionType' (VOCABULARY, GRAMMAR, READING, LISTENING) is required" },
        { status: 400 }
      );
    }

    const result = await generateQuestions(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Question generation API error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate questions";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
