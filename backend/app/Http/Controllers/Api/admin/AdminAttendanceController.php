<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAttendance;
use App\Models\AdminShiftAssignment;
use App\Models\WorkShift;
use App\Models\ShiftException;
use App\Models\OvertimeRequest;
use App\Models\Admin;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class AdminAttendanceController extends Controller
{
    public function getRoles()
    {
        $roles = Role::all(['id', 'value', 'label', 'badgeClass', 'level']);
        return response()->json(['success' => true, 'data' => $roles]);
    }

    public function getWorkShifts()
    {
        $shifts = WorkShift::where('is_active', true)->get(['id', 'name', 'start_time', 'end_time']);
        return response()->json(['success' => true, 'data' => $shifts]);
    }

    /**
     * TẠO MỚI: API cấp mã QR cho điện thoại nhân viên
     */
    public function generateQrToken(Request $request)
    {
        $payload = [
            'station_id' => $request->user()->id,
            'type' => 'station',
            'timestamp' => time()
        ];

        // Tạo một token ngắn (16 ký tự) để QR code to, rõ ràng, ít chấm đen, cực kỳ dễ quét!
        $shortToken = \Illuminate\Support\Str::random(16);
        
        // Lưu payload vào Cache, tự động hết hạn sau 300 giây (5 phút)
        \Illuminate\Support\Facades\Cache::put('qr_attendance_' . $shortToken, $payload, 300);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_token' => $shortToken,
                'expires_in' => 300 // Báo cho Frontend biết token này sống 5 phút (để test)
            ]
        ]);
    }

    private function validateQrToken(Request $request)
    {
        if ($request->has('qr_token')) {
            $payload = \Illuminate\Support\Facades\Cache::get('qr_attendance_' . $request->qr_token);
            
            if (!$payload) {
                throw new \Exception('Mã QR không hợp lệ hoặc đã quá 5 phút. Vui lòng lấy mã mới.');
            }

            if (!isset($payload['type']) || $payload['type'] !== 'station') {
                throw new \Exception('Mã QR không hợp lệ. Vui lòng quét mã trên màn hình của Công ty.');
            }
            
            return true;
        }
        
        return true;
    }

    public function checkStatus(Request $request)
    {
        try {
            $this->validateQrToken($request);
            $adminId = $request->user()->id;
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }

        $today = Carbon::today()->format('Y-m-d');

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

        $todayShift = AdminAttendance::where('admin_id', $adminId)
            ->where('attendance_date', $today)
            ->first();

        if ($todayShift) {
            if ($todayShift->checkout_status === 'pending') {
                return response()->json(['success' => true, 'state' => 'working', 'data' => $todayShift]);
            }
            return response()->json(['success' => true, 'state' => 'completed', 'data' => $todayShift]);
        }

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

    public function checkIn(Request $request)
    {
        try {
            $this->validateQrToken($request);
            $adminId = $request->user()->id;
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }

        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        if (AdminAttendance::where('admin_id', $adminId)->where('attendance_date', $today)->exists()) {
            return response()->json(['success' => false, 'message' => 'Bạn đã check-in hôm nay rồi.'], 400);
        }

        $workShift = null;
        $exception = ShiftException::where('admin_id', $adminId)->where('date', $today)->first();

        if ($exception) {
            if ($exception->type === 'leave') {
                return response()->json(['success' => false, 'message' => 'Hôm nay bạn đang trong lịch nghỉ phép được duyệt. Không thể điểm danh.'], 403);
            }
            if (in_array($exception->type, ['extra_shift', 'change_shift'])) {
                $workShift = $exception->workShift;
            }
        } 
        
        if (!$workShift) {
            $assignment = AdminShiftAssignment::where('admin_id', $adminId)->active($today)->first();
            if (!$assignment) {
                return response()->json(['success' => false, 'message' => 'Bạn chưa được phân ca làm việc.'], 403);
            }

            $workShift = $assignment->workShift;
            $weekdayIndex = $now->dayOfWeekIso - 1; 

            if (!is_array($workShift->working_days) || empty($workShift->working_days[$weekdayIndex])) {
                return response()->json(['success' => false, 'message' => 'Hôm nay không phải là ngày làm việc theo lịch của bạn.'], 403);
            }
        }

        $lateMinutes = 0;
        $status = 'present';

        if ($workShift && $workShift->start_time) {
            try {
                $scheduledStart = Carbon::parse($today . ' ' . $workShift->start_time);
                $diff = $scheduledStart->diffInMinutes($now, false); 
                
                $tolerance = intval($workShift->late_tolerance ?? 0);
                
                if ($diff > $tolerance) {
                    $lateMinutes = max(0, $diff - $tolerance);
                    $status = 'late';
                }
            } catch (\Exception $ex) {}
        }

        DB::beginTransaction();
        try {
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
                'early_leave_minutes' => 0,
                'is_ot_approved' => false,
                'ot_minutes' => 0
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Check-in thành công!', 'data' => $attendance]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lưu dữ liệu: ' . $e->getMessage()], 500);
        }
    }

    public function checkOut(Request $request)
    {
        try {
            $this->validateQrToken($request);
            $adminId = $request->user()->id;
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }

        $now = Carbon::now();
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

        $earlyLeaveMinutes = 0;
        $otMinutes = 0;
        $isOtApproved = false;

        $attendanceDateStr = Carbon::parse($shift->attendance_date)->format('Y-m-d');

        if ($shift->shift_end_time) {
            $shiftEnd = Carbon::parse($attendanceDateStr . ' ' . $shift->shift_end_time);
            
            if ($shift->shift_start_time && $shift->shift_end_time <= $shift->shift_start_time) {
                $shiftEnd->addDay();
            }

            if ($now->lessThan($shiftEnd)) {
                $earlyLeaveMinutes = $shiftEnd->diffInMinutes($now);
            } elseif ($now->greaterThan($shiftEnd)) {
                $rawOtMinutes = (int) $shiftEnd->diffInMinutes($now);
                
                $otRequest = OvertimeRequest::where('admin_id', $adminId)
                    ->where('date', $attendanceDateStr)
                    ->where('status', 'approved')
                    ->first();

                if ($otRequest) {
                    $isOtApproved = true;
                    // FIX BUG: Xử lý khoảng thời gian OT có thể vắt qua nửa đêm
                    $otStart = Carbon::parse($attendanceDateStr . ' ' . $otRequest->start_time);
                    $otEnd = Carbon::parse($attendanceDateStr . ' ' . $otRequest->end_time);

                    if ($otEnd->lessThan($otStart)) {
                        $otEnd->addDay();
                    }

                    $requestedOtMinutes = $otStart->diffInMinutes($otEnd);
                    $otMinutes = min($rawOtMinutes, $requestedOtMinutes);
                } else {
                    $otMinutes = $rawOtMinutes;
                    $isOtApproved = false;
                }
            }
        } elseif ($shift->workShift) {
            $shiftStart = Carbon::parse($attendanceDateStr . ' ' . $shift->workShift->start_time);
            $shiftEnd = Carbon::parse($attendanceDateStr . ' ' . $shift->workShift->end_time);
            
            if ($shift->workShift->end_time <= $shift->workShift->start_time) {
                $shiftEnd->addDay();
            }

            if ($now->lessThan($shiftEnd)) {
                $earlyLeaveMinutes = $shiftEnd->diffInMinutes($now);
            }
        }

        DB::beginTransaction();
        try {
            $shift->update([
                'clock_out' => $now,
                'checkout_status' => 'completed',
                'early_leave_minutes' => $earlyLeaveMinutes,
                'ot_minutes' => $otMinutes,
                'is_ot_approved' => $isOtApproved
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Check-out thành công!', 'data' => $shift]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lưu dữ liệu: ' . $e->getMessage()], 500);
        }
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
        
        $assignments = AdminShiftAssignment::where('admin_id', $adminId);
        if ($request->has('start_date') && $request->has('end_date')) {
            $start = $request->start_date;
            $end = $request->end_date;
            $assignments->where('valid_from', '<=', $end)
                        ->where(function($q) use ($start) {
                            $q->whereNull('valid_to')->orWhere('valid_to', '>=', $start);
                        });
        }
        $assignmentsData = $assignments->with('workShift')->get();
                                
        return response()->json(['success' => true, 'data' => $attendances, 'assignments' => $assignmentsData]);
    }

    public function history(Request $request, $adminId)
    {
        $query = AdminAttendance::with('workShift')->where('admin_id', $adminId);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('attendance_date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->orderBy('attendance_date', 'asc')->paginate($request->per_page ?? 50);

        $assignments = AdminShiftAssignment::where('admin_id', $adminId);
        if ($request->has('start_date') && $request->has('end_date')) {
            $start = $request->start_date;
            $end = $request->end_date;
            $assignments->where('valid_from', '<=', $end)
                        ->where(function($q) use ($start) {
                            $q->whereNull('valid_to')->orWhere('valid_to', '>=', $start);
                        });
        }
        $assignmentsData = $assignments->with('workShift')->get();

        return response()->json(['success' => true, 'data' => $attendances, 'assignments' => $assignmentsData]);
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

        if ($roleId !== 'all') {
            $query->where('role_id', $roleId);
        }

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

        $adminQuery = Admin::query();
        if ($roleId !== 'all') {
            $adminQuery->where('role_id', $roleId);
        }
        $admins = $adminQuery->get();
        $adminIds = $admins->pluck('id')->toArray();

        $attendanceQuery = AdminAttendance::whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])
            ->whereIn('admin_id', $adminIds);
            
        if ($workShiftId !== 'all') {
            $attendanceQuery->where('work_shift_id', $workShiftId);
        }
        
        $attendances = $attendanceQuery->get();
        $attendanceByDate = $attendances->groupBy(function ($item) {
            return Carbon::parse($item->attendance_date)->format('Y-m-d');
        });

        $summary = [];
        $totalDays = $start->daysInMonth;

        for ($day = 1; $day <= $totalDays; $day++) {
            $date = Carbon::create($year, $month, $day);
            $dateString = $date->format('Y-m-d');
            $weekdayIndex = $date->dayOfWeek === 0 ? 6 : $date->dayOfWeek - 1; 
            $isFuture = $date->isAfter($today);

            $assignmentQuery = AdminShiftAssignment::whereIn('admin_id', $adminIds)
                ->active($dateString)
                ->with('workShift');
                
            if ($workShiftId !== 'all') {
                $assignmentQuery->where('work_shift_id', $workShiftId);
            }
            $activeAssignments = $assignmentQuery->get();

            $scheduledAdminIds = collect();
            foreach ($activeAssignments as $assignment) {
                $shift = $assignment->workShift;
                if ($shift && is_array($shift->working_days)) {
                    if (isset($shift->working_days[$weekdayIndex]) && $shift->working_days[$weekdayIndex]) {
                        $scheduledAdminIds->push($assignment->admin_id);
                    }
                }
            }

            $attendanceOnDate = $attendanceByDate->get($dateString, collect());
            $attendanceAdminIds = $attendanceOnDate->pluck('admin_id')->unique();

            if ($isFuture) {
                $totalTracked = $scheduledAdminIds->unique()->count();
                $present = 0;
                $late = 0;
                $absent = 0;
            } else {
                $totalTracked = $scheduledAdminIds->merge($attendanceAdminIds)->unique()->count();
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