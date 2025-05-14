<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageSection extends Model
{
    use HasFactory;
    protected $fillable = ['page_id', 'slug', 'order'];

    public function translations() {
        return $this->hasMany(PageSectionTranslation::class);
    }
}
