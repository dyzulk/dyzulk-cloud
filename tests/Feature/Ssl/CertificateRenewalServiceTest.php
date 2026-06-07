<?php

use App\Models\CaCertificate;
use App\Services\Ssl\CaSetupService;
use App\Services\Ssl\CertificateRenewalService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('bulkRenewStrategy renews all roots and intermediates including ECC', function () {
    $generator = app(CaSetupService::class);
    $generator->setupCa();

    $renewalService = app(CertificateRenewalService::class);
    $result = $renewalService->bulkRenewStrategy();

    expect($result)->toBeTrue();

    // After bulk renew, each CA type should have 2 records (old + new)
    expect(CaCertificate::where('ca_type', 'root')->count())->toBe(2);
    expect(CaCertificate::where('ca_type', 'root_ecc')->count())->toBe(2);

    // Only one should be latest per type
    expect(CaCertificate::where('ca_type', 'root')->where('is_latest', true)->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'root_ecc')->where('is_latest', true)->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'intermediate_ecc_256')->where('is_latest', true)->count())->toBe(1);
    expect(CaCertificate::where('ca_type', 'intermediate_ecc_384')->where('is_latest', true)->count())->toBe(1);
});
