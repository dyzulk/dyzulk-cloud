#!/bin/bash
set -e

# Masuk ke direktori aplikasi
cd /var/www/dyzulk-cloud

echo "Cleaning local changes on server..."
git reset --hard
git clean -fd

echo "Pulling latest changes from Git..."
git pull origin main

echo "Installing Composer dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader

echo "Running database migrations..."
php artisan migrate --force

echo "Installing frontend dependencies..."
pnpm install --frozen-lockfile

echo "Building frontend bundle..."
pnpm run build

echo "Clearing and optimizing caches..."
php artisan optimize:clear
php artisan optimize

echo "Restarting Laravel queue workers..."
php artisan queue:restart

echo "Deployment completed successfully!"
