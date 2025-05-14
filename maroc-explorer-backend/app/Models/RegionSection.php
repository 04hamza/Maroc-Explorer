<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegionSection extends Model
{
    use HasFactory;
    protected $fillable = ['region_id','slug','order'];
    public function translations()
    {
        return $this->hasMany(RegionSectionTranslation::class);
    }
}
