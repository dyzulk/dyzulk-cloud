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
        Schema::create('application_resources', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type'); // 'postgresql', 'valkey', 'redis', 's3'
            $table->text('connection_details'); // Encrypted JSON
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('application_resource_pivot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_resource_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['application_id', 'application_resource_id'], 'app_resource_pivot_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_resource_pivot');
        Schema::dropIfExists('application_resources');
    }
};
