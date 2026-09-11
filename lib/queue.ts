import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

export type AIScoringJobData =
  | { type: "TEST_SCORING"; testAttemptId: string }
  | {
      type: "WRITING_SCORING";
      submissionId: string;
      responseText: string;
      promptText: string;
      rubric: unknown;
    }
  | {
      type: "SPEAKING_SCORING";
      sessionId: string;
      transcriptText: string;
      scenarioTitle: string;
      scenarioDescription: string;
      rubric: unknown;
      audioUrl?: string;
    };

const REDIS_URL = process.env.REDIS_URL;

let redisConnection: Redis | null = null;
let aiScoringQueue: Queue<AIScoringJobData> | null = null;

// ponytail: gracefully detect Redis; fallback to Next.js in-process handler if Redis is not configured
export function isRedisAvailable(): boolean {
  return Boolean(REDIS_URL);
}

export function getRedisConnection(): Redis | null {
  if (!isRedisAvailable()) return null;
  if (!redisConnection) {
    redisConnection = new Redis(REDIS_URL!, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return redisConnection;
}

export function getAIScoringQueue(): Queue<AIScoringJobData> | null {
  const conn = getRedisConnection();
  if (!conn) return null;
  if (!aiScoringQueue) {
    aiScoringQueue = new Queue<AIScoringJobData>("ai-scoring", {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }
  return aiScoringQueue;
}

/**
 * Enqueue an AI scoring job with automatic retry when Redis is active,
 * or gracefully fallback to execution in the current process.
 */
export async function enqueueAIScoring(
  data: AIScoringJobData,
  fallbackExecutor: () => Promise<void>
): Promise<void> {
  const queue = getAIScoringQueue();
  if (queue) {
    try {
      await queue.add(data.type, data);
      return;
    } catch (err) {
      console.warn("BullMQ enqueue failed, executing with fallback:", err);
    }
  }

  // Fallback to in-process execution (Next.js after or promise)
  await fallbackExecutor().catch((err) => {
    console.error(`AI scoring fallback execution failed for ${data.type}:`, err);
  });
}
