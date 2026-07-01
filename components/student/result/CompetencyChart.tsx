"use client";

import React from "react";
import { RadarChart } from "../RadarChart";

type SectionItem = {
  label: string;
  key: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  bar: string;
  bg: string;
};

interface CompetencyChartProps {
  scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  barsVisible: boolean;
}

export default function CompetencyChart({ scores, barsVisible }: CompetencyChartProps) {
  const sectionBreakdown: SectionItem[] = [
    {
      label: "Vocabulary",
      key: "vocabulary",
      score: Math.round(scores.vocabulary ?? 0),
      color: "text-blue-600 dark:text-blue-400",
      bar: "bg-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      bar: "bg-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ),
    },
    {
      label: "Listening",
      key: "listening",
      score: Math.round(scores.listening ?? 0),
      color: "text-teal-600 dark:text-teal-400",
      bar: "bg-teal-500",
      bg: "bg-teal-50 dark:bg-teal-500/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      bar: "bg-green-500",
      bg: "bg-green-50 dark:bg-green-500/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      label: "Writing",
      key: "writing",
      score: Math.round(scores.writing ?? 0),
      color: "text-orange-600 dark:text-orange-400",
      bar: "bg-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      label: "Speaking",
      key: "speaking",
      score: Math.round(scores.speaking ?? 0),
      color: "text-red-600 dark:text-red-400",
      bar: "bg-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <h2 className="font-hanken text-lg font-bold text-slate-900 dark:text-white">
          Analisis Kompetensi per Bidang
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Radar Chart */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <RadarChart scores={scores} />
        </div>

        {/* Right Side: Skill Progress Cards */}
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sectionBreakdown.map((section) => (
            <div
              key={section.label}
              className="bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] dark:shadow-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center border border-current/10`}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-hanken text-sm font-bold text-slate-900 dark:text-white">
                      {section.label}
                    </h3>
                    <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {section.score}
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-0.5">
                        %
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-slate-50 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-800/20">
                  <div
                    className={`h-full ${section.bar} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: barsVisible ? `${section.score}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
