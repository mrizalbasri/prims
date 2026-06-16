"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "Apakah Placement Test ini wajib bagi seluruh mahasiswa baru?",
    answer: "Ya, tes penempatan (Placement Test) ini bersifat wajib untuk mengukur tingkat kemampuan bahasa Inggris awal Anda sebagai mahasiswa baru. Data hasil tes ini akan digunakan kampus untuk menentukan kelas remedial atau penyesuaian kurikulum akademik bahasa Inggris.",
  },
  {
    question: "Berapa lama durasi pengerjaan tes dan bagaimana format soalnya?",
    answer: "Tes penempatan berlangsung sekitar 45 menit dan mencakup 5 sub-tes: Vocabulary (pilihan ganda), Grammar (pilihan ganda), Reading (pemahaman paragraf), Writing (menulis esai pendek dinilai AI), dan Speaking (melafalkan kalimat lisan dinilai AI).",
  },
  {
    question: "Apakah saya bisa menjeda atau mengulang tes di tengah jalan?",
    answer: "Tidak. Tes penempatan memiliki waktu berjalan mundur secara otomatis per sub-seksi. Jika waktu habis, jawaban Anda akan tersimpan otomatis dan sistem langsung berpindah ke sub-seksi berikutnya. Tes tidak dapat diulang setelah dikirim.",
  },
  {
    question: "Bagaimana cara mengakses modul pembelajaran mandiri PRISM?",
    answer: "Setelah menyelesaikan Placement Test, level dan laporan performa Anda akan langsung keluar. Anda dapat mengakses materi belajar (Vocabulary, Writing, Speaking) di Dashboard Siswa dengan memasukkan kode/token akses yang diberikan oleh Dosen kelas Anda.",
  },
  {
    question: "Apakah platform ini gratis untuk digunakan?",
    answer: "Ya, PRISM sepenuhnya gratis untuk digunakan oleh civitas akademika President University Pekanbaru sebagai bagian dari program pilot project pengembangan kompetensi bahasa Inggris.",
  },
];

export default function FaqAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {FAQS.map((faq, idx) => {
        const isOpen = activeIndex === idx;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full text-left p-5 flex items-center justify-between gap-4 font-hanken font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
            >
              <span>{faq.question}</span>
              <span className={`material-symbols-outlined text-gray-400 transform transition-transform duration-300 ${
                isOpen ? "rotate-180 text-blue-600" : ""
              }`}>
                expand_more
              </span>
            </button>
            
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-60 opacity-100 border-t border-gray-100 dark:border-gray-700" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 font-inter text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-900/10">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
