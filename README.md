# Club Tenis Meja Garuda - Website Fullstack

Website club tenis meja lengkap dengan manajemen event, anggota, berita, dan admin dashboard.

## Tech Stack

- **Backend**: Node.js + Express + Prisma ORM + SQLite
- **Frontend**: React + Vite + TailwindCSS + React Router

## Cara Menjalankan

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
node prisma/seed.js
npm run dev
```

Backend berjalan di: http://localhost:5000

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: http://localhost:5173

## Akun Demo

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@pingpongclub.com     | admin123  |
| Member| member@pingpongclub.com    | member123 |

## Fitur

- Landing page dengan hero, statistik, event, berita
- Halaman event dengan filter status/kategori/level
- Detail event + pendaftaran peserta (anggota & non-anggota)
- Pendaftaran non-anggota dengan biaya berbeda (tanpa perlu login)
- Halaman anggota club
- Berita & pengumuman
- Auth (register/login/profil)
- Admin dashboard (CRUD event dengan toggle non-anggota, kelola anggota, berita)
- 10 event selesai + 3 event akan datang sebagai data awal
