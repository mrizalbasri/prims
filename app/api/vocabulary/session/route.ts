export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { VocabularySession } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { getVocabularyStats } from '@/lib/vocabulary';



// POST: Start a new vocabulary session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.vocabularySession.create({
      data: {
        userId: user.id,
        startedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'VOCABULARY_SESSION_STARTED',
      'VocabularySession',
      session.id
    );

    return NextResponse.json(
      {
        message: 'Session started',
        session: {
          id: session.id,
          
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Start vocabulary session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: End vocabulary session
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, cardsReviewed, cardsLearned, cardsMastered } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.vocabularySession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.endedAt) {
      return NextResponse.json(
        { error: 'Session already ended' },
        { status: 409 }
      );
    }

    // Calculate duration
    const endedAt = new Date();
    const durationSec = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

    // Update session
    const updatedSession = await prisma.vocabularySession.update({
      where: { id: sessionId },
      data: {
        cardsReviewed: cardsReviewed || 0,
        cardsLearned: cardsLearned || 0,
        cardsMastered: cardsMastered || 0,
        durationSec,
        
      },
    });

    // Create learning session record
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        sectionType: 'VOCABULARY',
        durationSec,
        
        
        
      },
    });

    await createAuditLog(
      user.id,
      'VOCABULARY_SESSION_ENDED',
      'VocabularySession',
      sessionId,
      { cardsReviewed, cardsLearned, cardsMastered, durationSec }
    );

    return NextResponse.json(
      {
        message: 'Session ended',
        session: {
          id: updatedSession.id,
          cardsReviewed: updatedSession.cardsReviewed,
          cardsLearned: updatedSession.cardsLearned,
          cardsMastered: updatedSession.cardsMastered,
          durationSec: updatedSession.durationSec,
          startedAt: updatedSession.startedAt,
          endedAt: updatedSession.endedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('End vocabulary session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get vocabulary statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getVocabularyStats(user.id);

    // Get recent sessions
    const recentSessions = await prisma.vocabularySession.findMany({
      where: {
        userId: user.id,
        endedAt: { not: null },
      },
      orderBy: { endedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(
      {
        stats,
        recentSessions: recentSessions.map((s: VocabularySession) => ({
          id: s.id,
          cardsReviewed: s.cardsReviewed,
          cardsLearned: s.cardsLearned,
          cardsMastered: s.cardsMastered,
          durationSec: s.durationSec,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get vocabulary stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
