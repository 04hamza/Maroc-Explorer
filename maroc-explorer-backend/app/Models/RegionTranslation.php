<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegionTranslation extends Model
{
    use HasFactory;
    protected $fillable = ['region_id', 'language_code', 'name', 'description',"image","title","Total_Population",
    "Area","Number_Provinces","Numbrer_Communes","Urbanization_Rate"];
    public $timestamps = true;

}
