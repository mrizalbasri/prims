import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's test attempt
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
          hasAttempt: false,
          message: 'No test attempt found',
        },
        { status: 200 }
      );
    }

    // Calculate progress for each section
    const sectionProgress = testAttempt.sectionAttempts.map((section) => {
      let answeredCount = 0;
      let totalQuestions = 0;

      if (section.objectiveAnswers.length > 0) {
        answeredCount = section.objectiveAnswers.length;
        totalQuestions = section.sectionType === 'READING' ? 10 : 15;
      } else if (section.writingResponse) {
        answeredCount = section.writingResponse.responseText ? 1 : 0;
        totalQuestions = 1;
      } else if (section.speakingResponse) {
        answeredCount = section.speakingResponse.transcriptText ? 1 : 0;
        totalQuestions = 1;
      }

      return {
        sectionType: section.sectionType,
        status: section.status,
        startedAt: section.startedAt,
        endedAt: section.endedAt,
        timeLimitSec: section.timeLimitSec,
        progress: {
          answered: answeredCount,
          total: totalQuestions,
          percentage: totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0,
        },
      };
    });

    return NextResponse.json(
      {
        hasAttempt: true,
        testAttempt: {
          id: testAttempt.id,
          status: testAttempt.status,
          startedAt: testAttempt.startedAt,
          submittedAt: testAttempt.submittedAt,
          completedAt: testAttempt.completedAt,
        },
        sections: sectionProgress,
        finalResult: testAttempt.finalResult
          ? {
              vocabScore: testAttempt.finalResult.vocabScore,
              grammarScore: testAttempt.finalResult.grammarScore,
              readingScore: testAttempt.finalResult.readingScore,
              writingScore: testAttempt.finalResult.writingScore,
              speakingScore: testAttempt.finalResult.speakingScore,
              totalScore: testAttempt.finalResult.totalScore,
              level: testAttempt.finalResult.level,
              computedAt: testAttempt.finalResult.computedAt,
            }
          : null,
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