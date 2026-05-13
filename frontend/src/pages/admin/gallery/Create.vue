<template>
  <div class="gallery-create-wrapper pb-5 mb-5">
    <div class="container-fluid py-4">
      
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <div class="d-flex align-items-center gap-3">
            <router-link :to="{ name: 'admin-gallery' }" class="btn btn-light border shadow-sm text-muted rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="bi bi-arrow-left fs-5"></i>
            </router-link>
            <div>
              <h3 class="fw-bold text-dark mb-0">Thêm Chân Dung SORA</h3>
              <p class="text-muted small mb-0 mt-1">Tải lên hình ảnh mới vào thư viện</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 max-w-800 mx-auto">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="submitForm">
            
            <div class="row g-4">
              <div class="col-md-5">
                <label class="form-label fw-bold text-dark"><i class="bi bi-image text-brand me-1"></i> Hình ảnh <span class="text-danger">*</span></label>
                
                <div class="upload-box bg-light border border-2 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden cursor-pointer" 
                     :class="{ 'border-brand': previewUrl, 'border-secondary border-opacity-25': !previewUrl }"
                     @click="triggerFileInput"
                     style="height: 300px; transition: all 0.3s ease;">
                  
                  <div v-if="!previewUrl" class="text-center p-4">
                    <div class="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px;">
                      <i class="bi bi-cloud-arrow-up fs-3 text-brand"></i>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Nhấn để chọn ảnh</h6>
                    <p class="text-muted small mb-0">hoặc kéo thả vào đây</p>
                    <p class="text-muted small mt-2" style="font-size: 0.7rem;">Hỗ trợ: JPG, PNG, WEBP</p>
                  </div>

                  <div v-else class="w-100 h-100 position-relative">
                    <img :src="previewUrl" class="w-100 h-100 object-fit-cover" alt="Preview" />
                    <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-opacity">
                      <span class="btn btn-light btn-sm rounded-pill fw-semibold shadow-sm"><i class="bi bi-pencil-square me-1"></i> Đổi ảnh khác</span>
                    </div>
                  </div>

                  <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileChange" />
                </div>
                <div v-if="errors.image" class="text-danger small mt-2"><i class="bi bi-exclamation-circle me-1"></i>{{ errors.image[0] }}</div>
              </div>

              <div class="col-md-7">
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark">Tiêu đề ảnh <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-lg bg-light border-0 shadow-sm px-4" v-model="form.title" placeholder="VD: Sora Concept Mùa Xuân..." required>
                  <div v-if="errors.title" class="text-danger small mt-2"><i class="bi bi-exclamation-circle me-1"></i>{{ errors.title[0] }}</div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold text-dark">Trạng thái</label>
                  <select class="form-select form-select-lg bg-light border-0 shadow-sm px-4" v-model="form.status">
                    <option value="active">Hiển thị (Active)</option>
                    <option value="inactive">Ẩn (Inactive)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="border-top mt-5 pt-4 d-flex justify-content-end gap-3">
              <router-link :to="{ name: 'admin-gallery' }" class="btn btn-light border px-4 py-2 fw-semibold text-muted shadow-sm">
                Hủy bỏ
              </router-link>
              <button type="submit" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm d-flex align-items-center" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-check-circle me-2"></i>
                {{ isSubmitting ? 'Đang lưu...' : 'Lưu Hình Ảnh' }}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

defineOptions({ name: 'GalleryCreate' });

const router = useRouter();
const fileInput = ref(null);
const isSubmitting = ref(false);
const previewUrl = ref(null);
const errors = ref({});

const form = reactive({
  title: '',
  status: 'active',
  imageFile: null
});

const getHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
  // Không cần Content-Type ở đây vì khi gửi FormData, trình duyệt sẽ tự động set kèm boundary
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.imageFile = file;
    previewUrl.value = URL.createObjectURL(file);
    if (errors.value.image) delete errors.value.image;
  }
};

const submitForm = async () => {
  if (!form.imageFile) {
    Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng chọn hình ảnh để tải lên!' });
    return;
  }

  isSubmitting.value = true;
  errors.value = {};

  const formData = new FormData();
  formData.append('title', form.title);
  formData.append('status', form.status);
  formData.append('image', form.imageFile);

  try {
    await axios.post(`${API_URL}/admin/galleries`, formData, {
      headers: getHeaders()
    });
    
    Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đã thêm hình ảnh mới.', timer: 1500, showConfirmButton: false });
    router.push({ name: 'admin-gallery' });
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors;
      Swal.fire({ icon: 'error', title: 'Lỗi dữ liệu', text: 'Vui lòng kiểm tra lại thông tin nhập vào.' });
    } else {
      Swal.fire({ icon: 'error', title: 'Lỗi server', text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu.' });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.border-brand { border-color: #009981 !important; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.border-dashed { border-style: dashed !important; }

.max-w-800 { max-width: 800px; }
.cursor-pointer { cursor: pointer; }
.object-fit-cover { object-fit: cover; }

.opacity-0 { opacity: 0; }
.transition-opacity { transition: opacity 0.3s ease; }
.hover-opacity-100:hover { opacity: 1; }

.upload-box:hover { background-color: #f8f9fa !important; border-color: #009981 !important; }
</style>