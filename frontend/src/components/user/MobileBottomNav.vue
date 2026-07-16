<template>
  <div class="mobile-bottom-nav d-flex d-lg-none shadow-lg border-top">
    <!-- Nút Trang chủ -->
    <a href="#" @click.prevent="navigate('home')" class="nav-item" :class="{ 'active': $route.name === 'home' }">
      <i class="bi" :class="$route.name === 'home' ? 'bi-house-fill' : 'bi-house'"></i>
      <span>Trang chủ</span>
    </a>

    <!-- Nút Danh mục / Sản phẩm -->
    <a href="#" @click.prevent="navigate('shop')" class="nav-item" :class="{ 'active': ['shop', 'productDetail', 'category-detail', 'favourite'].includes($route.name) }">
      <i class="bi" :class="['shop', 'productDetail', 'category-detail', 'favourite'].includes($route.name) ? 'bi-gem-fill' : 'bi-gem'"></i>
      <span>Cửa hàng</span>
    </a>

    <!-- Nút Bộ Sưu Tập -->
    <a href="#" @click.prevent="navigate('client-combos')" class="nav-item" :class="{ 'active': ['client-combos', 'client-combo-detail'].includes($route.name) }">
      <i class="bi" :class="['client-combos', 'client-combo-detail'].includes($route.name) ? 'bi-stars' : 'bi-stars'"></i>
      <span>Bộ sưu tập</span>
    </a>

    <!-- Nút Giỏ hàng -->
    <a href="#" @click.prevent="openCart" class="nav-item position-relative cart-item">
      <i class="bi bi-bag"></i>
      <span class="cart-badge" v-if="cartItemCount > 0">{{ cartItemCount > 99 ? '99+' : cartItemCount }}</span>
      <span>Giỏ hàng</span>
    </a>

    <!-- Nút Tài khoản -->
    <a href="#" @click.prevent="navigate('profile')" class="nav-item" :class="{ 'active': ['profile', 'order'].includes($route.name) }">
      <i class="bi" :class="['profile', 'order'].includes($route.name) ? 'bi-person-fill' : 'bi-person'"></i>
      <span>Tài khoản</span>
    </a>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { cartItemCount } from '@/stores/cartStore';

const router = useRouter();
const route = useRoute();

const navigate = (routeName) => {
  if (router.hasRoute(routeName)) {
    router.push({ name: routeName });
  }
};

const openCart = () => {
  // Thay vì mở MiniCart (vốn nằm ở Header trên Desktop), ta có thể đẩy thẳng sang trang Cart
  // hoặc emit sự kiện mở giỏ hàng nếu MiniCart có thể hoạt động tốt trên mobile.
  // Ở đây điều hướng thẳng đến trang cart sẽ hợp lý hơn trên mobile app.
  if (router.hasRoute('cart')) {
    router.push({ name: 'cart' });
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500&display=swap');


.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  height: 65px;
  z-index: 1045; /* Dưới z-index của modal/offcanvas (1050) nhưng trên nội dung thường */
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom); /* Hỗ trợ iPhone tai thỏ */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #6c757d;
  flex: 1;
  height: 100%;
  transition: color 0.2s ease;
  padding-top: 5px;
}

.nav-item i {
  font-size: 1.35rem;
  margin-bottom: 2px;
  transition: transform 0.2s ease;
}

.nav-item span {
  font-family: 'Oswald', sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item.active {
  color: #9f273b;
}

.nav-item.active i {
  transform: translateY(-2px);
}

.nav-item:active i {
  transform: scale(0.9);
}

.cart-item .cart-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 18px);
  background-color: #9f273b;
  color: white;
  font-size: 0.6rem;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  border: 1px solid #fff;
  line-height: 1;
  padding: 0 4px;
}
</style>
