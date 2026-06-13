"use client";
export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsReviewed: 0,
    correctAnswers: 0,
    streak: 0
  });
  const [selectedLevel, setSelectedLevel] = useState<"all" | "Beginner" | "Intermediate" | "Advanced">("all");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadCards() {
      const res = await fetch("/api/vocabulary/cards");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setCards(data.cards || []);
      setIsLoading(false);
    }

    void loadCards();
  }, [router]);

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0;

  const filteredCards = selectedLevel === "all" 
    ? cards 
    : cards.filter(card => card.level === selectedLevel);

  async function handleReview(quality: 1 | 2 | 3 | 4 | 5) {
    if (!currentCard) return;

    const res = await fetch("/api/vocabulary/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cardId: currentCard.id,
        quality
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
  }

  function resetSession() {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowResults(false);
    setSessionStats({
      cardsReviewed: 0,
      correctAnswers: 0,
      streak: 0
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-primary">Memuat Flashcard...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const accuracy = sessionStats.cardsReviewed > 0 
      ? Math.round((sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100) 
      : 0;

    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
          <div className="max-w-container-max mx-auto flex justify-between items-center">
            <Link href="/student" className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</Link>
            <Link href="/student" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium">
              <span className="material-symbols-outlined">arrow_back</span>
              Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-margin-mobile md:px-gutter py-10">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 md:p-12 text-center shadow-xl">
            <span className="material-symbols-outlined text-6xl text-secondary mb-6 inline-block" style={{ fontVariationSettings: "'FILL' 1" }}>
              celebration
            </span>
            <h1 className="font-hanken text-3xl font-bold text-primary mb-4">Sesi Selesai!</h1>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-surface-container-low rounded-2xl p-6">
                <span className="material-symbols-outlined text-3xl text-blue-600 mb-2 inline-block">style</span>
                <p className="font-jetbrains text-3xl font-bold text-primary">{sessionStats.cardsReviewed}</p>
                <p className="font-inter text-xs text-on-surface-variant">Kartu Direview</p>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-6">
                <span className="material-symbols-outlined text-3xl text-green-600 mb-2 inline-block">check_circle</span>
                <p className="font-jetbrains text-3xl font-bold text-primary">{accuracy}%</p>
                <p className="font-inter text-xs text-on-surface-variant">Akurasi</p>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-6">
                <span className="material-symbols-outlined text-3xl text-orange-600 mb-2 inline-block">local_fire_department</span>
                <p className="font-jetbrains text-3xl font-bold text-primary">{sessionStats.streak}</p>
                <p className="font-inter text-xs text-on-surface-variant">Streak Terbaik</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetSession}
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all group"
              >
                <span className="material-symbols-outlined">refresh</span>
                Ulangi Sesi
              </button>
              <Link
                href="/student"
                className="inline-flex items-center justify-center gap-2 bg-surface-container-high text-primary font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all border border-outline-variant"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
          <div className="max-w-container-max mx-auto flex justify-between items-center">
            <Link href="/student" className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</Link>
            <Link href="/student" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium">
              <span className="material-symbols-outlined">arrow_back</span>
              Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-margin-mobile md:px-gutter py-10">
          <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">style</span>
            <h2 className="font-hanken text-xl font-bold text-primary mb-2">Belum Ada Kartu Vocabulary</h2>
            <p className="font-inter text-on-surface-variant">Kartu vocabulary akan tersedia setelah database di-seed.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/student" className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</Link>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-200">
              Vocabulary
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-orange-600">local_fire_department</span>
              <span className="font-jetbrains font-bold text-primary">{sessionStats.streak}</span>
            </div>
            <Link href="/student" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium">
              <span className="material-symbols-outlined">close</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="h-1 w-full bg-surface-container-high">
        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="max-w-4xl mx-auto px-margin-mobile md:px-gutter py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-hanken text-2xl font-bold text-primary mb-1">Vocabulary Flashcards</h1>
            <p className="font-inter text-sm text-on-surface-variant">
              Kartu {currentCardIndex + 1} dari {cards.length}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
            <span className="font-jetbrains font-bold text-primary">{sessionStats.correctAnswers}/{sessionStats.cardsReviewed}</span>
          </div>
        </div>

        {currentCard && (
          <div className="mb-8">
            <div 
              className="relative w-full h-96 cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                  <span className="material-symbols-outlined text-white text-5xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
                    book
                  </span>
                  <h2 className="font-hanken text-5xl md:text-6xl font-bold text-white mb-4">
                    {currentCard.word}
                  </h2>
                  <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentCard.level}
                  </span>
                  <p className="mt-8 text-white/70 text-sm font-inter">Klik untuk melihat definisi</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 md:p-12 flex flex-col justify-center shadow-2xl">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Definisi</p>
                    <p className="font-inter text-lg text-primary leading-relaxed">
                      {currentCard.definition}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-outline-variant">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Contoh Penggunaan</p>
                    <p className="font-inter text-sm text-on-surface-variant italic">
                      "{currentCard.example}"
                    </p>
                  </div>

                  <p className="mt-8 text-on-surface-variant text-xs font-inter text-center">Klik untuk kembali</p>
                </div>
              </div>
            </div>

            {isFlipped && (
              <div className="mt-8 space-y-4">
                <p className="text-center font-hanken text-sm font-bold text-primary mb-4">Seberapa baik Anda mengingat kata ini?</p>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { quality: 1, label: "Tidak Ingat", color: "bg-red-500 hover:bg-red-600", icon: "sentiment_very_dissatisfied" },
                    { quality: 2, label: "Sulit", color: "bg-orange-500 hover:bg-orange-600", icon: "sentiment_dissatisfied" },
                    { quality: 3, label: "Cukup", color: "bg-yellow-500 hover:bg-yellow-600", icon: "sentiment_neutral" },
                    { quality: 4, label: "Baik", color: "bg-green-500 hover:bg-green-600", icon: "sentiment_satisfied" },
                    { quality: 5, label: "Mudah", color: "bg-blue-500 hover:bg-blue-600", icon: "sentiment_very_satisfied" }
                  ].map((option) => (
                    <button
                      key={option.quality}
                      onClick={() => handleReview(option.quality as 1 | 2 | 3 | 4 | 5)}
                      className={`${option.color} text-white rounded-xl p-4 transition-all hover:shadow-lg flex flex-col items-center gap-2 group`}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {option.icon}
                      </span>
                      <span className="font-hanken text-xs font-bold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <h3 className="font-hanken text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">info</span>
            Sistem Spaced Repetition
          </h3>
          <p className="font-inter text-xs text-on-surface-variant leading-relaxed">
            Kartu akan muncul kembali berdasarkan seberapa baik Anda mengingatnya. Semakin mudah Anda mengingat, semakin lama interval review berikutnya.
          </p>
        </div>
      </main>
    </div>
  );
}
