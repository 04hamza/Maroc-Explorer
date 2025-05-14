<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FooterSectionTranslation extends Model
{
    use HasFactory;
    protected $fillable = ['footer_section_id', 'language_code', 'title', 'content', 'email', 'phone', 'address', 'copyright'];
    public $timestamps = true;

    public function footerSection()
    {
        return $this->belongsTo(FooterSection::class);
    }
}
