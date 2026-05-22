<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAttendance;
use App\Models\AdminShiftAssignment;
use App\Models\WorkShift;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Admin;
use App\Models\Role;

class AdminAttendanceController extends Controller
{
    /**
     * API Lấy danh sách chức vụ (Roles) phục vụ cho bộ lọc
     */
    public function getRoles()
    {
        $roles = Role::all(['id', 'value', 'label', 'badgeClass', 'level']);
        return response()->json(['success' => true, 'data' => $roles]);
    }

    /**
     * Lấy trạng thái hiện tại (Fix 500: Chuyển sang dùng $request->user()->id của Sanctum)
     */
    public function checkStatus(Request $request)
    {
        $adminId = $request->user()->id; 
        $today = Carbon::today()->format('Y-m-d');

        // 1. Kiểm tra ca treo
        $hangingShift = AdminAttendance::where('admin_id', $adminId)
            ->where('attendance_date', '<', $today)
            ->where('checkout_status', 'pending')
            ->first();

        if ($hangingShift) {
            return response()->json([
                'success' => true,
                'state' => 'hanging',
                'data' => $hangingShift
            ]);
        }

        // 2. Kiểm tra ca hôm nay
        $todayShift = AdminAttendance::where('admin_id', $adminId)
            ->where('attendance_date', $today)
            ->first();

        if ($todayShift) {
            if ($todayShift->checkout_status === 'pending') {
                return response()->json(['success' => true, 'state' => 'working', 'data' => $todayShift]);
            } else {
                return response()->json(['success' => true, 'state' => 'completed', 'data' => $todayShift]);
            }
        }

        return response()->json(['success' => true, 'state' => 'ready', 'data' => null]);
    }

    /**
     * Xử lý Check-in
     */
    public function checkIn(Request $request)
    {
        $adminId = $request->user()->id;
        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        // Kiểm tra Check-in đúp
        if (AdminAttendance::where('admin_id', $adminId)->where('attendance_date', $today)->exists()) {
            return response()->json(['success' => false, 'message' => 'Bạn đã check-in hôm nay rồi.'], 400);
        }

        try {
            DB::beginTransaction();

            // Lấy phân công ca nếu có
            $assignment = AdminShiftAssignment::where('admin_id', $adminId)->first();
            $workShiftId = null;
            $lateMinutes = 0;

            if ($assignment) {
                $ws = WorkShift::find($assignment->work_shift_id);
                if ($ws) {
                    $workShiftId = $ws->id;

                    // Tính toán trạng thái đi muộn dựa trên start_time và late_tolerance
                    try {
                        $scheduledStart = Carbon::parse($today . ' ' . $ws->start_time);
                        $diff = $now->diffInMinutes($scheduledStart, false); // positive if now after scheduled
                        $tolerance = intval($ws->late_tolerance ?? 0);
                        if ($diff > $tolerance) {
                            $lateMinutes = max(0, $diff - $tolerance);
                        }
                    } catch (\Exception $ex) {
                        // ignore parse errors, keep defaults
                    }
                }
            }

            $status = $lateMinutes > 0 ? 'late' : 'present';

            $attendance = AdminAttendance::create([
                'admin_id' => $adminId,
                'work_shift_id' => $workShiftId,
                'attendance_date' => $today,
                'clock_in' => $now,
                'status' => $status,
                'late_minutes' => $lateMinutes,
                'checkout_status' => 'pending',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Check-in thành công!', 'data' => $attendance]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Xử lý Check-out
     */
    public function checkOut(Request $request)
    {
        $adminId = $request->user()->id;
        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        $shift = AdminAttendance::with('workShift')
            ->where('admin_id', $adminId)
            ->where('checkout_status', 'pending')
            ->where(function ($query) use ($today, $yesterday) {
                $query->where('attendance_date', $today)
                    ->orWhere('attendance_date', $yesterday);
            })
            ->orderByDesc('attendance_date')
            ->first();

        if (!$shift) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy ca làm việc.'], 404);
        }

        $checkoutTime = Carbon::now();
        $earlyLeaveMinutes = 0;

        if ($shift->workShift) {
            $shiftStart = Carbon::parse($shift->attendance_date->format('Y-m-d') . ' ' . $shift->workShift->start_time);
            $shiftEnd = Carbon::parse($shift->attendance_date->format('Y-m-d') . ' ' . $shift->workShift->end_time);
            if ($shift->workShift->end_time <= $shift->workShift->start_time) {
                $shiftEnd->addDay();
            }

            if ($checkoutTime->lessThan($shiftEnd)) {
                $earlyLeaveMinutes = $shiftEnd->diffInMinutes($checkoutTime);
            }
        }

        $shift->update([
            'clock_out' => $checkoutTime,
            'checkout_status' => 'completed',
            'early_leave_minutes' => $earlyLeaveMinutes,
        ]);

        return response()->json(['success' => true, 'message' => 'Check-out thành công!', 'data' => $shift]);
    }

    public function index(Request $request)
    {
        $adminId = $request->user()->id; 

        $query = AdminAttendance::with('admin:id,fullname,email')
                                ->where('admin_id', $adminId); 

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('attendance_date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('attendance_date', 'asc')->paginate($request->per_page ?? 50);
                             
        return response()->json([
            'success' => true, 
            'data' => $attendances
        ]);
    }

    public function history(Request $request, $adminId)
    {
        $query = AdminAttendance::with('workShift')
                                ->where('admin_id', $adminId);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('attendance_date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('attendance_date', 'asc')->paginate($request->per_page ?? 50);

        return response()->json([
            'success' => true,
            'data' => $attendances
        ]);
    }

    public function dailyStatus(Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));
        $roleId = $request->get('role_id', 'all');

        // Lấy toàn bộ Admin, kèm theo dữ liệu chấm công của họ trong cái $date đó
        $query = \App\Models\Admin::with([
            'attendance' => function($query) use ($date) {
                $query->where('attendance_date', $date)->with('workShift');
            },
            'shiftAssignment.workShift',
            'role'
        ]);

        // Lọc theo chức vụ nếu có chọn
        if ($roleId !== 'all') {
            $query->where('role_id', $roleId);
        }

        $admins = $query->get();

        return response()->json(['success' => true, 'data' => $admins]);
    }

    public function monthlySummary(Request $request)
    {
        $year = intval($request->get('year', Carbon::today()->format('Y')));
        $month = intval($request->get('month', Carbon::today()->format('m')));
        $roleId = $request->get('role_id', 'all');

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $today = Carbon::today();

        // Lấy danh sách admin thỏa mãn bộ lọc role_id
        $adminQuery = Admin::with('shiftAssignment.workShift');
        if ($roleId !== 'all') {
            $adminQuery->where('role_id', $roleId);
        }
        $admins = $adminQuery->get();
        $adminIds = $admins->pluck('id')->toArray();

        // Chỉ lấy records chấm công của các nhân viên thuộc chức vụ đã chọn
        $attendances = AdminAttendance::whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])
            ->whereIn('admin_id', $adminIds)
            ->get();

        $attendanceByDate = $attendances->groupBy(function ($item) {
            return $item->attendance_date->format('Y-m-d');
        });

        $summary = [];
        $totalDays = $start->daysInMonth;

        for ($day = 1; $day <= $totalDays; $day++) {
            $date = Carbon::create($year, $month, $day);
            $dateString = $date->format('Y-m-d');
            $weekdayIndex = $date->dayOfWeek === 0 ? 6 : $date->dayOfWeek - 1; // 0 = CN -> 6, 1 = Thu 2 -> 0
            $isFuture = $date->isAfter($today);

            // Xác định danh sách nhân viên thực sự có lịch làm việc vào thứ này dựa trên ca phân công
            $scheduledAdmins = $admins->filter(function ($admin) use ($weekdayIndex) {
                $shift = optional($admin->shiftAssignment)->workShift;
                if ($shift && is_array($shift->working_days)) {
                    return isset($shift->working_days[$weekdayIndex]) && $shift->working_days[$weekdayIndex];
                }
                return false; // Không tự ý mặc định T2-T6 nếu không cấu hình ca
            });

            $attendanceOnDate = $attendanceByDate->get($dateString, collect());
            $attendanceAdminIds = $attendanceOnDate->pluck('admin_id')->unique();

            if ($isFuture) {
                // Đối với tương lai: Tổng số là số người được xếp lịch thực tế, không tính vắng (absent = 0)
                $totalTracked = $scheduledAdmins->count();
                $present = 0;
                $late = 0;
                $absent = 0;
            } else {
                // Đối với quá khứ và hiện tại
                $totalTracked = $scheduledAdmins->pluck('id')->merge($attendanceAdminIds)->unique()->count();
                $present = $attendanceOnDate->where('status', 'present')->count();
                $late = $attendanceOnDate->where('status', 'late')->count();
                $absent = max(0, $totalTracked - $present - $late);
            }

            // Nếu ngày nghỉ hoàn toàn không có ai được phân ca và không có dữ liệu chấm công
            if ($totalTracked === 0) {
                $summary[$dateString] = null;
            } else {
                $summary[$dateString] = [
                    'total' => $totalTracked,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $absent,
                    'is_future' => $isFuture
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}