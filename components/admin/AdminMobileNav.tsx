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
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-6 py-4 space-y-3 sticky top-[71px] z-40 shadow-lg max-h-[80vh] overflow-y-auto">
          {/* Placement Test */}
          <div className="space-y-1">
            <div className="px-4 mb-1">
              <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Placement Test</span>
              <div className="h-0.5 w-5 bg-blue-500 dark:bg-blue-400 rounded mt-0.5"></div>
            </div>
            {testItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange?.(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-xl flex items-center justify-between transition-all border-0 bg-transparent cursor-pointer ${
                  activeTab === item.id 
                    ? "bg-blue-500 text-white font-bold" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="border-b border-gray-150 dark:border-gray-800 mx-2"></div>

          {/* Belajar Mandiri */}
          <div className="space-y-1">
            <div className="px-4 mb-1">
              <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Belajar Mandiri</span>
              <div className="h-0.5 w-5 bg-emerald-500 dark:bg-emerald-400 rounded mt-0.5"></div>
            </div>
            {studyItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange?.(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-xl flex items-center justify-between transition-all border-0 bg-transparent cursor-pointer ${
                  activeTab === item.id 
                    ? "bg-blue-500 text-white font-bold" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="border-b border-gray-150 dark:border-gray-800 mx-2"></div>

          {/* Pengaturan */}
          <div className="space-y-1">
            <div className="px-4 mb-1">
              <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Pengaturan</span>
              <div className="h-0.5 w-5 bg-gray-400 dark:bg-gray-600 rounded mt-0.5"></div>
            </div>
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange?.(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-xl flex items-center justify-between transition-all border-0 bg-transparent cursor-pointer ${
                  activeTab === item.id 
                    ? "bg-blue-500 text-white font-bold" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="border-b border-gray-150 dark:border-gray-800 mx-2"></div>

          <button 
            onClick={onLogout}
            className="w-full text-left px-4 py-2 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-0 bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="text-xs font-bold">Keluar</span>
          </button>
        </div>
      )}
    </>
  );
}
