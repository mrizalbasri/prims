"use client";

import { useEffect, useState } from "react";

type VocabularyRow = {
  id: string;
  term: string;
  meaning: string;
  exampleSentence: string | null;
  pronunciation: string | null;
  category: string;
  difficulty: string;
};

export default function VocabularyTab() {
  const [vocabCards, setVocabCards] = useState<VocabularyRow[]>([]);
  const [isVocabLoading, setIsVocabLoading] = useState(false);
  const [vocabSearch, setVocabSearch] = useState("");
  const [debouncedVocabSearch, setDebouncedVocabSearch] = useState("");
  const [vocabCategoryFilter, setVocabCategoryFilter] = useState("ALL");
  const [vocabPage, setVocabPage] = useState(1);
  const [vocabTotalPages, setVocabTotalPages] = useState(1);
  const [vocabTotalCount, setVocabTotalCount] = useState(0);

  // Vocab Modal/Form State
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [editingVocabCard, setEditingVocabCard] = useState<VocabularyRow | null>(null);
  const [formVocabTerm, setFormVocabTerm] = useState("");
  const [formVocabMeaning, setFormVocabMeaning] = useState("");
  const [formVocabExample, setFormVocabExample] = useState("");
  const [formVocabPronunciation, setFormVocabPronunciation] = useState("");
  const [formVocabCategory, setFormVocabCategory] = useState("GENERAL");
  const [formVocabDifficulty, setFormVocabDifficulty] = useState("MEDIUM");

  // Debounce vocab search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVocabSearch(vocabSearch);
      setVocabPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [vocabSearch]);

  // Fetch Vocab Cards
  useEffect(() => {
    async function fetchVocab() {
      setIsVocabLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(vocabPage),
          search: debouncedVocabSearch,
          category: vocabCategoryFilter,
          limit: "10",
        });

        const res = await fetch(`/api/admin/vocabulary?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setVocabCards(data.cards || []);
          setVocabTotalPages(data.pagination.totalPages || 1);
          setVocabTotalCount(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Fetch admin vocab error:", err);
      } finally {
        setIsVocabLoading(false);
      }
    }
    void fetchVocab();
  }, [vocabPage, debouncedVocabSearch, vocabCategoryFilter]);

  // Delete Vocab Card
  async function handleDeleteVocab(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu kosa kata ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/vocabulary/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Kartu kosa kata berhasil dihapus!");
        setVocabCards(prev => prev.filter(c => c.id !== id));
        setVocabTotalCount(prev => prev - 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menghapus kartu.");
      }
    } catch (err) {
      console.error("Delete vocab error:", err);
    }
  }

  // Open Add Vocab Modal
  function handleOpenAddVocabModal() {
    setEditingVocabCard(null);
    setFormVocabTerm("");
    setFormVocabMeaning("");
    setFormVocabExample("");
    setFormVocabPronunciation("");
    setFormVocabCategory("GENERAL");
    setFormVocabDifficulty("MEDIUM");
    setIsVocabModalOpen(true);
  }

  // Open Edit Vocab Modal
  function handleOpenEditVocabModal(card: VocabularyRow) {
    setEditingVocabCard(card);
    setFormVocabTerm(card.term);
    setFormVocabMeaning(card.meaning);
    setFormVocabExample(card.exampleSentence || "");
    setFormVocabPronunciation(card.pronunciation || "");
    setFormVocabCategory(card.category);
    setFormVocabDifficulty(card.difficulty);
    setIsVocabModalOpen(true);
  }

  // Save/Update Vocab Card
  async function handleSaveVocab(e: React.FormEvent) {
    e.preventDefault();

    if (!formVocabTerm.trim() || !formVocabMeaning.trim()) {
      alert("Istilah (Term) dan Arti (Meaning) wajib diisi.");
      return;
    }

    const payload = {
      term: formVocabTerm,
      meaning: formVocabMeaning,
      exampleSentence: formVocabExample || null,
      pronunciation: formVocabPronunciation || null,
      category: formVocabCategory,
      difficulty: formVocabDifficulty,
    };

    try {
      let res;
      if (editingVocabCard) {
        res = await fetch(`/api/admin/vocabulary/${editingVocabCard.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(editingVocabCard ? "Kosa kata diperbarui!" : "Kosa kata baru ditambahkan!");
        setIsVocabModalOpen(false);
        setVocabPage(1);

        if (vocabPage === 1) {
          const params = new URLSearchParams({
            page: "1",
            search: debouncedVocabSearch,
            category: vocabCategoryFilter,
            limit: "10",
          });
          const refresh = await fetch(`/api/admin/vocabulary?${params.toString()}`);
          if (refresh.ok) {
            const data = await refresh.json();
            setVocabCards(data.cards || []);
            setVocabTotalPages(data.pagination.totalPages || 1);
            setVocabTotalCount(data.pagination.total || 0);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan kosa kata.");
      }
    } catch (err) {
      console.error("Save vocab error:", err);
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-emerald-600 dark:bg-emerald-400"></div>
            <h1 className="font-hanken text-3xl font-extrabold text-gray-955 dark:text-white">
              Kelola Kosa Kata (Vocabulary)
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Tambahkan, ubah, atau hapus kartu kosa kata pintar (flashcards) dan kategori CEFR yang diakses mahasiswa.
          </p>
        </div>
        <button
          onClick={handleOpenAddVocabModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span> Tambah Kosa Kata Baru
        </button>
      </header>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Kosa Kata", val: `${vocabTotalCount} Kata`, color: "text-emerald-650", icon: "book" },
          { label: "Kategori Pembelajaran", val: "4 Kategori", color: "text-blue-600", icon: "school" },
          { label: "Hak Akses Belajar", val: "Terbuka Otomatis", color: "text-purple-600", icon: "task_alt" }
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{item.label}</span>
              <p className="font-hanken text-2xl font-extrabold text-gray-900 dark:text-white">{item.val}</p>
            </div>
            <span className={`material-symbols-outlined text-3xl ${item.color} bg-gray-50 dark:bg-gray-800 p-3 rounded-xl`}>{item.icon}</span>
          </div>
        ))}
      </div>

      {/* Vocab Cards Table Container */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              placeholder="Cari kosa kata atau arti..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 placeholder-gray-400 transition-colors text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kategori:</span>
            <select
              value={vocabCategoryFilter}
              onChange={(e) => {
                setVocabCategoryFilter(e.target.value);
                setVocabPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-white"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="GENERAL">General</option>
              <option value="ACADEMIC">Academic</option>
              <option value="BUSINESS">Business</option>
              <option value="TECHNICAL">Technical</option>
            </select>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Kata</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Pelafalan</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/4">Arti</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/3">Contoh Kalimat</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Kategori</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Kesulitan</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isVocabLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-6 px-6"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-60 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : vocabCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tidak ada kartu kosa kata ditemukan.
                  </td>
                </tr>
              ) : (
                vocabCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="py-5 px-6 font-hanken font-bold text-gray-900 dark:text-white text-xs">{card.term}</td>
                    <td className="py-5 px-6 font-mono text-[10px] text-gray-400">{card.pronunciation || "-"}</td>
                    <td className="py-5 px-6 text-xs text-gray-600 dark:text-gray-400 font-medium">{card.meaning}</td>
                    <td className="py-5 px-6 text-xs text-gray-500 dark:text-gray-450 italic font-inter">
                      {card.exampleSentence ? `"${card.exampleSentence}"` : "-"}
                    </td>
                    <td className="py-5 px-6 text-xs font-bold text-blue-650 dark:text-blue-400">
                      <span className="bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50 text-[10px] tracking-wide uppercase font-black">
                        {card.category}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-xs font-bold">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        card.difficulty === "EASY" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" :
                        card.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" :
                        "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                      }`}>
                        {card.difficulty}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditVocabModal(card)}
                          className="p-1.5 text-gray-500 hover:text-blue-650 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVocab(card.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-450 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        {vocabTotalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-900/5">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
              Halaman {vocabPage} dari {vocabTotalPages} ({vocabTotalCount} item)
            </span>
            <div className="flex gap-2">
              <button
                disabled={vocabPage === 1}
                onClick={() => setVocabPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                Kembali
              </button>
              <button
                disabled={vocabPage === vocabTotalPages}
                onClick={() => setVocabPage(prev => Math.min(prev + 1, vocabTotalPages))}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Kosa Kata */}
      {isVocabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <h3 className="font-hanken font-extrabold text-gray-900 dark:text-white text-base">
                {editingVocabCard ? "Edit Kartu Kosa Kata" : "Tambah Kosa Kata Baru"}
              </h3>
              <button
                onClick={() => setIsVocabModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVocab} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Kategori</label>
                  <select
                    value={formVocabCategory}
                    onChange={(e) => setFormVocabCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="BUSINESS">Business</option>
                    <option value="TECHNICAL">Technical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Kesulitan</label>
                  <select
                    value={formVocabDifficulty}
                    onChange={(e) => setFormVocabDifficulty(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Istilah (Term) *</label>
                  <input
                    type="text"
                    required
                    value={formVocabTerm}
                    onChange={(e) => setFormVocabTerm(e.target.value)}
                    placeholder="e.g. Alleviate"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Pelafalan (Pronunciation)</label>
                  <input
                    type="text"
                    value={formVocabPronunciation}
                    onChange={(e) => setFormVocabPronunciation(e.target.value)}
                    placeholder="e.g. /əˈliːvieɪt/"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Arti (Meaning) *</label>
                <textarea
                  required
                  rows={2}
                  value={formVocabMeaning}
                  onChange={(e) => setFormVocabMeaning(e.target.value)}
                  placeholder="e.g. Meredakan, mengurangi rasa sakit atau kesulitan."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Contoh Kalimat (Example Sentence)</label>
                <textarea
                  rows={2}
                  value={formVocabExample}
                  onChange={(e) => setFormVocabExample(e.target.value)}
                  placeholder="e.g. The doctor gave him some medicine to alleviate the pain."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVocabModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer"
                >
                  Simpan Kosa Kata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
