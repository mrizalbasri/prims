"use client";

import type { Dispatch, SetStateAction } from "react";
import HighlightableText from "@/components/student/HighlightableText";
import ListeningPlayer from "@/components/student/ListeningPlayer";
import SpeakingTestRecorder from "@/components/student/SpeakingTestRecorder";
import type { ListeningGroup, TestSection } from "./types";

type QuestionPanelProps = {
  currentSection: TestSection;
  readingPassage: string | null;
  getCleanPrompt: (prompt: string, sectionType: TestSection["section"]) => string;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  writingResponse: string;
  setWritingResponse: Dispatch<SetStateAction<string>>;
  speakingResponse: string;
  setSpeakingResponse: Dispatch<SetStateAction<string>>;
  audioUrlState: string | null;
  setAudioUrlState: Dispatch<SetStateAction<string | null>>;
  setIsUploadingAudio: Dispatch<SetStateAction<boolean>>;
  listeningGroups: ListeningGroup[];
  currentListeningGroupIdx: number;
  setCurrentListeningGroupIdx: Dispatch<SetStateAction<number>>;
  isSectionComplete: boolean;
  moveNext: (fromTimeout?: boolean) => Promise<void>;
};

type OptionListProps = {
  questionId: string;
  options?: string[];
  selectedAnswer: string | undefined;
  onAnswerChange: (questionId: string, value: string) => void;
};

function OptionList({ questionId, options, selectedAnswer, onAnswerChange }: OptionListProps) {
  if (!options) return null;

  return (
    <div className="grid grid-cols-1 gap-3 pl-0 md:pl-12">
      {options.map((option) => {
        const isSelected = selectedAnswer === option;
        return (
          <label
            key={option}
            className={`group relative flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
              isSelected
                ? "border-teal-500 bg-teal-50/70 dark:bg-teal-500/10"
                : "border-gray-100 hover:border-teal-500/50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            }`}
          >
            <input
              type="radio"
              name={questionId}
              className="peer hidden"
              checked={isSelected}
              onChange={() => onAnswerChange(questionId, option)}
            />
            <div
              className={`mr-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-teal-500 bg-teal-500 text-white"
                  : "border-gray-300 group-hover:border-teal-500 dark:border-gray-650"
              }`}
            >
              {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
            </div>
            <span className={`font-medium ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function QuestionPanel({
  currentSection,
  readingPassage,
  getCleanPrompt,
  answers,
  onAnswerChange,
  writingResponse,
  setWritingResponse,
  speakingResponse,
  setSpeakingResponse,
  audioUrlState,
  setAudioUrlState,
  setIsUploadingAudio,
  listeningGroups,
  currentListeningGroupIdx,
  setCurrentListeningGroupIdx,
  isSectionComplete,
  moveNext,
}: QuestionPanelProps) {
  if (currentSection.section === "reading") {
    return (
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-850 md:p-8 lg:sticky lg:top-24">
          <HighlightableText text={readingPassage ?? ""} key={readingPassage} />
        </div>

        <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto pr-2">
          {currentSection.questions.map((question, index) => (
            <div
              key={question.id}
              id={`q-${index}`}
              className="scroll-mt-24 space-y-6 rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-850 md:p-8"
            >
              <div className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 font-mono text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h2 className="select-none pt-0.5 font-hanken text-lg font-bold leading-relaxed text-gray-900 dark:text-white md:text-xl">
                  {getCleanPrompt(question.prompt, currentSection.section)}
                </h2>
              </div>
              <OptionList questionId={question.id} options={question.options} selectedAnswer={answers[question.id]} onAnswerChange={onAnswerChange} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {currentSection.section === "listening" && listeningGroups.length > 0 && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-500/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-hanken text-lg font-bold text-blue-900 dark:text-blue-100">
              Audio {currentListeningGroupIdx + 1} dari {listeningGroups.length}
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Listening</span>
          </div>
          <ListeningPlayer audioUrl={listeningGroups[currentListeningGroupIdx]?.audioUrl ?? ""} />
        </div>
      )}

      {currentSection.questions.map((question, index) => {
        if (currentSection.section === "listening") {
          const activeGroup = listeningGroups[currentListeningGroupIdx];
          if (!activeGroup || !activeGroup.questions.some((item) => item.id === question.id)) return null;
        }

        return (
          <div
            key={question.id}
            id={`q-${index}`}
            className="scroll-mt-24 space-y-6 rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-850 md:p-8"
          >
            <div className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 font-mono text-sm font-bold text-white">
                {index + 1}
              </span>
              <h2 className="select-none pt-0.5 font-hanken text-lg font-bold leading-relaxed text-gray-900 dark:text-white md:text-xl">
                {question.prompt}
              </h2>
            </div>

            <OptionList questionId={question.id} options={question.options} selectedAnswer={answers[question.id]} onAnswerChange={onAnswerChange} />

            {currentSection.section === "writing" && (
              <div className="space-y-2 pl-0 md:pl-12">
                <textarea
                  value={writingResponse}
                  onChange={(event) => setWritingResponse(event.target.value)}
                  className="min-h-[300px] w-full resize-none rounded-2xl border-2 border-gray-250 bg-gray-50/50 p-6 font-inter text-sm leading-relaxed text-gray-900 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Tulis esai tanggapan Anda di sini secara lengkap..."
                />
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Patuhi batasan penulisan argumen akademik.</span>
                  <span>{writingResponse.trim().split(/\s+/).filter((word) => word.length > 0).length} kata</span>
                </div>
              </div>
            )}

            {currentSection.section === "speaking" && (
              <SpeakingTestRecorder
                text={speakingResponse}
                audioUrl={audioUrlState}
                onChange={(text, url) => {
                  setSpeakingResponse(text);
                  setAudioUrlState(url);
                }}
                onUploadingChange={setIsUploadingAudio}
              />
            )}
          </div>
        );
      })}

      {currentSection.section === "listening" && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={currentListeningGroupIdx === 0}
            onClick={() => {
              setCurrentListeningGroupIdx((previous) => previous - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Audio Sebelumnya
          </button>

          {currentListeningGroupIdx < listeningGroups.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                setCurrentListeningGroupIdx((previous) => previous + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
            >
              Audio Berikutnya
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!isSectionComplete}
              onClick={() => void moveNext(false)}
              className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjut Seksi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
