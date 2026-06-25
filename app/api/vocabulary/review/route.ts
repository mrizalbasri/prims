export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { getNextReviewCards, updateCardProgress } from '@/lib/vocabulary';



// GET: Get cards for review
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const cards = await getNextReviewCards(user.id, limit);

    return NextResponse.json(
      {
        cards,
        count: cards.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get review cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Submit card review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, correct } = body;

    if (!cardId || typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: 'cardId and correct (boolean) are required' },
        { status: 400 }
      );
    }

    // Update card progress
    await updateCardProgress(user.id, cardId, correct);

    // Get updated progress
    const progress = await prisma.vocabularyProgress.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
      include: {
        card: true,
      },
    });

    // Create audit log
    await createAuditLog(
      user.id,
      'VOCABULARY_REVIEWED',
      'VocabularyCard',
      cardId,
      { correct, newState: progress?.state }
    );

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        progress: progress
          ? {
              state: progress.state,
              repetitionCount: progress.repetitionCount,
              lastReviewedAt: progress.lastReviewedAt,
              masteredAt: progress.masteredAt,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
