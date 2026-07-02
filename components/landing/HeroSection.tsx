"use client";

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type User = {
  fullName: string;
  role: string;
} | null;

interface HeroSectionProps {
  user: User;
}

export default function HeroSection({ user }: HeroSectionProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="overflow-hidden">
      <section className="bg-linear-to-b to-muted from-background">
        <div className="relative py-12 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
            <div className="md:w-[48%]">
              <div>
                <h1 className={cn(
                  "max-w-xl text-balance text-5xl font-extrabold text-[#173454] md:text-6xl font-hanken leading-tight transform transition-all duration-700 ease-out",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                  Ukur & Tingkatkan Bahasa Inggris dengan{" "}
                  <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                    AI Presisi
                  </span>
                </h1>
                <p className={cn(
                  "text-gray-500 my-8 max-w-2xl text-balance text-lg leading-relaxed font-inter transform transition-all duration-700 delay-150 ease-out",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                  Platform placement test resmi dan pembelajaran mandiri terpersonalisasi berbasis AI untuk mendukung kesuksesan akademik mahasiswa President University Pekanbaru.
                </p>

                <div className={cn(
                  "flex items-center gap-3 transform transition-all duration-700 delay-300 ease-out",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                  <Button asChild size="lg" className="pr-4.5 bg-primary hover:bg-blue-800 text-white rounded-xl">
                    <Link href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/student") : "/register"}>
                      <span className="text-nowrap">{user ? "Masuk ke Dashboard" : "Mulai Tes Sekarang"}</span>
                      <ChevronRight className="opacity-50" />
                    </Link>
                  </Button>
                  <Button key={2} asChild size="lg" variant="outline" className="pl-5 rounded-xl border-gray-200">
                    <a href="#ai-learning">
                      <span className="text-nowrap text-gray-700">Pelajari Fitur</span>
                    </a>
                  </Button>
                </div>
              </div>

              <div className={cn(
                "mt-10 transform transition-all duration-700 delay-450 ease-out",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-150">
                  <div>
                    <p className="font-hanken text-xl font-black text-primary">Adaptive</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold">Testing Engine</p>
                  </div>
                  <div>
                    <p className="font-hanken text-xl font-black text-primary">Instant</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold">CEFR Report</p>
                  </div>
                  <div>
                    <p className="font-hanken text-xl font-black text-primary">Personal</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold">AI Learning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "perspective-near mt-24 md:absolute md:-right-6 md:bottom-20 md:left-[55%] md:top-20 md:mt-0 transform transition-all duration-1000 delay-300 ease-out",
            mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
          )}>
            <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
              <div className="bg-background rounded-(--radius) shadow-foreground/10 ring-foreground/5 relative h-full skew-x-6 overflow-hidden border border-transparent shadow-md ring-1">
                <img
                  src="https://tailark.com/_next/image?url=%2Fmist%2Ftailark.png&w=3840&q=75"
                  alt="app screen"
                  className="object-top-left size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
