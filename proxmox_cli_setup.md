# Panduan CLI Pembuatan LXC dan VM di Proxmox VE

Dokumen ini berisi kumpulan perintah CLI (Command Line Interface) Proxmox VE untuk membuat LXC (menggunakan `pct`) dan VM (menggunakan `qm` dengan metode Cloud-Init) langsung melalui koneksi SSH ke server Proxmox Anda.

> [!NOTE]
> Pastikan Anda telah masuk ke shell root Proxmox VE melalui SSH sebelum menjalankan perintah-perintah di bawah ini. Sesuaikan ID VM/LXC (`100`, `101`, dst.) serta nama storage (`local`, `local-lvm`, `ssd2`, dll.) dengan konfigurasi storage di PVE Anda.

---

## 1. Persiapan Unduh Template & Image

Sebelum membuat LXC dan VM, unduh template LXC (Ubuntu/Debian) dan image Cloud-Init untuk VM.

> [!WARNING]
> Jika Anda mendapatkan error `template: no such template` saat mencoba mengunduh, hal ini disebabkan karena nama berkas rilis template di server repositori Proxmox telah berubah (misal revisi `-1` berubah menjadi `-2` dst). 
> Ikuti cara di bawah untuk mencari nama template yang tepat sebelum mengunduh.

```bash
# 1. Update daftar template Proxmox
pveam update

# 2. Cari nama tepat template Ubuntu yang tersedia di repositori
pveam available | grep ubuntu

# Contoh keluaran:
# system          ubuntu-22.04-standard_22.04-1_amd64.tar.zst
# system          ubuntu-24.04-standard_24.04-1_amd64.tar.zst   <-- Ambil nama ini

# 3. Unduh template pilihan Anda menggunakan nama tepat hasil pencarian di atas
# (Ganti "ubuntu-24.04-standard_24.04-1_amd64.tar.zst" dengan nama yang muncul pada PVE Anda)
pveam download local ubuntu-24.04-standard_24.04-1_amd64.tar.zst

# 4. Pindah ke direktori penyimpanan ISO/Image untuk mengunduh Cloud-Init image untuk VM
cd /var/lib/vz/template/iso
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

---

## 2. Pembuatan LXC (Proxmox Container)

LXC digunakan untuk aplikasi yang tidak membutuhkan isolasi kernel penuh, seperti Control Plane dan Ingress Router.

### LXC 1: Control Plane & Database (ID: 1000)
*   **Spesifikasi**: 2 Core, 4 GB RAM, 20 GB Disk
*   **Perintah Pembuatan**:

```bash
pct create 1000 local:vztmpl/ubuntu-24.04-standard_24.04-1_amd64.tar.zst \
  -cores 2 \
  -memory 4096 \
  -swap 1024 \
  -hostname paas-control-plane \
  -ostype ubuntu \
  -storage local-lvm \
  -rootfs local-lvm:20 \
  -net0 name=eth0,bridge=vmbr0,firewall=1,ip=dhcp \
  -ssh-public-keys ~/.ssh/authorized_keys \
  -unprivileged 1 \
  -start 1
```

### LXC 2: Ingress & SSL Router (ID: 1100)
*   **Spesifikasi**: 1 Core, 2 GB RAM, 10 GB Disk
*   **Perintah Pembuatan**:

```bash
pct create 1100 local:vztmpl/ubuntu-24.04-standard_24.04-1_amd64.tar.zst \
  -cores 1 \
  -memory 2048 \
  -swap 512 \
  -hostname paas-ingress-router \
  -ostype ubuntu \
  -storage local-lvm \
  -rootfs local-lvm:10 \
  -net0 name=eth0,bridge=vmbr0,firewall=1,ip=dhcp \
  -ssh-public-keys ~/.ssh/authorized_keys \
  -unprivileged 1 \
  -start 1
```

> [!TIP]
> Parameter `-ssh-public-keys ~/.ssh/authorized_keys` secara otomatis menyalin kunci SSH publik Anda dari server Proxmox ke dalam container LXC baru, sehingga Anda bisa langsung masuk via SSH tanpa password.

---

## 3. Pembuatan VM Menggunakan Cloud-Init (Untuk Worker Nodes)

Untuk Worker Nodes, sangat disarankan menggunakan VM penuh (KVM) demi keamanan kontainerisasi (Docker/Runner). Cara tercepat dan terefisien adalah membuat satu VM Template menggunakan image Cloud-Init, lalu meng-klon template tersebut untuk Worker 1 dan Worker 2.

### Langkah A: Membuat VM Template Cloud-Init (ID: 9000)

Jalankan rangkaian perintah berikut untuk membuat base template:

```bash
# 1. Buat VM dengan spesifikasi dasar
qm create 9000 --name ubuntu-cloudinit-template --memory 2048 --cores 2 --cpu host --net0 virtio,bridge=vmbr0

# 2. Impor disk dari image Cloud-Init yang sudah diunduh ke storage local-lvm
qm importdisk 9000 /var/lib/vz/template/iso/noble-server-cloudimg-amd64.img local-lvm

# 3. Hubungkan disk yang diimpor ke interface scsihw virtio SCSI
qm set 9000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-9000-disk-0,discard=on,ssd=1

# 4. Tambahkan drive Cloud-Init
qm set 9000 --ide2 local-lvm:cloudinit

# 5. Atur boot order ke disk utama
qm set 9000 --boot order=scsi0

# 6. Tambahkan serial console (diperlukan untuk cloud-init)
qm set 9000 --serial0 socket --vga serial0

# 7. Konfigurasi awal Cloud-Init (User, SSH Key, dan IP DHCP)
qm set 9000 --ciuser ubuntu
qm set 9000 --sshkeys ~/.ssh/authorized_keys
qm set 9000 --ipconfig0 ip=dhcp

# 8. Ubah VM menjadi Template
qm template 9000
```

### Langkah B: Kloning Template Menjadi Worker Nodes

Setelah template ID `9000` berhasil dibuat, Anda cukup melakukan clone cepat (linked clone) untuk menghemat waktu dan penyimpanan.

#### VM Worker Node 1 (ID: 102)
*   **Kloning**:
    ```bash
    qm clone 9000 102 --name paas-worker-1 --full 0
    ```
*   **Sesuaikan Resource (4 Core, 8 GB RAM, 40 GB Disk)**:
    ```bash
    qm set 102 --cores 4 --memory 8192
    qm resize 102 scsi0 +20G
    qm start 102
    ```

#### VM Worker Node 2 (ID: 103)
*   **Kloning**:
    ```bash
    qm clone 9000 103 --name paas-worker-2 --full 0
    ```
*   **Sesuaikan Resource (4 Core, 8 GB RAM, 40 GB Disk)**:
    ```bash
    qm set 103 --cores 4 --memory 8192
    qm resize 103 scsi0 +20G
    qm start 103
    ```

---

## 4. Perintah Dasar Manajemen CLI Proxmox

Berikut beberapa perintah cepat untuk memantau dan mengelola VM/LXC yang baru dibuat:

| Aksi | Perintah LXC (Container) | Perintah VM (Virtual Machine) |
| :--- | :--- | :--- |
| **Menyalakan** | `pct start <ID>` | `qm start <ID>` |
| **Mematikan** | `pct stop <ID>` | `qm shutdown <ID>` (atau `qm stop <ID>`) |
| **Melihat Status** | `pct status <ID>` | `qm status <ID>` |
| **Masuk ke Shell** | `pct enter <ID>` | `qm terminal <ID>` |
| **Menghapus** | `pct destroy <ID>` | `qm destroy <ID>` |
