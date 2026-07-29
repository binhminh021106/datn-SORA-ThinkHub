<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        if ($query === '' || mb_strlen($query) > 160) {
            return response()->json(['error' => 'Missing q parameter'], 422);
        }

        $cacheKey = 'geo:autocomplete:' . hash('sha256', mb_strtolower($query, 'UTF-8'));
        if ($cached = Cache::get($cacheKey)) {
            return response()->json($cached);
        }

        if ($this->apiKey) {
            $response = Http::timeout(8)->retry(2, 200)->get("{$this->baseUrl}/places/autocomplete", [
                'input' => $query,
                'api_key' => $this->apiKey,
            ]);

            if ($response->successful()) {
                Cache::put($cacheKey, $response->json(), now()->addMinutes(5));
            }

            return response()->json($response->json(), $response->status());
        }

        // Fallback to Nominatim
        $response = Http::withHeaders([
            'User-Agent' => 'Laravel/SORA-ThinkHub'
        ])->timeout(8)->retry(2, 200)->get('https://nominatim.openstreetmap.org/search', [
            'format' => 'jsonv2',
            'q' => $query,
            'addressdetails' => 1,
            'limit' => 5,
            'accept-language' => 'vi'
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $predictions = [];
            foreach ($data as $item) {
                $predictions[] = [
                    'description' => $item['display_name'] ?? '',
                    'place_id' => $item['place_id'] ?? '',
                ];
            }
            $payload = ['predictions' => $predictions];
            Cache::put($cacheKey, $payload, now()->addMinutes(5));

            return response()->json($payload);
        }

        return response()->json(['error' => 'Autocomplete failed'], 500);
    }

    public function reverse(Request $request)
    {
        $lat = $request->get('lat');
        $lng = $request->get('lng');

        if (!is_numeric($lat) || !is_numeric($lng) || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return response()->json(['error' => 'Missing or invalid lat/lng parameters'], 422);
        }

        $lat = round((float) $lat, 5);
        $lng = round((float) $lng, 5);
        $cacheKey = "geo:reverse:{$lat}:{$lng}";
        if ($cached = Cache::get($cacheKey)) {
            return response()->json($cached);
        }

        if ($this->apiKey) {
            // Use geocode endpoint with latlng param for reverse geocoding (rsapi.goong.io expects latlng)
            $response = Http::timeout(8)->retry(2, 200)->get("{$this->baseUrl}/geocode", [
                'latlng' => $lat . ',' . $lng,
                'api_key' => $this->apiKey,
            ]);

            if ($response->successful()) {
                Cache::put($cacheKey, $response->json(), now()->addMinutes(10));
            }

            return response()->json($response->json(), $response->status());
        }

        // Fallback to OpenStreetMap Nominatim
        $response = Http::withHeaders([
            'User-Agent' => 'Laravel/SORA-ThinkHub'
        ])->timeout(8)->retry(2, 200)->get('https://nominatim.openstreetmap.org/reverse', [
            'format' => 'jsonv2',
            'lat' => $lat,
            'lon' => $lng,
            'addressdetails' => 1,
            'accept-language' => 'vi'
        ]);

        if ($response->successful()) {
            $data = $response->json();
            if (isset($data['error'])) {
                return response()->json($data, 400);
            }

            $address = $data['address'] ?? [];
            $province = $address['city'] ?? $address['state'] ?? $address['province'] ?? '';
            $district = $address['district'] ?? $address['county'] ?? $address['suburb'] ?? '';
            $ward = $address['quarter'] ?? $address['neighbourhood'] ?? $address['village'] ?? $address['hamlet'] ?? $address['suburb'] ?? '';

            // Format to match Goong API response expected by frontend
            $payload = [
                'results' => [
                    [
                        'formatted_address' => $data['display_name'] ?? '',
                        'compound' => [
                            'province' => $province,
                            'district' => $district,
                            'commune' => $ward,
                        ]
                    ]
                ]
            ];
            Cache::put($cacheKey, $payload, now()->addMinutes(10));

            return response()->json($payload);
        }

        return response()->json(['error' => 'Unable to geocode'], 500);
    }

    public function geocode(Request $request)
    {
        $address = trim($request->get('address', ''));
        if ($address === '' || mb_strlen($address) > 255) {
            return response()->json(['error' => 'Missing address parameter'], 422);
        }

        $cacheKey = 'geo:geocode:' . hash('sha256', mb_strtolower($address, 'UTF-8'));
        if ($cached = Cache::get($cacheKey)) {
            return response()->json($cached);
        }

        if ($this->apiKey) {
            $response = Http::timeout(8)->retry(2, 200)->get("{$this->baseUrl}/geocode", [
                'address' => $address,
                'api_key' => $this->apiKey,
            ]);

            if ($response->successful()) {
                Cache::put($cacheKey, $response->json(), now()->addMinutes(10));
            }

            return response()->json($response->json(), $response->status());
        }

        // Fallback to Nominatim
        $response = Http::withHeaders([
            'User-Agent' => 'Laravel/SORA-ThinkHub'
        ])->timeout(8)->retry(2, 200)->get('https://nominatim.openstreetmap.org/search', [
            'format' => 'jsonv2',
            'q' => $address,
            'addressdetails' => 1,
            'limit' => 1,
            'accept-language' => 'vi'
        ]);

        if ($response->successful()) {
            $data = $response->json();
            if (empty($data)) {
                return response()->json(['results' => []]);
            }
            
            $item = $data[0];
            $addr = $item['address'] ?? [];
            $province = $addr['city'] ?? $addr['state'] ?? $addr['province'] ?? '';
            $district = $addr['district'] ?? $addr['county'] ?? $addr['suburb'] ?? '';
            $ward = $addr['quarter'] ?? $addr['neighbourhood'] ?? $addr['village'] ?? $addr['hamlet'] ?? $addr['suburb'] ?? '';

            $payload = [
                'results' => [
                    [
                        'formatted_address' => $item['display_name'] ?? '',
                        'geometry' => [
                            'location' => [
                                'lat' => isset($item['lat']) ? (float) $item['lat'] : null,
      'lng' => isset($item['lon']) ? (float) $item['lon'] : null,
                            ]
                        ],
                        'compound' => [
                            'province' => $province,
                            'district' => $district,
                            'commune' => $ward,
                        ]
                    ]
                ]
            ];
            Cache::put($cacheKey, $payload, now()->addMinutes(10));

            return response()->json($payload);
        }

        return response()->json(['error' => 'Geocode failed'], 500);
    }
}
