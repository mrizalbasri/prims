export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse, waitUntil } from 'next/server';
import { ResponseStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreSpeakingWithAI } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check daily speaking limit (max 5 sessions per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySessionsCount = await prisma.speakingSession.count({
      where: {
        userId: user.id,
        startedAt: {
          gte: today,
        },
      },
    });

    if (dailySessionsCount >= 5) {
      return NextResponse.json(
        { error: 'Batas limit harian tercapai. Anda hanya diperbolehkan mengirimkan latihan speaking 5 kali per hari untuk menghemat penggunaan API AI.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { scenarioId, transcriptText, audioUrl, durationSec } = body;

    if (!scenarioId || (!transcriptText && !audioUrl)) {
      return NextResponse.json(
        { error: 'scenarioId and transcriptText or audioUrl are required' },
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
        transcriptText: transcriptText || "(Audio recording submitted)",
        audioUrl,
        durationSec: durationSec || 0,
        status: ResponseStatus.PENDING,
        startedAt: new Date(),
      },
    });

    // Create learning session
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        sectionType: 'speaking',
        durationSec: durationSec || 0,
        completedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'SPEAKING_SUBMITTED',
      'SpeakingSession',
      session.id,
      { scenarioId, durationSec }
    );

    // Process AI scoring asynchronously using waitUntil to keep serverless function alive
    waitUntil(
      processSpeakingScoring(
        session.id,
        transcriptText,
        scenario.title,
        scenario.description,
        scenario.rubric,
        audioUrl
      ).catch((error) => {
        console.error('Speaking scoring error:', error);
      })
    );

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
  rubric: unknown,
  audioUrl?: string
): Promise<void> {
  try {
    // Update status to processing
    await prisma.speakingSession.update({
      where: { id: sessionId },
      data: { status: ResponseStatus.PROCESSING },
    });

    const promptText = `${scenarioTitle}\n${scenarioDescription}`;

    // Score with AI
    const { score, feedback } = await scoreSpeakingWithAI(transcriptText, promptText, rubric, audioUrl);

    // Extract dimension scores from feedback if available
    const fluencyScore = typeof feedback?.fluencyScore === 'number' ? feedback.fluencyScore : (feedback?.fluency ? 75 : score * 0.9);
    const pronunciationScore = typeof feedback?.pronunciationScore === 'number' ? feedback.pronunciationScore : (feedback?.pronunciation ? 70 : score * 0.85);
    const grammarScore = typeof feedback?.grammarScore === 'number' ? feedback.grammarScore : (feedback?.grammar ? 80 : score * 0.95);

    // Update session with scores and AI transcription if client side transcript was empty/placeholder
    const finalTranscriptText = feedback?.transcript || (transcriptText === "(Audio recording submitted)" ? "Transcription completed by AI." : transcriptText);

    await prisma.speakingSession.update({
      where: { id: sessionId },
      data: {
        aiFeedbackJson: feedback,
        transcriptText: finalTranscriptText,
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
