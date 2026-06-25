export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { getTestSettings } from '@/lib/settings';

interface FrontendQuestion {
  id: string;
  prompt: string;
  options?: string[];
  metadata?: Record<string, unknown>;
}

interface ParsedQuestion {
  id: string;
  questionText: string;
  options: string[];
  metadata?: Record<string, unknown>;
}

const SECTION_TYPES_ORDER = [
  SectionType.VOCABULARY,
  SectionType.GRAMMAR,
  SectionType.LISTENING,
  SectionType.READING,
  SectionType.WRITING,
  SectionType.SPEAKING,
];

const FRONTEND_SECTION_MAP: Record<SectionType, "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking"> = {
  VOCABULARY: "vocabulary",
  GRAMMAR: "grammar",
  LISTENING: "listening",
  READING: "reading",
  WRITING: "writing",
  SPEAKING: "speaking",
};

const DURATION_MAP: Record<SectionType, number> = {
  VOCABULARY: 8, // 8 minutes
  GRAMMAR: 8,
  LISTENING: 10,
  READING: 12,
  WRITING: 10,
  SPEAKING: 7,
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active or latest test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: { userId: user.id },
      include: {
        sectionAttempts: {
          include: {
            objectiveAnswers: true,
            writingResponse: true,
            speakingResponse: true,
          },
        },
        finalResult: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!testAttempt) {
      return NextResponse.json(
        {
          attempt: null,
          sections: [],
        },
        { status: 200 }
      );
    }

    const settings = await getTestSettings();

    // Construct frontend sections format with loaded questions/prompts
    const sectionsData = SECTION_TYPES_ORDER.map((secType) => {
      const sa = testAttempt.sectionAttempts.find((s) => s.sectionType === secType);
      
      let questions: FrontendQuestion[] = [];
      if (sa && sa.feedback) {
        try {
          const parsed = JSON.parse(sa.feedback);
          if (secType === SectionType.VOCABULARY || secType === SectionType.GRAMMAR || secType === SectionType.READING || secType === SectionType.LISTENING) {
            questions = (parsed.questions as ParsedQuestion[] || []).map((q: ParsedQuestion) => ({
              id: q.id,
              prompt: q.questionText,
              options: q.options,
              metadata: q.metadata || {},
            }));
          } else {
            questions = [
              {
                id: `${secType}_PROMPT`,
                prompt: parsed.prompt || "Respond to the prompt.",
              }
            ];
          }
        } catch (e) {
          console.error("Error parsing section attempt feedback JSON:", e);
        }
      }

      return {
        section: FRONTEND_SECTION_MAP[secType],
        durationMinutes: settings.durations[secType] || DURATION_MAP[secType],
        questions,
      };
    });

    // Gather all saved objective answers
    const answers: Record<string, string> = {};
    let writingResponseText = "";
    let speakingResponseText = "";
    let speakingAudioUrlText = "";

    for (const sa of testAttempt.sectionAttempts) {
      for (const objAns of sa.objectiveAnswers) {
        answers[objAns.questionId] = objAns.selectedOption;
      }
      if (sa.sectionType === SectionType.WRITING && sa.writingResponse) {
        writingResponseText = sa.writingResponse.content || "";
      }
      if (sa.sectionType === SectionType.SPEAKING && sa.speakingResponse) {
        speakingResponseText = sa.speakingResponse.transcript || "";
        speakingAudioUrlText = sa.speakingResponse.audioUrl || "";
      }
    }

    // Find the first section that is not COMPLETED
    let activeSectionIndex = 0;
    for (let i = 0; i < SECTION_TYPES_ORDER.length; i++) {
      const secType = SECTION_TYPES_ORDER[i];
      const sa = testAttempt.sectionAttempts.find((s) => s.sectionType === secType);
      if (sa && sa.status !== 'COMPLETED') {
        activeSectionIndex = i;
        break;
      }
    }

    return NextResponse.json(
      {
        attempt: {
          status: testAttempt.status,
          answers,
          writingResponse: writingResponseText,
          speakingResponse: speakingResponseText,
          speakingAudioUrl: speakingAudioUrlText,
        },
        sections: sectionsData,
        activeSectionIndex,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get test state error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
