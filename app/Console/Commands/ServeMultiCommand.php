<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('serve:multi {--ports=8000,8001,8002 : Comma-separated list of ports}')]
#[Description('Serve the application on multiple ports simultaneously')]
class ServeMultiCommand extends Command
{
    /**
     * @var array<int, resource>
     */
    protected array $processes = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $ports = explode(',', $this->option('ports'));
        $networkIp = $this->resolveNetworkIp();

        foreach ($ports as $port) {
            $port = trim($port);
            $descriptors = [
                ['pipe', 'r'],
                ['file', PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null', 'w'],
                ['file', PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null', 'w'],
            ];

            $process = proc_open(
                ['php', '-S', "0.0.0.0:{$port}", '-t', public_path(), base_path('server.php')],
                $descriptors,
                $pipes,
            );

            if (! is_resource($process)) {
                $this->error("Failed to start server on port {$port}");

                continue;
            }

            $this->processes[] = $process;
            $this->info("Serving on port {$port}");
            $this->line("  Local:   <href=http://localhost:{$port}>http://localhost:{$port}</>");
            $this->line("  Network: <href=http://{$networkIp}:{$port}>http://{$networkIp}:{$port}</>");
        }

        if (empty($this->processes)) {
            $this->error('No servers started.');

            return self::FAILURE;
        }

        $shutdown = function (): void {
            $this->newLine();
            $this->info('Shutting down servers...');

            foreach ($this->processes as $process) {
                proc_terminate($process);
            }

            exit(0);
        };

        if (function_exists('pcntl_signal')) {
            pcntl_signal(SIGINT, $shutdown);
            pcntl_signal(SIGTERM, $shutdown);

            while (true) {
                pcntl_signal_dispatch();
                usleep(500000);
            }
        } elseif (function_exists('sapi_windows_set_ctrl_handler')) {
            sapi_windows_set_ctrl_handler($shutdown);

            while (true) {
                usleep(500000);
            }
        } else {
            $this->warn('Signal handling not supported. Press Ctrl+C to stop.');

            while (true) {
                usleep(500000);
            }
        }
    }

    /**
     * Resolve the machine's network-facing IP address.
     */
    protected function resolveNetworkIp(): string
    {
        $socket = @fsockopen('udp://8.8.8.8', 53);

        if ($socket) {
            $address = stream_socket_get_name($socket, false);
            fclose($socket);

            $ip = parse_url("tcp://{$address}", PHP_URL_HOST);

            if ($ip && $ip !== '0.0.0.0') {
                return $ip;
            }
        }

        $hostname = gethostname();

        if ($hostname) {
            $ip = gethostbyname($hostname);

            if ($ip !== $hostname && $ip !== '0.0.0.0') {
                return $ip;
            }
        }

        return '127.0.0.1';
    }
}
