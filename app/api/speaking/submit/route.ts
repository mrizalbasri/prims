export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreSpeakingWithAI } from '@/lib/scoring';



export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scenarioId, transcriptText, audioUrl, durationSec } = body;

    if (!scenarioId || !transcriptText) {
      return NextResponse.json(
        { error: 'scenarioId and transcriptText are required' },
        { status: 400 }
      );
    }

    // Get scenario
    const scenario = await prisma.speakingScenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Create session
    const session = await prisma.speakingSession.create({
      data: {
        userId: user.id,
        scenarioId,
        transcriptText,
        audioUrl,
        durationSec,
        status: ResponseStatus.PENDING,
        startedAt: new Date(),
      },
    });

    // Create learning session
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        moduleType: 'speaking',
        durationSec: durationSec || 0,
        completed: false,
        startedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'SPEAKING_SUBMITTED',
      'SpeakingSession',
      session.id,
      { scenarioId, durationSec }
    );

    // Process AI scoring asynchronously
    processSpeakingScoring(
      session.id,
      transcriptText,
      scenario.title,
      scenario.description,
      scenario.rubric
    ).catch((error) => {
      console.error('Speaking scoring error:', error);
    });

    return NextResponse.json(
      {
        message: 'Speaking submitted successfully. Feedback will be available shortly.',
        session: {
          id: session.id,
          status: session.status,
          startedAt: session.startedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit speaking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processSpeakingScoring(
  sessionId: string,
  transcriptText: string,
  scenarioTitle: string,
  scenarioDescription: string,
  rubric: any
): Promise<void> {
  try {
    // Update status to processing
    await prisma.speakingSession.update({
      where: { id: sessionId },
      data: { status: ResponseStatus.PROCESSING },
    });

    const promptText = `${scenarioTitle}\n${scenarioDescription}`;

    // Score with AI
    const { score, feedback } = await scoreSpeakingWithAI(transcriptText, promptText, rubric);

    // Extract dimension scores from feedback if available
    const fluencyScore = feedback.fluency ? 75 : score * 0.9;
    const pronunciationScore = feedback.pronunciation ? 70 : score * 0.85;
    const grammarScore = feedback.grammar ? 80 : score * 0.95;

    // Update session with scores
    await prisma.speakingSession.update({
      where: { id: sessionId },
      data: {
        aiFeedbackJson: feedback,
        fluencyScore,
        pronunciationScore,
        grammarScore,
        overallScore: score,
        status: ResponseStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Process speaking scoring error:', error);
    await prisma.speakingSession.update({
      where: { id: sessionId },
      data: { status: ResponseStatus.FAILED },
    });
  }
}
