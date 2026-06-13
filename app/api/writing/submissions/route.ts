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

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    // Get specific submission
    if (submissionId) {
      const submission = await prisma.writingSubmission.findFirst({
        where: {
          id: submissionId,
          userId: user.id,
        },
        include: {
          prompt: {
            select: {
              title: true,
              promptText: true,
              type: true,
              level: true,
            },
          },
          revisions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          submission: {
            id: submission.id,
            prompt: submission.prompt,
            responseText: submission.responseText,
            wordCount: submission.wordCount,
            feedback: submission.aiFeedbackJson,
            scores: {
              grammar: submission.grammarScore,
              clarity: submission.clarityScore,
              structure: submission.structureScore,
              overall: submission.overallScore,
            },
            status: submission.status,
            revisionCount: submission.revisionCount,
            submittedAt: submission.submittedAt,
            revisions: submission.revisions,
          },
        },
        { status: 200 }
      );
    }

    // Get all user submissions
    const limit = parseInt(searchParams.get('limit') || '20');
    const submissions = await prisma.writingSubmission.findMany({
      where: { userId: user.id },
      include: {
        prompt: {
          select: {
            title: true,
            type: true,
            level: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(
      {
        submissions: submissions.map((s: any) => ({
          id: s.id,
          prompt: s.prompt,
          wordCount: s.wordCount,
          overallScore: s.overallScore,
          status: s.status,
          revisionCount: s.revisionCount,
          submittedAt: s.submittedAt,
        })),
        total: submissions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get writing submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
