import React from 'react';

interface TokenFormProps {
  tokenInput: string;
  setTokenInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isVerifying: boolean;
  tokenError: string | null;
}

export function TokenForm({ tokenInput, setTokenInput, onSubmit, isVerifying, tokenError }: TokenFormProps) {
  return (
    <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 md:p-8 space-y-4 max-w-xl animate-fadeIn">
      <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-500">lock</span>
        Aktifkan Modul Belajar Mandiri
      </h3>
      <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        Anda telah menyelesaikan Placement Test. Untuk mulai mengakses modul latihan mandiri (*Vocabulary, Writing, Speaking*), silakan masukkan **Token Akses** yang diberikan oleh Dosen Anda.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
        <input
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Masukkan Token (e.g. DOSEN-PRISM-2026)"
          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 placeholder-gray-400 transition-colors uppercase text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={isVerifying}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer border-0 shrink-0"
        >
          {isVerifying ? "Memverifikasi..." : "Aktifkan Modul"}
        </button>
      </form>
      {tokenError && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 pt-1 animate-fadeIn">
          <span className="material-symbols-outlined text-sm">error</span>
          {tokenError}
        </p>
      )}
    </div>
  );
}
