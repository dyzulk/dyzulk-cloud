---
name: laravel-sail
description: 'ACTIVATE when the user works with Docker development, Laravel Sail, docker-compose.yml, running Sail containers, executing artisan or pnpm commands inside Sail, configuring development Docker socket mounts, or setting up lightweight local Docker environments for Laravel. Do NOT activate for production deployment scripts or Docker Swarm production releases.'
license: MIT
metadata:
  author: laravel
---

# Laravel Sail Development

Laravel Sail is a light-weight command-line interface for interacting with Laravel's default Docker development environment.

## Overview

This skill provides guidelines and conventions for managing local Docker development using Laravel Sail in the `dyzulk-cloud` workspace.

## Foundational Architecture

- **Runtime Image**: Uses PHP 8.5 (`./vendor/laravel/sail/runtimes/8.5`) to align PHP version with the Production Docker image (`dunglas/frankenphp:php8.5-alpine`).
- **Database (Lightweight)**: Uses **SQLite** (`DB_CONNECTION=sqlite`) by default for zero memory daemon overhead, fast booting, and lightweight development.
- **Container Isolation**:
  - Container Name: `dyzulk-cloud-dev-app`
  - Container Labels:
    - `com.dyzulk.environment: development`
    - `com.dyzulk.service: sail`
    - `com.dyzulk.app: dyzulk-cloud`
- **Docker Host Integration**: Host Docker socket (`/var/run/docker.sock:/var/run/docker.sock`) is mounted into the development container so the Office Dashboard (`/docker`) can inspect and manage host containers.
- **Vite Hot Module Replacement (HMR)**: Port `5173` is exposed to enable instant frontend hot-reloading for React (`.tsx`) components without rebuilding images.

## Environment Configuration

Sample `docker-compose.yml` configuration:

```yaml
name: dyzulk-cloud-dev

services:
    laravel.test:
        build:
            context: './vendor/laravel/sail/runtimes/8.5'
            dockerfile: Dockerfile
            args:
                WWWGROUP: '${WWWGROUP:-1000}'
        image: 'sail-8.5/app'
        container_name: dyzulk-cloud-dev-app
        labels:
            com.dyzulk.environment: 'development'
            com.dyzulk.service: 'sail'
            com.dyzulk.app: 'dyzulk-cloud'
        extra_hosts:
            - 'host.docker.internal:host-gateway'
        ports:
            - '${APP_PORT:-8000}:80'
            - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        environment:
            WWWUSER: '${WWWUSER:-1000}'
            LARAVEL_SAIL: 1
            XDEBUG_MODE: '${SAIL_XDEBUG_MODE:-off}'
            DB_CONNECTION: 'sqlite'
            DB_DATABASE: '/var/www/html/database/database.sqlite'
        volumes:
            - '.:/var/www/html'
            - '/var/run/docker.sock:/var/run/docker.sock'
        networks:
            - sail-dev

networks:
    sail-dev:
        driver: bridge
```

## Common Commands

| Action                       | Command                                        |
|------------------------------|------------------------------------------------|
| Start Environment            | `./vendor/bin/sail up -d`                      |
| Stop Environment             | `./vendor/bin/sail down`                       |
| Run Vite Dev Server          | `./vendor/bin/sail pnpm dev`                   |
| Run Artisan Command          | `./vendor/bin/sail artisan [command]`          |
| Generate Wayfinder Routes    | `./vendor/bin/sail artisan wayfinder:generate` |
| Run Pest Tests               | `./vendor/bin/sail test --compact`             |

## Best Practices

### PowerShell Separator Rule
Always use semicolon `;` to separate shell commands on Windows PowerShell. Never use `&&`.

### No Emojis Rule
Do not use emojis under any circumstances in code, docstrings, logs, commit messages, or documentation files.
