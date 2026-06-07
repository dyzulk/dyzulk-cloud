<?php

use App\Http\Controllers\Api\V1\CertificateApiController;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return response()->json([
        'message' => 'API v1 is working',
        'user' => $request->user() ? new UserResource($request->user()) : null,
    ]);
})->middleware('auth:sanctum');

// SSL Certificate API (requires auth:sanctum + ssl:read/ssl:write scope)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/certificates', [CertificateApiController::class, 'index'])->name('api.v1.certificates.index');
    Route::post('/certificates', [CertificateApiController::class, 'store'])->name('api.v1.certificates.store');
    Route::get('/certificates/{certificate}', [CertificateApiController::class, 'show'])->name('api.v1.certificates.show');
    Route::delete('/certificates/{certificate}', [CertificateApiController::class, 'destroy'])->name('api.v1.certificates.destroy');
});
