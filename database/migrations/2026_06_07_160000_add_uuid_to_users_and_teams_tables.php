<?php

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->unique()->nullable();
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->unique()->nullable();
        });

        // Backfill existing rows with UUIDs
        foreach (User::all() as $user) {
            $user->update(['uuid' => (string) Str::uuid()]);
        }

        foreach (Team::all() as $team) {
            $team->update(['uuid' => (string) Str::uuid()]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
