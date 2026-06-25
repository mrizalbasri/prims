"use client";

import React from "react";

type Scores = {
  vocabulary: number;
  grammar: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
};

interface RadarChart6Props {
  scores: Scores;
}

export default function RadarChart6({ scores }: RadarChart6Props) {
  // Helper to calculate coordinate for a specific axis and score
  function getCoordinate(index: number, score: number) {
    const R = 38 * (Math.max(5, score) / 100); // minimum 5% to look nice
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const x = 50 + R * Math.cos(angle);
    const y = 50 + R * Math.sin(angle);
    return { x, y };
  }

  // Calculate points string for scores polygon
  const scorePointsList = [
    getCoordinate(0, scores.vocabulary),
    getCoordinate(1, scores.grammar),
    getCoordinate(2, scores.listening),
    getCoordinate(3, scores.reading),
    getCoordinate(4, scores.writing),
    getCoordinate(5, scores.speaking),
  ];
  const scorePointsStr = scorePointsList.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map(level => {
    return [0, 1, 2, 3, 4, 5].map(idx => {
      const angle = (idx * 60 - 90) * (Math.PI / 180);
      const R = 38 * (level / 100);
      const x = 50 + R * Math.cos(angle);
      const y = 50 + R * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  });

  // Axis lines
  const axisLines = [0, 1, 2, 3, 4, 5].map(idx => {
    const angle = (idx * 60 - 90) * (Math.PI / 180);
    const x = 50 + 38 * Math.cos(angle);
    const y = 50 + 38 * Math.sin(angle);
    return { x, y };
  });

  // Labels coordinates and anchors
  const labels: { label: string; x: number; y: number; anchor: "middle" | "start" | "end" }[] = [
    { label: "VOC", x: 50, y: 7, anchor: "middle" },      // Top
    { label: "GRM", x: 92, y: 31, anchor: "start" },      // Top-Right
    { label: "LST", x: 92, y: 73, anchor: "start" },      // Bottom-Right
    { label: "RDG", x: 50, y: 97, anchor: "middle" },     // Bottom
    { label: "WRT", x: 8, y: 73, anchor: "end" },         // Bottom-Left
    { label: "SPK", x: 8, y: 31, anchor: "end" },         // Top-Left
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] dark:shadow-none transition-all duration-300">
      <span className="font-hanken text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest mb-6 uppercase">
        GRAFIK DISTRIBUSI SKILL
      </span>
      
      <div className="w-56 h-56 sm:w-64 sm:h-64 relative">
        <svg
          viewBox="-10 -8 120 116"
          className="w-full h-full text-slate-800 dark:text-slate-100"
          fill="none"
          stroke="currentColor"
        >
          <defs>
            <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Alternating filled hexagons for premium grid depth */}
          <polygon points={gridPolygons[3]} className="fill-slate-50/20 dark:fill-slate-900/10 stroke-none" />
          <polygon points={gridPolygons[1]} className="fill-slate-100/35 dark:fill-slate-900/25 stroke-none" />

          {/* Concentric Hexagon Grid Lines */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              className="stroke-slate-200/70 dark:stroke-slate-800/75"
              strokeWidth="0.4"
              strokeDasharray={idx < 3 ? "2 2" : "0"}
            />
          ))}

          {/* Axis Lines from Center */}
          {axisLines.map((line, idx) => (
            <line
              key={idx}
              x1="50"
              y1="50"
              x2={line.x}
              y2={line.y}
              className="stroke-slate-200/70 dark:stroke-slate-800/75"
              strokeWidth="0.4"
            />
          ))}

          {/* Score Area Polygon */}
          <polygon
            points={scorePointsStr}
            fill="url(#radarAreaGradient)"
            className="stroke-teal-600 dark:stroke-teal-500 text-teal-600 dark:text-teal-500"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points Dots */}
          {scorePointsList.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="2.2"
              className="fill-white dark:fill-[#151D30] stroke-teal-650 dark:stroke-teal-400"
              strokeWidth="1.8"
            />
          ))}

          {/* Grid Value Text Marks (e.g. 50, 100) */}
          <text x="53.5" y="42.5" className="font-mono font-bold fill-slate-400 dark:fill-slate-500" fontSize="2.8" textAnchor="start" stroke="none">25</text>
          <text x="53.5" y="33" className="font-mono font-bold fill-slate-400 dark:fill-slate-500" fontSize="2.8" textAnchor="start" stroke="none">50</text>
          <text x="53.5" y="23.5" className="font-mono font-bold fill-slate-400 dark:fill-slate-500" fontSize="2.8" textAnchor="start" stroke="none">75</text>
          <text x="53.5" y="14" className="font-mono font-bold fill-slate-400 dark:fill-slate-500" fontSize="2.8" textAnchor="start" stroke="none">100</text>

          {/* Outer labels */}
          {labels.map((item, idx) => (
            <text
              key={idx}
              x={item.x}
              y={item.y}
              className="font-hanken font-extrabold fill-slate-700 dark:fill-slate-300"
              fontSize="4.5"
              textAnchor={item.anchor}
              stroke="none"
            >
              {item.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
