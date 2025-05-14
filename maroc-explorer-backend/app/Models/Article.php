<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{      
        protected $fillable = ["region_id",'slug', 'author', 'published_at'];
        protected $casts = [
            'published_at' => 'datetime',
        ];
    
        public function translations()
        {
            return $this->hasMany(ArticleTranslation::class);
        }
    
        public function region()
        {
            return $this->belongsTo(Region::class);
        }
}
