"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, Award, Zap, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type User = {
  fullName: string;
  role: string;
} | null;

interface HeroSectionProps {
  user: User;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-gray-50 py-12 md:py-20">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-teal-100/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 -z-10 h-80 w-80 rounded-full bg-blue-100/20 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Official Placement Test — President University Pekanbaru</span>
            </div>

            <h1 className="font-hanken text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#173454] leading-[1.12] tracking-tight">
              Ukur & Tingkatkan Bahasa Inggris dengan{" "}
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                AI Presisi
              </span>
            </h1>

            <p className="font-inter text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
              Platform placement test resmi dan kurikulum mandiri terpersonalisasi berbasis kecerdasan buatan. Dirancang khusus untuk mengukur kesiapan akademik mahasiswa baru secara akurat dan instan.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild size="lg" className="bg-[#173454] hover:bg-[#0e2034] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 px-6 h-12">
                <Link href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/student") : "/register"}>
                  <span>{user ? "Masuk ke Dashboard" : "Mulai Tes Sekarang"}</span>
                  <ChevronRight className="ml-1 h-4 w-4 opacity-70" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 transition-all px-6 h-12">
                <a href="#placement-test">
                  <BookOpen className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Pelajari Fitur</span>
                </a>
              </Button>
            </div>

            {/* Feature Badges / Highlights */}
            <div className="pt-6 border-t border-gray-200/80">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div>
                  <p className="font-hanken text-lg md:text-2xl font-black text-[#173454]">Adaptive</p>
                  <p className="text-xs text-gray-500 font-medium">Testing Engine</p>
                </div>
                <div>
                  <p className="font-hanken text-lg md:text-2xl font-black text-teal-600">Instant</p>
                  <p className="text-xs text-gray-500 font-medium">CEFR Report</p>
                </div>
                <div>
                  <p className="font-hanken text-lg md:text-2xl font-black text-blue-600">Personal</p>
                  <p className="text-xs text-gray-500 font-medium">AI Learning</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Native Interactive Assessment Showcase Card */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-teal-500/20 via-blue-500/20 to-indigo-500/10 blur-xl -z-10" />

            <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-xl shadow-blue-950/5 space-y-6">
              {/* Card Window Topbar */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 font-inter text-xs font-semibold text-gray-400">
                    PRISM Assessment Preview
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  <span>Live Engine</span>
                </div>
              </div>

              {/* Student Placement Status */}
              <div className="flex items-center justify-between bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center text-white font-hanken font-bold text-sm shadow-sm">
                    AP
                  </div>
                  <div>
                    <h4 className="font-hanken text-sm font-bold text-gray-900">Aditya Pratama</h4>
                    <p className="text-[11px] text-gray-500 font-medium">President Univ • Mahasiswa Baru 2026</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100/80 text-blue-700 px-2.5 py-1 rounded-lg">
                  Verified
                </span>
              </div>

              {/* Overall CEFR Score Banner */}
              <div className="bg-gradient-to-r from-[#173454] to-blue-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold">
                      <Award className="h-4 w-4 text-teal-400" />
                      <span>Hasil Penempatan CEFR</span>
                    </div>
                    <div className="mt-1 font-hanken text-2xl font-extrabold text-white">
                      Level B2 — Vantage
                    </div>
                    <p className="text-xs text-blue-200/90 mt-0.5 font-inter">
                      Upper Intermediate English Proficiency
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black font-hanken text-teal-300">84</div>
                    <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Skor / 100</div>
                  </div>
                </div>
              </div>

              {/* Sub-Skill Progress Breakdown */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Evaluasi Sub-Kemampuan</span>
                  <span>Skor AI</span>
                </div>

                {[
                  { name: "Vocabulary", score: 88, level: "Advanced", color: "bg-teal-500" },
                  { name: "Grammar & Structure", score: 82, level: "Intermediate", color: "bg-blue-600" },
                  { name: "Reading Comprehension", score: 90, level: "Advanced", color: "bg-teal-600" },
                  { name: "Writing & Speaking", score: 84, level: "AI Evaluated", color: "bg-orange-500" },
                ].map((skill, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-800">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{skill.level}</span>
                        <span className="font-bold text-gray-900">{skill.score}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Feature Badges */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Auto-Graded by AI
                </span>
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                  <Zap className="h-3.5 w-3.5" />
                  Adaptive Algorithm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
