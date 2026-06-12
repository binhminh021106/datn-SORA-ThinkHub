<template>
  <div v-if="isOpen" class="custom-modal-backdrop" @click.self="$emit('close')">
    <div class="custom-modal-content shadow-lg border-0 rounded-0 slide-up" style="max-width: 800px;">
      
      <!-- Header -->
      <div class="modal-header-luxury p-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 class="mb-1 fw-bold font-serif text-white tracking-wider">ĐÁNH GIÁ SẢN PHẨM</h3>
          <span class="text-light opacity-75">Đơn hàng #{{ order?.order_code }}</span>
        </div>
        <button @click="$emit('close')" class="btn-close-luxury" :disabled="isSubmitting"><i class="bi bi-x-lg"></i></button>
      </div>

      <div class="modal-body p-4 overflow-auto bg-light" style="max-height: 70vh;">
        <SoraListSkeleton v-if="isLoading" :rows="3" image-size="70px" card />

        <!-- Content -->
        <div v-else-if="order?.items?.length > 0">
          <p class="text-muted mb-4 fst-italic">Vui lòng chia sẻ cảm nhận của bạn về từng sản phẩm. Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn!</p>
          
          <!-- Lặp qua từng sản phẩm trong đơn -->
          <div v-for="(item, index) in reviewForms" :key="index" class="bg-white p-4 shadow-sm border border-light-subtle mb-4 rounded">
            
            <!-- Thông tin sản phẩm -->
            <div class="d-flex align-items-center gap-3 border-bottom pb-3 mb-3">
              <div class="product-img border p-1" style="width: 60px; height: 60px; flex-shrink: 0;">
                <img :src="getImageUrl(item.image)" @error="handleImageError" class="w-100 h-100 object-fit-cover">
              </div>
              <div>
                <h6 class="fw-bold text-dark mb-1">{{ item.name }}</h6>
                <span v-if="item.combo_id" class="badge bg-light text-dark border"><i class="bi bi-stars text-primary-custom"></i> Combo</span>
              </div>
            </div>

            <!-- Star Rating -->
            <div class="mb-3 text-center">
              <div class="d-flex justify-content-center gap-2 mb-2">
                <i v-for="star in 5" :key="star" 
                   class="bi fs-3 cursor-pointer star-icon"
                   :class="star <= item.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted opacity-50'"
                   @click="item.rating = star"
                   @mouseover="hoverStar(index, star)"
                   @mouseleave="resetHover(index)">
                </i>
              </div>
              <span class="small text-muted fw-medium text-uppercase">{{ ratingLabels[item.rating] }}</span>
            </div>

            <!-- Comment -->
            <div class="mb-3">
              <textarea class="form-control bg-light shadow-none border-light-subtle rounded-0" 
                        rows="3" 
                        placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này nhé..."
                        v-model="item.comment"></textarea>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="btn btn-outline-secondary btn-sm rounded-0 fw-bold upload-btn">
                <i class="bi bi-camera me-1"></i> Thêm hình ảnh
                <input type="file" multiple accept="image/*" class="d-none" @change="handleFileUpload($event, index)">
              </label>
              
              <!-- Image Previews -->
              <div v-if="item.previews.length > 0" class="d-flex flex-wrap gap-2 mt-3">
                <div v-for="(preview, pIdx) in item.previews" :key="pIdx" class="position-relative preview-wrapper border p-1">
                  <img :src="preview" class="object-fit-cover w-100 h-100">
                  <button class="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle remove-img-btn" 
                          @click="removeImage(index, pIdx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer p-3 px-4 border-top bg-white d-flex justify-content-end gap-2">
        <button @click="$emit('close')" class="btn btn-light border rounded-0 px-4 fw-bold text-uppercase small" :disabled="isSubmitting">Hủy</button>
        <button @click="submitReviews" class="btn btn-primary-custom rounded-0 px-5 fw-bold text-uppercase small" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';
import soraAlert from '@/utils/soraAlertConfig';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import clientApiClient from '@/utils/clientApiClient';

const props = defineProps({
  isOpen: Boolean,
  order: Object
});

const emit = defineEmits(['close', 'review-success']);

const reviewForms = ref([]);
const isSubmitting = ref(false);
const isLoading = ref(false);

const ratingLabels = {
  0: "Vui lòng chọn sao",
  1: "Rất Tệ",
  2: "Không Hài Lòng",
  3: "Bình Thường",
  4: "Hài Lòng",
  5: "Tuyệt Vời"
};

// Khởi tạo mảng form dựa trên các sản phẩm trong đơn hàng
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.order) {
    isLoading.value = true;
    
    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    reviewForms.value = props.order.items.map(item => ({
      product_id: item.product_id,
      combo_id: item.combo_id,
      name: item.product_name,
      image: item.variant_image,
      rating: 5, // Default 5 sao
      comment: '',
      files: [],     // File thực tế để gửi lên server
      previews: []   // Base64 hiển thị cho người dùng
    }));
    
    isLoading.value = false;
  } else {
    reviewForms.value = [];
    isLoading.value = false;
  }
});

const getImageUrl = (path) => {
  if (!path) return defaultPlaceholder;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};
const handleImageError = (e) => { e.target.src = defaultPlaceholder; };

// Xử lý upload và tạo file preview
const handleFileUpload = (event, itemIndex) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const itemForm = reviewForms.value[itemIndex];

  files.forEach(file => {
    // Check dung lượng (vd: < 5MB)
    if (file.size > 5 * 1024 * 1024) {
      soraAlert.fire({ icon: 'warning', title: 'File quá lớn', text: 'Vui lòng chọn ảnh dưới 5MB' });
      return;
    }
    
    itemForm.files.push(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      itemForm.previews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  event.target.value = ''; // Reset input
};

const removeImage = (itemIndex, fileIndex) => {
  reviewForms.value[itemIndex].files.splice(fileIndex, 1);
  reviewForms.value[itemIndex].previews.splice(fileIndex, 1);
};

// Gửi API
const submitReviews = async () => {
  // Validate
  const hasUnrated = reviewForms.value.some(r => r.rating === 0);
  if (hasUnrated) {
    soraAlert.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng đánh giá (chọn số sao) cho tất cả sản phẩm.' });
    return;
  }

  isSubmitting.value = true;
  
  // Dùng FormData vì có đính kèm nhiều file ảnh
  const formData = new FormData();
  
  reviewForms.value.forEach((item, index) => {
    if (item.product_id) formData.append(`reviews[${index}][product_id]`, item.product_id);
    if (item.combo_id) formData.append(`reviews[${index}][combo_id]`, item.combo_id);
    formData.append(`reviews[${index}][rating]`, item.rating);
    if (item.comment) formData.append(`reviews[${index}][comment]`, item.comment);
    
    // Đính kèm các file của item này
    item.files.forEach((file) => {
      formData.append(`reviews[${index}][images][]`, file);
    });
  });

  try {
    const response = await clientApiClient.post(`/client/orders/${props.order.order_code}/review`, formData);
    
    soraAlert.fire({
      icon: 'success',
      title: 'Đánh giá thành công!',
      text: response.data.message,
      timer: 2000
    });
    
    emit('review-success');
    emit('close');
  } catch (error) {
    soraAlert.fire({
      icon: 'error', 
      title: 'Lỗi', 
      text: error.response?.data?.message || 'Không thể gửi đánh giá lúc này'
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.text-primary-custom { color: #9f273b !important; }
.btn-primary-custom { background: #9f273b; border: 1px solid #9f273b; color: white; transition: 0.3s; }
.btn-primary-custom:hover:not(:disabled) { background: #cc1e2e; border-color: #cc1e2e; }

.custom-modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(3px);
  z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.custom-modal-content { background: white; width: 100%; position: relative; display: flex; flex-direction: column; }
.modal-header-luxury { background: #9f273b; color: white; flex-shrink: 0; }
.btn-close-luxury { background: none; border: none; color: white; font-size: 1.5rem; opacity: 0.8; transition: 0.3s; }
.btn-close-luxury:hover { opacity: 1; transform: scale(1.2); }

@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
.slide-up { animation: slideUp 0.3s ease-out; }

.star-icon { transition: transform 0.2s; }
.star-icon:hover { transform: scale(1.2); }
.cursor-pointer { cursor: pointer; }

.preview-wrapper { width: 70px; height: 70px; background: #fff; }
.remove-img-btn { width: 20px; height: 20px; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; transform: translate(30%, -30%); }

textarea:focus { border-color: #9f273b; box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.25); }

</style>
