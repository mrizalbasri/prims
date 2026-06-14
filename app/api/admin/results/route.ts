export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';



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
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filter conditions
    const userFilter: any = {};
    if (cohort) userFilter.cohort = cohort;
    if (major) userFilter.major = major;
    if (search) {
      userFilter.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for filtered attempts
    const filteredCount = await prisma.testAttempt.count({
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

    // Format results according to FinalResult model schema
    const results = testAttempts.map((attempt: any) => {
      const sectionScores = attempt.finalResult?.sectionScores
        ? (typeof attempt.finalResult.sectionScores === 'string'
            ? JSON.parse(attempt.finalResult.sectionScores)
            : attempt.finalResult.sectionScores)
        : {};

      return {
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
              vocabulary: sectionScores.vocabulary || 0,
              grammar: sectionScores.grammar || 0,
              reading: sectionScores.reading || 0,
              writing: sectionScores.writing || 0,
              speaking: sectionScores.speaking || 0,
              total: attempt.finalResult.overallScore || 0,
            }
          : null,
        level: attempt.finalResult?.cefrLevel || null,
      };
    });

    // Compute global stats (all completed test attempts)
    const totalCount = await prisma.testAttempt.count({
      where: { status: 'COMPLETED' },
    });

    const beginnerCount = await prisma.testAttempt.count({
      where: {
        status: 'COMPLETED',
        finalResult: {
          overallLevel: 'BEGINNER',
        },
      },
    });

    const intermediateCount = await prisma.testAttempt.count({
      where: {
        status: 'COMPLETED',
        finalResult: {
          overallLevel: 'INTERMEDIATE',
        },
      },
    });

    const advancedCount = await prisma.testAttempt.count({
      where: {
        status: 'COMPLETED',
        finalResult: {
          overallLevel: 'ADVANCED',
        },
      },
    });

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
        stats: {
          total: totalCount,
          advanced: advancedCount,
          intermediate: intermediateCount,
          beginner: beginnerCount,
        },
        pagination: {
          page,
          limit,
          total: filteredCount,
          totalPages: Math.ceil(filteredCount / limit),
        },
        filters: {
          cohorts: cohorts.map((c: any) => c.cohort).filter(Boolean),
          majors: majors.map((m: any) => m.major).filter(Boolean),
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
