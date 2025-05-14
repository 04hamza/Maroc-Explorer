<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    use HasFactory;
    protected $fillable = ['region_id', 'name', 'latitude', 'longitude',"zoom","is_published"];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function translations()
    {
        return $this->hasMany(ProvinceTranslation::class);
    }

    public function sections()
    {
        return $this->hasMany(ProvinceSection::class);
    }
}
