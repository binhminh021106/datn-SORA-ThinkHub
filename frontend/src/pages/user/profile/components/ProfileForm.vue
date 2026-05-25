<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    
    <h3 class="h4 font-serif text-dark mb-1">Hồ Sơ Của Tôi</h3>
    <p class="text-secondary fw-light border-bottom pb-3 mb-4">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

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

      <!-- HIỂN THỊ SỔ ĐỊA CHỈ -->
      <div class="row mb-5 align-items-start">
        <label class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium pt-2">Sổ Địa Chỉ</label>
        <div class="col-sm-9 col-md-7">
          
          <div v-if="isLoadingAddresses" class="spinner-border spinner-border-sm text-accent mt-2" role="status"></div>
          
          <div v-else-if="!defaultAddress" class="d-flex align-items-center justify-content-between bg-light p-3 rounded border border-light">
            <span class="text-secondary fw-light small">Chưa có địa chỉ nhận hàng.</span>
            <button type="button" @click="openAddAddressModal" class="btn btn-sm btn-outline-main text-uppercase fw-medium rounded-0" style="letter-spacing: 0.05em;">
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
              <button type="button" @click="openAddressListModal" class="btn btn-link text-accent p-0 text-decoration-none fw-medium small" style="font-size: 0.85rem;">
                Thay Đổi
              </button>
            </div>
            <p class="text-secondary mb-1 small">{{ defaultAddress.shipping_address }}</p>
            <p class="text-secondary mb-0 fw-light small">{{ defaultAddress.ward }}, {{ defaultAddress.district }}, {{ defaultAddress.city }}</p>
            
            <span v-if="defaultAddress.is_default" class="badge bg-main text-white mt-2 px-2 py-1" style="font-size: 0.65rem;">Mặc Định</span>
            <span v-if="addresses.length > 1" class="text-muted small ms-2 fw-light fst-italic">(và {{ addresses.length - 1 }} địa chỉ khác)</span>
          </div>

        </div>
      </div>

      <div class="row">
        <div class="col-sm-9 offset-sm-3">
          <button type="submit" class="btn btn-main px-5 py-2 text-uppercase fw-medium rounded-0" :disabled="isSaving" style="letter-spacing: 0.1em;">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
          </button>
        </div>
      </div>
    </form>

    <!-- MODAL QUẢN LÝ SỔ ĐỊA CHỈ -->
    <transition name="modal-fade">
      <div v-if="isAddressModalOpen" class="custom-modal-overlay" @click.self="closeAddressModal">
        <div class="custom-modal-content p-4 p-md-5 position-relative">
          
          <button type="button" class="btn-close position-absolute top-0 end-0 m-4" @click="closeAddressModal" aria-label="Close"></button>

          <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
            <div>
              <h3 class="h4 font-serif text-dark mb-1">Sổ Địa Chỉ</h3>
              <p class="text-secondary fw-light mb-0">Quản lý địa chỉ nhận hàng của bạn</p>
            </div>
            <button v-if="!showAddressForm" @click="openAddAddressForm" class="btn btn-main px-4 py-2 text-uppercase fw-medium rounded-0" style="font-size: 0.85rem; letter-spacing: 0.05em;">
              + Thêm Địa Chỉ
            </button>
          </div>

          <div v-if="!showAddressForm">
            <div v-if="addresses.length === 0" class="text-center py-5 bg-light border border-light rounded-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-muted mb-3 opacity-50 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-secondary mb-0">Bạn chưa có địa chỉ nào được lưu.</p>
            </div>

            <div v-else class="row g-3">
              <div v-for="addr in addresses" :key="addr.id" class="col-12">
                <div class="border border-light p-4 position-relative bg-light-custom rounded-3 transition-all hover-shadow">
                  <span v-if="addr.is_default" class="badge bg-main position-absolute top-0 end-0 m-3 px-3 py-2 fw-medium tracking-wide">Mặc Định</span>
                  
                  <div class="row align-items-center">
                    <div class="col-md-8 col-lg-9">
                      <h5 class="font-serif text-dark mb-2 d-flex align-items-center fw-bold">
                        {{ addr.customer_name }} 
                        <span class="text-muted mx-2 fw-light fw-normal">|</span> 
                        <span class="text-secondary fw-normal fs-6">{{ addr.customer_phone }}</span>
                      </h5>
                      <p class="text-secondary mb-1">{{ addr.shipping_address }}</p>
                      <p class="text-secondary mb-0 fw-light">{{ addr.ward }}, {{ addr.district }}, {{ addr.city }}</p>
                    </div>
                    
                    <div class="col-md-4 col-lg-3 d-flex flex-column justify-content-center align-items-md-end mt-3 mt-md-0 border-md-start ps-md-4">
                      <div class="d-flex gap-3 mb-2">
                        <a href="#" @click.prevent="openEditAddressForm(addr)" class="text-accent text-decoration-none fw-medium hover-main transition-all">Cập nhật</a>
                        <a href="#" @click.prevent="confirmDeleteAddress(addr.id)" class="text-danger-custom text-decoration-none fw-medium transition-all">Xóa</a>
                      </div>
                      <button v-if="!addr.is_default" @click="setDefaultAddress(addr.id)" class="btn btn-sm btn-outline-secondary rounded-0 mt-2 w-100">Làm mặc định</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showAddressForm" class="bg-white">
            <h4 class="font-serif text-main mb-4">{{ isEditingAddress ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới' }}</h4>
            <form @submit.prevent="saveAddress">
              <div class="row g-4 mb-4">
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-medium">Họ và tên người nhận <span class="text-danger">*</span></label>
                  <input type="text" class="form-control custom-input bg-white" :class="{'is-invalid': addressErrors.customer_name}" v-model="addressForm.customer_name" @blur="validateAddressField('customer_name')" required placeholder="Nhập họ tên">
                  <div v-if="addressErrors.customer_name" class="invalid-feedback">{{ addressErrors.customer_name }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-medium">Số điện thoại <span class="text-danger">*</span></label>
                  <input type="tel" class="form-control custom-input bg-white" :class="{'is-invalid': addressErrors.customer_phone}" v-model="addressForm.customer_phone" @input="addressForm.customer_phone = addressForm.customer_phone.replace(/\D/g, '')" @blur="validateAddressField('customer_phone')" required placeholder="Nhập số điện thoại">
                  <div v-if="addressErrors.customer_phone" class="invalid-feedback">{{ addressErrors.customer_phone }}</div>
                </div>
              </div>

              <div class="row g-4 mb-4">
                <div class="col-md-4">
                  <label class="form-label text-secondary small fw-medium">Tỉnh / Thành phố <span class="text-danger">*</span></label>
                  <select class="form-select custom-input bg-white" :class="{'is-invalid': addressErrors.city}" v-model="addressForm.city" @change="handleCityChange(); validateAddressField('city')" required>
                    <option value="" disabled>-- Chọn Tỉnh/TP --</option>
                    <option v-for="p in provincesData" :key="p.Id" :value="p.Name">{{ p.Name }}</option>
                  </select>
                  <div v-if="addressErrors.city" class="invalid-feedback">{{ addressErrors.city }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label text-secondary small fw-medium">Quận / Huyện <span class="text-danger">*</span></label>
                  <select class="form-select custom-input bg-white" :class="{'is-invalid': addressErrors.district}" v-model="addressForm.district" @change="handleDistrictChange(); validateAddressField('district')" :disabled="!addressForm.city" required>
                    <option value="" disabled>-- Chọn Quận/Huyện --</option>
                    <option v-for="d in districtsData" :key="d.Id" :value="d.Name">{{ d.Name }}</option>
                  </select>
                  <div v-if="addressErrors.district" class="invalid-feedback">{{ addressErrors.district }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label text-secondary small fw-medium">Phường / Xã <span class="text-danger">*</span></label>
                  <select class="form-select custom-input bg-white" :class="{'is-invalid': addressErrors.ward}" v-model="addressForm.ward" @change="validateAddressField('ward')" :disabled="!addressForm.district" required>
                    <option value="" disabled>-- Chọn Phường/Xã --</option>
                    <option v-for="w in wardsData" :key="w.Id" :value="w.Name">{{ w.Name }}</option>
                  </select>
                  <div v-if="addressErrors.ward" class="invalid-feedback">{{ addressErrors.ward }}</div>
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-end mb-2">
                  <label class="form-label text-secondary small fw-medium mb-0">Địa chỉ cụ thể <span class="text-danger">*</span></label>
                  <button type="button" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" @click="getCurrentLocation" :disabled="isLocating">
                    <span v-if="isLocating" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-geo-alt"></i> Lấy định vị hiện tại
                  </button>
                </div>
                <input type="text" class="form-control custom-input bg-white" :class="{'is-invalid': addressErrors.shipping_address}" v-model="addressForm.shipping_address" @blur="validateAddressField('shipping_address')" required placeholder="Số nhà, tên tòa nhà, tên đường...">
                <div v-if="addressErrors.shipping_address" class="invalid-feedback">{{ addressErrors.shipping_address }}</div>
                
                <div v-if="mapUrl" class="mt-3 rounded overflow-hidden border shadow-sm">
                  <iframe :src="mapUrl" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
              </div>

              <div class="form-check custom-checkbox mb-5">
                <input class="form-check-input" type="checkbox" id="isDefaultAddress" v-model="addressForm.is_default">
                <label class="form-check-label text-secondary" for="isDefaultAddress">Đặt làm địa chỉ mặc định</label>
              </div>

              <div class="d-flex gap-3">
                <button type="submit" class="btn btn-main px-5 py-2 rounded-0 text-uppercase fw-medium" :disabled="isSavingAddress" style="letter-spacing: 0.05em;">
                  <span v-if="isSavingAddress" class="spinner-border spinner-border-sm me-2"></span>Hoàn Thành
                </button>
                <button type="button" @click="closeAddressForm" class="btn btn-outline-secondary px-5 py-2 rounded-0 text-uppercase fw-medium" style="letter-spacing: 0.05em;">Trở Lại</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </transition>
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

const emit = defineEmits(['profile-updated']);

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

// --- ADDRESS LOGIC ---
const addresses = ref([]);
const isLoadingAddresses = ref(false);
const isAddressModalOpen = ref(false); 
const showAddressForm = ref(false);
const isEditingAddress = ref(false);
const isSavingAddress = ref(false);
const provincesData = ref([]);
const districtsData = ref([]);
const wardsData = ref([]);
const mapUrl = ref('');
const isLocating = ref(false);

const addressForm = ref({
  id: null,
  customer_name: '',
  customer_phone: '',
  shipping_address: '',
  city: '',
  district: '',
  ward: '',
  is_default: false
});

const addressErrors = ref({
  customer_name: '',
  customer_phone: '',
  shipping_address: '',
  city: '',
  district: '',
  ward: ''
});

const defaultAddress = computed(() => {
  if (addresses.value.length === 0) return null;
  const def = addresses.value.find(addr => addr.is_default);
  return def || addresses.value[0]; 
});

const fetchProvinces = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
    if (!response.ok) throw new Error('Lỗi mạng khi tải dữ liệu');
    const data = await response.json();
    provincesData.value = data;
  } catch (error) {
    console.error('Lỗi lấy dữ liệu hành chính:', error);
  }
};

const handleCityChange = () => {
  addressForm.value.district = '';
  addressForm.value.ward = '';
  updateDistricts();
  wardsData.value = [];
};

const handleDistrictChange = () => {
  addressForm.value.ward = '';
  updateWards();
};

const updateDistricts = () => {
  const province = provincesData.value.find(p => p.Name === addressForm.value.city);
  districtsData.value = province ? province.Districts : [];
};
const updateWards = () => {
  const district = districtsData.value.find(d => d.Name === addressForm.value.district);
  wardsData.value = district ? district.Wards : [];
};

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

const openAddAddressModal = () => {
  isAddressModalOpen.value = true;
  openAddAddressForm();
};

const openAddressListModal = () => {
  isAddressModalOpen.value = true;
  showAddressForm.value = false;
};

const closeAddressModal = () => {
  isAddressModalOpen.value = false;
  setTimeout(() => { showAddressForm.value = false; }, 300); 
};

const openAddAddressForm = () => {
  isEditingAddress.value = false;
  addressForm.value = { 
    id: null, 
    customer_name: form.value.fullName || '', 
    customer_phone: form.value.phone || '',   
    shipping_address: '', 
    city: '', 
    district: '', 
    ward: '', 
    is_default: addresses.value.length === 0 
  };
  districtsData.value = []; 
  wardsData.value = [];     
  mapUrl.value = '';        
  showAddressForm.value = true;
};

const openEditAddressForm = (addr) => {
  isEditingAddress.value = true;
  addressForm.value = { ...addr, is_default: addr.is_default === 1 || addr.is_default === true };
  updateDistricts();
  updateWards();
  mapUrl.value = ''; 
  showAddressForm.value = true;
};

const closeAddressForm = () => {
  if (addresses.value.length === 0) closeAddressModal();
  else showAddressForm.value = false;
};

const validateAddressField = (field) => {
  if (field === 'customer_name') {
    let val = addressForm.value.customer_name || '';
    val = val.trim().replace(/\s+/g, ' ');
    addressForm.value.customer_name = val;
    if (!val) addressErrors.value.customer_name = 'Vui lòng nhập tên người nhận';
    else if (val.length < 2 || val.length > 50) addressErrors.value.customer_name = 'Tên người nhận phải từ 2 đến 50 ký tự';
    else if (!/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/.test(val)) addressErrors.value.customer_name = 'Tên người nhận phải chứa ít nhất 2 từ (không chứa số hoặc ký tự đặc biệt)';
    else addressErrors.value.customer_name = '';
  }

  if (field === 'customer_phone') {
    let val = addressForm.value.customer_phone || '';
    val = val.replace(/\D/g, ''); 
    addressForm.value.customer_phone = val;
    if (!val) addressErrors.value.customer_phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(val)) addressErrors.value.customer_phone = 'Số điện thoại không hợp lệ';
    else addressErrors.value.customer_phone = '';
  }

  if (field === 'shipping_address') {
    let val = addressForm.value.shipping_address || '';
    if (!val) addressErrors.value.shipping_address = 'Vui lòng nhập địa chỉ chi tiết';
    else if (val.length < 10) addressErrors.value.shipping_address = 'Địa chỉ quá ngắn';
    else if (val.length > 255) addressErrors.value.shipping_address = 'Địa chỉ tối đa 255 ký tự';
    else addressErrors.value.shipping_address = '';
  }

  if (field === 'city') addressErrors.value.city = addressForm.value.city ? '' : 'Vui lòng chọn Tỉnh/TP';
  if (field === 'district') addressErrors.value.district = addressForm.value.district ? '' : 'Vui lòng chọn Quận/Huyện';
  if (field === 'ward') addressErrors.value.ward = addressForm.value.ward ? '' : 'Vui lòng chọn Phường/Xã';
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    showToast('Trình duyệt của bạn không hỗ trợ định vị', 'error');
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`);
      if (response.data && response.data.display_name) {
        mapUrl.value = `https://maps.google.com/maps?q=${lat},${lon}&hl=vi&z=15&output=embed`;
        addressForm.value.shipping_address = response.data.display_name;
        validateAddressField('shipping_address');
        showToast('Đã lấy vị trí hiện tại', 'success');
      }
    } catch (err) {
      showToast('Lỗi khi lấy thông tin địa chỉ từ tọa độ', 'error');
    } finally {
      isLocating.value = false;
    }
  }, (err) => {
    showToast('Không thể lấy vị trí. Vui lòng cấp quyền!', 'error');
    isLocating.value = false;
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
};

const saveAddress = async () => {
  validateAddressField('customer_name');
  validateAddressField('customer_phone');
  validateAddressField('shipping_address');
  validateAddressField('city');
  validateAddressField('district');
  validateAddressField('ward');

  if (Object.values(addressErrors.value).some(err => err !== '')) return;

  isSavingAddress.value = true;
  try {
    const url = isEditingAddress.value ? `${apiBase}/addresses/${addressForm.value.id}` : `${apiBase}/addresses`;
    const method = isEditingAddress.value ? 'put' : 'post';
    const payload = { ...addressForm.value, is_default: addressForm.value.is_default ? 1 : 0 };

    const response = await axios[method](url, payload, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });

    if (response.data.status) {
      showToast(response.data.message, 'success');
      fetchAddresses(); 
      showAddressForm.value = false; 
    }
  } catch (error) {
    if (error.response && error.response.status === 422) showToast('Vui lòng điền đầy đủ thông tin địa chỉ.', 'error');
    else showToast('Lỗi lưu địa chỉ.', 'error');
  } finally {
    isSavingAddress.value = false;
  }
};

const confirmDeleteAddress = async (id) => {
  soraAlert.fire({
    title: 'Xóa Địa Chỉ?',
    text: "Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ tay?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'XÓA NGAY',
    cancelButtonText: 'HỦY'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${apiBase}/addresses/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
        });
        if (response.data.status) {
          showToast('Đã xóa địa chỉ', 'success');
          fetchAddresses();
        }
      } catch (error) {
        showToast('Lỗi khi xóa địa chỉ.', 'error');
      }
    }
  });
};

const setDefaultAddress = async (id) => {
  try {
    const response = await axios.put(`${apiBase}/addresses/${id}/default`, {}, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      showToast('Đã thay đổi địa chỉ mặc định', 'success');
      fetchAddresses();
    }
  } catch (error) {
    showToast('Lỗi thiết lập địa chỉ mặc định', 'error');
  }
};

onMounted(() => {
  fetchProvinces();
  fetchAddresses();
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
  border: none;
  transition: all 0.3s ease;
}
.btn-main:hover {
  background-color: #832030;
  color: white;
}
.btn-outline-main {
  color: #9f273b;
  border-color: #9f273b;
}
.btn-outline-main:hover {
  background-color: #9f273b;
  color: white;
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
</style>
