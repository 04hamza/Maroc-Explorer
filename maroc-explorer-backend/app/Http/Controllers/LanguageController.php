<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Language;

class LanguageController extends Controller
{
    public function store(Request $request){
        $validated=$request->validate([
            'code'=>'required|unique:languages|max:5|string',
            'name'=>'required|max:50|string',
        ]);
        $language=Language::create($validated);
        return response()->json(["message"=>"Page created successfully",
         "data"=>$language],201);
    }
}
