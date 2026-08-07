<?php

namespace App\Jobs;

use App\Models\Server;
use App\Services\ServerProvisioningScript;
use App\Services\ServerSshService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SetupServerJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Server $server) {}

    /**
     * Execute the job.
     */
    public function handle(
        ServerSshService $sshService,
        ServerProvisioningScript $scriptService
    ): void {
        $this->server->update(['setup_status' => 'in_progress']);

        try {
            // 1. Install Docker if not installed (run validation first to check)
            $valResult = $sshService->execute($this->server, $scriptService->getValidationScript());
            $dockerInstalled = false;

            if ($valResult->successful()) {
                preg_match('/DOCKER_VERSION: (.*)/', $valResult->output(), $dockerMatches);
                $dockerInstalled = ! empty($dockerMatches[1]);
            }

            if (! $dockerInstalled) {
                $installResult = $sshService->execute($this->server, $scriptService->getDockerInstallScript());
                if (! $installResult->successful()) {
                    throw new \RuntimeException('Docker installation failed: '.$installResult->errorOutput());
                }
            }

            // 2. Setup Swarm
            if ($this->server->swarm_manager_server_id === null) {
                // Initialize as Swarm Manager (Leader)
                $initResult = $sshService->execute($this->server, $scriptService->getSwarmInitScript($this->server->host));
                if (! $initResult->successful()) {
                    throw new \RuntimeException('Swarm initialization failed: '.$initResult->errorOutput());
                }
            } else {
                // Join as Worker node
                $manager = $this->server->swarmManager;
                if (! $manager) {
                    throw new \RuntimeException('Manager server not found.');
                }

                // Get Swarm Join Token from Manager
                $tokenResult = $sshService->execute($manager, 'docker swarm join-token -q worker');
                if (! $tokenResult->successful()) {
                    throw new \RuntimeException('Failed to retrieve join token from manager: '.$tokenResult->errorOutput());
                }

                $token = trim($tokenResult->output());

                // Join worker to manager
                $joinResult = $sshService->execute(
                    $this->server,
                    $scriptService->getSwarmJoinScript($token, "{$manager->host}:2377")
                );

                if (! $joinResult->successful()) {
                    throw new \RuntimeException('Failed to join Swarm: '.$joinResult->errorOutput());
                }
            }

            $this->server->update([
                'setup_status' => 'completed',
                'connection_status' => 'online',
            ]);
        } catch (\Throwable $e) {
            Log::error("Setup failed for server {$this->server->id}: ".$e->getMessage());

            $this->server->update([
                'setup_status' => 'failed',
                'validation_result' => array_merge(
                    (array) $this->server->validation_result,
                    ['setup_error' => $e->getMessage()]
                ),
            ]);
        }
    }
}
