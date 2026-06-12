import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SectionType, SectionStatus } from '@/app/generated/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreObjectiveAnswer } from '@/lib/scoring';

const prisma = new PrismaClient();

interface SaveAnswerRequest {
  testAttemptId: string;
  sectionType: SectionType;
  answers?: Array<{
    questionId: string;
    selectedOption: string;
  }>;
  writingResponse?: {
    promptId: string;
    responseText: string;
  };
  speakingResponse?: {
    promptId: string;
    transcriptText: string;
    audioUrl?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SaveAnswerRequest = await request.json();
    const { testAttemptId, sectionType, answers, writingResponse, speakingResponse } = body;

    // Verify test attempt belongs to user
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: testAttemptId,
        userId: user.id,
      },
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      );
    }

    // Get section attempt
    const sectionAttempt = await prisma.sectionAttempt.findFirst({
      where: {
        testAttemptId,
        sectionType,
      },
    });

    if (!sectionAttempt) {
      return NextResponse.json(
        { error: 'Section attempt not found' },
        { status: 404 }
      );
    }

    // Update section status if not started
    if (sectionAttempt.status === SectionStatus.NOT_STARTED) {
      await prisma.sectionAttempt.update({
        where: { id: sectionAttempt.id },
        data: {
          status: SectionStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
    }

    // Save objective answers (Vocabulary, Grammar, Reading)
    if (answers && answers.length > 0) {
      for (const answer of answers) {
        const { isCorrect, score } = await scoreObjectiveAnswer(
          sectionAttempt.id,
          answer.questionId,
          answer.selectedOption
        );

        await prisma.objectiveAnswer.upsert({
          where: {
            sectionAttemptId_questionId: {
              sectionAttemptId: sectionAttempt.id,
              questionId: answer.questionId,
            },
          },
          create: {
            sectionAttemptId: sectionAttempt.id,
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect,
            score,
          },
          update: {
            selectedOption: answer.selectedOption,
            isCorrect,
            score,
          },
        });
      }
    }

    // Save writing response
    if (writingResponse) {
      await prisma.writingResponse.upsert({
        where: { sectionAttemptId: sectionAttempt.id },
        create: {
          sectionAttemptId: sectionAttempt.id,
          promptId: writingResponse.promptId,
          responseText: writingResponse.responseText,
          status: 'PENDING',
        },
        update: {
          responseText: writingResponse.responseText,
        },
      });
    }

    // Save speaking response
    if (speakingResponse) {
      await prisma.speakingResponse.upsert({
        where: { sectionAttemptId: sectionAttempt.id },
        create: {
          sectionAttemptId: sectionAttempt.id,
          promptId: speakingResponse.promptId,
          transcriptText: speakingResponse.transcriptText,
          audioUrl: speakingResponse.audioUrl,
          status: 'PENDING',
        },
        update: {
          transcriptText: speakingResponse.transcriptText,
          audioUrl: speakingResponse.audioUrl,
        },
      });
    }

    // Create audit log
    await createAuditLog(
      user.id,
      'ANSWERS_SAVED',
      'SectionAttempt',
      sectionAttempt.id,
      { sectionType, answerCount: answers?.length || 0 }
    );

    return NextResponse.json(
      {
        message: 'Answers saved successfully',
        sectionAttemptId: sectionAttempt.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save answers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}