export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { getRandomQuestions, getRandomPrompt } from '@/lib/questions';
import { getTestSettings } from '@/lib/settings';

const SECTION_ORDER = [
  SectionType.VOCABULARY,
  SectionType.GRAMMAR,
  SectionType.LISTENING,
  SectionType.READING,
  SectionType.WRITING,
  SectionType.SPEAKING,
];


const startLocks = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle concurrent request race condition (e.g., React StrictMode double fetch)
    if (startLocks.has(user.id)) {
      for (let i = 0; i < 15; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        const activeAttempt = await prisma.testAttempt.findFirst({
          where: {
            userId: user.id,
            status: TestAttemptStatus.IN_PROGRESS,
          },
          include: { sectionAttempts: true },
        });
        if (activeAttempt && activeAttempt.sectionAttempts.some((s) => s.feedback)) {
          return NextResponse.json(
            { message: 'Continuing existing test', testAttemptId: activeAttempt.id },
            { status: 200 }
          );
        }
      }
    }

    startLocks.add(user.id);

    try {
      // Clean up duplicate IN_PROGRESS attempts if any exist (self-healing)
      const inProgressAttempts = await prisma.testAttempt.findMany({
        where: {
          userId: user.id,
          status: TestAttemptStatus.IN_PROGRESS,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (inProgressAttempts.length > 1) {
        const deleteIds = inProgressAttempts.slice(1).map((a) => a.id);
        await prisma.testAttempt.deleteMany({
          where: {
            id: { in: deleteIds },
          },
        });
      }

      // Check if user already has an active (non-completed) attempt
      const activeAttempt = await prisma.testAttempt.findFirst({
        where: {
          userId: user.id,
          status: {
            in: [
              TestAttemptStatus.IN_PROGRESS,
              TestAttemptStatus.SUBMITTED,
              TestAttemptStatus.PROCESSING,
            ],
          },
        },
        include: { sectionAttempts: true },
        orderBy: { createdAt: 'desc' },
      });

      // If already submitted/processing, block
      if (
        activeAttempt &&
        (activeAttempt.status === TestAttemptStatus.SUBMITTED ||
          activeAttempt.status === TestAttemptStatus.PROCESSING)
      ) {
        return NextResponse.json(
          { error: 'Ujian sebelumnya sedang diproses, silakan tunggu beberapa saat.', code: 'PROCESSING' },
          { status: 409 }
        );
      }

      // If IN_PROGRESS and already has sections with feedback, allow continuation
      if (activeAttempt && activeAttempt.status === TestAttemptStatus.IN_PROGRESS) {
        const hasQuestions = activeAttempt.sectionAttempts.some((s) => s.feedback);
        if (hasQuestions) {
          return NextResponse.json(
            { message: 'Continuing existing test', testAttemptId: activeAttempt.id },
            { status: 200 }
          );
        }
      }

    // Create or reuse test attempt
    let testAttemptId: string;

    if (activeAttempt) {
      testAttemptId = activeAttempt.id;
    } else {
      // Check if student has completed attempts
      const hasCompletedAttempt = await prisma.testAttempt.findFirst({
        where: {
          userId: user.id,
          status: TestAttemptStatus.COMPLETED,
        },
      });

      if (hasCompletedAttempt && !user.allowRetake) {
        return NextResponse.json(
          { error: 'Anda tidak memiliki izin untuk mengulang ujian. Silakan hubungi administrator.' },
          { status: 403 }
        );
      }

      const newAttempt = await prisma.testAttempt.create({
        data: {
          userId: user.id,
          status: TestAttemptStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
      testAttemptId = newAttempt.id;

      // Consume the allowRetake permission
      if (user.allowRetake) {
        await prisma.user.update({
          where: { id: user.id },
          data: { allowRetake: false },
        });
      }

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

      const settings = await getTestSettings();

      if (
        sectionAttempt.sectionType === SectionType.VOCABULARY ||
        sectionAttempt.sectionType === SectionType.GRAMMAR ||
        sectionAttempt.sectionType === SectionType.READING ||
        sectionAttempt.sectionType === SectionType.LISTENING
      ) {
        const count = settings.counts[sectionAttempt.sectionType] || 10;
        
        // Fetch questions from database
        const dbQuestions = await prisma.question.findMany({
          where: {
            sectionType: sectionAttempt.sectionType,
            isActive: true,
          },
        });

        let selectedQuestions = [];
        if (dbQuestions.length > 0) {
          if (sectionAttempt.sectionType === SectionType.LISTENING) {
            // Group questions by audioUrl to avoid splitting question sets belonging to the same audio
            const groupsMap = new Map<string, typeof dbQuestions>();
            dbQuestions.forEach((q) => {
              const metadata = q.metadata as Record<string, unknown> | null;
              const audioUrl = (metadata?.audioUrl as string) || "";
              if (!groupsMap.has(audioUrl)) {
                groupsMap.set(audioUrl, []);
              }
              groupsMap.get(audioUrl)!.push(q);
            });

            // Convert to array of groups and sort questions inside each group by id (chronological order)
            const groups = Array.from(groupsMap.values()).map(g => {
              return g.sort((a, b) => a.id.localeCompare(b.id));
            });

            // Shuffle the groups
            const shuffledGroups = groups.sort(() => Math.random() - 0.5);

            // Select groups until we have enough questions (target: count)
            let totalSelected = 0;
            for (const group of shuffledGroups) {
              selectedQuestions.push(...group);
              totalSelected += group.length;
              if (totalSelected >= count) {
                break;
              }
            }
          } else {
            // Standard random selection for other sections
            selectedQuestions = [...dbQuestions]
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.min(count, dbQuestions.length));
          }
        } else {
          // Fallback to static questions
          selectedQuestions = getRandomQuestions(sectionAttempt.sectionType, count);
        }

        feedbackJson = {
          questions: selectedQuestions.map((q, idx) => {
            // Get database question ID or fallback
            const dbId = 'id' in q ? (q as { id: string }).id : `static_${idx}`;
            // Ensure ID starts with sectionType (e.g. VOCABULARY_cju...) to pass the startsWith check in save/route.ts
            const questionId = dbId.startsWith(sectionAttempt.sectionType)
              ? dbId
              : `${sectionAttempt.sectionType}_${dbId}`;

            return {
              id: questionId,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              metadata: q.metadata || {},
            };
          }),
        };
      } else {
        // WRITING or SPEAKING
        let promptText = 'Respond to the prompt.';
        let rubricJson: unknown = null;

        if (sectionAttempt.sectionType === SectionType.WRITING) {
          const dbPrompts = await prisma.writingPrompt.findMany({
            where: { isActive: true },
          });
          if (dbPrompts.length > 0) {
            const selectedPrompt = dbPrompts[Math.floor(Math.random() * dbPrompts.length)];
            promptText = selectedPrompt.promptText;
            rubricJson = selectedPrompt.rubric;
          } else {
            const prompt = getRandomPrompt(sectionAttempt.sectionType);
            promptText = prompt?.promptText ?? 'Respond to the prompt.';
            rubricJson = prompt?.rubric ?? null;
          }
        } else {
          // SPEAKING
          const dbScenarios = await prisma.speakingScenario.findMany({
            where: { isActive: true },
          });
          if (dbScenarios.length > 0) {
            const selectedScenario = dbScenarios[Math.floor(Math.random() * dbScenarios.length)];
            let speakingPrompt = selectedScenario.promptText;
            if (!speakingPrompt && selectedScenario.prompts && selectedScenario.prompts.length > 0) {
              speakingPrompt = selectedScenario.prompts.join('\n');
            }
            promptText = speakingPrompt || 'Respond to the prompt.';
            rubricJson = selectedScenario.rubric;
          } else {
            const prompt = getRandomPrompt(sectionAttempt.sectionType);
            promptText = prompt?.promptText ?? 'Respond to the prompt.';
            rubricJson = prompt?.rubric ?? null;
          }
        }

        feedbackJson = {
          prompt: promptText,
          rubric: rubricJson,
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
    } finally {
      startLocks.delete(user.id);
    }
  } catch (error) {
    console.error('Start test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
