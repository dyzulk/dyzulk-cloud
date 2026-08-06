################################################################################
# Stage 0: PHP Dependencies for Wayfinder
################################################################################
FROM composer:latest AS composer-dev

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --ignore-platform-reqs --no-interaction --no-scripts --prefer-dist

################################################################################
# Stage 1: Frontend Build (Node 24 + pnpm)
################################################################################
FROM node:24-slim AS frontend

# Install PHP CLI for Wayfinder type generation
RUN apt-get update && apt-get install -y php-cli --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install frontend dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Copy PHP dependencies for Wayfinder
COPY --from=composer-dev /app/vendor ./vendor

# Copy source code (required by Wayfinder to read PHP routes)
COPY . .

# Build frontend assets
RUN pnpm run build


################################################################################
# Stage 2: Production Runtime (PHP 8.5 CLI + FrankenPHP)
################################################################################
FROM dunglas/frankenphp:php8.5-alpine AS runtime

# FrankenPHP already includes PHP CLI (php artisan, php -v, etc.)
# This image is based on php:8.5-cli-alpine internally

WORKDIR /app

# Install PHP extensions required by Laravel
RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    redis \
    pcntl \
    bcmath \
    intl \
    zip \
    gd \
    opcache

# Verify PHP CLI is available
RUN php -v && php -m

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application source
COPY . .

# Install PHP dependencies (production only)
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Copy built frontend assets from Stage 1
COPY --from=frontend /app/public/build public/build

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set correct permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
