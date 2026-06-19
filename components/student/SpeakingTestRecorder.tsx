"use client";

import { useEffect, useState, useRef } from "react";

type SpeakingTestRecorderProps = {
  text: string;
  audioUrl: string | null;
  onChange: (text: string, audioUrl: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

export default function SpeakingTestRecorder({
  text,
  audioUrl,
  onChange,
  onUploadingChange,
}: SpeakingTestRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const recognitionRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  // Keep references to text and audioUrl to avoid re-binding SpeechRecognition on every key stroke
  const textRef = useRef(text);
  const audioUrlRef = useRef(audioUrl);

  useEffect(() => {
    textRef.current = text;
    audioUrlRef.current = audioUrl;
  }, [text, audioUrl]);



  async function startRecording() {
    onChange("", null);
    isRecordingRef.current = true;
    isPausedRef.current = false;
    setIsRecording(true);
    setIsPaused(false);

    // Initialize speech recognition if not done yet
    if (!recognitionRef.current && typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (finalTranscript) {
            const updated = textRef.current + finalTranscript;
            onChange(updated, audioUrlRef.current);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          isRecordingRef.current = false;
          setIsPaused(false);
          isPausedRef.current = false;
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
          if (!isPausedRef.current) {
            setIsRecording(false);
            isRecordingRef.current = false;
          }
        };

        recognitionRef.current = rec;
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsUploadingAudio(true);
        onUploadingChange?.(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            onChange(textRef.current, uploadData.url);
          } else {
            console.error("Failed to upload audio file");
          }
        } catch (uploadErr) {
          console.error("Error uploading audio file:", uploadErr);
        } finally {
          setIsUploadingAudio(false);
          onUploadingChange?.(false);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      if (!recognitionRef.current) {
        alert("Gagal mengakses mikrofon. Harap berikan izin mikrofon untuk merekam suara.");
      }
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }

  function pauseRecording() {
    if (!isRecordingRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    setIsPaused(true);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to pause speech recognition:", e);
      }
    }
  }

  function resumeRecording() {
    if (!isRecordingRef.current || !isPausedRef.current) return;

    isPausedRef.current = false;
    setIsPaused(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to resume speech recognition:", e);
      }
    }
  }

  async function stopRecording() {
    isRecordingRef.current = false;
    isPausedRef.current = false;
    setIsRecording(false);
    setIsPaused(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  return (
    <div className="pl-0 md:pl-12 space-y-6">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 space-y-4">
        <div className="flex items-center justify-center space-x-6">
          {/* Main button: Start Recording or Stop Recording */}
          <div className="relative">
            {isRecording && !isPaused && (
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150"></div>
            )}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploadingAudio}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer ${
                isRecording 
                  ? "bg-red-600 text-white" 
                  : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: isRecording ? "'FILL' 1" : undefined }}>
                {isRecording ? "stop" : "mic"}
              </span>
            </button>
          </div>

          {/* Secondary button: Pause / Resume */}
          {isRecording && (
            <button
              type="button"
              onClick={isPaused ? resumeRecording : pauseRecording}
              disabled={isUploadingAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer ${
                isPaused 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {isPaused ? "play_arrow" : "pause"}
              </span>
            </button>
          )}
        </div>
        <p className="font-hanken font-bold text-gray-800 dark:text-white">
          {isUploadingAudio 
            ? "Mengunggah rekaman..." 
            : isRecording 
              ? isPaused 
                ? "Rekaman Dipause... Klik tombol resume untuk melanjutkan" 
                : "Sedang Merekam... Bicaralah Sekarang" 
              : "Klik untuk Rekam Suara"}
        </p>
        
        {isUploadingAudio && (
          <p className="text-xs text-blue-500 font-semibold animate-pulse">
            Menyimpan file audio Anda ke server...
          </p>
        )}

        {audioUrl && !isRecording && (
          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
            Rekaman suara berhasil disimpan ke server!
          </p>
        )}

        <p className="font-inter text-xs text-gray-400 dark:text-gray-555 text-center max-w-xs leading-relaxed">
          Gunakan mikrofon yang berfungsi dengan baik. Ucapkan kalimat di atas dengan lantang dan jelas dalam bahasa Inggris.
        </p>
        
        {(text || audioUrl) && !isRecording && (
          <button
            type="button"
            onClick={() => {
              onChange("", null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/35 dark:text-red-400 dark:hover:bg-red-900/20 text-xs font-bold transition-all cursor-pointer bg-white dark:bg-gray-800"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Ulangi Rekaman (Reset)
          </button>
        )}
        
        <div className="w-full space-y-1.5 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Transkrip Rekaman Suara (Opsional jika merekam suara)
          </span>
          <textarea
            value={text}
            readOnly
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/40 font-inter text-xs text-gray-550 dark:text-gray-400 resize-none h-24 focus:outline-none leading-relaxed cursor-not-allowed"
            placeholder="Hasil rekaman suara Anda akan terketik di sini secara otomatis saat Anda berbicara..."
          />
        </div>
      </div>
    </div>
  );
}
