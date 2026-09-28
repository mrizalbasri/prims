import type { VocabularyCard } from "./types";

type VocabularyFlashcardProps = {
  card: VocabularyCard;
  isFlipped: boolean;
  onFlip: () => void;
  onReview: (quality: 1 | 2 | 3 | 4 | 5) => void;
};

const reviewOptions = [
  { quality: 1 as const, label: "Lupa", color: "bg-red-500 hover:bg-red-600 shadow-red-200/50 hover:shadow-red-500/20", icon: "sentiment_very_dissatisfied" },
  { quality: 2 as const, label: "Sulit", color: "bg-orange-500 hover:bg-orange-600 shadow-orange-200/50 hover:shadow-orange-500/20", icon: "sentiment_dissatisfied" },
  { quality: 3 as const, label: "Cukup", color: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200/50 hover:shadow-yellow-500/20", icon: "sentiment_neutral" },
  { quality: 4 as const, label: "Baik", color: "bg-green-500 hover:bg-green-600 shadow-green-200/50 hover:shadow-green-500/20", icon: "sentiment_satisfied" },
  { quality: 5 as const, label: "Mudah", color: "bg-blue-500 hover:bg-blue-600 shadow-blue-200/50 hover:shadow-blue-500/20", icon: "sentiment_very_satisfied" },
];

export default function VocabularyFlashcard({ card, isFlipped, onFlip, onReview }: VocabularyFlashcardProps) {
  const levelColor = card.level === "Advanced" ? "bg-green-500/20 text-green-600 dark:text-green-400" : card.level === "Intermediate" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "bg-red-500/20 text-red-600 dark:text-red-400";
  return (
    <div className="space-y-8">
      <button type="button" aria-label={isFlipped ? `Sembunyikan definisi ${card.word}` : `Lihat definisi ${card.word}`} className="relative w-full h-[360px] cursor-pointer perspective-1000" onClick={onFlip} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onFlip(); } }}>
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-xl border border-blue-500/30">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6"><span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>style</span></div>
            <h2 className="font-hanken text-4xl md:text-5xl font-black text-white tracking-tight mb-4 select-none">{card.word}</h2>
            <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">{card.level}</span>
            <p className="absolute bottom-6 text-white/50 text-xs font-inter uppercase tracking-widest select-none">Klik kartu untuk membalik</p>
          </div>
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 flex flex-col justify-between shadow-xl">
            <div className="space-y-6"><div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4"><h2 className="font-hanken text-3xl font-bold text-gray-900 dark:text-white">{card.word}</h2><span className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${levelColor}`}>{card.level}</span></div><div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Definisi</span><p className="font-inter text-base text-gray-700 dark:text-gray-200 leading-relaxed">{card.definition}</p></div><div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Contoh Kalimat</span><p className="font-inter text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">&quot;{card.example}&quot;</p></div></div>
            <p className="text-gray-400 text-center text-xs font-inter uppercase tracking-widest select-none pt-4">Klik untuk membalik kembali</p>
          </div>
        </div>
      </button>
      {isFlipped && <div className="space-y-4 animate-fadeIn"><p className="text-center font-hanken text-sm font-bold text-gray-700 dark:text-gray-300">Seberapa baik Anda mengingat kata ini?</p><div className="grid grid-cols-5 gap-1.5 sm:gap-4">{reviewOptions.map((option) => <button key={option.quality} onClick={() => onReview(option.quality)} className={`${option.color} text-white rounded-xl p-2 sm:p-4 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-1 group cursor-pointer hover:-translate-y-0.5`}><span className="material-symbols-outlined text-xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{option.icon}</span><span className="font-hanken text-[9px] sm:text-xs font-bold">{option.label}</span></button>)}</div></div>}
    </div>
  );
}
