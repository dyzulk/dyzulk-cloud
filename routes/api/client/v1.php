<?php

use App\Http\Controllers\Api\Client\V1\CertificateApiController;
use App\Http\Resources\Api\Client\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return response()->json([
        'message' => 'Client API v1 is working',
        'user' => $request->user() ? new UserResource($request->user()) : null,
    ]);
})->middleware('auth:sanctum');

// SSL Certificate API - Team-scoped (requires auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Global: All certificates across all teams the user belongs to
    Route::get('/certificates', [CertificateApiController::class, 'indexGlobal'])
        ->name('api.client.v1.certificates.index_global')
        ->middleware('ability:ssl:read');

    // Team-scoped: Certificates for a specific team (identified by UUID)
    Route::prefix('teams/{team:uuid}')->group(function () {
        Route::get('/certificates', [CertificateApiController::class, 'index'])
            ->name('api.client.v1.teams.certificates.index')
            ->middleware('ability:ssl:read');
        Route::post('/certificates/generate', [CertificateApiController::class, 'generate'])
            ->name('api.client.v1.teams.certificates.generate')
            ->middleware('ability:ssl:write');
    });

    // Certificate-level actions (UUID-based, no team prefix needed)
    Route::get('/certificates/{certificate}/download/{type}', [CertificateApiController::class, 'download'])
        ->name('api.client.v1.certificates.download')
        ->whereIn('type', ['cert', 'key', 'csr'])
        ->middleware('ability:ssl:read');
});
