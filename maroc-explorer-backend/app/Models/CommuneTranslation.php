<?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;

  class CommuneTranslation extends Model
  {
      use HasFactory;

      protected $fillable = [
          'commune_id',
          'language_code',
          'name',
          'title',
          'description',
          'Total_Population',
          'Area',
          'Number_Communes',
          'Provincial_Capital',
          'image',
          'number_faculties',
           'number_hospitals'
      ];

      public function commune()
      {
          return $this->belongsTo(Commune::class);
      }

      public function language()
      {
          return $this->belongsTo(Language::class, 'language_code', 'code');
      }
  }
