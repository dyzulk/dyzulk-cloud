<?php

use App\Models\Certificate;
use App\Models\Team;
use App\Models\User;
use App\Services\Ssl\CaSetupService;
use App\Services\Ssl\LeafGeneratorService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('certificate model encrypts and decrypts key_content for RSA', function () {
    $setup = app(CaSetupService::class);
    $setup->setupCa();

    $generator = app(LeafGeneratorService::class);
    $result = $generator->generateLeaf([
        'common_name' => 'encryption-test.example.com',
        'organization' => 'Test',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'san' => '',
        'algorithm' => 'rsa',
        'key_bits' => 2048,
    ]);

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);

    $certificate = Certificate::create([
        'team_id' => $team->id,
        'common_name' => 'encryption-test.example.com',
        'organization' => 'Test',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'key_bits' => 2048,
        'key_algorithm' => 'rsa',
        'serial_number' => $result['serial'],
        'cert_content' => $result['cert'],
        'key_content' => $result['key'],
        'csr_content' => $result['csr'],
        'valid_from' => $result['valid_from'],
        'valid_to' => $result['valid_to'],
    ]);

    // The raw DB value should NOT match the original key (it should be encrypted)
    $rawDb = \Illuminate\Support\Facades\DB::table('certificates')
        ->where('uuid', $certificate->uuid)
        ->value('key_content');
    expect($rawDb)->not->toBe($result['key']);

    // But accessing via Eloquent should decrypt it back
    $fresh = Certificate::find($certificate->uuid);
    expect($fresh->key_content)->toBe($result['key']);
});

test('certificate model stores key_algorithm and curve_name for ECC', function () {
    $setup = app(CaSetupService::class);
    $setup->setupCa();

    $generator = app(LeafGeneratorService::class);
    $result = $generator->generateLeaf([
        'common_name' => 'ecc-store.example.com',
        'organization' => 'ECC Store Test',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'san' => '',
        'algorithm' => 'ecc',
        'curve_name' => 'prime256v1',
    ]);

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $user->update(['current_team_id' => $team->id]);

    $certificate = Certificate::create([
        'team_id' => $team->id,
        'common_name' => 'ecc-store.example.com',
        'organization' => 'ECC Store Test',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'key_algorithm' => $result['key_algorithm'],
        'curve_name' => $result['curve_name'],
        'serial_number' => $result['serial'],
        'cert_content' => $result['cert'],
        'key_content' => $result['key'],
        'csr_content' => $result['csr'],
        'valid_from' => $result['valid_from'],
        'valid_to' => $result['valid_to'],
    ]);

    $fresh = Certificate::find($certificate->uuid);
    expect($fresh->key_algorithm)->toBe('ecc');
    expect($fresh->curve_name)->toBe('prime256v1');
    expect($fresh->key_content)->toContain('BEGIN');
});
