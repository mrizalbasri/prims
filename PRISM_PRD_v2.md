# PRISM — Product Requirements Document
**Versi:** 1.0.0 — Revised  
**Tanggal:** Juni 2026  
**Status:** Draft Final  
**Product Owner:** Rizal  
**Institusi Target:** President University Pekanbaru  
**Platform:** Web App (Desktop & Mobile Responsive)  
**Model Bisnis:** Freemium — Gratis untuk kampus pilot, berbayar untuk ekspansi

---

## 1. Ringkasan Eksekutif

PRISM adalah platform web berbasis kecerdasan buatan yang dirancang untuk dua tujuan utama:

1. Menjadi alat **Placement Test bahasa Inggris resmi** bagi mahasiswa baru
2. Menjadi **platform belajar bahasa Inggris mandiri** yang mendukung mahasiswa mengikuti perkuliahan berbahasa Inggris

Kampus yang menerapkan sistem pembelajaran berbahasa Inggris penuh membutuhkan cara yang efisien dan akurat untuk mengukur kemampuan bahasa Inggris mahasiswa baru. PRISM hadir sebagai solusinya: kampus mendapatkan data placement test yang terstruktur, mahasiswa mendapatkan platform belajar yang personal dan interaktif.

**Strategi:** Gratis untuk kampus pilot → kumpulkan data & feedback → tawarkan model berlangganan ke kampus lain.

---

## 2. Permasalahan yang Diselesaikan

### 2.1 Dari Perspektif Kampus
- Tidak ada tools standar untuk mengukur kemampuan bahasa Inggris mahasiswa baru secara terstruktur
- Tes manual membutuhkan waktu lama, sulit diskor konsisten, dan data sulit dikelola
- Kampus tidak memiliki data baseline kemampuan bahasa Inggris per angkatan untuk evaluasi kurikulum

### 2.2 Dari Perspektif Mahasiswa
- Mahasiswa baru kesulitan mengikuti perkuliahan yang sepenuhnya menggunakan bahasa Inggris
- Tidak ada platform belajar yang kontennya relevan dengan konteks akademik kampus
- Solusi yang ada (Duolingo, Grammarly) bersifat umum dan penjelasannya dalam bahasa Inggris, bukan Bahasa Indonesia

---

## 3. Tujuan Produk

### 3.1 Tujuan Utama
- Menyediakan Placement Test bahasa Inggris yang akurat, otomatis, dan terstruktur untuk kampus
- Menyediakan platform belajar bahasa Inggris yang mendukung mahasiswa meningkatkan kemampuan mereka secara mandiri
- Memberikan data dan laporan kemampuan bahasa Inggris mahasiswa kepada pihak kampus

### 3.2 Tujuan Bisnis
- Menjadi platform yang diadopsi resmi oleh President University Pekanbaru sebagai pilot project
- Setelah terbukti, ekspansi ke kampus lain di Riau dan Indonesia dengan model berlangganan
- Membangun portofolio produk nyata yang berdampak

### 3.3 Metrik Keberhasilan
- 100% mahasiswa baru mengikuti Placement Test via aplikasi ini
- Minimal 50% mahasiswa aktif menggunakan fitur belajar setelah placement test
- Satisfaction score kampus: minimal 4/5 dari evaluasi semester pertama
- Data hasil tes tersedia untuk admin kampus dalam format yang mudah dianalisis

---

## 4. Target Pengguna

### 4.1 Mahasiswa Baru (Primary User)
- Baru masuk kampus, wajib mengikuti Placement Test
- Belum terbiasa dengan lingkungan akademik berbahasa Inggris
- Membutuhkan platform belajar yang ramah dan mudah digunakan
- Penjelasan dalam Bahasa Indonesia sangat membantu pemahaman mereka

### 4.2 Admin / Pihak Kampus (Secondary User)
- Membutuhkan data hasil tes seluruh mahasiswa baru
- Perlu laporan per angkatan, per jurusan, dan per skill
- Butuh fitur export data untuk keperluan administrasi dan evaluasi kurikulum

### 4.3 Mahasiswa Tingkat Lanjut (Tertiary User)
- Ingin meningkatkan kemampuan bahasa Inggris untuk persiapan skripsi atau presentasi
- Menggunakan fitur belajar secara mandiri tanpa kewajiban dari kampus

---

## 5. Fitur Produk

### 5.1 Daftar Fitur

| No | Fitur | Deskripsi | Fase | Prioritas |
|----|-------|-----------|------|-----------|
| 1 | **Placement Test** | Tes kemampuan bahasa Inggris komprehensif untuk mahasiswa baru. Kombinasi vocabulary, grammar, reading, writing, dan speaking. | Fase 1 | P1 |
| 2 | **Dashboard Admin** | Halaman khusus kampus untuk melihat semua hasil tes, filter per angkatan/jurusan, dan export data. | Fase 1 | P1 |
| 3 | **Hasil & Level** | Mahasiswa lihat skor per skill, level keseluruhan, dan area yang perlu ditingkatkan. | Fase 1 | P1 |
| 4 | **Vocabulary Learning** | Flashcard kosakata akademik dengan audio pengucapan native speaker. | Fase 2 | P2 |
| 5 | **Writing Practice** | Latihan menulis dengan koreksi AI, penjelasan dalam Bahasa Indonesia. | Fase 2 | P2 |
| 6 | **Speaking Practice** | Latihan percakapan interaktif dengan AI, dapat feedback langsung. | Fase 2 | P2 |
| 7 | **Progress Tracking** | Dashboard personal: grafik perkembangan, streak belajar, rekomendasi fokus. | Fase 3 | P3 |
| 8 | **Tes Berkala** | Tes ulang bulanan/semesteran untuk ukur perkembangan setelah belajar. | Fase 3 | P3 |

---

### 5.2 Detail Placement Test (Fitur Core)

| No | Komponen | Format | Soal | Durasi | Bobot |
|----|----------|--------|------|--------|-------|
| 1 | **Vocabulary** | Pilihan ganda — pilih arti atau kata yang tepat | 15 soal | 8 menit | 20% |
| 2 | **Grammar** | Pilihan ganda — pilih kalimat atau bentuk yang benar | 15 soal | 8 menit | 20% |
| 3 | **Reading** | Baca paragraf pendek, jawab pertanyaan pemahaman | 10 soal | 12 menit | 25% |
| 4 | **Writing** | Tulis paragraf pendek, dinilai AI dari grammar & struktur | 1 esai | 10 menit | 20% |
| 5 | **Speaking** | Ucapkan kalimat / jawab pertanyaan dengan suara | 3 soal | 7 menit | 15% |
| | **TOTAL** | | **44 soal** | **±45 menit** | **100%** |

### 5.3 Level Output Placement Test

| Level | Rentang Skor | Keterangan |
|-------|-------------|------------|
| 🔴 Beginner | 0 – 49 | Butuh perhatian ekstra, disarankan kelas remedial |
| 🟡 Intermediate | 50 – 74 | Cukup mampu, perlu belajar mandiri via platform |
| 🟢 Advanced | 75 – 100 | Siap mengikuti perkuliahan berbahasa Inggris penuh |

---

## 6. Tech Stack

### 6.1 Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Speech:** Web Speech API (built-in browser, gratis)

### 6.2 Backend & AI
- **Backend:** Next.js API Routes atau NestJS
- **AI Engine:** Google Gemini API (free tier untuk MVP)
- **Audio:** Web Speech API → upgrade ke Whisper jika perlu

### 6.3 Database
- **Primary:** PostgreSQL — data user, hasil tes, progress belajar
- **Cache:** Redis — session dan rate limiting

### 6.4 Infrastructure
- **Deploy:** VPS + Nginx reverse proxy
- **SSL:** Let's Encrypt (gratis)
- **CI/CD:** GitHub Actions

### 6.5 Estimasi Biaya Operasional

| Fase | Jumlah User | Estimasi Biaya/Bulan |
|------|------------|----------------------|
| Fase 1 MVP | < 200 user | **Rp 0** (full free tier) |
| Fase 2 Beta | < 500 user | ~Rp 100.000–300.000 |
| Fase 3 Production | > 1.000 user | ~Rp 500.000–1.000.000 |

---

## 7. Roadmap Pengembangan

### Fase 1 — MVP (Bulan 1–2)
- [ ] Sistem autentikasi (register/login dengan email kampus)
- [ ] Placement Test lengkap: vocabulary, grammar, reading, writing, speaking
- [ ] Halaman hasil tes untuk mahasiswa (skor + level)
- [ ] Dashboard admin kampus (lihat semua data, filter, export)
- [ ] Deploy ke VPS, domain aktif, SSL terpasang

### Fase 2 — Beta (Bulan 3–4)
- [ ] Vocabulary Learning dengan flashcard dan audio
- [ ] Writing Practice dengan koreksi AI dalam Bahasa Indonesia
- [ ] Speaking Practice dengan AI conversation partner
- [ ] Notifikasi reminder belajar

### Fase 3 — Full Launch (Bulan 5–6)
- [ ] Progress Tracking dashboard personal
- [ ] Tes berkala (bulanan/semesteran)
- [ ] Gamifikasi: poin, badge, leaderboard
- [ ] Optimasi performa untuk skalabilitas lebih besar

### Fase 4 — Ekspansi (Bulan 7+)
- [ ] Pitch ke kampus lain di Riau dengan data dari kampus pilot
- [ ] Model berlangganan: per mahasiswa/tahun atau flat fee/semester
- [ ] Integrasi SSO dengan sistem akademik kampus

---

## 8. Model Bisnis

### 8.1 Strategi Freemium untuk Institusi
- Gratis untuk President University Pekanbaru sebagai kampus pilot
- Kampus pilot berfungsi sebagai showcase dan sumber data nyata
- Setelah terbukti, tawarkan ke kampus lain dengan model berbayar

### 8.2 Opsi Harga (Future)
- **Per mahasiswa per tahun:** Rp 10.000–20.000/mahasiswa
- **Flat fee per kampus per semester:** Rp 2.000.000–5.000.000/semester
- **Fitur admin premium:** laporan analitik lanjutan, export PDF branded kampus

---

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Gemini API free tier habis saat peak | Rate limiting per user, antrian request |
| Akurasi Web Speech kurang untuk aksen Indonesia | Fallback input teks, upgrade ke Whisper |
| Kampus tidak tertarik | Siapkan demo live dan data impact yang konkret |
| Tidak ada maintainer setelah lulus | Dokumentasi teknis lengkap, pertimbangkan open source |

---

## 10. Glosarium

| Istilah | Definisi |
|---------|----------|
| PRD | Product Requirements Document |
| MVP | Minimum Viable Product — versi paling minimal yang sudah bisa digunakan |
| Placement Test | Tes penempatan untuk mengukur kemampuan awal |
| STT | Speech-to-Text — konversi suara menjadi teks |
| TTS | Text-to-Speech — konversi teks menjadi suara |
| LLM | Large Language Model — model AI bahasa besar (Gemini, GPT, dll) |
| Freemium | Model bisnis gratis di awal, berbayar untuk fitur/skala lebih besar |
| SSO | Single Sign-On — sistem login terpusat |
| VPS | Virtual Private Server — server virtual untuk hosting aplikasi |

---

*— Akhir Dokumen PRD PRISM v2.0 —*
