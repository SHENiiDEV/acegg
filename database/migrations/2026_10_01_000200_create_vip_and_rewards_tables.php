<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('vip_xp')->default(0)->after('balance');
            $table->string('vip_synced_until', 32)->nullable()->after('vip_xp');
            $table->timestamp('cashback_claimed_at')->nullable()->after('vip_synced_until');
        });

        // Per-day play stats (from SpinKit rounds) — drives XP and missions.
        Schema::create('player_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedBigInteger('wagered')->default(0);
            $table->unsignedBigInteger('won')->default(0);
            $table->unsignedInteger('rounds')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });

        // One row per claimed reward (mission, level-up, cashback) — prevents double claims.
        Schema::create('reward_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key', 80);
            $table->unsignedBigInteger('amount');
            $table->timestamps();

            $table->unique(['user_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_claims');
        Schema::dropIfExists('player_daily_stats');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['vip_xp', 'vip_synced_until', 'cashback_claimed_at']);
        });
    }
};
