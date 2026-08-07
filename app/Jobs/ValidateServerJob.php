<?php

namespace App\Jobs;

use App\Models\Server;
use App\Services\ServerProvisioningScript;
use App\Services\ServerSshService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ValidateServerJob implements ShouldQueue
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
        try {
            $script = $scriptService->getValidationScript();
            $result = $sshService->execute($this->server, $script);

            if ($result->successful()) {
                $output = $result->output();

                // Parse Docker version
                preg_match('/DOCKER_VERSION: (.*)/', $output, $dockerMatches);
                $dockerVersion = isset($dockerMatches[1]) ? trim($dockerMatches[1]) : null;

                // Parse Swarm state
                preg_match('/SWARM_STATE: (.*)/', $output, $swarmMatches);
                $swarmState = isset($swarmMatches[1]) ? trim($swarmMatches[1]) : 'inactive';

                $this->server->update([
                    'connection_status' => 'online',
                    'host_key_status' => 'verified',
                    'validated_at' => now(),
                    'validation_result' => [
                        'os' => 'Linux',
                        'docker_installed' => ! empty($dockerVersion),
                        'docker_version' => $dockerVersion,
                        'swarm_state' => $swarmState,
                        'raw_output' => $output,
                    ],
                ]);
            } else {
                $this->server->update([
                    'connection_status' => 'offline',
                    'host_key_status' => 'failed',
                    'validated_at' => now(),
                    'validation_result' => [
                        'error' => $result->errorOutput() ?: 'SSH execution failed',
                        'exit_code' => $result->exitCode(),
                    ],
                ]);
            }
        } catch (\Throwable $e) {
            Log::error("Validation failed for server {$this->server->id}: ".$e->getMessage());

            $this->server->update([
                'connection_status' => 'offline',
                'host_key_status' => 'failed',
                'validated_at' => now(),
                'validation_result' => [
                    'error' => $e->getMessage(),
                ],
            ]);
        }
    }
}
