<?php

$_SERVER['SERVER_PORT'] = 8002;

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('api root returns service information', function () {
    $response = $this->getJson('http://localhost:8002/');

    $response->assertOk()
        ->assertJson([
            'service' => 'dyzulk-cloud-api',
            'status' => 'online',
        ]);
});

test('api health endpoint returns ok status', function () {
    $response = $this->getJson('http://localhost:8002/health');

    $response->assertOk()
        ->assertJson([
            'status' => 'ok',
        ]);
});
