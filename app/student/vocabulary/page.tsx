"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import VocabularyFlashcard from "@/components/student/vocabulary/VocabularyFlashcard";
import VocabularySessionResults from "@/components/student/vocabulary/VocabularySessionResults";
import VocabularySessionStart from "@/components/student/vocabulary/VocabularySessionStart";
import type {
  SessionStats,
  VocabularyCard,
  VocabularyCardApi,
} from "@/components/student/vocabulary/types";

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
      const mappedCards: VocabularyCard[] = (data.cards as VocabularyCardApi[] || []).map((card) => ({
        id: card.id,
        word: card.term,
        definition: card.meaning,
        example: card.exampleSentence || "",
        level: card.difficulty === 'HARD' ? 'Advanced' as const :
               card.difficulty === 'MEDIUM' ? 'Intermediate' as const : 'Beginner' as const,
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/student" className="flex items-center"><Logo className="h-8 w-24" /></Link>
            <Link href="/student" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-inter text-sm font-semibold cursor-pointer"><span className="material-symbols-outlined text-lg">arrow_back</span>Dashboard</Link>
          </div>
        </header>
        <VocabularySessionResults stats={sessionStats} onReset={resetSession} />
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/student" className="flex items-center"><Logo className="h-8 w-24" /></Link>
            <Link href="/student" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-inter text-sm font-semibold cursor-pointer"><span className="material-symbols-outlined text-lg">arrow_back</span>Dashboard</Link>
          </div>
        </header>
        <VocabularySessionStart category={category} onCategoryChange={setCategory} onStart={() => void startSession()} />
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
            <Link href="/student" aria-label="Kembali ke dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
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
          <VocabularyFlashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((previous) => !previous)}
            onReview={handleReview}
          />
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
