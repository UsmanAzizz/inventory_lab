# Istilah Keselarasan Layout (Layout Alignment)

Istilah untuk keselarasan tata letak (layout) yang sangat presisi biasanya disebut dengan beberapa istilah dalam desain antarmuka (UI/UX) dan pengembangan web:

1. **Pixel-Perfect Alignment / Pixel-Perfect UI:**
   Ini adalah istilah paling umum. Artinya, setiap elemen diatur hingga tingkat piksel agar posisinya sama persis dengan desain atau dengan halaman lain tanpa ada pergeseran 1 piksel pun.

2. **Spatial Consistency (Konsistensi Spasial):**
   Prinsip UI/UX di mana elemen yang memiliki fungsi atau struktur serupa (seperti judul, *topbar*, tabel) ditempatkan pada koordinat vertikal dan horizontal yang persis sama di setiap halaman. Ini mencegah efek "lompat" (*jumping content*) saat pengguna berpindah halaman.

3. **Baseline Alignment:**
   Berhubungan khusus dengan tipografi dan elemen sejajar. Ini adalah praktik memastikan dasar dari sebuah teks (baseline) atau batas bawah elemen sejajar pada satu garis maya yang sama.

4. **Rhythm / Vertical Rhythm:**
   Pengaturan jarak (margin/padding) yang konsisten secara vertikal di seluruh halaman aplikasi, sehingga ritme visual ketika pengguna melakukan *scrolling* terasa natural dan tidak berantakan.

Dalam kasus perbaikan *topbar* dan tabel sebelumnya, masalah yang terjadi adalah adanya **"Layout Shift"** (pergeseran tata letak) yang sangat kecil saat pindah antar-tab. Dengan mengunci ukuran elemen dan margin menjadi nilai yang mutlak (*fixed height*), kita berhasil mencapai *Pixel-Perfect Spatial Consistency*.

---

## TODO / Hal untuk Dipikirkan Nanti

- **Penanganan Barang Redundan / Bahan Habis Pakai (BHP) di Lab**
  - **Masalah:** Ada barang-barang praktik (contoh: potongan kabel sisa *crimping*, timah solder, *cable ties*) yang masih diakui dan digunakan di lab, tetapi sangat sulit (dan merepotkan) untuk dihitung/di-track satu per satu di sistem.
  - **Solusi Alternatif untuk Nanti:** 
    - Abaikan saja pencatatannya dari sistem inventaris (anggap sebagai *overhead* atau barang bebas pakai).
    - Atau, tambahkan klasifikasi "Lot / Box" (tidak dilacak per satuan/pieces) agar admin tidak kelelahan melakukan *data entry*.
