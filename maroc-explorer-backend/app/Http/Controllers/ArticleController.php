<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Article;
use App\Models\Region;
use Illuminate\Support\Facades\DB;
use App\Models\ArticleTranslation;
use App\Models\Province;
use HTMLPurifier;
use HTMLPurifier_Config;

class ArticleController extends Controller
{
    public function show(Request $request, $id)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $article = Article::with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->where('id', $id)
            ->firstOrFail();
        $translation = $article->translations->first();
        return response()->json([
            'id' => $article->id,
            "author"=>$article->author,
            "published_at"=>$article->published_at,
            'slug' => $article->slug,
            'region_id' => $article->region_id,
            'title' => $translation ? $translation->title : null,
            'description' => $translation ? $translation->description : null,
            'content' => $translation ? $translation->content : null,
            'image' => $translation ? $translation->image : null,
        ]);
    }
    //////////////////////////
    public function index()
    {
        $articles = Article::all();
        return response()->json(["articles"=>$articles]);
    }

    // Get articles by region
    public function byRegion(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $region = Region::where('slug', $slug)->firstOrFail();
        $articles = Article::where('region_id', $region->id)
            ->with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->take(5)
            ->get();

        return response()->json([
            'message' => 'Articles retrieved successfully',
            'data' => $articles->map(function ($article) use ($lang) {
                $translation = $article->translations->first();
                return [
                    'id' => $article->id,
                    'slug' => $article->slug,
                    'region_id' => $article->region_id,
                    'title' => $translation ? $translation->title : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                ];
            }),
        ]);
    }

    public function byProvince(Request $request, $slug)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $province=Province::where("name",$slug)->firstOrFail();
        $region = Region::where('id',$province->region_id)->firstOrFail();
        $articles = Article::where('region_id', $region->id)
            ->with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->take(5)
            ->get();
        return response()->json([
            'message' => 'Articles retrieved successfully',
            'data' => $articles->map(function ($article) use ($lang) {
                $translation = $article->translations->first();
                return [
                    'id' => $article->id,
                    'slug' => $article->slug,
                    'region_id' => $article->region_id,
                    'title' => $translation ? $translation->title : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                ];
            }),
        ]);
    }

    // Get latest 5 articles
    public function latest(Request $request)
    {
        $lang = $request->header('Accept-Language', 'fr');
        $articles = Article::with(['translations' => fn($query) => $query->where('language_code', $lang)])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        if ($articles->isEmpty()) {
                return response()->json([
                    'message' => 'No articles found',
                    'data' => []
                ], 200);
        }
        return response()->json([
            'message' => 'Latest articles retrieved successfully',
            'data' => $articles->map(function ($article) use ($lang) {
                $translation = $article->translations->first();
                return [
                    'id' => $article->id,
                    'slug' => $article->slug,
                    'region_id' => $article->region_id,
                    'title' => $translation ? $translation->title : null,
                    'description' => $translation ? $translation->description : null,
                    'image' => $translation ? $translation->image : null,
                ];
            }),
        ]);
    }
    public function store(Request $request,$slug)
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:articles',
            'author' => 'nullable|string|max:100',
            'published_at' => 'nullable|date',
            'translations' => 'required|array|min:1',
            'translations.*.language_code' => 'required|string|exists:languages,code',
            'translations.*.title' => 'nullable|string',
            'translations.*.description' => 'nullable|string',
            'translations.*.content' => 'nullable|string',
            'translations.*.image' => 'nullable|string',
        ]);

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'h1[class],h2[class],p[class],div[class],strong,em,ul,ol,li,a[href|class]');
        $purifier = new HTMLPurifier($config);

        try {
            DB::beginTransaction();
            $region=Region::where("slug",$slug)->firstOrFail();
            // Create article
            $article = Article::create([
                'slug' => $validated['slug'],
                'region_id' => $region->id,
                'author' => $validated['author'],
                'published_at' => $validated['published_at'],
            ]);
            // Create translations
            foreach ($validated['translations'] as $translation) {
                ArticleTranslation::create([
                    'article_id' => $article->id,
                    'language_code' => $translation['language_code'],
                    'title' => $translation['title'],
                    'description' => $translation['description'],
                    'content' => $translation['content'] ? $purifier->purify($translation['content']) : null,
                    'image' => $translation['image'],
                ]);
            }

            DB::commit();

            // Load translations for response
            $article->load(['translations']);

            return response()->json([
                'message' => 'Article created successfully',
                'data' => [
                    'id' => $article->id,
                    'slug' => $article->slug,
                    'region_id' => $article->region_id,
                    'author' => $article->author,
                    'published_at' => $article->published_at ? $article->published_at->toDateTimeString() : null,
                    'translations' => $article->translations,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Article creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create article'], 500);
        }
    }
}
