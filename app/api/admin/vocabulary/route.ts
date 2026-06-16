export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VocabularyCategory, QuestionDifficulty } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * GET /api/admin/vocabulary - Fetch all vocabulary cards with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    if (category && Object.values(VocabularyCategory).includes(category as VocabularyCategory)) {
      filter.category = category as VocabularyCategory;
    }

    if (search) {
      filter.OR = [
        { term: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.vocabularyCard.count({ where: filter });
    const cards = await prisma.vocabularyCard.findMany({
      where: filter,
      orderBy: { term: 'asc' },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        cards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch admin vocabulary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/vocabulary - Add a new vocabulary card
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { term, meaning, exampleSentence, pronunciation, category, difficulty } = body;

    if (!term || !meaning) {
      return NextResponse.json({ error: 'Term and meaning are required' }, { status: 400 });
    }

    const newCard = await prisma.vocabularyCard.create({
      data: {
        term: term.trim(),
        meaning: meaning.trim(),
        exampleSentence: exampleSentence ? exampleSentence.trim() : null,
        pronunciation: pronunciation ? pronunciation.trim() : null,
        category: (category && Object.values(VocabularyCategory).includes(category as VocabularyCategory))
          ? (category as VocabularyCategory)
          : VocabularyCategory.GENERAL,
        difficulty: (difficulty && Object.values(QuestionDifficulty).includes(difficulty as QuestionDifficulty))
          ? (difficulty as QuestionDifficulty)
          : QuestionDifficulty.MEDIUM,
        isActive: true,
      },
    });

    await createAuditLog(
      user.id,
      'VOCABULARY_CARD_CREATED',
      'VocabularyCard',
      newCard.id,
      { term: newCard.term }
    );

    return NextResponse.json(
      {
        message: 'Vocabulary card created successfully',
        card: newCard,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin vocabulary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
