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
        Schema::create('certificates', function (Blueprint $table) {
            $table->uuid('uuid')->primary();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('common_name');
            $table->string('organization')->nullable();
            $table->string('locality')->nullable();
            $table->string('state')->nullable();
            $table->string('country', 2)->nullable();
            $table->text('san')->nullable();
            $table->unsignedSmallInteger('key_bits')->default(2048);
            $table->string('serial_number');
            $table->text('cert_content');
            $table->text('key_content');  // Encrypted via Crypt::encryptString()
            $table->text('csr_content');
            $table->datetime('valid_from');
            $table->datetime('valid_to');
            $table->datetime('expired_notification_sent_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('common_name');
            $table->index('valid_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
