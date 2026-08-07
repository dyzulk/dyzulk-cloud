<?php

namespace App\Services;

use App\Models\SshKey;
use App\Models\Team;
use App\Support\SshKeyUtils;

class SshKeyService
{
    /**
     * Create and store a new SSH key for a team or globally.
     *
     * @param  array{name: string, description: ?string, private_key: string}  $data
     */
    public function createKey(array $data, ?Team $team = null): SshKey
    {
        $publicKey = SshKeyUtils::extractPublicKey($data['private_key']);
        $metadata = SshKeyUtils::getFingerprintAndType($data['private_key']);

        return SshKey::create([
            'team_id' => $team?->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'private_key' => $data['private_key'],
            'public_key' => $publicKey,
            'fingerprint' => $metadata['fingerprint'],
            'type' => $metadata['type'],
        ]);
    }

    /**
     * Generate a new SSH key pair, then create and store it.
     *
     * @param  array{name: string, description: ?string, type: string}  $data
     */
    public function generateAndCreateKey(array $data, ?Team $team = null): SshKey
    {
        $keyPair = SshKeyUtils::generateKeyPair($data['type']);
        $metadata = SshKeyUtils::getFingerprintAndType($keyPair['private_key']);

        return SshKey::create([
            'team_id' => $team?->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'private_key' => $keyPair['private_key'],
            'public_key' => $keyPair['public_key'],
            'fingerprint' => $metadata['fingerprint'],
            'type' => $metadata['type'],
        ]);
    }

    /**
     * Delete an SSH key from the database.
     */
    public function deleteKey(SshKey $sshKey): bool
    {
        return (bool) $sshKey->delete();
    }
}
