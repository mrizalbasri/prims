"use client";

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
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert("Akses mikrofon ditolak. Silakan aktifkan izin mikrofon pada browser Anda di sebelah kiri alamat URL (ikon gembok/pengaturan).");
          } else if (event.error === 'no-speech') {
            alert("Tidak ada suara yang terdeteksi. Silakan coba berbicara lebih dekat ke mikrofon atau berbicara lebih keras.");
          } else if (event.error === 'audio-capture') {
            alert("Perangkat mikrofon tidak terdeteksi. Pastikan mikrofon Anda terhubung dengan benar dan aktif.");
          } else {
            alert(`Gagal merekam suara: ${event.error}. Silakan coba lagi atau ketik jawaban langsung sebagai alternatif.`);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [scenariosRes, sessionsRes] = await Promise.all([
          fetch("/api/speaking/scenarios"),
          fetch("/api/speaking/sessions")
        ]);

        if (!scenariosRes.ok) {
          if (scenariosRes.status === 401) router.push("/login");
          if (scenariosRes.status === 403) router.push("/student");
          setIsLoading(false);
          return;
        }

        const scenariosData = await scenariosRes.json();
        const sessionsData = sessionsRes.ok ? await sessionsRes.json() : { sessions: [] };

        setScenarios(scenariosData.scenarios || []);
        setSessions(sessionsData.sessions || []);
      } catch (err) {
        console.error("Failed to load speaking data:", err);
      } finally {
        setIsLoading(false);
      }
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
    try {
      const res = await fetch("/api/speaking/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          transcript
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Gagal mengirimkan latihan berbicara.");
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setResult(data.session);
      setShowResult(true);
    } catch (err) {
      console.error("Submit speaking score error:", err);
    } finally {
      setIsSubmitting(false);
    }
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
    if (!recognition) {
      alert("Browser Anda tidak mendukung perekaman suara otomatis (Speech-to-Text). Silakan ketik langsung transkrip Anda.");
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-hanken font-bold text-blue-600 dark:text-blue-400">Memuat Speaking Practice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/student" className="font-hanken text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">PRISM</Link>
            <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-200/50 dark:border-red-800/20">
              Speaking Practice
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView("scenarios")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-hanken text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                view === "scenarios" ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              <span className="hidden sm:inline">Skenario</span>
            </button>
            <button
              onClick={() => setView("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-hanken text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                view === "history" ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              <span className="hidden sm:inline">Riwayat</span>
            </button>
            <Link href="/student" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {/* Scenarios grid view */}
        {view === "scenarios" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Latihan Percakapan</span>
              <h1 className="font-hanken text-3xl font-extrabold text-gray-900 dark:text-white">Speaking Scenarios</h1>
              <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                Pilih salah satu skenario simulasi komunikasi dan mulailah melatih pengucapan, intonasi, dan kelancaran berbicara Anda dengan asisten AI.
              </p>
            </div>

            {scenarios.length === 0 ? (
              <div className="bg-white dark:bg-gray-850 rounded-3xl border-2 border-dashed border-gray-150 dark:border-gray-700 p-12 text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">mic</span>
                <h2 className="font-hanken text-lg font-bold text-gray-850 dark:text-white">Belum Ada Skenario</h2>
                <p className="font-inter text-sm text-gray-405 dark:text-gray-500 max-w-xs mx-auto">
                  Skenario berbicara lisan belum dimuat dalam sistem.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-xl hover:border-red-500/40 transition-all flex flex-col justify-between group">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          scenario.level === "Advanced" ? "bg-green-50 text-green-600 dark:bg-green-500/10" :
                          scenario.level === "Intermediate" ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10" :
                          "bg-red-50 text-red-600 dark:bg-red-500/10"
                        }`}>
                          {scenario.level}
                        </span>
                        <span className="material-symbols-outlined text-red-600">mic</span>
                      </div>
                      
                      <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                        {scenario.title}
                      </h3>
                      <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {scenario.scenario}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                      <span className="font-inter text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        Maks. {scenario.duration} detik
                      </span>
                      <button
                        onClick={() => startNewPractice(scenario)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-750 text-white font-hanken text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                      >
                        Mulai Praktik
                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recording / Speaking Interface */}
        {view === "practice" && selectedScenario && !showResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <button
              onClick={resetAndGoBack}
              className="flex items-center gap-2 text-gray-550 hover:text-gray-900 dark:hover:text-white transition-colors font-inter text-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Kembali ke Skenario
            </button>
            
            <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-red-600 text-3xl p-2 rounded-xl bg-red-500/10">campaign</span>
                <div className="flex-1 space-y-1">
                  <h2 className="font-hanken text-xl font-bold text-gray-900 dark:text-white">{selectedScenario.title}</h2>
                  <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{selectedScenario.scenario}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-450 dark:text-gray-400 pt-3 border-t border-red-200/30">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-gray-400">timer</span>
                  Waktu Skenario: {selectedScenario.duration} detik
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  selectedScenario.level === "Advanced" ? "bg-green-50 text-green-600 dark:bg-green-500/10" :
                  selectedScenario.level === "Intermediate" ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10" :
                  "bg-red-50 text-red-600 dark:bg-red-500/10"
                }`}>
                  {selectedScenario.level}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 shadow-sm flex flex-col items-center justify-center space-y-8 py-14">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150 -z-10"></div>
                )}
                <button
                  onClick={toggleRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer ${
                    isRecording 
                      ? "bg-red-600 text-white shadow-red-500/30" 
                      : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-gray-200 dark:shadow-none"
                  }`}
                >
                  <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isRecording ? "stop" : "mic"}
                  </span>
                </button>
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-hanken text-xl font-bold text-gray-900 dark:text-white">
                  {isRecording ? "Sedang Merekam Audio..." : "Mulai Rekam Suara"}
                </h3>
                
                {isRecording ? (
                  <p className="font-mono text-3xl font-black text-red-600 dark:text-red-400">
                    {formatTime(recordingTime)}
                  </p>
                ) : (
                  <p className="font-inter text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Klik tombol mikrofon di atas untuk berbicara. Setelah selesai berbicara, tekan kembali untuk berhenti.
                  </p>
                )}
              </div>
              
              <div className="w-full max-w-xl pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-hanken text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Transkrip Jawaban Lisan Anda
                  </h4>
                  <span className="text-[10px] text-gray-400 font-inter font-semibold">(Diperlukan untuk penilaian AI)</span>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full min-h-[140px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-red-600/30 resize-none leading-relaxed"
                  placeholder="Ketik transkrip dari apa yang Anda bicarakan di sini..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || !transcript.trim()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-750 text-white font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menilai Pelafalan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Kirim Jawaban Speaking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI response results view */}
        {view === "practice" && showResult && result && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 md:p-12 shadow-xl space-y-8 text-center">
              <div className="space-y-4">
                <span className="material-symbols-outlined text-6xl text-red-600 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                  grade
                </span>
                <h2 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Hasil Penilaian Speaking</h2>
                <div className="inline-flex items-center gap-3 bg-red-50 dark:bg-red-500/10 px-6 py-3 rounded-full border border-red-200/50 dark:border-red-900/30">
                  <span className="font-hanken text-5xl font-black text-red-600 dark:text-red-400">{result.score}</span>
                  <span className="font-inter text-xs text-gray-400 uppercase tracking-widest font-semibold">/ 100</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-left space-y-4">
                <h3 className="font-hanken text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600">feedback</span>
                  Umpan Balik AI (Indonesia)
                </h3>
                <div className="font-inter text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-850 p-5 rounded-xl border border-gray-150 dark:border-gray-750">
                  {result.feedback}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => startNewPractice(selectedScenario!)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-750 text-white font-hanken font-bold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Coba Praktik Lagi
                </button>
                <button
                  onClick={resetAndGoBack}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-hanken font-bold px-6 py-3.5 rounded-xl transition-all border border-transparent dark:border-gray-700 cursor-pointer"
                >
                  Kembali ke Skenario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History of sessions view */}
        {view === "history" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Hasil Latihan Lisan</span>
              <h1 className="font-hanken text-3xl font-extrabold text-gray-900 dark:text-white">Riwayat Sesi Speaking</h1>
              <p className="font-inter text-sm text-gray-500 dark:text-gray-400">Tinjau seluruh rekaman dan transkrip skenario lisan yang telah dinilai AI.</p>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-white dark:bg-gray-850 rounded-3xl border-2 border-dashed border-gray-150 dark:border-gray-700 p-12 text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">history</span>
                <h2 className="font-hanken text-lg font-bold text-gray-850 dark:text-white">Belum Ada Sesi Speaking</h2>
                <p className="font-inter text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-4">
                  Selesaikan latihan percakapan pertama Anda untuk melihat riwayat performa lisan di sini.
                </p>
                <div>
                  <button
                    onClick={() => setView("scenarios")}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-hanken text-xs font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    Cari Skenario Percakapan
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">{session.scenario.title}</h3>
                        <p className="font-inter text-xs text-gray-450 dark:text-gray-555">
                          Diselesaikan pada {new Date(session.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 border-l border-gray-100 dark:border-gray-800 pl-0 md:pl-6">
                        <div className="text-center">
                          <p className="font-mono text-3xl font-black text-red-600 dark:text-red-400">{session.score}</p>
                          <p className="font-inter text-[9px] uppercase font-bold text-gray-400 tracking-wider">Skor</p>
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
