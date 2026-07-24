<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('git_connection_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->string('environment')->default('production');
            $table->string('region');
            $table->string('git_repository_id')->nullable();
            $table->string('repository_name')->nullable();
            $table->string('branch')->default('main');
            $table->string('compute_size');
            $table->string('status')->default('idle'); // 'live', 'deploying', 'failed', 'idle'
            $table->integer('port')->default(80);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
