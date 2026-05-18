<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\AdminStoreUserRequest;
use App\Http\Requests\AdminUpdateUserRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Events\UserAccountUpdated;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::withTrashed()->with(['defaultAddress', 'addresses'])->orderBy('id', 'desc')->paginate(20);
        return response()->json(['success' => true, 'data' => $users]);
    }

    // Thêm mới
    public function store(AdminStoreUserRequest $request)
    {
        try {
            $user = DB::transaction(function () use ($request) {
                $data = $request->except(['password', 'avatar', 'shipping_address', 'city', 'district', 'ward']);
                $data['password'] = Hash::make($request->password);

                if ($request->hasFile('avatar')) {
                    $path = $request->file('avatar')->store('avatars/users', 'public');
                    $data['avatar_url'] = $path;
                }

                $newUser = User::create($data);

                if ($request->filled('shipping_address')) {
                    $newUser->addresses()->create([
                        'customer_name'    => $newUser->fullName,
                        'customer_phone'   => $newUser->phone,
                        'shipping_address' => $request->shipping_address,
                        'city'             => $request->city,
                        'district'         => $request->district,
                        'ward'             => $request->ward,
                        'is_default'       => 1
                    ]);
                }

                return $newUser;
            });

            event(new UserAccountUpdated($user->id, ['action' => 'created']));
            return response()->json(['success' => true, 'message' => 'Tạo tài khoản khách hàng thành công!', 'data' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $user = User::withTrashed()->with(['defaultAddress', 'addresses'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function update(AdminUpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->except(['password', 'avatar', '_method', 'remove_avatar', 'shipping_address', 'city', 'district', 'ward']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
                Storage::disk('public')->delete($user->avatar_url);
            }
            $path = $request->file('avatar')->store('avatars/users', 'public');
            $data['avatar_url'] = $path;
        } elseif ($request->input('remove_avatar') == 'true') {
            if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
                Storage::disk('public')->delete($user->avatar_url);
            }
            $data['avatar_url'] = null;
        }

        try {
            DB::transaction(function () use ($request, $user, $data) {
                $user->update($data);

                if (array_key_exists('fullName', $data) || array_key_exists('phone', $data)) {
                    $user->addresses()->update([
                        'customer_name'  => $user->fullName,
                        'customer_phone' => $user->phone,
                    ]);
                }

                if ($request->filled('shipping_address')) {
                    $user->addresses()->updateOrCreate(
                        ['is_default' => 1], 
                        [
                            'customer_name'    => $user->fullName,
                            'customer_phone'   => $user->phone,
                            'shipping_address' => $request->shipping_address,
                            'city'             => $request->city,
                            'district'         => $request->district,
                            'ward'             => $request->ward,
                        ]
                    );
                }
            });

            event(new UserAccountUpdated($user->id, ['action' => 'updated']));
            return response()->json(['success' => true, 'message' => 'Cập nhật thông tin thành công!']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete(); 
        event(new UserAccountUpdated($user->id, ['action' => 'deleted']));
        return response()->json(['success' => true, 'message' => 'Đã chuyển khách hàng vào thùng rác!']);
    }

    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        $conflict = User::whereNull('deleted_at')
            ->where(function ($q) use ($user) {
                $q->where('email', $user->email);
                if ($user->phone) {
                    $q->orWhere('phone', $user->phone);
                }
            })->exists();

        if ($conflict) {
            return response()->json([
                'success' => false, 
                'message' => 'Không thể khôi phục! Email hoặc Số điện thoại của khách hàng này đã bị tài khoản khác sử dụng trong thời gian bị xóa mềm.'
            ], 400);
        }

        $user->restore();
        event(new UserAccountUpdated($user->id, ['action' => 'restored']));
        return response()->json(['success' => true, 'message' => 'Đã khôi phục tài khoản thành công!']);
    }
}