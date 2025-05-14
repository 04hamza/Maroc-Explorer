<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;
    protected $fillable = ['slug'];

    public function translations() {
        return $this->hasMany(PageTranslation::class);
    }
    public function sections() {
        return $this->hasMany(PageSection::class);
    }
}
