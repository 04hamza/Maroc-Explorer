<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProvinceSectionTranslation extends Model
{
    use HasFactory;
    protected $fillable = [
        'province_sections_id',
        'language_code',
        'title',
        'content',
        "image"
    ];

    public function section()
    {
        return $this->belongsTo(ProvinceSection::class, 'province_sections_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_code', 'code');
    }
}
