import React from 'react';

type Scores = {
  vocabulary: number;
  grammar: number;
  reading: number;
  writing: number;
  speaking: number;
  total: number;
};

interface RadarChartProps {
  scores: Scores;
}

export function RadarChart({ scores }: RadarChartProps) {
  function getRadarPoints(sc: Scores) {
    const vRadius = 40 * (sc.vocabulary / 100);
    const gRadius = 40 * (sc.grammar / 100);
    const rRadius = 40 * (sc.reading / 100);
    const wRadius = 40 * (sc.writing / 100);
    const sRadius = 40 * (sc.speaking / 100);

    const x0 = 50;
    const y0 = 50 - vRadius;

    const x1 = 50 + gRadius * Math.cos(18 * Math.PI / 180);
    const y1 = 50 - gRadius * Math.sin(18 * Math.PI / 180);

    const x2 = 50 + rRadius * Math.cos(54 * Math.PI / 180);
    const y2 = 50 + rRadius * Math.sin(54 * Math.PI / 180);

    const x3 = 50 - wRadius * Math.cos(54 * Math.PI / 180);
    const y3 = 50 + wRadius * Math.sin(54 * Math.PI / 180);

    const x4 = 50 - sRadius * Math.cos(18 * Math.PI / 180);
    const y4 = 50 - sRadius * Math.sin(18 * Math.PI / 180);

    return `${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
  }

  return (
    <div className="w-full lg:w-80 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex-shrink-0">
      <span className="font-hanken text-xs font-bold text-gray-400 dark:text-gray-300 tracking-wider mb-4 uppercase">
        Skill Breakdown Chart
      </span>
      <div className="w-48 h-48 relative">
        <svg className="w-full h-full text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 100 100">
          {/* Outlines */}
          <polygon className="text-gray-200 dark:text-gray-700" points="50,10 90,40 75,90 25,90 10,40" strokeWidth="0.5"></polygon>
          <polygon className="text-gray-200/50 dark:text-gray-750" points="50,25 80,47.5 68.75,70 31.25,70 20,47.5" strokeWidth="0.5"></polygon>
          <polygon className="text-gray-200/20 dark:text-gray-800" points="50,40 70,55 62.5,50 37.5,50 30,55" strokeWidth="0.5"></polygon>
          
          {/* Axis */}
          <line x1="50" y1="50" x2="50" y2="10" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
          <line x1="50" y1="50" x2="90" y2="40" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
          <line x1="50" y1="50" x2="75" y2="90" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
          <line x1="50" y1="50" x2="25" y2="90" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>
          <line x1="50" y1="50" x2="10" y2="40" className="text-gray-250 dark:text-gray-700" strokeWidth="0.5"></line>

          {/* Dynamic Points Polygon */}
          <polygon 
            className="text-blue-600 dark:text-blue-400 fill-blue-600/20 dark:fill-blue-400/20" 
            points={getRadarPoints(scores)} 
            stroke="currentColor" 
            strokeWidth="1.5"
          ></polygon>
          
          {/* Axis labels */}
          <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="middle" x="50" y="6">VOC</text>
          <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="start" x="92" y="41">GRA</text>
          <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="middle" x="78" y="96">REA</text>
          <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="middle" x="22" y="96">WRI</text>
          <text className="font-label-sm font-bold" fill="currentColor" fontSize="5" textAnchor="end" x="8" y="41">SPE</text>
        </svg>
      </div>
    </div>
  );
}
