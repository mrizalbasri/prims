"use client";

import React from "react";

export type Row = {
  testAttemptId: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    cohort: string;
    major: string;
  };
  status: string;
  scores: {
    vocabulary: number;
    grammar: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  } | null;
  level: string | null;
  completedAt: string | null;
};

interface ResultsTableProps {
  rows: Row[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export default function ResultsTable({
  rows,
  isLoading,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: ResultsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800">
              <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                Mahasiswa
              </th>
              <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                Angkatan / Jurusan
              </th>
              <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                Skor Akhir
              </th>
              <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                Level Evaluasi
              </th>
              <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                Tanggal Ujian
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-500 italic text-sm"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Memuat data hasil tes penempatan...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-500 italic text-sm"
                >
                  Tidak ada data pengerjaan yang cocok dengan kriteria filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.testAttemptId}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-hanken font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {row.student.fullName}
                      </p>
                      <p className="font-inter text-xs text-gray-400">
                        {row.student.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-inter text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Cohort {row.student.cohort}
                      </p>
                      <p className="font-inter text-xs text-gray-400">
                        {row.student.major}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.status === "SELESAI" && row.scores?.total !== undefined ? (
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-800/10 font-mono">
                        {Math.round(row.scores.total)}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500 pl-4">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {row.status === "BELUM_MULAI" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Belum Mulai
                      </span>
                    )}
                    {row.status === "SEDANG_MENGERJAKAN" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                        Mengerjakan
                      </span>
                    )}
                    {row.status === "GAGAL" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                        Gagal
                      </span>
                    )}
                    {row.status === "SELESAI" && (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.level === "ADVANCED"
                            ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                            : row.level === "INTERMEDIATE"
                            ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {row.level || "UNKNOWN"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-inter text-xs text-gray-400">
                      {row.completedAt
                        ? new Date(row.completedAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" }
                          )
                        : "-"}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-inter text-xs">
          <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Menampilkan{" "}
            <span className="font-bold text-gray-800 dark:text-white font-mono">
              {rows.length}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-gray-800 dark:text-white font-mono">
              {totalCount}
            </span>{" "}
            mahasiswa
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
            >
              Sebelumnya
            </button>

            <span className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
              Halaman{" "}
              <span className="font-bold text-gray-800 dark:text-white">
                {page}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-800 dark:text-white">
                {totalPages}
              </span>
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
