"use client";

import { useState } from "react";

type Correction = {
  original: string;
  corrected: string;
  explanation: string;
  type: "grammar" | "tense" | "article" | "preposition" | "other";
};

type Sample = {
  text: string;
  correctedText: string;
  score: number;
  corrections: Correction[];
};

const SAMPLES: Record<string, Sample> = {
  "I has went to library yesterday for read book.": {
    text: "I has went to library yesterday for read book.",
    correctedText: "I went to the library yesterday to read a book.",
    score: 65,
    corrections: [
      {
        original: "has went",
        corrected: "went",
        explanation: "Gunakan simple past tense ('went') karena ada penanda waktu spesifik di masa lalu ('yesterday'). Selain itu, 'has went' secara tata bahasa tidak tepat (seharusnya 'has gone' jika present perfect).",
        type: "tense",
      },
      {
        original: "to library",
        corrected: "to the library",
        explanation: "Tambahkan kata sandang 'the' sebelum kata benda spesifik 'library' yang dapat dihitung (countable singular noun).",
        type: "article",
      },
      {
        original: "for read book",
        corrected: "to read a book",
        explanation: "Gunakan to-infinitive ('to read') untuk menyatakan tujuan aktivitas, dan tambahkan artikel 'a' sebelum kata benda tunggal 'book'.",
        type: "preposition",
      },
    ],
  },
  "He do not like apple because it are sour.": {
    text: "He do not like apple because it are sour.",
    correctedText: "He does not like apples because they are sour.",
    score: 70,
    corrections: [
      {
        original: "do not",
        corrected: "does not",
        explanation: "Gunakan kata kerja bantu 'does' untuk subjek orang ketiga tunggal (He/She/It).",
        type: "grammar",
      },
      {
        original: "like apple",
        corrected: "like apples",
        explanation: "Gunakan bentuk jamak 'apples' atau tambahkan artikel seperti 'an apple' jika merujuk buah secara umum.",
        type: "article",
      },
      {
        original: "it are",
        corrected: "they are",
        explanation: "Karena merujuk pada buah-buah apel (jamak) dari frasa sebelumnya, subjek harus diganti 'they' untuk berpasangan dengan to-be jamak 'are'. Jika merujuk tunggal, seharusnya 'it is'.",
        type: "grammar",
      },
    ],
  },
  "She is more taller than her sister.": {
    text: "She is more taller than her sister.",
    correctedText: "She is taller than her sister.",
    score: 85,
    corrections: [
      {
        original: "more taller",
        corrected: "taller",
        explanation: "Kata sifat bersuku kata satu seperti 'tall' mendapat akhiran '-er' (taller) untuk menyatakan komparatif. Menambahkan kata 'more' di depannya adalah pemubaziran kata (double comparative).",
        type: "grammar",
      },
    ],
  },
};

export default function InteractiveDemo() {
  const [inputText, setInputText] = useState("");
  const [currentResult, setCurrentResult] = useState<Sample | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    setCurrentResult(null);
  };

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setCurrentResult(null);

    // Simulate AI response delay
    setTimeout(() => {
      const trimmed = inputText.trim();
      const matched = SAMPLES[trimmed];

      if (matched) {
        setCurrentResult(matched);
      } else {
        // Fallback for custom texts
        setCurrentResult({
          text: trimmed,
          correctedText: trimmed,
          score: 95,
          corrections: [
            {
              original: trimmed,
              corrected: trimmed,
              explanation: "Kalimat Anda sudah sangat baik! AI tidak mendeteksi kesalahan tata bahasa yang signifikan.",
              type: "other",
            },
          ],
        });
      }
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden text-left">
      {/* Dynamic Keyframes injected into the page securely */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, transparent, #ea580c, transparent);
          box-shadow: 0 0 8px #ea580c;
          animation: scan 2s ease-in-out infinite;
        }
      `}} />

      <div className="bg-gradient-to-r from-orange-500/10 to-blue-600/5 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-600">psychology</span>
          <span className="font-hanken font-bold text-gray-900 text-sm">AI Writing Checker Demo</span>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <label className="block font-hanken font-bold text-gray-700 text-sm mb-2">
            Ketik kalimat Bahasa Inggris Anda:
          </label>
          <div className="relative rounded-xl overflow-hidden">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Contoh: She are study English..."
              disabled={isAnalyzing}
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-gray-50 text-gray-900 font-inter resize-none h-28 text-sm transition-all"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-gray-50/70 backdrop-blur-[1px] flex items-center justify-center">
                <div className="scanner-line"></div>
                <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-orange-100">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-hanken text-xs font-bold text-orange-700 uppercase tracking-wider">AI Menganalisis...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Atau klik contoh di bawah:
          </span>
          <div className="flex flex-col gap-2">
            {Object.keys(SAMPLES).map((sampleText, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isAnalyzing}
                onClick={() => handleSelectSample(sampleText)}
                className="text-left p-3 rounded-xl border border-gray-150 hover:bg-orange-50/50 hover:border-orange-200 text-xs font-inter text-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &quot;{sampleText}&quot;
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-hanken text-sm font-bold px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/10 transition-all active:translate-y-0 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">spellcheck</span>
            Koreksi dengan AI
          </button>
        </div>

        {/* Results display */}
        {currentResult && (
          <div className="pt-6 border-t border-gray-100 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-hanken font-bold text-gray-900 text-sm">
                Analisis Koreksi AI:
              </span>
              <div className="flex items-center gap-2 bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-100">
                <span className="text-[10px] uppercase font-inter font-bold text-orange-600">Writing Score</span>
                <span className="h-4 w-px bg-orange-200"></span>
                <span className="text-sm font-hanken font-extrabold text-orange-700">
                  {currentResult.score}/100
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-150 space-y-3.5">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Kalimat Asli:</span>
                <p className="text-sm font-inter text-red-600 line-through">
                  &quot;{currentResult.text}&quot;
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Koreksi AI:</span>
                <p className="text-sm font-inter text-green-600 font-bold">
                  &quot;{currentResult.correctedText}&quot;
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Detail Penjelasan Kesalahan:
              </span>
              <div className="space-y-3">
                {currentResult.corrections.map((corr, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-gray-150 bg-white hover:border-gray-300 transition-colors space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-inter text-red-500 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-100 font-medium">
                        {corr.original}
                      </span>
                      <span className="material-symbols-outlined text-xs text-gray-400">arrow_forward</span>
                      <span className="text-xs font-inter text-green-600 bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-100 font-bold">
                        {corr.corrected}
                      </span>
                      <span className={`ml-auto text-[9px] font-hanken font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        corr.type === "tense" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        corr.type === "article" ? "bg-purple-50 text-purple-600 border-purple-100" :
                        corr.type === "preposition" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-teal-50 text-teal-600 border-teal-100"
                      }`}>
                        {corr.type}
                      </span>
                    </div>
                    <p className="text-xs font-inter text-gray-600 leading-relaxed">
                      {corr.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
