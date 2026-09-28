const categories = [
  { id: "ALL", label: "Semua Kategori", icon: "all_inclusive", desc: "Pelajari semua kategori kata" },
  { id: "ACADEMIC", label: "Academic", icon: "history_edu", desc: "Kata umum perkuliahan & jurnal" },
  { id: "BUSINESS", label: "Business", icon: "business_center", desc: "Kata presentasi & negosiasi" },
  { id: "TECHNICAL", label: "Technical", icon: "terminal", desc: "Kosakata teknis & sains" },
];

type VocabularySessionStartProps = {
  category: string;
  onCategoryChange: (category: string) => void;
  onStart: () => void;
};

export default function VocabularySessionStart({
  category,
  onCategoryChange,
  onStart,
}: VocabularySessionStartProps) {
  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 text-center shadow-xl space-y-8 animate-fadeIn">
        <div className="space-y-3">
          <span className="material-symbols-outlined text-6xl text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>style</span>
          <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Latihan Kosakata</h1>
          <p className="font-inter text-sm text-gray-505 dark:text-gray-400">Pilih kategori kosa kata akademik yang ingin Anda pelajari hari ini.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => onCategoryChange(item.id)}
              type="button"
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col gap-3 group cursor-pointer ${category === item.id ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10" : "border-gray-150 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800"}`}
            >
              <span className={`material-symbols-outlined text-2xl ${category === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>{item.icon}</span>
              <div><h4 className="font-hanken font-bold text-sm text-gray-900 dark:text-white">{item.label}</h4><p className="font-inter text-[10px] text-gray-450 dark:text-gray-500 leading-normal">{item.desc}</p></div>
            </button>
          ))}
        </div>
        <button onClick={onStart} type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-hanken text-base font-bold py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined">play_arrow</span>Mulai Sesi Belajar
        </button>
      </div>
    </main>
  );
}
