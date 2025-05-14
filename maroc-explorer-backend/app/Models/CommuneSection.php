<?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;

  class CommuneSection extends Model
  {
      use HasFactory;

      protected $fillable = [
          'commune_id',
          'slug',
          'order',
      ];

      public function commune()
      {
          return $this->belongsTo(Commune::class);
      }

      public function translations()
      {
          return $this->hasMany(CommuneSectionTranslation::class, 'commune_sections_id');
      }
  }