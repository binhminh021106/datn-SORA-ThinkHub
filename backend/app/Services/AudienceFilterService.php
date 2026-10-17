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

        if (in_array('all', $targets)) {
            return $query->whereNotNull('email')->get();
        }
        $query->where(function (Builder $q) use ($targets) {
            
            if (in_array('male', $targets)) {
                $q->orWhere('gender', 'male')
                  ->orWhere('gender', 'nam'); 
            }
            if (in_array('female', $targets)) {
                $q->orWhere('gender', 'female')
                  ->orWhere('gender', 'nữ'); 
            }

            if (in_array('member', $targets)) {
                $q->orWhereNotNull('tier_id');
            }

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

        $query->whereNotNull('email');

        return $query->get();
    }
}