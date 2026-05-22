<template>
  <!-- SKELETON CHỜ KHI KHÔNG CÓ CACHE (F5 MÀN HÌNH) -->
  <div v-if="isLoading" class="container-fluid py-4">
    <div class="row mb-4"><div class="col-6"><span class="placeholder col-8 rounded" style="height: 40px;"></span></div></div>
    <div class="card border-0 shadow-sm rounded-4"><div class="card-body p-5 placeholder-glow"><span class="placeholder col-12 rounded mb-3" style="height: 300px;"></span></div></div>
  </div>

  <div class="container-fluid py-4" v-else>
    <div class="row mb-4 align-items-center">
      <div class="col-md-6 d-flex align-items-center">
        <router-link :to="{ name: 'admin-banners' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;"><i class="bi bi-arrow-left"></i></router-link>
        <div class="d-flex flex-column">
          <h3 class="fw-bold text-dark mb-0">Cập nhật Banner</h3>
          <p class="text-muted small mb-0 mt-1">Chỉnh sửa nội dung chiến dịch <span v-if="isFetching" class="spinner-border spinner-border-sm text-brand ms-2" title="Đang đồng bộ ngầm"></span></p>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4 p-md-5">
        <form @submit.prevent="submitForm">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="p-4 bg-light rounded-4 border h-100">
                <h6 class="fw-bold mb-4 text-dark border-bottom pb-2"><i class="bi bi-info-circle me-2"></i>Cấu hình Banner</h6>
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label fw-bold">Tên chiến dịch <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.title" required>
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Thuộc thương hiệu</label>
                    <select class="form-select" v-model="form.brand_id">
                      <option value="">-- Banner hệ thống chung --</option>
                      <option v-if="missingBrand" :value="form.brand_id" class="text-danger">{{ missingBrand.name }} (Đã ẩn/xóa)</option>
                      <option v-for="b in activeBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold">Vị trí hiển thị</label>
                    <select class="form-select" v-model="form.position">
                      <option value="home_slider">Slider Trang chủ</option>
                      <option value="category_top">Đầu trang Danh mục</option>
                      <option value="popup">Popup Sale</option>
                    </select>
                  </div>

                  <div class="col-md-12">
                    <label class="form-label fw-bold">Link điều hướng (Target URL)</label>
                    <div class="input-group">
                      <input type="url" class="form-control" v-model="form.target_url" placeholder="https://...">
                      <a :href="form.target_url" target="_blank" class="btn btn-outline-secondary" :class="{'disabled': !form.target_url}">Test Link</a>
                    </div>
                  </div>

                  <div class="col-md-6 mt-3">
                    <label class="form-label fw-bold text-success"><i class="bi bi-calendar-play me-1"></i>Thời gian bắt đầu</label>
                    <input type="datetime-local" class="form-control" v-model="form.start_date">
                  </div>
                  
                  <div class="col-md-6 mt-3">
                    <label class="form-label fw-bold text-danger"><i class="bi bi-calendar-x me-1"></i>Thời gian kết thúc</label>
                    <input type="datetime-local" class="form-control" v-model="form.end_date" :min="form.start_date">
                  </div>

                  <div class="col-md-12 mt-4">
                    <div class="form-check form-switch fs-5">
                      <input class="form-check-input" type="checkbox" id="statusSwitch" v-model="form.isActive">
                      <label class="form-check-label fw-bold ms-2" for="statusSwitch">
                        <span :class="form.isActive ? 'text-success' : 'text-secondary'">{{ form.isActive ? 'Đang hoạt động' : 'Đang ẩn' }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4 d-flex flex-column gap-3">
              <div class="p-4 bg-light rounded-4 border text-center flex-fill">
                <h6 class="fw-bold mb-3"><i class="bi bi-pc-display me-2"></i>Ảnh Desktop</h6>
                <div class="mb-3 border rounded bg-white shadow-sm position-relative overflow-hidden" style="height: 120px; padding: 0.2rem;">
                  <img v-if="previewDesk" :src="previewDesk" @error="handleImageError" class="w-100 h-100 object-fit-contain">
                </div>
                <input type="file" class="d-none" id="deskUpload" accept="image/*" @change="(e) => handleUpload(e, 'desk')">
                <label for="deskUpload" class="btn btn-sm btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer"><i class="bi bi-upload"></i> Đổi ảnh PC</label>
              </div>

              <div class="p-4 bg-light rounded-4 border text-center flex-fill">
                <h6 class="fw-bold mb-3"><i class="bi bi-phone me-2"></i>Ảnh Mobile</h6>
                <div class="mb-3 border rounded bg-white shadow-sm position-relative mx-auto overflow-hidden" style="height: 150px; width: 100px; padding: 0.2rem;">
                  <img v-if="previewMob" :src="previewMob" @error="handleImageError" class="w-100 h-100 object-fit-contain">
                </div>
                <input type="file" class="d-none" id="mobUpload" accept="image/*" @change="(e) => handleUpload(e, 'mob')">
                <label for="mobUpload" class="btn btn-sm btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer"><i class="bi bi-upload"></i> Đổi ảnh Mobile</label>
              </div>
            </div>
            
            <div class="col-12 text-end border-top pt-4">
              <button type="submit" class="btn btn-brand px-5 fw-bold text-white rounded-pill shadow-sm" :disabled="isUpdating || !form.title">
                <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span> CẬP NHẬT BANNER
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import { getFullImage } from '@/composables/useUtilities';

const queryClient = useQueryClient();
const route = useRoute(); const router = useRouter();
const bannerId = route.params.id;
const API_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });
const getImageUrl = (path) => path ? getFullImage(path) : '/placeholder.png';
const handleImageError = (e) => { e.target.src = '/placeholder.png'; };

const formatForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const form = ref({ title: '', brand_id: '', target_url: '', position: 'home_slider', start_date: '', end_date: '', isActive: true });
const missingBrand = ref(null);
const fileDesk = ref(null); const previewDesk = ref(null);
const fileMob = ref(null); const previewMob = ref(null);

// 1. Tận dụng Cache của Brand nếu có, không thì fetch
const { data: rawBrands } = useQuery({
  queryKey: ['admin', 'brands'],
  queryFn: async () => {
    const res = await fetch(`${API_URL}/admin/brands`, { headers: getHeaders() });
    return (await res.json()).data;
  },
  staleTime: 5 * 60 * 1000
});
const activeBrands = computed(() => (rawBrands.value || []).filter(b => b.status === 'active' && !b.deleted_at));

// 2. Fetch/Lấy Cache Banner Detail
const fetchBannerDetail = async () => {
  const res = await fetch(`${API_URL}/admin/banners/${bannerId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch banner');
  return (await res.json()).data;
};

const { data: bannerData, isLoading, isFetching } = useQuery({
  queryKey: ['admin', 'banner', bannerId],
  queryFn: fetchBannerDetail,
  // TẬN DỤNG CACHE TỪ LIST TRUYỀN SANG (TRIỆT TIÊU ĐỘ TRỄ KHI TỪ LIST ẤN EDIT)
  initialData: () => {
    return queryClient.getQueryData(['admin', 'banners'])?.find(d => d.id == bannerId);
  },
  staleTime: 1000 * 60 * 5, // 5 phút
});

// Map Data từ Vue Query ra Local Form
watchEffect(() => {
  if (bannerData.value) {
    const b = bannerData.value;
    form.value.title = b.title;
    form.value.brand_id = b.brand_id || '';
    form.value.position = b.position || 'home_slider';
    form.value.target_url = b.target_url || '';
    form.value.start_date = formatForInput(b.start_date);
    form.value.end_date = formatForInput(b.end_date);
    form.value.isActive = b.status === 'active';
    
    // Chỉ ghi đè preview khi chưa có file mới (tránh ghi đè ảnh user vừa upload)
    if (!fileDesk.value) previewDesk.value = getImageUrl(b.image_desktop);
    if (!fileMob.value) previewMob.value = getImageUrl(b.image_mobile);

    // Kế thừa giải quyết mồ côi Brand
    if (b.brand_id && !activeBrands.value.find(brand => brand.id === b.brand_id)) {
        missingBrand.value = b.brand ? b.brand : { id: b.brand_id, name: 'Brand không xác định' };
    }
  }
});

const handleUpload = (e, type) => {
  const f = e.target.files[0];
  if(f) { 
    if(f.size > 15 * 1024 * 1024) return Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error');
    if(type === 'desk') { fileDesk.value = f; previewDesk.value = URL.createObjectURL(f); }
    else { fileMob.value = f; previewMob.value = URL.createObjectURL(f); }
  }
};

// 3. Mutation Cập nhật API
const { mutate: updateBanner, isLoading: isUpdating } = useMutation({
  mutationFn: async (formData) => {
    const res = await fetch(`${API_URL}/admin/banners/${bannerId}`, { method: 'POST', headers: getHeaders(), body: formData });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi dữ liệu'); }
    return (await res.json()).data;
  },
  onSuccess: (updatedData) => {
    // Ép Cache của Detail và List cập nhật bằng Data thực trả về từ Server
    queryClient.setQueryData(['admin', 'banner', bannerId], updatedData);
    queryClient.setQueryData(['admin', 'banners'], (oldList) => {
      if(!oldList) return oldList;
      return oldList.map(b => b.id == bannerId ? updatedData : b);
    });
    
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 });
    router.push({ name: 'admin-banners' });
  },
  onError: (error) => Swal.fire('Lỗi', error.message || 'Mất kết nối', 'error')
});

const submitForm = () => {
  if (form.value.start_date && form.value.end_date) {
    if (new Date(form.value.end_date) <= new Date(form.value.start_date)) {
      return Swal.fire('Lỗi', 'Thời gian kết thúc phải diễn ra sau bắt đầu!', 'warning');
    }
  }

  const fd = new FormData();
  fd.append('_method', 'PUT');
  fd.append('title', form.value.title);
  fd.append('position', form.value.position);
  if(form.value.brand_id) fd.append('brand_id', form.value.brand_id);
  if(form.value.target_url) fd.append('target_url', form.value.target_url);
  
  if(form.value.start_date) fd.append('start_date', form.value.start_date.replace('T', ' ') + ':00');
  else fd.append('start_date', ''); 
  
  if(form.value.end_date) fd.append('end_date', form.value.end_date.replace('T', ' ') + ':00');
  else fd.append('end_date', '');

  fd.append('status', form.value.isActive ? 'active' : 'hidden');
  
  if(fileDesk.value) fd.append('image_desktop', fileDesk.value);
  if(fileMob.value) fd.append('image_mobile', fileMob.value);

  updateBanner(fd);
};
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; } .btn-brand { background-color: #009981; color: white; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; } .btn-outline-brand:hover { background-color: #009981; color: white; }
.cursor-pointer { cursor: pointer; }
.text-brand { color: #009981 !important; }
</style>