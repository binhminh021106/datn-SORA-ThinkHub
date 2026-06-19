<template>
  <div class="modal fade" id="importProductModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow">
        <div class="modal-header border-bottom pb-3 bg-light rounded-top-4">
          <h5 class="fw-bold text-dark mb-0">
            <i class="bi bi-file-earmark-excel-fill text-success me-2"></i>Nhập Sản phẩm từ Excel
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body p-4">


          <!-- Khu vực kéo thả file -->
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Chọn file Excel tải lên (.xlsx, .xls, .csv)</label>
            <div class="border-2 border-dashed rounded-3 p-4 text-center cursor-pointer bg-light hover-bg-white transition-all position-relative"
                 @click="triggerFileInput"
                 :class="{'border-success bg-success bg-opacity-10': selectedFile}">
              <input type="file" class="d-none" ref="fileInput" accept=".xlsx, .xls, .csv" @change="handleFileChange">
              
              <div v-if="!selectedFile">
                <i class="bi bi-cloud-arrow-up text-muted mb-2 d-block" style="font-size: 2.5rem;"></i>
                <button class="btn btn-outline-brand fw-bold rounded-pill shadow-sm px-4 mt-2 mb-3" style="pointer-events: none;">
                  <i class="bi bi-folder2-open me-1"></i> Chọn file từ máy tính
                </button>
                <p class="small text-black-50 mb-0">Dung lượng tối đa: 5MB</p>
              </div>
              <div v-else>
                <i class="bi bi-file-earmark-check-fill text-success mb-2 d-block" style="font-size: 2.5rem;"></i>
                <p class="mt-2 mb-0 fw-bold text-success">{{ selectedFile.name }}</p>
                <p class="small text-muted mt-1">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                <button class="btn btn-sm btn-outline-danger mt-3 position-relative z-index-2" @click.stop="clearFile">
                  <i class="bi bi-trash me-1"></i> Xóa file này
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-top-0 rounded-bottom-4">
          <button type="button" class="btn btn-light border fw-bold px-4" data-bs-dismiss="modal">Hủy</button>
          <button type="button" class="btn btn-success fw-bold px-4 shadow-sm" :disabled="!selectedFile || isUploading" @click="handleUpload">
            <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-upload me-2"></i> Tiến hành Nhập dữ liệu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import adminApiClient from '@/utils/adminApiClient';

const emit = defineEmits(['download-template', 'import-success']);

const fileInput = ref(null);
const selectedFile = ref(null);
const isUploading = ref(false);

const triggerFileInput = () => {
  if (!selectedFile.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const validExtensions = ['xlsx', 'xls', 'csv'];
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (!validExtensions.includes(ext)) {
    Swal.fire('Lỗi định dạng', 'Vui lòng chỉ tải lên file Excel (.xlsx, .xls) hoặc CSV.', 'warning');
    fileInput.value.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    Swal.fire('File quá lớn', 'Kích thước file không được vượt quá 5MB.', 'warning');
    fileInput.value.value = '';
    return;
  }

  selectedFile.value = file;
};

const clearFile = () => {
  selectedFile.value = null;
  fileInput.value.value = '';
};

const handleUpload = async () => {
  if (!selectedFile.value) return;
  
  isUploading.value = true;
  
  const formData = new FormData(); 
  formData.append('file', selectedFile.value); 
  
  try {
    const res = await adminApiClient.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'Import thành công!',
      text: res.data?.message || 'Đã nhập dữ liệu từ Excel vào hệ thống.',
      confirmButtonColor: '#009981'
    });
    
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('importProductModal'));
    if (modal) modal.hide();
    clearFile();
    emit('import-success');
    
  } catch (error) {
    console.error('Import error:', error);
    let errorText = 'Có lỗi xảy ra trong quá trình Import. Vui lòng kiểm tra lại file.';
    
    if (error.response?.data?.errors) {
      // Nếu API trả về mảng errors cụ thể từng dòng
      const errs = error.response.data.errors;
      if (Array.isArray(errs)) {
        errorText = errs.slice(0, 5).join('<br>') + (errs.length > 5 ? '<br>...và nhiều lỗi khác' : '');
      }
    } else if (error.response?.data?.message) {
      errorText = error.response.data.message;
    }

    Swal.fire({
      icon: 'error',
      title: 'Lỗi Import',
      html: `<div class="text-start small text-danger">${errorText}</div>`,
      confirmButtonColor: '#d33'
    });
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.hover-bg-white:hover {
  background-color: #ffffff !important;
}
.transition-all {
  transition: all 0.3s ease;
}
.z-index-2 {
  z-index: 2;
}
</style>
