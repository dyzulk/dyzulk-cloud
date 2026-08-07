<?php

namespace App\Support;

use Exception;
use Illuminate\Support\Facades\Process;

class SshKeyUtils
{
    /**
     * Extract the OpenSSH public key from a PEM-formatted private key.
     *
     * @throws Exception
     */
    public static function extractPublicKey(string $privateKey): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'ssh_key_pub_');
        if ($tempFile === false) {
            throw new Exception('Failed to create temporary file for public key extraction.');
        }

        file_put_contents($tempFile, trim($privateKey)."\n");
        chmod($tempFile, 0600);

        try {
            $result = Process::run(['ssh-keygen', '-y', '-P', '', '-f', $tempFile]);

            if (! $result->successful()) {
                throw new Exception('Failed to extract public key: '.$result->errorOutput());
            }

            return trim($result->output());
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }

    /**
     * Extract the fingerprint and key type from the private key.
     *
     * @return array{fingerprint: string, type: string}
     *
     * @throws Exception
     */
    public static function getFingerprintAndType(string $privateKey): array
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'ssh_key_fp_');
        if ($tempFile === false) {
            throw new Exception('Failed to create temporary file for fingerprint extraction.');
        }

        file_put_contents($tempFile, trim($privateKey)."\n");
        chmod($tempFile, 0600);

        try {
            $result = Process::run(['ssh-keygen', '-l', '-f', $tempFile]);

            if (! $result->successful()) {
                throw new Exception('Failed to extract fingerprint: '.$result->errorOutput());
            }

            $output = trim($result->output());
            $parts = explode(' ', $output);

            if (count($parts) < 2) {
                throw new Exception('Invalid ssh-keygen output format.');
            }

            $fingerprint = $parts[1]; // e.g. SHA256:d8uJz2...

            // The type is usually the last word inside parentheses, e.g. (RSA) or (ED25519)
            $rawType = end($parts);
            $type = strtolower(trim($rawType, '()'));

            // Map key types to standard names if needed
            if (str_contains($type, 'rsa')) {
                $type = 'rsa';
            } elseif (str_contains($type, 'ed25519')) {
                $type = 'ed25519';
            } elseif (str_contains($type, 'ecdsa') || str_contains($type, 'ecdsa-sha2')) {
                $type = 'ecdsa';
            }

            return [
                'fingerprint' => $fingerprint,
                'type' => $type,
            ];
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }
}
