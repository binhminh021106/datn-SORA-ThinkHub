<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\BirthdayVoucherController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/shop', function () {
    return redirect()->away(rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/') . '/shop');
})->name('shop.index');

Route::prefix('admin')->group(function () {
    Route::get('/birthday-vouchers', [BirthdayVoucherController::class, 'index'])->name('admin.birthday_vouchers.index');
});
