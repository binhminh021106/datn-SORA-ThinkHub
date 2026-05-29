<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\WorkShift;
use App\Models\AdminShiftAssignment;
use App\Models\Admin;
use App\Models\ShiftException;
use App\Models\ShiftRequirement;
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
            'is_active' => $request->is_active ?? true,
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
            'is_active' => $request->is_active ?? true,
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
            $currentActive = AdminShiftAssignment::where('admin_id', $request->admin_id)
                ->active($validFrom)
                ->where('valid_from', '<', $validFrom)
                ->first();

            if ($currentActive) {
                $currentActive->update([
                    'valid_to' => Carbon::parse($validFrom)->subDay()->toDateString()
                ]);
            }

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

                // Đóng ca cũ lại (Ghi đè)
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

    public function autoAssign(Request $request)
    {
        $request->validate([
            'work_shift_id' => 'required|exists:work_shifts,id',
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after_or_equal:valid_from',
            'override_existing' => 'boolean',
            'max_employees' => 'nullable|integer|min:1',
            'candidate_admin_ids' => 'required|array',
            'candidate_admin_ids.*' => 'exists:admins,id'
        ]);

        $shiftId = $request->work_shift_id;
        $from = $request->valid_from;
        $to = $request->valid_to;
        $override = $request->boolean('override_existing', false);
        $maxEmployees = $request->max_employees;
        $candidateIds = $request->candidate_admin_ids;

        DB::beginTransaction();
        try {
            // Danh sách bận của ứng viên
            $busyAdmins = [];

            // Góc khuất đã xử lý: Overlap Date logic chuẩn xác
            // Một người bị coi là bận nếu có ca làm việc: Start <= To AND (End >= From OR End is NULL)
            if (!$override) {
                $busyAdmins = AdminShiftAssignment::whereIn('admin_id', $candidateIds)
                    ->where('valid_from', '<=', $to)
                    ->where(function ($query) use ($from) {
                        $query->where('valid_to', '>=', $from)
                              ->orWhereNull('valid_to');
                    })
                    ->pluck('admin_id')
                    ->toArray();
            }

            // Loại trừ nhân sự có ĐƠN XIN NGHỈ PHÉP
            $leaveAdmins = ShiftException::where('type', 'leave') 
                ->whereIn('admin_id', $candidateIds)
                ->whereBetween('date', [$from, $to])
                ->pluck('admin_id')
                ->toArray();

            // Lọc ra danh sách những ứng viên rảnh thực sự
            $excludedAdmins = array_unique(array_merge($busyAdmins, $leaveAdmins));
            $availableAdmins = array_diff($candidateIds, $excludedAdmins);

            if (empty($availableAdmins)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy nhân sự ứng viên nào khả dụng (không bận và không xin nghỉ) trong khoảng thời gian này.'
                ], 400);
            }

            // Xác định số lượng nhân sự tối đa cần bổ sung:
            // Thứ tự ưu tiên: 1. Do người dùng nhập từ UI -> 2. Cấu hình định mức (Requirements) -> 3. Toàn bộ ứng viên rảnh
            $limit = count($availableAdmins);
            if ($maxEmployees && $maxEmployees > 0) {
                $limit = min($maxEmployees, $limit);
            } else {
                $requirements = ShiftRequirement::where('work_shift_id', $shiftId)->sum('required_count');
                if ($requirements > 0) {
                    $limit = min($requirements, $limit);
                }
            }
            
            // Xếp ca ngẫu nhiên cho những người được chọn trong limit
            $selectedAdmins = array_slice(array_values($availableAdmins), 0, $limit);
            $assignments = [];

            foreach ($selectedAdmins as $adminId) {
                // Kiểm tra ca làm hiện đang active của nhân sự trong thời gian tới để đóng lại (nếu ghi đè)
                $currentActive = AdminShiftAssignment::where('admin_id', $adminId)
                    ->active($from)
                    ->where('valid_from', '<', $from)
                    ->first();

                // Đóng ca cũ của nhân sự nếu trùng lịch
                if ($currentActive) {
                    $currentActive->update(['valid_to' => Carbon::parse($from)->subDay()->toDateString()]);
                }

                $assignments[] = AdminShiftAssignment::updateOrCreate(
                    [
                        'admin_id' => $adminId,
                        'valid_from' => $from
                    ],
                    [
                        'work_shift_id' => $shiftId,
                        'valid_to' => $to
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tự động phân công thành công cho ' . count($selectedAdmins) . ' nhân viên vào ca này!',
                'data' => $assignments
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi tự động xếp ca: ' . $e->getMessage()
            ], 500);
        }
    }

    public function removeAssignment(Request $request, $adminId)
    {
        $request->validate([
            'work_shift_id' => 'required|exists:work_shifts,id',
        ]);

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