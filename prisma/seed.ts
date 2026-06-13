import 'dotenv/config';
import prisma from '../lib/prisma';
import { vocabularyQuestions, grammarQuestions, readingQuestions, writingPrompts, speakingPrompts } from '../lib/questions';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing questions and prompts...');
  await prisma.question.deleteMany({});
  await prisma.prompt.deleteMany({});

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
    await prisma.prompt.create({
      data: {
        sectionType: prompt.sectionType,
        promptText: prompt.promptText,
        rubric: prompt.rubric || {},
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${writingPrompts.length} writing prompts`);

  // Seed Speaking Prompts
  console.log('🎤 Seeding speaking prompts...');
  for (const prompt of speakingPrompts) {
    await prisma.prompt.create({
      data: {
        sectionType: prompt.sectionType,
        promptText: prompt.promptText,
        rubric: prompt.rubric || {},
        isActive: true,
      },
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
