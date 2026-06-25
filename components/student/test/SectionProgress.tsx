import type { SaveStatus } from "./types";

type SectionProgressProps = {
  sectionLabel: string;
  sectionIndex: number;
  totalSections: number;
  answeredCount: number;
  totalQuestions: number;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
};

const saveStatusCopy: Record<SaveStatus, { icon: string; label: string; className: string }> = {
  idle: {
    icon: "cloud_done",
    label: "Siap menyimpan otomatis",
    className: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-850 border-gray-200 dark:border-gray-700",
  },
  saving: {
    icon: "cloud_sync",
    label: "Menyimpan jawaban...",
    className: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800/40",
  },
  saved: {
    icon: "cloud_done",
    label: "Tersimpan",
    className: "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-800/40",
  },
  error: {
    icon: "cloud_off",
    label: "Gagal menyimpan",
    className: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800/40",
  },
};

export default function SectionProgress({
  sectionLabel,
  sectionIndex,
  totalSections,
  answeredCount,
  totalQuestions,
  saveStatus,
  onRetrySave,
}: SectionProgressProps) {
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);
  const completionPercent = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);
  const status = saveStatusCopy[saveStatus];

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-blue-200/70 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-800/40 dark:bg-blue-500/10 dark:text-blue-300">
              {sectionLabel}
            </span>
            <span className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-gray-850 dark:text-gray-350">
              Seksi {sectionIndex + 1} dari {totalSections}
            </span>
          </div>
          <div>
            <h1 className="font-hanken text-2xl font-black text-gray-950 dark:text-white">Pantau progres sebelum lanjut</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {unansweredCount === 0
                ? "Semua jawaban di seksi ini sudah terisi."
                : `${unansweredCount} item belum terisi. Gunakan answer sheet untuk lompat cepat.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:min-w-72">
          <div className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-250">
            <span>{answeredCount}/{totalQuestions} terjawab</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800" aria-label={`Progress ${completionPercent}%`}>
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${status.className}`} aria-live="polite">
              <span className={`material-symbols-outlined text-sm ${saveStatus === "saving" ? "animate-spin" : ""}`}>{status.icon}</span>
              {status.label}
            </span>
            {saveStatus === "error" && (
              <button
                type="button"
                onClick={onRetrySave}
                className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-red-800/50 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                Coba lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


