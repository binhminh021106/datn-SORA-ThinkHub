<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminFaceRecognition\DestroyFaceProfileRequest;
use App\Http\Requests\AdminFaceRecognition\FaceAttendanceRequest;
use App\Http\Requests\AdminFaceRecognition\FaceProfileRequest;
use App\Http\Requests\AdminFaceRecognition\StoreFaceProfileRequest;
use App\Http\Requests\AdminFaceRecognition\VerifyFaceRequest;
use App\Models\Admin;
use App\Models\AdminAttendance;
use App\Models\AdminFaceProfile;
use App\Models\AdminShiftAssignment;
use App\Models\FaceVerificationLog;
use App\Models\OvertimeRequest;
use App\Models\ShiftException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminFaceRecognitionController extends Controller
{
    private const DEFAULT_THRESHOLD = 0.48;

    public function admins()
    {
        $admins = Admin::query()
            ->with('role')
            ->with('faceProfile')
            ->whereNull('deleted_at')
            ->orderBy('fullname')
            ->get(['id', 'fullname', 'email', 'avatar_url', 'role_id']);

        return response()->json([
            'success' => true,
            'data' => $admins->map(fn ($admin) => [
                'id' => $admin->id,
                'fullname' => $admin->fullname,
                'email' => $admin->email,
                'avatar_url' => $admin->avatar_url,
                'role' => $admin->role,
                'face_profile' => $admin->faceProfile ? [
                    'sample_count' => $admin->faceProfile->sample_count,
                    'last_verified_at' => $admin->faceProfile->last_verified_at,
                    'registered_at' => $admin->faceProfile->registered_at,
                ] : null,
            ]),
        ]);
    }

    public function profile(FaceProfileRequest $request)
    {
        $data = $request->validated();

        $adminId = $data['admin_id'] ?? $request->user()->id;
        $profile = AdminFaceProfile::where('admin_id', $adminId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'admin_id' => $adminId,
                'has_profile' => (bool) $profile,
                'sample_count' => $profile?->sample_count ?? 0,
                'model_name' => $profile?->model_name,
                'model_version' => $profile?->model_version,
                'registered_at' => $profile?->registered_at,
                'last_verified_at' => $profile?->last_verified_at,
            ],
        ]);
    }

    public function register(StoreFaceProfileRequest $request)
    {
        $data = $request->validated();

        $targetAdmin = Admin::findOrFail($data['admin_id']);
        $descriptor = $this->normalizeDescriptor($data['descriptor']);
        $profile = AdminFaceProfile::firstOrNew(['admin_id' => $targetAdmin->id]);
        $descriptors = $profile->exists && is_array($profile->face_descriptors)
            ? $profile->face_descriptors
            : [];

        $descriptors[] = $descriptor;
        $descriptors = array_slice($descriptors, -5);

        $profile->fill([
            'face_descriptors' => $descriptors,
            'sample_count' => count($descriptors),
            'model_name' => $data['model_name'] ?? 'face-api.js',
            'model_version' => $data['model_version'] ?? null,
            'is_active' => true,
            'registered_at' => $profile->registered_at ?: Carbon::now(),
        ]);
        $profile->save();

        FaceVerificationLog::create([
            'admin_id' => $targetAdmin->id,
            'action' => 'register',
            'is_matched' => true,
            'threshold' => self::DEFAULT_THRESHOLD,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'note' => 'Face sample registered by admin #' . $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu mẫu khuôn mặt cho ' . $targetAdmin->fullname . '.',
            'data' => [
                'admin' => $targetAdmin->only(['id', 'fullname', 'email', 'avatar_url']),
                'sample_count' => $profile->sample_count,
                'registered_at' => $profile->registered_at,
            ],
        ]);
    }

    public function verify(VerifyFaceRequest $request)
    {
        $data = $request->validated();

        $queryDescriptor = $this->normalizeDescriptor($data['descriptor']);
        $threshold = isset($data['threshold']) ? (float) $data['threshold'] : self::DEFAULT_THRESHOLD;
        $match = $this->matchDescriptor($queryDescriptor, $threshold);
        $bestProfile = $match['best_profile'];
        $bestDistance = $match['best_distance'];
        $isMatched = $match['is_matched'];

        if ($isMatched) {
            $bestProfile->update(['last_verified_at' => Carbon::now()]);
        }

        FaceVerificationLog::create([
            'admin_id' => $isMatched ? $bestProfile->admin_id : $request->user()->id,
            'action' => 'test',
            'is_matched' => $isMatched,
            'face_distance' => $bestDistance,
            'threshold' => $threshold,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'note' => $isMatched ? 'Matched admin #' . $bestProfile->admin_id : 'No matched face profile',
        ]);

        return response()->json([
            'success' => true,
            'message' => $isMatched ? 'Nhận diện khuôn mặt thành công.' : 'Chưa tìm thấy khuôn mặt phù hợp.',
            'data' => [
                'is_matched' => $isMatched,
                'distance' => $bestDistance,
                'threshold' => $threshold,
                'matched_admin' => $isMatched ? $bestProfile->admin : null,
                'nearest_admin' => $bestProfile?->admin,
                'candidates' => $match['candidates'],
            ],
        ]);
    }

    public function destroyProfile(DestroyFaceProfileRequest $request, int $adminId)
    {
        $targetAdmin = Admin::whereNull('deleted_at')->findOrFail($adminId);
        $deleted = AdminFaceProfile::where('admin_id', $targetAdmin->id)->delete();

        FaceVerificationLog::create([
            'admin_id' => $targetAdmin->id,
            'action' => 'reset',
            'is_matched' => false,
            'threshold' => self::DEFAULT_THRESHOLD,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'note' => 'Face profile reset by admin #' . $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $deleted
                ? 'Đã xóa hồ sơ khuôn mặt của ' . $targetAdmin->fullname . '.'
                : 'Nhân sự này chưa có hồ sơ khuôn mặt để xóa.',
            'data' => [
                'admin' => $targetAdmin->only(['id', 'fullname', 'email', 'avatar_url']),
                'deleted' => (bool) $deleted,
            ],
        ]);
    }

    public function attendance(FaceAttendanceRequest $request)
    {
        $data = $request->validated();

        $queryDescriptor = $this->normalizeDescriptor($data['descriptor']);
        $threshold = isset($data['threshold']) ? (float) $data['threshold'] : self::DEFAULT_THRESHOLD;
        $match = $this->matchDescriptor($queryDescriptor, $threshold);
        $bestProfile = $match['best_profile'];
        $bestDistance = $match['best_distance'];

        if (!$match['is_matched']) {
            FaceVerificationLog::create([
                'admin_id' => $request->user()->id,
                'action' => 'attendance',
                'is_matched' => false,
                'face_distance' => $bestDistance,
                'threshold' => $threshold,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'note' => 'Face attendance rejected: no matched profile',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Chưa tìm thấy khuôn mặt phù hợp trong hệ thống.',
                'data' => [
                    'is_matched' => false,
                    'distance' => $bestDistance,
                    'threshold' => $threshold,
                    'matched_admin' => null,
                    'nearest_admin' => $bestProfile?->admin,
                    'candidates' => $match['candidates'],
                ],
            ]);
        }

        $admin = $bestProfile->admin;
        $bestProfile->update(['last_verified_at' => Carbon::now()]);

        $openShift = $this->findOpenShift($admin->id);
        if ($openShift) {
            if (empty($data['confirm_checkout'])) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cần xác nhận tan ca cho ' . $admin->fullname . '.',
                    'data' => $this->attendancePayload($match, [
                        'requires_confirmation' => true,
                        'action' => 'check_out',
                        'attendance' => $openShift,
                    ]),
                ]);
            }

            return $this->faceCheckOut($request, $admin, $openShift, $bestDistance, $threshold, $match);
        }

        return $this->faceCheckIn($request, $admin, $bestDistance, $threshold, $match);
    }

    private function faceCheckIn(Request $request, Admin $admin, float $distance, float $threshold, array $match)
    {
        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        if (AdminAttendance::where('admin_id', $admin->id)->where('attendance_date', $today)->exists()) {
            return response()->json([
                'success' => false,
                'message' => $admin->fullname . ' đã có bản ghi chấm công hôm nay.',
                'data' => $this->attendancePayload($match, ['action' => 'blocked']),
            ], 400);
        }

        $workShift = $this->resolveWorkShiftForCheckIn($admin->id, $today, $now);
        if ($workShift['error']) {
            FaceVerificationLog::create([
                'admin_id' => $admin->id,
                'action' => 'attendance',
                'is_matched' => true,
                'face_distance' => $distance,
                'threshold' => $threshold,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'note' => 'Face attendance matched but not recorded: ' . $workShift['message'],
            ]);

            return response()->json([
                'success' => false,
                'message' => $workShift['message'],
                'data' => $this->attendancePayload($match, ['action' => 'blocked']),
            ], 403);
        }

        $shift = $workShift['shift'];
        $lateMinutes = 0;
        $status = 'present';

        if ($shift && $shift->start_time) {
            try {
                $scheduledStart = Carbon::parse($today . ' ' . $shift->start_time);
                $diff = $scheduledStart->diffInMinutes($now, false);
                $tolerance = (int) ($shift->late_tolerance ?? 0);

                if ($diff > $tolerance) {
                    $lateMinutes = max(0, $diff - $tolerance);
                    $status = 'late';
                }
            } catch (\Exception $ex) {
                // Keep attendance available if shift time parsing fails.
            }
        }

        DB::beginTransaction();
        try {
            $attendance = AdminAttendance::create([
                'admin_id' => $admin->id,
                'work_shift_id' => $shift ? $shift->id : null,
                'shift_start_time' => $shift ? $shift->start_time : null,
                'shift_end_time' => $shift ? $shift->end_time : null,
                'shift_late_tolerance' => $shift ? ($shift->late_tolerance ?? 0) : 0,
                'attendance_date' => $today,
                'clock_in' => $now,
                'check_in_method' => 'face',
                'check_in_face_distance' => $distance,
                'status' => $status,
                'late_minutes' => $lateMinutes,
                'checkout_status' => 'pending',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'early_leave_minutes' => 0,
                'is_ot_approved' => false,
                'ot_minutes' => 0,
            ]);

            FaceVerificationLog::create([
                'admin_id' => $admin->id,
                'attendance_id' => $attendance->id,
                'action' => 'attendance',
                'is_matched' => true,
                'face_distance' => $distance,
                'threshold' => $threshold,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'note' => 'Face check-in recorded',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Check-in bằng khuôn mặt thành công cho ' . $admin->fullname . '.',
                'data' => $this->attendancePayload($match, [
                    'action' => 'check_in',
                    'attendance' => $attendance,
                ]),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lưu dữ liệu: ' . $e->getMessage()], 500);
        }
    }

    private function faceCheckOut(Request $request, Admin $admin, AdminAttendance $shift, float $distance, float $threshold, array $match)
    {
        $now = Carbon::now();
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
                $otRequest = OvertimeRequest::where('admin_id', $admin->id)
                    ->where('date', $attendanceDateStr)
                    ->where('status', 'approved')
                    ->first();

                if ($otRequest) {
                    $isOtApproved = true;
                    $otStart = Carbon::parse($attendanceDateStr . ' ' . $otRequest->start_time);
                    $otEnd = Carbon::parse($attendanceDateStr . ' ' . $otRequest->end_time);

                    if ($otEnd->lessThan($otStart)) {
                        $otEnd->addDay();
                    }

                    $otMinutes = min($rawOtMinutes, $otStart->diffInMinutes($otEnd));
                } else {
                    $otMinutes = $rawOtMinutes;
                }
            }
        } elseif ($shift->workShift) {
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
                'check_out_method' => 'face',
                'check_out_face_distance' => $distance,
                'checkout_status' => 'completed',
                'early_leave_minutes' => $earlyLeaveMinutes,
                'ot_minutes' => $otMinutes,
                'is_ot_approved' => $isOtApproved,
            ]);

            FaceVerificationLog::create([
                'admin_id' => $admin->id,
                'attendance_id' => $shift->id,
                'action' => 'attendance',
                'is_matched' => true,
                'face_distance' => $distance,
                'threshold' => $threshold,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'note' => 'Face check-out recorded',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Check-out bằng khuôn mặt thành công cho ' . $admin->fullname . '.',
                'data' => $this->attendancePayload($match, [
                    'action' => 'check_out',
                    'attendance' => $shift->fresh(),
                ]),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lưu dữ liệu: ' . $e->getMessage()], 500);
        }
    }

    private function resolveWorkShiftForCheckIn(int $adminId, string $today, Carbon $now): array
    {
        $workShift = null;
        $exception = ShiftException::where('admin_id', $adminId)->where('date', $today)->first();

        if ($exception) {
            if ($exception->type === 'leave') {
                return [
                    'shift' => null,
                    'error' => true,
                    'message' => 'Nhân sự đang trong lịch nghỉ phép được duyệt, không ghi nhận chấm công khuôn mặt.',
                ];
            }

            if (in_array($exception->type, ['extra_shift', 'change_shift'], true)) {
                $workShift = $exception->workShift;
            }
        }

        if (!$workShift) {
            $assignment = AdminShiftAssignment::where('admin_id', $adminId)->active($today)->first();
            if (!$assignment) {
                return [
                    'shift' => null,
                    'error' => true,
                    'message' => 'Nhân sự chưa có ca làm hôm nay, không ghi nhận chấm công khuôn mặt.',
                ];
            }

            $workShift = $assignment->workShift;
            $weekdayIndex = $now->dayOfWeek;

            if (!is_array($workShift->working_days) || empty($workShift->working_days[$weekdayIndex])) {
                return [
                    'shift' => null,
                    'error' => true,
                    'message' => 'Hôm nay không phải ngày làm việc theo lịch của nhân sự, không ghi nhận chấm công khuôn mặt.',
                ];
            }
        }

        return ['shift' => $workShift, 'error' => false, 'message' => null];
    }

    private function findOpenShift(int $adminId): ?AdminAttendance
    {
        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        return AdminAttendance::with('workShift')
            ->where('admin_id', $adminId)
            ->where('checkout_status', 'pending')
            ->where(function ($query) use ($today, $yesterday) {
                $query->where('attendance_date', $today)
                    ->orWhere('attendance_date', $yesterday);
            })
            ->orderByDesc('attendance_date')
            ->first();
    }

    private function attendancePayload(array $match, array $extra = []): array
    {
        return array_merge([
            'is_matched' => $match['is_matched'],
            'distance' => $match['best_distance'],
            'threshold' => $match['threshold'],
            'matched_admin' => $match['is_matched'] ? $match['best_profile']->admin : null,
            'nearest_admin' => $match['best_profile']?->admin,
            'candidates' => $match['candidates'],
            'requires_confirmation' => false,
        ], $extra);
    }

    private function matchDescriptor(array $queryDescriptor, float $threshold): array
    {
        $profiles = AdminFaceProfile::with('admin:id,fullname,email,avatar_url')
            ->where('is_active', true)
            ->get();

        $bestProfile = null;
        $bestDistance = null;
        $candidatesByAdmin = [];

        foreach ($profiles as $profile) {
            foreach (($profile->face_descriptors ?? []) as $knownDescriptor) {
                if (!is_array($knownDescriptor) || count($knownDescriptor) !== 128) {
                    continue;
                }

                $distance = $this->distance($queryDescriptor, $this->normalizeDescriptor($knownDescriptor));

                if ($bestDistance === null || $distance < $bestDistance) {
                    $bestDistance = $distance;
                    $bestProfile = $profile;
                }

                $candidateKey = (string) $profile->admin_id;
                if (!isset($candidatesByAdmin[$candidateKey]) || $distance < $candidatesByAdmin[$candidateKey]['distance']) {
                    $candidatesByAdmin[$candidateKey] = [
                        'admin' => $profile->admin,
                        'distance' => $distance,
                    ];
                }
            }
        }

        $candidates = array_values($candidatesByAdmin);
        usort($candidates, fn ($a, $b) => $a['distance'] <=> $b['distance']);

        return [
            'best_profile' => $bestProfile,
            'best_distance' => $bestDistance,
            'is_matched' => $bestProfile && $bestDistance !== null && $bestDistance <= $threshold,
            'threshold' => $threshold,
            'candidates' => array_slice($candidates, 0, 5),
        ];
    }

    private function normalizeDescriptor(array $descriptor): array
    {
        return array_map(static fn ($value) => (float) $value, array_values($descriptor));
    }

    private function distance(array $a, array $b): float
    {
        $sum = 0.0;

        for ($i = 0; $i < 128; $i++) {
            $diff = $a[$i] - $b[$i];
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }
}
