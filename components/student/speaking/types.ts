export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: {
        isFinal: boolean;
        [index: number]: { transcript: string };
      };
    };
  }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export type FeedbackObject = {
  grammar?: string;
  vocabulary?: string;
  content?: string;
  fluency?: string;
  suggestions?: string[];
};

export type SpeakingScenario = {
  id: string;
  title: string;
  scenario: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  description?: string;
  isReadAlong?: boolean;
  targetText?: string;
};

export type Session = {
  id: string;
  score: number;
  scores?: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    overall: number;
  };
  feedback: string | FeedbackObject | null;
  submittedAt: string;
  scenario: {
    title: string;
  };
};

export type SessionApi = Partial<Session> & {
  overallScore?: number;
};
