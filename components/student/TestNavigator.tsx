"use client";

type Section = {
  section: "vocabulary" | "grammar" | "reading" | "writing" | "speaking";
  durationMinutes: number;
};

type TestNavigatorProps = {
  sections: Section[];
  sectionIndex: number;
  sectionLabels: Record<Section["section"], string>;
};

export default function TestNavigator({ sections, sectionIndex, sectionLabels }: TestNavigatorProps) {
  return (
    <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm space-y-6">
      <h3 className="font-hanken text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-400">map</span>
        Navigator Struktur Ujian
      </h3>
      
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sub-Seksi Tes</p>
          <div className="space-y-2.5">
            {sections.map((sec, idx) => {
              const isCurrent = idx === sectionIndex;
              const isCompleted = idx < sectionIndex;
              return (
                <div 
                  key={sec.section}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isCurrent 
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-500/10" 
                      : isCompleted 
                      ? "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60" 
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-lg ${
                      isCurrent ? "text-teal-600 dark:text-teal-400" :
                      isCompleted ? "text-teal-600 dark:text-teal-400" :
                      "text-gray-300 dark:text-gray-600"
                    }`} style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "" }}>
                      {isCompleted ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className={`font-inter text-xs font-bold ${
                      isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {sectionLabels[sec.section].split(' ')[0]}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-400 dark:text-gray-550">
                    {sec.durationMinutes}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigator Legend */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
            <span className="font-inter text-xs text-gray-550 dark:text-gray-400 font-medium">Seksi Berjalan</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"></div>
            <span className="font-inter text-xs text-gray-550 dark:text-gray-400 font-medium">Seksi Mendatang</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500/20"></div>
            <span className="font-inter text-xs text-gray-550 dark:text-gray-400 font-medium">Seksi Selesai</span>
          </div>
        </div>
      </div>
    </div>
  );
}
