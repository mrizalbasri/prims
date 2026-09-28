export type VocabularyCard = {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  reviewCount: number;
  lastReviewed: string | null;
  nextReview: string | null;
};

export type SessionStats = {
  cardsReviewed: number;
  correctAnswers: number;
  streak: number;
};

export type VocabularyCardApi = {
  id: string;
  term: string;
  meaning: string;
  exampleSentence?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  progress?: {
    repetitionCount?: number;
    lastReviewedAt?: string | null;
  } | null;
};
