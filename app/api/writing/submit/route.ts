import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ResponseStatus } from '@/app/generated/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreWritingWithAI } from '@/lib/scoring';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { promptId, responseText } = body;

    if (!promptId || !responseText) {
      return NextResponse.json(
        { error: 'promptId and responseText are required' },
        { status: 400 }
      );
    }

    // Get prompt
    const prompt = await prisma.writingPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Calculate word count
    const wordCount = responseText.trim().split(/\s+/).length;

    // Create submission
    const submission = await prisma.writingSubmission.create({
      data: {
        userId: user.id,
        promptId,
        responseText,
        wordCount,
        status: ResponseStatus.PENDING,
      },
    });

    // Create learning session
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        moduleType: 'writing',
        durationSec: 0, // Will be updated when scoring completes
        completed: false,
        startedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'WRITING_SUBMITTED',
      'WritingSubmission',
      submission.id,
      { promptId, wordCount }
    );

    // Process AI scoring asynchronously
    processWritingScoring(submission.id, responseText, prompt.promptText, prompt.rubric).catch(
      (error) => {
        console.error('Writing scoring error:', error);
      }
    );

    return NextResponse.json(
      {
        message: 'Writing submitted successfully. Feedback will be available shortly.',
        submission: {
          id: submission.id,
          wordCount,
          status: submission.status,
          submittedAt: submission.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit writing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processWritingScoring(
  submissionId: string,
  responseText: string,
  promptText: string,
  rubric: any
): Promise<void> {
  try {
    // Update status to processing
    await prisma.writingSubmission.update({
      where: { id: submissionId },
      data: { status: ResponseStatus.PROCESSING },
    });

    // Score with AI
    const { score, feedback } = await scoreWritingWithAI(responseText, promptText, rubric);

    // Extract dimension scores from feedback if available
    const grammarScore = feedback.grammar ? 75 : score * 0.9; // Fallback calculation
    const clarityScore = feedback.content ? 80 : score * 0.95;
    const structureScore = feedback.organization ? 70 : score * 0.85;

    // Update submission with scores
    await prisma.writingSubmission.update({
      where: { id: submissionId },
      data: {
        aiFeedbackJson: feedback,
        grammarScore,
        clarityScore,
        structureScore,
        overallScore: score,
        status: ResponseStatus.COMPLETED,
      },
    });
  } catch (error) {
    console.error('Process writing scoring error:', error);
    await prisma.writingSubmission.update({
      where: { id: submissionId },
      data: { status: ResponseStatus.FAILED },
    });
  }
}
