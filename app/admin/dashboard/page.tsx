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
import UsersTab from "@/components/admin/UsersTab";
import LogsTab from "@/components/admin/LogsTab";
import SettingsTab from "@/components/admin/SettingsTab";

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
        {activeTab === "users" && <UsersTab />}

        {/* TAB 1.5: QUESTIONS MANAGEMENT (SPLIT) */}
        {activeTab === "questions-vocab" && <QuestionsTab fixedSection="VOCABULARY" />}
        {activeTab === "questions-grammar" && <QuestionsTab fixedSection="GRAMMAR" />}
        {activeTab === "questions-listening" && <QuestionsTab fixedSection="LISTENING" />}
        {activeTab === "questions-reading" && <QuestionsTab fixedSection="READING" />}

        {/* TAB 2: VOCABULARY */}
        {activeTab === "vocabulary" && <VocabularyTab />}

        {/* TAB 3: WRITING */}
        {activeTab === "writing" && <WritingTab />}

        {/* TAB 4: SPEAKING */}
        {activeTab === "speaking" && <SpeakingTab />}

        {/* TAB 4.5: SETTINGS */}
        {activeTab === "settings" && <SettingsTab />}

        {/* TAB 5: LOGS */}
        {activeTab === "logs" && <LogsTab />}
      </main>
    </div>
  );
}

