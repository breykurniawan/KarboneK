# Karboneʞ - Website Fullstack

Website Karboneʞ lengkap dengan manajemen event, anggota, berita, dan admin dashboard.

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

| Role    | Email                    | Password  |
|---------|--------------------------|-----------|
| Admin   | admin@karbone-k.id       | admin123  |
| Member  | adi@karbone-k.id         | adi123    |
| Member  | siti@karbone-k.id        | siti123   |
| Member  | roni@karbone-k.id        | roni123   |

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

## Deployment

Aplikasi dapat di-deploy di berbagai platform:

### Railway.app (Recommended)

Deployment termudah dengan automatic scaling dan managed PostgreSQL.

```bash
# 1. Connect GitHub repo ke Railway
# 2. Set environment variables (JWT_SECRET, CORS_ORIGIN)
# 3. Railway akan auto-deploy
```

📖 **Panduan detail:** [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)

### Raspberry Pi / Self-Hosted

Deploy menggunakan Docker + Nginx di server sendiri.

```bash
# Setup & deploy
bash deploy.sh
```

📖 **Panduan detail:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Website Karboneʞ - Tempat berkembang bersama!**
