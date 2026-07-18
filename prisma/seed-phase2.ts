import 'dotenv/config';
import prisma from '../lib/prisma';
import { academicVocabularyCards } from '../lib/vocabulary';

async function main() {
  console.log('🌱 Starting Phase 2 database seed...');

  // ============================================
  // VOCABULARY CARDS
  // ============================================
  console.log('🗑️  Clearing existing Phase 2 data...');
  await prisma.vocabularyCard.deleteMany({});
  await prisma.writingPrompt.deleteMany({});
  await prisma.speakingScenario.deleteMany({});

  console.log('📚 Seeding vocabulary cards...');
  
  for (const card of academicVocabularyCards) {
    await prisma.vocabularyCard.create({
      data: {
        term: card.term,
        meaning: card.meaning,
        exampleSentence: card.exampleSentence,
        pronunciation: card.pronunciation,
        audioUrl: card.audioUrl,
        category: card.category,
        difficulty: card.difficulty,
        metadata: card.metadata || {},
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${academicVocabularyCards.length} vocabulary cards`);

  // ============================================
  // WRITING PROMPTS
  // ============================================
  console.log('✍️  Seeding writing prompts...');

  const writingPrompts = [
    {
      title: 'Online vs Traditional Learning',
      promptText: `Write a paragraph (150-200 words) comparing online learning and traditional classroom learning.

Your paragraph should:
- Have a clear topic sentence
- Discuss at least two advantages and disadvantages of each method
- Use appropriate transition words (however, moreover, on the other hand, etc.)
- End with a concluding sentence stating your preference

Focus on academic writing style with formal language.`,
      type: 'PARAGRAPH' as const,
      level: 'INTERMEDIATE' as const,
      wordCountMin: 150,
      wordCountMax: 200,
      rubric: {
        criteria: [
          'Clear topic sentence and conclusion',
          'Balanced comparison with examples',
          'Appropriate use of transition words',
          'Grammar and vocabulary accuracy',
          'Academic writing style',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Technology in Education',
      promptText: `Write an essay (250-300 words) discussing the impact of technology on modern education.

Your essay should include:
- An introduction with a clear thesis statement
- Body paragraphs with supporting arguments and examples
- A conclusion summarizing your main points

Consider both positive and negative impacts of technology in education.`,
      type: 'ESSAY' as const,
      level: 'ADVANCED' as const,
      wordCountMin: 250,
      wordCountMax: 300,
      rubric: {
        criteria: [
          'Clear thesis statement',
          'Well-organized body paragraphs',
          'Strong supporting evidence',
          'Critical analysis',
          'Effective conclusion',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Formal Email to Professor',
      promptText: `Write a formal email (100-150 words) to your professor requesting an extension for an assignment.

Your email should:
- Use appropriate formal greeting and closing
- Clearly state your request
- Provide a valid reason for the extension
- Show respect and professionalism
- Include a proposed new deadline`,
      type: 'EMAIL' as const,
      level: 'INTERMEDIATE' as const,
      wordCountMin: 100,
      wordCountMax: 150,
      rubric: {
        criteria: [
          'Appropriate formal tone',
          'Clear and polite request',
          'Valid reasoning',
          'Professional language',
          'Proper email format',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Research Report Summary',
      promptText: `Write a summary (200-250 words) of a research study you have read or conducted.

Your summary should include:
- The research question or hypothesis
- The methodology used
- Key findings
- Conclusions and implications

Use academic language and maintain objectivity.`,
      type: 'REPORT' as const,
      level: 'ADVANCED' as const,
      wordCountMin: 200,
      wordCountMax: 250,
      rubric: {
        criteria: [
          'Clear research question',
          'Accurate methodology description',
          'Objective presentation of findings',
          'Logical conclusions',
          'Academic writing style',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Personal Academic Goals',
      promptText: `Write a paragraph (100-150 words) describing your academic goals for this semester.

Your paragraph should:
- State your main academic goal clearly
- Explain why this goal is important to you
- Describe specific steps you will take to achieve it
- Use appropriate academic vocabulary`,
      type: 'PARAGRAPH' as const,
      level: 'BEGINNER' as const,
      wordCountMin: 100,
      wordCountMax: 150,
      rubric: {
        criteria: [
          'Clear goal statement',
          'Personal relevance explained',
          'Specific action steps',
          'Appropriate vocabulary',
          'Coherent organization',
        ],
        maxScore: 100,
      },
    },
  ];

  for (const prompt of writingPrompts) {
    await prisma.writingPrompt.create({
      data: prompt,
    });
  }
  console.log(`✅ Created ${writingPrompts.length} writing prompts`);

  // ============================================
  // SPEAKING SCENARIOS
  // ============================================
  console.log('🎤 Seeding speaking scenarios...');

  const speakingScenarios = [
    {
      title: 'Self Introduction',
      description: 'Introduce yourself in an academic setting',
      type: 'INTRODUCTION' as const,
      level: 'BEGINNER' as const,
      prompts: [
        'What is your name and major?',
        'Why did you choose this field of study?',
        'What are your academic interests or career goals?',
      ],
      rubric: {
        criteria: [
          'Clear pronunciation',
          'Appropriate pace and fluency',
          'Relevant content',
          'Grammar accuracy',
          'Confidence in delivery',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Academic Presentation',
      description: 'Present a topic from your field of study',
      type: 'PRESENTATION' as const,
      level: 'INTERMEDIATE' as const,
      prompts: [
        'Introduce your topic and its importance',
        'Explain the main concepts or findings',
        'Discuss the implications or applications',
        'Conclude with key takeaways',
      ],
      rubric: {
        criteria: [
          'Clear structure and organization',
          'Appropriate academic vocabulary',
          'Fluency and coherence',
          'Pronunciation and intonation',
          'Engagement and clarity',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Group Discussion',
      description: 'Participate in an academic discussion',
      type: 'DISCUSSION' as const,
      level: 'INTERMEDIATE' as const,
      prompts: [
        'State your opinion on the topic',
        'Provide supporting arguments or evidence',
        'Respond to counterarguments',
        'Summarize your position',
      ],
      rubric: {
        criteria: [
          'Clear opinion expression',
          'Logical argumentation',
          'Interactive language use',
          'Grammar and vocabulary',
          'Critical thinking',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Job Interview Practice',
      description: 'Practice answering common interview questions',
      type: 'INTERVIEW' as const,
      level: 'ADVANCED' as const,
      prompts: [
        'Tell me about yourself and your background',
        'What are your strengths and weaknesses?',
        'Why are you interested in this position?',
        'Where do you see yourself in five years?',
      ],
      rubric: {
        criteria: [
          'Professional language use',
          'Confident delivery',
          'Relevant and specific answers',
          'Grammar and vocabulary accuracy',
          'Appropriate tone and formality',
        ],
        maxScore: 100,
      },
    },
    {
      title: 'Casual Academic Conversation',
      description: 'Have a casual conversation about academic life',
      type: 'CONVERSATION' as const,
      level: 'BEGINNER' as const,
      prompts: [
        'How is your semester going so far?',
        'What is your favorite subject and why?',
        'What challenges are you facing in your studies?',
        'What do you do to relax after studying?',
      ],
      rubric: {
        criteria: [
          'Natural conversational flow',
          'Appropriate informal language',
          'Fluency and spontaneity',
          'Grammar basics',
          'Engagement and responsiveness',
        ],
        maxScore: 100,
      },
    },
  ];

  for (const scenario of speakingScenarios) {
    await prisma.speakingScenario.create({
      data: scenario,
    });
  }
  console.log(`✅ Created ${speakingScenarios.length} speaking scenarios`);

  console.log('✨ Phase 2 database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Phase 2 database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
