<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\MembershipTier;
use App\Http\Requests\AdminStoreMembershipTierRequest;
use App\Http\Requests\AdminUpdateMembershipTierRequest;
use Illuminate\Support\Facades\Storage;

class AdminMembershipTierController extends Controller
{
    public function index()
    {
        // Sử dụng ORM withCount để đếm số user tối ưu
        $tiers = MembershipTier::withCount('users')
                    ->orderBy('min_spent', 'asc')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $tiers
        ]);
    }

    public function store(AdminStoreMembershipTierRequest $request)
    {
        $data = $request->validated();
        unset($data['icon']);

        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('tiers', 'public');
            $data['icon'] = $path;
        }

        $tier = MembershipTier::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo hạng thành viên thành công.',
            'data' => $tier
        ], 201);
    }

    public function show($id)
    {
        $tier = MembershipTier::find($id);
        if (!$tier) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hạng này'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tier
        ]);
    }

    public function update(AdminUpdateMembershipTierRequest $request, $id)
    {
        $tier = MembershipTier::find($id);
        if (!$tier) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hạng này'], 404);
        }

        $data = $request->validated();
        unset($data['icon']);

        if ($request->hasFile('icon')) {
            if ($tier->icon && Storage::disk('public')->exists($tier->icon)) {
                Storage::disk('public')->delete($tier->icon);
            }
            $path = $request->file('icon')->store('tiers', 'public');
            $data['icon'] = $path;
        }

        $tier->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thành công.',
            'data' => $tier
        ]);
    }

    public function destroy($id)
    {
        $tier = MembershipTier::withCount('users')->find($id);
        
        if (!$tier) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hạng này'], 404);
        }

        if ($tier->min_spent == 0) {
            return response()->json(['success' => false, 'message' => 'Không thể xóa Hạng Mặc định (0 đồng) của hệ thống!'], 403);
        }

        if ($tier->users_count > 0) {
            return response()->json([
                'success' => false, 
                'message' => "Không thể xóa! Đang có {$tier->users_count} khách hàng thuộc hạng này. Vui lòng hạ hạng của họ trước."
            ], 403);
        }

        if ($tier->icon && Storage::disk('public')->exists($tier->icon)) {
            Storage::disk('public')->delete($tier->icon);
        }

        $tier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa hạng thành viên.'
        ]);
    }
}