"use client";

import { useEffect, useState, useRef } from "react";

type SpeakingTestRecorderProps = {
  initialText: string;
  initialAudioUrl: string | null;
  onChange: (text: string, audioUrl: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

export default function SpeakingTestRecorder({
  initialText,
  initialAudioUrl,
  onChange,
  onUploadingChange,
}: SpeakingTestRecorderProps) {
  const [speakingResponse, setSpeakingResponse] = useState(initialText);
  const [audioUrlState, setAudioUrlState] = useState<string | null>(initialAudioUrl);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSpeakingResponse(initialText);
  }, [initialText]);

  useEffect(() => {
    setAudioUrlState(initialAudioUrl);
  }, [initialAudioUrl]);

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
            setSpeakingResponse((prev) => {
              const updated = prev + finalTranscript;
              onChange(updated, audioUrlState);
              return updated;
            });
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
  }, [audioUrlState, onChange]);

  async function toggleSpeechRecording() {
    if (isRecording) {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error(e);
        }
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
    } else {
      setSpeakingResponse("");
      setAudioUrlState(null);
      onChange("", null);

      if (recognition) {
        try {
          recognition.start();
        } catch (err) {
          console.error("Failed to start speech recognition:", err);
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
              setAudioUrlState(uploadData.url);
              onChange(speakingResponse, uploadData.url);
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
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start MediaRecorder:", err);
        if (!recognition) {
          alert("Gagal mengakses mikrofon. Harap berikan izin mikrofon untuk merekam suara.");
        }
      }
    }
  }

  return (
    <div className="pl-0 md:pl-12 space-y-6">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 space-y-4">
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150"></div>
          )}
          <button
            type="button"
            onClick={toggleSpeechRecording}
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
        <p className="font-hanken font-bold text-gray-800 dark:text-white">
          {isRecording ? "Sedang Merekam... Bicaralah Sekarang" : isUploadingAudio ? "Mengunggah rekaman..." : "Klik untuk Rekam Suara"}
        </p>
        
        {isUploadingAudio && (
          <p className="text-xs text-blue-500 font-semibold animate-pulse">
            Menyimpan file audio Anda ke server...
          </p>
        )}

        {audioUrlState && !isRecording && (
          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
            Rekaman suara berhasil disimpan ke server!
          </p>
        )}

        <p className="font-inter text-xs text-gray-400 dark:text-gray-550 text-center max-w-xs leading-relaxed">
          Gunakan mikrofon yang berfungsi dengan baik. Ucapkan kalimat di atas dengan lantang dan jelas dalam bahasa Inggris.
        </p>
        
        {(speakingResponse || audioUrlState) && !isRecording && (
          <button
            type="button"
            onClick={() => {
              setSpeakingResponse("");
              setAudioUrlState(null);
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
            value={speakingResponse}
            readOnly
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/40 font-inter text-xs text-gray-550 dark:text-gray-400 resize-none h-24 focus:outline-none leading-relaxed cursor-not-allowed"
            placeholder="Hasil rekaman suara Anda akan terketik di sini secara otomatis saat Anda berbicara..."
          />
        </div>
      </div>
    </div>
  );
}
