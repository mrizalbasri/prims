"use client";
export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type User = {
  id: string;
  fullName: string;
  email: string;
  cohort: string;
  major: string;
  hasModuleAccess: boolean;
};

type Result = {
  totalScore: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  computedAt: string;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function loadData() {
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
        if (resultData.result) {
          setResult(resultData.result);
        } else {
          router.push("/student/test");
          return;
        }
      } else {
        router.push("/student/test");
        return;
      }

      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-primary">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const levelColor = result?.level === "Advanced" ? "text-status-advanced" : 
                     result?.level === "Intermediate" ? "text-status-intermediate" : 
                     "text-status-beginner";

  const levelBg = result?.level === "Advanced" ? "bg-status-advanced/10" : 
                  result?.level === "Intermediate" ? "bg-status-intermediate/10" : 
                  "bg-status-beginner/10";

  const learningModules = [
    {
      title: "Vocabulary Learning",
      description: "Pelajari kosakata baru dengan sistem flashcard dan spaced repetition",
      icon: "book",
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/student/vocabulary",
      available: true
    },
    {
      title: "Writing Practice",
      description: "Latih kemampuan menulis dengan AI feedback dan scoring",
      icon: "draw",
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/student/writing",
      available: true
    },
    {
      title: "Speaking Practice",
      description: "Praktikkan speaking dengan skenario real-world dan AI scoring",
      icon: "mic",
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/student/speaking",
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-hanken text-2xl font-bold text-primary tracking-tight"><Image src="/logo.webp" alt="Logo" width={32} height={32} /> PRISM</Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
              <div className="text-left">
                <p className="font-hanken text-sm font-bold text-primary">{user?.fullName}</p>
                <p className="font-inter text-xs text-on-surface-variant">{user?.cohort} • {user?.major}</p>
              </div>
            </div>
            
            <button 
              onClick={() => void handleLogout()}
              className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors font-inter text-sm font-medium"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-10 space-y-10">
        {/* Welcome Section */}
        <div>
          <h1 className="font-hanken text-3xl md:text-4xl font-bold text-primary mb-2">
            Selamat Datang, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="font-inter text-on-surface-variant">
            Lanjutkan perjalanan belajar bahasa Inggris Anda dengan modul pembelajaran interaktif.
          </p>
        </div>

        {/* Test Result Card (if available) */}
        {result ? (
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 md:p-8 text-on-primary shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-on-primary/80 text-xs font-bold uppercase tracking-widest mb-2">Hasil Tes Penempatan</p>
                <div className="flex items-baseline gap-4 mb-3">
                  <h2 className="font-hanken text-5xl font-bold">{result.totalScore}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${levelBg} ${levelColor}`}>
                    {result.level}
                  </span>
                </div>
                <p className="text-on-primary/70 text-sm">
                  Tes diselesaikan pada {new Date(result.computedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Link 
                href="/student/result"
                className="inline-flex items-center gap-2 bg-on-primary/20 backdrop-blur-sm text-on-primary font-hanken font-bold px-6 py-3 rounded-xl hover:bg-on-primary/30 transition-all group"
              >
                Lihat Detail
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">assignment</span>
            <h2 className="font-hanken text-xl font-bold text-primary mb-2">Belum Ada Hasil Tes</h2>
            <p className="font-inter text-on-surface-variant mb-6">Mulai tes penempatan untuk mengetahui level bahasa Inggris Anda.</p>
            <Link 
              href="/student/test"
              className="inline-flex items-center gap-2 bg-primary text-on-primary font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all group"
            >
              Mulai Tes Sekarang
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        )}

        {/* Learning Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-hanken text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">school</span>
              Modul Pembelajaran
            </h2>
            {result && (
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low px-3 py-1 rounded-full">
                Level: {result.level}
              </span>
            )}
          </div>

          {!user?.hasModuleAccess ? (
            <div className="bg-surface-container-lowest rounded-2xl border-2 border-outline-variant p-8 text-center max-w-2xl mx-auto shadow-sm">
              <span className="material-symbols-outlined text-5xl text-error mb-4">lock</span>
              <h3 className="font-hanken text-xl font-bold text-primary mb-2">Modul Terkunci</h3>
              <p className="font-inter text-on-surface-variant mb-6 text-sm">
                Anda membutuhkan token akses dari dosen Anda untuk membuka modul pembelajaran ini.
              </p>
              
              <form onSubmit={handleVerifyToken} className="max-w-xs mx-auto">
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Masukkan Token Dosen"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-jetbrains text-center tracking-widest text-primary"
                    required
                  />
                  {tokenError && (
                    <p className="text-error text-xs font-inter font-medium">{tokenError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isVerifying || !tokenInput.trim()}
                    className="w-full bg-primary text-on-primary font-hanken font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">key</span>
                        Buka Akses Modul
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningModules.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 hover:shadow-xl hover:border-secondary/50 transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl ${module.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined ${module.color} text-3xl`}>{module.icon}</span>
                  </div>
                  
                  <h3 className="font-hanken text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                    {module.title}
                  </h3>
                  <p className="font-inter text-sm text-on-surface-variant mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-secondary font-hanken text-sm font-bold">
                    Mulai Belajar
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <h3 className="font-hanken text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">insights</span>
            Statistik Pembelajaran
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-3xl text-blue-600 mb-2 inline-block">book</span>
              <p className="font-jetbrains text-2xl font-bold text-primary">0</p>
              <p className="font-inter text-xs text-on-surface-variant">Vocab Dipelajari</p>
            </div>
            <div className="text-center p-4 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-3xl text-orange-600 mb-2 inline-block">draw</span>
              <p className="font-jetbrains text-2xl font-bold text-primary">0</p>
              <p className="font-inter text-xs text-on-surface-variant">Esai Ditulis</p>
            </div>
            <div className="text-center p-4 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-3xl text-red-600 mb-2 inline-block">mic</span>
              <p className="font-jetbrains text-2xl font-bold text-primary">0</p>
              <p className="font-inter text-xs text-on-surface-variant">Sesi Speaking</p>
            </div>
            <div className="text-center p-4 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-3xl text-green-600 mb-2 inline-block">local_fire_department</span>
              <p className="font-jetbrains text-2xl font-bold text-primary">0</p>
              <p className="font-inter text-xs text-on-surface-variant">Hari Streak</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
