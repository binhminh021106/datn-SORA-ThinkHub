<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AudienceFilterService
{
    /**
     * Quét danh sách người dùng dựa trên mảng đối tượng nhận
     *
     * @param array $targets Mảng chứa các giá trị: ['all', 'male', 'female', 'member', 'silver', 'gold', 'diamond']
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTargetedUsers(array $targets)
    {
        $query = User::query();

        // 1. Nếu có 'all' (Tất cả) -> Bỏ qua các filter khác, lấy toàn bộ user (có email hợp lệ)
        if (in_array('all', $targets)) {
            return $query->whereNotNull('email')->get();
        }

        // 2. Gom nhóm điều kiện logic (OR)
        $query->where(function (Builder $q) use ($targets) {
            
            // --- Nhóm Giới tính ---
            if (in_array('male', $targets)) {
                $q->orWhere('gender', 'male')
                  ->orWhere('gender', 'nam'); // Hỗ trợ cả tiếng việt nếu DB lưu tiếng việt
            }
            if (in_array('female', $targets)) {
                $q->orWhere('gender', 'female')
                  ->orWhere('gender', 'nữ'); 
            }

            // --- Nhóm Thành viên (Đã có hạng / tier_id không rỗng) ---
            if (in_array('member', $targets)) {
                $q->orWhereNotNull('tier_id');
            }

            // --- Nhóm Hạng cụ thể ---
            $selectedTiers = array_intersect($targets, ['silver', 'gold', 'diamond']);
            
            if (!empty($selectedTiers)) {
                $q->orWhereHas('tier', function (Builder $tierQuery) use ($selectedTiers) {
                    $tierQuery->where(function ($subQ) use ($selectedTiers) {
                        
                        if (in_array('silver', $selectedTiers)) {
                            $subQ->orWhere('name', 'LIKE', '%Bạc%')
                                 ->orWhere('name', 'LIKE', '%Silver%');
                        }
                        if (in_array('gold', $selectedTiers)) {
                            $subQ->orWhere('name', 'LIKE', '%Vàng%')
                                 ->orWhere('name', 'LIKE', '%Gold%');
                        }
                        if (in_array('diamond', $selectedTiers)) {
                            $subQ->orWhere('name', 'LIKE', '%Kim cương%')
                                 ->orWhere('name', 'LIKE', '%Diamond%');
                        }

                    });
                });
            }
        });

        // Đảm bảo user phải có email để gửi
        $query->whereNotNull('email');

        return $query->get();
    }
}