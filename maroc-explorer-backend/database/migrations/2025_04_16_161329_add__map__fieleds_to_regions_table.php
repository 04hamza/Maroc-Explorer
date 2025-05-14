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
        Schema::table('regions', function (Blueprint $table) {
            $table->decimal('latitude', 9, 6)->nullable()->after('slug');
            $table->decimal('longitude', 9, 6)->nullable()->after('latitude');
            $table->integer('zoom')->default(8)->after('longitude');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('regions', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'zoom']);
        });
    }
};
