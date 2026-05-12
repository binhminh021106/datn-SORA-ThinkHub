<template>
    <div class="user-create-wrapper pb-5 mb-5">
        <div class="container-fluid py-4">
            <div class="d-flex align-items-center mb-4">
                <router-link :to="{ name: 'admin-users' }"
                    class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 40px; height: 40px;">
                    <i class="bi bi-arrow-left fw-bold"></i>
                </router-link>
                <div>
                    <h3 class="fw-bold text-dark mb-0">Thêm Khách Hàng Mới</h3>
                    <p class="text-muted mb-0 small">Tạo tài khoản người dùng mua sắm cho hệ thống ThinkHub</p>
                </div>
            </div>

            <!-- Tắt autocomplete ở cấp độ form -->
            <form @submit.prevent="saveUser" autocomplete="off">
                <div class="row g-4">
                    <!-- Cột Trái: Avatar & Trạng thái -->
                    <div class="col-md-4 col-lg-3">
                        <div class="card border-0 shadow-sm rounded-4 text-center p-4 h-100">
                            <label class="form-label fw-bold mb-3">Ảnh đại diện</label>
                            <div class="position-relative d-inline-block mx-auto mb-4">
                                <img :src="previewAvatar"
                                    class="rounded-circle shadow-sm border border-2 border-white object-fit-cover"
                                    style="width: 150px; height: 150px;" alt="Avatar">
                                <label for="avatarUpload"
                                    class="position-absolute bottom-0 end-0 bg-brand rounded-circle shadow-sm p-2 text-white"
                                    style="cursor: pointer;">
                                    <i class="bi bi-camera-fill fs-6"></i>
                                </label>
                                <input type="file" id="avatarUpload" class="d-none" accept="image/png, image/jpeg, image/webp"
                                    @change="handleAvatarChange">
                            </div>

                            <div class="mb-3 text-start">
                                <label class="form-label fw-bold">Trạng thái <span class="text-danger">*</span></label>
                                <select class="form-select" v-model="form.status" :class="{'is-invalid': errors.status}">
                                    <option value="active">Hoạt động (Active)</option>
                                    <option value="locked">Khóa (Locked)</option>
                                </select>
                                <div class="invalid-feedback">{{ errors.status?.[0] }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Cột Phải: Thông tin chi tiết -->
                    <div class="col-md-8 col-lg-9">
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4">
                                <h5 class="fw-bold mb-4 text-brand"><i class="bi bi-person-lines-fill me-2"></i>Thông tin cơ bản</h5>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Họ và tên <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" v-model="form.fullName" :class="{'is-invalid': errors.fullName}"
                                            placeholder="Nhập họ tên" autocomplete="off">
                                        <div class="invalid-feedback">{{ errors.fullName?.[0] }}</div>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Số điện thoại</label>
                                        <input type="text" class="form-control" v-model="form.phone" :class="{'is-invalid': errors.phone}"
                                            placeholder="Nhập SĐT" autocomplete="off" @input="validatePhone">
                                        <div class="invalid-feedback">{{ errors.phone?.[0] }}</div>
                                    </div>

                                    <div class="col-md-12 mb-3">
                                        <label class="form-label fw-bold">Email đăng nhập <span class="text-danger">*</span></label>
                                        <!-- Hack readonly để lừa trình duyệt không auto-fill -->
                                        <input type="email" class="form-control bg-white" v-model="form.email" :class="{'is-invalid': errors.email}"
                                            placeholder="name@domain.com" autocomplete="off" readonly onfocus="this.removeAttribute('readonly');">
                                        <div class="invalid-feedback">{{ errors.email?.[0] }}</div>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Giới tính</label>
                                        <select class="form-select" v-model="form.gender">
                                            <option value="">-- Chưa cập nhật --</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Ngày sinh</label>
                                        <input type="date" class="form-control" v-model="form.birthday">
                                    </div>
                                    
                                    <!-- Phân cách phần Mật khẩu cho rõ ràng -->
                                    <div class="col-12 mt-3 mb-3">
                                        <h6 class="fw-bold text-dark border-bottom pb-2"><i class="bi bi-shield-lock me-2"></i>Thiết lập Mật khẩu</h6>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Mật khẩu khởi tạo <span class="text-danger">*</span></label>
                                        <div class="position-relative">
                                            <input :type="showPassword ? 'text' : 'password'" class="form-control bg-white pe-5" v-model="form.password" :class="{'is-invalid': errors.password}"
                                                placeholder="Tối thiểu 8 ký tự" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly');">
                                            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showPassword = !showPassword">
                                                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                            </button>
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.password">{{ errors.password?.[0] }}</div>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Xác nhận mật khẩu <span class="text-danger">*</span></label>
                                        <div class="position-relative">
                                            <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control bg-white pe-5" v-model="form.password_confirmation" 
                                                placeholder="Nhập lại mật khẩu" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly');">
                                            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showConfirmPassword = !showConfirmPassword">
                                                <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ĐỊA CHỈ MẶC ĐỊNH -->
                        <div class="card border-0 shadow-sm rounded-4">
                            <div class="card-body p-4">
                                <h5 class="fw-bold mb-4 text-brand"><i class="bi bi-geo-alt-fill me-2"></i>Địa chỉ mặc định (Tùy chọn)</h5>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-bold">Tỉnh/Thành phố</label>
                                        <select class="form-select" v-model="selectedCityId" @change="onCityChange">
                                            <option value="">-- Chọn Tỉnh/Thành --</option>
                                            <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.full_name }}</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-bold">Quận/Huyện</label>
                                        <select class="form-select" v-model="selectedDistrictId" @change="onDistrictChange" :disabled="!selectedCityId">
                                            <option value="">-- Chọn Quận/Huyện --</option>
                                            <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.full_name }}</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-bold">Phường/Xã</label>
                                        <select class="form-select" v-model="selectedWardId" @change="onWardChange" :disabled="!selectedDistrictId">
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            <option v-for="w in wards" :key="w.id" :value="w.id">{{ w.full_name }}</option>
                                        </select>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <label class="form-label fw-bold">Địa chỉ chi tiết (Số nhà, đường)</label>
                                        <input type="text" class="form-control" v-model="form.shipping_address" placeholder="Ví dụ: Số 12, Đường ABCD">
                                    </div>
                                </div>

                                <hr class="text-muted opacity-25 my-4">
                                <div class="text-end">
                                    <router-link :to="{ name: 'admin-users' }" class="btn btn-light me-2 px-4 shadow-sm fw-bold">Hủy bỏ</router-link>
                                    <button type="submit" class="btn btn-brand px-5 fw-bold text-white shadow-sm" :disabled="isSaving">
                                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> 
                                        {{ isSaving ? 'ĐANG TẠO...' : 'XÁC NHẬN THÊM' }}
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
import axios from 'axios';
import defaultAvatar from '../../../../assets/images/defaults/avatar1.png';

const router = useRouter();
const isSaving = ref(false);
const previewAvatar = ref(defaultAvatar);
const selectedFile = ref(null);
const errors = ref({});

const API_URL = import.meta.env.VITE_API_BASE_URL;

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = ref({
    fullName: '', email: '', password: '', password_confirmation: '', phone: '', status: 'active', gender: '', birthday: '',
    shipping_address: '', city: '', district: '', ward: ''
});

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedCityId = ref('');
const selectedDistrictId = ref('');
const selectedWardId = ref('');

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

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
  form.value.ward = wards.value.find(w => w.id === selectedWardId.value)?.full_name || '';
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
    }
};

const validatePhone = (e) => {
    form.value.phone = e.target.value.replace(/\D/g, '').slice(0, 11);
};

const saveUser = async () => {
    isSaving.value = true;
    errors.value = {}; 
    
    if (form.value.password !== form.value.password_confirmation) {
        isSaving.value = false;
        errors.value = { password: ['Mật khẩu xác nhận không khớp!'] };
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'warning');
        return;
    }
    
    const formData = new FormData();
    Object.keys(form.value).forEach(key => {
        if (form.value[key] !== null && form.value[key] !== '') {
            formData.append(key, form.value[key]);
        }
    });
    
    if (selectedFile.value) formData.append('avatar', selectedFile.value);

    try {
        const res = await axios.post(`${API_URL}/admin/users`, formData, { headers: getHeaders() });
        Swal.fire({ icon: 'success', title: 'Thành công', text: res.data.message || 'Đã thêm khách hàng', timer: 1500, showConfirmButton: false });
        router.push({ name: 'admin-users' });
    } catch (err) { 
        handleAxiosError(err, 'Lỗi khi tạo tài khoản khách hàng');
    } finally { 
        isSaving.value = false; 
    }
};

onMounted(() => fetchProvinces());
</script>

<style scoped>
.btn-brand, .bg-brand { background-color: #009981; transition: 0.2s; border: none; }
.btn-brand:hover { background-color: #007a67; }
.btn-brand:disabled { background-color: #a5d6cd; }
.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.text-brand { color: #009981 !important; }
.invalid-feedback { font-size: 0.8rem; font-weight: 500; }
</style>