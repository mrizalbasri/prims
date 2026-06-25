import type { TestSection } from "./types";

type AnswerSheetProps = {
  section: TestSection;
  answers: Record<string, string>;
  writingResponse: string;
  speakingResponse: string;
  speakingAudioUrl: string | null;
  onQuestionClick: (index: number) => void;
};

function isAnswered(section: TestSection, index: number, answers: Record<string, string>, writingResponse: string, speakingResponse: string, speakingAudioUrl: string | null): boolean {
  if (section.section === "writing") return writingResponse.trim().length > 0;
  if (section.section === "speaking") return speakingResponse.trim().length > 0 || Boolean(speakingAudioUrl);
  const answer = answers[section.questions[index]?.id ?? ""];
  return Boolean(answer?.trim());
}

export default function AnswerSheet({
  section,
  answers,
  writingResponse,
  speakingResponse,
  speakingAudioUrl,
  onQuestionClick,
}: AnswerSheetProps) {
  const items = section.section === "writing" || section.section === "speaking" ? [0] : section.questions.map((_, index) => index);
  const answeredCount = items.filter((index) => isAnswered(section, index, answers, writingResponse, speakingResponse, speakingAudioUrl)).length;
  const unansweredCount = Math.max(items.length - answeredCount, 0);

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="rounded-3xl border border-gray-150 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-hanken text-lg font-black text-gray-950 dark:text-white">Answer Sheet</h2>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {unansweredCount === 0 ? "Semua terisi" : `${unansweredCount} belum dijawab`}
            </p>
          </div>
          <span className="rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
            {answeredCount}/{items.length}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5" aria-label="Navigasi jawaban">
          {items.map((index) => {
            const answered = isAnswered(section, index, answers, writingResponse, speakingResponse, speakingAudioUrl);
            return (
              <button
                key={index}
                type="button"
                onClick={() => onQuestionClick(index)}
                className={`h-10 rounded-2xl border text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
                  answered
                    ? "border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-800/60 dark:bg-teal-500/10 dark:text-teal-300"
                    : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-500/10 dark:text-amber-300"
                }`}
                aria-label={`${section.section === "writing" || section.section === "speaking" ? "Respons" : `Soal ${index + 1}`} ${answered ? "sudah dijawab" : "belum dijawab"}`}
              >
                {section.section === "writing" || section.section === "speaking" ? "1" : index + 1}
              </button>
            );
          })}
        </div>

        {unansweredCount > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-800/50 dark:bg-amber-500/10 dark:text-amber-200">
            Jawaban kosong tetap bisa disubmit, tapi akan memengaruhi hasil level.
          </div>
        )}
      </div>
    </aside>
  );
}
