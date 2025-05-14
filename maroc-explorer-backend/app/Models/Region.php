<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;
    protected $fillable = ['slug','latitude', 'longitude', 'zoom',"is_published"];

    public function translations()
    {
        return $this->hasMany(RegionTranslation::class);
    }

    public function sections()
    {
        return $this->hasMany(RegionSection::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }
    public function provinces()
    {
        return $this->hasMany(Province::class);
    }
}
