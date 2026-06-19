"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  fullName: string;
  role: string;
} | null;

interface HeroSectionProps {
  user: User;
}

function VocabCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white/95 dark:bg-slate-900/95 border border-gray-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,184,163,0.08)] dark:shadow-[0_20px_40px_rgba(0,184,163,0.12)] hover:shadow-[0_25px_50px_rgba(0,184,163,0.15)] dark:hover:shadow-[0_25px_50px_rgba(0,184,163,0.22)] transition-all duration-500 cursor-pointer text-left flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
        <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
          <span className="material-symbols-outlined text-sm text-teal-500">style</span>
          Vocabulary
        </span>
        <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-450 text-[9px] font-bold px-2 py-0.5 rounded-full border border-teal-200/30 dark:border-teal-900/20">
          80% Mastery
        </span>
      </div>
      
      <div className="my-auto py-5 space-y-2">
        <span className="font-hanken text-2xl font-black text-primary dark:text-white block tracking-tight">ubiquitous</span>
        <span className="font-mono text-[9px] text-gray-400 dark:text-gray-500 block -mt-1.5">/juːˈbɪk.wɪ.təs/</span>
        
        {/* Quote Block Sentence */}
        <div className="border-l-2 border-teal-500/35 pl-3 mt-4">
          <p className="font-inter text-[11px] text-gray-600 dark:text-gray-450 italic leading-relaxed">
            "Mobile phones are now ubiquitous in our lives."
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-450 font-medium">
        <span className="material-symbols-outlined text-xs text-teal-500">info</span>
        <span>Artinya: Ada di mana-mana / hadir di setiap tempat.</span>
      </div>
    </div>
  );
}

function WritingCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white/95 dark:bg-slate-900/95 border border-gray-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_20px_40px_rgba(249,115,22,0.08)] dark:shadow-[0_20px_40px_rgba(249,115,22,0.12)] hover:shadow-[0_25px_50px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_25px_50px_rgba(249,115,22,0.22)] transition-all duration-500 cursor-pointer text-left flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
        <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
          <span className="material-symbols-outlined text-sm text-orange-500">edit_document</span>
          Writing
        </span>
        <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-450 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-200/30 dark:border-orange-900/20">
          Score: +1.5
        </span>
      </div>
      
      <div className="my-auto py-4">
        {/* Split suggestion box */}
        <div className="bg-gray-50/70 dark:bg-slate-900/40 rounded-xl p-3 border border-gray-100 dark:border-slate-800/80 space-y-2 font-inter text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-400 text-[9px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[11px] text-red-500">cancel</span>
            <span>Original</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 line-through leading-relaxed px-1">
            Although the results <span className="bg-red-50 dark:bg-red-950/30 text-red-500 px-0.5 rounded">was</span> promising...
          </p>
          
          <div className="h-[1px] bg-gray-100 dark:bg-slate-800/60"></div>
          
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-[9px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[11px]">check_circle</span>
            <span>Koreksi AI</span>
          </div>
          <p className="text-gray-800 dark:text-white font-medium leading-relaxed px-1">
            Although the results <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-bold px-1 rounded border border-teal-200/30 dark:border-teal-900/20">were</span> promising...
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-455 font-medium">
        <span className="material-symbols-outlined text-xs text-orange-500">auto_awesome</span>
        <span>AI memperbaiki subject-verb agreement.</span>
      </div>
    </div>
  );
}

function AnalyticsCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white/95 dark:bg-slate-900/95 border border-gray-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_20px_40px_rgba(59,130,246,0.08)] dark:shadow-[0_20px_40px_rgba(59,130,246,0.12)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_25px_50px_rgba(59,130,246,0.22)] transition-all duration-500 cursor-pointer text-left flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
          <span className="material-symbols-outlined text-sm text-blue-500">analytics</span>
          Analytics
        </span>
        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200/30 dark:border-blue-900/20">
          CEFR B2
        </span>
      </div>
      
      {/* High Fidelity Radar Chart Container */}
      <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Concentric grid pentagons */}
          <polygon points="50,10 88,38 73.5,82.5 26.5,82.5 12,38" className="stroke-gray-200 dark:stroke-slate-800 fill-none" strokeWidth="0.8" strokeDasharray="3 2" />
          <polygon points="50,25 78.5,41 67.5,74.5 32.5,74.5 21.5,41" className="stroke-gray-150 dark:stroke-slate-850 fill-none" strokeWidth="0.8" strokeDasharray="3 2" />
          <polygon points="50,38 61.5,45.5 57,59.5 43,59.5 38.5,45.5" className="stroke-gray-150 dark:stroke-slate-850 fill-none" strokeWidth="0.8" strokeDasharray="3 2" />
          
          {/* Axis lines */}
          <line x1="50" y1="50" x2="50" y2="10" className="stroke-gray-200 dark:stroke-slate-800" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="50" y1="50" x2="88" y2="38" className="stroke-gray-200 dark:stroke-slate-800" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="50" y1="50" x2="73.5" y2="82.5" className="stroke-gray-200 dark:stroke-slate-800" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="50" y1="50" x2="26.5" y2="82.5" className="stroke-gray-200 dark:stroke-slate-800" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="50" y1="50" x2="12" y2="38" className="stroke-gray-200 dark:stroke-slate-800" strokeWidth="0.6" strokeDasharray="2 2" />

          {/* Filled Skill score polygon */}
          <polygon 
            points="50,18 84.2,38.8 70,77.5 32.3,74.3 23.4,41.3" 
            className="stroke-teal-500 fill-teal-500/20 dark:stroke-teal-400 dark:fill-teal-400/25 transition-all duration-700" 
            strokeWidth="2" 
          />
          
          <circle cx="50" cy="50" r="1.5" className="fill-gray-400 dark:fill-slate-650" />
          
          {/* Small Labels inside SVG */}
          <text x="50" y="8" className="fill-gray-400 dark:fill-gray-500 text-[6.5px] font-bold text-center" textAnchor="middle">VOC</text>
          <text x="92" y="38" className="fill-gray-400 dark:fill-gray-500 text-[6.5px] font-bold text-left" dominantBaseline="middle">GRM</text>
          <text x="76" y="87" className="fill-gray-400 dark:fill-gray-500 text-[6.5px] font-bold text-left" textAnchor="middle">RDG</text>
          <text x="24" y="87" className="fill-gray-400 dark:fill-gray-500 text-[6.5px] font-bold text-right" textAnchor="middle">WRT</text>
          <text x="8" y="38" className="fill-gray-400 dark:fill-gray-500 text-[6.5px] font-bold text-right" dominantBaseline="middle">SPK</text>
        </svg>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800/60 flex justify-between font-inter text-[10px] text-gray-500 dark:text-gray-450 font-semibold">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Reading: 85%</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>Grammar: 90%</span>
      </div>
    </div>
  );
}

export default function HeroSection({ user }: HeroSectionProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-gray-50 dark:bg-gray-955 py-3 md:py-5">
      <div className="w-full max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6">
        
        {/* Snug Rounded Card Container (Hero Card Frame) */}
        <div className="relative overflow-hidden rounded-[24px] md:rounded-[36px] border border-gray-200/80 dark:border-slate-800 bg-gradient-to-br from-blue-50/20 via-white to-white dark:from-slate-900/60 dark:via-slate-955 dark:to-slate-955 shadow-2xl p-6 md:p-10 lg:p-14">
          
          {/* Soft Background Gradients inside the card */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-[0.03] -z-10"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/20 dark:bg-blue-900/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-teal-50/30 dark:bg-teal-955/5 rounded-full blur-3xl -z-10"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Content (Title, Subtitle, CTAs) */}
            <div className={`lg:col-span-5 text-left space-y-5 transition-all duration-1000 ease-out ${
              animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>

              <h1 className="font-hanken text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary dark:text-white leading-tight tracking-tight">
                Ukur & Tingkatkan Bahasa Inggris dengan{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                  AI Presisi
                </span>
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-450 leading-relaxed font-inter max-w-xl">
                Platform placement test resmi dan pembelajaran mandiri terpersonalisasi berbasis AI untuk mendukung kesuksesan akademik Anda.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 w-full">
                <Link
                  href="/register"
                  className="w-full sm:w-auto text-center bg-primary dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/10 text-white font-hanken text-sm font-bold px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Mulai Tes Sekarang
                </Link>
                <a
                  href="#ai-learning"
                  className="w-full sm:w-auto text-center bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 font-hanken text-sm font-bold px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Pelajari Fitur
                </a>
              </div>

              {/* Quick Metrics / USP */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-150 dark:border-slate-800/60">
                <div>
                  <p className="font-hanken text-lg md:text-xl font-black text-primary dark:text-white">Adaptive</p>
                  <p className="text-[9px] md:text-xs text-gray-400 dark:text-gray-500 font-medium">Testing Engine</p>
                </div>
                <div>
                  <p className="font-hanken text-lg md:text-xl font-black text-primary dark:text-white">Instant</p>
                  <p className="text-[9px] md:text-xs text-gray-400 dark:text-gray-500 font-medium">CEFR Report</p>
                </div>
                <div>
                  <p className="font-hanken text-lg md:text-xl font-black text-primary dark:text-white">Personal</p>
                  <p className="text-[9px] md:text-xs text-gray-400 dark:text-gray-500 font-medium">AI Learning</p>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Perspective Glass Slabs (Desktop Only) */}
            <div className={`lg:col-span-7 relative h-[420px] w-full hidden lg:flex items-center justify-center perspective-1000 transform-style-3d transition-all duration-1000 delay-200 ease-out ${
              animated ? "opacity-100" : "opacity-0"
            }`}>
              {/* Soft Center Glow Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

              {/* 3D Glass Cards Slabs Deck */}
              <div className="flex flex-row items-end justify-center gap-5 lg:gap-6 w-full h-full pb-4 select-none">
                <VocabCard className="w-[180px] lg:w-[200px] h-[290px] lg:h-[320px] [transform:rotateY(-25deg)_rotateX(5deg)] hover:lg:[transform:rotateY(0deg)_rotateX(0deg)] hover:lg:scale-105 z-10" />
                <AnalyticsCard className="w-[180px] lg:w-[200px] h-[320px] lg:h-[350px] [transform:rotateY(-25deg)_rotateX(5deg)] hover:lg:[transform:rotateY(0deg)_rotateX(0deg)] hover:lg:scale-105 z-20" />
                <WritingCard className="w-[180px] lg:w-[200px] h-[350px] lg:h-[385px] [transform:rotateY(-25deg)_rotateX(5deg)] hover:lg:[transform:rotateY(0deg)_rotateX(0deg)] hover:lg:scale-105 z-30" />
              </div>
            </div>

            {/* Mobile Only: Standard grid, fully visible cards */}
            <div className={`lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full max-w-2xl mx-auto text-left transition-all duration-1000 delay-200 ease-out ${
              animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <VocabCard />
              <WritingCard />
              <AnalyticsCard className="sm:col-span-2 mx-auto w-full max-w-sm" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
