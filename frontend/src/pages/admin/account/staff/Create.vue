<template>
  <div class="staff-create-wrapper">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <router-link :to="{ name: 'admin-staff-index' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          <i class="bi bi-arrow-left fw-bold"></i>
        </router-link>
        <div>
          <h3 class="fw-bold text-dark mb-0">Thêm Tài Khoản Mới</h3>
          <p class="text-muted mb-0 small">Cấp tài khoản truy cập hệ thống quản trị ThinkHub</p>
        </div>
      </div>

      <form @submit.prevent="saveStaff">
        <div class="row g-4">
          <!-- ================= CỘT TRÁI: AVATAR & TRẠNG THÁI ================= -->
          <div class="col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 text-center p-4 h-100">
              <label class="form-label fw-bold mb-3 text-dark">Ảnh đại diện</label>
              <div class="position-relative d-inline-block mx-auto mb-4">
                <img :src="previewAvatar" class="rounded-circle shadow-sm border border-3 border-white object-fit-cover" style="width: 140px; height: 140px;" alt="Avatar">
                <label for="avatarUpload" class="position-absolute bottom-0 end-0 bg-brand rounded-circle shadow-sm p-2 text-white cursor-pointer" title="Chọn ảnh đại diện">
                  <i class="bi bi-camera-fill fs-6"></i>
                </label>
                <input type="file" id="avatarUpload" class="d-none" accept="image/png, image/jpeg" @change="handleAvatarChange">
              </div>
              
              <hr class="text-muted opacity-25 mb-3 mt-1">

              <div class="text-start">
                <label class="form-label fw-bold text-muted small text-uppercase mb-2">Trạng thái <span class="text-danger">*</span></label>
                <select class="form-select fw-bold shadow-sm" v-model="form.status" required :class="form.status === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-danger border-danger bg-danger bg-opacity-10'">
                  <option value="active" class="text-success fw-bold">Hoạt động (Active)</option>
                  <option value="locked" class="text-danger fw-bold">Khóa (Locked)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ================= CỘT PHẢI: THÔNG TIN CHI TIẾT ================= -->
          <div class="col-md-8 col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-person-lines-fill text-brand me-2"></i> Thông tin cá nhân</h5>
              </div>
              <div class="card-body p-4 pt-3">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Họ và tên <span class="text-danger">*</span></label>
                    <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.fullname" placeholder="Nhập họ tên" required>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Số điện thoại</label>
                    <input type="text" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.phone" placeholder="Nhập SĐT">
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Email đăng nhập <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm">
                      <span class="input-group-text bg-white text-muted border-secondary-subtle"><i class="bi bi-envelope"></i></span>
                      <input type="email" class="form-control bg-white border-secondary-subtle shadow-none border-start-0" v-model="form.email" placeholder="name@domain.com" required>
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold text-dark">Mật khẩu khởi tạo <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm">
                      <span class="input-group-text bg-white text-muted border-secondary-subtle"><i class="bi bi-key"></i></span>
                      <input type="text" class="form-control bg-white border-secondary-subtle shadow-none border-start-0" v-model="form.password" placeholder="Tối thiểu 8 ký tự" required minlength="8">
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
                    <select class="form-select form-select-lg bg-light border-secondary-subtle fw-bold text-dark" v-model="form.role_id" required>
                      <option value="" disabled>-- Hãy chọn một Chức vụ --</option>
                      <option v-for="r in roles" :key="r.id" :value="r.id">
                        Cấp {{ r.level }}: {{ r.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="text-end border-top pt-4 mt-2">
                  <router-link :to="{ name: 'admin-staff-index' }" class="btn btn-light me-2 px-4 shadow-sm fw-bold">Hủy bỏ</router-link>
                  <button type="submit" class="btn btn-brand px-5 fw-bold text-white shadow-sm" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> XÁC NHẬN THÊM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import defaultAvatar from '../../../../assets/images/defaults/avatar1.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const roles = ref([]);
const isSaving = ref(false);
const previewAvatar = ref(defaultAvatar);
const selectedFile = ref(null);

const form = ref({ fullname: '', email: '', password: '', phone: '', address: '', role_id: '', status: 'active' });

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedCityId = ref('');
const selectedDistrictId = ref('');
const selectedWardId = ref('');
const specificAddress = ref('');

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

const fetchRoles = async () => {
  const res = await fetch(`${API_URL}/admin/roles`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });
  const data = await res.json();
  if(res.ok) roles.value = data.data;
};

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
  }
};

const saveStaff = async () => {
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
  Object.keys(form.value).forEach(key => formData.append(key, form.value[key]));
  if (selectedFile.value) formData.append('avatar', selectedFile.value);

  try {
    const res = await fetch(`${API_URL}/admin/staff`, {
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
      router.push({ name: 'admin-staff-index' });
    } else {
      Swal.fire('Lỗi', data.message || Object.values(data.errors).flat().join('\n'), 'error');
    }
  } catch (err) { Swal.fire('Lỗi', 'Mất kết nối', 'error'); } finally { isSaving.value = false; }
};

onMounted(() => {
  fetchRoles();
  fetchProvinces();
});
</script>

<style scoped>
.text-brand { color: #009981 !important; }
.bg-brand { background-color: #009981 !important; }
.btn-brand { background-color: #009981; transition: 0.2s; border: none; }
.btn-brand:hover { background-color: #007a67; }
.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.cursor-pointer { cursor: pointer; transition: transform 0.2s; }
.cursor-pointer:hover { transform: scale(1.1); }
</style>