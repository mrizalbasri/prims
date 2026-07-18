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

// Helper to call MiniMax API via TokenRouter/MiniMax official
async function callMiniMax(
  prompt: string,
  minimaxKey: string,
  minimaxBaseUrl: string,
  minimaxModel: string
): Promise<string> {
  const response = await fetch(`${minimaxBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${minimaxKey}`,
    },
    body: JSON.stringify({
      model: minimaxModel,
      messages: [
        {
          role: "system",
          content: "You are an expert English language test designer. You output ONLY valid JSON format as requested. No extra conversational text before or after the JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MiniMax API failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content || "";
}

// Helper to call Gemini (supports official API or custom OpenAI-compatible proxy)
async function callGemini(
  prompt: string,
  apiKey: string,
  baseUrl?: string,
  modelName = "gemini-2.0-flash"
): Promise<string> {
  if (baseUrl) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "You are an expert English language test designer. You output ONLY valid JSON format as requested. No extra conversational text before or after the JSON."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Proxy failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || "";
  } else {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

// Clean markdown blocks from JSON string
function cleanAndParseJson(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { sectionType, difficulty, promptInput, listeningSourceType, voiceOption } = await request.json();

    if (!sectionType || !difficulty || !promptInput) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const activeProvider = process.env.LLM_PROVIDER || "gemini";
    const minimaxKey = process.env.MINIMAX_API_KEY;
    const minimaxModel = process.env.MINIMAX_MODEL || "MiniMax-M3";
    const minimaxBaseUrl = process.env.MINIMAX_BASE_URL || "https://api.tokenrouter.com/v1";

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModelName = process.env.GEMINI_WRITING_MODEL || "gemini-2.0-flash";
    const geminiBaseUrl = process.env.GEMINI_BASE_URL;

    let responseText = "";
    let ttsAudioUrl: string | null = null;

    // 1. Special case: Multimodal Listening from URL (Only supported via Google SDK if no proxy, or fallback)
    if (sectionType === SectionType.LISTENING && listeningSourceType === "URL") {
      if (!geminiApiKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY harus dikonfigurasi untuk memproses file Audio URL." },
          { status: 500 }
        );
      }

      // Fetch audio from URL
      let audioRes;
      try {
        audioRes = await fetch(promptInput);
        if (!audioRes.ok) throw new Error();
      } catch {
        return NextResponse.json(
          { error: "Gagal mengunduh file audio dari URL. Pastikan link valid dan dapat diakses." },
          { status: 400 }
        );
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

      try {
        if (geminiBaseUrl && !base64Data) {
          // If custom proxy baseUrl is set, try using OpenAI-compatible multimodal content structure
          const response = await fetch(`${geminiBaseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${geminiApiKey}`,
            },
            body: JSON.stringify({
              model: geminiModelName,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    {
                      type: "image_url", // Fallback standard representation if input_audio is not supported by custom router, but typically we send as inline data or URL
                      image_url: { url: `data:${mimeType};base64,${base64Data}` }
                    }
                  ]
                }
              ],
              temperature: 0.2,
              stream: false,
            }),
          });

          if (!response.ok) throw new Error(`Proxy error status: ${response.status}`);
          const data = await response.json();
          responseText = data.choices[0].message.content || "";
        } else {
          // Use official Google SDK
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const result = await model.generateContent([
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            prompt,
          ]);
          responseText = result.response.text();
        }
      } catch (err: any) {
        console.error("Gemini API call failed:", err);
        return NextResponse.json(
          { error: `Gagal memproses audio dengan Gemini: ${err.message || err}. Silakan gunakan opsi 'Ketik Naskah'.` },
          { status: 500 }
        );
      }
    } else {
      // 2. All other modes: Use the active provider specified in .env (Gemini or MiniMax)
      let prompt = "";

      if (sectionType === SectionType.LISTENING && listeningSourceType === "SCRIPT") {
        prompt = `
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
      } else if (sectionType === SectionType.READING) {
        prompt = `
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
      } else {
        // VOCABULARY or GRAMMAR
        prompt = `
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
      }

      try {
        if (activeProvider === "gemini") {
          if (!geminiApiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY tidak dikonfigurasi." }, { status: 500 });
          }
          responseText = await callGemini(prompt, geminiApiKey, geminiBaseUrl, geminiModelName);
        } else {
          if (!minimaxKey) {
            return NextResponse.json({ error: "MINIMAX_API_KEY tidak dikonfigurasi." }, { status: 500 });
          }
          responseText = await callMiniMax(prompt, minimaxKey, minimaxBaseUrl, minimaxModel);
        }
      } catch (err: any) {
        console.error(`${activeProvider} API call failed:`, err);
        return NextResponse.json(
          { error: `Gagal membuat soal menggunakan ${activeProvider}: ${err.message || err}` },
          { status: 500 }
        );
      }
    }

    let parsedData;
    try {
      parsedData = cleanAndParseJson(responseText);
    } catch (e) {
      console.error("Failed to parse AI response text:", responseText, e);
      return NextResponse.json({ error: "Gagal memproses format hasil buatan AI. Silakan coba lagi." }, { status: 500 });
    }

    // Convert script text to audio file if script mode
    if (sectionType === SectionType.LISTENING && listeningSourceType === "SCRIPT") {
      try {
        const text = parsedData.scriptText || promptInput;
        const { textToSpeech } = await import("@/lib/tts");
        ttsAudioUrl = await textToSpeech(text, voiceOption);
      } catch (err) {
        console.error("Failed to generate TTS audio:", err);
        return NextResponse.json({ error: "Gagal mengonversi naskah menjadi suara audio. Silakan coba lagi." }, { status: 500 });
      }
    }

    // Post-process to inject metadata
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
