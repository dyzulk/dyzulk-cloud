<?php

namespace App\Services\Git;

use App\Models\GitConnection;

interface GitProviderInterface
{
    /**
     * Dapatkan token akses sementara untuk melakukan operasi Git.
     */
    public function getAccessToken(string $installationId): ?string;

    /**
     * Ambil daftar repositori yang diizinkan untuk diakses.
     *
     * @return array<int, array{id: int|string, name: string, full_name: string, updated_at: string}>
     */
    public function getRepositories(GitConnection $connection): array;

    /**
     * Ambil daftar branch dari suatu repositori.
     *
     * @return array<int, array{name: string}>
     */
    public function getBranches(GitConnection $connection, string $repositoryName): array;
}
