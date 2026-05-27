<template>
  <div class="profile-page bg-light-custom font-sans pb-5 min-vh-100 position-relative">
    
    <!-- Tiêu đề trang -->
    <section class="py-5 bg-white text-center shadow-sm mb-5">
      <div class="container py-3">
        <h1 class="display-6 font-serif text-main mb-3">Tài Khoản Của Tôi</h1>
        <div class="divider bg-accent mx-auto"></div>
      </div>
    </section>

    <div class="container">
      <div v-if="!isLoggedIn" class="text-center py-5 bg-white shadow-sm p-5 border border-light mb-5">
        <h4 class="text-danger-custom mb-3">Bạn chưa đăng nhập!</h4>
        <p class="text-secondary mb-4">Vui lòng đăng nhập để xem và chỉnh sửa thông tin cá nhân.</p>
        <router-link to="/login" class="btn btn-main px-5 py-2 text-uppercase">Đăng nhập ngay</router-link>
      </div>

      <div v-else class="row g-4 g-lg-5">
        
        <!-- SIDEBAR MENU BÊN TRÁI -->
        <div class="col-lg-3">
          <div class="bg-white p-4 shadow-sm border border-light text-center mb-4 rounded-3">
            
            <svg width="0" height="0" style="position:absolute">
              <defs>
                <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#bdbdbd" />
                  <stop offset="100%" style="stop-color:#9e9e9e" />
                </linearGradient>
                <linearGradient id="grad-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e0e0e0" />
                  <stop offset="50%" style="stop-color:#b0b0b0" />
                  <stop offset="100%" style="stop-color:#c8c8c8" />
                </linearGradient>
                <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffd700" />
                  <stop offset="50%" style="stop-color:#f5a623" />
                  <stop offset="100%" style="stop-color:#ffec8b" />
                </linearGradient>
                <linearGradient id="grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#76d7f5" />
                  <stop offset="50%" style="stop-color:#4dd0e1" />
                  <stop offset="100%" style="stop-color:#a8e6f0" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Avatar + Huy Hiệu Tier (Shopee-style) -->
            <div class="avatar-tier-container mx-auto mb-4 position-relative" style="width: 140px; height: 155px;">
              
              <!-- HUY HIỆU TIER phía trên avatar -->
              <div class="tier-badge-crown" :class="tierBadgeClass" v-if="currentTierInfo.name">
                <div class="tier-badge-inner">
                  <span class="tier-badge-svg" v-html="tierSvgIcon"></span>
                  <span class="tier-badge-label">{{ currentTierInfo.name }}</span>
                </div>
              </div>
              <div class="tier-badge-crown tier-default" v-else>
                <div class="tier-badge-inner">
                  <span class="tier-badge-svg" v-html="tierSvgDefault"></span>
                  <span class="tier-badge-label">Thành viên</span>
                </div>
              </div>

              <!-- Avatar -->
              <div class="avatar-wrapper mx-auto position-relative rounded-circle overflow-hidden bg-light" 
                   style="width: 120px; height: 120px; cursor: pointer; border: 4px solid #fff; box-shadow: 0 0 0 3px var(--tier-border-color, #e7ce7d), 0 8px 16px rgba(0,0,0,0.1);" 
                   :style="{ '--tier-border-color': tierBorderColor }"
                   @click="triggerFileInput" title="Click để thay đổi ảnh đại diện">
                
                <img :src="previewAvatar || getImageUrl(form.avatar_url) || 'https://ui-avatars.com/api/?name=' + (form.fullName || 'User') + '&background=9f273b&color=fff'" 
                     alt="Avatar" class="w-100 h-100 object-fit-cover" style="object-position: center;">
                
                <div class="avatar-upload-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="small mt-1 fw-medium" style="font-size: 0.75rem; letter-spacing: 0.5px;">Đổi ảnh</span>
                </div>
              </div>
            </div>
            
            <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileChange">

            <h5 class="font-serif text-dark mb-1 fw-bold" style="font-size: 1.25rem;">{{ form.fullName || 'Thành viên SORA' }}</h5>
            <p class="text-muted small fw-light mb-0">{{ form.email }}</p>
          </div>

          <!-- Menu Nav -->
          <div class="bg-white shadow-sm border border-light overflow-hidden rounded-3">
            <ul class="list-unstyled mb-0 profile-menu">
              <li>
                <a href="#" @click.prevent="activeTab = 'profile'" class="d-flex align-items-center p-3 text-decoration-none" :class="activeTab === 'profile' ? 'active-menu' : 'text-secondary'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Hồ sơ cá nhân
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="activeTab = 'tier'" class="d-flex align-items-center p-3 text-decoration-none" :class="activeTab === 'tier' ? 'active-menu' : 'text-secondary'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  Hạng thành viên
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="activeTab = 'password'" class="d-flex align-items-center p-3 text-decoration-none" :class="activeTab === 'password' ? 'active-menu' : 'text-secondary'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Đổi mật khẩu
                </a>
              </li>
              <li>
                <router-link to="/order" class="d-flex align-items-center p-3 text-decoration-none text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Đơn mua của tôi
                </router-link>
              </li>
              <li>
                <router-link to="/favourite" class="d-flex align-items-center p-3 text-decoration-none text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Sản phẩm yêu thích
                </router-link>
              </li>
              <li class="border-top">
                <a href="#" @click.prevent="logout" class="d-flex align-items-center p-3 text-decoration-none text-danger-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-3"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- CÁC FORM CẬP NHẬT BÊN PHẢI -->
        <div class="col-lg-9">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-accent" role="status"></div>
          </div>
          
          <div v-else>
            <!-- Tab Contents -->
            <ProfileForm 
              v-if="activeTab === 'profile'" 
              :initialForm="form" 
              :avatarFile="avatarFile"
              @profile-updated="onProfileUpdated" 
            />
            
            <TierCard 
              v-if="activeTab === 'tier'" 
              :form="form" 
            />
            
            <PasswordForm 
              v-if="activeTab === 'password'" 
            />

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import ProfileForm from './components/ProfileForm.vue';
import TierCard from './components/TierCard.vue';
import PasswordForm from './components/PasswordForm.vue';

const router = useRouter();

const activeTab = ref('profile'); // profile, tier, password

const isLoggedIn = ref(false);
const isLoading = ref(true);

const fileInput = ref(null);
const avatarFile = ref(null);
const previewAvatar = ref(null);

const form = ref({
  fullName: '', email: '', phone: '', gender: '', birthday: '', avatar_url: '',
  tier_id: null, accumulated_spent: 0, accumulated_orders: 0, tier: null, all_tiers: []
});

const apiBase = `${import.meta.env.VITE_API_BASE_URL}/client/profile`; 

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
      }
    } catch(e) {}
  }
  return '';
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://127.0.0.1:8000/storage/${path}`;
};

const triggerFileInput = () => { fileInput.value.click(); };
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
  }
};

const onProfileUpdated = (updatedData) => {
  form.value.fullName = updatedData.fullName;
  if (updatedData.avatar_url) form.value.avatar_url = updatedData.avatar_url;
  form.value.phone = updatedData.phone;
  form.value.gender = updatedData.gender;
  form.value.birthday = updatedData.birthday;
  
  previewAvatar.value = null;
  avatarFile.value = null;

  // Cập nhật localStorage để header đồng bộ
  updateLocalAuthData(updatedData);
};

const updateLocalAuthData = (newData) => {
  try {
    let authState = JSON.parse(localStorage.getItem('auth') || '{}');
    if (authState.user) {
      authState.user.fullName = newData.fullName;
      if (newData.avatar_url) authState.user.avatar_url = newData.avatar_url;
      localStorage.setItem('auth', JSON.stringify(authState));
    }
  } catch(err) {
    return err;
  }
};

const fetchProfile = async () => {
  try {
    const response = await axios.get(apiBase, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    
    if (response.data.status) {
      const userData = response.data.data;
      form.value = {
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthday: userData.birthday || '',
        avatar_url: userData.avatar_url || '',
        tier_id: userData.tier_id || null,
        accumulated_spent: parseFloat(userData.accumulated_spent) || 0,
        accumulated_orders: parseInt(userData.accumulated_orders) || 0,
        tier: userData.tier || null,
        all_tiers: userData.all_tiers || []
      };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      isLoggedIn.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login'; 
};

onMounted(() => {
  const token = getToken();
  if (token) {
    isLoggedIn.value = true;
    fetchProfile();
  } else {
    isLoggedIn.value = false;
    isLoading.value = false;
  }
});

// ===== TÍNH TOÁN THÔNG TIN HẠNG THÀNH VIÊN =====
const currentTierInfo = computed(() => {
  if (form.value.tier) {
    return { name: form.value.tier.name };
  }
  return { name: '' };
});

const tierBadgeClass = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return 'tier-diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'tier-gold';
  if (name.includes('bạc') || name.includes('silver')) return 'tier-silver';
  return 'tier-default';
});

const svgStar = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgShield = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const svgCrown = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M2 20h20v2H2zM4 17l2-10 4 4 2-6 2 6 4-4 2 10H4z"/></svg>`;
const svgDiamond = (size, gradId) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#${gradId})"><path d="M19 3H5L2 9l10 12L22 9l-3-6zM12 17.5L5.5 9h13L12 17.5z"/></svg>`;

const tierSvgDefault = svgStar(15, 'grad-default');

const tierSvgIcon = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return svgDiamond(15, 'grad-diamond');
  if (name.includes('vàng') || name.includes('gold')) return svgCrown(15, 'grad-gold');
  if (name.includes('bạc') || name.includes('silver')) return svgShield(15, 'grad-silver');
  return svgStar(15, 'grad-default');
});

const tierBorderColor = computed(() => {
  const name = (currentTierInfo.value.name || '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return '#b9f2ff';
  if (name.includes('vàng') || name.includes('gold')) return '#ffd700';
  if (name.includes('bạc') || name.includes('silver')) return '#c0c0c0';
  return '#e7ce7d';
});
</script>

<style scoped>
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }

.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.divider { width: 4rem; height: 2px; }
.object-fit-cover { object-fit: cover !important; }

.btn-main {
  background-color: #9f273b;
  color: white;
  border: none;
  transition: all 0.3s ease;
}
.btn-main:hover {
  background-color: #832030;
  color: white;
}

.avatar-tier-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tier-badge-crown {
  display: flex;
  justify-content: center;
  margin-bottom: -8px;
  z-index: 2;
  position: relative;
  animation: badgeFloat 3s ease-in-out infinite;
}

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.tier-badge-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.tier-badge-svg { display: flex; align-items: center; line-height: 0; }
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

.profile-menu a {
  transition: all 0.3s ease;
}
.profile-menu a:hover {
  background-color: #faf9f8;
  color: #9f273b !important;
}
.active-menu {
  color: #9f273b !important;
  background-color: #f8eaec;
  font-weight: 500;
  border-left: 3px solid #9f273b;
}

.avatar-upload-overlay {
  background-color: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}
</style>
