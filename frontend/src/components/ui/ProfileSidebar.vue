<template>
  <div class="profile-sidebar">
    <!-- Avatar & User Info Card -->
    <div class="sidebar-user-card bg-white p-4 shadow-sm border border-light text-center mb-3 rounded-3">
      <svg width="0" height="0" style="position:absolute">
        <defs>
          <linearGradient id="psb-grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#bdbdbd" />
            <stop offset="100%" style="stop-color:#9e9e9e" />
          </linearGradient>
          <linearGradient id="psb-grad-silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e0e0e0" />
            <stop offset="50%" style="stop-color:#b0b0b0" />
            <stop offset="100%" style="stop-color:#c8c8c8" />
          </linearGradient>
          <linearGradient id="psb-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffd700" />
            <stop offset="50%" style="stop-color:#f5a623" />
            <stop offset="100%" style="stop-color:#ffec8b" />
          </linearGradient>
          <linearGradient id="psb-grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#76d7f5" />
            <stop offset="50%" style="stop-color:#4dd0e1" />
            <stop offset="100%" style="stop-color:#a8e6f0" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Avatar + Tier Badge -->
      <div class="avatar-tier-container mx-auto mb-3 position-relative" style="width: 130px; height: 145px;">
        <!-- Tier Badge -->
        <div class="tier-badge-crown" :class="tierBadgeClass" v-if="tierName">
          <div class="tier-badge-inner">
            <span class="tier-badge-svg" v-html="tierSvgIcon"></span>
            <span class="tier-badge-label">{{ tierName }}</span>
          </div>
        </div>
        <div class="tier-badge-crown tier-default" v-else>
          <div class="tier-badge-inner">
            <span class="tier-badge-svg" v-html="tierSvgDefault"></span>
            <span class="tier-badge-label">Thành viên</span>
          </div>
        </div>

        <!-- Avatar -->
        <div
          class="avatar-wrapper mx-auto position-relative rounded-circle overflow-hidden bg-light"
          style="width: 110px; height: 110px; border: 4px solid #fff;"
          :style="{ boxShadow: `0 0 0 3px ${tierBorderColor}, 0 8px 16px rgba(0,0,0,0.1)` }"
        >
          <img
            :src="avatarSrc"
            alt="Avatar"
            class="w-100 h-100"
            style="object-fit: cover; object-position: center;"
          >
        </div>
      </div>

      <h5 class="font-serif text-dark mb-1 fw-bold" style="font-size: 1.1rem;">{{ displayName }}</h5>
      <p class="text-muted small fw-light mb-0">{{ email }}</p>
    </div>

    <!-- Navigation Menu -->
    <div class="bg-white shadow-sm border border-light overflow-hidden rounded-3">
      <ul class="list-unstyled mb-0 profile-menu">
        <!-- Hồ sơ cá nhân -->
        <li>
          <router-link
            to="/profile"
            class="d-flex align-items-center p-3 text-decoration-none"
            :class="isActive('/profile') ? 'active-menu' : 'text-secondary'"
            @click.native="$emit('navigate')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Hồ sơ cá nhân
          </router-link>
        </li>



        <!-- Đổi mật khẩu -->
        <li>
          <router-link
            to="/profile?tab=password"
            class="d-flex align-items-center p-3 text-decoration-none"
            :class="isActive('/profile', 'password') ? 'active-menu' : 'text-secondary'"
            @click.native="$emit('navigate')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Đổi mật khẩu
          </router-link>
        </li>

        <!-- Sổ địa chỉ -->
        <li>
          <router-link
            to="/profile?tab=address"
            class="d-flex align-items-center p-3 text-decoration-none"
            :class="isActive('/profile', 'address') ? 'active-menu' : 'text-secondary'"
            @click.native="$emit('navigate')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Sổ địa chỉ
          </router-link>
        </li>

        <!-- Đơn mua của tôi -->
        <li>
          <router-link
            to="/order"
            class="d-flex align-items-center p-3 text-decoration-none"
            :class="isActive('/order') ? 'active-menu' : 'text-secondary'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Đơn mua của tôi
          </router-link>
        </li>

        <!-- Sản phẩm yêu thích -->
        <li>
          <router-link
            to="/favourite"
            class="d-flex align-items-center p-3 text-decoration-none"
            :class="isActive('/favourite') ? 'active-menu' : 'text-secondary'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Sản phẩm yêu thích
          </router-link>
        </li>

        <!-- Đăng xuất -->
        <li class="border-top">
          <a
            href="#"
            @click.prevent="handleLogout"
            class="d-flex align-items-center p-3 text-decoration-none text-danger-custom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  /** Cho phép truyền thẳng user data từ parent */
  user: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['navigate', 'logout']);

const route = useRoute();

// ===== USER DATA =====
const userData = ref({
  fullName: '',
  email: '',
  avatar_url: '',
  tier: null
});

const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val;
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed && typeof parsed === 'object') {
        if (parsed.access_token) return parsed.access_token;
        if (parsed.token) return parsed.token;
        if (parsed.user) {
          const u = parsed.user;
          if (u.fullName || u.name || u.email) {
            // Lấy user info từ auth store nếu có
            userData.value.fullName = u.fullName || u.name || '';
            userData.value.email = u.email || '';
            userData.value.avatar_url = u.avatar_url || '';
          }
        }
      }
    } catch(e) {}
  }
  return '';
};

const loadUserFromStorage = () => {
  // Thử lấy từ auth store
  try {
    const authRaw = localStorage.getItem('auth');
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth.user) {
        userData.value.fullName = auth.user.fullName || auth.user.name || '';
        userData.value.email = auth.user.email || '';
        userData.value.avatar_url = auth.user.avatar_url || '';
        return;
      }
    }
  } catch(e) {}

  // Thử các key phổ biến khác
  const userKeys = ['user', 'userInfo', 'currentUser'];
  for (const k of userKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.fullName)) {
          userData.value.fullName = parsed.fullName || parsed.name || '';
          userData.value.email = parsed.email || '';
          userData.value.avatar_url = parsed.avatar_url || '';
          return;
        }
      }
    } catch(e) {}
  }
};

// ===== COMPUTED =====
const displayName = computed(() => {
  if (props.user) return props.user.fullName || props.user.name || 'Thành viên SORA';
  return userData.value.fullName || 'Thành viên SORA';
});

const email = computed(() => {
  if (props.user) return props.user.email || '';
  return userData.value.email || '';
});

const tierName = computed(() => {
  const tier = props.user?.tier || userData.value.tier;
  return tier?.name || '';
});

const avatarSrc = computed(() => {
  const url = props.user?.avatar_url || userData.value.avatar_url;
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value || 'User')}&background=9f273b&color=fff`;
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:8000/storage/${url}`;
});

// ===== TIER STYLES =====
const tierBadgeClass = computed(() => {
  const name = tierName.value.toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return 'tier-diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'tier-gold';
  if (name.includes('bạc') || name.includes('silver')) return 'tier-silver';
  return 'tier-default';
});

const tierBorderColor = computed(() => {
  const name = tierName.value.toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return '#b9f2ff';
  if (name.includes('vàng') || name.includes('gold')) return '#ffd700';
  if (name.includes('bạc') || name.includes('silver')) return '#c0c0c0';
  return '#e7ce7d';
});

const svgStar   = (s, g) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="url(#${g})"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgShield = (s, g) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="url(#${g})"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const svgCrown  = (s, g) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="url(#${g})"><path d="M2 20h20v2H2zM4 17l2-10 4 4 2-6 2 6 4-4 2 10H4z"/></svg>`;
const svgDiamond= (s, g) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="url(#${g})"><path d="M19 3H5L2 9l10 12L22 9l-3-6zM12 17.5L5.5 9h13L12 17.5z"/></svg>`;

const tierSvgDefault = svgStar(14, 'psb-grad-default');
const tierSvgIcon = computed(() => {
  const name = tierName.value.toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return svgDiamond(14, 'psb-grad-diamond');
  if (name.includes('vàng') || name.includes('gold')) return svgCrown(14, 'psb-grad-gold');
  if (name.includes('bạc') || name.includes('silver')) return svgShield(14, 'psb-grad-silver');
  return svgStar(14, 'psb-grad-default');
});

// ===== ACTIVE STATE =====
const isActive = (path, tab = null) => {
  if (route.path !== path) return false;
  if (!tab) {
    // Nếu không có tab param, active khi route là /profile mà không có tab=tier hay tab=password
    if (path === '/profile') {
      const currentTab = route.query.tab;
      return !currentTab || currentTab === 'profile';
    }
    return true;
  }
  return route.query.tab === tab;
};

// ===== LOGOUT =====
const handleLogout = () => {
  emit('logout');
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login';
};

// ===== LIFECYCLE =====
onMounted(() => {
  if (!props.user) {
    loadUserFromStorage();
  }
});
</script>

<style scoped>
.profile-sidebar {
  font-family: 'Lato', 'Segoe UI', sans-serif;
}

.sidebar-user-card {
  transition: box-shadow 0.3s ease;
}

.avatar-tier-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Tier Badge */
.tier-badge-crown {
  display: flex;
  justify-content: center;
  margin-bottom: -8px;
  z-index: 2;
  position: relative;
  animation: psbBadgeFloat 3s ease-in-out infinite;
}

@keyframes psbBadgeFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-3px); }
}

.tier-badge-inner {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.tier-badge-svg   { display: flex; align-items: center; line-height: 0; }
.tier-badge-label { text-transform: uppercase; }

.tier-default .tier-badge-inner {
  background: #f5f5f5;
  color: #757575;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.tier-silver .tier-badge-inner {
  background: linear-gradient(135deg, #f5f5f5 0%, #d6d6d6 50%, #ececec 100%);
  color: #5a5a5a;
  border: 1px solid #c0c0c0;
  box-shadow: 0 2px 10px rgba(150,150,150,0.25), inset 0 1px 0 rgba(255,255,255,0.6);
}
.tier-gold .tier-badge-inner {
  background: linear-gradient(135deg, #fceabb 0%, #f8b500 50%, #fce38a 100%);
  color: #7a5800;
  border: 1px solid #e6a800;
  box-shadow: 0 2px 12px rgba(245,166,35,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
}
.tier-diamond .tier-badge-inner {
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 40%, #b2ebf2 70%, #e0f7fa 100%);
  color: #00838f;
  border: 1px solid #4dd0e1;
  box-shadow: 0 2px 14px rgba(77,208,225,0.35), inset 0 1px 0 rgba(255,255,255,0.7);
}

/* Navigation Menu */
.profile-menu a {
  transition: all 0.25s ease;
  font-size: 0.93rem;
  font-weight: 500;
}
.profile-menu a:hover {
  background-color: #faf9f8;
  color: #9f273b !important;
}
.active-menu {
  color: #9f273b !important;
  background-color: #f8eaec;
  font-weight: 600;
  border-left: 3px solid #9f273b;
}
.text-danger-custom {
  color: #cc1e2e !important;
}
.text-danger-custom:hover {
  background-color: #fff5f5 !important;
  color: #cc1e2e !important;
}

.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
</style>
