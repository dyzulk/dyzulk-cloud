#!/bin/bash
set -e

# Masuk ke direktori aplikasi
cd /var/www/dyzulk-cloud

echo "Menarik perubahan terbaru dari Git..."
git pull origin main

echo "Memasang dependensi Composer..."
composer install --no-interaction --prefer-dist --optimize-autoloader

echo "Menjalankan migrasi database..."
php artisan migrate --force

echo "Memasang dependensi frontend..."
pnpm install --frozen-lockfile

echo "Membangun bundel frontend..."
pnpm run build

echo "Pembersihan dan optimalisasi cache..."
php artisan optimize:clear
php artisan optimize

echo "Me-restart antrean Laravel..."
php artisan queue:restart

echo "Deploy selesai dengan sukses!"
