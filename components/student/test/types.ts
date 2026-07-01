export type TestSectionKind = "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking";

export type TestQuestion = {
  id: string;
  prompt: string;
  options?: string[];
  metadata?: {
    audioUrl?: string;
    topic?: string;
    skill?: string;
    passage?: string;
  };
};

export type TestSection = {
  section: TestSectionKind;
  durationMinutes: number;
  questions: TestQuestion[];
};

export type ListeningGroup = {
  audioUrl: string;
  questions: TestQuestion[];
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

