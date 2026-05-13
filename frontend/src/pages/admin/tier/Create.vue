<template>
  <div class="container-fluid py-4">
    <div class="row mb-4 align-items-center">
      <div class="col-md-6 d-flex align-items-center">
        <router-link :to="{ name: 'admin-tiers' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          <i class="bi bi-arrow-left"></i>
        </router-link>
        <div class="d-flex flex-column">
          <h3 class="fw-bold text-dark mb-0">Thêm Hạng Hội Viên</h3>
          <p class="text-muted small mb-0 mt-1">Thiết lập quyền lợi cho khách hàng thân thiết</p>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4 p-md-5">
        <form @submit.prevent="submitTier">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="p-4 bg-light rounded-4 border h-100">
                <h6 class="fw-bold mb-4 text-dark border-bottom pb-2"><i class="bi bi-star-fill me-2 text-warning"></i>Thông tin & Điều kiện</h6>
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label fw-bold">Tên hạng (Bạc, Vàng, Kim Cương...) <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.name" maxlength="50" required placeholder="Nhập tên hạng...">
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Chi tiêu tối thiểu (VNĐ) <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" v-model="form.min_spent" min="0" max="99999999999" required>
                    <small class="text-muted fst-italic">Nhập 0 nếu là hạng mặc định</small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold">Số đơn tối thiểu <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" v-model="form.min_orders" min="0" max="1000000" required>
                    <small class="text-muted fst-italic">Hoặc đạt số đơn này để thăng hạng</small>
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
                  <img v-if="previewIcon" :src="previewIcon" class="w-100 h-100 object-fit-contain">
                  <i v-else class="bi bi-shield-fill-check fs-1 text-muted opacity-50"></i>
                </div>
                <input type="file" class="d-none" id="iconUpload" accept="image/*" @change="handleUpload">
                <label for="iconUpload" class="btn btn-sm btn-outline-brand rounded-pill mx-auto fw-semibold cursor-pointer px-4">
                  <i class="bi bi-upload"></i> Chọn Icon
                </label>
              </div>
            </div>
            
            <div class="col-12 text-end border-top pt-4">
              <button type="submit" class="btn btn-brand px-5 fw-bold text-white rounded-pill shadow-sm" :disabled="isSaving || !form.name">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU HẠNG THÀNH VIÊN
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const isSaving = ref(false);

const form = ref({
  name: '',
  min_spent: 0,
  min_orders: 0,
  discount_percent: 0,
  yearly_discount_quota: 0,
  yearly_service_quota: 0
});

const fileIcon = ref(null); 
const previewIcon = ref(null);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const handleUpload = (e) => {
  const f = e.target.files[0];
  if(f) { 
    if(f.size > 2 * 1024 * 1024) return Swal.fire('Lỗi', 'Ảnh tối đa 2MB', 'error'); 
    
    if (previewIcon.value) URL.revokeObjectURL(previewIcon.value);
    fileIcon.value = f; 
    previewIcon.value = URL.createObjectURL(f); 
  }
};

const submitTier = async () => {
  isSaving.value = true;
  const fd = new FormData();
  fd.append('name', form.value.name);
  fd.append('min_spent', form.value.min_spent);
  fd.append('min_orders', form.value.min_orders);
  fd.append('discount_percent', form.value.discount_percent);
  fd.append('yearly_discount_quota', form.value.yearly_discount_quota);
  fd.append('yearly_service_quota', form.value.yearly_service_quota);
  
  if(fileIcon.value) fd.append('icon', fileIcon.value);

  try {
    const res = await fetch(`${API_URL}/admin/tiers`, { method: 'POST', headers: getHeaders(), body: fd });
    const data = await res.json();
    if (res.ok) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã tạo hạng thành viên', showConfirmButton: false, timer: 1500 });
      router.push({ name: 'admin-tiers' });
    } else {
      Swal.fire('Lỗi', data.message || 'Dữ liệu không hợp lệ', 'error');
    }
  } catch(e) { 
    Swal.fire('Lỗi', 'Mất kết nối server', 'error'); 
  } finally { 
    isSaving.value = false; 
  }
};
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; } 
.btn-outline-brand:hover { background-color: #009981; color: white; }
.cursor-pointer { cursor: pointer; }
</style>