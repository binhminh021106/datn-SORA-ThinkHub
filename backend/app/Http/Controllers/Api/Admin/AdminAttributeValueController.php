<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
use Illuminate\Http\Request;

class AdminAttributeValueController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255'
        ]);

        $val = AttributeValue::firstOrCreate([
            'attribute_id' => $request->attribute_id,
            'value' => $request->value
        ]);

        return response()->json(['success' => true, 'data' => $val]);
    }
}