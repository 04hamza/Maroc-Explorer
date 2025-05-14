<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegionSectionTranslation extends Model
{
    use HasFactory;
    protected $fillable = ['region_section_id', 'language_code', 'title', 'content',"image"];
    public $timestamps = true;
}
