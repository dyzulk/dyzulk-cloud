<?php

namespace App\Services\Git;

use App\Models\GitConnection;
use Illuminate\Support\Facades\Http;

class GitHubService implements GitProviderInterface
{
    protected string $appId;

    protected string $privateKey;

    public function __construct()
    {
        $this->appId = config('services.github.app_id') ?? '';
        $this->privateKey = config('services.github.private_key') ?? '';
    }

    /**
     * Generate JSON Web Token (JWT) untuk autentikasi atas nama GitHub App.
     */
    protected function generateAppJwt(): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'RS256']);
        $payload = json_encode([
            'iat' => time() - 60,
            'exp' => time() + (10 * 60),
            'iss' => $this->appId,
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signatureInput = $base64UrlHeader.'.'.$base64UrlPayload;
        $signature = '';

        openssl_sign($signatureInput, $signature, $this->privateKey, OPENSSL_ALGO_SHA256);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $signatureInput.'.'.$base64UrlSignature;
    }

    /**
     * Dapatkan token akses sementara (IAT) untuk instalasi tertentu.
     */
    public function getAccessToken(string $installationId): ?string
    {
        $jwt = $this->generateAppJwt();

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$jwt}",
            'Accept' => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28',
        ])->post("https://api.github.com/app/installations/{$installationId}/access_tokens");

        if ($response->failed()) {
            return null;
        }

        return $response->json('token');
    }

    /**
     * Mengambil daftar repositori yang diizinkan untuk diakses oleh instalasi ini.
     *
     * @return array<int, array{id: int|string, name: string, full_name: string, updated_at: string}>
     */
    public function getRepositories(GitConnection $connection): array
    {
        $token = $this->getAccessToken($connection->provider_installation_id);

        if (! $token) {
            return [];
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/vnd.github+json',
        ])->get('https://api.github.com/installation/repositories');

        if ($response->failed()) {
            return [];
        }

        return collect($response->json('repositories'))->map(function ($repo) {
            return [
                'id' => $repo['id'],
                'name' => $repo['name'],
                'full_name' => $repo['full_name'],
                'updated_at' => $repo['updated_at'],
            ];
        })->toArray();
    }

    /**
     * Mengambil daftar branch dari suatu repositori.
     *
     * @return array<int, array{name: string}>
     */
    public function getBranches(GitConnection $connection, string $repositoryName): array
    {
        $token = $this->getAccessToken($connection->provider_installation_id);

        if (! $token) {
            return [];
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/vnd.github+json',
        ])->get("https://api.github.com/repos/{$repositoryName}/branches");

        if ($response->failed()) {
            return [];
        }

        return collect($response->json())->map(function ($branch) {
            return [
                'name' => $branch['name'],
            ];
        })->toArray();
    }
}
