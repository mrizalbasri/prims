export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { WritingPromptType, ProficiencyLevel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * PUT /api/admin/writing/[id] - Update an existing writing prompt
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
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const existing = await prisma.writingPrompt.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Writing prompt not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, type, level, promptText, wordCountMin, wordCountMax, rubric } = body;

    if (!title || !promptText || !type) {
      return NextResponse.json({ error: 'Title, promptText and type are required' }, { status: 400 });
    }

    const updated = await prisma.writingPrompt.update({
      where: { id },
      data: {
        title: title.trim(),
        type: type as WritingPromptType,
        level: level ? (level as ProficiencyLevel) : null,
        promptText: promptText.trim(),
        wordCountMin: wordCountMin ? parseInt(wordCountMin) : 0,
        wordCountMax: wordCountMax ? parseInt(wordCountMax) : 0,
        rubric: rubric || null,
      },
    });

    await createAuditLog(
      user.id,
      'WRITING_PROMPT_UPDATED',
      'WritingPrompt',
      id,
      { title: updated.title }
    );

    return NextResponse.json(
      {
        message: 'Writing prompt updated successfully',
        prompt: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update admin writing prompt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/writing/[id] - Hard delete a writing prompt
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
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const existing = await prisma.writingPrompt.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Writing prompt not found' }, { status: 404 });
    }

    await prisma.writingPrompt.delete({
      where: { id },
    });

    await createAuditLog(
      user.id,
      'WRITING_PROMPT_DELETED',
      'WritingPrompt',
      id,
      { title: existing.title }
    );

    return NextResponse.json(
      {
        message: 'Writing prompt deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admin writing prompt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
