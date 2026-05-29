<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    
    <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
      <div>
        <h3 class="h4 font-serif text-dark mb-1">Sổ Địa Chỉ</h3>
        <p class="text-secondary fw-light mb-0">Quản lý địa chỉ nhận hàng của bạn</p>
      </div>
      <button v-if="!showAddressForm" @click="openAddForm" class="btn btn-main px-4 py-2 text-uppercase fw-medium tracking-wide d-inline-flex align-items-center" style="font-size: 0.85rem;">
        <i class="bi bi-plus-lg me-1"></i> Thêm Địa Chỉ
      </button>
    </div>

    <!-- DANH SÁCH ĐỊA CHỈ -->
    <div v-if="!showAddressForm">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-accent" role="status"></div>
      </div>

      <div v-else-if="addresses.length === 0" class="text-center py-5 bg-light border border-light rounded-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-muted mb-3 opacity-50 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-secondary mb-3">Bạn chưa có địa chỉ nào được lưu.</p>
        <button @click="openAddForm" class="btn btn-main px-5 py-2 text-uppercase tracking-wide d-inline-flex align-items-center fw-medium"><i class="bi bi-plus-lg me-2"></i> Thêm Địa Chỉ Đầu Tiên</button>
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
                  <a href="#" @click.prevent="openEditForm(addr)" class="text-accent text-decoration-none fw-medium hover-main transition-all">Cập nhật</a>
                  <a href="#" @click.prevent="confirmDelete(addr.id)" class="text-danger-custom text-decoration-none fw-medium transition-all">Xóa</a>
                </div>
                <button v-if="!addr.is_default" @click="setDefault(addr.id)" class="btn btn-sm btn-outline-main mt-2 w-100 font-oswald tracking-wide text-uppercase">Làm mặc định</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM THÊM / SỬA ĐỊA CHỈ -->
    <div v-if="showAddressForm" class="bg-white">
      <h4 class="font-serif text-main mb-4">{{ isEditing ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới' }}</h4>
      <form @submit.prevent="saveAddress">
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-medium">Họ và tên người nhận <span class="text-danger">*</span></label>
            <input type="text" class="form-control custom-input bg-white" :class="{'is-invalid': errs.customer_name}" v-model="addrForm.customer_name" @blur="validateField('customer_name')" required placeholder="Nhập họ tên">
            <div v-if="errs.customer_name" class="invalid-feedback">{{ errs.customer_name }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-medium">Số điện thoại <span class="text-danger">*</span></label>
            <input type="tel" class="form-control custom-input bg-white" :class="{'is-invalid': errs.customer_phone}" v-model="addrForm.customer_phone" @input="addrForm.customer_phone = addrForm.customer_phone.replace(/\D/g, '')" @blur="validateField('customer_phone')" required placeholder="Nhập số điện thoại">
            <div v-if="errs.customer_phone" class="invalid-feedback">{{ errs.customer_phone }}</div>
          </div>
        </div>

        <div class="row g-4 mb-4">
          <div class="col-md-4">
            <label class="form-label text-secondary small fw-medium">Tỉnh / Thành phố <span class="text-danger">*</span></label>
            <select class="form-select custom-input bg-white" :class="{'is-invalid': errs.city}" v-model="addrForm.city" @change="onCityChange(); validateField('city')" required>
              <option value="" disabled>-- Chọn Tỉnh/TP --</option>
              <option v-for="p in provincesData" :key="p.Id" :value="p.Name">{{ p.Name }}</option>
            </select>
            <div v-if="errs.city" class="invalid-feedback">{{ errs.city }}</div>
          </div>
          <div class="col-md-4">
            <label class="form-label text-secondary small fw-medium">Quận / Huyện <span class="text-danger">*</span></label>
            <select class="form-select custom-input bg-white" :class="{'is-invalid': errs.district}" v-model="addrForm.district" @change="onDistrictChange(); validateField('district')" :disabled="!addrForm.city" required>
              <option value="" disabled>-- Chọn Quận/Huyện --</option>
              <option v-for="d in districtsData" :key="d.Id" :value="d.Name">{{ d.Name }}</option>
            </select>
            <div v-if="errs.district" class="invalid-feedback">{{ errs.district }}</div>
          </div>
          <div class="col-md-4">
            <label class="form-label text-secondary small fw-medium">Phường / Xã <span class="text-danger">*</span></label>
            <select class="form-select custom-input bg-white" :class="{'is-invalid': errs.ward}" v-model="addrForm.ward" @change="validateField('ward')" :disabled="!addrForm.district" required>
              <option value="" disabled>-- Chọn Phường/Xã --</option>
              <option v-for="w in wardsData" :key="w.Id" :value="w.Name">{{ w.Name }}</option>
            </select>
            <div v-if="errs.ward" class="invalid-feedback">{{ errs.ward }}</div>
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
          <input type="text" class="form-control custom-input bg-white" :class="{'is-invalid': errs.shipping_address}" v-model="addrForm.shipping_address" @blur="validateField('shipping_address')" required placeholder="Số nhà, tên tòa nhà, tên đường...">
          <div v-if="errs.shipping_address" class="invalid-feedback">{{ errs.shipping_address }}</div>
          
          <div v-if="mapUrl" class="mt-3 rounded overflow-hidden border shadow-sm">
            <iframe :src="mapUrl" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>

        <div class="form-check custom-checkbox mb-5">
          <input class="form-check-input" type="checkbox" id="isDefaultAddr" v-model="addrForm.is_default">
          <label class="form-check-label text-secondary" for="isDefaultAddr">Đặt làm địa chỉ mặc định</label>
        </div>

        <div class="d-flex gap-3">
          <button type="submit" class="btn btn-main px-5 py-2 text-uppercase fw-medium tracking-wide" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>Hoàn Thành
          </button>
          <button type="button" @click="closeForm" class="btn btn-outline-main px-5 py-2 text-uppercase fw-medium tracking-wide">Trở Lại</button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const props = defineProps({
  userName: { type: String, default: '' },
  userPhone: { type: String, default: '' }
});

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold text-uppercase' }
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
const apiGeo = `${import.meta.env.VITE_API_BASE_URL}/client/geo`;
const getToken = () => {
  const keys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of keys) {
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

// === STATE ===
const addresses = ref([]);
const isLoading = ref(false);
const showAddressForm = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isLocating = ref(false);
const mapUrl = ref('');

const provincesData = ref([]);
const districtsData = ref([]);
const wardsData = ref([]);

const addrForm = ref({
  id: null, customer_name: '', customer_phone: '',
  shipping_address: '', city: '', district: '', ward: '', is_default: false
});

const errs = ref({
  customer_name: '', customer_phone: '',
  shipping_address: '', city: '', district: '', ward: ''
});

// === FETCH ===
const fetchProvinces = async () => {
  try {
    const res = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
    if (!res.ok) throw new Error('Network');
    provincesData.value = await res.json();
  } catch (e) {
    console.error('Lỗi lấy dữ liệu hành chính:', e);
  }
};

const fetchAddresses = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(`${apiBase}/addresses`, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (res.data.status) addresses.value = res.data.data;
  } catch (e) {
    console.error('Lỗi lấy địa chỉ:', e);
  } finally {
    isLoading.value = false;
  }
};

// === DROPDOWN LOGIC ===
const onCityChange = () => {
  addrForm.value.district = '';
  addrForm.value.ward = '';
  updateDistricts();
  wardsData.value = [];
};

const onDistrictChange = () => {
  addrForm.value.ward = '';
  updateWards();
};

const updateDistricts = () => {
  const prov = provincesData.value.find(p => p.Name === addrForm.value.city);
  districtsData.value = prov ? prov.Districts : [];
};

const updateWards = () => {
  const dist = districtsData.value.find(d => d.Name === addrForm.value.district);
  wardsData.value = dist ? dist.Wards : [];
};

// === FORM OPEN / CLOSE ===
const openAddForm = () => {
  isEditing.value = false;
  addrForm.value = {
    id: null,
    customer_name: props.userName || '',
    customer_phone: props.userPhone || '',
    shipping_address: '', city: '', district: '', ward: '',
    is_default: addresses.value.length === 0
  };
  districtsData.value = [];
  wardsData.value = [];
  mapUrl.value = '';
  Object.keys(errs.value).forEach(k => errs.value[k] = '');
  showAddressForm.value = true;
};

const openEditForm = async (addr) => {
  isEditing.value = true;
  showAddressForm.value = true;
  
  await nextTick();
  
  addrForm.value = { 
    ...addr, 
    is_default: addr.is_default === 1 || addr.is_default === true,
    city: '',
    district: '',
    ward: ''
  };
  
  const matchedProvince = findBestMatch(provincesData.value, addr.city);
  addrForm.value.city = matchedProvince ? matchedProvince.Name : (addr.city || '');
  
  updateDistricts();
  await nextTick();
  
  const matchedDistrict = findBestMatch(districtsData.value, addr.district);
  addrForm.value.district = matchedDistrict ? matchedDistrict.Name : (addr.district || '');
  
  updateWards();
  await nextTick();
  
  const matchedWard = findBestMatch(wardsData.value, addr.ward);
  addrForm.value.ward = matchedWard ? matchedWard.Name : (addr.ward || '');
  
  mapUrl.value = '';
  Object.keys(errs.value).forEach(k => errs.value[k] = '');
};

const closeForm = () => {
  showAddressForm.value = false;
};

// === VALIDATION ===
const validateField = (field) => {
  const v = addrForm.value;
  if (field === 'customer_name') {
    let val = (v.customer_name || '').trim().replace(/\s+/g, ' ');
    v.customer_name = val;
    if (!val) errs.value.customer_name = 'Vui lòng nhập tên người nhận';
    else if (val.length < 2 || val.length > 50) errs.value.customer_name = 'Tên phải từ 2 đến 50 ký tự';
    else if (!/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/.test(val)) errs.value.customer_name = 'Tên phải chứa ít nhất 2 từ';
    else errs.value.customer_name = '';
  }
  if (field === 'customer_phone') {
    let val = (v.customer_phone || '').replace(/\D/g, '');
    v.customer_phone = val;
    if (!val) errs.value.customer_phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(val)) errs.value.customer_phone = 'Số điện thoại không hợp lệ';
    else errs.value.customer_phone = '';
  }
  if (field === 'shipping_address') {
    let val = v.shipping_address || '';
    if (!val) errs.value.shipping_address = 'Vui lòng nhập địa chỉ chi tiết';
    else if (val.length < 5) errs.value.shipping_address = 'Địa chỉ quá ngắn';
    else if (val.length > 255) errs.value.shipping_address = 'Địa chỉ tối đa 255 ký tự';
    else errs.value.shipping_address = '';
  }
  if (field === 'city') errs.value.city = v.city ? '' : 'Vui lòng chọn Tỉnh/TP';
  if (field === 'district') errs.value.district = v.district ? '' : 'Vui lòng chọn Quận/Huyện';
  if (field === 'ward') errs.value.ward = v.ward ? '' : 'Vui lòng chọn Phường/Xã';
};

// === GEO LOCATION — AUTO FILL DROPDOWN ===
const normalizeStr = (s) => (s || '').normalize('NFC').trim();

const findBestMatch = (list, target) => {
  if (!target || !list || list.length === 0) return null;
  const t = normalizeStr(target).toLowerCase();
  
  // Exact match
  let found = list.find(item => normalizeStr(item.Name).toLowerCase() === t);
  if (found) return found;
  
  const stripPrefix = (s) => s.replace(/^(thành phố|tỉnh|quận|huyện|thị xã|thị trấn|phường|xã)\s+/i, '').trim();
  const tStripped = stripPrefix(t);
  
  // Exact match without prefix
  found = list.find(item => stripPrefix(normalizeStr(item.Name).toLowerCase()) === tStripped);
  if (found) return found;

  // Target includes item name or vice versa
  found = list.find(item => t.includes(normalizeStr(item.Name).toLowerCase()));
  if (found) return found;
  found = list.find(item => normalizeStr(item.Name).toLowerCase().includes(t));
  if (found) return found;

  // Partial word match without prefix
  found = list.find(item => stripPrefix(normalizeStr(item.Name).toLowerCase()).includes(tStripped));
  if (found) return found;
  found = list.find(item => tStripped.includes(stripPrefix(normalizeStr(item.Name).toLowerCase())));
  return found || null;
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    showToast('Trình duyệt không hỗ trợ định vị', 'error');
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      let geoRes = null;
      try {
        geoRes = await axios.get(`${apiGeo}/reverse`, {
          params: { lat, lng: lon },
          headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
        });
      } catch (e) {
        console.error('Lỗi gọi backend reverse geo:', e);
        showToast('Không thể xác định địa chỉ từ vị trí', 'error');
        isLocating.value = false;
        return;
      }
      if (!geoRes?.data?.results?.length) {
        showToast('Không tìm thấy dữ liệu địa chỉ từ vị trí', 'error');
        isLocating.value = false;
        return;
      }

      mapUrl.value = `https://maps.google.com/maps?q=${lat},${lon}&hl=vi&z=15&output=embed`;

      const findInDisplayName = (list, dName) => {
        if (!dName) return null;
        const parts = dName.toLowerCase().split(',').map(s => s.trim());
        for (const item of list) {
          const nameL = item.Name.toLowerCase();
          const stripped = nameL.replace(/^(thành phố|tỉnh|quận|huyện|thị xã|thị trấn|phường|xã)\s+/i, '').trim();
          if (parts.some(p => {
             const pStripped = p.replace(/^(thành phố|tỉnh|quận|huyện|thị xã|thị trấn|phường|xã)\s+/i, '').trim();
             return p === nameL || p === stripped || pStripped === stripped;
          })) {
             return item;
          }
        }
        return null;
      };

      let matchedWard = null;

      const result = geoRes.data.results[0];
      const fullAddr = result.formatted_address;
      let matchedProvince = findInDisplayName(provincesData.value, fullAddr);
      if (matchedProvince) {
        addrForm.value.city = matchedProvince.Name;
        districtsData.value = matchedProvince.Districts || [];
        await nextTick();
        let matchedDistrict = findInDisplayName(districtsData.value, fullAddr);
        if (matchedDistrict) {
          addrForm.value.district = matchedDistrict.Name;
          wardsData.value = matchedDistrict.Wards || [];
          await nextTick();
          matchedWard = findInDisplayName(wardsData.value, fullAddr);
          if (matchedWard) {
            addrForm.value.ward = matchedWard.Name;
          }
        }
      }
      addrForm.value.shipping_address = fullAddr;

      validateField('shipping_address');
      validateField('city');
      validateField('district');
      validateField('ward');
      
      if (!matchedWard) {
        showToast('Đã lấy vị trí, nhưng bản đồ khu vực này thiếu dữ liệu Phường/Xã. Vui lòng chọn thủ công!', 'warning');
      } else {
        showToast('Đã lấy vị trí hiện tại và tự động điền địa chỉ', 'success');
      }
    } catch (err) {
      showToast('Lỗi khi lấy thông tin địa chỉ từ tọa độ', 'error');
    } finally {
      isLocating.value = false;
    }
  }, () => {
    showToast('Không thể lấy vị trí. Vui lòng cấp quyền!', 'error');
    isLocating.value = false;
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
};

// === SAVE ===
const saveAddress = async () => {
  ['customer_name','customer_phone','shipping_address','city','district','ward'].forEach(validateField);
  if (Object.values(errs.value).some(e => e !== '')) return;

  isSaving.value = true;
  try {
    const url = isEditing.value ? `${apiBase}/addresses/${addrForm.value.id}` : `${apiBase}/addresses`;
    const method = isEditing.value ? 'put' : 'post';
    const payload = { ...addrForm.value, is_default: addrForm.value.is_default ? 1 : 0 };

    const res = await axios[method](url, payload, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });

    if (res.data.status) {
      showToast(res.data.message, 'success');
      fetchAddresses();
      showAddressForm.value = false;
    }
  } catch (error) {
    if (error.response && error.response.status === 422) showToast('Vui lòng điền đầy đủ thông tin.', 'error');
    else showToast('Lỗi lưu địa chỉ.', 'error');
  } finally {
    isSaving.value = false;
  }
};

// === DELETE ===
const confirmDelete = async (id) => {
  soraAlert.fire({
    title: 'Xóa Địa Chỉ?',
    text: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'XÓA NGAY',
    cancelButtonText: 'HỦY'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${apiBase}/addresses/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
        });
        if (res.data.status) {
          showToast('Đã xóa địa chỉ', 'success');
          fetchAddresses();
        }
      } catch (e) {
        showToast('Lỗi khi xóa địa chỉ.', 'error');
      }
    }
  });
};

// === SET DEFAULT ===
const setDefault = async (id) => {
  try {
    const res = await axios.put(`${apiBase}/addresses/${id}/default`, {}, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (res.data.status) {
      showToast('Đã thay đổi địa chỉ mặc định', 'success');
      fetchAddresses();
    }
  } catch (e) {
    showToast('Lỗi thiết lập địa chỉ mặc định', 'error');
  }
};

onMounted(() => {
  fetchProvinces();
  fetchAddresses();
});
</script>

<style scoped>
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }
.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.tracking-wide { letter-spacing: 0.1em; }

.btn-main { background-color: #9f273b; color: white; border: 1px solid #9f273b; border-radius: 4px; transition: all 0.3s ease; }
.btn-main:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159,39,59,0.3); }

.btn-outline-main { color: #9f273b; border: 1px solid #9f273b; border-radius: 4px; background: transparent; transition: all 0.3s ease; }
.btn-outline-main:hover { background-color: #9f273b; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159,39,59,0.3); }

.tracking-wide { letter-spacing: 0.1em; }

.transition-all { transition: all 0.3s ease; }
.hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05); border-color: #e7ce7d !important; }
.hover-main:hover { color: #9f273b !important; }

.custom-input { border-radius: 4px; border: 1px solid #ced4da; padding: 0.6rem 1rem; transition: all 0.3s ease; }
.custom-input:focus { border-color: #9f273b; box-shadow: 0 0 0 0.2rem rgba(159,39,59,0.15); outline: none; }
select.custom-input { padding-right: 2.5rem; }
</style>
