<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\ProvinceController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FooterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CommuneController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('pages')->group(function () {
    Route::post('{slug}', [PageController::class, 'store']);
    Route::get('{slug}', [PageController::class, 'show']);
    Route::post('sections/{slug}', [PageController::class, 'store_page_sections']);
});
Route::post('languages',[LanguageController::class,"store"]);


Route::get('regions/{slug}/articles', [ArticleController::class, 'byRegion']);
Route::get('provinces/{slug}/articles', [ArticleController::class, 'byProvince']);
Route::get('articles/latest', [ArticleController::class, 'latest']);
Route::get('articles/{id}', [ArticleController::class, 'show']);
Route::post('articles/{slug}', [ArticleController::class, 'store']);


Route::get('regions', [RegionController::class, 'index']);
Route::get('regions/Client', [RegionController::class, 'indexClient']);
Route::get('regions/{slug}', [RegionController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    Route::post('regions', [RegionController::class, 'store']);
    Route::put('regions/{slug}', [RegionController::class, 'update']);
    Route::delete('regions/{slug}', [RegionController::class, 'destroy']);
    Route::post('regions/translations/{slug}', [RegionController::class, 'store_region_translations']);
    Route::post('regions/sections/{slug}', [RegionController::class, 'store_region_sections']);
});


Route::get("regions/{slug}/province",[ProvinceController::class,"byRegion"]);
Route::get("regions/{slug}/provinces",[ProvinceController::class,"byRegionProvinces"]);
Route::get('regions/{slug}/provinces/admin', [ProvinceController::class, 'byRegionForAdmin']);


Route::prefix('provinces')->group(function () {
    Route::get('/', [ProvinceController::class, 'index']);
    Route::post('/', [ProvinceController::class, 'store']);
    Route::get('{slug}', [ProvinceController::class, 'show']);
    Route::put('{slug}', [ProvinceController::class, 'update']);
    Route::delete('{slug}', [ProvinceController::class, 'destroy']);
});

Route::prefix('footer')->group(function () {
    Route::get('/', [FooterController::class, 'index']);
    Route::post('/', [FooterController::class, 'store']);
});


Route::post('/contact', [ContactController::class,'store']);
Route::post('/track-visit', [StatsController::class, 'trackVisit']);





Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:api');
Route::get('/stats', [StatsController::class, 'stats'])->middleware('auth:api');
Route::get('/recentActivity', [StatsController::class, 'recentActivity'])->middleware('auth:api');
Route::get('/visits', [StatsController::class, 'visits'])->middleware('auth:api');
Route::middleware('auth:api')->group(function () {
Route::get('/contacts', [ContactController::class, 'index']);
Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
Route::post('/contacts/{id}/reply', [ContactController::class, 'reply']);
});


Route::middleware('auth:api')->group(function () {
    Route::get('/recent-users', [StatsController::class, 'recentUsers']);
    Route::apiResource('users', UserController::class);
    Route::get('/token-info', [AuthController::class, 'tokenInfo']);
    Route::post('/refresh-token', [AuthController::class, 'refresh']);
});



Route::get('/provinces/{slug}/communes', [ProvinceController::class, 'byCommunesForAdmin']);
Route::post('regions/{region_id}/section-translations', [RegionController::class, 'store_region_section_translations']);
Route::get('provinces/{slug}/communes/admin', [CommuneController::class, 'byProvincesForAdmin']);
Route::prefix('communes')->group(function () {
    Route::post('/{slug}', [CommuneController::class, 'store']); 
    Route::post('/', [CommuneController::class, 'storeAdmin']) ; //->middleware("auth:api");
    Route::get('/{name}', [CommuneController::class, 'show']); 
    Route::get('/by-province/{slug}', [CommuneController::class, 'byProvince']); 
    Route::put('/{name}', [CommuneController::class, 'update']) ;
    Route::delete('/{name}', [CommuneController::class, 'destroy']); 
});
