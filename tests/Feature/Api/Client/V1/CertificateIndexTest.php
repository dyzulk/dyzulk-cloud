<?php

use App\Models\Certificate;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('index returns certificates for a specific team via UUID', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    Certificate::factory()->count(3)->create(['team_id' => $team->id]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson(route('api.client.v1.teams.certificates.index', $team));

    $response->assertOk()
        ->assertJsonPath('success', true);

    expect($response->json('data.total'))->toBe(3);
});

test('index returns 403 for a team the user does not belong to', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson(route('api.client.v1.teams.certificates.index', $otherTeam));

    $response->assertForbidden();
});

test('index returns 404 for an invalid UUID', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('http://'.config('app.api.domain').'/client/v1/teams/00000000-0000-0000-0000-000000000000/certificates');

    $response->assertNotFound();
});
