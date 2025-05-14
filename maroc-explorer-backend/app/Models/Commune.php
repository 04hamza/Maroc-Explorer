<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commune extends Model
{
    use HasFactory;
    protected $fillable = ['province_id', 'name', 'latitude', 'longitude', 'zoom',"is_published"];

      public function province()
      {
          return $this->belongsTo(Province::class);
      }

      public function translations()
      {
          return $this->hasMany(CommuneTranslation::class);
      }

      public function sections()
      {
          return $this->hasMany(CommuneSection::class);
      }
}
