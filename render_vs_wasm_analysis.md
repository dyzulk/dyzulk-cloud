# Analisis Arsitektur PaaS: Kontainer Standar (Render.com) vs WebAssembly pada K3s + Envoy

Dokumen ini menganalisis kemampuan infrastruktur **K3s + Envoy** untuk menjalankan platform PaaS dinamis seperti Render.com, serta mengevaluasi batasan jenis beban kerja (web, database, OS, background worker) menggunakan kontainer standar dibanding WebAssembly (Wasm).

---

## 1. Apakah K3s + Envoy Bisa Berjalan Seperti Render.com?

**Ya, sangat bisa.** Bahkan, K3s (Kubernetes) + Envoy adalah fondasi standar industri yang digunakan untuk membangun platform PaaS modern (Render.com sendiri berjalan di atas cluster Kubernetes).

Secara bawaan, K3s menggunakan runtime **containerd** dengan executor **runc** untuk menjalankan kontainer Linux standar (Docker Images). Artinya, jika Anda memilih untuk tidak menggunakan WebAssembly (Wasm) dan tetap menggunakan kontainer tradisional seperti Render.com, infrastruktur K3s + Envoy Anda sudah 100% siap tanpa perlu konfigurasi runtime khusus.

---

## 2. Batasan Kontainer Bawaan: Apakah Hanya untuk Web Saja?

Secara teknis bawaan, kontainer Linux tidak memiliki batasan jenis beban kerja. Kontainer dapat menjalankan apa saja, mulai dari aplikasi web, background worker, hingga database dan sistem operasi mini.

Namun, untuk kebutuhan bisnis PaaS Anda, di mana **kontainer pelanggan harus dipaksa dan dibatasi hanya untuk fungsi Web Service saja (sesuai aturan produk jual)**, Anda dapat menerapkan mekanisme pembatasan khusus pada tingkat orkestrasi K3s dan perutean Envoy.

---

## 3. Mekanisme Membatasi Kontainer agar Hanya Berfungsi Sebagai Web Service

Untuk membatasi agar pelanggan tidak menyalahgunakan kontainer Web Service mereka (misalnya menjadikannya database persisten, OS remote SSH, atau bot background murni), platform Anda dapat menerapkan pembatasan teknis berikut pada manifes Kubernetes:

### A. HTTP/TCP Port Enforcement (Kewajiban Membuka Port Web)
* **Aturan**: Kontainer pelanggan wajib mendengarkan (*listen*) port tertentu yang ditentukan platform (misalnya melalui env `$PORT` seperti 80 atau 10000).
* **Teknis di K3s**: Konfigurasikan **Readiness Probe** dan **Liveness Probe** HTTP/TCP di K3s. Jika kontainer pelanggan menyala tetapi tidak membuka port web atau tidak merespons HTTP handshake dalam kurun waktu 2-3 menit, K3s akan menganggap kontainer tidak sehat (*unhealthy*) dan mematikannya secara otomatis.
* **Hasil**: Pelanggan tidak bisa menjalankan skrip background murni atau bot yang tidak memiliki interface web.

### B. Stateless Enforcement (Menolak Penyimpanan Persisten)
* **Aturan**: Produk Web Service harus bersifat stateless (tidak menyimpan data permanen).
* **Teknis di K3s**: Jangan sediakan manifes `PersistentVolumeClaim` (PVC) untuk tipe produk Web Service. 
* **Hasil**: Pelanggan mungkin bisa mencoba menjalankan database seperti PostgreSQL di dalam kontainer mereka secara ilegal, namun data database tersebut akan terhapus total setiap kali pod melakukan restart, *redeployment*, atau *scaling*. Hal ini membuat kontainer Web Service tidak praktis digunakan sebagai database produksi.

### C. Pembatasan Tulis Sistem File (Read-Only Root Filesystem)
* **Aturan**: Mencegah penulisan file sistem atau instalasi paket OS tambahan secara dinamis saat kontainer berjalan.
* **Teknis di K3s**: Atur `readOnlyRootFilesystem: true` pada `securityContext` Pod kontainer pelanggan. Izinkan penulisan hanya pada direktori temporary (`/tmp`) menggunakan memori sementara (`emptyDir`).
* **Hasil**: Pelanggan tidak bisa memasang paket OS baru menggunakan package manager (seperti `apt-get` atau `apk`) atau menjalankan database yang menulis ke folder sistem standar.

### D. Network Policy Enforcement (Pembatasan Jaringan Inbound)
* **Aturan**: Kontainer pelanggan hanya boleh menerima trafik web dari Envoy Proxy.
* **Teknis di K3s**: Gunakan `NetworkPolicy` Kubernetes untuk menutup semua akses masuk (*inbound*) dari luar cluster langsung ke kontainer, kecuali akses HTTP dari IP Envoy Gateway ke port web kontainer yang ditunjuk.
* **Hasil**: Kontainer tidak bisa digunakan untuk layanan jaringan lain seperti SSH daemon, server game, FTP, atau database yang diakses langsung dari luar.

### E. Quota & Limits (Pembatasan CPU/RAM)
* **Aturan**: Membatasi konsumsi daya komputasi.
* **Teknis di K3s**: Terapkan `resources.limits.memory` (misalnya maks. 512MB) dan `resources.limits.cpu` yang ketat.
* **Hasil**: Jika pelanggan mencoba memproses komputasi berat non-web (seperti crypto mining atau kompresi file raksasa), kontainer akan mengalami *Out-Of-Memory (OOM) Kill* oleh kernel K3s.

---

## 4. Matriks Perbandingan: Kontainer Standar (Render.com) vs WebAssembly (Wasm)

| Dimensi Analisis | Pendekatan Kontainer Standar (Render.com) | Pendekatan WebAssembly (Wasm) |
| :--- | :--- | :--- |
| **Kompatibilitas Aplikasi** | **Sangat Tinggi**. Bisa menjalankan semua bahasa, framework, biner OS, dan library C tanpa modifikasi. | **Sedang**. Aplikasi harus dikompilasi ke target WASI/WASIX. Beberapa library dinamis C belum didukung. |
| **Dukungan Database** | **Sangat Mudah**. PostgreSQL, MySQL, Redis berjalan langsung menggunakan OCI Image resmi. | **Sulit**. Wasm tidak dirancang untuk menjadi stateful database engine lokal; harus menggunakan database eksternal/HTTP proxy. |
| **Konsumsi Resource (RAM)** | Lebih tinggi (minimal 50MB - 100MB per kontainer karena membawa overhead OS mini). | Sangat rendah (di bawah 10MB per modul Wasm). |
| **Cold Start (Startup)** | Detik (3 - 10 detik untuk bootstrap kontainer). | Milidetik (kurang dari 10 milidetik). |
| **Penyimpanan Permanen** | Didukung penuh menggunakan Volume Mount standar Linux (Ext4/XFS). | Terbatas pada virtual memory filesystem atau penyimpanan objek (S3/Cloudflare R2). |

---

## 5. Rekomendasi Pendekatan Hibrida (Hybrid Approach)

Kabar baiknya adalah **K3s tidak memaksa Anda memilih salah satu**. Runtime `containerd` pada K3s dapat menjalankan kontainer standar (Docker) dan pod WebAssembly (Wasm) secara berdampingan dalam satu cluster yang sama melalui definisi `RuntimeClass`.

Untuk membangun platform PaaS yang fleksibel dan layak bisnis, Anda dapat menerapkan strategi berikut:

1. **Gunakan Kontainer Standar (Render.com style) sebagai Fondasi Utama**:
   * Jalankan database pengguna (PostgreSQL/MySQL) sebagai kontainer standar dengan volume persisten.
   * Jalankan aplikasi web dinamis kompleks tradisional (seperti Laravel monolitik lengkap dengan database driver-nya) sebagai kontainer standar.
   * Jalankan background worker sebagai kontainer standar.

2. **Gunakan Wasm untuk Fitur Khusus (Serverless / Edge Functions)**:
   * Sediakan opsi bagi pengguna untuk meng-deploy fungsi mikro (seperti Cloudflare Workers/AWS Lambda) yang berjalan sangat cepat, berbiaya murah, dan hemat memori menggunakan modul Wasm terisolasi.
