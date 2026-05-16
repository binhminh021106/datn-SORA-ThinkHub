<template>
  <article class="post-card card-style product-card h-100 d-flex flex-column border-0 shadow-sm rounded-3">
    <!-- KHU VỰC ẢNH ĐÃ ĐƯỢC CẬP NHẬT DÙNG THẺ <img> ĐỂ BẮT LỖI -->
    <div class="card-img-top img-zoom-wrapper position-relative overflow-hidden" style="border-radius: 12px 12px 0 0; aspect-ratio: 16/9;">
      <router-link :to="postLink" class="full-link d-block w-100 h-100 position-relative">
        <img 
          :src="imageUrl" 
          :alt="post.title" 
          class="img-bg w-100 h-100 object-fit-cover" 
          @error="handleImageError"
        >
        <div class="cat-badge-small font-oswald text-uppercase" v-if="post.category">{{ post.category }}</div>
      </router-link>
    </div>
    
    <div class="card-body bg-white d-flex flex-column p-4 flex-grow-1" style="border-radius: 0 0 12px 12px;">
      <div class="card-meta fw-medium mb-2 small text-muted">
        <span class="date"><i class="bi bi-calendar-event text-gold me-1"></i> {{ formattedDate }}</span>
      </div>
      <h4 class="card-title product-title-link mb-3">
        <router-link :to="postLink" class="text-reset product-title font-serif fw-bold lh-base d-block text-dark text-decoration-none">
          {{ post.title }}
        </router-link>
      </h4>
      <p class="card-excerpt text-muted mb-4 flex-grow-1 fw-light" style="font-size: 0.95rem; line-height: 1.6;">
        {{ excerpt }}
      </p>
      <div class="card-footer-custom mt-auto pt-3 border-top border-light">
        <router-link :to="postLink" class="card-link font-oswald text-uppercase fw-bold text-decoration-none d-flex align-items-center text-sora-primary" style="font-size: 0.85rem; letter-spacing: 1px;">
          Xem chi tiết <i class="bi bi-arrow-right ms-2 fs-6"></i>
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { getFullImage } from '@/utils/axios';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const soraPlaceholder = '/Sora-placeholder.png';

const toSlug = (str) => {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '');
  str = str.replace(/-+$/g, '');
  return str;
};

const postLink = computed(() => {
  return { name: 'PostDetailt', params: { slug: props.post.slug || toSlug(props.post.title) } };
});

const imageUrl = computed(() => getFullImage(props.post.image_url || props.post.image));

// Xử lý khi ảnh bị lỗi (404)
const handleImageError = (e) => {
  e.target.onerror = null; 
  e.target.src = soraPlaceholder;
};

const formattedDate = computed(() => {
  if (!props.post.created_at) return '';
  return new Date(props.post.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
});

const excerpt = computed(() => {
  const length = 120;
  if (props.post.excerpt) return props.post.excerpt;
  if (props.post.content) {
    const plainText = props.post.content.replace(/<[^>]+>/g, '');
    return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
  }
  return 'Khám phá những bí quyết độc quyền từ chuyên gia kim hoàn SORA...';
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Oswald:wght@400;500;600;700&display=swap');

.font-serif { font-family: "Playfair Display", serif !important; }
.font-oswald { font-family: "Oswald", sans-serif !important; }
.text-sora-primary { color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }

/* Thẻ Card chính */
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-bottom: 2px solid transparent !important;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .08) !important;
  border-bottom: 2px solid #e7ce7d !important;
}

/* Hiệu ứng Zoom Ảnh */
.img-zoom-wrapper .img-bg {
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.product-card:hover .img-zoom-wrapper .img-bg {
  transform: scale(1.08);
}

.object-fit-cover {
  object-fit: cover !important;
}

/* Badge Danh mục */
.cat-badge-small {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(159, 39, 59, 0.95);
  color: white;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  z-index: 2;
  letter-spacing: 1px;
}

/* Tiêu đề Bài viết */
.product-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.product-card:hover .product-title {
  color: #9f273b !important;
}

/* Excerpt Truncate */
.card-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Link Xem chi tiết */
.card-link {
  transition: color 0.3s ease;
}
.card-link:hover {
  color: #cc1e2e !important;
}
</style>