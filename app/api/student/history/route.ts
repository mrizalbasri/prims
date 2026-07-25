export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

interface SectionScores {
  VOCABULARY?: number;
  vocabulary?: number;
  GRAMMAR?: number;
  grammar?: number;
  LISTENING?: number;
  listening?: number;
  READING?: number;
  reading?: number;
  WRITING?: number;
  writing?: number;
  SPEAKING?: number;
  speaking?: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      include: {
        finalResult: true,
      },
      orderBy: { completedAt: 'asc' },
    });

    const history = attempts
      .filter((attempt) => attempt.finalResult !== null)
      .map((attempt, index) => {
        const finalResult = attempt.finalResult!;
        const rawScores = (finalResult.sectionScores || {}) as unknown as SectionScores;
        const scores = {
          vocabulary: rawScores.VOCABULARY ?? rawScores.vocabulary ?? 0,
          grammar: rawScores.GRAMMAR ?? rawScores.grammar ?? 0,
          listening: rawScores.LISTENING ?? rawScores.listening ?? 0,
          reading: rawScores.READING ?? rawScores.reading ?? 0,
          writing: rawScores.WRITING ?? rawScores.writing ?? 0,
          speaking: rawScores.SPEAKING ?? rawScores.speaking ?? 0,
        };

        return {
          attemptId: attempt.id,
          attemptNumber: index + 1,
          completedAt: attempt.completedAt,
          overallScore: finalResult.overallScore,
          level: finalResult.overallLevel,
          cefrLevel: finalResult.cefrLevel,
          scores,
        };
      });

    return NextResponse.json(
      {
        totalAttempts: history.length,
        history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get student history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
