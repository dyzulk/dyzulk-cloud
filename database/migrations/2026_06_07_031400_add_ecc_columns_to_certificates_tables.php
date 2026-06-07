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
        Schema::table('ca_certificates', function (Blueprint $table) {
            $table->string('key_algorithm', 10)->default('rsa')->after('ca_type');
            $table->string('curve_name', 20)->nullable()->after('key_algorithm');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->string('key_algorithm', 10)->default('rsa')->after('key_bits');
            $table->string('curve_name', 20)->nullable()->after('key_algorithm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ca_certificates', function (Blueprint $table) {
            $table->dropColumn(['key_algorithm', 'curve_name']);
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn(['key_algorithm', 'curve_name']);
        });
    }
};
