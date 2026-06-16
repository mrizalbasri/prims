export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SpeakingScenarioType, ProficiencyLevel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

/**
 * PUT /api/admin/speaking/[id] - Update an existing speaking scenario
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
      return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 });
    }

    const existing = await prisma.speakingScenario.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Speaking scenario not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, type, level, description, promptText, prompts, rubric } = body;

    if (!title || !description || !type) {
      return NextResponse.json({ error: 'Title, description and type are required' }, { status: 400 });
    }

    const updated = await prisma.speakingScenario.update({
      where: { id },
      data: {
        title: title.trim(),
        type: type as SpeakingScenarioType,
        level: level ? (level as ProficiencyLevel) : null,
        description: description.trim(),
        promptText: promptText ? promptText.trim() : null,
        prompts: Array.isArray(prompts) ? prompts.map(p => p.trim()) : [],
        rubric: rubric || null,
      },
    });

    await createAuditLog(
      user.id,
      'SPEAKING_SCENARIO_UPDATED',
      'SpeakingScenario',
      id,
      { title: updated.title }
    );

    return NextResponse.json(
      {
        message: 'Speaking scenario updated successfully',
        scenario: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update admin speaking scenario error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/speaking/[id] - Hard delete a speaking scenario
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
      return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 });
    }

    const existing = await prisma.speakingScenario.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Speaking scenario not found' }, { status: 404 });
    }

    await prisma.speakingScenario.delete({
      where: { id },
    });

    await createAuditLog(
      user.id,
      'SPEAKING_SCENARIO_DELETED',
      'SpeakingScenario',
      id,
      { title: existing.title }
    );

    return NextResponse.json(
      {
        message: 'Speaking scenario deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admin speaking scenario error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
