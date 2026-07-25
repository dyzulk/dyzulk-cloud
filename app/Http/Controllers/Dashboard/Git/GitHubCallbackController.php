<?php

namespace App\Http\Controllers\Dashboard\Git;

use App\Http\Controllers\Controller;
use App\Models\GitConnection;
use App\Services\Git\GitHubService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class GitHubCallbackController extends Controller
{
    public function __invoke(Request $request, GitHubService $gitHubService)
    {
        $installationId = $request->query('installation_id');
        $state = $request->query('state'); // Tim slug dikirim sebagai 'state'

        if (! $installationId || ! $state) {
            return redirect()->route('dashboard', 'default')
                ->with('error', 'Parameter GitHub callback tidak lengkap.');
        }

        $team = Auth::user()->teams()->where('slug', $state)->firstOrFail();

        $token = $gitHubService->getAccessToken($installationId);
        if (! $token) {
            return redirect()->route('applications.create', $team->slug)
                ->with('error', 'Gagal memverifikasi token instalasi GitHub.');
        }

        // Ambil detail instalasi
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/vnd.github+json',
        ])->get("https://api.github.com/app/installations/{$installationId}");

        if ($response->failed()) {
            return redirect()->route('applications.create', $team->slug)
                ->with('error', 'Gagal mengambil detail instalasi GitHub.');
        }

        $installationData = $response->json();

        GitConnection::updateOrCreate(
            [
                'team_id' => $team->id,
                'provider_installation_id' => $installationId,
            ],
            [
                'provider' => 'github',
                'provider_account_id' => $installationData['account']['id'] ?? '',
                'provider_account_name' => $installationData['account']['login'] ?? '',
                'provider_account_avatar_url' => $installationData['account']['avatar_url'] ?? null,
                'repository_selection' => $installationData['repository_selection'] ?? 'all',
            ]
        );

        return redirect()->route('applications.create', $team->slug)
            ->with('success', 'GitHub App berhasil dikoneksikan.');
    }
}
