"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type User = {
  id: string;
  fullName: string;
  email: string;
  cohort: string;
  major: string;
  hasModuleAccess: boolean;
};

type Result = {
  testAttemptId: string;
  completedAt: string;
  scores: {
    vocabulary: number;
    grammar: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  };
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  levelDescription: string;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [learningStats, setLearningStats] = useState({
    vocabLearned: 0,
    writingCount: 0,
    speakingCount: 0,
    streak: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Load user info
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        // Load test result if available
        const resultRes = await fetch("/api/student/result");
        if (resultRes.ok) {
          const resultData = await resultRes.json();
          if (resultData.hasResult && resultData.result) {
            setResult(resultData.result);
          } else {
            // Show welcome screen instead of auto-redirect
            setShowWelcome(true);
          }
        } else {
          // Show welcome screen instead of auto-redirect
          setShowWelcome(true);
        }

        // Load real learning stats in parallel
        const statsRes = await fetch("/api/student/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setLearningStats(statsData);
        }
      } catch (err) {
        console.error("Dashboard load data error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleVerifyToken(e: React.FormEvent) {
    e.preventDefault();
    setTokenError(null);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/student/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTokenError(data.error || "Token tidak valid");
      } else {
        // Success
        if (user) {
          setUser({ ...user, hasModuleAccess: true });
        }
      }
    } catch (err) {
      setTokenError("Terjadi kesalahan sistem");
    } finally {
      setIsVerifying(false);
    }
  }

  // Helper function to calculate SVG Radar Chart points dynamically
  function getRadarPoints(scores: Result["scores"]) {
    const vRadius = 40 * (scores.vocabulary / 100);
    const gRadius = 40 * (scores.grammar / 100);
    const rRadius = 40 * (scores.reading / 100);
    const wRadius = 40 * (scores.writing / 100);
    const sRadius = 40 * (scores.speaking / 100);

    // Center of SVG is at (50, 50)
    // Angles: Vocab = 0deg (up), Grammar = 72deg, Reading = 144deg, Writing = 216deg, Speaking = 288deg
    const x0 = 50;
    const y0 = 50 - vRadius;

    const x1 = 50 + gRadius * Math.cos(18 * Math.PI / 180);
    const y1 = 50 - gRadius * Math.sin(18 * Math.PI / 180);

    const x2 = 50 + rRadius * Math.cos(54 * Math.PI / 180);
    const y2 = 50 + rRadius * Math.sin(54 * Math.PI / 180);

    const x3 = 50 - wRadius * Math.cos(54 * Math.PI / 180);
    const y3 = 50 + wRadius * Math.sin(54 * Math.PI / 180);

    const x4 = 50 - sRadius * Math.cos(18 * Math.PI / 180);
    const y4 = 50 - sRadius * Math.sin(18 * Math.PI / 180);

    return `${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const levelNameFormatted = result ? result.level.charAt(0) + result.level.slice(1).toLowerCase() : "";

  const levelColor = result?.level === "ADVANCED" ? "text-green-600 dark:text-green-400" : 
                     result?.level === "INTERMEDIATE" ? "text-yellow-600 dark:text-yellow-400" : 
                     "text-red-600 dark:text-red-400";

  const levelBg = result?.level === "ADVANCED" ? "bg-green-50 dark:bg-green-500/10 border-green-200/50" : 
                  result?.level === "INTERMEDIATE" ? "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200/50" : 
                  "bg-red-50 dark:bg-red-500/10 border-red-200/50";

  const learningModules = [
    {
      title: "Vocabulary Learning",
      description: "Pelajari kosakata akademik baru dengan sistem flashcard dan spaced repetition.",
      icon: "style",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "hover:border-blue-500/40",
      href: "/student/vocabulary"
    },
    {
      title: "Writing Practice",
      description: "Latih kemampuan menulis esai akademik dengan umpan balik dan penilaian dari AI.",
      icon: "edit_document",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "hover:border-orange-500/40",
      href: "/student/writing"
    },
    {
      title: "Speaking Practice",
      description: "Praktikkan kelancaran berbicara lisan dengan simulasi skenario real-world dan penilaian AI.",
      icon: "record_voice_over",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "hover:border-red-500/40",
      href: "/student/speaking"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo className="h-11 w-36" />
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="material-symbols-outlined text-gray-400 text-xl">account_circle</span>
              <div className="text-left">
                <p className="font-hanken text-sm font-bold text-gray-800 dark:text-white">{user?.fullName}</p>
                <p className="font-inter text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-wider">{user?.cohort} • {user?.major}</p>
              </div>
            </div>
            
            <button 
              onClick={() => void handleLogout()}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-inter text-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="font-hanken text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Selamat Datang Kembali, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Lanjutkan perjalanan akademik dan peningkatan kompetensi bahasa Inggris Anda hari ini.
          </p>
        </div>

        {/* Test Result Card or Pre-Test Banner */}
        {result ? (
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-md p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Result Details */}
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">
                  Hasil Ujian Placement Test Anda
                </span>
                <div className="flex items-baseline gap-4">
                  <h2 className="font-hanken text-6xl font-black text-gray-900 dark:text-white">
                    {result.scores.total}
                  </h2>
                  <span className="text-sm font-semibold text-gray-400">/ 100</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${levelBg} ${levelColor}`}>
                    <span className="material-symbols-outlined text-base">verified</span>
                    {levelNameFormatted}
                  </div>
                  <div className="text-xs text-gray-400 font-inter">
                    Diuji pada {new Date(result.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {result.levelDescription}
                </p>
              </div>

              <div>
                <Link 
                  href="/student/result"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all group"
                >
                  Lihat Detail Hasil & Rekomendasi
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Right Radar Chart SVG */}
            <div className="w-full lg:w-80 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex-shrink-0">
              <span className="font-hanken text-xs font-bold text-gray-400 dark:text-gray-300 tracking-wider mb-4 uppercase">
                Skill Breakdown Chart
              </span>
              <div className="w-48 h-48 relative">
                <svg className="w-full h-full text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                  {/* Outlines */}
                  <polygon className="text-gray-200 dark:text-gray-700" points="50,10 90,40 75,90 25,90 10,40" strokeWidth="0.5"></polygon>
                  <polygon className="text-gray-200/50 dark:text-gray-750" points="50,25 80,47.5 68.75,70 31.25,70 20,47.5" strokeWidth="0.5"></polygon>
                  <polygon className="text-gray-255/20 dark:text-gray-800" points="50,40 70,55 62.5,50 37.5,50 30,55" strokeWidth="0.5"></polygon>
                  
                  {/* Axis */}
                  <line x1="50" y1="50" x2="50" y2="10" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
                  <line x1="50" y1="50" x2="90" y2="40" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
                  <line x1="50" y1="50" x2="75" y2="90" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
                  <line x1="50" y1="50" x2="25" y2="90" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
                  <line x1="50" y1="50" x2="10" y2="40" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>

                  {/* Dynamic Points Polygon */}
                  <polygon 
                    className="text-blue-600 dark:text-blue-400 fill-blue-600/20 dark:fill-blue-400/20" 
                    points={getRadarPoints(result.scores)} 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  ></polygon>
                  
                  {/* Axis labels */}
                  <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="middle" x="50" y="6">VOC</text>
                  <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="start" x="92" y="41">GRA</text>
                  <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="middle" x="78" y="96">REA</text>
                  <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="middle" x="22" y="96">WRI</text>
                  <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="end" x="8" y="41">SPE</text>
                </svg>
              </div>
            </div>
          </div>
        ) : showWelcome ? (
          /* ── Pre-Test Welcome Banner ── */
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                  <span className="material-symbols-outlined text-sm">school</span>
                  PRISM Placement Test
                </div>
                <h2 className="font-hanken text-3xl md:text-4xl font-black leading-tight">
                  Selesaikan Placement Test Anda 🚀
                </h2>
                <p className="font-inter text-sm text-blue-100 leading-relaxed max-w-lg">
                  Sebelum mengakses modul belajar mandiri, Anda perlu menyelesaikan <strong>Adaptive Placement Test</strong> terlebih dahulu untuk mengukur kemampuan bahasa Inggris akademik Anda.
                </p>
                <button
                  onClick={() => router.push('/student/test')}
                  className="inline-flex items-center gap-3 bg-white text-blue-700 font-hanken font-black px-8 py-4 rounded-2xl hover:bg-blue-50 hover:shadow-xl transition-all group text-base cursor-pointer border-0"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  Mulai Placement Test
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>

              {/* Stats panel */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 grid grid-cols-2 gap-4 min-w-[220px]">
                {[
                  { label: 'Sections', value: '5', icon: 'layers' },
                  { label: 'Duration', value: '~45 min', icon: 'schedule' },
                  { label: 'Questions', value: '50+', icon: 'quiz' },
                  { label: 'Result', value: 'Instant', icon: 'bolt' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <span className="material-symbols-outlined text-blue-200 text-2xl">{s.icon}</span>
                    <p className="font-hanken text-xl font-black text-white">{s.value}</p>
                    <p className="font-inter text-[10px] text-blue-200 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Learning Modules Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-hanken text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">school</span>
              Modul Pembelajaran Mandiri
            </h2>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200/20">
              Level: {result ? levelNameFormatted : "Belum Tes"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningModules.map((module, idx) => {
              const cardContent = (
                <>
                  <div>
                    <div className={`w-14 h-14 rounded-xl ${module.bg} ${module.color} flex items-center justify-center mb-6 transition-transform border border-current/10 ${result ? 'group-hover:scale-110' : ''}`}>
                      <span className="material-symbols-outlined text-3xl">{module.icon}</span>
                    </div>
                    
                    <h3 className={`font-hanken text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors ${result ? 'group-hover:text-blue-600' : ''}`}>
                      {module.title}
                    </h3>
                    
                    <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                      {module.description}
                    </p>
                  </div>
                  
                  {result ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-hanken text-sm font-bold">
                      Mulai Latihan
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-hanken text-sm font-bold">
                      <span className="material-symbols-outlined text-lg">lock</span>
                      Terkunci (Butuh Placement Test)
                    </div>
                  )}
                </>
              );

              return result ? (
                <Link
                  key={idx}
                  href={module.href}
                  className={`group bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-xl transition-all flex flex-col justify-between ${module.border}`}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={idx}
                  title="Selesaikan Placement Test terlebih dahulu untuk membuka modul ini"
                  className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 flex flex-col justify-between opacity-60 cursor-not-allowed select-none"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-hanken text-lg font-bold text-gray-950 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">insights</span>
            Statistik Perkembangan Belajar
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Vocab Dipelajari", score: learningStats.vocabLearned, icon: "style", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
              { label: "Esai Ditulis", score: learningStats.writingCount, icon: "edit_document", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10" },
              { label: "Sesi Speaking", score: learningStats.speakingCount, icon: "record_voice_over", color: "text-red-600 bg-red-50 dark:bg-red-500/10" },
              { label: "Streak Belajar", score: learningStats.streak, icon: "local_fire_department", color: "text-green-600 bg-green-50 dark:bg-green-500/10" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className={`material-symbols-outlined text-3xl p-2.5 rounded-xl mb-3 inline-block ${stat.color} ${!result ? 'opacity-40' : ''}`}>
                  {stat.icon}
                </span>
                <p className="font-mono text-3xl font-black text-gray-900 dark:text-white">
                  {stat.score}
                </p>
                <p className="font-inter text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
