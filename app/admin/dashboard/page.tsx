"use client";
export const dynamic = 'force-dynamic';


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Row = {
  id: string;
  totalScore: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  computedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    cohort: string;
    major: string;
  };
};

export default function AdminDashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/admin/results");
      if (res.ok) {
        const data = await res.json();
        setRows(data.results);
      }
      setIsLoading(false);
    }
    void fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const beginner = rows.filter((r) => r.level === "Beginner").length;
    const intermediate = rows.filter((r) => r.level === "Intermediate").length;
    const advanced = rows.filter((r) => r.level === "Advanced").length;

    return {
      total,
      beginner: { count: beginner, percent: total ? Math.round((beginner / total) * 100) : 0 },
      intermediate: { count: intermediate, percent: total ? Math.round((intermediate / total) * 100) : 0 },
      advanced: { count: advanced, percent: total ? Math.round((advanced / total) * 100) : 0 },
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(row => 
      row.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.user.cohort.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  async function handleExport() {
    window.location.href = "/api/admin/export";
  }

  async function handleLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/login";
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-outline-variant px-margin-mobile md:px-gutter py-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-hanken text-2xl font-bold text-primary tracking-tight">PRISM</span>
            <span className="bg-primary/5 text-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-primary/10">Admin Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => void handleLogout()} className="text-on-surface-variant hover:text-primary transition-colors">
               <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-container-max mx-auto w-full px-margin-mobile md:px-gutter py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2"><Image src="/logo.webp" alt="Logo" width={40} height={40} /><h1 className="font-hanken text-3xl font-bold text-primary">Analytics Overview</h1></div>
            <p className="font-inter text-on-surface-variant">Pantau performa dan hasil tes penempatan mahasiswa secara real-time.</p>
          </div>
          <button 
            onClick={() => void handleExport()}
            className="bg-secondary text-on-secondary font-hanken font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Mahasiswa</p>
            <p className="font-hanken text-4xl font-bold text-primary">{stats.total}</p>
          </div>
          {[
            { label: "Advanced", ...stats.advanced, color: "text-status-advanced", bg: "bg-status-advanced/10" },
            { label: "Intermediate", ...stats.intermediate, color: "text-status-intermediate", bg: "bg-status-intermediate/10" },
            { label: "Beginner", ...stats.beginner, color: "text-status-beginner", bg: "bg-status-beginner/10" }
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.bg} ${s.color}`}>{s.percent}%</span>
              </div>
              <p className={`font-hanken text-4xl font-bold ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Results Table Section */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex flex-col md:row items-center justify-between gap-4">
            <h3 className="font-hanken font-bold text-primary text-lg">Daftar Hasil Tes</h3>
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input 
                type="text" 
                placeholder="Cari nama, email, atau angkatan..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant focus:border-secondary focus:ring-0 text-sm font-inter transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-hanken font-bold text-primary text-xs uppercase tracking-wider">Mahasiswa</th>
                  <th className="px-6 py-4 font-hanken font-bold text-primary text-xs uppercase tracking-wider">Angkatan / Jurusan</th>
                  <th className="px-6 py-4 font-hanken font-bold text-primary text-xs uppercase tracking-wider">Skor</th>
                  <th className="px-6 py-4 font-hanken font-bold text-primary text-xs uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 font-hanken font-bold text-primary text-xs uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center font-inter text-on-surface-variant italic">Memuat data hasil tes...</td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center font-inter text-on-surface-variant italic">Tidak ada data ditemukan.</td>
                  </tr>
                ) : filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-hanken font-bold text-primary group-hover:text-secondary transition-colors">{row.user.fullName}</p>
                        <p className="font-inter text-xs text-on-surface-variant">{row.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-inter text-sm font-semibold text-primary">{row.user.cohort}</p>
                        <p className="font-inter text-xs text-on-surface-variant">{row.user.major}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-jetbrains font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                        {row.totalScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        row.level === "Advanced" ? "bg-status-advanced/10 text-status-advanced" :
                        row.level === "Intermediate" ? "bg-status-intermediate/10 text-status-intermediate" :
                        "bg-status-beginner/10 text-status-beginner"
                      }`}>
                        {row.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-inter text-xs text-on-surface-variant">
                        {new Date(row.computedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
