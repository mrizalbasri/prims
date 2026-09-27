import type { SpeakingScenario } from "./types";

type SpeakingScenarioListProps = {
  scenarios: SpeakingScenario[];
  subTab: "conversation" | "read-along";
  onSubTabChange: (tab: "conversation" | "read-along") => void;
  onStartPractice: (scenario: SpeakingScenario) => void;
};

export default function SpeakingScenarioList({
  scenarios,
  subTab,
  onSubTabChange,
  onStartPractice,
}: SpeakingScenarioListProps) {
  const visibleScenarios = scenarios.filter((scenario) =>
    subTab === "read-along" ? scenario.isReadAlong : !scenario.isReadAlong,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
          Latihan Percakapan
        </span>
        <h1 className="font-hanken text-3xl font-extrabold text-gray-900 dark:text-white">
          Speaking Scenarios
        </h1>
        <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
          Pilih salah satu skenario simulasi komunikasi dan mulailah melatih
          pengucapan, intonasi, dan kelancaran berbicara Anda dengan asisten AI.
        </p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { key: "conversation" as const, label: "Simulasi Percakapan" },
          { key: "read-along" as const, label: "Membaca Teks Berjalan" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSubTabChange(tab.key)}
            className={`pb-3 font-hanken text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex-shrink-0 ${
              subTab === tab.key
                ? "border-red-600 text-red-600 dark:text-red-400"
                : "border-transparent text-gray-450 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleScenarios.length === 0 ? (
        <div className="bg-white dark:bg-gray-850 rounded-3xl border-2 border-dashed border-gray-150 dark:border-gray-700 p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">
            mic
          </span>
          <h2 className="font-hanken text-lg font-bold text-gray-850 dark:text-white">
            {subTab === "read-along" ? "Belum Ada Teks Berjalan" : "Belum Ada Skenario"}
          </h2>
          <p className="font-inter text-sm text-gray-405 dark:text-gray-500 max-w-xs mx-auto">
            {subTab === "read-along"
              ? "Teks berjalan belum dimuat dalam sistem."
              : "Skenario berbicara lisan belum dimuat dalam sistem."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-xl hover:border-red-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      scenario.level === "Advanced"
                        ? "bg-green-50 text-green-600 dark:bg-green-500/10"
                        : scenario.level === "Intermediate"
                          ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10"
                          : "bg-red-50 text-red-600 dark:bg-red-500/10"
                    }`}
                  >
                    {scenario.level}
                  </span>
                  <span className="material-symbols-outlined text-red-600">mic</span>
                </div>

                <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                  {scenario.title}
                </h3>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {scenario.scenario || scenario.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                <span className="font-inter text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  Maks. {scenario.duration} detik
                </span>
                <button
                  onClick={() => onStartPractice(scenario)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-750 text-white font-hanken text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                >
                  Mulai Praktik
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
