<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lottery_rounds', function (Blueprint $table) {
            $table->id();
            $table->timestamp('draws_at')->index();
            $table->string('status', 16)->default('open')->index(); // open | drawn
            $table->string('seed_hash', 64);
            $table->string('server_seed', 64); // revealed after the draw
            $table->json('numbers')->nullable();
            $table->unsignedBigInteger('pool')->default(0);
            $table->unsignedBigInteger('carried_over')->default(0);
            $table->unsignedBigInteger('paid_out')->default(0);
            $table->unsignedInteger('tickets_count')->default(0);
            $table->timestamp('drawn_at')->nullable();
            $table->timestamps();
        });

        Schema::create('lottery_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lottery_round_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('numbers');
            $table->unsignedTinyInteger('matches')->nullable();
            $table->unsignedBigInteger('prize')->default(0);
            $table->timestamps();

            $table->index(['lottery_round_id', 'user_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lottery_tickets');
        Schema::dropIfExists('lottery_rounds');
    }
};
