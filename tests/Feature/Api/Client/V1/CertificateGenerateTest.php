<?php

use App\Models\Team;
use App\Models\User;
use App\Services\Ssl\CaSetupService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('generate creates a certificate for the team', function () {
    app(CaSetupService::class)->setupCa();

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    $token = $user->createToken('test', ['ssl:write'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson(route('api.client.v1.teams.certificates.generate', $team), [
            'common_name' => 'api.example.com',
            'config_mode' => 'default',
            'algorithm' => 'rsa',
            'key_bits' => '2048',
        ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.common_name', 'api.example.com');
});

test('generate returns 403 for unauthorized team', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();

    $token = $user->createToken('test', ['ssl:write'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson(route('api.client.v1.teams.certificates.generate', $otherTeam), [
            'common_name' => 'api.example.com',
            'config_mode' => 'default',
            'algorithm' => 'rsa',
            'key_bits' => '2048',
        ]);

    $response->assertForbidden();
});

test('generate validates required fields', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    $token = $user->createToken('test', ['ssl:write'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson(route('api.client.v1.teams.certificates.generate', $team), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['common_name', 'config_mode', 'algorithm']);
});

test('generate with manual config_mode requires organization fields', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    $token = $user->createToken('test', ['ssl:write'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson(route('api.client.v1.teams.certificates.generate', $team), [
            'common_name' => 'manual.example.com',
            'config_mode' => 'manual',
            'algorithm' => 'rsa',
            'key_bits' => '2048',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['organization', 'locality', 'state', 'country']);
});

test('generate rejects token without ssl:write scope', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    $token = $user->createToken('test', ['ssl:read'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson(route('api.client.v1.teams.certificates.generate', $team), [
            'common_name' => 'api.example.com',
            'config_mode' => 'default',
            'algorithm' => 'rsa',
            'key_bits' => '2048',
        ]);

    $response->assertForbidden();
});
