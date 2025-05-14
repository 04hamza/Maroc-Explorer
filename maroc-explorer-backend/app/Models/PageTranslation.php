<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageTranslation extends Model
{
    use HasFactory;
    protected $fillable = ['page_id', 'language_code', 'title', 'description'];
    public $timestamps = false;
}
