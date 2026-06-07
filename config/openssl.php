<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Certificate Durations (in days)
    |--------------------------------------------------------------------------
    |
    | Configurable durations for each tier of the CA hierarchy.
    | Root: 50 years, Intermediate: 25 years, Leaf: 1 year.
    |
    */
    'durations' => [
        'root'         => env('CA_DURATION_ROOT', 18250),         // 50 Years
        'intermediate' => env('CA_DURATION_INTERMEDIATE', 9125),  // 25 Years
        'leaf'         => env('CA_DURATION_LEAF', 365),           // 1 Year
    ],

    'ca_root' => [
        'countryName'            => env('CA_ROOT_COUNTRY_NAME', 'ID'),
        'organizationName'       => env('CA_ROOT_ORGANIZATION_NAME', 'DyDev Authority'),
        'organizationalUnitName' => env('CA_ROOT_ORGANIZATIONAL_UNIT_NAME', 'Security Division'),
        'commonName'             => env('CA_ROOT_COMMON_NAME', 'DyDev Its True'),
    ],
    'ca_4096' => [
        'countryName'            => env('CA_4096_COUNTRY_NAME', 'ID'),
        'organizationName'       => env('CA_4096_ORGANIZATION_NAME', 'DyCloud CA'),
        'organizationalUnitName' => env('CA_4096_ORGANIZATIONAL_UNIT_NAME', 'Security Division'),
        'commonName'             => env('CA_4096_COMMON_NAME', 'DyCloud Intermediate CA 4096'),
    ],
    'ca_2048' => [
        'countryName'            => env('CA_2048_COUNTRY_NAME', 'ID'),
        'organizationName'       => env('CA_2048_ORGANIZATION_NAME', 'DyCloud CA'),
        'organizationalUnitName' => env('CA_2048_ORGANIZATIONAL_UNIT_NAME', 'Security Division'),
        'commonName'             => env('CA_2048_COMMON_NAME', 'DyCloud Intermediate CA 2048'),
    ],
    'ca_leaf_default' => [
        'countryName'            => env('CA_LEAF_DEFAULT_COUNTRY_NAME', 'ID'),
        'localityName'           => env('CA_LEAF_DEFAULT_LOCALITY', 'Jakarta'),
        'stateOrProvinceName'    => env('CA_LEAF_DEFAULT_STATE', 'DKI Jakarta'),
        'organizationName'       => env('CA_LEAF_DEFAULT_ORGANIZATION_NAME', 'DyCloud Signing'),
        'commonName'             => env('CA_LEAF_DEFAULT_COMMON_NAME', 'customer.dycloud.id'),
    ],

    /*
    |--------------------------------------------------------------------------
    | ECC (Elliptic Curve) CA Configuration
    |--------------------------------------------------------------------------
    |
    | Separate CA chain using Elliptic Curve keys for modern TLS.
    | Root ECC uses secp384r1, intermediates use secp384r1 and prime256v1.
    |
    | NOTE: ecc_bypass_bits is used to bypass PHP openssl_pkey_new validation quirk.
    |
    */
    'ecc_bypass_bits' => env('CA_ECC_BYPASS_BITS', 384),

    'ca_root_ecc' => [
        'countryName'            => env('CA_ROOT_ECC_COUNTRY_NAME', 'ID'),
        'organizationName'       => env('CA_ROOT_ECC_ORGANIZATION_NAME', 'DyDev Authority'),
        'organizationalUnitName' => env('CA_ROOT_ECC_ORGANIZATIONAL_UNIT_NAME', 'ECC Security Division'),
        'commonName'             => env('CA_ROOT_ECC_COMMON_NAME', 'DyDev ECC Root CA'),
    ],
    'ca_ecc_384' => [
        'countryName'            => env('CA_ECC_384_COUNTRY_NAME', 'ID'),
        'organizationName'       => env('CA_ECC_384_ORGANIZATION_NAME', 'DyCloud CA'),
        'organizationalUnitName' => env('CA_ECC_384_ORGANIZATIONAL_UNIT_NAME', 'ECC Security Division'),
        'commonName'             => env('CA_ECC_384_COMMON_NAME', 'DyCloud Intermediate CA ECC P-384'),
    ],
    'ca_ecc_256' => [
        'countryName'            => env('CA_ECC_256_COUNTRY_NAME', 'ID'),
        'organizationName'       => env('CA_ECC_256_ORGANIZATION_NAME', 'DyCloud CA'),
        'organizationalUnitName' => env('CA_ECC_256_ORGANIZATIONAL_UNIT_NAME', 'ECC Security Division'),
        'commonName'             => env('CA_ECC_256_COMMON_NAME', 'DyCloud Intermediate CA ECC P-256'),
    ],
];
