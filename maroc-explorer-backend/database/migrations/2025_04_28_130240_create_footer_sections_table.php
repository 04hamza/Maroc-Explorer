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
            Schema::create('footer_sections', function (Blueprint $table) {
                $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
            $table->string('slug')->unique();
            $table->integer('order');
            $table->json('social_links')->nullable();
            $table->timestamps();
            });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('footer_sections');
    }
};
