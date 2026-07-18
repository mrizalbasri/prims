"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { RadarChart } from "@/components/student/RadarChart";
import { WelcomeOverlay } from "@/components/student/WelcomeOverlay";
import { TokenForm } from "@/components/student/TokenForm";
import { StudyModules } from "@/components/student/StudyModules";
import { StatsSection } from "@/components/student/StatsSection";

type User = {
  id: string;
  fullName: string;
  email: string;
  cohort: string;
  major: string;
  hasModuleAccess: boolean;
  allowRetake: boolean;
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
    total?: number;
  };
  overallScore: number;
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
  const [isStartingRetake, setIsStartingRetake] = useState(false);
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

  async function handleRetakeTest() {
    const confirmRetake = window.confirm(
      "Apakah Anda yakin ingin mengulang Placement Test? Hasil tes Anda sebelumnya akan diarsipkan dan Anda dapat mengukur perkembangan kemampuan Anda melalui tes baru ini."
    );
    if (!confirmRetake) return;

    setIsStartingRetake(true);
    try {
      const res = await fetch("/api/test/start", { method: "POST" });
      if (res.ok) {
        router.push("/student/test");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memulai tes baru.");
        setIsStartingRetake(false);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat memulai tes.");
      setIsStartingRetake(false);
    }
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
    } catch {
      setTokenError("Terjadi kesalahan sistem");
    } finally {
      setIsVerifying(false);
    }
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
        {/* 1. KONDISI BELUM TES: Tampilkan Banner Placement Test Saja */}
        {!result && showWelcome && (
          <WelcomeOverlay onStartTest={() => router.push('/student/test')} />
        )}

        {/* 2. KONDISI SUDAH TES: Tampilkan Hasil Ujian */}
        {result && (
          <div className="bg-white dark:bg-gray-855 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            {/* Left Result Details */}
            <div className="lg:col-span-7 space-y-6 w-full">
              {/* Restored Clean Score Header */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-550 tracking-widest block">
                  Hasil Ujian Placement Test Anda
                </span>
                <div className="flex items-baseline gap-2">
                  <h2 className="font-hanken text-6xl font-black text-gray-900 dark:text-white leading-none">
                    {Math.round(result.overallScore)}
                  </h2>
                  <span className="text-sm font-bold text-gray-400">/ 100</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${levelBg} ${levelColor}`}>
                    <span className="material-symbols-outlined text-sm">verified</span>
                    {levelNameFormatted}
                  </div>
                  <span className="text-xs text-gray-450 dark:text-gray-500 font-medium">
                    Diuji pada {new Date(result.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Insights Card */}
              <div className="flex gap-3 bg-gray-50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-left">
                <span className="material-symbols-outlined text-teal-650 dark:text-teal-400 text-xl flex-shrink-0 mt-0.5">insights</span>
                <div className="space-y-1">
                  <h5 className="font-hanken font-bold text-xs text-gray-800 dark:text-gray-200">Rangkuman Hasil Ujian</h5>
                  <p className="font-inter text-xs text-gray-555 dark:text-gray-400 leading-relaxed">
                    {result.levelDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  href="/student/result"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white font-hanken font-bold text-xs px-6 py-3.5 rounded-xl hover:shadow-lg transition-all group shadow-sm shadow-blue-500/10"
                >
                  Lihat Detail Hasil & Rekomendasi
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>

                {user?.allowRetake && (
                  <button
                    type="button"
                    onClick={handleRetakeTest}
                    disabled={isStartingRetake}
                    className="inline-flex items-center gap-2 border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-205 font-hanken font-bold text-xs px-6 py-3.5 rounded-xl hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">replay</span>
                    {isStartingRetake ? "Mempersiapkan Ujian..." : "Ambil Tes Ulang"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Radar Chart Sub-component */}
            <div className="lg:col-span-5 w-full flex items-center justify-center">
              <RadarChart scores={{ ...result.scores, total: result.overallScore }} borderless />
            </div>
          </div>
        )}

        {/* 3. KONDISI SUDAH TES TAPI BELUM MEMILIKI AKSES MODUL: Tampilkan Form Input Token */}
        {result && !user?.hasModuleAccess && (
          <TokenForm
            tokenInput={tokenInput}
            setTokenInput={setTokenInput}
            onSubmit={handleVerifyToken}
            isVerifying={isVerifying}
            tokenError={tokenError}
          />
        )}

        {/* 4. KONDISI SUDAH TES DAN MEMILIKI AKSES MODUL: Tampilkan Modul Latihan & Statistik */}
        {result && user?.hasModuleAccess && (
          <>
            <StudyModules levelNameFormatted={levelNameFormatted} />
            <StatsSection
              vocabLearned={learningStats.vocabLearned}
              writingCount={learningStats.writingCount}
              speakingCount={learningStats.speakingCount}
              streak={learningStats.streak}
            />
          </>
        )}
      </main>
    </div>
  );
}
