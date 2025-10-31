-- ============================================================
-- Presensi HMTI - Database Setup Script
-- ============================================================
-- Aplikasi: Presensi Rapat HMTI
-- Database: Supabase (PostgreSQL)
-- Versi: 1.0.0
-- Terakhir Update: 31 Oktober 2025
-- ============================================================
-- INSTRUKSI:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Copy-paste seluruh script ini
-- 3. Klik "Run" untuk execute
-- 4. Verifikasi semua tabel sudah terbuat di Table Editor
-- ============================================================

-- Enable UUID extension (jika belum ada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (UNCOMMENT untuk reset database)
-- WARNING: Ini akan menghapus SEMUA data!
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS meeting_participants CASCADE;
-- DROP TABLE IF EXISTS meetings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- TABLE: users
-- Menyimpan data user/anggota HMTI
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_photo TEXT,
  nim VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  divisi VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  can_create_meeting BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: meetings
-- Menyimpan data rapat yang dibuat
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(200),
  qr_code TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: attendance
-- Menyimpan data kehadiran peserta rapat
-- Status: 'hadir' atau 'terlewat'
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attendance_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'hadir',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- ============================================================
-- TABLE: meeting_participants
-- Menyimpan daftar peserta yang harus hadir di rapat
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- ============================================================
-- INDEXES
-- Untuk performa query yang lebih cepat
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_nim ON users(nim);
CREATE INDEX IF NOT EXISTS idx_users_divisi ON users(divisi);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Uncomment untuk enable security policies
-- ============================================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all users
-- CREATE POLICY "Users can read all users" ON users
--   FOR SELECT USING (true);

-- Policy: Users can update own profile
-- CREATE POLICY "Users can update own profile" ON users
--   FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can read all meetings
-- CREATE POLICY "Users can read all meetings" ON meetings
--   FOR SELECT USING (true);

-- Policy: Only creators can update/delete their meetings
-- CREATE POLICY "Creators can update own meetings" ON meetings
--   FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Only creators can delete their meetings
-- CREATE POLICY "Creators can delete own meetings" ON meetings
--   FOR DELETE USING (auth.uid() = created_by);

-- ============================================================
-- SAMPLE DATA
-- Data user HMTI untuk testing
-- NOTE: Password menggunakan plain text (NIM sebagai password)
-- Untuk production, gunakan bcrypt hashing!
-- ============================================================
INSERT INTO users (nim, name, divisi, password, can_create_meeting) VALUES
-- Pengurus Inti (Dapat membuat rapat)
('20230040068', 'Maulid Yuswan Hidayat', 'Ketua Himpunan', '20230040068', true),
('20240040246', 'Rezal Fauzian', 'Wakil Ketua Himpunan', '20240040246', true),

-- Biro Administrasi & Kesekretariatan
('20230040062', 'Nabila Aulia Supandi', 'Ketua Biro Administrasi & Kesekretariatan', '20230040062'),
('20240040079', 'Putri Fauzya Rahmah', 'Staff 1 Biro Administrasi & Kesekretariatan', '20240040079'),
('20240040040', 'Reval Mizar Haykal', 'Staff 2 Biro Administrasi & Kesekretariatan', '20240040040'),

-- Biro Keuangan
('20230040327', 'Alya Rojwa Fauziah', 'Ketua Biro Keuangan', '20230040327'),
('20240040072', 'Mifta Siti Mariam', 'Staff 1 Biro Keuangan', '20240040072'),
('20230040040', 'Zara Bilqis', 'Staff 2 Biro Keuangan', '20230040040'),

-- Badan Usaha Milik Organisasi
('20230040184', 'Muhammad Zaky Drajat', 'Ketua Badan Usaha Milik Organisasi', '20230040184'),
('20230040084', 'Neng Endang Nurasih', 'Administrasi & Keuangan BUMO', '20230040084'),
('20240040074', 'Ade Parhan Setiawan', 'Bidang Operasional & Jasa BUMO', '20240040074'),
('20240040073', 'Lukmanul Hakim', 'Bidang Operasional & Jasa BUMO', '20240040073'),
('20240040125', 'Nur Anisa Jamil', 'Bidang Marketing & Media BUMO', '20240040125'),
('20240040296', 'E. Salva Haniva Syah', 'Bidang Marketing & Media BUMO', '20240040296'),
('20240040037', 'Faisal Arif Sulistyo', 'Bidang Marketing & Media BUMO', '20240040037'),
('20240040190', 'M. Ridhollah Ramadhan', 'Bidang Desain BUMO', '20240040190'),

-- Div. Kaderisasi
('20230040067', 'D Best AR', 'Ketua Div. Kaderisasi', '20230040067'),
('20240040028', 'Muhammad Hamudi', 'Edukasi Softskill', '20240040028'),
('20240040065', 'Dede Suryana', 'Edukasi Softskill', '20240040065'),
('20240040177', 'Daniel Pasha Al-Kafi', 'Edukasi Softskill', '20240040177'),
('20240040060', 'Farisa Hilmi', 'Manajemen & Pemantauan', '20240040060'),
('20240040121', 'Ridho Safutra', 'Manajemen & Pemantauan', '20240040121'),
('20240040174', 'M. Dwi Haryanto', 'Manajemen & Pemantauan', '20240040174'),
('20240040068', 'Bayu Prananda Putra', 'Kajian & Advokasi', '20240040068'),
('20240040110', 'Putri Prisilia N.A', 'Kajian & Advokasi', '20240040110'),

-- Div. Humas
('20230040006', 'M Tegar Bachtiar', 'Ketua Div. Humas', '20230040006'),
('20230040330', 'Raka Sugiarto', 'Internal & Administrasi Humas', '20230040330'),
('20240040122', 'Asep Rohmat', 'Internal & Administrasi Humas', '20240040122'),
('20240040095', 'Fathir Maulana Putra', 'Internal & Administrasi Humas', '20240040095'),
('20240040192', 'Dzikril Aziz Hakim', 'Internal & Administrasi Humas', '20240040192'),
('20240040297', 'Ilyas Nazma Esa Iskandar', 'Internal & Administrasi Humas', '20240040297'),
('20230040317', 'M Zaki Basyir', 'Eksternal & Kerja Sama Humas', '20230040317'),
('20240040272', 'Fathir Arrofi', 'Eksternal & Kerja Sama Humas', '20240040272'),
('20240040070', 'Iksanuril Al Fayadh', 'Eksternal & Kerja Sama Humas', '20240040070'),
('20230040195', 'Moch. Salman Alfarizi', 'Hubungan Konsultasi & Profesi Humas', '20230040195'),
('20240040049', 'Pasha Samudra Pratama', 'Hubungan Konsultasi & Profesi Humas', '20240040049'),
('20240040094', 'Bagas Prasetyo Nugroho', 'Hubungan Konsultasi & Profesi Humas', '20240040094'),
('20240040171', 'Haris Ismail', 'Hubungan Konsultasi & Profesi Humas', '20240040171'),

-- Div. Hukam
('20230040122', 'Muhammad Abdul Aziz Iqbal Maulana', 'Ketua Div. Hukam', '20230040122'),
('20230040117', 'Moch Ariezieq Iskandar P', 'Regulasi & Ketertiban', '20230040117'),
('20230040081', 'Agung Fadil Januar', 'Regulasi & Ketertiban', '20230040081'),
('20240040248', 'Reza Alfian Maba', 'Regulasi & Ketertiban', '20240040248'),
('20240040203', 'Mas Oksya Seba King King', 'Riset & Evaluasi', '20240040203'),
('20240040249', 'Muh Rasyah A Boufakar', 'Pencatatan & Arsip', '20240040249'),

-- Div. Akademik & Minat Bakat
('20230040239', 'Rakha Putra Pratama', 'Ketua Div. Akademik & Minat Bakat', '20230040239'),
('20240040086', 'Agnaya Mumtazul Wafir', 'Keinformatikaan & Profesi', '20240040086'),
('20240040182', 'Adhitya Pratama Dwi Putra', 'Keinformatikaan & Profesi', '20240040182'),
('20240040208', 'Ardian Sidik', 'Akademik & Karir', '20240040208'),
('20240040254', 'M Jafar Tella', 'Akademik & Karir', '20240040254'),
('20240040224', 'M Yaman Darmawan', 'Olahraga & Seni Budaya', '20240040224'),
('20240040172', 'Andreas I. Tue', 'Olahraga & Seni Budaya', '20240040172'),
('20240040061', 'Muhamad Reksa Pratama', 'Olahraga & Seni Budaya', '20240040061'),
('20240040197', 'Yovi Andri Dwi Anugrah', 'Penyaluran & Perlombaan', '20240040197'),
('20240040124', 'Nurazizah', 'Penyaluran & Perlombaan', '20240040124'),
('20240040264', 'Salsabila Devina S', 'Penyaluran & Perlombaan', '20240040264'),

-- Div. Kominfo
('20230040262', 'Faizal Rahman', 'Ketua Div. Kominfo', '20230040262', true),
('20240040305', 'M. Hafidz Al-Hasan', 'Visual & Desain', '20240040305', false),
('20240040282', 'Shifa Puteri Nurohman', 'Visual & Desain', '20240040282', false),
('20240040043', 'Muhammad Alfarizzi', 'Visual & Desain', '20240040043', false),
('20240040020', 'Fajar Danuar Permana', 'Visual & Desain', '20240040020', false),
('20240040106', 'Zaskia Bulan Pratama', 'Media, Konten & Publikasi', '20240040106', false),
('20240040213', 'Raysha Imanisa S.', 'Media, Konten & Publikasi', '20240040213', false),
('20240040085', 'Muh. Zacky Maulidin', 'Media, Konten & Publikasi', '20240040085', false),
('20230040235', 'Muhammad Al Fakhreja Dwi Putra', 'Media, Konten & Publikasi', '20230040235', false),
('20240040100', 'Amal Hidayah', 'Website', '20240040100', false),
('20230040065', 'Akmal Zaidan Hibatullah', 'Website', '20230040065', true)
ON CONFLICT (nim) DO NOTHING;

-- ============================================================
-- SAMPLE MEETINGS
-- Data rapat untuk testing
-- ============================================================
-- Rapat 1: Koordinasi Bulanan (Future meeting)
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Koordinasi Bulanan', 
  'Rapat koordinasi rutin setiap bulan untuk membahas program kerja dan evaluasi kegiatan HMTI',
  CURRENT_DATE + INTERVAL '2 days',
  '08:00:00',
  '12:00:00',
  'Gedung Widana Kencana Lt. 3',
  id
FROM users WHERE nim = '20230040068'
ON CONFLICT DO NOTHING;

-- Rapat 2: Rapat Triwulan (Future meeting)
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Evaluasi Triwulan', 
  'Evaluasi dan perencanaan program kerja triwulan mendatang',
  CURRENT_DATE + INTERVAL '5 days',
  '09:00:00',
  '12:00:00',
  'Smart Class A',
  id
FROM users WHERE nim = '20230040262'
ON CONFLICT DO NOTHING;

-- Rapat 3: Rapat Kerja Divisi (Future meeting)
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Kerja Divisi Kominfo', 
  'Pembahasan project website dan konten media sosial semester ini',
  CURRENT_DATE + INTERVAL '7 days',
  '15:00:00',
  '17:00:00',
  'Ruang B4G',
  id
FROM users WHERE nim = '20230040065'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE PARTICIPANTS
-- Peserta rapat untuk testing
-- ============================================================
-- Participants untuk Rapat Koordinasi Bulanan
-- (Pengurus inti + ketua divisi)
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Koordinasi Bulanan'
  AND u.nim IN (
    '20230040068', -- Ketua
    '20240040246', -- Wakil
    '20230040262', -- Ketua Kominfo
    '20230040065', -- Akmal (Website)
    '20240040305'  -- Hafidz (Visual)
  )
ON CONFLICT DO NOTHING;

-- Participants untuk Rapat Evaluasi Triwulan
-- (Core team only)
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Evaluasi Triwulan'
  AND u.nim IN (
    '20230040068',
    '20240040246',
    '20230040262'
  )
ON CONFLICT DO NOTHING;

-- Participants untuk Rapat Kerja Divisi Kominfo
-- (Seluruh anggota Kominfo)
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Kerja Divisi Kominfo'
  AND u.divisi LIKE '%Kominfo%'
ON CONFLICT DO NOTHING;

-- ============================================================
-- PAST MEETING WITH ATTENDANCE
-- Rapat yang sudah selesai + data kehadiran untuk testing
-- ============================================================
-- Past Meeting 1: Rapat Persiapan Hakrah 2025
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Persiapan Hakrah 2025', 
  'Persiapan dan koordinasi acara Hari Keakraban (Hakrah) tahun ini',
  CURRENT_DATE - INTERVAL '3 days',
  '14:00:00',
  '16:00:00',
  'Aula Lt. 2',
  id
FROM users WHERE nim = '20230040068'
ON CONFLICT DO NOTHING;

-- Add participants for past meeting
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Persiapan Hakrah 2025'
  AND u.nim IN (
    '20230040068',
    '20240040246',
    '20230040262',
    '20240040305',
    '20230040065',
    '20240040100'
  )
ON CONFLICT DO NOTHING;

-- Add attendance records (some attended, some missed)
-- Yang HADIR
INSERT INTO attendance (meeting_id, user_id, status, attendance_time)
SELECT 
  m.id,
  u.id,
  'hadir',
  TIMESTAMP '2025-10-28 14:05:00'
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Persiapan Hakrah 2025'
  AND u.nim IN (
    '20230040068', -- Hadir
    '20240040305', -- Hadir
    '20230040065'  -- Hadir
  )
ON CONFLICT DO NOTHING;

-- Yang TERLEWAT (tidak hadir)
INSERT INTO attendance (meeting_id, user_id, status, attendance_time)
SELECT 
  m.id,
  u.id,
  'terlewat',
  TIMESTAMP '2025-10-28 16:01:00' -- Setelah meeting selesai
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Persiapan Hakrah 2025'
  AND u.nim IN (
    '20240040246', -- Terlewat
    '20230040262', -- Terlewat
    '20240040100'  -- Terlewat
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION & SUCCESS MESSAGE
-- ============================================================
DO $$
DECLARE
  user_count INTEGER;
  meeting_count INTEGER;
  participant_count INTEGER;
  attendance_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO meeting_count FROM meetings;
  SELECT COUNT(*) INTO participant_count FROM meeting_participants;
  SELECT COUNT(*) INTO attendance_count FROM attendance;
  
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'DATABASE SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Users created: %', user_count;
  RAISE NOTICE 'Meetings created: %', meeting_count;
  RAISE NOTICE 'Participants added: %', participant_count;
  RAISE NOTICE 'Attendance records: %', attendance_count;
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Default Login:';
  RAISE NOTICE '  Admin: NIM 20230040068, Password: 20230040068';
  RAISE NOTICE '  User:  NIM 20240040305, Password: 20240040305';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Verifikasi di Table Editor bahwa semua tabel sudah ada';
  RAISE NOTICE '  2. Test login dengan kredensial di atas';
  RAISE NOTICE '  3. (Opsional) Enable RLS untuk production';
  RAISE NOTICE '============================================================';
END $$;
