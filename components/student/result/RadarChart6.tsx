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
    { label: "GRA", x: 92, y: 31, anchor: "start" },      // Top-Right
    { label: "LIS", x: 92, y: 73, anchor: "start" },      // Bottom-Right
    { label: "REA", x: 50, y: 97, anchor: "middle" },     // Bottom
    { label: "WRI", x: 8, y: 73, anchor: "end" },         // Bottom-Left
    { label: "SPE", x: 8, y: 31, anchor: "end" },         // Top-Left
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] dark:shadow-none transition-all duration-300">
      <span className="font-hanken text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest mb-6 uppercase">
        GRAFIK DISTRIBUSI SKILL
      </span>
      
      <div className="w-56 h-56 sm:w-64 sm:h-64 relative">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-slate-800 dark:text-slate-100"
          fill="none"
          stroke="currentColor"
        >
          <defs>
            <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.35" />
            </radialGradient>
          </defs>

          {/* Concentric Hexagon Grid Lines */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              className="stroke-slate-200/80 dark:stroke-slate-800/80"
              strokeWidth="0.5"
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
              className="stroke-slate-200/80 dark:stroke-slate-800/80"
              strokeWidth="0.5"
            />
          ))}

          {/* Score Area Polygon */}
          <polygon
            points={scorePointsStr}
            fill="url(#radarAreaGradient)"
            className="stroke-blue-600 dark:stroke-blue-500 text-blue-600 dark:text-blue-500"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points Dots */}
          {scorePointsList.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="2"
              className="fill-white dark:fill-[#151D30] stroke-blue-600 dark:stroke-blue-500"
              strokeWidth="1.5"
            />
          ))}

          {/* Grid Value Text Marks (e.g. 50, 100) */}
          <text x="50" y="41" className="font-mono font-bold text-slate-300 dark:text-slate-700" fontSize="3" textAnchor="middle">25</text>
          <text x="50" y="31.5" className="font-mono font-bold text-slate-350 dark:text-slate-700" fontSize="3" textAnchor="middle">50</text>
          <text x="50" y="22" className="font-mono font-bold text-slate-350 dark:text-slate-700" fontSize="3" textAnchor="middle">75</text>
          <text x="50" y="12.5" className="font-mono font-bold text-slate-400 dark:text-slate-650" fontSize="3" textAnchor="middle">100</text>

          {/* Outer labels */}
          {labels.map((item, idx) => (
            <text
              key={idx}
              x={item.x}
              y={item.y}
              className="font-hanken font-bold fill-slate-500 dark:fill-slate-400"
              fontSize="4.5"
              textAnchor={item.anchor}
            >
              {item.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
