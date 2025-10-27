# Reusable Components Documentation

## 1. MeetingCard

Card untuk menampilkan informasi meeting dengan status kehadiran.

**Props:**

-   `meeting: Meeting` - Data meeting
-   `showAttendanceInfo?: boolean` - Tampilkan info tanggal absen
-   `attendanceDate?: string` - Tanggal dan waktu absen

**Example:**

```tsx
<MeetingCard
    meeting={meetingData}
    showAttendanceInfo
    attendanceDate="10 Okt 2025, 14:58"
/>
```

## 2. UpcomingMeetingCard

Card biru untuk menampilkan meeting yang akan datang.

**Props:**

-   `meeting: Meeting` - Data meeting

**Example:**

```tsx
<UpcomingMeetingCard meeting={meetingData} />
```

## 3. PageHeader

Header halaman dengan back button opsional.

**Props:**

-   `title: string` - Judul halaman
-   `showBackButton?: boolean` - Tampilkan tombol back
-   `subtitle?: string` - Subtitle opsional

**Example:**

```tsx
<PageHeader title="Riwayat Presensi" showBackButton />
```

## 4. EmptyState

Empty state dengan icon dan teks.

**Props:**

-   `icon: string` - Nama icon Ionicons
-   `title: string` - Teks utama
-   `subtitle?: string` - Teks tambahan

**Example:**

```tsx
<EmptyState icon="document-text-outline" title="Belum ada data" />
```

## 5. ProfileMenuItem

Menu item untuk halaman profil.

**Props:**

-   `icon: string` - Nama icon Ionicons
-   `iconColor?: string` - Warna icon
-   `title: string` - Teks menu
-   `subtitle?: string` - Subtitle menu
-   `onPress: () => void` - Handler klik
-   `showChevron?: boolean` - Tampilkan chevron
-   `isLogout?: boolean` - Style logout

**Example:**

```tsx
<ProfileMenuItem
    icon="key-outline"
    title="Ganti Password"
    onPress={handlePress}
/>
```
