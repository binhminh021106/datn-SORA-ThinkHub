<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\ProductRecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientRecommendationController extends Controller
{
    public function personalized(Request $request, ProductRecommendationService $recommendationService)
    {
        $limit = (int) $request->input('limit', 10);
        $user = Auth::guard('sanctum')->user();
        $data = $recommendationService->recommend($user, $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
