<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    
    <h3 class="h4 font-serif text-dark mb-1">Hồ Sơ Của Tôi</h3>
    <p class="text-secondary fw-light border-bottom pb-3 mb-4">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

    <!-- HIỂN THỊ HẠNG THÀNH VIÊN NỔI BẬT LÊN TRÊN CÙNG -->
    <div class="tier-banner text-white p-4 p-md-5 rounded-4 mb-5 position-relative overflow-hidden shadow-sm" 
         :class="tierBannerClass">
      <!-- Decorative background elements -->
      <div class="position-absolute top-0 end-0 opacity-25" style="transform: translate(20%, -20%); pointer-events: none;">
        <i class="bi bi-award-fill" style="font-size: 15rem;"></i>
      </div>
      
      <div class="position-relative z-index-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
        <div class="d-flex align-items-center gap-4">
          <div class="tier-icon-wrapper rounded-circle d-flex align-items-center justify-content-center shadow-lg border border-white border-2" style="width: 80px; height: 80px; background: rgba(255,255,255,0.25); backdrop-filter: blur(8px);">
            <i class="bi bi-award-fill fs-1 text-white"></i>
          </div>
          <div>
            <p class="mb-1 font-sans small text-uppercase tracking-wider opacity-75 fw-medium">Hạng Thành Viên Tích Lũy</p>
            <h3 class="text-uppercase tracking-wide mb-1 font-serif fw-bold" style="letter-spacing: 2px;">
              {{ form.tier ? form.tier.name : 'Thành Viên Mới' }}
            </h3>
            <p class="mb-0 opacity-75 font-sans small">
              Cảm ơn bạn đã đồng hành cùng SORA!
            </p>
          </div>
        </div>
        <div class="text-md-end bg-white bg-opacity-10 p-3 px-4 rounded-3 border border-white border-opacity-25" style="backdrop-filter: blur(4px);">
          <p class="mb-1 font-sans small text-uppercase opacity-75 fw-medium">Tổng chi tiêu</p>
          <h4 class="font-serif fw-bold mb-0 text-white">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(form.accumulated_spent || 0) }}</h4>
          <p class="mb-0 font-sans small opacity-75 mt-1"><i class="bi bi-bag-check-fill me-1"></i> {{ form.accumulated_orders || 0 }} đơn hàng thành công</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="updateProfile">
      <div class="row mb-4 align-items-center">
        <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Tên Đăng Nhập / Email</label>
        <div class="col-sm-9 col-md-7">
          <input type="email" class="form-control bg-light text-muted" :value="form.email" disabled>
          <small class="text-muted fw-light mt-1 d-block">Email không thể thay đổi</small>
        </div>
      </div>

      <div class="row mb-4 align-items-center">
        <label for="fullName" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Họ Và Tên</label>
        <div class="col-sm-9 col-md-7">
          <input type="text" class="form-control custom-input" :class="{'is-invalid': errors.fullName}" id="fullName" v-model="form.fullName" @blur="validateField('fullName')" required placeholder="Nhập họ và tên của bạn">
          <div v-if="errors.fullName" class="invalid-feedback">{{ errors.fullName }}</div>
        </div>
      </div>

      <div class="row mb-4 align-items-center">
        <label for="phone" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Số Điện Thoại</label>
        <div class="col-sm-9 col-md-7">
          <input type="tel" class="form-control custom-input" :class="{'is-invalid': errors.phone}" id="phone" v-model="form.phone" @input="form.phone = form.phone.replace(/\D/g, '')" @blur="validateField('phone')" placeholder="Nhập số điện thoại liên hệ">
          <div v-if="errors.phone" class="invalid-feedback">{{ errors.phone }}</div>
        </div>
      </div>

      <div class="row mb-4 align-items-center">
        <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium" :class="{'text-danger': errors.gender}">Giới Tính</label>
        <div class="col-sm-9 col-md-7">
          <div class="d-flex gap-4 pt-2">
            <div class="form-check custom-radio">
              <input class="form-check-input" :class="{'is-invalid': errors.gender}" type="radio" name="gender" id="genderMale" value="Nam" v-model="form.gender" @change="validateField('gender')">
              <label class="form-check-label text-secondary" for="genderMale">Nam</label>
            </div>
            <div class="form-check custom-radio">
              <input class="form-check-input" :class="{'is-invalid': errors.gender}" type="radio" name="gender" id="genderFemale" value="Nữ" v-model="form.gender" @change="validateField('gender')">
              <label class="form-check-label text-secondary" for="genderFemale">Nữ</label>
            </div>
            <div class="form-check custom-radio">
              <input class="form-check-input" :class="{'is-invalid': errors.gender}" type="radio" name="gender" id="genderOther" value="Khác" v-model="form.gender" @change="validateField('gender')">
              <label class="form-check-label text-secondary" for="genderOther">Khác</label>
            </div>
          </div>
          <div v-if="errors.gender" class="small text-danger mt-1">{{ errors.gender }}</div>
        </div>
      </div>

      <div class="row mb-4 align-items-center">
        <label for="birthday" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Ngày Sinh</label>
        <div class="col-sm-9 col-md-7">
          <input type="date" class="form-control custom-input" :class="{'is-invalid': errors.birthday}" id="birthday" v-model="form.birthday" @blur="validateField('birthday')">
          <div v-if="errors.birthday" class="invalid-feedback">{{ errors.birthday }}</div>
        </div>
      </div>



      <!-- HIỂN THỊ ĐỊA CHỈ MẶC ĐỊNH -->
      <div class="row mb-5 align-items-start">
        <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium pt-2">Sổ Địa Chỉ</label>
        <div class="col-sm-9 col-md-7">
          
          <div v-if="isLoadingAddresses" class="spinner-border spinner-border-sm text-accent mt-2" role="status"></div>
          
          <div v-else-if="!defaultAddress" class="d-flex align-items-center justify-content-between bg-light p-3 rounded border border-light">
            <span class="text-secondary fw-light small">Chưa có địa chỉ nhận hàng.</span>
            <button type="button" @click="$emit('go-address-book')" class="btn btn-sm btn-outline-main text-uppercase fw-medium tracking-wide font-oswald">
              + Thêm Mới
            </button>
          </div>

          <div v-else class="border border-light p-3 rounded-3 bg-light-custom position-relative transition-all hover-shadow">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="mb-0 text-dark font-serif d-flex align-items-center fw-bold">
                {{ defaultAddress.customer_name }}
                <span class="text-muted mx-2 fw-light fw-normal">|</span>
                <span class="text-secondary fw-normal fs-6">{{ defaultAddress.customer_phone }}</span>
              </h6>
              <button type="button" @click="$emit('go-address-book')" class="btn btn-link text-accent p-0 text-decoration-none fw-medium small" style="font-size: 0.85rem;">
                Thay Đổi
              </button>
            </div>
            <p class="text-secondary mb-1 small">{{ defaultAddress.shipping_address }}</p>
            <p class="text-secondary mb-0 fw-light small">{{ defaultAddress.ward }}, {{ defaultAddress.district }}, {{ defaultAddress.city }}</p>
            
            <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
              <span v-if="defaultAddress.is_default" class="badge bg-main text-white px-2 py-1" style="font-size: 0.65rem;">Mặc Định</span>
              <span v-if="addresses.length > 1" class="text-muted small fw-light fst-italic">(và {{ addresses.length - 1 }} địa chỉ khác)</span>
              <button type="button" @click="$emit('go-address-book')" class="btn btn-sm btn-outline-main ms-auto tracking-wide text-uppercase font-oswald" style="font-size: 0.78rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="me-1" style="vertical-align: -2px;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Quản lý sổ địa chỉ
              </button>
            </div>
          </div>

        </div>
      </div>

      <div class="row">
        <div class="col-sm-9 offset-sm-3">
          <button type="submit" class="btn btn-main px-5 py-2 text-uppercase fw-medium tracking-wide" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const props = defineProps({
  initialForm: {
    type: Object,
    required: true
  },
  avatarFile: {
    type: File,
    default: null
  }
});

const emit = defineEmits(['profile-updated', 'go-address-book']);

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold font-oswald tracking-widest text-uppercase'
  }
});

const showToast = (message, type = 'success') => {
  soraAlert.fire({
    icon: type,
    title: type === 'success' ? 'Thành Công!' : 'Có Lỗi Xảy Ra!',
    text: message,
    timer: type === 'success' ? 2500 : undefined,
    showConfirmButton: type !== 'success'
  });
};

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

const isSaving = ref(false);
const form = ref({ ...props.initialForm });

watch(() => props.initialForm, (newVal) => {
  form.value = { ...newVal };
}, { deep: true });

const errors = ref({
  fullName: '',
  phone: '',
  gender: '',
  birthday: ''
});

const validateField = (field) => {
  if (field === 'fullName') {
    let val = form.value.fullName || '';
    val = val.trim().replace(/\s+/g, ' ');
    form.value.fullName = val;
    
    if (!val) {
      errors.value.fullName = 'Vui lòng nhập họ và tên';
    } else if (val.length < 2 || val.length > 50) {
      errors.value.fullName = 'Họ tên phải từ 2 đến 50 ký tự';
    } else if (!/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/.test(val)) {
      errors.value.fullName = 'Họ tên phải chứa ít nhất 2 từ (không chứa số hoặc ký tự đặc biệt)';
    } else {
      errors.value.fullName = '';
    }
  }

  if (field === 'phone') {
    let val = form.value.phone || '';
    val = val.replace(/\D/g, ''); 
    form.value.phone = val;
    
    if (!val) {
      errors.value.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(val)) {
      errors.value.phone = 'Số điện thoại không hợp lệ';
    } else {
      errors.value.phone = '';
    }
  }

  if (field === 'birthday') {
    let val = form.value.birthday || '';
    if (!val) {
      errors.value.birthday = 'Vui lòng chọn ngày sinh';
    } else {
      const bday = new Date(val);
      const today = new Date();
      if (bday > today) {
        errors.value.birthday = 'Ngày sinh không hợp lệ';
      } else {
        let age = today.getFullYear() - bday.getFullYear();
        const m = today.getMonth() - bday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
          age--;
        }
        if (age < 13) {
          errors.value.birthday = 'Bạn chưa đủ tuổi sử dụng';
        } else {
          errors.value.birthday = '';
        }
      }
    }
  }

  if (field === 'gender') {
    if (!form.value.gender) {
      errors.value.gender = 'Vui lòng chọn giới tính';
    } else {
      errors.value.gender = '';
    }
  }
};

const updateProfile = async () => {
  validateField('fullName');
  validateField('phone');
  validateField('gender');
  validateField('birthday');

  if (errors.value.fullName || errors.value.phone || errors.value.gender || errors.value.birthday) {
    const firstError = ['fullName', 'phone', 'gender', 'birthday'].find(k => errors.value[k] !== '');
    if (firstError) {
      const el = document.getElementById(firstError) || document.querySelector(`input[name="${firstError}"]`);
      if (el) el.focus();
    }
    return;
  }

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('fullName', form.value.fullName || '');
    if (form.value.phone) formData.append('phone', form.value.phone);
    if (form.value.gender) formData.append('gender', form.value.gender);
    if (form.value.birthday) formData.append('birthday', form.value.birthday);
    if (props.avatarFile) formData.append('avatar', props.avatarFile);

    const response = await axios.post(apiBase, formData, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (response.data.status) {
      showToast(response.data.message, 'success');
      emit('profile-updated', response.data.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      const firstErrorMsg = Object.values(errors)[0][0]; 
      showToast(`Lỗi dữ liệu: ${firstErrorMsg}`, 'error');
    } else {
      showToast('Lỗi cập nhật. Vui lòng thử lại sau.', 'error');
    }
  } finally {
    isSaving.value = false;
  }
};

// --- ADDRESS LOGIC (chỉ hiển thị default) ---
const addresses = ref([]);
const isLoadingAddresses = ref(false);

const defaultAddress = computed(() => {
  if (addresses.value.length === 0) return null;
  const def = addresses.value.find(addr => addr.is_default);
  return def || addresses.value[0]; 
});

const fetchAddresses = async () => {
  isLoadingAddresses.value = true;
  try {
    const response = await axios.get(`${apiBase}/addresses`, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      addresses.value = response.data.data;
    }
  } catch (error) {
    console.error('Lỗi lấy địa chỉ:', error);
  } finally {
    isLoadingAddresses.value = false;
  }
};

onMounted(() => {
  fetchAddresses();
});

const tierBannerClass = computed(() => {
  const name = (form.value.tier ? form.value.tier.name : '').toLowerCase();
  if (name.includes('diamond') || name.includes('kim cương')) return 'tier-bg-diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'tier-bg-gold';
  if (name.includes('bạc') || name.includes('silver')) return 'tier-bg-silver';
  return 'tier-bg-default';
});
</script>

<style scoped>
/* Thêm style cần thiết, phần lớn đã nằm ở file CSS tổng hợp hoặc Tailwind/Bootstrap classes */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }

.font-serif { font-family: "Playfair Display", "Merriweather", serif; }

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
.btn-outline-main {
  color: #9f273b;
  border: 1px solid #9f273b;
  border-radius: 4px;
  background: transparent;
  transition: all 0.3s ease;
}
.btn-outline-main:hover {
  background-color: #9f273b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(159,39,59,0.3);
}

.tracking-wide { letter-spacing: 0.1em; }

/* Hiệu ứng hover cho card địa chỉ */
.transition-all { transition: all 0.3s ease; }
.hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05); border-color: #e7ce7d !important; }
.hover-main:hover { color: #9f273b !important; }

.custom-input {
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 0.6rem 1rem;
  transition: all 0.3s ease;
}
.custom-input:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.15);
  outline: none;
}
select.custom-input { padding-right: 2.5rem; }

/* MODAL OVERLAY */
.custom-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.custom-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* TIER BANNER */
.tier-bg-default { background: linear-gradient(135deg, #757575 0%, #424242 100%); }
.tier-bg-silver { background: linear-gradient(135deg, #a5a5a5 0%, #7d7d7d 50%, #5a5a5a 100%); }
.tier-bg-gold { background: linear-gradient(135deg, #f0b90b 0%, #c49608 50%, #8b6b00 100%); }
.tier-bg-diamond { background: linear-gradient(135deg, #00b4db 0%, #0083b0 100%); }
.tracking-wider { letter-spacing: 0.15em; }
</style>
