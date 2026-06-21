"use client";

import { useEffect, useState } from "react";

type SectionSettings = {
  counts: Record<string, number>;
  durations: Record<string, number>;
};

export default function SettingsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data: SectionSettings = await res.json();
          setCounts(data.counts || {});
          setDurations(data.durations || {});
        } else {
          setErrorMessage("Gagal memuat pengaturan.");
        }
      } catch {
        setErrorMessage("Terjadi kesalahan jaringan.");
      } finally {
        setIsLoading(false);
      }
    }
    void fetchSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counts, durations }),
      });

      if (res.ok) {
        const data = await res.json();
        setCounts(data.settings.counts || {});
        setDurations(data.settings.durations || {});
        setSuccessMessage("Pengaturan tes berhasil diperbarui!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || "Gagal memperbarui pengaturan.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  const sectionsList = [
    { key: "VOCABULARY", label: "Vocabulary", desc: "Soal pilihan ganda pemahaman arti kata & sinonim akademik", icon: "style", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
    { key: "GRAMMAR", label: "Grammar", desc: "Soal pilihan ganda struktur kalimat & tata bahasa Inggris", icon: "rule", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
    { key: "LISTENING", label: "Listening", desc: "Soal pemahaman mendengar berbasis passage audio MP3", icon: "headphones", color: "text-teal-500 bg-teal-50 dark:bg-teal-900/20" },
    { key: "READING", label: "Reading", desc: "Soal pemahaman bacaan berbasis passage teks akademik", icon: "chrome_reader_mode", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
            <h1 className="font-hanken text-3xl font-extrabold text-gray-955 dark:text-white">
              Pengaturan Ujian
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Konfigurasi batasan jumlah soal dan durasi waktu tes yang akan dimuat dinamis saat mahasiswa menempuh ujian.
          </p>
        </div>
      </header>

      {/* Alert Status */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/35 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fadeIn">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/35 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectionsList.map((section) => {
            const countVal = counts[section.key] !== undefined ? counts[section.key] : 10;
            const durationVal = durations[section.key] !== undefined ? durations[section.key] : 10;

            return (
              <div 
                key={section.key}
                className="bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-700/70 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-350"
              >
                {/* Header Section */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${section.color}`}>
                    <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-hanken font-bold text-base text-gray-900 dark:text-white leading-none">
                      {section.label}
                    </h3>
                    <p className="font-inter text-xs text-gray-400 dark:text-gray-500 leading-normal">
                      {section.desc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {/* Question Count Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                      Jumlah Soal Ujian
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={countVal}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setCounts((prev) => ({ ...prev, [section.key]: val }));
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white font-mono"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                        Soal
                      </span>
                    </div>
                  </div>

                  {/* Duration Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                      Durasi Waktu
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={durationVal}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setDurations((prev) => ({ ...prev, [section.key]: val }));
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white font-mono"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                        Menit
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end p-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-750 text-white font-hanken font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 border-0"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Simpan Pengaturan Tes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
