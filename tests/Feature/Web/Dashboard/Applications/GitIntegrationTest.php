<?php

use App\Models\GitConnection;
use App\Models\User;
use App\Services\Git\GitHubService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('guest is redirected to login on callback', function () {
    $response = $this->get(route('oauth.git.github.callback', [
        'installation_id' => '12345',
        'state' => 'some-team',
    ]));

    $response->assertRedirect(route('login'));
});

test('authenticated user can connect github app via callback', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    // Mock GitHub Service and HTTP calls
    $this->mock(GitHubService::class, function ($mock) {
        $mock->shouldReceive('getAccessToken')
            ->once()
            ->with('12345')
            ->andReturn('mock-token');
    });

    Http::fake([
        'https://api.github.com/app/installations/12345' => Http::response([
            'account' => [
                'id' => '987654',
                'login' => 'dyzulk-test',
                'avatar_url' => 'https://avatars.githubusercontent.com/u/12345?v=4',
            ],
            'repository_selection' => 'all',
        ], 200),
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('oauth.git.github.callback', [
            'installation_id' => '12345',
            'state' => $team->slug,
        ]));

    $response->assertRedirect(route('applications.create', $team->slug));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('git_connections', [
        'team_id' => $team->id,
        'provider' => 'github',
        'provider_installation_id' => '12345',
        'provider_account_name' => 'dyzulk-test',
    ]);
});

test('webhook signature validation works', function () {
    config(['services.github.webhook_secret' => 'supersecret']);

    $payload = json_encode([
        'repository' => ['id' => 999999],
        'ref' => 'refs/heads/main',
    ]);

    $signature = 'sha256='.hash_hmac('sha256', $payload, 'supersecret');

    $response = $this->withHeaders([
        'X-Hub-Signature-256' => $signature,
        'X-GitHub-Event' => 'push',
    ])->postJson(route('api.webhooks.git.github'), json_decode($payload, true));

    $response->assertStatus(200);
    $response->assertSee('Webhooks processed');
});

test('webhook signature validation fails on invalid signature', function () {
    config(['services.github.webhook_secret' => 'supersecret']);

    $payload = json_encode([
        'repository' => ['id' => 999999],
        'ref' => 'refs/heads/main',
    ]);

    $response = $this->withHeaders([
        'X-Hub-Signature-256' => 'sha256=invalidsignature',
        'X-GitHub-Event' => 'push',
    ])->postJson(route('api.webhooks.git.github'), json_decode($payload, true));

    $response->assertStatus(403);
    $response->assertSee('Forbidden Signature');
});

test('authenticated user can fetch repositories for their git connection', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $connection = GitConnection::factory()->create([
        'team_id' => $team->id,
        'provider' => 'github',
        'provider_installation_id' => '12345',
        'provider_account_id' => '987654',
        'provider_account_name' => 'dyzulk-test',
    ]);

    $this->mock(GitHubService::class, function ($mock) use ($connection) {
        $mock->shouldReceive('getRepositories')
            ->once()
            ->with(Mockery::on(fn ($conn) => $conn->id === $connection->id))
            ->andReturn([
                ['id' => 123, 'name' => 'test-repo', 'full_name' => 'dyzulk-test/test-repo', 'updated_at' => '2026-07-24T12:00:00Z'],
            ]);
    });

    $response = $this
        ->actingAs($user)
        ->get(route('applications.git.connections.repositories', [
            'current_team' => $team->slug,
            'connection' => $connection->id,
        ]));

    $response->assertOk();
    $response->assertJson([
        'repositories' => [
            ['id' => 123, 'name' => 'test-repo', 'full_name' => 'dyzulk-test/test-repo', 'updated_at' => '2026-07-24T12:00:00Z'],
        ],
    ]);
});

test('user cannot fetch repositories for a git connection of another team', function () {
    $user1 = User::factory()->create();
    $team1 = $user1->currentTeam;

    $user2 = User::factory()->create();
    $team2 = $user2->currentTeam;

    $connection = GitConnection::factory()->create([
        'team_id' => $team2->id,
        'provider' => 'github',
        'provider_installation_id' => '12345',
        'provider_account_id' => '987654',
        'provider_account_name' => 'dyzulk-test',
    ]);

    $response = $this
        ->actingAs($user1)
        ->get(route('applications.git.connections.repositories', [
            'current_team' => $team1->slug,
            'connection' => $connection->id,
        ]));

    $response->assertStatus(403);
});

test('authenticated user can fetch branches for a repository', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $connection = GitConnection::factory()->create([
        'team_id' => $team->id,
        'provider' => 'github',
        'provider_installation_id' => '12345',
        'provider_account_id' => '987654',
        'provider_account_name' => 'dyzulk-test',
    ]);

    $this->mock(GitHubService::class, function ($mock) use ($connection) {
        $mock->shouldReceive('getBranches')
            ->once()
            ->with(Mockery::on(fn ($conn) => $conn->id === $connection->id), 'dyzulk-test/test-repo')
            ->andReturn([
                ['name' => 'main'],
                ['name' => 'develop'],
            ]);
    });

    $response = $this
        ->actingAs($user)
        ->get(route('applications.git.connections.branches', [
            'current_team' => $team->slug,
            'connection' => $connection->id,
            'repository' => 'dyzulk-test/test-repo',
        ]));

    $response->assertOk();
    $response->assertJson([
        'branches' => [
            ['name' => 'main'],
            ['name' => 'develop'],
        ],
    ]);
});
