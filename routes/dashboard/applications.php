<?php

use Illuminate\Support\Facades\Route;

Route::name('applications.')->group(function () {
    Route::inertia('applications', 'dashboard/applications/index')->name('index');
    Route::inertia('applications/create', 'dashboard/applications/create')->name('create');

    Route::prefix('applications/{application}')->group(function () {
        Route::inertia('overview', 'dashboard/applications/overview')->name('overview');
        Route::inertia('deployments', 'dashboard/applications/deployments')->name('deployments');
        Route::inertia('commands', 'dashboard/applications/commands')->name('commands');
        Route::inertia('logs', 'dashboard/applications/logs')->name('logs');
        Route::inertia('metrics', 'dashboard/applications/metrics')->name('metrics');
        Route::inertia('resources', 'dashboard/applications/resources')->name('resources');
        Route::inertia('env-vars', 'dashboard/applications/env-vars')->name('env-vars');
        Route::inertia('settings', 'dashboard/applications/settings')->name('settings');
    });
});
