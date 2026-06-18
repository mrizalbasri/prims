import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
  const attemptId = 'cmqgce70x000rykv9pt8c2ndt';
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      sectionAttempts: {
        include: {
          objectiveAnswers: true,
        }
      }
    }
  });

  if (!attempt) {
    console.log("Attempt not found");
    return;
  }

  for (const sec of attempt.sectionAttempts) {
    console.log(`\n================ SECTION: ${sec.sectionType} ================`);
    if (!sec.feedback) {
      console.log("No feedback JSON (questions) stored!");
      continue;
    }
    const feedback = JSON.parse(sec.feedback);
    const questions = feedback.questions || [];
    console.log(`Total questions in feedback: ${questions.length}`);
    for (const q of questions) {
      const userAns = sec.objectiveAnswers.find(a => a.questionId === q.id);
      console.log(`Question ID: ${q.id}`);
      console.log(`  Prompt: ${q.questionText}`);
      console.log(`  Options: ${q.options.join(' | ')}`);
      console.log(`  Correct Answer: "${q.correctAnswer}"`);
      if (userAns) {
        console.log(`  User Selected:  "${userAns.selectedOption}"`);
        console.log(`  Is Marked Correct: ${userAns.isCorrect} (Score: ${userAns.score})`);
      } else {
        console.log(`  User Selected:  [NO ANSWER]`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
