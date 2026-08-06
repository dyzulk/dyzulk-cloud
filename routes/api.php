<?php

use Illuminate\Support\Facades\Route;

// 1. Open / Guest APIs
Route::prefix('open')
    ->middleware(['throttle:api'])
    ->group(base_path('routes/api/open/index.php'));

// 2. Client API (V1)
Route::prefix('client/v1')
    ->group(base_path('routes/api/client/v1.php'));

// 3. Webhooks API
Route::prefix('webhooks')
    ->group(base_path('routes/api/webhooks/index.php'));

// 4. Health check (Root level API endpoint)
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// 5. API Root
Route::get('/', function () {
    return response()->json([
        'service' => 'dyzulk-cloud-api',
        'status' => 'online',
    ]);
});
