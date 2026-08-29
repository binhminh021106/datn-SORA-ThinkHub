<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ColorDictionary;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminColorDictionaryController extends Controller
{
    public function index()
    {
        return response()->json(ColorDictionary::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        if ($request->has('name') && is_string($request->name)) {
            $slug = Str::slug($request->name, ' ');
            $request->merge(['normalized_name' => str_replace('-', ' ', $slug)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'normalized_name' => 'required|string|max:255|unique:color_dictionaries,normalized_name',
            'color_code' => ['required', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ], [
            'normalized_name.unique' => 'Tên màu này đã tồn tại (hoặc tương tự tên đã có).'
        ]);

        $color = ColorDictionary::create($validated);
        return response()->json(['message' => 'Color added successfully', 'data' => $color]);
    }

    public function update(Request $request, string $id)
    {
        $color = ColorDictionary::findOrFail($id);

        if ($request->has('name') && is_string($request->name)) {
            $slug = Str::slug($request->name, ' ');
            $request->merge(['normalized_name' => str_replace('-', ' ', $slug)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'normalized_name' => 'required|string|max:255|unique:color_dictionaries,normalized_name,' . $id,
            'color_code' => ['required', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ], [
            'normalized_name.unique' => 'Tên màu này đã tồn tại (hoặc tương tự tên đã có).'
        ]);

        $color->update($validated);
        return response()->json(['message' => 'Color updated successfully', 'data' => $color]);
    }

    public function destroy(string $id)
    {
        $color = ColorDictionary::findOrFail($id);
        $color->delete();
        return response()->json(['message' => 'Color deleted successfully']);
    }
}
