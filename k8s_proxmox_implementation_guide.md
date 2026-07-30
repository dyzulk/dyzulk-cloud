# Panduan Implementasi Basis Komputasi: Proxmox VE, K8s (Kubeadm), dan Laravel Control Plane

Dokumen ini merupakan panduan teknis langkah-demi-langkah untuk membangun basis komputasi platform PaaS **dyzulk-cloud** di atas hypervisor Proxmox VE menggunakan sistem operasi Debian. Dokumen ini menjelaskan perbandingan ingress controller, langkah setup klaster Kubernetes standar (K8s) via `kubeadm`, mekanisme orkestrasi Laravel, serta desain integrasi database dan key-value store secara serverless.

---

## 1. Evaluasi Ingress Gateway & Reverse Proxy

Dalam membangun platform PaaS, pemilihan komponen entry point (ingress) sangat menentukan kemudahan otomatisasi rute. Berikut adalah analisis perbandingan antara OpenResty, Envoy, dan Traefik untuk menjawab kebingungan Anda.

### Tabel Perbandingan Ingress

| Kriteria | OpenResty (Nginx + Lua) | Envoy Proxy | Traefik |
| :--- | :--- | :--- | :--- |
| **Karakteristik Utama** | Berbasis event-driven Nginx dengan kapabilitas scripting Lua. | Proxy C++ performa tinggi, dirancang untuk service mesh besar. | Edge router berbasis Go, dirancang khusus untuk container/microservices. |
| **Integrasi Kubernetes** | Rendah. Memerlukan Ingress Controller tambahan atau script reload config kustom. | Tinggi. Menggunakan Envoy Gateway yang mendukung Gateway API. | Sangat Tinggi. Kubernetes-native dengan integrasi CRD (Custom Resource Definitions) bawaan. |
| **Otomatisasi Rute** | Sulit. Setiap aplikasi baru rilis, Nginx harus mereload config (`nginx -s reload`) atau mengambil rute dinamis dari Redis via Lua. | Sangat Sulit. Menggunakan xDS API yang konfigurasinya sangat kompleks (memerlukan control plane kustom). | Sangat Mudah. Traefik otomatis mendeteksi perubahan resource Ingress di Kubernetes secara real-time tanpa restart. |
| **TCP/UDP Streaming** | Mendukung via modul stream bawaan. | Mendukung via filter chains. | Mendukung secara native via CRD `IngressRouteTCP` dan `IngressRouteUDP`. |
| **SSL/TLS & Domain** | Harus dikelola manual atau via script Lua/OpenResty. | Menggunakan SDS (Secret Discovery Service) yang kompleks. | Mendukung otomatisasi Let's Encrypt secara native, serta mudah diintegrasikan dengan wildcard SSL Cloudflare. |

### Mengapa Caddy Diabaikan?
Caddy adalah web server yang sangat baik, namun fitur **Layer 4 (TCP/UDP stream routing)** membutuhkan kompilasi ulang dengan plugin eksternal (`caddy-l4`). Untuk PaaS yang membutuhkan dukungan streaming TCP (seperti database ingress atau SSH routing), memelihara biner Caddy kustom meningkatkan overhead operasional.

### Keputusan: Traefik sebagai Single Ingress Controller di K8s
Kami memilih **Traefik** karena:
1. **Zero-Reload Config**: Ketika Laravel mendaftarkan domain baru customer, Laravel cukup mengirim manifest YAML Ingress ke Kubernetes Master. Traefik akan langsung mendeteksi Ingress tersebut dalam hitungan milidetik tanpa perlu memutus koneksi yang sedang berjalan.
2. **Mendukung Stream**: Traefik mendukung routing TCP/UDP secara native tanpa plugin tambahan, berguna jika kelak Anda ingin mengekspos port non-HTTP.
3. **Penyederhanaan Arsitektur**: Menghilangkan kebutuhan proxy tambahan di edge, mengalirkan traffic dari Cloudflare Tunnel langsung ke Traefik di klaster Kubernetes.

---

## 2. Panduan Setup Klaster Kubernetes Standar (K8s via Kubeadm)

Semua node komputasi menggunakan sistem operasi Debian. Panduan ini menggunakan alat standar industri: `kubeadm`, `kubelet`, `kubectl`, dan runtime `containerd`.

### Langkah 1: Persiapan Debian VM Template di Proxmox
Sebelum membuat VM dari template Debian, pastikan template tersebut dikonfigurasi dengan langkah berikut pada semua node (Master dan Workers):

1. **Nonaktifkan Swap**: Kubernetes memerlukan swap dinonaktifkan untuk stabilitas penjadwalan pod.
   ```bash
   sudo swapoff -a
   sudo sed -i '/swap/s/^/#/' /etc/fstab
   ```

2. **Aktifkan Kernel Modules**: Aktifkan module `overlay` dan `br_netfilter` untuk jaringan container.
   ```bash
   cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
   overlay
   br_netfilter
   EOF

   sudo modprobe overlay
   sudo modprobe br_netfilter
   ```

3. **Konfigurasi Sysctl**: Izinkan IP forwarding dan iptables bridge.
   ```bash
   cat <<EOF | sudo tee /etc/sysctl.d/99-k8s.conf
   net.bridge.bridge-nf-call-iptables  = 1
   net.bridge.bridge-nf-call-ip6tables = 1
   net.ipv4.ip_forward                 = 1
   EOF

   sudo sysctl --system
   ```

4. **Instal Runtime Containerd**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y containerd
   ```

5. **Konfigurasi Containerd (Systemd Cgroup Driver)**:
   Kubernetes memerlukan containerd dikonfigurasi untuk menggunakan driver cgroup systemd.
   ```bash
   sudo mkdir -p /etc/containerd
   containerd config default | sudo tee /etc/containerd/config.toml
   
   # Ubah SystemdCgroup menjadi true
   sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
   
   # Restart containerd
   sudo systemctl restart containerd
   ```

6. **Instal Paket Dependensi Dasar**:
   ```bash
   sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl gpg
   ```

### Langkah 2: Instalasi Kubeadm, Kubelet, dan Kubectl
Jalankan langkah ini di semua node untuk menambahkan repositori resmi Kubernetes dan menginstal perkakas utama:

1. **Tambahkan GPG Key Kubernetes**:
   ```bash
   curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
   ```

2. **Tambahkan Repositori APT**:
   ```bash
   echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
   ```

3. **Instal Perkakas Utama (Tahan Versi Agar Tidak Auto-update)**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y kubelet kubeadm kubectl
   sudo apt-mark hold kubelet kubeadm kubectl
   ```

### Langkah 3: Inisialisasi Master Node (`paas-k8s-master` - VM 20002)
Jalankan perintah inisialisasi berikut hanya di VM Master. Kita menggunakan CIDR Flannel (`10.244.0.0/16`) sebagai jaringan pod:

```bash
sudo kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --apiserver-advertise-address=10.30.30.10 \
  --node-name paas-k8s-master
```

Setelah proses inisialisasi selesai, konfigurasikan `kubectl` untuk user non-root Anda:
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Simpan perintah `kubeadm join` yang ditampilkan di akhir output inisialisasi untuk mendaftarkan worker node kelak.

### Langkah 4: Pasang Pod Network CNI (Flannel)
Pada node Master, pasang Flannel sebagai penyedia jaringan container:
```bash
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

### Langkah 5: Hubungkan Worker Nodes (`paas-worker-1` & `paas-worker-2`)
Pada masing-masing VM Worker, setelah menyelesaikan Langkah 1 & 2, jalankan perintah `kubeadm join` yang Anda dapatkan dari langkah Master:

```bash
sudo kubeadm join 10.30.30.10:6443 \
  --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH_CA_CERT>
```

Verifikasi dari node Master bahwa semua node telah bergabung dan berstatus `Ready`:
```bash
kubectl get nodes
```

### Langkah 6: Instalasi Traefik Ingress Controller via Helm
Karena kita menggunakan Kubernetes standar (bukan K3s), kita harus memasang Ingress Controller secara manual. Helm digunakan untuk menginstalnya.

1. **Instal Helm di Master Node**:
   ```bash
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

2. **Pasang Traefik via Helm**:
   Konfigurasikan Traefik agar menggunakan NodePort statis `30080` untuk HTTP dan `30443` untuk HTTPS:
   ```bash
   helm repo add traefik https://traefik.github.io/charts
   helm repo update
   
   kubectl create namespace ingress-traefik
   
   helm install traefik traefik/traefik \
     --namespace ingress-traefik \
     --set ports.web.nodePort=30080 \
     --set ports.websecure.nodePort=30443 \
     --set service.type=NodePort
   ```

---

## 3. Mekanisme Komunikasi Laravel Control Plane dengan K8s

Laravel Control Plane (`paas-control-plane` - LXC 10000) bertindak sebagai otak orkestrasi platform PaaS Anda. Laravel harus dapat berkomunikasi dengan API Server Kubernetes secara aman.

```
+------------------------------------+          +----------------------------------+
|    paas-control-plane (LXC 10000)  |          |     paas-k8s-master (VM 20002)   |
|                                    |          |                                  |
|   +----------------------------+   |  HTTPS   |   +--------------------------+   |
|   |  Laravel Job Orchestrator  |== |=========>|   |   Kubernetes API Server  |   |
|   |  (Uses Kubeconfig Token)   |   | (Port    |   |   (Port 6443)            |   |
|   +----------------------------+   |  6443)   |   +--------------------------+   |
+------------------------------------+          +----------------------------------+
```

### 1. Pengaturan Akses API K8s (Kubeconfig)
1. Salin file `/etc/kubernetes/admin.conf` dari K8s Master ke server Laravel, simpan secara aman di folder storage:
   `/var/www/dyzulk-cloud/storage/app/k8s/kubeconfig.yaml`
2. Pastikan hak akses file dibatasi agar hanya bisa dibaca oleh user web server (misal: `www-data`):
   ```bash
   chmod 600 /var/www/dyzulk-cloud/storage/app/k8s/kubeconfig.yaml
   sudo chown www-data:www-data /var/www/dyzulk-cloud/storage/app/k8s/kubeconfig.yaml
   ```

### 2. Autentikasi Aman dengan ServiceAccount (RBAC)
Untuk keamanan produksi, Laravel tidak boleh menggunakan akses `admin` utama Kubernetes. Kita harus membuat ServiceAccount dengan akses terbatas hanya pada namespace aplikasi customer (misal: namespace `customer-apps`).

Buat file manifest RBAC di K8s Master:
```yaml
# laravel-rbac.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: customer-apps
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: laravel-orchestrator
  namespace: customer-apps
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: customer-apps
  name: app-manager
rules:
- apiGroups: ["", "apps", "networking.k8s.io", "traefik.io"]
  resources: ["deployments", "services", "pods", "ingresses", "ingressroutes", "secrets", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: laravel-orchestrator-binding
  namespace: customer-apps
subjects:
- kind: ServiceAccount
  name: laravel-orchestrator
  namespace: customer-apps
roleRef:
  kind: Role
  name: app-manager
  apiGroup: rbac.authorization.k8s.io
```
Terapkan manifest tersebut:
```bash
kubectl apply -f laravel-rbac.yaml
```

Generate token untuk ServiceAccount tersebut dan gunakan token ini di dalam kubeconfig Laravel untuk membatasi hak akses Laravel hanya pada namespace `customer-apps`.

### 3. Cara Laravel Mengeksekusi Manifest K8s
Laravel dapat mengeksekusi perintah kubectl secara lokal menggunakan Symfony Process. Pendekatan ini sangat stabil karena menggunakan CLI resmi.

Contoh implementasi di Laravel Service:
```php
namespace App\Services;

use Symfony\Component\Process\Process;

class KubernetesService
{
    protected string $kubeconfig;

    public function __construct()
    {
        $this->kubeconfig = storage_path('app/k8s/kubeconfig.yaml');
    }

    public function applyManifest(string $yamlContent): string
    {
        // Tulis manifest sementara
        $tempFile = tempnam(sys_get_temp_dir(), 'k8s_');
        file_put_contents($tempFile, $yamlContent);

        $process = new Process([
            'kubectl',
            '--kubeconfig=' . $this->kubeconfig,
            'apply',
            '-f',
            $tempFile
        ]);

        $process->run();
        unlink($tempFile);

        if (!$process->isSuccessful()) {
            throw new \Exception('Gagal menerapkan manifest K8s: ' . $process->getErrorOutput());
        }

        return $process->getOutput();
    }
}
```

---

## 4. Aliran Trafik: Ingress Router & Cloudflare Tunnel

Integrasi Cloudflare Tunnel menjamin klaster Anda tetap aman di belakang Proxmox tanpa perlu membuka IP publik (Port Forwarding) pada router internet Anda.

```
[ Pengguna Internet ] -- HTTPS --> [ Cloudflare Edge Network ]
                                              |
                                              | (Outbound Secure Tunnel)
                                              v
                                  [ paas-ingress-router (LXC 10001) ]
                                  [ cloudflared agent               ]
                                              |
                                              | (Local LAN HTTP Forward)
                                              v
                                  [ Traefik Ingress (K8s Workers)   ]
                                  [ (Worker 1 / 2 - Port 30080)     ]
                                              |
                                              | (Internal Pod Route)
                                              v
                                  [ Customer App Pods               ]
```

### 1. Konfigurasi `cloudflared` di `paas-ingress-router` (LXC 10001)
`cloudflared` bertindak sebagai bridge. Dia dipasang di LXC mandiri untuk menjaga performa dan isolasi keamanan.

File konfigurasi `/etc/cloudflared/config.yml` pada LXC 10001:
```yaml
tunnel: 4a2b9c8d-e1f2-3g4h-5i6j-7k8l9m0n1o2p
credentials-file: /etc/cloudflared/tunnel-credentials.json

ingress:
  # Rute untuk domain platform utama (Laravel Dashboard)
  - hostname: dashboard.dyzulk.cloud
    service: http://10.20.20.10:80 # Mengarah langsung ke Nginx Laravel

  # Rute wildcard untuk subdomain customer default
  - hostname: "*.dyzulk.cloud"
    service: http://10.30.30.11:30080 # Mengarah ke Traefik Ingress di Worker 1 (NodePort HTTP)

  # Catch-all untuk custom domain customer (Cloudflare for SaaS)
  - hostname: "*"
    service: http://10.30.30.11:30080 # Mengarah ke Traefik Ingress di Worker 1 (NodePort HTTP)
```

### 2. Preservasi Host Header
Ketika pengguna mengakses `customerdomain.com`, Cloudflare Tunnel otomatis mengirimkan request tersebut ke Traefik dengan HTTP Header `Host: customerdomain.com` yang tetap utuh. Traefik menggunakan header ini untuk mencocokkan aturan routing yang didaftarkan oleh Laravel.

### 3. Mekanisme Kustom Domain (Cloudflare for SaaS)
Untuk memungkinkan customer menggunakan domain mereka sendiri (misal: `app.customer.com`):
1. **CNAME Record**: Customer mengarahkan DNS CNAME `app.customer.com` ke `fallback.dyzulk.cloud`.
2. **Fallback Origin**: Di dashboard Cloudflare Anda, buat CNAME `fallback.dyzulk.cloud` yang mengarah ke Tunnel ID Anda.
3. **Cloudflare Custom Hostname API**: Saat customer mendaftarkan domain di Laravel dashboard, Laravel mengirimkan request API ke Cloudflare untuk menambahkan Hostname baru. Cloudflare otomatis menerbitkan sertifikat SSL Edge untuk domain customer tersebut secara instan.
4. **K8s Ingress Generation**: Laravel men-apply manifest Ingress baru ke K8s Master:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: customer-app-ingress
     namespace: customer-apps
   spec:
     rules:
     - host: app.customer.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: customer-app-service
               port:
                 number: 80
   ```
5. Traefik mendeteksi manifest ini, memetakan rute, dan langsung melayani traffic HTTPS untuk `app.customer.com`.

---

## 5. Detail Spesifikasi Node & Alokasi Resource Proxmox VE

Semua node berjalan di atas Debian 12 (Bookworm). Berikut rekomendasi tipe virtualisasi dan alokasi resource minimum:

| ID | Nama Node | Tipe | CPU Core | RAM | Storage | Peran & Konfigurasi Utama |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **10000** | `paas-control-plane` | LXC | 2 | 2 GB | 20 GB SSD | Laravel Dashboard, API, Queue Worker. |
| **10001** | `paas-ingress-router`| LXC | 1 | 1 GB | 10 GB SSD | `cloudflared` client, static bridge. |
| **10002** | `paas-private-registry`| LXC | 2 | 2 GB | 20 GB SSD + Bind Mount HDD | Docker Registry: File system bind mount ke HDD 2TB host Proxmox. |
| **20002** | `paas-k8s-master` | VM | 2 | 2 GB | 20 GB SSD | Kubernetes Control Plane (kubeadm). Tanpa beban kerja aplikasi customer. |
| **20003** | `paas-runner-builder` | VM | 4 (Host) | 8 GB | 50 GB SSD | Build Engine. Terisolasi dari cluster agar build CPU-heavy tak mengganggu worker. |
| **20000** | `paas-worker-1` | VM | 4 | 8 GB | 50 GB SSD | K8s Node Worker: Tempat menjalankan container aplikasi customer. |
| **20001** | `paas-worker-2` | VM | 4 | 8 GB | 50 GB SSD | K8s Node Worker: Replikasi / high-availability worker. |
| **10004** | `paas-db-gateway` | LXC | 4 | 8 GB | 100 GB SSD | Database Host (Postgres, MariaDB, MySQL) untuk serverless. |
| **10005** | `paas-kv-gateway` | LXC | 2 | 4 GB | 20 GB SSD | Redis/Valkey Gateway. |

---

## 6. Desain Node Database & Key-Value (Simulasi Serverless)

Untuk menjual database dan caching dengan karakteristik "serverless" (kemudahan provisioning cepat, scaling koneksi, dan akses HTTP), berikut adalah arsitektur yang diimplementasikan:

### 1. Database Gateway (`paas-db-gateway` - LXC 10004)
Untuk mensimulasikan database serverless seperti Supabase atau Neon:
* **Connection Pooling (PgBouncer)**:
  Aplikasi serverless / microservices sering melakukan buka-tutup koneksi secara instan, yang dapat membanjiri memory PostgreSQL. Kita pasang **PgBouncer** di depan PostgreSQL pada LXC database. Pod customer terhubung ke PgBouncer (Port 6432) bukan langsung ke Postgres (Port 5432). PgBouncer akan menjaga pool koneksi aktif tetap efisien.
* **Otomatisasi Provisioning via Laravel**:
  Ketika customer menekan tombol "Create Database" pada Dashboard Laravel, Laravel mengeksekusi command SQL berikut secara asinkron ke database server:
  ```sql
  CREATE DATABASE db_customer_abc;
  CREATE USER user_customer_abc WITH PASSWORD 'random_secure_password';
  GRANT ALL PRIVILEGES ON DATABASE db_customer_abc TO user_customer_abc;
  ```
* **Isolasi Storage**:
  Untuk mencegah satu customer menghabiskan storage SSD database, gunakan kuota disk pada sistem penyimpanan Proxmox (misal: volume ZFS per database) atau batasi ukuran data via parameter konfigurasi PostgreSQL/MySQL.

### 2. Key-Value Gateway (`paas-kv-gateway` - LXC 10005)
Untuk mensimulasikan caching serverless seperti Upstash (REST-based Redis):
* **HTTP REST Proxy (Webdis / Valkey HTTP)**:
  Banyak web service modern, khususnya yang berjalan di runtime WebAssembly (Wasm) atau Edge Workers, tidak memiliki akses penuh ke raw TCP sockets (hanya bisa melakukan `fetch` HTTP).
  Kami memasang **Webdis** (HTTP/REST interface untuk Redis) di depan engine Redis/Valkey.
  Aplikasi customer dapat menulis/membaca cache hanya dengan melakukan HTTP Request:
  ```bash
  # Menyimpan key
  curl http://10.40.40.20:7379/SET/app_key/hello_world
  
  # Mengambil key
  curl http://10.40.40.20:7379/GET/app_key
  ```
* **Isolasi Redis ACL**:
  Gunakan fitur Redis ACL (Access Control Lists) untuk membatasi akses command. Saat database dibuat, Laravel men-generate user ACL Redis:
  ```
  user user_customer_abc on >password_hash ~app:customer_abc:* +@all -config
  ```
  Ini mengisolasi cache customer agar mereka hanya bisa mengakses key dengan prefix `app:customer_abc:*` dan menonaktifkan command berbahaya seperti `CONFIG` atau `FLUSHALL`.

---

## 7. Langkah Memulai Implementasi (Action Plan)

1. **Siapkan VM & LXC di Proxmox**: Buat semua kontainer dan VM sesuai dengan tabel alokasi resource di Bab 5.
2. **Konfigurasi Jaringan**: Pastikan IP statis diatur pada masing-masing VM/LXC dan buat firewall rule di Proxmox agar Subnet Database (`10.40.40.0/24`) hanya menerima koneksi dari Subnet Kubernetes (`10.30.30.0/24`) dan Subnet Management (`10.20.20.0/24`).
3. **Inisialisasi Klaster Kubernetes**: Ikuti petunjuk Bab 2 untuk mengaktifkan Master via `kubeadm`, memasang Flannel CNI, dan mendaftarkan Worker nodes.
4. **Setup Traefik via Helm**: Pasang Traefik Ingress Controller di klaster K8s dengan NodePort statis `30080` untuk HTTP.
5. **Setup Registry & Bind Mount**: Buat LXC registry dengan HDD bind mount untuk menyimpan container image hasil build.
6. **Integrasikan Laravel**: Salin kubeconfig admin K8s, konfigurasikan ServiceAccount RBAC, dan tes komunikasi dasar dari Laravel dengan membaca daftar node K8s menggunakan kubectl.
7. **Hubungkan Cloudflare Tunnel**: Jalankan `cloudflared` di LXC Ingress, hubungkan ke akun Cloudflare Anda, dan arahkan rute wildcard ke NodePort Traefik `30080` pada Worker VM.
