import Link from "next/link";
import type { SessionStats } from "./types";

export default function VocabularySessionResults({ stats, onReset }: { stats: SessionStats; onReset: () => void }) {
  const accuracy = stats.cardsReviewed > 0 ? Math.round((stats.correctAnswers / stats.cardsReviewed) * 100) : 0;
  const metrics = [
    { icon: "style", color: "text-blue-600", value: stats.cardsReviewed, label: "Kartu Direview" },
    { icon: "check_circle", color: "text-green-600", value: `${accuracy}%`, label: "Akurasi" },
    { icon: "local_fire_department", color: "text-orange-600", value: stats.streak, label: "Streak Terbaik" },
  ];

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 text-center shadow-xl space-y-8">
        <div className="space-y-3"><span className="material-symbols-outlined text-6xl text-yellow-500 animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span><h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Sesi Belajar Selesai!</h1><p className="font-inter text-sm text-gray-400 dark:text-gray-300">Pekerjaan luar biasa! Ingatan Anda berkembang semakin kuat.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => <div key={metric.label} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"><span className={`material-symbols-outlined text-2xl ${metric.color} mb-1.5 inline-block`}>{metric.icon}</span><p className="font-mono text-2xl font-black text-gray-900 dark:text-white">{metric.value}</p><p className="font-inter text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{metric.label}</p></div>)}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button onClick={onReset} className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all cursor-pointer"><span className="material-symbols-outlined">refresh</span>Ulangi Sesi</button>
          <Link href="/student" className="inline-flex items-center justify-center gap-2 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-hanken font-bold px-8 py-3.5 rounded-xl transition-all border border-transparent dark:border-gray-700 cursor-pointer">Kembali ke Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
