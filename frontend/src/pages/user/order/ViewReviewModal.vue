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
        <!-- Skeleton Loading -->
        <div v-if="isLoading" class="skeleton-container">
          <div class="skeleton-text mb-4"></div>
          
          <div v-for="n in 3" :key="n" class="skeleton-review-item mb-4">
            <div class="skeleton-product-info d-flex align-items-center gap-3 border-bottom pb-3 mb-3">
              <div class="skeleton-img"></div>
              <div class="flex-grow-1">
                <div class="skeleton-title mb-2"></div>
                <div class="skeleton-date"></div>
              </div>
            </div>
            
            <div class="skeleton-stars text-center mb-3">
              <div class="d-flex justify-content-center gap-2 mb-2">
                <div v-for="star in 5" :key="star" class="skeleton-star"></div>
              </div>
              <div class="skeleton-rating-label"></div>
            </div>
            
            <div class="skeleton-comment mb-3"></div>
            
            <div class="skeleton-images d-flex gap-2">
              <div v-for="img in 3" :key="img" class="skeleton-image"></div>
            </div>
          </div>
        </div>

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

const props = defineProps({
  isOpen: Boolean,
  order: Object
});

const emit = defineEmits(['close']);

const reviews = ref([]);
const isLoading = ref(false);
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/client/orders`;

const ratingLabels = {
  1: "Rất Tệ",
  2: "Không Hài Lòng",
  3: "Bình Thường",
  4: "Hài Lòng",
  5: "Tuyệt Vời"
};

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return { 
    'Accept': 'application/json', 
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const getImageUrl = (path) => {
  if (!path) return defaultPlaceholder;
  if (path.startsWith('http')) return path;
  return `http://127.0.0.1:8000/storage/${path}`;
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
      const response = await fetch(`${API_BASE_URL}/${props.order.order_code}/review`, {
        headers: getHeaders()
      });
      const data = await response.json();
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

/* Skeleton Loading Styles */
.skeleton-container {
  animation: fadeIn 0.3s ease-in;
}

.skeleton-text {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-review-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.skeleton-product-info {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.skeleton-img {
  width: 60px;
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  flex-shrink: 0;
}

.skeleton-title {
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 70%;
}

.skeleton-date {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 50%;
  margin-top: 8px;
}

.skeleton-stars {
  margin-bottom: 12px;
}

.skeleton-star {
  width: 24px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 50%;
  display: inline-block;
  margin: 0 4px;
}

.skeleton-rating-label {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 100px;
  margin: 0 auto;
}

.skeleton-comment {
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-images {
  margin-top: 12px;
}

.skeleton-image {
  width: 80px;
  height: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
