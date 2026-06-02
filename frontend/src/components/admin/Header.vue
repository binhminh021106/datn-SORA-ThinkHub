<template>
  <!-- Thêm class động để tự động đổi màu nền Header khi bật Dark Mode -->
  <nav class="app-header navbar navbar-expand shadow-sm px-3 py-2 border-bottom transition-all"
       :class="isDarkMode ? 'bg-dark border-secondary' : 'bg-white'">
    <div class="container-fluid">
      
      <!-- ĐỒNG HỒ DIGITAL (Bên trái) - Đã thay bằng FLIP CLOCK -->
      <div class="d-none d-sm-flex align-items-center me-auto" v-if="isLoggedIn">
        <div class="flip-clock-container d-flex align-items-center px-3 py-1 rounded shadow-sm transition-all" 
             :class="isDarkMode ? 'bg-black border border-secondary' : 'bg-dark border'">
          
          <div class="flip-clock-mini">
            <!-- GIỜ -->
            <div class="flip-card-mini" ref="hoursRef">
                <div class="half top static"><div class="num">00</div></div>
                <div class="half bottom static"><div class="num">00</div></div>
            </div>
            
            <div class="separator-mini"><div class="dot"></div><div class="dot"></div></div>

            <!-- PHÚT -->
            <div class="flip-card-mini" ref="minutesRef">
                <div class="half top static"><div class="num">00</div></div>
                <div class="half bottom static"><div class="num">00</div></div>
            </div>

            <div class="separator-mini"><div class="dot"></div><div class="dot"></div></div>

            <!-- GIÂY -->
            <div class="flip-card-mini" ref="secondsRef">
                <div class="half top static"><div class="num">00</div></div>
                <div class="half bottom static"><div class="num">00</div></div>
            </div>
          </div>
          
          <!-- AM/PM Indicator (Đã ép nằm xuống đáy và cách xa thẻ giây một chút) -->
          <span class="ms-2 fw-bold align-self-end" style="color: #4ade80; font-size: 0.85rem; font-family: 'Oswald', sans-serif; letter-spacing: 1px; text-shadow: 0 1px 3px rgba(74, 222, 128, 0.4); line-height: 1; margin-bottom: 4px;">
            {{ currentTime.ampm }}
          </span>

        </div>
      </div>

      <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
        <!-- NÚT MỞ TRẠM QUÉT (Chỉ dành cho Super Admin) -->
        <li class="nav-item me-2 d-flex align-items-center" v-if="isLoggedIn && isSuperAdmin">
          <button class="btn btn-outline-info rounded-3 btn-sm fw-bold px-3 d-flex align-items-center" @click="openStation">
            <i class="bi bi-display me-2 fs-6"></i>
            QR (Lễ tân)
          </button>
        </li>

        <!-- Nút bật Quét QR -->
        <li class="nav-item me-2 d-flex align-items-center" v-if="isLoggedIn">
          <button class="btn btn-brand rounded-3 btn-sm fw-bold px-4 d-flex align-items-center text-white shadow-sm" style="background-color: #009981;" @click="handleScanClick" :disabled="isCheckingStatus">
            <span v-if="isCheckingStatus" class="spinner-border spinner-border-sm me-2"></span>
            <template v-else>
              <i v-if="attendanceState === 'working'" class="bi bi-box-arrow-right me-2 fs-5"></i>
              <i v-else-if="attendanceState === 'completed'" class="bi bi-check-circle me-2 fs-5"></i>
              <i v-else class="bi bi-box-arrow-in-right me-2 fs-5"></i>
              {{ attendanceState === 'working' ? 'Check-out' : (attendanceState === 'completed' ? 'Hoàn thành' : 'Check-in') }}
            </template>
          </button>
        </li>

        <!-- NÚT TOGGLE DARK MODE -->
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
            <SoraImage 
              :src="adminUser.avatar" 
              :placeholder="defaultAvatar"
              imgClass="user-image rounded-circle shadow-sm me-2" 
              :width="36" :height="36"
              alt="User Image" 
            />
            <span class="d-none d-md-inline fw-semibold text-truncate" style="max-width: 150px;">{{ adminUser.name }}</span>
          </a>
          
          <ul class="dropdown-menu dropdown-menu-end shadow border mt-2 transition-all" 
              :class="[{ 'show': isUserMenuActive }, isDarkMode ? 'bg-dark border-secondary' : 'bg-white border-0']">
            <li class="user-header-modern text-white text-center p-3 rounded-top">
              <div class="d-flex justify-content-center mb-2">
                <SoraImage 
                  :src="adminUser.avatar" 
                  :placeholder="defaultAvatar"
                  imgClass="rounded-circle shadow" 
                  :width="60" :height="60"
                  alt="User Image" 
                />
              </div>
              <p class="mb-0 fw-bold">{{ adminUser.name }}</p>
              <small class="text-light opacity-75">{{ adminUser.roleName }}</small>
            </li>
            
            <li class="mt-2">
              <router-link :to="{ name: 'admin-profile' }" class="dropdown-item py-2" :class="isDarkMode ? 'text-light hover-dark' : ''" @click="isUserMenuActive = false">
                <i class="bi bi-person me-2"></i> Hồ sơ cá nhân
              </router-link>
            </li>
            
            <!-- LINK ĐẾN LỊCH SỬ CHẤM CÔNG -->
            <li>
              <router-link :to="{ name: 'admin-attendance-history' }" class="dropdown-item py-2" :class="isDarkMode ? 'text-light hover-dark' : ''" @click="isUserMenuActive = false">
                <i class="bi bi-calendar2-check me-2"></i> Lịch sử chấm công
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

        <!-- Trường hợp 2: Chưa đăng nhập - Hiển thị Nút Đăng nhập -->
        <li v-else class="nav-item">
          <router-link :to="{ name: 'admin-login' }" class="btn btn-brand-outline px-3 py-1 rounded-3 fw-bold">
            <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
          </router-link>
        </li>
      </ul>
    </div>
    
    <QrGeneratorModal ref="qrModalRef" @success="fetchAttendanceState" />
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { getFullImage } from '@/composables/useUtilities';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import * as bootstrap from 'bootstrap';

// Import component SoraImage phục vụ việc tự động fallback ảnh lỗi
import SoraImage from '@/components/ui/SoraImage.vue';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';
import QrGeneratorModal from './QrGeneratorModal.vue';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const queryClient = useQueryClient();
const isUserMenuActive = ref(false);
const userMenuContainer = ref(null);
const attendanceState = ref('ready'); // ready, working, completed, hanging

// ----- LOGIC ĐỒNG HỒ FLIP CLOCK -----
const currentTime = ref({ ampm: '' });
let timeInterval = null;
let isFirstRun = true;

// Khai báo ref cho các thẻ số để JS tương tác
const hoursRef = ref(null);
const minutesRef = ref(null);
const secondsRef = ref(null);

const triggerFlip = (card, newValue) => {
  if (!card) return;
  const topStatic = card.querySelector('.top.static .num');
  const bottomStatic = card.querySelector('.bottom.static .num');
  
  if (!topStatic || !bottomStatic) return;
  const currentValue = topStatic.innerText;
  if (currentValue === newValue) return;

  const existingFlaps = card.querySelectorAll('.flap');
  existingFlaps.forEach(flap => flap.remove());

  topStatic.innerText = newValue;

  const flapTop = document.createElement('div');
  flapTop.className = 'half top flap';
  flapTop.innerHTML = `<div class="num">${currentValue}</div>`;

  const flapBottom = document.createElement('div');
  flapBottom.className = 'half bottom flap';
  flapBottom.innerHTML = `<div class="num">${newValue}</div>`;

  card.appendChild(flapTop);
  card.appendChild(flapBottom);

  setTimeout(() => {
    if (flapTop.parentNode) flapTop.remove();
    if (flapBottom.parentNode) flapBottom.remove();
    bottomStatic.innerText = newValue; 
  }, 650); 
};

const updateTime = () => {
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  const strHours = String(hours).padStart(2, '0');
  const strMinutes = String(now.getMinutes()).padStart(2, '0');
  const strSeconds = String(now.getSeconds()).padStart(2, '0');
  
  currentTime.value.ampm = ampm;

  if (hoursRef.value && minutesRef.value && secondsRef.value) {
    if (isFirstRun) {
      hoursRef.value.querySelector('.top.static .num').innerText = strHours;
      hoursRef.value.querySelector('.bottom.static .num').innerText = strHours;
      
      minutesRef.value.querySelector('.top.static .num').innerText = strMinutes;
      minutesRef.value.querySelector('.bottom.static .num').innerText = strMinutes;
      
      secondsRef.value.querySelector('.top.static .num').innerText = strSeconds;
      secondsRef.value.querySelector('.bottom.static .num').innerText = strSeconds;
      
      isFirstRun = false;
    } else {
      triggerFlip(hoursRef.value, strHours);
      triggerFlip(minutesRef.value, strMinutes);
      triggerFlip(secondsRef.value, strSeconds);
    }
  }
};
// ------------------------------------

// LOGIC DARK MODE
const isDarkMode = ref(false);

const initTheme = () => {
  const savedTheme = localStorage.getItem('admin_theme');
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

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('admin_token');
});

const fetchAttendanceState = async () => {
  if (!isLoggedIn.value) return;
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API_URL}/admin/attendances/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    attendanceState.value = response.data.state;
  } catch (err) {
    console.error('Không thể lấy trạng thái điểm danh', err);
  }
};

const fetchAdminProfile = async () => {
  const token = localStorage.getItem('admin_token');
  if (!token) throw new Error('Không tìm thấy token xác thực');
  
  const response = await axios.get(`${API_URL}/admin/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data?.data ?? response.data;
};

const { data: adminProfileData } = useQuery({
  queryKey: ['adminProfile'],
  queryFn: fetchAdminProfile,
  enabled: isLoggedIn,
  staleTime: 5 * 60 * 1000,
  initialData: () => {
      const savedInfo = localStorage.getItem('admin_info');
      if (!savedInfo) return undefined;
      try {
        return JSON.parse(savedInfo);
      } catch {
        return undefined;
      }
  }
});

const adminUser = computed(() => {
  const data = adminProfileData.value;
  const roleId = localStorage.getItem('admin_role');
  
  if (data) {
    return {
      name: data.fullname || data.name || 'Quản trị viên',
      roleName: (data.role_id == 1 || roleId == 1) ? 'Super Admin' : 'Nhân viên',
      avatar: data.avatar_url ? getFullImage(data.avatar_url) : defaultAvatar
    };
  }
  
  return {
    name: 'Guest',
    roleName: 'Chưa xác định',
    avatar: defaultAvatar
  };
});

const toggleUserMenu = () => {
  isUserMenuActive.value = !isUserMenuActive.value;
};

const handleLogout = () => {
  isUserMenuActive.value = false;
  
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
      queryClient.clear();

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
  initTheme();
  document.addEventListener('click', closeUserMenu);
  
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  
  fetchAttendanceState();
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu);
  if (timeInterval) clearInterval(timeInterval);
});

const qrModalRef = ref(null);

const isSuperAdmin = computed(() => {
  const roleId = localStorage.getItem('admin_role');
  return roleId == 1; 
});

const openStation = () => {
  const url = router.resolve({ name: 'admin-attendance-scanner' }).href;
  window.open(url, '_blank', 'width=1000,height=700');
};

const openQrModal = () => {
  if (qrModalRef.value) {
    qrModalRef.value.openModal();
  }
};

const isCheckingStatus = ref(false);
const handleScanClick = async () => {
  if (isCheckingStatus.value) return;
  isCheckingStatus.value = true;
  
  try {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API_URL}/admin/attendances/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const state = response.data.state;
    
    if (state === 'working') {
      const result = await Swal.fire({
        title: 'Xác nhận Tan ca?',
        text: 'Bạn hiện đang trong ca làm việc. Bạn có muốn quét mã QR để xác nhận Tan ca không?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Có, Quét mã Tan ca',
        cancelButtonText: 'Đóng'
      });
      
      if (result.isConfirmed) {
        openQrModal();
      }
    } else if (state === 'hanging') {
      Swal.fire('Lỗi Ca Treo', 'Bạn đang có một ca làm việc chưa được chốt từ ngày trước. Vui lòng báo cáo Quản lý để xử lý trước khi điểm danh mới.', 'error');
    } else if (state === 'completed') {
      Swal.fire('Đã hoàn thành', 'Bạn đã hoàn thành ca làm việc hôm nay rồi.', 'info');
    } else {
      openQrModal();
    }
    
  } catch (error) {
    console.error('Lỗi check status:', error);
    openQrModal();
  } finally {
    isCheckingStatus.value = false;
  }
};
</script>

<style scoped>
/* --- FIX CSS DÀNH CHO MINI FLIP CLOCK TỶ LỆ CHUẨN --- */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');

.flip-clock-container {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.flip-clock-mini {
  display: flex;
  gap: 4px;
  align-items: center;
  font-family: 'Oswald', sans-serif;
  box-sizing: border-box; 
}

/* FIX: Mở rộng chiều ngang (width) để chữ không bị lẹm */
.flip-card-mini {
  position: relative;
  width: 38px;      /* Cân đối lại chiều ngang, rộng hơn cũ 6px */
  height: 42px;     
  background: #111; 
  border-radius: 6px;
  font-size: 32px;  /* Giảm cỡ chữ 1 tẹo cho cân đối với width mới */
  font-weight: 700;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5);
  perspective: 500px;
  color: #4ade80;   
}

/* NỬA TRÊN VÀ DƯỚI */
:deep(.half) {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: #1e1e24; 
  transform: translateZ(0);
  will-change: transform;
}

:deep(.half.top) {
  top: 0;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  transform-origin: bottom center;
  background: linear-gradient(to bottom, #3f3f46, #27272a);
}

:deep(.half.bottom) {
  bottom: 0;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  transform-origin: top center;
  background: linear-gradient(to bottom, #27272a, #18181b);
}

/* Đường cắt chia đôi */
:deep(.half.top::after) {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 1px; background: rgba(0, 0, 0, 0.4);
}

:deep(.half.bottom::after) {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 1px; background: rgba(255, 255, 255, 0.05);
}

/* FIX: Căn chỉnh chữ bên trong */
:deep(.num) {
  position: absolute;
  left: 0;
  width: 100%;
  height: 42px !important;     
  line-height: 42px !important; 
  text-align: center;
  text-shadow: 0 1px 4px rgba(74, 222, 128, 0.3);
  margin: 0; padding: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0px;
  backface-visibility: hidden;
  /* Thêm padding nhẹ nếu cần, nhưng mở width thường là đủ */
}

:deep(.half.top .num) { top: 0; }
:deep(.half.bottom .num) { bottom: 0; }
:deep(.flap) { z-index: 10; }

:deep(.flap.top) {
  animation: flipTopMini 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}
:deep(.flap.bottom) {
  transform: rotateX(90deg);
  animation: flipBottomMini 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) 0.3s forwards;
}

@keyframes flipTopMini {
  0% { transform: rotateX(0deg); filter: brightness(1); }
  100% { transform: rotateX(-90deg); filter: brightness(0.3); }
}

@keyframes flipBottomMini {
  0% { transform: rotateX(90deg); filter: brightness(0.3); }
  100% { transform: rotateX(0deg); filter: brightness(1); }
}

/* Dấu : phân cách */
.separator-mini {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 0 1px;
}
.separator-mini .dot {
  width: 5px;
  height: 5px;
  background: #4ade80; 
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(74, 222, 128, 0.6);
}

/* --- PHẦN CSS GỐC CỦA HEADER --- */
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