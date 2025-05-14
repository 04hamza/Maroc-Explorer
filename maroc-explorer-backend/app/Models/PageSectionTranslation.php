<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageSectionTranslation extends Model
{
    use HasFactory;
    protected $fillable = ['page_section_id', 'language_code', 'title', 'content'];
    public $timestamps = false;
}
