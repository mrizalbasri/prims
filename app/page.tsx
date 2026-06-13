export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="PRISM Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-hanken text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
              PRISM
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#"
              className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Program
            </Link>
            <Link
              href="#"
              className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Fitur
            </Link>
            <Link
              href="#"
              className="font-inter text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Testimoni
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/student"}
                className="bg-blue-600 text-white font-hanken text-sm font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all"
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
                  className="bg-blue-600 text-white font-hanken text-sm font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.webp"
              alt="PRISM Hero"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Ukur dan Tingkatkan Kemampuan Bahasa Inggris Anda dengan{" "}
            <span className="text-blue-600 dark:text-blue-400">AI</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Platform Placement Test resmi dan pembelajaran mandiri yang dirancang
            khusus untuk mahasiswa akademik.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-blue-600 text-white font-hanken text-lg font-bold px-10 py-4 rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all"
            >
              Mulai Tes Sekarang
            </Link>
            <Link
              href="#fitur"
              className="w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-hanken text-lg font-bold px-10 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Pelajari Fitur
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="PRISM Logo"
              width={30}
              height={30}
              className="object-contain opacity-80"
            />
            <span className="text-xl font-bold text-gray-500">PRISM</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            © 2026 PRISM — President University Pekanbaru. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-gray-400 hover:text-blue-600 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-blue-600 transition-colors text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
