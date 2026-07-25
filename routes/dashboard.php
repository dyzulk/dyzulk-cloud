<?php

use App\Http\Controllers\Dashboard\Git\GitHubCallbackController;
use App\Http\Controllers\Dashboard\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

// Team-scoped dashboard routes
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard/index')->name('dashboard');

        require __DIR__.'/dashboard/ssl.php';
        require __DIR__.'/dashboard/applications.php';
    });

// Global settings / teams dashboard routes
Route::middleware(['auth', 'verified'])->group(function () {
    require __DIR__.'/dashboard/settings.php';
    require __DIR__.'/dashboard/teams.php';

    Route::prefix('oauth/git')->group(function () {
        Route::get('/github/callback', GitHubCallbackController::class)
            ->name('oauth.git.github.callback');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});
