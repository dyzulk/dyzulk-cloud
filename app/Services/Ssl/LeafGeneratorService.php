<?php

namespace App\Services\Ssl;

use App\Models\CaCertificate;
use App\Support\OpenSslUtils;
use Exception;
use Illuminate\Support\Facades\Config;

/**
 * Handles the generation of end-user (leaf) certificates.
 *
 * This service is utilized frequently whenever users request new certificates.
 * It is separated from CaSetupService to keep memory footprint minimal during
 * daily API operations.
 */
class LeafGeneratorService
{
    /**
     * Generate a new Leaf Certificate signed by the appropriate Intermediate CA.
     *
     * @param array{
     *     common_name: string,
     *     organization: ?string,
     *     locality: ?string,
     *     state: ?string,
     *     country: ?string,
     *     san: ?string,
     *     is_test_short_lived?: bool,
     *     algorithm?: string,
     *     key_bits?: int,
     *     curve_name?: string
     * } $data
     * @return array{
     *     cert: string,
     *     key: string,
     *     csr: string,
     *     serial: string,
     *     valid_from: string,
     *     valid_to: string,
     *     key_algorithm: string,
     *     curve_name: ?string
     * }
     */
    public function generateLeaf(array $data): array
    {
        $algorithm = $data['algorithm'] ?? 'rsa';

        if ($algorithm === 'ecc') {
            return $this->generateLeafEcc($data);
        }

        return $this->generateLeafRsa($data);
    }

    /**
     * Generate RSA Leaf Certificate
     */
    private function generateLeafRsa(array $data): array
    {
        $keyBits = (int) ($data['key_bits'] ?? 2048);

        $intermediateType = $keyBits === 4096 ? 'intermediate_4096' : 'intermediate_2048';

        $intermediate = CaCertificate::where('ca_type', $intermediateType)
            ->where('is_latest', true)
            ->first();

        if (! $intermediate) {
            throw new Exception("Intermediate CA {$intermediateType} not found or not ready.");
        }

        $keyOptions = [
            'private_key_bits' => $keyBits,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ];

        return $this->signLeafCertificate($data, $intermediate, $keyOptions, 'rsa', null);
    }

    /**
     * Generate ECC Leaf Certificate
     */
    private function generateLeafEcc(array $data): array
    {
        $curveName = $data['curve_name'] ?? 'prime256v1';

        $intermediateType = $curveName === 'secp384r1' ? 'intermediate_ecc_384' : 'intermediate_ecc_256';

        $intermediate = CaCertificate::where('ca_type', $intermediateType)
            ->where('is_latest', true)
            ->first();

        if (! $intermediate) {
            throw new Exception("Intermediate CA {$intermediateType} not found or not ready.");
        }

        $eccBypassBits = Config::get('openssl.ecc_bypass_bits', 384);

        $keyOptions = [
            'private_key_type' => OPENSSL_KEYTYPE_EC,
            'curve_name' => $curveName,
            'private_key_bits' => $eccBypassBits, // PHP openssl requirement for validation bypass
        ];

        return $this->signLeafCertificate($data, $intermediate, $keyOptions, 'ecc', $curveName);
    }

    /**
     * Helper to sign the leaf CSR with the selected Intermediate CA.
     */
    private function signLeafCertificate(
        array $data,
        CaCertificate $intermediate,
        array $keyOptions,
        string $algorithm,
        ?string $curveName
    ): array {
        $dn = [
            'commonName' => $data['common_name'],
        ];

        if (! empty($data['organization'])) {
            $dn['organizationName'] = $data['organization'];
        }
        if (! empty($data['locality'])) {
            $dn['localityName'] = $data['locality'];
        }
        if (! empty($data['state'])) {
            $dn['stateOrProvinceName'] = $data['state'];
        }
        if (! empty($data['country'])) {
            $dn['countryName'] = $data['country'];
        }

        $sanString = OpenSslUtils::buildSanString($data['common_name'], $data['san'] ?? '');
        $configFile = OpenSslUtils::createLeafConfigFile($data['common_name'], $sanString);

        try {
            $csrOptions = array_merge($keyOptions, ['config' => $configFile]);

            // Need to pass config to pkey_new on Windows
            $privKey = openssl_pkey_new($csrOptions);
            
            if (! $privKey) {
                throw new Exception('Failed to generate private key: ' . openssl_error_string());
            }

            $csr = openssl_csr_new($dn, $privKey, $csrOptions);

            $intPrivKey = openssl_pkey_get_private($intermediate->key_content);
            $intCert = openssl_x509_read($intermediate->cert_content);

            $serial = OpenSslUtils::generateSerialNumber();

            $isTest = $data['is_test_short_lived'] ?? false;
            $days = $isTest ? 1 : Config::get('openssl.leaf.days', 397);

            // Important: to get SAN into the cert, we must pass the config to csr_sign
            $x509 = openssl_csr_sign($csr, $intCert, $intPrivKey, $days, $csrOptions, $serial);

            openssl_x509_export($x509, $certOut);
            openssl_pkey_export($privKey, $pkeyOut, null, $csrOptions);
            openssl_csr_export($csr, $csrOut);

            $certInfo = openssl_x509_parse($x509);
            $serialHex = OpenSslUtils::extractSerialHex($certInfo);

            return [
                'cert' => $certOut,
                'key' => $pkeyOut,
                'csr' => $csrOut,
                'serial' => $serialHex,
                'valid_from' => date('Y-m-d H:i:s', $certInfo['validFrom_time_t']),
                'valid_to' => date('Y-m-d H:i:s', $certInfo['validTo_time_t']),
                'key_algorithm' => $algorithm,
                'curve_name' => $curveName,
            ];
        } finally {
            OpenSslUtils::cleanupConfigFile($configFile);
        }
    }
}
