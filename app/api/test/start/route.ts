export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { TIME_LIMITS, SECTION_WEIGHTS } from '@/lib/scoring';
import { getRandomQuestions, getRandomPrompt } from '@/lib/questions';

const SECTION_ORDER = [
  SectionType.VOCABULARY,
  SectionType.GRAMMAR,
  SectionType.READING,
  SectionType.WRITING,
  SectionType.SPEAKING,
];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active or completed attempt
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: user.id,
        status: {
          in: [
            TestAttemptStatus.IN_PROGRESS,
            TestAttemptStatus.SUBMITTED,
            TestAttemptStatus.PROCESSING,
            TestAttemptStatus.COMPLETED,
          ],
        },
      },
      include: { sectionAttempts: true },
      orderBy: { createdAt: 'desc' },
    });

    // If already completed/processing, block
    if (
      existingAttempt &&
      (existingAttempt.status === TestAttemptStatus.COMPLETED ||
        existingAttempt.status === TestAttemptStatus.SUBMITTED ||
        existingAttempt.status === TestAttemptStatus.PROCESSING)
    ) {
      return NextResponse.json(
        { error: 'You have already completed a placement test', code: 'ALREADY_COMPLETED' },
        { status: 409 }
      );
    }

    // If IN_PROGRESS and already has sections with feedback, allow continuation
    if (existingAttempt && existingAttempt.status === TestAttemptStatus.IN_PROGRESS) {
      const hasQuestions = existingAttempt.sectionAttempts.some((s) => s.feedback);
      if (hasQuestions) {
        return NextResponse.json(
          { message: 'Continuing existing test', testAttemptId: existingAttempt.id },
          { status: 200 }
        );
      }
      // IN_PROGRESS but no questions yet — fall through to create them
    }

    // Create or reuse test attempt
    let testAttemptId: string;

    if (existingAttempt) {
      testAttemptId = existingAttempt.id;
    } else {
      const newAttempt = await prisma.testAttempt.create({
        data: {
          userId: user.id,
          status: TestAttemptStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
      testAttemptId = newAttempt.id;

      // Create section attempts (no timeLimitSec — not in schema)
      for (const sectionType of SECTION_ORDER) {
        await prisma.sectionAttempt.create({
          data: {
            testAttemptId,
            sectionType,
            status: sectionType === SectionType.VOCABULARY ? SectionStatus.IN_PROGRESS : SectionStatus.NOT_STARTED,
            startTime: sectionType === SectionType.VOCABULARY ? new Date() : null,
          },
        });
      }
    }

    // Get fresh section attempts list
    const sectionAttempts = await prisma.sectionAttempt.findMany({
      where: { testAttemptId },
      orderBy: { createdAt: 'asc' },
    });

    // Store questions in each SectionAttempt.feedback if not already set
    for (const sectionAttempt of sectionAttempts) {
      if (sectionAttempt.feedback) continue; // already has questions

      let feedbackJson: Record<string, unknown> = {};

      if (
        sectionAttempt.sectionType === SectionType.VOCABULARY ||
        sectionAttempt.sectionType === SectionType.GRAMMAR ||
        sectionAttempt.sectionType === SectionType.READING
      ) {
        const count =
          sectionAttempt.sectionType === SectionType.READING ? 10 : 15;
        const rawQuestions = getRandomQuestions(sectionAttempt.sectionType, count);

        feedbackJson = {
          questions: rawQuestions.map((q, idx) => ({
            id: `${sectionAttempt.sectionType}_${idx}`,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        };
      } else {
        // WRITING or SPEAKING
        const prompt = getRandomPrompt(sectionAttempt.sectionType);
        feedbackJson = {
          prompt: prompt?.promptText ?? 'Respond to the prompt.',
          rubric: prompt?.rubric ?? null,
        };
      }

      await prisma.sectionAttempt.update({
        where: { id: sectionAttempt.id },
        data: { feedback: JSON.stringify(feedbackJson) },
      });
    }

    await createAuditLog(user.id, 'TEST_STARTED', 'TestAttempt', testAttemptId, {
      testAttemptId,
    });

    return NextResponse.json(
      { message: 'Test started successfully', testAttemptId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Start test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
