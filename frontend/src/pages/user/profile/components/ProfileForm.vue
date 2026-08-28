<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light rounded-3">
    
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
          <h4 class="font-oswald fw-bold mb-0 text-white">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(form.accumulated_spent || 0) }}</h4>
          <p class="mb-0 font-sans small opacity-75 mt-1"><i class="bi bi-bag-check-fill me-1"></i> {{ form.accumulated_orders || 0 }} đơn hàng thành công</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="updateProfile">
      <div class="row gx-3 gy-4 mb-4">
        <div class="col-md-6">
          <div class="form-floating">
            <input type="email" class="form-control bg-light text-muted fw-medium border-light" id="email" :value="form.email" disabled placeholder="Email">
            <label for="email" class="text-secondary"><i class="bi bi-envelope me-1"></i>Tên Đăng Nhập / Email</label>
          </div>
          <small class="text-muted fw-light mt-1 d-block ms-1"><i class="bi bi-info-circle me-1"></i>Email không thể thay đổi</small>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <input type="text" class="form-control fw-medium profile-floating-input" :class="{'is-invalid': errors.fullName}" id="fullName" v-model="form.fullName" @blur="validateField('fullName')" required placeholder="Họ và tên">
            <label for="fullName" class="text-secondary"><i class="bi bi-person me-1"></i>Họ Và Tên</label>
          </div>
          <div v-if="errors.fullName" class="invalid-feedback d-block ms-1 mt-1">{{ errors.fullName }}</div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <input type="tel" class="form-control fw-medium profile-floating-input" :class="{'is-invalid': errors.phone}" id="phone" v-model="form.phone" @input="form.phone = form.phone.replace(/\D/g, '')" @blur="validateField('phone')" placeholder="Số điện thoại">
            <label for="phone" class="text-secondary"><i class="bi bi-telephone me-1"></i>Số Điện Thoại</label>
          </div>
          <div v-if="errors.phone" class="invalid-feedback d-block ms-1 mt-1">{{ errors.phone }}</div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <input type="date" class="form-control fw-medium profile-floating-input" :class="{'is-invalid': errors.birthday}" id="birthday" v-model="form.birthday" @blur="validateField('birthday')" placeholder="Ngày Sinh">
            <label for="birthday" class="text-secondary"><i class="bi bi-calendar-date me-1"></i>Ngày Sinh</label>
          </div>
          <div v-if="errors.birthday" class="invalid-feedback d-block ms-1 mt-1">{{ errors.birthday }}</div>
        </div>
      </div>

      <div class="mb-5">
        <label class="form-label text-secondary fw-medium mb-3" :class="{'text-danger': errors.gender}"><i class="bi bi-gender-ambiguous me-1"></i>Giới Tính</label>
        <div class="d-flex flex-wrap gap-3">
          <input type="radio" class="btn-check" name="gender" id="genderMale" value="Nam" v-model="form.gender" @change="validateField('gender')">
          <label class="btn btn-outline-main px-4 py-2" for="genderMale" style="min-width: 100px;">
            <i class="bi bi-gender-male me-1"></i> Nam
          </label>

          <input type="radio" class="btn-check" name="gender" id="genderFemale" value="Nữ" v-model="form.gender" @change="validateField('gender')">
          <label class="btn btn-outline-main px-4 py-2" for="genderFemale" style="min-width: 100px;">
            <i class="bi bi-gender-female me-1"></i> Nữ
          </label>

          <input type="radio" class="btn-check" name="gender" id="genderOther" value="Khác" v-model="form.gender" @change="validateField('gender')">
          <label class="btn btn-outline-main px-4 py-2" for="genderOther" style="min-width: 100px;">
            <i class="bi bi-gender-trans me-1"></i> Khác
          </label>
        </div>
        <div v-if="errors.gender" class="small text-danger mt-2 ms-1">{{ errors.gender }}</div>
      </div>

      <!-- HIỂN THỊ ĐỊA CHỈ MẶC ĐỊNH -->
      <div class="mb-5">
        <label class="form-label text-secondary fw-medium mb-3"><i class="bi bi-geo-alt me-1"></i>Sổ Địa Chỉ</label>
        
        <div v-if="isLoadingAddresses" class="d-flex justify-content-center py-4">
          <div class="spinner-border text-main" role="status"></div>
        </div>
        
        <div v-else-if="!defaultAddress" class="d-flex align-items-center justify-content-between bg-light p-4 rounded-3 border border-light">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 48px; height: 48px;">
              <i class="bi bi-map text-muted fs-5"></i>
            </div>
            <div>
              <h6 class="mb-1 text-dark fw-bold">Chưa có địa chỉ</h6>
              <span class="text-secondary fw-light small">Bạn cần thêm địa chỉ để nhận hàng.</span>
            </div>
          </div>
          <button type="button" @click="$emit('go-address-book')" class="editorial-btn-outline px-4 py-2 rounded-pill">
            <i class="bi bi-plus-lg me-1"></i> Thêm Mới
          </button>
        </div>

        <div v-else class="border border-light p-4 rounded-4 bg-light-custom position-relative transition-all hover-shadow">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h6 class="mb-0 text-dark font-serif d-flex align-items-center fw-bold fs-5">
              {{ defaultAddress.customer_name }}
              <span class="text-muted mx-3 fw-light fw-normal fs-6">|</span>
              <span class="text-secondary fw-normal fs-6">{{ defaultAddress.customer_phone }}</span>
            </h6>
            <button type="button" @click="$emit('go-address-book')" class="btn btn-link text-main p-0 text-decoration-none fw-bold" style="font-size: 0.9rem;">
              <i class="bi bi-pencil-square me-1"></i> Thay Đổi
            </button>
          </div>
          
          <div class="d-flex align-items-start gap-2 mb-2">
            <i class="bi bi-geo-alt-fill text-main mt-1"></i>
            <div>
              <p class="text-dark mb-1 fw-medium">{{ defaultAddress.shipping_address }}</p>
              <p class="text-secondary mb-0 fw-light">{{ defaultAddress.ward }}, {{ defaultAddress.district }}, {{ defaultAddress.city }}</p>
            </div>
          </div>
          
          <div class="d-flex align-items-center justify-content-between mt-3 pt-3 border-top border-light border-opacity-50">
            <div class="d-flex align-items-center gap-2">
              <span v-if="defaultAddress.is_default" class="badge bg-main text-white px-3 py-2 rounded-pill shadow-sm" style="font-size: 0.7rem;"><i class="bi bi-check-circle-fill me-1"></i>Mặc Định</span>
              <span v-if="addresses.length > 1" class="text-muted small fw-light fst-italic ms-2">(và {{ addresses.length - 1 }} địa chỉ khác)</span>
            </div>
            <button type="button" @click="$emit('go-address-book')" class="editorial-btn-outline px-4 py-2 rounded-pill" style="font-size: 0.85rem;">
              <i class="bi bi-journal-text me-1"></i> Quản lý sổ địa chỉ
            </button>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end border-top pt-4">
        <button type="submit" class="editorial-btn px-5 py-2 rounded-pill shadow-sm" style="min-width: 200px;" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="bi bi-save me-2"></i>
          {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import clientApiClient from '@/utils/clientApiClient';

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

const soraAlert = createSoraAlert({
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

    const response = await clientApiClient.post('/client/profile', formData);

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
    const response = await clientApiClient.get('/client/profile/addresses');
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

.font-serif { font-family: 'Josefin Sans', sans-serif; }

.tracking-wide { letter-spacing: 0.1em; }

/* Hiệu ứng hover cho card địa chỉ */
.transition-all { transition: all 0.3s ease; }
.hover-shadow:hover { 
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important;
  transform: translateY(-2px);
  border-color: #e7ce7d !important; 
}
.hover-main:hover { color: #9f273b !important; }

.btn-outline-main {
  color: #9f273b;
  border-color: #9f273b;
  background-color: transparent;
  transition: all 0.2s;
}
.btn-outline-main:hover {
  background-color: rgba(159, 39, 59, 0.05);
  color: #9f273b;
}
.btn-check:checked + .btn-outline-main {
  background-color: #9f273b;
  color: #ffffff;
  border-color: #9f273b;
}

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

.profile-floating-input:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.15);
}

.form-floating > label {
  transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out !important;
}

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
