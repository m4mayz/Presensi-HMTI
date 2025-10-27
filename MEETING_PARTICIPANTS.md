# 👥 Meeting Participants Feature

## 📋 Overview

Fitur untuk menentukan peserta yang **harus hadir** dalam rapat. Hanya user yang ditambahkan sebagai participant yang wajib hadir dan bisa melakukan presensi.

---

## 🗂️ Database Schema

### Tabel: `meeting_participants`

```sql
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  UNIQUE(meeting_id, user_id)
);
```

**Columns:**

-   `id` - Primary key
-   `meeting_id` - Foreign key ke tabel meetings
-   `user_id` - Foreign key ke tabel users
-   `is_required` - Apakah user wajib hadir (default: true)
-   `created_at` - Timestamp

**Constraints:**

-   UNIQUE: Satu user hanya bisa ditambahkan sekali per meeting

---

## 🎯 Use Cases

### 1. **Rapat Koordinasi Bulanan**

✅ Semua anggota harus hadir

```
Participants: 2201001, 2201002, 2201003, 2201004, 2201005
```

### 2. **Rapat Triwulan**

✅ Hanya pengurus inti

```
Participants: 2201001 (Ketua), 2201002 (Sekretaris), 2201003 (Bendahara)
```

### 3. **Rapat Kerja**

✅ Divisi tertentu saja

```
Participants: 2201001 (Ketua), 2201004 (Humas), 2201005 (Keilmuan)
```

---

## 💻 Query Examples

### Ambil Semua Participants untuk Rapat

```sql
SELECT
  mp.*,
  u.nim,
  u.name,
  u.divisi
FROM meeting_participants mp
JOIN users u ON u.id = mp.user_id
WHERE mp.meeting_id = 'meeting-uuid-here';
```

### Cek Apakah User Harus Hadir

```sql
SELECT EXISTS (
  SELECT 1
  FROM meeting_participants
  WHERE meeting_id = 'meeting-uuid'
    AND user_id = 'user-uuid'
) as must_attend;
```

### Ambil Daftar Hadir & Tidak Hadir

```sql
-- Yang sudah hadir
SELECT
  u.nim,
  u.name,
  a.check_in_time
FROM meeting_participants mp
JOIN users u ON u.id = mp.user_id
LEFT JOIN attendance a ON a.meeting_id = mp.meeting_id AND a.user_id = mp.user_id
WHERE mp.meeting_id = 'meeting-uuid'
  AND a.id IS NOT NULL;

-- Yang belum hadir
SELECT
  u.nim,
  u.name
FROM meeting_participants mp
JOIN users u ON u.id = mp.user_id
LEFT JOIN attendance a ON a.meeting_id = mp.meeting_id AND a.user_id = mp.user_id
WHERE mp.meeting_id = 'meeting-uuid'
  AND a.id IS NULL;
```

---

## 🔧 TypeScript Integration

### Types

```typescript
import { MeetingParticipant } from "@/types/database.types";

// Get participants with user data
interface ParticipantWithUser extends MeetingParticipant {
    user: User;
}
```

### Fetch Participants

```typescript
// Get all participants for a meeting
const { data: participants } = await supabase
    .from("meeting_participants")
    .select(
        `
    *,
    user:users(*)
  `
    )
    .eq("meeting_id", meetingId);

// Check if current user must attend
const { data: mustAttend } = await supabase
    .from("meeting_participants")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("user_id", currentUserId)
    .single();

if (mustAttend) {
    // User harus hadir di rapat ini
}
```

### Add Participants (Admin only)

```typescript
// Add single participant
await supabase.from("meeting_participants").insert({
    meeting_id: meetingId,
    user_id: userId,
    is_required: true,
});

// Add multiple participants
const participants = ["user-id-1", "user-id-2", "user-id-3"];
await supabase.from("meeting_participants").insert(
    participants.map((userId) => ({
        meeting_id: meetingId,
        user_id: userId,
        is_required: true,
    }))
);
```

### Remove Participant

```typescript
await supabase
    .from("meeting_participants")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("user_id", userId);
```

---

## 📊 Attendance Stats

### Get Attendance Rate

```sql
SELECT
  m.title,
  COUNT(DISTINCT mp.user_id) as total_participants,
  COUNT(DISTINCT a.user_id) as total_attended,
  ROUND(
    COUNT(DISTINCT a.user_id)::numeric /
    NULLIF(COUNT(DISTINCT mp.user_id), 0) * 100,
    2
  ) as attendance_rate
FROM meetings m
JOIN meeting_participants mp ON mp.meeting_id = m.id
LEFT JOIN attendance a ON a.meeting_id = m.id
WHERE m.id = 'meeting-uuid'
GROUP BY m.id, m.title;
```

---

## 🎨 UI/UX Suggestions

### Create Meeting Form

```
Title: [Input]
Date: [DatePicker]
Time: [TimePicker]
Location: [Input]
Description: [TextArea]

Participants (Required):
☑ All Members
☐ Core Team Only
☐ Custom Selection
  ☑ Faizal Rahman (Sekretaris)
  ☑ John Doe (Bendahara)
  ☐ Jane Smith (Humas)
  ☐ Ahmad Hidayat (Keilmuan)
```

### Meeting Detail

```
Participants (5):
✅ Faizal Rahman (Hadir - 08:05)
✅ John Doe (Hadir - 08:10)
❌ Jane Smith (Belum Hadir)
✅ Ahmad Hidayat (Hadir - 08:03)
✅ Admin HMTI (Hadir - 07:58)

Attendance Rate: 80% (4/5)
```

---

## 🚀 Benefits

1. **Targeted Meetings** - Hanya panggil yang diperlukan
2. **Better Tracking** - Tahu siapa yang wajib hadir vs opsional
3. **Attendance Rate** - Hitung persentase kehadiran
4. **Notifications** - Kirim reminder hanya ke participants
5. **Access Control** - Bisa digunakan untuk restrict QR code scanning

---

## 📝 Sample Data

Sudah ada di `SQL_SETUP.sql`:

**Rapat Koordinasi Bulanan:**

-   All 5 members (2201001-2201005)

**Rapat Triwulan:**

-   Core team (2201001, 2201002, 2201003)

**Rapat Kerja:**

-   Specific divisions (2201001, 2201004, 2201005)

**Rapat Persiapan Hakrah 2025:**

-   4 members (2201001-2201004)

---

## 🔮 Future Enhancements

-   [ ] Add `is_optional` flag untuk participant opsional
-   [ ] Add `role` field (e.g., "speaker", "attendee", "note-taker")
-   [ ] Notification system untuk participants
-   [ ] Bulk import participants dari CSV
-   [ ] Participant groups/templates
-   [ ] RSVP feature (confirm/decline)
