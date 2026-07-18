"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import AIProcessingLoader from "@/components/student/AIProcessingLoader";

// Import modular components
import ResultHero from "@/components/student/result/ResultHero";
import CompetencyChart from "@/components/student/result/CompetencyChart";
import RecommendationGrid from "@/components/student/result/RecommendationGrid";
import StudyGuidance from "@/components/student/result/StudyGuidance";

type SectionScores = {
  vocabulary: number;
  grammar: number;
  listening: number;
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

export default function StudentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [barsVisible, setBarsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchResult(isPolling = false) {
    try {
      const res = await fetch(`/api/student/result?t=${Date.now()}`);

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
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setResult(data.result);
        setTimeout(() => setBarsVisible(true), 150);
      } else {
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

  useEffect(() => {
    if (result || isLoading || error) return;
    
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) return 98;
        const increment = prev < 30 ? 1.5 : prev < 60 ? 1.0 : prev < 85 ? 0.6 : 0.3;
        const next = prev + increment;
        
        if (next < 35) {
          setActiveStep(0);
        } else if (next < 70) {
          setActiveStep(1);
        } else if (next < 92) {
          setActiveStep(2);
        } else {
          setActiveStep(3);
        }
        
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [result, isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-hanken font-bold text-slate-700 dark:text-slate-350">
            Memuat Hasil Tes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900/90 rounded-3xl p-8 border border-slate-200/50 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-250/50">
            <svg className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="font-hanken text-xl font-bold text-slate-900 dark:text-white">
              Gagal Memuat Hasil
            </h1>
            <p className="font-inter text-sm text-slate-500 dark:text-slate-450">
              {error}
            </p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              void fetchResult();
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-hanken font-bold transition-all cursor-pointer border-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <AIProcessingLoader
        activeStep={activeStep}
        progressPercent={progressPercent}
      />
    );
  }

  const meta = getLevelMeta(result.level);
  const guidance = getGuidance(result.level);
  const totalScore = Math.round(result.overallScore);
  const completedDate = new Date(result.completedAt).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 flex flex-col font-inter transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 px-6 py-4 transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo className="h-10 w-32" />
          </Link>
          <Link
            href="/student"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-inter text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Score Banner */}
        <ResultHero
          totalScore={totalScore}
          level={result.level}
          cefrLevel={result.cefrLevel}
          completedDate={completedDate}
          meta={meta}
        />

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Competency breakdown with 6-axis Radar Chart */}
            <CompetencyChart scores={result.scores} barsVisible={barsVisible} />

            {/* Action Recommendations */}
            <RecommendationGrid scores={result.scores} />
          </div>

          {/* Right Column (1/3 width) */}
          <StudyGuidance level={result.level} guidance={guidance} />
        </div>
      </main>
    </div>
  );
}
