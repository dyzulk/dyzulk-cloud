<?php

namespace App\Services\Ssl;

use App\Models\CaCertificate;
use App\Support\OpenSslUtils;
use Exception;
use InvalidArgumentException;
use RuntimeException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Handles the initialization of the Certificate Authority (CA) hierarchy.
 *
 * This service is strictly used for one-time or administrative setup of
 * Root and Intermediate CAs for both RSA and ECC algorithms.
 */
class CaSetupService
{
    /**
     * Set up both RSA and ECC Certificate Authorities. (Legacy/All-in-one)
     */
    public function setupCa(): bool
    {
        if (CaCertificate::where('ca_type', 'root')->exists() || CaCertificate::where('ca_type', 'root_ecc')->exists()) {
            return false;
        }

        try {
            $this->setupSpecificCa('root');
            $this->setupSpecificCa('intermediate_4096');
            $this->setupSpecificCa('intermediate_2048');
            $this->setupSpecificCa('root_ecc');
            $this->setupSpecificCa('intermediate_ecc_384');
            $this->setupSpecificCa('intermediate_ecc_256');
            return true;
        } catch (Exception $e) {
            Log::error('Failed to setup Hybrid CA', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Setup a specific CA by its type.
     */
    public function setupSpecificCa(string $caType): bool
    {
        if (CaCertificate::where('ca_type', $caType)->where('is_latest', true)->exists()) {
            return false;
        }

        $configFile = null;
        try {
            $configFile = OpenSslUtils::createCaConfigFile();
            
            switch ($caType) {
                case 'root':
                    $rootDn = Config::get('openssl.ca_root', []);
                    $rootKeyOptions = ['private_key_bits' => 4096, 'private_key_type' => OPENSSL_KEYTYPE_RSA, 'config' => $configFile];
                    $this->createRootCa($rootDn, $rootKeyOptions, 'root', 'rsa');
                    break;
                case 'intermediate_4096':
                    $this->generateIntermediateRsa('intermediate_4096', 4096, $configFile);
                    break;
                case 'intermediate_2048':
                    $this->generateIntermediateRsa('intermediate_2048', 2048, $configFile);
                    break;
                case 'root_ecc':
                    $rootEccDn = Config::get('openssl.ca_root_ecc', []);
                    $eccBypassBits = Config::get('openssl.ecc_bypass_bits', 384);
                    $rootKeyOptions = ['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'secp384r1', 'private_key_bits' => $eccBypassBits, 'config' => $configFile];
                    $this->createRootCa($rootEccDn, $rootKeyOptions, 'root_ecc', 'ecc', 'secp384r1');
                    break;
                case 'intermediate_ecc_384':
                    $this->generateIntermediateEcc('intermediate_ecc_384', 'secp384r1', $configFile);
                    break;
                case 'intermediate_ecc_256':
                    $this->generateIntermediateEcc('intermediate_ecc_256', 'prime256v1', $configFile);
                    break;
                default:
                    throw new InvalidArgumentException("Invalid CA Type: {$caType}");
            }
            return true;
        } catch (Exception $e) {
            Log::error("Failed to setup {$caType}", ['error' => $e->getMessage()]);
            throw $e;
        } finally {
            OpenSslUtils::cleanupConfigFile($configFile);
        }
    }

    private function generateIntermediateRsa(string $caType, int $bits, string $configFile): void
    {
        $rootCa = CaCertificate::where('ca_type', 'root')->where('is_latest', true)->first();
        if (!$rootCa) {
            throw new RuntimeException('Root RSA CA is not initialized.');
        }

        $dn = Config::get("openssl.ca_{$bits}", []);
        $keyOptions = ['private_key_bits' => $bits, 'private_key_type' => OPENSSL_KEYTYPE_RSA, 'config' => $configFile];
        
        $this->createIntermediateCa($dn, $keyOptions, $caType, 'rsa', null, $rootCa);
    }

    private function generateIntermediateEcc(string $caType, string $curveName, string $configFile): void
    {
        $rootCa = CaCertificate::where('ca_type', 'root_ecc')->where('is_latest', true)->first();
        if (!$rootCa) {
            throw new RuntimeException('Root ECC CA is not initialized.');
        }

        $configKey = str_replace('intermediate_ecc_', 'ca_ecc_', $caType);
        $dn = Config::get("openssl.{$configKey}", []);
        $eccBypassBits = Config::get('openssl.ecc_bypass_bits', 384);
        $keyOptions = ['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => $curveName, 'private_key_bits' => $eccBypassBits, 'config' => $configFile];

        $this->createIntermediateCa($dn, $keyOptions, $caType, 'ecc', $curveName, $rootCa);
    }



    /**
     * Create and store a Root CA
     */
    private function createRootCa(
        array $dn,
        array $keyOptions,
        string $caType,
        string $algorithm,
        ?string $curveName = null
    ): CaCertificate {
        $privKey = openssl_pkey_new($keyOptions);
        $csr = openssl_csr_new($dn, $privKey, $keyOptions);
        $serial = OpenSslUtils::generateSerialNumber();
        $days = Config::get("openssl.{$caType}.days", 18250); // 50 years default
        $x509 = openssl_csr_sign($csr, null, $privKey, $days, $keyOptions, $serial);

        openssl_x509_export($x509, $certOut);
        openssl_pkey_export($privKey, $pkeyOut, null, $keyOptions);
        openssl_csr_export($csr, $csrOut);

        $certInfo = openssl_x509_parse($x509);
        $serialHex = OpenSslUtils::extractSerialHex($certInfo);

        $uuid = (string) Str::uuid();

        return CaCertificate::create([
            'common_name' => $dn['commonName'],
            'ca_type' => $caType,
            'key_algorithm' => $algorithm,
            'curve_name' => $curveName,
            'serial_number' => $serialHex,
            'cert_content' => $certOut,
            'key_content' => $pkeyOut,
            'csr_content' => $csrOut,
            'valid_from' => date('Y-m-d H:i:s', $certInfo['validFrom_time_t']),
            'valid_to' => date('Y-m-d H:i:s', $certInfo['validTo_time_t']),
            'is_latest' => true,
            'family_id' => $uuid, // Root is its own family head
        ]);
    }

    /**
     * Create and store an Intermediate CA signed by the Root
     */
    private function createIntermediateCa(
        array $dn,
        array $keyOptions,
        string $caType,
        string $algorithm,
        ?string $curveName,
        CaCertificate $rootCa
    ): CaCertificate {
        $privKey = openssl_pkey_new($keyOptions);
        $csr = openssl_csr_new($dn, $privKey, $keyOptions);

        $rootPrivKey = openssl_pkey_get_private($rootCa->key_content);
        $rootCert = openssl_x509_read($rootCa->cert_content);
        $serial = OpenSslUtils::generateSerialNumber();

        // Ext file configuration allows the CA extensions to be applied during signing
        $days = Config::get("openssl.{$caType}.days", 9125); // 25 years default
        $x509 = openssl_csr_sign($csr, $rootCert, $rootPrivKey, $days, $keyOptions, $serial);

        openssl_x509_export($x509, $certOut);
        openssl_pkey_export($privKey, $pkeyOut, null, $keyOptions);
        openssl_csr_export($csr, $csrOut);

        $certInfo = openssl_x509_parse($x509);
        $serialHex = OpenSslUtils::extractSerialHex($certInfo);

        return CaCertificate::create([
            'common_name' => $dn['commonName'],
            'ca_type' => $caType,
            'key_algorithm' => $algorithm,
            'curve_name' => $curveName,
            'serial_number' => $serialHex,
            'cert_content' => $certOut,
            'key_content' => $pkeyOut,
            'csr_content' => $csrOut,
            'valid_from' => date('Y-m-d H:i:s', $certInfo['validFrom_time_t']),
            'valid_to' => date('Y-m-d H:i:s', $certInfo['validTo_time_t']),
            'is_latest' => true,
            'family_id' => $rootCa->family_id,
        ]);
    }
}
