"use client";
export const dynamic = 'force-dynamic';


import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Question = {
  id: string;
  prompt: string;
  options?: string[];
};

type Section = {
  section: "vocabulary" | "grammar" | "reading" | "writing" | "speaking";
  durationMinutes: number;
  questions: Question[];
};

type StatePayload = {
  attempt: {
    status: string;
    answers: Record<string, string>;
    writingResponse?: string;
    speakingResponse?: string;
  } | null;
  sections: Section[];
};

const sectionLabels: Record<Section["section"], string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export default function StudentTestPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingResponse, setWritingResponse] = useState("");
  const [speakingResponse, setSpeakingResponse] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentSection = sections[sectionIndex];

  useEffect(() => {
    async function bootstrap(): Promise<void> {
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

      const data = (await stateRes.json()) as StatePayload;
      setSections(data.sections);
      setAnswers(data.attempt?.answers ?? {});
      setWritingResponse(data.attempt?.writingResponse ?? "");
      setSpeakingResponse(data.attempt?.speakingResponse ?? "");
      setSectionIndex(0);
      setTimeLeft((data.sections[0]?.durationMinutes ?? 0) * 60);
      setIsLoading(false);
    }

    void bootstrap();
  }, [router]);

  const progress = useMemo(() => {
    if (sections.length === 0) return 0;
    return Math.round(((sectionIndex + 1) / sections.length) * 100);
  }, [sectionIndex, sections.length]);

  const persist = useCallback(
    async (sectionOverride?: Section["section"]): Promise<void> => {
      setIsSaving(true);
      await fetch("/api/test/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers,
          writingResponse,
          speakingResponse,
          currentSection: sectionOverride ?? currentSection?.section,
        }),
      });
      setIsSaving(false);
    },
    [answers, writingResponse, speakingResponse, currentSection?.section],
  );

  const moveNext = useCallback(
    async (fromTimeout = false): Promise<void> => {
      if (!currentSection) return;

      const nextIndex = sectionIndex + 1;
      const nextSection = sections[nextIndex];

      await persist(nextSection?.section);

      if (!nextSection) {
        const confirmSubmit = fromTimeout
          ? true
          : window.confirm(
              "Submit final test now? This action cannot be undone.",
            );

        if (!confirmSubmit) return;

        const submitRes = await fetch("/api/test/submit", { method: "POST" });
        if (!submitRes.ok) {
          setError("Failed to submit test");
          return;
        }

        router.push("/student/result");
        return;
      }

      setSectionIndex(nextIndex);
      setTimeLeft(nextSection.durationMinutes * 60);
    },
    [currentSection, sectionIndex, sections, persist, router],
  );

  useEffect(() => {
    if (isLoading || !currentSection) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void moveNext(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentSection, isLoading, moveNext]);

  function formatClock(seconds: number): string {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-primary">Memuat Tes...</p>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return <main className="p-10">No test section available.</main>;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</span>
            <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>
            <span className="font-inter text-sm font-medium text-on-surface-variant hidden sm:block">Placement Test</span>
          </div>
          
          <div className="flex items-center gap-4 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
            <span className="material-symbols-outlined text-primary text-xl">timer</span>
            <span className="font-jetbrains font-bold text-primary tabular-nums text-lg">
              {formatClock(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Progress</p>
              <p className="font-jetbrains font-bold text-primary text-sm">{progress}%</p>
            </div>
            <button 
              onClick={() => void moveNext(false)}
              className="bg-secondary text-on-secondary font-hanken text-sm font-bold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all"
            >
              {sectionIndex + 1 === sections.length ? "Selesai" : "Lanjut"}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar (Thin) */}
      <div className="h-1 w-full bg-surface-container-high">
        <div 
          className="h-full bg-secondary transition-all duration-1000" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <main className="flex-1 max-w-container-max mx-auto w-full px-margin-mobile md:px-gutter py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content: Questions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
             <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-jetbrains">
               {sectionLabels[currentSection.section]}
             </span>
             {isSaving && <span className="text-[10px] text-on-surface-variant italic animate-pulse">Menyimpan otomatis...</span>}
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {currentSection.questions.map((question, idx) => (
              <div key={question.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 md:p-8 shadow-sm">
                <div className="flex gap-4 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-jetbrains font-bold text-sm">
                    {idx + 1}
                  </span>
                  <h2 className="font-hanken text-lg md:text-xl font-bold text-primary leading-relaxed pt-0.5">
                    {question.prompt}
                  </h2>
                </div>

                {question.options && (
                  <div className="grid grid-cols-1 gap-3 ml-0 md:ml-12">
                    {question.options.map((option) => (
                      <label 
                        key={option}
                        className={`group relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          answers[question.id] === option 
                          ? "border-secondary bg-secondary/5" 
                          : "border-outline-variant hover:border-secondary/50"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={question.id}
                          className="peer hidden"
                          checked={answers[question.id] === option}
                          onChange={() => setAnswers(prev => ({ ...prev, [question.id]: option }))}
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                          answers[question.id] === option 
                          ? "border-secondary bg-secondary" 
                          : "border-outline-variant group-hover:border-secondary"
                        }`}>
                          <span className={`material-symbols-outlined text-on-secondary text-sm transition-opacity ${
                            answers[question.id] === option ? "opacity-100" : "opacity-0"
                          }`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                        <span className={`font-inter font-medium ${answers[question.id] === option ? "text-primary" : "text-on-surface-variant"}`}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {currentSection.section === "writing" && (
                  <textarea
                    value={writingResponse}
                    onChange={(e) => setWritingResponse(e.target.value)}
                    className="w-full min-h-[300px] p-6 rounded-xl border-2 border-outline-variant focus:border-secondary focus:ring-0 transition-all font-inter bg-surface-bright resize-none"
                    placeholder="Ketik jawaban esai Anda di sini..."
                  />
                )}

                {currentSection.section === "speaking" && (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-low">
                    <span className="material-symbols-outlined text-6xl text-secondary mb-4">mic</span>
                    <p className="font-hanken font-bold text-primary mb-2">Rekam Jawaban Lisan</p>
                    <p className="font-inter text-sm text-on-surface-variant text-center max-w-xs mb-6">Pastikan mikrofon Anda aktif. Klik tombol di bawah untuk mulai merekam.</p>
                    <textarea
                      value={speakingResponse}
                      onChange={(e) => setSpeakingResponse(e.target.value)}
                      className="w-full mt-4 p-4 rounded-lg border border-outline-variant font-jetbrains text-xs"
                      placeholder="Atau ketik transkrip di sini (fallback)..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Navigation Map */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 sticky top-28 shadow-sm">
            <h3 className="font-hanken text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">map</span>
              Navigator Soal
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Struktur Tes</p>
                <div className="space-y-2">
                  {sections.map((sec, idx) => (
                    <div 
                      key={sec.section}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        idx === sectionIndex 
                        ? "border-secondary bg-secondary/10" 
                        : idx < sectionIndex 
                        ? "border-outline-variant bg-surface-container-low opacity-60" 
                        : "border-outline-variant bg-surface-bright"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-sm ${idx === sectionIndex ? "text-secondary" : "text-on-surface-variant"}`}>
                          {idx < sectionIndex ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span className={`font-inter text-sm font-semibold ${idx === sectionIndex ? "text-primary" : "text-on-surface-variant"}`}>
                          {sectionLabels[sec.section]}
                        </span>
                      </div>
                      <span className="font-jetbrains text-[10px] font-bold px-2 py-0.5 bg-surface-container-high rounded text-on-surface-variant">
                        {sec.durationMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="font-inter text-xs text-on-surface-variant font-medium">Seksi Saat Ini</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-surface-container-low border border-outline-variant"></div>
                  <span className="font-inter text-xs text-on-surface-variant font-medium">Seksi Mendatang</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                  <span className="font-inter text-xs text-on-surface-variant font-medium">Selesai Dikirim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
