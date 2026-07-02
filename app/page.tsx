export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LandingHeader from "@/components/landing/LandingHeader";
import Logo from "@/components/ui/Logo";
import HeroSection from "@/components/landing/HeroSection";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import FaqAccordion from "@/components/landing/FaqAccordion";
import PlacementTestPreview from "@/components/landing/PlacementTestPreview";
import ScrollReveal from "@/components/landing/ScrollReveal";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden font-inter">
      {/* Navigation */}
      <LandingHeader user={user} />
      {/* Spacer to prevent fixed navbar from overlapping hero content on page load */}
      <div className="h-[76px] md:h-[88px] w-full flex-shrink-0" />

      {/* Hero Section */}
      <HeroSection user={user} />

      {/* University Partner Banner */}
      <section className="py-12 bg-gray-55/30 relative">
        <ScrollReveal direction="zoom" className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <span className="font-hanken font-bold text-gray-400 uppercase tracking-widest text-xs">
                Official Partner
              </span>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <p className="font-hanken font-extrabold text-xl text-[#173454] tracking-tight">
              President University Pekanbaru
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Placement Test Showcase Section */}
      <section id="placement-test" className="py-24 max-w-7xl mx-auto px-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="right" className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full border border-blue-100">
              <span className="material-symbols-outlined text-sm">psychology</span>
              <span className="font-hanken text-xs font-bold uppercase tracking-wider">Smart Assessment</span>
            </div>
            
            <h2 className="font-hanken text-4xl md:text-5xl font-extrabold text-[#173454] leading-tight">
              Adaptive Placement Test
            </h2>
            
            <p className="text-gray-500 leading-relaxed font-inter text-sm md:text-base">
              Evaluasi komprehensif kemampuan bahasa Inggris mahasiswa baru. Platform kami menyesuaikan tingkat kesulitan soal berdasarkan respon Anda, memberikan hasil yang lebih akurat dalam waktu pengerjaan yang efisien.
            </p>

            <ul className="space-y-5">
              {[
                { title: "Adaptive Testing Technology", desc: "Tingkat kesulitan soal menyesuaikan secara dinamis dengan respon peserta.", icon: "tune" },
                { title: "Comprehensive Skill Assessment", desc: "Mengevaluasi 5 aspek keahlian bahasa Inggris: Vocabulary, Grammar, Reading, Writing, & Speaking.", icon: "category" },
                { title: "Instant Results & CEFR Mapping", desc: "Dapatkan skor penempatan resmi (Beginner, Intermediate, Advanced) dan sertifikasi CEFR secara instan.", icon: "bolt" }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 border border-blue-100">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-hanken text-base font-bold text-gray-900 mb-0.5">
                      {item.title}
                    </h4>
                    <p className="font-inter text-sm text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Interactive Placement Test Preview Component */}
          <ScrollReveal direction="left">
            <PlacementTestPreview />
          </ScrollReveal>
        </div>
      </section>

      {/* AI-Driven Learning Section */}
      <section id="ai-learning" className="py-24 bg-white border-y border-gray-150 relative">
        {/* Subtle decorative glow */}
        <div className="absolute left-10 bottom-10 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="inline-flex py-1 px-3 rounded-full bg-teal-50 text-teal-600 font-hanken text-xs font-bold uppercase tracking-wider border border-teal-100">
              Continuous Improvement
            </span>
            <h2 className="font-hanken text-4xl md:text-5xl font-extrabold text-[#173454] leading-tight">
              AI-Driven Learning Modules
            </h2>
            <p className="text-gray-500 leading-relaxed font-inter text-sm md:text-base">
              Setelah tes penempatan selesai, Anda mendapatkan akses penuh ke kurikulum modul pembelajaran mandiri yang dirancang oleh AI sesuai tingkat kelemahan Anda.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Personalized Learning Path",
                desc: "Sistem kecerdasan buatan menyusun urutan materi pembelajaran flashcard dan latihan harian agar Anda dapat mengejar kompetensi yang dirasa kurang.",
                icon: "route",
                theme: "blue"
              },
              {
                title: "AI Writing Assistant",
                desc: "Berlatih menulis esai akademis dengan feedback tata bahasa, ejaan, gaya penulisan, dan koreksi instan langsung dalam Bahasa Indonesia.",
                icon: "edit_document",
                theme: "orange"
              },
              {
                title: "Interactive Speaking Buddy",
                desc: "Latih kefasihan berbicara (speaking) Anda berdasarkan skenario simulasi debat, diskusi, dan presentasi lisan dengan penilaian audio otomatis.",
                icon: "record_voice_over",
                theme: "red"
              }
            ].map((card, idx) => (
              <ScrollReveal
                key={idx}
                delayMs={idx * 150} // Staggered scroll-reveal animation
                className="bg-gray-50 p-8 rounded-2xl border border-gray-200/60 hover:border-blue-500/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300 ${
                  card.theme === "blue" ? "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white" :
                  card.theme === "orange" ? "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white" :
                  "bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white"
                }`}>
                  <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                </div>
                <h3 className="font-hanken text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="font-inter text-sm text-gray-500 leading-relaxed">
                  {card.desc}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <ScrollReveal direction="right" className="lg:col-span-5 space-y-8">
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3.5 py-1.5 rounded-full border border-orange-100">
              <span className="material-symbols-outlined text-sm">science</span>
              <span className="font-hanken text-xs font-bold uppercase tracking-wider">Coba Demo</span>
            </span>
            
            <h2 className="font-hanken text-4xl md:text-5xl font-extrabold text-[#173454] leading-tight">
              Rasakan Kemudahan Umpan Balik AI
            </h2>
            
            <p className="text-gray-500 leading-relaxed font-inter text-sm md:text-base">
              Coba asisten tata bahasa menulis kami di panel sebelah kanan. Ketik kalimat Anda atau pilih contoh kalimat salah yang telah disediakan untuk melihat koreksi tata bahasa kontekstual dari AI secara instan.
            </p>

            <div className="p-5 rounded-2xl border border-gray-150 bg-white/50 space-y-3 text-xs shadow-sm">
              <p className="font-hanken font-bold text-gray-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-blue-500">lightbulb</span>
                Fitur Writing Assistant PRISM:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-500 leading-relaxed">
                <li>Umpan balik tata bahasa contextual</li>
                <li>Penjelasan terperinci dalam Bahasa Indonesia</li>
                <li>Kalkulasi nilai otomatis per paragraf</li>
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" className="lg:col-span-7 w-full">
            <InteractiveDemo />
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-gray-150">
        <ScrollReveal direction="up" className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-hanken text-xs font-bold text-blue-600 uppercase tracking-widest">
              Pertanyaan Umum
            </span>
            <h2 className="font-hanken text-3xl md:text-4xl font-extrabold text-[#173454]">
              Ada Pertanyaan Tentang PRISM?
            </h2>
            <p className="font-inter text-sm text-gray-500">
              Jawaban atas pertanyaan-pertanyaan yang paling sering ditanyakan oleh mahasiswa baru dan admin kampus.
            </p>
          </div>

          <FaqAccordion />
        </ScrollReveal>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-gradient-to-br from-primary to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <ScrollReveal direction="zoom" className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-8">
          <h2 className="font-hanken text-4xl md:text-5xl font-extrabold leading-tight">
            Siap Memulai Evaluasi Bahasa Inggris Anda?
          </h2>
          <p className="font-inter text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Daftar dengan email kampus resmi President University Pekanbaru Anda untuk memulai placement test sekarang juga.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-primary font-hanken text-base font-bold px-10 py-4 rounded-xl hover:bg-gray-50 hover:shadow-2xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center bg-blue-700/50 text-white border border-blue-400/30 font-hanken text-base font-bold px-10 py-4 rounded-xl hover:bg-blue-750 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Masuk Dashboard
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            <div className="md:col-span-6 space-y-6">
              <div className="flex items-center">
                <Logo className="h-11 w-36" imageClassName="brightness-0 invert" />
              </div>
              <p className="font-inter text-sm text-gray-400 max-w-sm leading-relaxed">
                Platform Placement Test resmi dan pembelajaran mandiri yang dirancang khusus untuk mendukung kesuksesan akademik berbahasa Inggris.
              </p>
            </div>
            
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-hanken text-sm font-bold text-white uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#placement-test" className="hover:text-white transition-colors">Placement Test</a></li>
                <li><a href="#ai-learning" className="hover:text-white transition-colors">AI Learning</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h4 className="font-hanken text-sm font-bold text-white uppercase tracking-wider">Kampus</h4>
              <p className="font-inter text-sm text-gray-400">
                President University Pekanbaru<br />
                Riau, Indonesia
              </p>
              <div className="text-xs text-gray-550 pt-2">
                © 2026 PRISM. All rights reserved.
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 PRISM — President University Pekanbaru. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
