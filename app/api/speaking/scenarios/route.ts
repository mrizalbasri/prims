export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus, SpeakingScenarioType, ProficiencyLevel } from '@prisma/client';
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
    const type = searchParams.get('type') as SpeakingScenarioType | null;
    const level = searchParams.get('level') as ProficiencyLevel | null;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter
    const where: any = { isActive: true };
    if (type) where.type = type;
    if (level) where.level = level;

    // Get scenarios
    const scenarios = await prisma.speakingScenario.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get user's session count for each scenario
    const scenarioIds = scenarios.map((s: any) => s.id);
    const sessions = await prisma.speakingSession.findMany({
      where: {
        userId: user.id,
        scenarioId: { in: scenarioIds },
      },
      select: {
        scenarioId: true,
        id: true,
      },
    });

    const sessionMap = new Map<string, number>();
    sessions.forEach((s: any) => {
      sessionMap.set(s.scenarioId, (sessionMap.get(s.scenarioId) || 0) + 1);
    });

    const scenariosWithStats = scenarios.map((scenario: any) => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      type: scenario.type,
      level: scenario.level,
      prompts: scenario.prompts,
      sessionCount: sessionMap.get(scenario.id) || 0,
    }));

    return NextResponse.json(
      {
        scenarios: scenariosWithStats,
        total: scenarios.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get speaking scenarios error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
