<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers Admin
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

use App\Http\Controllers\Api\client\ShopController;
use App\Http\Controllers\Api\admin\AdminCouponController;
use App\Http\Controllers\Api\admin\AdminAccountController;
use App\Http\Controllers\Api\admin\AdminForgotPasswordController;
use App\Http\Controllers\Api\admin\AdminProfileController;
use App\Http\Controllers\Api\admin\AdminStaffController;
use App\Http\Controllers\Api\admin\AdminUserController;
use App\Http\Controllers\Api\admin\AdminUserAddressController;
use App\Http\Controllers\Api\admin\AdminRoleController;
use App\Http\Controllers\Api\admin\AdminModulePermissionController;
use App\Http\Controllers\Api\admin\AdminCategoryController;
use App\Http\Controllers\Api\admin\AdminProductController;
use App\Http\Controllers\Api\admin\AdminAttributeController;
use App\Http\Controllers\Api\admin\AdminAttributeValueController;
use App\Http\Controllers\Api\admin\AdminBrandController;
use App\Http\Controllers\Api\admin\AdminOrderController;
use App\Http\Controllers\Api\admin\AdminBannerController;
use App\Http\Controllers\Api\admin\OrderSimulationController;
use App\Http\Controllers\Api\admin\AdminMembershipTierController;
use App\Http\Controllers\Api\admin\AdminComboController;
use App\Http\Controllers\Api\admin\AdminCustomerGalleryController;
use App\Http\Controllers\Api\admin\AdminReviewController;
use App\Http\Controllers\Api\admin\AdminInventoryController;
use App\Http\Controllers\Api\admin\AdminDashboardController;
use App\Http\Controllers\Api\admin\AdminContactController;
use App\Http\Controllers\Api\admin\AdminNewController;
use App\Http\Controllers\Api\admin\AdminChatbotController; 


// Controllers Client
use App\Http\Controllers\Api\client\ProductDetailController;
use App\Http\Controllers\Api\client\ClientCartController;
use App\Http\Controllers\Api\client\ClientOrderController;
use App\Http\Controllers\Api\client\ClientHeaderController;
use App\Http\Controllers\Api\client\ClientHomeController;
use App\Http\Controllers\Api\client\ClientCompareController;
use App\Http\Controllers\Api\client\ClientContactController;
use App\Http\Controllers\Api\Auth\AuthController;
// use App\Http\Controllers\Api\client\ClientCheckoutController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\client\ClientFavouriteController;
use App\Http\Controllers\Api\client\ClientProfileController;
use App\Http\Controllers\Api\client\ChatbotController;
use App\Http\Controllers\Api\client\ClientNewController;

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
// Route riêng cho Mobile App: đăng ký không yêu cầu số điện thoại
use App\Http\Controllers\Api\Auth\MobileAuthController;

Route::prefix('mobile')->group(function () {
    Route::post('/register', [MobileAuthController::class, 'register']);
    Route::post('/login',    [MobileAuthController::class, 'login']);

    // Routes cần xác thực
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [MobileAuthController::class, 'logout']);
        Route::get('/me',      [MobileAuthController::class, 'me']);
    });
});


// CLIENT API ROUTES
Route::prefix('client')->group(function () {


    // THÊM VÀO ĐÂY (trước hoặc sau các route khác đều được)
    Route::middleware('auth:sanctum')->prefix('messages')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\MessageController::class, 'history']);
        Route::post('/', [\App\Http\Controllers\Api\MessageController::class, 'store']);
    });
    
    Route::get('header-data', [ClientHeaderController::class, 'getMegaMenuData']);
    Route::get('search', [ClientHeaderController::class, 'search']);
    Route::get('/home-data', [ClientHomeController::class, 'index']);

    // API Lấy Bảng Giá Vàng (Thêm mới)
    Route::get('/gold-prices', [ClientHomeController::class, 'goldPrices']);

    Route::post('/chatbot', [ChatbotController::class, 'chat']);

    Route::post('/contact', [ClientContactController::class, 'store']);

    // MODULE GIỎ HÀNG (Cart)
    Route::controller(ClientCartController::class)->prefix('cart')->group(function () {
        Route::post('/add-combo', 'addCombo');
        Route::post('/merge', 'mergeCart');
        Route::post('/clear', 'clear');

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

    // Hồ Sơ Cá Nhân (Profile)
    Route::prefix('profile')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'show']);
        Route::post('/', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'update']);
        Route::post('/password', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'updatePassword']);

        // Sổ Địa Chỉ (Address Book)
        Route::get('/addresses', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'getAddresses']);
        Route::post('/addresses', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'storeAddress']);
        Route::put('/addresses/{id}', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'updateAddress']);
        Route::delete('/addresses/{id}', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'deleteAddress']);
        Route::put('/addresses/{id}/default', [\App\Http\Controllers\Api\client\ClientProfileController::class, 'setDefaultAddress']);
    });

    // MODULE ĐƠN HÀNG (Orders)
    Route::controller(ClientOrderController::class)->prefix('orders')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{order_code}', 'show');
        Route::put('/{order_code}', 'update');
        Route::post('/{order_code}/review', 'review');
        Route::get('/{order_code}/review', 'getReview');
        Route::post('/{order_code}/reorder', 'reorder');
        Route::post('/{order_code}/return', 'requestReturn');
    });

    Route::controller(\App\Http\Controllers\Api\client\ClientComboController::class)->prefix('combos')->group(function () {
        Route::get('/', 'index');
        Route::get('/{slug}', 'show');
    });

    // ROUTE PAYMENT
    Route::prefix('checkout')->group(function () {
        Route::get('/init', [\App\Http\Controllers\Api\client\ClientCheckoutController::class, 'initData']);
        Route::post('/', [\App\Http\Controllers\Api\client\ClientCheckoutController::class, 'processCheckout']);
        Route::get('/momo-return', [\App\Http\Controllers\Api\client\ClientCheckoutController::class, 'momoReturn']);
        Route::post('/momo-return', [\App\Http\Controllers\Api\client\ClientCheckoutController::class, 'momoReturn']);
    });
    Route::get('orders/{order_code}/invoice', [App\Http\Controllers\Api\client\ClientOrderController::class, 'invoice'])
        ->name('client.orders.invoice');

    // THÊM VÀO ĐÂY (trước hoặc sau các route khác đều được)
    Route::middleware('auth:sanctum')->prefix('messages')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\MessageController::class, 'history']);
        Route::post('/', [\App\Http\Controllers\Api\MessageController::class, 'store']);
    });// THÊM VÀO ĐÂY (trước hoặc sau các route khác đều được)
    Route::middleware('auth:sanctum')->prefix('messages')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\MessageController::class, 'history']);
        Route::post('/', [\App\Http\Controllers\Api\MessageController::class, 'store']);
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
Route::get('shop/{shop_slug}/categories', [App\Http\Controllers\Api\client\ShopController::class, 'categories']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ADMIN API ROUTES
Route::prefix('admin')->group(function () {

    Route::controller(AdminAccountController::class)->group(function () {
        Route::post('login', 'login');
        Route::post('register', 'store');
    });

    Route::controller(AdminForgotPasswordController::class)->group(function () {
        Route::post('forgot-password', 'sendResetLinkEmail');
        Route::post('reset-password', 'resetPassword');
    });

    Route::middleware('auth:sanctum')->group(function () {

        // Lấy thông tin admin hiện tại
        Route::get('me', [AdminAccountController::class, 'me']);


        Route::controller(AdminProfileController::class)->group(function () {
            Route::post('profile', 'updateProfile');
            Route::put('profile/password', 'updatePassword');
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
        Route::middleware(['check.module:admin_roles'])->group(function () {
            Route::apiResource('roles', AdminRoleController::class);
            Route::post('roles/{id}/restore', [AdminRoleController::class, 'restore']);


            // Quản lý phân quyền module trong vai trò
            Route::controller(AdminModulePermissionController::class)->group(function () {
                Route::get('modules', 'index');
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
            Route::post('categories/{id}/restore', [AdminCategoryController::class, 'restore']);
            Route::post('categories/reorder', [AdminCategoryController::class, 'reorder']);
            Route::apiResource('categories', AdminCategoryController::class);
        });

        // Dashboard
        Route::middleware(['check.module:dashboard'])->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/dashboard/chart', [AdminDashboardController::class, 'chart']);
        });

        // Quản lý Sản phẩm (Mã: admin_products)
        Route::middleware(['check.module:admin_products'])->group(function () {
            Route::apiResource('products', AdminProductController::class);
            Route::post('products/{id}/restore', [AdminProductController::class, 'restore']);

            Route::apiResource('attributes', AdminAttributeController::class)->except(['show']);
            Route::post('attribute-values', [AdminAttributeValueController::class, 'store']);
        });

        // Quản lý Thương hiệu (Mã: admin_brands)
        Route::middleware(['check.module:admin_brands'])->group(function () {
            Route::apiResource('brands', AdminBrandController::class);
            Route::post('brands/{id}/restore', [AdminBrandController::class, 'restore']);
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
        
        // QUẢN LÝ CHATBOT
        Route::middleware(['check.module:admin_chatbot'])->group(function () {
            Route::apiResource('chatbot', AdminChatbotController::class)->except(['create', 'edit']);
        });

        // BỔ SUNG ROUTE REAL-TIME CHAT CHO ADMIN
        Route::prefix('messages')->group(function () {
            Route::get('/conversations', [\App\Http\Controllers\Api\MessageController::class, 'getConversations']);
            Route::get('/', [\App\Http\Controllers\Api\MessageController::class, 'history']);
            Route::post('/', [\App\Http\Controllers\Api\MessageController::class, 'store']);
            // Xóa toàn bộ cuộc trò chuyện với user
            Route::delete('/conversations/{userId}', [\App\Http\Controllers\Api\MessageController::class, 'deleteConversation']);
        });
    });
});