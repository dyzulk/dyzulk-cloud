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
        Schema::create('server_operations', function (Blueprint $table) {
            $table->id();
            $table->foreignId("server_id")->constrained()->cascadeOnDelete();
            $table->string("type");
            $table->string("status")->default("queued");
            $table->text("error_message")->nullable();
            $table->json("result")->nullable();
            $table->json("logs")->nullable();
            $table->timestamp("started_at")->nullable();
            $table->timestamp("completed_at")->nullable();
            $table->timestamps();

            $table->index(["server_id", "status"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_operations');
    }
};
