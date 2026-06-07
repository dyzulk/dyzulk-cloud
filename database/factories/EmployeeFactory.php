<?php

namespace Database\Factories;

use App\Enums\OfficeDepartment;
use App\Enums\OfficeRole;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'employee_id' => 'EMP-' . fake()->unique()->numerify('####'),
            'department' => fake()->randomElement(OfficeDepartment::cases()),
            'role' => OfficeRole::Staff,
            'is_active' => true,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the employee is an administrator.
     */
    public function administrator(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => OfficeRole::Administrator,
            'department' => OfficeDepartment::Administration,
        ]);
    }

    /**
     * Indicate that the employee is a manager.
     */
    public function manager(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => OfficeRole::Manager,
        ]);
    }

    /**
     * Indicate that the employee belongs to the finance department.
     */
    public function finance(): static
    {
        return $this->state(fn (array $attributes) => [
            'department' => OfficeDepartment::Finance,
        ]);
    }

    /**
     * Indicate that the employee belongs to the marketing department.
     */
    public function marketing(): static
    {
        return $this->state(fn (array $attributes) => [
            'department' => OfficeDepartment::Marketing,
        ]);
    }

    /**
     * Indicate that the employee belongs to the planning department.
     */
    public function planning(): static
    {
        return $this->state(fn (array $attributes) => [
            'department' => OfficeDepartment::Planning,
        ]);
    }

    /**
     * Indicate that the employee is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
