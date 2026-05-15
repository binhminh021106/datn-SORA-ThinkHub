<template>
  <!-- Thêm class động để tự động đổi màu nền Header khi bật Dark Mode -->
  <nav class="app-header navbar navbar-expand shadow-sm px-3 py-2 border-bottom transition-all"
       :class="isDarkMode ? 'bg-dark border-secondary' : 'bg-white'">
    <div class="container-fluid">

      <ul class="navbar-nav ms-auto align-items-center">
        <!-- NÚT TOGGLE DARK MODE (MỚI THÊM) -->
        <li class="nav-item me-3" v-if="isLoggedIn">
          <button @click="toggleTheme" 
                  class="btn rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 theme-toggle-btn"
                  :class="isDarkMode ? 'btn-secondary border-secondary' : 'btn-light border-light'"
                  style="width: 36px; height: 36px; transition: all 0.3s;"
                  :title="isDarkMode ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'">
            <i class="bi" :class="isDarkMode ? 'bi-moon-stars-fill text-light fs-6' : 'bi-sun-fill text-warning fs-5'"></i>
          </button>
        </li>

        <!-- Trường hợp 1: Đã đăng nhập - Hiển thị Menu User -->
        <li v-if="isLoggedIn" class="nav-item dropdown user-menu-container" ref="userMenuContainer">
          <a href="#" @click.prevent="toggleUserMenu" class="nav-link d-flex align-items-center dropdown-toggle text-decoration-none"
             :class="isDarkMode ? 'text-light' : 'text-dark'">
            <img :src="adminUser.avatar" class="user-image rounded-circle shadow-sm me-2" alt="User Image">
            <span class="d-none d-md-inline fw-semibold text-truncate" style="max-width: 150px;">{{ adminUser.name }}</span>
          </a>
          
          <ul class="dropdown-menu dropdown-menu-end shadow border mt-2 transition-all" 
              :class="[{ 'show': isUserMenuActive }, isDarkMode ? 'bg-dark border-secondary' : 'bg-white border-0']">
            <li class="user-header-modern text-white text-center p-3 rounded-top">
              <img :src="adminUser.avatar" class="rounded-circle shadow mb-2" style="width: 60px; height: 60px; object-fit: cover;" alt="User Image">
              <p class="mb-0 fw-bold">{{ adminUser.name }}</p>
              <small class="text-light opacity-75">{{ adminUser.roleName }}</small>
            </li>
            
            <li class="mt-2">
              <router-link :to="{ name: 'admin-profile' }" class="dropdown-item py-2" :class="isDarkMode ? 'text-light hover-dark' : ''">
                <i class="bi bi-person me-2"></i> Hồ sơ cá nhân
              </router-link>
            </li>
            <li><hr class="dropdown-divider" :class="isDarkMode ? 'border-secondary' : ''"></li>
            <li>
              <a href="#" @click.prevent="handleLogout" class="dropdown-item py-2 fw-bold" :class="isDarkMode ? 'text-danger hover-dark' : 'text-danger'">
                <i class="bi bi-box-arrow-right me-2"></i> Đăng xuất
              </a>
            </li>
          </ul>
        </li>

        <!-- Trường hợp 2: Chưa đăng nhập - Hiển thị nút Đăng nhập -->
        <li v-else class="nav-item">
          <router-link :to="{ name: 'admin-login' }" class="btn btn-brand-outline px-3 py-1 fw-bold">
            <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { getFullImage } from '@/composables/useUtilities';

import defaultAvatar from '../../assets/images/defaults/avatar1.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const isUserMenuActive = ref(false);
const userMenuContainer = ref(null);

// LOGIC DARK MODE
const isDarkMode = ref(false);

const initTheme = () => {
  const savedTheme = localStorage.getItem('admin_theme');
  // Mặc định lấy theo LocalStorage. Nếu không có thì kiểm tra xem máy tính người dùng có đang dùng Dark Mode không.
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('dark-mode');
  } else {
    isDarkMode.value = false;
    document.documentElement.setAttribute('data-bs-theme', 'light');
    document.body.classList.remove('dark-mode');
  }
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('dark-mode');
    localStorage.setItem('admin_theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('admin_theme', 'light');
  }
};
// KẾT THÚC LOGIC DARK MODE

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('admin_token');
});

const getAdminData = () => {
  const savedInfo = localStorage.getItem('admin_info');
  const roleId = localStorage.getItem('admin_role');
  
  if (savedInfo) {
    const admin = JSON.parse(savedInfo);
    return {
      name: admin.fullname || 'Quản trị viên',
      roleName: roleId == 1 ? 'Super Admin' : 'Nhân viên',
      avatar: admin.avatar_url ? getFullImage(admin.avatar_url) : defaultAvatar
    };
  }
  
  return {
    name: 'Guest',
    roleName: 'Chưa xác định',
    avatar: defaultAvatar
  };
};

const adminUser = ref(getAdminData());

const toggleUserMenu = () => {
  isUserMenuActive.value = !isUserMenuActive.value;
};

const handleLogout = () => {
  Swal.fire({
    title: 'Xác nhận đăng xuất?',
    text: "Bạn sẽ phải đăng nhập lại để tiếp tục quản trị!",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đăng xuất ngay',
    cancelButtonText: 'Hủy'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
      localStorage.removeItem('admin_info');

      Swal.fire({
        icon: 'success',
        title: 'Đã đăng xuất',
        timer: 1000,
        showConfirmButton: false
      }).then(() => {
        router.push({ name: 'admin-login' });
      });
    }
  });
};

const closeUserMenu = (event) => {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target)) {
    isUserMenuActive.value = false;
  }
};

onMounted(() => {
  initTheme(); // Nạp giao diện lúc load trang
  document.addEventListener('click', closeUserMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu);
});
</script>

<style scoped>
.app-header {
  min-height: 60px;
  z-index: 1000;
}

.transition-all {
  transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
  transform: rotate(15deg) scale(1.1);
}

.user-image {
  width: 36px;
  height: 36px;
  transition: transform 0.2s;
  object-fit: cover;
}

.nav-link:hover .user-image {
  transform: scale(1.05);
}

.btn-brand-outline {
  border: 1.5px solid #009981;
  color: #009981;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-brand-outline:hover {
  background-color: #009981;
  color: #fff;
}

.dropdown-menu {
  width: 280px;
  border-radius: 12px;
  animation: slideInUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform-origin: top right;
  right: 0 !important; 
  display: none; 
}

.dropdown-menu.show {
  display: block;
}

.user-header-modern {
  background: linear-gradient(135deg, #009981 0%, #007a67 100%);
  margin-top: -8px; 
}

.dropdown-item {
  font-size: 14px;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #009981;
}

/* Tùy chỉnh hover cho dropdown khi ở Dark Mode */
.hover-dark:hover {
  background-color: #343a40 !important;
  color: #00ebc4 !important;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>