import { SectionType } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * Scoring weights as per SRS requirements
 */
export const SECTION_WEIGHTS = {
  VOCABULARY: 0.2,
  GRAMMAR: 0.2,
  READING: 0.25,
  WRITING: 0.2,
  SPEAKING: 0.15,
};

/**
 * Time limits in seconds as per SRS requirements
 */
export const TIME_LIMITS = {
  VOCABULARY: 480, // 8 minutes
  GRAMMAR: 480, // 8 minutes
  READING: 720, // 12 minutes
  WRITING: 600, // 10 minutes
  SPEAKING: 420, // 7 minutes
};

/**
 * Proficiency level thresholds
 */
export enum ProficiencyLevel {
  BEGINNER = "BEGINNER", // 0-49
  INTERMEDIATE = "INTERMEDIATE", // 50-74
  ADVANCED = "ADVANCED", // 75-100
}

/**
 * Determine proficiency level based on total score
 */
export function getProficiencyLevel(totalScore: number): ProficiencyLevel {
  if (totalScore < 50) return ProficiencyLevel.BEGINNER;
  if (totalScore < 75) return ProficiencyLevel.INTERMEDIATE;
  return ProficiencyLevel.ADVANCED;
}

/**
 * Map total score to CEFR level
 */
export function getCefrLevel(totalScore: number): string {
  if (totalScore < 30) return 'A1';
  if (totalScore < 50) return 'A2';
  if (totalScore < 60) return 'B1';
  if (totalScore < 75) return 'B2';
  if (totalScore < 90) return 'C1';
  return 'C2';
}

/**
 * Calculate raw score for objective section (Vocabulary, Grammar, Reading)
 */
export async function calculateObjectiveScore(
  sectionAttemptId: string,
): Promise<number> {
  const sectionAttempt = await prisma.sectionAttempt.findUnique({
    where: { id: sectionAttemptId },
  });

  if (!sectionAttempt) return 0;

  const answers = await prisma.objectiveAnswer.findMany({
    where: { sectionAttemptId },
  });

  let totalQuestions = 15; // default fallback
  if (sectionAttempt.feedback) {
    try {
      const parsed = JSON.parse(sectionAttempt.feedback);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        totalQuestions = parsed.questions.length;
      }
    } catch (e) {
      console.error("Error parsing feedback for totalQuestions:", e);
    }
  }

  if (totalQuestions === 0) return 0;

  const correctCount = answers.filter((a: any) => a.isCorrect).length;

  // Raw score is percentage (0-100)
  return (correctCount / totalQuestions) * 100;
}

/**
 * Calculate weighted score for a section
 */
export function calculateWeightedScore(
  rawScore: number,
  sectionType: SectionType,
): number {
  const weight = SECTION_WEIGHTS[sectionType];
  return rawScore * weight;
}

/**
 * Calculate final total score from all section scores
 */
export interface SectionScores {
  vocabulary: number;
  grammar: number;
  reading: number;
  writing: number;
  speaking: number;
}

export function calculateTotalScore(scores: SectionScores): number {
  return (
    scores.vocabulary * SECTION_WEIGHTS.VOCABULARY +
    scores.grammar * SECTION_WEIGHTS.GRAMMAR +
    scores.reading * SECTION_WEIGHTS.READING +
    scores.writing * SECTION_WEIGHTS.WRITING +
    scores.speaking * SECTION_WEIGHTS.SPEAKING
  );
}

/**
 * Score objective answer (Vocabulary, Grammar, Reading)
 */
export async function scoreObjectiveAnswer(
  sectionAttemptId: string,
  questionId: string,
  selectedOption: string,
): Promise<{ isCorrect: boolean; score: number }> {
  // Get the section attempt to read feedback JSON
  const sectionAttempt = await prisma.sectionAttempt.findUnique({
    where: { id: sectionAttemptId },
  });

  if (!sectionAttempt || !sectionAttempt.feedback) {
    throw new Error("Section attempt or questions not found");
  }

  const feedbackJson = JSON.parse(sectionAttempt.feedback);
  const questions = feedbackJson.questions || [];
  const question = questions.find((q: any) => q.id === questionId);

  if (!question) {
    throw new Error(`Question ${questionId} not found in section attempt`);
  }

  const isCorrect = selectedOption === question.correctAnswer;
  const score = isCorrect ? 1 : 0;

  return { isCorrect, score };
}

function parseAiJson(text: string): { score: number; feedback: any } {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const score = Math.min(100, Math.max(0, Number(parsed.score || 0)));
  const feedback = typeof parsed.feedback === 'object' && parsed.feedback !== null 
    ? { ...parsed.feedback } 
    : { message: String(parsed.feedback || '') };
  
  if ('grammarScore' in parsed) feedback.grammarScore = Number(parsed.grammarScore);
  if ('clarityScore' in parsed) feedback.clarityScore = Number(parsed.clarityScore);
  if ('structureScore' in parsed) feedback.structureScore = Number(parsed.structureScore);
  if ('fluencyScore' in parsed) feedback.fluencyScore = Number(parsed.fluencyScore);
  if ('pronunciationScore' in parsed) feedback.pronunciationScore = Number(parsed.pronunciationScore);

  return {
    score,
    feedback,
  };
}

async function runGeminiScoringWithFallback(
  scoringPrompt: string,
  preferredModel: string,
  fallbackModel = "gemini-2.5-flash",
): Promise<{ score: number; feedback: any }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const primary = genAI.getGenerativeModel({ model: preferredModel });
    const primaryResult = await primary.generateContent(scoringPrompt);
    const primaryText = primaryResult.response.text();
    return parseAiJson(primaryText);
  } catch (primaryError) {
    // If requested model is a Live model and not compatible with text endpoint,
    // fallback to a stable text model while preserving feature availability.
    console.warn("Primary model failed, trying fallback model", {
      preferredModel,
      fallbackModel,
      primaryError,
    });

    const fallback = genAI.getGenerativeModel({ model: fallbackModel });
    const fallbackResult = await fallback.generateContent(scoringPrompt);
    const fallbackText = fallbackResult.response.text();
    const parsed = parseAiJson(fallbackText);

    return {
      score: parsed.score,
      feedback: {
        ...parsed.feedback,
        modelFallback: {
          requested: preferredModel,
          used: fallbackModel,
        },
      },
    };
  }
}
async function runMiniMaxScoring(
  scoringPrompt: string,
  modelName: string,
): Promise<{ score: number; feedback: any }> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is missing");
  }
  const baseUrl = process.env.MINIMAX_BASE_URL || "https://api.tokenrouter.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "user", content: scoringPrompt }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MiniMax API failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  return parseAiJson(text);
}

/**
 * AI Scoring for Writing (using MiniMax first, fallback to Google Gemini)
 */
export async function scoreWritingWithAI(
  responseText: string,
  promptText: string,
  rubric?: any,
): Promise<{ score: number; feedback: any }> {
  const scoringPrompt = `
You are an English language assessment expert. Score the following student writing response.

PROMPT:
${promptText}

STUDENT RESPONSE:
${responseText}

RUBRIC:
${rubric ? JSON.stringify(rubric, null, 2) : "Standard academic writing criteria"}

Please evaluate the response and provide:
1. A score from 0-100
2. Feedback in Indonesian language covering:
   - Grammar and sentence structure
   - Vocabulary usage
   - Content relevance and completeness
   - Organization and coherence
   - Specific suggestions for improvement

Return your response in JSON format:
{
  "score": <number 0-100 for overall score>,
  "grammarScore": <number 0-100 for grammar quality>,
  "clarityScore": <number 0-100 for content clarity and relevance>,
  "structureScore": <number 0-100 for organization/coherence>,
  "feedback": {
    "grammar": "<feedback in Indonesian>",
    "vocabulary": "<feedback in Indonesian>",
    "content": "<feedback in Indonesian>",
    "organization": "<feedback in Indonesian>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
  }
}
`

  try {
    // 1. Try MiniMax (TokenRouter) first for Writing
    if (process.env.MINIMAX_API_KEY) {
      try {
        const modelName = process.env.MINIMAX_MODEL || "MiniMax-M3";
        return await runMiniMaxScoring(scoringPrompt, modelName);
      } catch (minimaxError) {
        console.warn("Writing assessment: MiniMax failed, trying Gemini as fallback...", minimaxError);
      }
    }

    // 2. Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      const modelName = process.env.GEMINI_WRITING_MODEL || "gemini-2.5-flash";
      return await runGeminiScoringWithFallback(
        scoringPrompt,
        modelName,
        "gemini-2.5-flash",
      );
    }

    throw new Error("No AI API keys configured");
  } catch (error) {
    console.error("AI scoring error:", error);
    // Fallback: basic length-based scoring
    const wordCount = responseText.trim().split(/\s+/).length;
    const score = Math.min(100, (wordCount / 150) * 70); // Basic scoring
    return {
      score,
      feedback: {
        error: "AI scoring unavailable, using basic scoring",
        message:
          "Penilaian otomatis tidak tersedia. Skor dasar berdasarkan panjang teks.",
      },
    };
  }
}

/**
 * AI Scoring for Speaking (using Google Gemini first, fallback to MiniMax)
 */
export async function scoreSpeakingWithAI(
  transcriptText: string,
  promptText: string,
  rubric?: any,
): Promise<{ score: number; feedback: any }> {
  const scoringPrompt = `
You are an English language speaking assessment expert. Score the following student speaking response based on the transcript.

PROMPT:
${promptText}

STUDENT TRANSCRIPT:
${transcriptText}

RUBRIC:
${rubric ? JSON.stringify(rubric, null, 2) : "Standard speaking assessment criteria"}

Please evaluate the response and provide:
1. A score from 0-100
2. Feedback in Indonesian language covering:
   - Grammar and sentence structure
   - Vocabulary usage and appropriateness
   - Content relevance and completeness
   - Fluency and coherence (based on transcript)
   - Specific suggestions for improvement

Return your response in JSON format:
{
  "score": <number 0-100 for overall score>,
  "fluencyScore": <number 0-100 for fluency and rhythm>,
  "pronunciationScore": <number 0-100 for pronunciation and clarity>,
  "grammarScore": <number 0-100 for grammar usage>,
  "feedback": {
    "grammar": "<feedback in Indonesian>",
    "vocabulary": "<feedback in Indonesian>",
    "content": "<feedback in Indonesian>",
    "fluency": "<feedback in Indonesian>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
  }
}
`

  try {
    // 1. Try Gemini (Native Audio Dialog) first for Speaking
    if (process.env.GEMINI_API_KEY) {
      try {
        const modelName =
          process.env.GEMINI_SPEAKING_MODEL ||
          "gemini-2.5-flash-native-audio-dialog";
        return await runGeminiScoringWithFallback(
          scoringPrompt,
          modelName,
          "gemini-2.5-flash",
        );
      } catch (geminiError) {
        console.warn("Speaking assessment: Gemini failed, trying MiniMax as fallback...", geminiError);
      }
    }

    // 2. Fallback to MiniMax
    if (process.env.MINIMAX_API_KEY) {
      const modelName = process.env.MINIMAX_MODEL || "MiniMax-M3";
      return await runMiniMaxScoring(scoringPrompt, modelName);
    }

    throw new Error("No AI API keys configured");
  } catch (error) {
    console.error("AI scoring error:", error);
    // Fallback: basic length-based scoring
    const wordCount = transcriptText.trim().split(/\s+/).length;
    const score = Math.min(100, (wordCount / 100) * 70); // Basic scoring
    return {
      score,
      feedback: {
        error: "AI scoring unavailable, using basic scoring",
        message:
          "Penilaian otomatis tidak tersedia. Skor dasar berdasarkan panjang transkrip.",
      },
    };
  }
}

/**
 * Process and finalize test results
 */
export async function finalizeTestResults(
  testAttemptId: string,
): Promise<void> {
  // Get all section attempts
  const sectionAttempts = await prisma.sectionAttempt.findMany({
    where: { testAttemptId },
    include: {
      writingResponse: true,
      speakingResponse: true,
    },
  });

  const scores: Record<string, number> = {};

  // Calculate scores for each section
  for (const section of sectionAttempts) {
    let rawScore = 0;

    if (
      section.sectionType === SectionType.VOCABULARY ||
      section.sectionType === SectionType.GRAMMAR ||
      section.sectionType === SectionType.READING
    ) {
      // Objective sections
      rawScore = await calculateObjectiveScore(section.id);
    } else if (section.sectionType === SectionType.WRITING) {
      // Score already set by processAIScoring into SectionAttempt.rawScore
      rawScore = section.rawScore;
    } else if (section.sectionType === SectionType.SPEAKING) {
      // Score already set by processAIScoring into SectionAttempt.rawScore
      rawScore = section.rawScore;
    }

    // Update section with scores
    await prisma.sectionAttempt.update({
      where: { id: section.id },
      data: {
        rawScore,
        weightedScore: calculateWeightedScore(rawScore, section.sectionType),
      },
    });

    scores[section.sectionType] = rawScore;
  }

  // Calculate total score
  const totalScore = calculateTotalScore({
    vocabulary: scores[SectionType.VOCABULARY] || 0,
    grammar: scores[SectionType.GRAMMAR] || 0,
    reading: scores[SectionType.READING] || 0,
    writing: scores[SectionType.WRITING] || 0,
    speaking: scores[SectionType.SPEAKING] || 0,
  });

  const level = getProficiencyLevel(totalScore);

  // Create or update final result
  await prisma.finalResult.upsert({
    where: { testAttemptId },
    create: {
      testAttemptId,
        userId: (await prisma.testAttempt.findUnique({where: {id: testAttemptId}}))?.userId || "",
      
      
      
      
      
      overallScore: totalScore,
      sectionScores: scores as any,
      overallLevel: level as any,
      cefrLevel: getCefrLevel(totalScore),
    },
    update: {
      overallScore: totalScore,
      sectionScores: scores as any,
      overallLevel: level as any,
      cefrLevel: getCefrLevel(totalScore),
    },
  });

  // Update test attempt status
  await prisma.testAttempt.update({
    where: { id: testAttemptId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}
