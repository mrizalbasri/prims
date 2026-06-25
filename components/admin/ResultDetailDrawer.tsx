"use client";

import React, { useEffect, useState } from "react";

interface ResultDetailDrawerProps {
  isOpen: boolean;
  testAttemptId: string | null;
  studentName: string;
  onClose: () => void;
}

interface DetailData {
  testAttemptId: string;
  student: {
    id: string;
    email: string;
    fullName: string;
    major: string;
    cohort: string;
    allowRetake: boolean;
  };
  status: string;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  } | null;
  level: string | null;
  writing: {
    content: string;
    feedback: {
      overall?: string;
      suggestions?: string[];
    } | string | null;
    score: number;
  } | null;
  speaking: {
    audioUrl: string | null;
    transcript: string;
    feedback: {
      overall?: string;
      pronunciation?: string;
      fluency?: string;
    } | string | null;
    score: number;
  } | null;
  history?: {
    testAttemptId: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
    score: number | null;
    level: string | null;
  }[];
}

export default function ResultDetailDrawer({
  isOpen,
  testAttemptId,
  studentName,
  onClose,
}: ResultDetailDrawerProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scores" | "writing" | "speaking">("scores");
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [prevTestAttemptId, setPrevTestAttemptId] = useState<string | null>(null);
  const [isTogglingRetake, setIsTogglingRetake] = useState(false);

  if (testAttemptId !== prevTestAttemptId) {
    setPrevTestAttemptId(testAttemptId);
    setActiveAttemptId(testAttemptId);
    setData(null);
    setError(null);
  }

  async function handleToggleRetake() {
    if (!data) return;
    const newStatus = !data.student.allowRetake;
    const confirmMsg = newStatus
      ? `Apakah Anda yakin ingin mengizinkan ${studentName} untuk mengambil tes ulang? Sesi tes sebelumnya akan diarsipkan, dan ia dapat mengambil tes baru.`
      : `Apakah Anda yakin ingin mencabut izin tes ulang untuk ${studentName}?`;

    if (!window.confirm(confirmMsg)) return;

    setIsTogglingRetake(true);
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.student.id,
          allowRetake: newStatus,
        }),
      });

      if (res.ok) {
        setData({
          ...data,
          student: {
            ...data.student,
            allowRetake: newStatus,
          },
        });
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal mengubah otorisasi tes ulang.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat memperbarui otorisasi.");
    } finally {
      setIsTogglingRetake(false);
    }
  }

  useEffect(() => {
    if (!isOpen || !activeAttemptId || activeAttemptId.startsWith("no-attempt-")) {
      return;
    }

    async function fetchDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/results/${activeAttemptId}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil rincian data mahasiswa");
        }
        const json = await res.json();
        setData(json);
        setActiveTab("scores");
      } catch (err) {
        console.error(err);
        const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDetails();
  }, [isOpen, activeAttemptId]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const noAttempt = !activeAttemptId || activeAttemptId.startsWith("no-attempt-");

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 animate-slideInRight border-l border-gray-150 dark:border-gray-800">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-hanken font-extrabold text-xl text-gray-950 dark:text-white">
              Detail Hasil Tes
            </h2>
            <p className="font-inter text-xs text-gray-400">
              {studentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {noAttempt ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 select-none">
                pending_actions
              </span>
              <h4 className="font-hanken font-bold text-gray-800 dark:text-gray-200">
                Ujian Belum Dimulai
              </h4>
              <p className="font-inter text-xs text-gray-400 max-w-xs leading-relaxed">
                Mahasiswa ini belum memulai sesi pengerjaan ujian Placement Test mereka.
              </p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-inter text-xs font-semibold text-gray-400">
                Memuat rincian jawaban...
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
              <span className="material-symbols-outlined text-5xl text-red-400 select-none">
                error_outline
              </span>
              <h4 className="font-hanken font-bold text-red-650 dark:text-red-400">
                Gagal Memuat Data
              </h4>
              <p className="font-inter text-xs text-gray-400 max-w-xs">
                {error}
              </p>
              <button
                onClick={() => {
                  // Trigger simple refetch by toggle states
                  setData(null);
                  setError(null);
                  setIsLoading(true);
                  fetch(`/api/admin/results/${activeAttemptId}`)
                    .then((res) => res.json())
                    .then((json) => setData(json))
                    .catch((err) => setError(err.message))
                    .finally(() => setIsLoading(false));
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-750 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : data ? (
            <>
              {/* Student Metadata Card */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      Email Mahasiswa
                    </span>
                    <span className="font-inter font-semibold text-gray-850 dark:text-gray-250 block truncate">
                      {data.student.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      Jurusan / Angkatan
                    </span>
                    <span className="font-inter font-semibold text-gray-850 dark:text-gray-250 block">
                      {data.student.major} ({data.student.cohort})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      Status Ujian
                    </span>
                    <span className="block mt-1">
                      {data.status === "SELESAI" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                          Selesai
                        </span>
                      )}
                      {data.status === "SEDANG_MENGERJAKAN" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                          Sedang Mengerjakan
                        </span>
                      )}
                      {data.status === "GAGAL" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-150/20 text-red-650 dark:text-red-400">
                          Gagal
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      Waktu Selesai
                    </span>
                    <span className="font-inter font-semibold text-gray-850 dark:text-gray-250 block">
                      {data.completedAt
                        ? new Date(data.completedAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      Otorisasi Tes Ulang
                    </span>
                    <span className="font-inter text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed block">
                      {data.student.allowRetake 
                        ? "Siswa diizinkan untuk mengambil tes ulang." 
                        : "Siswa saat ini tidak diizinkan untuk mengulang tes."}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleRetake}
                    disabled={isTogglingRetake}
                    className={`px-3 py-1.5 rounded-xl font-hanken font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                      data.student.allowRetake
                        ? "bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-900/30 text-red-650 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-950/20"
                        : "bg-blue-600 hover:bg-blue-750 text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {data.student.allowRetake ? "block" : "replay"}
                    </span>
                    {isTogglingRetake 
                      ? "Memproses..." 
                      : data.student.allowRetake 
                        ? "Cabut Izin" 
                        : "Izinkan Uji Ulang"}
                  </button>
                </div>
              </div>

              {/* Navigation Tabs inside Drawer */}
              <div className="flex border-b border-gray-150 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("scores")}
                  className={`flex-1 pb-3 text-sm font-hanken font-bold transition-all border-b-2 text-center cursor-pointer ${
                    activeTab === "scores"
                      ? "border-blue-650 text-blue-650 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Rincian Skor
                </button>
                <button
                  onClick={() => setActiveTab("writing")}
                  className={`flex-1 pb-3 text-sm font-hanken font-bold transition-all border-b-2 text-center cursor-pointer ${
                    activeTab === "writing"
                      ? "border-blue-650 text-blue-650 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Academic Writing
                </button>
                <button
                  onClick={() => setActiveTab("speaking")}
                  className={`flex-1 pb-3 text-sm font-hanken font-bold transition-all border-b-2 text-center cursor-pointer ${
                    activeTab === "speaking"
                      ? "border-blue-650 text-blue-650 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Speaking Test
                </button>
              </div>

              {/* Tab 1: Scores Grid */}
              {activeTab === "scores" && (
                <div className="space-y-6 animate-fadeIn">
                  {data.scores ? (
                    <>
                      {/* Overall Level Badge */}
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Evaluasi CEFR Level
                          </span>
                          <span className="font-hanken font-black text-2xl text-blue-700 dark:text-blue-450">
                            {data.level || "UNKNOWN"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Skor Akhir
                          </span>
                          <span className="font-mono font-black text-3xl text-gray-950 dark:text-white">
                            {Math.round(data.scores.total)}
                          </span>
                        </div>
                      </div>

                      {/* Section Scores list */}
                      <div className="space-y-3.5">
                        <h4 className="font-hanken font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest">
                          Sub-skor Seksi Ujian
                        </h4>
                        
                        {[
                          { label: "Vocabulary Assessment", score: data.scores.vocabulary },
                          { label: "Grammar Assessment", score: data.scores.grammar },
                          { label: "Reading Comprehension", score: data.scores.reading },
                          { label: "Listening Comprehension", score: data.scores.listening },
                          { label: "Academic Essay Writing", score: data.scores.writing },
                          { label: "Linguistic Speaking Test", score: data.scores.speaking },
                        ].map((sec) => (
                          <div key={sec.label} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                              <span>{sec.label}</span>
                              <span className="font-mono">{sec.score}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${sec.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 font-inter text-xs text-gray-400 italic">
                      Skor belum dikalkulasi. Mahasiswa masih dalam proses pengerjaan.
                    </div>
                  )}

                  {/* History / Attempts Section */}
                  {data.history && data.history.length > 0 && (
                    <div className="pt-6 border-t border-gray-150 dark:border-gray-800 space-y-4">
                      <h4 className="font-hanken font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest">
                        Riwayat & Perkembangan Ujian
                      </h4>
                      <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-4">
                        {data.history.map((attempt, index) => {
                          const attemptNum = data.history!.length - index;
                          const isActive = attempt.testAttemptId === activeAttemptId;
                          
                          return (
                            <div key={attempt.testAttemptId} className="relative group">
                              {/* Dot on timeline */}
                              <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                                isActive 
                                  ? "bg-blue-600 border-blue-650 dark:bg-blue-500 dark:border-blue-450 scale-125" 
                                  : "bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700 group-hover:border-gray-400"
                              }`} />
                              
                              <button
                                onClick={() => {
                                  if (!isActive) {
                                    setActiveAttemptId(attempt.testAttemptId);
                                    setData(null);
                                  }
                                }}
                                disabled={isActive}
                                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                                  isActive
                                    ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 cursor-default"
                                    : "bg-white dark:bg-gray-900/50 border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/55 dark:hover:bg-gray-900/80 cursor-pointer"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-hanken font-bold text-xs text-gray-900 dark:text-white">
                                        Tes Ke-{attemptNum}
                                      </span>
                                      {isActive && (
                                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-650 dark:text-blue-400">
                                          Sedang Dilihat
                                        </span>
                                      )}
                                      {attempt.status !== "COMPLETED" && (
                                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                          attempt.status === "FAILED"
                                            ? "bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400"
                                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400"
                                        }`}>
                                          {attempt.status === "FAILED" ? "Gagal" : "Proses"}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-inter text-[11px] text-gray-400 block">
                                      Dimulai: {new Date(attempt.createdAt).toLocaleString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  
                                  {attempt.status === "COMPLETED" && (
                                    <div className="text-right font-hanken">
                                      <span className="font-extrabold text-sm text-blue-650 dark:text-blue-400 block">
                                        {attempt.level || "UNKNOWN"}
                                      </span>
                                      <span className="font-mono text-[10px] font-bold text-gray-400">
                                        Skor: {attempt.score !== null ? Math.round(attempt.score) : "-"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Writing Section Detail */}
              {activeTab === "writing" && (
                <div className="space-y-6 animate-fadeIn">
                  {data.writing ? (
                    <>
                      {/* Section Score */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Skor Bobot Writing
                        </span>
                        <span className="font-mono font-bold text-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/10">
                          {data.writing.score}%
                        </span>
                      </div>

                      {/* Content Submitted */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Teks Esai Mahasiswa
                        </label>
                        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 font-inter text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {data.writing.content || (
                            <span className="italic text-gray-400">Mahasiswa tidak menulis jawaban apapun.</span>
                          )}
                        </div>
                      </div>

                      {/* Feedback AI */}
                      {data.writing.feedback && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Evaluasi AI & Koreksi Grammar
                          </label>
                          <div className="p-5 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/25 space-y-4">
                            {typeof data.writing.feedback === "string" ? (
                              <p className="font-inter text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                {data.writing.feedback}
                              </p>
                            ) : (
                              <div className="space-y-3 font-inter text-xs text-gray-750 dark:text-gray-350">
                                {data.writing.feedback.overall && (
                                  <p className="leading-relaxed font-semibold text-gray-850 dark:text-gray-250">
                                    {data.writing.feedback.overall}
                                  </p>
                                )}
                                {data.writing.feedback.suggestions && Array.isArray(data.writing.feedback.suggestions) && (
                                  <div className="space-y-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/20">
                                    <span className="font-bold text-amber-800 dark:text-amber-400 text-[10px] uppercase tracking-wider block">
                                      Saran Perbaikan:
                                    </span>
                                    <ul className="list-disc pl-5 space-y-1.5">
                                      {data.writing.feedback.suggestions.map((sug: string, i: number) => (
                                        <li key={i} className="leading-relaxed">
                                          {sug}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-10 font-inter text-xs text-gray-400 italic">
                      Data ujian writing tidak tersedia untuk attempt ini.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Speaking Section Detail */}
              {activeTab === "speaking" && (
                <div className="space-y-6 animate-fadeIn">
                  {data.speaking ? (
                    <>
                      {/* Section Score & Audio player */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Skor Bobot Speaking
                          </span>
                          <span className="font-mono font-bold text-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/10 inline-block">
                            {data.speaking.score}%
                          </span>
                        </div>

                        {data.speaking.audioUrl ? (
                          <div className="flex-1 max-w-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                              Pemutar Audio Rekaman (.webm)
                            </span>
                            <audio
                              src={data.speaking.audioUrl}
                              controls
                              className="w-full h-8 outline-none"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-450 dark:text-gray-500 italic text-[11px]">
                            Audio tidak terekam/diunggah
                          </div>
                        )}
                      </div>

                      {/* Speaking Transcript */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Transkrip Pengenalan Suara (Speech Recognition)
                        </label>
                        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 font-inter text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {data.speaking.transcript || (
                            <span className="italic text-gray-400">Tidak ada transkrip rekaman suara terdeteksi.</span>
                          )}
                        </div>
                      </div>

                      {/* Feedback AI */}
                      {data.speaking.feedback && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Evaluasi AI (Pronunciation & Fluency)
                          </label>
                          <div className="p-5 rounded-2xl bg-teal-50/30 dark:bg-teal-950/10 border border-teal-200/60 dark:border-teal-900/25 space-y-4">
                            {typeof data.speaking.feedback === "string" ? (
                              <p className="font-inter text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                {data.speaking.feedback}
                              </p>
                            ) : (
                              <div className="space-y-3 font-inter text-xs text-gray-750 dark:text-gray-350">
                                {data.speaking.feedback.overall && (
                                  <p className="leading-relaxed font-semibold text-gray-850 dark:text-gray-250">
                                    {data.speaking.feedback.overall}
                                  </p>
                                )}
                                {data.speaking.feedback.pronunciation && (
                                  <p className="leading-relaxed">
                                    <strong className="text-teal-850 dark:text-teal-350 font-bold block mb-0.5">Pengucapan (Pronunciation):</strong>
                                    {data.speaking.feedback.pronunciation}
                                  </p>
                                )}
                                {data.speaking.feedback.fluency && (
                                  <p className="leading-relaxed">
                                    <strong className="text-teal-850 dark:text-teal-350 font-bold block mb-0.5">Kelancaran (Fluency):</strong>
                                    {data.speaking.feedback.fluency}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-10 font-inter text-xs text-gray-400 italic">
                      Data ujian speaking tidak tersedia untuk attempt ini.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
