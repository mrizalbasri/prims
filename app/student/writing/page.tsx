"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import FeedbackBanner from "@/components/student/FeedbackBanner";
import WritingFeedback from "@/components/student/writing/WritingFeedback";
import WritingHistory from "@/components/student/writing/WritingHistory";
import WritingPromptList from "@/components/student/writing/WritingPromptList";
import type { Submission, WritingPrompt } from "@/components/student/writing/types";

export default function WritingPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);
  const [view, setView] = useState<"prompts" | "write" | "history">("prompts");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const wordCount = essay.trim().split(/\s+/).filter(w => w.length > 0).length;

  useEffect(() => {
    async function loadData() {
      setLoadError(null);
      try {
        const [promptsRes, submissionsRes] = await Promise.all([
          fetch("/api/writing/prompts"),
          fetch("/api/writing/submissions")
        ]);

        if (!promptsRes.ok) {
          if (promptsRes.status === 401) router.push("/login");
          if (promptsRes.status === 403) router.push("/student");
          if (promptsRes.status !== 401 && promptsRes.status !== 403) {
            setLoadError("Topik menulis gagal dimuat. Periksa koneksi Anda lalu coba lagi.");
          }
          return;
        }

        const promptsData = await promptsRes.json();
        const submissionsData = submissionsRes.ok ? await submissionsRes.json() : { submissions: [] };

        setPrompts(promptsData.prompts || []);
        
        // Map overallScore to score
        const mappedSubmissions = (submissionsData.submissions || []).map((s: { id: string; overallScore?: number; score?: number; prompt: { title: string }; submittedAt: string }) => ({
          ...s,
          score: s.overallScore ?? s.score ?? 0,
        }));
        setSubmissions(mappedSubmissions);
      } catch (err) {
        console.error("Failed to load writing data:", err);
        setLoadError("Topik menulis gagal dimuat. Periksa koneksi Anda lalu coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [router]);

  async function handleSubmit() {
    if (!selectedPrompt || wordCount < selectedPrompt.minWords) return;

    setActionError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/writing/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          essay
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setActionError(errorData.error || "Gagal mengirimkan esai. Silakan coba lagi.");
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      const submissionId = data.submission?.id;

      if (!submissionId) {
        setActionError("Pengiriman berhasil diterima, tetapi ID evaluasi tidak tersedia. Silakan cek Riwayat.");
        setIsSubmitting(false);
        return;
      }

      // Start polling status with max retry count guard (max 15 attempts / 45s)
      let pollCount = 0;
      pollIntervalRef.current = setInterval(async () => {
        pollCount += 1;
        if (pollCount > 15) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setActionError("Evaluasi AI membutuhkan waktu lebih lama. Hasil Anda tetap tersimpan dan akan muncul di tab Riwayat setelah selesai.");
          setIsSubmitting(false);
          return;
        }

        try {
          const statusRes = await fetch(`/api/writing/submissions?id=${submissionId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData && statusData.submission) {
              const sub = statusData.submission;
              if (sub.status === "COMPLETED") {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setResult({
                  id: sub.id,
                  score: sub.scores?.overall ?? 0,
                  scores: sub.scores,
                  feedback: sub.feedback,
                  submittedAt: sub.submittedAt,
                  prompt: sub.prompt
                });
                setShowResult(true);
                setIsSubmitting(false);

                // Refresh history list
                const historyRes = await fetch("/api/writing/submissions");
                if (historyRes.ok) {
                  const historyData = await historyRes.json();
                  const mapped = (historyData.submissions || []).map((s: { id: string; overallScore?: number; score?: number; prompt: { title: string }; submittedAt: string }) => ({
                    ...s,
                    score: s.overallScore ?? s.score ?? 0,
                  }));
                  setSubmissions(mapped);
                }
              } else if (sub.status === "FAILED") {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setActionError("Evaluasi AI gagal memproses esai ini. Silakan coba lagi.");
                setIsSubmitting(false);
              }
            }
          }
        } catch (pollErr) {
          console.error("Error polling writing submission:", pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error("Submit essay error:", err);
      setActionError("Terjadi kesalahan koneksi saat mengirim esai. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  }

  function startNewEssay(prompt: WritingPrompt) {
    setSelectedPrompt(prompt);
    setEssay("");
    setShowResult(false);
    setResult(null);
    setView("write");
  }

  function resetAndGoBack() {
    setSelectedPrompt(null);
    setEssay("");
    setShowResult(false);
    setResult(null);
    setView("prompts");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">Memuat Writing Practice...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-950">
        <main className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <FeedbackBanner tone="error" title="Writing Practice tidak tersedia" actionLabel="Coba lagi" onAction={() => window.location.reload()}>
            {loadError}
          </FeedbackBanner>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/student" className="flex items-center">
              <Logo className="h-8 w-24" />
            </Link>
            <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-orange-200/50 dark:border-orange-800/20">
              Writing Practice
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView("prompts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-hanken text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                view === "prompts" ? "bg-orange-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">assignment</span>
              <span className="hidden sm:inline">Prompts</span>
            </button>
            <button
              onClick={() => setView("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-hanken text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                view === "history" ? "bg-orange-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              <span className="hidden sm:inline">Riwayat</span>
            </button>
            <Link href="/student" aria-label="Kembali ke dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {view === "prompts" && (
          <WritingPromptList prompts={prompts} onStart={startNewEssay} />
        )}

        {/* Essay writing interface */}
        {view === "write" && selectedPrompt && !showResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            {actionError && (
              <FeedbackBanner tone="error" title="Pengiriman belum selesai">
                {actionError}
              </FeedbackBanner>
            )}
            <button
              onClick={resetAndGoBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 text-gray-550 hover:text-gray-900 dark:hover:text-white transition-colors font-inter text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Kembali ke Prompts
            </button>
            
            <div className="bg-orange-50/50 dark:bg-orange-500/5 border border-orange-200/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-orange-600 text-3xl p-2 rounded-xl bg-orange-500/10">assignment</span>
                <div className="flex-1 space-y-1">
                  <h2 className="font-hanken text-xl font-bold text-gray-900 dark:text-white">{selectedPrompt.title}</h2>
                  <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{selectedPrompt.prompt}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-450 dark:text-gray-400 pt-3 border-t border-orange-200/30">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-gray-400">straighten</span>
                  Target: Min. {selectedPrompt.minWords} kata
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  selectedPrompt.level === "Advanced" ? "bg-green-50 text-green-600 dark:bg-green-500/10" :
                  selectedPrompt.level === "Intermediate" ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10" :
                  "bg-red-50 text-red-600 dark:bg-red-500/10"
                }`}>
                  {selectedPrompt.level}
                </span>
              </div>
            </div>

            {isSubmitting ? (
              <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 shadow-sm flex flex-col items-center justify-center space-y-6 py-14 animate-fadeIn">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-100 dark:border-orange-950" />
                  <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-2 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-3xl text-orange-600 dark:text-orange-400 animate-pulse">smart_toy</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">AI Sedang Mengevaluasi Esai Anda</h3>
                  <p className="font-inter text-xs text-gray-450 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Sistem sedang memindai tata bahasa, kosa kata, kesesuaian konten, dan struktur koherensi secara real-time. Proses ini memerlukan beberapa saat.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                    <h3 className="font-hanken text-base font-bold text-gray-900 dark:text-white">Workspace Penulisan</h3>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${
                        wordCount >= selectedPrompt.minWords ? "text-green-600" : "text-gray-500"
                      }`}>
                        {wordCount} / {selectedPrompt.minWords} kata
                      </span>
                      {wordCount >= selectedPrompt.minWords && (
                        <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                      )}
                    </div>
                  </div>
                  
                  <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    className="w-full min-h-[360px] p-6 rounded-2xl border-2 border-gray-250 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-inter bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none leading-relaxed text-sm"
                    placeholder="Mulai ketik esai akademik Anda di sini..."
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting || wordCount < selectedPrompt.minWords}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer border-0"
                  >
                    <span className="material-symbols-outlined">send</span>
                    Kirim & Nilai
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* AI response feedback view */}
        {view === "write" && showResult && result && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 shadow-xl space-y-8 text-center">
              <div className="space-y-4">
                <span className="material-symbols-outlined text-6xl text-orange-600 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                  grade
                </span>
                <h2 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Hasil Penilaian Writing</h2>
                <div className="inline-flex items-center gap-3 bg-orange-50 dark:bg-orange-500/10 px-6 py-3 rounded-full border border-orange-200/50 dark:border-orange-900/30">
                  <span className="font-hanken text-5xl font-black text-orange-600 dark:text-orange-400">{result.score}</span>
                  <span className="font-inter text-xs text-gray-400 uppercase tracking-widest font-semibold">/ 100</span>
                </div>
              </div>

              {result.scores && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Grammar", val: result.scores.grammar, color: "text-purple-600 dark:text-purple-400" },
                    { label: "Clarity/Content", val: result.scores.clarity, color: "text-green-600 dark:text-green-400" },
                    { label: "Structure", val: result.scores.structure, color: "text-orange-600 dark:text-orange-400" }
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 dark:bg-gray-900/65 p-4 rounded-xl border border-gray-150 dark:border-gray-800 text-center space-y-1">
                      <p className="font-inter text-[10px] text-gray-450 dark:text-gray-500 uppercase font-bold tracking-wider">{s.label}</p>
                      <p className={`font-mono text-xl font-black ${s.color}`}>{Math.round(s.val)}%</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-hanken text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600">feedback</span>
                  Umpan Balik AI (Indonesia)
                </h3>
                <WritingFeedback feedback={result.feedback} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => startNewEssay(selectedPrompt!)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-hanken font-bold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Coba Tulis Lagi
                </button>
                <button
                  onClick={resetAndGoBack}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-hanken font-bold px-6 py-3.5 rounded-xl transition-all border border-transparent dark:border-gray-700 cursor-pointer"
                >
                  Kembali ke Topik
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "history" && (
          <WritingHistory
            submissions={submissions}
            onBrowse={() => setView("prompts")}
          />
        )}
      </main>
    </div>
  );
}
