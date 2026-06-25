export type TestSection = {
  section: "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking";
  questions: { id: string }[];
};

export type SectionCompletionSummary = {
  section: TestSection["section"];
  label: string;
  answered: number;
  total: number;
  unanswered: number;
};

type BuildCompletionSummaryArgs = {
  sections: TestSection[];
  answers: Record<string, string>;
  writingResponse: string;
  speakingResponse: string;
  speakingAudioUrl: string | null;
  sectionLabels: Record<TestSection["section"], string>;
};

export function buildCompletionSummary({
  sections,
  answers,
  writingResponse,
  speakingResponse,
  speakingAudioUrl,
  sectionLabels,
}: BuildCompletionSummaryArgs): SectionCompletionSummary[] {
  return sections.map((section) => {
    if (section.section === "writing") {
      const answered = writingResponse.trim().length > 0 ? 1 : 0;
      return {
        section: section.section,
        label: sectionLabels[section.section],
        answered,
        total: 1,
        unanswered: 1 - answered,
      };
    }

    if (section.section === "speaking") {
      const answered = speakingResponse.trim().length > 0 || Boolean(speakingAudioUrl);
      return {
        section: section.section,
        label: sectionLabels[section.section],
        answered: answered ? 1 : 0,
        total: 1,
        unanswered: answered ? 0 : 1,
      };
    }

    const answered = section.questions.filter((question) => {
      const answer = answers[question.id];
      return answer !== undefined && answer !== null && answer.trim().length > 0;
    }).length;

    return {
      section: section.section,
      label: sectionLabels[section.section],
      answered,
      total: section.questions.length,
      unanswered: Math.max(section.questions.length - answered, 0),
    };
  });
}
