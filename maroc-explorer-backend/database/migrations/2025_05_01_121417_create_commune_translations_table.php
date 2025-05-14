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
        Schema::create('commune_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commune_id')->constrained()->onDelete('cascade');
            $table->string('language_code');
            $table->string('name');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('Total_Population')->nullable();
            $table->string('Area')->nullable();
            $table->string('Number_Communes')->nullable();
            $table->string('Provincial_Capital')->nullable();
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
        Schema::dropIfExists('commune_translations');
    }
};
