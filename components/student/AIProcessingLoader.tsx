"use client";

import Link from "next/link";

interface AIProcessingLoaderProps {
  activeStep: number;
  progressPercent: number;
}

export default function AIProcessingLoader({
  activeStep,
  progressPercent,
}: AIProcessingLoaderProps) {
  const stepDetails = [
    {
      label: "Analisis Esai",
      title: "Menganalisis Jawaban Esai",
      desc: "Asisten AI mengevaluasi tata bahasa, kosakata, dan struktur kalimat esai Anda secara mendalam...",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      label: "Evaluasi Suara",
      title: "Mengevaluasi Rekaman Suara",
      desc: "Mentranskripsi rekaman audio lisan dan menganalisis kefasihan serta pelafalan Anda...",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      ),
    },
    {
      label: "Kalkulasi Skor",
      title: "Mengkalkulasi Skor Akhir",
      desc: "Mengkalkulasi nilai dari seluruh bagian tes untuk memetakan level kompetensi Anda...",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  ];

  const currentStepDetail = activeStep < 3 ? stepDetails[activeStep] : {
    title: "Menyinkronkan Data",
    desc: "Menyinkronkan lembar laporan hasil belajar...",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center px-6 py-12 transition-colors duration-500">
      <div className="max-w-md w-full bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/85 p-10 text-center space-y-8 shadow-[0_10px_40px_-15px_rgba(23,52,84,0.06)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)]">
        
        {/* Sleek SVG Graphic Container with secondary brand color (Teal) */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Circular Track & Spinner */}
          <div className="absolute inset-0 w-full h-full">
            {/* Spinning dashed background gear */}
            <div className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "8s" }}>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="currentColor"
                  className="text-slate-150 dark:text-slate-800"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="none"
                />
              </svg>
            </div>

            {/* Glowing static progress ring that fills up */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                className="text-secondary transition-all duration-500 ease-out"
                strokeWidth="3.5"
                strokeDasharray={`${(progressPercent / 100) * 276.4} 276.4`}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Central AI Sparkling Star Icon */}
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-150 dark:border-slate-700/60 shadow-sm text-secondary z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" fill="currentColor" fillOpacity="0.15" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/20 text-secondary dark:text-secondary-fixed-dim px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-teal-100/50 dark:border-teal-900/30 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            AI SEDANG MEMPROSES
          </div>
          
          <div className="space-y-2">
            <h1 className="font-hanken text-2xl font-black text-primary dark:text-white tracking-tight leading-tight animate-fade-in">
              {currentStepDetail.title}
            </h1>
            <p className="font-inter text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto min-h-[44px] flex items-center justify-center px-2">
              {currentStepDetail.desc}
            </p>
          </div>
        </div>

        {/* Clean, Brand-aligned Step Cards */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/60">
          {stepDetails.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isActive = activeStep === idx;
            
            let cardClass = "bg-slate-50/50 dark:bg-transparent border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-60";
            let iconColor = "text-slate-350 dark:text-slate-700";
            
            if (isCompleted) {
              cardClass = "bg-slate-50/80 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800 text-primary dark:text-slate-200";
              iconColor = "text-secondary";
            } else if (isActive) {
              cardClass = "bg-white dark:bg-slate-800/35 border-secondary/60 dark:border-secondary/50 text-primary dark:text-white shadow-md shadow-secondary/5 font-semibold animate-pulse";
              iconColor = "text-secondary";
            }

            return (
              <div
                key={step.label}
                className={`rounded-2xl p-4 border transition-all duration-350 relative flex flex-col items-center justify-center gap-2.5 ${cardClass}`}
              >
                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5">
                  {isCompleted ? (
                    // Green checkmark
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isActive ? (
                    // Simple teal pulse
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary"></span>
                    </span>
                  ) : null}
                </div>

                <div className={`${iconColor} transition-colors duration-300`}>
                  {step.icon}
                </div>

                <p className="font-hanken text-[10px] font-extrabold uppercase tracking-wider">
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-slate-450 hover:text-primary dark:text-slate-500 dark:hover:text-slate-400 font-inter text-sm font-semibold transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
