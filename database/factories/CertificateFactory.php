<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'common_name' => fake()->domainName(),
            'organization' => fake()->company(),
            'locality' => fake()->city(),
            'state' => fake()->state(),
            'country' => fake()->countryCode(),
            'san' => 'www.'.fake()->domainName(),
            'key_bits' => 2048,
            'key_algorithm' => 'rsa',
            'curve_name' => null,
            'serial_number' => strtoupper(fake()->sha1()),
            'cert_content' => "-----BEGIN CERTIFICATE-----\n".base64_encode(fake()->sha256())."\n-----END CERTIFICATE-----",
            'key_content' => "-----BEGIN PRIVATE KEY-----\n".base64_encode(fake()->sha256())."\n-----END PRIVATE KEY-----",
            'csr_content' => "-----BEGIN CERTIFICATE REQUEST-----\n".base64_encode(fake()->sha256())."\n-----END CERTIFICATE REQUEST-----",
            'valid_from' => now(),
            'valid_to' => now()->addDays(397),
        ];
    }

    /**
     * Certificate with ECC algorithm.
     */
    public function ecc(): static
    {
        return $this->state(fn () => [
            'key_algorithm' => 'ecc',
            'key_bits' => null,
            'curve_name' => 'prime256v1',
        ]);
    }

    /**
     * Expired certificate.
     */
    public function expired(): static
    {
        return $this->state(fn () => [
            'valid_from' => now()->subYear(),
            'valid_to' => now()->subDay(),
        ]);
    }
}
