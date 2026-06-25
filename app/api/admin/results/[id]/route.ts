export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id || id.startsWith('no-attempt-')) {
      return NextResponse.json({ error: 'Valid Test Attempt ID is required' }, { status: 400 });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: {
        user: true,
        finalResult: true,
        sectionAttempts: {
          include: {
            writingResponse: true,
            speakingResponse: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 });
    }

    const historyAttempts = await prisma.testAttempt.findMany({
      where: { userId: attempt.userId },
      include: { finalResult: true },
      orderBy: { createdAt: 'desc' },
    });

    // Format section scores
    const rawScores = attempt.finalResult?.sectionScores
      ? (typeof attempt.finalResult.sectionScores === 'string'
          ? JSON.parse(attempt.finalResult.sectionScores)
          : attempt.finalResult.sectionScores)
      : {};

    const sectionScores = {
      vocabulary: rawScores.VOCABULARY ?? rawScores.vocabulary ?? 0,
      grammar: rawScores.GRAMMAR ?? rawScores.grammar ?? 0,
      listening: rawScores.LISTENING ?? rawScores.listening ?? 0,
      reading: rawScores.READING ?? rawScores.reading ?? 0,
      writing: rawScores.WRITING ?? rawScores.writing ?? 0,
      speaking: rawScores.SPEAKING ?? rawScores.speaking ?? 0,
    };

    let testStatus = "BELUM_MULAI";
    if (attempt.status === "COMPLETED") {
      testStatus = "SELESAI";
    } else if (attempt.status === "IN_PROGRESS" || attempt.status === "PROCESSING") {
      testStatus = "SEDANG_MENGERJAKAN";
    } else if (attempt.status === "FAILED") {
      testStatus = "GAGAL";
    }

    const writingAttempt = attempt.sectionAttempts.find(s => s.sectionType === 'WRITING');
    const speakingAttempt = attempt.sectionAttempts.find(s => s.sectionType === 'SPEAKING');

    // Parse feedbacks
    const parseJson = (val: unknown) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    return NextResponse.json({
      testAttemptId: attempt.id,
      student: {
        id: attempt.user.id,
        email: attempt.user.email,
        fullName: attempt.user.fullName,
        major: attempt.user.major,
        cohort: attempt.user.cohort,
        allowRetake: attempt.user.allowRetake,
      },
      status: testStatus,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      completedAt: attempt.completedAt,
      scores: attempt.finalResult
        ? {
            vocabulary: sectionScores.vocabulary || 0,
            grammar: sectionScores.grammar || 0,
            listening: sectionScores.listening || 0,
            reading: sectionScores.reading || 0,
            writing: sectionScores.writing || 0,
            speaking: sectionScores.speaking || 0,
            total: attempt.finalResult.overallScore || 0,
          }
        : null,
      level: attempt.finalResult?.cefrLevel || null,
      writing: writingAttempt
        ? {
            content: writingAttempt.writingResponse?.content || '',
            feedback: parseJson(writingAttempt.writingResponse?.feedback),
            score: writingAttempt.weightedScore,
          }
        : null,
      speaking: speakingAttempt
        ? {
            audioUrl: speakingAttempt.speakingResponse?.audioUrl || null,
            transcript: speakingAttempt.speakingResponse?.transcript || '',
            feedback: parseJson(speakingAttempt.speakingResponse?.feedback),
            score: speakingAttempt.weightedScore,
          }
        : null,
      history: historyAttempts.map(h => ({
        testAttemptId: h.id,
        status: h.status,
        createdAt: h.createdAt,
        completedAt: h.completedAt,
        score: h.finalResult?.overallScore ?? null,
        level: h.finalResult?.cefrLevel ?? null,
      })),
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch attempt details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
