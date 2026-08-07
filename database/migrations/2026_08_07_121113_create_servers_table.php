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
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->uuid("uuid")->unique();
            $table->string("name");
            $table->text("description")->nullable();
            $table->string("host");
            $table->unsignedSmallInteger("port")->default(22);
            $table->string("username")->default("root");
            $table->string("type");
            $table->foreignId("ssh_key_id")->nullable()->constrained()->nullOnDelete();
            $table->foreignId("swarm_manager_server_id")->nullable()->constrained("servers")->nullOnDelete();
            $table->text("known_host")->nullable();
            $table->string("host_key_fingerprint")->nullable();
            $table->string("host_key_status")->default("pending");
            $table->string("connection_status")->default("unknown");
            $table->string("setup_status")->default("not_started");
            $table->timestamp("validated_at")->nullable();
            $table->timestamp("telemetry_collected_at")->nullable();
            $table->json("validation_result")->nullable();
            $table->json("telemetry")->nullable();
            $table->timestamps();

            $table->index(["type", "connection_status"]);
            $table->index("swarm_manager_server_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
