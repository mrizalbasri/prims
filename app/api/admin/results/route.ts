import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const cohort = searchParams.get('cohort');
    const major = searchParams.get('major');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filter conditions
    const userFilter: any = {};
    if (cohort) userFilter.cohort = cohort;
    if (major) userFilter.major = major;

    // Get total count
    const totalCount = await prisma.testAttempt.count({
      where: {
        status: 'COMPLETED',
        user: userFilter,
      },
    });

    // Get test attempts with results
    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        status: 'COMPLETED',
        user: userFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            major: true,
            cohort: true,
          },
        },
        finalResult: true,
      },
      orderBy: { completedAt: 'desc' },
      skip,
      take: limit,
    });

    // Format results
    const results = testAttempts.map((attempt) => ({
      testAttemptId: attempt.id,
      student: {
        id: attempt.user.id,
        email: attempt.user.email,
        fullName: attempt.user.fullName,
        major: attempt.user.major,
        cohort: attempt.user.cohort,
      },
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      completedAt: attempt.completedAt,
      scores: attempt.finalResult
        ? {
            vocabulary: attempt.finalResult.vocabScore,
            grammar: attempt.finalResult.grammarScore,
            reading: attempt.finalResult.readingScore,
            writing: attempt.finalResult.writingScore,
            speaking: attempt.finalResult.speakingScore,
            total: attempt.finalResult.totalScore,
          }
        : null,
      level: attempt.finalResult?.level || null,
    }));

    // Get unique cohorts and majors for filter options
    const cohorts = await prisma.user.findMany({
      where: { cohort: { not: null } },
      select: { cohort: true },
      distinct: ['cohort'],
    });

    const majors = await prisma.user.findMany({
      where: { major: { not: null } },
      select: { major: true },
      distinct: ['major'],
    });

    return NextResponse.json(
      {
        results,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        filters: {
          cohorts: cohorts.map((c) => c.cohort).filter(Boolean),
          majors: majors.map((m) => m.major).filter(Boolean),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}