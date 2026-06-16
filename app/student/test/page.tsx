"use client";

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
  vocabulary: "Vocabulary Assessment",
  grammar: "Grammar Assessment",
  reading: "Reading Comprehension",
  writing: "Academic Essay Writing",
  speaking: "Linguistic Speaking Test",
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
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const currentSection = sections[sectionIndex];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (finalTranscript) {
            setSpeakingResponse(prev => prev + finalTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert("Akses mikrofon ditolak. Silakan aktifkan izin mikrofon pada browser Anda di sebelah kiri alamat URL (ikon gembok/pengaturan).");
          } else if (event.error === 'no-speech') {
            alert("Tidak ada suara yang terdeteksi. Silakan coba berbicara lebih dekat ke mikrofon atau berbicara lebih keras.");
          } else if (event.error === 'audio-capture') {
            alert("Perangkat mikrofon tidak terdeteksi. Pastikan mikrofon Anda terhubung dengan benar dan aktif.");
          } else {
            alert(`Gagal merekam suara: ${event.error}. Silakan coba lagi atau ketik jawaban langsung sebagai alternatif.`);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  function toggleSpeechRecording() {
    if (!recognition) {
      alert("Browser Anda tidak mendukung perekaman suara otomatis (Speech-to-Text). Silakan ketik langsung tanggapan Anda.");
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  }

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
        const activeIdx = data.activeSectionIndex ?? 0;
        setSections(data.sections);
        setAnswers(data.attempt?.answers ?? {});
        setWritingResponse(data.attempt?.writingResponse ?? "");
        setSpeakingResponse(data.attempt?.speakingResponse ?? "");
        setSectionIndex(activeIdx);
        setTimeLeft((data.sections[activeIdx]?.durationMinutes ?? 0) * 60);
      } catch (err) {
        console.error("Test bootstrap error:", err);
        setError("Gagal memuat tes penempatan.");
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, [router]);

  const progress = useMemo(() => {
    if (sections.length === 0) return 0;
    return Math.round(((sectionIndex + 1) / sections.length) * 100);
  }, [sectionIndex, sections.length]);

  const isSectionComplete = useMemo((): boolean => {
    if (!currentSection) return false;

    if (currentSection.section === "writing") {
      return writingResponse.trim().length > 0;
    }

    if (currentSection.section === "speaking") {
      return speakingResponse.trim().length > 0;
    }

    // Multiple choice sections
    return currentSection.questions.every((q) => {
      const ans = answers[q.id];
      return ans !== undefined && ans !== null && ans.trim().length > 0;
    });
  }, [currentSection, answers, writingResponse, speakingResponse]);

  const persist = useCallback(
    async (sectionOverride?: Section["section"]): Promise<void> => {
      setIsSaving(true);
      try {
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
      } catch (err) {
        console.error("Auto-save error:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [answers, writingResponse, speakingResponse, currentSection?.section],
  );

  const moveNext = useCallback(
    async (fromTimeout = false): Promise<void> => {
      if (!currentSection) return;

      const nextIndex = sectionIndex + 1;
      const nextSection = sections[nextIndex];

      await persist(currentSection.section);

      if (!nextSection) {
        const confirmSubmit = fromTimeout
          ? true
          : window.confirm(
              "Apakah Anda yakin ingin menyelesaikan ujian Placement Test ini sekarang? Jawaban tidak dapat diubah kembali.",
            );

        if (!confirmSubmit) return;

        try {
          const submitRes = await fetch("/api/test/submit", { method: "POST" });
          if (!submitRes.ok) {
            setError("Gagal mensubmit tes.");
            return;
          }
          router.push("/student/result");
        } catch (err) {
          console.error("Submit error:", err);
          setError("Gagal mengirimkan ujian.");
        }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">Mempersiapkan Lembar Ujian...</p>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return <main className="p-10 text-center font-hanken font-bold text-primary">Seksi tes tidak tersedia.</main>;
  }

  const isTimeUrgent = timeLeft < 120; // 2 minutes

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-hanken text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">PRISM</span>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <span className="font-inter text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">Placement Test</span>
          </div>
          
          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isTimeUrgent 
              ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 animate-pulse" 
              : "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400"
          }`}>
            <span className="material-symbols-outlined text-xl">timer</span>
            <span className="font-mono font-black tabular-nums text-lg">
              {formatClock(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Progress</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{progress}%</span>
            </div>
            
            <button 
              disabled={!isSectionComplete}
              onClick={() => void moveNext(false)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-hanken text-sm font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={!isSectionComplete ? "Jawab semua pertanyaan untuk lanjut" : undefined}
            >
              {sectionIndex + 1 === sections.length ? "Kirim Ujian" : "Lanjut Seksi"}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800">
        <div 
          className="h-full bg-teal-500 transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Questions Container */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3">
             <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/20">
               {sectionLabels[currentSection.section]}
             </span>
             {isSaving && (
               <span className="text-xs text-gray-450 dark:text-gray-500 italic animate-pulse flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">cloud_sync</span>
                 Draft disimpan otomatis...
               </span>
             )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-250 dark:border-red-900/30 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {currentSection.questions.map((question, idx) => (
              <div key={question.id} className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 md:p-8 shadow-sm space-y-6">
                {/* Question Prompt */}
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm">
                    {idx + 1}
                  </span>
                  <h2 className="font-hanken text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed pt-0.5 select-none">
                    {question.prompt}
                  </h2>
                </div>

                {/* Multiple Choice Options */}
                {question.options && (
                  <div className="grid grid-cols-1 gap-3 pl-0 md:pl-12">
                    {question.options.map((option) => {
                      const isSelected = answers[question.id] === option;
                      return (
                        <label 
                          key={option}
                          className={`group relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected 
                              ? "border-teal-500 bg-teal-50/50 dark:bg-teal-500/10" 
                              : "border-gray-100 dark:border-gray-800 hover:border-teal-500/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <input 
                            type="radio" 
                            name={question.id}
                            className="peer hidden"
                            checked={isSelected}
                            onChange={() => setAnswers(prev => ({ ...prev, [question.id]: option }))}
                          />
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                            isSelected 
                              ? "border-teal-500 bg-teal-500 text-white" 
                              : "border-gray-300 dark:border-gray-600 group-hover:border-teal-500"
                          }`}>
                            {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                          </div>
                          <span className={`font-inter text-sm font-semibold ${
                            isSelected ? "text-teal-600 dark:text-teal-400" : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Writing Essay Editor */}
                {currentSection.section === "writing" && (
                  <div className="pl-0 md:pl-12 space-y-2">
                    <textarea
                      value={writingResponse}
                      onChange={(e) => setWritingResponse(e.target.value)}
                      className="w-full min-h-[300px] p-6 rounded-2xl border-2 border-gray-250 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-inter bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none leading-relaxed text-sm"
                      placeholder="Tulis esai tanggapan Anda di sini secara lengkap..."
                    />
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Patuhi batasan penulisan argumen akademik.</span>
                      <span>{writingResponse.trim().split(/\s+/).filter(w => w.length > 0).length} kata</span>
                    </div>
                  </div>
                )}

                {/* Speaking Audio Recorder */}
                {currentSection.section === "speaking" && (
                  <div className="pl-0 md:pl-12 space-y-6">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 space-y-4">
                      <div className="relative">
                        {isRecording && (
                          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150"></div>
                        )}
                        <button
                          type="button"
                          onClick={toggleSpeechRecording}
                          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer ${
                            isRecording 
                              ? "bg-red-600 text-white" 
                              : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: isRecording ? "'FILL' 1" : undefined }}>
                            {isRecording ? "stop" : "mic"}
                          </span>
                        </button>
                      </div>
                      <p className="font-hanken font-bold text-gray-800 dark:text-white">
                        {isRecording ? "Sedang Merekam... Bicaralah Sekarang" : "Klik untuk Rekam Suara"}
                      </p>
                      <p className="font-inter text-xs text-gray-400 dark:text-gray-500 text-center max-w-xs leading-relaxed">
                        Gunakan mikrofon yang berfungsi dengan baik. Ucapkan kalimat di atas dengan lantang dan jelas dalam bahasa Inggris.
                      </p>
                      
                      <div className="w-full space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Transkrip Suara (Bisa Diedit Manual)
                        </span>
                        <textarea
                          value={speakingResponse}
                          onChange={(e) => setSpeakingResponse(e.target.value)}
                          className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-inter text-xs text-gray-900 dark:text-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500/20 leading-relaxed"
                          placeholder="Hasil rekaman suara akan otomatis terketik di sini, atau Anda bisa mengetiknya langsung jika mikrofon tidak aktif..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Navigator Map Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm space-y-6">
            <h3 className="font-hanken text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">map</span>
              Navigator Struktur Ujian
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sub-Seksi Tes</p>
                <div className="space-y-2.5">
                  {sections.map((sec, idx) => {
                    const isCurrent = idx === sectionIndex;
                    const isCompleted = idx < sectionIndex;
                    return (
                      <div 
                        key={sec.section}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isCurrent 
                            ? "border-teal-500 bg-teal-50/50 dark:bg-teal-500/10" 
                            : isCompleted 
                            ? "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60" 
                            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-lg ${
                            isCurrent ? "text-teal-600 dark:text-teal-400" :
                            isCompleted ? "text-teal-600 dark:text-teal-400" :
                            "text-gray-300 dark:text-gray-600"
                          }`} style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "" }}>
                            {isCompleted ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          <span className={`font-inter text-xs font-bold ${
                            isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {sectionLabels[sec.section].split(' ')[0]} {/* display first word */}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-400 dark:text-gray-500">
                          {sec.durationMinutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigator Legend */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                  <span className="font-inter text-xs text-gray-550 dark:text-gray-400 font-medium">Seksi Berjalan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"></div>
                  <span className="font-inter text-xs text-gray-550 dark:text-gray-400 font-medium">Seksi Mendatang</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500/20"></div>
                  <span className="font-inter text-xs text-gray-550 dark:text-gray-400 font-medium">Seksi Selesai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
