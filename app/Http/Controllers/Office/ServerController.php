<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    /**
     * Display the Server management page.
     */
    public function index(): Response
    {
        $servers = [
            [
                'id' => 'local',
                'name' => 'Localhost Engine',
                'host' => 'localhost',
                'ip' => '127.0.0.1',
                'type' => 'local',
                'status' => 'online',
                'cpu' => 15,
                'memory' => 42,
                'disk' => 38,
                'role' => 'Development Host',
                'docker_version' => '27.1.1',
                'os' => 'Linux (FrankenPHP Alpine)',
                'uptime' => '4 days, 12 hours',
            ],
            [
                'id' => 'build-01',
                'name' => 'Build Runner 01',
                'host' => 'build.dyzulk.internal',
                'ip' => '10.0.1.5',
                'type' => 'build',
                'status' => 'idle',
                'cpu' => 2,
                'memory' => 18,
                'disk' => 12,
                'role' => 'CI/CD Builder & Compiler',
                'docker_version' => '27.1.1',
                'os' => 'Ubuntu 24.04 LTS',
                'uptime' => '14 days, 2 hours',
            ],
            [
                'id' => 'swarm-mgr',
                'name' => 'Swarm Leader',
                'host' => 'manager-1.swarm.internal',
                'ip' => '10.0.2.10',
                'type' => 'node',
                'status' => 'active',
                'cpu' => 35,
                'memory' => 64,
                'disk' => 52,
                'role' => 'Swarm Manager (Leader)',
                'docker_version' => '26.1.4',
                'os' => 'Ubuntu 22.04 LTS',
                'uptime' => '45 days, 8 hours',
            ],
            [
                'id' => 'swarm-w1',
                'name' => 'Swarm Worker 01',
                'host' => 'worker-1.swarm.internal',
                'ip' => '10.0.2.11',
                'type' => 'node',
                'status' => 'active',
                'cpu' => 12,
                'memory' => 38,
                'disk' => 45,
                'role' => 'Swarm Worker',
                'docker_version' => '26.1.4',
                'os' => 'Ubuntu 22.04 LTS',
                'uptime' => '45 days, 8 hours',
            ],
            [
                'id' => 'swarm-w2',
                'name' => 'Swarm Worker 02',
                'host' => 'worker-2.swarm.internal',
                'ip' => '10.0.2.12',
                'type' => 'node',
                'status' => 'active',
                'cpu' => 28,
                'memory' => 55,
                'disk' => 48,
                'role' => 'Swarm Worker',
                'docker_version' => '26.1.4',
                'os' => 'Ubuntu 22.04 LTS',
                'uptime' => '30 days, 3 hours',
            ],
            [
                'id' => 'deploy-prod',
                'name' => 'Production Host',
                'host' => 'prod.dyzulk.cloud',
                'ip' => '198.51.100.42',
                'type' => 'deploy',
                'status' => 'online',
                'cpu' => 58,
                'memory' => 78,
                'disk' => 67,
                'role' => 'Production App Hosting',
                'docker_version' => '27.0.3',
                'os' => 'Debian 12 (Bookworm)',
                'uptime' => '92 days, 1 hour',
            ],
            [
                'id' => 'deploy-stage',
                'name' => 'Staging Host',
                'host' => 'staging.dyzulk.cloud',
                'ip' => '198.51.100.43',
                'type' => 'deploy',
                'status' => 'online',
                'cpu' => 8,
                'memory' => 25,
                'disk' => 31,
                'role' => 'Staging & QA Environment',
                'docker_version' => '27.0.3',
                'os' => 'Debian 12 (Bookworm)',
                'uptime' => '18 days, 16 hours',
            ],
        ];

        return Inertia::render('office/server/index', [
            'servers' => $servers,
        ]);
    }
}
