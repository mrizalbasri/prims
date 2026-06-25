"use client";

import { useCallback, useMemo } from "react";

type Question = {
  id: string;
  prompt: string;
};

type Section = {
  section: "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking" | "listening";
  durationMinutes: number;
  questions: Question[];
};

type BottomNavBarProps = {
  currentSection: Section;
  answers: Record<string, string>;
  writingResponse: string;
  speakingResponse: string;
  speakingAudioUrl: string | null;
  sectionLabels: Record<string, string>;
  onQuestionClick: (idx: number) => void;
  isUploadingAudio?: boolean;
};

export default function BottomNavBar({
  currentSection,
  answers,
  writingResponse,
  speakingResponse,
  speakingAudioUrl,
  sectionLabels,
  onQuestionClick,
  isUploadingAudio = false,
}: BottomNavBarProps) {
  const isQuestionAnswered = useCallback((q: Question) => {
    if (currentSection.section === "writing") {
      return writingResponse.trim().length > 0;
    }
    if (currentSection.section === "speaking") {
      return speakingResponse.trim().length > 0 || !!speakingAudioUrl;
    }
    const ans = answers[q.id];
    return ans !== undefined && ans !== null && ans.trim().length > 0;
  }, [currentSection.section, answers, writingResponse, speakingResponse, speakingAudioUrl]);

  const answeredCount = useMemo(() => {
    if (currentSection.section === "writing") {
      return writingResponse.trim().length > 0 ? 1 : 0;
    }
    if (currentSection.section === "speaking") {
      return (speakingResponse.trim().length > 0 || !!speakingAudioUrl) ? 1 : 0;
    }
    return currentSection.questions.filter((q) => isQuestionAnswered(q)).length;
  }, [currentSection, isQuestionAnswered, writingResponse, speakingResponse, speakingAudioUrl]);

  const totalQuestions = currentSection.questions.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 py-3.5 px-6 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05),0_-5px_10px_-5px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Section Label & Counter */}
        <div className="flex items-center gap-3.5 select-none w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Seksi Aktif
            </span>
            <span className="font-hanken font-bold text-gray-950 dark:text-white text-sm">
              {sectionLabels[currentSection.section]}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-850 hidden sm:block" />
          <span className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-teal-200/50 dark:border-teal-900/20">
            {answeredCount} / {totalQuestions} Soal Dijawab
          </span>
        </div>

        {/* Question Navigation Numbers */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
          {currentSection.questions.map((q, idx) => {
            const answered = isQuestionAnswered(q);
            return (
              <button
                key={q.id}
                disabled={isUploadingAudio}
                onClick={() => !isUploadingAudio && onQuestionClick(idx)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all border flex-shrink-0 ${
                  isUploadingAudio
                    ? "opacity-40 cursor-not-allowed border-gray-100 dark:border-gray-850 text-gray-400"
                    : answered
                      ? "bg-teal-600 border-teal-700 text-white shadow-sm hover:bg-teal-750 hover:scale-105 cursor-pointer"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-450 hover:border-teal-500 hover:text-teal-600 cursor-pointer"
                }`}
                title={isUploadingAudio ? "Sedang mengunggah audio..." : `Lompat ke soal ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Navigator Legend Info */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-teal-600" />
            <span>Sudah Dijawab</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span>Belum Dijawab</span>
          </div>
        </div>
      </div>
    </div>
  );
}
