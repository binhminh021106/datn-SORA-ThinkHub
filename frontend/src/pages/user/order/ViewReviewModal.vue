<template>
  <div v-if="isOpen" class="custom-modal-backdrop" @click.self="$emit('close')">
    <div class="custom-modal-content shadow-lg border-0 rounded-0 slide-up" style="max-width: 800px;">
      
      <!-- Header -->
      <div class="modal-header-luxury p-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 class="mb-1 fw-bold font-serif text-white tracking-wider">ĐÁNH GIÁ CỦA BẠN</h3>
          <span class="text-light opacity-75">Đơn hàng #{{ order?.order_code }}</span>
        </div>
        <button @click="$emit('close')" class="btn-close-luxury"><i class="bi bi-x-lg"></i></button>
      </div>

      <div class="modal-body p-4 overflow-auto bg-light" style="max-height: 70vh;">
        <SoraListSkeleton v-if="isLoading" :rows="3" image-size="70px" card />

        <!-- Content -->
        <div v-else-if="reviews && reviews.length > 0">
          <p class="text-muted mb-4 fst-italic">Đây là những đánh giá của bạn về sản phẩm trong đơn hàng này.</p>
          
          <!-- Lặp qua từng đánh giá -->
          <div v-for="review in reviews" :key="review.id" class="bg-white p-4 shadow-sm border border-light-subtle mb-4 rounded">
            
            <!-- Thông tin sản phẩm -->
            <div class="d-flex align-items-center gap-3 border-bottom pb-3 mb-3">
              <div v-if="review.product" class="product-img border p-1" style="width: 60px; height: 60px; flex-shrink: 0;">
                <img :src="getProductImage(review.product)" @error="handleImageError" class="w-100 h-100 object-fit-cover">
              </div>
              <div>
                <h6 class="fw-bold text-dark mb-1">{{ review.product?.name || review.combo?.name || 'Sản phẩm' }}</h6>
                <span v-if="review.combo" class="badge bg-light text-dark border"><i class="bi bi-stars text-primary-custom"></i> Combo</span>
                <div class="small text-muted mt-1">
                  Đánh giá ngày: {{ formatDate(review.created_at) }}
                </div>
              </div>
            </div>

            <!-- Star Rating Display -->
            <div class="mb-3 text-center">
              <div class="d-flex justify-content-center gap-2 mb-2">
                <i v-for="star in 5" :key="star" 
                   class="bi fs-3"
                   :class="star <= review.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted opacity-25'">
                </i>
              </div>
              <span class="small text-muted fw-medium text-uppercase">{{ ratingLabels[review.rating] }}</span>
            </div>

            <!-- Comment -->
            <div v-if="review.comment" class="mb-3 p-3 bg-light border-start border-4 border-warning rounded">
              <p class="mb-0">{{ review.comment }}</p>
            </div>
            <div v-else class="mb-3 p-3 bg-light rounded text-muted fst-italic">
              Không có nhận xét
            </div>

            <!-- Images Display -->
            <div v-if="review.images && review.images.length > 0" class="mt-3">
              <p class="small text-muted fw-bold mb-2">Hình ảnh:</p>
              <div class="d-flex flex-wrap gap-2">
                <div v-for="(image, idx) in review.images" :key="idx" class="position-relative">
                  <img :src="getImageUrl(image)" 
                       @error="handleImageError"
                       class="rounded border p-1"
                       style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;"
                       @click="openImagePreview(image)">
                </div>
              </div>
            </div>

          </div>
        </div>
        <div v-else-if="!isLoading" class="text-center py-5">
          <i class="bi bi-inbox text-muted opacity-50 d-block mb-3" style="font-size: 3rem;"></i>
          <p class="text-muted">Không tìm thấy đánh giá nào</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer p-3 px-4 border-top bg-white d-flex justify-content-end gap-2">
        <button @click="$emit('close')" class="btn btn-secondary rounded-0 px-4 fw-bold text-uppercase small">Đóng</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import clientApiClient from '@/utils/clientApiClient';

const props = defineProps({
  isOpen: Boolean,
  order: Object
});

const emit = defineEmits(['close']);

const reviews = ref([]);
const isLoading = ref(false);

const ratingLabels = {
  1: "Rất Tệ",
  2: "Không Hài Lòng",
  3: "Bình Thường",
  4: "Hài Lòng",
  5: "Tuyệt Vời"
};

const getImageUrl = (path) => {
  if (!path) return defaultPlaceholder;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};

const getProductImage = (product) => {
  if (!product) return defaultPlaceholder;
  if (product.image_url) return getImageUrl(product.image_url);
  if (product.thumbnail_image) return getImageUrl(product.thumbnail_image);
  return defaultPlaceholder;
};

const handleImageError = (e) => { 
  e.target.src = defaultPlaceholder; 
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const openImagePreview = (imagePath) => {
  const url = getImageUrl(imagePath);
  window.open(url, '_blank');
};

// Lấy đánh giá khi modal mở
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.order) {
    isLoading.value = true;
    reviews.value = [];
    
    try {
      const { data } = await clientApiClient.get(`/client/orders/${props.order.order_code}/review`);
      if (data.success) {
        reviews.value = data.data;
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      reviews.value = [];
    } finally {
      isLoading.value = false;
    }
  } else {
    reviews.value = [];
    isLoading.value = false;
  }
});
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
.btn-close-luxury { background: none; border: none; color: white; font-size: 1.5rem; opacity: 0.8; transition: 0.3s; cursor: pointer; }
.btn-close-luxury:hover { opacity: 1; transform: scale(1.2); }

@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
.slide-up { animation: slideUp 0.3s ease-out; }

</style>
