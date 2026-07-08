"use client";

import { useState, useEffect, useRef } from "react";

interface ReadAlongPlayerProps {
  scenario: {
    id: string;
    title: string;
    description: string;
    targetText: string;
    duration: number;
    level: string;
  };
  onBack: () => void;
  onSubmit: (transcriptText: string, audioUrl: string | null, durationSec: number) => Promise<void>;
  isSubmitting: boolean;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export default function ReadAlongPlayer({ scenario, onBack, onSubmit, isSubmitting }: ReadAlongPlayerProps) {
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [scrollMode, setScrollMode] = useState<"auto" | "karaoke">("auto");
  const [speedWPM, setSpeedWPM] = useState(130); // Default: 130 WPM
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const words = useRef<string[]>(scenario.targetText.split(/\s+/));
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeTrackerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper clean function for matching words
  const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllActivities();
    };
  }, []);

  // Set up Speech Recognition on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let currentSpoken = "";
          let finalTranscriptPart = "";
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptPart += text + " ";
            } else {
              currentSpoken = text;
            }
          }

          if (finalTranscriptPart) {
            setTranscript((prev) => prev + finalTranscriptPart);
          }

          // Voice Karaoke tracking logic
          if (scrollMode === "karaoke" && isPlaying) {
            const spokenTextCleaned = (finalTranscriptPart || currentSpoken)
              .trim()
              .split(/\s+/)
              .map(cleanWord)
              .filter(Boolean);

            if (spokenTextCleaned.length > 0) {
              setActiveWordIdx((currentIdx) => {
                let nextIdx = currentIdx === -1 ? 0 : currentIdx;
                // Look ahead up to 6 words to find a match
                for (const word of spokenTextCleaned) {
                  for (let offset = 0; offset < 6; offset++) {
                    const targetIdx = nextIdx + offset;
                    if (
                      targetIdx < words.current.length &&
                      cleanWord(words.current[targetIdx]) === word
                    ) {
                      nextIdx = targetIdx + 1;
                      break;
                    }
                  }
                }
                
                // If we reach the end of the text, auto stop
                if (nextIdx >= words.current.length) {
                  setTimeout(() => void finishReading(), 500);
                }
                return nextIdx;
              });
            }
          }
        };

        rec.onerror = (err: any) => {
          console.error("Speech recognition error in player:", err.error);
        };

        rec.onend = () => {
          // Restart if we are still active and in karaoke mode
          if (isPlaying && scrollMode === "karaoke" && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignore already started errors
            }
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, [scrollMode, isPlaying]);

  // Handle active word scrolling
  useEffect(() => {
    if (activeWordRef.current && scrollContainerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [activeWordIdx]);

  // Handle Auto Scroll highlighting timer
  useEffect(() => {
    if (isPlaying && scrollMode === "auto") {
      const msPerWord = (60 / speedWPM) * 1000;
      autoScrollTimerRef.current = setInterval(() => {
        setActiveWordIdx((prev) => {
          const next = prev + 1;
          if (next >= words.current.length) {
            if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
            setTimeout(() => void finishReading(), 800);
            return prev;
          }
          return next;
        });
      }, msPerWord);
    }

    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    };
  }, [isPlaying, scrollMode, speedWPM]);

  // Handle countdown before start
  const startPractice = () => {
    setCountdown(3);
    setActiveWordIdx(-1);
    setTranscript("");
    setAudioUrl(null);
    setRecordingTime(0);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          void startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    setIsPlaying(true);
    setActiveWordIdx(0);

    // 1. Start media recorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            setAudioUrl(uploadData.url);
          }
        } catch (uploadErr) {
          console.error("Error uploading audio file in player:", uploadErr);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Failed to access microphone in player:", err);
      alert("Gagal mengakses mikrofon. Silakan izinkan akses mikrofon browser Anda.");
      setIsPlaying(false);
      return;
    }

    // 2. Start speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }

    // 3. Start recording duration timer
    timeTrackerTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= scenario.duration) {
          void finishReading();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const finishReading = async () => {
    setIsPlaying(false);
    stopAllActivities();
  };

  const stopAllActivities = () => {
    if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    if (timeTrackerTimerRef.current) clearInterval(timeTrackerTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-550 hover:text-gray-900 dark:hover:text-white transition-colors font-inter text-sm font-semibold cursor-pointer"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Kembali ke Skenario
      </button>

      {/* Info Card */}
      <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-red-600 text-3xl p-2 rounded-xl bg-red-500/10">auto_stories</span>
          <div className="flex-1 space-y-1">
            <h2 className="font-hanken text-xl font-bold text-gray-900 dark:text-white">{scenario.title}</h2>
            <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{scenario.description}</p>
          </div>
        </div>
      </div>

      {/* Main Player Screen */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 shadow-sm flex flex-col md:flex-row gap-8 min-h-[450px] relative overflow-hidden">
        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-40 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
            <p className="font-hanken text-xl font-bold text-gray-400 uppercase tracking-widest">Persiapan...</p>
            <p className="font-hanken text-7xl font-black text-red-650 animate-bounce">{countdown}</p>
          </div>
        )}

        {/* Left: Teleprompter Passage Screen */}
        <div className="flex-1 flex flex-col justify-between min-h-[300px] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/30 dark:bg-gray-900/10 relative">
          {/* Fading gradient top and bottom overlays for teleprompter look */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white dark:from-gray-850 to-transparent pointer-events-none rounded-t-2xl z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-gray-850 to-transparent pointer-events-none rounded-b-2xl z-10"></div>

          {/* Scrolling text area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto py-12 px-2 scrollbar-none h-[220px]"
          >
            <div className="flex flex-wrap gap-x-2 gap-y-3 justify-center text-center text-xl sm:text-2xl md:text-3xl leading-relaxed">
              {words.current.map((word, idx) => {
                const isWordActive = idx === activeWordIdx;
                const isWordRead = idx < activeWordIdx;

                return (
                  <span
                    key={idx}
                    ref={isWordActive ? activeWordRef : null}
                    className={`transition-all duration-200 px-1 rounded ${
                      isWordActive
                        ? "text-red-600 dark:text-red-400 font-bold border-b-2 border-red-500 scale-105"
                        : isWordRead
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-300 dark:text-gray-700"
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{
                width: `${
                  words.current.length > 0
                    ? Math.min(100, Math.max(0, ((activeWordIdx + 1) / words.current.length) * 100))
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Right: Controls & Parameters */}
        <div className="w-full md:w-80 flex flex-col justify-between gap-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-6 md:pt-0 pl-0 md:pl-8">
          {/* Mode selectors */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-hanken text-xs font-bold text-gray-500 uppercase tracking-wider block">Mode Membaca</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => !isPlaying && setScrollMode("auto")}
                  disabled={isPlaying}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    scrollMode === "auto"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-red-600 dark:text-red-400 font-bold"
                      : "text-gray-450 hover:text-gray-700 dark:hover:text-gray-300"
                  } disabled:opacity-50`}
                >
                  <span className="material-symbols-outlined text-lg">sync_alt</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Auto Pace</span>
                </button>
                <button
                  onClick={() => !isPlaying && setScrollMode("karaoke")}
                  disabled={isPlaying}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    scrollMode === "karaoke"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-red-600 dark:text-red-400 font-bold"
                      : "text-gray-450 hover:text-gray-700 dark:hover:text-gray-300"
                  } disabled:opacity-50`}
                >
                  <span className="material-symbols-outlined text-lg">mic</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Voice Sync</span>
                </button>
              </div>
            </div>

            {/* Auto speed adjust */}
            {scrollMode === "auto" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-hanken font-bold text-gray-500 uppercase tracking-wider">Kecepatan Baca</label>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">{speedWPM} WPM</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="220"
                  step="10"
                  value={speedWPM}
                  disabled={isPlaying}
                  onChange={(e) => setSpeedWPM(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600 disabled:opacity-50"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase">
                  <span>Lambat</span>
                  <span>Normal (130)</span>
                  <span>Cepat</span>
                </div>
              </div>
            )}

            {/* Voice Karaoke instructions */}
            {scrollMode === "karaoke" && (
              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl text-xs space-y-2 text-gray-550 dark:text-gray-400 animate-fadeIn">
                <p className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">info</span>
                  Mode Karaoke Suara
                </p>
                <p className="leading-relaxed">
                  Sorotan kata akan otomatis berjalan mengikuti kata-kata bahasa Inggris yang Anda ucapkan secara real-time.
                </p>
              </div>
            )}
          </div>

          {/* Action trigger button */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {isPlaying ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Merekam...</span>
                  </div>
                  <span className="font-mono text-xl font-bold">{recordingTime}s / {scenario.duration}s</span>
                </div>
                <button
                  onClick={() => void finishReading()}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-hanken font-bold py-4 rounded-xl shadow-lg transition-all cursor-pointer border-0"
                >
                  <span className="material-symbols-outlined">stop</span>
                  Selesai Membaca
                </button>
              </div>
            ) : (
              <button
                onClick={startPractice}
                disabled={isSubmitting || isUploading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-750 text-white font-hanken font-bold py-4 rounded-xl shadow-lg shadow-red-500/15 hover:shadow-red-500/20 transition-all cursor-pointer border-0"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Mulai Membaca
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review & Submit Section */}
      {!isPlaying && (transcript || audioUrl) && (
        <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white">Review Latihan Membaca</h3>
            <span className="text-xs text-gray-400 font-inter font-semibold">Tinjau transkrip suara Anda sebelum dikirim</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-hanken text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Transkripsi Anda</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full min-h-[140px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850 text-gray-900 dark:text-white text-sm font-inter focus:outline-none focus:ring-2 focus:ring-red-600/30 resize-none leading-relaxed"
                placeholder="Transkrip suara Anda akan muncul di sini secara otomatis..."
              />
            </div>

            {isUploading && (
              <p className="text-xs text-blue-500 font-semibold animate-pulse">
                Mengunggah rekaman suara ke server...
              </p>
            )}
            {audioUrl && !isUploading && (
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Rekaman audio tersimpan di server!
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => void onSubmit(transcript, audioUrl, recordingTime)}
                disabled={isSubmitting || isUploading || !transcript.trim()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-750 text-white font-hanken font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer border-0"
              >
                <span className="material-symbols-outlined">send</span>
                {isSubmitting ? "Sedang Dinilai AI..." : "Kirim untuk Penilaian AI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
