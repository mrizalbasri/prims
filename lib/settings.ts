import { prisma } from "@/lib/prisma";
import { SectionType } from "@prisma/client";

export const DEFAULT_QUESTIONS_COUNT: Record<SectionType, number> = {
  VOCABULARY: 15,
  GRAMMAR: 15,
  LISTENING: 10,
  READING: 10,
  WRITING: 1,
  SPEAKING: 1,
};

export const DEFAULT_DURATIONS: Record<SectionType, number> = {
  VOCABULARY: 8,
  GRAMMAR: 8,
  LISTENING: 10,
  READING: 12,
  WRITING: 10,
  SPEAKING: 7,
};

export type TestSettings = {
  counts: Record<SectionType, number>;
  durations: Record<SectionType, number>;
};

export async function getTestSettings(): Promise<TestSettings> {
  try {
    const settings = await prisma.systemSetting.findMany();
    const counts = { ...DEFAULT_QUESTIONS_COUNT };
    const durations = { ...DEFAULT_DURATIONS };

    for (const s of settings) {
      if (s.key.endsWith("_count")) {
        const rawSection = s.key.replace("_count", "").toUpperCase();
        if (rawSection in SectionType) {
          const section = rawSection as SectionType;
          counts[section] = parseInt(s.value) || DEFAULT_QUESTIONS_COUNT[section];
        }
      } else if (s.key.endsWith("_duration")) {
        const rawSection = s.key.replace("_duration", "").toUpperCase();
        if (rawSection in SectionType) {
          const section = rawSection as SectionType;
          durations[section] = parseInt(s.value) || DEFAULT_DURATIONS[section];
        }
      }
    }

    return { counts, durations };
  } catch (e) {
    console.warn("Could not load settings from DB, returning defaults:", e);
    return { counts: DEFAULT_QUESTIONS_COUNT, durations: DEFAULT_DURATIONS };
  }
}
