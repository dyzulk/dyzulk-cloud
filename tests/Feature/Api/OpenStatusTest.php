<?php

$_SERVER['SERVER_PORT'] = 8002;

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('open status endpoint returns online status', function () {
    $response = $this->getJson('http://localhost:8002/open/status');

    $response->assertOk()
        ->assertJson([
            'status' => 'online',
        ]);
});
