export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreObjectiveAnswer } from '@/lib/scoring';

interface SaveAnswerRequest {
  answers?: Record<string, string>;
  writingResponse?: string;
  speakingResponse?: string;
  currentSection: "vocabulary" | "grammar" | "reading" | "writing" | "speaking";
}

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  vocabulary: SectionType.VOCABULARY,
  grammar: SectionType.GRAMMAR,
  reading: SectionType.READING,
  writing: SectionType.WRITING,
  speaking: SectionType.SPEAKING,
};

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SaveAnswerRequest = await request.json();
    const { answers, writingResponse, speakingResponse, currentSection } = body;

    if (!currentSection) {
      return NextResponse.json({ error: 'currentSection is required' }, { status: 400 });
    }

    const sectionType = SECTION_TYPE_MAP[currentSection.toLowerCase()];
    if (!sectionType) {
      return NextResponse.json({ error: `Invalid section: ${currentSection}` }, { status: 400 });
    }

    // Find user's active test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {  
        userId: user.id,
        status: TestAttemptStatus.IN_PROGRESS,
      },
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'No active test attempt found' },
        { status: 404 }
      );
    }

    // Get section attempt
    const sectionAttempt = await prisma.sectionAttempt.findFirst({
      where: {  
        testAttemptId: testAttempt.id,
        sectionType,
      },
    });

    if (!sectionAttempt) {
      return NextResponse.json(
        { error: 'Section attempt not found' },
        { status: 404 }
      );
    }

    // We handle section status transitions (IN_PROGRESS/COMPLETED) at the end of saving

    // Save objective answers (Vocabulary, Grammar, Reading)
    if (
      (sectionType === SectionType.VOCABULARY ||
        sectionType === SectionType.GRAMMAR ||
        sectionType === SectionType.READING) &&
      answers &&
      typeof answers === 'object'
    ) {
      for (const [questionId, selectedOption] of Object.entries(answers)) {
        // Only save answers for the current section type to keep it clean
        if (questionId.startsWith(sectionType)) {
          const { isCorrect, score } = await scoreObjectiveAnswer(
            sectionAttempt.id,
            questionId,
            selectedOption
          );

          await prisma.objectiveAnswer.upsert({
            where: {  
              sectionAttemptId_questionId: {
                sectionAttemptId: sectionAttempt.id,
                questionId: questionId,
              },
            },
            create: {
              sectionAttemptId: sectionAttempt.id,
              questionId: questionId,
              selectedOption: selectedOption,
              isCorrect,
              score,
            },
            update: {
              selectedOption: selectedOption,
              isCorrect,
              score,
            },
          });
        }
      }
    }

    // Save writing response
    if (sectionType === SectionType.WRITING && typeof writingResponse === 'string') {
      await prisma.writingResponse.upsert({
        where: { sectionAttemptId: sectionAttempt.id },
        create: {
          sectionAttemptId: sectionAttempt.id,
          userId: user.id,
          content: writingResponse,
        },
        update: {
          content: writingResponse,
        },
      });
    }

    // Save speaking response
    if (sectionType === SectionType.SPEAKING && typeof speakingResponse === 'string') {
      await prisma.speakingResponse.upsert({
        where: { sectionAttemptId: sectionAttempt.id },
        create: {
          sectionAttemptId: sectionAttempt.id,
          userId: user.id,
          transcript: speakingResponse,
        },
        update: {
          transcript: speakingResponse,
        },
      });
    }

    // Mark current section attempt as COMPLETED
    await prisma.sectionAttempt.update({
      where: { id: sectionAttempt.id },
      data: {
        status: SectionStatus.COMPLETED,
        endTime: sectionAttempt.endTime || new Date(),
      },
    });

    // Mark the next section attempt as IN_PROGRESS
    const SECTION_ORDER = [
      SectionType.VOCABULARY,
      SectionType.GRAMMAR,
      SectionType.READING,
      SectionType.WRITING,
      SectionType.SPEAKING,
    ];
    const currentIndex = SECTION_ORDER.indexOf(sectionType);
    if (currentIndex !== -1 && currentIndex < SECTION_ORDER.length - 1) {
      const nextSectionType = SECTION_ORDER[currentIndex + 1];
      const nextSectionAttempt = await prisma.sectionAttempt.findUnique({
        where: {
          testAttemptId_sectionType: {
            testAttemptId: testAttempt.id,
            sectionType: nextSectionType,
          },
        },
      });

      if (nextSectionAttempt && nextSectionAttempt.status === SectionStatus.NOT_STARTED) {
        await prisma.sectionAttempt.update({
          where: { id: nextSectionAttempt.id },
          data: {
            status: SectionStatus.IN_PROGRESS,
            startTime: new Date(),
          },
        });
      }
    }

    // Create audit log
    await createAuditLog(
      user.id,
      'ANSWERS_SAVED',
      'SectionAttempt',
      sectionAttempt.id,
      { sectionType }
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
