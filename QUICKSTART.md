# Quick Start - Presensi HMTI 🚀

## 📦 Install Dependencies

```bash
npm install
```

## 🔧 Setup Supabase (5 menit)

### 1. Buat Project Supabase

-   Kunjungi [supabase.com](https://supabase.com) dan buat project baru
-   Tunggu sampai project selesai dibuat

### 2. Konfigurasi Environment

-   Buka file `.env` di root project
-   Isi dengan credentials dari Supabase:
    -   Go to: **Settings** → **API**
    -   Copy **Project URL** ke `EXPO_PUBLIC_SUPABASE_URL`
    -   Copy **anon public** key ke `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Setup Database

-   Go to **SQL Editor** di Supabase
-   Copy & paste SQL dari `SETUP.md` (bagian "Setup Database")
-   Klik **RUN** untuk membuat tables dan sample data

### 4. Test Login

```bash
npm start
```

Login dengan salah satu akun berikut:

-   **NIM**: `2201001` | **Password**: `admin123` (Admin)
-   **NIM**: `2201002` | **Password**: `password123` (User)

## 📱 Hasil

Setelah login berhasil, Anda akan diarahkan ke halaman Home!

---

**Butuh bantuan?** Lihat `SETUP.md` untuk panduan lengkap.
