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
        Schema::table('devices', function (Blueprint $table) {
            $table->text('identity_key')->nullable();
            $table->text('signed_pre_key')->nullable();
            $table->text('signed_pre_key_signature')->nullable();
            $table->unsignedInteger('signed_pre_key_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn([
                'identity_key',
                'signed_pre_key',
                'signed_pre_key_signature',
                'signed_pre_key_id'
            ]);
        });
    }
};
