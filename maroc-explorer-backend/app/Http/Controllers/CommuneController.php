<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Commune;
use App\Models\CommuneTranslation;
use App\Models\CommuneSection;
use App\Models\CommuneSectionTranslation;
use App\Models\Province;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use HTMLPurifier;
use HTMLPurifier_Config;

class CommuneController extends Controller
{
    public function store(Request $request, $slug)
    {
        $province = Province::where("name", $slug)->firstOrFail();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|numeric|min:0|max:22',
            "is_published"=>"required|boolean",
            'translations' => 'required|array|size:3',
            'translations.*.language_code' => 'required|string|exists:languages,code',
            'translations.*.name' => 'nullable|string|max:255',
            'translations.*.title' => 'nullable|string|max:255',
            'translations.*.description' => 'nullable|string',
            'translations.*.Total_Population' => 'nullable|string|max:255',
            'translations.*.Area' => 'nullable|string|max:255',
            'translations.*.Number_Communes' => 'nullable|string|max:255',
            'translations.*.Provincial_Capital' => 'nullable|string|max:255',
            'translations.*.image' => 'nullable|string',
            'translations.*.number_faculties' => 'nullable|string|max:255',
            'translations.*.number_hospitals' => 'nullable|string|max:255',
            'sections' => 'required|array|min:1',
            'sections.*.slug' => 'required|string|max:255',
            'sections.*.order' => 'required|integer|min:0',
            'sections.*.translations' => 'required|array|size:3',
            'sections.*.translations.*.language_code' => 'required|string|exists:languages,code',
            'sections.*.translations.*.title' => 'nullable|string|max:255',
            'sections.*.translations.*.content' => 'nullable|string',
            'sections.*.translations.*.image' => 'nullable|string',
        ]);

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'h1[class],h2[class],p[class],div[class],strong,em,ul,ol,li,a[href|class]');
        $purifier = new HTMLPurifier($config);

        try {
            DB::beginTransaction();

            // Create commune
            $commune = Commune::create([
                'province_id' => $province->id,
                'name' => $validated['name'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN),
            ]);

            // Create commune translations
            foreach ($validated['translations'] as $translation) {
                CommuneTranslation::create([
                    'commune_id' => $commune->id,
                    'language_code' => $translation['language_code'],
                    'name' => $translation['name'],
                    'title' => $translation['title'],
                    'description' => $translation['description'],
                    'Total_Population' => $translation['Total_Population'],
                    'Area' => $translation['Area'],
                    'Number_Communes' => $translation['Number_Communes'],
                    'Provincial_Capital' => $translation['Provincial_Capital'],
                    'image' => $translation['image'],
                    'number_faculties' => $translation['number_faculties'],
                    'number_hospitals' => $translation['number_hospitals'],
                ]);
            }

            // Create sections and their translations
            foreach ($validated['sections'] as $section) {
                $communeSection = CommuneSection::create([
                    'commune_id' => $commune->id,
                    'slug' => $section['slug'],
                    'order' => $section['order'],
                ]);

                foreach ($section['translations'] as $sectionTranslation) {
                    CommuneSectionTranslation::create([
                        'commune_sections_id' => $communeSection->id,
                        'language_code' => $sectionTranslation['language_code'],
                        'title' => $sectionTranslation['title'],
                        'content' => $sectionTranslation['content'] ? $purifier->purify($sectionTranslation['content']) : null,
                        'image' => $sectionTranslation['image'],
                    ]);
                }
            }

            DB::commit();

            // Load relations for response
            $commune->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Commune created successfully',
                'data' => [
                    'id' => $commune->id,
                    'name' => $commune->name,
                    'province_id' => $commune->province_id,
                    'latitude' => $commune->latitude,
                    'longitude' => $commune->longitude,
                    'zoom' => $commune->zoom,
                    'translations' => $commune->translations,
                    'sections' => $commune->sections->map(function ($section) {
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
            \Illuminate\Support\Facades\Log::error('Commune creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create commune'], 500);
        }
    }

    public function show($name)
    {
        $commune = Commune::with(['translations', 'sections.translations'])
            ->where('name', $name)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'message' => 'Commune retrieved successfully',
            'data' => $this->formatCommuneResponse($commune, request()->header('Accept-Language', 'fr')),
        ]);
    }

    public function byProvince(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $province = Province::where('name', $slug)->firstOrFail();
        $communes = Commune::where('province_id', $province->id)
            ->with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->where('is_published', true)
            ->get();

        if ($communes->isEmpty()) {
            return response()->json([
                'message' => 'No Communes found',
                'data' => []
            ], 200);
        }

        return response()->json([
            'message' => 'Communes retrieved successfully',
            'data' => $communes->map(function ($commune) use ($lang) {
                $translation = $commune->translations->first();
                return [
                    'id' => $commune->id,
                    'slug' => $commune->name,
                    "name"=>$translation ? $translation->name : null,
                    'province_id' => $commune->province_id,
                    'title' => $translation ? $translation->title : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                ];
            }),
        ]);
    }

    public function byProvincesForAdmin(Request $request, $slug)
    {
        $lang = $request->query('lang', $request->header('Accept-Language', 'fr'));
        $search = $request->query('search');
        $province = Province::where('name', $slug)->firstOrFail();

        $query = Commune::where('province_id', $province->id)
            ->with([
                'translations' => fn($query) => $query->whereIn('language_code', [$lang, 'fr']),
                'sections.translations' => fn($query) => $query->whereIn('language_code', [$lang, 'fr']),
                'province' => fn($query) => $query->with(['translations' => fn($q) => $q->where('language_code', $lang)]),
            ]);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $communes = $query->paginate(10);

        if ($communes->isEmpty()) {
            return response()->json([
                'message' => 'No Communes found',
                'data' => [],
                'meta' => [
                    'current_page' => $communes->currentPage(),
                    'last_page' => $communes->lastPage(),
                    'per_page' => $communes->perPage(),
                    'total' => $communes->total(),
                ],
            ], 200);
        }

        return response()->json([
            'message' => 'Communes retrieved successfully for admin dashboard',
            'language' => $lang,
            'data' => $communes->map(function ($commune) use ($lang, $province) {
                $translation = $commune->translations->where('language_code', $lang)->first() ?? null;
                $provinceTranslation = $province->translations->where('language_code', $lang)->first() ?? null;

                return [
                    'id' => $commune->id,
                    'province_id' => $commune->province_id,
                    'province_name' => $provinceTranslation ? $provinceTranslation->name : $province->name,
                    'latitude' => $commune->latitude,
                    'longitude' => $commune->longitude,
                    'zoom' => $commune->zoom,
                    'is_published' => $commune->is_published,
                    'name' => $commune->name,
                    'slug' => Str::slug($commune->name),
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
                    'sections' => $commune->sections->map(function ($section) use ($lang) {
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
                'current_page' => $communes->currentPage(),
                'last_page' => $communes->lastPage(),
                'per_page' => $communes->perPage(),
                'total' => $communes->total(),
            ],
        ], 200);
    }
    public function byProvinceCommunes(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $commune = Commune::where('name', $slug)
            ->firstOrFail();
        $communes = Commune::where('province_id', $commune->province_id)
            ->with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->where('is_published', true)
            ->get();


        if ($communes->isEmpty()) {
            return response()->json([
                'message' => 'No Communes found',
                'data' => []
            ], 200);
        }

        return response()->json([
            'message' => 'Communes retrieved successfully',
            'data' => $communes->map(function ($commune) use ($lang) {
                $translation = $commune->translations->first();
                return [
                    'id' => $commune->id,
                    'slug' => $commune->name,
                    'province_id' => $commune->province_id,
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
        $communes = Commune::with(['translations', 'sections.translations'])->get();
        return response()->json([
            'message' => 'Communes retrieved successfully',
            'data' => $communes->map(function ($commune) {
                return $this->formatCommuneResponse($commune, request()->header('Accept-Language', 'fr'));
            }),
        ]);
    }

    public function storeAdmin(Request $request)
    {   

        // Look up province by slug
        $locale = $request->header('Accept-Language', 'fr');
        app()->setLocale(strtolower(substr($locale, 0, 2)));

        $validated = $request->validate([
            'province_id' => 'required|exists:provinces,id',
            'name' => 'required|string|max:255|unique:communes',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'zoom' => 'required|numeric',
            "is_published"=>"required|boolean",
            'translation' => 'required',
            'translation.language_code' => 'required|string|exists:languages,code',
            'translation.name' => 'nullable|string|max:255',
            'translation.title' => 'nullable|string|max:255',
            'translation.description' => 'nullable|string',
            'translation.image' => 'nullable|string',
            'translation.Total_Population' => 'nullable|string|max:255',
            'translation.Area' => 'nullable|string|max:255',
            'translation.Number_Communes' => 'nullable|string|max:255',
            'translation.Provincial_Capital' => 'nullable|string|max:255',
            'translation.number_faculties' => 'nullable|string|max:255',
            'translation.number_hospitals' => 'nullable|string|max:255',
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

            // Create commune
            $commune = Commune::create([
                'province_id' => $validated['province_id'],
                'name' => $validated['name'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN),
            ]);

            // Create single commune translation
            $translation = $validated['translation'];
            CommuneTranslation::create([
                'commune_id' => $commune->id,
                'language_code' => $translation['language_code'],
                'name' => $translation['name'],
                'title' => $translation['title'],
                'description' => $translation['description'],
                'image' => $translation['image'],
                'Total_Population' => $translation['Total_Population'],
                'Area' => $translation['Area'],
                'Number_Communes' => $translation['Number_Communes'],
                'Provincial_Capital' => $translation['Provincial_Capital'],
                'number_faculties' => $translation['number_faculties'],
                'number_hospitals' => $translation['number_hospitals'],
            ]);

            // Create sections and their translations
            foreach ($validated['sections'] as $section) {
                $communeSection = CommuneSection::create([
                    'commune_id' => $commune->id,
                    'slug' => $section['slug'],
                    'order' => $section['order'],
                ]);

                $sectionTranslation = $section['translation'];
                CommuneSectionTranslation::create([
                    'commune_sections_id' => $communeSection->id,
                    'language_code' => $sectionTranslation['language_code'],
                    'title' => $sectionTranslation['title'],
                    'content' => $sectionTranslation['content'] ? $purifier->purify($sectionTranslation['content']) : null,
                    'image' => $sectionTranslation['image'],
                ]);
            }

            DB::commit();

            // Load relations for response
            $commune->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Commune created successfully',
                'data' => [
                    'id' => $commune->id,
                    'slug' => $commune->name,
                    'province_id' => $commune->province_id,
                    'latitude' => $commune->latitude,
                    'longitude' => $commune->longitude,
                    'zoom' => $commune->zoom,
                    'translations' => $commune->translations,
                    'sections' => $commune->sections->map(function ($section) {
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
            \Illuminate\Support\Facades\Log::error('Commune creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create commune'], 500);
        }
    }
    public function update(Request $request, $name)
    {

        // Look up province by slug
        $locale = $request->header('Accept-Language', 'fr');
        app()->setLocale(strtolower(substr($locale, 0, 2)));

        $commune = Commune::with(['translations', 'sections.translations'])
            ->Where("name",$name)
            ->firstOrFail();
        
        $validated = $request->validate([
            'province_id' => 'required|exists:provinces,id',
            'name' => 'required|string|max:255|unique:communes,name,' . $commune->id,
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|numeric|min:0|max:22',
            'is_published' => 'required|boolean',
            'translation' => 'required',
            'translation.language_code' => 'required|string|exists:languages,code',
            'translation.name' => 'nullable|string|max:255',
            'translation.title' => 'nullable|string|max:255',
            'translation.description' => 'nullable|string',
            'translation.image' => 'nullable|string',
            'translation.Total_Population' => 'nullable|string|max:255',
            'translation.Area' => 'nullable|string|max:255',
            'translation.Number_Communes' => 'nullable|string|max:255',
            'translation.Provincial_Capital' => 'nullable|string|max:255',
            'translation.number_faculties' => 'nullable|string|max:255',
            'translation.number_hospitals' => 'nullable|string|max:255',
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

            // Update commune
            $commune->update([
                'province_id' => $validated['province_id'],
                'name' => $validated['name'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN),
            ]);

            // Update or create translation
            $translation = $validated['translation'];
            CommuneTranslation::updateOrCreate(
                [
                    'commune_id' => $commune->id,
                    'language_code' => $translation['language_code'],
                ],
                [
                    'name' => $translation['name'],
                    'title' => $translation['title'],
                    'description' => $translation['description'],
                    'image' => $translation['image'],
                    'Total_Population' => $translation['Total_Population'],
                    'Area' => $translation['Area'],
                    'Number_Communes' => $translation['Number_Communes'],
                    'Provincial_Capital' => $translation['Provincial_Capital'],
                    'number_faculties' => $translation['number_faculties'],
                    'number_hospitals' => $translation['number_hospitals'],
                ]
            );
            $providedSectionSlugs = collect($validated['sections'])->pluck('slug')->toArray();
            // Update or create sections and their translations
            foreach ($validated['sections'] as $section) {
                $communeSection = CommuneSection::updateOrCreate(
                    [
                        'commune_id' => $commune->id,
                        'slug' => $section['slug'],
                    ],
                    [
                        'order' => $section['order'],
                    ]
                );

                $sectionTranslation = $section['translation'];
                CommuneSectionTranslation::updateOrCreate(
                    [
                        'commune_sections_id' => $communeSection->id,
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
            CommuneSection::where('commune_id', $commune->id)
            ->whereNotIn('slug', $providedSectionSlugs)
            ->delete();

            DB::commit();

          
            $commune->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Commune updated successfully',
                'data' => [
                    'id' => $commune->id,
                    'slug' => $commune->name,
                    'province_id' => $commune->province_id,
                    'latitude' => $commune->latitude,
                    'longitude' => $commune->longitude,
                    'zoom' => $commune->zoom,
                    'translation' => $commune->translations,
                    'sections' => $commune->sections->map(function ($section) {
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translation' => $section->translations,
                        ];
                    })->sortBy('order')->values(),
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Commune update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update commune'], 500);
        }
    }

    public function destroy($name)
    {

        $commune = Commune::where('name', $name)->firstOrFail();
        $commune->delete();
        return response()->json([
            'message' => 'Commune deleted successfully',
        ], 204);
    }

    public function indexForAdmin(Request $request, $slug)
    {
        $lang = $request->query('lang', $request->header('Accept-Language', 'fr'));
        $province = Province::where('name', $slug)
            ->orWhereHas('translations', fn($query) => $query->where('name', $slug))
            ->firstOrFail();
        $communes = Commune::where('province_id', $province->id)
            ->with([
                'translation' => fn($query) => $query->whereIn('language_code', [$lang, 'fr']),
                'sections.translation' => fn($query) => $query->whereIn('language_code', [$lang, 'fr']),
            ])
            ->paginate(10);

        if ($communes->isEmpty()) {
            return response()->json([
                'message' => 'No Communes found',
                'data' => []
            ], 200);
        }

        return response()->json([
            'message' => 'Communes retrieved successfully for admin dashboard',
            'language' => $lang,
            'current_page' => $communes->currentPage(),
            'last_page' => $communes->lastPage(),
            'total' => $communes->total(),
            'data' => $communes->map(function ($commune) use ($lang) {
                $translation = $commune->translations->where('language_code', $lang)->first()
                    ?? $commune->translations->where('language_code', 'fr')->first()
                    ?? null;

                return [
                    'id' => $commune->id,
                    'province_id' => $commune->province_id,
                    'province_slug' => $commune->province ? $commune->province->name : null,
                    'province_name' => $commune->province ? $commune->province->name : null,
                    'latitude' => $commune->latitude,
                    'longitude' => $commune->longitude,
                    'zoom' => $commune->zoom,
                    'name' => $commune->name,
                    'slug' => Str::slug($commune->name),
                    'translation' => $translation ? [
                        [
                            'language_code' => $translation->language_code,
                            'name' => $translation->name,
                            'title' => $translation->title,
                            'description' => $translation->description,
                            'image' => $translation->image,
                            'Total_Population' => $translation->Total_Population,
                            'Area' => $translation->Area,
                            'Number_Communes' => $translation->Number_Communes,
                            'Provincial_Capital' => $translation->Provincial_Capital,
                            'number_faculties' => $translation->number_faculties,
                            'number_hospitals' => $translation->number_hospitals,
                        ]
                    ] : [],
                    'sections' => $commune->sections->map(function ($section) use ($lang) {
                        $sectionTranslation = $section->translations->where('language_code', $lang)->first()
                            ?? $section->translations->where('language_code', 'fr')->first()
                            ?? null;

                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translation' => $sectionTranslation ? [
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

    private function formatCommuneResponse($commune, $languageCode)
    {
        $translation = $commune->translations->where('language_code', $languageCode)->first();
        return [
            'id' => $commune->id,
            'slug' => Str::slug($translation->name),
            'province_id' => $commune->province_id,
            'province_slug' => $commune->province ? $commune->province->name : null,
            'province_name' => $commune->province ? ($commune->province->translations->where('language_code', $languageCode)->first()->name ?? $commune->province->name) : null,
            'latitude' => $commune->latitude,
            'longitude' => $commune->longitude,
            'zoom' => $commune->zoom,
            'name' => $translation->name,
            'title' => $translation->title,
            'description' => $translation->description,
            'Total_Population' => $translation->Total_Population,
            'Area' => $translation->Area,
            'Number_Communes' => $translation->Number_Communes,
            'Provincial_Capital' => $translation->Provincial_Capital,
            'number_faculties' => $translation->number_faculties,
            'number_hospitals' => $translation->number_hospitals,
            'image' => $translation->image,
            'sections' => $commune->sections->map(function ($section) use ($languageCode) {
                $sectionTranslation = $section->translations->where('language_code', $languageCode)->first()
                    ?? $section->translations->where('language_code', 'fr')->first();
                return [
                    'slug' => $section->slug,
                    'order' => $section->order,
                    'title' => $sectionTranslation->title,
                    'content' => $sectionTranslation->content,
                    'image' => $sectionTranslation->image,
                ];
            })->sortBy('order')->values(),
        ];
    }
}