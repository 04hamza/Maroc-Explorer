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
        Schema::create('commune_section_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commune_sections_id')->constrained('commune_sections')->onDelete('cascade');
            $table->string('language_code');
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
            $table->foreign('language_code')->references('code')->on('languages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('commune_section_translations');
    }
};
