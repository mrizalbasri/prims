export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse, waitUntil } from 'next/server';
import { ResponseStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreWritingWithAI } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check daily submission limit (max 3 submissions per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySubmissionsCount = await prisma.writingSubmission.count({
      where: {
        userId: user.id,
        submittedAt: {
          gte: today,
        },
      },
    });

    if (dailySubmissionsCount >= 3) {
      return NextResponse.json(
        { error: 'Batas limit harian tercapai. Anda hanya diperbolehkan mengirimkan latihan menulis 3 kali per hari untuk menghemat penggunaan API AI.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { promptId, essay: responseText } = body;

    if (!promptId || !responseText) {
      return NextResponse.json(
        { error: 'promptId and essay are required' },
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
    const wordCount = responseText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

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
        sectionType: 'writing',
        durationSec: 0, // Will be updated when scoring completes
        completedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'WRITING_SUBMITTED',
      'WritingSubmission',
      submission.id,
      { promptId, wordCount }
    );

    // Process AI scoring asynchronously using waitUntil to keep serverless function alive
    waitUntil(
      processWritingScoring(submission.id, responseText, prompt.promptText, prompt.rubric).catch(
        (error) => {
          console.error('Writing scoring error:', error);
        }
      )
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
  rubric: unknown
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
    const grammarScore = typeof feedback?.grammarScore === 'number' ? feedback.grammarScore : (feedback?.grammar ? 75 : score * 0.9);
    const clarityScore = typeof feedback?.clarityScore === 'number' ? feedback.clarityScore : (feedback?.content ? 80 : score * 0.95);
    const structureScore = typeof feedback?.structureScore === 'number' ? feedback.structureScore : (feedback?.organization ? 70 : score * 0.85);

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
        completedAt: new Date(),
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
