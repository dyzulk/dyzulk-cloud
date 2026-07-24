<?php

use App\Http\Controllers\Api\Webhooks\DeploymentWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/deploy', DeploymentWebhookController::class)
    ->name('api.webhooks.deploy');
