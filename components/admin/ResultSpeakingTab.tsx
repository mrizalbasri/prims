import type { DetailData } from "./result-detail-types";

interface ResultSpeakingTabProps {
  data: DetailData;
}

export default function ResultSpeakingTab({ data }: ResultSpeakingTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {data.speaking ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Skor Bobot Speaking
              </span>
              <span className="font-mono font-bold text-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/10 inline-block">
                {data.speaking.score}%
              </span>
            </div>
            {data.speaking.audioUrl ? (
              <div className="flex-1 max-w-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Pemutar Audio Rekaman (.webm)
                </span>
                <audio src={data.speaking.audioUrl} controls className="w-full h-8 outline-none" />
              </div>
            ) : (
              <div className="text-gray-450 dark:text-gray-500 italic text-[11px]">
                Audio tidak terekam/diunggah
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Transkrip Pengenalan Suara (Speech Recognition)
            </label>
            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 font-inter text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {data.speaking.transcript || (
                <span className="italic text-gray-400">Tidak ada transkrip rekaman suara terdeteksi.</span>
              )}
            </div>
          </div>

          {data.speaking.feedback && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Evaluasi AI (Pronunciation & Fluency)
              </label>
              <div className="p-5 rounded-2xl bg-teal-50/30 dark:bg-teal-950/10 border border-teal-200/60 dark:border-teal-900/25 space-y-4">
                {typeof data.speaking.feedback === "string" ? (
                  <p className="font-inter text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {data.speaking.feedback}
                  </p>
                ) : (
                  <div className="space-y-3 font-inter text-xs text-gray-750 dark:text-gray-350">
                    {data.speaking.feedback.overall && (
                      <p className="leading-relaxed font-semibold text-gray-850 dark:text-gray-250">
                        {data.speaking.feedback.overall}
                      </p>
                    )}
                    {data.speaking.feedback.pronunciation && (
                      <p className="leading-relaxed">
                        <strong className="text-teal-850 dark:text-teal-350 font-bold block mb-0.5">Pengucapan (Pronunciation):</strong>
                        {data.speaking.feedback.pronunciation}
                      </p>
                    )}
                    {data.speaking.feedback.fluency && (
                      <p className="leading-relaxed">
                        <strong className="text-teal-850 dark:text-teal-350 font-bold block mb-0.5">Kelancaran (Fluency):</strong>
                        {data.speaking.feedback.fluency}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 font-inter text-xs text-gray-400 italic">
          Data ujian speaking tidak tersedia untuk attempt ini.
        </div>
      )}
    </div>
  );
}
