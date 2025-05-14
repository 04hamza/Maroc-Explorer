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
        Schema::create('region_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->onDelete('cascade');
            $table->string('language_code', 5);
            $table->foreign('language_code')->references('code')->on('languages')->onDelete('cascade');
            $table->string('name'); // e.g., "Tanger-Tétouan-Al Hoceïma"
            $table->string('title')->nullable(); // e.g., "Discover Tanger-Tétouan-Al Hoceïma"
            $table->text('description')->nullable(); // Short description
            $table->unique(['region_id', 'language_code']);
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
        Schema::dropIfExists('region_translations');
    }
};
