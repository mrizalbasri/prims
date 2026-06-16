"use client";

import { useEffect, useState } from "react";

export default function DashboardMockup() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const skills = [
    { label: "Vocabulary", score: 75, maxScore: 100, color: "bg-blue-600" },
    { label: "Grammar", score: 85, maxScore: 100, color: "bg-purple-600" },
    { label: "Reading", score: 90, maxScore: 100, color: "bg-green-600" },
    { label: "Writing", score: 65, maxScore: 100, color: "bg-orange-600" },
    { label: "Speaking", score: 70, maxScore: 100, color: "bg-red-600" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-2xl overflow-hidden relative w-full max-w-lg mx-auto">
      {/* Window header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-100 dark:border-gray-600 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 text-center font-hanken text-[11px] font-bold text-gray-400 dark:text-gray-300 tracking-wider">
          PRISM STUDENT WORKSPACE
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Welcome header inside mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">
              Student Performance
            </h3>
            <p className="font-inter text-xs text-gray-400 dark:text-gray-300">
              Placement Test #1 — Budi Santoso
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
            <span className="font-hanken font-bold text-[10px] text-green-600 dark:text-green-400 uppercase tracking-wider">
              CEFR Level: B2
            </span>
          </div>
        </div>

        {/* Radar chart and score breakdown */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* SVG Radar chart */}
          <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <svg className="w-full h-full text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 100 100">
              {/* Outer pentagon outline */}
              <polygon className="text-gray-200 dark:text-gray-600" points="50,10 90,40 75,90 25,90 10,40" strokeWidth="0.5" stroke="currentColor"></polygon>
              {/* Mid pentagon outline */}
              <polygon className="text-gray-150 dark:text-gray-700" points="50,25 80,47.5 68.75,70 31.25,70 20,47.5" strokeWidth="0.5" stroke="currentColor"></polygon>
              {/* Inner pentagon outline */}
              <polygon className="text-gray-100 dark:text-gray-800" points="50,40 70,55 62.5,50 37.5,50 30,55" strokeWidth="0.5" stroke="currentColor"></polygon>
              
              {/* Axis lines */}
              <line x1="50" y1="50" x2="50" y2="10" className="text-gray-200 dark:text-gray-600" strokeWidth="0.5"></line>
              <line x1="50" y1="50" x2="90" y2="40" className="text-gray-200 dark:text-gray-600" strokeWidth="0.5"></line>
              <line x1="50" y1="50" x2="75" y2="90" className="text-gray-200 dark:text-gray-600" strokeWidth="0.5"></line>
              <line x1="50" y1="50" x2="25" y2="90" className="text-gray-200 dark:text-gray-600" strokeWidth="0.5"></line>
              <line x1="50" y1="50" x2="10" y2="40" className="text-gray-200 dark:text-gray-600" strokeWidth="0.5"></line>

              {/* Dynamic filled area */}
              <polygon 
                className="text-teal-600 dark:text-teal-400 fill-teal-600/20 dark:fill-teal-400/20 transition-all duration-1000 ease-out" 
                points={
                  animated 
                    ? "50,20 84,41.5 68.75,80 33.75,76 22,43" // Animated values
                    : "50,50 50,50 50,50 50,50 50,50"          // Centered initial values
                } 
                stroke="currentColor" 
                strokeWidth="1.5"
              ></polygon>
              
              {/* Axis labels */}
              <text className="font-label-sm" fill="currentColor" fontSize="4" textAnchor="middle" x="50" y="6">VOC</text>
              <text className="font-label-sm" fill="currentColor" fontSize="4" textAnchor="start" x="92" y="41">GRA</text>
              <text className="font-label-sm" fill="currentColor" fontSize="4" textAnchor="middle" x="78" y="95">REA</text>
              <text className="font-label-sm" fill="currentColor" fontSize="4" textAnchor="middle" x="22" y="95">WRI</text>
              <text className="font-label-sm" fill="currentColor" fontSize="4" textAnchor="end" x="8" y="41">SPE</text>
            </svg>
          </div>

          {/* Skill lists with bars */}
          <div className="w-full space-y-4">
            {skills.map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold font-hanken">
                  <span className="text-gray-700 dark:text-gray-300">{skill.label}</span>
                  <span className="text-gray-900 dark:text-white">{skill.score}%</span>
                </div>
                <div className="w-full bg-gray-150 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${skill.color} h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: animated ? `${skill.score}%` : "0%" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spark card overlay */}
        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 flex gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">insights</span>
          <div>
            <h4 className="font-hanken text-xs font-bold text-gray-900 dark:text-white">
              Saran AI Writing
            </h4>
            <p className="font-inter text-[11px] text-gray-500 dark:text-gray-300 leading-relaxed mt-0.5">
              Tata bahasa (Grammar) Anda dinilai sangat baik (85/100). Namun, pastikan untuk menggunakan kosakata (Vocabulary) akademik yang lebih bervariasi agar mencapai tingkat C1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
