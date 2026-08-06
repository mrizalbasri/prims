# Analisis & Pemahaman Codebase Proyek PRISM

Dokumen ini mencakup pemahaman AI terhadap arsitektur, basis kode, relasi database, status implementasi, serta temuan linter pada proyek **PRISM** berdasarkan file-file yang telah dibaca.

---

## 1. Ikhtisar & Arsitektur Utama
PRISM adalah platform berbasis web untuk **Placement Test Bahasa Inggris resmi** dan **modul belajar mandiri** bagi mahasiswa baru **President University Pekanbaru**.

*   **Framework Utama:** Next.js (App Router) v16.2.9 + React v19.2.4
*   **Basis Data:** PostgreSQL dengan Prisma ORM v7.8.0
*   **Mesin Kecerdasan Buatan:** Google Gemini API (`gemini-2.0-flash`) & MiniMax API (via TokenRouter)
*   **Sistem Suara:** Web Speech API (TTS/STT bawaan browser) untuk fallback perekaman suara mahasiswa.

---

## 2. Struktur Proyek & Peran File yang Dibaca

Berikut adalah daftar file utama proyek yang telah dipelajari beserta peran fungsionalnya dalam aplikasi:

### A. Konfigurasi & Setup Proyek
*   [package.json](file:///d:/Coding/prism/package.json): Mendefinisikan dependencies utama seperti `@google/generative-ai`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `zod`, dan devDependencies seperti `tailwindcss` v4, `eslint` v9, dan `tsx`.
*   [SETUP.md](file:///d:/Coding/prism/SETUP.md): Menyediakan panduan inisialisasi server, variabel lingkungan (.env), skema migrasi database, dan daftar prioritas pengembangan Fase 1 (MVP).
*   [PRISM_PRD_v2.md](file:///d:/Coding/prism/PRISM_PRD_v2.md): Dokumen Product Requirements (PRD) yang merinci model bisnis freemium, pembagian modul tes (Vocabulary 20%, Grammar 20%, Reading 25%, Writing 20%, Speaking 15%), target pengguna, dan peta jalan pengembangan (Fase 1 hingga Fase 4).

### B. Skema Database & Seeder (`prisma/`)
*   [prisma/schema.prisma](file:///d:/Coding/prism/prisma/schema.prisma): Model data relasional PostgreSQL. Model-model penting meliputi:
    *   `User`: Data mahasiswa/admin, status, kelompok jurusan/angkatan, dan hak akses.
    *   `TestAttempt` & `SectionAttempt`: Sesi ujian penempatan mahasiswa dan pemantauan durasi/status per seksi ujian.
    *   `ObjectiveAnswer`: Jawaban pilihan ganda untuk seksi objektif (Vocabulary, Grammar, Reading).
    *   `WritingResponse` & `WritingSubmission`: Jawaban esai mahasiswa, revisi, dan penilaian feedback AI.
    *   `SpeakingResponse` & `SpeakingSession`: Audio rekaman, transkrip teks, dan umpan balik AI untuk seksi berbicara.
    *   `VocabularyCard` & `VocabularyProgress`: Flashcard kosakata akademik dan data repetisi belajar (*spaced repetition*).
*   [prisma/seed.ts](file:///d:/Coding/prism/prisma/seed.ts): Seeder untuk menginisialisasi bank soal tes objektif awal (Vocabulary, Grammar, Reading, Listening) serta prompt Writing & Speaking awal.
*   [prisma/seed-phase2.ts](file:///d:/Coding/prism/prisma/seed-phase2.ts): Seeder untuk menginisialisasi modul belajar mandiri Fase 2, termasuk kartu kosakata akademik, skenario presentasi speaking, wawancara kerja, dan prompt latihan menulis terstruktur.

### C. Antarmuka Pengguna & Komponen (`app/` & `components/`)
*   [app/page.tsx](file:///d:/Coding/prism/app/page.tsx): Halaman utama (*landing page*) yang menampilkan navigasi utama, banner universitas mitra, ringkasan fitur tes adaptif, demo interaktif asisten menulis, FAQ, dan tombol login/registrasi.
*   [app/student/page.tsx](file:///d:/Coding/prism/app/app/student/page.tsx): Halaman Dashboard Mahasiswa yang menampilkan status ujian, grafik Radar Chart perolehan skor per keahlian, dan tombol akses kelas remedial/mandiri.
*   [components/admin/QuestionsTab.tsx](file:///d:/Coding/prism/components/admin/QuestionsTab.tsx): Antarmuka manajemen soal bagi admin, yang telah dimodifikasi agar dapat mengelompokkan soal berdasarkan `audioUrl` untuk seksi Listening.
*   [components/student/SpeakingTestRecorder.tsx](file:///d:/Coding/prism/components/student/SpeakingTestRecorder.tsx): Komponen perekam suara siswa untuk seksi Speaking. Telah disederhanakan dengan menghapus fitur pause/resume agar meminimalisir bug transkripsi suara.
*   [components/student/speaking/ReadAlongPlayer.tsx](file:///d:/Coding/prism/components/student/speaking/ReadAlongPlayer.tsx): Komponen interaktif bagi siswa untuk berlatih membaca nyaring (*read-along*) dengan visualisasi pelacakan kata per kata.
*   [components/student/ProgressTracker.tsx](file:///d:/Coding/prism/components/student/ProgressTracker.tsx): Komponen visualisasi grafik tren skor dan kartu komparasi *Initial Test vs Latest Retake Test* beserta perbandingan per sub-skill.

### D. Logika Inti & API Backend (`lib/` & `app/api/`)
*   [lib/scoring.ts](file:///d:/Coding/prism/lib/scoring.ts): Implementasi penilaian. Mendukung evaluasi esai dan audio berbicara menggunakan Gemini API resmi, custom API proxy (`GEMINI_BASE_URL`), serta MiniMax.
*   [lib/vocabulary.ts](file:///d:/Coding/prism/lib/vocabulary.ts): Helper pengolahan kosakata akademik, statistik kemajuan kartu (New, Learning, Mastered), dan perhitungan interval review spaced repetition.
*   [app/api/test/start/route.ts](file:///d:/Coding/prism/app/api/test/start/route.ts): Handler untuk memulai tes baru. Berisi logika anti-concurrency (menahan request ganda pada waktu bersamaan) dan caching pertanyaan ke kolom database `feedback` agar soal tidak berganti/dibaca ganda.
*   [app/api/test/save/route.ts](file:///d:/Coding/prism/app/api/test/save/route.ts): Handler untuk menyimpan draf jawaban per bagian ujian, memanfaatkan fungsi `upsert` database agar tidak terjadi duplikasi entri jawaban.
*   [app/api/student/history/route.ts](file:///d:/Coding/prism/app/api/student/history/route.ts): Handler backend untuk mengambil seluruh riwayat `TestAttempt` yang berstatus `COMPLETED` milik mahasiswa secara kronologis.

### E. Dokumentasi Tambahan Obsidian (`docs/`)
*   [[progress_tracking_and_retake_comparison.md|Progress Tracking & Retake Comparison]]: Dokumentasi arsitektur, JSON schema API `/api/student/history`, dan komponen visualisasi perkembangan mahasiswa.

---

## 3. Logika & Alur Pencegahan Proses Ganda

Sistem diatur sedemikian rupa untuk menghindari overhead server dan inkonsistensi data dengan langkah-langkah berikut:

1.  **Locking Concurrent Request (`startLocks`):** Mencegah pembuatan sesi ujian duplikat akibat double click atau inisialisasi ganda React. Sesi berikutnya akan dialihkan untuk meneruskan sesi yang sedang berjalan.
2.  **Sesi Soal Terkunci (`feedback` caching):** Ketika tes pertama kali dibuat, soal-soal acak disimpan permanen di kolom JSON `feedback` pada tabel `SectionAttempt`. Route backend tidak akan melakukan query acak ke tabel `Question` lagi selama sesi tes berlangsung.
3.  **Database Upsert:** Penyimpanan jawaban siswa tidak menggunakan operasi append data baru secara membabi buta, melainkan mengupdate record yang sudah ada berdasarkan id unik untuk mencegah tumpang tindih data jawaban.
4.  **Kontrol Auto-Save (`isCompleted` flag):** Penambahan flag penanda status auto-save untuk mencegah pemindahan seksi tes ke status `COMPLETED` sebelum siswa menekan tombol submit secara sadar.

---

## 4. Temuan Error Linter & Blocker Saat Ini
Sebelum rilis ke tahap produksi, beberapa error linting berikut terdeteksi dan perlu diperbaiki agar kompilasi build Next.js sukses:
1.  **Akses Ref saat Render (`ReadAlongPlayer.tsx`):**
    *   Error: `Cannot access ref value (words.current) during render`.
    *   Saran Solusi: Ubah `words = useRef(...)` menjadi `words = useMemo(() => scenario.targetText.split(/\s+/), [scenario.targetText])`.
2.  **State Cascading Render (`hero-section.tsx`):**
    *   Error: `Calling setState (setMounted(true)) synchronously within an effect can trigger cascading renders`.
    *   Saran Solusi: Bungkus perubahan status mount di dalam asinkronisasi `setTimeout(() => setMounted(true), 50)`.
3.  **Penggunaan tipe `any` (`scoring.ts` & `proxy.ts`):**
    *   Error: TypeScript strict mode melarang penggunaan tipe `any`.
    *   Saran Solusi: Deklarasikan tipe yang eksplisit untuk respons API Gemini/Proxy.
