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
        Schema::create('province_section_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_sections_id')->constrained()->onDelete('cascade');
            $table->string('language_code', 5);
            $table->foreign('language_code')->references('code')->on('languages')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->unique(['province_sections_id', 'language_code'], 'ps_translations_region_lang_unique');
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
        Schema::dropIfExists('province_sections_translations');
    }
};
