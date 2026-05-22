<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\WorkShift;
use App\Models\AdminShiftAssignment;
use App\Http\Requests\WorkShift\StoreWorkShiftRequest;
use App\Http\Requests\WorkShift\UpdateWorkShiftRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminWorkShiftController extends Controller
{
    public function index(Request $request)
    {
        // Khởi tạo query và gộp Eager Loading để lấy danh sách phân công & thông tin admin
        // Chỉ lấy các trường id, fullname, email của admin để tối ưu dung lượng JSON trả về
        $query = WorkShift::withCount('assignments')->with(['assignments.admin' => function($q) {
            $q->select('id', 'fullname', 'email');
        }]);

        // Nếu yêu cầu danh sách đã xóa
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
            'working_days' => $request->working_days, // Lưu mảng 7 ngày vào DB
            'overtime_days' => $request->overtime_days, // Lưu mảng 7 ngày OT vào DB
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
            
            // Xóa cứng toàn bộ liên kết nhân viên thuộc ca làm việc đó để trả về trạng thái tự do (free)
            AdminShiftAssignment::where('work_shift_id', $id)->delete();
            
            // Tiến hành xóa mềm ca làm việc
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
        ]);

        // Cập nhật hoặc tạo mới phân công ca cho admin đó
        $assignment = AdminShiftAssignment::updateOrCreate(
            ['admin_id' => $request->admin_id],
            ['work_shift_id' => $request->work_shift_id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Phân công ca thành công!',
            'data' => $assignment
        ]);
    }

    public function assignMultiple(Request $request)
    {
        $request->validate([
            'admin_ids' => 'required|array',
            'admin_ids.*' => 'exists:admins,id',
            'work_shift_id' => 'required|exists:work_shifts,id',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->admin_ids as $adminId) {
                AdminShiftAssignment::updateOrCreate(
                    ['admin_id' => $adminId],
                    ['work_shift_id' => $request->work_shift_id]
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

        $assignment = AdminShiftAssignment::where('admin_id', $adminId)
            ->where('work_shift_id', $request->work_shift_id)
            ->first();

        if ($assignment) {
            $assignment->delete();
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