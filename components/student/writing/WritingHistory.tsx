import type { Submission } from "./types";

export default function WritingHistory({ submissions, onBrowse }: { submissions: Submission[]; onBrowse: () => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Rekam Jejak Latihan</span>
        <h1 className="font-hanken text-3xl font-extrabold text-gray-900 dark:text-white">Riwayat Submission</h1>
        <p className="font-inter text-sm text-gray-500 dark:text-gray-400">Lihat seluruh esai yang pernah Anda ajukan beserta skor perkembangan yang diraih.</p>
      </div>
      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-850 rounded-3xl border-2 border-dashed border-gray-150 dark:border-gray-700 p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">history</span>
          <h2 className="font-hanken text-lg font-bold text-gray-850 dark:text-white">Belum Ada Submission</h2>
          <p className="font-inter text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-4">Selesaikan latihan menulis esai pertama Anda untuk melihat riwayat perkembangan di sini.</p>
          <button onClick={onBrowse} className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-hanken text-xs font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all cursor-pointer">Cari Topik Menulis<span className="material-symbols-outlined">arrow_forward</span></button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1"><h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">{submission.prompt.title}</h3><p className="font-inter text-xs text-gray-450 dark:text-gray-500">Diserahkan pada {new Date(submission.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</p></div>
                <div className="flex items-center gap-4 border-l border-gray-100 dark:border-gray-800 pl-0 md:pl-6"><div className="text-center"><p className="font-mono text-3xl font-black text-orange-600 dark:text-orange-400">{submission.score}</p><p className="font-inter text-[9px] uppercase font-bold text-gray-400 tracking-wider">Skor</p></div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
