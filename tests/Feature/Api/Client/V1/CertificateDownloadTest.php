<?php

use App\Models\Certificate;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('download returns the certificate file', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    $certificate = Certificate::factory()->create(['team_id' => $team->id]);
    $token = $user->createToken('test', ['ssl:read'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->get(route('api.client.v1.certificates.download', [$certificate, 'cert']));

    $response->assertOk()
        ->assertHeader('Content-Disposition');
});

test('download returns 403 for a certificate from another team', function () {
    $user = User::factory()->create();
    $myTeam = Team::factory()->create();
    $myTeam->members()->attach($user, ['role' => 'owner']);

    $otherTeam = Team::factory()->create();
    $certificate = Certificate::factory()->create(['team_id' => $otherTeam->id]);

    $token = $user->createToken('test', ['ssl:read'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->get(route('api.client.v1.certificates.download', [$certificate, 'cert']));

    $response->assertForbidden();
});

test('download rejects token without ssl:read scope', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => 'owner']);

    $certificate = Certificate::factory()->create(['team_id' => $team->id]);
    $token = $user->createToken('test', ['server:read'])->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->get(route('api.client.v1.certificates.download', [$certificate, 'cert']));

    $response->assertForbidden();
});
