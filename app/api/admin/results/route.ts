export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

type StudentWithAttempts = Prisma.UserGetPayload<{
  include: {
    testAttempts: {
      include: {
        finalResult: true;
      };
    };
  };
}>;



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
    const userFilter: Prisma.UserWhereInput = { role: 'STUDENT' };
    if (cohort) userFilter.cohort = cohort;
    if (major) userFilter.major = major;
    if (search) {
      userFilter.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count of filtered students
    const filteredCount = await prisma.user.count({
      where: userFilter,
    });

    // Get students with their attempts
    const students = await prisma.user.findMany({
      where: userFilter,
      include: {
        testAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: {
            finalResult: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
      skip,
      take: limit,
    });

    // Format results with their test status
    const results = students.map((stud: StudentWithAttempts) => {
      const attempt = stud.testAttempts?.[0] || null;
      const rawScores = attempt?.finalResult?.sectionScores
        ? (typeof attempt.finalResult.sectionScores === 'string'
            ? JSON.parse(attempt.finalResult.sectionScores)
            : attempt.finalResult.sectionScores)
        : {};

      const sectionScores = {
        vocabulary: rawScores.VOCABULARY ?? rawScores.vocabulary ?? 0,
        grammar: rawScores.GRAMMAR ?? rawScores.grammar ?? 0,
        listening: rawScores.LISTENING ?? rawScores.listening ?? 0,
        reading: rawScores.READING ?? rawScores.reading ?? 0,
        writing: rawScores.WRITING ?? rawScores.writing ?? 0,
        speaking: rawScores.SPEAKING ?? rawScores.speaking ?? 0,
      };

      let testStatus = "BELUM_MULAI";
      if (attempt) {
        if (attempt.status === "COMPLETED") {
          testStatus = "SELESAI";
        } else if (attempt.status === "IN_PROGRESS" || attempt.status === "PROCESSING") {
          testStatus = "SEDANG_MENGERJAKAN";
        } else if (attempt.status === "FAILED") {
          testStatus = "GAGAL";
        }
      }

      return {
        testAttemptId: attempt?.id || `no-attempt-${stud.id}`,
        student: {
          id: stud.id,
          email: stud.email,
          fullName: stud.fullName,
          major: stud.major,
          cohort: stud.cohort,
        },
        status: testStatus,
        startedAt: attempt?.startedAt || null,
        submittedAt: attempt?.submittedAt || null,
        completedAt: attempt?.completedAt || null,
        scores: attempt?.finalResult
          ? {
              vocabulary: sectionScores.vocabulary || 0,
              grammar: sectionScores.grammar || 0,
              listening: sectionScores.listening || 0,
              reading: sectionScores.reading || 0,
              writing: sectionScores.writing || 0,
              speaking: sectionScores.speaking || 0,
              total: attempt.finalResult.overallScore || 0,
            }
          : null,
        level: attempt?.finalResult?.cefrLevel || null,
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
          cohorts: cohorts.map((c: { cohort: string | null }) => c.cohort).filter(Boolean),
          majors: majors.map((m: { major: string | null }) => m.major).filter(Boolean),
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
