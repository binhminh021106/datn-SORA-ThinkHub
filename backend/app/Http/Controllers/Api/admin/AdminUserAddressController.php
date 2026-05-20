<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;

class AdminUserAddressController extends Controller
{
    public function index($userId)
    {
        $addresses = UserAddress::where('user_id', $userId)
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    public function store(Request $request, $userId)
    {
        $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:255',
        ]);

        $isFirstAddress = UserAddress::where('user_id', $userId)->doesntExist();

        if ($request->is_default == 1 || $isFirstAddress) {
            UserAddress::where('user_id', $userId)->update(['is_default' => 0]);
            $request->merge(['is_default' => 1]);
        }

        $address = UserAddress::create(array_merge($request->all(), ['user_id' => $userId]));
        
        return response()->json([
            'success' => true, 
            'message' => 'Đã thêm địa chỉ mới', 
            'data' => $address
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $address = UserAddress::findOrFail($id);
        
        if ($request->is_default == 1) {
            UserAddress::where('user_id', $address->user_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => 0]);
        }

        $address->update($request->all());
        
        return response()->json([
            'success' => true, 
            'message' => 'Đã cập nhật địa chỉ thành công',
            'data' => $address
        ]);
    }

    public function destroy($id)
    {
        $address = UserAddress::findOrFail($id);
        
        if ($address->is_default) {
            return response()->json([
                'success' => false, 
                'message' => 'Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước!'
            ], 400);
        }
        
        $address->delete();
        
        return response()->json([
            'success' => true, 
            'message' => 'Đã xóa địa chỉ',
            'id' => $id
        ]);
    }

    public function setDefault($id)
    {
        $address = UserAddress::findOrFail($id);
        
        UserAddress::where('user_id', $address->user_id)->update(['is_default' => 0]);
        $address->update(['is_default' => 1]);
        
        return response()->json([
            'success' => true, 
            'message' => 'Đã đặt làm địa chỉ mặc định',
            'data' => $address
        ]);
    }
}