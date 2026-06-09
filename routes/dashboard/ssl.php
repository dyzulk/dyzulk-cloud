<?php

use App\Http\Controllers\Dashboard\Ssl\SslCertificateController;
use Illuminate\Support\Facades\Route;

// SSL Certificate Management (End-User)
Route::get('ssl/certificates', [SslCertificateController::class, 'index'])->name('ssl.certificates.index');
Route::post('ssl/certificates', [SslCertificateController::class, 'store'])->name('ssl.certificates.store');
Route::get('ssl/certificates/{certificate}', [SslCertificateController::class, 'show'])->name('ssl.certificates.show');
Route::delete('ssl/certificates/{certificate}', [SslCertificateController::class, 'destroy'])->name('ssl.certificates.destroy');
Route::get('ssl/certificates/{certificate}/download/{type}', [SslCertificateController::class, 'downloadFile'])
    ->name('ssl.certificates.download')
    ->where('type', 'cert|key|csr');
