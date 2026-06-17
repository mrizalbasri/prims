import 'dotenv/config';
import prisma from '../lib/prisma';
import { vocabularyQuestions, grammarQuestions, readingQuestions, writingPrompts, speakingPrompts } from '../lib/questions';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing questions and prompts...');
  await prisma.question.deleteMany({});
  await prisma.question.deleteMany({});

  // Seed Vocabulary Questions
  console.log('📚 Seeding vocabulary questions...');
  for (const question of vocabularyQuestions) {
    await prisma.question.create({
      data: {
        sectionType: question.sectionType,
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        metadata: question.metadata || {},
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${vocabularyQuestions.length} vocabulary questions`);

  // Seed Grammar Questions
  console.log('📝 Seeding grammar questions...');
  for (const question of grammarQuestions) {
    await prisma.question.create({
      data: {
        sectionType: question.sectionType,
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        metadata: question.metadata || {},
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${grammarQuestions.length} grammar questions`);

  // Seed Reading Questions
  console.log('📖 Seeding reading questions...');
  for (const question of readingQuestions) {
    await prisma.question.create({
      data: {
        sectionType: question.sectionType,
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        metadata: question.metadata || {},
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${readingQuestions.length} reading questions`);

  // Seed Writing Prompts
  console.log('✍️  Seeding writing prompts...');
  for (const prompt of writingPrompts) {
    await prisma.writingPrompt.create({
      data: {
        title: prompt.promptText.includes('online learning') ? 'Online vs Traditional Learning' : 'Academic Goals',
        type: 'PARAGRAPH',
        level: 'INTERMEDIATE',
        promptText: prompt.promptText,
        wordCountMin: 100,
        wordCountMax: 150,
        rubric: prompt.rubric,
      }
    });
  }
  console.log(`✅ Created ${writingPrompts.length} writing prompts`);

  // Seed Speaking Prompts
  console.log('🎤 Seeding speaking prompts...');
  for (const prompt of speakingPrompts) {
    let title = 'Speaking Practice';
    let type: 'INTRODUCTION' | 'DISCUSSION' | 'PRESENTATION' = 'DISCUSSION';
    if (prompt.promptText.includes('Introduce yourself')) {
      title = 'Self Introduction';
      type = 'INTRODUCTION';
    } else if (prompt.promptText.includes('challenge you faced')) {
      title = 'Describe a Challenge';
      type = 'DISCUSSION';
    } else if (prompt.promptText.includes('Technology has made')) {
      title = 'Technology in Education';
      type = 'PRESENTATION';
    }
    await prisma.speakingScenario.create({
      data: {
        title,
        description: 'Practice your speaking skills with AI feedback',
        type,
        level: 'INTERMEDIATE',
        promptText: prompt.promptText,
        rubric: prompt.rubric,
        prompts: []
      }
    });
  }
  console.log(`✅ Created ${speakingPrompts.length} speaking prompts`);

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
