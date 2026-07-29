# dyzulk-cloud Architecture Documentation

This directory is the single source of truth for the dyzulk-cloud PaaS platform architecture, Proxmox virtualization blueprints, network layouts, and container orchestration schemas.

## Directory Structure

```
architectur-docs/
├── README.md               - This guide
├── paas_infrastructure.md - Proxmox VM/LXC allocations and Cloudflare Tunnel layout
└── trash-plan/             - Archived and legacy plans
```

* **Core Blueprints**: Located at the root of the directory.
* **Archived Plans**: Stored in the `trash-plan` subdirectory for historical context.

## Core Documentation Index

| File | Purpose | Status |
| :--- | :--- | :--- |
| [paas_infrastructure.md](paas_infrastructure.md) | Proxmox VM/LXC allocation, network interface mappings, and Cloudflare Tunnel layout. | Active |

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
