<?php

namespace App\Support;

use Exception;

/**
 * Utility functions for OpenSSL certificate operations.
 *
 * Extracted from monolithic service to provide reusable helpers
 * across CertificateGeneratorService, CertificateRenewalService, etc.
 */
class OpenSslUtils
{
    /**
     * Generate a cryptographically secure random serial number.
     */
    public static function generateSerialNumber(): int
    {
        try {
            return random_int(1, PHP_INT_MAX);
        } catch (Exception) {
            return time();
        }
    }

    /**
     * Format a hex string (from serialNumberHex) with colon separators.
     */
    public static function formatHex(string $hex): string
    {
        $hex = strtoupper($hex);

        return implode(':', str_split($hex, 2));
    }

    /**
     * Fallback: convert a decimal serial number to colon-separated hex string.
     */
    public static function formatSerialToHex(string|int $decimal): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', (string) $decimal);
        if ($cleaned === '') {
            $cleaned = '0';
        }

        if (function_exists('bcdiv')) {
            $hex = '';
            $value = $cleaned;
            if (! preg_match('/^\d+$/', $value)) {
                $value = '0';
            }

            while (bccomp($value, '0') > 0) {
                $mod = bcmod($value, '16');
                $hex = dechex((int) $mod).$hex;
                $value = bcdiv($value, '16', 0);
            }
            $hex = $hex ?: '0';
        } else {
            $hex = dechex((int) $cleaned);
        }

        if (strlen($hex) % 2 !== 0) {
            $hex = '0'.$hex;
        }

        return strtoupper(implode(':', str_split($hex, 2)));
    }

    /**
     * Extract the formatted serial hex from parsed certificate info.
     */
    public static function extractSerialHex(array $certInfo): string
    {
        return isset($certInfo['serialNumberHex'])
            ? static::formatHex($certInfo['serialNumberHex'])
            : static::formatSerialToHex($certInfo['serialNumber']);
    }

    /**
     * Convert PEM certificate content to DER binary format.
     */
    public static function pemToDer(string $pemContent): string
    {
        $lines = explode("\n", trim($pemContent));
        $payload = '';
        foreach ($lines as $line) {
            if (! str_starts_with($line, '-----')) {
                $payload .= trim($line);
            }
        }

        return base64_decode($payload);
    }

    /**
     * Create a temporary OpenSSL config file for CA extensions.
     */
    public static function createCaConfigFile(): string
    {
        $configContent = implode("\n", [
            '[req]',
            'distinguished_name = req',
            '[v3_ca]',
            'subjectKeyIdentifier = hash',
            'authorityKeyIdentifier = keyid:always,issuer',
            'basicConstraints = critical, CA:true',
            'keyUsage = critical, digitalSignature, cRLSign, keyCertSign',
        ]);

        $configFile = tempnam(sys_get_temp_dir(), 'ca_conf_');
        file_put_contents($configFile, $configContent);

        return $configFile;
    }

    /**
     * Create a temporary OpenSSL config file for leaf certificate with SAN.
     */
    public static function createLeafConfigFile(string $commonName, string $sanString): string
    {
        $configContent = implode("\n", [
            '[req]',
            'distinguished_name = req',
            'req_extensions = v3_req',
            'prompt = no',
            '[req_distinguished_name]',
            "CN = {$commonName}",
            '[v3_req]',
            "subjectAltName = {$sanString}",
        ]);

        $configFile = tempnam(sys_get_temp_dir(), 'openssl_');
        file_put_contents($configFile, $configContent);

        return $configFile;
    }

    /**
     * Clean up a temporary config file.
     */
    public static function cleanupConfigFile(?string $configFile): void
    {
        if ($configFile && file_exists($configFile)) {
            unlink($configFile);
        }
    }

    /**
     * Build a SAN (Subject Alternative Names) string from user input.
     *
     * Always includes the CN as the first DNS entry.
     */
    public static function buildSanString(string $commonName, ?string $userSan = ''): string
    {
        $entries = array_filter(array_map('trim', explode(',', $userSan ?? '')));

        array_unshift($entries, $commonName);

        $sanArray = array_unique(array_map(function (string $entry): string {
            if (str_starts_with($entry, 'IP:') || str_starts_with($entry, 'DNS:')) {
                return $entry;
            }

            return filter_var($entry, FILTER_VALIDATE_IP) ? "IP:{$entry}" : "DNS:{$entry}";
        }, $entries));

        return implode(', ', $sanArray);
    }
}
