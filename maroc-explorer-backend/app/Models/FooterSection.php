<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FooterSection extends Model
{
    use HasFactory;
    protected $fillable = ['slug', 'order', 'social_links'];
    protected $casts = ['social_links' => 'array'];

    public function translations()
    {
        return $this->hasMany(FooterSectionTranslation::class);
    }
}
