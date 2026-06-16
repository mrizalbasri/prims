"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import VocabularyTab from "@/components/admin/VocabularyTab";
import WritingTab from "@/components/admin/WritingTab";
import SpeakingTab from "@/components/admin/SpeakingTab";
import QuestionsTab from "@/components/admin/QuestionsTab";
import StatsGrid from "@/components/admin/StatsGrid";
import ResultsFilters from "@/components/admin/ResultsFilters";
import ResultsTable, { Row } from "@/components/admin/ResultsTable";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
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

  const [activeTab, setActiveTab] = useState("analytics");
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  // Auth guard — redirect to login if not authenticated as admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user?.role !== "ADMIN") {
          router.push("/login");
          return;
        }
        setAdminUser({
          name: data.user.fullName || "Admin PRISM",
          email: data.user.email || "admin@president.ac.id",
        });
      } catch {
        router.push("/login");
      } finally {
        setIsAuthChecking(false);
      }
    }
    void checkAuth();
  }, [router]);

  // Debounce search term to prevent rapid API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page to 1 when search term changes
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    // Only fetch data if we are looking at the analytics tab
    if (activeTab !== "analytics") return;

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
            advanced: {
              count: s.advanced,
              percent: s.total ? Math.round((s.advanced / s.total) * 100) : 0,
            },
            intermediate: {
              count: s.intermediate,
              percent: s.total ? Math.round((s.intermediate / s.total) * 100) : 0,
            },
            beginner: {
              count: s.beginner,
              percent: s.total ? Math.round((s.beginner / s.total) * 100) : 0,
            },
          });
        }
      } catch (err) {
        console.error("Fetch admin data error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchData();
  }, [page, cohortFilter, majorFilter, debouncedSearch, activeTab]);

  async function handleExport() {
    const params = new URLSearchParams({
      cohort: cohortFilter,
      major: majorFilter,
      search: debouncedSearch,
    });
    window.location.href = `/api/admin/export?${params.toString()}`;
  }

  async function handleLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/login";
    }
  }

  // ── User Management State & Hooks ──
  type UserRow = {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    hasModuleAccess: boolean;
    cohort: string | null;
    major: string | null;
    createdAt: string;
  };

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [debouncedUsersSearch, setDebouncedUsersSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // "", "STUDENT", "ADMIN"
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);

  // Update student account status / hasModuleAccess
  async function handleUpdateUser(userId: string, updateData: { status?: string; hasModuleAccess?: boolean }) {
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updateData }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updateData } : u))
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal memperbarui data pengguna.");
      }
    } catch (err) {
      console.error("Update user error:", err);
      alert("Terjadi kesalahan sistem saat memperbarui data pengguna.");
    }
  }

  async function handleResetUserTest(userId: string) {
    if (!confirm("Apakah Anda yakin ingin mereset ujian mahasiswa ini? Semua percobaan dan hasil ujian akan dihapus.")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, resetTest: true }),
      });
      if (res.ok) {
        alert("Berhasil mereset status ujian mahasiswa.");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, hasModuleAccess: false } : u))
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal mereset ujian.");
      }
    } catch (err) {
      console.error("Reset test error:", err);
      alert("Terjadi kesalahan sistem saat mereset ujian.");
    }
  }

  // Debounce users search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsersSearch(usersSearch);
      setUsersPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [usersSearch]);

  // Fetch registered users
  useEffect(() => {
    if (activeTab !== "users") return;

    async function fetchUsers() {
      setIsUsersLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(usersPage),
          search: debouncedUsersSearch,
          role: roleFilter,
          limit: "15",
        });

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
          setUsersTotalPages(data.pagination.totalPages || 1);
          setUsersTotalCount(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Fetch admin users error:", err);
      } finally {
        setIsUsersLoading(false);
      }
    }
    void fetchUsers();
  }, [usersPage, debouncedUsersSearch, roleFilter, activeTab]);

  // Show nothing while checking auth to prevent flash of content
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row font-inter">
      {/* ── Mobile Responsive Navbar ── */}
      <AdminMobileNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* ── Desktop Sidebar Component ── */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        adminName={adminUser?.name}
        adminEmail={adminUser?.email}
      />

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-10 space-y-10">
        {/* TAB 1: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-10 animate-fadeIn">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Admin Analytics
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Pantau performa rata-rata dan hasil evaluasi tes penempatan (Placement Test) seluruh
                  mahasiswa baru.
                </p>
              </div>

              <button
                onClick={() => void handleExport()}
                className="bg-blue-650 hover:bg-blue-750 text-white font-hanken font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer self-start md:self-center border-0 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export CSV Data
              </button>
            </header>

            {/* Stats Grid Component */}
            <StatsGrid stats={stats} />

            {/* Results Table & Filter Section */}
            <div className="space-y-6">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-base">
                  Daftar Hasil Tes Mahasiswa
                </h3>

                <ResultsFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  cohortFilter={cohortFilter}
                  onCohortFilterChange={(val) => {
                    setCohortFilter(val);
                    setPage(1);
                  }}
                  majorFilter={majorFilter}
                  onMajorFilterChange={(val) => {
                    setMajorFilter(val);
                    setPage(1);
                  }}
                  availableCohorts={availableCohorts}
                  availableMajors={availableMajors}
                />
              </div>

              <ResultsTable
                rows={rows}
                isLoading={isLoading}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}

        {/* TAB 1.5: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-10 animate-fadeIn">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Manajemen Pengguna
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Kelola status akun mahasiswa dan kunci/buka hak akses modul belajar mandiri.
                </p>
              </div>
            </header>

            {/* Users list container */}
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Filter bar */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-base">
                  Daftar Mahasiswa Terdaftar
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Search input */}
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Cari nama atau email mahasiswa..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 text-xs font-inter transition-all bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800">
                      <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                        Mahasiswa
                      </th>
                      <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                        Akses Belajar
                      </th>
                      <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                        Detail Akademik
                      </th>
                      <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                        Status Akun
                      </th>
                      <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                        Tanggal Terdaftar
                      </th>
                      <th className="px-6 py-4 font-hanken font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {isUsersLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-500 italic text-sm"
                        >
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span>Memuat data pengguna...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-500 italic text-sm"
                        >
                          Tidak ada mahasiswa terdaftar yang cocok dengan pencarian Anda.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group"
                        >
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                              {u.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-hanken font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {u.fullName}
                              </p>
                              <p className="font-inter text-xs text-gray-400">
                                {u.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.hasModuleAccess
                                  ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/50"
                                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50"
                              }`}
                            >
                              {u.hasModuleAccess ? "Terbuka" : "Terkunci"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-inter text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Cohort {u.cohort || "-"}
                              </p>
                              <p className="font-inter text-xs text-gray-400">
                                {u.major || "-"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  u.status === "ACTIVE"
                                    ? "bg-emerald-500 animate-pulse"
                                    : u.status === "SUSPENDED"
                                    ? "bg-red-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                {u.status.toLowerCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-inter text-xs text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateUser(u.id, { hasModuleAccess: !u.hasModuleAccess })}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                                  u.hasModuleAccess
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    {u.hasModuleAccess ? "lock" : "lock_open"}
                                  </span>
                                  {u.hasModuleAccess ? "Kunci Modul" : "Buka Modul"}
                                </span>
                              </button>
                              <button
                                onClick={() => handleUpdateUser(u.id, { status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                                  u.status === "ACTIVE"
                                    ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                    : "bg-gray-50 hover:bg-gray-100 text-gray-650 border-gray-200"
                                }`}
                              >
                                {u.status === "ACTIVE" ? "Suspend" : "Aktifkan"}
                              </button>
                              <button
                                onClick={() => handleResetUserTest(u.id)}
                                className="px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                              >
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    restart_alt
                                  </span>
                                  Reset Ujian
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!isUsersLoading && usersTotalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-inter text-xs">
                  <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    Menampilkan{" "}
                    <span className="font-bold text-gray-800 dark:text-white font-mono">
                      {users.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-bold text-gray-800 dark:text-white font-mono">
                      {usersTotalCount}
                    </span>{" "}
                    pengguna
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={usersPage <= 1}
                      onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                    >
                      Sebelumnya
                    </button>

                    <span className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                      Halaman <span className="font-bold text-gray-800 dark:text-white">{usersPage}</span>{" "}
                      dari <span className="font-bold text-gray-800 dark:text-white">{usersTotalPages}</span>
                    </span>

                    <button
                      disabled={usersPage >= usersTotalPages}
                      onClick={() => setUsersPage(Math.min(usersTotalPages, usersPage + 1))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1.5: QUESTIONS MANAGEMENT */}
        {activeTab === "questions" && <QuestionsTab />}

        {/* TAB 2: VOCABULARY */}
        {activeTab === "vocabulary" && <VocabularyTab />}

        {/* TAB 3: WRITING */}
        {activeTab === "writing" && <WritingTab />}

        {/* TAB 4: SPEAKING */}
        {activeTab === "speaking" && <SpeakingTab />}

        {/* TAB 5: LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Log Aktivitas Sistem
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Pantau alur autentikasi, status evaluasi AI, dan kesehatan database secara real-time.
                </p>
              </div>
            </header>

            {/* Logs Viewer */}
            <div className="bg-gray-950 rounded-3xl border border-gray-850 shadow-xl overflow-hidden font-mono text-xs">
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-850 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-gray-400 font-bold">
                    System Status: <span className="text-emerald-400">ONLINE</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <span className="cursor-pointer hover:text-white transition-colors">Clear Console</span>
                  <span>|</span>
                  <span>v2.0.1</span>
                </div>
              </div>
              <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto text-gray-300">
                {[
                  { time: "23:20:14", type: "INFO", msg: "PrismaClient connected to PostgreSQL pool at localhost:5433" },
                  { time: "23:20:18", type: "AUTH", msg: "Admin session generated successfully for user admin@president.ac.id" },
                  { time: "23:22:45", type: "SCORING", msg: "Evaluation process completed for testAttemptId 'vocab_grammar_reading_0' with overallLevel: ADVANCED" },
                  { time: "23:23:01", type: "API", msg: "POST /api/test/submit - status 200 OK - execution time 2410ms" },
                  { time: "23:24:15", type: "DB", msg: "Successfully ran db seed for Phase 2 data (Vocabulary, Writing Prompts, Speaking Scenarios)" },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 hover:bg-gray-900/50 py-1 px-2 rounded transition-colors"
                  >
                    <span className="text-gray-600 shrink-0">{log.time}</span>
                    <span
                      className={`font-bold shrink-0 ${
                        log.type === "INFO"
                          ? "text-blue-400"
                          : log.type === "AUTH"
                          ? "text-purple-400"
                          : log.type === "SCORING"
                          ? "text-emerald-400"
                          : log.type === "DB"
                          ? "text-amber-400"
                          : "text-gray-400"
                      }`}
                    >
                      [{log.type}]
                    </span>
                    <span className="text-gray-400 break-all">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

