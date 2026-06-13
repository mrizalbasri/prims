"use client";
export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type WritingPrompt = {
  id: string;
  title: string;
  prompt: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minWords: number;
};

type Submission = {
  id: string;
  score: number;
  feedback: string;
  submittedAt: string;
  prompt: {
    title: string;
  };
};

export default function WritingPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);
  const [view, setView] = useState<"prompts" | "write" | "history">("prompts");

  const wordCount = essay.trim().split(/\s+/).filter(w => w.length > 0).length;

  useEffect(() => {
    async function loadData() {
      const [promptsRes, submissionsRes] = await Promise.all([
        fetch("/api/writing/prompts"),
        fetch("/api/writing/submissions")
      ]);

      if (!promptsRes.ok) {
        if (promptsRes.status === 401) router.push("/login");
        setIsLoading(false);
        return;
      }

      const promptsData = await promptsRes.json();
      const submissionsData = submissionsRes.ok ? await submissionsRes.json() : { submissions: [] };

      setPrompts(promptsData.prompts || []);
      setSubmissions(submissionsData.submissions || []);
      setIsLoading(false);
    }

    void loadData();
  }, [router]);

  async function handleSubmit() {
    if (!selectedPrompt || wordCount < selectedPrompt.minWords) return;

    setIsSubmitting(true);
    const res = await fetch("/api/writing/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        promptId: selectedPrompt.id,
        essay
      })
    });

    if (!res.ok) {
      setIsSubmitting(false);
      return;
    }

    const data = await res.json();
    setResult(data.submission);
    setShowResult(true);
    setIsSubmitting(false);
  }

  function startNewEssay(prompt: WritingPrompt) {
    setSelectedPrompt(prompt);
    setEssay("");
    setShowResult(false);
    setResult(null);
    setView("write");
  }

  function resetAndGoBack() {
    setSelectedPrompt(null);
    setEssay("");
    setShowResult(false);
    setResult(null);
    setView("prompts");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-primary">Memuat Writing Practice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/student" className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</Link>
            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-orange-200">
              Writing
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("prompts")}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                view === "prompts" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-lg">assignment</span>
              Prompts
            </button>
            <button
              onClick={() => setView("history")}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                view === "history" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              Riwayat
            </button>
            <Link href="/student" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium">
              <span className="material-symbols-outlined">close</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-10">
        {view === "prompts" && (
          <div>
            <div className="mb-8">
              <h1 className="font-hanken text-3xl font-bold text-primary mb-2">Writing Prompts</h1>
              <p className="font-inter text-on-surface-variant">Pilih topik esai dan mulai berlatih menulis dengan AI feedback.</p>
            </div>

            {prompts.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">draw</span>
                <h2 className="font-hanken text-xl font-bold text-primary mb-2">Belum Ada Prompt</h2>
                <p className="font-inter text-on-surface-variant">Prompt writing akan tersedia setelah database di-seed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 hover:shadow-xl hover:border-orange-500/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        prompt.level === "Advanced" ? "bg-status-advanced/10 text-status-advanced" :
                        prompt.level === "Intermediate" ? "bg-status-intermediate/10 text-status-intermediate" :
                        "bg-status-beginner/10 text-status-beginner"
                      }`}>
                        {prompt.level}
                      </span>
                      <span className="material-symbols-outlined text-orange-600 text-2xl">draw</span>
                    </div>
                    
                    <h3 className="font-hanken text-lg font-bold text-primary mb-3 group-hover:text-orange-600 transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="font-inter text-sm text-on-surface-variant mb-4 line-clamp-3">
                      {prompt.prompt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                      <span className="font-inter text-xs text-on-surface-variant">Min. {prompt.minWords} kata</span>
                      <button
                        onClick={() => startNewEssay(prompt)}
                        className="flex items-center gap-2 bg-orange-600 text-white font-hanken text-sm font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all group"
                      >
                        Mulai Menulis
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "write" && selectedPrompt && !showResult && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={resetAndGoBack}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium mb-4"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Kembali ke Prompts
              </button>
              
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="material-symbols-outlined text-orange-600 text-2xl">assignment</span>
                  <div className="flex-1">
                    <h2 className="font-hanken text-xl font-bold text-primary mb-2">{selectedPrompt.title}</h2>
                    <p className="font-inter text-sm text-on-surface-variant">{selectedPrompt.prompt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">straighten</span>
                    Min. {selectedPrompt.minWords} kata
                  </span>
                  <span className={`px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                    selectedPrompt.level === "Advanced" ? "bg-status-advanced/10 text-status-advanced" :
                    selectedPrompt.level === "Intermediate" ? "bg-status-intermediate/10 text-status-intermediate" :
                    "bg-status-beginner/10 text-status-beginner"
                  }`}>
                    {selectedPrompt.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-hanken text-lg font-bold text-primary">Tulis Esai Anda</h3>
                <div className="flex items-center gap-2">
                  <span className={`font-jetbrains text-sm font-bold ${
                    wordCount >= selectedPrompt.minWords ? "text-green-600" : "text-on-surface-variant"
                  }`}>
                    {wordCount} / {selectedPrompt.minWords} kata
                  </span>
                  {wordCount >= selectedPrompt.minWords && (
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  )}
                </div>
              </div>
              
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="w-full min-h-[400px] p-6 rounded-xl border-2 border-outline-variant focus:border-orange-600 focus:ring-0 transition-all font-inter bg-surface-bright resize-none"
                placeholder="Mulai menulis esai Anda di sini..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || wordCount < selectedPrompt.minWords}
                className="inline-flex items-center gap-2 bg-orange-600 text-white font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim & Menilai...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Kirim untuk Dinilai
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {view === "write" && showResult && result && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 md:p-12 shadow-xl mb-6">
              <div className="text-center mb-8">
                <span className="material-symbols-outlined text-6xl text-orange-600 mb-4 inline-block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  grade
                </span>
                <h2 className="font-hanken text-3xl font-bold text-primary mb-2">Hasil Penilaian</h2>
                <div className="inline-flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-full border border-orange-200">
                  <span className="font-hanken text-4xl font-bold text-orange-600">{result.score}</span>
                  <span className="font-inter text-sm text-on-surface-variant">/ 100</span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-6 mb-6">
                <h3 className="font-hanken text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">feedback</span>
                  AI Feedback
                </h3>
                <p className="font-inter text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {result.feedback}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => startNewEssay(selectedPrompt!)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-600 text-white font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Coba Lagi
                </button>
                <button
                  onClick={resetAndGoBack}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-surface-container-high text-primary font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all border border-outline-variant"
                >
                  Pilih Prompt Lain
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "history" && (
          <div>
            <div className="mb-8">
              <h1 className="font-hanken text-3xl font-bold text-primary mb-2">Riwayat Submission</h1>
              <p className="font-inter text-on-surface-variant">Lihat semua esai yang pernah Anda tulis dan nilai yang didapat.</p>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">history</span>
                <h2 className="font-hanken text-xl font-bold text-primary mb-2">Belum Ada Submission</h2>
                <p className="font-inter text-on-surface-variant mb-6">Mulai menulis esai pertama Anda untuk melihat riwayat di sini.</p>
                <button
                  onClick={() => setView("prompts")}
                  className="inline-flex items-center gap-2 bg-orange-600 text-white font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Lihat Prompts
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-hanken text-lg font-bold text-primary mb-1">{sub.prompt.title}</h3>
                        <p className="font-inter text-xs text-on-surface-variant">
                          {new Date(sub.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-jetbrains text-3xl font-bold text-orange-600">{sub.score}</p>
                          <p className="font-inter text-xs text-on-surface-variant">Skor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
