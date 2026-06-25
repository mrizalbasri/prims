import type { SectionCompletionSummary } from "./testSummary";

type SubmitReviewModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  summary: SectionCompletionSummary[];
  onCancel: () => void;
  onConfirm: () => void;
  onReviewUnanswered: () => void;
};

export default function SubmitReviewModal({
  isOpen,
  isSubmitting,
  summary,
  onCancel,
  onConfirm,
  onReviewUnanswered,
}: SubmitReviewModalProps) {
  if (!isOpen) return null;

  const totalQuestions = summary.reduce((total, item) => total + item.total, 0);
  const answeredQuestions = summary.reduce((total, item) => total + item.answered, 0);
  const unansweredQuestions = Math.max(totalQuestions - answeredQuestions, 0);
  const incompleteSections = summary.filter((item) => item.unanswered > 0);
  const isComplete = unansweredQuestions === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/70 px-4 py-6 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="submit-review-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-100 bg-gradient-to-br from-white to-blue-50/80 p-6 dark:border-gray-850 dark:from-gray-950 dark:to-blue-950/30">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${isComplete ? "bg-teal-500 text-white" : "bg-amber-500 text-white"}`}>
              <span className="material-symbols-outlined">{isComplete ? "verified" : "warning"}</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Review sebelum submit</p>
              <h2 id="submit-review-title" className="mt-1 font-hanken text-2xl font-black text-gray-950 dark:text-white">
                {isComplete ? "Jawaban siap dikirim" : "Masih ada jawaban kosong"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-350">
                Periksa ringkasan ini sebelum mengakhiri tes. Setelah submit, jawaban tidak bisa diubah lagi.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-150 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Item</p>
              <p className="mt-1 font-hanken text-2xl font-black text-gray-950 dark:text-white">{totalQuestions}</p>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800/50 dark:bg-teal-500/10">
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">Terjawab</p>
              <p className="mt-1 font-hanken text-2xl font-black text-teal-800 dark:text-teal-200">{answeredQuestions}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-500/10">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Kosong</p>
              <p className="mt-1 font-hanken text-2xl font-black text-amber-800 dark:text-amber-200">{unansweredQuestions}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-150 dark:border-gray-800">
            {summary.map((item) => (
              <div key={item.section} className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-850">
                <div>
                  <p className="font-hanken text-sm font-black text-gray-900 dark:text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{item.answered} dari {item.total} terisi</p>
                </div>
                <span className={`rounded-xl px-3 py-1.5 text-xs font-black ${item.unanswered === 0 ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                  {item.unanswered === 0 ? "Lengkap" : `${item.unanswered} kosong`}
                </span>
              </div>
            ))}
          </div>

          {incompleteSections.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-500/10 dark:text-amber-100">
              <p className="font-black">Saran: review jawaban kosong dulu.</p>
              <p className="mt-1 leading-6">Kamu tetap bisa submit, tetapi item kosong dapat menurunkan akurasi hasil placement.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-850 dark:bg-gray-900 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-850"
          >
            Kembali ke tes
          </button>
          {!isComplete && (
            <button
              type="button"
              onClick={onReviewUnanswered}
              disabled={isSubmitting}
              className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-black text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60 dark:border-amber-800/60 dark:bg-amber-500/10 dark:text-amber-200"
            >
              Review yang kosong
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-60"
          >
            {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            Submit final
          </button>
        </div>
      </div>
    </div>
  );
}
