"use client";

import { useEffect, useState } from "react";

type SpeakingScenarioRow = {
  id: string;
  title: string;
  type: string;
  level: string | null;
  description: string;
  promptText: string | null;
  prompts: string[];
  rubric: any;
};

export default function SpeakingTab() {
  const [speakingScenarios, setSpeakingScenarios] = useState<SpeakingScenarioRow[]>([]);
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false);
  const [speakingSearch, setSpeakingSearch] = useState("");
  const [debouncedSpeakingSearch, setDebouncedSpeakingSearch] = useState("");
  const [speakingTypeFilter, setSpeakingTypeFilter] = useState("ALL");
  const [speakingPage, setSpeakingPage] = useState(1);
  const [speakingTotalPages, setSpeakingTotalPages] = useState(1);
  const [speakingTotalCount, setSpeakingTotalCount] = useState(0);

  // Speaking Form/Modal State
  const [isSpeakingModalOpen, setIsSpeakingModalOpen] = useState(false);
  const [editingSpeakingScenario, setEditingSpeakingScenario] = useState<SpeakingScenarioRow | null>(null);
  const [formSpeakingTitle, setFormSpeakingTitle] = useState("");
  const [formSpeakingType, setFormSpeakingType] = useState("DAILY_CONVERSATION");
  const [formSpeakingDescription, setFormSpeakingDescription] = useState("");
  const [formSpeakingPromptText, setFormSpeakingPromptText] = useState("");
  const [formSpeakingPrompts, setFormSpeakingPrompts] = useState("");

  // Debounce speaking search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSpeakingSearch(speakingSearch);
      setSpeakingPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [speakingSearch]);

  // Fetch speaking scenarios
  useEffect(() => {
    async function fetchSpeaking() {
      setIsSpeakingLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(speakingPage),
          search: debouncedSpeakingSearch,
          type: speakingTypeFilter,
          limit: "10",
        });

        const res = await fetch(`/api/admin/speaking?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSpeakingScenarios(data.scenarios || []);
          setSpeakingTotalPages(data.pagination.totalPages || 1);
          setSpeakingTotalCount(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Fetch admin speaking scenarios error:", err);
      } finally {
        setIsSpeakingLoading(false);
      }
    }
    void fetchSpeaking();
  }, [speakingPage, debouncedSpeakingSearch, speakingTypeFilter]);

  // Delete Speaking Scenario
  async function handleDeleteSpeaking(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus skenario bicara ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/speaking/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Skenario bicara berhasil dihapus!");
        setSpeakingScenarios(prev => prev.filter(s => s.id !== id));
        setSpeakingTotalCount(prev => prev - 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menghapus skenario bicara.");
      }
    } catch (err) {
      console.error("Delete speaking scenario error:", err);
    }
  }

  // Open Add Speaking Modal
  function handleOpenAddSpeakingModal() {
    setEditingSpeakingScenario(null);
    setFormSpeakingTitle("");
    setFormSpeakingType("DAILY_CONVERSATION");
    setFormSpeakingDescription("");
    setFormSpeakingPromptText("");
    setFormSpeakingPrompts("");
    setIsSpeakingModalOpen(true);
  }

  // Open Edit Speaking Modal
  function handleOpenEditSpeakingModal(scenario: SpeakingScenarioRow) {
    setEditingSpeakingScenario(scenario);
    setFormSpeakingTitle(scenario.title);
    setFormSpeakingType(scenario.type);
    setFormSpeakingDescription(scenario.description);
    setFormSpeakingPromptText(scenario.promptText || "");
    setFormSpeakingPrompts(Array.isArray(scenario.prompts) ? scenario.prompts.join("\n") : "");
    setIsSpeakingModalOpen(true);
  }

  // Save/Update Speaking Scenario
  async function handleSaveSpeaking(e: React.FormEvent) {
    e.preventDefault();

    if (!formSpeakingTitle.trim() || !formSpeakingDescription.trim()) {
      alert("Judul dan Deskripsi Situasi wajib diisi.");
      return;
    }

    const promptsArray = formSpeakingPrompts
      .split("\n")
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const rubric = {
      criteria: ["Pronunciation and clarity", "Fluency and coherence", "Grammar and vocabulary", "Content relevance"],
      maxScore: 100,
      scoringGuide: "Assess based on fluency, pronunciation, grammar accuracy, and description completeness."
    };

    const payload = {
      title: formSpeakingTitle,
      type: formSpeakingType,
      description: formSpeakingDescription,
      promptText: formSpeakingPromptText || null,
      prompts: promptsArray,
      rubric,
    };

    try {
      let res;
      if (editingSpeakingScenario) {
        res = await fetch(`/api/admin/speaking/${editingSpeakingScenario.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/speaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(editingSpeakingScenario ? "Skenario berbicara diperbarui!" : "Skenario berbicara baru ditambahkan!");
        setIsSpeakingModalOpen(false);
        setSpeakingPage(1);
        if (speakingPage === 1) {
          const params = new URLSearchParams({
            page: "1",
            search: debouncedSpeakingSearch,
            type: speakingTypeFilter,
            limit: "10",
          });
          const refresh = await fetch(`/api/admin/speaking?${params.toString()}`);
          if (refresh.ok) {
            const data = await refresh.json();
            setSpeakingScenarios(data.scenarios || []);
            setSpeakingTotalPages(data.pagination.totalPages || 1);
            setSpeakingTotalCount(data.pagination.total || 0);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan skenario berbicara.");
      }
    } catch (err) {
      console.error("Save speaking scenario error:", err);
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
              Skenario Bicara (Speaking)
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Tambahkan, ubah, atau hapus skenario simulasi bicara, transkripsi suara real-time, dan parameter feedback AI.
          </p>
        </div>
        <button
          onClick={handleOpenAddSpeakingModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span> Tambah Skenario Baru
        </button>
      </header>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Skenario Bicara", val: `${speakingTotalCount} Skenario`, color: "text-rose-600", icon: "mic" },
          { label: "Tipe Simulasi", val: "7 Variasi", color: "text-purple-655", icon: "forum" },
          { label: "Koreksi Kejelasan Suara", val: "Fluency & Accent AI", color: "text-emerald-650", icon: "speech_to_text" }
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

      {/* Speaking Table Container */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              value={speakingSearch}
              onChange={(e) => setSpeakingSearch(e.target.value)}
              placeholder="Cari judul atau instruksi..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 placeholder-gray-400 transition-colors text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipe:</span>
            <select
              value={speakingTypeFilter}
              onChange={(e) => {
                setSpeakingTypeFilter(e.target.value);
                setSpeakingPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-white"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="DAILY_CONVERSATION">Daily Conversation</option>
              <option value="ACADEMIC_INTERVIEW">Academic Interview</option>
              <option value="BUSINESS_PRESENTATION">Business Presentation</option>
              <option value="JOB_INTERVIEW">Job Interview</option>
              <option value="DISCUSSION">Discussion</option>
            </select>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Judul Skenario</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/3">Situasi / Skenario</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">System Instruction AI</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/4">Partner Prompts (Dialog)</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Format</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isSpeakingLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-6 px-6"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : speakingScenarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tidak ada skenario bicara ditemukan.
                  </td>
                </tr>
              ) : (
                speakingScenarios.map((sc) => (
                  <tr key={sc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="py-5 px-6 font-hanken font-bold text-gray-900 dark:text-white text-xs">{sc.title}</td>
                    <td className="py-5 px-6 text-xs text-gray-550 dark:text-gray-400 line-clamp-2 max-w-xs">{sc.description}</td>
                    <td className="py-5 px-6 text-xs text-gray-500 dark:text-gray-450 truncate max-w-[150px] font-mono">
                      {sc.promptText || "-"}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-0.5 max-h-[80px] overflow-y-auto">
                        {(sc.prompts || []).map((prompt, idx) => (
                          <span key={idx} className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {idx + 1}. {prompt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-xs font-bold">
                      <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase font-black">
                        {sc.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditSpeakingModal(sc)}
                          className="p-1.5 text-gray-500 hover:text-blue-650 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSpeaking(sc.id)}
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
        {speakingTotalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-900/5">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
              Halaman {speakingPage} dari {speakingTotalPages} ({speakingTotalCount} item)
            </span>
            <div className="flex gap-2">
              <button
                disabled={speakingPage === 1}
                onClick={() => setSpeakingPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                Kembali
              </button>
              <button
                disabled={speakingPage === speakingTotalPages}
                onClick={() => setSpeakingPage(prev => Math.min(prev + 1, speakingTotalPages))}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Skenario Bicara */}
      {isSpeakingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-xl w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <h3 className="font-hanken font-extrabold text-gray-900 dark:text-white text-base">
                {editingSpeakingScenario ? "Edit Skenario Bicara" : "Tambah Skenario Bicara Baru"}
              </h3>
              <button
                onClick={() => setIsSpeakingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSpeaking} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Tipe Simulasi</label>
                  <select
                    value={formSpeakingType}
                    onChange={(e) => setFormSpeakingType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="DAILY_CONVERSATION">Daily Conversation</option>
                    <option value="ACADEMIC_INTERVIEW">Academic Interview</option>
                    <option value="BUSINESS_PRESENTATION">Business Presentation</option>
                    <option value="JOB_INTERVIEW">Job Interview</option>
                    <option value="DISCUSSION">Discussion</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Judul Skenario *</label>
                  <input
                    type="text"
                    required
                    value={formSpeakingTitle}
                    onChange={(e) => setFormSpeakingTitle(e.target.value)}
                    placeholder="e.g. Job Interview for Marketing"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Deskripsi Situasi / Skenario *</label>
                <textarea
                  required
                  rows={3}
                  value={formSpeakingDescription}
                  onChange={(e) => setFormSpeakingDescription(e.target.value)}
                  placeholder="Deskripsikan konteks/situasi secara jelas agar mahasiswa memahami peran mereka..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">System Instruction AI (Instruksi Peran AI)</label>
                <textarea
                  rows={2}
                  value={formSpeakingPromptText}
                  onChange={(e) => setFormSpeakingPromptText(e.target.value)}
                  placeholder="e.g. You are a professional HR Manager. Ask friendly but deep questions about marketing skills."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Partner Prompts / Alternatif Dialog (Satu per baris)</label>
                <textarea
                  rows={3}
                  value={formSpeakingPrompts}
                  onChange={(e) => setFormSpeakingPrompts(e.target.value)}
                  placeholder="Tell me about yourself.&#10;Why do you want this job?&#10;What are your strengths?"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-795 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white font-mono"
                />
                <p className="text-[10px] text-gray-450 dark:text-gray-400">Pertanyaan atau respon awal AI yang akan ditampilkan kepada student saat simulasi dimulai.</p>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSpeakingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer"
                >
                  Simpan Skenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
