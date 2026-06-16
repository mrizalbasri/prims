"use client";

import { useState } from "react";
import Logo from "@/components/ui/Logo";

interface AdminMobileNavProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  onLogout: () => Promise<void>;
}

export default function AdminMobileNav({
  activeTab,
  onTabChange,
  onLogout,
}: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "analytics", label: "Analytics & Hasil Tes", icon: "analytics" },
    { id: "users", label: "Manajemen Pengguna", icon: "group" },
    { id: "vocabulary", label: "Kosa Kata (Vocab)", icon: "style" },
    { id: "writing", label: "Topik Menulis (Writing)", icon: "draw" },
    { id: "speaking", label: "Skenario Bicara (Speaking)", icon: "record_voice_over" },
    { id: "logs", label: "Log Aktivitas Sistem", icon: "receipt_long" },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-28" />
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-blue-200/50 dark:border-blue-900/20">Admin</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 dark:text-gray-300 hover:text-blue-600 transition-colors bg-transparent border-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">
            {isOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-6 py-4 space-y-2 sticky top-[71px] z-40 shadow-lg">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange?.(item.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all border-0 bg-transparent cursor-pointer ${
                activeTab === item.id 
                  ? "bg-blue-500 text-white font-bold" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-0 bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      )}
    </>
  );
}
