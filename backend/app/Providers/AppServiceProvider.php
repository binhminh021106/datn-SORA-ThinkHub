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
use Illuminate\Support\ServiceProvider;

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
        ];

        foreach ($broadcastMapping as $modelClass => $module) {
            $this->registerAdminRefreshBroadcaster($modelClass, $module);
        }
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
