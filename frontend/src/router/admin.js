const admin = [
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../pages/admin/auth/Login.vue'),
  },
  {
    path: '/admin/register',
    name: 'admin-register',
    component: () => import('../pages/admin/auth/Register.vue'),
  },
  {
    path: '/admin/forgot-password',
    name: 'admin-forgot-password',
    component: () => import('../pages/admin/auth/ForgotPassword.vue'),
  },
  {
    path: '/admin/reset-password',
    name: 'admin-reset-password',
    component: () => import('../pages/admin/auth/ResetPassword.vue'),
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../pages/admin/index.vue'),
        meta: { title: 'Bảng điều khiển', moduleCode: 'admin_dashboard' },
      },
      {
        path: '/admin/profile',
        name: 'admin-profile',
        component: () => import('../pages/admin/account/Profile.vue'),
      },
      {
        path: 'roles',
        name: 'admin-roles',
        component: () => import('../pages/admin/role/Index.vue'),
        meta: { moduleCode: 'admin_roles' },
      },
      // crud staff
      {
        path: 'staff',
        name: 'admin-staff-index',
        component: () => import('../pages/admin/account/staff/Index.vue'),
        meta: { moduleCode: 'admin_staff' },
      },
      {
        path: 'staff/create',
        name: 'admin-staff-create',
        component: () => import('../pages/admin/account/staff/Create.vue'),
        meta: { moduleCode: 'admin_staff' },
      },
      {
        path: 'staff/:id/edit',
        name: 'admin-staff-edit',
        component: () => import('../pages/admin/account/staff/Edit.vue'),
        meta: { moduleCode: 'admin_staff' },
      },
      {
        // ROUTE QUẢN LÝ KHÁCH HÀNG (USERS)
        path: 'users',
        name: 'admin-users',
        meta: { moduleCode: 'admin_users' },
        component: () => import('../pages/admin/account/user/Index.vue'),
      },
      {
        path: 'account/users/create',
        name: 'admin-user-create',
        meta: { moduleCode: 'admin_users' },
        component: () => import('../pages/admin/account/user/Create.vue'),
      },
      {
        path: 'account/users/edit/:id',
        name: 'admin-user-edit',
        meta: { moduleCode: 'admin_users' },
        component: () => import('../pages/admin/account/user/Edit.vue'),
      },
      // ROUTE QUẢN LÝ DANH MỤC (CATEGORIES)
      {
        path: 'categories',
        name: 'admin-categories',
        meta: { moduleCode: 'admin_categories' },
        component: () => import('../pages/admin/category/Index.vue'),
      },
      {
        path: 'categories/create',
        name: 'admin-category-create',
        meta: { moduleCode: 'admin_categories' },
        component: () => import('../pages/admin/category/Create.vue'),
      },
      {
        path: 'categories/edit/:id',
        name: 'admin-category-edit',
        meta: { moduleCode: 'admin_categories' },
        component: () => import('../pages/admin/category/Edit.vue'),
      },
      // ROUTE QUẢN LÝ SẢN PHẨM (PRODUCTS)
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('../pages/admin/product/Index.vue'),
        meta: { moduleCode: 'admin_products' },
      },
      {
        path: 'products/create',
        name: 'admin-products-create',
        component: () => import('../pages/admin/product/Create.vue'),
        meta: { moduleCode: 'admin_products' },
      },
      {
        path: 'products/:id/edit',
        name: 'admin-products-edit',
        component: () => import('../pages/admin/product/Edit.vue'),
        meta: { moduleCode: 'admin_products' },
      },
      // ROUTE QUẢN LÝ THƯƠNG HIỆU (BRANDS)
      {
        path: 'brands',
        name: 'admin-brands',
        component: () => import('../pages/admin/brand/Index.vue'),
        meta: { moduleCode: 'admin_brands' },
      },
      {
        path: 'brands/create',
        name: 'admin-brands-create',
        component: () => import('../pages/admin/brand/Create.vue'),
        meta: { moduleCode: 'admin_brands' },
      },
      {
        path: 'brands/:id/edit',
        name: 'admin-brands-edit',
        component: () => import('../pages/admin/brand/Edit.vue'),
        meta: { moduleCode: 'admin_brands' },
      },

      // history attendance
      {
        path: 'attendance/history',
        name: 'admin-attendance-history',
        component: () => import('../pages/admin/admin-attendance/History.vue'),
        meta: {
          moduleCode: 'admin_attendances',
          title: 'Lịch sử chấm công'
        },
      },
      // ROUTE QUẢN LÝ CHẤM CÔNG (ATTENDANCE)
      {
        path: 'attendance',
        name: 'admin-attendance-dashboard',
        component: () => import('../pages/admin/admin-attendance/Index.vue'),
        meta: {
          moduleCode: 'admin_attendances',
          title: 'Bảng chấm công cá nhân'
        },
      },
      {
        path: 'attendance/shifts',
        name: 'admin-attendance-shifts',
        component: () => import('../pages/admin/admin-attendance/WorkShifts.vue'),
        meta: {
          moduleCode: 'admin_attendances',
          title: 'Quản lý ca làm việc'
        },
      },

      // ROUTE QUẢN LÝ BANNER (BANNERS) - THÊM MỚI
      {
        path: 'banners',
        name: 'admin-banners',
        component: () => import('../pages/admin/banner/Index.vue'),
        meta: { moduleCode: 'admin_banners' },
      },
      {
        path: 'banners/create',
        name: 'admin-banners-create',
        component: () => import('../pages/admin/banner/Create.vue'),
        meta: { moduleCode: 'admin_banners' },
      },
      {
        path: 'banners/:id/edit',
        name: 'admin-banners-edit',
        component: () => import('../pages/admin/banner/Edit.vue'),
        meta: { moduleCode: 'admin_banners' },
      },

      // ROUTE QUẢN LÝ CHÂN DUNG SORA (GALLERY)
      {
        path: 'gallery',
        name: 'admin-gallery',
        component: () => import('../pages/admin/gallery/Index.vue'),
        meta: { moduleCode: 'admin_gallery' },
      },
      {
        path: 'gallery/create',
        name: 'admin-gallery-create',
        component: () => import('../pages/admin/gallery/Create.vue'),
        meta: { moduleCode: 'admin_gallery' },
      },
      {
        path: 'gallery/:id/edit',
        name: 'admin-gallery-edit',
        component: () => import('../pages/admin/gallery/Edit.vue'),
        meta: { moduleCode: 'admin_gallery' },
      },

      // ROUTE QUẢN LÝ ĐƠN HÀNG (ORDERS)
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/pages/admin/order/Index.vue'),
        meta: { title: 'Quản lý đơn hàng', moduleCode: 'admin_orders' }
      },
      {
        path: 'orders/:id/edit',
        name: 'admin-orders-edit',
        component: () => import('@/pages/admin/order/Edit.vue'),
        meta: { title: 'Xử lý đơn hàng', moduleCode: 'admin_orders' }
      },
      {
        path: 'orders/returns',
        name: 'admin-orders-returns',
        component: () => import('../pages/admin/order/Returns.vue'),
        meta: { moduleCode: 'admin_orders' },
      },
      {
        path: 'coupons',
        name: 'admin-coupons',
        component: () => import('../pages/admin/coupon/index.vue'),
      },
      {
        path: 'coupons/create',
        name: 'admin-coupon-create',
        component: () => import('../pages/admin/coupon/create.vue'),
      },
      {
        path: 'coupons/:id/edit',
        name: 'admin-coupon-edit',
        component: () => import('../pages/admin/coupon/edit.vue'),
      },
      {
        path: 'email-campaigns',
        name: 'admin-email-campaigns',
        component: () => import('../pages/admin/email-campaign/Index.vue'),
        meta: { moduleCode: 'admin_coupons' },
      },
      {
        path: 'email-campaigns/create',
        name: 'admin-email-campaigns-create',
        component: () => import('../pages/admin/email-campaign/Create.vue'),
        meta: { moduleCode: 'admin_coupons' },
      },
      {path: 'email-campaigns/:id/edit',
        name: 'admin-email-campaigns-edit',
        component: () => import('../pages/admin/email-campaign/Edit.vue'),
        meta: { moduleCode: 'admin_coupons' },
      },

      // ROUTE QUẢN LÝ HẠNG THÀNH VIÊN (MEMBERSHIP TIERS)
      {
        path: 'tiers',
        name: 'admin-tiers',
        component: () => import('../pages/admin/tier/Index.vue'),
        meta: { moduleCode: 'admin_roles' },
      },
      {
        path: 'tiers/create',
        name: 'admin-tiers-create',
        component: () => import('../pages/admin/tier/Create.vue'),
        meta: { moduleCode: 'admin_roles' },
      },
      {
        path: 'tiers/:id/edit',
        name: 'admin-tiers-edit',
        component: () => import('../pages/admin/tier/Edit.vue'),
        meta: { moduleCode: 'admin_roles' },
      },
      // ROUTE QUẢN LÝ COMBO SẢN PHẨM (PRODUCT COMBOS)
      {
        path: 'combos',
        name: 'admin-combos',
        component: () => import('../pages/admin/combo/Index.vue'),
        meta: { moduleCode: 'admin_combos' },
      },
      {
        path: 'combos/create',
        name: 'admin-combos-create',
        component: () => import('../pages/admin/combo/Create.vue'),
        meta: { moduleCode: 'admin_combos' },
      },
      {
        path: 'combos/:id/edit',
        name: 'admin-combos-edit',
        component: () => import('../pages/admin/combo/Edit.vue'),
        meta: { moduleCode: 'admin_combos' },
      },
      // ROUTE QUẢN LÝ ĐÁNH GIÁ (REVIEWS)
      {
        path: 'reviews',
        name: 'admin-reviews',
        component: () => import('../pages/admin/review/Index.vue'),
        meta: { moduleCode: 'admin_reviews' },
      },
      // ROUTE QUẢN LÝ KHO HÀNG (INVENTORY)
      {
        path: 'inventory',
        name: 'admin-inventory',
        component: () => import('../pages/admin/inventory/Index.vue'),
        meta: { moduleCode: 'admin_inventory' },
      },
      // ROUTE QUẢN LÝ Liên Hệ 
      {
        path: 'contacts',
        name: 'admin-contacts',
        component: () => import('../pages/admin/contact/index.vue'),
        meta: { moduleCode: 'admin_contacts' },
      },

      // ROUTE CHAT
      {
        path: 'chat',
        name: 'admin-chat',
        component: () => import('../pages/admin/AdminChat.vue'),
        meta: { moduleCode: 'admin_chat' },
      },
      // ROUTE QUẢN LÝ TIN TỨC (NEWS)
      {
        path: 'news',
        name: 'admin-news',
        component: () => import('../pages/admin/news/Index.vue'),
        meta: { moduleCode: 'admin_news' },
      },
      {
        path: 'news/create',
        name: 'admin-news-create',
        component: () => import('../pages/admin/news/Create.vue'),
        meta: { moduleCode: 'admin_news' },
      },
      {
        path: 'news/edit/:id',
        name: 'admin-news-edit',
        component: () => import('../pages/admin/news/Edit.vue'),
        meta: { moduleCode: 'admin_news' },
      },

    ],
  },
]

export default admin
