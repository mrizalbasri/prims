export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all queries in parallel for performance
    const [vocabLearned, writingCount, speakingCount, learningSessions] =
      await Promise.all([
        // Vocab cards that have been reviewed at least once (state != NEW)
        prisma.vocabularyProgress.count({
          where: {
            userId: user.id,
            state: { not: 'NEW' },
          },
        }),

        // Writing submissions (via WritingResponse)
        prisma.writingResponse.count({
          where: { userId: user.id },
        }),

        // Speaking sessions (via SpeakingResponse)
        prisma.speakingResponse.count({
          where: { userId: user.id },
        }),

        // All learning sessions ordered by date for streak calculation
        prisma.learningSession.findMany({
          where: { userId: user.id },
          select: { completedAt: true },
          orderBy: { completedAt: 'desc' },
        }),
      ]);

    // Calculate learning streak (consecutive days)
    const streak = calculateStreak(learningSessions.map((s) => s.completedAt));

    return NextResponse.json({
      vocabLearned,
      writingCount,
      speakingCount,
      streak,
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate the current consecutive-day learning streak.
 * A streak increments for each calendar day (in local time) on which
 * at least one session was completed, counting backwards from today.
 */
function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  // Deduplicate by calendar date string (YYYY-MM-DD)
  const uniqueDays = [
    ...new Set(dates.map((d) => d.toISOString().split('T')[0])),
  ].sort((a, b) => (a > b ? -1 : 1)); // descending

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .split('T')[0];

  // Streak must start from today or yesterday to be "active"
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86_400_000
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
