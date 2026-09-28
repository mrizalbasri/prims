export type WritingPrompt = {
  id: string;
  title: string;
  prompt: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minWords: number;
};

export type FeedbackObject = {
  grammar?: string;
  vocabulary?: string;
  content?: string;
  organization?: string;
  suggestions?: string[];
};

export type Submission = {
  id: string;
  score: number;
  scores?: {
    grammar: number;
    clarity: number;
    structure: number;
    overall: number;
  };
  feedback: string | FeedbackObject | null;
  submittedAt: string;
  prompt: { title: string };
};
