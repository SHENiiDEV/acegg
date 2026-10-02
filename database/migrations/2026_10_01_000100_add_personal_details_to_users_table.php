<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name', 100)->nullable()->after('name');
            $table->string('last_name', 100)->nullable()->after('first_name');
            $table->string('phone', 32)->nullable()->after('email');
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->string('address_line', 255)->nullable()->after('date_of_birth');
            $table->string('city', 120)->nullable()->after('address_line');
            $table->char('country', 2)->nullable()->after('city');
            $table->string('postcode', 20)->nullable()->after('country');
            $table->timestamp('terms_accepted_at')->nullable()->after('postcode');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'phone', 'date_of_birth', 'address_line', 'city', 'country', 'postcode', 'terms_accepted_at']);
        });
    }
};
