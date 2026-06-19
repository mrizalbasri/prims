"use client";

import React from "react";
import Link from "next/link";

interface StudyGuidanceProps {
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  guidance: {
    title: string;
    description: string;
    tips: string[];
  };
}

export default function StudyGuidance({ level, guidance }: StudyGuidanceProps) {
  return (
    <div className="space-y-6">
      {/* Level Description & Guidance Card */}
      <div className={`rounded-3xl border p-6 space-y-5 transition-all duration-300 ${
        level === "BEGINNER"
          ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-950/30 text-slate-800 dark:text-rose-300"
          : level === "INTERMEDIATE"
          ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/30 text-slate-800 dark:text-amber-300"
          : "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/30 text-slate-800 dark:text-emerald-300"
      }`}>
        <div className="flex gap-3.5 items-start">
          <div className="w-10 h-10 rounded-2xl bg-current/10 border border-current/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6M10 22h4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-hanken text-base font-bold text-slate-900 dark:text-white">
              {guidance.title}
            </h3>
            <p className="font-inter text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {guidance.description}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-current/10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-70 mb-3">
            REKOMENDASI STUDI ANDA
          </span>
          <div className="space-y-3.5">
            {guidance.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-current opacity-85" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="font-inter text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — Start Learning */}
      <div className="bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] dark:shadow-none space-y-5">
        <div className="space-y-1">
          <h3 className="font-hanken text-sm font-bold text-slate-950 dark:text-white">
            Siap Meningkatkan Kemampuan?
          </h3>
          <p className="font-inter text-xs text-slate-555 dark:text-slate-400 leading-relaxed">
            Akses modul pembelajaran mandiri PRISM yang telah disesuaikan khusus untuk level penempatan Anda.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/student/vocabulary"
            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-hanken font-bold px-4 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs transition-colors duration-200"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 8h10M7 12h10M7 16h6" />
              </svg>
              Vocabulary Modul
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          
          <Link
            href="/student/writing"
            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-hanken font-bold px-4 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs transition-colors duration-200"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Writing Modul
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <Link
            href="/student/speaking"
            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-hanken font-bold px-4 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs transition-colors duration-200"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" />
              </svg>
              Speaking Modul
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
