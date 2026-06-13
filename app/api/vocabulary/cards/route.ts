export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';



export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user.hasModuleAccess) {
      return NextResponse.json({ error: 'Akses modul terkunci. Butuh token dosen.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as VocabularyCategory | null;
    const difficulty = searchParams.get('difficulty') as QuestionDifficulty | null;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    // Get cards
    const cards = await prisma.vocabularyCard.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get user's progress for these cards
    const cardIds = cards.map((c: any) => c.id);
    const progress = await prisma.vocabularyProgress.findMany({
      where: {
        userId: user.id,
        cardId: { in: cardIds },
      },
    });

    const progressMap = new Map(progress.map((p: any) => [p.cardId, p]));

    // Combine cards with progress
    const cardsWithProgress = cards.map((card: any) => {
      const userProgress: any = progressMap.get(card.id);
      return {
        id: card.id,
        term: card.term,
        meaning: card.meaning,
        exampleSentence: card.exampleSentence,
        pronunciation: card.pronunciation,
        audioUrl: card.audioUrl,
        category: card.category,
        difficulty: card.difficulty,
        metadata: card.metadata,
        progress: userProgress
          ? {
              state: userProgress.state,
              repetitionCount: userProgress.repetitionCount,
              lastReviewedAt: userProgress.lastReviewedAt,
              masteredAt: userProgress.masteredAt,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        cards: cardsWithProgress,
        total: cards.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get vocabulary cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
