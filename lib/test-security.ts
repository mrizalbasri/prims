import { SectionStatus, SectionType, TestAttemptStatus } from "@prisma/client";

export const TEST_TIME_GRACE_SECONDS = 30;

type TimedSection = {
  id: string;
  sectionType: SectionType;
  status: SectionStatus;
  startTime: Date | null;
};

export function isSubmissionLocked(status: TestAttemptStatus): boolean {
  return (
    status === TestAttemptStatus.SUBMITTED ||
    status === TestAttemptStatus.PROCESSING ||
    status === TestAttemptStatus.COMPLETED
  );
}

export function findExpiredSection(
  sections: TimedSection[],
  durations: Partial<Record<SectionType, number>>,
  now = new Date(),
): TimedSection | null {
  for (const section of sections) {
    if (section.status === SectionStatus.TIMED_OUT) {
      return section;
    }
    if (section.status === SectionStatus.COMPLETED || !section.startTime) {
      continue;
    }

    const durationMinutes = durations[section.sectionType];
    if (!durationMinutes) continue;

    const elapsedSeconds = Math.floor(
      (now.getTime() - section.startTime.getTime()) / 1000,
    );
    if (elapsedSeconds > durationMinutes * 60 + TEST_TIME_GRACE_SECONDS) {
      return section;
    }
  }

  return null;
}
