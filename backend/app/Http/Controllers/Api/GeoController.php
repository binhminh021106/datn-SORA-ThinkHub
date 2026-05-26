<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeoController extends Controller
{
    protected string $baseUrl = 'https://rsapi.goong.io';
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.goong.key') ?: env('GOONG_API_KEY');
    }

    public function autocomplete(Request $request)
    {
        $query = trim($request->get('q', ''));
        if ($query === '') {
            return response()->json(['error' => 'Missing q parameter'], 422);
        }

        $response = Http::get("{$this->baseUrl}/places/autocomplete", [
            'input' => $query,
            'api_key' => $this->apiKey,
        ]);

        return response()->json($response->json(), $response->status());
    }

    public function reverse(Request $request)
    {
        $lat = $request->get('lat');
        $lng = $request->get('lng');

        if (!is_numeric($lat) || !is_numeric($lng)) {
            return response()->json(['error' => 'Missing or invalid lat/lng parameters'], 422);
        }

        // Use geocode endpoint with latlng param for reverse geocoding (rsapi.goong.io expects latlng)
        $response = Http::get("{$this->baseUrl}/geocode", [
            'latlng' => $lat . ',' . $lng,
            'api_key' => $this->apiKey,
        ]);

        return response()->json($response->json(), $response->status());
    }

    public function geocode(Request $request)
    {
        $address = trim($request->get('address', ''));
        if ($address === '') {
            return response()->json(['error' => 'Missing address parameter'], 422);
        }

        $response = Http::get("{$this->baseUrl}/geocode", [
            'address' => $address,
            'api_key' => $this->apiKey,
        ]);

        return response()->json($response->json(), $response->status());
    }
}
