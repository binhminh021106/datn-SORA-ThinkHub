<template>
  <div class="brand-create-wrapper pb-5 mb-5">
    <div class="container-fluid py-4">
      
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 d-flex align-items-center">
          <router-link :to="{ name: 'admin-brands' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div class="d-flex flex-column">
            <h3 class="fw-bold text-dark mb-0">Thêm Thương hiệu</h3>
            <p class="text-muted small mb-0 mt-1">Khởi tạo đối tác / thương hiệu mới</p>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="submitBrand">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="p-4 bg-light rounded-4 border h-100">
                  <h6 class="fw-bold mb-4 text-dark form-section-title"><i class="bi bi-info-circle me-2"></i>Thông tin chung</h6>
                  <div class="row g-3">
                    <div class="col-md-12">
                      <label class="form-label fw-bold">Tên thương hiệu <span class="text-danger">*</span></label>
                      <input type="text" class="form-control form-control-lg" v-model="form.name" @input="generateSlug" required placeholder="VD: PNJ, DOJI, Cartier...">
                    </div>
                    <div class="col-md-12">
                      <label class="form-label fw-bold">Đường dẫn (Slug)</label>
                      <input type="text" class="form-control bg-white text-muted font-monospace" v-model="form.slug" readonly>
                    </div>
                    <div class="col-md-12">
                      <label class="form-label fw-bold">Mô tả thương hiệu</label>
                      <textarea class="form-control" v-model="form.description" rows="4" placeholder="Nhập mô tả ngắn về thương hiệu này..."></textarea>
                    </div>
                    <div class="col-md-6 mt-4">
                      <div class="form-check form-switch fs-5">
                        <input class="form-check-input cursor-pointer" type="checkbox" id="statusSwitch" v-model="form.isActive">
                        <label class="form-check-label fw-bold ms-2 cursor-pointer" for="statusSwitch">
                          <span :class="form.isActive ? 'text-success' : 'text-secondary'">{{ form.isActive ? 'Đang hoạt động' : 'Đang ẩn' }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="p-4 bg-light rounded-4 border text-center h-100">
                  <h6 class="fw-bold mb-3 text-start form-section-title"><i class="bi bi-image me-2"></i>Logo Thương hiệu</h6>
                  <div class="mb-3 position-relative border rounded-4 overflow-hidden bg-white shadow-sm" style="height: 250px; padding: 1rem;">
                    <img v-if="logoPreview" :src="logoPreview" class="w-100 h-100 object-fit-contain">
                    <div v-else class="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                      <i class="bi bi-building fs-1 mb-2 opacity-50"></i>
                      <span class="small fw-semibold text-secondary">Tùy chọn</span>
                    </div>
                  </div>
                  <input type="file" class="d-none" id="logoUpload" accept="image/*" @change="handleLogoUpload">
                  <label for="logoUpload" class="btn btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer"><i class="bi bi-upload me-1"></i> Tải logo lên</label>
                </div>
              </div>
              
              <div class="col-12 text-end border-top pt-4 mt-2">
                <button type="submit" class="btn btn-brand px-5 fw-bold text-white rounded-pill shadow-sm py-2" :disabled="isSaving || !form.name">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU THƯƠNG HIỆU
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const isSaving = ref(false);

const form = ref({
  name: '', slug: '', description: '', isActive: true
});
const logoFile = ref(null);
const logoPreview = ref(null);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const generateSlug = () => {
  let s = form.value.name.toLowerCase();
  s = s.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  s = s.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  s = s.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  s = s.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  s = s.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  s = s.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
  s = s.replace(/đ/gi, 'd');
  form.value.slug = s.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-\-+/g, '-');
};

const handleLogoUpload = (e) => {
  const f = e.target.files[0];
  if(f) { 
      if(f.size > 15 * 1024 * 1024) { Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error'); return; }
      logoFile.value = f; 
      logoPreview.value = URL.createObjectURL(f); 
  }
};

const submitBrand = async () => {
  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('slug', form.value.slug);
    formData.append('status', form.value.isActive ? 'active' : 'hidden');
    if (form.value.description) formData.append('description', form.value.description);
    if (logoFile.value) formData.append('logo', logoFile.value);

    const res = await axios.post(`${API_URL}/admin/brands`, formData, {
      headers: getHeaders()
    });

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã tạo thương hiệu', showConfirmButton: false, timer: 1500 }).then(() => {
      router.push({ name: 'admin-brands' });
    });
    
  } catch(e) { 
    if (e.response) {
        let errorHtml = '';
        if (e.response.data.errors) {
            errorHtml = '<ul class="text-start text-danger small mt-2" style="max-height: 200px; overflow-y: auto; padding-left: 20px;">';
            Object.values(e.response.data.errors).flat().forEach(msg => {
                errorHtml += `<li class="mb-1">${msg}</li>`;
            });
            errorHtml += '</ul>';
        } else {
            errorHtml = `<p class="text-danger">${e.response.data.message}</p>`;
        }
        Swal.fire({ title: 'Dữ liệu không hợp lệ', html: errorHtml, icon: 'error', confirmButtonColor: '#dc3545' });
    } else {
        Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
    }
  } finally { 
    isSaving.value = false; 
  }
};
</script>

<style scoped>
.form-section-title { font-size: 0.85rem; font-weight: 700; color: #6c757d; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; } .border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; color: white; transition: 0.2s; } .btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; } .btn-outline-brand:hover { background-color: #009981; color: white; }
.cursor-pointer { cursor: pointer; }
</style>