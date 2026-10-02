<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('package', 40)->nullable(); // null = custom amount
            $table->unsignedInteger('amount'); // cents
            $table->char('currency', 3);
            $table->unsignedBigInteger('coins'); // base coins, minor units
            $table->unsignedBigInteger('bonus_coins')->default(0);
            $table->string('status', 16)->default('pending')->index(); // pending | paid | failed
            $table->string('driver', 32);
            $table->string('provider_ref')->nullable()->index();
            $table->string('failure_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('payments');
    }
};
