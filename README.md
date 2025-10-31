[![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-54-orange.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

# Presensi HMTI - Aplikasi Presensi Rapat

Aplikasi mobile berbasis React Native untuk sistem presensi rapat HMTI (Himpunan Mahasiswa Teknik Informatika) menggunakan teknologi QR Code.

## Fitur Utama

-   **Autentikasi User** - Login menggunakan NIM dan password
-   **Manajemen Rapat** - Buat, edit, dan hapus rapat
-   **Manajemen Peserta** - Tambah peserta rapat dengan filter divisi
-   **Scan QR Code** - Presensi dengan scan QR Code yang dinamis (60 detik expiry)
-   **Riwayat Presensi** - Lihat riwayat kehadiran dengan status (hadir/terlewat)
-   **Profile Management** - Upload foto profil dan ganti password
-   **About Page** - Informasi pembuat aplikasi

## Tech Stack

-   **Framework**: React Native 0.81.5 + Expo SDK 54
-   **Language**: TypeScript 5.9.2
-   **Database**: Supabase (PostgreSQL)
-   **Navigation**: Expo Router (File-based routing)
-   **State Management**: React Context API
-   **UI Components**: React Native + Expo Vector Icons
-   **Camera**: expo-camera 17.0.8 (QR Scanner)
-   **QR Code**: react-native-qrcode-svg 6.3.16
-   **Image**: expo-image-picker 17.0.8

## Prerequisites

-   Node.js (v18 atau lebih baru)
-   npm atau yarn
-   Expo CLI
-   Akun Supabase (untuk database)
-   Akun EAS (untuk build production)

## Instalasi

1. **Clone repository**

    ```bash
    git clone https://github.com/m4mayz/Presensi-HMTI.git
    cd Presensi-HMTI
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Setup Supabase**

    - Buat project baru di [Supabase](https://supabase.com)
    - Jalankan script `SQL_SETUP.sql` di Supabase SQL Editor
    - Copy URL dan Anon Key dari project settings

4. **Setup Environment Variables**

    Buka file `eas.json` dan update environment variables:

    ```json
    {
        "build": {
            "preview": {
                "env": {
                    "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
                    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
                    "EXPO_PUBLIC_ADMIN_WHATSAPP": "628xxxxxxxxxx"
                }
            }
        }
    }
    ```

5. **Start development server**

    ```bash
    npx expo start
    ```

    Pilih platform:

    - Press `a` untuk Android emulator
    - Press `i` untuk iOS simulator
    - Scan QR code dengan Expo Go app

## 📱 Build APK untuk Production

### Setup EAS Build

1. **Install EAS CLI**

    ```bash
    npm install -g eas-cli
    ```

2. **Login ke EAS**

    ```bash
    eas login
    ```

3. **Configure project**

    ```bash
    eas build:configure
    ```

### Build Android APK

**Preview Build** (untuk testing):

```bash
eas build --platform android --profile preview
```

**Production Build** (untuk rilis):

```bash
eas build --platform android --profile production
```

Build akan dijalankan di cloud EAS. Setelah selesai, download APK dari dashboard atau link yang diberikan.

## Struktur Project

```
Presensi-HMTI/
├── app/                      # File-based routing (Expo Router)
│   ├── (auth)/              # Auth pages (login)
│   ├── (tabs)/              # Tab navigation (home, history)
│   ├── meeting-details/     # Detail rapat
│   ├── edit-meeting/        # Edit rapat
│   ├── add-participants/    # Tambah peserta
│   ├── qr-code/            # Tampil QR Code
│   ├── scan-qr.tsx         # Scanner QR
│   ├── create-meeting.tsx  # Buat rapat baru
│   ├── profile.tsx         # Profile user
│   ├── change-password.tsx # Ganti password
│   ├── about.tsx           # About page
│   └── _layout.tsx         # Root layout
├── components/              # Reusable components
│   ├── QRScanner.tsx       # QR Scanner component
│   ├── PageHeader.tsx      # Header component
│   └── common/             # Common components
├── constants/              # Constants (colors, styles)
├── context/               # React Context (AuthContext)
├── hooks/                 # Custom hooks (useAuth)
├── lib/                   # Libraries (Supabase config)
├── types/                 # TypeScript types
└── assets/               # Images, fonts

```

## Default Login

Setelah menjalankan `SQL_SETUP.sql`, beberapa user akan otomatis dibuat:

**Admin/Creator:**

-   NIM: `20230040068`
-   Password: `20230040068`
-   Nama: Maulid Yuswan Hidayat
-   Role: Dapat membuat rapat

**Regular User:**

-   NIM: `20240040305`
-   Password: `20240040305`
-   Nama: M. Hafidz Al-Hasan

## Cara Penggunaan

### Membuat Rapat Baru

1. Login dengan akun yang memiliki permission `can_create_meeting`
2. Di halaman Home, tekan tombol **"+ Buat Rapat"**
3. Isi form:
    - Judul rapat
    - Deskripsi (opsional)
    - Tanggal & waktu
    - Lokasi (opsional)
4. Tekan **"Buat Rapat"**

### Menambah Peserta Rapat

1. Buka detail rapat
2. Tekan tombol **"Tambah Peserta"**
3. Filter berdasarkan divisi (opsional)
4. Centang user yang akan ditambahkan
5. Tekan **"Simpan"**

### Scan QR Code Presensi

1. Buka detail rapat
2. Tekan tombol **"Tampilkan QR Code"** (untuk pembuat rapat)
3. Peserta scan QR Code dengan tombol **"Scan QR"**
4. QR Code berlaku 60 detik, refresh otomatis

### Melihat Riwayat Presensi

1. Buka tab **"Riwayat"**
2. Lihat daftar rapat yang sudah diikuti
3. Status:
    - 🟢 **Hadir** - Sudah presensi
    - 🔴 **Terlewat** - Tidak hadir (rapat sudah selesai)

## Row Level Security (RLS)

Database menggunakan RLS untuk keamanan. Policy yang diterapkan:

-   User hanya bisa update data diri sendiri
-   Hanya creator yang bisa edit/delete rapat
-   Attendance hanya bisa diisi oleh user yang bersangkutan
-   Meeting participants hanya bisa diubah oleh creator

## Tim Pengembang

**UI/UX Designer:**

-   Faizal Rahman
-   Instagram: [@fzlrmn](https://instagram.com/fzlrmn)

**Mobile Developer:**

-   Akmal Zaidan Hibatullah
-   Instagram: [@m4mayz](https://instagram.com/m4mayz)
-   GitHub: [@m4mayz](https://github.com/m4mayz)

## License

Copyright © 2025 KOMINFO HMTI Universitas Nusa Putra
