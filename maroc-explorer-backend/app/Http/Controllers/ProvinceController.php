<?php

namespace App\Http\Controllers;

use App\Models\Commune;
use Illuminate\Http\Request;
use App\Models\Region;
use App\Models\Province;
use App\Models\ProvinceSection;
use App\Models\ProvinceSectionTranslation;
use App\Models\ProvinceTranslation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use HTMLPurifier;
use HTMLPurifier_Config;

class ProvinceController extends Controller
{
    public function byRegion(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $region = Region::where('slug', $slug)->firstOrFail();
        $provices = Province::where('region_id', $region->id)
            ->with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->where('is_published', true)
            ->get();

        if ($provices->isEmpty()) {
                return response()->json([
                    'message' => 'No Provinces found',
                    'data' => []
                ], 200);
        }
        return response()->json([
            'message' => 'Provinces retrieved successfully',
            'data' => $provices->map(function ($provice) use ($lang) {
                $translation = $provice->translations->first();
                return [
                    'id' => $provice->id,
                    "slug"=> $provice->name,
                    'region_id' => $provice->region_id,
                    'name' => $translation ? $translation->name : null,
                    'title' => $translation ? $translation->title : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                ];
            }),
        ]);
    }
    //ByRegion for provinces Navbar
    public function byRegionProvinces(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $province=Province::where("name",$slug)->firstOrFail();
        $id=$province->region_id;
        $provices = Province::where('region_id',$id)
            ->with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->where('is_published', true)
            ->get();

        if ($provices->isEmpty()) {
                return response()->json([
                    'message' => 'No Provinces found',
                    'data' => []
                ], 200);
        }
        return response()->json([
            'message' => 'Provinces retrieved successfully',
            'data' => $provices->map(function ($provice) use ($lang) {
                $translation = $provice->translations->first();
                return [
                    'id' => $provice->id,
                    "slug"=> $provice->name,
                    'region_id' => $provice->region_id,
                    'name' => $translation ? $translation->name : null,
                    'title' => $translation ? $translation->title : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                ];
            }),
        ]);
    }

    public function index()
    {
        $provinces = Province::with(['translations', 'sections.translations'])->get();
        return response()->json([
            'message' => 'Provinces retrieved successfully',
            'data' => $provinces->map(function ($province) {
                return $this->formatProvinceResponse($province, request()->header('Accept-Language', 'fr'));
            }),
        ]);
    }

    public function store(Request $request)
    {    

        $locale = $request->header('Accept-Language', 'fr');
        app()->setLocale(strtolower(substr($locale, 0, 2)));
        $validated = $request->validate([
            'region_id' => 'required|exists:regions,id',
            "name"=> 'required|string|unique:provinces',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|numeric|min:0|max:22',
            'translation' => 'required',
            "is_published"=>"required|boolean",
            'translation.language_code' => 'required|string|exists:languages,code',
            'translation.name' => 'nullable|string|max:255',
            'translation.description' => 'nullable|string',
            'translation.image' => 'nullable|string',
            'translation.Total_Population' => 'nullable|string|max:255',
            'translation.Area' => 'nullable|string|max:255',
            'translation.title' => 'nullable|string|max:255',
            'translation.Numbrer_Communes' => 'nullable|string|max:255',
            'sections' => 'required|array|min:1',
            'sections.*.slug' => 'required|string|max:255',
            'sections.*.order' => 'required|integer|min:0',
            'sections.*.translation' => 'required',
            'sections.*.translation.language_code' => 'required|string|exists:languages,code',
            'sections.*.translation.title' => 'nullable|string|max:255',
            'sections.*.translation.content' => 'nullable|string',
            'sections.*.translation.image' => 'nullable|string',
        ],[
            'slug.required' => __('validation.required', ['attribute' => 'region slug']),
            'slug.string' => __('validation.string', ['attribute' => 'region slug']),
            'slug.unique' => __('validation.unique', ['attribute' => 'region slug']),
            'latitude.required' => __('validation.required', ['attribute' => 'latitude']),
            'latitude.numeric' => __('validation.numeric', ['attribute' => 'latitude']),
            'latitude.min' => __('validation.min.numeric', ['attribute' => 'latitude', 'min' => -90]),
            'latitude.max' => __('validation.max.numeric', ['attribute' => 'latitude', 'max' => 90]),
            'longitude.required' => __('validation.required', ['attribute' => 'longitude']),
            'longitude.numeric' => __('validation.numeric', ['attribute' => 'longitude']),
            'longitude.min' => __('validation.min.numeric', ['attribute' => 'longitude', 'min' => -180]),
            'longitude.max' => __('validation.max.numeric', ['attribute' => 'longitude', 'max' => 180]),
            'zoom.required' => __('validation.required', ['attribute' => 'zoom']),
            'zoom.numeric' => __('validation.numeric', ['attribute' => 'zoom']),
            'zoom.min' => __('validation.min.numeric', ['attribute' => 'zoom', 'min' => 0]),
            'zoom.max' => __('validation.max.numeric', ['attribute' => 'zoom', 'max' => 22]),
            'is_published.required' => __('validation.required', ['attribute' => 'published status']),
            'is_published.boolean' => __('validation.boolean', ['attribute' => 'published status']),
            'translations.required' => __('validation.required', ['attribute' => 'translations']),
            'translations.array' => __('validation.array', ['attribute' => 'translations']),
            'translations.size' => __('validation.size.numeric', ['attribute' => 'translations', 'size' => 1]),
            'translations.0.language_code.required' => __('validation.required', ['attribute' => 'language code']),
            'translations.0.language_code.string' => __('validation.string', ['attribute' => 'language code']),
            'translations.0.language_code.exists' => __('validation.exists', ['attribute' => 'language code']),
            'translations.0.name.required' => __('validation.required', ['attribute' => 'region name']),
            'translations.0.name.string' => __('validation.string', ['attribute' => 'region name']),
            'translations.0.description.string' => __('validation.string', ['attribute' => 'description']),
            'translations.0.image.string' => __('validation.string', ['attribute' => 'image']),
            'translations.0.Total_Population.string' => __('validation.string', ['attribute' => 'total population']),
            'translations.0.Area.string' => __('validation.string', ['attribute' => 'area']),
            'translations.0.Number_Provinces.string' => __('validation.string', ['attribute' => 'number of provinces']),
            'translations.0.Numbrer_Communes.string' => __('validation.string', ['attribute' => 'number of communes']),
            'translations.0.Urbanization_Rate.string' => __('validation.string', ['attribute' => 'urbanization rate']),
            'sections.required' => __('validation.required', ['attribute' => 'sections']),
            'sections.array' => __('validation.array', ['attribute' => 'sections']),
            'sections.min' => __('validation.min.numeric', ['attribute' => 'sections', 'min' => 1]),
            'sections.*.slug.required' => __('validation.required', ['attribute' => 'section slug']),
            'sections.*.slug.string' => __('validation.string', ['attribute' => 'section slug']),
            'sections.*.order.required' => __('validation.required', ['attribute' => 'section order']),
            'sections.*.order.integer' => __('validation.integer', ['attribute' => 'section order']),
            'sections.*.order.min' => __('validation.min.numeric', ['attribute' => 'section order', 'min' => 0]),
            'sections.*.translations.required' => __('validation.required', ['attribute' => 'section translations']),
            'sections.*.translations.array' => __('validation.array', ['attribute' => 'section translations']),
            'sections.*.translations.size' => __('validation.size.numeric', ['attribute' => 'section translations', 'size' => 1]),
            'sections.*.translations.0.language_code.required' => __('validation.required', ['attribute' => 'section language code']),
            'sections.*.translations.0.language_code.string' => __('validation.string', ['attribute' => 'section language code']),
            'sections.*.translations.0.language_code.exists' => __('validation.exists', ['attribute' => 'section language code']),
            'sections.*.translations.0.title.string' => __('validation.string', ['attribute' => 'section title']),
            'sections.*.translations.0.content.string' => __('validation.string', ['attribute' => 'section content']),
            'sections.*.translations.0.image.string' => __('validation.string', ['attribute' => 'section image']),
        ]);

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'h1[class],h2[class],p[class],div[class],strong,em,ul,ol,li,a[href|class]');
        $purifier = new HTMLPurifier($config);

        try {
            DB::beginTransaction();

            // Create province
            $province = Province::create([
                'region_id' => $validated['region_id'],
                "name"=> $validated['name'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN),
            ]);

            // Create single province translation
            $translation = $validated['translation'];
            ProvinceTranslation::create([
                'province_id' => $province->id,
                'language_code' => $translation['language_code'],
                'name' => $translation['name'],
                'title' => $translation['title'],
                'description' => $translation['description'],
                'image' => $translation['image'],
                'Total_Population' => $translation['Total_Population'],
                'Area' => $translation['Area'],
                'Numbrer_Communes' => $translation['Numbrer_Communes'],
            ]);

            // Create sections and their translations
            foreach ($validated['sections'] as $section) {
                $provinceSection = ProvinceSection::create([
                    'province_id' => $province->id,
                    'slug' => $section['slug'],
                    'order' => $section['order'],
                ]);

                $sectionTranslation = $section['translation'];
                ProvinceSectionTranslation::create([
                    'province_sections_id' => $provinceSection->id,
                    'language_code' => $sectionTranslation['language_code'],
                    'title' => $sectionTranslation['title'],
                    'content' => $sectionTranslation['content'] ? $purifier->purify($sectionTranslation['content']) : null,
                    'image' => $sectionTranslation['image'],
                ]);
            }

            DB::commit();

            // Load relations for response
            $province->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Province created successfully',
                'data' => [
                    'id' => $province->id,
                    'slug' => $province->slug,
                    'region_id' => $province->region_id,
                    'latitude' => $province->latitude,
                    'longitude' => $province->longitude,
                    'zoom' => $province->zoom,
                    'translations' => $province->translations,
                    'sections' => $province->sections->map(function ($section) {
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translations' => $section->translations,
                        ];
                    })->sortBy('order')->values(),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Province creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create province'], 500);
        }
    }


    public function show($slug)
    {
        $province = Province::with(['translations', 'sections.translations'])
            ->where('name', $slug)->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'message' => 'Province retrieved successfully',
            'data' => $this->formatProvinceResponse($province, request()->header('Accept-Language', 'fr')),
        ]);
    }

    public function update(Request $request, $name)
    {
        // Look up province by slug
        $locale = $request->header('Accept-Language', 'fr');
        app()->setLocale(strtolower(substr($locale, 0, 2)));
        $province = Province::with(['translations', 'sections.translations'])
            ->where('name', $name)
            ->firstOrFail();
        $validated = $request->validate([
            'region_id' => 'required|exists:regions,id',
            'name' => "required|string|max:255|unique:provinces,name," . $province->id ,
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|numeric|min:0|max:22',
            'is_published' => 'required|boolean',
            'translation' => 'required',
            'translation.language_code' => 'required|string|exists:languages,code',
            'translation.name' => 'nullable|string|max:255',
            'translation.description' => 'nullable|string',
            'translation.image' => 'nullable|string',
            "translation.Provincial_Capital"=>'nullable|string',
            'translation.Total_Population' => 'nullable|string|max:255',
            'translation.Area' => 'nullable|string|max:255',
            'translation.title' => 'nullable|string|max:255',
            'translation.Numbrer_Communes' => 'nullable|string|max:255',
            'sections' => 'required|array|min:1',
            'sections.*.slug' => 'required|string|max:255',
            'sections.*.order' => 'required|integer|min:0',
            'sections.*.translation' => 'required',
            'sections.*.translation.language_code' => 'required|string|exists:languages,code',
            'sections.*.translation.title' => 'nullable|string|max:255',
            'sections.*.translation.content' => 'nullable|string',
            'sections.*.translation.image' => 'nullable|string',
        ],[
            'slug.required' => __('validation.required', ['attribute' => 'region slug']),
            'slug.string' => __('validation.string', ['attribute' => 'region slug']),
            'slug.unique' => __('validation.unique', ['attribute' => 'region slug']),
            'latitude.required' => __('validation.required', ['attribute' => 'latitude']),
            'latitude.numeric' => __('validation.numeric', ['attribute' => 'latitude']),
            'latitude.min' => __('validation.min.numeric', ['attribute' => 'latitude', 'min' => -90]),
            'latitude.max' => __('validation.max.numeric', ['attribute' => 'latitude', 'max' => 90]),
            'longitude.required' => __('validation.required', ['attribute' => 'longitude']),
            'longitude.numeric' => __('validation.numeric', ['attribute' => 'longitude']),
            'longitude.min' => __('validation.min.numeric', ['attribute' => 'longitude', 'min' => -180]),
            'longitude.max' => __('validation.max.numeric', ['attribute' => 'longitude', 'max' => 180]),
            'zoom.required' => __('validation.required', ['attribute' => 'zoom']),
            'zoom.numeric' => __('validation.numeric', ['attribute' => 'zoom']),
            'zoom.min' => __('validation.min.numeric', ['attribute' => 'zoom', 'min' => 0]),
            'zoom.max' => __('validation.max.numeric', ['attribute' => 'zoom', 'max' => 22]),
            'is_published.required' => __('validation.required', ['attribute' => 'published status']),
            'is_published.boolean' => __('validation.boolean', ['attribute' => 'published status']),
            'translations.required' => __('validation.required', ['attribute' => 'translations']),
            'translations.array' => __('validation.array', ['attribute' => 'translations']),
            'translations.size' => __('validation.size.numeric', ['attribute' => 'translations', 'size' => 1]),
            'translations.0.language_code.required' => __('validation.required', ['attribute' => 'language code']),
            'translations.0.language_code.string' => __('validation.string', ['attribute' => 'language code']),
            'translations.0.language_code.exists' => __('validation.exists', ['attribute' => 'language code']),
            'translations.0.name.required' => __('validation.required', ['attribute' => 'region name']),
            'translations.0.name.string' => __('validation.string', ['attribute' => 'region name']),
            'translations.0.description.string' => __('validation.string', ['attribute' => 'description']),
            'translations.0.image.string' => __('validation.string', ['attribute' => 'image']),
            'translations.0.Total_Population.string' => __('validation.string', ['attribute' => 'total population']),
            'translations.0.Area.string' => __('validation.string', ['attribute' => 'area']),
            'translations.0.Number_Provinces.string' => __('validation.string', ['attribute' => 'number of provinces']),
            'translations.0.Numbrer_Communes.string' => __('validation.string', ['attribute' => 'number of communes']),
            'translations.0.Urbanization_Rate.string' => __('validation.string', ['attribute' => 'urbanization rate']),
            'sections.required' => __('validation.required', ['attribute' => 'sections']),
            'sections.array' => __('validation.array', ['attribute' => 'sections']),
            'sections.min' => __('validation.min.numeric', ['attribute' => 'sections', 'min' => 1]),
            'sections.*.slug.required' => __('validation.required', ['attribute' => 'section slug']),
            'sections.*.slug.string' => __('validation.string', ['attribute' => 'section slug']),
            'sections.*.order.required' => __('validation.required', ['attribute' => 'section order']),
            'sections.*.order.integer' => __('validation.integer', ['attribute' => 'section order']),
            'sections.*.order.min' => __('validation.min.numeric', ['attribute' => 'section order', 'min' => 0]),
            'sections.*.translations.required' => __('validation.required', ['attribute' => 'section translations']),
            'sections.*.translations.array' => __('validation.array', ['attribute' => 'section translations']),
            'sections.*.translations.size' => __('validation.size.numeric', ['attribute' => 'section translations', 'size' => 1]),
            'sections.*.translations.0.language_code.required' => __('validation.required', ['attribute' => 'section language code']),
            'sections.*.translations.0.language_code.string' => __('validation.string', ['attribute' => 'section language code']),
            'sections.*.translations.0.language_code.exists' => __('validation.exists', ['attribute' => 'section language code']),
            'sections.*.translations.0.title.string' => __('validation.string', ['attribute' => 'section title']),
            'sections.*.translations.0.content.string' => __('validation.string', ['attribute' => 'section content']),
            'sections.*.translations.0.image.string' => __('validation.string', ['attribute' => 'section image']),
        ]);

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'h1[class],h2[class],p[class],div[class],strong,em,ul,ol,li,a[href|class]');
        $purifier = new HTMLPurifier($config);

        try {
            DB::beginTransaction();

            // Update province
            $province->update([
                'region_id' => $validated['region_id'],
                'name' => $validated['name'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN),
            ]);

            // Update or create translation
            $translation = $validated['translation'];
            ProvinceTranslation::updateOrCreate(
                [
                    'province_id' => $province->id,
                    'language_code' => $translation['language_code'],
                ],
                [
                    'name' => $translation['name'],
                    'description' => $translation['description'],
                    'image' => $translation['image'],
                    'Total_Population' => $translation['Total_Population'],
                    'title' => $translation['title'],
                    'Area' => $translation['Area'],
                    'Numbrer_Communes' => $translation['Numbrer_Communes'],
                    'Provincial_Capital' => $translation['Provincial_Capital'],
                ]
            );
            

            // Collect provided section slugs
            $providedSectionSlugs = collect($validated['sections'])->pluck('slug')->toArray();
            // Update or create sections and their translations
            foreach ($validated['sections'] as $section) {
                $provinceSection = ProvinceSection::updateOrCreate(
                    [
                        'province_id' => $province->id,
                        'slug' => $section['slug'],
                    ],
                    [
                        'order' => $section['order'],
                    ]
                );

                $sectionTranslation = $section['translation'];
                ProvinceSectionTranslation::updateOrCreate(
                    [
                        'province_sections_id' => $provinceSection->id,
                        'language_code' => $sectionTranslation['language_code'],
                    ],
                    [
                        'title' => $sectionTranslation['title'],
                        'content' => $sectionTranslation['content'] ? $purifier->purify($sectionTranslation['content']) : null,
                        'image' => $sectionTranslation['image'],
                    ]
                );
            }

            // Delete sections not included in the request
            ProvinceSection::where('province_id', $province->id)
            ->whereNotIn('slug', $providedSectionSlugs)
            ->delete();

             DB::commit();

            // Load relations for response
            $province->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Province updated successfully',
                'data' => [
                    'id' => $province->id,
                    'slug' => $province->slug,
                    'region_id' => $province->region_id,
                    'latitude' => $province->latitude,
                    'longitude' => $province->longitude,
                    'zoom' => $province->zoom,
                    'translations' => $province->translations,
                    'sections' => $province->sections->map(function ($section) {
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translations' => $section->translations,
                        ];
                    })->sortBy('order')->values(),
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Province update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update province'], 500);
        }
    }
    

    public function destroy($slug)
    {
        $province = Province::where('name', $slug)
            ->firstOrFail();

        $province->delete();

        return response()->json([
            'message' => 'Province deleted successfully',
        ], 204);
    }

    private function formatProvinceResponse($province, $languageCode)
    {
        $translation = $province->translations->where('language_code', $languageCode)->first()
            ?? $province->translations->where('language_code', 'fr')->first();
        $region=Region::find($province->region_id)->name;
        return [
            'id' => $province->id,
            'slug' => Str::slug($translation->name),
            'region_id' => $province->region_id,
            "region_slug"=>$province->region ? ($province->region->slug) : null,
            'region_name' => $province->region ? ($province->region->translations->where('language_code', $languageCode)->first()->name ?? $province->region->name) : null,
            'latitude' => $province->latitude,
            'longitude' => $province->longitude,
            'zoom' => $province->zoom,
            'name' => $translation->name,
            'title' => $translation->title,
            'description' => $translation->description,
            'Total_Population' => $translation->Total_Population,
            "image"=>$translation->image,
            'Area' => $translation->Area,
            'Numbrer_Communes' => $translation->Numbrer_Communes,
            'Provincial_Capital' => $translation->Provincial_Capital,
            'sections' => $province->sections->map(function ($section) use ($languageCode) {
                $sectionTranslation = $section->translations->where('language_code', $languageCode)->first()
                    ?? $section->translations->where('language_code', 'fr')->first();
                return [
                    'slug' => $section->slug,
                    'order' => $section->order,
                    'title' => $sectionTranslation->title,
                    'content' => $sectionTranslation->content,
                    "image"=> $sectionTranslation->image,
                ];
            })->sortBy('order')->values(),
        ];
    }
    public function byRegionForAdmin(Request $request, $slug)
    {
        $lang = $request->query('lang', $request->header('Accept-Language', 'fr'));
        $search = $request->query('search');
        $region = Region::where('slug', $slug)->firstOrFail();

        $query = Province::where('region_id', $region->id)
            ->with([
                'translations' => fn($query) => $query->whereIn('language_code', [$lang, 'fr']),
                'sections.translations' => fn($query) => $query->whereIn('language_code', [$lang, 'fr']),
                'region' => fn($query) => $query->with(['translations' => fn($q) => $q->where('language_code', $lang)]),
            ]);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $provinces = $query->paginate(10);

        if ($provinces->isEmpty()) {
            return response()->json([
                'message' => 'No Provinces found',
                'data' => [],
                'meta' => [
                    'current_page' => $provinces->currentPage(),
                    'last_page' => $provinces->lastPage(),
                    'per_page' => $provinces->perPage(),
                    'total' => $provinces->total(),
                ],
            ], 200);
        }

        return response()->json([
            'message' => 'Provinces retrieved successfully for admin dashboard',
            'language' => $lang,
            'data' => $provinces->map(function ($province) use ($lang) {
                $translation = $province->translations->where('language_code', $lang)->first() ?? null;
                $regionTranslation = $province->region->translations->where('language_code', $lang)->first() ?? null;

                return [
                    'id' => $province->id,
                    'region_id' => $province->region_id,
                    'region_slug' => $province->region ? $province->region->slug : null,
                    'region_name' => $regionTranslation ? $regionTranslation->name : null,
                    'latitude' => $province->latitude,
                    'longitude' => $province->longitude,
                    'zoom' => $province->zoom,
                    'is_published' => $province->is_published,
                    'name' => $province->name,
                    'slug' => Str::slug($province->name),
                    'translation' => $translation ? [
                        'language_code' => $translation->language_code,
                        'name' => $translation->name,
                        'title' => $translation->title,
                        'description' => $translation->description,
                        'image' => $translation->image,
                        'Total_Population' => $translation->Total_Population,
                        'Area' => $translation->Area,
                        'Numbrer_Communes' => $translation->Numbrer_Communes,
                        'Provincial_Capital' => $translation->Provincial_Capital,
                    ] : [],
                    'sections' => $province->sections->map(function ($section) use ($lang) {
                        $sectionTranslation = $section->translations->where('language_code', $lang)->first() ?? null;

                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translation' => $sectionTranslation ? [
                                'language_code' => $sectionTranslation->language_code,
                                'title' => $sectionTranslation->title,
                                'content' => $sectionTranslation->content,
                                'image' => $sectionTranslation->image,
                            ] : [],
                        ];
                    })->sortBy('order')->values(),
                ];
            })->values(),
            'meta' => [
                'current_page' => $provinces->currentPage(),
                'last_page' => $provinces->lastPage(),
                'per_page' => $provinces->perPage(),
                'total' => $provinces->total(),
            ],
        ], 200);
    }


        public function byCommunesForAdmin(Request $request, $slug)
        {
            $lang = $request->header('Accept-Language', 'fr');
            $province = Province::where('name', $slug)->firstOrFail();
            $provinces = Province::where('region_id', $province->region_id)
                ->with([
                    'translations' => fn($query) => $query->where('language_code',$lang),
                    'sections.translations' => fn($query) => $query->where('language_code',$lang),
                ])
                ->get();
    
            if ($provinces->isEmpty()) {
                return response()->json([
                    'message' => 'No Provinces found',
                    'data' => []
                ], 200);
            }
    
            return response()->json([
                'message' => 'Provinces retrieved successfully for admin dashboard',
                'language' => $lang,
                'data' => $provinces->map(function ($province) use ($lang) {
                    $translation = $province->translations->where('language_code', $lang)->first()
                        ?? $province->translations->where('language_code', 'fr')->first()
                        ?? null;
    
                    return [
                        'id' => $province->id,
                        'region_id' => $province->region_id,
                        'region_slug' => $province->region ? $province->region->slug : null,
                        'region_name' => $province->region ? $province->region->name : null,
                        'latitude' => $province->latitude,
                        'longitude' => $province->longitude,
                        'zoom' => $province->zoom,
                        'name' => $province->name,
                        'slug' => Str::slug($province->name),
                        'translations' => $translation ? [
                            [
                                'language_code' => $translation->language_code,
                                'name' => $translation->name,
                                'title' => $translation->title,
                                'description' => $translation->description,
                                'image' => $translation->image,
                                'Total_Population' => $translation->Total_Population,
                                'Area' => $translation->Area,
                                'Numbrer_Communes' => $translation->Numbrer_Communes,
                                'Provincial_Capital' => $translation->Provincial_Capital,
                            ]
                        ] : [],
                        'sections' => $province->sections->map(function ($section) use ($lang) {
                            $sectionTranslation = $section->translations->where('language_code', $lang)->first()
                                ?? $section->translations->where('language_code', 'fr')->first()
                                ?? null;
    
                            return [
                                'slug' => $section->slug,
                                'order' => $section->order,
                                'translations' => $sectionTranslation ? [
                                    [
                                        'language_code' => $sectionTranslation->language_code,
                                        'title' => $sectionTranslation->title,
                                        'content' => $sectionTranslation->content,
                                        'image' => $sectionTranslation->image,
                                    ]
                                ] : [],
                            ];
                        })->sortBy('order')->values(),
                    ];
                })->values(),
            ], 200);
        }
    }
