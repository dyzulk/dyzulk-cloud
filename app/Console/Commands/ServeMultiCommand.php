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

        foreach ($ports as $port) {
            $port = trim($port);
            $process = proc_open(
                ['php', '-S', "0.0.0.0:{$port}", '-t', public_path(), base_path('server.php')],
                [STDOUT, STDERR],
                $pipes,
            );

            if (! is_resource($process)) {
                $this->error("Failed to start server on port {$port}");

                continue;
            }

            $this->processes[] = $process;
            $this->info("Serving on port {$port}");
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
}
