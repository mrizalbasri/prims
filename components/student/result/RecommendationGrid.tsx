"use client";

import React from "react";
import Link from "next/link";

type Scores = {
  vocabulary: number;
  grammar: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
};

interface RecommendationGridProps {
  scores: Scores;
}

function getSectionGuidance(sectionKey: string, score: number) {
  const getLevelLabel = (s: number) => {
    if (s < 60) {
      return {
        label: "Beginner",
        color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-900/30",
      };
    }
    if (s < 80) {
      return {
        label: "Intermediate",
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-900/30",
      };
    }
    return {
      label: "Advanced",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/30",
    };
  };

  const levelMeta = getLevelLabel(score);
  let recommendation = "";
  let actionLink: { label: string; href: string } | null = null;

  switch (sectionKey) {
    case "vocabulary":
      if (score < 60) {
        recommendation = `Skor Vocabulary Anda adalah ${score} (Beginner). Kami menyarankan Anda fokus melatih modul 'Vocabulary Learning' di menu utama untuk memperluas penguasaan kata dasar bahasa Inggris.`;
      } else if (score < 80) {
        recommendation = `Skor Vocabulary Anda adalah ${score} (Intermediate). Anda disarankan melatih kosakata akademik tingkat menengah ke atas menggunakan sistem flashcard di modul 'Vocabulary Learning'.`;
      } else {
        recommendation = `Skor Vocabulary Anda adalah ${score} (Advanced). Kosakata Anda sudah sangat luas. Terus tingkatkan kemampuan dengan mempelajari kosakata akademik langka dan idiomatik di modul 'Vocabulary Learning'.`;
      }
      actionLink = { label: "Latih Vocabulary", href: "/student/vocabulary" };
      break;

    case "grammar":
      if (score < 60) {
        recommendation = `Skor Grammar Anda adalah ${score} (Beginner). Kami menyarankan Anda fokus melatih tata bahasa dasar (seperti tenses dasar, kesesuaian subjek-kata kerja) terlebih dahulu secara mandiri.`;
      } else if (score < 80) {
        recommendation = `Skor Grammar Anda adalah ${score} (Intermediate). Pelajari lebih dalam struktur kalimat kompleks, klausa adjektiva, dan pengkondisian (conditional sentences) untuk penulisan akademik.`;
      } else {
        recommendation = `Skor Grammar Anda adalah ${score} (Advanced). Penggunaan tata bahasa Anda sangat baik dan akurat. Pertahankan presisi ini dengan melatih variasi gaya struktur kalimat formal.`;
      }
      break;

    case "reading":
      if (score < 60) {
        recommendation = `Skor Reading Anda adalah ${score} (Beginner). Mulailah membaca artikel bahasa Inggris pendek secara konsisten dan fokus melatih teknik skimming untuk mencari ide pokok paragraf.`;
      } else if (score < 80) {
        recommendation = `Skor Reading Anda adalah ${score} (Intermediate). Tingkatkan pemahaman membaca Anda dengan teks opini atau esai akademik yang lebih panjang, lalu fokus pada kohesi dan simpulan tersirat.`;
      } else {
        recommendation = `Skor Reading Anda adalah ${score} (Advanced). Pemahaman membaca Anda luar biasa. Latihlah menganalisis teks jurnal ilmiah, artikel penelitian kompleks, dan kritik sastra.`;
      }
      break;

    case "writing":
      if (score < 60) {
        recommendation = `Skor Writing Anda adalah ${score} (Beginner). Kami menyarankan Anda fokus menulis paragraf sederhana dengan struktur kalimat yang utuh dan jelas di modul 'Writing Practice'.`;
      } else if (score < 80) {
        recommendation = `Skor Writing Anda adalah ${score} (Intermediate). Tulis esai terstruktur (intro, body paragraphs, dan conclusion) serta latih transisi antar paragraf di modul 'Writing Practice'.`;
      } else {
        recommendation = `Skor Writing Anda adalah ${score} (Advanced). Gaya penulisan Anda sangat baik. Fokus pada peningkatan kohesi leksikal yang lebih kaya dan presisi argumen di modul 'Writing Practice'.`;
      }
      actionLink = { label: "Latih Writing", href: "/student/writing" };
      break;

    case "listening":
      if (score < 60) {
        recommendation = `Skor Listening Anda adalah ${score} (Beginner). Tingkatkan pendengaran Anda dengan mendengarkan podcast akademik lambat atau monolog dengan transcript bahasa Inggris.`;
      } else if (score < 80) {
        recommendation = `Skor Listening Anda adalah ${score} (Intermediate). Latihlah mendengarkan monolog kuliah akademik dan biasakan menjawab pertanyaan pilihan ganda secara cepat.`;
      } else {
        recommendation = `Skor Listening Anda adalah ${score} (Advanced). Pemahaman mendengarkan Anda sangat baik. Latih terus dengan mendengarkan aksen bahasa Inggris yang bervariasi (UK, Australia, US).`;
      }
      break;

    case "speaking":
      if (score < 60) {
        recommendation = `Skor Speaking Anda adalah ${score} (Beginner). Kami menyarankan Anda untuk berlatih melafalkan kosakata dasar secara lantang dengan bantuan modul 'Speaking Practice'.`;
      } else if (score < 80) {
        recommendation = `Skor Speaking Anda adalah ${score} (Intermediate). Latihlah kelancaran berbicara (fluency) tanpa jeda ragu-ragu di modul 'Speaking Practice' dengan skenario interaktif.`;
      } else {
        recommendation = `Skor Speaking Anda adalah ${score} (Advanced). Kefasihan berbicara Anda luar biasa. Cobalah mempraktikkan intonasi ekspresif layaknya penutur asli di modul 'Speaking Practice'.`;
      }
      actionLink = { label: "Latih Speaking", href: "/student/speaking" };
      break;
  }

  return { levelMeta, recommendation, actionLink };
}

export default function RecommendationGrid({ scores }: RecommendationGridProps) {
  const sectionMeta = [
    {
      label: "Vocabulary",
      key: "vocabulary",
      score: Math.round(scores.vocabulary ?? 0),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 8h10M7 12h10M7 16h6" />
        </svg>
      ),
    },
    {
      label: "Grammar",
      key: "grammar",
      score: Math.round(scores.grammar ?? 0),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ),
    },
    {
      label: "Listening",
      key: "listening",
      score: Math.round(scores.listening ?? 0),
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-500/10",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      ),
    },
    {
      label: "Reading",
      key: "reading",
      score: Math.round(scores.reading ?? 0),
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      label: "Writing",
      key: "writing",
      score: Math.round(scores.writing ?? 0),
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      label: "Speaking",
      key: "speaking",
      score: Math.round(scores.speaking ?? 0),
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2 className="font-hanken text-lg font-bold text-slate-900 dark:text-white">
          Rekomendasi Aksi Mandiri
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionMeta.map((section) => {
          const { levelMeta, recommendation, actionLink } = getSectionGuidance(section.key, section.score);
          return (
            <div
              key={section.label}
              className="bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] dark:shadow-none flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${section.bg} ${section.color} flex items-center justify-center border border-current/10`}>
                    {section.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${levelMeta.color}`}>
                    {levelMeta.label}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-hanken text-sm font-bold text-slate-950 dark:text-white">
                    {section.label}
                  </h3>
                  <p className="font-inter text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                {actionLink ? (
                  <Link
                    href={actionLink.href}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${section.color} hover:underline`}
                  >
                    <span>{actionLink.label}</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                ) : (
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Rekomendasi Belajar Mandiri
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
