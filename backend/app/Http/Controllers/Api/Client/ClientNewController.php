<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\News;
use Illuminate\Support\Facades\Cache;

class ClientNewController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'author' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $query = News::select('id', 'title', 'slug', 'excerpt', 'image_url', 'author_name', 'category', 'created_at', 'views')
                     ->where('status', 'published');

        if ($request->has('q') && $request->q != '') {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->q . '%');
            });
        }

        if ($request->has('author') && $request->author != '') {
            $query->where('author_name', $request->author);
        }

        if ($request->has('category') && $request->category != '') {
            $query->where('category', $request->category);
        }

        $perPage = $request->input('per_page', 6);
        $news = $query->orderBy('created_at', 'desc')->paginate($perPage); 

        return response()->json([
            'status' => 'success',
            'data' => $news
        ]);
    }

    public function popular()
    {
        $popular = News::select('id', 'title', 'slug', 'image_url', 'views', 'created_at')
            ->where('status', 'published')
            ->orderBy('views', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $popular
        ]);
    }

    public function categories()
    {
        $categories = News::where('status', 'published')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function show(Request $request, $slug)
    {
        $news = News::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $viewKey = 'news:view:' . $news->id . ':' . hash('sha256', (string) $request->ip());
        if (Cache::add($viewKey, true, now()->addHours(6))) {
            $news->increment('views');
        }

        return response()->json([
            'status' => 'success',
            'data' => $news
        ]);
    }
}
