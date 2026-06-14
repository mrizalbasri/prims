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

    // Build filter conditions
    const userFilter: any = {};
    if (cohort) userFilter.cohort = cohort;
    if (major) userFilter.major = major;

    // Get all completed test attempts with results
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
      orderBy: [
        { user: { cohort: 'asc' } },
        { user: { major: 'asc' } },
        { user: { fullName: 'asc' } },
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
      'Reading Score',
      'Writing Score',
      'Speaking Score',
      'Total Score',
      'Proficiency Level',
    ];

    const csvRows = testAttempts.map((attempt: any) => {
      const sectionScores = attempt.finalResult?.sectionScores
        ? (typeof attempt.finalResult.sectionScores === 'string'
            ? JSON.parse(attempt.finalResult.sectionScores)
            : attempt.finalResult.sectionScores)
        : {};

      return [
        attempt.user.id,
        attempt.user.fullName,
        attempt.user.email,
        attempt.user.cohort || '',
        attempt.user.major || '',
        attempt.status,
        attempt.startedAt?.toISOString() || '',
        attempt.submittedAt?.toISOString() || '',
        attempt.completedAt?.toISOString() || '',
        typeof sectionScores.vocabulary === 'number' ? sectionScores.vocabulary.toFixed(2) : '0.00',
        typeof sectionScores.grammar === 'number' ? sectionScores.grammar.toFixed(2) : '0.00',
        typeof sectionScores.reading === 'number' ? sectionScores.reading.toFixed(2) : '0.00',
        typeof sectionScores.writing === 'number' ? sectionScores.writing.toFixed(2) : '0.00',
        typeof sectionScores.speaking === 'number' ? sectionScores.speaking.toFixed(2) : '0.00',
        attempt.finalResult?.overallScore ? attempt.finalResult.overallScore.toFixed(2) : '0.00',
        attempt.finalResult?.cefrLevel || '',
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
      { cohort, major, count: testAttempts.length }
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
