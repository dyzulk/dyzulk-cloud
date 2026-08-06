#!/bin/bash
## ==========================================================================
## dyzulk-cloud Control Plane Installer
## Target OS: Ubuntu Server 24.04 LTS (Noble Numbat) ONLY
## Orchestrator: Docker Swarm Mode
## ==========================================================================
##
## Usage:
##   # Standard online installation
##   curl -sSL https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/install.sh | sudo bash
##
##   # Online Control Panel image update
##   curl -sSL https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/install.sh | sudo bash -s -- --update-panel
##
##   # Online domain / environment re-configuration
##   curl -sSL https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/install.sh | sudo PANEL_DOMAIN=my-panel.com bash -s -- --edit
##
##   # Verbose online installation
##   curl -sSL https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/install.sh | sudo bash -s -- --verbose
##
##   # Local file installation & updates
##   sudo bash install.sh
##   sudo bash install.sh --update-panel
##   sudo PANEL_DOMAIN=my-panel.com bash install.sh --edit
##   sudo bash install.sh --self-update
##
## Environment variables:
##   PANEL_DOMAIN        - Domain for the control panel (default: auto-detect IP)
##   PANEL_PORT          - Port for the control panel (default: 8000)
##   DB_PASSWORD         - Predefined database password (default: auto-generated)
##   APP_KEY             - Predefined Laravel APP_KEY (default: auto-generated)
##   ADVERTISE_ADDR      - Swarm advertise address (default: auto-detect private IP)
##   DOCKER_POOL_BASE    - Custom Docker address pool base (default: 10.0.0.0/8)
##   DOCKER_POOL_SIZE    - Custom Docker address pool size (default: 24)
##   SKIP_GVISOR         - Set to "true" to skip gVisor installation
##   TRAEFIK_VERSION     - Traefik image tag (default: v3.0)
##   POSTGRES_VERSION    - PostgreSQL image tag (default: 16-alpine)
##   PANEL_IMAGE         - Control panel Docker image (default: dyzulk/cloud-panel:latest)
##

set -e
set -o pipefail

# ==========================================================================
# Constants
# ==========================================================================
SCRIPT_VERSION="0.0.1"
DATE=$(date +"%Y%m%d-%H%M%S")
MIN_DOCKER_VERSION=27
CONTROL_NETWORK="dyzulk-cloud-control-network"
DATA_DIR="/data/dyzulk-cloud"
LOG_DIR="${DATA_DIR}/logs"
ENV_FILE="${DATA_DIR}/source/.env"
INSTALLATION_LOG="${LOG_DIR}/install-${DATE}.log"

PANEL_PORT="${PANEL_PORT:-8000}"
DOCKER_POOL_BASE="${DOCKER_POOL_BASE:-10.0.0.0/8}"
DOCKER_POOL_SIZE="${DOCKER_POOL_SIZE:-24}"
SKIP_GVISOR="${SKIP_GVISOR:-false}"
TRAEFIK_VERSION="${TRAEFIK_VERSION:-v3.0}"
POSTGRES_VERSION="${POSTGRES_VERSION:-16-alpine}"
PANEL_IMAGE="${PANEL_IMAGE:-ghcr.io/dyzulk/dyzulk-cloud:latest}"

# ==========================================================================
# Verbose and Edit Mode Configuration
# NOTE: Do NOT use -v shortcut. It conflicts with bash's built-in -v flag
#       which prints raw script lines to terminal.
# ==========================================================================
VERBOSE="${VERBOSE:-false}"
EDIT_MODE="${EDIT_MODE:-false}"
UPDATE_MODE="${UPDATE_MODE:-false}"
SELF_UPDATE_MODE="${SELF_UPDATE_MODE:-false}"
for arg in "$@"; do
    case $arg in
        --verbose)
            VERBOSE=true
            ;;
        --edit|-e)
            EDIT_MODE=true
            ;;
        --update-panel|--update-image|--update|-u)
            UPDATE_MODE=true
            ;;
        --self-update|--update-script)
            SELF_UPDATE_MODE=true
            ;;
    esac
done

REDIRECT="/dev/null"
if [ "$VERBOSE" = "true" ]; then
    REDIRECT="/dev/stdout"
fi

# ==========================================================================
# Colors
# ==========================================================================
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
NC="\033[0m"

# ==========================================================================
# Helper Functions
# ==========================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_step() {
    echo ""
    echo "============================================================"
    printf "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}\n"
    echo "============================================================"
}

log_success() {
    printf " ${GREEN}[OK]${NC} $1\n"
}

log_warn() {
    printf " ${YELLOW}[WARN]${NC} $1\n"
}

log_error() {
    printf " ${RED}[ERROR]${NC} $1\n"
}

command_exists() {
    command -v "$@" > /dev/null 2>&1
}

generate_random_password() {
    local password=""

    if command_exists openssl; then
        password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    elif [ -r /dev/urandom ]; then
        password=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32)
    else
        if command_exists sha256sum; then
            password=$(date +%s%N | sha256sum | base64 | head -c 32)
        else
            password=$(echo "$(date +%s%N)-$(hostname)-$$-$RANDOM" | base64 | tr -d "=+/" | head -c 32)
        fi
    fi

    if [ -z "$password" ] || [ ${#password} -lt 20 ]; then
        log_error "Failed to generate random password"
        exit 1
    fi

    echo "$password"
}

get_public_ip() {
    local ip=""

    ip=$(curl -4s --connect-timeout 5 https://ifconfig.io 2>/dev/null)

    if [ -z "$ip" ]; then
        ip=$(curl -4s --connect-timeout 5 https://icanhazip.com 2>/dev/null)
    fi

    if [ -z "$ip" ]; then
        ip=$(curl -4s --connect-timeout 5 https://ipecho.net/plain 2>/dev/null)
    fi

    # Fallback to IPv6
    if [ -z "$ip" ]; then
        ip=$(curl -6s --connect-timeout 5 https://ifconfig.io 2>/dev/null)
    fi

    echo "$ip"
}

get_private_ip() {
    ip -o -4 addr show scope global \
        | awk '$2 !~ /^(docker|br-|veth)/ {print $4}' \
        | cut -d/ -f1 \
        | grep -E "^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)" \
        | head -n1
}

get_panel_url() {
    if [ -n "$PANEL_DOMAIN" ]; then
        echo "https://${PANEL_DOMAIN}"
    else
        local pub_ip
        local priv_ip
        pub_ip=$(get_public_ip)
        priv_ip=$(get_private_ip)
        if [ -n "$pub_ip" ]; then
            echo "http://${pub_ip}:${PANEL_PORT}"
        elif [ -n "$priv_ip" ]; then
            echo "http://${priv_ip}:${PANEL_PORT}"
        else
            echo "http://localhost:${PANEL_PORT}"
        fi
    fi
}

# ==========================================================================
# Pre-flight Checks
# ==========================================================================

preflight_checks() {
    log_step "Step 0/9: Pre-flight Checks"

    # Must be root
    if [ "$(id -u)" != "0" ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi

    # Must be Linux
    if [ "$(uname)" = "Darwin" ]; then
        log_error "This script only supports Linux. macOS is not supported."
        exit 1
    fi

    # Must not be inside a Docker container
    if [ -f /.dockerenv ]; then
        log_error "This script cannot run inside a Docker container."
        exit 1
    fi

    # Must be Ubuntu 24.x
    if [ ! -f /etc/os-release ]; then
        log_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi

    local os_id
    local os_version
    os_id=$(grep -w "ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')
    os_version=$(grep -w "VERSION_ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')

    if [ "$os_id" != "ubuntu" ]; then
        log_error "This script only supports Ubuntu. Detected: ${os_id}"
        exit 1
    fi

    local os_major
    os_major=$(echo "$os_version" | cut -d '.' -f1)
    if [ "$os_major" -lt 24 ]; then
        log_error "Ubuntu 24.04+ is required. Detected: ${os_version}"
        exit 1
    fi

    log_success "OS verified: Ubuntu ${os_version}"

    # Port checks
    if [ "$EDIT_MODE" = "true" ] || [ "$UPDATE_MODE" = "true" ]; then
        log_success "Update/Edit mode active: Bypassing strict port blockage check for existing installation"
    else
        local ports_in_use=""
        if ss -tulnp | grep -q ':80 '; then
            ports_in_use="${ports_in_use} 80"
        fi
        if ss -tulnp | grep -q ':443 '; then
            ports_in_use="${ports_in_use} 443"
        fi
        if ss -tulnp | grep -q ":${PANEL_PORT} "; then
            ports_in_use="${ports_in_use} ${PANEL_PORT}"
        fi

        if [ -n "$ports_in_use" ]; then
            log_error "The following ports are already in use:${ports_in_use}"
            log_error "Please stop the services using these ports, or run with --update-panel to update the Control Panel image, or --edit to re-configure."
            exit 1
        fi

        log_success "Required ports (80, 443, ${PANEL_PORT}) are available"
    fi
}

# ==========================================================================
# Disk Space Check
# ==========================================================================

check_disk_space() {
    log_step "Step 1/9: Checking Disk Space"

    local total_space
    local available_space
    total_space=$(df -BG / | awk 'NR==2 {print $2}' | sed 's/G//')
    available_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

    local required_total=30
    local required_available=20
    local warning=false

    if [ "$total_space" -lt "$required_total" ]; then
        log_warn "Total disk space: ${total_space}GB (recommended: ${required_total}GB+)"
        warning=true
    fi

    if [ "$available_space" -lt "$required_available" ]; then
        log_warn "Available disk space: ${available_space}GB (recommended: ${required_available}GB+)"
        warning=true
    fi

    if [ "$warning" = true ]; then
        log_warn "Low disk space detected. Continuing in 5 seconds..."
        sleep 5
    else
        log_success "Disk space OK: ${available_space}GB available of ${total_space}GB total"
    fi
}

# ==========================================================================
# Install Dependencies
# ==========================================================================

install_dependencies() {
    log_step "Step 2/9: Installing Required Packages"

    local packages_needed=false
    for pkg in curl wget jq openssl; do
        if ! command_exists "$pkg"; then
            packages_needed=true
            break
        fi
    done

    if [ "$packages_needed" = true ]; then
        apt-get update -y > "$REDIRECT" 2>&1
        apt-get install -y curl wget jq openssl ca-certificates gnupg lsb-release > "$REDIRECT" 2>&1
        log_success "Packages installed: curl, wget, jq, openssl, ca-certificates, gnupg"
    else
        log_success "All required packages already installed"
    fi
}

# ==========================================================================
# Install Docker Engine (Ubuntu 24 only, official repo)
# ==========================================================================

install_docker() {
    log_step "Step 3/9: Installing Docker Engine"

    if command_exists docker; then
        # Verify minimum version
        local installed_version
        installed_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null | cut -d. -f1)

        if [ -z "$installed_version" ]; then
            log_warn "Docker is installed but daemon is not responding. Attempting restart..."
            systemctl restart docker
            sleep 3
            installed_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null | cut -d. -f1)
        fi

        if [ -n "$installed_version" ] && [ "$installed_version" -ge "$MIN_DOCKER_VERSION" ]; then
            log_success "Docker v$(docker version --format '{{.Server.Version}}' 2>/dev/null) already installed (minimum: v${MIN_DOCKER_VERSION})"
            return
        else
            log_warn "Docker version ${installed_version} is below minimum v${MIN_DOCKER_VERSION}. Upgrading..."
        fi
    fi

    log "Installing Docker Engine from official repository..."

    # Detect snap-based Docker (incompatible)
    if command_exists snap; then
        if snap list docker > /dev/null 2>&1; then
            log_error "Docker is installed via snap. Please remove it first: snap remove docker"
            exit 1
        fi
    fi

    # Install from official Docker APT repository (Ubuntu 24 specific)
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y > "$REDIRECT" 2>&1
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin > "$REDIRECT" 2>&1

    if ! command_exists docker; then
        log_error "Docker installation failed. Please install manually: https://docs.docker.com/engine/install/ubuntu/"
        exit 1
    fi

    systemctl enable docker > /dev/null 2>&1
    systemctl start docker > /dev/null 2>&1

    log_success "Docker v$(docker version --format '{{.Server.Version}}' 2>/dev/null) installed successfully"
}

# ==========================================================================
# Configure Docker Daemon (daemon.json)
# ==========================================================================

configure_docker() {
    log_step "Step 4/9: Configuring Docker Daemon"

    mkdir -p /etc/docker

    # Backup existing config
    if [ -f /etc/docker/daemon.json ]; then
        cp /etc/docker/daemon.json "/etc/docker/daemon.json.backup-${DATE}"
        log "Backed up existing daemon.json"
    fi

    local runtime_block=""
    if [ "$SKIP_GVISOR" != "true" ]; then
        runtime_block=',
  "runtimes": {
    "runsc": {
      "path": "/usr/local/bin/runsc"
    }
  }'
    fi

    cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {
      "base": "${DOCKER_POOL_BASE}",
      "size": ${DOCKER_POOL_SIZE}
    }
  ]${runtime_block}
}
EOF

    systemctl restart docker
    sleep 2

    if ! docker info > /dev/null 2>&1; then
        log_error "Docker daemon failed to start after configuration change"
        exit 1
    fi

    log_success "Docker daemon configured (pool: ${DOCKER_POOL_BASE}/${DOCKER_POOL_SIZE})"
}

# ==========================================================================
# Install gVisor Runtime (sandbox for user containers)
# ==========================================================================

install_gvisor() {
    log_step "Step 5/9: Installing gVisor Sandbox Runtime"

    if [ "$SKIP_GVISOR" = "true" ]; then
        log_warn "gVisor installation skipped (SKIP_GVISOR=true)"
        return
    fi

    if [ -f /usr/local/bin/runsc ]; then
        log_success "gVisor (runsc) already installed"
        return
    fi

    local arch
    arch=$(uname -m)
    local gvisor_url="https://storage.googleapis.com/gvisor/releases/release/latest/${arch}"

    wget -qO /usr/local/bin/runsc "${gvisor_url}/runsc"
    wget -qO /usr/local/bin/containerd-shim-runsc-v1 "${gvisor_url}/containerd-shim-runsc-v1"
    chmod a+rx /usr/local/bin/runsc /usr/local/bin/containerd-shim-runsc-v1

    # Verify installation
    if ! /usr/local/bin/runsc --version > /dev/null 2>&1; then
        log_warn "gVisor installed but version check failed. Continuing anyway..."
    else
        local runsc_ver
        runsc_ver=$(runsc --version 2>&1 | head -1)
        log_success "gVisor ${runsc_ver} installed"
    fi
}

# ==========================================================================
# Setup Kernel Parameters
# ==========================================================================

configure_kernel() {
    log_step "Step 6/9: Configuring Kernel Parameters"

    cat > /etc/sysctl.d/99-dyzulk-cloud.conf <<EOF
# IP forwarding for Docker container networking
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-iptables=1

# Security hardening
net.ipv4.conf.all.rp_filter=1
net.ipv4.conf.default.rp_filter=1

# Connection tracking tuning for high container count
net.netfilter.nf_conntrack_max=131072
EOF

    sysctl --system > /dev/null 2>&1

    log_success "Kernel parameters configured"
}

# ==========================================================================
# Create Directory Structure & Generate Secrets
# ==========================================================================

setup_directories_and_secrets() {
    log_step "Step 7/9: Setting Up Directories, Swarm & Docker Secrets"

    # Create directory structure
    mkdir -p "${DATA_DIR}"/{source,backups,proxy,containers}
    mkdir -p "${DATA_DIR}/proxy/dynamic"
    mkdir -p "${LOG_DIR}"

    chmod -R 700 "${DATA_DIR}"

    log_success "Directory structure created at ${DATA_DIR}"

    # --- Initialize Docker Swarm ---
    local advertise_addr="${ADVERTISE_ADDR:-$(get_private_ip)}"
    if [ -z "$advertise_addr" ]; then
        advertise_addr=$(get_public_ip)
    fi

    if docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q "active"; then
        log_success "Docker Swarm is already active"
    else
        if [ -z "$advertise_addr" ]; then
            log_error "Cannot detect server IP. Set ADVERTISE_ADDR manually."
            exit 1
        fi
        docker swarm init --advertise-addr "$advertise_addr" > /dev/null 2>&1 || true
        log_success "Docker Swarm initialized (advertise: ${advertise_addr})"
    fi

    # --- Create Overlay Network ---
    if ! docker network ls --format '{{.Name}}' 2>/dev/null | grep -q "^${CONTROL_NETWORK}$"; then
        docker network create --driver overlay --attachable "$CONTROL_NETWORK" > /dev/null 2>&1 || true
        log_success "Overlay network created: ${CONTROL_NETWORK}"
    else
        log_success "Overlay network already exists: ${CONTROL_NETWORK}"
    fi

    # --- Generate & Store Secrets via Docker Secrets ---
    local db_password="${DB_PASSWORD:-$(generate_random_password)}"
    local app_key="${APP_KEY:-base64:$(openssl rand -base64 32)}"
    local app_id
    app_id=$(openssl rand -hex 16)

    # Store in Docker Secrets (encrypted at rest, unlike plaintext .env)
    echo "$db_password" | docker secret create dyzulk_db_password - > /dev/null 2>&1 || true
    echo "$app_key" | docker secret create dyzulk_app_key - > /dev/null 2>&1 || true
    echo "$app_id" | docker secret create dyzulk_app_id - > /dev/null 2>&1 || true

    log_success "Docker Secrets verified/created (db_password, app_key, app_id)"

    local public_ip
    local private_ip
    public_ip=$(get_public_ip)
    private_ip=$(get_private_ip)

    local panel_url
    panel_url=$(get_panel_url)

    # Write .env reference file (non-sensitive values only)
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${ENV_FILE}.backup-${DATE}"
        log "Backed up existing .env file"
    fi

    local target_app_domain="${PANEL_DOMAIN:-localhost}"
    cat > "$ENV_FILE" <<EOF
# ===========================================
# dyzulk-cloud Control Plane Configuration
# Generated: ${DATE}
# ===========================================
# NOTE: Sensitive values (DB_PASSWORD, APP_KEY)
# are stored in Docker Secrets, NOT in this file.

APP_NAME="dyzulk-cloud"
APP_ENV=production
APP_URL=${panel_url}
APP_DOMAIN=${target_app_domain}
API_DOMAIN=api.${target_app_domain}
OFFICE_DOMAIN=office.${target_app_domain}

# Database (Control Plane only)
DB_CONNECTION=pgsql
DB_HOST=dyzulk-cloud-control-postgres
DB_PORT=5432
DB_DATABASE=control_panel
DB_USERNAME=panel_admin
# DB_PASSWORD is in Docker Secret: dyzulk_db_password
# APP_KEY is in Docker Secret: dyzulk_app_key

# Docker Hosting
DOCKER_POOL_BASE=${DOCKER_POOL_BASE}
DOCKER_POOL_SIZE=${DOCKER_POOL_SIZE}
PANEL_PORT=${PANEL_PORT}
ADVERTISE_ADDR=${advertise_addr}

# Server IPs (auto-detected)
PUBLIC_IP=${public_ip}
PRIVATE_IP=${private_ip}
EOF

    chmod 600 "$ENV_FILE"

    log_success "Environment file generated at ${ENV_FILE}"

    # Export for use in subsequent steps
    export GENERATED_DB_PASSWORD="$db_password"
    export GENERATED_APP_KEY="$app_key"
}

# ==========================================================================
# Deploy Control Plane Stack (Docker Swarm Services)
# ==========================================================================

deploy_stack() {
    log_step "Step 8/9: Deploying Control Plane Stack (Swarm Services)"

    local panel_url
    panel_url=$(get_panel_url)

    # --- PostgreSQL Service (Control Plane only, no port exposure) ---
    if docker service ls --format '{{.Name}}' | grep -q "^dyzulk-cloud-control-postgres$"; then
        log "PostgreSQL service already exists, skipping"
    else
        log "Deploying PostgreSQL ${POSTGRES_VERSION} service..."
        docker service create \
            --detach \
            --name dyzulk-cloud-control-postgres \
            --constraint 'node.role==manager' \
            --network "$CONTROL_NETWORK" \
            --env POSTGRES_DB=control_panel \
            --env POSTGRES_USER=panel_admin \
            --secret source=dyzulk_db_password,target=/run/secrets/db_password \
            --env POSTGRES_PASSWORD_FILE=/run/secrets/db_password \
            --mount type=volume,source=dyzulk-cloud-control-postgres-data,target=/var/lib/postgresql/data \
            "postgres:${POSTGRES_VERSION}" > /dev/null 2>&1

        log_success "PostgreSQL ${POSTGRES_VERSION} service created (internal only, no port exposed)"
    fi

    # Wait for PostgreSQL to be ready
    log "Waiting for PostgreSQL to accept connections..."
    local start_time=$(date +%s)
    local pg_wait=0
    local pg_max=90
    while [ $pg_wait -lt $pg_max ]; do
        local pg_container
        pg_container=$(docker ps --filter name=dyzulk-cloud-control-postgres --format '{{.ID}}' | head -1)
        if [ -n "$pg_container" ]; then
            if docker exec "$pg_container" pg_isready -U panel_admin > /dev/null 2>&1; then
                break
            fi
        fi
        sleep 3
        pg_wait=$(( $(date +%s) - start_time ))
    done

    if [ $pg_wait -ge $pg_max ]; then
        log_error "PostgreSQL failed to start within ${pg_max} seconds"
        log_error "Check logs: docker service logs dyzulk-cloud-control-postgres"
        exit 1
    fi

    log_success "PostgreSQL is ready (took ${pg_wait}s)"

    # --- Control Panel Service (Laravel) ---
    local target_app_domain="${PANEL_DOMAIN:-localhost}"
    if docker service ls --format '{{.Name}}' | grep -q "^dyzulk-cloud-control-panel$"; then
        if [ "$UPDATE_MODE" = "true" ] || [ "$EDIT_MODE" = "true" ]; then
            log "Pulling latest Control Panel image (${PANEL_IMAGE})..."
            docker pull "${PANEL_IMAGE}" > "$REDIRECT" 2>&1 || true

            log "Updating Control Panel service image and environment..."
            docker service update \
                --image "${PANEL_IMAGE}" \
                --env-add APP_DOMAIN="${target_app_domain}" \
                --env-add API_DOMAIN="api.${target_app_domain}" \
                --env-add OFFICE_DOMAIN="office.${target_app_domain}" \
                --env-add APP_URL="${panel_url}" \
                --force \
                dyzulk-cloud-control-panel > /dev/null 2>&1

            docker image prune -f > /dev/null 2>&1 || true
            log_success "Control panel service updated successfully to latest image (${PANEL_IMAGE})"
        else
            log "Panel service already exists, skipping (pass --update-panel to update image, or --edit to re-configure)"
        fi
    else
        log "Pulling Control Panel image (${PANEL_IMAGE})..."
        docker pull "${PANEL_IMAGE}" > "$REDIRECT" 2>&1 || true

        log "Deploying Control Panel service (${PANEL_IMAGE})..."
        docker service create \
            --detach \
            --name dyzulk-cloud-control-panel \
            --replicas 1 \
            --constraint 'node.role==manager' \
            --network "$CONTROL_NETWORK" \
            --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
            --mount type=bind,source="${DATA_DIR}",target=/data/dyzulk-cloud \
            --secret source=dyzulk_db_password,target=/run/secrets/db_password \
            --secret source=dyzulk_app_key,target=/run/secrets/app_key \
            --secret source=dyzulk_app_id,target=/run/secrets/app_id \
            --publish published="${PANEL_PORT}",target="${PANEL_PORT}",mode=host \
            --update-parallelism 1 \
            --update-order stop-first \
            -e DB_HOST=dyzulk-cloud-control-postgres \
            -e DB_PORT=5432 \
            -e DB_DATABASE=control_panel \
            -e DB_USERNAME=panel_admin \
            -e DB_PASSWORD_FILE=/run/secrets/db_password \
            -e APP_KEY_FILE=/run/secrets/app_key \
            -e APP_DOMAIN="${target_app_domain}" \
            -e API_DOMAIN="api.${target_app_domain}" \
            -e OFFICE_DOMAIN="office.${target_app_domain}" \
            -e APP_URL="${panel_url}" \
            "${PANEL_IMAGE}" > /dev/null 2>&1

        log_success "Control panel service created (image: ${PANEL_IMAGE})"
    fi

    # --- Traefik Reverse Proxy (docker run) ---
    # Traefik runs as a regular container (not a Swarm service)
    # because it needs direct host port binding for 80/443
    if docker ps -a --format '{{.Names}}' | grep -q "^dyzulk-cloud-control-ingress$"; then
        if [ "$UPDATE_MODE" = "true" ] || [ "$EDIT_MODE" = "true" ]; then
            log "Restarting Traefik Reverse Proxy..."
            docker restart dyzulk-cloud-control-ingress > /dev/null 2>&1 || true
            log_success "Traefik Reverse Proxy restarted"
        else
            log "Proxy container already exists, skipping (pass --update-panel or --edit to refresh)"
        fi
    else
        log "Deploying Traefik Reverse Proxy (image: traefik:${TRAEFIK_VERSION})..."
        docker run -d \
            --name dyzulk-cloud-control-ingress \
            --restart always \
            -p 80:80/tcp \
            -p 443:443/tcp \
            -p 443:443/udp \
            -v /var/run/docker.sock:/var/run/docker.sock:ro \
            -v "${DATA_DIR}/proxy:/etc/traefik" \
            "traefik:${TRAEFIK_VERSION}" > /dev/null

        # Connect proxy to swarm overlay network
        docker network connect "$CONTROL_NETWORK" dyzulk-cloud-control-ingress 2>/dev/null || true

        log_success "Traefik ${TRAEFIK_VERSION} deployed (ports 80/443/443-udp)"
    fi
}

# ==========================================================================
# Health Check & Completion
# ==========================================================================

health_check_and_finish() {
    log_step "Step 9/9: Health Check & Verification"

    log "Waiting for Swarm services to start and reach 1/1 replicas..."
    local all_healthy=true
    for svc in dyzulk-cloud-control-postgres dyzulk-cloud-control-panel; do
        local svc_wait=0
        local svc_max=90
        local is_ready=false
        while [ $svc_wait -lt $svc_max ]; do
            local replicas
            replicas=$(docker service ls --filter "name=${svc}" --format '{{.Replicas}}' 2>/dev/null)
            if echo "$replicas" | grep -q "1/1"; then
                is_ready=true
                break
            fi
            sleep 3
            svc_wait=$((svc_wait + 3))
        done

        if [ "$is_ready" = true ]; then
            log_success "${svc} (swarm service): 1/1 replicas running"
        else
            local final_replicas
            final_replicas=$(docker service ls --filter "name=${svc}" --format '{{.Replicas}}' 2>/dev/null)
            log_error "${svc} (swarm service): ${final_replicas:-0/1}"
            log_warn "Error details for ${svc}:"
            docker service ps "$svc" --no-trunc 2>/dev/null | head -n 5 || true
            docker service logs --tail 10 "$svc" 2>/dev/null || true
            all_healthy=false
        fi
    done

    # Check Traefik container (regular container, not swarm service)
    local proxy_status
    proxy_status=$(docker inspect --format='{{.State.Status}}' dyzulk-cloud-control-ingress 2>/dev/null || echo "missing")
    if [ "$proxy_status" = "running" ]; then
        log_success "dyzulk-cloud-control-ingress (container): running"
    else
        log_error "dyzulk-cloud-control-ingress (container): ${proxy_status}"
        all_healthy=false
    fi

    if [ "$all_healthy" = false ]; then
        log_error "Some services failed to start. Check logs:"
        echo "  docker service logs dyzulk-cloud-control-postgres"
        echo "  docker service logs dyzulk-cloud-control-panel"
        echo "  docker logs dyzulk-cloud-control-ingress"
        exit 1
    fi

    # Wait for panel HTTP response
    log "Waiting for control panel to respond..."
    local http_wait=0
    local http_max=120
    while [ $http_wait -lt $http_max ]; do
        if curl -sf -o /dev/null "http://localhost:${PANEL_PORT}" 2>/dev/null; then
            break
        fi
        sleep 3
        http_wait=$((http_wait + 3))
    done

    # Detect IPs for output
    local public_ip
    local private_ip
    public_ip=$(get_public_ip)
    private_ip=$(get_private_ip)

    echo ""
    echo "============================================================"
    printf "${GREEN}  Installation Complete!${NC}\n"
    echo "============================================================"
    echo ""
    echo "  Orchestrator: Docker Swarm"
    echo "  Control Panel Stack:"
    echo "    - PostgreSQL ${POSTGRES_VERSION} (swarm service, internal only)"
    echo "    - Traefik ${TRAEFIK_VERSION} (container, ports 80/443)"
    echo "    - Panel: ${PANEL_IMAGE} (swarm service, port ${PANEL_PORT})"
    if [ "$SKIP_GVISOR" != "true" ]; then
        echo "    - gVisor (runsc) sandbox runtime: enabled"
    fi
    echo "  Secrets: stored in Docker Secrets (encrypted)"
    echo ""

    if [ -n "$PANEL_DOMAIN" ]; then
        printf "  ${YELLOW}Access your panel: https://${PANEL_DOMAIN}${NC}\n"
    fi
    if [ -n "$public_ip" ]; then
        printf "  ${YELLOW}Public URL:  http://${public_ip}:${PANEL_PORT}${NC}\n"
    fi
    if [ -n "$private_ip" ] && [ "$private_ip" != "$public_ip" ]; then
        printf "  ${YELLOW}Private URL: http://${private_ip}:${PANEL_PORT}${NC}\n"
    fi
    echo ""
    printf "  ${RED}IMPORTANT: Back up your .env file to a safe location!${NC}\n"
    echo "  ${ENV_FILE}"
    echo ""
    echo "  Docker Secrets (view with: docker secret ls):"
    echo "    - dyzulk_db_password"
    echo "    - dyzulk_app_key"
    echo "    - dyzulk_app_id"
    echo ""
    echo "  Installation log: ${INSTALLATION_LOG}"
    echo ""
}

# ==========================================================================
# Fast Execution Tracks (Standalone Update, Edit & Self-Update)
# ==========================================================================

check_script_version() {
    local remote_version
    remote_version=$(curl -sSL --connect-timeout 3 "https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/install.sh" 2>/dev/null | grep -E '^SCRIPT_VERSION=' | head -n1 | cut -d'"' -f2)

    if [ -n "$remote_version" ] && [ "$remote_version" != "$SCRIPT_VERSION" ]; then
        echo ""
        printf "${YELLOW}[NOTICE] Script update available! (Local: v${SCRIPT_VERSION} -> Remote: v${remote_version})${NC}\n"
        printf "${YELLOW}[NOTICE] Run 'sudo bash $0 --self-update' to update your local script file.${NC}\n"
        echo ""
    fi
}

fast_self_update() {
    log_step "Self Update: Updating Installer Script File"

    if [ "$(id -u)" != "0" ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi

    local remote_url="https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/install.sh"
    local target_file="${0}"
    local tmp_file
    tmp_file=$(mktemp)

    log "Fetching latest installer script from GitHub (${remote_url})..."
    if curl -sSL --connect-timeout 10 "$remote_url" -o "$tmp_file"; then
        if grep -q "SCRIPT_VERSION" "$tmp_file"; then
            chmod 755 "$tmp_file"
            mv "$tmp_file" "$target_file"
            echo ""
            echo "============================================================"
            printf "${GREEN}  Installer Script Updated Successfully!${NC}\n"
            echo "============================================================"
            echo "  Target File: ${target_file}"
            echo "  Status: Updated to latest version from GitHub main branch"
            echo ""
            rm -f "$tmp_file" 2>/dev/null || true
            exit 0
        fi
    fi

    log_error "Failed to update installer script file from GitHub."
    rm -f "$tmp_file" 2>/dev/null || true
    exit 1
}

fast_update_panel_image() {
    log_step "Fast Track: Updating Control Panel Image"

    if [ "$(id -u)" != "0" ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        log_error "Docker service is not running or not installed. Run full installation first."
        exit 1
    fi

    if ! docker service ls --format '{{.Name}}' | grep -q "^dyzulk-cloud-control-panel$"; then
        log_error "Control panel service 'dyzulk-cloud-control-panel' not found. Run full installation first."
        exit 1
    fi

    log "Pulling latest Control Panel image (${PANEL_IMAGE})..."
    docker pull "${PANEL_IMAGE}" > "$REDIRECT" 2>&1 || true

    log "Updating Docker Swarm service 'dyzulk-cloud-control-panel'..."
    docker service update \
        --image "${PANEL_IMAGE}" \
        --force \
        dyzulk-cloud-control-panel > /dev/null 2>&1

    log "Pruning old unused Docker images..."
    docker image prune -f > /dev/null 2>&1 || true

    echo ""
    echo "============================================================"
    printf "${GREEN}  Control Panel Image Updated Successfully!${NC}\n"
    echo "============================================================"
    echo "  Image: ${PANEL_IMAGE}"
    echo "  Status: Swarm service updated and running"
    echo ""
}

fast_edit_config() {
    log_step "Fast Track: Re-configuring Environment & Domains"

    if [ "$(id -u)" != "0" ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi

    local target_app_domain="${PANEL_DOMAIN:-localhost}"
    local panel_url
    panel_url=$(get_panel_url)

    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${ENV_FILE}.backup-${DATE}"
        log "Backed up existing .env file to ${ENV_FILE}.backup-${DATE}"
    fi

    cat > "$ENV_FILE" <<EOF
# ===========================================
# dyzulk-cloud Control Plane Configuration
# Updated: ${DATE}
# ===========================================
APP_NAME="dyzulk-cloud"
APP_ENV=production
APP_URL=${panel_url}
APP_DOMAIN=${target_app_domain}
API_DOMAIN=api.${target_app_domain}
OFFICE_DOMAIN=office.${target_app_domain}

DB_CONNECTION=pgsql
DB_HOST=dyzulk-cloud-control-postgres
DB_PORT=5432
DB_DATABASE=control_panel
DB_USERNAME=panel_admin

DOCKER_POOL_BASE=${DOCKER_POOL_BASE}
DOCKER_POOL_SIZE=${DOCKER_POOL_SIZE}
PANEL_PORT=${PANEL_PORT}
EOF
    chmod 600 "$ENV_FILE"
    log_success "Environment file updated at ${ENV_FILE}"

    if docker service ls --format '{{.Name}}' 2>/dev/null | grep -q "^dyzulk-cloud-control-panel$"; then
        log "Updating Swarm service environment variables..."
        docker service update \
            --env-add APP_DOMAIN="${target_app_domain}" \
            --env-add API_DOMAIN="api.${target_app_domain}" \
            --env-add OFFICE_DOMAIN="office.${target_app_domain}" \
            --env-add APP_URL="${panel_url}" \
            --force \
            dyzulk-cloud-control-panel > /dev/null 2>&1
        log_success "Control panel service environment updated"
    fi

    if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^dyzulk-cloud-control-ingress$"; then
        log "Restarting Traefik Reverse Proxy..."
        docker restart dyzulk-cloud-control-ingress > /dev/null 2>&1 || true
        log_success "Traefik Reverse Proxy restarted"
    fi

    echo ""
    echo "============================================================"
    printf "${GREEN}  Configuration Updated Successfully!${NC}\n"
    echo "============================================================"
    echo "  Panel Domain: ${target_app_domain}"
    echo "  Panel URL:    ${panel_url}"
    echo ""
}

# ==========================================================================
# Main Execution
# ==========================================================================

main() {
    echo ""
    echo "============================================"
    echo "  dyzulk-cloud Installer (v${SCRIPT_VERSION}) - ${DATE}"
    echo "  Target: Ubuntu Server 24.04 LTS"
    echo "============================================"
    echo ""

    # Create log directory early
    mkdir -p "$LOG_DIR"

    # Tee all output to installation log
    exec > >(tee -a "$INSTALLATION_LOG") 2>&1

    if [ "$SELF_UPDATE_MODE" = "true" ]; then
        fast_self_update
        exit 0
    fi

    # Check script version notice (non-blocking)
    check_script_version

    if [ "$UPDATE_MODE" = "true" ]; then
        fast_update_panel_image
        exit 0
    fi

    if [ "$EDIT_MODE" = "true" ]; then
        fast_edit_config
        exit 0
    fi

    preflight_checks          # Step 0: Root, OS, ports
    check_disk_space          # Step 1: Disk space warning
    install_dependencies      # Step 2: curl, jq, openssl, etc.
    install_docker            # Step 3: Docker Engine from official repo
    configure_docker          # Step 4: daemon.json (logging, pool, gvisor runtime)
    install_gvisor            # Step 5: gVisor sandbox runtime
    configure_kernel          # Step 6: sysctl (ip_forward, conntrack)
    setup_directories_and_secrets  # Step 7: /data/dyzulk-cloud/, .env, passwords
    deploy_stack              # Step 8: postgres, panel (swarm service), traefik (container)
    health_check_and_finish   # Step 9: Verify all containers, print access URLs

    log "Installation completed successfully"
}

main "$@"
