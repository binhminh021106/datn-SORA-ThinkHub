<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    
    <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
      <div>
        <h3 class="h4 font-serif text-dark mb-1">Sổ Địa Chỉ</h3>
        <p class="text-secondary fw-light mb-0">Quản lý địa chỉ nhận hàng của bạn</p>
      </div>
      <button v-if="!showAddressForm" @click="openAddForm" class="editorial-btn px-4 py-2" style="font-size: 0.85rem;">
        <i class="bi bi-plus-lg me-1"></i> Thêm Địa Chỉ
      </button>
    </div>

    <!-- DANH SÁCH ĐỊA CHỈ -->
    <div v-if="!showAddressForm">
      <SoraListSkeleton v-if="isLoading" :rows="3" :image="false" card />

      <div v-else-if="addresses.length === 0" class="text-center py-5 bg-light border border-light rounded-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-muted mb-3 opacity-50 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-secondary mb-3">Bạn chưa có địa chỉ nào được lưu.</p>
        <button @click="openAddForm" class="editorial-btn px-5 py-2"><i class="bi bi-plus-lg me-2"></i> Thêm Địa Chỉ Đầu Tiên</button>
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
                <button v-if="!addr.is_default" @click="setDefault(addr.id)" class="editorial-btn-outline mt-2 w-100" style="padding: 0.5rem 1rem; min-height: 36px;">Làm mặc định</button>
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
          <div class="col-12">
            <VietnamAddressPicker
              ref="addressPickerRef"
              v-model:province="addrForm.city"
              v-model:district="addrForm.district"
              v-model:ward="addrForm.ward"
              :address-text="addrForm.shipping_address"
              :required="true"
              input-class="custom-input bg-white"
              label-class="text-secondary small fw-medium"
              :invalid-province="Boolean(errs.city)"
              :invalid-district="Boolean(errs.district)"
              :invalid-ward="Boolean(errs.ward)"
              @change="handleAddressPickerChange"
            />
            <div v-if="errs.city || errs.district || errs.ward" class="invalid-feedback d-block mt-2">
              {{ errs.city || errs.district || errs.ward }}
            </div>
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
          <button type="submit" class="editorial-btn px-5 py-2" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>Hoàn Thành
          </button>
          <button type="button" @click="closeForm" class="editorial-btn-outline px-5 py-2">Trở Lại</button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import VietnamAddressPicker from '@/components/ui/VietnamAddressPicker.vue';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import clientApiClient from '@/utils/clientApiClient';

const props = defineProps({
  userName: { type: String, default: '' },
  userPhone: { type: String, default: '' }
});

const soraAlert = createSoraAlert({
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold text-uppercase' }
});

const showToast = (message, type = 'success') => {
  soraAlert.fire({
    icon: type,
    title:
type === 'success'
? 'Thành Công!'
: type === 'warning'
? 'Lưu Ý'
: 'Có Lỗi Xảy Ra!',
    text: message,
    timer: type === 'success' ? 2500 : undefined,
    showConfirmButton: type !== 'success'
  });
};

// === STATE ===
const addresses = ref([]);
const isLoading = ref(false);
const showAddressForm = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isLocating = ref(false);
const mapUrl = ref('');
const addressPickerRef = ref(null);

const addressHasDistrictLevel = ref(true);

const addrForm = ref({
  id: null, customer_name: '', customer_phone: '',
  shipping_address: '', city: '', district: '', ward: '', is_default: false
});

const errs = ref({
  customer_name: '', customer_phone: '',
  shipping_address: '', city: '', district: '', ward: ''
});

const handleAddressPickerChange = ({ hasDistrictLevel }) => {
  addressHasDistrictLevel.value = hasDistrictLevel;
  validateField('city');
  validateField('district');
  validateField('ward');
};

const fetchAddresses = async () => {
  isLoading.value = true;
  try {
    const res = await clientApiClient.get('/client/profile/addresses');
    if (res.data.status) addresses.value = res.data.data;
  } catch (e) {
    console.error('Lỗi lấy địa chỉ:', e);
  } finally {
    isLoading.value = false;
  }
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
  addressHasDistrictLevel.value = true;
  mapUrl.value = '';
  Object.keys(errs.value).forEach(k => errs.value[k] = '');
  showAddressForm.value = true;
};

const openEditForm = async (addr) => {
  isEditing.value = true;
  showAddressForm.value = true;

  addrForm.value = { 
    ...addr, 
    is_default: addr.is_default === 1 || addr.is_default === true
  };
  addressHasDistrictLevel.value = true;
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
    if (!val) {
      errs.value.customer_name = 'Vui lòng nhập tên người nhận';
    } else if (val.length < 2 || val.length > 50) {
      errs.value.customer_name = 'Tên phải từ 2 đến 50 ký tự';
    } else if (!/^[\p{L}\s]+$/u.test(val)) {
      errs.value.customer_name = 'Tên không đúng định dạng (chỉ chứa chữ cái và khoảng trắng)';
    } else if (!/^[\p{L}]+(?:\s+[\p{L}]+)+$/u.test(val)) {
      errs.value.customer_name = 'Tên không đúng định dạng (phải chứa ít nhất 2 từ)';
    } else {
      errs.value.customer_name = '';
    }
  }
  if (field === 'customer_phone') {
    let val = (v.customer_phone || '').replace(/\D/g, '');
    v.customer_phone = val;
    if (!val) {
      errs.value.customer_phone = 'Vui lòng nhập số điện thoại';
    } else if (val.length !== 10) {
      errs.value.customer_phone = 'Số điện thoại không đúng định dạng (phải có đúng 10 chữ số)';
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(val)) {
      errs.value.customer_phone = 'Số điện thoại không đúng định dạng (phải bắt đầu bằng 03, 05, 07, 08 hoặc 09)';
    } else {
      errs.value.customer_phone = '';
    }
  }
  if (field === 'shipping_address') {
    let val = (v.shipping_address || '').trim().replace(/\s+/g, ' ');
    v.shipping_address = val;
    
    const hasLetters = /[A-Za-zÀ-ỹ]/.test(val);
    const hasEnoughWords = val.split(' ').length >= 2;

    if (!val) {
      errs.value.shipping_address = 'Vui lòng nhập địa chỉ chi tiết';
    } else if (val.length < 10 || !hasLetters || !hasEnoughWords) {
      errs.value.shipping_address = 'Địa chỉ không đúng định dạng (tối thiểu 10 ký tự, phải có chữ và ít nhất 2 từ. VD: Số 12, Đường Nguyễn Văn A)';
    } else if (val.length > 255) {
      errs.value.shipping_address = 'Địa chỉ tối đa 255 ký tự';
    } else {
      errs.value.shipping_address = '';
    }
  }
  if (field === 'city') errs.value.city = v.city ? '' : 'Vui lòng chọn Tỉnh/TP';
  if (field === 'district') errs.value.district = (!addressHasDistrictLevel.value || v.district) ? '' : 'Vui lòng chọn Quận/Huyện';
  if (field === 'ward') errs.value.ward = v.ward ? '' : 'Vui lòng chọn Phường/Xã';
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
        geoRes = await clientApiClient.get('/client/geo/reverse', {
          params: { lat, lng: lon }
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

      const result = geoRes.data.results[0];
      const fullAddr = result.formatted_address || result.description || '';
      const compound = result.compound || result.address || {};
      addrForm.value.shipping_address = fullAddr;


      const provinceName = compound.province || compound.city || '';
      // Goong có thể trả về district với nhiều key khác nhau
      const districtName = compound.district || compound.district_name || '';
      const wardName = compound.commune || compound.ward || compound.commune_name || '';
      const resolvedAddress = await addressPickerRef.value?.resolveAddress({
        province: provinceName,
        district: districtName,
        ward: wardName,
        addressText: fullAddr,
      });


      addrForm.value.city = resolvedAddress?.province?.name || provinceName || addrForm.value.city;
      // Ưu tiên kết quả đã resolve; nếu không match được thì dùng tên raw từ Goong để user thấy và chọn lại
      addrForm.value.district = resolvedAddress?.district?.name || districtName || addrForm.value.district;
      addrForm.value.ward = resolvedAddress?.ward?.name || wardName || addrForm.value.ward;
      addressHasDistrictLevel.value = Boolean(resolvedAddress?.hasDistrictLevel);

      validateField('shipping_address');
      validateField('city');
      validateField('district');
      validateField('ward');
      
      const missingDistrict = addressHasDistrictLevel.value && !resolvedAddress?.district;
      if (!addrForm.value.city || !addrForm.value.ward) {
        showToast('Đã lấy vị trí, vui lòng kiểm tra lại Tỉnh/Thành và Phường/Xã trước khi lưu.', 'warning');
      } else if (missingDistrict) {
        showToast('Đã lấy vị trí! Vui lòng chọn lại Quận/Huyện từ danh sách.', 'warning');
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
    const url = isEditing.value ? `/client/profile/addresses/${addrForm.value.id}` : '/client/profile/addresses';
    const method = isEditing.value ? 'put' : 'post';
    const payload = { ...addrForm.value, is_default: addrForm.value.is_default ? 1 : 0 };

    const res = await clientApiClient[method](url, payload);

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
        const res = await clientApiClient.delete(`/client/profile/addresses/${id}`);
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
    const res = await clientApiClient.put(`/client/profile/addresses/${id}/default`, {});
    if (res.data.status) {
      showToast('Đã thay đổi địa chỉ mặc định', 'success');
      fetchAddresses();
    }
  } catch (e) {
    showToast('Lỗi thiết lập địa chỉ mặc định', 'error');
  }
};

onMounted(() => {
  fetchAddresses();
});
</script>

<style scoped>
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }
.font-serif { font-family: 'Josefin Sans', sans-serif; }
.tracking-wide { letter-spacing: 0.1em; }



.tracking-wide { letter-spacing: 0.1em; }

.transition-all { transition: all 0.3s ease; }
.hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05); border-color: #e7ce7d !important; }
.hover-main:hover { color: #9f273b !important; }

.custom-input { border-radius: 4px; border: 1px solid #ced4da; padding: 0.6rem 1rem; transition: all 0.3s ease; }
.custom-input:focus { border-color: #9f273b; box-shadow: 0 0 0 0.2rem rgba(159,39,59,0.15); outline: none; }
select.custom-input { padding-right: 2.5rem; }
</style>
