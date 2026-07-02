"use client";

import { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled
          ? "top-4 w-[90%] max-w-5xl rounded-full bg-white/80 border border-gray-200 shadow-md py-2.5 px-8 backdrop-blur-lg"
          : "top-0 w-full bg-white border-b border-gray-150 py-4 px-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Logo className="h-11 w-36" priority />
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: "Placement Test", href: "#placement-test" },
            { name: "AI Learning", href: "#ai-learning" },
            { name: "Coba Demo", href: "#demo-section" },
            { name: "FAQ", href: "#faq" }
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="font-inter text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href={user.role === "ADMIN" ? "/admin/dashboard" : "/student"}
              className="bg-primary hover:bg-blue-800 text-white font-hanken text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="font-inter text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-blue-800 text-white font-hanken text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
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
            className="text-gray-600 focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Links Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-4 animate-fadeIn">
          <a
            href="#placement-test"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Placement Test
          </a>
          <a
            href="#ai-learning"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            AI Learning
          </a>
          <a
            href="#demo-section"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Coba Demo
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="font-inter text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            FAQ
          </a>
          
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/student"}
                onClick={() => setMobileMenuOpen(false)}
                className="bg-primary hover:bg-blue-800 text-white font-hanken text-sm font-bold py-3 rounded-xl text-center cursor-pointer transition-all duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-inter text-sm font-bold text-gray-700 py-2 hover:text-blue-600 text-center cursor-pointer transition-all duration-200"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-primary hover:bg-blue-800 text-white font-hanken text-sm font-bold py-3 rounded-xl text-center cursor-pointer transition-all duration-200"
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
