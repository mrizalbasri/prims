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

export default function HeroSection({ user }: HeroSectionProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative pt-10 pb-20 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/20 via-white to-white">
      {/* Soft Background Gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 -z-10"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative">
        
        {/* Main Central Content Area */}
        <div className="relative z-20 max-w-2xl mx-auto text-center space-y-5 pb-6">
          <h1 className="font-hanken text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight tracking-tight">
            Ukur & Tingkatkan Bahasa Inggris dengan{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Presisi
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed font-inter">
            Platform placement test resmi dan pembelajaran mandiri terpersonalisasi berbasis AI untuk kesuksesan akademik.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-primary hover:bg-blue-900 hover:shadow-xl text-white font-hanken text-base font-bold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Mulai Tes Sekarang
            </Link>
            <a
              href="#ai-learning"
              className="w-full sm:w-auto text-center bg-white text-gray-700 border border-gray-200 font-hanken text-base font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>

        {/* Unified Showcase Area (3 Columns: Left Cards, Center Phone, Right Cards) */}
        <div className="max-w-5xl mx-auto mt-16 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 relative z-20">
          
          {/* Column 1: Left Cards (Stacked, aligned right) */}
          <div className="hidden lg:flex flex-col gap-8 w-72 items-end justify-center">
            
            {/* Card 1: Spaced Repetition Vocabulary */}
            <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-left">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                  <span className="material-symbols-outlined text-[13px]">style</span>
                  Vocabulary
                </span>
                <span className="bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-teal-200/20 dark:border-teal-800/10">
                  Mastery: 80%
                </span>
              </div>
              <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl space-y-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-hanken text-base font-bold text-primary dark:text-white">ubiquitous</span>
                  <span className="font-mono text-[9px] text-gray-400">/juːˈbɪk.wɪ.təs/</span>
                </div>
                <p className="font-inter text-[11px] text-gray-650 dark:text-gray-450 italic leading-relaxed">
                  "Mobile phones are now ubiquitous in our lives."
                </p>
              </div>
              <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-secondary">info</span>
                Artinya: Ada di mana-mana / hadir di setiap tempat.
              </p>
            </div>

            {/* Card 2: AI Writing Corrector */}
            <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-left">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
                <span className="text-[10px] font-bold text-orange-650 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                  <span className="material-symbols-outlined text-[13px]">edit_document</span>
                  Writing
                </span>
                <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-200/20 dark:border-orange-800/10">
                  Score: +1.5
                </span>
              </div>
              <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl">
                <p className="font-inter text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                  Although the results <span className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 line-through px-1 rounded mx-0.5">was</span> <span className="text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50 px-1 rounded border border-teal-200/30">were</span> promising...
                </p>
              </div>
              <p className="text-[10px] text-gray-455 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-orange-500">check_circle</span>
                AI mendeteksi & memperbaiki subject-verb agreement.
              </p>
            </div>

          </div>

          {/* Column 2: Center Phone Mockup (Ultra-clean, thin bezel) */}
          <div className="relative w-[280px] h-[550px] bg-white dark:bg-slate-900 rounded-[38px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-200/80 dark:border-slate-800 hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.12)] transition-all duration-300">
            {/* Sleek dynamic island placeholder */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-900 dark:bg-slate-950 rounded-full z-30"></div>
            
            {/* Screen Bezel Container */}
            <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[28px] overflow-hidden relative border border-gray-100 dark:border-slate-900 flex flex-col font-inter">
              
              {/* StatusBar Mockup */}
              <div className="h-8 flex items-center justify-between px-6 text-[9px] font-bold text-gray-405 dark:text-gray-500 select-none pt-2.5">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px] leading-none">signal_cellular_4_bar</span>
                  <span className="material-symbols-outlined text-[10px] leading-none">wifi</span>
                  <span className="material-symbols-outlined text-[10px] leading-none">battery_charging_full</span>
                </div>
              </div>

              {/* App Navbar */}
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="font-hanken text-[13px] font-black text-primary dark:text-white tracking-tight">PRISM</span>
                <span className="bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 text-[8px] font-bold px-2 py-0.5 rounded border border-teal-200/30 dark:border-teal-800/20 uppercase tracking-wider font-hanken">
                  Test Engine
                </span>
              </div>

              {/* Screen Body */}
              <div className="flex-1 px-4 py-3 flex flex-col justify-between">
                
                {/* Question Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                    <span>Vocabulary Section</span>
                    <span>Q 5 of 20</span>
                  </div>
                  {/* Thin Progress bar */}
                  <div className="w-full bg-gray-200/50 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>

                {/* Question Title */}
                <div className="my-auto py-3 text-left">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">
                    Pilih sinonim yang tepat:
                  </span>
                  <h4 className="font-hanken text-[13px] font-extrabold text-primary dark:text-white leading-snug">
                    "The company has an <span className="text-secondary font-black border-b-2 border-secondary/20 font-mono px-0.5">abundant</span> supply of resources."
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {[
                    { key: "A", val: "Scarce", state: "normal" },
                    { key: "B", val: "Plentiful", state: "selected" },
                    { key: "C", val: "Minimal", state: "normal" }
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-3 border rounded-xl transition-all flex items-center justify-between cursor-pointer text-left ${
                        opt.state === "selected"
                          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm"
                          : "border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                          opt.state === "selected"
                            ? "bg-teal-500 border-teal-500 text-white"
                            : "border-gray-300 dark:border-slate-700 text-gray-400 bg-gray-50 dark:bg-slate-800"
                        }`}>
                          {opt.state === "selected" ? (
                            <span className="material-symbols-outlined text-[9px] font-black">check</span>
                          ) : (
                            opt.key
                          )}
                        </div>
                        <span className={`text-[11px] font-bold ${
                          opt.state === "selected" ? "text-teal-700 dark:text-teal-400" : "text-gray-600 dark:text-gray-300"
                        }`}>
                          {opt.val}
                        </span>
                      </div>
                      {opt.state === "selected" && (
                        <span className="bg-teal-100/30 text-teal-600 dark:text-teal-400 text-[7px] font-bold px-1.5 py-0.5 rounded border border-teal-200/20">
                          Selected
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="pt-4 pb-2">
                  <button className="w-full bg-primary dark:bg-blue-600 text-white font-hanken text-[10px] font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>Kirim Jawaban</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Column 3: Right Cards (Stacked, aligned left) */}
          <div className="hidden lg:flex flex-col gap-8 w-72 items-start justify-center">
            
            {/* Card 3: CEFR Level / Radar Chart */}
            <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer text-left">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100/60 dark:border-slate-800/60">
                <span className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                  <span className="material-symbols-outlined text-[13px]">analytics</span>
                  Analytics
                </span>
                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/10">
                  CEFR: B2
                </span>
              </div>
              <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-gray-100 dark:border-slate-800 flex items-center justify-center">
                  <svg className="w-full h-full text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                    <polygon className="text-gray-200 dark:text-slate-800" points="50,10 90,40 75,90 25,90 10,40" strokeWidth="0.8" stroke="currentColor"></polygon>
                    <polygon className="text-gray-150 dark:text-slate-700" points="50,25 80,47.5 68.75,70 31.25,70 20,47.5" strokeWidth="0.8" stroke="currentColor"></polygon>
                    <polygon 
                      className="text-secondary fill-secondary/20" 
                      points="50,20 84,41.5 68.75,80 33.75,76 22,43" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    ></polygon>
                  </svg>
                </div>
                <div className="space-y-1 flex-1 font-inter text-[10px]">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-500">Reading Accuracy</span>
                    <span className="text-primary dark:text-white">85%</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-500">Grammar Score</span>
                    <span className="text-primary dark:text-white">90%</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-primary dark:text-blue-400">trending_up</span>
                Rekomendasi: Latih keahlian Speaking untuk C1.
              </p>
            </div>

            {/* Card 4: Speaking Evaluation Buddy */}
            <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer text-left">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100/60 dark:border-slate-800/60">
                <span className="text-[10px] font-bold text-red-650 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                  <span className="material-symbols-outlined text-[13px]">record_voice_over</span>
                  Speaking
                </span>
                <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-200/20 dark:border-red-800/10">
                  Accuracy: 92%
                </span>
              </div>
              <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 border border-red-100/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-base animate-pulse">mic</span>
                </div>
                <div className="h-5 flex items-center justify-between gap-[3px] flex-1">
                  {[10, 14, 20, 8, 12, 16, 22, 14, 10, 14, 18, 10, 6, 12, 16, 12, 8, 10].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i % 3 === 0 ? "bg-red-400" : "bg-primary/30 dark:bg-blue-400/30"}`}
                      style={{ height: `${h}px` }}
                    ></div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-red-500">campaign</span>
                Penilaian audio otomatis oleh AI sangat presisi.
              </p>
            </div>

          </div>

        </div>

        {/* Mobile View Gallery - Shows the 4 UI Cards in a 2x2 grid (Only visible on lg:hidden) */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 relative z-20 text-left">
          
          {/* Card 1 */}
          <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                <span className="material-symbols-outlined text-[13px]">style</span>
                Vocabulary
              </span>
              <span className="bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-teal-200/20 dark:border-teal-800/10">
                Mastery: 80%
              </span>
            </div>
            <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-hanken text-base font-bold text-primary dark:text-white">ubiquitous</span>
                <span className="font-mono text-[9px] text-gray-400">/juːˈbɪk.wɪ.təs/</span>
              </div>
              <p className="font-inter text-[11px] text-gray-655 dark:text-gray-450 italic leading-relaxed">
                "Mobile phones are now ubiquitous in our lives."
              </p>
            </div>
            <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-secondary">info</span>
              Artinya: Ada di mana-mana / hadir di setiap tempat.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-orange-655 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                <span className="material-symbols-outlined text-[13px]">edit_document</span>
                Writing
              </span>
              <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-200/20 dark:border-orange-800/10">
                Score: +1.5
              </span>
            </div>
            <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl">
              <p className="font-inter text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                Although the results <span className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-450 line-through px-1 rounded mx-0.5">was</span> <span className="text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50 px-1 rounded border border-teal-200/30">were</span> promising...
              </p>
            </div>
            <p className="text-[10px] text-gray-455 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-orange-500">check_circle</span>
              AI mendeteksi & memperbaiki subject-verb agreement.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                <span className="material-symbols-outlined text-[13px]">analytics</span>
                Analytics
              </span>
              <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200/20 dark:border-blue-800/10">
                CEFR: B2
              </span>
            </div>
            <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-gray-100 dark:border-slate-800 flex items-center justify-center">
                <svg className="w-full h-full text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                  <polygon className="text-gray-200 dark:text-slate-800" points="50,10 90,40 75,90 25,90 10,40" strokeWidth="0.8" stroke="currentColor"></polygon>
                  <polygon className="text-gray-150 dark:text-slate-700" points="50,25 80,47.5 68.75,70 31.25,70 20,47.5" strokeWidth="0.8" stroke="currentColor"></polygon>
                  <polygon className="text-secondary fill-secondary/20" points="50,20 84,41.5 68.75,80 33.75,76 22,43" stroke="currentColor" strokeWidth="1.5"></polygon>
                </svg>
              </div>
              <div className="space-y-1 flex-1 font-inter text-[10px]">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Reading Accuracy</span>
                  <span className="text-primary dark:text-white">85%</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Grammar Score</span>
                  <span className="text-primary dark:text-white">90%</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-primary dark:text-blue-400">trending_up</span>
              Rekomendasi: Latih keahlian Speaking untuk C1.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/95 dark:bg-slate-900/95 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 w-full hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100/60 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-red-655 uppercase tracking-widest flex items-center gap-1.5 font-hanken">
                <span className="material-symbols-outlined text-[13px]">record_voice_over</span>
                Speaking
              </span>
              <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-200/20 dark:border-red-800/10">
                Accuracy: 92%
              </span>
            </div>
            <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100/50 dark:border-slate-800/50 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 border border-red-100/30 flex-shrink-0">
                <span className="material-symbols-outlined text-base animate-pulse">mic</span>
              </div>
              <div className="h-5 flex items-center justify-between gap-[3px] flex-1">
                {[10, 14, 20, 8, 12, 16, 22, 14, 10, 14, 18, 10, 6, 12, 16, 12, 8, 10].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${i % 3 === 0 ? "bg-red-400" : "bg-primary/30 dark:bg-blue-400/30"}`}
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-455 dark:text-gray-500 font-medium mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-red-500">campaign</span>
              Penilaian audio otomatis oleh AI sangat presisi.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
