<?php

use App\Http\Controllers\Api\Webhooks\DeploymentWebhookController;
use App\Http\Controllers\Api\Webhooks\Git\GitHubWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/deploy', DeploymentWebhookController::class)
    ->name('api.webhooks.deploy');

Route::prefix('git')->group(function () {
    Route::post('/github', GitHubWebhookController::class)
        ->name('api.webhooks.git.github');
});
