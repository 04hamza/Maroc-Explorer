<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProvinceTranslation extends Model
{
    use HasFactory;
    protected $fillable = [
        'province_id',
        'language_code',
        'name',
        'title',
        'description',
        'Total_Population',
        'Area',
        'Numbrer_Communes',
        'Provincial_Capital',
        "image"
    ];
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_code', 'code');
    }
}
