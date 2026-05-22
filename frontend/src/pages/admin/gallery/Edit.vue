<template>
  <div class="gallery-edit-wrapper pb-5 mb-5">
    
    <!-- SKELETON CHỜ KHI KHÔNG CÓ CACHE -->
    <div v-if="isLoading" class="container-fluid py-4">
        <div class="row mb-4"><div class="col-6"><span class="placeholder col-8 rounded" style="height: 40px;"></span></div></div>
        <div class="card border-0 shadow-sm rounded-4 max-w-800 mx-auto placeholder-glow p-4">
            <span class="placeholder col-12 rounded mb-3" style="height: 300px;"></span>
        </div>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <div class="d-flex align-items-center gap-3">
            <router-link :to="{ name: 'admin-gallery' }" class="btn btn-light border shadow-sm text-muted rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="bi bi-arrow-left fs-5"></i>
            </router-link>
            <div>
              <h3 class="fw-bold text-dark mb-0">Cập Nhật Chân Dung SORA</h3>
              <p class="text-muted small mb-0 mt-1">
                Chỉnh sửa thông tin hình ảnh
                <span v-if="isFetching" class="spinner-border spinner-border-sm text-brand ms-2" title="Đang đồng bộ ngầm"></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 max-w-800 mx-auto">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="updateForm">
            
            <div class="row g-4">
              <div class="col-md-5">
                <label class="form-label fw-bold text-dark">
                  <i class="bi bi-image text-brand me-1"></i> Hình ảnh 
                  <span class="text-muted fw-normal small ms-1">(Nhấn để đổi)</span>
                </label>
                
                <div class="upload-box bg-light border border-2 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden cursor-pointer border-brand" 
                     @click="triggerFileInput"
                     style="height: 300px; transition: all 0.3s ease;">
                  
                  <div class="w-100 h-100 position-relative">
                    <img v-if="previewUrl || form.old_image_url" :src="previewUrl || form.old_image_url" class="w-100 h-100 object-fit-cover" alt="Sora Portrait" />
                    <div v-else class="text-muted text-center pt-5 mt-5">Chưa có ảnh</div>
                    <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-opacity">
                      <span class="btn btn-light btn-sm rounded-pill fw-semibold shadow-sm"><i class="bi bi-cloud-upload me-1"></i> Chọn ảnh khác</span>
                    </div>
                  </div>

                  <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileChange" />
                </div>
                <div v-if="errors.image" class="text-danger small mt-2"><i class="bi bi-exclamation-circle me-1"></i>{{ errors.image[0] }}</div>
                
                <div v-if="previewUrl" class="alert alert-warning py-2 mt-3 small mb-0 shadow-sm border-0 bg-warning bg-opacity-10 text-dark">
                  <i class="bi bi-info-circle-fill text-warning me-1"></i> Bạn đang chọn một ảnh mới.
                </div>
              </div>

              <div class="col-md-7">
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark">Tiêu đề ảnh <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-lg bg-light border-0 shadow-sm px-4" v-model="form.title" required>
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
              <button type="button" class="btn btn-light me-2 px-4 shadow-sm fw-bold border" @click="handleRestore" :disabled="isRestoring || isSubmitting">
                <span v-if="isRestoring" class="spinner-border spinner-border-sm me-2"></span>Khôi phục gốc
              </button>
              <button type="submit" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm d-flex align-items-center" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-save me-2"></i>
                {{ isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật' }}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import axios from 'axios'; // Phục hồi Axios 100% để đảm bảo hoạt động cực nhanh trên interceptors gốc

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL.replace('/api', '');

defineOptions({ name: 'GalleryEdit' });

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const galleryId = route.params.id;

const fileInput = ref(null);
const previewUrl = ref(null);
const errors = ref({});
const isRestoring = ref(false);

const form = reactive({
  id: null,
  title: '',
  status: 'active',
  old_image_url: '',
  newImageFile: null
});

const getHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

// 1. LẤY DATA VÀ TẬN DỤNG CACHE TỐI ĐA (DÙNG AXIOS TRỞ LẠI)
const fetchGalleryDetail = async () => {
  const res = await axios.get(`${API_URL}/admin/galleries/${galleryId}`, { headers: getHeaders() });
  return res.data.data;
};

const { data: galleryData, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['admin', 'gallery', galleryId],
  queryFn: fetchGalleryDetail,
  initialData: () => {
    return queryClient.getQueryData(['admin', 'galleries'])?.find(d => d.id == galleryId);
  },
  staleTime: 1000 * 60 * 5,
});

watchEffect(() => {
  if (galleryData.value) {
    const data = galleryData.value;
    form.id = data.id;
    form.title = data.title || '';
    form.status = (data.is_active === 1 || data.is_active === true || String(data.is_active) === '1') ? 'active' : 'inactive';
    
    let imgUrl = data.image_path || '';
    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:image')) {
        imgUrl = `${BASE_URL}/storage/${imgUrl}`;
    }
    
    if (!form.newImageFile && !previewUrl.value) {
        form.old_image_url = imgUrl;
    }
  }
});

const handleRestore = async () => {
  isRestoring.value = true;
  await refetch();
  
  form.newImageFile = null;
  previewUrl.value = null;
  if(fileInput.value) fileInput.value.value = '';
  errors.value = {};
  
  setTimeout(() => {
    isRestoring.value = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Khôi phục form thành công', timer: 1500, showConfirmButton: false });
  }, 400); 
};

const triggerFileInput = () => { if (fileInput.value) fileInput.value.click(); };

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Lỗi', 'Ảnh tối đa 5MB', 'error');
      return;
    }
    form.newImageFile = file;
    previewUrl.value = URL.createObjectURL(file);
    if (errors.value.image) delete errors.value.image;
  }
};

// 3. MUTATION CẬP NHẬT (SỬ DỤNG AXIOS ĐỂ TƯƠNG THÍCH MỌI INTERCEPTORS)
const { mutate: updateGallery, isPending: isSubmitting } = useMutation({
  mutationFn: async (formData) => {
    const res = await axios.post(`${API_URL}/admin/galleries/${form.id}`, formData, { headers: getHeaders() });
    return res.data.data;
  },
  onSuccess: (updatedData) => {
    queryClient.setQueryData(['admin', 'gallery', galleryId], updatedData);
    queryClient.setQueryData(['admin', 'galleries'], (oldList) => {
      if(!oldList) return oldList;
      return oldList.map(g => g.id == galleryId ? updatedData : g);
    });
    
    Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đã cập nhật hình ảnh.', timer: 1500, showConfirmButton: false });
    router.push({ name: 'admin-gallery' });
  },
  onError: (error) => {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors;
      Swal.fire({ icon: 'error', title: 'Lỗi dữ liệu', text: 'Vui lòng kiểm tra lại thông tin nhập vào.' });
    } else {
      Swal.fire({ icon: 'error', title: 'Lỗi server', text: error.response?.data?.message || 'Có lỗi xảy ra.' });
    }
  }
});

const updateForm = () => {
  errors.value = {};
  const formData = new FormData();
  formData.append('title', form.title);
  formData.append('is_active', form.status === 'active' ? 1 : 0);
  
  if (form.newImageFile) {
    formData.append('image', form.newImageFile);
  }
  formData.append('_method', 'PUT');

  updateGallery(formData);
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
</style>