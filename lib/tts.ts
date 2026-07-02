import fs from "fs";
import path from "path";
import crypto from "crypto";

const EDGE_TTS_URL = process.env.EDGE_TTS_URL || "http://localhost:20128/v1/audio/speech";
const RAW_TTS_KEY = process.env.EDGE_TTS_KEY;
if (!RAW_TTS_KEY && process.env.NODE_ENV === "production") {
  throw new Error("EDGE_TTS_KEY environment variable is required in production.");
}
const EDGE_TTS_KEY = RAW_TTS_KEY || "dev-secret-key-for-local-testing";
const EDGE_TTS_MODEL = process.env.EDGE_TTS_MODEL || "edge-tts/en-US-GuyNeural";

/**
 * Converts English text to speech using the self-hosted Edge TTS service,
 * and saves the file locally in public/uploads/
 * @param text The English text to convert to speech
 * @returns The local URL path of the saved MP3 file (e.g. /uploads/tts-[hash].mp3)
 */
export async function textToSpeech(text: string): Promise<string> {
  const res = await fetch(EDGE_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${EDGE_TTS_KEY}`,
    },
    body: JSON.stringify({
      model: EDGE_TTS_MODEL,
      input: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Edge TTS API failed with status: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Ensure public/uploads directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `tts-${crypto.randomBytes(8).toString("hex")}.mp3`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}
