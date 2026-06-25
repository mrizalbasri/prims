"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNavBar from "@/components/student/BottomNavBar";
import SectionProgress from "@/components/student/test/SectionProgress";
import SubmitReviewModal from "@/components/student/test/SubmitReviewModal";
import TestHeader from "@/components/student/test/TestHeader";
import TestSectionContent from "@/components/student/test/TestSectionContent";
import { buildCompletionSummary } from "@/components/student/test/testSummary";
import type { SaveStatus, TestQuestion as Question, TestSection as Section } from "@/components/student/test/types";

type StatePayload = {
  attempt: {
    status: string;
    answers: Record<string, string>;
    writingResponse?: string;
    speakingResponse?: string;
    speakingAudioUrl?: string;
  } | null;
  sections: Section[];
};

const sectionLabels: Record<Section["section"], string> = {
  vocabulary: "Vocabulary Assessment",
  grammar: "Grammar Assessment",
  listening: "Listening Comprehension",
  reading: "Reading Comprehension",
  writing: "Academic Essay Writing",
  speaking: "Linguistic Speaking Test",
};

export default function StudentTestPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [currentListeningGroupIdx, setCurrentListeningGroupIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingResponse, setWritingResponse] = useState("");
  const [speakingResponse, setSpeakingResponse] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [audioUrlState, setAudioUrlState] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLoadedTestRef = useRef(false);

  const currentSection = sections[sectionIndex];
  const isLastSection = sectionIndex + 1 === sections.length;

  const [prevSectionIndex, setPrevSectionIndex] = useState(sectionIndex);
  if (sectionIndex !== prevSectionIndex) {
    setPrevSectionIndex(sectionIndex);
    setCurrentListeningGroupIdx(0);
  }

  const readingPassage = useMemo(() => {
    if (!currentSection || currentSection.section !== "reading") return null;
    for (const question of currentSection.questions) {
      const matches = [...question.prompt.matchAll(/"([^"]{50,})"/g)];
      if (matches.length > 0) return matches[0][1];
    }

    const firstQuestion = currentSection.questions[0];
    if (firstQuestion?.prompt.includes('"')) {
      const parts = firstQuestion.prompt.split('"');
      if (parts.length > 2) return parts[1];
    }

    return null;
  }, [currentSection]);

  const getCleanPrompt = useCallback((prompt: string, sectionType: Section["section"]) => {
    if (sectionType !== "reading") return prompt;
    const lastQuoteIndex = prompt.lastIndexOf('"');
    if (lastQuoteIndex !== -1 && lastQuoteIndex < prompt.length - 1) {
      const cleaned = prompt.slice(lastQuoteIndex + 1).trim();
      return cleaned.replace(/^[\s\r\n\-\:\?]+/, "");
    }
    return prompt;
  }, []);

  const listeningGroups = useMemo(() => {
    if (!currentSection || currentSection.section !== "listening") return [];
    const groups: { audioUrl: string; questions: Question[] }[] = [];
    currentSection.questions.forEach((question) => {
      const audioUrl = question.metadata?.audioUrl || "";
      let group = groups.find((item) => item.audioUrl === audioUrl);
      if (!group) {
        group = { audioUrl, questions: [] };
        groups.push(group);
      }
      group.questions.push(question);
    });
    return groups;
  }, [currentSection]);

  const scrollToQuestion = useCallback((index: number) => {
    if (currentSection?.section === "listening") {
      const targetQuestion = currentSection.questions[index];
      if (targetQuestion) {
        const groupIndex = listeningGroups.findIndex((group) => group.questions.some((question) => question.id === targetQuestion.id));
        if (groupIndex !== -1) {
          setCurrentListeningGroupIdx(groupIndex);
          setTimeout(() => {
            document.getElementById(`q-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
          return;
        }
      }
    }

    document.getElementById(`q-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentSection, listeningGroups]);

  useEffect(() => {
    async function bootstrap(): Promise<void> {
      try {
        const startRes = await fetch("/api/test/start", { method: "POST" });
        if (!startRes.ok) {
          if (startRes.status === 401) router.push("/login");
          setError("Unauthorized or failed to start test");
          setIsLoading(false);
          return;
        }

        const stateRes = await fetch("/api/test/state");
        if (!stateRes.ok) {
          setError("Failed to load test state");
          setIsLoading(false);
          return;
        }

        const data = (await stateRes.json()) as StatePayload & { activeSectionIndex?: number };
        const activeIndex = data.activeSectionIndex ?? 0;
        setSections(data.sections);
        setAnswers(data.attempt?.answers ?? {});
        setWritingResponse(data.attempt?.writingResponse ?? "");
        setSpeakingResponse(data.attempt?.speakingResponse ?? "");
        setAudioUrlState(data.attempt?.speakingAudioUrl ?? null);
        setSectionIndex(activeIndex);
        setTimeLeft((data.sections[activeIndex]?.durationMinutes ?? 0) * 60);
        hasLoadedTestRef.current = true;
        setSaveStatus("saved");
      } catch (err) {
        console.error("Test bootstrap error:", err);
        setError("Gagal memuat tes penempatan.");
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, [router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIndex]);

  useEffect(() => {
    if (isLoading || !currentSection) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      const message = "Apakah Anda yakin ingin meninggalkan halaman? Progres ujian Anda saat ini akan dihentikan.";
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoading, currentSection]);

  const progress = useMemo(() => {
    if (sections.length === 0) return 0;
    return Math.round(((sectionIndex + 1) / sections.length) * 100);
  }, [sectionIndex, sections.length]);

  const isSectionComplete = useMemo((): boolean => {
    if (!currentSection) return false;
    if (currentSection.section === "writing") return writingResponse.trim().length > 0;
    if (currentSection.section === "speaking") return speakingResponse.trim().length > 0 || Boolean(audioUrlState);

    return currentSection.questions.every((question) => Boolean(answers[question.id]?.trim()));
  }, [currentSection, answers, writingResponse, speakingResponse, audioUrlState]);

  const currentSectionAnswerStats = useMemo(() => {
    if (!currentSection) return { answered: 0, total: 0, firstUnansweredIndex: -1 };

    if (currentSection.section === "writing") {
      const answered = writingResponse.trim().length > 0 ? 1 : 0;
      return { answered, total: 1, firstUnansweredIndex: answered ? -1 : 0 };
    }

    if (currentSection.section === "speaking") {
      const answered = speakingResponse.trim().length > 0 || Boolean(audioUrlState) ? 1 : 0;
      return { answered, total: 1, firstUnansweredIndex: answered ? -1 : 0 };
    }

    const firstUnansweredIndex = currentSection.questions.findIndex((question) => !answers[question.id]?.trim());
    const answered = currentSection.questions.filter((question) => Boolean(answers[question.id]?.trim())).length;
    return { answered, total: currentSection.questions.length, firstUnansweredIndex };
  }, [answers, audioUrlState, currentSection, speakingResponse, writingResponse]);

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }, []);

  const persist = useCallback(
    async (sectionOverride?: Section["section"]): Promise<boolean> => {
      setSaveStatus("saving");
      setSaveError(null);

      try {
        const saveRes = await fetch("/api/test/save", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            answers,
            writingResponse,
            speakingResponse,
            speakingAudioUrl: audioUrlState,
            currentSection: sectionOverride ?? currentSection?.section,
          }),
        });

        if (!saveRes.ok) throw new Error("Save request failed");

        setSaveStatus("saved");
        return true;
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("error");
        setSaveError("Jawaban belum tersimpan. Cek koneksi lalu coba lagi.");
        return false;
      }
    },
    [answers, writingResponse, speakingResponse, audioUrlState, currentSection],
  );

  useEffect(() => {
    if (!hasLoadedTestRef.current || isLoading || !currentSection) return;

    setSaveStatus("idle");
    const timeoutId = window.setTimeout(() => {
      void persist(currentSection.section);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [answers, writingResponse, speakingResponse, audioUrlState, currentSection, isLoading, persist]);

  const submitTest = useCallback(
    async (): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const saved = await persist(currentSection?.section);
        if (!saved) return;

        const submitRes = await fetch("/api/test/submit", { method: "POST" });
        if (!submitRes.ok) {
          setError("Gagal mensubmit tes.");
          return;
        }
        setIsSubmitModalOpen(false);
        router.push("/student/result");
      } catch (err) {
        console.error("Submit error:", err);
        setError("Gagal mengirimkan ujian.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentSection, persist, router],
  );

  const moveNext = useCallback(
    async (fromTimeout = false): Promise<void> => {
      if (!currentSection) return;

      const nextIndex = sectionIndex + 1;
      const nextSection = sections[nextIndex];
      const saved = await persist(currentSection.section);
      if (!saved && !fromTimeout) return;

      if (!nextSection) {
        if (fromTimeout) {
          await submitTest();
          return;
        }

        setIsSubmitModalOpen(true);
        return;
      }

      setSectionIndex(nextIndex);
      setTimeLeft((nextSection.durationMinutes ?? 0) * 60);
    },
    [currentSection, sectionIndex, sections, persist, submitTest],
  );

  useEffect(() => {
    if (isLoading || !currentSection) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          void moveNext(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentSection, isLoading, moveNext]);

  function formatClock(seconds: number): string {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">Mempersiapkan Lembar Ujian...</p>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return <main className="p-10 text-center font-hanken font-bold text-primary">Seksi tes tidak tersedia.</main>;
  }

  const isTimeUrgent = timeLeft < 120;
  const completionSummary = buildCompletionSummary({
    sections,
    answers,
    writingResponse,
    speakingResponse,
    speakingAudioUrl: audioUrlState,
    sectionLabels,
  });

  const reviewFirstUnanswered = () => {
    setIsSubmitModalOpen(false);
    if (currentSectionAnswerStats.firstUnansweredIndex >= 0) {
      scrollToQuestion(currentSectionAnswerStats.firstUnansweredIndex);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-inter text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <TestHeader
        timeLabel={formatClock(timeLeft)}
        progress={progress}
        isTimeUrgent={isTimeUrgent}
        isSectionComplete={isSectionComplete}
        isUploadingAudio={isUploadingAudio}
        isLastSection={isLastSection}
        onNext={() => void moveNext(false)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 pb-32">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-250 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <SectionProgress
          sectionLabel={sectionLabels[currentSection.section]}
          sectionIndex={sectionIndex}
          totalSections={sections.length}
          answeredCount={currentSectionAnswerStats.answered}
          totalQuestions={currentSectionAnswerStats.total}
          saveStatus={saveStatus}
          onRetrySave={() => void persist(currentSection.section)}
        />

        {saveError && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">cloud_off</span>
              <p className="text-sm font-bold">{saveError}</p>
            </div>
            <button
              type="button"
              onClick={() => void persist(currentSection.section)}
              className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              Coba lagi
            </button>
          </div>
        )}

        <TestSectionContent
          currentSection={currentSection}
          readingPassage={readingPassage}
          getCleanPrompt={getCleanPrompt}
          answers={answers}
          onAnswerChange={handleAnswerChange}
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
          onQuestionClick={scrollToQuestion}
        />
      </main>

      <SubmitReviewModal
        isOpen={isSubmitModalOpen}
        isSubmitting={isSubmitting}
        summary={completionSummary}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={() => void submitTest()}
        onReviewUnanswered={reviewFirstUnanswered}
      />

      <BottomNavBar
        currentSection={currentSection}
        answers={answers}
        writingResponse={writingResponse}
        speakingResponse={speakingResponse}
        speakingAudioUrl={audioUrlState}
        sectionLabels={sectionLabels}
        onQuestionClick={scrollToQuestion}
        isUploadingAudio={isUploadingAudio}
      />
    </div>
  );
}


