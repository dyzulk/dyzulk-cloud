<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\ApplicationResource;
use App\Models\Deployment;
use App\Models\Domain;
use App\Models\EnvironmentVariable;
use App\Models\GitConnection;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first() ?? User::first();

        if (! $user) {
            return;
        }

        $team = $user->currentTeam;

        if (! $team) {
            return;
        }

        // 1. Seed Git Connection
        $gitConnection = GitConnection::updateOrCreate(
            ['team_id' => $team->id, 'provider_installation_id' => '123456'],
            [
                'provider' => 'github',
                'provider_account_id' => '987654',
                'provider_account_name' => 'dyzulk',
                'provider_account_avatar_url' => 'https://avatars.githubusercontent.com/u/66510723?v=4',
                'access_token' => 'mock-access-token',
                'refresh_token' => 'mock-refresh-token',
                'expires_at' => now()->addHours(8),
                'repository_selection' => 'all',
            ]
        );

        // 2. Seed Application (laravel-starter)
        $application = Application::updateOrCreate(
            ['team_id' => $team->id, 'name' => 'laravel-starter'],
            [
                'uuid' => (string) Str::uuid(),
                'git_connection_id' => $gitConnection->id,
                'display_name' => 'laravel-starter',
                'environment' => 'production',
                'region' => 'Asia Pacific (Singapore)',
                'git_repository_id' => '999999',
                'repository_name' => 'dyzulk/laravel-starter',
                'branch' => 'main',
                'compute_size' => 'Flex 512 MiB',
                'status' => 'live',
                'port' => 80,
            ]
        );

        // 3. Seed Deployments
        $deployments = [
            [
                'commit_sha' => 'dep_9f3a1b2',
                'commit_message' => 'Update application routes and sidebar layout',
                'commit_author' => 'dyzulk',
                'branch' => 'main',
                'status' => 'success',
                'started_at' => now()->subMinutes(10),
                'finished_at' => now()->subMinutes(9)->subSeconds(18),
            ],
            [
                'commit_sha' => 'dep_4e8c9d0',
                'commit_message' => 'Configure Inertia v3 SSR bundler and Wayfinder',
                'commit_author' => 'dyzulk',
                'branch' => 'main',
                'status' => 'success',
                'started_at' => now()->subHour(),
                'finished_at' => now()->subHour()->addSeconds(38),
            ],
            [
                'commit_sha' => 'dep_1a2b3c4',
                'commit_message' => 'Fix Tailwind CSS v4 custom theme color variables',
                'commit_author' => 'dyzulk',
                'branch' => 'main',
                'status' => 'success',
                'started_at' => now()->subHours(3),
                'finished_at' => now()->subHours(3)->addSeconds(45),
            ],
            [
                'commit_sha' => 'dep_0z9y8x7',
                'commit_message' => 'Add Redis cache connection string validation',
                'commit_author' => 'dyzulk',
                'branch' => 'feature/redis',
                'status' => 'failed',
                'started_at' => now()->subHours(5),
                'finished_at' => now()->subHours(5)->addSeconds(12),
            ],
        ];

        foreach ($deployments as $deployData) {
            Deployment::updateOrCreate(
                ['application_id' => $application->id, 'commit_sha' => $deployData['commit_sha']],
                array_merge($deployData, [
                    'uuid' => (string) Str::uuid(),
                ])
            );
        }

        // 4. Seed Domains
        $domains = [
            [
                'domain' => 'dyzulk.com',
                'is_primary' => true,
                'status' => 'active',
            ],
            [
                'domain' => 'laravel-starter.cloud',
                'is_primary' => false,
                'status' => 'active',
            ],
        ];

        foreach ($domains as $domainData) {
            Domain::updateOrCreate(
                ['application_id' => $application->id, 'domain' => $domainData['domain']],
                $domainData
            );
        }

        // 5. Seed Environment Variables
        $envVars = [
            ['key' => 'APP_ENV', 'value' => 'production'],
            ['key' => 'APP_DEBUG', 'value' => 'false'],
            ['key' => 'APP_KEY', 'value' => 'base64:7f9a2c3b4d5e6f1a8b9c0d1e2f3a4b5c='],
            ['key' => 'DB_CONNECTION', 'value' => 'pgsql'],
            ['key' => 'DB_HOST', 'value' => 'primary-db.internal'],
            ['key' => 'REDIS_HOST', 'value' => 'cache-redis.internal'],
        ];

        foreach ($envVars as $envData) {
            EnvironmentVariable::updateOrCreate(
                ['application_id' => $application->id, 'key' => $envData['key']],
                $envData
            );
        }

        // 6. Seed Attached Resources
        $resources = [
            [
                'name' => 'primary-db',
                'type' => 'postgresql',
                'connection_details' => [
                    'host' => 'primary-db.internal',
                    'port' => 5432,
                    'database' => 'laravel_starter_prod',
                    'username' => 'postgres',
                ],
                'status' => 'active',
            ],
            [
                'name' => 'cache-redis',
                'type' => 'redis',
                'connection_details' => [
                    'host' => 'cache-redis.internal',
                    'port' => 6379,
                ],
                'status' => 'active',
            ],
            [
                'name' => 'uploads-bucket',
                'type' => 's3',
                'connection_details' => [
                    'bucket' => 'uploads-bucket',
                    'endpoint' => 'https://r2.cloudflare.com',
                ],
                'status' => 'active',
            ],
        ];

        foreach ($resources as $resData) {
            $resource = ApplicationResource::updateOrCreate(
                ['team_id' => $team->id, 'name' => $resData['name']],
                [
                    'uuid' => (string) Str::uuid(),
                    'type' => $resData['type'],
                    'connection_details' => $resData['connection_details'],
                    'status' => $resData['status'],
                ]
            );

            $application->applicationResources()->syncWithoutDetaching([$resource->id]);
        }
    }
}
