export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { SpeakingScenarioType, ProficiencyLevel, SpeakingScenario, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

const DEFAULT_READ_ALONG_SCENARIOS = [
  {
    title: '[Read Along] Self Introduction',
    description: 'Read along as the text scrolls to practice your self-introduction pronunciation and pacing.',
    type: 'INTRODUCTION',
    level: 'BEGINNER',
    prompts: [
      'Hello everyone, my name is John. I am a first-year student majoring in Computer Science. I chose this major because I love technology and solving problems. I hope to learn a lot during my time at university and make new friends. Thank you!'
    ],
    rubric: {
      isReadAlong: true,
      targetText: 'Hello everyone, my name is John. I am a first-year student majoring in Computer Science. I chose this major because I love technology and solving problems. I hope to learn a lot during my time at university and make new friends. Thank you!'
    }
  },
  {
    title: '[Read Along] Group Project Discussion',
    description: 'Read along as the text scrolls to practice phrasing and cadence in a collaborative setting.',
    type: 'CONVERSATION',
    level: 'INTERMEDIATE',
    prompts: [
      'I think we should divide the presentation into three main parts. First, we will introduce the problem and explain why it is important. Second, we will discuss the research methods and findings. Finally, we will talk about the limitations and future work. Does anyone have other suggestions?'
    ],
    rubric: {
      isReadAlong: true,
      targetText: 'I think we should divide the presentation into three main parts. First, we will introduce the problem and explain why it is important. Second, we will discuss the research methods and findings. Finally, we will talk about the limitations and future work. Does anyone have other suggestions?'
    }
  },
  {
    title: '[Read Along] Academic Presentation Conclusion',
    description: 'Read along as the text scrolls to practice formal presentation structure, emphasis, and intonation.',
    type: 'PRESENTATION',
    level: 'ADVANCED',
    prompts: [
      'In conclusion, our research demonstrates that utilizing modern AI assistance in language learning significantly enhances student confidence and engagement. However, further studies are necessary to evaluate the long-term impact on grammatical accuracy. Thank you for your time, and I am happy to answer any questions you may have.'
    ],
    rubric: {
      isReadAlong: true,
      targetText: 'In conclusion, our research demonstrates that utilizing modern AI assistance in language learning significantly enhances student confidence and engagement. However, further studies are necessary to evaluate the long-term impact on grammatical accuracy. Thank you for your time, and I am happy to answer any questions you may have.'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user.hasModuleAccess) {
      return NextResponse.json({ error: 'Akses modul terkunci. Butuh token dosen.' }, { status: 403 });
    }

    // ponytail: seed default read-along scenarios dynamically on the fly
    const readAlongCount = await prisma.speakingScenario.count({
      where: {
        title: { startsWith: '[Read Along]' }
      }
    });

    if (readAlongCount === 0) {
      for (const scenario of DEFAULT_READ_ALONG_SCENARIOS) {
        await prisma.speakingScenario.create({
          data: {
            title: scenario.title,
            description: scenario.description,
            type: scenario.type as any,
            level: scenario.level as any,
            prompts: scenario.prompts,
            rubric: scenario.rubric as any,
          }
        });
      }
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SpeakingScenarioType | null;
    const level = searchParams.get('level') as ProficiencyLevel | null;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter
    const where: Prisma.SpeakingScenarioWhereInput = { isActive: true };
    if (type) where.type = type;
    if (level) where.level = level;

    // Get scenarios
    const scenarios = await prisma.speakingScenario.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get user's session count for each scenario
    const scenarioIds = scenarios.map((s: SpeakingScenario) => s.id);
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
    sessions.forEach((s: { id: string; scenarioId: string }) => {
      sessionMap.set(s.scenarioId, (sessionMap.get(s.scenarioId) || 0) + 1);
    });

    const scenariosWithStats = scenarios.map((scenario: SpeakingScenario) => {
      const rubricObj = scenario.rubric as any;
      return {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        type: scenario.type,
        level: scenario.level,
        prompts: scenario.prompts,
        isReadAlong: rubricObj?.isReadAlong === true,
        targetText: rubricObj?.targetText || '',
        sessionCount: sessionMap.get(scenario.id) || 0,
      };
    });

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
