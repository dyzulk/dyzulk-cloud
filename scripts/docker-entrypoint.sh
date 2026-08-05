#!/bin/sh
set -e

# ==========================================================================
# Docker Entrypoint for dyzulk-cloud Control Panel
# Reads Docker Secrets and injects them as environment variables
# ==========================================================================

# --- Read Docker Secrets if available ---
if [ -f /run/secrets/db_password ]; then
    export DB_PASSWORD=$(cat /run/secrets/db_password)
fi

if [ -f /run/secrets/app_key ]; then
    export APP_KEY=$(cat /run/secrets/app_key)
fi

if [ -f /run/secrets/app_id ]; then
    export APP_ID=$(cat /run/secrets/app_id)
fi

# --- Fallback: Read from _FILE environment variables ---
if [ -n "$DB_PASSWORD_FILE" ] && [ -f "$DB_PASSWORD_FILE" ]; then
    export DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")
fi

if [ -n "$APP_KEY_FILE" ] && [ -f "$APP_KEY_FILE" ]; then
    export APP_KEY=$(cat "$APP_KEY_FILE")
fi

# --- Ensure storage directories exist ---
mkdir -p /app/storage/framework/{cache,sessions,views}
mkdir -p /app/storage/logs
mkdir -p /app/bootstrap/cache

chown -R www-data:www-data /app/storage /app/bootstrap/cache

# --- Run database migrations ---
echo "[entrypoint] Running database migrations..."
php artisan migrate --force --no-interaction 2>/dev/null || true

# --- Cache configuration for production ---
echo "[entrypoint] Caching configuration..."
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

echo "[entrypoint] dyzulk-cloud panel ready"

# --- Execute the main process ---
exec "$@"
