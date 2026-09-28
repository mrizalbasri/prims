import type { WritingPrompt } from "./types";

export default function WritingPromptList({ prompts, onStart }: { prompts: WritingPrompt[]; onStart: (prompt: WritingPrompt) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Latihan Menulis Esai</span>
        <h1 className="font-hanken text-3xl font-extrabold text-gray-900 dark:text-white">Writing Prompts</h1>
        <p className="font-inter text-sm text-gray-500 dark:text-gray-400">Pilih salah satu topik penulisan akademis di bawah untuk berlatih mengekspresikan gagasan dan dapatkan feedback AI.</p>
      </div>
      {prompts.length === 0 ? (
        <div className="bg-white dark:bg-gray-850 rounded-3xl border-2 border-dashed border-gray-150 dark:border-gray-700 p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">draw</span>
          <h2 className="font-hanken text-lg font-bold text-gray-850 dark:text-white">Belum Ada Topik Penulisan</h2>
          <p className="font-inter text-sm text-gray-400 dark:text-gray-550 max-w-xs mx-auto">Prompt menulis belum terisi dalam database saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-xl hover:border-orange-500/40 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prompt.level === "Advanced" ? "bg-green-50 text-green-600 dark:bg-green-500/10" : prompt.level === "Intermediate" ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10" : "bg-red-50 text-red-600 dark:bg-red-500/10"}`}>{prompt.level}</span>
                  <span className="material-symbols-outlined text-orange-600">draw</span>
                </div>
                <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{prompt.title}</h3>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{prompt.prompt}</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                <span className="font-inter text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">edit</span>Min. {prompt.minWords} kata</span>
                <button onClick={() => onStart(prompt)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-hanken text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition-all group cursor-pointer">Mulai Menulis<span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
