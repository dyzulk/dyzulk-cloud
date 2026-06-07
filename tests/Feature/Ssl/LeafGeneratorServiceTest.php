<?php

use App\Services\Ssl\CaSetupService;
use App\Services\Ssl\LeafGeneratorService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('generateLeaf creates a valid RSA leaf certificate', function () {
    $setupService = app(CaSetupService::class);
    $setupService->setupCa();

    $service = app(LeafGeneratorService::class);

    $result = $service->generateLeaf([
        'common_name' => 'test.example.com',
        'organization' => 'Test Org',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'san' => 'www.test.example.com',
        'algorithm' => 'rsa',
        'key_bits' => 2048,
    ]);

    expect($result)->toHaveKeys(['cert', 'key', 'csr', 'serial', 'valid_from', 'valid_to', 'key_algorithm', 'curve_name']);
    expect($result['cert'])->toContain('BEGIN CERTIFICATE');
    expect($result['key'])->toContain('BEGIN');
    expect($result['csr'])->toContain('BEGIN CERTIFICATE REQUEST');
    expect($result['key_algorithm'])->toBe('rsa');
    expect($result['curve_name'])->toBeNull();
});

test('generateLeaf with 4096-bit RSA key uses intermediate_4096', function () {
    $setupService = app(CaSetupService::class);
    $setupService->setupCa();

    $service = app(LeafGeneratorService::class);

    $result = $service->generateLeaf([
        'common_name' => 'secure.example.com',
        'organization' => 'Secure Org',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'san' => '',
        'algorithm' => 'rsa',
        'key_bits' => 4096,
    ]);

    expect($result['cert'])->toContain('BEGIN CERTIFICATE');
    expect($result['key_algorithm'])->toBe('rsa');
});

test('generateLeaf creates a valid ECC P-256 leaf certificate', function () {
    $setupService = app(CaSetupService::class);
    $setupService->setupCa();

    $service = app(LeafGeneratorService::class);

    $result = $service->generateLeaf([
        'common_name' => 'ecc.example.com',
        'organization' => 'ECC Test Org',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'san' => 'www.ecc.example.com',
        'algorithm' => 'ecc',
        'curve_name' => 'prime256v1',
    ]);

    expect($result['cert'])->toContain('BEGIN CERTIFICATE');
    expect($result['key'])->toContain('BEGIN');
    expect($result['key_algorithm'])->toBe('ecc');
    expect($result['curve_name'])->toBe('prime256v1');
});

test('generateLeaf creates a valid ECC P-384 leaf certificate', function () {
    $setupService = app(CaSetupService::class);
    $setupService->setupCa();

    $service = app(LeafGeneratorService::class);

    $result = $service->generateLeaf([
        'common_name' => 'ecc384.example.com',
        'organization' => 'ECC 384 Test',
        'locality' => 'Jakarta',
        'state' => 'DKI Jakarta',
        'country' => 'ID',
        'san' => '',
        'algorithm' => 'ecc',
        'curve_name' => 'secp384r1',
    ]);

    expect($result['cert'])->toContain('BEGIN CERTIFICATE');
    expect($result['key_algorithm'])->toBe('ecc');
    expect($result['curve_name'])->toBe('secp384r1');
});
