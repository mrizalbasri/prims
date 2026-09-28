# PRISM Prototype Design Specification: English-First Core Loop

**Versi:** 1.0.0  
**Status:** Validated Design  
**Target Pilot:** President University Pekanbaru  
**Tujuan Strategis:** Membuktikan siklus penuh (Assessment & Learning Loop) pada prototype Bahasa Inggris sebelum diekspansi menjadi platform lintas mata pelajaran/kuliah (*multi-subject*).

---

## 1. Ringkasan Eksekutif & Visi Produk

PRISM dirancang dengan arsitektur **Assessment & Adaptive Learning Engine**. Untuk tahap pembuktian (*pilot prototype*), sistem difokuskan 100% pada **Bahasa Inggris Akademik** guna memenuhi kebutuhan mahasiswa baru President University Pekanbaru.

Setelah siklus ini terbukti andal, pola data dan mesin evaluasi ini dapat diadopsi untuk mata kuliah lain (seperti Pemrograman, Akuntansi, atau Matematika) dengan memanfaatkan struktur tabel dan alur penilaian yang sama.

---

## 2. Siklus Inti Mahasiswa (The 4-Stage Core Loop)

Alur utama yang dibuktikan pada prototype ini terdiri dari 4 tahapan berkesinambungan:

```
[ 1. Placement Test ] 
        ↓
[ 2. Diagnostik Kelemahan ] 
        ↓
[ 3. Modul Latihan Terarah (Vocab/Writing/Speaking) ] 
        ↓
[ 4. Tes Ulang (Retake) & Perbandingan Skor ]
```

### Tahap 1: Placement Test (Diagnostik Awal)
* Mahasiswa mengerjakan 5 bagian ujian:
  1. **Vocabulary** (Pilihan ganda)
  2. **Grammar & Structure** (Pilihan ganda)
  3. **Reading Comprehension** (Paragraf & pertanyaan)
  4. **Writing** (Esai pendek dinilai kriteria AI)
  5. **Speaking** (Membaca/berbicara dengan rekaman audio)
* Skor dihitung otomatis dan dikelompokkan ke dalam level CEFR (A1, A2, B1, B2, C1).

### Tahap 2: Hasil & Diagnostik Kelemahan
* Halaman hasil menampilkan:
  - Skor keseluruhan & Level CEFR.
  - Grafik radar sub-kemampuan (*Sub-skill Breakdown*).
  - **Actionable Call-to-Action (Rekomendasi Cerdas):** Sistem secara otomatis menandai sub-kemampuan yang paling rendah (misal: "Kemampuan Menulis Anda masih B1. Disarankan latihan 3 sesi Writing Practice").
  - Tombol langsung menuju modul belajar terkait.

### Tahap 3: Modul Belajar Mandiri Terarah
1. **Vocabulary Flashcards (Spaced Repetition + Audio):**
   - Kartu kata akademik (Definisi, Contoh kalimat).
   - Tombol audio pengucapan native speaker (Piper TTS via `ai-engine`).
   - Tombol kualitas ingatan (*Ingat / Lupa*) yang otomatis mencatat jadwal pengulangan di tabel `VocabularyProgress`.
2. **Writing Practice Assistant:**
   - Mahasiswa memilih topik tulisan akademik.
   - AI Engine memberikan feedback terstruktur dalam **Bahasa Indonesia**: koreksi tata bahasa, kalimat yang lebih alami, dan estimasi band skor.
3. **Speaking Read-Along & Pronunciation:**
   - Mahasiswa dapat mendengarkan audio peraga kalimat (Piper TTS).
   - Mahasiswa merekam suara membaca teks dengan bantuan penanda kata (*voice tracking*).

### Tahap 4: Tes Ulang (Retake Test) & Progress Tracker
* Setelah menyelesaikan latihan, mahasiswa dapat mengambil tes ulang.
* Dashboard menampilkan **Retake Comparison Card**:
  - Peningkatan skor total (+15 poin).
  - Peningkatan per sub-skill (misal Grammar naik dari 60% menjadi 75%).
  - Membuktikan efektivitas pembelajaran kepada mahasiswa dan pihak kampus.

---

## 3. Arsitektur Teknis & Pembagian Tanggung Jawab

| Komponen | Teknologi | Peran & Tanggung Jawab |
|---|---|---|
| **Frontend UI** | Next.js 16 (App Router), React 19, Tailwind CSS v4 | Antarmuka mahasiswa, audio player, flashcard, progress chart SVG |
| **Backend API** | Next.js Route Handlers (`app/api/*`) | Autentikasi JWT, validasi request, alur bisnis ujian & modul belajar |
| **Database ORM** | PostgreSQL + Prisma ORM v7 | Penyimpanan relasional user, tes, riwayat progres (mendukung `$queryRaw` jika butuh query SQL mentah) |
| **Microservice AI** | Python FastAPI (`ai-engine`) | Layanan internal untuk Piper TTS lokal (audio instan tanpa biaya API) & generator soal |
| **Evaluasi AI** | Gemini API / MiniMax | Penilaian esai writing & feedback transkrip speaking |

---

## 4. Asumsi & Kebutuhan Non-Fungsional (NFR)

1. **Performa Audio:** File audio hasil sintesis Piper TTS diberi header `Cache-Control` sehingga browser mahasiswa menyimpannya secara lokal dan tidak membebani server saat diulang.
2. **Fleksibilitas Skema:** Database menggunakan Prisma ORM yang memudahkan penambahan kolom atau modul baru via `npx prisma db push` tanpa downtime rumit.
3. **Keandalan (Graceful Degradation):** Jika microservice audio lokal mengalami gangguan, antarmuka tetap menyediakan fallback teks dan Web Speech API browser.
4. **Desain Mobile-Friendly:** Seluruh modul latihan dan ujian dapat diakses baik melalui laptop maupun browser ponsel pintar.

---

## 5. Log Keputusan (Decision Log)

* **Keputusan 1:** Fokus penuh menyelesaikan prototype Bahasa Inggris terlebih dahulu sebelum memperluas ke mata kuliah lain.  
  *Alasan:* Kampus membutuhkan pembuktian nyata (*proof of concept*) bahwa siklus tes $\rightarrow$ belajar $\rightarrow$ peningkatan skor benar-benar berhasil.
* **Keputusan 2:** Mempertahankan PostgreSQL + Prisma ORM dan tidak beralih ke SQL murni.  
  *Alasan:* Prisma memberikan kecepatan pengembangan, type safety, dan tetap mendukung raw SQL (`prisma.$queryRaw`) kapan saja dibutuhkan.
* **Keputusan 3:** Backend utama tetap terpusat di Next.js API Routes, dengan `ai-engine` Python difungsikan murni sebagai *sidecar helper* untuk audio & generator soal.  
  *Alasan:* Mencegah kerumitan arsitektur yang berlebihan (prinsip YAGNI dan kemudahan deployment VPS).
