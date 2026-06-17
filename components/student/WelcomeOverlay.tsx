import React from 'react';

interface WelcomeOverlayProps {
  onStartTest: () => void;
}

export function WelcomeOverlay({ onStartTest }: WelcomeOverlayProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl animate-fadeIn">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
            <span className="material-symbols-outlined text-sm">school</span>
            PRISM Placement Test
          </div>
          <h2 className="font-hanken text-3xl md:text-4xl font-black leading-tight">
            Selesaikan Placement Test Anda 🚀
          </h2>
          <p className="font-inter text-sm text-blue-100 leading-relaxed max-w-lg">
            Sebelum mengakses modul belajar mandiri, Anda perlu menyelesaikan <strong>Adaptive Placement Test</strong> terlebih dahulu untuk mengukur kemampuan bahasa Inggris akademik Anda.
          </p>
          <button
            onClick={onStartTest}
            className="inline-flex items-center gap-3 bg-white text-blue-700 font-hanken font-black px-8 py-4 rounded-2xl hover:bg-blue-50 hover:shadow-xl transition-all group text-base cursor-pointer border-0"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            Mulai Placement Test
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        {/* Stats panel */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 grid grid-cols-2 gap-4 min-w-[220px]">
          {[
            { label: 'Sections', value: '5', icon: 'layers' },
            { label: 'Duration', value: '~45 min', icon: 'schedule' },
            { label: 'Questions', value: '50+', icon: 'quiz' },
            { label: 'Result', value: 'Instant', icon: 'bolt' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <span className="material-symbols-outlined text-blue-200 text-2xl">{s.icon}</span>
              <p className="font-hanken text-xl font-black text-white">{s.value}</p>
              <p className="font-inter text-[10px] text-blue-200 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
