export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreWritingWithAI, scoreSpeakingWithAI, finalizeTestResults, calculateWeightedScore } from '@/lib/scoring';

interface SubmitTestRequest {
  testAttemptId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let testAttemptId: string | undefined;
    try {
      const body: SubmitTestRequest = await request.json();
      testAttemptId = body?.testAttemptId;
    } catch (e) {
      // Body might be empty
    }

    let testAttempt;
    if (testAttemptId) {
      testAttempt = await prisma.testAttempt.findFirst({
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
    } else {
      // Find active test attempt
      testAttempt = await prisma.testAttempt.findFirst({
        where: {
          userId: user.id,
          status: TestAttemptStatus.IN_PROGRESS,
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
    }

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Active test attempt not found' },
        { status: 404 }
      );
    }

    testAttemptId = testAttempt.id;

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
            endTime: new Date(),
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

    // Score writing and speaking responses
    for (const section of testAttempt.sectionAttempts) {
      if (section.sectionType === SectionType.WRITING && section.writingResponse && section.writingResponse.content) {
        try {
          // Parse prompt details from section.feedback JSON
          let promptText = "Respond to the prompt.";
          let rubric = null;
          if (section.feedback) {
            try {
              const fb = JSON.parse(section.feedback);
              promptText = fb.prompt || promptText;
              rubric = fb.rubric || null;
            } catch (e) {
              console.error('Failed to parse writing section feedback:', e);
            }
          }

          // Score with AI
          const { score, feedback } = await scoreWritingWithAI(
            section.writingResponse.content,
            promptText,
            rubric
          );

          // Update section attempt score & writing response feedback
          await prisma.$transaction([
            prisma.sectionAttempt.update({
              where: { id: section.id },
              data: {
                rawScore: score,
                weightedScore: calculateWeightedScore(score, SectionType.WRITING),
              },
            }),
            prisma.writingResponse.update({
              where: { id: section.writingResponse.id },
              data: {
                feedback: feedback as any,
                wordCount: section.writingResponse.content.trim().split(/\s+/).length,
              },
            }),
          ]);
        } catch (error) {
          console.error('Writing scoring error:', error);
        }
      }

      // Score speaking responses
      if (section.sectionType === SectionType.SPEAKING && section.speakingResponse && section.speakingResponse.transcript) {
        try {
          // Parse prompt details from section.feedback JSON
          let promptText = "Respond to the prompt.";
          let rubric = null;
          if (section.feedback) {
            try {
              const fb = JSON.parse(section.feedback);
              promptText = fb.prompt || promptText;
              rubric = fb.rubric || null;
            } catch (e) {
              console.error('Failed to parse speaking section feedback:', e);
            }
          }

          // Score with AI
          const { score, feedback } = await scoreSpeakingWithAI(
            section.speakingResponse.transcript,
            promptText,
            rubric
          );

          // Update section attempt score & speaking response feedback
          await prisma.$transaction([
            prisma.sectionAttempt.update({
              where: { id: section.id },
              data: {
                rawScore: score,
                weightedScore: calculateWeightedScore(score, SectionType.SPEAKING),
              },
            }),
            prisma.speakingResponse.update({
              where: { id: section.speakingResponse.id },
              data: {
                feedback: feedback as any,
              },
            }),
          ]);
        } catch (error) {
          console.error('Speaking scoring error:', error);
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
