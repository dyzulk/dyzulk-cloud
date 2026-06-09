<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('api tokens page can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/api-tokens');

    $response->assertStatus(200);
});

test('api token can be created with an expiration date', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/api-tokens', [
        'name' => 'Expiring Token',
        'scopes' => ['ssl:read', 'ssl:write'],
        'expires_in' => 30,
    ]);

    $response->assertSessionHas('newToken');

    $token = $user->tokens()->where('name', 'Expiring Token')->first();

    expect($token)->not->toBeNull()
        ->and($token->expires_at)->not->toBeNull()
        ->and($token->expires_at->isFuture())->toBeTrue()
        ->and($token->abilities)->toContain('ssl:read')
        ->and($token->abilities)->toContain('ssl:write');
});

test('api token can be created without an expiration date (never expires)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/api-tokens', [
        'name' => 'Never Expire Token',
        'scopes' => ['*'],
        'expires_in' => null,
    ]);

    $response->assertSessionHas('newToken');

    $token = $user->tokens()->where('name', 'Never Expire Token')->first();

    expect($token)->not->toBeNull()
        ->and($token->expires_at)->toBeNull();
});

test('api token can be revoked', function () {
    $user = User::factory()->create();

    $token = $user->createToken('Token To Revoke');

    $this->actingAs($user)->delete('/settings/api-tokens/'.$token->accessToken->id);

    $this->assertDatabaseMissing('personal_access_tokens', [
        'id' => $token->accessToken->id,
    ]);
});
