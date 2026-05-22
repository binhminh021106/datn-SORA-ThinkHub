<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\BirthdayVoucherController;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->group(function () {
    Route::get('/birthday-vouchers', [BirthdayVoucherController::class, 'index'])->name('admin.birthday_vouchers.index');
});
