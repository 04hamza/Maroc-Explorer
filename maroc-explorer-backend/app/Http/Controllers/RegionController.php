<?php

namespace App\Http\Controllers;

use App\Models\Region;
use App\Models\RegionTranslation;
use App\Models\RegionSection;
use App\Models\RegionSectionTranslation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use HTMLPurifier;
use HTMLPurifier_Config;

class RegionController extends Controller
{
    public function indexClient(Request $request)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $regions = Region::with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->where('is_published', true)
            ->get();
        return response()->json([
            'message' => 'Regions retrieved successfully',
            'data' => $regions->map(function ($region) use ($lang) {
                $translation = $region->translations->first();
                return [
                    'id' => $region->id,
                    'slug' => $region->slug,
                    'name' => $translation ? $translation->name : null,
                    'description' => $translation ? $translation->description : null,
                ];
            }),
        ], 200);
    }
    public function index(Request $request)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $search = $request->query('search');

        $query = Region::with([
            'translations' => fn($query) => $query->where('language_code', $lang),
            'sections.translations' => fn($query) => $query->where('language_code', $lang),
        ]);

        if ($search) {
            $query->where('slug', 'like', "%{$search}%")
                  ->orWhereHas('translations', function ($q) use ($search, $lang) {
                      $q->where('language_code', $lang)
                        ->where('name', 'like', "%{$search}%");
                  });
        }

        $regions = $query->paginate(10);

        return response()->json([
            'message' => 'Regions retrieved successfully',
            'data' => collect($regions->items())->map(function ($region) {
                $translation = $region->translations->first();
                return [
                    'id' => $region->id,
                    'slug' => $region->slug,
                    'latitude' => $region->latitude,
                    'longitude' => $region->longitude,
                    'zoom' => $region->zoom,
                    'is_published' => $region->is_published,
                    'name' => $translation ? $translation->name : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                    'Total_Population' => $translation ? $translation->Total_Population : null,
                    'Area' => $translation ? $translation->Area : null,
                    'Number_Provinces' => $translation ? $translation->Number_Provinces : null,
                    'Numbrer_Communes' => $translation ? $translation->Numbrer_Communes : null,
                    'Urbanization_Rate' => $translation ? $translation->Urbanization_Rate : null,
                    'sections' => $region->sections->map(function ($section) {
                        $translation = $section->translations->first();
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'title' => $translation ? $translation->title : null,
                            'content' => $translation ? $translation->content : null,
                            'image' => $translation ? $translation->image : null,
                        ];
                    })->sortBy('order')->values(),
                ];
            })->values(),
            'meta' => [
                'current_page' => $regions->currentPage(),
                'last_page' => $regions->lastPage(),
                'per_page' => $regions->perPage(),
                'total' => $regions->total(),
            ],
        ], 200);
    }
    public function store(Request $request)
    {   
        $locale = $request->header('Accept-Language', 'fr');
        app()->setLocale(strtolower(substr($locale, 0, 2)));
        $validated = $request->validate([
            'slug' => 'required|string|unique:regions',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|numeric|min:0|max:22',
            "is_published"=>"required",
            'translations' => 'required|array|size:1',
            'translations.0.language_code' => 'required|string|exists:languages,code',
            'translations.0.name' => 'required|string',
            'translations.0.description' => 'nullable|string',
            'translations.0.image' => 'nullable|string',
            'translations.0.Total_Population' => 'nullable|string',
            'translations.0.Area' => 'nullable|string',
            'translations.0.Number_Provinces' => 'nullable|string',
            'translations.0.Numbrer_Communes' => 'nullable|string',
            'translations.0.Urbanization_Rate' => 'nullable|string',
            'sections' => 'required|array|min:1',
            'sections.*.slug' => 'required|string',
            'sections.*.order' => 'required|integer|min:0',
            'sections.*.translations' => 'required|array|size:1',
            'sections.*.translations.0.language_code' => 'required|string|exists:languages,code',
            'sections.*.translations.0.title' => 'nullable|string',
            'sections.*.translations.0.content' => 'nullable|string',
            'sections.*.translations.0.image' => 'nullable|string',
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

            // Create region
            $region = Region::create([
                'slug' => $validated['slug'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => $validated['is_published'],
            ]);

            // Create single region translation
            $translation = $validated['translations'][0];
            RegionTranslation::create([
                'region_id' => $region->id,
                'language_code' => $translation['language_code'],
                'name' => $translation['name'],
                'description' => $translation['description'],
                'image' => $translation['image'],
                'Total_Population' => $translation['Total_Population'],
                'Area' => $translation['Area'],
                'Number_Provinces' => $translation['Number_Provinces'],
                'Numbrer_Communes' => $translation['Numbrer_Communes'],
                'Urbanization_Rate' => $translation['Urbanization_Rate'],
            ]);

            foreach ($validated['sections'] as $section) {
                $regionSection = RegionSection::create([
                    'region_id' => $region->id,
                    'slug' => $section['slug'],
                    'order' => $section['order'],
                ]);

                $sectionTranslation = $section['translations'][0];
                RegionSectionTranslation::create([
                    'region_section_id' => $regionSection->id,
                    'language_code' => $sectionTranslation['language_code'],
                    'title' => $sectionTranslation['title'],
                    'content' => $sectionTranslation['content'] ? $purifier->purify($sectionTranslation['content']) : null,
                    'image' => $sectionTranslation['image'],
                ]);
            }

            DB::commit();

            // Load relations for response
            $region->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Region created successfully',
                'data' => [
                    'id' => $region->id,
                    'slug' => $region->slug,
                    'latitude' => $region->latitude,
                    'longitude' => $region->longitude,
                    'zoom' => $region->zoom,
                    'translations' => $region->translations,
                    'sections' => $region->sections->map(function ($section) {
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translations' => $section->translations,
                        ];
                    }),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Region creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create region'], 500);
        }
    }

    public function show(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $region = Region::with([
            'translations' => fn($query) => $query->where('language_code', $lang),
            'sections.translations' => fn($query) => $query->where('language_code', $lang),
        ])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $translation = $region->translations->first();
        return response()->json([
            'id' => $region->id,
            'slug' => $region->slug,
            'latitude' => $region->latitude,
            'longitude' => $region->longitude,
            'zoom' => $region->zoom,
            'name' => $translation ? $translation->name : null,
            'description' => $translation ? $translation->description : null,
            'image' => $translation ? $translation->image : null,
            'Total_Population' => $translation ? $translation->Total_Population : null,
            'Area' => $translation ? $translation->Area : null,
            'Number_Provinces' => $translation ? $translation->Number_Provinces : null,
            'Numbrer_Communes' => $translation ? $translation->Numbrer_Communes : null,
            'Urbanization_Rate' => $translation ? $translation->Urbanization_Rate : null,
            'sections' => $region->sections->map(function ($section) {
                $translation = $section->translations->first();
                return [
                    'slug' => $section->slug,
                    "id"=>$section->id,
                    'order' => $section->order,
                    'title' => $translation ? $translation->title : null,
                    'content' => $translation ? $translation->content : null,
                    'image' => $translation ? $translation->image : null,
                ];
            })->sortBy('order')->values(),
        ], 200);
    }

    public function update(Request $request, $slug)
    {
        $region = Region::where('slug', $slug)->firstOrFail();
        $validated = $request->validate([
            'slug' => 'required|string|unique:regions,slug,' . $region->id,
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|numeric|min:0|max:22',
            'is_published' => 'required|boolean',
            'translations' => 'required|array|size:1',
            'translations.0.language_code' => 'required|string|exists:languages,code',
            'translations.0.name' => 'nullable|string',
            'translations.0.description' => 'nullable|string',
            'translations.0.image' => 'nullable|string',
            'translations.0.Total_Population' => 'nullable|string',
            'translations.0.Area' => 'nullable|string',
            'translations.0.Number_Provinces' => 'nullable|string',
            'translations.0.Numbrer_Communes' => 'nullable|string',
            'translations.0.Urbanization_Rate' => 'nullable|string',
            'sections' => 'required|array|min:1',
            'sections.*.slug' => 'required|string',
            'sections.*.order' => 'required|integer|min:0',
            'sections.*.translations' => 'required|array|size:1',
            'sections.*.translations.0.language_code' => 'required|string|exists:languages,code',
            'sections.*.translations.0.title' => 'nullable|string',
            'sections.*.translations.0.content' => 'nullable|string',
            'sections.*.translations.0.image' => 'nullable|string',
        ]);

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'h1[class],h2[class],p[class],div[class],strong,em,ul,ol,li,a[href|class]');
        $purifier = new HTMLPurifier($config);

        try {
            DB::beginTransaction();

            // Update region
            $region->update([
                'slug' => $validated['slug'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'zoom' => $validated['zoom'],
                'is_published' => filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN),
            ]);

            // Update or create translation for the provided language_code
            $translation = $validated['translations'][0];
            RegionTranslation::updateOrCreate(
                [
                    'region_id' => $region->id,
                    'language_code' => $translation['language_code'],
                ],
                [
                    'name' => $translation['name'],
                    'description' => $translation['description'],
                    'image' => $translation['image'],
                    'Total_Population' => $translation['Total_Population'],
                    'Area' => $translation['Area'],
                    'Number_Provinces' => $translation['Number_Provinces'],
                    'Numbrer_Communes' => $translation['Numbrer_Communes'],
                    'Urbanization_Rate' => $translation['Urbanization_Rate'],
                ]
            );


               // Collect provided section slugs
               $providedSectionSlugs = collect($validated['sections'])->pluck('slug')->toArray();

               // Update or create sections and their translations
               foreach ($validated['sections'] as $section) {
                   $regionSection = RegionSection::updateOrCreate(
                       [
                           'region_id' => $region->id,
                           'slug' => $section['slug'],
                       ],
                       [
                           'order' => $section['order'],
                       ]
                   );
   
                   $sectionTranslation = $section['translations'][0];
                   RegionSectionTranslation::updateOrCreate(
                       [
                           'region_section_id' => $regionSection->id,
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
            RegionSection::where('region_id', $region->id)
            ->whereNotIn('slug', $providedSectionSlugs)
            ->delete();


            DB::commit();

            // Load relations for response
            $region->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Region updated successfully',
                'data' => [
                    'id' => $region->id,
                    'slug' => $region->slug,
                    'latitude' => $region->latitude,
                    'longitude' => $region->longitude,
                    'zoom' => $region->zoom,
                    "is_published"=>$region->is_published,
                    'translations' => $region->translations,
                    'sections' => $region->sections->map(function ($section) {
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translations' => $section->translations,
                        ];
                    }),
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Region update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update region'], 500);
        }
    }

    public function destroy($slug)
    {
        $region = Region::where('slug', $slug)->firstOrFail();
        $region->delete();

        return response()->json([
            'message' => 'Region deleted successfully',
        ], 200);
    }

    public function store_region_translations(Request $request, $slug)
    {
        $validated = $request->validate([
            'translations' => 'required|array|size:1',
            'translations.0.language_code' => 'required|string|exists:languages,code',
            'translations.0.name' => 'nullable|string',
            'translations.0.description' => 'nullable|string',
            'translations.0.image' => 'nullable|string',
            'translations.0.Total_Population' => 'nullable|string',
            'translations.0.Area' => 'nullable|string',
            'translations.0.Number_Provinces' => 'nullable|string',
            'translations.0.Numbrer_Communes' => 'nullable|string',
            'translations.0.Urbanization_Rate' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            $region = Region::where('slug', $slug)->firstOrFail();
            $translation = $validated['translations'][0];

            // Update or create translation
            RegionTranslation::updateOrCreate(
                [
                    'region_id' => $region->id,
                    'language_code' => $translation['language_code'],
                ],
                [
                    'name' => $translation['name'],
                    'description' => $translation['description'],
                    'image' => $translation['image'],
                    'Total_Population' => $translation['Total_Population'],
                    'Area' => $translation['Area'],
                    'Number_Provinces' => $translation['Number_Provinces'],
                    'Numbrer_Communes' => $translation['Numbrer_Communes'],
                    'Urbanization_Rate' => $translation['Urbanization_Rate'],
                ]
            );

            DB::commit();
            return response()->json(['message' => 'Translation created or updated successfully'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Translation creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create translation'], 500);
        }
    }

    public function store_region_sections(Request $request, $slug)
    {
        $validated = $request->validate([
            'sections' => 'required|array|min:1',
            'sections.*.slug' => 'required|string',
            'sections.*.order' => 'required|integer|min:0',
            'sections.*.translations' => 'required|array|size:1',
            'sections.*.translations.0.language_code' => 'required|string|exists:languages,code',
            'sections.*.translations.0.title' => 'nullable|string',
            'sections.*.translations.0.content' => 'nullable|string',
            'sections.*.translations.0.image' => 'nullable|string',
        ]);

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'h1[class],h2[class],p[class],div[class],strong,em,ul,ol,li,a[href|class]');
        $purifier = new HTMLPurifier($config);

        try {
            DB::beginTransaction();
            $region = Region::where('slug', $slug)->firstOrFail();

            // Create sections and translations
            foreach ($validated['sections'] as $section) {
                $regionSection = RegionSection::create([
                    'region_id' => $region->id,
                    'slug' => $section['slug'],
                    'order' => $section['order'],
                ]);

                $translation = $section['translations'][0];
                RegionSectionTranslation::create([
                    'region_section_id' => $regionSection->id,
                    'language_code' => $translation['language_code'],
                    'title' => $translation['title'],
                    'content' => $translation['content'] ? $purifier->purify($translation['content']) : null,
                    'image' => $translation['image'],
                ]);
            }

            DB::commit();

            // Load relations for response
            $region->load([
                'translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
                'sections.translations' => fn($query) => $query->where('language_code', $request->header('Accept-Language', 'fr')),
            ]);

            return response()->json([
                'message' => 'Sections created successfully',
                'data' => [
                    'id' => $region->id,
                    'slug' => $region->slug,
                    'translations' => $region->translations,
                    'sections' => $region->sections->map(function ($section) {
                        return [
                            'slug' => $section->slug,
                            'order' => $section->order,
                            'translations' => $section->translations,
                        ];
                    }),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Section creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create sections'], 500);
        }
    }
    
}