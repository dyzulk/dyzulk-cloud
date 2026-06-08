<?php

use App\Models\Certificate;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('indexGlobal returns certificates from all teams the user belongs to', function () {
    $user = User::factory()->create();
    $teamA = Team::factory()->create();
    $teamB = Team::factory()->create();
    $teamC = Team::factory()->create();

    $teamA->members()->attach($user, ['role' => 'owner']);
    $teamB->members()->attach($user, ['role' => 'member']);

    Certificate::factory()->count(2)->create(['team_id' => $teamA->id]);
    Certificate::factory()->count(3)->create(['team_id' => $teamB->id]);
    Certificate::factory()->count(1)->create(['team_id' => $teamC->id]);

    $token = $user->createToken('test', ['ssl:read'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson(route('api.client.v1.certificates.index_global'));

    $response->assertOk()
        ->assertJsonPath('success', true);

    // User belongs to teamA and teamB (5 certs), not teamC (1 cert)
    expect($response->json('data.total'))->toBe(5);
});

test('indexGlobal requires authentication', function () {
    $response = $this->getJson(route('api.client.v1.certificates.index_global'));

    $response->assertUnauthorized();
});

test('indexGlobal rejects token without ssl:read scope', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test', ['server:read'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson(route('api.client.v1.certificates.index_global'));

    $response->assertForbidden();
});

test('indexGlobal accepts token with wildcard scope', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test', ['*'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson(route('api.client.v1.certificates.index_global'));

    $response->assertOk();
});
