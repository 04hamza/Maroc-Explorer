<?php

namespace App\Http\Controllers;

use App\Models\FooterSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FooterController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.slug' => 'required|string|unique:footer_sections',
            'sections.*.order' => 'required|integer',
            'sections.*.social_links' => 'nullable|array',
            'sections.*.translations' => 'required|array',
            'sections.*.translations.*.language_code' => 'required|string|exists:languages,code',
            'sections.*.translations.*.title' => 'nullable|string',
            'sections.*.translations.*.content' => 'nullable|string',
            'sections.*.translations.*.email' => 'nullable|email',
            'sections.*.translations.*.phone' => 'nullable|string',
            'sections.*.translations.*.address' => 'nullable|string',
            'sections.*.translations.*.copyright' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            foreach ($validated['sections'] as $section) {
                $footerSection = FooterSection::create([
                    'slug' => $section['slug'],
                    'order' => $section['order'],
                    'social_links' => $section['social_links'] ?? null,
                ]);
                foreach ($section['translations'] as $translation) {
                    $footerSection->translations()->create([
                        'language_code' => $translation['language_code'],
                        'title' => $translation['title'] ?? null,
                        'content' => $translation['content'] ?? null,
                        'email' => $translation['email'] ?? null,
                        'phone' => $translation['phone'] ?? null,
                        'address' => $translation['address'] ?? null,
                        'copyright' => $translation['copyright'] ?? null,
                    ]);
                }
            }
            DB::commit();
            return response()->json(['message' => 'Footer sections created successfully'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create footer sections: ' . $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $sections = FooterSection::with(['translations' => function ($query) use ($request) {
            $lang = $request->header('Accept-Language', 'fr');
            $query->where('language_code', $lang);
        }])
            ->orderBy('order')
            ->get()
            ->map(function ($section) {
                $translation = $section->translations->first();
                return [
                    'slug' => $section->slug,
                    'order' => $section->order,
                    'social_links' => $section->social_links,
                    'translations' => [
                        $translation->language_code => [
                            'title' => $translation->title,
                            'content' => $translation->content,
                            'email' => $translation->email,
                            'phone' => $translation->phone,
                            'address' => $translation->address,
                            'copyright' => $translation->copyright,
                        ],
                    ],
                ];
            });

        return response()->json(['data' => $sections], 200);
    }
}