<template>
  <div class="tier-edit-wrapper pb-5 mb-5">

    <div v-if="!isLoaded" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 d-flex align-items-center">
          <router-link :to="{ name: 'admin-tiers' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left"></i>
          </router-link>
          <div class="d-flex flex-column">
            <h3 class="fw-bold text-dark mb-0">Cập nhật Hạng Hội Viên</h3>
            <p class="text-muted small mb-0 mt-1">Chỉnh sửa thông tin hạng: <strong class="text-brand">{{ form.name }}</strong></p>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="updateTier">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="p-4 bg-light rounded-4 border h-100">
                  <h6 class="fw-bold mb-4 text-dark border-bottom pb-2"><i class="bi bi-star-fill me-2 text-warning"></i>Thông tin & Điều kiện</h6>
                  <div class="row g-3">
                    <div class="col-md-12">
                      <label class="form-label fw-bold">Tên hạng <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.name" maxlength="50" required>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Chi tiêu tối thiểu (VNĐ) <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control text-end currency-input"
                          v-model="formattedMinSpent"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          maxlength="14"
                          :readonly="isDefaultTier"
                          required
                        >
                        <span class="input-group-text bg-white">VNĐ</span>
                      </div>
                      <small class="text-muted fst-italic" v-if="isDefaultTier">Hạng mặc định không thể sửa mức chi tiêu.</small>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-bold">Số đơn tối thiểu <span class="text-danger">*</span></label>
                      <input type="number" class="form-control" v-model="form.min_orders" min="0" max="1000000" required>
                    </div>

                    <div class="col-md-4 mt-4">
                      <label class="form-label fw-bold text-success"><i class="bi bi-tags-fill me-1"></i>% Giảm giá mặc định <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input type="number" class="form-control" v-model="form.discount_percent" min="0" max="100" step="0.1" required>
                        <span class="input-group-text bg-white">%</span>
                      </div>
                    </div>

                    <div class="col-md-4 mt-4">
                      <label class="form-label fw-bold text-warning" style="color: #fd7e14 !important;"><i class="bi bi-ticket-perforated-fill me-1"></i>Số lượt giảm <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input type="number" class="form-control" v-model="form.yearly_discount_quota" min="0" max="100000" required>
                        <span class="input-group-text bg-white">Lần/Năm</span>
                      </div>
                    </div>
                    
                    <div class="col-md-4 mt-4">
                      <label class="form-label fw-bold text-brand"><i class="bi bi-magic me-1"></i>Vệ sinh/Đánh bóng <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input type="number" class="form-control" v-model="form.yearly_service_quota" min="0" max="10000" required>
                        <span class="input-group-text bg-white">Lần/Năm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4 d-flex flex-column gap-3">
                <div class="p-4 bg-light rounded-4 border text-center flex-fill d-flex flex-column justify-content-center">
                  <h6 class="fw-bold mb-3">Icon/Huy hiệu Hạng</h6>
                  <div class="mb-3 border rounded-circle bg-white shadow-sm position-relative mx-auto overflow-hidden d-flex justify-content-center align-items-center" style="height: 120px; width: 120px; padding: 0.5rem;">
                    <!-- Sử dụng SoraImage cho xem trước ảnh -->
                    <SoraImage 
                      :src="previewIcon" 
                      :placeholder="placeholderImg"
                      imgClass="w-100 h-100 object-fit-contain" 
                      alt="Tier Icon Preview"
                    />
                  </div>
                  <input type="file" class="d-none" id="iconUpload" accept="image/png, image/jpeg, image/webp" @change="handleUpload">
                  <label for="iconUpload" class="btn btn-sm btn-outline-brand rounded-pill mx-auto fw-semibold cursor-pointer px-4">
                    <i class="bi bi-upload"></i> Đổi Icon
                  </label>
                </div>
              </div>
              
              <div class="col-12 text-end border-top pt-4">
                <button type="submit" class="btn btn-brand px-5 fw-bold text-white rounded-pill shadow-sm" :disabled="isSaving || !form.name">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> CẬP NHẬT
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { getFullImage } from '@/composables/useUtilities';

import SoraImage from '@/components/ui/SoraImage.vue';
import placeholderImg from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const tierId = route.params.id;

const isSaving = ref(false);
const isDefaultTier = ref(false);

const form = ref({
  name: '', min_spent: 0, min_orders: 0, 
  discount_percent: 0, yearly_discount_quota: 0, yearly_service_quota: 0
});

const formattedMinSpent = computed({
  get() {
    return form.value.min_spent ? new Intl.NumberFormat('vi-VN').format(form.value.min_spent) : '';
  },
  set(value) {
    const numeric = parseInt(value.replace(/\D/g, ''), 10);
    form.value.min_spent = Number.isNaN(numeric) ? 0 : numeric;
  }
});

const fileIcon = ref(null); 
const previewIcon = ref(placeholderImg);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const handleAxiosError = (e, defaultMsg = 'Lỗi hệ thống') => {
  if (e.response) {
    if (e.response.status === 401) Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
    else if (e.response.data && e.response.data.errors) {
      let errorHtml = '<ul class="text-start text-danger small mt-2">';
      Object.values(e.response.data.errors).flat().forEach(msg => errorHtml += `<li>${msg}</li>`);
      errorHtml += '</ul>';
      Swal.fire({ title: 'Dữ liệu không hợp lệ', html: errorHtml, icon: 'error' });
    } else Swal.fire('Lỗi', e.response.data.message || defaultMsg, 'error');
  } else Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
};

// ==========================================
// TANSTACK VUE QUERY - FETCH DATA
// ==========================================
const { data: tierResponse, isLoading: isTierLoading, isError } = useQuery({
  queryKey: ['adminTier', tierId],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/tiers/${tierId}`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 2 * 60 * 1000
});

const isLoaded = computed(() => !isTierLoading.value);
const rawTierData = computed(() => tierResponse.value?.data);

watch(isError, (hasError) => {
    if (hasError) {
        Swal.fire('Lỗi', 'Không tìm thấy dữ liệu hạng', 'error');
        router.push({ name: 'admin-tiers' });
    }
});

watch(rawTierData, (data) => {
  if (data) {
    form.value = {
      name: data.name, min_spent: data.min_spent, min_orders: data.min_orders,
      discount_percent: data.discount_percent, yearly_discount_quota: data.yearly_discount_quota || 0,
      yearly_service_quota: data.yearly_service_quota
    };
    isDefaultTier.value = data.min_spent == 0;
    previewIcon.value = data.icon ? getFullImage(data.icon) : placeholderImg;
  }
}, { immediate: true });

const handleUpload = (e) => {
  const f = e.target.files[0];
  if(f) { 
    if(!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return Swal.fire('Lỗi', 'Chỉ chấp nhận ảnh (JPG, PNG, WEBP)', 'error');
    if(f.size > 2 * 1024 * 1024) return Swal.fire('Lỗi', 'Ảnh tối đa 2MB', 'error'); 
    
    if (previewIcon.value && previewIcon.value.startsWith('blob:')) URL.revokeObjectURL(previewIcon.value);
    fileIcon.value = f; 
    previewIcon.value = URL.createObjectURL(f); 
  }
};

// ==========================================
// TANSTACK VUE QUERY - MUTATIONS
// ==========================================
const updateTierMutation = useMutation({
  mutationFn: async (formData) => {
    const res = await axios.post(`${API_URL}/admin/tiers/${tierId}`, formData, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  onMutate: () => { isSaving.value = true; },
  onSuccess: (data) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: data.message || 'Cập nhật thành công', showConfirmButton: false, timer: 1500 });
    queryClient.invalidateQueries({ queryKey: ['adminTier', tierId] });
    queryClient.invalidateQueries({ queryKey: ['adminTiers'] }); // Update list
    router.push({ name: 'admin-tiers' });
  },
  onError: (err) => handleAxiosError(err, 'Không thể cập nhật hạng'),
  onSettled: () => { isSaving.value = false; }
});

const updateTier = () => {
  const fd = new FormData();
  fd.append('_method', 'PUT');
  Object.keys(form.value).forEach(key => fd.append(key, form.value[key]));
  if(fileIcon.value) fd.append('icon', fileIcon.value);

  updateTierMutation.mutate(fd);
};
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; } .btn-outline-brand:hover { background-color: #009981; color: white; }
.currency-input { letter-spacing: 0.02em; }
.tier-edit-wrapper .card-body { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.tier-edit-wrapper .bg-light { padding: 1.25rem !important; }
.cursor-pointer { cursor: pointer; }
</style>