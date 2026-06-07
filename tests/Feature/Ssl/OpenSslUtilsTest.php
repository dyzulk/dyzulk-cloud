<?php

use App\Support\OpenSslUtils;

test('formatHex formats a hex string with colon separators', function () {
    expect(OpenSslUtils::formatHex('AABBCCDD'))->toBe('AA:BB:CC:DD');
    expect(OpenSslUtils::formatHex('0a1b'))->toBe('0A:1B');
});

test('generateSerialNumber returns a positive integer', function () {
    $serial = OpenSslUtils::generateSerialNumber();
    expect($serial)->toBeInt()->toBeGreaterThan(0);
});

test('buildSanString includes CN and user entries', function () {
    $san = OpenSslUtils::buildSanString('example.com', 'www.example.com, 192.168.1.1');
    expect($san)->toContain('DNS:example.com')
        ->toContain('DNS:www.example.com')
        ->toContain('IP:192.168.1.1');
});

test('pemToDer converts PEM to binary DER', function () {
    $pem = "-----BEGIN CERTIFICATE-----\nTUlJQ0RU\n-----END CERTIFICATE-----";
    $der = OpenSslUtils::pemToDer($pem);
    expect($der)->toBeString()->not->toBeEmpty();
});
