# Plan: Harga Custom + Diskon + Sequential Session + Quiz KKM

## Context
Platform LMS 3ITC Digital Education perlu tiga fitur baru:
1. **Harga kustom + diskon** — Admin bisa menginput harga bebas dan persentase diskon; student melihat harga coret
2. **Akses sesi berurutan** — Sesi baru terbuka hanya jika semua pelajaran sesi sebelumnya selesai
3. **Quiz KKM + batas percobaan** — Quiz punya Kriteria Ketuntasan Minimal dan batas jumlah percobaan; lesson quiz dianggap selesai hanya jika KKM terpenuhi

---

## File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/app/store/Store.tsx` | Ubah interface Course (price jadi number, tambah discountPercent), CourseLesson (tambah kkm, maxAttempts), Enrollment (tambah quizAttempts), update COMPLETE_LESSON reducer |
| `src/app/components/CourseEditor.tsx` | Ganti price dropdown → text input (Rp), tambah discount input, tambah QuizEditor fields KKM + maxAttempts |
| `src/app/components/StudentScreens.tsx` | Tampilkan harga coret di CourseCatalog/detail, blok akses sesi jika sesi sebelumnya belum selesai, validasi KKM di quiz submission, track attempt count |

---

## Detail Implementasi

### 1. Store.tsx — Perubahan Interface

```typescript
// Course
price: number;          // ganti dari string, default 0 = gratis
discountPercent: number; // 0–100, default 0

// CourseLesson (untuk type "quiz")
kkm: number;       // 0–100, nilai minimum lulus, default 70
maxAttempts: number; // 0 = tak terbatas, default 0

// Enrollment
quizAttempts: Record<string, number>; // lessonId → jumlah percobaan
```

Reducer `COMPLETE_LESSON`: untuk quiz, hanya masukkan ke `completedLessons` jika skor ≥ KKM.

Tambah action `RECORD_QUIZ_ATTEMPT` untuk increment counter percobaan.

Default data kursus bestehend di Store perlu di-migrate: `price: 0`, `discountPercent: 0`, setiap lesson quiz `kkm: 70, maxAttempts: 0`.

### 2. CourseEditor.tsx — UI Admin

**Tab "Info Dasar" — Harga:**
- Ganti `<Select>` price dengan dua input berdampingan:
  - Input teks `Rp ___` untuk harga (number input, min 0)
  - Input `Diskon %` (0–100), tampilkan preview "Harga setelah diskon: Rp X"
- Simpan sebagai `price: number` dan `discountPercent: number`

**QuizEditor di LessonRow:**
- Tambah dua field di bagian atas/bawah QuizEditor:
  - `KKM (%)` — number input 0–100
  - `Batas Percobaan` — number input, 0 = tak terbatas

### 3. StudentScreens.tsx — Perubahan Student

**Tampilan Harga (CourseCatalog + CourseDetail):**
```
Jika discountPercent > 0:
  <span class="line-through text-muted">Rp {price.toLocaleString()}</span>
  <span class="text-primary font-bold">Rp {discountedPrice.toLocaleString()}</span>
  <Badge>-{discountPercent}%</Badge>
Jika price === 0:
  <span>Gratis</span>
Jika price > 0 tanpa diskon:
  <span>Rp {price.toLocaleString()}</span>
```

**Akses Sesi Berurutan (CurriculumSidebar + LessonViewer):**
- Helper `isModuleUnlocked(moduleIndex, completedLessons, curriculum)`:
  - Module index 0 selalu terbuka
  - Module index N terbuka hanya jika semua lesson di module N-1 ada di completedLessons
- Di sidebar: sesi terkunci tampil dengan ikon 🔒 dan semua lesson-nya disable
- Di LessonViewer: jika lesson dipilih dari module yang terkunci, tampilkan pesan "Selesaikan semua pelajaran di sesi sebelumnya terlebih dahulu"

**Quiz KKM + Percobaan:**
- Saat submit quiz:
  1. Increment `quizAttempts[lessonId]` via `RECORD_QUIZ_ATTEMPT`
  2. Hitung skor: `(correct / total) * 100`
  3. Jika skor ≥ kkm: tampilkan sukses, aktifkan tombol "Tandai Selesai"
  4. Jika skor < kkm: tampilkan pesan gagal + skor + KKM yang dibutuhkan
  5. Jika `maxAttempts > 0` dan `attempts >= maxAttempts`: disable tombol retry, tampilkan "Batas percobaan tercapai"
- Tombol "Tandai Selesai" hanya muncul jika quiz sudah lulus KKM (atau bukan tipe quiz)

---

## Backward Compatibility
- Data lama di localStorage: field baru (`discountPercent`, `kkm`, `maxAttempts`, `quizAttempts`) diberi default via nullish coalescing `?? 0` dan `?? {}` saat dibaca, tidak perlu migrasi eksplisit
- `price` lama berupa string ("Free", "Rp 49k") perlu di-handle: di Store initialization, cek jika typeof price === "string" dan konversi ke number

---

## Verifikasi
1. Buka CourseEditor → Tab Info Dasar: input harga Rp 150000, diskon 20% → preview menampilkan "Rp 120.000"
2. Di katalog/detail kursus student: harga asli dicoret, harga diskon tampil bold
3. Buat kursus dengan 2 sesi masing-masing 2 lesson → Sesi 2 terkunci di sidebar sampai kedua lesson Sesi 1 selesai
4. Buat quiz dengan KKM 80%, jawab salah semua → muncul pesan gagal, tidak bisa tandai selesai
5. Jawab benar ≥ 80% → muncul sukses, tombol "Tandai Selesai" aktif
6. Set maxAttempts 2, gagal 2x → tombol retry disabled
