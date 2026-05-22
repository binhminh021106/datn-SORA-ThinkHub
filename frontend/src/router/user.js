const user = [
  {
    path: '/',
    component: () => import('../layouts/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../pages/user/index.vue'),
      },
      {
        path: 'gia-vang',
        name: 'gold-price',
        component: () => import('../pages/user/goldPrices/GoldPrice.vue'),
      },
      {
        path: 'cart',
        name: 'cart',
        component: () => import('../pages/user/cart/index.vue'),
      },
      {
        path: 'order',
        name: 'order',
        component: () => import('../pages/user/order/Index.vue'),
      },
      {
        path: 'orderHistory',
        name: 'orderHistory',
        component: () => import('../pages/user/order/OrderDetailModal.vue'),
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('../pages/user/auth/Login.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../pages/user/auth/Register.vue'),
      },
      {
        path: '/auth/google/callback',
        name: 'GoogleCallback',
        component: () => import('../pages/user/auth/CallBackGoogle.vue'),
      },
      {
        path: 'shop',
        name: 'shop',
        component: () => import('../pages/user/shop/Index.vue'),
      },
      {
        path: 'category/:id',
        name: 'category-detail',
        component: () => import('../pages/user/shop/Index.vue'),
      },
      {
        path: 'shop/:shop_slug/product/:slug',
        name: 'productDetail',
        component: () => import('../pages/user/productdetail/Index.vue'),
      },
      {
        path: 'combos',
        name: 'client-combos',
        component: () => import('../pages/user/combo/Index.vue'),
      },
      {
        path: 'combos/:slug',
        name: 'client-combo-detail',
        component: () => import('../pages/user/combo/Detail.vue'),
      },
      {
        path: 'favourite',
        name: 'favourite',
        component: () => import('../pages/user/favourite/index.vue'),
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('../pages/user/about/index.vue'),
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('../pages/user/contact/index.vue'),
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('../pages/user/services/index.vue'),
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('../pages/user/checkout/Index.vue'),
      },
      {
        path: '/checkout/success',
        name: 'checkout-success',
        component: () => import('../pages/user/checkout/Success.vue'),
      },
      {
        path: '/checkout/failed',
        name: 'checkout-failed',
        component: () => import('../pages/user/checkout/Failed.vue'),
      },
      {
        path: 'shop/:shop_slug/compare',
        name: 'compare',
        component: () => import('../pages/user/compare/Index.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/user/profile/index.vue')
      },
      
      {
        path: 'news',
        name: 'news',
        component: () => import('../pages/user/news/Index.vue'), // Đảm bảo đường dẫn đúng tới Tintuc.vue
      },
      {
        // Chú ý: Component của bạn truyền name là 'PostDetailt' (có chữ t ở cuối), 
        // mình khai báo giống vậy để không bị lỗi router-link
        path: 'tin-tuc/:slug',
        name: 'PostDetailt',
        component: () => import('../pages/user/news/PostDetail.vue'), // File chi tiết bài viết (bạn cần tự tạo UI cho file này)
      },
      {
        path: 'policy',
        name: 'policy',
        component: () => import('../pages/user/policy/index.vue'),
      },

    ],
  },
]

export default user
