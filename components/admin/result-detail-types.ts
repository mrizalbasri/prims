export interface DetailData {
  testAttemptId: string;
  student: {
    id: string;
    email: string;
    fullName: string;
    major: string;
    cohort: string;
    allowRetake: boolean;
  };
  status: string;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  } | null;
  level: string | null;
  writing: {
    content: string;
    feedback: {
      overall?: string;
      suggestions?: string[];
    } | string | null;
    score: number;
  } | null;
  speaking: {
    audioUrl: string | null;
    transcript: string;
    feedback: {
      overall?: string;
      pronunciation?: string;
      fluency?: string;
    } | string | null;
    score: number;
  } | null;
  history?: {
    testAttemptId: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
    score: number | null;
    level: string | null;
  }[];
}
