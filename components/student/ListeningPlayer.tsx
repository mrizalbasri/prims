"use client";

import { useEffect, useRef, useState } from "react";

type ListeningPlayerProps = {
  audioUrl?: string;
};

export default function ListeningPlayer({ audioUrl }: ListeningPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isPlayPending, setIsPlayPending] = useState(false);

  // Initialize Audio
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setPlayCount((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setIsEnded(true);
        }
        return next;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || isEnded || isPlayPending) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (playCount < 2) {
        setIsPlayPending(true);
        audioRef.current.play()
          .then(() => {
            setIsPlayPending(false);
            setIsPlaying(true);
          })
          .catch((err) => {
            setIsPlayPending(false);
            if (err.name !== "AbortError") {
              console.error("Audio playback error:", err);
            }
          });
      }
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60).toString().padStart(2, "0");
    const secs = Math.floor(time % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!audioUrl) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-900 dark:bg-gray-900 rounded-3xl p-6 shadow-xl text-white border border-slate-700/30 flex flex-col md:flex-row items-center gap-6 justify-between select-none">
      <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 flex-shrink-0">
          <span className="material-symbols-outlined text-2xl animate-pulse">headphones</span>
        </div>
        <div className="space-y-1 overflow-hidden">
          <h4 className="font-hanken font-bold text-sm text-slate-150 tracking-wide uppercase">
            Audio Percakapan / Monolog Akademik
          </h4>
          <p className="font-inter text-xs text-slate-400">
            {isEnded ? "Batas putar habis (Maks. 2 kali)" : `Sisa kesempatan putar: ${2 - playCount} kali`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto flex-shrink-0 justify-between md:justify-end">
        {/* Play Button */}
        <button
          onClick={togglePlay}
          disabled={isEnded || isPlayPending}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isEnded || isPlayPending
              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
              : isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-lg hover:shadow-amber-500/20"
              : "bg-teal-500 hover:bg-teal-600 text-slate-950 hover:shadow-lg hover:shadow-teal-500/20"
          }`}
        >
          {isPlayPending ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-2xl">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          )}
        </button>

        {/* Custom Timeline (Non-seekable) */}
        <div className="flex-1 md:w-48 space-y-1">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-teal-400 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
