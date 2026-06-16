export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import LandingHeader from "@/components/landing/LandingHeader";
import Logo from "@/components/ui/Logo";
import HeroSection from "@/components/landing/HeroSection";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import FaqAccordion from "@/components/landing/FaqAccordion";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden font-inter">
      {/* Navigation */}
      <LandingHeader user={user} />

      {/* Hero Section */}
      <HeroSection user={user} />

      {/* University Partner Banner */}
      <section className="py-10 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-blue-600">school</span>
            <span className="font-hanken font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-sm">
              Official Partner
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
          <p className="font-hanken font-bold text-lg text-primary dark:text-blue-400 tracking-tight">
            President University Pekanbaru
          </p>
        </div>
      </section>

      {/* Placement Test Showcase Section */}
      <section id="placement-test" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-800/30">
              <span className="material-symbols-outlined text-sm">psychology</span>
              <span className="font-hanken text-xs font-bold uppercase tracking-wider">Smart Assessment</span>
            </div>
            
            <h2 className="font-hanken text-4xl md:text-5xl font-extrabold text-primary dark:text-white leading-tight">
              Adaptive Placement Test
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-inter">
              Evaluasi komprehensif kemampuan bahasa Inggris mahasiswa baru. Platform kami menyesuaikan tingkat kesulitan soal berdasarkan respon Anda, memberikan hasil yang lebih akurat dalam waktu pengerjaan yang efisien.
            </p>

            <ul className="space-y-5">
              {[
                { title: "Adaptive Testing Technology", desc: "Tingkat kesulitan soal menyesuaikan secara dinamis dengan respon peserta.", icon: "tune" },
                { title: "Comprehensive Skill Assessment", desc: "Mengevaluasi 5 aspek keahlian bahasa Inggris: Vocabulary, Grammar, Reading, Writing, & Speaking.", icon: "category" },
                { title: "Instant Results & CEFR Mapping", desc: "Dapatkan skor penempatan resmi (Beginner, Intermediate, Advanced) dan sertifikasi CEFR secara instan.", icon: "bolt" }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-hanken text-base font-bold text-gray-900 dark:text-white mb-0.5">
                      {item.title}
                    </h4>
                    <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Ujian Card Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-3xl -z-10 transform -rotate-1"></div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-150 dark:border-gray-700 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-teal-500"></div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-hanken font-bold text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg">
                  Vocabulary Section
                </span>
                <span className="font-inter text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  Question 5 of 20
                </span>
              </div>
              <h3 className="font-hanken text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
                Choose the correct synonym for "abundant".
              </h3>
              <div className="space-y-3">
                {[
                  { key: "A", val: "Scarce", selected: false },
                  { key: "B", val: "Plentiful", selected: true },
                  { key: "C", val: "Minimal", selected: false }
                ].map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      opt.selected
                        ? "border-teal-500 bg-teal-50/50 dark:bg-teal-500/10"
                        : "border-gray-100 dark:border-gray-700 hover:border-teal-500/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      opt.selected
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {opt.selected && <span className="material-symbols-outlined text-xs">check</span>}
                    </div>
                    <span className={`font-inter text-sm font-semibold ${
                      opt.selected ? "text-teal-600 dark:text-teal-400" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {opt.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Driven Learning Section */}
      <section id="ai-learning" className="py-24 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="inline-flex py-1 px-3 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-hanken text-xs font-bold uppercase tracking-wider border border-teal-200/50 dark:border-teal-800/30">
              Continuous Improvement
            </span>
            <h2 className="font-hanken text-4xl md:text-5xl font-extrabold text-primary dark:text-white leading-tight">
              AI-Driven Learning Modules
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-inter">
              Setelah tes penempatan selesai, Anda mendapatkan akses penuh ke kurikulum modul pembelajaran mandiri yang dirancang oleh AI sesuai tingkat kelemahan Anda.
            </p>
          </div>

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
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-850 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                  card.theme === "blue" ? "bg-blue-500/10 text-blue-600" :
                  card.theme === "orange" ? "bg-orange-500/10 text-orange-600" :
                  "bg-red-500/10 text-red-600"
                }`}>
                  <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                </div>
                <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="font-inter text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-8">
            <span className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3.5 py-1.5 rounded-full border border-orange-200/50 dark:border-orange-800/30">
              <span className="material-symbols-outlined text-sm">science</span>
              <span className="font-hanken text-xs font-bold uppercase tracking-wider">Coba Demo</span>
            </span>
            
            <h2 className="font-hanken text-4xl md:text-5xl font-extrabold text-primary dark:text-white leading-tight animate-fadeIn">
              Rasakan Kemudahan Umpan Balik AI
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-inter">
              Coba asisten tata bahasa menulis kami di panel sebelah kanan. Ketik kalimat Anda atau pilih contoh kalimat salah yang telah disediakan untuk melihat koreksi tata bahasa kontekstual dari AI secara instan.
            </p>

            <div className="p-4 rounded-xl border border-gray-150 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 space-y-2 text-xs">
              <p className="font-hanken font-bold text-gray-700 dark:text-gray-200">💡 Fitur Writing Assistant PRISM:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                <li>Umpan balik tata bahasa kontekstual</li>
                <li>Penjelasan terperinci dalam Bahasa Indonesia</li>
                <li>Kalkulasi nilai otomatis per paragraf</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 w-full">
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-855">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-hanken text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Pertanyaan Umum
            </span>
            <h2 className="font-hanken text-3xl md:text-4xl font-extrabold text-primary dark:text-white">
              Ada Pertanyaan Tentang PRISM?
            </h2>
            <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
              Jawaban atas pertanyaan-pertanyaan yang paling sering ditanyakan oleh mahasiswa baru dan admin kampus.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-gradient-to-br from-primary to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-8">
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
        </div>
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
              <div className="text-xs text-gray-500 pt-2">
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
