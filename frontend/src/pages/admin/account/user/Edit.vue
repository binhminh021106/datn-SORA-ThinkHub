<template>
  <div class="user-edit-wrapper pb-5 mb-5">
    <div class="container-fluid py-4" v-if="isLoaded">
      <!-- Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-8 d-flex align-items-center">
          <router-link :to="{ name: 'admin-users' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div>
            <h3 class="fw-bold text-dark mb-0">Hồ sơ Khách Hàng</h3>
            <p class="text-muted mb-0 small">Mã tài khoản: #{{ route.params.id }}</p>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-4 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 text-center p-4 h-100 mb-4">
            <div class="position-relative d-inline-block mx-auto mb-3">
              <img :src="previewAvatar" class="rounded-circle shadow-sm border border-3 border-white object-fit-cover" style="width: 140px; height: 140px;" alt="Avatar" @error="handleImageError">
              <label for="avatarUpload" class="position-absolute bottom-0 end-0 bg-brand rounded-circle shadow-sm p-2 text-white cursor-pointer" title="Đổi ảnh đại diện">
                <i class="bi bi-camera-fill fs-6"></i>
              </label>
              <input type="file" id="avatarUpload" class="d-none" accept="image/png, image/jpeg, image/webp" @change="handleAvatarChange">
            </div>
            
            <h5 class="fw-bold text-dark mb-1">{{ form.fullName || 'Khách hàng' }}</h5>
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
              <select class="form-select fw-bold shadow-sm" v-model="form.status" required :class="form.status === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-danger border-danger bg-danger bg-opacity-10'">
                <option value="active" class="text-success fw-bold">Hoạt động (Active)</option>
                <option value="locked" class="text-danger fw-bold">Khóa (Locked)</option>
              </select>
              <div class="invalid-feedback d-block" v-if="errors.status">{{ errors.status?.[0] }}</div>
            </div>
          </div>
        </div>

        <!-- ================= CỘT PHẢI: TABS THÔNG TIN & ĐỊA CHỈ ================= -->
        <div class="col-md-8 col-lg-9">
          <div class="card border-0 shadow-sm rounded-4 h-100 mb-4">
            
            <!-- Tabs Header -->
            <div class="card-header bg-white border-bottom-0 pt-3 pb-0 px-4">
              <ul class="nav nav-tabs-custom mb-3">
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center" :class="{ 'active': activeTab === 'info' }" href="#" @click.prevent="activeTab = 'info'">
                     <i class="bi bi-person-lines-fill me-2 fs-5"></i> Thông tin chung
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center" :class="{ 'active': activeTab === 'address' }" href="#" @click.prevent="activeTab = 'address'">
                     <i class="bi bi-geo-alt-fill me-2 fs-5"></i> Sổ địa chỉ
                     <span class="badge ms-2 rounded-pill" :class="activeTab === 'address' ? 'bg-brand text-white' : 'bg-light text-secondary border'">{{ userAddresses.length }}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div class="card-body p-4 pt-2">
              
              <!-- ================= TAB 1: THÔNG TIN CHUNG (ĐÃ FIX GRID CÂN ĐỐI) ================= -->
              <form v-if="activeTab === 'info'" @submit.prevent="updateUser">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Họ và tên <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-lg bg-white border-secondary-subtle" v-model="form.fullName" :class="{'is-invalid': errors.fullName}">
                    <div class="invalid-feedback">{{ errors.fullName?.[0] }}</div>
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Số điện thoại</label>
                    <input type="text" class="form-control form-control-lg bg-white border-secondary-subtle" v-model="form.phone" :class="{'is-invalid': errors.phone}" @input="validatePhone">
                    <div class="invalid-feedback">{{ errors.phone?.[0] }}</div>
                  </div>
                  
                  <div class="col-md-12 mb-4">
                    <label class="form-label fw-bold text-dark">Email đăng nhập <span class="text-danger">*</span></label>
                    <div class="input-group input-group-lg shadow-sm">
                      <span class="input-group-text bg-light text-muted border-secondary-subtle"><i class="bi bi-envelope"></i></span>
                      <input type="email" class="form-control bg-white border-secondary-subtle " v-model="form.email" :class="{'is-invalid': errors.email}" autocomplete="off" readonly onfocus="this.removeAttribute('readonly');" disabled>
                      <div class="invalid-feedback d-block" v-if="errors.email">{{ errors.email?.[0] }}</div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Giới tính</label>
                    <select class="form-select form-select-lg bg-white border-secondary-subtle" v-model="form.gender">
                      <option value="">-- N/A --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Ngày sinh</label>
                    <input type="date" class="form-control form-control-lg bg-white border-secondary-subtle" v-model="form.birthday">
                  </div>
                  
                  <!-- Phần Đổi Mật Khẩu (Trải ngang 2 cột hoàn hảo) -->
                  <div class="col-12 mt-2 mb-3">
                    <h6 class="fw-bold text-dark border-bottom pb-2"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu <span class="text-muted fw-normal small">(Bỏ trống nếu không đổi)</span></h6>
                  </div>

                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Mật khẩu mới</label>
                    <div class="position-relative">
                        <input :type="showPassword ? 'text' : 'password'" class="form-control form-control-lg bg-white border-secondary-subtle pe-5" v-model="form.password" placeholder="Tối thiểu 8 ký tự" :class="{'is-invalid': errors.password}" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly');">
                        <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showPassword = !showPassword">
                            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                    </div>
                    <div class="invalid-feedback d-block" v-if="errors.password">{{ errors.password?.[0] }}</div>
                  </div>

                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Xác nhận mật khẩu</label>
                    <div class="position-relative">
                        <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control form-control-lg bg-white border-secondary-subtle pe-5" v-model="form.password_confirmation" placeholder="Nhập lại mật khẩu mới" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly');">
                        <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showConfirmPassword = !showConfirmPassword">
                            <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                    </div>
                  </div>
                </div>

                <div class="text-end mt-2 pt-4 border-top">
                  <button type="button" class="btn btn-light me-2 px-4 fw-bold shadow-sm" @click="handleRestore" :disabled="isRestoring">
                    <span v-if="isRestoring" class="spinner-border spinner-border-sm me-2"></span>Khôi phục gốc
                  </button>
                  <button type="submit" class="btn btn-brand px-5 fw-bold text-white shadow-sm" :disabled="isSavingUser">
                    <span v-if="isSavingUser" class="spinner-border spinner-border-sm me-2"></span> 
                    {{ isSavingUser ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI' }}
                  </button>
                </div>
              </form>

              <!-- ================= TAB 2: QUẢN LÝ SỔ ĐỊA CHỈ ================= -->
              <div v-if="activeTab === 'address'">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <button type="button" class="btn btn-brand rounded-pill px-4 py-2 fw-bold text-white shadow-sm" @click="openAddressModal('add')">
                    <i class="bi bi-plus-lg me-1"></i> Thêm Địa Chỉ
                  </button>
                </div>
                
                <div class="address-list custom-scrollbar pe-2" style="max-height: 500px; overflow-y: auto;">
                  <div v-if="userAddresses.length === 0" class="text-center py-5 bg-light rounded-4 border border-dashed">
                    <div class="bg-white rounded-circle d-inline-flex justify-content-center align-items-center shadow-sm mb-3" style="width: 60px; height: 60px;">
                      <i class="bi bi-geo-alt text-brand fs-3"></i>
                    </div>
                    <h6 class="fw-bold text-dark">Chưa có địa chỉ nào</h6>
                    <p class="text-muted small">Khách hàng chưa lưu địa chỉ nhận hàng.</p>
                  </div>
                  
                  <div v-else v-for="addr in userAddresses" :key="addr.id" class="address-card p-4 mb-3 rounded-4 border position-relative transition-all" :class="addr.is_default ? 'bg-brand bg-opacity-10 border-brand shadow-sm' : 'bg-white border-secondary-subtle'">
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3">
                      <div>
                        <h6 class="fw-bold text-dark mb-1 d-flex align-items-center flex-wrap gap-2">
                          {{ addr.customer_name }}
                          <span class="text-muted fw-normal">|</span>
                          <span class="text-muted fw-normal">{{ addr.customer_phone }}</span>
                          <span v-if="addr.is_default" class="badge bg-brand text-white ms-md-2 px-2 py-1"><i class="bi bi-check-circle me-1"></i>Mặc định</span>
                        </h6>
                      </div>
                      <button v-if="!addr.is_default" @click="setDefaultAddress(addr.id)" class="btn btn-sm btn-outline-secondary fw-bold rounded-pill mt-2 mt-md-0 px-3 shadow-sm hover-brand-btn" :disabled="settingDefaultId === addr.id">
                        <span v-if="settingDefaultId === addr.id" class="spinner-border spinner-border-sm me-1"></span>Đặt làm mặc định
                      </button>
                    </div>
                    <div class="mb-4">
                      <p class="text-dark mb-1 "><i class="bi bi-house-door text-muted me-2 fs-5 align-middle"></i>{{ addr.shipping_address }}</p>
                      <p class="text-muted mb-0" ><i class="bi bi-map text-muted me-2 fs-5 align-middle"></i>{{ [addr.ward, addr.district, addr.city].filter(Boolean).join(', ') }}</p>
                    </div>
                    <div class="d-flex gap-2 border-top border-light-subtle pt-3">
                      <button class="btn btn-sm btn-primary text-white rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center" @click="openAddressModal('edit', addr)">
                        <i class="bi bi-pencil-square me-2"></i> Sửa địa chỉ
                      </button>
                      <button v-if="!addr.is_default" class="btn btn-sm btn-danger text-white rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center" @click="deleteAddress(addr.id)">
                        <i class="bi bi-trash me-2"></i> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu...</p>
    </div>

    <!-- MODAL ĐỊA CHỈ (DÙNG AXIOS) -->
    <div class="modal fade" id="addressModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="fw-bold text-dark">{{ addrModalMode === 'add' ? 'Thêm Địa Chỉ Mới' : 'Cập Nhật Địa Chỉ' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveAddress">
              <div class="row g-3">
                <div class="col-md-6 mb-2">
                  <label class="form-label fw-bold text-dark small">Tên người nhận <span class="text-danger">*</span></label>
                  <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="addrForm.customer_name" required>
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label fw-bold text-dark small">Số điện thoại <span class="text-danger">*</span></label>
                  <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="addrForm.customer_phone" required>
                </div>
                
                <div class="col-md-4 mb-2">
                  <label class="form-label fw-bold text-dark small">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                  <select class="form-select bg-white border-secondary-subtle shadow-none fw-semibold" v-model="selectedCityId" @change="onCityChange" required>
                    <option value="" disabled>-- Chọn Tỉnh/Thành --</option>
                    <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.full_name }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-2">
                  <label class="form-label fw-bold text-dark small">Quận/Huyện <span class="text-danger">*</span></label>
                  <select class="form-select bg-white border-secondary-subtle shadow-none fw-semibold" v-model="selectedDistrictId" @change="onDistrictChange" required :disabled="!selectedCityId">
                    <option value="" disabled>-- Chọn Quận/Huyện --</option>
                    <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.full_name }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-2">
                  <label class="form-label fw-bold text-dark small">Phường/Xã <span class="text-danger">*</span></label>
                  <select class="form-select bg-white border-secondary-subtle shadow-none fw-semibold" v-model="selectedWardId" @change="onWardChange" required :disabled="!selectedDistrictId">
                    <option value="" disabled>-- Chọn Phường/Xã --</option>
                    <option v-for="w in wards" :key="w.id" :value="w.id">{{ w.full_name }}</option>
                  </select>
                </div>

                <div class="col-md-12 mb-2">
                  <label class="form-label fw-bold text-dark small">Địa chỉ cụ thể (Số nhà, đường) <span class="text-danger">*</span></label>
                  <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="addrForm.shipping_address" placeholder="VD: Số 12, Đường ABCD" required>
                </div>
                
                <div class="col-12 mt-3" v-if="!addrForm.is_default">
                  <div class="form-check form-switch p-3 bg-light rounded-3 d-flex align-items-center gap-3 border border-secondary-subtle">
                    <input class="form-check-input fs-5 m-0 cursor-pointer" type="checkbox" id="flexSwitchCheckDefault" v-model="addrForm.set_as_default">
                    <label class="form-check-label fw-bold text-dark m-0 cursor-pointer" for="flexSwitchCheckDefault">Đặt làm địa chỉ mặc định</label>
                  </div>
                </div>
              </div>
              <div class="text-end mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light px-4 fw-bold me-2 shadow-sm" data-bs-dismiss="modal">Hủy bỏ</button>
                <button type="submit" class="btn btn-brand px-5 fw-bold text-white shadow-sm" :disabled="isSavingAddr">
                  <span v-if="isSavingAddr" class="spinner-border spinner-border-sm me-1"></span> LƯU ĐỊA CHỈ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getFullImage } from '@/composables/useUtilities';
import defaultAvatar from '../../../../assets/images/defaults/avatar1.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || API_URL.replace(/\/api\/?$/, '');

const route = useRoute();
const router = useRouter();
const isLoaded = ref(false);
const isSavingUser = ref(false);
const isRestoring = ref(false);
const settingDefaultId = ref(null);
const errors = ref({});

const activeTab = ref('info'); 

const previewAvatar = ref(defaultAvatar);
const selectedFile = ref(null);
const isRemoveAvatar = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = ref({ fullName: '', email: '', password: '', password_confirmation: '', phone: '', status: '', gender: '', birthday: '' });

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedCityId = ref('');
const selectedDistrictId = ref('');
const selectedWardId = ref('');

const userAddresses = ref([]);
const isSavingAddr = ref(false);
const addrModalMode = ref('add');
let addressModalInstance = null;
const addrForm = ref({ id: null, customer_name: '', customer_phone: '', shipping_address: '', city: '', district: '', ward: '', is_default: 0, set_as_default: false });

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });
const handleImageError = (e) => { e.target.src = defaultAvatar; };

const handleAxiosError = (e, defaultMsg = 'Lỗi hệ thống') => {
  if (e.response) {
    if (e.response.status === 401) {
      Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
    } else if (e.response.data && e.response.data.errors) {
      errors.value = e.response.data.errors;
      let errorHtml = '<ul class="text-start text-danger small mt-2" style="max-height: 200px; overflow-y: auto; padding-left: 20px;">';
      Object.values(e.response.data.errors).flat().forEach(msg => {
          errorHtml += `<li class="mb-1">${msg}</li>`;
      });
      errorHtml += '</ul>';
      Swal.fire({ title: 'Dữ liệu không hợp lệ', html: errorHtml, icon: 'error', confirmButtonColor: '#dc3545' });
    } else {
      Swal.fire('Lỗi', e.response.data.message || defaultMsg, 'error');
    }
  } else {
    Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
  }
};

const findLocationByName = (list, name) => {
  if (!name || !list) return null;
  return list.find(item => item.full_name === name || item.name === name || name.includes(item.name));
};

const fetchProvinces = async () => {
  try {
    // Dùng fetch thay vì axios
    const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.error === 0) provinces.value = data.data;
  } catch (e) {
    console.error("Lỗi lấy Tỉnh/Thành:", e);
  }
};

const onCityChange = async () => {
  districts.value = []; wards.value = [];
  selectedDistrictId.value = ''; selectedWardId.value = '';
  addrForm.value.city = provinces.value.find(p => p.id === selectedCityId.value)?.full_name || '';
  if (selectedCityId.value) {
    try {
      // Dùng fetch thay vì axios
      const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${selectedCityId.value}.htm`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.error === 0) districts.value = data.data;
    } catch (e) {
      console.error("Lỗi lấy Quận/Huyện:", e);
    }
  }
};

const onDistrictChange = async () => {
  wards.value = []; selectedWardId.value = '';
  addrForm.value.district = districts.value.find(d => d.id === selectedDistrictId.value)?.full_name || '';
  if (selectedDistrictId.value) {
    try {
      // Dùng fetch thay vì axios
      const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrictId.value}.htm`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.error === 0) wards.value = data.data;
    } catch (e) {
      console.error("Lỗi lấy Phường/Xã:", e);
    }
  }
};

const onWardChange = () => {
  addrForm.value.ward = wards.value.find(w => w.id === selectedWardId.value)?.full_name || '';
};

const fetchUser = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/users/${route.params.id}`, { headers: getHeaders() });
    const u = res.data.data;
    
    form.value = { 
        fullName: u.fullName, email: u.email, phone: u.phone, status: u.status, 
        gender: u.gender || '', birthday: u.birthday || '', password: '', password_confirmation: '' 
    };
    
    previewAvatar.value = u.avatar_url ? getFullImage(u.avatar_url) : defaultAvatar;
    userAddresses.value = (u.addresses || []).sort((a, b) => b.is_default - a.is_default);
  } catch (err) { 
      Swal.fire('Lỗi', 'Không thể tải dữ liệu khách hàng', 'error');
      router.push({ name: 'admin-users' });
  } finally { 
      isLoaded.value = true; 
  }
};

const handleRestore = async () => {
  isRestoring.value = true;
  await fetchUser();
  setTimeout(() => {
    isRestoring.value = false;
    Swal.fire({ icon: 'success', title: 'Khôi phục thành công', text: 'Dữ liệu đã được tải lại như ban đầu', timer: 1500, showConfirmButton: false });
  }, 400); 
};

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) { 
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
          Swal.fire('Lỗi', 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)', 'error'); return;
      }
      if (file.size > 2 * 1024 * 1024) {
          Swal.fire('Lỗi', 'Dung lượng tối đa 2MB', 'error'); return;
      }
      selectedFile.value = file; 
      previewAvatar.value = URL.createObjectURL(file); 
      isRemoveAvatar.value = false; 
  }
};

const removeAvatar = () => { selectedFile.value = null; previewAvatar.value = defaultAvatar; isRemoveAvatar.value = true; document.getElementById('avatarUpload').value = ''; };

const validatePhone = (e) => {
    form.value.phone = e.target.value.replace(/\D/g, '').slice(0, 11);
};

const updateUser = async () => {
  isSavingUser.value = true;
  errors.value = {};
  
  if (form.value.password && form.value.password !== form.value.password_confirmation) {
      isSavingUser.value = false;
      errors.value = { password: ['Mật khẩu xác nhận không khớp!'] };
      Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'warning');
      return;
  }

  const formData = new FormData();
  formData.append('_method', 'PUT'); 
  Object.keys(form.value).forEach(key => {
    if (key === 'password' && !form.value.password) return; 
    formData.append(key, form.value[key] || '');
  });
  if (selectedFile.value) formData.append('avatar', selectedFile.value);
  if (isRemoveAvatar.value) formData.append('remove_avatar', 'true');

  try {
    const res = await axios.post(`${API_URL}/admin/users/${route.params.id}`, formData, { headers: getHeaders() });
    Swal.fire({ icon: 'success', title: 'Thành công', text: res.data.message, timer: 1500, showConfirmButton: false });
    fetchUser();
    form.value.password = '';
    form.value.password_confirmation = '';
  } catch (err) { 
      handleAxiosError(err, 'Không thể cập nhật hồ sơ');
  } finally { 
      isSavingUser.value = false; 
  }
};

const openAddressModal = async (mode, addr = null) => {
  addrModalMode.value = mode;
  if (mode === 'add') {
    addrForm.value = { id: null, customer_name: form.value.fullName, customer_phone: form.value.phone, shipping_address: '', city: '', district: '', ward: '', is_default: 0, set_as_default: false };
    selectedCityId.value = ''; selectedDistrictId.value = ''; selectedWardId.value = '';
    districts.value = []; wards.value = [];
  } else {
    addrForm.value = { ...addr, set_as_default: false };
    if (addr.city && provinces.value.length > 0) {
      const cityObj = findLocationByName(provinces.value, addr.city);
      if (cityObj) {
        selectedCityId.value = cityObj.id;
        const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${selectedCityId.value}.htm`);
        if(res.data.error === 0) {
          districts.value = res.data.data;
          const distObj = findLocationByName(districts.value, addr.district);
          if (distObj) {
            selectedDistrictId.value = distObj.id;
            const wRes = await axios.get(`https://esgoo.net/api-tinhthanh/3/${selectedDistrictId.value}.htm`);
            if(wRes.data.error === 0) {
              wards.value = wRes.data.data;
              const wardObj = findLocationByName(wards.value, addr.ward);
              if (wardObj) selectedWardId.value = wardObj.id;
            }
          }
        }
      }
    }
  }
  if (!addressModalInstance) addressModalInstance = new window.bootstrap.Modal(document.getElementById('addressModal'));
  addressModalInstance.show();
};

const saveAddress = async () => {
  isSavingAddr.value = true;
  const url = addrModalMode.value === 'add' ? `${API_URL}/admin/users/${route.params.id}/addresses` : `${API_URL}/admin/addresses/${addrForm.value.id}`;
  
  const payload = { ...addrForm.value, is_default: addrForm.value.set_as_default ? 1 : addrForm.value.is_default };
  
  try {
    if (addrModalMode.value === 'add') {
        await axios.post(url, payload, { headers: getHeaders() });
    } else {
        await axios.put(url, payload, { headers: getHeaders() });
    }
    
    addressModalInstance.hide(); 
    fetchUser(); 
    Swal.fire({ icon: 'success', title: 'Thành công', timer: 1500, showConfirmButton: false }); 
  } catch (err) { 
      handleAxiosError(err, 'Lỗi khi lưu địa chỉ');
  } finally { 
      isSavingAddr.value = false; 
  }
};

const deleteAddress = (id) => {
  Swal.fire({ 
    title: 'Xóa địa chỉ?', 
    text: 'Hành động này không thể hoàn tác!',
    icon: 'warning', 
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đồng ý xóa',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
          await axios.delete(`${API_URL}/admin/addresses/${id}`, { headers: getHeaders() });
          await fetchUser();
          Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false });
      } catch (err) {
          handleAxiosError(err, 'Không thể xóa địa chỉ này');
      }
    }
  });
};

const setDefaultAddress = async (id) => {
  settingDefaultId.value = id;
  try {
    await axios.put(`${API_URL}/admin/addresses/${id}/default`, {}, { headers: getHeaders() });
    await fetchUser();
    Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã thay đổi địa chỉ mặc định', timer: 1500, showConfirmButton: false });
  } catch (err) {
      handleAxiosError(err, 'Lỗi cập nhật địa chỉ mặc định');
  } finally {
    settingDefaultId.value = null;
  }
};

onMounted(() => { fetchProvinces(); fetchUser(); });
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; transition: 0.2s; border: none; } .btn-brand:hover { background-color: #007a67; }
.nav-tabs-custom { border-bottom: 2px solid #dee2e6; display: flex; gap: 10px; padding-left: 0; list-style: none; }
.nav-tabs-custom .nav-link { color: #6c757d; border: none; border-bottom: 3px solid transparent; padding: 12px 20px; font-weight: 600; transition: all 0.3s ease; background: transparent; cursor: pointer; }
.nav-tabs-custom .nav-link:hover { color: #009981; }
.nav-tabs-custom .nav-link.active { color: #009981; border-bottom: 3px solid #009981; }
.address-card:hover { transform: translateY(-2px); }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
.invalid-feedback { font-size: 0.8rem; font-weight: 500; }
.cursor-pointer { cursor: pointer; }
</style>