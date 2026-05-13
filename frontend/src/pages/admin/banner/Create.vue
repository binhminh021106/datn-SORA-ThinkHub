<template>
  <div class="container-fluid py-4">
    <div class="row mb-4 align-items-center">
      <div class="col-md-6 d-flex align-items-center">
        <router-link :to="{ name: 'admin-banners' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;"><i class="bi bi-arrow-left"></i></router-link>
        <div class="d-flex flex-column">
          <h3 class="fw-bold text-dark mb-0">Thêm Banner</h3>
          <p class="text-muted small mb-0 mt-1">Thiết lập chiến dịch hiển thị mới</p>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4 p-md-5">
        <form @submit.prevent="submitBanner">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="p-4 bg-light rounded-4 border h-100">
                <h6 class="fw-bold mb-4 text-dark border-bottom pb-2"><i class="bi bi-info-circle me-2"></i>Cấu hình Banner</h6>
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label fw-bold">Tên chiến dịch <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.title" required placeholder="VD: Khai trương ThinkHub, Sale 8/3...">
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Thuộc thương hiệu</label>
                    <select class="form-select" v-model="form.brand_id">
                      <option value="">-- Banner hệ thống chung --</option>
                      <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
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
                <h6 class="fw-bold mb-3"><i class="bi bi-pc-display me-2"></i>Ảnh Desktop <span class="text-danger">*</span></h6>
                <div class="mb-3 border rounded bg-white shadow-sm position-relative overflow-hidden" style="height: 120px; padding: 0.2rem;">
                  <img v-if="previewDesk" :src="previewDesk" class="w-100 h-100 object-fit-contain">
                  <div v-else class="d-flex flex-column justify-content-center align-items-center h-100 text-muted small">
                     <i class="bi bi-image fs-3 mb-1 opacity-50"></i>
                     Tỷ lệ chuẩn 16:9 (1920x600px)
                  </div>
                </div>
                <input type="file" class="d-none" id="deskUpload" accept="image/*" @change="(e) => handleUpload(e, 'desk')">
                <label for="deskUpload" class="btn btn-sm btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer"><i class="bi bi-upload"></i> Chọn ảnh PC</label>
              </div>

              <div class="p-4 bg-light rounded-4 border text-center flex-fill">
                <h6 class="fw-bold mb-3"><i class="bi bi-phone me-2"></i>Ảnh Mobile <span class="text-danger">*</span></h6>
                <div class="mb-3 border rounded bg-white shadow-sm position-relative mx-auto overflow-hidden" style="height: 150px; width: 100px; padding: 0.2rem;">
                  <img v-if="previewMob" :src="previewMob" class="w-100 h-100 object-fit-contain">
                  <div v-else class="d-flex flex-column justify-content-center align-items-center h-100 text-muted small text-center" style="font-size: 0.7rem;">
                    <i class="bi bi-image fs-3 mb-1 opacity-50"></i>
                    Tỷ lệ dọc (800x1200px)
                  </div>
                </div>
                <input type="file" class="d-none" id="mobUpload" accept="image/*" @change="(e) => handleUpload(e, 'mob')">
                <label for="mobUpload" class="btn btn-sm btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer"><i class="bi bi-upload"></i> Chọn ảnh Mobile</label>
              </div>
            </div>
            
            <div class="col-12 text-end border-top pt-4">
              <button type="submit" class="btn btn-brand px-5 fw-bold text-white rounded-pill shadow-sm" :disabled="isSaving || !form.title">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU BANNER
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const isSaving = ref(false);
const form = ref({ title: '', brand_id: '', target_url: '', position: 'home_slider', start_date: '', end_date: '', isActive: true });
const brands = ref([]);

const fileDesk = ref(null); const previewDesk = ref(null);
const fileMob = ref(null); const previewMob = ref(null);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const handleUpload = (e, type) => {
  const f = e.target.files[0];
  if(f) { 
    if(f.size > 15 * 1024 * 1024) { return Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error'); }
    
    if(type === 'desk') { 
      if (previewDesk.value) URL.revokeObjectURL(previewDesk.value);
      fileDesk.value = f; 
      previewDesk.value = URL.createObjectURL(f); 
    }
    else { 
      if (previewMob.value) URL.revokeObjectURL(previewMob.value);
      fileMob.value = f; 
      previewMob.value = URL.createObjectURL(f); 
    }
  }
};

onMounted(async () => {
  try {
    const res = await fetch(`${API_URL}/admin/brands`, { headers: getHeaders() });
    if (res.ok) {
        const data = await res.json();
        // Lọc lấy brand đang active thôi
        brands.value = data.data.filter(b => b.status === 'active' && !b.deleted_at);
    }
  } catch(e) {}
});

const submitBanner = async () => {
  if (!fileDesk.value) {
    return Swal.fire('Lưu ý', 'Vui lòng chọn Ảnh Desktop!', 'warning');
  }
  if (!fileMob.value) {
    return Swal.fire('Lưu ý', 'Vui lòng chọn Ảnh Mobile!', 'warning');
  }

  if (form.value.start_date && form.value.end_date) {
    if (new Date(form.value.end_date) <= new Date(form.value.start_date)) {
      return Swal.fire('Lỗi', 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!', 'warning');
    }
  }

  isSaving.value = true;
  const fd = new FormData();
  fd.append('title', form.value.title);
  fd.append('position', form.value.position);
  if(form.value.brand_id) fd.append('brand_id', form.value.brand_id);
  if(form.value.target_url) fd.append('target_url', form.value.target_url);
  if(form.value.start_date) fd.append('start_date', form.value.start_date.replace('T', ' ') + ':00'); 
  if(form.value.end_date) fd.append('end_date', form.value.end_date.replace('T', ' ') + ':00');
  fd.append('status', form.value.isActive ? 'active' : 'hidden');
  
  if(fileDesk.value) fd.append('image_desktop', fileDesk.value);
  if(fileMob.value) fd.append('image_mobile', fileMob.value);

  try {
    const res = await fetch(`${API_URL}/admin/banners`, { method: 'POST', headers: getHeaders(), body: fd });
    const data = await res.json();
    if (res.ok) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã tạo banner', showConfirmButton: false, timer: 1500 });
      router.push({ name: 'admin-banners' });
    } else {
      Swal.fire('Lỗi', data.message || 'Dữ liệu không hợp lệ', 'error');
    }
  } catch(e) { 
    Swal.fire('Lỗi', 'Mất kết nối', 'error'); 
  } finally { 
    isSaving.value = false; 
  }
};
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; } .btn-brand { background-color: #009981; color: white; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; } .btn-outline-brand:hover { background-color: #009981; color: white; }
.cursor-pointer { cursor: pointer; }
</style>