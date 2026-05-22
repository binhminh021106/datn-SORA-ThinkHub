<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BirthdayEmailLog;
use App\Models\Coupon;
use Carbon\Carbon;

class BirthdayVoucherController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $totalSent = BirthdayEmailLog::where('status', 'success')->count();
        $totalVouchers = Coupon::where('type', 'birthday')->count();
        $sentToday = BirthdayEmailLog::whereDate('sent_at', $today)->where('status', 'success')->count();

        $logs = BirthdayEmailLog::with(['user', 'coupon'])
            ->orderBy('sent_at', 'desc')
            ->paginate(15);

        return view('admin.birthday_vouchers.index', compact('totalSent', 'totalVouchers', 'sentToday', 'logs'));
    }
}
