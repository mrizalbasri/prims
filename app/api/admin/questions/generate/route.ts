import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SectionType } from "@prisma/client";

interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuestionMetadata {
  generatedBy: string;
  audioUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { sectionType, difficulty, promptInput, listeningSourceType } = await request.json();

    if (!sectionType || !difficulty || !promptInput) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    let result;
    let ttsAudioUrl: string | null = null;

    if (sectionType === SectionType.LISTENING) {
      if (listeningSourceType === "SCRIPT") {
        const prompt = `
You are an expert English language test designer.
You need to generate a listening comprehension test at difficulty level: ${difficulty}.

Input / Topic:
"${promptInput}"

If the Input above is a topic, first write a natural English dialogue or monolog (approx. 150-200 words) suitable for a listening comprehension test on that topic.
If the Input is already a full script, use that script.

Output:
1. scriptText: The final dialogue or monolog script.
2. questions: Exactly 5 multiple-choice questions based on the script. For each question, output:
   - questionText: The question prompt.
   - options: An array of exactly 4 choices (strings).
   - correctAnswer: One of the options (must match one of the choices exactly).
   - explanation: A brief explanation (in Bahasa Indonesia) explaining why the answer is correct.

Output format must be a JSON object with this exact structure:
{
  "scriptText": "...",
  "questions": [
    {
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}
`;
        result = await model.generateContent(prompt);
      } else {
        // 1. Fetch audio from URL
        let audioRes;
        try {
          audioRes = await fetch(promptInput);
          if (!audioRes.ok) throw new Error();
        } catch {
          return NextResponse.json({ error: "Gagal mengunduh file audio dari URL. Pastikan link valid dan dapat diakses." }, { status: 400 });
        }

        const arrayBuffer = await audioRes.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = audioRes.headers.get("content-type") || "audio/mp3";

        const prompt = `
You are an expert English language test designer.
Listen to the attached English audio and generate exactly 5 multiple-choice questions for a listening comprehension test.
The difficulty of the questions should be: ${difficulty}.

For each question, output:
1. questionText: The prompt or question based on the audio.
2. options: An array of exactly 4 choices (strings).
3. correctAnswer: One of the options (must match one of the choices exactly).
4. explanation: A brief explanation (in Bahasa Indonesia) explaining why the answer is correct based on the audio.

Output format must be a JSON object with a single key "questions" containing an array of these 5 questions:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}
`;

        result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          prompt,
        ]);
      }
    } else if (sectionType === SectionType.READING) {
      const prompt = `
You are an expert English language test designer.
You need to generate exactly 5 multiple-choice questions for a reading comprehension test at difficulty level: ${difficulty}.

Context / Passage Input:
"${promptInput}"

If the Context / Passage Input above is just a topic, first write a reading passage of about 150-200 words on that topic.
If it is already a reading passage, use that passage.

Then, generate 5 questions.
For each question, you MUST format the "questionText" EXACTLY as:
Read the passage and answer the question:

"[Insert the Reading Passage text here]"

[Insert the Question prompt here]

Example:
Read the passage and answer the question:
"Global warming is causing rising global temperatures..."
What is the primary cause mentioned in the passage?

For each question, output:
1. questionText: The formatted prompt described above.
2. options: An array of exactly 4 choices (strings).
3. correctAnswer: One of the options (must match one of the choices exactly).
4. explanation: A brief explanation (in Bahasa Indonesia) explaining why the answer is correct based on the passage.

Output format must be a JSON object with a single key "questions" containing an array of these 5 questions:
{
  "questions": [
    {
      "questionText": "Read the passage and answer the question:\\n\\\"[Passage text]\\\"\\n\\n[Question]?",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}
`;
      result = await model.generateContent(prompt);
    } else {
      // VOCABULARY or GRAMMAR
      const prompt = `
You are an expert English language test designer.
Generate exactly 5 multiple-choice questions for the section: ${sectionType} at difficulty level: ${difficulty}.
The topic/theme of the questions should be based on: "${promptInput}".

For each question, output:
1. questionText: The question prompt or sentence completion (fill in the blank with _ ).
2. options: An array of exactly 4 choices (strings).
3. correctAnswer: One of the options (must match one of the choices exactly).
4. explanation: A brief explanation (in Bahasa Indonesia) explaining why the answer is correct.

Output format must be a JSON object with a single key "questions" containing an array of these 5 questions:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}
`;
      result = await model.generateContent(prompt);
    }

    const responseText = result.response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response text:", responseText, e);
      return NextResponse.json({ error: "Gagal memproses hasil buatan AI. Silakan coba lagi." }, { status: 500 });
    }

    if (sectionType === SectionType.LISTENING && listeningSourceType === "SCRIPT") {
      try {
        const text = parsedData.scriptText || promptInput;
        const { textToSpeech } = await import("@/lib/tts");
        ttsAudioUrl = await textToSpeech(text);
      } catch (err) {
        console.error("Failed to generate TTS audio:", err);
        return NextResponse.json({ error: "Gagal mengonversi naskah menjadi suara audio. Silakan coba lagi." }, { status: 500 });
      }
    }

    // Post-process to inject metadata if needed
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      parsedData.questions = parsedData.questions.map((q: GeneratedQuestion) => {
        const metadata: QuestionMetadata = { generatedBy: "AI" };
        if (sectionType === SectionType.LISTENING) {
          metadata.audioUrl = ttsAudioUrl || promptInput;
        }
        return {
          ...q,
          sectionType,
          difficulty,
          metadata,
        };
      });
    }

    if (ttsAudioUrl) {
      parsedData.audioUrl = ttsAudioUrl;
    }

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error) {
    console.error("AI question generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
