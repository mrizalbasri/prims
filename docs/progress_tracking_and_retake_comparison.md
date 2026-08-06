# Progress Tracking & Retake Comparison (Student Dashboard)

Dokumen ini merinci arsitektur, alur data, dan komponen visualisasi untuk fitur **Progress Tracking** dan **Komparasi Tes Ulang (Retake Comparison)** pada platform **PRISM**.

---

## 📌 Ikhtisar Fitur
Fitur ini dirancang untuk memberikan umpan balik visual dan analitis kepada mahasiswa mengenai perkembangan kemampuan bahasa Inggris mereka setelah mengambil Placement Test pertama maupun tes ulang (retake test).

### Key Highlights:
1. **Score Trend Chart (SVG Line & Bar Chart)**: Menampilkan tren perkembangan skor kumulatif per sesi ujian secara visual.
2. **Retake Comparison Card**: Komparasi langsung antara *Placement Test Pertama (Initial Test)* dan *Tes Ulang Terbaru (Latest Retake)*.
3. **Sub-Skill Delta Breakdown**: Perbandingan skor per keahlian (*Vocabulary, Grammar, Reading, Listening, Writing, Speaking*) lengkap dengan selisih (+/- poin) dan persentase perubahan.
4. **Attempt History List**: Daftar riwayat seluruh sesi ujian yang diselesaikan beserta level CEFR dan tanggal pelaksanaan.

---

## 🛠️ Arsitektur & Komponen

### 1. API Endpoint Backend
* **File Path:** [app/api/student/history/route.ts](file:///d:/Coding/prism/app/api/student/history/route.ts)
* **Method:** `GET`
* **Deskripsi:** Mengambil seluruh entri `TestAttempt` dengan status `COMPLETED` milik pengguna yang sedang terautentikasi (JWT session).
* **Urutan Data:** Urut secara kronologis (`completedAt: 'asc'`).
* **Format Output JSON:**
  ```json
  {
    "totalAttempts": 2,
    "history": [
      {
        "attemptId": "clx...",
        "attemptNumber": 1,
        "completedAt": "2026-06-15T09:00:00.000Z",
        "overallScore": 65,
        "level": "INTERMEDIATE",
        "cefrLevel": "B1",
        "scores": {
          "vocabulary": 70,
          "grammar": 60,
          "listening": 65,
          "reading": 70,
          "writing": 60,
          "speaking": 60
        }
      },
      {
        "attemptId": "clx...",
        "attemptNumber": 2,
        "completedAt": "2026-07-25T14:30:00.000Z",
        "overallScore": 78,
        "level": "ADVANCED",
        "cefrLevel": "B2",
        "scores": {
          "vocabulary": 85,
          "grammar": 75,
          "listening": 80,
          "reading": 80,
          "writing": 70,
          "speaking": 75
        }
      }
    ]
  }
  ```

---

### 2. Komponen UI Frontend
* **File Path:** [components/student/ProgressTracker.tsx](file:///d:/Coding/prism/components/student/ProgressTracker.tsx)
* **Props Interface:**
  ```typescript
  interface ProgressTrackerProps {
    history: TestHistoryItem[];
    allowRetake?: boolean;
    onRetakeTest?: () => void;
    isStartingRetake?: boolean;
  }
  ```
* **Perilaku Rendering:**
  * **1x Tes:** Menampilkan daftar sesi tes pertama, grafik poin awal, dan tombol opsi tes ulang (jika diizinkan oleh admin kampus).
  * **>1x Tes:** Menampilkan Card Komparasi Hasil Tes Ulang dengan kalkulasi otomatis selisih skor (`scoreDelta`) dan persentase perkembangan (`percentDelta`).

---

### 3. Halaman Dashboard Mahasiswa
* **File Path:** [app/student/page.tsx](file:///d:/Coding/prism/app/student/page.tsx)
* **Alur Pemanggilan Data:**
  Memanggil API `/api/student/stats` dan `/api/student/history` secara paralel menggunakan `Promise.all` di dalam `useEffect`.
  ```typescript
  const [statsRes, historyRes] = await Promise.all([
    fetch("/api/student/stats"),
    fetch("/api/student/history"),
  ]);
  ```

---

## 🎨 Desain & Aksesibilitas
* **Tanpa Dependensi Eksternal Heavy**: Dibuat menggunakan SVG bawaan & Tailwind CSS v4 untuk kecepatan muat (*lightweight & zero dependencies*).
* **Dark Mode Native**: Mendukung tema gelap dengan varian Tailwind `dark:bg-gray-855`, `dark:text-white`, dan batasan kontras rasio WCAG AA.

---

## 📈 Rencana Penguatan Selanjutnya
1. **Export PDF Progress Report**: Fasilitas cetak laporan perkembangan mandiri untuk mahasiswa.
2. **Filter Berdasarkan Rentang Waktu**: Menyaring grafik berdasarkan semester atau bulan.
