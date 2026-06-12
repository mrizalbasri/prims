export type UserRole = "student" | "admin";

export type SectionType =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "writing"
  | "speaking";

export type AttemptStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "processing"
  | "completed"
  | "failed";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  major: string;
  cohort: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  section: SectionType;
  prompt: string;
  options?: string[];
  correctOption?: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  status: AttemptStatus;
  currentSection: SectionType;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  answers: Record<string, string>;
  writingResponse?: string;
  speakingResponse?: string;
}

export interface FinalResult {
  id: string;
  attemptId: string;
  userId: string;
  vocabScore: number;
  grammarScore: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  totalScore: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  computedAt: string;
}
