<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Coins in minor units (100 = 1.00 coin).
            $table->unsignedBigInteger('balance')->default(0)->after('password');
            $table->string('game_session_token')->nullable()->after('balance');
            $table->string('game_session_game_id')->nullable()->after('game_session_token');
            $table->timestamp('daily_bonus_claimed_at')->nullable()->after('game_session_game_id');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32); // welcome_bonus, daily_bonus, game_in, game_out
            $table->bigInteger('amount'); // signed: + credit, - debit
            $table->unsignedBigInteger('balance_after');
            $table->string('reference')->nullable()->unique(); // SpinKit tx_id
            $table->string('game_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['balance', 'game_session_token', 'game_session_game_id', 'daily_bonus_claimed_at']);
        });
    }
};
