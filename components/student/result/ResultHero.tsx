"use client";

import React from "react";

type ResultHeroProps = {
  totalScore: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  cefrLevel: string;
  completedDate: string;
  meta: {
    label: string;
    icon: string;
    bg: string;
    border: string;
    text: string;
  };
};

export default function ResultHero({
  totalScore,
  level,
  cefrLevel,
  completedDate,
  meta,
}: ResultHeroProps) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#151D30] rounded-3xl p-8 md:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] dark:shadow-none border border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
      {/* Subtle Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left — Score Details */}
        <div className="text-center md:text-left space-y-5 flex-grow">
          <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 text-slate-650 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
            HASIL TES PENEMPATAN PRISM
          </div>

          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-extrabold">
              Skor Akhir Keseluruhan
            </p>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <h1 className="font-hanken text-6xl md:text-7xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
                {totalScore}
              </h1>
              <span className="text-slate-400 dark:text-slate-500 text-lg font-semibold">
                / 100
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wide ${
              level === "BEGINNER"
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400"
                : level === "INTERMEDIATE"
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
                : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            }`}>
              {level === "BEGINNER" ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ) : level === "INTERMEDIATE" ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              )}
              {meta.label}
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800/80 font-mono text-xs font-bold text-slate-600 dark:text-slate-350">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              CEFR {cefrLevel}
            </div>

            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800/80 font-mono text-xs font-bold text-slate-500 dark:text-slate-450">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {completedDate}
            </div>
          </div>
        </div>

        {/* Right — Minimalist circular gauge with premium gradient and shadows */}
        <div className="flex-shrink-0 relative w-36 h-36">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full -rotate-90"
            strokeLinecap="round"
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="6.5"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#scoreGradient)"
              className="transition-all duration-1000 ease-out"
              strokeWidth="6.5"
              strokeDasharray={`${(totalScore / 100) * 263.9} 263.9`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-hanken text-3xl font-black text-slate-900 dark:text-white">
              {totalScore}%
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              Skor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
