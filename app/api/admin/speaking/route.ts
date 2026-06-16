export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SpeakingScenarioType, ProficiencyLevel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * GET /api/admin/speaking - Fetch all speaking scenarios
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

    if (type && Object.values(SpeakingScenarioType).includes(type as SpeakingScenarioType)) {
      filter.type = type as SpeakingScenarioType;
    }

    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.speakingScenario.count({ where: filter });
    const scenarios = await prisma.speakingScenario.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        scenarios,
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
    console.error('Fetch admin speaking scenarios error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/speaking - Add a new speaking scenario
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, level, description, promptText, prompts, rubric } = body;

    if (!title || !description || !type) {
      return NextResponse.json({ error: 'Title, description and type are required' }, { status: 400 });
    }

    const newScenario = await prisma.speakingScenario.create({
      data: {
        title: title.trim(),
        type: type as SpeakingScenarioType,
        level: level ? (level as ProficiencyLevel) : null,
        description: description.trim(),
        promptText: promptText ? promptText.trim() : null,
        prompts: Array.isArray(prompts) ? prompts.map(p => p.trim()) : [],
        rubric: rubric || null,
        isActive: true,
      },
    });

    await createAuditLog(
      user.id,
      'SPEAKING_SCENARIO_CREATED',
      'SpeakingScenario',
      newScenario.id,
      { title: newScenario.title }
    );

    return NextResponse.json(
      {
        message: 'Speaking scenario created successfully',
        scenario: newScenario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin speaking scenario error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
