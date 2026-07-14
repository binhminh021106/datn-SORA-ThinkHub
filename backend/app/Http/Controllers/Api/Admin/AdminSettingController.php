<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingRequest;
use App\Models\Setting;
use App\Events\SettingUpdated;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminSettingController extends Controller
{
    /**
     * Get all settings as key-value pairs
     */
    public function index()
    {
        $settings = Setting::all()->mapWithKeys(function ($setting) {
            $value = $setting->value;
            if ($setting->type === 'json') {
                $value = json_decode($value, true);
            }
            return [$setting->key => $value];
        });

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    /**
     * Update settings
     */
    public function update(UpdateSettingRequest $request)
    {
        $settings = $request->validated()['settings'];

        foreach ($settings as $item) {
            $value = $item['value'];
            $type = $item['type'] ?? 'string';

            // Handle Image - just accept the URL if it's passed
            if ($type === 'image') {
                // Do not delete old image, keep it in library
                // The $value is already the path sent by frontend
            } elseif ($type === 'json' && is_array($value)) {
                // Handle JSON arrays/objects
                $value = json_encode($value);
            }

            // Update or Create
            Setting::updateOrCreate(
                ['key' => $item['key']],
                ['value' => $value, 'type' => $type]
            );
        }

        // Trigger Real-time Event
        event(new SettingUpdated());

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật cấu hình thành công'
        ]);
    }

    /**
     * Get list of uploaded logos
     */
    public function getLogos()
    {
        $directory = 'settings/logos';
        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }

        $files = Storage::disk('public')->files($directory);

        // Sort by modified time descending (newest first)
        usort($files, function($a, $b) {
            return Storage::disk('public')->lastModified($b) - Storage::disk('public')->lastModified($a);
        });

        $urls = array_map(function($file) {
            return url('storage/' . $file);
        }, $files);

        return response()->json([
            'status' => 'success',
            'data' => $urls
        ]);
    }

    /**
     * Upload a new logo to the library
     */
    public function uploadLogo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|string', // Base64 string
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $value = $request->image;
        if (str_starts_with($value, 'data:image')) {
            $image_parts = explode(";base64,", $value);
            if (count($image_parts) == 2) {
                $image_type_aux = explode("image/", $image_parts[0]);
                $image_type = $image_type_aux[1] ?? 'png';
                $image_base64 = base64_decode($image_parts[1]);
                
                $fileName = 'settings/logos/logo_' . time() . '.' . $image_type;
                Storage::disk('public')->put($fileName, $image_base64);
                
                return response()->json([
                    'status' => 'success',
                    'url' => env('APP_URL') . '/storage/' . $fileName,
                    'path' => $fileName
                ]);
            }
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid image data'], 400);
    }

    /**
     * Get logo as base64 to bypass CORS
     */
    public function getLogoBase64(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $appUrl = env('APP_URL') . '/storage/';
        if (str_starts_with($request->url, $appUrl)) {
            $path = str_replace($appUrl, '', $request->url);
            
            if (str_contains($path, '..')) {
                return response()->json(['status' => 'error', 'message' => 'Invalid path'], 400);
            }

            if (Storage::disk('public')->exists($path)) {
                $mimeType = Storage::disk('public')->mimeType($path);
                $content = Storage::disk('public')->get($path);
                $base64 = 'data:' . $mimeType . ';base64,' . base64_encode($content);
                return response()->json(['status' => 'success', 'base64' => $base64]);
            }
        }

        return response()->json(['status' => 'error', 'message' => 'File not found or invalid URL'], 404);
    }

    /**
     * Delete a logo from the library
     */
    public function deleteLogo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        // Extract the path from the URL
        $appUrl = env('APP_URL') . '/storage/';
        if (str_starts_with($request->url, $appUrl)) {
            $path = str_replace($appUrl, '', $request->url);
            
            // Prevent directory traversal
            if (str_contains($path, '..')) {
                return response()->json(['status' => 'error', 'message' => 'Invalid path'], 400);
            }

            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                return response()->json(['status' => 'success', 'message' => 'Logo deleted successfully']);
            }
        }

        return response()->json(['status' => 'error', 'message' => 'File not found or invalid URL'], 404);
    }
}
