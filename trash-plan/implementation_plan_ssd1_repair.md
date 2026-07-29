# Rencana Diagnosis & Tindakan: Perbaikan drive sda (ssd1)

Dokumen ini berisi analisis hasil diagnosis fisik serta rencana langkah penanganan untuk memulihkan atau mendiagnosis ulang SSD `sda` (`ssd1`) yang saat ini mengalami kegagalan baca-tulis (I/O Error).

---

## Analisis Masalah Saat Ini

Dari hasil diagnosis awal melalui kernel log (`dmesg`), ditemukan indikasi masalah berikut:
1. **I/O Error & Aborted Command**:
   ```
   I/O error, dev sda, sector 500118020 op 0x0:(READ)
   Buffer I/O error on dev sda1, logical block 500115972, async page read
   Sense Key : Aborted Command
   ```
   Kernel mengalami kegagalan saat mencoba membaca sektor di area akhir SSD (sektor ~500118020). Pengontrol SSD membatalkan perintah baca setelah menunggu beberapa lama (131 detik).
2. **filesystem Hilang**: Perintah `blkid /dev/sda1` tidak mengembalikan tanda tangan filesystem (UUID/Type). Ini menandakan tabel filesystem pada partisi tersebut sudah rusak atau tidak terbaca lagi akibat bad sector.
3. **Status SMART**: Uji kesehatan firmware (`SMART PASSED`) bernilai baik, namun ini hanya verifikasi dasar kontroler SSD dan tidak menjamin fisik sel flash memori bebas dari kerusakan (*bad sectors*).

---

## Rencana Langkah Kerja

Untuk menentukan apakah SSD ini masih layak digunakan atau harus diganti, berikut adalah langkah investigasi terstruktur:

### Langkah 1: Pemeriksaan Fisik Koneksi (Langkah Terpenting)
Seringkali error `Aborted Command` dan I/O error disebabkan oleh **kabel data SATA yang rusak, longgar, atau port SATA pada motherboard yang kotor/bermasalah**.
*   **Tindakan**: Matikan server homelab Anda, cabut kabel SATA SSD `sda`, bersihkan konektornya, dan pasang kembali ke port SATA yang berbeda menggunakan kabel SATA baru (jika ada).

### Langkah 2: Uji Kesehatan Fisik Mendalam (Bad Block Scan)
Setelah koneksi fisik dipastikan aman, jalankan pemindaian bad block secara read-only untuk memetakan kerusakan sektor:
```bash
# Jalankan badblocks secara read-only (aman untuk data)
badblocks -v /dev/sda
```
*   *Jika mengeluarkan daftar angka sektor yang rusak*: SSD ini memiliki bad block fisik dan tidak aman untuk menyimpan data VM/LXC karena data akan korup kembali di kemudian hari.

### Langkah 3: Uji Format Ulang (Jika Data Lama Tidak Diperlukan)
Jika data lama di dalam `ssd1` sudah tidak Anda butuhkan, kita bisa mencoba menghapus tabel partisi lama dan memformat ulang disk untuk melihat apakah kontroler SSD mampu melakukan pemetaan ulang (*remapping*) sektor rusak secara otomatis:
```bash
# 1. Hapus tabel partisi lama dan buat baru (GPT)
parted /dev/sda mklabel gpt

# 2. Buat partisi baru menggunakan seluruh kapasitas
parted -a optimal /dev/sda mkpart primary ext4 0% 100%

# 3. Format dengan filesystem ext4
mkfs.ext4 /dev/sda1
```
*   *Jika proses mkfs.ext4 berhasil tanpa error*: SSD masih bisa dicoba untuk digunakan kembali.
*   *Jika proses mkfs.ext4 macet/gagal*: SSD mengalami kerusakan sel flash permanen.

---

## Rekomendasi Akhir
> [!CAUTION]
> Menggunakan SSD yang memiliki *bad sector* untuk penyimpanan Virtual Machine (PaaS/Database) sangat berisiko tinggi. Jika Langkah 2 menemukan bad blocks atau Langkah 3 gagal, solusi terbaik dan paling aman adalah **mengganti SSD tersebut dengan drive baru** demi kestabilan server homelab Anda.
