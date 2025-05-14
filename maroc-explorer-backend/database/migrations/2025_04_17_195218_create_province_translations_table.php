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
        Schema::create('province_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained()->onDelete('cascade');
            $table->string('language_code',5);
            $table->foreign('language_code')->references('code')->on('languages')->onDelete('cascade');
            $table->string('name');
            $table->string('title')->nullable(); 
            $table->text('description')->nullable();
            $table->unique(['province_id', 'language_code']);
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
        Schema::dropIfExists('province_translations');
    }
};
