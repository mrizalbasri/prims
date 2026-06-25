export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { WritingPromptType, ProficiencyLevel, WritingPrompt, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';



export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user.hasModuleAccess) {
      return NextResponse.json({ error: 'Akses modul terkunci. Butuh token dosen.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as WritingPromptType | null;
    const level = searchParams.get('level') as ProficiencyLevel | null;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter
    const where: Prisma.WritingPromptWhereInput = { isActive: true };
    if (type) where.type = type;
    if (level) where.level = level;

    // Get prompts
    const prompts = await prisma.writingPrompt.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get user's submission count for each prompt
    const promptIds = prompts.map((p: WritingPrompt) => p.id);
    const submissions = await prisma.writingSubmission.findMany({
      where: {
        userId: user.id,
        promptId: { in: promptIds },
      },
      select: {
        promptId: true,
        id: true,
      },
    });

    const submissionMap = new Map<string, number>();
    submissions.forEach((s: { id: string; promptId: string }) => {
      submissionMap.set(s.promptId, (submissionMap.get(s.promptId) || 0) + 1);
    });

    const promptsWithStats = prompts.map((prompt: WritingPrompt) => ({
      id: prompt.id,
      title: prompt.title,
      promptText: prompt.promptText,
      type: prompt.type,
      level: prompt.level,
      wordCountMin: prompt.wordCountMin,
      wordCountMax: prompt.wordCountMax,
      submissionCount: submissionMap.get(prompt.id) || 0,
    }));

    return NextResponse.json(
      {
        prompts: promptsWithStats,
        total: prompts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get writing prompts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
