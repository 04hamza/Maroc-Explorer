<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleTranslation extends Model
{
    use HasFactory;
    protected $fillable = ['article_id', 'language_code', 'title', 'description', 'content', 'image'];
    public $timestamps = false;
}
