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
        <button @click="$emit('close')" class="btn btn-luxury-neutral border-0 px-4 fw-bold text-uppercase small py-2" :disabled="isSubmitting">Hủy</button>
        <button @click="submitReviews" class="editorial-btn border-0 px-5 fw-bold text-uppercase small py-2" :disabled="isSubmitting">
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


/* Button Luxury States */
.btn-luxury-neutral, .btn-luxury-danger, .btn-luxury-success, .btn-luxury-success-light {
  position: relative;
  overflow: hidden;
}

.btn-luxury-neutral::after, 
.btn-luxury-danger::after, 
.btn-luxury-success::after, 
.btn-luxury-success-light::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.btn-luxury-neutral:hover::after, 
.btn-luxury-danger:hover::after, 
.btn-luxury-success:hover::after, 
.btn-luxury-success-light:hover::after {
  transform: rotate(45deg) translateY(200%);
}

.btn-luxury-neutral {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-neutral:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.06);
}

.btn-luxury-danger {
  background-color: #FCF0F1;
  color: #9F273B;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-danger:hover {
  background-color: #9F273B;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(159,39,59,0.25);
}

.editorial-btn.btn-luxury-gold {
  background-color: #e7ce7d !important;
  color: #fff !important;
}
.editorial-btn.btn-luxury-gold:hover {
  background-color: #d4af37 !important;
  box-shadow: 0 8px 20px rgba(231,206,125,0.4) !important;
}

.btn-luxury-success {
  background-color: #009981;
  color: #fff;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-success:hover {
  background-color: #007b67;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,153,129,0.3);
}

.btn-luxury-success-light {
  background-color: #E2F3E5;
  color: #009981;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-success-light:hover {
  background-color: #009981;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,153,129,0.2);
}

.editorial-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  background: var(--sora-primary, #9f273b);
  color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb, 231, 206, 125), 0.5);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.editorial-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.editorial-btn:hover {
  background: var(--sora-accent, #cc1e2e);
  color: #fff;
  border-color: var(--sora-secondary, #e7ce7d);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.editorial-btn:hover::after {
  transform: rotate(45deg) translateY(200%);
}

/* Banner (Sora Banner Style) */
.text-champagne {
  color: #ead089 !important;
}

.z-index-2 {
  z-index: 2;
}

.sora-banner {
  min-height: 380px;
  background:
    linear-gradient(135deg, rgba(54, 6, 17, 0.98), rgba(114, 20, 38, 0.96) 48%, rgba(74, 9, 24, 0.98)),
    repeating-linear-gradient(120deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 14px);
  isolation: isolate;
}

.sora-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 236, 189, 0.2), transparent 42%),
    linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.08) 44%, transparent 64%);
  opacity: 0.9;
  z-index: 0;
}

.banner-ambient {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 84px 84px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 68%);
  z-index: 0;
}

.banner-glow {
  position: absolute;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(231, 206, 125, 0.2), transparent 68%);
  filter: blur(3px);
  z-index: 0;
}

.banner-glow-left {
  left: -120px;
  bottom: -150px;
}

.banner-glow-right {
  right: -100px;
  top: -120px;
}

.banner-monogram {
  position: absolute;
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3.4rem, 9vw, 8.8rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
  bottom: 52px;
}

.banner-content {
  max-width: 850px;
}

.banner-content h1 {
  letter-spacing: 0;
  line-height: 1.05;
  text-shadow: 0 10px 35px rgba(0, 0, 0, 0.32);
}

.banner-subtitle {
  color: rgba(255, 248, 231, 0.9);
  line-height: 1.75;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.banner-line-art {
  position: absolute;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  transform: rotate(45deg);
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-line-art-left {
  left: 8%;
  top: 24%;
}

.banner-line-art-right {
  right: 8%;
  bottom: 22%;
}

@media (max-width: 992px) {
  .sora-banner {
    min-height: 340px;
  }

  .banner-line-art {
    opacity: 0.45;
  }
}

@media (max-width: 768px) {
  .sora-banner {
    min-height: 320px;
  }

  .banner-content h1 {
    font-size: 2.45rem;
  }

  .banner-subtitle {
    font-size: 1rem !important;
  }

  .banner-line-art {
    display: none;
  }

  .banner-monogram {
    bottom: 38px;
    font-size: 3.5rem;
  }
}

/* Image wrapper (Border xoắn) */
.img-wrapper {
  padding: 1rem;
}

.img-wrapper img {
  position: relative;
  z-index: 2;
}

.img-border {
  top: 0;
  left: 0;
  right: 2rem;
  bottom: 2rem;
  border: 1px solid #e7ce7d;
  z-index: 1;
}

.custom-img-portrait {
  aspect-ratio: 4/5;
}

/* Đường kẻ ngăn cách (Divider) */
.divider {
  width: 4rem;
  height: 2px;
}

/* Card Mission & Vision */
.card-hover {
  transition: box-shadow 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
}

.card-indicator {
  width: 4px;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.card-hover:hover .card-indicator {
  width: 100%;
  opacity: 0.05;
}

/* Icon vòng tròn */
.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid;
}

/* Khối sản phẩm (Fix ảnh vuông tuyệt đối) */
.square-ratio {
  width: 100%;
  padding-bottom: 100%;
  /* Tạo tỷ lệ vuông chuẩn 1:1 */
  display: block;
  overflow: hidden;
}

.img-zoom-wrapper img {
  transition: transform 0.7s ease;
}

.product-card:hover .img-zoom-wrapper img {
  transform: scale(1.1);
}

.product-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 2;
}

/* Link khám phá */
.product-link:hover {
  color: #cc1e2e !important;
}

/* Combo Carousel Container Overrides */
.combos-editorial {
  background-color: #fffafa;
  overflow: hidden;
}

.combos-container {
  max-width: var(--home-container-width, 1400px);
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 3rem;
}

.section-kicker {
  display: block;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sora-primary, #9f273b);
  margin-bottom: 0.75rem;
}

.section-heading h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}

.text-gold {
  color: #d4af37 !important;
}
</style>
