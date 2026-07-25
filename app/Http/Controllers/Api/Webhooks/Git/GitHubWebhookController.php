<?php

namespace App\Http\Controllers\Api\Webhooks\Git;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class GitHubWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $signature = $request->header('X-Hub-Signature-256');
        $payload = $request->getContent();
        $secret = config('services.github.webhook_secret');

        if (! $signature || ! $secret) {
            return response('Unauthorized', 401);
        }

        $expectedSignature = 'sha256='.hash_hmac('sha256', $payload, $secret);

        if (! hash_equals($expectedSignature, $signature)) {
            return response('Forbidden Signature', 403);
        }

        $event = $request->header('X-GitHub-Event');
        $data = json_decode($payload, true);

        if ($event === 'push') {
            $repoId = $data['repository']['id'] ?? null;
            $ref = $data['ref'] ?? '';
            $branch = str_replace('refs/heads/', '', $ref);

            $applications = Application::where('git_repository_id', $repoId)
                ->where('branch', $branch)
                ->get();

            foreach ($applications as $app) {
                Log::info("Auto-deploy triggered for {$app->name} (Branch: {$branch})");
            }

            return response('Webhooks processed', 200);
        }

        return response('Event ignored', 200);
    }
}
