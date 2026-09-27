import type { DetailData } from "./result-detail-types";

interface ResultWritingTabProps {
  data: DetailData;
}

export default function ResultWritingTab({ data }: ResultWritingTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {data.writing ? (
        <>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Skor Bobot Writing
            </span>
            <span className="font-mono font-bold text-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/10">
              {data.writing.score}%
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Teks Esai Mahasiswa
            </label>
            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 font-inter text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {data.writing.content || (
                <span className="italic text-gray-400">Mahasiswa tidak menulis jawaban apapun.</span>
              )}
            </div>
          </div>

          {data.writing.feedback && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Evaluasi AI & Koreksi Grammar
              </label>
              <div className="p-5 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/25 space-y-4">
                {typeof data.writing.feedback === "string" ? (
                  <p className="font-inter text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {data.writing.feedback}
                  </p>
                ) : (
                  <div className="space-y-3 font-inter text-xs text-gray-750 dark:text-gray-350">
                    {data.writing.feedback.overall && (
                      <p className="leading-relaxed font-semibold text-gray-850 dark:text-gray-250">
                        {data.writing.feedback.overall}
                      </p>
                    )}
                    {data.writing.feedback.suggestions && Array.isArray(data.writing.feedback.suggestions) && (
                      <div className="space-y-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/20">
                        <span className="font-bold text-amber-800 dark:text-amber-400 text-[10px] uppercase tracking-wider block">
                          Saran Perbaikan:
                        </span>
                        <ul className="list-disc pl-5 space-y-1.5">
                          {data.writing.feedback.suggestions.map((suggestion, index) => (
                            <li key={index} className="leading-relaxed">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 font-inter text-xs text-gray-400 italic">
          Data ujian writing tidak tersedia untuk attempt ini.
        </div>
      )}
    </div>
  );
}
