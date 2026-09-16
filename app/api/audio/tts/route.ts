import { NextRequest, NextResponse } from "next/server";
import { generateSpeechAudio } from "@/lib/ai-engine-client";

export const dynamic = "force-dynamic";

/**
 * GET /api/audio/tts
 * Generates spoken WAV audio from text using the local AI Engine (Piper TTS).
 * Query params:
 *   - text (required): text to speak
 *   - voice (optional): voice name (default: en_US-lessac-medium)
 *   - speed (optional): float (default: 1.0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const voice = searchParams.get("voice") || "en_US-lessac-medium";
    const speedParam = searchParams.get("speed");
    const speed = speedParam ? parseFloat(speedParam) : 1.0;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'text' is required" },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: "Text exceeds maximum allowed length of 2000 characters" },
        { status: 400 }
      );
    }

    const audioBuffer = await generateSpeechAudio(text, voice, speed);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": "inline; filename=speech.wav",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: unknown) {
    console.error("Audio TTS generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to synthesize audio";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
