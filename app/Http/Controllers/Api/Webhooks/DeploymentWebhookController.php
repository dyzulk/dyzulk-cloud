<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Jobs\DeployControlPlaneJob;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DeploymentWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $signature = $request->header('X-Hub-Signature-256');
        $payload = $request->getContent();
        $secret = config('services.github.webhook_secret');

        if (!$signature || !$secret) {
            return response('Unauthorized', 401);
        }

        $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return response('Forbidden Signature', 403);
        }

        $event = $request->header('X-GitHub-Event');
        $data = json_decode($payload, true);

        if ($event === 'push' && ($data['ref'] ?? '') === 'refs/heads/main') {
            DeployControlPlaneJob::dispatch();
            return response('Deployment triggered', 202);
        }

        return response('Event ignored', 200);
    }
}
