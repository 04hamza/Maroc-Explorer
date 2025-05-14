<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\PageSection;
use App\Models\PageSectionTranslation;
use Illuminate\Support\Facades\DB;

class PageController extends Controller
{
    public function show(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $page = Page::where('slug', $slug)->firstOrFail();
        $translation = PageTranslation::where('page_id', $page->id)
            ->where('language_code', $lang)
            ->first();
        $sections = PageSection::where('page_id', $page->id)->get()->map(function ($section) use ($lang) {
             $sectionTranslation = PageSectionTranslation::where('page_section_id', $section->id)
                 ->where('language_code', $lang)
                 ->first();
             return [
                 'slug' => $section->slug,
                 'order' => $section->order,
                 'title' => $sectionTranslation ? $sectionTranslation->title : null,
                 'content' => $sectionTranslation ? $sectionTranslation->content : null,
             ];
         })->sortBy('order')->values();
        return response()->json([
            'slug' => $page->slug,
            'title' => $translation ? $translation->title : null,
            'description' => $translation ? $translation->description : null,
            'sections' => $sections,
        ]);
    }

     /// added a page sections
     public function store_page_sections(Request $request, $slug)
    {
        $validated = $request->validate([
            "sections" => 'required|array',
            "sections.*.slug" => 'required|string|unique:page_sections',
            "sections.*.order" => 'required|integer',
            "sections.*.translations" => 'required|array',
            "sections.*.translations.*.language_code" => "required|string|exists:languages,code",
            "sections.*.translations.*.title" => "nullable|string",
            "sections.*.translations.*.content" => "nullable|string",
        ]);
        try {
            DB::beginTransaction();
            $page = Page::where("slug", $slug)->first();
            if (!$page) {
                throw new \Exception("Page with slug '$slug' not found.");
            }
            foreach ($validated["sections"] as $page_section) {
                $pageSection = PageSection::create([
                    'page_id' => $page->id,
                    'slug' => $page_section['slug'],
                    'order' => $page_section['order'],
                ]);
                foreach ($page_section['translations'] as $translation) {
                    PageSectionTranslation::create([
                        'page_section_id' => $pageSection->id,
                        'language_code' => $translation['language_code'],
                        'title' => $translation['title'],
                        'content' => $translation['content'],
                    ]);
                }
            }
            DB::commit();
            return response()->json([
                'message' => 'Page sections created successfully',
                'page' => [
                    'slug' => $page->slug,
                    'id' => $page->id,
                    'translations' => $page->translations,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create page sections: ' . $e->getMessage()], 500);
        }
    }
}
