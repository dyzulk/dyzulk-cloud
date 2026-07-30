# dyzulk-cloud Architecture Documentation

This directory is the single source of truth for the dyzulk-cloud PaaS platform architecture, Proxmox virtualization blueprints, network layouts, and container orchestration schemas.

## Directory Structure

```
architectur-docs/
├── README.md                           - This index guide
├── network_k8s_architecture.md          - High-level architecture, network, and node specs
├── k8s_proxmox_implementation_guide.md - Step-by-step setup, Laravel integration, and gateway configuration
├── paas_tasks_and_processes.md          - Roadmap, alur proses, dan daftar tugas lengkap
└── trash-plan/                          - Archived and legacy plans
```

* **Core Blueprints**: Located at the root of the directory.
* **Archived Plans**: Stored in the `trash-plan` subdirectory for historical context.

## Core Documentation Index

| File | Purpose | Status |
| :--- | :--- | :--- |
| [network_k8s_architecture.md](network_k8s_architecture.md) | High-level PaaS architecture design, VM/LXC allocation, proxy comparisons, and automation workflow. | Active |
| [k8s_proxmox_implementation_guide.md](k8s_proxmox_implementation_guide.md) | Detailed setup instructions for K8s on Proxmox (Debian) via kubeadm, Laravel RBAC configuration, Cloudflare Tunnel setup, and database/caching serverless simulation. | Active |
| [paas_tasks_and_processes.md](paas_tasks_and_processes.md) | Peta jalan (roadmap) pembangunan platform PaaS, alur komunikasi sistem, dan daftar tugas lengkap per fase. | Active |

## Technical Standards and Tools

### File Format
* All documentation must be written in standard Markdown (`.md`).
* No binary files or raw databases are allowed in this directory.

### Diagrams
* Diagrams must be generated using Mermaid.js syntax inside standard Markdown code blocks.
* Keep diagrams simple, readable, and focused on logical flows.

### Content Policy
* Documentation should remain strictly technical and structured.
* Do not include chat logs, user queries, conversational headers, or non-essential text.

## Maintenance and Contribution Guidelines

### Updating Documentation
1. Make updates to the relevant `.md` file.
2. If modifying network layouts or virtual IDs, ensure all references (IPs, MAC addresses) are updated across both text and diagrams.
3. Test any updated Mermaid diagrams locally to ensure they render correctly without syntax errors.
