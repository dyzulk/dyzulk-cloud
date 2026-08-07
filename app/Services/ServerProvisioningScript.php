<?php

namespace App\Services;

class ServerProvisioningScript
{
    /**
     * Get script to validate OS and Docker presence.
     */
    public function getValidationScript(): string
    {
        return <<<'BASH'
# Check if OS is Linux
if [ "$(uname)" != "Linux" ]; then
    echo "ERROR: OS must be Linux" >&2
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "WARNING: Docker is not installed"
    exit 0
fi

# Get Docker Version
docker_ver=$(docker version --format '{{.Server.Version}}' 2>/dev/null || docker -v)
echo "DOCKER_VERSION: $docker_ver"

# Check if Swarm is enabled
swarm_state=$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null)
echo "SWARM_STATE: $swarm_state"
exit 0
BASH;
    }

    /**
     * Get script to install Docker.
     */
    public function getDockerInstallScript(): string
    {
        return <<<'BASH'
echo "Installing Docker..."
if command -v docker &> /dev/null; then
    echo "Docker already installed ✅"
    exit 0
fi

# Install Docker using official convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

if command -v docker &> /dev/null; then
    echo "Docker installed successfully ✅"
    exit 0
else
    echo "ERROR: Docker installation failed" >&2
    exit 1
fi
BASH;
    }

    /**
     * Get script to initialize Docker Swarm as Manager.
     */
    public function getSwarmInitScript(string $advertiseAddr): string
    {
        return <<<BASH
# Check swarm state
swarm_state=\$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null)
if [ "\$swarm_state" = "active" ]; then
    echo "Already part of a Docker Swarm ✅"
else
    echo "Initializing Docker Swarm..."
    docker swarm init --advertise-addr {$advertiseAddr}
    echo "Swarm initialized ✅"
fi

# Ensure attachable overlay network exists
if ! docker network ls | grep -q 'dyzulk-network'; then
    echo "Creating dyzulk-network overlay network..."
    docker network create --driver overlay --attachable dyzulk-network
    echo "dyzulk-network created ✅"
fi
BASH;
    }

    /**
     * Get script to join Docker Swarm as Worker.
     */
    public function getSwarmJoinScript(string $token, string $managerHost): string
    {
        return <<<BASH
swarm_state=\$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null)
if [ "\$swarm_state" = "active" ]; then
    echo "Already part of a Docker Swarm ✅"
else
    echo "Joining Docker Swarm..."
    docker swarm join --token {$token} {$managerHost}
    echo "Joined Swarm successfully ✅"
fi
BASH;
    }
}
