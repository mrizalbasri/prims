"use client";

import { useEffect, useState } from "react";

type WritingPromptRow = {
  id: string;
  title: string;
  type: string;
  level: string | null;
  promptText: string;
  wordCountMin: number;
  wordCountMax: number;
  rubric: any;
};

export default function WritingTab() {
  const [writingPrompts, setWritingPrompts] = useState<WritingPromptRow[]>([]);
  const [isWritingLoading, setIsWritingLoading] = useState(false);
  const [writingSearch, setWritingSearch] = useState("");
  const [debouncedWritingSearch, setDebouncedWritingSearch] = useState("");
  const [writingTypeFilter, setWritingTypeFilter] = useState("ALL");
  const [writingPage, setWritingPage] = useState(1);
  const [writingTotalPages, setWritingTotalPages] = useState(1);
  const [writingTotalCount, setWritingTotalCount] = useState(0);

  // Writing Form/Modal State
  const [isWritingModalOpen, setIsWritingModalOpen] = useState(false);
  const [editingWritingPrompt, setEditingWritingPrompt] = useState<WritingPromptRow | null>(null);
  const [formWritingTitle, setFormWritingTitle] = useState("");
  const [formWritingType, setFormWritingType] = useState("ESSAY");
  const [formWritingText, setFormWritingText] = useState("");
  const [formWritingMinWords, setFormWritingMinWords] = useState(100);
  const [formWritingMaxWords, setFormWritingMaxWords] = useState(150);
  const [formWritingCriteria, setFormWritingCriteria] = useState("");

  // Debounce writing search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedWritingSearch(writingSearch);
      setWritingPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [writingSearch]);

  // Fetch writing prompts
  useEffect(() => {
    async function fetchWriting() {
      setIsWritingLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(writingPage),
          search: debouncedWritingSearch,
          type: writingTypeFilter,
          limit: "10",
        });

        const res = await fetch(`/api/admin/writing?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setWritingPrompts(data.prompts || []);
          setWritingTotalPages(data.pagination.totalPages || 1);
          setWritingTotalCount(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Fetch admin writing prompts error:", err);
      } finally {
        setIsWritingLoading(false);
      }
    }
    void fetchWriting();
  }, [writingPage, debouncedWritingSearch, writingTypeFilter]);

  // Delete Writing Prompt
  async function handleDeleteWriting(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus prompt menulis ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/writing/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Prompt menulis berhasil dihapus!");
        setWritingPrompts(prev => prev.filter(p => p.id !== id));
        setWritingTotalCount(prev => prev - 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menghapus prompt menulis.");
      }
    } catch (err) {
      console.error("Delete writing prompt error:", err);
    }
  }

  // Open Add Writing Modal
  function handleOpenAddWritingModal() {
    setEditingWritingPrompt(null);
    setFormWritingTitle("");
    setFormWritingType("ESSAY");
    setFormWritingText("");
    setFormWritingMinWords(100);
    setFormWritingMaxWords(150);
    setFormWritingCriteria("Topic sentence, Coherence, Grammar accuracy, Cohesive devices, Completion");
    setIsWritingModalOpen(true);
  }

  // Open Edit Writing Modal
  function handleOpenEditWritingModal(prompt: WritingPromptRow) {
    setEditingWritingPrompt(prompt);
    setFormWritingTitle(prompt.title);
    setFormWritingType(prompt.type);
    setFormWritingText(prompt.promptText);
    setFormWritingMinWords(prompt.wordCountMin);
    setFormWritingMaxWords(prompt.wordCountMax);
    
    let criteriaStr = "Topic sentence, Coherence, Grammar accuracy, Cohesive devices, Completion";
    if (prompt.rubric) {
      try {
        const parsedRubric = typeof prompt.rubric === 'string' ? JSON.parse(prompt.rubric) : prompt.rubric;
        if (parsedRubric.criteria && Array.isArray(parsedRubric.criteria)) {
          criteriaStr = parsedRubric.criteria.join(", ");
        }
      } catch (e) {
        console.error("Failed to parse rubric criteria:", e);
      }
    }
    setFormWritingCriteria(criteriaStr);
    setIsWritingModalOpen(true);
  }

  // Save/Update Writing Prompt
  async function handleSaveWriting(e: React.FormEvent) {
    e.preventDefault();

    if (!formWritingTitle.trim() || !formWritingText.trim()) {
      alert("Judul dan Teks Instruksi wajib diisi.");
      return;
    }

    const criteriaArray = formWritingCriteria
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const rubric = {
      criteria: criteriaArray.length > 0 ? criteriaArray : ["General writing criteria"],
      maxScore: 100,
      scoringGuide: "Evaluate based on grammar, content relevance, vocabulary, and organization."
    };

    const payload = {
      title: formWritingTitle,
      type: formWritingType,
      promptText: formWritingText,
      wordCountMin: formWritingMinWords,
      wordCountMax: formWritingMaxWords,
      rubric,
    };

    try {
      let res;
      if (editingWritingPrompt) {
        res = await fetch(`/api/admin/writing/${editingWritingPrompt.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(editingWritingPrompt ? "Prompt menulis diperbarui!" : "Prompt menulis baru ditambahkan!");
        setIsWritingModalOpen(false);
        setWritingPage(1);
        if (writingPage === 1) {
          const params = new URLSearchParams({
            page: "1",
            search: debouncedWritingSearch,
            type: writingTypeFilter,
            limit: "10",
          });
          const refresh = await fetch(`/api/admin/writing?${params.toString()}`);
          if (refresh.ok) {
            const data = await refresh.json();
            setWritingPrompts(data.prompts || []);
            setWritingTotalPages(data.pagination.totalPages || 1);
            setWritingTotalCount(data.pagination.total || 0);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan prompt menulis.");
      }
    } catch (err) {
      console.error("Save writing prompt error:", err);
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
              Topik Menulis (Writing Prompts)
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Tambahkan, ubah, atau hapus topik esai akademik, surat/email bisnis, dan kriteria penilaian esai AI.
          </p>
        </div>
        <button
          onClick={handleOpenAddWritingModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span> Tambah Topik Baru
        </button>
      </header>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Topik Menulis", val: `${writingTotalCount} Topik`, color: "text-amber-600", icon: "edit_note" },
          { label: "Format Penulisan", val: "4 Format", color: "text-purple-655", icon: "drafts" },
          { label: "Koreksi Skor AI", val: "Aktif Otomatis", color: "text-emerald-650", icon: "grade" }
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

      {/* Writing Table Container */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              value={writingSearch}
              onChange={(e) => setWritingSearch(e.target.value)}
              placeholder="Cari judul atau teks prompt..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 placeholder-gray-400 transition-colors text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipe:</span>
            <select
              value={writingTypeFilter}
              onChange={(e) => {
                setWritingTypeFilter(e.target.value);
                setWritingPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-white"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="ESSAY">Essay</option>
              <option value="REPORT">Report</option>
              <option value="LETTER">Letter</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Judul Prompt</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/3">Instruksi Soal</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Batas Kata</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/4">Rubrik Penilaian AI</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Format</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isWritingLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-6 px-6"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : writingPrompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tidak ada prompt menulis ditemukan.
                  </td>
                </tr>
              ) : (
                writingPrompts.map((prompt) => {
                  let criteriaList: string[] = [];
                  if (prompt.rubric) {
                    try {
                      const parsed = typeof prompt.rubric === 'string' ? JSON.parse(prompt.rubric) : prompt.rubric;
                      if (parsed.criteria && Array.isArray(parsed.criteria)) {
                        criteriaList = parsed.criteria;
                      }
                    } catch (e) {
                      criteriaList = ["General"];
                    }
                  }
                  
                  return (
                    <tr key={prompt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                      <td className="py-5 px-6 font-hanken font-bold text-gray-900 dark:text-white text-xs">{prompt.title}</td>
                      <td className="py-5 px-6 text-xs text-gray-550 dark:text-gray-400 line-clamp-2 max-w-sm">{prompt.promptText}</td>
                      <td className="py-5 px-6 text-xs text-gray-600 dark:text-gray-450 font-mono">
                        {prompt.wordCountMin} - {prompt.wordCountMax} kata
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-wrap gap-1">
                          {criteriaList.map((crit, idx) => (
                            <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[9px] px-2 py-0.5 rounded font-medium">
                              {crit}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-xs font-bold">
                        <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase font-black">
                          {prompt.type}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditWritingModal(prompt)}
                            className="p-1.5 text-gray-500 hover:text-blue-650 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteWriting(prompt.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-450 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        {writingTotalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-900/5">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
              Halaman {writingPage} dari {writingTotalPages} ({writingTotalCount} item)
            </span>
            <div className="flex gap-2">
              <button
                disabled={writingPage === 1}
                onClick={() => setWritingPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                Kembali
              </button>
              <button
                disabled={writingPage === writingTotalPages}
                onClick={() => setWritingPage(prev => Math.min(prev + 1, writingTotalPages))}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Topik Menulis */}
      {isWritingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-xl w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <h3 className="font-hanken font-extrabold text-gray-900 dark:text-white text-base">
                {editingWritingPrompt ? "Edit Topik Menulis" : "Tambah Topik Menulis Baru"}
              </h3>
              <button
                onClick={() => setIsWritingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveWriting} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Format Tulisan</label>
                  <select
                    value={formWritingType}
                    onChange={(e) => setFormWritingType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="ESSAY">Essay</option>
                    <option value="REPORT">Report</option>
                    <option value="LETTER">Letter</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Judul Prompt *</label>
                  <input
                    type="text"
                    required
                    value={formWritingTitle}
                    onChange={(e) => setFormWritingTitle(e.target.value)}
                    placeholder="e.g. Technology Impact on Kids"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Instruksi Soal / Prompt Text *</label>
                <textarea
                  required
                  rows={4}
                  value={formWritingText}
                  onChange={(e) => setFormWritingText(e.target.value)}
                  placeholder="Tulis detail instruksi atau pertanyaan yang wajib dijawab mahasiswa dalam esainya..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Min Jumlah Kata</label>
                  <input
                    type="number"
                    min={10}
                    value={formWritingMinWords}
                    onChange={(e) => setFormWritingMinWords(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Max Jumlah Kata</label>
                  <input
                    type="number"
                    min={10}
                    value={formWritingMaxWords}
                    onChange={(e) => setFormWritingMaxWords(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Kriteria Rubrik Penilaian (Dipisahkan koma)</label>
                <input
                  type="text"
                  value={formWritingCriteria}
                  onChange={(e) => setFormWritingCriteria(e.target.value)}
                  placeholder="e.g. Grammar accuracy, Vocabulary richness, Coherence, Formatting"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                />
                <p className="text-[10px] text-gray-450 dark:text-gray-400">Parameter ini menentukan kriteria yang dinilai dan diberi feedback tertulis secara terperinci oleh kecerdasan buatan AI.</p>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWritingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer"
                >
                  Simpan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
