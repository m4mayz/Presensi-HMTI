-- Presensi HMTI - Database Setup
-- Jalankan script ini di Supabase SQL Editor

-- Drop existing tables if needed (uncomment to reset)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS meetings (
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
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Create meeting_participants table (list peserta yang harus hadir)
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_nim ON users(nim);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);

-- Enable Row Level Security (Optional - disable for easier testing)
-- Uncomment these lines if you want to enable RLS
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Insert sample users
-- Note: In production, passwords should be hashed with bcrypt
INSERT INTO users (nim, name, divisi, password) VALUES
('20230040068', 'Maulid Yuswan Hidayat', 'Ketua Himpunan', '20230040068'),
('20240040246', 'Rezal Fauzian', 'Wakil Ketua Himpunan', '20240040246'),

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
('20230040262', 'Faizal Rahman', 'Ketua Div. Kominfo', '20230040262'),
('20240040305', 'M. Hafidz Al-Hasan', 'Visual & Desain', '20240040305'),
('20240040282', 'Shifa Puteri Nurohman', 'Visual & Desain', '20240040282'),
('20240040043', 'Muhammad Alfarizzi', 'Visual & Desain', '20240040043'),
('20240040020', 'Fajar Danuar Permana', 'Visual & Desain', '20240040020'),
('20240040106', 'Zaskia Bulan Pratama', 'Media, Konten & Publikasi', '20240040106'),
('20240040213', 'Raysha Imanisa S.', 'Media, Konten & Publikasi', '20240040213'),
('20240040085', 'Muh. Zacky Maulidin', 'Media, Konten & Publikasi', '20240040085'),
('20230040235', 'Muhammad Al Fakhreja Dwi Putra', 'Media, Konten & Publikasi', '20230040235'),
('20240040100', 'Amal Hidayah', 'Website', '20240040100'),
('20230040065', 'Akmal Zaidan Hibatullah', 'Website', '20230040065')
ON CONFLICT (nim) DO NOTHING;

-- Insert sample meetings
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Koordinasi Bulanan', 
  'Rapat koordinasi rutin setiap bulan untuk membahas program kerja',
  CURRENT_DATE + INTERVAL '2 days',
  '08:00:00',
  '12:00:00',
  'Gedung Widana Kencana',
  id
FROM users WHERE nim = '2201001'
ON CONFLICT DO NOTHING;

INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Triwulan', 
  'Evaluasi dan perencanaan program kerja triwulan',
  CURRENT_DATE + INTERVAL '5 days',
  '09:00:00',
  '12:00:00',
  'Smart Class',
  id
FROM users WHERE nim = '2201001'
ON CONFLICT DO NOTHING;

INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Kerja', 
  'Pembahasan project besar semester ini',
  CURRENT_DATE + INTERVAL '10 days',
  '15:00:00',
  '17:00:00',
  'B4G',
  id
FROM users WHERE nim = '2201001'
ON CONFLICT DO NOTHING;

-- Add participants for meetings
-- Rapat Koordinasi Bulanan - All members
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Koordinasi Bulanan'
  AND u.nim IN ('2201001', '2201002', '2201003', '2201004', '2201005')
ON CONFLICT DO NOTHING;

-- Rapat Triwulan - Only core team
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Triwulan'
  AND u.nim IN ('2201001', '2201002', '2201003')
ON CONFLICT DO NOTHING;

-- Rapat Kerja - Specific divisions
INSERT INTO meeting_participants (meeting_id, user_id, is_required)
SELECT 
  m.id,
  u.id,
  true
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Kerja'
  AND u.nim IN ('2201001', '2201004', '2201005')
ON CONFLICT DO NOTHING;

-- Insert sample attendance (past meetings)
-- First create a past meeting
INSERT INTO meetings (title, description, date, start_time, end_time, location, created_by)
SELECT 
  'Rapat Persiapan Hakrah 2025', 
  'Persiapan acara Hakrah tahun ini',
  CURRENT_DATE - INTERVAL '3 days',
  '14:00:00',
  '16:00:00',
  'Aula',
  id
FROM users WHERE nim = '2201001'
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
  AND u.nim IN ('2201001', '2201002', '2201003', '2201004')
ON CONFLICT DO NOTHING;

-- Add attendance records for the past meeting
INSERT INTO attendance (meeting_id, user_id, status)
SELECT 
  m.id,
  u.id,
  'present'
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Persiapan Hakrah 2025'
  AND u.nim IN ('2201002', '2201003', '2201004')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
END $$;
