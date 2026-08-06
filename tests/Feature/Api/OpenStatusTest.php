<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('open status endpoint returns online status', function () {
    $response = $this->getJson(config('app.api.url').'/open/status');

    $response->assertOk()
        ->assertJson([
            'status' => 'online',
        ]);
});
