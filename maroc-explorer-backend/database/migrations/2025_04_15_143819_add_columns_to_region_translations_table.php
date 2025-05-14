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
            $table->bigInteger('Total_Population')->unsigned()->nullable()->after('description');
            $table->float('Area')->unsigned()->nullable();
            $table->Integer('Number_Provinces')->unsigned()->nullable();
            $table->Integer('Numbrer_Communes')->unsigned()->nullable();
            $table->float("Urbanization_Rate");
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
            $table->dropColumn('Total_Population');
            $table->dropColumn('Area');
            $table->dropColumn('Number_Provinces');
            $table->dropColumn('Numbrer_Communes');
            $table->dropColumn('Urbanization_Rate');
        });
    }
};
