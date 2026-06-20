"use client";

import { useEffect, useState, useRef, useMemo } from "react";

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

type GeneratedQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sectionType: string;
  difficulty: string;
  metadata?: {
    audioUrl?: string;
    generatedBy?: string;
  };
};

interface QuestionsTabProps {
  fixedSection?: "VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING";
}

export default function QuestionsTab({ fixedSection }: QuestionsTabProps) {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [questionsSearch, setQuestionsSearch] = useState("");
  const [debouncedQuestionsSearch, setDebouncedQuestionsSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState(fixedSection || "ALL");
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1);
  const [questionsTotalCount, setQuestionsTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  // Form / Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  const [formSectionType, setFormSectionType] = useState<"VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING">(fixedSection || "VOCABULARY");
  const [formDifficulty, setFormDifficulty] = useState("EASY");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");

  // AI Generator state
  const [modalMode, setModalMode] = useState<"MANUAL" | "AI">("MANUAL");
  const [formPromptInput, setFormPromptInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [listeningSourceType, setListeningSourceType] = useState<"URL" | "SCRIPT">("URL");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const [prevFixedSection, setPrevFixedSection] = useState(fixedSection);
  if (fixedSection !== prevFixedSection) {
    setPrevFixedSection(fixedSection);
    setSectionFilter(fixedSection || "ALL");
    setFormSectionType(fixedSection || "VOCABULARY");
  }

  // Group listening questions by audioUrl
  const listeningAudioGroups = useMemo(() => {
    if (sectionFilter !== "LISTENING") return [];
    
    const groupsMap = new Map<string, QuestionRow[]>();
    questions.forEach((q) => {
      const audioUrl = q.metadata?.audioUrl || "";
      if (!groupsMap.has(audioUrl)) {
        groupsMap.set(audioUrl, []);
      }
      groupsMap.get(audioUrl)!.push(q);
    });
    
    return Array.from(groupsMap.entries()).map(([audioUrl, qs]) => {
      const firstQ = qs[0];
      const difficulty = firstQ.difficulty;
      
      // Try to deduce a nice topic name
      let topic = "Audio Clip";
      if (firstQ.questionText.toLowerCase().includes("hotel") || firstQ.questionText.toLowerCase().includes("reception") || firstQ.questionText.toLowerCase().includes("check")) {
        topic = "Hotel Check-in Dialogue";
      } else if (firstQ.questionText.toLowerCase().includes("academic") || firstQ.questionText.toLowerCase().includes("lecture") || firstQ.questionText.toLowerCase().includes("professor")) {
        topic = "Academic Lecture / Conversation";
      } else if (firstQ.questionText.toLowerCase().includes("orientation")) {
        topic = "Student Orientation Guide";
      } else if (firstQ.questionText.toLowerCase().includes("wind") || firstQ.questionText.toLowerCase().includes("energy") || firstQ.questionText.toLowerCase().includes("geothermal")) {
        topic = "Renewable Energy Discussion";
      } else {
        topic = `Listening Conversation`;
      }

      return {
        audioUrl,
        difficulty,
        topic,
        questions: qs.sort((a, b) => a.id.localeCompare(b.id)),
      };
    });
  }, [questions, sectionFilter]);

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
          difficulty: difficultyFilter !== "ALL" ? difficultyFilter : "",
          limit: sectionFilter === "LISTENING" ? "100" : "10",
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
  }, [questionsPage, debouncedQuestionsSearch, sectionFilter, difficultyFilter, refreshKey]);

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
        setRefreshKey((prev) => prev + 1);
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
    setFormSectionType(fixedSection || "VOCABULARY");
    setFormDifficulty("EASY");
    setFormQuestionText("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer("");
    setFormExplanation("");
    setFormAudioUrl("");
    setModalMode("MANUAL");
    setFormPromptInput("");
    setAiGeneratedQuestions([]);
    setListeningSourceType("URL");
    setGeneratedAudioUrl(null);
    setIsQuestionModalOpen(true);
  }

  // Open add modal pre-filled for a specific audio URL
  function handleOpenAddModalForAudio(audioUrl: string, difficulty: string) {
    setEditingQuestion(null);
    setFormSectionType("LISTENING");
    setFormDifficulty(difficulty);
    setFormQuestionText("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer("");
    setFormExplanation("");
    setFormAudioUrl(audioUrl);
    setModalMode("MANUAL");
    setFormPromptInput("");
    setAiGeneratedQuestions([]);
    setListeningSourceType("URL");
    setGeneratedAudioUrl(null);
    setIsQuestionModalOpen(true);
  }

  // Open edit modal
  function handleOpenEditModal(q: QuestionRow) {
    setEditingQuestion(q);
    setFormSectionType(q.sectionType as "VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING");
    setFormDifficulty(q.difficulty);
    setFormQuestionText(q.questionText);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation || "");
    setFormAudioUrl(q.metadata?.audioUrl || "");
    setModalMode("MANUAL");
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
        setRefreshKey((prev) => prev + 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan soal.");
      }
    } catch (err) {
      console.error("Save question error:", err);
      alert("Terjadi kesalahan sistem saat menyimpan soal.");
    }
  }

  // Generate Questions with AI
  async function handleGenerateAIQuestions() {
    if (!formPromptInput.trim()) {
      alert(
        formSectionType === "LISTENING"
          ? (listeningSourceType === "URL" ? "Silakan masukkan Audio URL terlebih dahulu." : "Silakan masukkan topik atau naskah teks terlebih dahulu.")
          : formSectionType === "READING"
          ? "Silakan masukkan teks bacaan atau topik terlebih dahulu."
          : "Silakan masukkan topik / tema terlebih dahulu."
      );
      return;
    }

    setIsAiGenerating(true);
    setAiGeneratedQuestions([]);
    setGeneratedAudioUrl(null);
    try {
      const res = await fetch("/api/admin/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: formSectionType,
          difficulty: formDifficulty,
          promptInput: formPromptInput,
          listeningSourceType: formSectionType === "LISTENING" ? listeningSourceType : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiGeneratedQuestions(data.questions || []);
        if (data.audioUrl) {
          setGeneratedAudioUrl(data.audioUrl);
        }
        // Auto scroll to preview card/questions
        setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal membuat soal dengan AI.");
      }
    } catch (err) {
      console.error("AI generator error:", err);
      alert("Terjadi kesalahan sistem saat menghubungi AI.");
    } finally {
      setIsAiGenerating(false);
    }
  }

  // Bulk save AI generated questions
  async function handleSaveAIQuestions() {
    if (aiGeneratedQuestions.length === 0) return;
    setIsQuestionsLoading(true);

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiGeneratedQuestions),
      });

      if (res.ok) {
        alert(`${aiGeneratedQuestions.length} soal AI berhasil disimpan ke database!`);
        setIsQuestionModalOpen(false);
        setQuestionsPage(1);
        setRefreshKey((prev) => prev + 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan soal AI.");
      }
    } catch (err) {
      console.error("Bulk save questions error:", err);
      alert("Terjadi kesalahan sistem saat menyimpan soal.");
    } finally {
      setIsQuestionsLoading(false);
    }
  }

  const getSectionTitle = () => {
    if (fixedSection === "VOCABULARY") return "Bank Soal: Vocabulary";
    if (fixedSection === "GRAMMAR") return "Bank Soal: Grammar";
    if (fixedSection === "LISTENING") return "Bank Soal: Listening";
    if (fixedSection === "READING") return "Bank Soal: Reading";
    return "Kelola Bank Soal";
  };

  const getSectionDesc = () => {
    if (fixedSection === "VOCABULARY") return "Tambahkan, ubah, atau buat otomatis soal-soal Vocabulary.";
    if (fixedSection === "GRAMMAR") return "Tambahkan, ubah, atau buat otomatis soal-soal Grammar.";
    if (fixedSection === "LISTENING") return "Tambahkan, ubah, atau buat otomatis soal-soal Listening berbasis audio.";
    if (fixedSection === "READING") return "Tambahkan, ubah, atau buat otomatis soal-soal Reading beserta passage.";
    return "Tambahkan, ubah, atau hapus soal placement test untuk modul Vocabulary, Grammar, Reading, dan Listening.";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
            <h1 className="font-hanken text-3xl font-extrabold text-gray-955 dark:text-white">
              {getSectionTitle()}
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            {getSectionDesc()}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span> Tambah Soal Baru
        </button>
      </header>

      {/* Questions Table Container */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex-1 max-w-md relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input
                type="text"
                value={questionsSearch}
                onChange={(e) => setQuestionsSearch(e.target.value)}
                placeholder={sectionFilter === "LISTENING" ? "Cari naskah, teks soal atau topik..." : "Cari teks soal..."}
                className="w-full bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 transition-colors text-gray-900 dark:text-white"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kesulitan:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setQuestionsPage(1);
                }}
                className="bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-gray-900 dark:text-white"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          
          {!fixedSection && (
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
          )}
        </div>

        {/* Questions Display Area */}
        {sectionFilter === "LISTENING" ? (
          /* Grouped Cards for Listening Section */
          <div className="p-6 space-y-6">
            {isQuestionsLoading ? (
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-855 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listeningAudioGroups.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50/10 dark:bg-gray-900/5 rounded-2xl">
                Tidak ada berkas audio ditemukan. Klik &quot;Tambah Soal Baru&quot; di atas untuk mulai menambahkan.
              </div>
            ) : (
              listeningAudioGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="bg-white dark:bg-gray-855 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 space-y-6">
                  {/* Group Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-650 dark:text-teal-400 text-lg">audiotrack</span>
                        <h3 className="font-hanken font-bold text-gray-955 dark:text-white text-base">
                          {group.topic} #{groupIdx + 1}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                          group.difficulty === "EASY" ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/20" :
                          group.difficulty === "MEDIUM" ? "bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border-amber-200/20" :
                          "bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-200/20"
                        }`}>
                          {group.difficulty}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono truncate max-w-md" title={group.audioUrl}>
                        Sumber: {group.audioUrl.split("/").pop()}
                      </p>
                    </div>

                    {/* Audio Player and Add Button */}
                    <div className="flex flex-wrap items-center gap-3">
                      {group.audioUrl && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-1 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center">
                          <audio src={group.audioUrl} controls className="h-6 w-48 text-xs bg-transparent" />
                        </div>
                      )}
                      <button
                        onClick={() => handleOpenAddModalForAudio(group.audioUrl, group.difficulty)}
                        className="bg-blue-600 hover:bg-blue-750 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all border-0 cursor-pointer shadow-sm shadow-blue-500/10"
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                        Tambah Soal ke Audio Ini
                      </button>
                    </div>
                  </div>

                  {/* Questions List under this Audio */}
                  <div className="space-y-4">
                    {group.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-gray-50/50 dark:bg-gray-900/10 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-4 text-left relative group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                              {idx + 1}
                            </span>
                            <p className="font-hanken text-xs font-bold text-gray-955 dark:text-white leading-relaxed pt-0.5">
                              {q.questionText}
                            </p>
                          </div>
                          
                          {/* Question Action Buttons */}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(q)}
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-955/30 p-1.5 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                              title="Edit Soal"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/30 p-1.5 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                              title="Hapus Soal"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pl-9">
                          {q.options.map((opt) => {
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <div key={opt} className={`p-2.5 rounded-lg border ${
                                isCorrect 
                                  ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/35 text-green-755 dark:text-green-400 font-bold" 
                                  : "bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-800 text-gray-500"
                              }`}>
                                {opt}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <p className="text-[10px] text-gray-400 pl-9 italic">
                            Penjelasan: {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Standard Table for other sections */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                  <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Modul</th>
                  <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Tingkat</th>
                  <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/3">Teks Soal</th>
                  <th className="text-gray-555 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 font-bold">Kunci</th>
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
                      <td className="py-6 px-6"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                      <td className="py-6 px-6 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                    </tr>
                  ))
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50/10 dark:bg-gray-900/5">
                      Tidak ada soal ditemukan. Klik &quot;Tambah Soal Baru&quot; untuk mulai menambahkan.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/10 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          q.sectionType === "VOCABULARY" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200/30" :
                          q.sectionType === "GRAMMAR" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200/30" :
                          q.sectionType === "LISTENING" ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200/30" :
                          "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/30"
                        }`}>
                          {q.sectionType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          q.difficulty === "EASY" ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/20" :
                          q.difficulty === "MEDIUM" ? "bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border-amber-200/20" :
                          "bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-200/20"
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-relaxed" title={q.questionText}>
                            {q.questionText.includes("Read the passage") ? q.questionText.split("\n\n").pop() : q.questionText}
                          </p>
                          {q.metadata?.audioUrl && (
                            <div className="flex items-center gap-1.5 text-[9px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[11px]">audiotrack</span>
                              <span className="truncate max-w-[200px]" title={q.metadata.audioUrl}>{q.metadata.audioUrl.split("/").pop()}</span>
                            </div>
                          )}
                          {q.questionText.includes("Read the passage") && (
                            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[11px]">chrome_reader_mode</span>
                              <span>Memiliki Teks Bacaan</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs font-mono" title={q.correctAnswer}>
                        {q.correctAnswer}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(q)}
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-955/40 p-2 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                            title="Edit Soal"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/40 p-2 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
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
        )}

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
        <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-855 rounded-3xl shadow-xl border border-gray-150 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <h2 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">
                {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
              </h2>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Mode Selector for Adding Questions */}
            {!editingQuestion && (
              <div className="flex border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10 px-6">
                <button
                  type="button"
                  onClick={() => setModalMode("MANUAL")}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
                    modalMode === "MANUAL"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Input Manual
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode("AI")}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
                    modalMode === "AI"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Generate dengan AI
                </button>
              </div>
            )}

            {modalMode === "AI" && !editingQuestion ? (
              /* ==================== AI GENERATOR VIEW ==================== */
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Tipe Modul (Locked if fixedSection exists) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Tipe Modul</label>
                    <select
                      disabled={!!fixedSection}
                      value={formSectionType}
                      onChange={(e) => {
                        setFormSectionType(e.target.value as "VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING");
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-50"
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
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Listening Source Type Selector */}
                {formSectionType === "LISTENING" && (
                  <div className="space-y-2 text-left mb-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Sumber Audio</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="listeningSourceType"
                          value="URL"
                          checked={listeningSourceType === "URL"}
                          onChange={() => {
                            setListeningSourceType("URL");
                            setFormPromptInput("");
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Tautan Audio URL (MP3)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="listeningSourceType"
                          value="SCRIPT"
                          checked={listeningSourceType === "SCRIPT"}
                          onChange={() => {
                            setListeningSourceType("SCRIPT");
                            setFormPromptInput("");
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Tulis Naskah / Topik (TTS Gratis)
                      </label>
                    </div>
                  </div>
                )}

                {/* Prompt/Source input */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    {formSectionType === "LISTENING"
                      ? (listeningSourceType === "URL" ? "Audio URL (File MP3)" : "Topik Percakapan atau Teks Naskah")
                      : formSectionType === "READING"
                      ? "Teks Passage (atau Topik/Tema untuk menulis passage baru oleh AI)"
                      : "Topik / Tema Soal (contoh: Tenses, Job Interview)"}
                  </label>
                  {formSectionType === "READING" || (formSectionType === "LISTENING" && listeningSourceType === "SCRIPT") ? (
                    <textarea
                      required
                      value={formPromptInput}
                      onChange={(e) => setFormPromptInput(e.target.value)}
                      rows={6}
                      placeholder={
                        formSectionType === "READING"
                          ? "Masukkan topik (contoh: Space Exploration) atau tempel teks bacaan Anda di sini..."
                          : "Masukkan topik percakapan (contoh: A job interview at a tech company) atau tempel naskah teks percakapan lengkap di sini..."
                      }
                      className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white resize-none leading-relaxed"
                    />
                  ) : (
                    <input
                      type={formSectionType === "LISTENING" ? "url" : "text"}
                      required
                      value={formPromptInput}
                      onChange={(e) => setFormPromptInput(e.target.value)}
                      placeholder={
                        formSectionType === "LISTENING"
                          ? "https://example.com/audio.mp3"
                          : "Masukkan topik atau tema..."
                      }
                      className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isAiGenerating || !formPromptInput.trim()}
                    onClick={handleGenerateAIQuestions}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAiGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>AI sedang membuat 5 soal...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                        <span>Buat Soal dengan AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Generated Questions Preview */}
                {aiGeneratedQuestions.length > 0 && (
                  <div ref={previewRef} className="space-y-6 pt-6 border-t border-gray-150 dark:border-gray-800 text-left">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-sm">
                        Pratinjau Soal Hasil AI ({aiGeneratedQuestions.length} Soal)
                      </h3>
                      {generatedAudioUrl && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-200/50 dark:border-blue-900/30">
                          <span className="material-symbols-outlined text-xs text-blue-600 dark:text-blue-400">audiotrack</span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Audio TTS</span>
                          <audio src={generatedAudioUrl} controls className="h-6 w-40 text-xs" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                      {aiGeneratedQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
                          <p className="font-hanken text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                            {idx + 1}. {q.questionText.includes("Read the passage") ? q.questionText.split("\n\n").pop() : q.questionText}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] pl-4">
                            {q.options.map((opt: string) => {
                              const isCorrect = opt === q.correctAnswer;
                              return (
                                <div key={opt} className={`p-2 rounded-lg border ${
                                  isCorrect 
                                    ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/35 text-green-755 dark:text-green-400 font-bold" 
                                    : "bg-white dark:bg-gray-855 border-gray-100 dark:border-gray-800 text-gray-500"
                                }`}>
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 pl-4 italic">
                            Penjelasan: {q.explanation}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setAiGeneratedQuestions([])}
                        className="px-4 py-2.5 rounded-xl border border-gray-250 text-gray-500 hover:bg-gray-50 dark:border-gray-700 text-xs font-bold transition-all bg-white dark:bg-gray-850 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAIQuestions}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 border-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        <span>Simpan Semua Soal ke Database</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ==================== MANUAL INPUT VIEW ==================== */
              <form onSubmit={handleSaveQuestion} className="p-6 space-y-6 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Tipe Modul (Locked if fixedSection exists) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Tipe Modul</label>
                    <select
                      disabled={!!fixedSection}
                      value={formSectionType}
                      onChange={(e) => {
                        setFormSectionType(e.target.value as "VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING");
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-50"
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
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
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
                      className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
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
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white resize-none leading-relaxed"
                  />
                  {formSectionType === "READING" && (
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1 block">
                      * Catatan: Tulis teks bacaan di dalam tanda kutip ganda `&quot;&quot;` agar sistem otomatis memisahkannya ke kolom bacaan di sebelah kiri.
                    </span>
                  )}
                </div>

                {/* Choices/Options */}
                <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-800">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Opsi Pilihan Jawaban
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formOptions.map((opt, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                          Pilihan {String.fromCharCode(65 + i)}
                        </label>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formOptions];
                            newOpts[i] = e.target.value;
                            setFormOptions(newOpts);
                          }}
                          placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                          className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Kunci Jawaban yang Benar
                  </label>
                  <select
                    required
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Pilih Kunci Jawaban --</option>
                    {formOptions.map((opt, i) => (
                      <option key={i} disabled={!opt.trim()} value={opt}>
                        {opt.trim() ? `Opsi ${String.fromCharCode(65 + i)}: ${opt}` : `Opsi ${String.fromCharCode(65 + i)} (Masih Kosong)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Penjelasan Kunci Jawaban (Opsional)
                  </label>
                  <textarea
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Tulis alasan kenapa kunci jawaban tersebut benar..."
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white resize-none leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-255 text-gray-550 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 text-xs font-bold transition-all bg-white dark:bg-gray-850 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-755 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer"
                  >
                    Simpan Soal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
