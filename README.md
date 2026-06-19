# PRISM

Platform placement test Bahasa Inggris + modul pembelajaran mandiri berbasis AI untuk mahasiswa.

## Ringkasan

PRISM dirancang untuk 2 kebutuhan utama:

1. **Placement Test resmi kampus** (Vocabulary, Grammar, Reading, Writing, Speaking)
2. **Modul belajar lanjutan** setelah test (Vocabulary flashcard, Writing practice, Speaking practice)

Target awal: President University Pekanbaru.

## Kenapa PRISM kuat

### Secara akronim

**President Readiness in Inglish Skill Measurement**

### Secara filosofi

Prisma memecah satu cahaya menjadi spektrum warna yang lengkap — merah, kuning, hijau, biru, dan seterusnya.

PRISM bekerja dengan prinsip yang sama: dari satu rangkaian assessment, platform memecah kemampuan bahasa Inggris mahasiswa menjadi komponen yang bisa diukur secara detail:

- Vocabulary
- Grammar
- Reading
- Listening *(dalam roadmap pengembangan)*
- Writing
- Speaking

Hasilnya bukan sekadar satu angka, tapi gambaran kemampuan yang menyeluruh dan dapat ditindaklanjuti.

---

## Tech Stack

- **Framework:** Next.js `16.2.9` (App Router)
- **Language:** TypeScript
- **UI:** React `19`, Tailwind CSS `4`
- **DB:** PostgreSQL + Prisma `7`
- **Auth:** JWT (httpOnly cookie) + `bcryptjs`
- **AI:** Google Gemini + MiniMax (via TokenRouter)

---

## Fitur Utama

### 1) Authentication
- Register / Login
- Role-based redirect (`STUDENT` / `ADMIN`)
- Endpoint profil user aktif (`/api/auth/me`)

### 2) Placement Test
- 5 section: Vocabulary, Grammar, Reading, Writing, Speaking
- Timer per section
- Simpan jawaban + submit test
- Final scoring + level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`)

### 3) Student Dashboard
- Ringkasan hasil test
- Akses modul belajar setelah verifikasi token dosen

### 4) Learning Modules
- **Vocabulary:** flashcard + review
- **Writing:** latihan esai + feedback AI
- **Speaking:** latihan speaking + feedback AI

### 5) Admin
- Dashboard hasil mahasiswa
- Endpoint export hasil

---

## Struktur Proyek

```txt
prism/
├── app/
│   ├── api/                  # Route handlers
│   ├── admin/                # Halaman admin
│   ├── login/                # Halaman login
│   ├── register/             # Halaman register
│   └── student/              # Dashboard, test, result, modules
├── components/               # Komponen UI
├── lib/                      # Auth, scoring, prisma helpers, dll
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seeder utama
│   └── seed-phase2.ts        # Seeder fase 2
├── public/                   # Asset statis
├── SETUP.md                  # Setup detail
└── PRISM_PRD_v2.md           # Product requirements
```

---

## Prasyarat

- Node.js `18+`
- npm
- PostgreSQL `14+`

---

## Setup Cepat

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Akses aplikasi di: `http://localhost:3000`

---

## Environment Variables

Buat file `.env` di root project.

Contoh minimum:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prism_db?schema=public"

# Auth
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"

# AI
GEMINI_API_KEY="your-gemini-api-key"
MINIMAX_API_KEY="your-minimax-api-key"

# Opsional model override
GEMINI_WRITING_MODEL="gemini-2.5-flash"
GEMINI_SPEAKING_MODEL="gemini-2.5-flash"
MINIMAX_MODEL="MiniMax-M3"
MINIMAX_BASE_URL="https://api.tokenrouter.com/v1"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Catatan: untuk endpoint text-based scoring, gunakan model Gemini yang support `generateContent` (misalnya `gemini-2.5-flash`).

---

## Scripts

```bash
npm run dev           # Jalankan dev server
npm run build         # Build production
npm run start         # Jalankan hasil build
npm run lint          # Lint project
npm run seed          # Seed data awal
npm run seed:phase2   # Seed data fase 2
```

---

## Alur User (High Level)

1. User register/login
2. Student masuk dashboard
3. Student mulai placement test
4. Jawaban disimpan dan test disubmit
5. Sistem scoring + hasil level
6. Student melihat hasil
7. Student buka modul belajar (jika akses modul aktif)

---

## Status Implementasi Saat Ini

Project sudah punya fondasi end-to-end, namun beberapa route masih dalam proses sinkronisasi antar:

- kontrak data frontend ↔ backend,
- handler API ↔ Prisma schema,
- status enum pada flow writing/speaking.

Jika kamu ingin menstabilkan dulu sebelum production, fokuskan perbaikan pada:

- `app/api/test/*`
- `app/api/writing/*`
- `app/api/speaking/*`

---

## Dokumentasi Tambahan

- Setup detail: [`SETUP.md`](./SETUP.md)
- Product requirements: [`PRISM_PRD_v2.md`](./PRISM_PRD_v2.md)

---

## Catatan

- Jangan commit API keys ke repository.
- Gunakan database terpisah untuk development dan production.
- Jalankan `npm run lint` setelah perubahan besar.
