#!/bin/bash
## ==========================================================================
## dyzulk-cloud Control Plane Uninstaller
## Target OS: Ubuntu Server 24.04 LTS (Noble Numbat) ONLY
## Removes all resources created by install.sh
## ==========================================================================
##
## Usage:
##   curl -sSL https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/uninstall.sh | sudo bash
##   curl -sSL https://raw.githubusercontent.com/dyzulk/dyzulk-cloud/main/scripts/uninstall.sh | sudo bash -s -- --force
##   sudo bash uninstall.sh
##   sudo bash uninstall.sh --force
##

set -e
set -o pipefail

# ==========================================================================
# Constants
# ==========================================================================
DATE=$(date +"%Y%m%d-%H%M%S")
CONTROL_NETWORK="control-network"
DATA_DIR="/data/dyzulk-cloud"

# Initialize FORCE from env variable (useful for curl | FORCE=true bash)
# Convert string to lowercase for comparison
TEMP_FORCE=$(echo "${FORCE}" | tr '[:upper:]' '[:lower:]')

if [ "$TEMP_FORCE" = "true" ] || [ "$TEMP_FORCE" = "1" ] || [ "$TEMP_FORCE" = "yes" ] || [ "$TEMP_FORCE" = "y" ]; then
    FORCE=true
else
    FORCE=false
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
# Parse Arguments (only override to true if argument specifies it, do not revert to false)
# ==========================================================================
for arg in "$@"; do
    case $arg in
        --force|--yes|-y)
            FORCE=true
            ;;
    esac
done

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

confirm() {
    if [ "$FORCE" = true ]; then
        return 0
    fi

    local message="$1"
    local response
    printf "${YELLOW}${message} [y/N]: ${NC}"
    
    # Read from /dev/tty directly to support piping (curl ... | bash)
    if [ -t 0 ]; then
        read -r response
    else
        read -r response < /dev/tty
    fi

    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

# ==========================================================================
# Pre-flight
# ==========================================================================

preflight() {
    if [ "$(id -u)" != "0" ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi

    echo ""
    echo "============================================"
    echo "  dyzulk-cloud Uninstaller - ${DATE}"
    echo "  Target: Ubuntu Server 24.04 LTS"
    echo "  Bypass Confirmations (FORCE): ${FORCE}"
    echo "============================================"
    echo ""
    printf "${RED}  WARNING: This will remove ALL dyzulk-cloud${NC}\n"
    printf "${RED}  infrastructure from this server.${NC}\n"
    echo ""

    if ! confirm "Are you sure you want to proceed?"; then
        echo "Aborted."
        exit 0
    fi
}

# ==========================================================================
# Step 1: Remove Traefik Container
# ==========================================================================

remove_proxy() {
    log_step "Step 1/8: Removing Traefik Reverse Proxy"

    if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^control-proxy$"; then
        docker rm -f control-proxy > /dev/null 2>&1
        log_success "Traefik container removed"
    else
        log_warn "Traefik container not found, skipping"
    fi
}

# ==========================================================================
# Step 2: Remove Swarm Services
# ==========================================================================

remove_services() {
    log_step "Step 2/8: Removing Swarm Services"

    for svc in control-panel control-postgres; do
        if docker service ls --format '{{.Name}}' 2>/dev/null | grep -q "^${svc}$"; then
            docker service rm "$svc" > /dev/null 2>&1
            log_success "Service removed: ${svc}"
        else
            log_warn "Service not found: ${svc}, skipping"
        fi
    done

    # Wait for containers to fully stop
    sleep 5
}

# ==========================================================================
# Step 3: Remove Docker Secrets
# ==========================================================================

remove_secrets() {
    log_step "Step 3/8: Removing Docker Secrets"

    for secret in dyzulk_db_password dyzulk_app_key dyzulk_app_id; do
        if docker secret ls --format '{{.Name}}' 2>/dev/null | grep -q "^${secret}$"; then
            docker secret rm "$secret" > /dev/null 2>&1
            log_success "Secret removed: ${secret}"
        else
            log_warn "Secret not found: ${secret}, skipping"
        fi
    done
}

# ==========================================================================
# Step 4: Remove Overlay Network
# ==========================================================================

remove_network() {
    log_step "Step 4/8: Removing Overlay Network"

    if docker network ls --format '{{.Name}}' 2>/dev/null | grep -q "^${CONTROL_NETWORK}$"; then
        docker network rm "$CONTROL_NETWORK" > /dev/null 2>&1
        log_success "Network removed: ${CONTROL_NETWORK}"
    else
        log_warn "Network not found: ${CONTROL_NETWORK}, skipping"
    fi
}

# ==========================================================================
# Step 5: Leave Docker Swarm
# ==========================================================================

leave_swarm() {
    log_step "Step 5/8: Leaving Docker Swarm"

    if docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q "active"; then
        docker swarm leave --force > /dev/null 2>&1 || true
        log_success "Docker Swarm disbanded"
    else
        log_warn "Server is not part of a Swarm, skipping"
    fi
}

# ==========================================================================
# Step 6: Remove Docker Volumes (Database Data)
# ==========================================================================

remove_volumes() {
    log_step "Step 6/8: Removing Docker Volumes"

    if docker volume ls --format '{{.Name}}' 2>/dev/null | grep -q "^control-postgres-data$"; then
        echo ""
        printf "  ${RED}WARNING: Volume 'control-postgres-data' contains your${NC}\n"
        printf "  ${RED}database (billing, users, transactions).${NC}\n"
        printf "  ${RED}This action is IRREVERSIBLE.${NC}\n"
        echo ""

        if confirm "Delete database volume permanently?"; then
            docker volume rm control-postgres-data > /dev/null 2>&1
            log_success "Volume removed: control-postgres-data"
        else
            log_warn "Volume preserved: control-postgres-data"
        fi
    else
        log_warn "Volume not found: control-postgres-data, skipping"
    fi
}

# ==========================================================================
# Step 7: Remove Data Directory
# ==========================================================================

remove_data_directory() {
    log_step "Step 7/8: Removing Data Directory"

    if [ -d "$DATA_DIR" ]; then
        if confirm "Delete ${DATA_DIR} and all its contents?"; then
            rm -rf "$DATA_DIR"
            log_success "Data directory removed: ${DATA_DIR}"
        else
            log_warn "Data directory preserved: ${DATA_DIR}"
        fi
    else
        log_warn "Data directory not found: ${DATA_DIR}, skipping"
    fi
}

# ==========================================================================
# Step 8: Remove System Configurations
# ==========================================================================

remove_system_configs() {
    log_step "Step 8/8: Removing System Configurations"

    # Kernel parameters
    if [ -f /etc/sysctl.d/99-dyzulk-cloud.conf ]; then
        rm -f /etc/sysctl.d/99-dyzulk-cloud.conf
        sysctl --system > /dev/null 2>&1
        log_success "Kernel parameters restored (removed 99-dyzulk-cloud.conf)"
    else
        log_warn "Kernel config not found, skipping"
    fi

    # Restore daemon.json backup
    local latest_backup
    latest_backup=$(ls -t /etc/docker/daemon.json.backup-* 2>/dev/null | head -1)

    if [ -n "$latest_backup" ]; then
        if confirm "Restore daemon.json from backup (${latest_backup})?"; then
            cp "$latest_backup" /etc/docker/daemon.json
            systemctl restart docker > /dev/null 2>&1
            log_success "daemon.json restored from ${latest_backup}"
        else
            log_warn "daemon.json left as-is"
        fi
    else
        log_warn "No daemon.json backup found, leaving current config"
    fi

    # gVisor binaries (optional)
    if [ -f /usr/local/bin/runsc ]; then
        if confirm "Remove gVisor binaries (runsc)?"; then
            rm -f /usr/local/bin/runsc /usr/local/bin/containerd-shim-runsc-v1
            log_success "gVisor binaries removed"
        else
            log_warn "gVisor binaries preserved"
        fi
    fi
}

# ==========================================================================
# Completion
# ==========================================================================

finish() {
    echo ""
    echo "============================================================"
    printf "${GREEN}  Uninstall Complete!${NC}\n"
    echo "============================================================"
    echo ""
    echo "  The following were cleaned:"
    echo "    - Traefik container (control-proxy)"
    echo "    - Swarm services (control-panel, control-postgres)"
    echo "    - Docker Secrets (dyzulk_db_password, dyzulk_app_key, dyzulk_app_id)"
    echo "    - Overlay network (control-network)"
    echo "    - Docker Swarm mode"
    echo ""
    echo "  NOTE: Docker Engine itself was NOT removed."
    echo "  To remove Docker entirely, run:"
    echo "    apt-get purge -y docker-ce docker-ce-cli containerd.io"
    echo ""
}

# ==========================================================================
# Main
# ==========================================================================

main() {
    preflight
    remove_proxy          # Step 1: Traefik container
    remove_services       # Step 2: Swarm services (panel, postgres)
    remove_secrets        # Step 3: Docker Secrets
    remove_network        # Step 4: Overlay network
    leave_swarm           # Step 5: Swarm mode
    remove_volumes        # Step 6: Database volume (with extra confirmation)
    remove_data_directory # Step 7: /data/dyzulk-cloud
    remove_system_configs # Step 8: sysctl, daemon.json, gVisor
    finish
}

main "$@"
