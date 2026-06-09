<?php

use App\Http\Controllers\Office\Auth\LoginController;
use App\Http\Controllers\Office\DashboardController;
use App\Http\Controllers\Office\SslCaController;
use App\Http\Middleware\EnsureOfficeAccess;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Office Dashboard Routes
|--------------------------------------------------------------------------
|
| Routes for the internal office dashboard at office.example.com.
| These routes use the 'office' middleware group and auth guard,
| completely separated from the public web routes.
|
*/

// Office Auth (guests only)
Route::middleware('guest:office')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('office.login');
    Route::post('login', [LoginController::class, 'store']);
});

// Office Auth (authenticated)
Route::middleware('auth:office')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy'])->name('office.logout');
});

// Office Dashboard (authenticated + active employee)
Route::middleware(['auth:office', EnsureOfficeAccess::class])->group(function () {
    Route::get('/', DashboardController::class)->name('office.dashboard');
});

// Office CA Admin (Administrators only)
Route::middleware(['auth:office', EnsureOfficeAccess::class.':,administrator'])->name('office.')->group(function () {
    Route::get('ssl/ca', [SslCaController::class, 'index'])->name('ssl.ca.index');
    Route::post('ssl/ca/setup', [SslCaController::class, 'setupCa'])->name('ssl.ca.setup');
    Route::post('ssl/ca/{certificate}/renew', [SslCaController::class, 'renew'])->name('ssl.ca.renew');
    Route::post('ssl/ca/renew-all', [SslCaController::class, 'renewAll'])->name('ssl.ca.renew-all');
});
