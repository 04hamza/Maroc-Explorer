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
        Schema::create('footer_section_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('footer_section_id')->constrained()->onDelete('cascade');
            $table->string('language_code');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('copyright')->nullable();
            $table->timestamps();

            $table->unique(['footer_section_id', 'language_code'], 'footer_translations_unique');
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
        Schema::dropIfExists('footer_section_translations');
    }
};
