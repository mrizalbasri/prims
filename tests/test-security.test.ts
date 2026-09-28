import { describe, expect, it } from "vitest";
import { SectionStatus, SectionType, TestAttemptStatus } from "@prisma/client";
import {
  isSubmissionLocked,
  findExpiredSection,
} from "@/lib/test-security";

describe("test submission security", () => {
  it("treats processing attempts as locked against duplicate submission", () => {
    expect(isSubmissionLocked(TestAttemptStatus.PROCESSING)).toBe(true);
    expect(isSubmissionLocked(TestAttemptStatus.SUBMITTED)).toBe(true);
    expect(isSubmissionLocked(TestAttemptStatus.COMPLETED)).toBe(true);
    expect(isSubmissionLocked(TestAttemptStatus.IN_PROGRESS)).toBe(false);
  });

  it("detects an unfinished section that exceeded its server-side duration", () => {
    const now = new Date("2026-09-27T10:10:31.000Z");
    const expired = findExpiredSection(
      [
        {
          id: "vocabulary-attempt",
          sectionType: SectionType.VOCABULARY,
          status: SectionStatus.IN_PROGRESS,
          startTime: new Date("2026-09-27T10:00:00.000Z"),
        },
      ],
      { [SectionType.VOCABULARY]: 10 },
      now,
    );

    expect(expired?.sectionType).toBe(SectionType.VOCABULARY);
  });

  it("does not reject completed sections or sections still inside the grace period", () => {
    const now = new Date("2026-09-27T10:10:20.000Z");
    const expired = findExpiredSection(
      [
        {
          id: "vocabulary-attempt",
          sectionType: SectionType.VOCABULARY,
          status: SectionStatus.COMPLETED,
          startTime: new Date("2026-09-27T09:00:00.000Z"),
        },
        {
          id: "grammar-attempt",
          sectionType: SectionType.GRAMMAR,
          status: SectionStatus.IN_PROGRESS,
          startTime: new Date("2026-09-27T10:00:00.000Z"),
        },
      ],
      { [SectionType.GRAMMAR]: 10 },
      now,
    );

    expect(expired).toBeNull();
  });

  it("keeps a timed-out section from being bypassed by direct submit", () => {
    const expired = findExpiredSection([
      {
        id: "timed-out-attempt",
        sectionType: SectionType.READING,
        status: SectionStatus.TIMED_OUT,
        startTime: null,
      },
    ], {
      [SectionType.READING]: 12,
    });

    expect(expired?.status).toBe(SectionStatus.TIMED_OUT);
  });
});
