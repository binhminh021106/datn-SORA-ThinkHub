<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;

class AdminAttributeController extends Controller
{
    public function index()
    {
        $attributes = Attribute::with('values')->orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $attributes]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255|unique:attributes,name']);
        $attribute = Attribute::create(['name' => $request->name]);
        $attribute->load('values'); 
        
        return response()->json(['success' => true, 'data' => $attribute]);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255|unique:attributes,name,' . $id]);
        $attribute = Attribute::findOrFail($id);
        $attribute->update(['name' => $request->name]);
        
        return response()->json(['success' => true, 'data' => $attribute]);
    }

    public function destroy($id)
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete(); 
        
        return response()->json(['success' => true, 'message' => 'Đã xóa thuộc tính']);
    }
}