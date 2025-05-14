<?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;

  class CommuneSectionTranslation extends Model
  {
      use HasFactory;

      protected $fillable = [
          'commune_sections_id',
          'language_code',
          'title',
          'content',
          'image'
      ];

      public function section()
      {
          return $this->belongsTo(CommuneSection::class, 'commune_sections_id');
      }

      public function language()
      {
          return $this->belongsTo(Language::class, 'language_code', 'code');
      }
  }