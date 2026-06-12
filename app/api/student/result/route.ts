import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

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
                aiFeedbackJson: true,
                score: true,
              },
            },
            speakingResponse: {
              select: {
                aiFeedbackJson: true,
                score: true,
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
    const sectionDetails = testAttempt.sectionAttempts.map((section) => ({
      sectionType: section.sectionType,
      rawScore: section.rawScore,
      weightedScore: section.weightedScore,
      feedback:
        section.writingResponse?.aiFeedbackJson ||
        section.speakingResponse?.aiFeedbackJson ||
        null,
    }));

    return NextResponse.json(
      {
        hasResult: true,
        result: {
          testAttemptId: testAttempt.id,
          completedAt: testAttempt.completedAt,
          scores: {
            vocabulary: testAttempt.finalResult.vocabScore,
            grammar: testAttempt.finalResult.grammarScore,
            reading: testAttempt.finalResult.readingScore,
            writing: testAttempt.finalResult.writingScore,
            speaking: testAttempt.finalResult.speakingScore,
            total: testAttempt.finalResult.totalScore,
          },
          level: testAttempt.finalResult.level,
          levelDescription: getLevelDescription(testAttempt.finalResult.level),
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