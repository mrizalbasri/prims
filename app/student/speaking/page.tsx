"use client";
export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SpeakingScenario = {
  id: string;
  title: string;
  scenario: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
};

type Session = {
  id: string;
  score: number;
  feedback: string;
  submittedAt: string;
  scenario: {
    title: string;
  };
};

export default function SpeakingPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<SpeakingScenario[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SpeakingScenario | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<Session | null>(null);
  const [view, setView] = useState<"scenarios" | "practice" | "history">("scenarios");
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [scenariosRes, sessionsRes] = await Promise.all([
        fetch("/api/speaking/scenarios"),
        fetch("/api/speaking/sessions")
      ]);

      if (!scenariosRes.ok) {
        if (scenariosRes.status === 401) router.push("/login");
        setIsLoading(false);
        return;
      }

      const scenariosData = await scenariosRes.json();
      const sessionsData = sessionsRes.ok ? await sessionsRes.json() : { sessions: [] };

      setScenarios(scenariosData.scenarios || []);
      setSessions(sessionsData.sessions || []);
      setIsLoading(false);
    }

    void loadData();
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function handleSubmit() {
    if (!selectedScenario || !transcript.trim()) return;

    setIsSubmitting(true);
    const res = await fetch("/api/speaking/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenarioId: selectedScenario.id,
        transcript
      })
    });

    if (!res.ok) {
      setIsSubmitting(false);
      return;
    }

    const data = await res.json();
    setResult(data.session);
    setShowResult(true);
    setIsSubmitting(false);
  }

  function startNewPractice(scenario: SpeakingScenario) {
    setSelectedScenario(scenario);
    setTranscript("");
    setShowResult(false);
    setResult(null);
    setIsRecording(false);
    setRecordingTime(0);
    setView("practice");
  }

  function resetAndGoBack() {
    setSelectedScenario(null);
    setTranscript("");
    setShowResult(false);
    setResult(null);
    setIsRecording(false);
    setRecordingTime(0);
    setView("scenarios");
  }

  function toggleRecording() {
    setIsRecording(!isRecording);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-primary">Memuat Speaking Practice...</p>
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
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-200">
              Speaking
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("scenarios")}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${
                view === "scenarios" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              Skenario
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
        {view === "scenarios" && (
          <div>
            <div className="mb-8">
              <h1 className="font-hanken text-3xl font-bold text-primary mb-2">Speaking Scenarios</h1>
              <p className="font-inter text-on-surface-variant">Pilih skenario percakapan dan praktikkan kemampuan speaking Anda dengan AI feedback.</p>
            </div>

            {scenarios.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">mic</span>
                <h2 className="font-hanken text-xl font-bold text-primary mb-2">Belum Ada Skenario</h2>
                <p className="font-inter text-on-surface-variant">Skenario speaking akan tersedia setelah database di-seed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 hover:shadow-xl hover:border-red-500/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        scenario.level === "Advanced" ? "bg-status-advanced/10 text-status-advanced" :
                        scenario.level === "Intermediate" ? "bg-status-intermediate/10 text-status-intermediate" :
                        "bg-status-beginner/10 text-status-beginner"
                      }`}>
                        {scenario.level}
                      </span>
                      <span className="material-symbols-outlined text-red-600 text-2xl">mic</span>
                    </div>
                    
                    <h3 className="font-hanken text-lg font-bold text-primary mb-3 group-hover:text-red-600 transition-colors">
                      {scenario.title}
                    </h3>
                    <p className="font-inter text-sm text-on-surface-variant mb-4 line-clamp-3">
                      {scenario.scenario}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                      <span className="font-inter text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        {scenario.duration} detik
                      </span>
                      <button
                        onClick={() => startNewPractice(scenario)}
                        className="flex items-center gap-2 bg-red-600 text-white font-hanken text-sm font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all group"
                      >
                        Mulai Praktik
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "practice" && selectedScenario && !showResult && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={resetAndGoBack}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-inter text-sm font-medium mb-4"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Kembali ke Skenario
              </button>
              
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="material-symbols-outlined text-red-600 text-2xl">campaign</span>
                  <div className="flex-1">
                    <h2 className="font-hanken text-xl font-bold text-primary mb-2">{selectedScenario.title}</h2>
                    <p className="font-inter text-sm text-on-surface-variant">{selectedScenario.scenario}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    Durasi: {selectedScenario.duration} detik
                  </span>
                  <span className={`px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                    selectedScenario.level === "Advanced" ? "bg-status-advanced/10 text-status-advanced" :
                    selectedScenario.level === "Intermediate" ? "bg-status-intermediate/10 text-status-intermediate" :
                    "bg-status-beginner/10 text-status-beginner"
                  }`}>
                    {selectedScenario.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 mb-6">
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all ${
                  isRecording ? "bg-red-600 animate-pulse" : "bg-red-50"
                }`}>
                  <span className={`material-symbols-outlined text-6xl ${
                    isRecording ? "text-white" : "text-red-600"
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    mic
                  </span>
                </div>
                
                <h3 className="font-hanken text-2xl font-bold text-primary mb-2">
                  {isRecording ? "Sedang Merekam..." : "Siap untuk Merekam"}
                </h3>
                
                {isRecording && (
                  <p className="font-jetbrains text-4xl font-bold text-red-600 mb-4">
                    {formatTime(recordingTime)}
                  </p>
                )}
                
                <p className="font-inter text-sm text-on-surface-variant text-center max-w-md mb-8">
                  {isRecording 
                    ? "Bicaralah dengan jelas dan natural. Klik tombol di bawah untuk menghentikan rekaman."
                    : "Klik tombol di bawah untuk mulai merekam jawaban Anda. Pastikan mikrofon aktif."
                  }
                </p>
                
                <button
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-3 font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all ${
                    isRecording 
                      ? "bg-red-600 text-white" 
                      : "bg-primary text-on-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isRecording ? "stop" : "mic"}
                  </span>
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
              </div>

              <div className="pt-6 border-t border-outline-variant">
                <h4 className="font-hanken text-sm font-bold text-primary mb-3">Atau Ketik Transkrip (Fallback)</h4>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full min-h-[150px] p-4 rounded-xl border-2 border-outline-variant focus:border-red-600 focus:ring-0 transition-all font-inter bg-surface-bright resize-none"
                  placeholder="Ketik transkrip jawaban lisan Anda di sini jika tidak bisa merekam audio..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || !transcript.trim()}
                className="inline-flex items-center gap-2 bg-red-600 text-white font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
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

        {view === "practice" && showResult && result && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 md:p-12 shadow-xl mb-6">
              <div className="text-center mb-8">
                <span className="material-symbols-outlined text-6xl text-red-600 mb-4 inline-block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  grade
                </span>
                <h2 className="font-hanken text-3xl font-bold text-primary mb-2">Hasil Penilaian</h2>
                <div className="inline-flex items-center gap-3 bg-red-50 px-6 py-3 rounded-full border border-red-200">
                  <span className="font-hanken text-4xl font-bold text-red-600">{result.score}</span>
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
                  onClick={() => startNewPractice(selectedScenario!)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Coba Lagi
                </button>
                <button
                  onClick={resetAndGoBack}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-surface-container-high text-primary font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all border border-outline-variant"
                >
                  Pilih Skenario Lain
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "history" && (
          <div>
            <div className="mb-8">
              <h1 className="font-hanken text-3xl font-bold text-primary mb-2">Riwayat Sesi</h1>
              <p className="font-inter text-on-surface-variant">Lihat semua sesi speaking yang pernah Anda lakukan dan nilai yang didapat.</p>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 inline-block">history</span>
                <h2 className="font-hanken text-xl font-bold text-primary mb-2">Belum Ada Sesi</h2>
                <p className="font-inter text-on-surface-variant mb-6">Mulai praktik speaking pertama Anda untuk melihat riwayat di sini.</p>
                <button
                  onClick={() => setView("scenarios")}
                  className="inline-flex items-center gap-2 bg-red-600 text-white font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Lihat Skenario
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-hanken text-lg font-bold text-primary mb-1">{session.scenario.title}</h3>
                        <p className="font-inter text-xs text-on-surface-variant">
                          {new Date(session.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-jetbrains text-3xl font-bold text-red-600">{session.score}</p>
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
