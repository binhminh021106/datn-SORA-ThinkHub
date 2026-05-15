<template>
  <div class="staff-edit-wrapper">
    
    <div class="container-fluid py-4" v-if="isLoaded">
      <!-- Header & Badge Cấp độ trang -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-8 d-flex align-items-center">
          <router-link :to="{ name: 'admin-staff-index' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div>
            <h3 class="fw-bold text-dark mb-0">
              Hồ sơ Nhân Sự 
              <span v-if="isCurrentUser" class="badge bg-primary align-middle ms-2" style="font-size: 0.75rem;">(Bạn)</span>
            </h3>
            <p class="text-muted mb-0 small">Cập nhật thông tin nhân viên #{{ route.params.id }}</p>
          </div>
        </div>
        
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small d-inline-block" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>
        </div>
      </div>

      <div class="alert alert-info border-0 shadow-sm mb-4" v-if="isCurrentUser">
        <i class="bi bi-info-circle-fill me-2"></i> 
        <strong>Lưu ý:</strong> Bạn đang sửa tài khoản của chính mình. Bạn không thể tự thay đổi <strong>Chức vụ</strong> và <strong>Trạng thái</strong> của bản thân.
      </div>

      <form @submit.prevent="updateStaff">
        <div class="row g-4">
          <!-- ================= CỘT TRÁI: AVATAR & TRẠNG THÁI ================= -->
          <div class="col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 text-center p-4 h-100">
              <label class="form-label fw-bold mb-3 text-dark">Ảnh đại diện</label>
              <div class="position-relative d-inline-block mx-auto mb-3">
                <img :src="previewAvatar" class="rounded-circle shadow-sm border border-3 border-white object-fit-cover" style="width: 140px; height: 140px;" alt="Avatar">
                <label for="avatarUpload" class="position-absolute bottom-0 end-0 bg-brand rounded-circle shadow-sm p-2 text-white cursor-pointer" title="Đổi ảnh đại diện">
                  <i class="bi bi-camera-fill fs-6"></i>
                </label>
                <input type="file" id="avatarUpload" class="d-none" accept="image/png, image/jpeg" @change="handleAvatarChange">
              </div>
              
              <h5 class="fw-bold text-dark mb-1">{{ form.fullname || 'Nhân viên' }}</h5>
              <span class="badge mb-3 px-3 py-2 rounded-pill text-white" :class="form.status === 'active' ? 'bg-success' : 'bg-danger'">
                <i class="bi me-1" :class="form.status === 'active' ? 'bi-check-circle' : 'bi-lock-fill'"></i>
                {{ form.status === 'active' ? 'Đang hoạt động' : 'Đã bị khóa' }}
              </span>

              <div class="mb-3" v-if="previewAvatar && !previewAvatar.includes('avatar1.png') && !selectedFile">
                <button type="button" @click="removeAvatar" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold w-100 shadow-sm">
                  <i class="bi bi-trash me-1"></i> Xóa ảnh hiện tại
                </button>
              </div>
              
              <hr class="text-muted opacity-25 my-3">

              <div class="text-start">
                <label class="form-label fw-bold text-muted small text-uppercase mb-2">Cập nhật Trạng thái</label>
                <!-- Nút chọn trạng thái được thu nhỏ và thêm nền tương phản -->
                <select class="form-select fw-bold shadow-sm" v-model="form.status" required :disabled="isCurrentUser" :class="form.status === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-danger border-danger bg-danger bg-opacity-10'">
                  <option value="active" class="text-success fw-bold">Hoạt động (Active)</option>
                  <option value="locked" class="text-danger fw-bold">Khóa (Locked)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ================= CỘT PHẢI: THÔNG TIN CHI TIẾT ================= -->
          <div class="col-md-8 col-lg-9">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-person-lines-fill text-brand me-2"></i> Thông tin cá nhân</h5>
              </div>
              <div class="card-body p-4 pt-3">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Họ và tên <span class="text-danger">*</span></label>
                    <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.fullname" required>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Số điện thoại</label>
                    <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.phone">
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-muted">Email đăng nhập <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm">
                      <span class="input-group-text bg-light text-muted border-secondary-subtle"><i class="bi bi-envelope"></i></span>
                      <input type="email" class="form-control bg-light text-muted cursor-not-allowed border-secondary-subtle shadow-none" v-model="form.email" required readonly disabled>
                    </div>
                    <small class="text-danger mt-1 d-block" style="font-size: 0.75rem;">Không được phép thay đổi email.</small>
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Đổi mật khẩu <span class="text-muted fw-normal small">(Tùy chọn)</span></label>
                    <div class="input-group shadow-sm">
                      <span class="input-group-text bg-white text-muted border-secondary-subtle"><i class="bi bi-key"></i></span>
                      <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.password" placeholder="Bỏ trống nếu không đổi">
                    </div>
                  </div>

                  <!-- ================= DROPDOWN ĐỊA CHỈ XỊN XÒ ================= -->
                  <div class="col-12 mb-2 mt-2">
                    <label class="form-label fw-bold text-dark border-bottom pb-2 w-100"><i class="bi bi-geo-alt-fill text-brand me-1"></i> Địa chỉ thường trú</label>
                  </div>
                  
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-semibold text-dark small">Tỉnh/Thành phố</label>
                    <select class="form-select bg-white border-secondary-subtle shadow-none fw-medium" v-model="selectedCityId" @change="onCityChange">
                      <option value="">-- Chọn Tỉnh/Thành --</option>
                      <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.full_name }}</option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-semibold text-dark small">Quận/Huyện</label>
                    <select class="form-select bg-white border-secondary-subtle shadow-none fw-medium" v-model="selectedDistrictId" @change="onDistrictChange" :disabled="!selectedCityId">
                      <option value="">-- Chọn Quận/Huyện --</option>
                      <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.full_name }}</option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-semibold text-dark small">Phường/Xã</label>
                    <select class="form-select bg-white border-secondary-subtle shadow-none fw-medium" v-model="selectedWardId" @change="onWardChange" :disabled="!selectedDistrictId">
                      <option value="">-- Chọn Phường/Xã --</option>
                      <option v-for="w in wards" :key="w.id" :value="w.id">{{ w.full_name }}</option>
                    </select>
                  </div>
                  <div class="col-md-12 mb-4">
                    <label class="form-label fw-semibold text-dark small">Địa chỉ cụ thể (Số nhà, đường)</label>
                    <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="specificAddress" placeholder="VD: Số 12, Đường ABCD">
                  </div>
                  <!-- ================= KẾT THÚC ĐỊA CHỈ ================= -->

                  <div class="col-12 mb-4 mt-2">
                    <label class="form-label fw-bold text-dark">Cấp quyền Chức vụ (Role) <span class="text-danger">*</span></label>
                    <select class="form-select form-select-lg bg-light border-secondary-subtle fw-bold text-dark" v-model="form.role_id" required :disabled="isCurrentUser || route.params.id == 1">
                      <option v-for="r in roles" :key="r.id" :value="r.id">Cấp {{ r.level }}: {{ r.label }}</option>
                    </select>
                  </div>
                </div>

                <div class="text-end border-top pt-4 mt-2">
                  <router-link :to="{ name: 'admin-staff-index' }" class="btn btn-light me-2 px-4 fw-bold shadow-sm">Hủy bỏ</router-link>
                  <button type="submit" class="btn btn-brand px-5 fw-bold text-white shadow-sm" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU THAY ĐỔI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <!-- HIỆU ỨNG LOGO SHIMMER (MÀN HÌNH CHỜ) -->
    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu...
      </p>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { getFullImage } from '@/composables/useUtilities';
import defaultAvatar from '../../../../assets/images/defaults/avatar1.png';

const route = useRoute();
const router = useRouter();
const roles = ref([]);
const isSaving = ref(false);
const isLoaded = ref(false);
const currentPageLevel = ref(null);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || API_URL.replace(/\/api\/?$/, '');

const previewAvatar = ref(defaultAvatar);
const selectedFile = ref(null);
const isRemoveAvatar = ref(false);

const form = ref({ fullname: '', email: '', password: '', phone: '', address: '', role_id: '', status: '' });

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedCityId = ref('');
const selectedDistrictId = ref('');
const selectedWardId = ref('');
const specificAddress = ref('');

const currentAdmin = JSON.parse(localStorage.getItem('admin_info') || '{}');
const currentUserId = currentAdmin.id;

const isCurrentUser = computed(() => {
  return Number(route.params.id) === currentUserId;
});

const getLevelColor = (level) => {
  if(!level) return 'bg-secondary';
  const l = parseInt(level);
  switch (l) {
    case 1: return 'bg-danger text-white border-danger shadow-sm';         
    case 2: return 'bg-warning text-dark border-warning';                  
    case 3: return 'bg-info text-dark border-info';                        
    case 4: return 'bg-primary bg-opacity-10 text-primary border-primary'; 
    case 5: return 'bg-success bg-opacity-10 text-success border-success'; 
    default: return 'bg-light text-secondary border-secondary'; 
  }
};

const findLocationByName = (list, name) => {
  if (!name || !list) return null;
  return list.find(item => item.full_name === name || item.name === name || name.includes(item.name));
};

const fetchProvinces = async () => {
  try {
    const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
    const data = await res.json();
    if(data.error === 0) provinces.value = data.data;
  } catch(e) {}
};

const onCityChange = async () => {
  districts.value = []; wards.value = [];
  selectedDistrictId.value = ''; selectedWardId.value = '';
  if (selectedCityId.value) {
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${selectedCityId.value}.htm`);
      const data = await res.json();
      if(data.error === 0) districts.value = data.data;
    } catch(e) {}
  }
};

const onDistrictChange = async () => {
  wards.value = []; selectedWardId.value = '';
  if (selectedDistrictId.value) {
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrictId.value}.htm`);
      const data = await res.json();
      if(data.error === 0) wards.value = data.data;
    } catch(e) {}
  }
};

const onWardChange = () => {};

const parseAddressToDropdowns = async (fullAddress) => {
  if (!fullAddress) return;
  const parts = fullAddress.split(', ').map(p => p.trim());
  
  if (parts.length >= 3) {
    const cityStr = parts[parts.length - 1];
    const distStr = parts[parts.length - 2];
    const wardStr = parts[parts.length - 3];
    const specStr = parts.slice(0, parts.length - 3).join(', ');
    
    specificAddress.value = specStr;
    
    await fetchProvinces();
    const cityObj = findLocationByName(provinces.value, cityStr);
    if (cityObj) {
      selectedCityId.value = cityObj.id;
      await onCityChange();
      
      const distObj = findLocationByName(districts.value, distStr);
      if (distObj) {
        selectedDistrictId.value = distObj.id;
        await onDistrictChange();
        
        const wardObj = findLocationByName(wards.value, wardStr);
        if (wardObj) selectedWardId.value = wardObj.id;
      }
    }
  } else {
    specificAddress.value = fullAddress; 
  }
};

const fetchRolesAndStaff = async () => {
  try {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` };
    
    await fetchProvinces();

    const [resRoles, resStaff, resModules] = await Promise.all([
      fetch(`${API_URL}/admin/roles`, { headers }),
      fetch(`${API_URL}/admin/staff/${route.params.id}`, { headers }),
      fetch(`${API_URL}/admin/modules`, { headers })
    ]);
    
    if (resRoles.ok) roles.value = (await resRoles.json()).data;
    
    if (resStaff.ok) {
      const s = (await resStaff.json()).data;
      form.value = { fullname: s.fullname, email: s.email, phone: s.phone, address: s.address || '', role_id: s.role_id, status: s.status, password: '' };
      previewAvatar.value = s.avatar_url ? getFullImage(s.avatar_url) : defaultAvatar;
      
      await parseAddressToDropdowns(s.address);
    } else {
      router.push({ name: 'admin-staff-index' });
    }

    if (resModules.ok) {
      const modules = (await resModules.json()).data;
      const currentCode = route.meta.moduleCode;
      if (currentCode) {
        const currentModule = modules.find(m => m.module_code === currentCode);
        if (currentModule) currentPageLevel.value = currentModule.required_level;
      }
    }
  } catch (err) { 
    console.error(err); 
  } finally { 
    isLoaded.value = true; 
  }
};

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
    isRemoveAvatar.value = false;
  }
};

const removeAvatar = () => {
  selectedFile.value = null;
  previewAvatar.value = defaultAvatar;
  isRemoveAvatar.value = true;
};

const updateStaff = async () => {
  isSaving.value = true;

  let finalAddress = specificAddress.value;
  const cityName = provinces.value.find(p => p.id === selectedCityId.value)?.full_name || '';
  const distName = districts.value.find(d => d.id === selectedDistrictId.value)?.full_name || '';
  const wardName = wards.value.find(w => w.id === selectedWardId.value)?.full_name || '';

  if (cityName || distName || wardName) {
    finalAddress = `${specificAddress.value ? specificAddress.value + ', ' : ''}${wardName ? wardName + ', ' : ''}${distName ? distName + ', ' : ''}${cityName}`;
  }
  form.value.address = finalAddress.replace(/(^, )|(,$)/g, '').trim();

  const formData = new FormData();
  formData.append('_method', 'PUT'); 
  
  Object.keys(form.value).forEach(key => {
    if (key === 'password' && !form.value.password) return; 
    if (key === 'status' && isCurrentUser.value) return formData.append('status', form.value.status);
    if (key === 'role_id' && isCurrentUser.value) return formData.append('role_id', form.value.role_id);
    if (key === 'email') return formData.append('email', form.value.email);

    formData.append(key, form.value[key] || '');
  });
  if (selectedFile.value) formData.append('avatar', selectedFile.value);
  if (isRemoveAvatar.value) formData.append('remove_avatar', 'true');

  try {
    const res = await fetch(`${API_URL}/admin/staff/${route.params.id}`, {
      method: 'POST', 
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        'Accept': 'application/json' 
      },
      body: formData 
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'Thành công', text: data.message, timer: 1500, showConfirmButton: false });
      
      if(isCurrentUser.value) {
        const updatedAdmin = { ...currentAdmin, fullname: form.value.fullname, phone: form.value.phone };
        if(data.data && data.data.avatar_url) updatedAdmin.avatar_url = data.data.avatar_url;
        localStorage.setItem('admin_info', JSON.stringify(updatedAdmin));
      }

      router.push({ name: 'admin-staff-index' });
    } else {
      Swal.fire('Lỗi', data.message || Object.values(data.errors).flat().join('\n'), 'error');
    }
  } catch (err) { Swal.fire('Lỗi', 'Mất kết nối', 'error'); } finally { isSaving.value = false; }
};

onMounted(() => fetchRolesAndStaff());
</script>

<style scoped>
/* LOGO SHIMMER (SÓNG BIỂN LẤP LÁNH) */
.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 1.5s linear infinite;
}

@keyframes shine {
  to { background-position: 200% center; }
}

.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; transition: 0.2s; border: none; }
.btn-brand:hover { background-color: #007a67; }
.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.cursor-not-allowed { cursor: not-allowed; opacity: 0.7; }
.cursor-pointer { cursor: pointer; transition: transform 0.2s; }
.cursor-pointer:hover { transform: scale(1.1); }
</style>