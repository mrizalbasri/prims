"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

// ── Types aligned with /api/student/result response ──────────────────────────
type SectionScores = {
  vocabulary: number;
  grammar: number;
  reading: number;
  writing: number;
  speaking: number;
  total: number;
};

type Result = {
  testAttemptId: string;
  completedAt: string;
  scores: SectionScores;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  cefrLevel: string;
  overallScore: number;
  levelDescription: string;
};

type ResultPayload = {
  hasResult: boolean;
  result?: Result;
  message?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLevelMeta(level: Result["level"]) {
  if (level === "BEGINNER")
    return {
      label: "Beginner",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-200/50 dark:border-red-800/30",
      text: "text-red-600 dark:text-red-400",
      gradientFrom: "from-red-500",
      gradientTo: "to-rose-600",
      icon: "trending_up",
    };
  if (level === "INTERMEDIATE")
    return {
      label: "Intermediate",
      bg: "bg-yellow-50 dark:bg-yellow-500/10",
      border: "border-yellow-200/50 dark:border-yellow-800/30",
      text: "text-yellow-600 dark:text-yellow-400",
      gradientFrom: "from-yellow-500",
      gradientTo: "to-amber-600",
      icon: "star_half",
    };
  return {
    label: "Advanced",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-200/50 dark:border-green-800/30",
    text: "text-green-600 dark:text-green-400",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    icon: "workspace_premium",
  };
}

function getGuidance(level: Result["level"]) {
  if (level === "BEGINNER")
    return {
      title: "Membangun Fondasi yang Kuat",
      description:
        "Kemampuan bahasa Inggris Anda berada di tahap awal. Fokus utama adalah membangun dasar kosakata dan tata bahasa dasar secara konsisten.",
      tips: [
        "Pelajari tata bahasa dasar dan pola kalimat sederhana setiap hari.",
        "Latih kosakata akademik menggunakan flashcard modul Vocabulary PRISM.",
        "Biasakan mendengarkan audio bahasa Inggris dengan bantuan subtitle.",
        "Praktikkan menulis kalimat sederhana dan minta koreksi feedback AI.",
      ],
    };
  if (level === "INTERMEDIATE")
    return {
      title: "Tingkatkan Konsistensi & Kepercayaan Diri",
      description:
        "Anda memiliki pemahaman yang cukup baik. Saatnya meningkatkan keterampilan ekspresi formal dan komunikasi akademik.",
      tips: [
        "Latih menulis esai terstruktur secara mingguan melalui modul Writing.",
        "Ikuti diskusi akademik dan presentasikan topik dalam bahasa Inggris.",
        "Perkaya bacaan dengan artikel jurnal ilmiah dan berita internasional.",
        "Gunakan modul Speaking PRISM untuk memperlancar intonasi lisan Anda.",
      ],
    };
  return {
    title: "Kuasai Ketepatan & Ekspresi Akademik Tingkat Lanjut",
    description:
      "Luar biasa! Kemampuan Anda sangat baik. Fokus sekarang adalah memoles kefasihan dan memperkaya kosakata spesifik bidang studi.",
    tips: [
      "Banyak membaca publikasi riset, jurnal internasional, dan literatur kompleks.",
      "Latih menulis paper akademis formal dengan diksi tingkat tinggi.",
      "Ikuti webinar internasional dan coba berbicara aktif tanpa teks bantu.",
      "Gunakan kemampuan Anda untuk membimbing rekan yang memerlukan bantuan.",
    ],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StudentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [barsVisible, setBarsVisible] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchResult(isPolling = false) {
    try {
      const res = await fetch("/api/student/result");

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError("Gagal memuat hasil tes penempatan.");
        return;
      }

      const data: ResultPayload = await res.json();

      if (data.hasResult && data.result) {
        // Stop polling and show result
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setIsProcessing(false);
        setResult(data.result);
        // Trigger bar animation after short delay
        setTimeout(() => setBarsVisible(true), 100);
      } else {
        // No result yet — show processing state and start polling
        setIsProcessing(true);
        if (!isPolling && !pollingRef.current) {
          pollingRef.current = setInterval(() => {
            void fetchResult(true);
          }, 4000);
        }
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba muat ulang halaman.");
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchResult();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">
            Memuat Hasil Tes...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 border border-red-200/50 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-200/50">
            <span className="material-symbols-outlined text-3xl text-red-500">
              error
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="font-hanken text-xl font-bold text-gray-900 dark:text-white">
              Gagal Memuat Hasil
            </h1>
            <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              void fetchResult();
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-hanken font-bold transition-all cursor-pointer border-0"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ── Processing / No Result ─────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-10 text-center space-y-8 shadow-2xl">
          {/* Animated AI Processing Icon */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <div className="absolute inset-3 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
              <span
                className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-200/50">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              AI Sedang Memproses
            </div>
            <h1 className="font-hanken text-2xl font-bold text-gray-900 dark:text-white">
              Menilai Esai & Rekaman Suara Anda
            </h1>
            <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              Asisten AI sedang menganalisis jawaban esai dan rekaman speaking Anda secara mendalam. Proses ini membutuhkan beberapa saat. Halaman akan diperbarui secara otomatis.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Analisis Esai", icon: "edit_document" },
              { label: "Evaluasi Suara", icon: "record_voice_over" },
              { label: "Kalkulasi Skor", icon: "calculate" },
            ].map((step) => (
              <div
                key={step.label}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700"
              >
                <span className="material-symbols-outlined text-2xl text-gray-400 dark:text-gray-500 block mb-1">
                  {step.icon}
                </span>
                <p className="font-inter text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-inter text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Result View ────────────────────────────────────────────────────────────
  const meta = getLevelMeta(result.level);
  const guidance = getGuidance(result.level);
  const totalScore = Math.round(result.overallScore);
  const completedDate = new Date(result.completedAt).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const sectionBreakdown = [
    {
      label: "Vocabulary",
      score: Math.round(result.scores?.vocabulary ?? 0),
      icon: "style",
      color: "text-blue-600 dark:text-blue-400",
      bar: "bg-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Grammar",
      score: Math.round(result.scores?.grammar ?? 0),
      icon: "spellcheck",
      color: "text-purple-600 dark:text-purple-400",
      bar: "bg-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      label: "Reading",
      score: Math.round(result.scores?.reading ?? 0),
      icon: "menu_book",
      color: "text-green-600 dark:text-green-400",
      bar: "bg-green-500",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
    {
      label: "Writing",
      score: Math.round(result.scores?.writing ?? 0),
      icon: "edit_document",
      color: "text-orange-600 dark:text-orange-400",
      bar: "bg-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
    },
    {
      label: "Speaking",
      score: Math.round(result.scores?.speaking ?? 0),
      icon: "record_voice_over",
      color: "text-red-600 dark:text-red-400",
      bar: "bg-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo className="h-11 w-36" />
          </Link>
          <Link
            href="/student"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-inter text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* ── Hero Score Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          {/* Background decorations */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-40 translate-x-40" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-30 -translate-x-30" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Left — Score */}
            <div className="text-center lg:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                <span className="material-symbols-outlined text-sm">
                  school
                </span>
                Hasil Placement Test PRISM
              </div>

              <div>
                <p className="font-inter text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">
                  Skor Akhir Anda
                </p>
                <div className="flex items-baseline gap-3 justify-center lg:justify-start">
                  <h1 className="font-hanken text-7xl md:text-8xl font-black tracking-tight">
                    {totalScore}
                  </h1>
                  <span className="font-inter text-blue-300 text-xl font-semibold">
                    / 100
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 font-hanken text-sm font-bold uppercase tracking-wider">
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {meta.icon}
                  </span>
                  {meta.label}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-full border border-white/15 font-mono text-sm font-bold">
                  <span className="material-symbols-outlined text-sm text-blue-200">
                    language
                  </span>
                  CEFR {result.cefrLevel}
                </div>
              </div>

              <p className="font-inter text-xs text-blue-200 flex items-center gap-1.5 justify-center lg:justify-start">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                Diuji pada {completedDate}
              </p>
            </div>

            {/* Right — Score ring visual */}
            <div className="flex-shrink-0 relative w-44 h-44">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full -rotate-90"
                strokeLinecap="round"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`${(totalScore / 100) * 263.9} 263.9`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="material-symbols-outlined text-4xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {meta.icon}
                </span>
                <span className="font-hanken text-xs font-bold text-blue-200 uppercase tracking-wider mt-1">
                  {meta.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section Breakdown ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">
              analytics
            </span>
            <h2 className="font-hanken text-2xl font-bold text-gray-900 dark:text-white">
              Analisis Kompetensi per Bidang
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sectionBreakdown.map((section) => (
              <div
                key={section.label}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-6 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl ${section.bg} ${section.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-current/10`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {section.icon}
                    </span>
                  </div>
                  <p className="font-inter text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">
                    {section.label}
                  </p>
                  <p className="font-hanken text-3xl font-black text-gray-900 dark:text-white mt-1">
                    {section.score}
                    <span className="text-base font-semibold text-gray-400 ml-0.5">
                      %
                    </span>
                  </p>
                </div>

                {/* Animated progress bar */}
                <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${section.bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: barsVisible ? `${section.score}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Level Description + Guidance ── */}
        <div
          className={`rounded-3xl border-2 p-8 md:p-10 space-y-6 ${meta.bg} ${meta.border}`}
        >
          <div className={`flex gap-4 items-start ${meta.text}`}>
            <div className="w-12 h-12 rounded-2xl bg-current/10 border border-current/20 flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-hanken text-2xl font-bold">
                {guidance.title}
              </h3>
              <p className="font-inter text-sm leading-relaxed opacity-90">
                {guidance.description}
              </p>
            </div>
          </div>

          <div className={`pt-4 border-t border-current/10 ${meta.text}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest block opacity-60 mb-4">
              Rekomendasi Studi Anda
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guidance.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span
                    className="material-symbols-outlined text-lg mt-0.5 flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <p className="font-inter text-sm leading-relaxed opacity-90">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA — Start Learning ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-hanken text-xl font-bold text-gray-950 dark:text-white">
                Siap Meningkatkan Kemampuan Bahasa Inggris Anda?
              </h3>
              <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                Akses modul pembelajaran mandiri PRISM — Vocabulary, Writing, dan Speaking — yang telah disesuaikan dengan level Anda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/student/vocabulary"
                className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-hanken font-bold px-5 py-3 rounded-xl transition-all border border-blue-200/50 text-sm"
              >
                <span className="material-symbols-outlined text-lg">style</span>
                Vocabulary
              </Link>
              <Link
                href="/student/writing"
                className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 text-orange-600 dark:text-orange-400 font-hanken font-bold px-5 py-3 rounded-xl transition-all border border-orange-200/50 text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  edit_document
                </span>
                Writing
              </Link>
              <Link
                href="/student/speaking"
                className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 font-hanken font-bold px-5 py-3 rounded-xl transition-all border border-red-200/50 text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  record_voice_over
                </span>
                Speaking
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
