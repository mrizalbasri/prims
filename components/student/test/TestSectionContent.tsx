"use client";

import type { Dispatch, SetStateAction } from "react";
import QuestionPanel from "./QuestionPanel";
import type { ListeningGroup, TestSection } from "./types";

type TestSectionContentProps = {
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
  onQuestionClick: (index: number) => void;
};

export default function TestSectionContent({
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
  onQuestionClick,
}: TestSectionContentProps) {
  return (
    <div className="w-full">
      <QuestionPanel
        currentSection={currentSection}
        readingPassage={readingPassage}
        getCleanPrompt={getCleanPrompt}
        answers={answers}
        onAnswerChange={onAnswerChange}
        writingResponse={writingResponse}
        setWritingResponse={setWritingResponse}
        speakingResponse={speakingResponse}
        setSpeakingResponse={setSpeakingResponse}
        audioUrlState={audioUrlState}
        setAudioUrlState={setAudioUrlState}
        setIsUploadingAudio={setIsUploadingAudio}
        listeningGroups={listeningGroups}
        currentListeningGroupIdx={currentListeningGroupIdx}
        setCurrentListeningGroupIdx={setCurrentListeningGroupIdx}
        isSectionComplete={isSectionComplete}
        moveNext={moveNext}
      />
    </div>
  );
}
