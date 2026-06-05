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

        if ($this->apiKey) {
            $response = Http::get("{$this->baseUrl}/places/autocomplete", [
                'input' => $query,
                'api_key' => $this->apiKey,
            ]);

            return response()->json($response->json(), $response->status());
        }

        // Fallback to Nominatim
        $response = Http::withHeaders([
            'User-Agent' => 'Laravel/SORA-ThinkHub'
        ])->get('https://nominatim.openstreetmap.org/search', [
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
            return response()->json(['predictions' => $predictions]);
        }

        return response()->json(['error' => 'Autocomplete failed'], 500);
    }

    public function reverse(Request $request)
    {
        $lat = $request->get('lat');
        $lng = $request->get('lng');

        if (!is_numeric($lat) || !is_numeric($lng)) {
            return response()->json(['error' => 'Missing or invalid lat/lng parameters'], 422);
        }

        if ($this->apiKey) {
            // Use geocode endpoint with latlng param for reverse geocoding (rsapi.goong.io expects latlng)
            $response = Http::get("{$this->baseUrl}/geocode", [
                'latlng' => $lat . ',' . $lng,
                'api_key' => $this->apiKey,
            ]);

            return response()->json($response->json(), $response->status());
        }

        // Fallback to OpenStreetMap Nominatim
        $response = Http::withHeaders([
            'User-Agent' => 'Laravel/SORA-ThinkHub'
        ])->get('https://nominatim.openstreetmap.org/reverse', [
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
            return response()->json([
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
            ]);
        }

        return response()->json(['error' => 'Unable to geocode'], 500);
    }

    public function geocode(Request $request)
    {
        $address = trim($request->get('address', ''));
        if ($address === '') {
            return response()->json(['error' => 'Missing address parameter'], 422);
        }

        if ($this->apiKey) {
            $response = Http::get("{$this->baseUrl}/geocode", [
                'address' => $address,
                'api_key' => $this->apiKey,
            ]);

            return response()->json($response->json(), $response->status());
        }

        // Fallback to Nominatim
        $response = Http::withHeaders([
            'User-Agent' => 'Laravel/SORA-ThinkHub'
        ])->get('https://nominatim.openstreetmap.org/search', [
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

            return response()->json([
                'results' => [
                    [
                        'formatted_address' => $item['display_name'] ?? '',
                        'geometry' => [
                            'location' => [
                                'lat' => $item['lat'],
                                'lng' => $item['lon'],
                            ]
                        ],
                        'compound' => [
                            'province' => $province,
                            'district' => $district,
                            'commune' => $ward,
                        ]
                    ]
                ]
            ]);
        }

        return response()->json(['error' => 'Geocode failed'], 500);
    }
}
