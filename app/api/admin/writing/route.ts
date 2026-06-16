export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { WritingPromptType, ProficiencyLevel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * GET /api/admin/writing - Fetch all writing prompts
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    if (type && Object.values(WritingPromptType).includes(type as WritingPromptType)) {
      filter.type = type as WritingPromptType;
    }

    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { promptText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.writingPrompt.count({ where: filter });
    const prompts = await prisma.writingPrompt.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        prompts,
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
    console.error('Fetch admin writing prompts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/writing - Add a new writing prompt
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, level, promptText, wordCountMin, wordCountMax, rubric } = body;

    if (!title || !promptText || !type) {
      return NextResponse.json({ error: 'Title, promptText and type are required' }, { status: 400 });
    }

    const newPrompt = await prisma.writingPrompt.create({
      data: {
        title: title.trim(),
        type: type as WritingPromptType,
        level: level ? (level as ProficiencyLevel) : null,
        promptText: promptText.trim(),
        wordCountMin: wordCountMin ? parseInt(wordCountMin) : 0,
        wordCountMax: wordCountMax ? parseInt(wordCountMax) : 0,
        rubric: rubric || null,
        isActive: true,
      },
    });

    await createAuditLog(
      user.id,
      'WRITING_PROMPT_CREATED',
      'WritingPrompt',
      newPrompt.id,
      { title: newPrompt.title }
    );

    return NextResponse.json(
      {
        message: 'Writing prompt created successfully',
        prompt: newPrompt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin writing prompt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
