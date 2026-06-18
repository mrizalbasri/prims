export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';



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

    // Build filter conditions
    const userFilter: any = { role: 'STUDENT' };
    if (cohort) userFilter.cohort = cohort;
    if (major) userFilter.major = major;
    if (search) {
      userFilter.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get all students matching criteria
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
      orderBy: [
        { cohort: 'asc' },
        { major: 'asc' },
        { fullName: 'asc' },
      ],
    });

    // Generate CSV content
    const csvHeaders = [
      'Student ID',
      'Full Name',
      'Email',
      'Cohort',
      'Major',
      'Test Status',
      'Started At',
      'Submitted At',
      'Completed At',
      'Vocabulary Score',
      'Grammar Score',
      'Listening Score',
      'Reading Score',
      'Writing Score',
      'Speaking Score',
      'Total Score',
      'Proficiency Level',
    ];

    const csvRows = students.map((stud: any) => {
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

      return [
        stud.id,
        stud.fullName,
        stud.email,
        stud.cohort || '',
        stud.major || '',
        testStatus,
        attempt?.startedAt?.toISOString() || '',
        attempt?.submittedAt?.toISOString() || '',
        attempt?.completedAt?.toISOString() || '',
        typeof sectionScores.vocabulary === 'number' ? sectionScores.vocabulary.toFixed(2) : '0.00',
        typeof sectionScores.grammar === 'number' ? sectionScores.grammar.toFixed(2) : '0.00',
        typeof sectionScores.listening === 'number' ? sectionScores.listening.toFixed(2) : '0.00',
        typeof sectionScores.reading === 'number' ? sectionScores.reading.toFixed(2) : '0.00',
        typeof sectionScores.writing === 'number' ? sectionScores.writing.toFixed(2) : '0.00',
        typeof sectionScores.speaking === 'number' ? sectionScores.speaking.toFixed(2) : '0.00',
        attempt?.finalResult?.overallScore ? attempt.finalResult.overallScore.toFixed(2) : '0.00',
        attempt?.finalResult?.cefrLevel || '',
      ];
    });

    // Build CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any) =>
        row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Create audit log
    await createAuditLog(
      user.id,
      'RESULTS_EXPORTED',
      'TestAttempt',
      undefined,
      { cohort, major, search, count: students.length }
    );

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="prism-results-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
