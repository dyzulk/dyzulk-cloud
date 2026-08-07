---
name: coolify-dokploy-references
description: 'ACTIVATE when working on tasks that reference or replicate patterns from Coolify or Dokploy, or when inspecting the references/coolify and references/dokploy directories to guide implementation of deployment pipelines, server management, container orchestration, Docker integrations, or dashboard interfaces.'
license: MIT
metadata:
  author: laravel
---

# Coolify & Dokploy References Usage

Use this skill to understand the features, architectural patterns, and file layouts of Coolify (Laravel/PHP/Livewire) and Dokploy (TypeScript/Node) reference codebases, helping guide feature design and implementation in the `dyzulk-cloud` workspace.

## Core Rules for Reference Utilization

### 1. Read-Only Enforcement
- **Never modify** any files inside the `references/` directory. They must remain pristine.
- Do not run any commands, build processes, or tests inside the `references/` directory.

### 2. Search Guidelines
- Always use `grep_search` with the target `SearchPath` restricted to `references/coolify` or `references/dokploy`.
- Match patterns using `IsRegex: true` or `CaseInsensitive: true` when looking for specific API signatures, docker commands, or hooks.
- **Tool Example**:
  ```json
  {
    "Query": "docker run",
    "SearchPath": "/home/ubuntu/dyzulk-cloud/references/coolify",
    "MatchPerLine": true
  }
  ```

---

## Feature Mapping & File Locations

### 1. Deployment & CI/CD Pipelines
How deployments are triggered, queued, built (via Dockerfile or Nixpacks), and tracked.
- **Coolify**:
  - *Location*: [app/Jobs/ApplicationDeploymentJob.php](../../../references/coolify/app/Jobs/ApplicationDeploymentJob.php), [bootstrap/helpers/applications.php](../../../references/coolify/bootstrap/helpers/applications.php) (the `queue_application_deployment` helper)
  - *How it works*: Leverages Laravel's queue system to coordinate remote SSH commands. Runs Docker builds (or uses Nixpacks/buildpacks), streams logs, and updates application state.
- **Dokploy**:
  - *Location*: [apps/dokploy/server/api/routers/application.ts](../../../references/dokploy/apps/dokploy/server/api/routers/application.ts), [apps/dokploy/server/api/routers/deployment.ts](../../../references/dokploy/apps/dokploy/server/api/routers/deployment.ts)
  - *How it works*: Uses BullMQ queues to manage async build steps, clone repositories, generate Dockerfiles, execute docker build/push, and perform rolling updates.

### 2. Server SSH Management & Setup
How remote nodes are registered, connected via SSH, and provisioned with Docker.
- **Coolify**:
  - *Location*: [app/Actions/Server/InstallDocker.php](../../../references/coolify/app/Actions/Server/InstallDocker.php), [app/Livewire/Server/ValidateAndInstall.php](../../../references/coolify/app/Livewire/Server/ValidateAndInstall.php), [app/Jobs/ValidateAndInstallServerJob.php](../../../references/coolify/app/Jobs/ValidateAndInstallServerJob.php)
  - *How it works*: Establishes SSH sessions using PHP's SSH capabilities (or phpseclib), checks system specs, configures Docker daemon, and returns validation logs.
- **Dokploy**:
  - *Location*: [apps/dokploy/server/api/routers/server.ts](../../../references/dokploy/apps/dokploy/server/api/routers/server.ts), [apps/dokploy/server/api/routers/ssh-key.ts](../../../references/dokploy/apps/dokploy/server/api/routers/ssh-key.ts)
  - *How it works*: Uses Node SSH libraries to execute remote provisioning scripts, register public keys, and check server stats.

### 3. Docker Compose & Swarm Orchestration
How multi-container applications (Docker Compose) and Swarm services are managed.
- **Coolify**:
  - *Location*: [app/Actions/Docker/](../../../references/coolify/app/Actions/Docker), [app/Models/Application.php](../../../references/coolify/app/Models/Application.php) (check `resolveCompose` logic)
  - *How it works*: Generates clean, dynamic docker-compose yaml configurations on the fly based on user settings, environment variables, and ports.
- **Dokploy**:
  - *Location*: [apps/dokploy/server/api/routers/compose.ts](../../../references/dokploy/apps/dokploy/server/api/routers/compose.ts), [apps/dokploy/server/api/routers/swarm.ts](../../../references/dokploy/apps/dokploy/server/api/routers/swarm.ts)
  - *How it works*: Stores compose files in DB, writes them to disk on the host, and executes native compose commands or interacts with Docker Swarm API.

### 4. Database Provisioning & Backups
How standard databases (Postgres, Redis, MySQL, MongoDB, MariaDB) are started and backed up to S3.
- **Coolify**:
  - *Location*: [app/Actions/Database/](../../../references/coolify/app/Actions/Database) (e.g., `StartDatabase.php`), [app/Models/StandalonePostgres.php](../../../references/coolify/app/Models/StandalonePostgres.php)
  - *How it works*: Configures database docker containers, configures volumes, and triggers S3-compatible cron backups via dedicated container tasks.
- **Dokploy**:
  - *Location*: [apps/dokploy/server/api/routers/postgres.ts](../../../references/dokploy/apps/dokploy/server/api/routers/postgres.ts), [apps/dokploy/server/api/routers/backup.ts](../../../references/dokploy/apps/dokploy/server/api/routers/backup.ts) (also mysql, mariadb, mongo, redis routers in same folder).
  - *How it works*: Directly provisions containers through Docker API, sets up dynamic environment configurations, and hooks up backup scripts.

### 5. Reverse Proxy & Routing (Traefik / SSL)
How web traffic is routed, SSL certificates are requested, and custom domains are set up.
- **Coolify**:
  - *Location*: [app/Actions/Proxy/](../../../references/coolify/app/Actions/Proxy) (e.g., `StartProxy.php`), [app/Models/LocalProxy.php](../../../references/coolify/app/Models/LocalProxy.php)
  - *How it works*: Configures Traefik using file-based or Docker socket dynamic provider configurations. Handles Let's Encrypt certificates.
- **Dokploy**:
  - *Location*: [apps/dokploy/server/api/routers/domain.ts](../../../references/dokploy/apps/dokploy/server/api/routers/domain.ts), [apps/dokploy/server/api/routers/certificate.ts](../../../references/dokploy/apps/dokploy/server/api/routers/certificate.ts)
  - *How it works*: Generates proxy configurations, registers host domains, and manages SSL generation certificates.
