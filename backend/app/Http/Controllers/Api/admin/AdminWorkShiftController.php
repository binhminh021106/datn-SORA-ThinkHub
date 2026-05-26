<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\WorkShift;
use App\Models\AdminShiftAssignment;
use App\Http\Requests\WorkShift\StoreWorkShiftRequest;
use App\Http\Requests\WorkShift\UpdateWorkShiftRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminWorkShiftController extends Controller
{
    public function index(Request $request)
    {
        $query = WorkShift::withCount('assignments')->with(['assignments.admin' => function($q) {
            $q->select('id', 'fullname', 'email');
        }]);

        if ($request->query('trashed') === 'true') {
            $query->onlyTrashed();
        } 

        $shifts = $query->get();

        return response()->json(['success' => true, 'data' => $shifts]);
    }

    public function store(StoreWorkShiftRequest $request)
    {
        $shift = WorkShift::create([
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'late_tolerance' => $request->late_tolerance ?? 0,
            'is_overnight' => $request->is_overnight ?? false,
            'working_days' => $request->working_days, 
            'overtime_days' => $request->overtime_days, 
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Tạo ca làm việc thành công', 
            'data' => $shift
        ]);
    }

    public function update(UpdateWorkShiftRequest $request, $id)
    {
        $shift = WorkShift::findOrFail($id);
        $shift->update([
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'late_tolerance' => $request->late_tolerance ?? 0,
            'is_overnight' => $request->is_overnight ?? false,
            'working_days' => $request->working_days,
            'overtime_days' => $request->overtime_days,
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Cập nhật ca làm việc thành công', 
            'data' => $shift
        ]);
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $shift = WorkShift::findOrFail($id);
            
            AdminShiftAssignment::where('work_shift_id', $id)->delete();
            $shift->delete();
            
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Xóa ca làm việc thành công và đã giải phóng toàn bộ nhân viên thuộc ca này!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa ca làm việc: ' . $e->getMessage()
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
            $shift = WorkShift::onlyTrashed()->findOrFail($id);
            $shift->restore();

            return response()->json([
                'success' => true,
                'message' => 'Khôi phục ca làm việc thành công!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Khôi phục thất bại hoặc không tìm thấy ca làm việc.'
            ], 404);
        }
    }

    public function assignShift(Request $request)
    {
        $request->validate([
            'admin_id' => 'required|exists:admins,id',
            'work_shift_id' => 'required|exists:work_shifts,id',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
        ]);

        $validFrom = $request->valid_from ?? now()->toDateString();
        $validTo = $request->valid_to ?? null;

        DB::beginTransaction();
        try {
            // Đóng ca cũ ở quá khứ bất kể có cùng work_shift_id hay không để tránh chồng lấn
            $currentActive = AdminShiftAssignment::where('admin_id', $request->admin_id)
                ->active($validFrom)
                ->where('valid_from', '<', $validFrom)
                ->first();

            if ($currentActive) {
                $currentActive->update([
                    'valid_to' => Carbon::parse($validFrom)->subDay()->toDateString()
                ]);
            }

            // Tạo mới (hoặc update nếu thao tác trên cùng 1 ngày để tránh duplicate)
            $assignment = AdminShiftAssignment::updateOrCreate(
                [
                    'admin_id' => $request->admin_id,
                    'valid_from' => $validFrom
                ],
                [
                    'work_shift_id' => $request->work_shift_id,
                    'valid_to' => $validTo
                ]
            );
            
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Phân công ca thành công!',
                'data' => $assignment
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi phân công ca: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function assignMultiple(Request $request)
    {
        $request->validate([
            'admin_ids' => 'required|array',
            'admin_ids.*' => 'exists:admins,id',
            'work_shift_id' => 'required|exists:work_shifts,id',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
        ]);

        $validFrom = $request->valid_from ?? now()->toDateString();
        $validTo = $request->valid_to ?? null;

        DB::beginTransaction();
        try {
            foreach ($request->admin_ids as $adminId) {
                $currentActive = AdminShiftAssignment::where('admin_id', $adminId)
                    ->active($validFrom)
                    ->where('valid_from', '<', $validFrom)
                    ->first();

                if ($currentActive) {
                    $currentActive->update([
                        'valid_to' => Carbon::parse($validFrom)->subDay()->toDateString()
                    ]);
                }

                AdminShiftAssignment::updateOrCreate(
                    [
                        'admin_id' => $adminId,
                        'valid_from' => $validFrom
                    ],
                    [
                        'work_shift_id' => $request->work_shift_id,
                        'valid_to' => $validTo
                    ]
                );
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phân công hàng loạt thành công!',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi phân công hàng loạt: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function removeAssignment(Request $request, $adminId)
    {
        $request->validate([
            'work_shift_id' => 'required|exists:work_shifts,id',
        ]);

        // Sử dụng get() để đóng toàn bộ các ca bị chồng chéo đang active (nếu có do dữ liệu cũ)
        $assignments = AdminShiftAssignment::where('admin_id', $adminId)
            ->where('work_shift_id', $request->work_shift_id)
            ->active() 
            ->get();

        if ($assignments->isNotEmpty()) {
            foreach ($assignments as $assignment) {
                $assignment->update([
                    'valid_to' => now()->subDay()->toDateString()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã gỡ phân công nhân viên khỏi ca.',
        ]);
    }

    public function getAssignments()
    {
        $assignments = AdminShiftAssignment::with(['admin', 'workShift'])->get();
        return response()->json(['success' => true, 'data' => $assignments]);
    }
}