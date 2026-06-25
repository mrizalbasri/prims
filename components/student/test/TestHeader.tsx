"use client";

import Logo from "@/components/ui/Logo";

type TestHeaderProps = {
  timeLabel: string;
  progress: number;
  isTimeUrgent: boolean;
  isSectionComplete: boolean;
  isUploadingAudio: boolean;
  isLastSection: boolean;
  onNext: () => void;
};

export default function TestHeader({
  timeLabel,
  progress,
  isTimeUrgent,
  isSectionComplete,
  isUploadingAudio,
  isLastSection,
  onNext,
}: TestHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo className="h-8 w-28" />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <span className="font-inter text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">Placement Test</span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isTimeUrgent
              ? "bg-red-600 border-red-700 text-white animate-pulse shadow-lg shadow-red-500/20"
              : "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400"
          }`}>
            <span className="material-symbols-outlined text-xl">timer</span>
            <span className="font-mono font-black tabular-nums text-lg">{timeLabel}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Progress</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{progress}%</span>
            </div>

            <button
              type="button"
              disabled={!isSectionComplete || isUploadingAudio}
              onClick={onNext}
              className="bg-teal-600 hover:bg-teal-700 text-white font-hanken text-sm font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              title={!isSectionComplete ? "Jawab semua pertanyaan untuk lanjut" : undefined}
            >
              {isUploadingAudio ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengunggah...</span>
                </>
              ) : (
                isLastSection ? "Kirim Ujian" : "Lanjut Seksi"
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800">
        <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    </>
  );
}
