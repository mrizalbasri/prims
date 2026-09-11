import { describe, it, expect } from "vitest";
import {
  SECTION_WEIGHTS,
  getProficiencyLevel,
  getCefrLevel,
  calculateTotalScore,
  calculateObjectiveScoreFromData,
  ProficiencyLevel,
} from "@/lib/scoring";
import { SectionType } from "@prisma/client";

describe("Scoring System Tests", () => {
  it("should have section weights totaling exactly 1.0 (100%)", () => {
    const totalWeight =
      SECTION_WEIGHTS.VOCABULARY +
      SECTION_WEIGHTS.GRAMMAR +
      SECTION_WEIGHTS.LISTENING +
      SECTION_WEIGHTS.READING +
      SECTION_WEIGHTS.WRITING +
      SECTION_WEIGHTS.SPEAKING;

    expect(totalWeight).toBeCloseTo(1.0, 5);
  });

  describe("getProficiencyLevel", () => {
    it("should classify scores below 50 as BEGINNER", () => {
      expect(getProficiencyLevel(0)).toBe(ProficiencyLevel.BEGINNER);
      expect(getProficiencyLevel(49.9)).toBe(ProficiencyLevel.BEGINNER);
    });

    it("should classify scores between 50 and 74.9 as INTERMEDIATE", () => {
      expect(getProficiencyLevel(50)).toBe(ProficiencyLevel.INTERMEDIATE);
      expect(getProficiencyLevel(74.5)).toBe(ProficiencyLevel.INTERMEDIATE);
    });

    it("should classify scores 75 and above as ADVANCED", () => {
      expect(getProficiencyLevel(75)).toBe(ProficiencyLevel.ADVANCED);
      expect(getProficiencyLevel(100)).toBe(ProficiencyLevel.ADVANCED);
    });
  });

  describe("getCefrLevel", () => {
    it("should correctly map score brackets to CEFR grades", () => {
      expect(getCefrLevel(20)).toBe("A1");
      expect(getCefrLevel(45)).toBe("A2");
      expect(getCefrLevel(55)).toBe("B1");
      expect(getCefrLevel(70)).toBe("B2");
      expect(getCefrLevel(85)).toBe("C1");
      expect(getCefrLevel(95)).toBe("C2");
    });
  });

  describe("calculateTotalScore", () => {
    it("should correctly compute the weighted score across all 6 sections", () => {
      const scores = {
        vocabulary: 100,
        grammar: 100,
        listening: 100,
        reading: 100,
        writing: 100,
        speaking: 100,
      };

      expect(calculateTotalScore(scores)).toBe(100);
    });

    it("should handle mixed section scores accurately", () => {
      const scores = {
        vocabulary: 80, // 80 * 0.15 = 12
        grammar: 60,    // 60 * 0.15 = 9
        listening: 70,  // 70 * 0.15 = 10.5
        reading: 90,    // 90 * 0.20 = 18
        writing: 85,    // 85 * 0.20 = 17
        speaking: 70,   // 70 * 0.15 = 10.5
      };
      // Total = 12 + 9 + 10.5 + 18 + 17 + 10.5 = 77
      expect(calculateTotalScore(scores)).toBeCloseTo(77, 2);
    });
  });

  describe("calculateObjectiveScoreFromData", () => {
    it("should calculate score percentage from feedback questions and answers", () => {
      const feedback = JSON.stringify({
        questions: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
      });
      const answers = [{ isCorrect: true }, { isCorrect: true }, { isCorrect: false }, { isCorrect: false }];

      expect(calculateObjectiveScoreFromData(feedback, answers)).toBe(50);
    });

    it("should fallback safely if feedback is null or empty", () => {
      const answers = [{ isCorrect: true }, { isCorrect: true }];
      // Fallback default question count is 15 -> (2 / 15) * 100
      expect(calculateObjectiveScoreFromData(null, answers)).toBeCloseTo((2 / 15) * 100, 2);
    });
  });
});
