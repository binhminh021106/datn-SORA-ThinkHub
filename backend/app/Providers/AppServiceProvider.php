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
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinutes(15, 5)->by($request->ip());
        });

        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perDay(3)->by($request->ip());
        });

        RateLimiter::for('contact', function (Request $request) {
            // Nới lỏng vòng ngoài để cho phép submit sai validate (không bị block)
            // Giới hạn thực sự (3 lần/giờ đối với form đúng) sẽ nằm trong Controller.
            return Limit::perHour(60)->by($request->ip());
        });

        RateLimiter::for('checkout', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(5)->by($request->user()->id)
                : Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('review', function (Request $request) {
            return $request->user()
                ? Limit::perMinutes(10, 5)->by($request->user()->id)
                : Limit::perMinutes(10, 5)->by($request->ip());
        });

        RateLimiter::for('chatbot', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('affiliate', function (Request $request) {
            return $request->user()
                ? Limit::perHour(1)->by($request->user()->id)
                : Limit::perHour(1)->by($request->ip());
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
