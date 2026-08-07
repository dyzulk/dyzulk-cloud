<?php

namespace App\Services;

use App\Models\Server;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;

class ServerSshService
{
    /**
     * Execute commands on a remote server using the server's SSH key.
     *
     * @return ProcessResult
     */
    public function execute(Server $server, string|array $commands, int $timeout = 120)
    {
        $sshKey = $server->sshKey;
        if (! $sshKey) {
            throw new \RuntimeException('Server has no associated SSH key.');
        }

        // Create a temporary file for the private key
        $tempKeyFile = tempnam(sys_get_temp_dir(), 'ssh_key_');
        if ($tempKeyFile === false) {
            throw new \RuntimeException('Failed to create temporary SSH key file.');
        }

        chmod($tempKeyFile, 0600);
        file_put_contents($tempKeyFile, $sshKey->private_key);

        try {
            if (is_array($commands)) {
                $commands = implode("\n", $commands);
            }

            // Construct SSH command line
            $sshCmd = sprintf(
                'ssh -i %s -p %d -o StrictHostKeyChecking=no -o ConnectTimeout=15 %s@%s %s',
                escapeshellarg($tempKeyFile),
                $server->port,
                escapeshellarg($server->username),
                escapeshellarg($server->host),
                'bash -se'
            );

            // Run process passing commands via stdin
            return Process::timeout($timeout)
                ->input($commands)
                ->run($sshCmd);
        } finally {
            if (file_exists($tempKeyFile)) {
                unlink($tempKeyFile);
            }
        }
    }
}
