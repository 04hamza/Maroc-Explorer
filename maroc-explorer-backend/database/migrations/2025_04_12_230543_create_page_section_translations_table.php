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
        Schema::create('page_section_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_section_id')->constrained()->onDelete('cascade');
            $table->string('language_code', 5);
            $table->foreign('language_code')->references('code')->on('languages')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->unique(['page_section_id', 'language_code']);
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
        Schema::dropIfExists('page_section_translations');
    }
};
