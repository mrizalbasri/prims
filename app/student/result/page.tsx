"use client";
export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import Link from "next/link";

type Result = {
  vocabScore: number;
  grammarScore: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  totalScore: number;
  level: "Beginner" | "Intermediate" | "Advanced";
};

type ResultPayload = {
  status: string;
  result: Result | null;
};

function levelColor(level: Result["level"]): { bg: string; text: string; icon: string } {
  if (level === "Beginner") return { bg: "bg-status-beginner/10", text: "text-status-beginner", icon: "trending_up" };
  if (level === "Intermediate") return { bg: "bg-status-intermediate/10", text: "text-status-intermediate", icon: "star_half" };
  return { bg: "bg-status-advanced/10", text: "text-status-advanced", icon: "workspace_premium" };
}

function levelGuidance(level: Result["level"]): { title: string; description: string; tips: string[] } {
  if (level === "Beginner") {
    return {
      title: "Fondasi yang Kuat",
      description: "Anda berada di tahap awal pembelajaran bahasa Inggris. Fokus pada membangun fondasi yang kuat.",
      tips: [
        "Pelajari grammar dasar dan struktur kalimat sederhana",
        "Latih vocabulary harian dengan flashcard",
        "Dengarkan podcast atau video berbahasa Inggris dengan subtitle",
        "Praktikkan speaking dengan teman atau aplikasi"
      ]
    };
  }
  if (level === "Intermediate") {
    return {
      title: "Tingkatkan Konsistensi",
      description: "Anda memiliki pemahaman yang baik. Saatnya meningkatkan konsistensi dan kepercayaan diri.",
      tips: [
        "Tulis esai atau jurnal mingguan dalam bahasa Inggris",
        "Ikuti diskusi atau debat dalam bahasa Inggris",
        "Baca artikel akademik atau berita internasional",
        "Praktikkan presentasi atau public speaking"
      ]
    };
  }
  return {
    title: "Pertahankan Keunggulan",
    description: "Anda memiliki kemampuan bahasa Inggris yang sangat baik. Pertahankan dan tingkatkan terus.",
    tips: [
      "Baca jurnal akademik dan literatur kompleks",
      "Tulis paper atau artikel ilmiah",
      "Ikuti konferensi atau seminar internasional",
      "Mentoring mahasiswa dengan level lebih rendah"
    ]
  };
}

export default function StudentResultPage() {
  const [payload, setPayload] = useState<ResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      const res = await fetch("/api/student/result");
      if (!res.ok) {
        setError("Gagal memuat hasil tes");
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as ResultPayload;
      setPayload(data);
      setIsLoading(false);
    }

    void load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-primary">Memuat Hasil Tes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
        <div className="max-w-md w-full bg-error-container text-on-error-container rounded-2xl p-8 border border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
            <h1 className="font-hanken text-xl font-bold">Terjadi Kesalahan</h1>
          </div>
          <p className="font-inter mb-6">{error}</p>
          <Link href="/student/test" className="inline-flex items-center gap-2 bg-error text-on-error px-6 py-3 rounded-xl font-hanken font-bold hover:shadow-lg transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Tes
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let interval: number | null = null;
    
    if (payload && !payload.result && payload.status === "PROCESSING") {
      interval = window.setInterval(() => {
        window.location.reload();
      }, 3000);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [payload]);

  if (!payload || !payload.result) {
    const isProcessing = payload?.status === "PROCESSING";
    
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
          {isProcessing ? (
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          ) : (
             <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">pending</span>
          )}
          <h1 className="font-hanken text-2xl font-bold text-primary mb-2">
            {isProcessing ? "AI Sedang Menilai Hasilmu" : "Hasil Belum Tersedia"}
          </h1>
          <p className="font-inter text-on-surface-variant mb-2">
            Status saat ini: <span className="font-bold text-primary">{payload?.status}</span>
          </p>
          <p className="font-inter text-sm text-on-surface-variant mb-6">
            Hasil tes Anda sedang diproses. Silakan cek kembali dalam beberapa saat.
          </p>
          <Link href="/student/test" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-hanken font-bold hover:shadow-lg transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Tes
          </Link>
        </div>
      </div>
    );
  }

  const result = payload.result;
  const levelStyle = levelColor(result.level);
  const guidance = levelGuidance(result.level);

  const sections = [
    { label: "Vocabulary", score: result.vocabScore, icon: "book", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Grammar", score: result.grammarScore, icon: "edit_note", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Reading", score: result.readingScore, icon: "menu_book", color: "text-green-600", bg: "bg-green-50" },
    { label: "Writing", score: result.writingScore, icon: "draw", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Speaking", score: result.speakingScore, icon: "mic", color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <Link href="/" className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</Link>
          <Link href="/student" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium">
            <span className="material-symbols-outlined">arrow_back</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-10 space-y-8">
        {/* Hero Result Card */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-on-primary text-6xl mb-4 inline-block" style={{ fontVariationSettings: "'FILL' 1" }}>
              {levelStyle.icon}
            </span>
            <p className="text-on-primary/80 text-sm font-bold uppercase tracking-widest mb-2">Hasil Tes Penempatan</p>
            <h1 className="font-hanken text-6xl md:text-7xl font-bold text-on-primary mb-4">{result.totalScore}</h1>
            <div className="inline-flex items-center gap-2 bg-on-primary/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="material-symbols-outlined text-on-primary">{levelStyle.icon}</span>
              <span className="font-hanken text-xl font-bold text-on-primary">{result.level}</span>
            </div>
          </div>
        </div>

        {/* Section Scores Grid */}
        <div>
          <h2 className="font-hanken text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">analytics</span>
            Rincian Skor per Seksi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sections.map((section) => (
              <div key={section.label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 rounded-xl ${section.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${section.color} text-2xl`}>{section.icon}</span>
                </div>
                <p className="font-inter text-sm text-on-surface-variant mb-1">{section.label}</p>
                <p className="font-hanken text-3xl font-bold text-primary">{section.score}</p>
                <div className="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${section.bg} transition-all duration-1000`} style={{ width: `${section.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guidance Section */}
        <div className={`${levelStyle.bg} rounded-2xl border-2 ${levelStyle.text} border-current/20 p-8 md:p-10`}>
          <div className="flex items-start gap-4 mb-6">
            <span className={`material-symbols-outlined ${levelStyle.text} text-4xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
              lightbulb
            </span>
            <div>
              <h2 className={`font-hanken text-2xl font-bold ${levelStyle.text} mb-2`}>{guidance.title}</h2>
              <p className={`font-inter ${levelStyle.text} opacity-80`}>{guidance.description}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className={`font-hanken text-sm font-bold ${levelStyle.text} uppercase tracking-wider mb-3`}>Rekomendasi Pembelajaran:</p>
            {guidance.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className={`material-symbols-outlined ${levelStyle.text} text-xl flex-shrink-0 mt-0.5`}>check_circle</span>
                <p className={`font-inter ${levelStyle.text} opacity-90`}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
          <h3 className="font-hanken text-xl font-bold text-primary mb-2">Siap Meningkatkan Kemampuan Anda?</h3>
          <p className="font-inter text-on-surface-variant mb-6">Akses modul pembelajaran interaktif yang disesuaikan dengan level Anda.</p>
          <Link href="/student" className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all group">
            Mulai Belajar Sekarang
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
