<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\GitConnection;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->slug(2);

        return [
            'uuid' => (string) Str::uuid(),
            'team_id' => Team::factory(),
            'git_connection_id' => GitConnection::factory(),
            'name' => $name,
            'display_name' => Str::title(str_replace('-', ' ', $name)),
            'environment' => 'production',
            'region' => 'Asia Pacific (Singapore)',
            'git_repository_id' => (string) $this->faker->numberBetween(100000, 999999),
            'repository_name' => 'dyzulk/'.$name,
            'branch' => 'main',
            'compute_size' => 'Flex 512 MiB',
            'status' => 'idle',
            'port' => 80,
        ];
    }
}
