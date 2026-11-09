# Belajar Vibe Coding

Backend REST API yang dibangun menggunakan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL**.

## 🛠️ Tech Stack
- **Runtime**: [Bun](https://bun.sh/) (v1.4.4+)
- **Framework**: [ElysiaJS](https://elysiajs.com/) v2
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit`
- **Database**: MySQL (driver `mysql2`)
- **Language**: TypeScript

---

## 📁 Struktur Direktori
```text
├── drizzle/              # File migrasi SQL hasil generate Drizzle
├── src/
│   ├── db/
│   │   ├── index.ts      # Inisialisasi koneksi MySQL & client Drizzle
│   │   └── schema/
│   │       ├── index.ts  # Export semua skema tabel
│   │       └── users.ts  # Definisi skema tabel users
│   ├── routes/
│   │   ├── health.ts     # Health check endpoint (/health)
│   │   └── users.ts      # User CRUD endpoints (/users)
│   └── index.ts          # Entry point server Elysia
├── .env.example          # Template konfigurasi environment
├── drizzle.config.ts     # Konfigurasi Drizzle ORM
├── package.json          # Dependency & npm scripts
└── tsconfig.json         # Konfigurasi TypeScript
```

---

## 🚀 Quick Start

### 1. Instalasi Dependency
```bash
bun install
```

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi MySQL:
```env
PORT=3000
DATABASE_URL=mysql://root:password@localhost:3306/belajar_vibe_coding
```

### 3. Migrasi Database
Generate file migrasi dari schema:
```bash
bun run db:generate
```
Push schema langsung ke database (development) atau jalankan migrasi:
```bash
bun run db:push
# atau
bun run db:migrate
```

Buka Drizzle Studio untuk inspeksi visual tabel:
```bash
bun run db:studio
```

### 4. Menjalankan Server
Mode Development (hot-reload):
```bash
bun run dev
```

Mode Production:
```bash
bun run start
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | Root greeting & metadata API |
| `GET` | `/health` | Server health check & uptime |
| `GET` | `/users` | Mengambil daftar pengguna |
| `POST` | `/users` | Menambahkan pengguna baru (`{ name, email }`) |
