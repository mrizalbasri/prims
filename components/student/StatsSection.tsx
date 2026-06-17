import React from 'react';

interface StatsSectionProps {
  vocabLearned: number;
  writingCount: number;
  speakingCount: number;
  streak: number;
}

export function StatsSection({ vocabLearned, writingCount, speakingCount, streak }: StatsSectionProps) {
  const stats = [
    { label: "Vocab Dipelajari", score: vocabLearned, icon: "style", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
    { label: "Esai Ditulis", score: writingCount, icon: "edit_document", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10" },
    { label: "Sesi Speaking", score: speakingCount, icon: "record_voice_over", color: "text-red-600 bg-red-50 dark:bg-red-500/10" },
    { label: "Streak Belajar", score: streak, icon: "local_fire_department", color: "text-green-600 bg-green-50 dark:bg-green-500/10" }
  ];

  return (
    <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm animate-fadeIn">
      <h3 className="font-hanken text-lg font-bold text-gray-955 dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-400">insights</span>
        Statistik Perkembangan Belajar
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className={`material-symbols-outlined text-3xl p-2.5 rounded-xl mb-3 inline-block ${stat.color}`}>
              {stat.icon}
            </span>
            <p className="font-mono text-3xl font-black text-gray-900 dark:text-white">
              {stat.score}
            </p>
            <p className="font-inter text-xs text-gray-400 dark:text-gray-550 uppercase font-semibold mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
