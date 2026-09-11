import { Worker, Job } from "bullmq";
import { getRedisConnection, AIScoringJobData } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { scoreWritingWithAI, scoreSpeakingWithAI, finalizeTestResults, calculateWeightedScore } from "@/lib/scoring";
import { SectionType, SectionStatus, ResponseStatus, Prisma } from "@prisma/client";

const conn = getRedisConnection();

if (!conn) {
  console.log("Redis not configured. Background worker is idle.");
}

export const aiWorker = conn
  ? new Worker<AIScoringJobData>(
      "ai-scoring",
      async (job: Job<AIScoringJobData>) => {
        const { data } = job;
        console.log(`[Worker] Processing job ${job.id} of type ${data.type}`);

        switch (data.type) {
          case "TEST_SCORING": {
            const testAttempt = await prisma.testAttempt.findUnique({
              where: { id: data.testAttemptId },
              include: {
                sectionAttempts: {
                  include: {
                    writingResponse: true,
                    speakingResponse: true,
                  },
                },
              },
            });

            if (!testAttempt) break;

            for (const section of testAttempt.sectionAttempts) {
              if (section.sectionType === SectionType.WRITING && section.writingResponse?.content) {
                let promptText = "Respond to the prompt.";
                let rubric = null;
                if (section.feedback) {
                  try {
                    const fb = JSON.parse(section.feedback);
                    promptText = fb.prompt || promptText;
                    rubric = fb.rubric || null;
                  } catch (e) {
                    console.error("Error parsing writing feedback:", e);
                  }
                }

                const { score, feedback } = await scoreWritingWithAI(
                  section.writingResponse.content,
                  promptText,
                  rubric
                );

                await prisma.$transaction([
                  prisma.sectionAttempt.update({
                    where: { id: section.id },
                    data: {
                      rawScore: score,
                      weightedScore: calculateWeightedScore(score, SectionType.WRITING),
                      status: SectionStatus.COMPLETED,
                    },
                  }),
                  prisma.writingResponse.update({
                    where: { id: section.writingResponse.id },
                    data: {
                      feedback: feedback as Prisma.InputJsonValue,
                      wordCount: section.writingResponse.content.trim().split(/\s+/).length,
                    },
                  }),
                ]);
              }

              if (section.sectionType === SectionType.SPEAKING && section.speakingResponse && section.speakingResponse.transcript) {
                let promptText = "Respond to the scenario.";
                let rubric = null;
                if (section.feedback) {
                  try {
                    const fb = JSON.parse(section.feedback);
                    promptText = fb.prompt || promptText;
                    rubric = fb.rubric || null;
                  } catch (e) {
                    console.error("Error parsing speaking feedback:", e);
                  }
                }

                const { score, feedback } = await scoreSpeakingWithAI(
                  section.speakingResponse.transcript,
                  promptText,
                  rubric,
                  section.speakingResponse.audioUrl || undefined
                );

                const finalTranscriptText = feedback?.transcript || (section.speakingResponse.transcript === "(Audio recording submitted)" ? "Transcription completed by AI." : section.speakingResponse.transcript);

                await prisma.$transaction([
                  prisma.sectionAttempt.update({
                    where: { id: section.id },
                    data: {
                      rawScore: score,
                      weightedScore: calculateWeightedScore(score, SectionType.SPEAKING),
                      status: SectionStatus.COMPLETED,
                    },
                  }),
                  prisma.speakingResponse.update({
                    where: { id: section.speakingResponse.id },
                    data: {
                      feedback: feedback as Prisma.InputJsonValue,
                      transcript: finalTranscriptText as string,
                    },
                  }),
                ]);
              }
            }

            await finalizeTestResults(data.testAttemptId);
            break;
          }

          case "WRITING_SCORING": {
            await prisma.writingSubmission.update({
              where: { id: data.submissionId },
              data: { status: ResponseStatus.PROCESSING },
            });

            const { score, feedback } = await scoreWritingWithAI(
              data.responseText,
              data.promptText,
              data.rubric
            );

            const grammarScore = typeof feedback?.grammarScore === 'number' ? feedback.grammarScore : (feedback?.grammar ? 75 : score * 0.9);
            const clarityScore = typeof feedback?.clarityScore === 'number' ? feedback.clarityScore : (feedback?.content ? 80 : score * 0.95);
            const structureScore = typeof feedback?.structureScore === 'number' ? feedback.structureScore : (feedback?.organization ? 70 : score * 0.85);

            await prisma.writingSubmission.update({
              where: { id: data.submissionId },
              data: {
                grammarScore,
                clarityScore,
                structureScore,
                overallScore: score,
                aiFeedbackJson: feedback as Prisma.InputJsonValue,
                status: ResponseStatus.COMPLETED,
                completedAt: new Date(),
              },
            });
            break;
          }

          case "SPEAKING_SCORING": {
            await prisma.speakingSession.update({
              where: { id: data.sessionId },
              data: { status: ResponseStatus.PROCESSING },
            });

            const promptText = `${data.scenarioTitle}\n${data.scenarioDescription}`;
            const { score, feedback } = await scoreSpeakingWithAI(
              data.transcriptText,
              promptText,
              data.rubric,
              data.audioUrl
            );

            const fluencyScore = typeof feedback?.fluencyScore === 'number' ? feedback.fluencyScore : (feedback?.fluency ? 75 : score * 0.9);
            const pronunciationScore = typeof feedback?.pronunciationScore === 'number' ? feedback.pronunciationScore : (feedback?.pronunciation ? 70 : score * 0.85);
            const grammarScore = typeof feedback?.grammarScore === 'number' ? feedback.grammarScore : (feedback?.grammar ? 80 : score * 0.95);
            const finalTranscriptText = feedback?.transcript || (data.transcriptText === "(Audio recording submitted)" ? "Transcription completed by AI." : data.transcriptText);

            await prisma.speakingSession.update({
              where: { id: data.sessionId },
              data: {
                fluencyScore,
                pronunciationScore,
                grammarScore,
                overallScore: score,
                aiFeedbackJson: feedback as Prisma.InputJsonValue,
                transcriptText: finalTranscriptText as string,
                status: ResponseStatus.COMPLETED,
                completedAt: new Date(),
              },
            });
            break;
          }
        }

        console.log(`[Worker] Successfully finished job ${job.id}`);
      },
      {
        connection: conn,
        concurrency: 2,
      }
    )
  : null;

if (aiWorker) {
  aiWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });
}
