import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TestAttemptStatus, SectionStatus, ResponseStatus } from '@/app/generated/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreWritingWithAI, scoreSpeakingWithAI, finalizeTestResults } from '@/lib/scoring';

const prisma = new PrismaClient();

interface SubmitTestRequest {
  testAttemptId: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SubmitTestRequest = await request.json();
    const { testAttemptId } = body;

    // Verify test attempt belongs to user
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: testAttemptId,
        userId: user.id,
      },
      include: {
        sectionAttempts: {
          include: {
            writingResponse: true,
            speakingResponse: true,
          },
        },
      },
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (testAttempt.status === TestAttemptStatus.SUBMITTED || 
        testAttempt.status === TestAttemptStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Test already submitted' },
        { status: 409 }
      );
    }

    // Mark all sections as completed
    for (const section of testAttempt.sectionAttempts) {
      if (section.status !== SectionStatus.COMPLETED) {
        await prisma.sectionAttempt.update({
          where: { id: section.id },
          data: {
            status: SectionStatus.COMPLETED,
            endedAt: new Date(),
          },
        });
      }
    }

    // Update test attempt status
    await prisma.testAttempt.update({
      where: { id: testAttemptId },
      data: {
        status: TestAttemptStatus.PROCESSING,
        submittedAt: new Date(),
      },
    });

    // Create audit log
    await createAuditLog(
      user.id,
      'TEST_SUBMITTED',
      'TestAttempt',
      testAttemptId,
      { testAttemptId }
    );

    // Process AI scoring asynchronously
    processAIScoring(testAttemptId).catch((error) => {
      console.error('AI scoring error:', error);
    });

    return NextResponse.json(
      {
        message: 'Test submitted successfully. Results will be available shortly.',
        testAttemptId,
        status: TestAttemptStatus.PROCESSING,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process AI scoring for writing and speaking sections
 */
async function processAIScoring(testAttemptId: string): Promise<void> {
  try {
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        sectionAttempts: {
          include: {
            writingResponse: true,
            speakingResponse: true,
          },
        },
      },
    });

    if (!testAttempt) return;

    // Score writing responses
    for (const section of testAttempt.sectionAttempts) {
      if (section.writingResponse && section.writingResponse.status === ResponseStatus.PENDING) {
        try {
          // Get prompt details
          const prompt = await prisma.prompt.findUnique({
            where: { id: section.writingResponse.promptId },
          });

          if (prompt) {
            // Update status to processing
            await prisma.writingResponse.update({
              where: { id: section.writingResponse.id },
              data: { status: ResponseStatus.PROCESSING },
            });

            // Score with AI
            const { score, feedback } = await scoreWritingWithAI(
              section.writingResponse.responseText,
              prompt.promptText,
              prompt.rubric
            );

            // Update with score and feedback
            await prisma.writingResponse.update({
              where: { id: section.writingResponse.id },
              data: {
                score,
                aiFeedbackJson: feedback,
                status: ResponseStatus.COMPLETED,
              },
            });
          }
        } catch (error) {
          console.error('Writing scoring error:', error);
          await prisma.writingResponse.update({
            where: { id: section.writingResponse.id },
            data: { status: ResponseStatus.FAILED },
          });
        }
      }

      // Score speaking responses
      if (section.speakingResponse && section.speakingResponse.status === ResponseStatus.PENDING) {
        try {
          // Get prompt details
          const prompt = await prisma.prompt.findUnique({
            where: { id: section.speakingResponse.promptId },
          });

          if (prompt && section.speakingResponse.transcriptText) {
            // Update status to processing
            await prisma.speakingResponse.update({
              where: { id: section.speakingResponse.id },
              data: { status: ResponseStatus.PROCESSING },
            });

            // Score with AI
            const { score, feedback } = await scoreSpeakingWithAI(
              section.speakingResponse.transcriptText,
              prompt.promptText,
              prompt.rubric
            );

            // Update with score and feedback
            await prisma.speakingResponse.update({
              where: { id: section.speakingResponse.id },
              data: {
                score,
                aiFeedbackJson: feedback,
                status: ResponseStatus.COMPLETED,
              },
            });
          }
        } catch (error) {
          console.error('Speaking scoring error:', error);
          await prisma.speakingResponse.update({
            where: { id: section.speakingResponse.id },
            data: { status: ResponseStatus.FAILED },
          });
        }
      }
    }

    // Finalize results
    await finalizeTestResults(testAttemptId);
  } catch (error) {
    console.error('Process AI scoring error:', error);
    // Mark test as failed
    await prisma.testAttempt.update({
      where: { id: testAttemptId },
      data: { status: TestAttemptStatus.FAILED },
    });
  }
}