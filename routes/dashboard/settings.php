<?php

use App\Http\Controllers\Dashboard\Settings\ApiTokenController;
use App\Http\Controllers\Dashboard\Settings\ProfileController;
use App\Http\Controllers\Dashboard\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::redirect('settings', '/settings/profile');

Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

Route::get('settings/security', [SecurityController::class, 'edit'])
    ->middleware(RequirePassword::class)
    ->name('security.edit');

Route::put('settings/password', [SecurityController::class, 'update'])
    ->middleware('throttle:6,1')
    ->name('user-password.update');

Route::inertia('settings/appearance', 'dashboard/settings/appearance')->name('appearance.edit');

Route::get('settings/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
Route::post('settings/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
Route::delete('settings/api-tokens/{id}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');
