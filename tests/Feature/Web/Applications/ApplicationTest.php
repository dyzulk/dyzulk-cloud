<?php

use App\Models\Application;
use App\Models\GitConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login from applications index', function () {
    $response = $this->get(route('applications.index', 'default-slug'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can view the applications index', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    // Create a mock application
    $application = Application::factory()->create([
        'team_id' => $team->id,
        'name' => 'test-app',
        'display_name' => 'Test App',
        'compute_size' => 'Flex 512 MiB',
        'region' => 'Asia Pacific (Singapore)',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('applications.index', $team->slug));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/applications/index')
        ->has('recentlyDeployed')
    );
});

test('authenticated users can view the applications list', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $application = Application::factory()->create([
        'team_id' => $team->id,
        'name' => 'test-app-list',
        'display_name' => 'Test App List',
        'compute_size' => 'Flex 512 MiB',
        'region' => 'Asia Pacific (Singapore)',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('applications.list', $team->slug));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/applications/applications')
        ->has('applications')
    );
});

test('authenticated users can store a new application', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $gitConnection = GitConnection::factory()->create([
        'team_id' => $team->id,
        'provider' => 'github',
        'provider_installation_id' => '123456',
        'provider_account_id' => '987654',
        'provider_account_name' => 'dyzulk',
    ]);

    $payload = [
        'name' => 'my-new-laravel-app',
        'display_name' => 'My New Laravel App',
        'git_connection_id' => $gitConnection->id,
        'git_repository_id' => '999999',
        'repository_name' => 'dyzulk/my-new-laravel-app',
        'branch' => 'main',
        'compute_size' => 'Flex 512 MiB',
        'region' => 'Asia Pacific (Singapore)',
    ];

    $response = $this
        ->actingAs($user)
        ->post(route('applications.store', $team->slug), $payload);

    $this->assertDatabaseHas('applications', [
        'team_id' => $team->id,
        'name' => 'my-new-laravel-app',
    ]);

    $response->assertRedirect(route('applications.manage.overview', [
        'current_team' => $team->slug,
        'application' => 'my-new-laravel-app',
    ]));
});

test('users cannot access other teams applications details', function () {
    $user1 = User::factory()->create();
    $team1 = $user1->currentTeam;

    $user2 = User::factory()->create();
    $team2 = $user2->currentTeam;

    $application = Application::factory()->create([
        'team_id' => $team2->id,
        'name' => 'secret-app',
        'display_name' => 'Secret App',
        'compute_size' => 'Flex 512 MiB',
        'region' => 'Asia Pacific (Singapore)',
    ]);

    // Try to access from user1 (different team)
    $response = $this
        ->actingAs($user1)
        ->get(route('applications.manage.overview', [
            'current_team' => $team1->slug,
            'application' => $application->name,
        ]));

    // Should return 403 Forbidden due to team mismatch
    $response->assertStatus(403);
});
