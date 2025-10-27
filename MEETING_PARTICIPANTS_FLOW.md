# Database Schema & Meeting Participants Flow

## ⚠️ PENTING: Meeting Participants

Sistem presensi ini menggunakan **whitelist** untuk mengontrol siapa saja yang harus mengikuti rapat.

### Konsep:

-   **TIDAK SEMUA USER** akan melihat semua rapat
-   User **HANYA melihat rapat** yang mereka terdaftar di tabel `meeting_participants`
-   Rapat yang ditampilkan di home adalah **rapat yang harus diikuti oleh user tersebut**

## Database Tables

### 1. users

Tabel pengguna dengan NIM sebagai identifier utama.

### 2. meetings

Tabel rapat dengan informasi lengkap (title, date, time, location, dll).

### 3. meeting_participants ⭐

**Tabel penting** yang menentukan siapa saja yang harus mengikuti rapat tertentu.

**Kolom:**

-   `meeting_id` - ID rapat
-   `user_id` - ID user yang harus hadir
-   `is_required` - Apakah wajib hadir (default: true)

**Contoh:**

```sql
-- Rapat Koordinasi - hanya untuk 5 orang
INSERT INTO meeting_participants (meeting_id, user_id)
SELECT m.id, u.id
FROM meetings m, users u
WHERE m.title = 'Rapat Koordinasi'
  AND u.nim IN ('20230040262', '20240040305', '20240040282', '20240040043', '20230040065');
```

### 4. attendance

Tabel untuk mencatat kehadiran user pada rapat.

## Query Flow

### Fetch Upcoming Meetings (Home Page)

**SEBELUM (❌ SALAH):**

```typescript
// Mengambil SEMUA rapat - SALAH!
const { data } = await supabase.from("meetings").select("*").gte("date", today);
```

**SESUDAH (✅ BENAR):**

```typescript
// Hanya rapat yang user terdaftar sebagai participant
const { data } = await supabase
    .from("meeting_participants")
    .select(
        `
        meeting:meetings(*)
    `
    )
    .eq("user_id", user.id)
    .gte("meeting.date", today);
```

### Cara Kerja:

1. User login dengan NIM
2. Sistem ambil `user.id` dari database
3. Query ke `meeting_participants` WHERE `user_id = user.id`
4. JOIN dengan tabel `meetings` untuk mendapatkan detail rapat
5. Filter hanya rapat yang tanggalnya >= hari ini
6. Tampilkan di home page

## Helper Functions

File: `lib/meetingParticipants.ts`

### getMeetingParticipants(meetingId)

Ambil semua participant dari suatu rapat.

### checkMustAttend(meetingId, userId)

Cek apakah user harus hadir di rapat tertentu.

### addParticipant(meetingId, userId)

Tambah participant ke rapat.

### addMultipleParticipants(meetingId, userIds[])

Tambah banyak participant sekaligus.

### removeParticipant(meetingId, userId)

Hapus participant dari rapat.

### getUserMeetings(userId)

Ambil semua rapat yang user terdaftar sebagai participant.

### getAttendanceStats(meetingId)

Ambil statistik kehadiran rapat (total participant, yang hadir, persentase).

### canViewMeeting(meetingId, userId)

Cek apakah user berhak melihat detail rapat (participant atau creator).

## Implementasi di Code

### Home Page (app/(tabs)/home.tsx)

```typescript
const fetchUpcomingMeetings = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split("T")[0];

    // Query meeting_participants, bukan meetings langsung
    const { data } = await supabase
        .from("meeting_participants")
        .select(`meeting:meetings(*)`)
        .eq("user_id", user.id)
        .gte("meeting.date", today)
        .order("meeting.date", { ascending: true })
        .limit(3);

    const meetings = data?.map((item) => item.meeting).filter(Boolean) || [];
    setUpcomingMeetings(meetings);
};
```

### History Page (app/(tabs)/history.tsx)

Query tetap dari tabel `attendance` karena menampilkan riwayat presensi user.

## Contoh Skenario

### Skenario 1: Rapat Divisi Kominfo

-   **Participants**: 5 orang dari Divisi Kominfo
-   **Yang melihat di home**: Hanya 5 orang tersebut
-   **User lain**: Tidak melihat rapat ini di home mereka

### Skenario 2: Rapat Seluruh Anggota

-   **Participants**: Semua user (bisa diisi dengan loop)
-   **Yang melihat di home**: Semua user
-   **Cara insert**:

```sql
INSERT INTO meeting_participants (meeting_id, user_id)
SELECT m.id, u.id
FROM meetings m
CROSS JOIN users u
WHERE m.title = 'Rapat Umum';
```

## Security & Best Practices

1. **Validasi Akses**: Gunakan `canViewMeeting()` sebelum menampilkan detail rapat
2. **Jangan hardcode**: Gunakan query dinamis berdasarkan `user.id`
3. **RLS (Row Level Security)**: Bisa diaktifkan di Supabase untuk keamanan tambahan
4. **Index**: Sudah dibuat index di kolom `user_id` dan `meeting_id` untuk performa

## Testing

### Cara Test:

1. Login dengan NIM: `20230040262` (Faizal Rahman)
2. Cek home page - harus muncul hanya rapat yang dia terdaftar
3. Login dengan NIM lain
4. Harus muncul rapat berbeda (sesuai participants)

### SQL untuk Cek Participants:

```sql
SELECT
    m.title,
    u.name,
    u.nim
FROM meeting_participants mp
JOIN meetings m ON mp.meeting_id = m.id
JOIN users u ON mp.user_id = u.id
WHERE m.title = 'Rapat Koordinasi Bulanan'
ORDER BY u.name;
```
