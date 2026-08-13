<?php

namespace App\Providers;

use App\Events\AdminRefresh;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Combo;
use App\Models\ComboItem;
use App\Models\Contact;
use App\Models\Coupon;
use App\Models\CustomerGallery;
use App\Models\MembershipTier;
use App\Models\ModulePermission;
use App\Models\News;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use App\Models\AdminAttendance;
use App\Models\AdminAttendanceAdjustment;
use Illuminate\Support\ServiceProvider;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use App\Models\EmailLog;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(MessageSent::class, function (MessageSent $event): void {
            $header = $event->message->getHeaders()->get('X-SORA-Email-Log-ID');
            $emailLogId = $header?->getBodyAsString();

            if ($emailLogId) {
                EmailLog::whereKey((int) $emailLogId)->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'error_message' => null,
                ]);
            }
        });

        $this->configureRateLimiting();

        $broadcastMapping = [
            Product::class => 'products',
            ProductVariant::class => 'products',
            Banner::class => 'banners',
            Coupon::class => 'coupons',
            Combo::class => 'combos',
            ComboItem::class => 'combos',
            Category::class => 'categories',
            Brand::class => 'brands',
            Attribute::class => 'attributes',
            AttributeValue::class => 'attributes',
            User::class => 'customers',
            CustomerGallery::class => 'galleries',
            Contact::class => 'contacts',
            News::class => 'news',
            Review::class => 'reviews',
            MembershipTier::class => 'membership_tiers',
            ModulePermission::class => 'modules',
            AdminAttendance::class => 'attendances',
            AdminAttendanceAdjustment::class => 'attendances',
        ];

        foreach ($broadcastMapping as $modelClass => $module) {
            $this->registerAdminRefreshBroadcaster($modelClass, $module);
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // Giới hạn Đăng nhập (Client)
        RateLimiter::for('auth', function (Request $request) {
            $email = mb_strtolower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinutes(15, 5)->by('auth-ip:' . $request->ip()),
                Limit::perMinutes(15, 5)->by('auth-email:' . hash('sha256', $email ?: $request->ip())),
            ];
        });

        // Giới hạn Quên mật khẩu (Client)
        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perDay(3)->by($request->ip());
        });

        // Giới hạn Quên mật khẩu (Admin)
        RateLimiter::for('admin-forgot-password', function (Request $request) {
            $email = mb_strtolower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinutes(15, 3)->by('admin-forgot-ip:' . $request->ip()),
                Limit::perHour(3)->by('admin-forgot-email:' . hash('sha256', $email ?: $request->ip())),
            ];
        });

        // Giới hạn Gửi form liên hệ (Contact)
        RateLimiter::for('contact', function (Request $request) {
            return Limit::perHour(60)->by($request->ip());
        });

        // Giới hạn Thanh toán đơn hàng (Checkout)
        RateLimiter::for('checkout', function (Request $request) {
            $actor = $request->user()?->id ?: 'guest';

            return [
                Limit::perMinute(5)->by('checkout-user:' . $actor),
                Limit::perMinute(15)->by('checkout-ip:' . $request->ip()),
                Limit::perHour(60)->by('checkout-ip-hour:' . $request->ip()),
            ];
        });

        // Giới hạn Đánh giá sản phẩm (Review)
        RateLimiter::for('review', function (Request $request) {
            return $request->user()
                ? Limit::perMinutes(10, 5)->by($request->user()->id)
                : Limit::perMinutes(10, 5)->by($request->ip());
        });

        // Giới hạn Gửi tin nhắn Chatbot
        RateLimiter::for('chatbot', function (Request $request) {
            return [
                Limit::perMinute(10)->by('chatbot-ip:' . $request->ip()),
                Limit::perHour(60)->by('chatbot-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Tiếp thị liên kết (Affiliate)
        RateLimiter::for('affiliate', function (Request $request) {
            return $request->user()
                ? Limit::perHour(1)->by($request->user()->id)
                : Limit::perHour(1)->by($request->ip());
        });

        // Giới hạn Tính năng Gửi chiến dịch Email (Sinh nhật / Sự kiện)
        RateLimiter::for('email-campaign', function (Request $request) {
            return Limit::perMinute(1)->by($request->user()?->id ?: $request->ip());
        });

        // Giới hạn Thử lại thanh toán (VNPay / MoMo)
        RateLimiter::for('payment-retry', function (Request $request) {
            return Limit::perMinutes(10, 3)->by($request->user()?->id ?: $request->ip());
        });

        // Giới hạn Thêm/Sửa/Xoá Giỏ hàng (Cart)
        RateLimiter::for('cart-mutation', function (Request $request) {
            $owner = $request->user()?->id ?: ($request->header('X-Cart-Session-Id') ?: 'guest');

            return [
                Limit::perMinute(30)->by('cart-owner:' . $owner),
                Limit::perMinute(60)->by('cart-ip:' . $request->ip()),
                Limit::perDay(300)->by('cart-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Xem Giỏ hàng (Cart)
        RateLimiter::for('cart-read', function (Request $request) {
            return Limit::perMinute(60)->by('cart-read:' . ($request->user()?->id ?: $request->ip()));
        });

        // Giới hạn Tính năng địa lý / API Tỉnh thành
        RateLimiter::for('geo', function (Request $request) {
            return [
                Limit::perMinute(30)->by('geo-ip:' . $request->ip()),
                Limit::perHour(300)->by('geo-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Đọc dữ liệu công khai chung (Bài viết, Sản phẩm, vv)
        RateLimiter::for('public-read', function (Request $request) {
            return Limit::perMinute(120)->by('public-read:' . $request->ip());
        });

        // Giới hạn Đọc tin nhắn (Chat)
        RateLimiter::for('direct-chat-read', function (Request $request) {
            return [
                Limit::perMinute(30)->by('chat-read-user:' . ($request->user()?->id ?: 'guest')),
                Limit::perMinute(60)->by('chat-read-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Gửi tin nhắn (Chat)
        RateLimiter::for('direct-chat-write', function (Request $request) {
            return [
                Limit::perMinute(10)->by('chat-write-user:' . ($request->user()?->id ?: 'guest')),
                Limit::perMinute(30)->by('chat-write-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Thay đổi dữ liệu chung của Client
        RateLimiter::for('client-mutation', function (Request $request) {
            $actor = $request->user()?->id ?: $request->ip();

            return [
                Limit::perMinute(30)->by('client-mutation-user:' . $actor . ':' . $request->path()),
                Limit::perMinute(60)->by('client-mutation-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Thay đổi dữ liệu nhạy cảm (Đổi mật khẩu, Email)
        RateLimiter::for('sensitive-mutation', function (Request $request) {
            return [
                Limit::perMinutes(10, 5)->by('sensitive-user:' . ($request->user()?->id ?: 'guest')),
                Limit::perMinutes(10, 10)->by('sensitive-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Rút tiền (Ví / Affiliate)
        RateLimiter::for('withdrawal', function (Request $request) {
            return Limit::perHour(2)->by('withdrawal-user:' . ($request->user()?->id ?: $request->ip()));
        });

        // Giới hạn Yêu cầu Hoàn trả đơn hàng
        RateLimiter::for('return-request', function (Request $request) {
            return Limit::perMinutes(10, 5)->by('return-user:' . ($request->user()?->id ?: $request->ip()));
        });

        // Giới hạn Đăng nhập bằng Google
        RateLimiter::for('google-auth', function (Request $request) {
            return [
                Limit::perMinutes(15, 10)->by('google-auth-ip:' . $request->ip()),
                Limit::perHour(30)->by('google-auth-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Làm mới Token (JWT Refresh)
        RateLimiter::for('refresh-token', function (Request $request) {
            return [
                Limit::perMinute(10)->by('refresh-user:' . ($request->user()?->id ?: 'guest')),
                Limit::perMinute(30)->by('refresh-ip:' . $request->ip()),
            ];
        });

        // Giới hạn Xác thực OTP (Client)
        RateLimiter::for('otp-verify', function (Request $request) {
            $email = mb_strtolower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinute(15)->by('otp-verify-ip:' . $request->ip()),
                Limit::perMinutes(10, 10)->by('otp-verify-email:' . hash('sha256', $email ?: $request->ip())),
            ];
        });

        // Giới hạn Xác thực OTP (Admin)
        RateLimiter::for('admin-otp-verify', function (Request $request) {
            $email = mb_strtolower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinute(10)->by('admin-otp-verify-ip:' . $request->ip()),
                Limit::perMinutes(10, 5)->by('admin-otp-verify-email:' . hash('sha256', $email ?: $request->ip())),
            ];
        });

        // Lớp bảo vệ chung (Mạng lưới an toàn) cho toàn bộ API Admin
        RateLimiter::for('admin-api', function (Request $request) {
            return Limit::perMinute(120)->by('admin-api:' . ($request->user()?->id ?: $request->ip()));
        });

        // Lớp bảo vệ chung (Mạng lưới an toàn) cho toàn bộ API Client
        RateLimiter::for('client-api', function (Request $request) {
            return Limit::perMinute(120)->by('client-api:' . ($request->user()?->id ?: $request->ip()));
        });
    }

    private function registerAdminRefreshBroadcaster(string $modelClass, string $module): void
    {
        if (! class_exists($modelClass)) {
            return;
        }

        $broadcast = function () use ($module) {
            event(new AdminRefresh(
                $module,
                sprintf('Có cập nhật mới trên %s.', $module),
                now()->toDateTimeString()
            ));
        };

        $modelClass::saved($broadcast);
        $modelClass::deleted($broadcast);

        // Only register restored if the model uses SoftDeletes
        if (in_array('Illuminate\\Database\\Eloquent\\SoftDeletes', class_uses($modelClass))) {
            $modelClass::restored($broadcast);
        }
    }
}
