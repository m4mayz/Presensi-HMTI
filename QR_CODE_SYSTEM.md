# Sistem QR Code Presensi - Dokumentasi

## Overview

Sistem QR Code dinamis untuk presensi rapat dengan keamanan berbasis timestamp.

## Fitur Utama

### 1. QR Code Dinamis

-   **Regenerasi Otomatis**: QR Code berubah setiap 1 menit
-   **Timestamp-based**: Menggunakan timestamp (menit) sebagai validasi
-   **Format Data**:
    ```json
    {
        "meetingId": "uuid-rapat",
        "timestamp": 1234567890,
        "type": "attendance"
    }
    ```

### 2. Validasi Berlapis

#### a. Validasi QR Code

-   ✅ Format JSON valid
-   ✅ Memiliki field: meetingId, timestamp, type
-   ✅ Type harus "attendance"
-   ✅ Timestamp harus sesuai dengan menit saat ini (tidak expired)

#### b. Validasi Rapat

-   ✅ Rapat exists di database
-   ✅ Rapat belum berakhir (cek waktu end_time)

#### c. Validasi User

-   ✅ User adalah peserta rapat (ada di meeting_participants)
-   ✅ User belum melakukan presensi sebelumnya

### 3. Alur Kerja

#### Untuk Pembuat Rapat:

1. Buka detail rapat
2. Klik tombol "QR Code"
3. QR Code ditampilkan dengan countdown timer
4. QR Code otomatis refresh setiap 1 menit

#### Untuk Peserta Rapat:

1. Buka detail rapat
2. Klik tombol "Scan QR Code untuk Presensi"
3. Izinkan akses kamera
4. Arahkan kamera ke QR Code
5. Sistem otomatis memvalidasi dan mencatat presensi
6. Status langsung berubah menjadi "Hadir"

## Keamanan

### 1. Expired QR Code

-   QR Code hanya valid selama 1 menit
-   Setelah 1 menit, timestamp tidak cocok dan QR Code ditolak
-   Mencegah penyalahgunaan screenshot QR Code

### 2. Validasi Peserta

-   Hanya peserta terdaftar yang bisa presensi
-   Sistem cek di tabel meeting_participants

### 3. Validasi Waktu

-   Tidak bisa presensi jika rapat sudah berakhir
-   Cek waktu end_time rapat

### 4. Prevent Double Attendance

-   Sistem cek apakah user sudah presensi
-   Tampilkan peringatan jika sudah presensi

## File Terkait

1. **app/qr-code/[id].tsx**

    - Halaman generate & display QR Code
    - Auto-refresh setiap 1 menit
    - Countdown timer
    - Hanya untuk pembuat rapat

2. **app/scan-qr.tsx**

    - Halaman scan QR Code
    - Validasi berlapis
    - Auto-mark attendance
    - Untuk semua peserta

3. **components/QRScanner.tsx**

    - Komponen kamera scanner
    - Request permission
    - Handle barcode scanning

4. **app/meeting-details/[id].tsx**
    - Tombol "QR Code" untuk creator
    - Tombol "Scan QR Code" untuk peserta
    - Conditional rendering based on role & status

## Dependencies

```json
{
    "react-native-qrcode-svg": "^6.3.14",
    "react-native-svg": "^15.9.0",
    "expo-camera": "~16.0.13",
    "expo-barcode-scanner": "~14.0.7"
}
```

## UI/UX Features

### QR Code Page:

-   ✅ Info card dengan judul rapat
-   ✅ QR Code dalam card putih dengan shadow
-   ✅ Timer countdown real-time
-   ✅ Instruksi penggunaan step-by-step

### Scanner Page:

-   ✅ Frame scanning dengan border biru
-   ✅ Overlay untuk fokus scanning
-   ✅ Processing indicator saat validasi
-   ✅ Alert informatif untuk setiap status

## Status Flow

```
User Scan QR
    ↓
Validate Format → Invalid → Alert "QR Code Tidak Valid"
    ↓ Valid
Validate Timestamp → Expired → Alert "QR Code Kadaluarsa"
    ↓ Valid
Check Meeting Exists → Not Found → Alert "Rapat Tidak Ditemukan"
    ↓ Found
Check Meeting Time → Ended → Alert "Rapat Telah Berakhir"
    ↓ Active
Check Participant → Not Participant → Alert "Bukan Peserta"
    ↓ Is Participant
Check Attendance → Already → Alert "Sudah Presensi"
    ↓ Not Yet
Mark Attendance → Success → Alert "Berhasil" + Navigate
```

## Catatan Implementasi

1. **Timestamp Precision**: Menggunakan `Math.floor(Date.now() / 60000)` untuk presisi per menit
2. **Auto-refresh**: Menggunakan `setInterval` dengan cleanup di `useEffect`
3. **Conditional Rendering**: Tombol scan hanya muncul jika:
    - Bukan creator
    - Belum hadir
    - Rapat belum berakhir
4. **Permission Handling**: Request camera permission dengan fallback UI yang jelas
