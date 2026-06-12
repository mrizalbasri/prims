import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TestAttemptStatus, SectionType, SectionStatus } from '@/app/generated/prisma';
import { getCurrentUserFromRequest, requireStudent, createAuditLog } from '@/lib/auth';
import { TIME_LIMITS } from '@/lib/scoring';
import { getRandomQuestions, getRandomPrompt } from '@/lib/questions';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a test attempt
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: user.id,
        status: {
          in: [TestAttemptStatus.IN_PROGRESS, TestAttemptStatus.COMPLETED],
        },
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'You have already started or completed a placement test' },
        { status: 409 }
      );
    }

    // Create new test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        status: TestAttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    // Create section attempts for all 5 sections
    const sections = [
      SectionType.VOCABULARY,
      SectionType.GRAMMAR,
      SectionType.READING,
      SectionType.WRITING,
      SectionType.SPEAKING,
    ];

    for (const sectionType of sections) {
      await prisma.sectionAttempt.create({
        data: {
          testAttemptId: testAttempt.id,
          sectionType,
          timeLimitSec: TIME_LIMITS[sectionType],
          status: SectionStatus.NOT_STARTED,
        },
      });
    }

    // Generate questions for objective sections
    const vocabQuestions = getRandomQuestions(SectionType.VOCABULARY, 15);
    const grammarQuestions = getRandomQuestions(SectionType.GRAMMAR, 15);
    const readingQuestions = getRandomQuestions(SectionType.READING, 10);

    // Get prompts for writing and speaking
    const writingPrompt = getRandomPrompt(SectionType.WRITING);
    const speakingPrompt = getRandomPrompt(SectionType.SPEAKING);

    // Create audit log
    await createAuditLog(
      user.id,
      'TEST_STARTED',
      'TestAttempt',
      testAttempt.id,
      { testAttemptId: testAttempt.id }
    );

    return NextResponse.json(
      {
        message: 'Test started successfully',
        testAttempt: {
          id: testAttempt.id,
          status: testAttempt.status,
          startedAt: testAttempt.startedAt,
        },
        questions: {
          vocabulary: vocabQuestions,
          grammar: grammarQuestions,
          reading: readingQuestions,
        },
        prompts: {
          writing: writingPrompt,
          speaking: speakingPrompt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Start test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}