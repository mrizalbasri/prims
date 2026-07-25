"use client";

import { useMemo } from "react";

export type TestHistoryItem = {
  attemptId: string;
  attemptNumber: number;
  completedAt: string;
  overallScore: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  cefrLevel: string;
  scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
};

interface ProgressTrackerProps {
  history: TestHistoryItem[];
  allowRetake?: boolean;
  onRetakeTest?: () => void;
  isStartingRetake?: boolean;
}

const SKILL_LABELS: Record<keyof TestHistoryItem["scores"], { name: string; icon: string; color: string }> = {
  vocabulary: { name: "Vocabulary", icon: "menu_book", color: "from-blue-500 to-indigo-600" },
  grammar: { name: "Grammar", icon: "spellcheck", color: "from-purple-500 to-purple-600" },
  listening: { name: "Listening", icon: "headphones", color: "from-amber-500 to-amber-600" },
  reading: { name: "Reading", icon: "auto_stories", color: "from-emerald-500 to-teal-600" },
  writing: { name: "Writing", icon: "edit_note", color: "from-orange-500 to-rose-500" },
  speaking: { name: "Speaking", icon: "mic", color: "from-cyan-500 to-blue-600" },
};

export function ProgressTracker({
  history,
  allowRetake,
  onRetakeTest,
  isStartingRetake,
}: ProgressTrackerProps) {
  // Sort history chronologically (attemptNumber ascending)
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => a.attemptNumber - b.attemptNumber);
  }, [history]);

  const initialAttempt = sortedHistory[0];
  const latestAttempt = sortedHistory[sortedHistory.length - 1];
  const hasMultipleAttempts = sortedHistory.length > 1;

  // Score comparison stats
  const scoreDelta = useMemo(() => {
    if (!initialAttempt || !latestAttempt) return 0;
    return Math.round(latestAttempt.overallScore - initialAttempt.overallScore);
  }, [initialAttempt, latestAttempt]);

  const percentDelta = useMemo(() => {
    if (!initialAttempt || initialAttempt.overallScore === 0) return 0;
    return Math.round((scoreDelta / initialAttempt.overallScore) * 100);
  }, [initialAttempt, scoreDelta]);

  // Skill deltas and highest improved skill
  const skillAnalysis = useMemo(() => {
    if (!initialAttempt || !latestAttempt) return null;

    const skillsKeys = Object.keys(SKILL_LABELS) as (keyof TestHistoryItem["scores"])[];
    const deltas = skillsKeys.map((key) => {
      const initVal = initialAttempt.scores[key] || 0;
      const latestVal = latestAttempt.scores[key] || 0;
      const diff = Math.round(latestVal - initVal);
      return {
        key,
        name: SKILL_LABELS[key].name,
        icon: SKILL_LABELS[key].icon,
        initVal,
        latestVal,
        diff,
      };
    });

    // Sort by diff to find most improved
    const sortedByDiff = [...deltas].sort((a, b) => b.diff - a.diff);
    const mostImproved = sortedByDiff[0];
    const strongestSkill = [...deltas].sort((a, b) => b.latestVal - a.latestVal)[0];

    return {
      deltas,
      mostImproved,
      strongestSkill,
    };
  }, [initialAttempt, latestAttempt]);

  if (!sortedHistory || sortedHistory.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">trending_up</span>
            <h2 className="font-hanken text-2xl font-extrabold text-gray-900 dark:text-white">
              Perkembangan & Riwayat Ujian
            </h2>
          </div>
          <p className="font-inter text-xs text-gray-500 dark:text-gray-400">
            Pantau pertumbuhan skor dan komparasi kemampuan bahasa Inggris Anda dari waktu ke waktu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-hanken border border-blue-200/50 dark:border-blue-800/30">
            {sortedHistory.length} Total Ujian Selesai
          </span>
          {allowRetake && onRetakeTest && (
            <button
              onClick={onRetakeTest}
              disabled={isStartingRetake}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">replay</span>
              {isStartingRetake ? "Memuat..." : "Tes Ulang"}
            </button>
          )}
        </div>
      </div>

      {/* 1. RETAKE COMPARISON CARD (Tampil jika >1 tes) */}
      {hasMultipleAttempts && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-850 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest block">
                Komparasi Tes Ulang (Initial vs Latest)
              </span>
              <h3 className="font-hanken text-2xl font-bold">
                {scoreDelta > 0 ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <span className="material-symbols-outlined text-3xl">trending_up</span>
                    Perkembangan Skor: +{scoreDelta} Poin ({percentDelta >= 0 ? `+${percentDelta}%` : `${percentDelta}%`})
                  </span>
                ) : scoreDelta < 0 ? (
                  <span className="flex items-center gap-2 text-amber-400">
                    <span className="material-symbols-outlined text-3xl">trending_down</span>
                    Perubahan Skor: {scoreDelta} Poin ({percentDelta}%)
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-blue-300">
                    <span className="material-symbols-outlined text-3xl">horizontal_rule</span>
                    Skor Stabil (Konstan)
                  </span>
                )}
              </h3>
              <p className="font-inter text-xs text-gray-300 max-w-xl leading-relaxed">
                {scoreDelta > 0
                  ? "Kerja bagus! Pembelajaran mandiri Anda menunjukkan hasil nyata pada tes terbaru ini."
                  : "Tetap semangat! Gunakan modul latihan harian untuk memperkuat bagian yang masih perlu ditingkatkan."}
              </p>
            </div>

            {/* Comparison Badges */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 justify-around">
              <div className="text-center px-3">
                <span className="text-[10px] text-gray-300 font-bold uppercase block tracking-wider">Tes Pertama</span>
                <span className="font-hanken text-2xl font-black text-white">{Math.round(initialAttempt.overallScore)}</span>
                <span className="text-[10px] text-gray-400 block">{initialAttempt.cefrLevel}</span>
              </div>

              <div className="h-10 w-px bg-white/20"></div>

              <div className="text-center px-3">
                <span className="text-[10px] text-blue-300 font-bold uppercase block tracking-wider">Tes Terbaru</span>
                <span className="font-hanken text-3xl font-black text-green-400">{Math.round(latestAttempt.overallScore)}</span>
                <span className="text-[10px] text-green-300 block">{latestAttempt.cefrLevel}</span>
              </div>
            </div>
          </div>

          {/* Skill Breakdown Comparison Grid */}
          {skillAnalysis && (
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h4 className="font-hanken text-xs font-bold text-gray-300 uppercase tracking-wider text-left">
                Perbandingan Skor per Sub-Skill
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillAnalysis.deltas.map((skill) => (
                  <div
                    key={skill.key}
                    className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/10 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-blue-400">{skill.icon}</span>
                        <span className="font-hanken text-xs font-bold text-white">{skill.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          skill.diff > 0
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : skill.diff < 0
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {skill.diff > 0 ? `+${skill.diff}` : skill.diff}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[11px] text-gray-400">Awal: {Math.round(skill.initVal)}</span>
                      <span className="text-xs font-bold text-white">Terbaru: {Math.round(skill.latestVal)}</span>
                    </div>

                    {/* Simple Progress Bar comparing initial vs latest */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-500/40 h-full"
                        style={{ width: `${Math.min(100, skill.initVal)}%` }}
                      />
                      <div
                        className={`h-full ${skill.diff >= 0 ? "bg-green-400" : "bg-amber-400"}`}
                        style={{ width: `${Math.max(0, Math.min(100, skill.latestVal - skill.initVal))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SCORE TREND CHART CARD */}
      <div className="bg-white dark:bg-gray-855 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">
              Grafik Perkembangan Skor Placement Test
            </h3>
            <p className="font-inter text-xs text-gray-500 dark:text-gray-400">
              Tren akumulasi skor dari setiap sesi pengujian yang telah Anda selesaikan.
            </p>
          </div>
        </div>

        {/* SVG Responsive Line Chart */}
        <div className="relative pt-4 pb-2">
          <div className="h-56 w-full flex items-end justify-between gap-2 md:gap-6 px-4 pb-8 border-b border-gray-150 dark:border-gray-750">
            {sortedHistory.map((item, idx) => {
              const heightPercent = Math.max(10, Math.min(100, item.overallScore));
              const dateFormatted = new Date(item.completedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });

              return (
                <div key={item.attemptId} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                    Sesi #{item.attemptNumber}: {Math.round(item.overallScore)} Poin ({item.cefrLevel})
                  </div>

                  <span className="font-hanken font-bold text-xs text-gray-700 dark:text-gray-200">
                    {Math.round(item.overallScore)}
                  </span>

                  {/* Bar Visual */}
                  <div className="w-full max-w-[48px] bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden h-40 flex items-end p-1">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        idx === sortedHistory.length - 1
                          ? "bg-gradient-to-t from-blue-600 to-teal-400"
                          : "bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-700 dark:to-gray-600"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="font-inter text-[10px] text-gray-400 font-medium">
                    {dateFormatted}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attempt History List */}
        <div className="space-y-3">
          <h4 className="font-hanken text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
            Daftar Riwayat Sesi
          </h4>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            {sortedHistory.map((item) => (
              <div
                key={item.attemptId}
                className="p-4 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-hanken font-black text-sm">
                    #{item.attemptNumber}
                  </div>
                  <div>
                    <h5 className="font-hanken font-bold text-xs text-gray-900 dark:text-white">
                      Placement Test Sesi #{item.attemptNumber}
                    </h5>
                    <p className="font-inter text-[10px] text-gray-400">
                      Selesai pada {new Date(item.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-hanken font-black text-base text-gray-900 dark:text-white block leading-none">
                      {Math.round(item.overallScore)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{item.cefrLevel}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.level === "ADVANCED"
                        ? "bg-green-50 text-green-600 dark:bg-green-500/10"
                        : item.level === "INTERMEDIATE"
                        ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10"
                    }`}
                  >
                    {item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
