"use client";

import { useEffect, useState } from "react";

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

export default function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [debouncedUsersSearch, setDebouncedUsersSearch] = useState("");
  const [roleFilter] = useState(""); // "", "STUDENT", "ADMIN"
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);

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
  }, [usersPage, debouncedUsersSearch, roleFilter]);

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

  return (
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
                    className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-550 italic text-sm"
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
                    className="px-6 py-20 text-center font-inter text-gray-400 dark:text-gray-550 italic text-sm"
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
                              : "bg-gray-50 hover:bg-gray-100 text-gray-655 border-gray-250"
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
  );
}
