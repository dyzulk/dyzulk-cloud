<?php

namespace App\Services\Ssl;

use App\Models\CaCertificate;
use App\Support\OpenSslUtils;
use Exception;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Handles the business logic of CA certificate renewal.
 *
 * This service manages the renewal flow, database state transitions
 * (is_latest toggling), and coordinated bulk renewal of the entire
 * CA hierarchy.
 */
class CertificateRenewalService
{
    /**
     * Renew (re-sign) an existing CA certificate using its existing private key.
     *
     * @return array{cert_content: string, serial_number: string, valid_from: string, valid_to: string, issuer_name: string, issuer_serial: string|null, family_id: string}
     *
     * @throws Exception on OpenSSL failure
     */
    public function renewCaCertificate(CaCertificate $cert, int $days): array
    {
        $configFile = null;

        try {
            $configFile = OpenSslUtils::createCaConfigFile();

            $privKey = openssl_pkey_get_private($cert->key_content);
            if (! $privKey) {
                throw new Exception('Failed to load Private Key');
            }

            $certInfo = openssl_x509_parse($cert->cert_content);
            $dn = $certInfo['subject'];

            $dnMap = [
                'CN' => 'commonName',
                'O' => 'organizationName',
                'OU' => 'organizationalUnitName',
                'C' => 'countryName',
                'ST' => 'stateOrProvinceName',
                'L' => 'localityName',
                'emailAddress' => 'emailAddress',
            ];

            $newDn = [];
            foreach ($dn as $key => $value) {
                if (isset($dnMap[$key])) {
                    $newDn[$dnMap[$key]] = $value;
                }
            }

            $csr = openssl_csr_new($newDn, $privKey, ['digest_alg' => 'sha256', 'config' => $configFile]);
            if (! $csr) {
                throw new Exception('Failed to generate Renewal CSR: '.openssl_error_string());
            }

            $issuerCert = null;
            $issuerKey = null;
            $root = null;

            if ($cert->ca_type === 'root' || $cert->ca_type === 'root_ecc') {
                $issuerKey = $privKey;
            } else {
                $rootType = str_contains($cert->ca_type, 'ecc') ? 'root_ecc' : 'root';

                $root = CaCertificate::where('ca_type', $rootType)
                    ->where('is_latest', true)
                    ->first();

                if (! $root) {
                    $root = CaCertificate::where('ca_type', $rootType)->latest()->first();
                }

                if (! $root) {
                    throw new Exception('Root CA not found for signing intermediate renewal.');
                }

                $issuerCert = $root->cert_content;
                $issuerKey = openssl_pkey_get_private($root->key_content);
            }

            $serial = OpenSslUtils::generateSerialNumber();
            $newCert = openssl_csr_sign($csr, $issuerCert, $issuerKey, $days, [
                'digest_alg' => 'sha256',
                'x509_extensions' => 'v3_ca',
                'config' => $configFile,
            ], $serial);

            if (! $newCert) {
                throw new Exception('Failed to sign Renewal Cert: '.openssl_error_string());
            }

            if (! openssl_x509_export($newCert, $newCertPem)) {
                throw new Exception('Failed to export Renewal Cert');
            }

            $newInfo = openssl_x509_parse($newCertPem);
            $newSerialHex = OpenSslUtils::extractSerialHex($newInfo);

            $isRoot = in_array($cert->ca_type, ['root', 'root_ecc']);

            return [
                'cert_content' => $newCertPem,
                'serial_number' => $newSerialHex,
                'valid_from' => date('Y-m-d H:i:s', $newInfo['validFrom_time_t']),
                'valid_to' => date('Y-m-d H:i:s', $newInfo['validTo_time_t']),
                'issuer_name' => $isRoot
                    ? $cert->common_name
                    : ($root ? $root->common_name : 'Unknown Root'),
                'issuer_serial' => $isRoot
                    ? $newSerialHex
                    : ($root ? $root->serial_number : null),
                'family_id' => $isRoot
                    ? (string) Str::uuid()
                    : ($root ? $root->family_id : $cert->family_id),
            ];
        } finally {
            OpenSslUtils::cleanupConfigFile($configFile);
        }
    }

    /**
     * Handle the full DB flow for a single CA certificate renewal.
     *
     * Deprecates old versions and creates a new record marked as latest.
     */
    public function executeRenewalFlow(CaCertificate $cert, int $days): CaCertificate
    {
        $newData = $this->renewCaCertificate($cert, $days);

        CaCertificate::where('ca_type', $cert->ca_type)
            ->where('common_name', $cert->common_name)
            ->update(['is_latest' => false]);

        return CaCertificate::create([
            'ca_type' => $cert->ca_type,
            'key_algorithm' => $cert->key_algorithm ?? 'rsa',
            'curve_name' => $cert->curve_name,
            'common_name' => $cert->common_name,
            'organization' => $cert->organization,
            'key_content' => $cert->key_content,
            'cert_content' => $newData['cert_content'],
            'serial_number' => $newData['serial_number'],
            'valid_from' => $newData['valid_from'],
            'valid_to' => $newData['valid_to'],
            'issuer_name' => $newData['issuer_name'],
            'issuer_serial' => $newData['issuer_serial'],
            'family_id' => $newData['family_id'],
            'is_latest' => true,
        ]);
    }

    /**
     * Perform a coordinated renewal of the entire CA chain.
     *
     * Order: Root -> Intermediates.
     *
     * @throws Exception if Root CA is not found
     */
    public function bulkRenewStrategy(): bool
    {
        $rootDays = Config::get('openssl.durations.root', 18250);
        $intDays = Config::get('openssl.durations.intermediate', 9125);

        // Renew all root CAs (RSA + ECC)
        $roots = CaCertificate::whereIn('ca_type', ['root', 'root_ecc'])
            ->where('is_latest', true)
            ->get();

        if ($roots->isEmpty()) {
            $roots = CaCertificate::whereIn('ca_type', ['root', 'root_ecc'])->latest()->get();
        }

        if ($roots->isEmpty()) {
            throw new Exception('No Root CA found for renewal.');
        }

        foreach ($roots as $root) {
            $this->executeRenewalFlow($root, $rootDays);
        }

        // Renew all intermediates (RSA + ECC)
        $intermediates = CaCertificate::whereIn('ca_type', [
            'intermediate_2048',
            'intermediate_4096',
            'intermediate_ecc_256',
            'intermediate_ecc_384',
        ])
            ->where('is_latest', true)
            ->get();

        foreach ($intermediates as $int) {
            $this->executeRenewalFlow($int, $intDays);
        }

        Log::info('Bulk CA renewal (RSA + ECC) completed successfully.');

        return true;
    }
}
