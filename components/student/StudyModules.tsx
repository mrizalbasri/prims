import React from 'react';
import Link from 'next/link';

interface StudyModulesProps {
  levelNameFormatted: string;
}

export function StudyModules({ levelNameFormatted }: StudyModulesProps) {
  const learningModules = [
    {
      title: "Vocabulary Learning",
      description: "Pelajari kosakata akademik baru dengan sistem flashcard dan spaced repetition.",
      icon: "style",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "hover:border-blue-500/40",
      href: "/student/vocabulary"
    },
    {
      title: "Writing Practice",
      description: "Latih kemampuan menulis esai akademik dengan umpan balik dan penilaian dari AI.",
      icon: "edit_document",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "hover:border-orange-500/40",
      href: "/student/writing"
    },
    {
      title: "Speaking Practice",
      description: "Praktikkan kelancaran berbicara lisan dengan simulasi skenario real-world dan penilaian AI.",
      icon: "record_voice_over",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "hover:border-red-500/40",
      href: "/student/speaking"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="font-hanken text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">school</span>
          Modul Pembelajaran Mandiri
        </h2>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200/20">
          Level: {levelNameFormatted}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {learningModules.map((module, idx) => {
          const cardContent = (
            <>
              <div>
                <div className={`w-14 h-14 rounded-xl ${module.bg} ${module.color} flex items-center justify-center mb-6 transition-transform border border-current/10 group-hover:scale-110`}>
                  <span className="material-symbols-outlined text-3xl">{module.icon}</span>
                </div>
                
                <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors group-hover:text-blue-600">
                  {module.title}
                </h3>
                
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  {module.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-hanken text-sm font-bold">
                Mulai Latihan
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </>
          );

          return (
            <Link
              key={idx}
              href={module.href}
              className={`group bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-xl transition-all flex flex-col justify-between ${module.border}`}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
