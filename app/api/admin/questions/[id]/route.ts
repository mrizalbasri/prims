export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, QuestionDifficulty } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * PUT /api/admin/questions/[id] - Update an existing question
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { sectionType, difficulty, questionText, options, correctAnswer, explanation, metadata } = body;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

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

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        sectionType: sectionType as SectionType,
        difficulty: difficulty as QuestionDifficulty,
        questionText: questionText.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer: correctAnswer.trim(),
        explanation: explanation ? explanation.trim() : null,
        metadata: metadata || null,
      },
    });

    await createAuditLog(
      user.id,
      'QUESTION_UPDATED',
      'Question',
      id,
      { sectionType, difficulty }
    );

    return NextResponse.json(
      {
        message: 'Question updated successfully',
        question: updatedQuestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update admin question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/questions/[id] - Hard delete a question from the database
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Delete question
    await prisma.question.delete({
      where: { id },
    });

    await createAuditLog(
      user.id,
      'QUESTION_DELETED',
      'Question',
      id,
      { sectionType: existingQuestion.sectionType }
    );

    return NextResponse.json(
      {
        message: 'Question deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admin question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
