"use client";

import React from "react";

interface StatItem {
  count: number;
  percent: number;
}

interface StatsGridProps {
  stats: {
    total: number;
    advanced: StatItem;
    intermediate: StatItem;
    beginner: StatItem;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const levelStats = [
    {
      label: "Advanced Level",
      count: stats.advanced.count,
      percent: stats.advanced.percent,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10 border-green-200/50",
    },
    {
      label: "Intermediate Level",
      count: stats.intermediate.count,
      percent: stats.intermediate.percent,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200/50",
    },
    {
      label: "Beginner Level",
      count: stats.beginner.count,
      percent: stats.beginner.percent,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10 border-red-200/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Card */}
      <div className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-2">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Total Mahasiswa
        </span>
        <p className="font-hanken text-4xl font-black text-gray-900 dark:text-white">
          {stats.total}
        </p>
      </div>

      {/* Level Cards */}
      {levelStats.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              {s.label}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold border ${s.bg} ${s.color}`}
            >
              {s.percent}%
            </span>
          </div>
          <p className={`font-hanken text-4xl font-black ${s.color}`}>
            {s.count}
          </p>
        </div>
      ))}
    </div>
  );
}
