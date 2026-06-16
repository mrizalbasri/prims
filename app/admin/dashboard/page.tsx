"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
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

  // ── Questions Management State & Hooks ──
  type QuestionRow = {
    id: string;
    sectionType: string;
    difficulty: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
  };

  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [questionsSearch, setQuestionsSearch] = useState("");
  const [debouncedQuestionsSearch, setDebouncedQuestionsSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1);
  const [questionsTotalCount, setQuestionsTotalCount] = useState(0);

  // Form / Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  const [formSectionType, setFormSectionType] = useState("VOCABULARY");
  const [formDifficulty, setFormDifficulty] = useState("EASY");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("");
  const [formExplanation, setFormExplanation] = useState("");

  // Debounce questions search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuestionsSearch(questionsSearch);
      setQuestionsPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [questionsSearch]);

  // Fetch questions list
  useEffect(() => {
    if (activeTab !== "questions") return;

    async function fetchQuestions() {
      setIsQuestionsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(questionsPage),
          search: debouncedQuestionsSearch,
          sectionType: sectionFilter,
          limit: "10",
        });

        const res = await fetch(`/api/admin/questions?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions || []);
          setQuestionsTotalPages(data.pagination.totalPages || 1);
          setQuestionsTotalCount(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Fetch admin questions error:", err);
      } finally {
        setIsQuestionsLoading(false);
      }
    }
    void fetchQuestions();
  }, [questionsPage, debouncedQuestionsSearch, sectionFilter, activeTab]);

  // Delete question handler
  async function handleDeleteQuestion(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Soal berhasil dihapus!");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setQuestionsTotalCount((prev) => prev - 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menghapus soal.");
      }
    } catch (err) {
      console.error("Delete question error:", err);
      alert("Terjadi kesalahan sistem saat menghapus soal.");
    }
  }

  // Open add modal
  function handleOpenAddModal() {
    setEditingQuestion(null);
    setFormSectionType("VOCABULARY");
    setFormDifficulty("EASY");
    setFormQuestionText("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer("");
    setFormExplanation("");
    setIsQuestionModalOpen(true);
  }

  // Open edit modal
  function handleOpenEditModal(q: QuestionRow) {
    setEditingQuestion(q);
    setFormSectionType(q.sectionType);
    setFormDifficulty(q.difficulty);
    setFormQuestionText(q.questionText);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation || "");
    setIsQuestionModalOpen(true);
  }

  // Save/Update question submit handler
  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();

    if (!formQuestionText.trim()) {
      alert("Teks soal tidak boleh kosong.");
      return;
    }

    if (formOptions.some((opt) => !opt.trim())) {
      alert("Semua 4 pilihan jawaban harus diisi.");
      return;
    }

    if (!formCorrectAnswer.trim()) {
      alert("Silakan pilih kunci jawaban.");
      return;
    }

    const payload = {
      sectionType: formSectionType,
      difficulty: formDifficulty,
      questionText: formQuestionText,
      options: formOptions,
      correctAnswer: formCorrectAnswer,
      explanation: formExplanation || null,
    };

    try {
      let res;
      if (editingQuestion) {
        res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(editingQuestion ? "Soal berhasil diperbarui!" : "Soal baru berhasil ditambahkan!");
        setIsQuestionModalOpen(false);
        setQuestionsPage(1);
        
        // Refresh page 1 questions immediately
        if (questionsPage === 1) {
          const params = new URLSearchParams({
            page: "1",
            search: debouncedQuestionsSearch,
            sectionType: sectionFilter,
            limit: "10",
          });
          const refreshRes = await fetch(`/api/admin/questions?${params.toString()}`);
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setQuestions(data.questions || []);
            setQuestionsTotalPages(data.pagination.totalPages || 1);
            setQuestionsTotalCount(data.pagination.total || 0);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal menyimpan soal.");
      }
    } catch (err) {
      console.error("Save question error:", err);
      alert("Terjadi kesalahan sistem saat menyimpan soal.");
    }
  }

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
        {activeTab === "questions" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Kelola Bank Soal
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Tambahkan, ubah, atau hapus soal placement test untuk modul Vocabulary, Grammar, dan Reading.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span> Tambah Soal Baru
              </button>
            </header>

            {/* Questions Table Container */}
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Search & Filter Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
                <div className="flex-1 max-w-md relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                  <input
                    type="text"
                    value={questionsSearch}
                    onChange={(e) => setQuestionsSearch(e.target.value)}
                    placeholder="Cari teks soal..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 transition-colors"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Modul:</span>
                  <select
                    value={sectionFilter}
                    onChange={(e) => {
                      setSectionFilter(e.target.value);
                      setQuestionsPage(1);
                    }}
                    className="bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-745 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="ALL">Semua Modul</option>
                    <option value="VOCABULARY">Vocabulary</option>
                    <option value="GRAMMAR">Grammar</option>
                    <option value="READING">Reading</option>
                  </select>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                      <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Modul</th>
                      <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Tingkat</th>
                      <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 w-1/3">Teks Soal</th>
                      <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Opsi Jawaban</th>
                      <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800">Kunci</th>
                      <th className="text-gray-500 text-[10px] font-bold uppercase tracking-wider py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {isQuestionsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-6 px-6"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                          <td className="py-6 px-6"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                          <td className="py-6 px-6"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                          <td className="py-6 px-6"><div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                          <td className="py-6 px-6"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div></td>
                          <td className="py-6 px-6 text-right"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg ml-auto"></div></td>
                        </tr>
                      ))
                    ) : questions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs font-semibold text-gray-400">
                          Tidak ada soal ditemukan. Silakan tambahkan soal baru.
                        </td>
                      </tr>
                    ) : (
                      questions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10 transition-colors">
                          <td className="py-4 px-6 text-xs font-bold font-mono">
                            <span className={`px-2 py-0.5 rounded-md ${
                              q.sectionType === "VOCABULARY" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200/30" :
                              q.sectionType === "GRAMMAR" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200/30" :
                              "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30"
                            }`}>
                              {q.sectionType}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs font-semibold">
                            <span className={`px-2 py-0.5 rounded-md ${
                              q.difficulty === "EASY" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                              q.difficulty === "MEDIUM" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                              "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                            }`}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs font-medium text-gray-700 dark:text-gray-300 max-w-xs truncate" title={q.questionText}>
                            {q.questionText}
                          </td>
                          <td className="py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <div className="grid grid-cols-2 gap-1 text-[10px] w-48 font-mono">
                              {q.options.map((opt, index) => (
                                <div key={index} className="truncate" title={opt}>
                                  <span className="font-bold text-gray-400 mr-1">{String.fromCharCode(65 + index)}:</span>{opt}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs font-mono" title={q.correctAnswer}>
                            {q.correctAnswer}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(q)}
                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-2 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                                title="Edit Soal"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl transition-all border-0 bg-transparent cursor-pointer flex items-center"
                                title="Hapus Soal"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {!isQuestionsLoading && questionsTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-150 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-900/5">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Halaman {questionsPage} dari {questionsTotalPages} ({questionsTotalCount} Soal)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={questionsPage <= 1}
                      onClick={() => setQuestionsPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 text-xs font-semibold"
                    >
                      Sebelumnya
                    </button>
                    <button
                      disabled={questionsPage >= questionsTotalPages}
                      onClick={() => setQuestionsPage(prev => Math.min(questionsTotalPages, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 text-xs font-semibold"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL FOR ADD/EDIT QUESTION */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-850 rounded-3xl shadow-xl border border-gray-150 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleUp">
              <div className="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-hanken font-extrabold text-xl text-gray-900 dark:text-white">
                  {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
                </h3>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-transparent border-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Section Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Tipe Modul</label>
                    <select
                      value={formSectionType}
                      onChange={(e) => {
                        setFormSectionType(e.target.value);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="VOCABULARY">Vocabulary</option>
                      <option value="GRAMMAR">Grammar</option>
                      <option value="READING">Reading</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Tingkat Kesulitan</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Teks Soal / Pertanyaan
                  </label>
                  <textarea
                    required
                    value={formQuestionText}
                    onChange={(e) => setFormQuestionText(e.target.value)}
                    placeholder={formSectionType === "READING" ? 'Read the passage:\n"..."\n\nWhat is the main idea?' : "Masukkan pertanyaan..."}
                    rows={formSectionType === "READING" ? 8 : 4}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none font-inter"
                  />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Pilihan Jawaban (Multiple Choice)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase font-mono">{String.fromCharCode(65 + idx)}.</span>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formOptions];
                            newOpts[idx] = e.target.value;
                            setFormOptions(newOpts);
                            if (formCorrectAnswer === opt && opt !== "") {
                              setFormCorrectAnswer(e.target.value);
                            }
                          }}
                          placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Kunci Jawaban yang Benar</label>
                  <select
                    required
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Jawaban Benar --</option>
                    {formOptions.map((opt, idx) => (
                      <option key={idx} value={opt} disabled={!opt.trim()}>
                        {opt.trim() ? `${String.fromCharCode(65 + idx)}. ${opt}` : `Pilihan ${String.fromCharCode(65 + idx)} (kosong)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Penjelasan (Opsional)</label>
                  <textarea
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Jelaskan mengapa kunci jawaban tersebut benar..."
                    rows={2}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none font-inter"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer"
                  >
                    Simpan Soal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: VOCABULARY */}
        {activeTab === "vocabulary" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Bank Kosa Kata (Vocabulary)
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Kelola kartu kosa kata pintar (flashcards) dan kategori CEFR yang diakses mahasiswa.
                </p>
              </div>
            </header>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Total Kosa Kata", val: "240 Kata", color: "text-blue-600", icon: "book" },
                { label: "Kategori Populer", val: "Academic Wordlist", color: "text-purple-600", icon: "school" },
                { label: "Rata-rata Penguasaan", val: "84% Mahasiswa", color: "text-emerald-600", icon: "trending_up" }
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{item.label}</span>
                    <p className="font-hanken text-2xl font-extrabold text-gray-900 dark:text-white">{item.val}</p>
                  </div>
                  <span className={`material-symbols-outlined text-3xl ${item.color} bg-gray-50 dark:bg-gray-800 p-3 rounded-xl`}>{item.icon}</span>
                </div>
              ))}
            </div>

            {/* Mock Card list */}
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-base">Preview Kartu Kosa Kata</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                  Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { word: "Alleviate", pron: "/əˈliːvieɪt/", type: "Verb", meaning: "Meredakan, mengurangi rasa sakit atau kesulitan.", level: "C1", cat: "Academic" },
                  { word: "Pragmatic", pron: "/præɡˈmætɪk/", type: "Adjective", meaning: "Praktis, mengutamakan kegunaan daripada teori.", level: "B2", cat: "Oxford 3000" },
                  { word: "Synthesize", pron: "/ˈsɪnθəsaɪz/", type: "Verb", meaning: "Mensintesis, menggabungkan beberapa gagasan menjadi gagasan baru.", level: "C2", cat: "Academic" }
                ].map((card, i) => (
                  <div key={i} className="border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 dark:hover:border-blue-400/30 rounded-2xl p-5 space-y-3 bg-gray-50/30 dark:bg-gray-900/10 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-hanken text-lg font-black text-gray-950 dark:text-white">{card.word}</h4>
                        <span className="text-[10px] font-mono text-gray-400">{card.pron} • {card.type}</span>
                      </div>
                      <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-200/50">
                        {card.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{card.meaning}</p>
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
                      <span>Kategori: <strong>{card.cat}</strong></span>
                      <span className="flex items-center gap-1 text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Aktif</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WRITING */}
        {activeTab === "writing" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Topik Menulis (Writing Prompts)
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Kelola topik esai akademik, surat/email bisnis, dan rubrik penilaian otomatis berbasis AI.
                </p>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Total Topik Aktif", val: "12 Topik", color: "text-amber-600", icon: "edit_note" },
                { label: "Submisi Mahasiswa", val: "185 Esai", color: "text-purple-600", icon: "drafts" },
                { label: "Rata-rata Skor", val: "74.8 / 100", color: "text-emerald-600", icon: "grade" }
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{item.label}</span>
                    <p className="font-hanken text-2xl font-extrabold text-gray-900 dark:text-white">{item.val}</p>
                  </div>
                  <span className={`material-symbols-outlined text-3xl ${item.color} bg-gray-50 dark:bg-gray-800 p-3 rounded-xl`}>{item.icon}</span>
                </div>
              ))}
            </div>

            {/* List of prompts */}
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-base">Daftar Prompt Menulis</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                  <span className="material-symbols-outlined text-sm">add</span> Tambah Topik
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Internet and Children's Social Skills", type: "Essay (Academic)", limit: "250-300 kata", desc: "Discuss the positive and negative impact of internet access on children's face-to-face communication skills." },
                  { title: "Formal Inquiry Letter: Requesting a Refund", type: "Email Writing", limit: "100-150 kata", desc: "Write a formal email requesting a refund for a damaged product delivered by an e-commerce platform." }
                ].map((prompt, i) => (
                  <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-gray-50/30 dark:bg-gray-900/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-hanken font-bold text-gray-900 dark:text-white text-sm">{prompt.title}</h4>
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded border border-amber-200/50">
                          {prompt.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl">{prompt.desc}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs shrink-0 self-end md:self-center">
                      <span className="text-gray-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">straighten</span> {prompt.limit}</span>
                      <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline bg-transparent border-0 cursor-pointer">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPEAKING */}
        {activeTab === "speaking" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
                  <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
                    Skenario Bicara (Speaking)
                  </h1>
                </div>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  Kelola skenario latihan speaking, transkripsi real-time, dan parameter evaluasi kelancaran (fluency) AI.
                </p>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Total Skenario", val: "8 Skenario", color: "text-rose-600", icon: "mic" },
                { label: "Sesi Rekaman", val: "142 Sesi", color: "text-purple-600", icon: "audio_file" },
                { label: "Rata-rata Fluency", val: "78.2 / 100", color: "text-emerald-600", icon: "speech_to_text" }
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{item.label}</span>
                    <p className="font-hanken text-2xl font-extrabold text-gray-900 dark:text-white">{item.val}</p>
                  </div>
                  <span className={`material-symbols-outlined text-3xl ${item.color} bg-gray-50 dark:bg-gray-800 p-3 rounded-xl`}>{item.icon}</span>
                </div>
              ))}
            </div>

            {/* List of scenarios */}
            <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-hanken font-bold text-gray-900 dark:text-white text-base">Daftar Skenario Bicara</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                  <span className="material-symbols-outlined text-sm">add</span> Tambah Skenario
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Self Introduction & Goals", type: "Personal", time: "60 detik", situation: "Perkenalkan diri Anda secara formal di kelas akademik baru dan jelaskan tujuan pembelajaran bahasa Inggris Anda." },
                  { title: "University Campus Inquiry", type: "Academic", time: "90 detik", situation: "Lakukan simulasi menanyakan lokasi perpustakaan dan tata cara peminjaman buku kepada staf kampus." }
                ].map((sc, i) => (
                  <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-gray-50/30 dark:bg-gray-900/10 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-hanken font-bold text-gray-900 dark:text-white text-sm">{sc.title}</h4>
                        <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[8px] font-bold px-2 py-0.5 rounded border border-rose-200/50 shrink-0">
                          {sc.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sc.situation}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1 font-mono"><span className="material-symbols-outlined text-xs">timer</span> {sc.time}</span>
                      <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline bg-transparent border-0 cursor-pointer">Edit Skenario</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
