"use client";

import type { SectionCompletionSummary } from "./testSummary";

type SubmitConfirmationModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  summary: SectionCompletionSummary[];
  onCancel: () => void;
  onConfirm: () => void;
};

export default function SubmitConfirmationModal({
  isOpen,
  isSubmitting,
  summary,
  onCancel,
  onConfirm,
}: SubmitConfirmationModalProps) {
  if (!isOpen) return null;

  const totalQuestions = summary.reduce((total, item) => total + item.total, 0);
  const answeredQuestions = summary.reduce((total, item) => total + item.answered, 0);
  const unansweredQuestions = Math.max(totalQuestions - answeredQuestions, 0);
  const incompleteSections = summary.filter((item) => item.unanswered > 0);
  const isComplete = unansweredQuestions === 0;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-test-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <h2 id="submit-test-title" className="font-hanken text-2xl font-black text-gray-950 dark:text-white">
            Kumpulkan Placement Test?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Setelah dikumpulkan, jawaban tidak bisa diubah. PRISM akan langsung memproses hasil dan memberikan diagnostic feedback dari AI.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div className={`rounded-2xl border p-4 ${isComplete ? "border-teal-200 bg-teal-50 dark:border-teal-900/40 dark:bg-teal-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-500/10"}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Ringkasan Jawaban
                </p>
                <p className="mt-1 font-hanken text-3xl font-black text-gray-950 dark:text-white">
                  {answeredQuestions}/{totalQuestions}
                </p>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-bold ${isComplete ? "bg-teal-600 text-white" : "bg-amber-500 text-white"}`}>
                {isComplete ? "Lengkap" : `${unansweredQuestions} kosong`}
              </div>
            </div>
          </div>

          {incompleteSections.length > 0 && (
            <div className="rounded-2xl border border-gray-150 p-4 dark:border-gray-800">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Seksi Belum Lengkap
              </p>
              <div className="space-y-2">
                {incompleteSections.map((item) => (
                  <div key={item.section} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {item.unanswered} belum dijawab
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-lg">psychology</span>
              <p>
                Review jawaban tidak ditampilkan ulang. Feedback kemampuan akan muncul setelah tes selesai diproses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-6 sm:flex-row sm:justify-end dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 px-5 py-3 font-hanken text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Kembali Kerjakan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-hanken text-sm font-bold text-white transition-all hover:bg-teal-700 hover:shadow-lg disabled:opacity-60"
          >
            {isSubmitting && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            Kumpulkan Tes
          </button>
        </div>
      </div>
    </div>
  );
}
