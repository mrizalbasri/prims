"use client";

import Logo from "@/components/ui/Logo";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  onLogout: () => Promise<void>;
  adminName?: string;
  adminEmail?: string;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
  adminName = "Admin PRISM",
  adminEmail = "admin@president.ac.id",
}: AdminSidebarProps) {
  const testItems = [
    { id: "analytics", label: "Analytics & Hasil Tes", icon: "analytics" },
    { id: "questions", label: "Bank Soal Placement Test", icon: "quiz" },
  ];

  const studyItems = [
    { id: "vocabulary", label: "Kosa Kata (Vocab)", icon: "style" },
    { id: "writing", label: "Topik Menulis (Writing)", icon: "draw" },
    { id: "speaking", label: "Skenario Bicara (Speaking)", icon: "record_voice_over" },
  ];

  const systemItems = [
    { id: "users", label: "Manajemen Pengguna", icon: "group" },
    { id: "logs", label: "Log Aktivitas Sistem", icon: "receipt_long" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-150 dark:border-gray-800 h-screen sticky top-0 flex-shrink-0 z-30 justify-between">
      <div className="p-6 space-y-6 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Logo className="h-10 w-32" />
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border border-blue-200/50 dark:border-blue-900/20">Admin</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          {/* Section 1: Placement Test */}
          <div className="space-y-1">
            <div className="px-4 mb-2">
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Placement Test</span>
              <div className="h-0.5 w-6 bg-blue-500 dark:bg-blue-400 rounded mt-1"></div>
            </div>
            {testItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between transition-all border-0 cursor-pointer ${
                    isActive 
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-b border-gray-150 dark:border-gray-800 mx-2"></div>

          {/* Section 2: Belajar Mandiri */}
          <div className="space-y-1">
            <div className="px-4 mb-2">
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Belajar Mandiri</span>
              <div className="h-0.5 w-6 bg-emerald-500 dark:bg-emerald-400 rounded mt-1"></div>
            </div>
            {studyItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between transition-all border-0 cursor-pointer ${
                    isActive 
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-b border-gray-150 dark:border-gray-800 mx-2"></div>

          {/* Section 3: Pengaturan */}
          <div className="space-y-1">
            <div className="px-4 mb-2">
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Pengaturan</span>
              <div className="h-0.5 w-6 bg-gray-400 dark:bg-gray-600 rounded mt-1"></div>
            </div>
            {systemItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between transition-all border-0 cursor-pointer ${
                    isActive 
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-150 dark:border-gray-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-hanken font-bold flex items-center justify-center text-sm shadow-inner shadow-black/10">
            {adminName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{adminName}</p>
            <p className="text-[10px] text-gray-400 truncate">{adminEmail}</p>
          </div>
        </div>

        <button 
          onClick={onLogout} 
          className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-0 bg-transparent cursor-pointer flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
}
