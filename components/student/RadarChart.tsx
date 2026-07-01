import React from 'react';

type Scores = {
  vocabulary?: number;
  grammar?: number;
  listening?: number;
  reading?: number;
  writing?: number;
  speaking?: number;
  total?: number;
};

interface RadarChartProps {
  scores: Scores;
}

export function RadarChart({ scores }: RadarChartProps) {
  // Filter valid axis keys that are present in scores (excluding 'total')
  const allowedKeys = ['vocabulary', 'grammar', 'listening', 'reading', 'writing', 'speaking'];
  const axisKeys = allowedKeys.filter(
    (key) => key in scores && typeof scores[key as keyof Scores] === 'number'
  );

  const N = axisKeys.length;
  if (N < 3) {
    // ponytail: fallback if not enough axes
    return <div className="text-xs text-slate-400">Not enough data to display chart</div>;
  }

  const labelMap: Record<string, string> = {
    vocabulary: 'VOC',
    grammar: 'GRM',
    listening: 'LST',
    reading: 'RDG',
    writing: 'WRT',
    speaking: 'SPK',
  };

  // Helper to calculate coordinate for a specific axis and score
  function getCoordinate(index: number, score: number) {
    const R = 38 * (Math.max(5, score) / 100); // minimum 5% to look nice
    const angle = (index * (360 / N) - 90) * (Math.PI / 180);
    const x = 50 + R * Math.cos(angle);
    const y = 50 + R * Math.sin(angle);
    return { x, y };
  }

  // Calculate points string for scores polygon
  const scorePointsStr = axisKeys
    .map((key, idx) => {
      const score = scores[key as keyof Scores] ?? 0;
      const coord = getCoordinate(idx, score);
      return `${coord.x.toFixed(2)},${coord.y.toFixed(2)}`;
    })
    .join(' ');

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((level) => {
    return Array.from({ length: N })
      .map((_, idx) => {
        const angle = (idx * (360 / N) - 90) * (Math.PI / 180);
        const R = 38 * (level / 100);
        const x = 50 + R * Math.cos(angle);
        const y = 50 + R * Math.sin(angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });

  // Axis lines
  const axisLines = Array.from({ length: N }).map((_, idx) => {
    const angle = (idx * (360 / N) - 90) * (Math.PI / 180);
    const x = 50 + 38 * Math.cos(angle);
    const y = 50 + 38 * Math.sin(angle);
    return { x, y };
  });

  // Labels coordinates (placed slightly outside radius 38)
  const labels = axisKeys.map((key, idx) => {
    const angle = (idx * (360 / N) - 90) * (Math.PI / 180);
    const R = 47; // label radius
    const x = 50 + R * Math.cos(angle);
    const y = 50 + R * Math.sin(angle);

    const cosVal = Math.cos(angle);
    let anchor: 'middle' | 'start' | 'end' = 'middle';
    if (cosVal > 0.15) anchor = 'start';
    else if (cosVal < -0.15) anchor = 'end';

    return {
      label: labelMap[key] || key.substring(0, 3).toUpperCase(),
      x,
      y: y + 2,
      anchor,
    };
  });

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

          {/* Alternating filled polygons for premium grid depth */}
          <polygon points={gridPolygons[3]} className="fill-slate-50/20 dark:fill-slate-900/10 stroke-none" />
          <polygon points={gridPolygons[1]} className="fill-slate-100/35 dark:fill-slate-900/25 stroke-none" />

          {/* Concentric Grid Lines */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              className="stroke-slate-200/70 dark:stroke-slate-800/75"
              strokeWidth="0.4"
              strokeDasharray={idx < 3 ? '2 2' : '0'}
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
            className="stroke-blue-600 dark:stroke-blue-400"
            strokeWidth="1.5"
          />

          {/* Labels */}
          {labels.map((lbl, idx) => (
            <text
              key={idx}
              x={lbl.x}
              y={lbl.y}
              textAnchor={lbl.anchor}
              className="fill-slate-400 dark:fill-slate-500 font-bold"
              fontSize="5"
            >
              {lbl.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
