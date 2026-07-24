<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Backfill missing UUIDs
        foreach (User::whereNull('uuid')->get() as $u) {
            $u->update(['uuid' => (string) Str::uuid()]);
        }

        foreach (Team::whereNull('uuid')->get() as $t) {
            $t->update(['uuid' => (string) Str::uuid()]);
        }

        $user = User::where('email', 'test@example.com')->first();

        if (! $user) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        } else {
            $user->update([
                'password' => Hash::make('password'),
            ]);

            if (! $user->current_team_id || ! $user->currentTeam) {
                $team = Team::factory()->personal()->create([
                    'name' => $user->name."'s Team",
                ]);

                $team->members()->attach($user, [
                    'role' => TeamRole::Owner->value,
                ]);

                $user->switchTeam($team);
            }
        }
    }
}
