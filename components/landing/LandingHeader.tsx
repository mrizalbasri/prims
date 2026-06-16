"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type User = {
  fullName: string;
  role: string;
} | null;

interface LandingHeaderProps {
  user: User;
}

export default function LandingHeader({ user }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Logo className="h-11 w-36" priority />
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#placement-test"
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            Placement Test
          </a>
          <a
            href="#ai-learning"
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            AI Learning
          </a>
          <a
            href="#demo-section"
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            Coba Demo
          </a>
          <a
            href="#faq"
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href={user.role === "ADMIN" ? "/admin/dashboard" : "/student"}
              className="bg-primary hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-hanken text-sm font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all cursor-pointer"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-hanken text-sm font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all cursor-pointer"
              >
                Mulai Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Links Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4 animate-fadeIn">
          <a
            href="#placement-test"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            Placement Test
          </a>
          <a
            href="#ai-learning"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            AI Learning
          </a>
          <a
            href="#demo-section"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            Coba Demo
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            FAQ
          </a>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/student"}
                onClick={() => setMobileMenuOpen(false)}
                className="bg-primary hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-hanken text-sm font-bold py-3 rounded-lg text-center cursor-pointer"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-inter text-sm font-bold text-gray-700 dark:text-gray-300 py-2 hover:text-blue-600 text-center cursor-pointer"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-primary hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-hanken text-sm font-bold py-3 rounded-lg text-center cursor-pointer"
                >
                  Mulai Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
