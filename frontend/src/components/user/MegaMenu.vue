<template>
  <div v-show="show"
    class="mega-menu-wrapper shadow-lg border-top border-3 border-primary-custom position-absolute">
    <button type="button" class="btn-close position-absolute top-0 end-0 m-3 z-index-max" aria-label="Close" @click.prevent="onClose"></button>

    <div class="d-flex text-start">
      <div class="mega-category-list p-4 bg-light border-end" style="width: 240px; flex-shrink: 0;">
        <h6 class="fw-bold mb-3 text-uppercase text-muted font-oswald" style="letter-spacing: 1px;">Danh Mục</h6>
        <ul class="list-unstyled m-0">
          <li v-for="cat in categories" :key="cat.id" class="mb-3" @mouseenter="onHoverCategory(cat)">
            <a href="#" @click.prevent="handleCategoryClick(cat.slug)"
              class="mega-cat-link fw-semibold text-decoration-none"
              :class="{ 'active-cat text-primary-custom': hoveredCategory?.id === cat.id }">
              {{ cat.name }}
            </a>
          </li>
        </ul>
      </div>

      <div class="mega-products-preview p-4 flex-grow-1 bg-white">
        <h6 class="fw-bold mb-3 text-uppercase text-muted font-oswald" style="letter-spacing: 1px;">
          Nổi bật: {{ hoveredCategory ? hoveredCategory.name : 'Mới Nhất' }}
        </h6>
        <div class="row g-4" v-if="hoveredCategory && hoveredCategory.top_products">
          <div class="col-3" v-for="prod in hoveredCategory.top_products" :key="prod.id">
            <div class="mega-product-card" @click="handleProductClick(prod.slug)">
              <div class="mega-img-wrap bg-light rounded-3 mb-2 border">
                <img :src="getImage(prod.thumbnail_image)" @error="handleImageError"
                  class="w-100 h-100 object-fit-cover bg-white" alt="Product">
              </div>
              <h6 class="small fw-bold text-truncate mb-1 transition-color">{{ prod.name }}</h6>
              <div class="text-danger fw-bold small">{{ formatCurrency(prod.promotional_price || prod.base_price) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted small fst-italic">Không có sản phẩm nổi bật.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: { type: Array, default: () => [] },
  hoveredCategory: { type: Object, default: null },
  show: { type: Boolean, default: false },
  getImage: { type: Function, required: true },
  handleImageError: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
  safeNavigate: { type: Function, required: true },
  goToProduct: { type: Function, required: true },
  onHoverCategory: { type: Function, required: true },
  onClose: { type: Function, required: true },
});

const handleCategoryClick = (slug) => {
  props.safeNavigate('shop', { query: { category: slug } });
  props.onClose();
};

const handleProductClick = (slug) => {
  props.goToProduct(slug);
  props.onClose();
};
</script>

<style>
.mega-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 980px;
  max-width: 100%;
  background: #fff;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  cursor: default;
  z-index: 1050;
}

.mega-menu-wrapper::before {
  content: '';
  position: absolute;
  top: -30px;
  left: 0;
  width: 100%;
  height: 30px;
  background: transparent;
}

.mega-cat-link {
  color: #333;
  padding: 4px 0;
  border-radius: 0;
  position: relative;
  display: inline-block;
  width: max-content;
  transition: color 0.3s ease;
  background-color: transparent !important;
}

.mega-cat-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1.5px;
  background-color: #9f273b;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease-in-out;
}

.mega-cat-link:hover,
.mega-cat-link.active-cat {
  color: #9f273b !important;
}

.mega-cat-link:hover::after,
.mega-cat-link.active-cat::after {
  transform: scaleX(1);
}

.mega-product-card {
  position: relative;
  padding-bottom: 8px;
  cursor: pointer;
}

.mega-product-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1.5px;
  background-color: #9f273b;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease-in-out;
}

.mega-product-card:hover::after {
  transform: scaleX(1);
}

.mega-product-card:hover h6 {
  color: #9f273b;
}

.mega-img-wrap {
  aspect-ratio: 1;
  overflow: hidden;
}

.mega-img-wrap img {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mega-product-card:hover .mega-img-wrap img {
  transform: scale(1.08);
}

.transition-color {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

.z-index-max {
  z-index: 9999;
}

.mega-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.mega-fade-leave-active {
  transition: opacity 0.15s ease;
}

.mega-fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.mega-fade-leave-to {
  opacity: 0;
}
</style>
