"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedSection?: "VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING";
  editingQuestion: QuestionRow | null;
  onSaveSuccess: () => void;
  initialAudioUrl?: string;
  initialDifficulty?: string;
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  fixedSection,
  editingQuestion,
  onSaveSuccess,
  initialAudioUrl = "",
  initialDifficulty = "EASY",
}: QuestionFormModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formSectionType, setFormSectionType] = useState<"VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING">(
    editingQuestion ? (editingQuestion.sectionType as "VOCABULARY" | "GRAMMAR" | "LISTENING" | "READING") : (fixedSection || "VOCABULARY")
  );
  const [formDifficulty, setFormDifficulty] = useState(
    editingQuestion ? editingQuestion.difficulty : initialDifficulty
  );
  const [formQuestionText, setFormQuestionText] = useState(
    editingQuestion ? editingQuestion.questionText : ""
  );
  const [formOptions, setFormOptions] = useState<string[]>(
    editingQuestion ? [...editingQuestion.options] : ["", "", "", ""]
  );
  const [formCorrectAnswer, setFormCorrectAnswer] = useState(
    editingQuestion ? editingQuestion.correctAnswer : ""
  );
  const [formExplanation, setFormExplanation] = useState(
    editingQuestion ? (editingQuestion.explanation || "") : ""
  );
  const [formAudioUrl, setFormAudioUrl] = useState(
    editingQuestion ? (editingQuestion.metadata?.audioUrl || "") : initialAudioUrl
  );

  // AI Generator state
  const [modalMode, setModalMode] = useState<"MANUAL" | "AI">("MANUAL");
  const [formPromptInput, setFormPromptInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [listeningSourceType, setListeningSourceType] = useState<"URL" | "SCRIPT">("URL");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [voiceOption, setVoiceOption] = useState("edge-tts/en-US-GuyNeural");

  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !mounted) return null;

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
        onSaveSuccess();
        onClose();
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
          voiceOption: formSectionType === "LISTENING" && listeningSourceType === "SCRIPT" ? voiceOption : undefined,
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

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiGeneratedQuestions),
      });

      if (res.ok) {
        alert(`${aiGeneratedQuestions.length} soal AI berhasil disimpan ke database!`);
        onSaveSuccess();
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan soal AI.");
      }
    } catch (err) {
      console.error("Save AI questions error:", err);
      alert("Terjadi kesalahan sistem saat menyimpan soal AI.");
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop Overlay (closes modal on click) */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity"
      />

      {/* Centering Wrapper */}
      <div className="flex min-h-full items-center justify-center py-8 px-4 relative pointer-events-none animate-fadeIn">
        {/* Modal Card */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-850 rounded-3xl shadow-xl border border-gray-155 dark:border-gray-700 max-w-2xl w-full pointer-events-auto relative"
        >
        
        {/* Header */}
        <div className="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <h2 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">
            {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
          </h2>
          <button
            onClick={onClose}
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
                      checked={listeningSourceType === "URL"}
                      onChange={() => setListeningSourceType("URL")}
                      className="accent-blue-600"
                    />
                    Gunakan Audio URL yang sudah ada
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={listeningSourceType === "SCRIPT"}
                      onChange={() => setListeningSourceType("SCRIPT")}
                      className="accent-blue-600"
                    />
                    Ketik Naskah (Generate Suara AI)
                  </label>
                </div>
              </div>
            )}

            {/* Voice Selection Option */}
            {formSectionType === "LISTENING" && listeningSourceType === "SCRIPT" && (
              <div className="space-y-2 text-left mb-4">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Pilih Pengisi Suara (Accent & Speaker)</label>
                <select
                  value={voiceOption}
                  onChange={(e) => setVoiceOption(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="edge-tts/en-US-GuyNeural">Laki-laki (Amerika) - Guy</option>
                  <option value="edge-tts/en-US-JennyNeural">Perempuan (Amerika) - Jenny</option>
                  <option value="edge-tts/en-GB-RyanNeural">Laki-laki (Inggris / UK) - Ryan</option>
                  <option value="edge-tts/en-GB-SoniaNeural">Perempuan (Inggris / UK) - Sonia</option>
                  <option value="edge-tts/en-AU-WilliamNeural">Laki-laki (Australia) - William</option>
                  <option value="edge-tts/en-AU-NatashaNeural">Perempuan (Australia) - Natasha</option>
                </select>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                {formSectionType === "LISTENING"
                  ? (listeningSourceType === "URL" ? "Audio URL & Konteks Dialog" : "Ketik Percakapan/Monolog Akademik (Bhs Inggris)")
                  : formSectionType === "READING"
                  ? "Teks Bacaan Akademik / Artikel (Bhs Inggris)"
                  : "Topik atau Tema Spesifik Soal"}
              </label>
              <textarea
                value={formPromptInput}
                onChange={(e) => setFormPromptInput(e.target.value)}
                placeholder={
                  formSectionType === "LISTENING"
                    ? (listeningSourceType === "URL"
                        ? "Masukkan alamat audio URL (misal: /audio/lecture1.mp3) lalu deskripsikan topiknya di sini..."
                        : "Ketik teks dialog/monolog kuliah akademik di sini. AI akan menghasilkan file audio suara robot secara otomatis.")
                    : formSectionType === "READING"
                    ? "Masukkan satu naskah cerita/bacaan komprehensif di sini..."
                    : "Misal: Perjalanan liburan, istilah hukum bisnis, dll..."
                }
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white h-36 resize-none leading-relaxed"
              />
              <span className="text-[10px] text-gray-450 dark:text-gray-500 block leading-normal">
                {formSectionType === "LISTENING" && listeningSourceType === "SCRIPT"
                  ? "✨ Ketik script dialog (misal: 'Professor: Hello class...'). Sistem otomatis akan mengonversi teks ini menjadi file audio pengucap native speaker beraksen pilihan Anda (.mp3) lewat Edge TTS."
                  : "💡 Gunakan petunjuk detail dalam bahasa Inggris atau Indonesia. AI akan menghasilkan paket berisi 3 hingga 5 soal pilihan ganda sekaligus."}
              </span>
            </div>

            {/* Actions for Generator */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-gray-550 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer bg-transparent border-0"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isAiGenerating}
                onClick={() => void handleGenerateAIQuestions()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
              >
                {isAiGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Membuat Soal AI...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                    Generate Soal
                  </>
                )}
              </button>
            </div>

            {/* AI Generated Questions Preview */}
            {aiGeneratedQuestions.length > 0 && (
              <div ref={previewRef} className="space-y-6 pt-6 border-t border-gray-150 dark:border-gray-700 animate-fadeIn">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 space-y-3">
                  <h4 className="font-hanken font-bold text-blue-800 dark:text-blue-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Preview Hasil Soal AI ({aiGeneratedQuestions.length} Soal)
                  </h4>
                  <p className="text-[11px] text-blue-600/80 dark:text-blue-450 leading-relaxed font-semibold">
                    Silakan tinjau draf soal di bawah. Jika sudah sesuai, klik tombol simpan untuk memasukkan seluruh soal ini ke bank soal database.
                  </p>
                  {generatedAudioUrl && (
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-850 p-3 rounded-xl border border-blue-150 dark:border-blue-900/20 mt-2">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">audiotrack</span>
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-gray-450 block uppercase">Audio Ter-generate</span>
                        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 block truncate max-w-xs">{generatedAudioUrl}</span>
                      </div>
                      <audio src={generatedAudioUrl} controls className="h-8 max-w-[200px] ml-auto" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {aiGeneratedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 font-inter text-left">
                      <div className="flex justify-between items-start gap-4">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-inter text-xs text-gray-800 dark:text-gray-200 font-bold leading-relaxed flex-1">
                          {q.questionText}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                                isCorrect
                                  ? "bg-green-50/50 dark:bg-green-955/10 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-455 font-bold"
                                  : "bg-white dark:bg-gray-850 border-gray-150 dark:border-gray-800 text-gray-650 dark:text-gray-350"
                              }`}
                            >
                              <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-amber-50/20 dark:bg-amber-955/5 border border-amber-100 dark:border-amber-900/20 rounded-xl p-3.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed pl-10 flex gap-2">
                          <span className="material-symbols-outlined text-sm text-amber-600 mt-0.5 select-none">lightbulb</span>
                          <div>
                            <span className="font-bold block mb-0.5">Penjelasan Kunci Jawaban:</span>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setAiGeneratedQuestions([])}
                    className="px-5 py-2.5 text-xs font-bold text-gray-550 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer bg-transparent border-0"
                  >
                    Hapus Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveAIQuestions()}
                    className="bg-green-600 hover:bg-green-700 text-white font-hanken font-bold text-xs px-6 py-2.5 rounded-xl hover:shadow-lg transition-all cursor-pointer border-0"
                  >
                    Simpan Semua ke Database
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ==================== MANUAL FORM VIEW ==================== */
          <form onSubmit={(e) => void handleSaveQuestion(e)}>
            <div className="p-6 space-y-6 text-left">
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

              {/* Form Audio URL (Only for Listening section) */}
              {formSectionType === "LISTENING" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Audio File URL</label>
                  <input
                    type="text"
                    value={formAudioUrl}
                    onChange={(e) => setFormAudioUrl(e.target.value)}
                    placeholder="Contoh: /audio/hotel-receptionist.mp3"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                  <span className="text-[10px] text-gray-450 dark:text-gray-500 block leading-normal">
                    * Pastikan berkas suara .mp3/.wav sudah tersimpan dalam folder `/public/audio/` aplikasi terlebih dahulu.
                  </span>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Teks Soal</label>
                <textarea
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  placeholder={
                    formSectionType === "READING"
                      ? 'Penting: Ketik bacaan dalam tanda kutip dua dan berikan pertanyaan di luarnya. Contoh: "The Amazon is..." Based on the passage, why is...'
                      : "Masukkan kalimat pertanyaan..."
                  }
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white h-24 resize-none leading-relaxed"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Pilihan Jawaban & Kunci Jawaban</label>
                <div className="space-y-2">
                  {formOptions.map((option, idx) => {
                    const optLabel = String.fromCharCode(65 + idx); // A, B, C, D
                    const isChecked = formCorrectAnswer === option && option.trim() !== "";
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <label className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-650 dark:text-gray-450 flex-shrink-0 cursor-pointer">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formCorrectAnswer === option && option !== ""}
                            onChange={() => setFormCorrectAnswer(option)}
                            className="hidden"
                          />
                          <div
                            onClick={() => setFormCorrectAnswer(option)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${
                              isChecked
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-gray-300 dark:border-gray-655 hover:border-blue-550"
                            }`}
                          >
                            {isChecked ? <span className="material-symbols-outlined text-xs">check</span> : optLabel}
                          </div>
                        </label>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formOptions];
                            newOptions[idx] = e.target.value;
                            setFormOptions(newOptions);
                            // If this was the correct answer, update the correct answer string as well
                            if (formCorrectAnswer === option) {
                              setFormCorrectAnswer(e.target.value);
                            }
                          }}
                          placeholder={`Pilihan Jawaban ${optLabel}`}
                          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-550 text-gray-900 dark:text-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Penjelasan Jawaban (Opsional)</label>
                <textarea
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Mengapa kunci jawaban tersebut benar..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white h-20 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Actions for Manual Form */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-gray-550 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer bg-transparent border-0"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold text-xs px-6 py-2.5 rounded-xl hover:shadow-lg transition-all cursor-pointer border-0"
              >
                Simpan Soal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>,
  document.body
  );
}
