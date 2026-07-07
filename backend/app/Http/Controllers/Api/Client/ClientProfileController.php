<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\Profile\ClientProfileUpdateRequest;
use App\Http\Requests\Client\Profile\ClientPasswordUpdateRequest;
use App\Http\Requests\Client\Address\ClientAddressStoreRequest;
use App\Http\Requests\Client\Address\ClientAddressUpdateRequest;
use App\Models\User; 
use App\Models\UserAddress; // BẮT BUỘC IMPORT MODEL NÀY
use App\Models\MembershipTier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ClientProfileController extends Controller
{
    // ==========================================
    // PHẦN 1: HỒ SƠ CÁ NHÂN & MẬT KHẨU
    // ==========================================

    public function show()
    {
        $user = User::with('tier')->find(Auth::guard('sanctum')->id());
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);
        
        $userData = $user->toArray();
        if ($user->avatar_url && !str_starts_with($user->avatar_url, 'http')) {
            $userData['avatar_url'] = url('storage/' . $user->avatar_url);
        }

        // Đính kèm URL đầy đủ cho icon tier (nếu có)
        if ($user->tier && $user->tier->icon) {
            $userData['tier']['icon_url'] = url('storage/' . $user->tier->icon);
        }

        // Trả thêm danh sách toàn bộ hạng thành viên (để hiển thị progress)
        $allTiers = MembershipTier::orderBy('min_spent', 'asc')->get()->map(function ($t) {
            $t->icon_url = $t->icon ? url('storage/' . $t->icon) : null;
            return $t;
        });
        $userData['all_tiers'] = $allTiers;

        return response()->json(['status' => true, 'data' => $userData]);
    }

    public function update(ClientProfileUpdateRequest $request)
    {
        $user = User::find(Auth::guard('sanctum')->id());
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        // Form request đã validate và chuẩn hóa số điện thoại rồi
        $user->fullName = $request->fullName;
        if ($request->has('phone')) $user->phone = $request->phone;
        if ($request->has('birthday')) $user->birthday = $request->birthday;
        if ($request->has('gender')) $user->gender = $request->gender;

        if ($request->hasFile('avatar')) {
            if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
                Storage::disk('public')->delete($user->avatar_url);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = $path;
        }

        $user->save();

        $userData = $user->toArray();
        if ($user->avatar_url && !str_starts_with($user->avatar_url, 'http')) {
            $userData['avatar_url'] = url('storage/' . $user->avatar_url);
        }

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật hồ sơ thành công!',
            'data' => $userData
        ]);
    }

    public function updatePassword(ClientPasswordUpdateRequest $request)
    {
        $user = User::find(Auth::guard('sanctum')->id());
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        // Form request đã validate rồi
        if (empty($user->password) || !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Mật khẩu hiện tại không chính xác!'
            ], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Đổi mật khẩu thành công!'
        ]);
    }

    
    // PHẦN 2: QUẢN LÝ SỔ ĐỊA CHỈ
    

    public function getAddresses()
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        $addresses = UserAddress::where('user_id', $user->id)
            ->orderBy('is_default', 'desc') // Mặc định đưa lên đầu
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['status' => true, 'data' => $addresses]);
    }

    public function storeAddress(ClientAddressStoreRequest $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        // Form request đã validate và chuẩn hóa số điện thoại rồi
        $isDefault = $request->is_default ? 1 : 0;

        // Nếu là địa chỉ đầu tiên của user, ép nó thành mặc định luôn
        if (UserAddress::where('user_id', $user->id)->count() === 0) {
            $isDefault = 1;
        }

        // Nếu chọn làm mặc định, phải gỡ mặc định của các địa chỉ cũ đi
        if ($isDefault == 1) {
            UserAddress::where('user_id', $user->id)->update(['is_default' => 0]);
        }

        $address = UserAddress::create([
            'user_id' => $user->id,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'city' => $request->city,
            'district' => $request->district,
            'ward' => $request->ward,
            'shipping_address' => $request->shipping_address,
            'is_default' => $isDefault
        ]);

        return response()->json(['status' => true, 'message' => 'Thêm địa chỉ mới thành công!', 'data' => $address]);
    }

    public function updateAddress(ClientAddressUpdateRequest $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        $address = UserAddress::where('user_id', $user->id)->where('id', $id)->first();
        if (!$address) return response()->json(['status' => false, 'message' => 'Không tìm thấy địa chỉ'], 404);

        // Form request đã validate và chuẩn hóa số điện thoại rồi
        $isDefault = $request->is_default ? 1 : 0;

        if ($isDefault == 1 && $address->is_default == 0) {
            UserAddress::where('user_id', $user->id)->update(['is_default' => 0]);
        }

        $address->update([
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'city' => $request->city,
            'district' => $request->district,
            'ward' => $request->ward,
            'shipping_address' => $request->shipping_address,
            'is_default' => $isDefault
        ]);

        return response()->json(['status' => true, 'message' => 'Cập nhật địa chỉ thành công!']);
    }

    public function deleteAddress($id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        $address = UserAddress::where('user_id', $user->id)->where('id', $id)->first();
        if (!$address) return response()->json(['status' => false, 'message' => 'Không tìm thấy địa chỉ'], 404);

        $wasDefault = $address->is_default;
        $address->delete();

        // Nếu lỡ tay xóa mất địa chỉ mặc định, tự động lấy địa chỉ gần nhất gán làm mặc định
        if ($wasDefault) {
            $latest = UserAddress::where('user_id', $user->id)->latest()->first();
            if ($latest) {
                $latest->update(['is_default' => 1]);
            }
        }

        return response()->json(['status' => true, 'message' => 'Đã xóa địa chỉ khỏi sổ tay!']);
    }

    public function setDefaultAddress($id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['status' => false, 'message' => 'Vui lòng đăng nhập'], 401);

        $address = UserAddress::where('user_id', $user->id)->where('id', $id)->first();
        if (!$address) return response()->json(['status' => false, 'message' => 'Không tìm thấy địa chỉ'], 404);

        UserAddress::where('user_id', $user->id)->update(['is_default' => 0]);
        $address->update(['is_default' => 1]);

        return response()->json(['status' => true, 'message' => 'Đã đặt làm địa chỉ mặc định!']);
    }
}