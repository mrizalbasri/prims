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

    // Get user's completed test attempt with results
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      include: {
        finalResult: true,
        sectionAttempts: {
          include: {
            writingResponse: {
              select: {
                feedback: true,
              },
            },
            speakingResponse: {
              select: {
                feedback: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    if (!testAttempt || !testAttempt.finalResult) {
      return NextResponse.json(
        {
          hasResult: false,
          message: 'No completed test results found',
        },
        { status: 200 }
      );
    }

    // Prepare section details with feedback
    const sectionDetails = testAttempt.sectionAttempts.map((section: any) => ({
      sectionType: section.sectionType,
      rawScore: section.rawScore,
      weightedScore: section.weightedScore,
      feedback:
        section.writingResponse?.feedback ||
        section.speakingResponse?.feedback ||
        null,
    }));

    const rawScores = (testAttempt.finalResult.sectionScores || {}) as any;
    const scores = {
      vocabulary: rawScores.VOCABULARY ?? rawScores.vocabulary ?? 0,
      grammar: rawScores.GRAMMAR ?? rawScores.grammar ?? 0,
      reading: rawScores.READING ?? rawScores.reading ?? 0,
      writing: rawScores.WRITING ?? rawScores.writing ?? 0,
      speaking: rawScores.SPEAKING ?? rawScores.speaking ?? 0,
    };

    return NextResponse.json(
      {
        hasResult: true,
        result: {
          testAttemptId: testAttempt.id,
          completedAt: testAttempt.completedAt,
          scores,
          level: testAttempt.finalResult.overallLevel,
          cefrLevel: testAttempt.finalResult.cefrLevel,
          overallScore: testAttempt.finalResult.overallScore,
          levelDescription: getLevelDescription(testAttempt.finalResult.overallLevel),
          sectionDetails,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get student result error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getLevelDescription(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'Anda memerlukan perhatian ekstra dalam pembelajaran bahasa Inggris. Disarankan untuk mengikuti kelas remedial dan menggunakan platform belajar secara intensif.';
    case 'INTERMEDIATE':
      return 'Anda cukup mampu mengikuti perkuliahan berbahasa Inggris. Terus tingkatkan kemampuan Anda melalui latihan mandiri di platform.';
    case 'ADVANCED':
      return 'Selamat! Anda siap mengikuti perkuliahan yang sepenuhnya menggunakan bahasa Inggris. Pertahankan dan tingkatkan kemampuan Anda.';
    default:
      return 'Level tidak diketahui';
  }
}
