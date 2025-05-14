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
        Schema::table('commune_translations', function (Blueprint $table) {
            $table->string('number_faculties')->nullable()->after('image');
            $table->string('number_hospitals')->nullable()->after('number_faculties');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('commune_translations', function (Blueprint $table) {
            $table->dropColumn(['number_faculties', 'number_hospitals']);
        });
    }
};
