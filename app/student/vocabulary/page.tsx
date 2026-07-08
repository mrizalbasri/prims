"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type VocabularyCard = {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  reviewCount: number;
  lastReviewed: string | null;
  nextReview: string | null;
};

type SessionStats = {
  cardsReviewed: number;
  correctAnswers: number;
  streak: number;
};

export default function VocabularyPage() {
  const router = useRouter();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [category, setCategory] = useState<string>("ALL");
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsReviewed: 0,
    correctAnswers: 0,
    streak: 0
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
      }
    }
    void checkAuth();
  }, [router]);

  async function startSession() {
    setIsLoading(true);
    setSessionStarted(true);
    try {
      const url = category === 'ALL' 
        ? "/api/vocabulary/cards" 
        : `/api/vocabulary/cards?category=${category}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        if (res.status === 403) router.push("/student");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const mappedCards = (data.cards || []).map((card: any) => ({
        id: card.id,
        word: card.term,
        definition: card.meaning,
        example: card.exampleSentence || "",
        level: card.difficulty === 'HARD' ? 'Advanced' :
               card.difficulty === 'MEDIUM' ? 'Intermediate' : 'Beginner',
        reviewCount: card.progress?.repetitionCount || 0,
        lastReviewed: card.progress?.lastReviewedAt || null,
        nextReview: null
      }));
      setCards(mappedCards);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0;

  async function handleReview(quality: 1 | 2 | 3 | 4 | 5) {
    if (!currentCard) return;

    try {
      const res = await fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          quality,
          correct: quality >= 3
        })
      });

      if (!res.ok) return;

      const isCorrect = quality >= 3;
      setSessionStats(prev => ({
        cardsReviewed: prev.cardsReviewed + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        streak: isCorrect ? prev.streak + 1 : 0
      }));

      if (currentCardIndex + 1 >= cards.length) {
        setShowResults(true);
      } else {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Review submission error:", err);
    }
  }

  function resetSession() {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowResults(false);
    setSessionStarted(false);
    setSessionStats({
      cardsReviewed: 0,
      correctAnswers: 0,
      streak: 0
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">Memuat Flashcard...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const accuracy = sessionStats.cardsReviewed > 0 
      ? Math.round((sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100) 
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/student" className="flex items-center">
              <Logo className="h-8 w-24" />
            </Link>
            <Link href="/student" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-inter text-sm font-semibold cursor-pointer">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Dashboard
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 text-center shadow-xl space-y-8">
            <div className="space-y-3">
              <span className="material-symbols-outlined text-6xl text-yellow-500 animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                celebration
              </span>
              <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Sesi Belajar Selesai!</h1>
              <p className="font-inter text-sm text-gray-400 dark:text-gray-300">Pekerjaan luar biasa! Ingatan Anda berkembang semakin kuat.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <span className="material-symbols-outlined text-2xl text-blue-600 mb-1.5 inline-block">style</span>
                <p className="font-mono text-2xl font-black text-gray-900 dark:text-white">{sessionStats.cardsReviewed}</p>
                <p className="font-inter text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Kartu Direview</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <span className="material-symbols-outlined text-2xl text-green-600 mb-1.5 inline-block">check_circle</span>
                <p className="font-mono text-2xl font-black text-gray-900 dark:text-white">{accuracy}%</p>
                <p className="font-inter text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Akurasi</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <span className="material-symbols-outlined text-2xl text-orange-600 mb-1.5 inline-block">local_fire_department</span>
                <p className="font-mono text-2xl font-black text-gray-900 dark:text-white">{sessionStats.streak}</p>
                <p className="font-inter text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Streak Terbaik</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={resetSession}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">refresh</span>
                Ulangi Sesi
              </button>
              <Link
                href="/student"
                className="inline-flex items-center justify-center gap-2 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-hanken font-bold px-8 py-3.5 rounded-xl transition-all border border-transparent dark:border-gray-700 cursor-pointer"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/student" className="flex items-center">
              <Logo className="h-8 w-24" />
            </Link>
            <Link href="/student" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-inter text-sm font-semibold cursor-pointer">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Dashboard
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 text-center shadow-xl space-y-8 animate-fadeIn">
            <div className="space-y-3">
              <span className="material-symbols-outlined text-6xl text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                style
              </span>
              <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Latihan Kosakata</h1>
              <p className="font-inter text-sm text-gray-505 dark:text-gray-400">
                Pilih kategori kosa kata akademik yang ingin Anda pelajari hari ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                { id: 'ALL', label: 'Semua Kategori', icon: 'all_inclusive', desc: 'Pelajari semua kategori kata' },
                { id: 'ACADEMIC', label: 'Academic', icon: 'history_edu', desc: 'Kata umum perkuliahan & jurnal' },
                { id: 'BUSINESS', label: 'Business', icon: 'business_center', desc: 'Kata presentasi & negosiasi' },
                { id: 'TECHNICAL', label: 'Technical', icon: 'terminal', desc: 'Kosakata teknis & sains' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  type="button"
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col gap-3 group cursor-pointer ${
                    category === cat.id 
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10' 
                      : 'border-gray-150 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${category === cat.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}>
                    {cat.icon}
                  </span>
                  <div>
                    <h4 className="font-hanken font-bold text-sm text-gray-900 dark:text-white">{cat.label}</h4>
                    <p className="font-inter text-[10px] text-gray-450 dark:text-gray-500 leading-normal">{cat.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={startSession}
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-hanken text-base font-bold py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 animate-fadeIn"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Mulai Sesi Belajar
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/student" className="flex items-center">
              <Logo className="h-8 w-24" />
            </Link>
            <Link href="/student" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-inter text-sm font-semibold cursor-pointer">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Dashboard
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-12 text-center space-y-4 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              style
            </span>
            <h2 className="font-hanken text-xl font-bold text-gray-800 dark:text-white">Belum Ada Kartu Vocabulary</h2>
            <p className="font-inter text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Kartu kosakata belum tersedia di database. Mintalah admin kampus untuk memuat bank soal/kata terlebih dahulu.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const levelColor = currentCard?.level === "Advanced" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                     currentCard?.level === "Intermediate" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                     "bg-red-500/20 text-red-600 dark:text-red-400";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/student" className="flex items-center">
              <Logo className="h-8 w-24" />
            </Link>
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/20">
              Vocabulary Flashcards
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/30">
              <span className="material-symbols-outlined text-orange-600">local_fire_department</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{sessionStats.streak}</span>
            </div>
            <Link href="/student" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800">
        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-10 flex flex-col justify-center space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-0.5">
              Flashcard Deck
            </span>
            <h1 className="font-hanken text-xl font-bold text-gray-950 dark:text-white">
              Kartu {currentCardIndex + 1} dari {cards.length}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-200/40 px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span className="font-mono text-sm font-bold text-green-600 dark:text-green-400">{sessionStats.correctAnswers} / {sessionStats.cardsReviewed}</span>
          </div>
        </div>

        {currentCard && (
          <div className="space-y-8">
            <div 
              className="relative w-full h-[360px] cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-xl border border-blue-500/30">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      style
                    </span>
                  </div>
                  <h2 className="font-hanken text-4xl md:text-5xl font-black text-white tracking-tight mb-4 select-none">
                    {currentCard.word}
                  </h2>
                  <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                    {currentCard.level}
                  </span>
                  <p className="absolute bottom-6 text-white/50 text-xs font-inter uppercase tracking-widest select-none">
                    Klik kartu untuk membalik
                  </p>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 flex flex-col justify-between shadow-xl">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                      <h2 className="font-hanken text-3xl font-bold text-gray-900 dark:text-white">
                        {currentCard.word}
                      </h2>
                      <span className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${levelColor}`}>
                        {currentCard.level}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Definisi</span>
                      <p className="font-inter text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                        {currentCard.definition}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Contoh Kalimat</span>
                      <p className="font-inter text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        &quot;{currentCard.example}&quot;
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-center text-xs font-inter uppercase tracking-widest select-none pt-4">
                    Klik untuk membalik kembali
                  </p>
                </div>
              </div>
            </div>

            {/* Repetition Quality Buttons */}
            {isFlipped && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-center font-hanken text-sm font-bold text-gray-700 dark:text-gray-300">
                  Seberapa baik Anda mengingat kata ini?
                </p>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-4">
                  {[
                    { quality: 1, label: "Lupa", color: "bg-red-500 hover:bg-red-600 shadow-red-200/50 hover:shadow-red-500/20", icon: "sentiment_very_dissatisfied" },
                    { quality: 2, label: "Sulit", color: "bg-orange-500 hover:bg-orange-600 shadow-orange-200/50 hover:shadow-orange-500/20", icon: "sentiment_dissatisfied" },
                    { quality: 3, label: "Cukup", color: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200/50 hover:shadow-yellow-500/20", icon: "sentiment_neutral" },
                    { quality: 4, label: "Baik", color: "bg-green-500 hover:bg-green-600 shadow-green-200/50 hover:shadow-green-500/20", icon: "sentiment_satisfied" },
                    { quality: 5, label: "Mudah", color: "bg-blue-500 hover:bg-blue-600 shadow-blue-200/50 hover:shadow-blue-500/20", icon: "sentiment_very_satisfied" }
                  ].map((option) => (
                    <button
                      key={option.quality}
                      onClick={() => handleReview(option.quality as 1 | 2 | 3 | 4 | 5)}
                      className={`${option.color} text-white rounded-xl p-2 sm:p-4 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-1 group cursor-pointer hover:-translate-y-0.5`}
                    >
                      <span className="material-symbols-outlined text-xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {option.icon}
                      </span>
                      <span className="font-hanken text-[9px] sm:text-xs font-bold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tip Box */}
        <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-5 flex gap-3.5">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
          <div className="space-y-1">
            <h4 className="font-hanken text-xs font-bold text-gray-900 dark:text-white">
              Sistem Spaced Repetition (SRS)
            </h4>
            <p className="font-inter text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Algoritma PRISM mengatur waktu pemunculan kembali flashcard ini secara cerdas. Kartu yang Anda nilai &quot;Lupa&quot; atau &quot;Sulit&quot; akan muncul kembali lebih sering, sedangkan kata yang dinilai &quot;Mudah&quot; akan diuji kembali setelah interval waktu yang lebih lama.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
