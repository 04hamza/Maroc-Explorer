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
        Schema::table('province_translations', function (Blueprint $table) {
            $table->string('Total_Population')->nullable();
            $table->string('Area')->nullable();
            $table->string('Numbrer_Communes')->nullable();
            $table->string('Provincial_Capital')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('province_translations', function (Blueprint $table) {
            $table->dropColumn('Total_Population');
            $table->dropColumn('Area');
            $table->dropColumn('Numbrer_Communes');
            $table->dropColumn('Provincial_Capital');
        });
    }
};
