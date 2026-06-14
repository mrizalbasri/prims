"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";

type Row = {
  testAttemptId: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    cohort: string;
    major: string;
  };
  scores: {
    vocabulary: number;
    grammar: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  } | null;
  level: string | null;
  completedAt: string;
};

export default function AdminDashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Filters and Pagination State
  const [cohortFilter, setCohortFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [availableCohorts, setAvailableCohorts] = useState<string[]>([]);
  const [availableMajors, setAvailableMajors] = useState<string[]>([]);
  
  const [stats, setStats] = useState({
    total: 0,
    advanced: { count: 0, percent: 0 },
    intermediate: { count: 0, percent: 0 },
    beginner: { count: 0, percent: 0 },
  });

  // Debounce search term to prevent rapid API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page to 1 when search term changes
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          cohort: cohortFilter,
          major: majorFilter,
          search: debouncedSearch,
          limit: "15", // items per page
        });

        const res = await fetch(`/api/admin/results?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRows(data.results || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
          setAvailableCohorts(data.filters.cohorts || []);
          setAvailableMajors(data.filters.majors || []);
          
          const s = data.stats || { total: 0, advanced: 0, intermediate: 0, beginner: 0 };
          setStats({
            total: s.total,
            advanced: { count: s.advanced, percent: s.total ? Math.round((s.advanced / s.total) * 100) : 0 },
            intermediate: { count: s.intermediate, percent: s.total ? Math.round((s.intermediate / s.total) * 100) : 0 },
            beginner: { count: s.beginner, percent: s.total ? Math.round((s.beginner / s.total) * 100) : 0 },
          });
        }
      } catch (err) {
        console.error("Fetch admin data error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchData();
  }, [page, cohortFilter, majorFilter, debouncedSearch]);

  async function handleExport() {
    const params = new URLSearchParams({
      cohort: cohortFilter,
      major: majorFilter,
    });
    window.location.href = `/api/admin/export?${params.toString()}`;
  }

  async function handleLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/login";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-inter">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-36" />
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-450 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-blue-200/50 dark:border-blue-900/20">Admin Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => void handleLogout()} 
              className="text-gray-500 hover:text-red-600 transition-colors font-semibold flex items-center gap-2 cursor-pointer border-0 bg-transparent"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline text-sm">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-36" />
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">Admin Analytics</h1>
            </div>
            <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
              Pantau performa rata-rata dan hasil evaluasi tes penempatan (Placement Test) seluruh mahasiswa baru.
            </p>
          </div>
          
          <button 
            onClick={() => void handleExport()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-hanken font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer self-start md:self-center border-0"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV Data
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Total Mahasiswa</span>
            <p className="font-hanken text-4xl font-black text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          {[
            { label: "Advanced Level", ...stats.advanced, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10 border-green-200/50" },
            { label: "Intermediate Level", ...stats.intermediate, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200/50" },
            { label: "Beginner Level", ...stats.beginner, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10 border-red-200/50" }
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{s.label}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${s.bg} ${s.color}`}>{s.percent}%</span>
              </div>
              <p className={`font-hanken text-4xl font-black ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Results Table Section */}
        <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-base">Daftar Hasil Tes Mahasiswa</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Cari nama atau email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 text-xs font-inter transition-all bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Cohort select dropdown */}
              <select
                value={cohortFilter}
                onChange={(e) => { setCohortFilter(e.target.value); setPage(1); }}
                className="w-full sm:w-40 px-3 py-2.5 text-xs font-inter rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Semua Angkatan</option>
                {availableCohorts.map((c) => (
                  <option key={c} value={c}>Cohort {c}</option>
                ))}
              </select>

              {/* Major select dropdown */}
              <select
                value={majorFilter}
                onChange={(e) => { setMajorFilter(e.target.value); setPage(1); }}
                className="w-full sm:w-48 px-3 py-2.5 text-xs font-inter rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Semua Jurusan</option>
                {availableMajors.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Mahasiswa</th>
                  <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Angkatan / Jurusan</th>
                  <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Skor Akhir</th>
                  <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Level Evaluasi</th>
                  <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Tanggal Ujian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-500 italic text-sm">
                      Memuat data hasil tes penempatan...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-500 italic text-sm">
                      Tidak ada data pengerjaan yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.testAttemptId} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-hanken font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{row.student.fullName}</p>
                        <p className="font-inter text-xs text-gray-400">{row.student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-inter text-xs font-semibold text-gray-700 dark:text-gray-300">Cohort {row.student.cohort}</p>
                        <p className="font-inter text-xs text-gray-400">{row.student.major}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-800/10">
                        {row.scores?.total !== undefined ? Math.round(row.scores.total) : "0"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        row.level === "ADVANCED" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" :
                        row.level === "INTERMEDIATE" ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                        "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {row.level || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-inter text-xs text-gray-400">
                        {row.completedAt ? new Date(row.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-inter text-xs">
              <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
                Menampilkan <span className="font-bold text-gray-800 dark:text-white">{rows.length}</span> dari <span className="font-bold text-gray-800 dark:text-white">{totalCount}</span> mahasiswa
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  Sebelumnya
                </button>
                
                <span className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                  Halaman <span className="font-bold text-gray-800 dark:text-white">{page}</span> dari <span className="font-bold text-gray-800 dark:text-white">{totalPages}</span>
                </span>
                
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
