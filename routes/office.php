<?php

use App\Http\Controllers\Office\Auth\LoginController;
use App\Http\Controllers\Office\Auth\OnboardingController;
use App\Http\Controllers\Office\DashboardController;
use App\Http\Controllers\Office\DockerController;
use App\Http\Controllers\Office\SettingsController;
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

// Office Auth & Initial Onboarding (guests only)
Route::middleware('guest:office')->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'create'])->name('office.onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('office.onboarding.store');
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

// Office Administrator Routes (Administrators only)
Route::middleware(['auth:office', EnsureOfficeAccess::class.':,administrator'])->name('office.')->group(function () {
    Route::get('docker', [DockerController::class, 'index'])->name('docker.index');
    Route::get('ssl/ca', [SslCaController::class, 'index'])->name('ssl.ca.index');
    Route::post('ssl/ca/setup', [SslCaController::class, 'setupCa'])->name('ssl.ca.setup');
    Route::post('ssl/ca/{certificate}/renew', [SslCaController::class, 'renew'])->name('ssl.ca.renew');
    Route::post('ssl/ca/renew-all', [SslCaController::class, 'renewAll'])->name('ssl.ca.renew-all');

    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('settings/{group}', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/email/test', [SettingsController::class, 'testEmail'])->name('settings.test-email');
});
