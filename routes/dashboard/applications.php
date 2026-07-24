<?php

use Illuminate\Support\Facades\Route;

Route::name('applications.')->group(function () {
    Route::inertia('applications', 'dashboard/applications/index')->name('index');
    Route::inertia('applications/list', 'dashboard/applications/applications')->name('list');
    Route::inertia('applications/create', 'dashboard/applications/create')->name('create');

    Route::prefix('applications/{application}')->group(function () {
        Route::inertia('overview', 'dashboard/applications/manage/overview')->name('overview');
        Route::inertia('deployments', 'dashboard/applications/manage/deployments')->name('deployments');
        Route::inertia('commands', 'dashboard/applications/manage/commands')->name('commands');
        Route::inertia('logs', 'dashboard/applications/manage/logs')->name('logs');
        Route::inertia('metrics', 'dashboard/applications/manage/metrics')->name('metrics');
        Route::inertia('resources', 'dashboard/applications/manage/resources')->name('resources');
        Route::inertia('env-vars', 'dashboard/applications/manage/env-vars')->name('env-vars');
        Route::inertia('settings', 'dashboard/applications/manage/settings')->name('settings');
    });
});
