# Proxmox VE CLI Guide: Creating LXCs and VMs

This document contains a collection of Proxmox VE CLI (Command Line Interface) commands to create LXCs (using `pct`) and VMs (using `qm` with the Cloud-Init method) directly via an SSH connection to your Proxmox server.

> [!NOTE]
> Ensure you have logged into the Proxmox VE root shell via SSH before running the commands below. Adjust the VM/LXC IDs (`100`, `101`, etc.) and storage names (`local`, `local-lvm`, `ssd2`, etc.) to match your PVE storage configuration.

---

## 1. Preparing and Downloading Templates & Images

Before creating LXCs and VMs, download the LXC templates (Ubuntu/Debian) and Cloud-Init images for VMs.

> [!WARNING]
> If you encounter a `template: no such template` error while downloading, this is because the release template filename on the Proxmox repository server has changed (e.g., revision `-1` changed to `-2`, etc.). 
> Follow the method below to search for the exact template name before downloading.

```bash
# 1. Update the Proxmox template list
pveam update

# 2. Search for the exact Ubuntu template name available in the repository
pveam available | grep ubuntu

# Example output:
# system          ubuntu-22.04-standard_22.04-1_amd64.tar.zst
# system          ubuntu-24.04-standard_24.04-1_amd64.tar.zst   <-- Use this name

# 3. Download the chosen template using the exact name found above
# (Replace "ubuntu-24.04-standard_24.04-1_amd64.tar.zst" with the name shown on your PVE)
pveam download local ubuntu-24.04-standard_24.04-1_amd64.tar.zst

# 4. Navigate to the ISO/Image storage directory to download the Cloud-Init image for the VM
cd /var/lib/vz/template/iso
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

---

## 2. Creating LXCs (Proxmox Containers)

LXCs are used for applications that do not require full kernel isolation, such as the Control Plane and Ingress Router.

### LXC 1: Control Plane & Database (ID: 1000)
* **Specifications**: 2 Cores, 4 GB RAM, 20 GB Disk
* **Creation Command**:

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
* **Specifications**: 1 Core, 2 GB RAM, 10 GB Disk
* **Creation Command**:

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
> The `-ssh-public-keys ~/.ssh/authorized_keys` parameter automatically copies your public SSH key from the Proxmox server into the new LXC container, allowing you to log in via SSH without a password.

---

## 3. Creating VMs Using Cloud-Init (For Worker Nodes)

For Worker Nodes, it is highly recommended to use full Virtual Machines (KVM) for containerization security (Docker/Runner). The fastest and most efficient way is to create one VM Template using a Cloud-Init image, and then clone this template for Worker 1 and Worker 2.

### Step A: Creating the Cloud-Init VM Template (ID: 9000)

Run the following sequence of commands to create the base template:

```bash
# 1. Create a VM with basic specifications
qm create 9000 --name ubuntu-cloudinit-template --memory 2048 --cores 2 --cpu host --net0 virtio,bridge=vmbr0

# 2. Import the disk from the downloaded Cloud-Init image to local-lvm storage
qm importdisk 9000 /var/lib/vz/template/iso/noble-server-cloudimg-amd64.img local-lvm

# 3. Attach the imported disk to the virtio SCSI controller
qm set 9000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-9000-disk-0,discard=on,ssd=1

# 4. Add the Cloud-Init drive
qm set 9000 --ide2 local-lvm:cloudinit

# 5. Set the boot order to the main disk
qm set 9000 --boot order=scsi0

# 6. Add a serial console (required for cloud-init)
qm set 9000 --serial0 socket --vga serial0

# 7. Configure Cloud-Init defaults (User, SSH Key, and DHCP IP)
qm set 9000 --ciuser ubuntu
qm set 9000 --sshkeys ~/.ssh/authorized_keys
qm set 9000 --ipconfig0 ip=dhcp

# 8. Convert the VM into a Template
qm template 9000
```

### Step B: Cloning the Template into Worker Nodes

Once template ID `9000` is created, you can perform a quick clone (linked clone) to save time and storage.

#### VM Worker Node 1 (ID: 102)
* **Cloning**:
    ```bash
    qm clone 9000 102 --name paas-worker-1 --full 0
    ```
* **Adjust Resources (4 Cores, 8 GB RAM, 40 GB Disk)**:
    ```bash
    qm set 102 --cores 4 --memory 8192
    qm resize 102 scsi0 +20G
    qm start 102
    ```

#### VM Worker Node 2 (ID: 103)
* **Cloning**:
    ```bash
    qm clone 9000 103 --name paas-worker-2 --full 0
    ```
* **Adjust Resources (4 Cores, 8 GB RAM, 40 GB Disk)**:
    ```bash
    qm set 103 --cores 4 --memory 8192
    qm resize 103 scsi0 +20G
    qm start 103
    ```

---

## 4. Basic Proxmox CLI Management Commands

Here are some quick commands to monitor and manage your newly created VMs/LXCs:

| Action | LXC (Container) Command | VM (Virtual Machine) Command |
| :--- | :--- | :--- |
| **Start** | `pct start <ID>` | `qm start <ID>` |
| **Stop** | `pct stop <ID>` | `qm shutdown <ID>` (or `qm stop <ID>`) |
| **Check Status** | `pct status <ID>` | `qm status <ID>` |
| **Enter Shell** | `pct enter <ID>` | `qm terminal <ID>` |
| **Destroy** | `pct destroy <ID>` | `qm destroy <ID>` |
