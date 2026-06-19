"use client";

import { useEffect, useState } from "react";

type QuestionRow = {
  id: string;
  sectionType: string;
  difficulty: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  metadata?: {
    audioUrl?: string;
  } | null;
};

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [questionsSearch, setQuestionsSearch] = useState("");
  const [debouncedQuestionsSearch, setDebouncedQuestionsSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1);
  const [questionsTotalCount, setQuestionsTotalCount] = useState(0);

  // Form / Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  const [formSectionType, setFormSectionType] = useState("VOCABULARY");
  const [formDifficulty, setFormDifficulty] = useState("EASY");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");

  // Debounce questions search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuestionsSearch(questionsSearch);
      setQuestionsPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [questionsSearch]);

  // Fetch questions list
  useEffect(() => {
    async function fetchQuestions() {
      setIsQuestionsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(questionsPage),
          search: debouncedQuestionsSearch,
          sectionType: sectionFilter,
          limit: "10",
        });

        const res = await fetch(`/api/admin/questions?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions || []);
          setQuestionsTotalPages(data.pagination.totalPages || 1);
          setQuestionsTotalCount(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Fetch admin questions error:", err);
      } finally {
        setIsQuestionsLoading(false);
      }
    }
    void fetchQuestions();
  }, [questionsPage, debouncedQuestionsSearch, sectionFilter]);

  // Delete question handler
  async function handleDeleteQuestion(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Soal berhasil dihapus!");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setQuestionsTotalCount((prev) => prev - 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menghapus soal.");
      }
    } catch (err) {
      console.error("Delete question error:", err);
      alert("Terjadi kesalahan sistem saat menghapus soal.");
    }
  }

  // Open add modal
  function handleOpenAddModal() {
    setEditingQuestion(null);
    setFormSectionType("VOCABULARY");
    setFormDifficulty("EASY");
    setFormQuestionText("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer("");
    setFormExplanation("");
    setFormAudioUrl("");
    setIsQuestionModalOpen(true);
  }

  // Open edit modal
  function handleOpenEditModal(q: QuestionRow) {
    setEditingQuestion(q);
    setFormSectionType(q.sectionType);
    setFormDifficulty(q.difficulty);
    setFormQuestionText(q.questionText);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation || "");
    setFormAudioUrl(q.metadata?.audioUrl || "");
    setIsQuestionModalOpen(true);
  }

  // Save/Update question submit handler
  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();

    if (!formQuestionText.trim()) {
      alert("Teks soal tidak boleh kosong.");
      return;
    }

    if (formOptions.some((opt) => !opt.trim())) {
      alert("Semua 4 pilihan jawaban harus diisi.");
      return;
    }

    if (!formCorrectAnswer.trim()) {
      alert("Silakan pilih kunci jawaban.");
      return;
    }

    const payload = {
      sectionType: formSectionType,
      difficulty: formDifficulty,
      questionText: formQuestionText,
      options: formOptions,
      correctAnswer: formCorrectAnswer,
      explanation: formExplanation || null,
      metadata: formSectionType === "LISTENING" ? { audioUrl: formAudioUrl } : undefined,
    };

    try {
      let res;
      if (editingQuestion) {
        res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(editingQuestion ? "Soal berhasil diperbarui!" : "Soal baru berhasil ditambahkan!");
        setIsQuestionModalOpen(false);
        setQuestionsPage(1);
        
        if (questionsPage === 1) {
          const params = new URLSearchParams({
            page: "1",
            search: debouncedQuestionsSearch,
            sectionType: sectionFilter,
            limit: "10",
          });
          const refreshRes = await fetch(`/api/admin/questions?${params.toString()}`);
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setQuestions(data.questions || []);
            setQuestionsTotalPages(data.pagination.totalPages || 1);
            setQuestionsTotalCount(data.pagination.total || 0);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan soal.");
      }
    } catch (err) {
      console.error("Save question error:", err);
      alert("Terjadi kesalahan sistem saat menyimpan soal.");
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
            <h1 className="font-hanken text-3xl font-extrabold text-gray-955 dark:text-white">
              Kelola Bank Soal
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Tambahkan, ubah, atau hapus soal placement test untuk modul Vocabulary, Grammar, dan Reading.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span> Tambah Soal Baru
        </button>
      </header>

      {/* Questions Table Container */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              value={questionsSearch}
              onChange={(e) => setQuestionsSearch(e.target.value)}
              placeholder="Cari teks soal..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 transition-colors text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Modul:</span>
            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setQuestionsPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-gray-900 dark:text-white"
            >
              <option value="ALL">Semua Modul</option>
              <option value="VOCABULARY">Vocabulary</option>
              <option value="GRAMMAR">Grammar</option>
              <option value="LISTENING">Listening</option>
              <option value="READING">Reading</option>
            </select>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Modul</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Tingkat</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/3">Teks Soal</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Opsi Jawaban</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Kunci</th>
                <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isQuestionsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-6 px-6"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                    <td className="py-6 px-6 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tidak ada soal ditemukan. Silakan tambahkan soal baru.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="py-4 px-6 text-xs font-bold font-mono">
                      <span className={`px-2 py-0.5 rounded-md ${
                        q.sectionType === "VOCABULARY" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200/30" :
                        q.sectionType === "GRAMMAR" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200/30" :
                        q.sectionType === "LISTENING" ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-200/30" :
                        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30"
                      }`}>
                        {q.sectionType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        q.difficulty === "EASY" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                        q.difficulty === "MEDIUM" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                        "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-gray-700 dark:text-gray-300 max-w-xs truncate" title={q.questionText}>
                      {q.questionText}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="grid grid-cols-2 gap-1 text-[10px] w-48 font-mono">
                        {q.options.map((opt, index) => (
                          <div key={index} className="truncate" title={opt}>
                            <span className="font-bold text-gray-400 mr-1">{String.fromCharCode(65 + index)}:</span>{opt}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs font-mono" title={q.correctAnswer}>
                      {q.correctAnswer}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-2 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                          title="Edit Soal"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                          title="Hapus Soal"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isQuestionsLoading && questionsTotalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-150 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-900/5">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Halaman {questionsPage} dari {questionsTotalPages} ({questionsTotalCount} Soal)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={questionsPage <= 1}
                onClick={() => setQuestionsPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                disabled={questionsPage >= questionsTotalPages}
                onClick={() => setQuestionsPage(prev => Math.min(questionsTotalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FOR ADD/EDIT QUESTION */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-855 rounded-3xl shadow-xl border border-gray-150 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <h3 className="font-hanken font-extrabold text-xl text-gray-900 dark:text-white">
                {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Section Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Tipe Modul</label>
                  <select
                    value={formSectionType}
                    onChange={(e) => {
                      setFormSectionType(e.target.value);
                    }}
                    className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="VOCABULARY">Vocabulary</option>
                    <option value="GRAMMAR">Grammar</option>
                    <option value="LISTENING">Listening</option>
                    <option value="READING">Reading</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Tingkat Kesulitan</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {/* Audio URL Input for Listening Section */}
              {formSectionType === "LISTENING" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Audio URL (File MP3)
                  </label>
                  <input
                    type="url"
                    required
                    value={formAudioUrl}
                    onChange={(e) => setFormAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Teks Soal / Pertanyaan
                </label>
                <textarea
                  required
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  placeholder={formSectionType === "READING" ? 'Read the passage:\n"..."\n\nWhat is the main idea?' : "Masukkan pertanyaan..."}
                  rows={formSectionType === "READING" ? 8 : 4}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none font-inter text-gray-900 dark:text-white"
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Pilihan Jawaban (Multiple Choice)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase font-mono">{String.fromCharCode(65 + idx)}.</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...formOptions];
                          newOpts[idx] = e.target.value;
                          setFormOptions(newOpts);
                          if (formCorrectAnswer === opt && opt !== "") {
                            setFormCorrectAnswer(e.target.value);
                          }
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Kunci Jawaban yang Benar</label>
                <select
                  required
                  value={formCorrectAnswer}
                  onChange={(e) => setFormCorrectAnswer(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Jawaban Benar --</option>
                  {formOptions.map((opt, idx) => (
                    <option key={idx} value={opt} disabled={!opt.trim()}>
                      {opt.trim() ? `${String.fromCharCode(65 + idx)}. ${opt}` : `Pilihan ${String.fromCharCode(65 + idx)} (kosong)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Penjelasan (Opsional)</label>
                <textarea
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Jelaskan mengapa kunci jawaban tersebut benar..."
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none font-inter text-gray-900 dark:text-white"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
