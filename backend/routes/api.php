<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers Admin
use App\Http\Controllers\Api\Client\ShopController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminAccountController;
use App\Http\Controllers\Api\Admin\AdminForgotPasswordController;
use App\Http\Controllers\Api\Admin\AdminProfileController;
use App\Http\Controllers\Api\Admin\AdminStaffController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminUserAddressController;
use App\Http\Controllers\Api\Admin\AdminRoleController;
use App\Http\Controllers\Api\Admin\AdminModulePermissionController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminAttributeController;
use App\Http\Controllers\Api\Admin\AdminAttributeValueController;
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\OrderSimulationController;
use App\Http\Controllers\Api\Admin\AdminMembershipTierController;
use App\Http\Controllers\Api\Admin\AdminComboController;
use App\Http\Controllers\Api\Admin\AdminCustomerGalleryController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminInventoryController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminContactController;
use App\Http\Controllers\Api\Admin\AdminNewController;
use App\Http\Controllers\Api\Admin\AdminAttendanceController;
use App\Http\Controllers\Api\Admin\AdminAffiliateController;
use App\Http\Controllers\Api\Admin\AdminFaceRecognitionController;
use App\Http\Controllers\Api\Admin\AdminWorkShiftController;
use App\Http\Controllers\Api\Admin\AdminNotificationController;
// Controllers Client
use App\Http\Controllers\Api\Client\ProductDetailController;
use App\Http\Controllers\Api\Client\ClientCartController;
use App\Http\Controllers\Api\Client\ClientOrderController;
use App\Http\Controllers\Api\Client\ClientHeaderController;
use App\Http\Controllers\Api\Client\ClientHomeController;
use App\Http\Controllers\Api\Client\ClientAffiliateController;
use App\Http\Controllers\Api\Client\ClientCompareController;
use App\Http\Controllers\Api\Client\ClientContactController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\GeoController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\Client\ClientFavouriteController;
use App\Http\Controllers\Api\Client\ClientProfileController;
use App\Http\Controllers\Api\Client\ChatbotController;
use App\Http\Controllers\Api\Client\ClientNewController;
use App\Http\Controllers\Api\Client\ClientSavedCouponController;
use App\Http\Controllers\Api\Client\ClientComboController;
use App\Http\Controllers\Api\Client\ClientCheckoutController;
use App\Http\Controllers\Api\Client\ClientPushTokenController;
use App\Http\Controllers\Api\Client\ClientNotificationController;
use App\Http\Controllers\Api\Client\ClientRecommendationController;
use App\Http\Controllers\Api\MessageController;

// gửi maill_kh
use App\Http\Controllers\Api\Admin\HolidayEventController;
use App\Http\Controllers\Api\Admin\EmailCampaignController;



Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    
    // SETTINGS API
    Route::middleware(['check.module:admin_settings'])->group(function () {
        Route::get('/settings/logos', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'getLogos']);
        Route::post('/settings/logos/upload', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'uploadLogo']);
        Route::post('/settings/logos/base64', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'getLogoBase64']);
        Route::delete('/settings/logos', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'deleteLogo']);
        Route::get('/settings', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'update']);
    });
    
    // THÊM: Bọc middleware check.module để kiểm tra quyền phân hệ
    Route::middleware(['check.module:admin_coupons'])->group(function () {
        
        // CRUD Quản lý ngày lễ
        Route::apiResource('holiday-events', HolidayEventController::class);

        // Xử lý gửi & Lịch sử
        Route::prefix('email-campaign')->group(function () {
            Route::get('/settings', [EmailCampaignController::class, 'settings']);
            Route::post('/settings', [EmailCampaignController::class, 'updateSettings']);
            Route::post('/trigger-birthday', [EmailCampaignController::class, 'triggerBirthday']);
            Route::post('/trigger-holiday', [EmailCampaignController::class, 'triggerHoliday']);
            Route::get('/recent-logs', [EmailCampaignController::class, 'recentLogs']);
            Route::delete('/recent-logs', [EmailCampaignController::class, 'clearLogs']);
        });
        
    });
    
});


Route::prefix('news')->group(function () {
    Route::get('/', [ClientNewController::class, 'index']);
    Route::get('/popular', [ClientNewController::class, 'popular']);
    Route::get('/{slug}', [ClientNewController::class, 'show']);
});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// ── MOBILE APP AUTH ROUTES ─────────────────────────────────────────────────────
use App\Http\Controllers\Api\Auth\MobileAuthController;

Route::prefix('mobile')->group(function () {
    Route::post('/register', [MobileAuthController::class, 'register']);
    Route::post('/login',    [MobileAuthController::class, 'login']);
    Route::post('/google-login', [MobileAuthController::class, 'googleLogin']);

    // Routes cần xác thực
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [MobileAuthController::class, 'logout']);
        Route::get('/me',      [MobileAuthController::class, 'me']);
    });
});


// CLIENT API ROUTES
Route::prefix('client')->group(function () {
    Route::get('/settings', [\App\Http\Controllers\Api\Admin\AdminSettingController::class, 'index']);
    // BỔ SUNG: AUTH & FORGOT PASSWORD (Client)
    Route::prefix('forgot-password')->group(function () {
        Route::post('/send-otp', [\App\Http\Controllers\Api\Auth\UserForgotPasswordController::class, 'sendOtp']);
        Route::post('/verify-otp', [\App\Http\Controllers\Api\Auth\UserForgotPasswordController::class, 'verifyOtp']);
        Route::post('/reset', [\App\Http\Controllers\Api\Auth\UserForgotPasswordController::class, 'resetPassword']);
    });


    // THÊM VÀO ĐÂY (trước hoặc sau các route khác đều được)
    Route::middleware('auth:sanctum')->prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'history']);
        Route::post('/', [MessageController::class, 'store']);
    });

    Route::prefix('geo')->group(function () {
        Route::get('autocomplete', [GeoController::class, 'autocomplete']);
        Route::get('reverse', [GeoController::class, 'reverse']);
        Route::get('geocode', [GeoController::class, 'geocode']);
    });

    Route::get('header-data', [ClientHeaderController::class, 'getMegaMenuData']);
    Route::get('search', [ClientHeaderController::class, 'search']);
    Route::get('/home-data', [ClientHomeController::class, 'index']);
    Route::get('/recommendations/personalized', [ClientRecommendationController::class, 'personalized']);

    // API Lấy Bảng Giá Vàng (Thêm mới)
    Route::get('/gold-prices', [ClientHomeController::class, 'goldPrices']);

    Route::post('/chatbot', [ChatbotController::class, 'chat']);

    Route::post('/contact', [ClientContactController::class, 'store']);

    // MODULE GIỎ HÀNG (Cart)
    Route::controller(ClientCartController::class)->prefix('cart')->group(function () {
        Route::post('/add-combo', 'addCombo');
        Route::post('/merge', 'mergeCart');
        Route::post('/clear', 'clear');
        Route::post('/apply-birthday-coupon', 'applyBirthdayCoupon'); // Thêm route này

        Route::get('/', 'index');
        Route::post('/', 'store');

        Route::put('/{cartItem}', 'update');
        Route::delete('/{cartItem}', 'destroy');
    });

    // Danh sách yêu thích (Favourites)
    Route::prefix('favourites')->group(function () {
        Route::get('/', [ClientFavouriteController::class, 'index']);
        Route::post('/toggle', [ClientFavouriteController::class, 'toggle']);
        Route::get('/check/{productId}', [ClientFavouriteController::class, 'check']);
    });

    Route::middleware('auth:sanctum')->prefix('saved-coupons')->group(function () {
        Route::get('/', [ClientSavedCouponController::class, 'index']);
        Route::post('/', [ClientSavedCouponController::class, 'store']);
        Route::delete('/{id}', [ClientSavedCouponController::class, 'destroy']);
    });

    // Hồ Sơ Cá Nhân (Profile)
    Route::middleware('auth:sanctum')->prefix('push-tokens')->group(function () {
        Route::post('/', [ClientPushTokenController::class, 'store']);
        Route::delete('/', [ClientPushTokenController::class, 'destroy']);
    });

    Route::middleware('auth:sanctum')->prefix('notifications')->group(function () {
        Route::get('/', [ClientNotificationController::class, 'index']);
        Route::put('/read-all', [ClientNotificationController::class, 'markAllAsRead']);
        Route::put('/{id}/read', [ClientNotificationController::class, 'markAsRead']);
        Route::delete('/read', [ClientNotificationController::class, 'destroyRead']);
        Route::delete('/{id}', [ClientNotificationController::class, 'destroy']);
    });

    Route::prefix('profile')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [ClientProfileController::class, 'show']);
        Route::post('/', [ClientProfileController::class, 'update']);
        Route::post('/password', [ClientProfileController::class, 'updatePassword']);

        // Sổ Địa Chỉ (Address Book)
        Route::get('/addresses', [ClientProfileController::class, 'getAddresses']);
        Route::post('/addresses', [ClientProfileController::class, 'storeAddress']);
        Route::put('/addresses/{id}', [ClientProfileController::class, 'updateAddress']);
        Route::delete('/addresses/{id}', [ClientProfileController::class, 'deleteAddress']);
        Route::put('/addresses/{id}/default', [ClientProfileController::class, 'setDefaultAddress']);
    });

    // MODULE ĐƠN HÀNG (Orders)
    Route::controller(ClientOrderController::class)->prefix('orders')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{order_code}/status', 'status');
        Route::get('/{order_code}', 'show');
        Route::put('/{order_code}', 'update');
        Route::post('/{order_code}/review', 'review');
        Route::get('/{order_code}/review', 'getReview');
        Route::post('/{order_code}/reorder', 'reorder');
        Route::post('/{order_code}/return', 'requestReturn');
    });

    Route::controller(ClientComboController::class)->prefix('combos')->group(function () {
        Route::get('/', 'index');
        Route::get('/{slug}', 'show');
    });

    // ROUTE PAYMENT
    Route::prefix('checkout')->group(function () {
        Route::get('/init', [ClientCheckoutController::class, 'initData']);
        Route::post('/', [ClientCheckoutController::class, 'processCheckout']);
        Route::post('/orders/{order_code}/momo-retry', [ClientCheckoutController::class, 'retryMomoPayment']);
        Route::post('/orders/{order_code}/vnpay-retry', [ClientCheckoutController::class, 'retryVnpayPayment']);
        Route::get('/momo-return', [ClientCheckoutController::class, 'momoReturn']);
        Route::post('/momo-return', [ClientCheckoutController::class, 'momoReturn']);
        Route::get('/vnpay-return', [ClientCheckoutController::class, 'vnpayReturn']);
        Route::get('/vnpay-ipn', [ClientCheckoutController::class, 'vnpayIpn']);
    });
    Route::get('orders/{order_code}/invoice', [ClientOrderController::class, 'invoice'])
        ->name('client.orders.invoice');

    // CHƯƠNG TRÌNH ĐỐI TÁC (AFFILIATE)
    Route::middleware('auth:sanctum')->prefix('affiliate')->group(function () {
        Route::get('/status', [ClientAffiliateController::class, 'status']);
        Route::post('/apply', [ClientAffiliateController::class, 'apply']);
    
        Route::post('/withdraw', [ClientAffiliateController::class, 'withdraw']); 
    });
});

// ROUTE SHOP CLIENT
Route::prefix('shop/{shop_slug}')->group(function () {
    Route::get('/info', [ShopController::class, 'shopInfo']);
    Route::get('/products', [ShopController::class, 'index']);
    Route::get('/products/featured', [ShopController::class, 'featured']);

    Route::get('/products/{slug}', [ProductDetailController::class, 'show']);
    Route::post('/compare', [ClientCompareController::class, 'getCompareData']);
});
Route::get('shop/{shop_slug}/categories', [ShopController::class, 'categories']);
Route::get('shop/{shop_slug}/colors', [ShopController::class, 'colors']);
Route::get('shop/{shop_slug}/attributes', [ShopController::class, 'attributes']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ADMIN API ROUTES
Route::prefix('admin')->group(function () {

    Route::controller(AdminAccountController::class)->group(function () {
        Route::post('login', 'login');
        Route::post('register', 'store');
    });

    Route::prefix('forgot-password')->controller(AdminForgotPasswordController::class)->group(function () {
        Route::post('/send-otp', 'sendOtp');
        Route::post('/verify-otp', 'verifyOtp');
        Route::post('/reset', 'resetPassword');
    });

    Route::middleware('auth:sanctum')->group(function () {

        // Lấy thông tin admin hiện tại
        Route::get('me', [AdminAccountController::class, 'me']);

        // Thông báo
        Route::controller(AdminNotificationController::class)->prefix('notifications')->group(function () {
            Route::get('/', 'index');
            Route::post('/mark-all-read', 'markAllAsRead');
            Route::patch('/{id}/read', 'markAsRead');
        });


        Route::controller(AdminProfileController::class)->group(function () {
            Route::get('profile', 'getProfile');

            Route::post('profile', 'updateProfile');
            Route::put('profile/password', 'updatePassword');
        });

        Route::controller(AdminFaceRecognitionController::class)->prefix('face-recognition')->group(function () {
            Route::post('/attendance', 'attendance');
        });

        Route::middleware(['check.module:admin_attendance'])
            ->controller(AdminFaceRecognitionController::class)
            ->prefix('face-recognition')
            ->group(function () {
                Route::get('/admins', 'admins');
                Route::get('/profile', 'profile');
                Route::post('/register', 'register');
                Route::post('/verify', 'verify');
                Route::delete('/profile/{adminId}', 'destroyProfile');
            });

        // Quản lý Nhân viên (Mã: admin_staff)
        Route::middleware(['check.module:admin_staff'])->group(function () {
            Route::apiResource('staff', AdminStaffController::class);
            Route::post('staff/{id}/restore', [AdminStaffController::class, 'restore']);
        });

        // Quản lý Người dùng (Mã: admin_users)
        Route::middleware(['check.module:admin_users'])->group(function () {
            Route::apiResource('users', AdminUserController::class);
            Route::post('users/{id}/restore', [AdminUserController::class, 'restore']);


            Route::controller(AdminUserAddressController::class)->group(function () {
                Route::post('users/{id}/addresses', 'store');
                Route::put('addresses/{id}', 'update');
                Route::delete('addresses/{id}', 'destroy');
                Route::put('addresses/{id}/default', 'setDefault');
            });
        });

        // Quản lý Vai trò & Phân quyền (Mã: admin_roles)
        
        // 1. Lấy danh sách modules (AI CŨNG CẦN ĐỂ RENDER SIDEBAR)
        Route::get('modules', [AdminModulePermissionController::class, 'index']);
        
        Route::middleware(['check.module:admin_roles'])->group(function () {
            Route::apiResource('roles', AdminRoleController::class);
            Route::post('roles/{id}/restore', [AdminRoleController::class, 'restore']);

            // Quản lý phân quyền module trong vai trò (CHỈ ADMIN QUẢN LÝ QUYỀN)
            Route::controller(AdminModulePermissionController::class)->group(function () {
                Route::post('modules/sync', 'sync');
                Route::put('modules/{id}/level', 'updateLevel');
            });

            // Quản lý cấp độ thành viên (Mã: admin_membership_tiers)
            Route::controller(AdminMembershipTierController::class)->prefix('tiers')->group(function () {
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::get('/{id}', 'show');
                Route::put('/{id}', 'update');
                Route::delete('/{id}', 'destroy');
            });
        });

        // Quản lý Danh mục (Mã: admin_categories)
        Route::middleware(['check.module:admin_categories'])->group(function () {
            Route::get('categories/tree', [AdminCategoryController::class, 'getTree']);
            Route::apiResource('categories', AdminCategoryController::class);
            Route::post('categories/{id}/restore', [AdminCategoryController::class, 'restore']);
            Route::delete('categories/{id}/force', [AdminCategoryController::class, 'forceDelete']);
            Route::post('categories/reorder', [AdminCategoryController::class, 'reorder']);
        });

        // Dashboard
        Route::middleware(['check.module:dashboard'])->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/dashboard/chart', [AdminDashboardController::class, 'chart']);
        });

        // Quản lý Sản phẩm (Mã: admin_products)
        Route::middleware(['check.module:admin_products'])->group(function () {
            // Import / Export Excel
            Route::get('products/import/template', [\App\Http\Controllers\Api\Admin\ProductImportController::class, 'downloadTemplate']);
            Route::post('products/import', [\App\Http\Controllers\Api\Admin\ProductImportController::class, 'import']);

            Route::apiResource('products', AdminProductController::class);
            Route::put('products/{id}/status', [AdminProductController::class, 'updateStatus']);
            Route::post('products/{id}/restore', [AdminProductController::class, 'restore']);
            Route::delete('products/{id}/force', [AdminProductController::class, 'forceDelete']);
            Route::post('products/bulk-force-delete', [AdminProductController::class, 'bulkForceDelete']);

            Route::apiResource('attributes', AdminAttributeController::class)->except(['show']);
            Route::post('attribute-values', [AdminAttributeValueController::class, 'store']);
        });

        // Quản lý Thương hiệu (Mã: admin_brands)
        Route::middleware(['check.module:admin_brands'])->group(function () {
            Route::apiResource('brands', AdminBrandController::class);
            Route::post('brands/{id}/restore', [AdminBrandController::class, 'restore']);
            Route::delete('brands/{id}/force', [AdminBrandController::class, 'forceDelete']);
            Route::post('brands/reorder', [AdminBrandController::class, 'reorder']);
        });

        // Quản lý Banners (Mã: admin_banners)
        Route::middleware(['check.module:admin_banners'])->group(function () {
            Route::apiResource('banners', AdminBannerController::class);
            Route::post('banners/{id}/restore', [AdminBannerController::class, 'restore']);
            Route::post('banners/reorder', [AdminBannerController::class, 'reorder']);
        });

        // QUẢN LÝ CHÂN DUNG SORA (CUSTOMER GALLERY)
        Route::middleware(['check.module:admin_gallery'])->group(function () {
            Route::get('galleries', [AdminCustomerGalleryController::class, 'index']);
            Route::post('galleries', [AdminCustomerGalleryController::class, 'store']);
            Route::get('galleries/{id}', [AdminCustomerGalleryController::class, 'show']);
            Route::put('galleries/{id}', [AdminCustomerGalleryController::class, 'update']);
            Route::delete('galleries/{id}', [AdminCustomerGalleryController::class, 'destroy']);
        });

        // Quản lý Đơn hàng (Mã: admin_orders)
        Route::middleware(['check.module:admin_orders'])->group(function () {
            Route::controller(AdminOrderController::class)->group(function () {
                Route::get('orders', 'index');
                Route::get('orders/{id}', 'show');
                Route::get('orders/{id}/invoice', 'invoice');
                Route::put('orders/{id}/status', 'updateStatus');
                Route::delete('orders/{id}', 'destroy');
                Route::post('orders/{id}/refund-process', 'processRefundAction');
                Route::get('orders/{id}/simulation', [OrderSimulationController::class, 'getSimulationData']);
            });
        });

        // Quản lý Mã giảm giá (Mã: admin_coupons)
        Route::middleware(['check.module:admin_coupons'])->group(function () {
            Route::controller(AdminCouponController::class)->group(function () {
                Route::get('coupons', 'index');
                Route::get('coupons/{id}', 'show');
                Route::post('coupons', 'store');
                Route::patch('coupons/{id}', 'update');
                Route::delete('coupons/{id}', 'destroy');
            });
        });

        // Quản lý Combo (Mã: admin_combos)
        Route::middleware(['check.module:admin_combos'])->group(function () {
            Route::controller(AdminComboController::class)->prefix('combos')->group(function () {
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::get('/{combo}', 'show');
                Route::put('/{combo}', 'update');
                Route::patch('/{combo}/status', 'updateStatus');
                Route::delete('/{combo}', 'destroy');
                Route::post('/{combo}/restore', 'restore');
            });
        });

        // Quản lý Đánh giá (Mã: admin_reviews)
        Route::apiResource('reviews', AdminReviewController::class);

        // Quản lý Tồn kho (Mã: admin_inventory)
        Route::controller(AdminInventoryController::class)->prefix('inventory')->group(function () {
            Route::get('/variants', 'getVariants');
            Route::put('/variants/{id}/stock', 'updateVariantStock');
            Route::put('/combos/{id}/limit', 'updateComboLimit');
        });

        // QUẢN LÝ LIÊN HỆ DÀNH CHO ADMIN
        Route::middleware(['check.module:admin_contacts'])->group(function () {
            Route::controller(AdminContactController::class)->prefix('contacts')->group(function () {
                Route::get('/', 'index');
                Route::post('/bulk-delete', 'bulkDelete');
                Route::put('/{id}/status', 'updateStatus');
                Route::delete('/{id}', 'destroy');
                Route::post('/{id}/reply', 'replyEmail');
            });
        });

        // Quản lí tin tức
        Route::middleware(['check.module:admin_news'])->group(function () {
            Route::controller(AdminNewController::class)->prefix('news')->group(function () {
                Route::get('/', 'index');

                Route::post('/{id}/restore', 'restore');

                Route::get('/{id}', 'show');
                Route::post('/', 'store');
                Route::put('/{id}', 'update');
                Route::delete('/{id}', 'destroy');
                Route::patch('/{id}', 'updateStatus');
            });
        });

        // QUẢN LÝ AFFILIATE
        Route::controller(AdminAffiliateController::class)->prefix('affiliates')->group(function () {
            Route::get('/applications', 'index');
            Route::post('/applications/{id}/approve', 'approve');
            Route::post('/applications/{id}/reject', 'reject');
            Route::post('/applications/{id}/revoke', 'revoke');
            
            Route::get('/withdrawals', 'withdrawals'); 
            Route::post('/withdrawals/{id}/approve', 'approveWithdrawal');
            Route::post('/withdrawals/{id}/reject', 'rejectWithdrawal');
        });

        // BỔ SUNG ROUTE REAL-TIME CHAT CHO ADMIN
        Route::prefix('messages')->group(function () {
            Route::get('/conversations', [MessageController::class, 'getConversations']);
            Route::get('/', [MessageController::class, 'history']);
            Route::post('/', [MessageController::class, 'store']);
            // Xóa toàn bộ cuộc trò chuyện với user
            Route::delete('/conversations/{userId}', [MessageController::class, 'deleteConversation']);
        });

        // 1. CÁC ROUTE ĐIỂM DANH CÁ NHÂN (AI CŨNG ĐƯỢC DÙNG, KHÔNG YÊU CẦU QUYỀN MODULE)
        Route::controller(AdminAttendanceController::class)->prefix('attendances')->group(function () {
            Route::get('/status', 'checkStatus');       // Lấy trạng thái của mình hoặc Quét QR
            Route::post('/check-in', 'checkIn');        // Vào ca
            Route::post('/check-out', 'checkOut');      // Tan ca
        });

        // 2. CÁC ROUTE QUẢN LÝ ĐIỂM DANH (CHỈ DÀNH CHO QUẢN LÝ / SUPER ADMIN)
        Route::middleware(['check.module:admin_attendance'])->group(function () {
            Route::controller(AdminAttendanceController::class)->prefix('attendances')->group(function () {
                // ĐẶT CÁC ROUTE TĨNH LÊN TRƯỚC (Tránh bị route động nuốt)
                Route::get('/work-shifts', 'getWorkShifts');
                Route::get('/roles', 'getRoles');
                Route::get('/qr-token', 'generateQrToken'); // Lấy mã QR 25s
                Route::get('/daily-status', 'dailyStatus'); // Kiosk gọi liên tục (Polling) để hiện Live Feed
                Route::get('/monthly-summary', 'monthlySummary'); // Lấy báo cáo chấm công tháng
                Route::get('/adjustments', 'adjustmentHistory');
                Route::post('/adjustments', 'adjustAttendance');

                // ĐẶT CÁC ROUTE ĐỘNG {id} XUỐNG DƯỚI CÙNG
                Route::get('/history/{adminId}', 'history');
                Route::get('/', 'index');
                Route::post('/{id}/resolve', 'resolveForgotten');
            });

            // 2. Quản lý Ca làm việc
            Route::controller(AdminWorkShiftController::class)->prefix('work-shifts')->group(function () {
                // ĐẶT CÁC ROUTE TĨNH LÊN TRƯỚC ĐỂ TRÁNH BỊ {id} NUỐT
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::get('/assignments', 'getAssignments');
                Route::post('/assign', 'assignShift');
                Route::post('/assign-multiple', 'assignMultiple');
                Route::post('/auto-assign', 'autoAssign'); // THÊM POST CHO AUTO ASSIGN
                Route::delete('/assignments/{adminId}', 'removeAssignment');

                // ĐẶT CÁC ROUTE ĐỘNG {id} XUỐNG DƯỚI
                // restore ca làm việc đã xóa
                Route::post('/{id}/restore', 'restore');
                Route::put('/{id}', 'update');
                Route::delete('/{id}', 'destroy');
            });
        });
    });
});
