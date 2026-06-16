export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VocabularyCategory, QuestionDifficulty } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * PUT /api/admin/vocabulary/[id] - Update an existing vocabulary card
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.vocabularyCard.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Vocabulary card not found' }, { status: 404 });
    }

    const body = await request.json();
    const { term, meaning, exampleSentence, pronunciation, category, difficulty } = body;

    if (!term || !meaning) {
      return NextResponse.json({ error: 'Term and meaning are required' }, { status: 400 });
    }

    const updated = await prisma.vocabularyCard.update({
      where: { id },
      data: {
        term: term.trim(),
        meaning: meaning.trim(),
        exampleSentence: exampleSentence ? exampleSentence.trim() : null,
        pronunciation: pronunciation ? pronunciation.trim() : null,
        category: category as VocabularyCategory,
        difficulty: difficulty as QuestionDifficulty,
      },
    });

    await createAuditLog(
      user.id,
      'VOCABULARY_CARD_UPDATED',
      'VocabularyCard',
      id,
      { term: updated.term }
    );

    return NextResponse.json(
      {
        message: 'Vocabulary card updated successfully',
        card: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update admin vocabulary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/vocabulary/[id] - Hard delete a vocabulary card
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const existing = await prisma.vocabularyCard.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Vocabulary card not found' }, { status: 404 });
    }

    await prisma.vocabularyCard.delete({
      where: { id },
    });

    await createAuditLog(
      user.id,
      'VOCABULARY_CARD_DELETED',
      'VocabularyCard',
      id,
      { term: existing.term }
    );

    return NextResponse.json(
      {
        message: 'Vocabulary card deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admin vocabulary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
