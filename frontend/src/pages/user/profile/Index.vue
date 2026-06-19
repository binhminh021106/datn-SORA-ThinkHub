<template>
  <div>
          <SoraListSkeleton v-if="isLoading" :rows="4" :image="false" card />
          
          <div v-else-if="!isLoggedIn" class="alert alert-warning m-4 bg-light-custom border-main text-main p-4 text-center rounded-0 font-inter shadow-sm">
            <i class="bi bi-exclamation-triangle-fill fs-3 mb-2 d-block"></i>
            <h5 class="font-oswald fw-bold tracking-wide">PHIÊN ĐĂNG NHẬP HẾT HẠN</h5>
            <p class="mb-3 small text-muted">Vui lòng đăng nhập lại để tiếp tục sử dụng các tính năng tài khoản.</p>
            <router-link to="/login" class="btn editorial-btn px-4 py-2">Đăng nhập ngay</router-link>
          </div>

          <div v-else>
            <ProfileForm 
              v-if="activeTab === 'profile'" 
              :initialForm="form" 
              :avatarFile="avatarFile"
              @profile-updated="onProfileUpdated" 
              @go-address-book="activeTab = 'address'; router.push({ query: { tab: 'address' } })"
            />
            

            <PasswordForm 
              v-if="activeTab === 'password'" 
            />

            <AddressBook 
              v-if="activeTab === 'address'"
              :userName="form.fullName"
              :userPhone="form.phone"
            />

            <AffiliateTab 
              v-if="activeTab === 'affiliate'" 
            />
          </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ProfileForm from './components/ProfileForm.vue';
import PasswordForm from './components/PasswordForm.vue';
import AddressBook from './components/AddressBook.vue';
import AffiliateTab from './components/AffiliateTab.vue';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import { getStorageUrl } from '@/utils/env';
import clientApiClient from '@/utils/clientApiClient';
import { getUserToken } from '@/composables/useUtilities';

const router = useRouter();
const route = useRoute();

// Tab active: ưu tiên query string ?tab= rồi fallback về 'profile'
const activeTab = ref(route.query.tab || 'profile');

// Sync tab khi query thay đổi (VD: ProfileSidebar navigate qua router-link)
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['profile', 'password', 'address', 'affiliate'].includes(newTab)) {
    activeTab.value = newTab;
  } else if (!newTab && route.path === '/profile') {
    activeTab.value = 'profile';
  }
});

const isLoggedIn = ref(false);
const isLoading = ref(true);

const fileInput = ref(null);
const avatarFile = ref(null);
const previewAvatar = ref(null);

const form = ref({
  fullName: '', email: '', phone: '', gender: '', birthday: '', avatar_url: '',
  tier_id: null, accumulated_spent: 0, accumulated_orders: 0, tier: null, all_tiers: []
});

const getImageUrl = (path) => {
  if (!path) return null;
  return getStorageUrl(path, null);
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
    const response = await clientApiClient.get('/client/profile');
    
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
  const token = getUserToken();
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
  border: 1px solid #9f273b;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.btn-main:hover {
  background-color: #7a1c2d;
  border-color: #7a1c2d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(159,39,59,0.3);
}

.tracking-wide { letter-spacing: 0.1em; }

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
