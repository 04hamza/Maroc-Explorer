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
        Schema::table('region_translations', function (Blueprint $table) {
            $table->string('Total_Population')->nullable()->change();
            $table->string('Area')->nullable()->change();
            $table->string('Number_Provinces')->nullable()->change();
            $table->string('Numbrer_Communes')->nullable()->change();
            $table->string('Urbanization_Rate')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('region_translations', function (Blueprint $table) {
            $table->bigInteger('Total_Population')->unsigned()->nullable()->change();
            $table->float('Area')->unsigned()->nullable()->change();
            $table->integer('Number_Provinces')->unsigned()->nullable()->change();
            $table->integer('Numbrer_Communes')->unsigned()->nullable()->change();
            $table->float('Urbanization_Rate')->nullable()->change();
        });
    }
};
