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
        Schema::create('ca_certificates', function (Blueprint $table) {
            $table->uuid('uuid')->primary();
            $table->string('ca_type'); // root, intermediate_4096, intermediate_2048
            $table->text('cert_content');
            $table->text('key_content');
            $table->string('serial_number');
            $table->string('common_name');
            $table->string('organization')->nullable();
            $table->string('issuer_name')->nullable();
            $table->string('issuer_serial')->nullable();
            $table->uuid('family_id')->nullable();
            $table->datetime('valid_from');
            $table->datetime('valid_to');
            $table->boolean('is_latest')->default(false);
            $table->string('cert_path')->nullable();
            $table->string('der_path')->nullable();
            $table->string('bat_path')->nullable();
            $table->string('mac_path')->nullable();
            $table->string('linux_path')->nullable();
            $table->datetime('last_synced_at')->nullable();
            $table->unsignedBigInteger('download_count')->default(0);
            $table->datetime('last_downloaded_at')->nullable();
            $table->timestamps();

            $table->index(['ca_type', 'is_latest']);
            $table->index('family_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ca_certificates');
    }
};
