<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class DeployControlPlaneJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 600;

    public function handle(): void
    {
        Log::info('Starting automated deployment via Webhook...');

        $scriptPath = base_path('scripts/deploy.sh');

        $process = new Process(['bash', $scriptPath]);
        $process->setTimeout($this->timeout);
        $process->run();

        if (!$process->isSuccessful()) {
            Log::error('Deployment FAILED: ' . $process->getErrorOutput());
            return;
        }

        Log::info('Deployment SUCCESS: ' . $process->getOutput());
    }
}
