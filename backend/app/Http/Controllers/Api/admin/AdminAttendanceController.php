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
     * API Lấy danh sách ca làm việc phục vụ cho bộ lọc
     */
    public function getWorkShifts()
    {
        $shifts = WorkShift::all(['id', 'name', 'start_time', 'end_time']);
        return response()->json(['success' => true, 'data' => $shifts]);
    }

    /**
     * Lấy trạng thái hiện tại (Fix 500: Chuyển sang dùng $request->user()->id của Sanctum)
     */
    public function checkStatus(Request $request)
    {
        $adminId = $request->user()->id; 
        $today = Carbon::today()->format('Y-m-d');

        // 1. Kiểm tra ca treo (chưa check-out từ hôm trước)
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

        // 3. Nếu chưa làm gì, lấy thông tin phân ca ngày hôm nay để hiển thị ra UI
        $assignment = AdminShiftAssignment::where('admin_id', $adminId)
            ->active($today)
            ->with('workShift')
            ->first();

        return response()->json([
            'success' => true, 
            'state' => 'ready', 
            'data' => null,
            'shift_assignment' => $assignment ? $assignment->workShift : null 
        ]);
    }

    /**
     * Xử lý Check-in
     */
    public function checkIn(Request $request)
    {
        $adminId = $request->user()->id;
        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        if (AdminAttendance::where('admin_id', $adminId)->where('attendance_date', $today)->exists()) {
            return response()->json(['success' => false, 'message' => 'Bạn đã check-in hôm nay rồi.'], 400);
        }

        try {
            DB::beginTransaction();

            $assignment = AdminShiftAssignment::where('admin_id', $adminId)->active($today)->first();
            $workShift = $assignment ? WorkShift::find($assignment->work_shift_id) : null;
            
            $lateMinutes = 0;
            $status = 'present';

            if ($workShift && $workShift->start_time) {
                try {
                    $scheduledStart = Carbon::parse($today . ' ' . $workShift->start_time);
                    $diff = $now->diffInMinutes($scheduledStart, false); 
                    $tolerance = intval($workShift->late_tolerance ?? 0);
                    
                    if ($diff > $tolerance) {
                        $lateMinutes = max(0, $diff - $tolerance);
                        $status = 'late';
                    }
                } catch (\Exception $ex) {}
            }

            $attendance = AdminAttendance::create([
                'admin_id' => $adminId,
                'work_shift_id' => $workShift ? $workShift->id : null,
                'shift_start_time' => $workShift ? $workShift->start_time : null,
                'shift_end_time' => $workShift ? $workShift->end_time : null,
                'shift_late_tolerance' => $workShift ? ($workShift->late_tolerance ?? 0) : 0,
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
            return response()->json(['success' => false, 'message' => 'Không tìm thấy ca làm việc đang mở.'], 404);
        }

        $checkoutTime = Carbon::now();
        $earlyLeaveMinutes = 0;

        if ($shift->shift_end_time) {
            $shiftEnd = Carbon::parse($shift->attendance_date->format('Y-m-d') . ' ' . $shift->shift_end_time);
            
            if ($shift->shift_start_time && $shift->shift_end_time <= $shift->shift_start_time) {
                $shiftEnd->addDay();
            }

            if ($checkoutTime->lessThan($shiftEnd)) {
                $earlyLeaveMinutes = $shiftEnd->diffInMinutes($checkoutTime);
            }
        } 
        elseif ($shift->workShift) {
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
        $query = AdminAttendance::with(['admin:id,fullname,email', 'workShift'])
                                ->where('admin_id', $adminId); 

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('attendance_date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('attendance_date', 'asc')->paginate($request->per_page ?? 50);
                             
        return response()->json(['success' => true, 'data' => $attendances]);
    }

    public function history(Request $request, $adminId)
    {
        $query = AdminAttendance::with('workShift')->where('admin_id', $adminId);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('attendance_date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('attendance_date', 'asc')->paginate($request->per_page ?? 50);

        return response()->json(['success' => true, 'data' => $attendances]);
    }

    public function dailyStatus(Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));
        $roleId = $request->get('role_id', 'all');
        $workShiftId = $request->get('work_shift_id', 'all');

        $query = Admin::with([
            'attendance' => function($query) use ($date) {
                $query->where('attendance_date', $date)->with('workShift');
            },
            'shiftAssignment' => function($query) use ($date) {
                $query->active($date)->with('workShift');
            },
            'role'
        ]);

        // Lọc theo chức vụ
        if ($roleId !== 'all') {
            $query->where('role_id', $roleId);
        }

        // Lọc theo ca làm việc (Chỉ những ai có phân công hoặc có chấm công vào ca đó)
        if ($workShiftId !== 'all') {
            $query->where(function ($q) use ($date, $workShiftId) {
                $q->whereHas('shiftAssignment', function ($sub) use ($date, $workShiftId) {
                    $sub->active($date)->where('work_shift_id', $workShiftId);
                })
                ->orWhereHas('attendance', function ($sub) use ($date, $workShiftId) {
                    $sub->where('attendance_date', $date)->where('work_shift_id', $workShiftId);
                });
            });
        }

        $admins = $query->get();

        return response()->json(['success' => true, 'data' => $admins]);
    }

    public function monthlySummary(Request $request)
    {
        $year = intval($request->get('year', Carbon::today()->format('Y')));
        $month = intval($request->get('month', Carbon::today()->format('m')));
        $roleId = $request->get('role_id', 'all');
        $workShiftId = $request->get('work_shift_id', 'all');

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $today = Carbon::today();

        // 1. Lấy danh sách admin theo Role (nếu có lọc role)
        $adminQuery = Admin::query();
        if ($roleId !== 'all') {
            $adminQuery->where('role_id', $roleId);
        }
        $admins = $adminQuery->get();
        $adminIds = $admins->pluck('id')->toArray();

        // 2. Lấy danh sách chấm công
        $attendanceQuery = AdminAttendance::whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])
            ->whereIn('admin_id', $adminIds);
            
        if ($workShiftId !== 'all') {
            $attendanceQuery->where('work_shift_id', $workShiftId);
        }
        
        $attendances = $attendanceQuery->get();
        $attendanceByDate = $attendances->groupBy(function ($item) {
            return $item->attendance_date->format('Y-m-d');
        });

        $summary = [];
        $totalDays = $start->daysInMonth;

        for ($day = 1; $day <= $totalDays; $day++) {
            $date = Carbon::create($year, $month, $day);
            $dateString = $date->format('Y-m-d');
            $weekdayIndex = $date->dayOfWeek === 0 ? 6 : $date->dayOfWeek - 1; 
            $isFuture = $date->isAfter($today);

            // Lấy danh sách phân ca
            $assignmentQuery = AdminShiftAssignment::whereIn('admin_id', $adminIds)
                ->active($dateString)
                ->with('workShift');
                
            if ($workShiftId !== 'all') {
                $assignmentQuery->where('work_shift_id', $workShiftId);
            }
            $activeAssignments = $assignmentQuery->get();

            $scheduledAdminsCount = 0;
            foreach ($activeAssignments as $assignment) {
                $shift = $assignment->workShift;
                if ($shift && is_array($shift->working_days)) {
                    if (isset($shift->working_days[$weekdayIndex]) && $shift->working_days[$weekdayIndex]) {
                        $scheduledAdminsCount++;
                    }
                }
            }

            $attendanceOnDate = $attendanceByDate->get($dateString, collect());
            $attendanceAdminIdsCount = $attendanceOnDate->pluck('admin_id')->unique()->count();

            if ($isFuture) {
                $totalTracked = $scheduledAdminsCount;
                $present = 0;
                $late = 0;
                $absent = 0;
            } else {
                $totalTracked = max($scheduledAdminsCount, $attendanceAdminIdsCount);
                $present = $attendanceOnDate->where('status', 'present')->count();
                $late = $attendanceOnDate->where('status', 'late')->count();
                $absent = max(0, $totalTracked - $present - $late);
            }

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