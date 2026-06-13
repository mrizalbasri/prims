import { SectionType } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Scoring weights as per SRS requirements
 */
export const SECTION_WEIGHTS = {
  VOCABULARY: 0.20,
  GRAMMAR: 0.20,
  READING: 0.25,
  WRITING: 0.20,
  SPEAKING: 0.15,
};

/**
 * Time limits in seconds as per SRS requirements
 */
export const TIME_LIMITS = {
  VOCABULARY: 480,  // 8 minutes
  GRAMMAR: 480,     // 8 minutes
  READING: 720,     // 12 minutes
  WRITING: 600,     // 10 minutes
  SPEAKING: 420,    // 7 minutes
};

/**
 * Proficiency level thresholds
 */
export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',      // 0-49
  INTERMEDIATE = 'INTERMEDIATE', // 50-74
  ADVANCED = 'ADVANCED',      // 75-100
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
 * Calculate raw score for objective section (Vocabulary, Grammar, Reading)
 */
export async function calculateObjectiveScore(sectionAttemptId: string): Promise<number> {
  const answers = await prisma.objectiveAnswer.findMany({
    where: { sectionAttemptId },
  });

  if (answers.length === 0) return 0;

  const correctCount = answers.filter((a: any) => a.isCorrect).length;
  const totalQuestions = answers.length;

  // Raw score is percentage (0-100)
  return (correctCount / totalQuestions) * 100;
}

/**
 * Calculate weighted score for a section
 */
export function calculateWeightedScore(rawScore: number, sectionType: SectionType): number {
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
  selectedOption: string
): Promise<{ isCorrect: boolean; score: number }> {
  // Get the question to check correct answer
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = selectedOption === question.correctAnswer;
  const score = isCorrect ? 1 : 0;

  return { isCorrect, score };
}

/**
 * AI Scoring for Writing (using Google Gemini)
 */
export async function scoreWritingWithAI(
  responseText: string,
  promptText: string,
  rubric?: any
): Promise<{ score: number; feedback: any }> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const scoringPrompt = `
You are an English language assessment expert. Score the following student writing response.

PROMPT:
${promptText}

STUDENT RESPONSE:
${responseText}

RUBRIC:
${rubric ? JSON.stringify(rubric, null, 2) : 'Standard academic writing criteria'}

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
  "score": <number 0-100>,
  "feedback": {
    "grammar": "<feedback in Indonesian>",
    "vocabulary": "<feedback in Indonesian>",
    "content": "<feedback in Indonesian>",
    "organization": "<feedback in Indonesian>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
  }
}
`;

    const result = await model.generateContent(scoringPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      feedback: parsed.feedback,
    };
  } catch (error) {
    console.error('AI scoring error:', error);
    // Fallback: basic length-based scoring
    const wordCount = responseText.trim().split(/\s+/).length;
    const score = Math.min(100, (wordCount / 150) * 70); // Basic scoring
    return {
      score,
      feedback: {
        error: 'AI scoring unavailable, using basic scoring',
        message: 'Penilaian otomatis tidak tersedia. Skor dasar berdasarkan panjang teks.',
      },
    };
  }
}

/**
 * AI Scoring for Speaking (using Google Gemini)
 */
export async function scoreSpeakingWithAI(
  transcriptText: string,
  promptText: string,
  rubric?: any
): Promise<{ score: number; feedback: any }> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const scoringPrompt = `
You are an English language speaking assessment expert. Score the following student speaking response based on the transcript.

PROMPT:
${promptText}

STUDENT TRANSCRIPT:
${transcriptText}

RUBRIC:
${rubric ? JSON.stringify(rubric, null, 2) : 'Standard speaking assessment criteria'}

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
  "score": <number 0-100>,
  "feedback": {
    "grammar": "<feedback in Indonesian>",
    "vocabulary": "<feedback in Indonesian>",
    "content": "<feedback in Indonesian>",
    "fluency": "<feedback in Indonesian>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
  }
}
`;

    const result = await model.generateContent(scoringPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      feedback: parsed.feedback,
    };
  } catch (error) {
    console.error('AI scoring error:', error);
    // Fallback: basic length-based scoring
    const wordCount = transcriptText.trim().split(/\s+/).length;
    const score = Math.min(100, (wordCount / 100) * 70); // Basic scoring
    return {
      score,
      feedback: {
        error: 'AI scoring unavailable, using basic scoring',
        message: 'Penilaian otomatis tidak tersedia. Skor dasar berdasarkan panjang transkrip.',
      },
    };
  }
}

/**
 * Process and finalize test results
 */
export async function finalizeTestResults(testAttemptId: string): Promise<void> {
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
      // Writing section
      rawScore = section.writingResponse?.score || 0;
    } else if (section.sectionType === SectionType.SPEAKING) {
      // Speaking section
      rawScore = section.speakingResponse?.score || 0;
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
      vocabScore: scores[SectionType.VOCABULARY] || 0,
      grammarScore: scores[SectionType.GRAMMAR] || 0,
      readingScore: scores[SectionType.READING] || 0,
      writingScore: scores[SectionType.WRITING] || 0,
      speakingScore: scores[SectionType.SPEAKING] || 0,
      totalScore,
      level: level as any,
    },
    update: {
      vocabScore: scores[SectionType.VOCABULARY] || 0,
      grammarScore: scores[SectionType.GRAMMAR] || 0,
      readingScore: scores[SectionType.READING] || 0,
      writingScore: scores[SectionType.WRITING] || 0,
      speakingScore: scores[SectionType.SPEAKING] || 0,
      totalScore,
      level: level as any,
    },
  });

  // Update test attempt status
  await prisma.testAttempt.update({
    where: { id: testAttemptId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
}
