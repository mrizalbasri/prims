export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, QuestionDifficulty } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * GET /api/admin/questions - Fetch all questions with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sectionType = searchParams.get('sectionType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    if (sectionType && Object.values(SectionType).includes(sectionType as SectionType)) {
      filter.sectionType = sectionType as SectionType;
    } else if (sectionType === 'ALL' || !sectionType) {
      // Limit to objective sections for this manager
      filter.sectionType = {
        in: [SectionType.VOCABULARY, SectionType.GRAMMAR, SectionType.LISTENING, SectionType.READING]
      };
    }

    if (search) {
      filter.questionText = { contains: search, mode: 'insensitive' };
    }

    const difficulty = searchParams.get('difficulty');
    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    const total = await prisma.question.count({ where: filter });
    const questions = await prisma.question.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch admin questions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/questions - Add a new question to the database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (Array.isArray(body)) {
      // Bulk insert
      const createdQuestions = [];
      for (const item of body) {
        const { sectionType, difficulty, questionText, options, correctAnswer, explanation, metadata } = item;

        // Validation
        if (!sectionType || !difficulty || !questionText || !options || !correctAnswer) {
          return NextResponse.json({ error: 'Missing required fields in one of the questions' }, { status: 400 });
        }

        if (!Object.values(SectionType).includes(sectionType as SectionType)) {
          return NextResponse.json({ error: 'Invalid sectionType' }, { status: 400 });
        }

        if (!Object.values(QuestionDifficulty).includes(difficulty as QuestionDifficulty)) {
          return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        }

        if (!Array.isArray(options) || options.length !== 4) {
          return NextResponse.json({ error: 'Options must be an array of exactly 4 strings' }, { status: 400 });
        }

        if (!options.includes(correctAnswer)) {
          return NextResponse.json({ error: 'Correct answer must match one of the options exactly' }, { status: 400 });
        }

        const newQuestion = await prisma.question.create({
          data: {
            sectionType: sectionType as SectionType,
            difficulty: difficulty as QuestionDifficulty,
            questionText: questionText.trim(),
            options: options.map(opt => opt.trim()),
            correctAnswer: correctAnswer.trim(),
            explanation: explanation ? explanation.trim() : null,
            metadata: metadata || undefined,
            isActive: true,
          },
        });
        createdQuestions.push(newQuestion);
      }

      await createAuditLog(
        user.id,
        'QUESTIONS_BULK_CREATED',
        'Question',
        undefined,
        { count: createdQuestions.length }
      );

      return NextResponse.json(
        {
          message: `${createdQuestions.length} questions created successfully`,
          questions: createdQuestions,
        },
        { status: 201 }
      );
    }

    // Single insert
    const { sectionType, difficulty, questionText, options, correctAnswer, explanation, metadata } = body;

    // Validation
    if (!sectionType || !difficulty || !questionText || !options || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Object.values(SectionType).includes(sectionType as SectionType)) {
      return NextResponse.json({ error: 'Invalid sectionType' }, { status: 400 });
    }

    if (!Object.values(QuestionDifficulty).includes(difficulty as QuestionDifficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json({ error: 'Options must be an array of exactly 4 strings' }, { status: 400 });
    }

    if (!options.includes(correctAnswer)) {
      return NextResponse.json({ error: 'Correct answer must match one of the options exactly' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        sectionType: sectionType as SectionType,
        difficulty: difficulty as QuestionDifficulty,
        questionText: questionText.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer: correctAnswer.trim(),
        explanation: explanation ? explanation.trim() : null,
        metadata: metadata || undefined,
        isActive: true,
      },
    });

    await createAuditLog(
      user.id,
      'QUESTION_CREATED',
      'Question',
      newQuestion.id,
      { sectionType, difficulty }
    );

    return NextResponse.json(
      {
        message: 'Question created successfully',
        question: newQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
