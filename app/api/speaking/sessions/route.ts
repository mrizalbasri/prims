export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    // Get specific session
    if (sessionId) {
      const session = await prisma.speakingSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
        include: {
          scenario: {
            select: {
              title: true,
              description: true,
              type: true,
              level: true,
              prompts: true,
            },
          },
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          session: {
            id: session.id,
            scenario: session.scenario,
            transcriptText: session.transcriptText,
            audioUrl: session.audioUrl,
            feedback: session.aiFeedbackJson,
            scores: {
              fluency: session.fluencyScore,
              pronunciation: session.pronunciationScore,
              grammar: session.grammarScore,
              overall: session.overallScore,
            },
            status: session.status,
            durationSec: session.durationSec,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
          },
        },
        { status: 200 }
      );
    }

    // Get all user sessions
    const limit = parseInt(searchParams.get('limit') || '20');
    const sessions = await prisma.speakingSession.findMany({
      where: { userId: user.id },
      include: {
        scenario: {
          select: {
            title: true,
            type: true,
            level: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(
      {
        sessions: sessions.map((s: any) => ({
          id: s.id,
          scenario: s.scenario,
          overallScore: s.overallScore,
          status: s.status,
          durationSec: s.durationSec,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
        })),
        total: sessions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get speaking sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
