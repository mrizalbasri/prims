"use client";

import { useState } from "react";
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
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // ponytail: Don't hard-lock the next button; warn students if questions are unanswered but allow proceeding
  const handleButtonClick = () => {
    if (!isSectionComplete && !isLastSection) {
      setShowIncompleteModal(true);
    } else {
      onNext();
    }
  };

  const handleConfirmProceed = () => {
    setShowIncompleteModal(false);
    onNext();
  };

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
              disabled={isUploadingAudio}
              onClick={handleButtonClick}
              className={`font-hanken text-sm font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 text-white ${
                !isSectionComplete && !isLastSection
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
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

      {/* Modal Konfirmasi Soal Belum Terjawab */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-amber-200 dark:border-amber-900/50">
            <div className="mb-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-3xl">help</span>
              <h3 className="font-hanken text-lg font-bold">Masih Ada Soal Kosong</h3>
            </div>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              Anda masih memiliki beberapa pertanyaan yang belum dijawab pada seksi ini. Apakah Anda yakin ingin melanjutkan ke seksi berikutnya?
            </p>
            <p className="mb-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-900/40">
              Catatan: Pertanyaan yang dikosongkan tidak akan mendapatkan poin dan Anda tidak dapat kembali ke seksi ini setelah berpindah.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowIncompleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmProceed}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition"
              >
                Tetap Lanjut
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
