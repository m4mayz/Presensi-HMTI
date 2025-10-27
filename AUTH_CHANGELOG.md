# 🔐 Authentication System - Changelog

## ✅ Perubahan Sistem Autentikasi

Sistem autentikasi telah diubah dari **Supabase Auth** menjadi **Custom Authentication** menggunakan database users.

### 📋 Perubahan Database

#### Tabel `users` (Baru)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  profile_photo TEXT,           -- NEW: URL foto profil
  nim VARCHAR(20) UNIQUE,       -- Login identifier (numeric)
  name VARCHAR(100),
  password VARCHAR(255),        -- NEW: Password (plain text untuk dev)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Kolom yang Dihapus:**

-   ❌ `email` - Tidak lagi diperlukan

**Kolom yang Ditambahkan:**

-   ✅ `profile_photo` - URL foto profil user
-   ✅ `password` - Password untuk autentikasi

### 🔄 Cara Login

**Sebelumnya:**

-   Login menggunakan email format: `{nim}@hmti.ac.id`
-   Password dari Supabase Authentication
-   Menggunakan Supabase Auth SDK

**Sekarang:**

-   ✅ Login langsung dengan **NIM** (tanpa format email)
-   ✅ Password dari database tabel `users`
-   ✅ Session disimpan di AsyncStorage
-   ✅ Tidak menggunakan Supabase Auth

### 📝 Contoh Login

```typescript
// Input user
NIM: 2201001
Password: admin123

// Di database
SELECT * FROM users WHERE nim = '2201001' AND password = 'admin123'
```

### 🔧 Files yang Diubah

1. **`types/database.types.ts`**

    - Updated `users` table type
    - Added `profile_photo` and `password` fields
    - Removed `email` field

2. **`context/AuthContext.tsx`**

    - Removed Supabase Auth dependency
    - Implemented custom login with NIM
    - Session management with AsyncStorage
    - Direct database query for authentication

3. **`app/(tabs)/home.tsx`**

    - Removed separate user data fetch
    - User data now comes directly from AuthContext
    - Added profile photo support

4. **`SETUP.md` & `QUICKSTART.md`**
    - Updated setup instructions
    - Removed Supabase Auth setup
    - Added sample users with passwords

### 🎯 Sample Users

```
NIM: 2201001 | Password: admin123     | Divisi: Ketua Umum
NIM: 2201002 | Password: password123  | Divisi: Sekretaris
NIM: 2201003 | Password: password123  | Divisi: Bendahara
NIM: 2201004 | Password: password123  | Divisi: Humas
NIM: 2201005 | Password: password123  | Divisi: Keilmuan
```

### ⚠️ Security Notes

**Current Implementation (Development):**

-   ❌ Passwords stored as **plain text** in database
-   ❌ No password hashing
-   ❌ Not suitable for production

**TODO for Production:**

```typescript
// Implement password hashing with bcrypt
import bcrypt from "bcryptjs";

// When creating user
const hashedPassword = await bcrypt.hash(password, 10);

// When logging in
const isValid = await bcrypt.compare(password, user.password);
```

### 📦 Dependencies

**Added:**

-   `@react-native-async-storage/async-storage` - Session storage
-   `bcryptjs` - Password hashing (ready for implementation)

**Removed:**

-   Dependency on Supabase Auth

### 🚀 Migration Steps

Jika Anda sudah memiliki data lama:

1. **Backup data lama:**

    ```sql
    SELECT * FROM users;
    ```

2. **Drop & Recreate table:**

    ```sql
    DROP TABLE IF EXISTS attendance CASCADE;
    DROP TABLE IF EXISTS meetings CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    ```

3. **Run new setup:**

    - Copy SQL dari `SQL_SETUP.sql`
    - Jalankan di Supabase SQL Editor

4. **Verify:**
    ```sql
    SELECT nim, name FROM users;
    ```

### 📱 Testing

1. Start app: `npm start`
2. Login dengan NIM: `2201001`
3. Password: `admin123`
4. Verify home page shows user data

### 🔮 Future Improvements

-   [ ] Implement bcrypt password hashing
-   [ ] Add password reset functionality
-   [ ] Add email verification (optional)
-   [ ] Implement refresh token mechanism
-   [ ] Add session expiration
-   [ ] Add "Remember Me" functionality
-   [ ] Add biometric authentication
