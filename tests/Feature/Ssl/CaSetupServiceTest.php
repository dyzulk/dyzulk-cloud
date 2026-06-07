<?php

use App\Models\CaCertificate;
use App\Services\Ssl\CaSetupService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('setupCa creates RSA and ECC root and intermediate CA certificates', function () {
    $service = app(CaSetupService::class);

    $result = $service->setupCa();

    expect($result)->toBeTrue();

    // RSA chain
    expect(CaCertificate::where('ca_type', 'root')->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'intermediate_4096')->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'intermediate_2048')->count())->toBe(1);

    // ECC chain
    expect(CaCertificate::where('ca_type', 'root_ecc')->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'intermediate_ecc_384')->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'intermediate_ecc_256')->count())->toBe(1);

    // Verify RSA root
    $root = CaCertificate::where('ca_type', 'root')->first();
    expect($root->is_latest)->toBeTrue();
    expect($root->key_algorithm)->toBe('rsa');
    expect($root->cert_content)->toContain('BEGIN CERTIFICATE');

    // Verify ECC root
    $rootEcc = CaCertificate::where('ca_type', 'root_ecc')->first();
    expect($rootEcc->is_latest)->toBeTrue();
    expect($rootEcc->key_algorithm)->toBe('ecc');
    expect($rootEcc->curve_name)->toBe('secp384r1');
    expect($rootEcc->cert_content)->toContain('BEGIN CERTIFICATE');

    // Total: 6 CA certificates (3 RSA + 3 ECC)
    expect(CaCertificate::count())->toBe(6);
});

test('setupCa returns false if CA already exists', function () {
    $service = app(CaSetupService::class);

    $service->setupCa();
    $result = $service->setupCa();

    expect($result)->toBeFalse();
});
