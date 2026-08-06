<?php

use Illuminate\Support\Facades\Artisan;

test('serve:multi command is registered', function () {
    $commands = Artisan::all();
    expect(array_key_exists('serve:multi', $commands))->toBeTrue();
});
