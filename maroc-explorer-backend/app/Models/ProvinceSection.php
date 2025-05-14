<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProvinceSection extends Model
{
    use HasFactory;
    protected $fillable = [
        'province_id',
        'slug',
        'order',
    ];

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function translations()
    {
        return $this->hasMany(ProvinceSectionTranslation::class, 'province_sections_id');
    }
}
