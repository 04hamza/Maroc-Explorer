<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('region_sections', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->unique(['region_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('region_sections', function (Blueprint $table) {
            $table->dropUnique(['region_id', 'slug']);
            $table->unique('slug');
        });
    }
};
