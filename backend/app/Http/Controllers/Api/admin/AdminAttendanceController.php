<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminAttendance\AttendanceAdjustmentRequest;
use App\Http\Requests\AdminAttendance\QrAttendanceRequest;
use App\Models\AdminAttendanceAdjustment;
use App\Models\AdminAttendance;
use App\Models\AdminShiftAssignment;
use App\Models\WorkShift;
use App\Models\ShiftException;
use App\Models\OvertimeRequest;
use App\Models\Admin;
use App\Models\Role;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;
use Illuminate\Contracts\Encryption\DecryptException;
use Throwable;

class AdminAttendanceController extends Controller
{
    private function denyUnlessSuperAdmin(Request $request)
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để thực hiện thao tác này.'], 401);
        }

        $admin->loadMissing('role');
        $roleLevel = (int) ($admin->role?->level ?? 0);

        if ((int) $admin->role_id !== 1 && $roleLevel !== 1) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền truy cập trạm phát mã chấm công.'], 403);
        }

        return null;
    }

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
        if ($response = $this->denyUnlessSuperAdmin($request)) {
            return $response;
        }

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

        $todayShift = AdminAttendance::where('admin_id', $adminId)
            ->where('attendance_date', $today)
            ->first();

        if ($todayShift) {
            if ($todayShift->checkout_status === 'pending') {
                return response()->json(['success' => true, 'state' => 'working', 'data' => $todayShift]);
            }
            return response()->json(['success' => true, 'state' => 'completed', 'data' => $todayShift]);
        }

        $openShift = $this->findActionableOpenShift($adminId);
        if ($openShift) {
            return response()->json(['success' => true, 'state' => 'working', 'data' => $openShift]);
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

    public function checkIn(QrAttendanceRequest $request)
    {
        try {
            $this->validateQrToken($request);
            $adminId = $request->user()->id;
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }

        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        try {
            return DB::transaction(function () use ($request, $adminId, $today, $now) {
                Admin::whereKey($adminId)->lockForUpdate()->firstOrFail();

                if (AdminAttendance::where('admin_id', $adminId)->where('attendance_date', $today)->exists()) {
                    return response()->json(['success' => false, 'message' => 'Bạn đã check-in hôm nay rồi.'], 409);
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
                    $weekdayIndex = $now->dayOfWeek;

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
                    } catch (\Exception $ex) {
                    }
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
                    'early_leave_minutes' => 0,
                    'is_ot_approved' => false,
                    'ot_minutes' => 0
                ]);

                return response()->json(['success' => true, 'message' => 'Check-in thành công!', 'data' => $attendance]);
            });
        } catch (QueryException $e) {
            if ($this->isUniqueConstraintViolation($e)) {
                return response()->json(['success' => false, 'message' => 'Bạn đã check-in hôm nay rồi.'], 409);
            }

            report($e);
        } catch (Throwable $e) {
            report($e);
        }

        return response()->json(['success' => false, 'message' => 'Không thể lưu dữ liệu lúc này.'], 500);
    }

    public function checkOut(QrAttendanceRequest $request)
    {
        try {
            $this->validateQrToken($request);
            $adminId = $request->user()->id;
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }

        try {
            return DB::transaction(function () use ($adminId) {
                $now = Carbon::now();
                $shift = $this->findActionableOpenShift($adminId, true);

                if (!$shift) {
                    return response()->json(['success' => false, 'message' => 'Không tìm thấy ca làm việc đang mở.'], 409);
                }

                [$earlyLeaveMinutes, $otMinutes, $isOtApproved] = $this->calculateCheckoutMetrics($shift, $adminId, $now);

                $shift->update([
                    'clock_out' => $now,
                    'checkout_status' => 'completed',
                    'early_leave_minutes' => $earlyLeaveMinutes,
                    'ot_minutes' => $otMinutes,
                    'is_ot_approved' => $isOtApproved
                ]);

                return response()->json(['success' => true, 'message' => 'Check-out thành công!', 'data' => $shift]);
            });
        } catch (Throwable $e) {
            report($e);
        }

        return response()->json(['success' => false, 'message' => 'Không thể lưu dữ liệu lúc này.'], 500);
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

    public function adjustmentHistory(Request $request)
    {
        if (!Schema::hasTable('admin_attendance_adjustments')) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = AdminAttendanceAdjustment::with([
                'admin:id,fullname,email,phone',
                'adjustedBy:id,fullname,email',
                'workShift:id,name,start_time,end_time',
            ])
            ->orderByDesc('created_at');

        if ($request->filled('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('attendance_date', $request->date);
        } elseif ($startDate && $endDate) {
            $query->whereBetween('attendance_date', [$startDate, $endDate]);
        }

        return response()->json([
            'success' => true,
            'data' => $query->limit((int) $request->get('limit', 30))->get(),
        ]);
    }

    public function adjustAttendance(AttendanceAdjustmentRequest $request)
    {
        $actor = $request->user();
        $actor->loadMissing('role');

        $validated = $request->validated();
        $attendanceDate = Carbon::parse($validated['attendance_date'])->startOfDay();

        if ($attendanceDate->diffInDays(Carbon::today()) > 7 && !$this->isLevelOneAdmin($actor)) {
            return response()->json([
                'success' => false,
                'message' => 'Chi tai khoan cap 1 moi duoc dieu chinh ngay cong qua 7 ngay.',
            ], 403);
        }

        $hasClockInInput = $request->filled('clock_in');
        $hasClockOutInput = $request->filled('clock_out');
        $hasShiftInput = $request->filled('work_shift_id');

        if (!$hasClockInInput && !$hasClockOutInput && !$hasShiftInput) {
            return response()->json([
                'success' => false,
                'message' => 'Vui long nhap gio vao, gio ra hoac ca lam can dieu chinh.',
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $validated, $actor, $attendanceDate, $hasClockInInput, $hasClockOutInput) {
                $dateString = $attendanceDate->toDateString();
                Admin::whereKey($validated['admin_id'])->lockForUpdate()->firstOrFail();

                $attendance = AdminAttendance::with('workShift')
                    ->where('admin_id', $validated['admin_id'])
                    ->where('attendance_date', $dateString)
                    ->lockForUpdate()
                    ->first();

                if (!$attendance && !$hasClockInInput) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ban can nhap gio vao khi tao bo sung ngay cong moi.',
                    ], 422);
                }

                $workShift = $this->resolveAdjustmentWorkShift(
                    $validated['admin_id'],
                    $dateString,
                    $validated['work_shift_id'] ?? null,
                    $attendance
                );

                $oldSnapshot = $this->attendanceSnapshot($attendance);
                $newClockIn = $hasClockInInput
                    ? $this->combineAttendanceDateTime($dateString, $validated['clock_in'], false, null, $workShift)
                    : $attendance?->clock_in;

                $newClockOut = $hasClockOutInput
                    ? $this->combineAttendanceDateTime($dateString, $validated['clock_out'], true, $newClockIn, $workShift)
                    : $attendance?->clock_out;

                if ($attendance && $this->isNoOpAdjustment($attendance, $workShift, $newClockIn, $newClockOut)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Du lieu gio cong chua co thay doi nao de luu.',
                    ], 422);
                }

                [$status, $lateMinutes] = $this->calculateManualCheckInMetrics($newClockIn, $workShift, $dateString);
                [$earlyLeaveMinutes, $otMinutes, $isOtApproved] = $this->calculateManualCheckoutMetrics(
                    $workShift,
                    $dateString,
                    (int) $validated['admin_id'],
                    $newClockOut
                );

                $checkoutStatus = $newClockOut ? 'completed' : 'pending';
                $payload = [
                    'admin_id' => $validated['admin_id'],
                    'work_shift_id' => $workShift?->id,
                    'shift_start_time' => $workShift?->start_time,
                    'shift_end_time' => $workShift?->end_time,
                    'shift_late_tolerance' => $workShift?->late_tolerance ?? 0,
                    'attendance_date' => $dateString,
                    'clock_in' => $newClockIn,
                    'clock_out' => $newClockOut,
                    'status' => $status,
                    'checkout_status' => $checkoutStatus,
                    'late_minutes' => $lateMinutes,
                    'early_leave_minutes' => $earlyLeaveMinutes,
                    'ot_minutes' => $otMinutes,
                    'is_ot_approved' => $isOtApproved,
                    'note' => $validated['reason'],
                    'ip_address' => $request->ip(),
                    'user_agent' => 'manual-attendance-adjustment',
                    'check_in_method' => $hasClockInInput || !$attendance ? 'manual_adjustment' : $attendance->check_in_method,
                    'check_out_method' => $newClockOut && ($hasClockOutInput || !$attendance) ? 'manual_adjustment' : $attendance?->check_out_method,
                ];

                if ($attendance) {
                    $attendance->update($payload);
                } else {
                    $attendance = AdminAttendance::create($payload);
                }

                $newSnapshot = $this->attendanceSnapshot($attendance);
                $adjustment = AdminAttendanceAdjustment::create([
                    'attendance_id' => $attendance->id,
                    'admin_id' => $attendance->admin_id,
                    'adjusted_by_admin_id' => $actor->id,
                    'work_shift_id' => $attendance->work_shift_id,
                    'attendance_date' => $attendance->attendance_date,
                    'old_clock_in' => $oldSnapshot['clock_in'],
                    'new_clock_in' => $newSnapshot['clock_in'],
                    'old_clock_out' => $oldSnapshot['clock_out'],
                    'new_clock_out' => $newSnapshot['clock_out'],
                    'old_status' => $oldSnapshot['status'],
                    'new_status' => $newSnapshot['status'],
                    'old_checkout_status' => $oldSnapshot['checkout_status'],
                    'new_checkout_status' => $newSnapshot['checkout_status'],
                    'old_late_minutes' => $oldSnapshot['late_minutes'],
                    'new_late_minutes' => $newSnapshot['late_minutes'],
                    'old_early_leave_minutes' => $oldSnapshot['early_leave_minutes'],
                    'new_early_leave_minutes' => $newSnapshot['early_leave_minutes'],
                    'old_ot_minutes' => $oldSnapshot['ot_minutes'],
                    'new_ot_minutes' => $newSnapshot['ot_minutes'],
                    'old_is_ot_approved' => $oldSnapshot['is_ot_approved'],
                    'new_is_ot_approved' => $newSnapshot['is_ot_approved'],
                    'reason' => $validated['reason'],
                    'note' => $validated['note'] ?? null,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Dieu chinh gio cong thanh cong.',
                    'data' => $attendance->fresh(['admin:id,fullname,email,phone', 'workShift']),
                    'adjustment' => $adjustment->fresh(['admin:id,fullname,email,phone', 'adjustedBy:id,fullname,email', 'workShift']),
                ]);
            });
        } catch (QueryException $e) {
            if ($this->isUniqueConstraintViolation($e)) {
                return response()->json(['success' => false, 'message' => 'Nhan su nay da co ban ghi cong trong ngay duoc chon.'], 409);
            }

            report($e);
        } catch (Throwable $e) {
            report($e);
        }

        return response()->json(['success' => false, 'message' => 'Khong the dieu chinh gio cong luc nay.'], 500);
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

        $assignmentsQuery = AdminShiftAssignment::whereIn('admin_id', $adminIds)
            ->where(function ($q) use ($end) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', $end->toDateString());
            })
            ->where(function ($q) use ($start) {
                $q->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $start->toDateString());
            })
            ->with('workShift');

        if ($workShiftId !== 'all') {
            $assignmentsQuery->where('work_shift_id', $workShiftId);
        }

        $assignmentsInMonth = $assignmentsQuery->get();

        $summary = [];
        $totalDays = $start->daysInMonth;

        for ($day = 1; $day <= $totalDays; $day++) {
            $date = Carbon::create($year, $month, $day);
            $dateString = $date->format('Y-m-d');
            // FIX BUG: Đồng bộ với mảng index từ Frontend [0: CN, 1: T2, ..., 6: T7]
            $weekdayIndex = $date->dayOfWeek; 
            $isFuture = $date->isAfter($today);

            $activeAssignments = $assignmentsInMonth->filter(function ($assignment) use ($dateString) {
                $validFrom = $assignment->valid_from ? Carbon::parse($assignment->valid_from)->toDateString() : null;
                $validTo = $assignment->valid_to ? Carbon::parse($assignment->valid_to)->toDateString() : null;

                return (!$validFrom || $validFrom <= $dateString)
                    && (!$validTo || $validTo >= $dateString);
            });

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

    private function isLevelOneAdmin(Admin $admin): bool
    {
        $admin->loadMissing('role');

        return (int) $admin->role_id === 1 || (int) ($admin->role?->level ?? 0) === 1;
    }

    private function resolveAdjustmentWorkShift(int $adminId, string $date, ?int $workShiftId, ?AdminAttendance $attendance): ?WorkShift
    {
        if ($workShiftId) {
            return WorkShift::find($workShiftId);
        }

        if ($attendance?->workShift) {
            return $attendance->workShift;
        }

        if ($attendance?->work_shift_id) {
            return WorkShift::find($attendance->work_shift_id);
        }

        $assignment = AdminShiftAssignment::where('admin_id', $adminId)
            ->active($date)
            ->with('workShift')
            ->first();

        return $assignment?->workShift;
    }

    private function combineAttendanceDateTime(string $date, ?string $time, bool $isClockOut, ?Carbon $clockIn, ?WorkShift $workShift): ?Carbon
    {
        if (!$time) {
            return null;
        }

        $value = Carbon::parse($date . ' ' . $time);

        if (!$isClockOut) {
            return $value;
        }

        $startTime = $workShift?->start_time;
        $endTime = $workShift?->end_time;

        if ($startTime && $endTime && $endTime <= $startTime) {
            $value->addDay();
        } elseif ($clockIn && $value->lessThan($clockIn)) {
            $value->addDay();
        }

        return $value;
    }

    private function calculateManualCheckInMetrics(?Carbon $clockIn, ?WorkShift $workShift, string $date): array
    {
        if (!$clockIn) {
            return ['present', 0];
        }

        if (!$workShift || !$workShift->start_time) {
            return ['present', 0];
        }

        $scheduledStart = Carbon::parse($date . ' ' . $workShift->start_time);
        $diff = $scheduledStart->diffInMinutes($clockIn, false);
        $tolerance = (int) ($workShift->late_tolerance ?? 0);

        if ($diff > $tolerance) {
            return ['late', max(0, $diff - $tolerance)];
        }

        return ['present', 0];
    }

    private function calculateManualCheckoutMetrics(?WorkShift $workShift, string $date, int $adminId, ?Carbon $clockOut): array
    {
        if (!$clockOut || !$workShift) {
            return [0, 0, false];
        }

        $attendance = new AdminAttendance([
            'admin_id' => $adminId,
            'work_shift_id' => $workShift->id,
            'attendance_date' => $date,
            'shift_start_time' => $workShift->start_time,
            'shift_end_time' => $workShift->end_time,
            'shift_late_tolerance' => $workShift->late_tolerance ?? 0,
        ]);
        $attendance->setRelation('workShift', $workShift);

        return $this->calculateCheckoutMetrics($attendance, $adminId, $clockOut);
    }

    private function attendanceSnapshot(?AdminAttendance $attendance): array
    {
        return [
            'clock_in' => $attendance?->clock_in,
            'clock_out' => $attendance?->clock_out,
            'status' => $attendance?->status,
            'checkout_status' => $attendance?->checkout_status,
            'late_minutes' => (int) ($attendance?->late_minutes ?? 0),
            'early_leave_minutes' => (int) ($attendance?->early_leave_minutes ?? 0),
            'ot_minutes' => (int) ($attendance?->ot_minutes ?? 0),
            'is_ot_approved' => (bool) ($attendance?->is_ot_approved ?? false),
        ];
    }

    private function isNoOpAdjustment(AdminAttendance $attendance, ?WorkShift $workShift, ?Carbon $newClockIn, ?Carbon $newClockOut): bool
    {
        $sameShift = (int) ($attendance->work_shift_id ?? 0) === (int) ($workShift?->id ?? 0);

        return $sameShift
            && $this->sameNullableDateTime($attendance->clock_in, $newClockIn)
            && $this->sameNullableDateTime($attendance->clock_out, $newClockOut);
    }

    private function sameNullableDateTime($left, $right): bool
    {
        if (!$left && !$right) {
            return true;
        }

        if (!$left || !$right) {
            return false;
        }

        return Carbon::parse($left)->equalTo(Carbon::parse($right));
    }

    private function calculateCheckoutMetrics(AdminAttendance $shift, int $adminId, Carbon $now): array
    {
        $earlyLeaveMinutes = 0;
        $otMinutes = 0;
        $isOtApproved = false;
        $attendanceDateStr = Carbon::parse($shift->attendance_date)->format('Y-m-d');
        $shiftStartTime = $shift->shift_start_time ?: $shift->workShift?->start_time;
        $shiftEndTime = $shift->shift_end_time ?: $shift->workShift?->end_time;

        if (!$shiftEndTime) {
            return [$earlyLeaveMinutes, $otMinutes, $isOtApproved];
        }

        $shiftEnd = Carbon::parse($attendanceDateStr . ' ' . $shiftEndTime);
        if ($shiftStartTime && $shiftEndTime <= $shiftStartTime) {
            $shiftEnd->addDay();
        }

        if ($now->lessThan($shiftEnd)) {
            return [$shiftEnd->diffInMinutes($now), $otMinutes, $isOtApproved];
        }

        if (!$now->greaterThan($shiftEnd)) {
            return [$earlyLeaveMinutes, $otMinutes, $isOtApproved];
        }

        $rawOtMinutes = (int) $shiftEnd->diffInMinutes($now);
        $otRequest = OvertimeRequest::where('admin_id', $adminId)
            ->where('date', $attendanceDateStr)
            ->where('status', 'approved')
            ->first();

        if (!$otRequest) {
            return [$earlyLeaveMinutes, $rawOtMinutes, false];
        }

        $otStart = Carbon::parse($attendanceDateStr . ' ' . $otRequest->start_time);
        $otEnd = Carbon::parse($attendanceDateStr . ' ' . $otRequest->end_time);
        if ($otEnd->lessThan($otStart)) {
            $otEnd->addDay();
        }

        $effectiveOtStart = $shiftEnd->greaterThan($otStart) ? $shiftEnd->copy() : $otStart->copy();
        $effectiveOtEnd = $now->lessThan($otEnd) ? $now->copy() : $otEnd->copy();

        if ($effectiveOtEnd->greaterThan($effectiveOtStart)) {
            $isOtApproved = true;
            $otMinutes = $effectiveOtStart->diffInMinutes($effectiveOtEnd);
        }

        return [$earlyLeaveMinutes, $otMinutes, $isOtApproved];
    }

    private function findActionableOpenShift(int $adminId, bool $lock = false): ?AdminAttendance
    {
        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        $query = AdminAttendance::with('workShift')
            ->where('admin_id', $adminId)
            ->where('checkout_status', 'pending')
            ->whereIn('attendance_date', [$today, $yesterday])
            ->orderByDesc('attendance_date');

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->get()->first(function (AdminAttendance $attendance) use ($today, $yesterday) {
            $attendanceDate = Carbon::parse($attendance->attendance_date)->format('Y-m-d');

            if ($attendanceDate === $today) {
                return true;
            }

            return $attendanceDate === $yesterday && $this->isOvernightAttendance($attendance);
        });
    }

    private function isOvernightAttendance(AdminAttendance $attendance): bool
    {
        if ($attendance->workShift?->is_overnight) {
            return true;
        }

        $startTime = $attendance->shift_start_time ?: $attendance->workShift?->start_time;
        $endTime = $attendance->shift_end_time ?: $attendance->workShift?->end_time;

        return $startTime && $endTime && $endTime <= $startTime;
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        $sqlState = $exception->errorInfo[0] ?? (string) $exception->getCode();
        $driverCode = $exception->errorInfo[1] ?? null;
        $message = strtolower($exception->getMessage());

        return $driverCode === 1062
            || $sqlState === '23505'
            || (($sqlState === '23000' || $sqlState === '19') && str_contains($message, 'unique'))
            || str_contains($message, 'duplicate entry');
    }
}
