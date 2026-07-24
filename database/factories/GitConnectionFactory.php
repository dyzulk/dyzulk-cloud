<?php

namespace Database\Factories;

use App\Models\GitConnection;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GitConnection>
 */
class GitConnectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'provider' => 'github',
            'provider_installation_id' => (string) $this->faker->unique()->numberBetween(100000, 999999),
            'provider_account_id' => (string) $this->faker->numberBetween(100000, 999999),
            'provider_account_name' => $this->faker->userName(),
            'provider_account_avatar_url' => $this->faker->imageUrl(),
            'access_token' => $this->faker->sha256(),
            'refresh_token' => $this->faker->sha256(),
            'expires_at' => now()->addHours(8),
            'repository_selection' => 'all',
        ];
    }
}
