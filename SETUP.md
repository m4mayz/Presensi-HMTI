# Setup Guide - Presensi HMTI

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy `.env.example` menjadi `.env`:
    ```bash
    cp .env.example .env
    ```
3. Isi `.env` dengan credentials Supabase Anda:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
    ```

### 3. Setup Database

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_photo TEXT,
  nim VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  divisi VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(200),
  qr_code TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Create meeting_participants table (list peserta yang harus hadir)
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Enable Row Level Security (Optional - disable for easier testing)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Insert sample admin user (password: admin123)
INSERT INTO users (nim, name, divisi, password) VALUES
('2201001', 'Admin HMTI', 'Ketua Umum', 'admin123'),
('2201002', 'Faizal Rahman', 'Sekretaris', 'password123'),
('2201003', 'John Doe', 'Bendahara', 'password123');-- Insert sample meetings
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT
  'Rapat Koordinasi Bulanan',
  'Rapat koordinasi rutin setiap bulan',
  CURRENT_DATE + INTERVAL '2 days',
  '08:00:00',
  '12:00:00',
  'Gedung Widana Kencana',
  id
FROM users WHERE nim = '2201001';

INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT
  'Rapat Triwulan',
  'Evaluasi dan perencanaan triwulan',
  CURRENT_DATE + INTERVAL '5 days',
  '09:00:00',
  '12:00:00',
  'Smart Class',
  id
FROM users WHERE nim = '2201001';
```

### 4. Login ke Aplikasi

Gunakan salah satu akun berikut untuk login:

### 5. Replace Logo (Optional)

Jika Anda punya logo HMTI:

1. Replace file `assets/images/icon.png` dengan logo HMTI Anda
2. Ukuran yang disarankan: 512x512px atau lebih

### 6. Jalankan Aplikasi

```bash
# Development
npm start

# iOS
npm run ios

# Android
npm run android
```

## Testing Login

Gunakan salah satu akun berikut untuk login:

-   **NIM**: `2201001` | **Password**: `admin123` (Admin)
-   **NIM**: `2201002` | **Password**: `password123` (User)
-   **NIM**: `2201003` | **Password**: `password123` (User)

## Troubleshooting

### Error: Unable to resolve module

```bash
npm install
npx expo start -c
```

### Error: Supabase connection failed

-   Pastikan `.env` sudah dikonfigurasi dengan benar
-   Cek apakah `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` sudah benar

### Error: Login failed

-   Pastikan user sudah dibuat di Supabase dengan format email `{nim}@hmti.ac.id`
-   Cek apakah password sudah benar
