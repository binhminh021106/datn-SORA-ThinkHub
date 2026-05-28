<template>
  <aside class="main-sidebar sidebar-dark-primary d-flex flex-column shadow-lg position-relative"
    :style="{ width: isCollapsed ? '80px' : '260px', backgroundColor: '#2c3136', minHeight: '100vh', transition: 'width 0.3s ease' }">

    <button class="btn shadow-sm toggle-sidebar-btn d-none d-md-flex align-items-center justify-content-center"
      :class="isCollapsed ? 'btn-primary' : 'btn-dark'" @click="toggleSidebar">
      <i class="bi fw-bold" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
    </button>

    <router-link to="/admin"
      class="brand-link text-decoration-none text-white p-3 border-bottom border-secondary d-flex align-items-center"
      :class="isCollapsed ? 'justify-content-center' : ''"
      style="border-color: rgba(255,255,255,0.1) !important; height: 60px; overflow: hidden;">
      <div class="bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm flex-shrink-0"
        :class="isCollapsed ? '' : 'me-3'" style="width: 38px; height: 38px;">
        <i class="bi bi-layers-fill fs-5" style="color: #009981;"></i>
      </div>
      <span class="brand-text fw-bold fs-5 tracking-wide text-nowrap transition-all" v-show="!isCollapsed"
        style="letter-spacing: 1px;">ThinkHub</span>
    </router-link>

    <div class="sidebar flex-grow-1 overflow-auto custom-scrollbar" :class="isCollapsed ? 'p-2' : 'p-3'">

      <div v-if="isLoading" class="mt-2 px-1">
        <div v-for="i in 7" :key="'skel-' + i" class="d-flex align-items-center py-2 mb-2 rounded skeleton-item" :class="isCollapsed ? 'justify-content-center' : 'px-3'">
          <div class="skeleton-icon rounded flex-shrink-0" :class="isCollapsed ? '' : 'me-3'"></div>
          <div class="skeleton-text rounded" v-show="!isCollapsed"></div>
        </div>
      </div>

      <nav class="mt-2" v-else>
        <ul class="nav nav-pills nav-sidebar flex-column gap-2" data-widget="treeview" role="menu">
          <template v-for="(item, index) in menuItems" :key="index">

            <li class="nav-item position-relative" v-if="!item.children">

              <span v-if="getModuleLevel(item.moduleCode) && !isCollapsed"
                class="position-absolute badge rounded-pill shadow-sm level-badge"
                :class="hasAccess(item.moduleCode) ? 'bg-success' : 'bg-danger'">
                Cấp {{ getModuleLevel(item.moduleCode) }}
              </span>

              <router-link v-if="hasAccess(item.moduleCode)" :to="item.path"
                class="nav-link text-white py-2 rounded shadow-sm-hover transition-all d-flex align-items-center"
                :class="[isCollapsed ? 'justify-content-center px-0' : 'px-3', { 'router-link-active': isItemActive(item.path) }]" :title="isCollapsed ? item.name : ''">
                <i class="nav-icon bi" :class="[item.icon, isCollapsed ? 'fs-5' : 'me-3']"></i>
                <p class="m-0 fw-semibold text-nowrap" v-show="!isCollapsed">{{ item.name }}</p>
              </router-link>

              <div v-else class="nav-link py-2 rounded disabled-menu d-flex align-items-center"
                :class="isCollapsed ? 'justify-content-center px-0' : 'px-3'"
                :title="isCollapsed ? item.name + ' (Khóa)' : ''"
                @click="showAccessDenied(item.name, getModuleLevel(item.moduleCode))">
                <i class="nav-icon bi" :class="[item.icon, isCollapsed ? 'fs-5' : 'me-3']"></i>
                <p class="m-0 fw-semibold text-nowrap" v-show="!isCollapsed">{{ item.name }}</p>
                <i class="bi bi-lock-fill opacity-50"
                  :class="isCollapsed ? 'position-absolute top-0 start-100 translate-middle' : 'ms-auto'"></i>
              </div>
            </li>

            <li class="nav-item mt-2 rounded shadow-sm position-relative transition-all"
              :class="[menuState[item.stateKey] && !isCollapsed ? 'menu-open bg-dark' : '']" v-else>

              <a href="#" class="nav-link text-white py-2 rounded d-flex align-items-center transition-all"
                :class="[isCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3', { 'active-group': menuState[item.stateKey] && !isCollapsed }]"
                :title="isCollapsed ? item.name : ''" @click.prevent="handleDropdownClick(item)">
                <div class="d-flex align-items-center" :class="{ 'justify-content-center w-100': isCollapsed }">
                  <i class="nav-icon bi" :class="[item.icon, isCollapsed ? 'fs-5' : 'me-3']"></i>
                  <p class="m-0 fw-semibold text-nowrap" v-show="!isCollapsed">{{ item.name }}</p>
                </div>
                <i class="bi bi-chevron-left transition-icon" v-show="!isCollapsed"
                  :class="{ 'rotate-180': menuState[item.stateKey] }"></i>
              </a>

              <ul class="nav nav-treeview flex-column p-2 pt-1 gap-1" v-show="menuState[item.stateKey] && !isCollapsed"
                style="background-color: rgba(0,0,0,0.15); border-radius: 0 0 8px 8px;">
                <li class="nav-item position-relative" v-for="(subItem, subIndex) in item.children" :key="subIndex">

                  <span v-if="getModuleLevel(subItem.moduleCode)"
                    class="position-absolute badge rounded-pill shadow-sm level-badge-sub"
                    :class="hasAccess(subItem.moduleCode) ? 'bg-success opacity-75' : 'bg-danger opacity-75'">
                    Cấp {{ getModuleLevel(subItem.moduleCode) }}
                  </span>

                  <router-link v-if="hasAccess(subItem.moduleCode)" :to="subItem.path"
                    class="nav-link text-white-50 py-2 px-3 rounded sub-link d-flex align-items-center"
                    :class="{ 'router-link-active': isItemActive(subItem.path) }">
                    <i class="bi bi-circle-fill fs-xs me-3 opacity-50" style="font-size: 6px;"></i>
                    <p class="m-0 fw-medium text-nowrap">{{ subItem.name }}</p>
                  </router-link>

                  <div v-else
                    class="nav-link text-white-50 py-2 px-3 rounded sub-link d-flex align-items-center disabled-menu"
                    @click="showAccessDenied(subItem.name, getModuleLevel(subItem.moduleCode))">
                    <i class="bi bi-lock-fill fs-xs me-3 opacity-50" style="font-size: 10px;"></i>
                    <p class="m-0 fw-medium text-nowrap">{{ subItem.name }}</p>
                  </div>

                </li>
              </ul>
            </li>
          </template>

        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import apiClient from '@/utils/apiClient';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Khai báo sự kiện để báo cho Layout (cha) biết trạng thái sidebar
const emit = defineEmits(['toggle-collapse']);

const route = useRoute();
const isLoading = ref(true);
const systemModules = ref([]);

// Trạng thái thu gọn/mở rộng Sidebar
const isCollapsed = ref(false);

const currentUser = inject('currentUser', ref(null));

const userLevel = computed(() => {
  const user = currentUser?.value || currentUser;
  if (user && user.role && user.role.level) {
    return user.role.level;
  }

  try {
    const localAdmin = JSON.parse(localStorage.getItem('admin_info') || '{}');
    const savedLevel = localStorage.getItem('admin_level') || localAdmin.role?.level;

    if (savedLevel) {
      return parseInt(savedLevel);
    }
  } catch (e) {
    console.warn("Không thể parse localStorage cho Sidebar", e);
  }

  return 999;
});

const menuItems = ref([
  { name: 'Tổng quan', path: '/admin', icon: 'bi-grid-1x2-fill', moduleCode: null },
  { name: 'Phân Quyền', path: '/admin/roles', icon: 'bi-shield-fill-check', moduleCode: 'admin_roles' },
  {
    name: 'Chấm công', icon: 'bi-clock-fill', stateKey: 'attendance',
    children: [
      { name: 'Tổng quan', path: '/admin/attendance', moduleCode: 'admin_attendance' },
      { name: 'Ca làm việc', path: '/admin/attendance/shifts', moduleCode: 'admin_attendance' }
    ]
  },
  {
    name: 'Tài khoản', icon: 'bi-people-fill', stateKey: 'users',
    children: [
      { name: 'Nội bộ', path: '/admin/staff', moduleCode: 'admin_staff' },
      { name: 'Khách hàng', path: '/admin/users', moduleCode: 'admin_users' },
      { name: 'Hạng thành viên', path: '/admin/tiers', moduleCode: 'admin_roles' }
    ]
  },
  {
    name: 'Sản phẩm', icon: 'bi-box-seam', stateKey: 'products',
    children: [
      { name: 'Danh mục', path: '/admin/categories', moduleCode: 'admin_categories' },
      { name: 'Thương hiệu', path: '/admin/brands', moduleCode: 'admin_brands' },
      { name: 'SP & Biến thể', path: '/admin/products', moduleCode: 'admin_products' },
      { name: 'Combo sản phẩm', path: '/admin/combos', moduleCode: 'admin_combos' },
      { name: 'Kho hàng', path: '/admin/inventory', moduleCode: 'admin_inventory' }
    ]
  },
  {
    name: 'Đơn hàng', icon: 'bi-receipt-cutoff', stateKey: 'orders',
    children: [
      { name: 'Danh sách đơn', path: '/admin/orders', moduleCode: 'admin_orders' },
      { name: 'Hoàn trả', path: '/admin/orders/returns', moduleCode: 'admin_orders' }
    ]
  },
  {
    name: 'Marketing', icon: 'bi-megaphone-fill', stateKey: 'marketing',
    children: [
      { name: 'Banner', path: '/admin/banners', moduleCode: 'admin_banners' },
      { name: 'Mã Giảm Giá', path: '/admin/coupons', moduleCode: 'admin_coupons' },
      { name: 'Email tự động', path: '/admin/email-campaigns', moduleCode: 'admin_coupons' },
      { name: 'Chân dung SORA', path: '/admin/gallery', moduleCode: 'admin_banners' },
      { name: 'Đánh giá', path: '/admin/reviews', moduleCode: 'admin_reviews' },
      { name: 'Tin tức', path: '/admin/news', moduleCode: 'admin_news' },
      { name: 'Đối tác Affiliate', path: '/admin/affiliates', moduleCode: 'admin_affiliates' }
    ]
  },
  {
    name: 'Dịch vụ', icon: 'bi-headset', stateKey: 'services', 
    children: [
      { name: 'Hỗ trợ Chat', path: '/admin/chat', moduleCode: 'admin_chat' },
      { name: 'Hộp thư liên hệ', path: '/admin/contacts', moduleCode: 'admin_contacts' }
    ]
  },
]);

const menuState = reactive({
  users: false, products: false, orders: false, marketing: false, services: false, attendance: false
});

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('toggle-collapse', isCollapsed.value);

  if (isCollapsed.value) {
    Object.keys(menuState).forEach(key => menuState[key] = false);
  }
};

const handleDropdownClick = (item) => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
    emit('toggle-collapse', false);
    setTimeout(() => {
      menuState[item.stateKey] = true;
    }, 250);
  } else {
    menuState[item.stateKey] = !menuState[item.stateKey];
  }
};

const getHeaders = () => ({
  'Accept': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
});

const fetchSidebarData = async () => {
  try {
    const data = await apiClient.get('/admin/modules');
    if (data.data?.data) {
      systemModules.value = data.data.data;
    }
  } catch (err) {
    console.error("Lỗi tải dữ liệu Sidebar", err);
  } finally {
    isLoading.value = false;
  }
};

const getModuleLevel = (code) => {
  if (!code) return null;
  const mod = systemModules.value.find(m => m.module_code === code);
  return mod ? mod.required_level : null;
};

// ĐÃ SỬA: HÀM PHÂN QUYỀN THÔNG MINH HƠN
const hasAccess = (code) => {
  if (!code) return true;
  const requiredLevel = getModuleLevel(code);
  
  // Nếu chưa có trong Database, tự động mở khóa cho Super Admin (Cấp 1) vào xài luôn
  if (!requiredLevel) return userLevel.value === 1; 
  
  return userLevel.value <= requiredLevel;
};

// ĐÃ SỬA: THÔNG BÁO LỖI RÕ RÀNG HƠN
const showAccessDenied = (menuName, reqLevel) => {
  const levelText = reqLevel ? reqLevel : '1 (Chưa cấu hình CSDL)';
  Swal.fire({
    toast: true, position: 'top-end', icon: 'error',
    title: 'Truy cập bị từ chối!',
    text: `Tính năng "${menuName}" yêu cầu Cấp ${levelText}. (Bạn đang ở Cấp ${userLevel.value})`,
    showConfirmButton: false, timer: 4000, timerProgressBar: true,
  });
};

const isItemActive = (itemPath) => {
  const currentPath = route.path;
  if (itemPath === '/admin') return currentPath === '/admin';
  if (currentPath === itemPath) return true;
  if (currentPath.startsWith(itemPath + '/')) {
    const allPaths = menuItems.value.flatMap(item => item.children ? item.children.map(c => c.path) : [item.path]);
    const bestMatch = allPaths.filter(p => currentPath === p || currentPath.startsWith(p + '/'))
                              .sort((a, b) => b.length - a.length)[0];
    return itemPath === bestMatch;
  }
  return false;
};

watch(() => route.path, () => {
  menuItems.value.forEach(item => {
    if (item.children) {
      const isChildActive = item.children.some(subItem => isItemActive(subItem.path));
      if (isChildActive && !isCollapsed.value) {
        menuState[item.stateKey] = true;
      }
    }
  });
}, { immediate: true });

onMounted(() => {
  fetchSidebarData();
});
</script>

<style scoped>
/* Nút lơ lửng mép phải */
.toggle-sidebar-btn {
  position: absolute;
  top: 15px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #fff;
  z-index: 1050;
  padding: 0;
  transition: all 0.3s ease;
}

.toggle-sidebar-btn:hover {
  transform: scale(1.1);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.nav-link {
  transition: all 0.2s ease;
  overflow: hidden;
}

.shadow-sm-hover:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateX(3px);
}

.disabled-menu {
  background-color: rgba(0, 0, 0, 0.2) !important;
  color: #6c757d !important;
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.disabled-menu:hover {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: #dc3545 !important;
}

.level-badge {
  top: 6px;
  right: 8px;
  font-size: 0.65rem;
  padding: 3px 6px;
  z-index: 2;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.level-badge-sub {
  top: 8px;
  right: 12px;
  font-size: 0.6rem;
  padding: 2px 5px;
  z-index: 2;
}

.sub-link {
  transition: all 0.2s ease;
}

.sub-link:hover:not(.disabled-menu) {
  background-color: rgba(0, 153, 129, 0.1) !important;
  color: #00cba9 !important;
  transform: translateX(3px);
}

.sub-link:hover:not(.disabled-menu) i {
  color: #00cba9 !important;
}

.active-group {
  background-color: #009981 !important;
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(0, 153, 129, 0.3);
}

.router-link-active,
.router-link-exact-active {
  background-color: #009981 !important;
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(0, 153, 129, 0.3);
}

.sub-link.router-link-active {
  background-color: rgba(0, 153, 129, 0.15) !important;
  color: #00ebc4 !important;
  box-shadow: none;
  font-weight: 600;
}

.sub-link.router-link-active i {
  color: #00ebc4 !important;
  opacity: 1 !important;
}

.transition-icon {
  transition: transform 0.3s ease;
  font-size: 12px;
  opacity: 0.8;
}

.rotate-180 {
  transform: rotate(-90deg);
}

 .transition-all {
  transition: all 0.3s ease;
}

/* Skeleton Loading cho Sidebar Dark Theme */
.skeleton-item {
  background-color: rgba(255, 255, 255, 0.02);
}
.skeleton-icon {
  width: 20px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  animation: pulse-dark 1.5s infinite ease-in-out;
}
.skeleton-text {
  height: 14px;
  background-color: rgba(255, 255, 255, 0.1);
  animation: pulse-dark 1.5s infinite ease-in-out;
  width: 100%;
}
.skeleton-item:nth-child(1) .skeleton-text { width: 70%; }
.skeleton-item:nth-child(2) .skeleton-text { width: 50%; }
.skeleton-item:nth-child(3) .skeleton-text { width: 80%; }
.skeleton-item:nth-child(4) .skeleton-text { width: 45%; }
.skeleton-item:nth-child(5) .skeleton-text { width: 65%; }
.skeleton-item:nth-child(6) .skeleton-text { width: 55%; }
.skeleton-item:nth-child(7) .skeleton-text { width: 75%; }

@keyframes pulse-dark {
  0% { background-color: rgba(255, 255, 255, 0.05); }
  50% { background-color: rgba(255, 255, 255, 0.15); }
  100% { background-color: rgba(255, 255, 255, 0.05); }
}

.transition-all {
  transition: all 0.3s ease;
}
</style>