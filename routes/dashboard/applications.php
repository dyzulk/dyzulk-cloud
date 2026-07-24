<?php

use App\Http\Controllers\Dashboard\ApplicationController;
use App\Http\Controllers\Dashboard\ApplicationManagementController;
use Illuminate\Support\Facades\Route;

Route::name('applications.')->group(function () {
    Route::get('applications', [ApplicationController::class, 'index'])->name('index');
    Route::get('applications/list', [ApplicationController::class, 'list'])->name('list');
    Route::get('applications/resources', [ApplicationController::class, 'resources'])->name('resources');
    Route::get('applications/usage', [ApplicationController::class, 'usage'])->name('usage');
    Route::get('applications/settings', [ApplicationController::class, 'settings'])->name('settings');
    Route::get('applications/create', [ApplicationController::class, 'create'])->name('create');
    Route::post('applications', [ApplicationController::class, 'store'])->name('store');

    Route::prefix('applications/{application}')->name('manage.')->group(function () {
        Route::get('overview', [ApplicationManagementController::class, 'overview'])->name('overview');
        Route::get('deployments', [ApplicationManagementController::class, 'deployments'])->name('deployments');
        Route::get('commands', [ApplicationManagementController::class, 'commands'])->name('commands');
        Route::get('logs', [ApplicationManagementController::class, 'logs'])->name('logs');
        Route::get('metrics', [ApplicationManagementController::class, 'metrics'])->name('metrics');
        Route::get('resources', [ApplicationManagementController::class, 'resources'])->name('resources');
        Route::get('env-vars', [ApplicationManagementController::class, 'envVars'])->name('env-vars');
        Route::get('settings', [ApplicationManagementController::class, 'settings'])->name('settings');
    });
});
