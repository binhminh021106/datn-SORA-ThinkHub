<template>
  <div class="shop-page min-vh-100 bg-white">

    <!-- LỰA CHỌN LÝ TƯỞNG (DANH MỤC TOP) -->
    <section
      class="ideal-choices-section py-3 border-bottom sora-border-light sora-banner position-relative d-flex flex-column align-items-center justify-content-center overflow-hidden"
      style="min-height: 380px;">
      <div class="banner-ambient"></div>
      <div class="banner-glow banner-glow-left"></div>
      <div class="banner-glow banner-glow-right"></div>
      <div class="banner-monogram font-serif" style="bottom: 10px; font-size: clamp(2.5rem, 7vw, 6rem);">SORA BOUTIQUE
      </div>
      <div class="banner-line-art banner-line-art-left"></div>
      <div class="banner-line-art banner-line-art-right"></div>

      <div class="container-fluid px-3 py-1 py-md-2 position-relative z-index-2">
        <div class="d-flex flex-column align-items-center text-center mb-2">
          <h2 class="text-white fw-bold mb-1 font-serif"
            style="font-size: clamp(1.4rem, 2.5vw, 1.8rem); letter-spacing: 0.02em;">Lựa chọn lý tưởng</h2>
          <div class="d-flex align-items-center justify-content-center mb-3">
            <svg width="120" height="15" viewBox="0 0 150 20" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.8;">
              <path d="M10 10h40m50 0h40M65 10c0-3 4-5 10-5s10 2 10 5-4 5-10 5-10-2-10-5z" stroke="white"
                stroke-width="1.5" fill="none" />
            </svg>
          </div>
        </div>

        <div v-if="isLoadingCategories" class="mx-auto w-100" style="max-width: 900px;">
          <div class="row justify-content-center row-cols-2 row-cols-sm-3 row-cols-md-5 g-2 g-md-3 mb-2 pb-2">
            <div class="col" v-for="item in 5" :key="'cat-skeleton-' + item">
              <div class="category-circle-item text-center d-flex flex-column align-items-center">
                <SoraSkeleton width="85px" height="85px" circle class="mx-auto mb-2" />
                <SoraSkeleton width="70px" height="12px" class="mx-auto" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="mx-auto w-100" style="max-width: 900px;">
          <!-- LƯỚI DANH MỤC (CÓ HIỆU ỨNG TRƯỢT KHI XEM THÊM) -->
          <transition-group name="cat-list" tag="div"
            class="row justify-content-center row-cols-2 row-cols-sm-3 row-cols-md-5 g-2 g-md-3 mb-2 pb-2">
            <div class="col" v-for="cat in visibleCategories" :key="cat.id">
              <div class="category-circle-item text-center cursor-pointer group d-flex flex-column align-items-center"
                @click="filterByCategory(cat.slug)">
                <div
                  class="circle-img-wrapper rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center mb-2 transition-transform duration-400 group-hover-scale position-relative"
                  style="width: 85px; height: 85px; padding: 2px;">
                  <SoraSkeleton v-show="!categoryImagesLoaded[cat.id]" variant="image" width="100%" height="100%" circle
                    class="position-absolute top-0 start-0" />
                  <img :src="getImageUrl(cat.thumbnail)" loading="lazy" :alt="cat.name"
                    @load="categoryImagesLoaded[cat.id] = true" @error="handleImageError"
                    class="w-100 h-100 object-fit-contain rounded-circle transition-transform duration-500 group-hover-scale-img"
                    :style="{ opacity: categoryImagesLoaded[cat.id] ? 1 : 0, transition: 'opacity 0.4s ease' }">
                </div>
                <h3 class="text-white fw-medium mb-0 tracking-wider text-truncate w-100 pb-1"
                  style="font-size: 0.85rem;">
                  <span class="category-name position-relative">{{ cat.name }}</span>
                </h3>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT: BỘ LỌC VÀ LƯỚI SẢN PHẨM -->
    <div class="container-fluid px-4 py-4 mt-2 mx-auto" style="max-width: 1440px;">
      <div class="row">

        <!-- SIDEBAR BỘ LỌC (LEFT) -->
        <div class="col-lg-2 col-md-3 d-none d-md-block sidebar-filter pe-3 pt-2"
          style="flex-basis: 23%; max-width: 23%;">
          <div class="filter-panel position-sticky custom-scrollbar" :style="{ top: filterTop, transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 10, maxHeight: 'calc(100vh - ' + filterTop + ' - 20px)', overflowY: 'auto' }">

            <div class="filter-header mb-4 border-bottom pb-3">
              <h5 class="text-uppercase fw-bold mb-0 d-flex align-items-center"
                style="color: #9f273b; font-size: 1.1rem; letter-spacing: 0.5px;">
                <i class="bi bi-funnel-fill me-2 fs-5"></i> Bộ Lọc
              </h5>
              <button v-if="hasActiveFilters" type="button" class="filter-clear-link mt-2" @click="resetFilters">
                Xóa tất cả
              </button>
            </div>

            <!-- BỘ LỌC DANH MỤC -->
            <div class="filter-widget mb-4 border-bottom pb-3">
              <div class="d-flex justify-content-between align-items-center cursor-pointer"
                :class="{ 'mb-3': filterCollapses.categories !== false }" @click="toggleCollapse('categories')">
                <div class="position-relative pb-1">
                  <h6 class="text-uppercase fw-bold mb-0 text-dark font-serif"
                    style="font-size: 1.1rem; letter-spacing: 0.5px;">DANH MỤC</h6>
                  <div
                    style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background-color: #e7ce7d;">
                  </div>
                </div>
                <i class="bi text-muted"
                  :class="filterCollapses.categories !== false ? 'bi-chevron-up' : 'bi-chevron-down'"
                  style="font-size: 0.8rem;"></i>
              </div>

              <ul v-if="filterCollapses.categories !== false" class="list-unstyled mb-0 d-flex flex-column mt-3">
                <!-- Mục Tất Cả -->
                <li class="border-bottom sora-border-light last-no-border">
                  <div
                    class="d-flex align-items-center justify-content-between cursor-pointer py-2 px-1 category-elegant-item"
                    @click="filterByCategory('')" :class="{ 'active': filters.categories === '' }">
                    <span class="cat-name transition-colors">Tất cả</span>
                    <i class="bi bi-chevron-right text-muted chevron-icon" style="font-size: 0.8rem;"></i>
                  </div>
                </li>
                <!-- Render Danh mục ẩn hình ảnh -->
                <li v-for="cat in visibleSidebarCategories" :key="cat.id"
                  class="border-bottom sora-border-light last-no-border">
                  <div
                    class="d-flex align-items-center justify-content-between cursor-pointer py-2 px-1 category-elegant-item"
                    @click="filterByCategory(cat.slug)" :class="{ 'active': filters.categories === cat.slug }">
                    <span class="cat-name transition-colors">{{ cat.name }}</span>
                    <i class="bi bi-chevron-right text-muted chevron-icon" style="font-size: 0.8rem;"></i>
                  </div>
                </li>
                <!-- Nút Xem thêm cho Sidebar -->
                <li v-if="categories.length > 5" class="text-center pt-2 pb-1">
                  <span @click="showAllSidebarCategories = !showAllSidebarCategories"
                    class="cursor-pointer text-muted transition-colors d-inline-block hover-text-primary"
                    style="font-size: 0.85rem; font-style: italic;">
                    {{ showAllSidebarCategories ? 'Thu gọn' : 'Xem thêm danh mục' }}
                    <i class="bi ms-1" :class="showAllSidebarCategories ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </span>
                </li>
              </ul>
            </div>

            <!-- BỘ LỌC MÀU SẮC -->
            <div v-if="colorOptions.length > 0" class="filter-widget mb-4 border-bottom pb-3">
              <div class="d-flex justify-content-between align-items-center cursor-pointer"
                :class="{ 'mb-3': filterCollapses.colors !== false }" @click="toggleCollapse('colors')">
                <div class="position-relative pb-1">
                  <h6 class="text-uppercase fw-bold mb-0 text-dark font-serif"
                    style="font-size: 1.1rem; letter-spacing: 0.5px;">MÀU SẮC</h6>
                  <div
                    style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background-color: #e7ce7d;">
                  </div>
                </div>
                <i class="bi text-muted" :class="filterCollapses.colors !== false ? 'bi-chevron-up' : 'bi-chevron-down'"
                  style="font-size: 0.8rem;"></i>
              </div>

              <div v-if="filterCollapses.colors !== false" class="d-flex flex-wrap gap-2 mt-3">
                <div v-for="(color, index) in colorOptions" :key="index"
                  class="color-filter-circle cursor-pointer position-relative shadow-sm"
                  :class="{ 'selected': selectedColors.includes(color) }"
                  :style="{ backgroundColor: getColorCode(color) }" @click="toggleColor(color)" :title="color">
                  <i v-if="selectedColors.includes(color)" class="bi bi-check position-absolute text-white"
                    style="top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2rem; text-shadow: 0px 0px 2px rgba(0,0,0,0.5);"></i>
                </div>
              </div>
            </div>

            <!-- BỘ LỌC THUỘC TÍNH ĐỘNG KHÁC -->
            <div v-if="isLoadingAttributes" class="mb-5">
              <SoraListSkeleton :rows="3" :image="false" />
            </div>
            <template v-else>
              <div class="filter-widget mb-4 border-bottom pb-3" v-for="attr in dynamicAttributes" :key="attr.id">
                <template v-if="!isColorAttribute(attr.name)">
                  <div class="d-flex justify-content-between align-items-center cursor-pointer"
                    :class="{ 'mb-3': filterCollapses[attr.name] !== false }" @click="toggleCollapse(attr.name)">
                    <div class="position-relative pb-1">
                      <h6 class="text-uppercase fw-bold mb-0 text-dark font-serif"
                        style="font-size: 1.1rem; letter-spacing: 0.5px;">{{ attr.name }}</h6>
                      <div
                        style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background-color: #e7ce7d;">
                      </div>
                    </div>
                    <i class="bi text-muted"
                      :class="filterCollapses[attr.name] !== false ? 'bi-chevron-up' : 'bi-chevron-down'"
                      style="font-size: 0.8rem;"></i>
                  </div>

                  <ul v-if="filterCollapses[attr.name] !== false"
                    class="list-unstyled mb-0 filter-list-text d-flex flex-column gap-2 mt-3">
                    <li v-for="val in getVisibleAttributeValues(attr)" :key="val.id" class="w-100">
                      <div class="d-flex align-items-center cursor-pointer attr-checkbox-item"
                        @click="toggleAttribute(val.value)"
                        :class="{ 'active': selectedAttributes.includes(val.value) }">
                        <div class="custom-square-checkbox me-3 d-flex align-items-center justify-content-center">
                          <i class="bi bi-check-lg check-icon"></i>
                        </div>
                        <span class="label-text transition-colors">{{ val.value }}</span>
                      </div>
                    </li>
                    <li v-if="attr.values.length > 5" class="text-center pt-1">
                      <button type="button" class="filter-show-more-btn" @click="toggleAttributeExpanded(attr.name)">
                        {{ expandedAttributes[attr.name] ? 'Thu gọn' : 'Xem thêm' }}
                        <i class="bi ms-1"
                          :class="expandedAttributes[attr.name] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      </button>
                    </li>
                  </ul>
                </template>
              </div>
            </template>

          </div>
        </div>

        <!-- MAIN PRODUCT GRID (RIGHT) -->
        <div class="col-lg-10 col-md-9 ps-lg-3" style="flex-basis: 77%; max-width: 77%;">

          <div
            class="shop-top-bar d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom sora-border-light">
            <div class="result-count text-muted mb-3 mb-md-0 font-oswald text-uppercase tracking-wide" style="font-size: 0.9rem;">
              <span v-if="!isLoadingProducts">Hiển thị {{ visibleResultStart }}–{{ visibleResultEnd }} của {{ pagination.total }} kết quả</span>
              <span v-else>Đang tải dữ liệu...</span>
            </div>

            <div class="d-flex align-items-center gap-4">
              <div class="dropdown sort-dropdown position-relative">
                <button class="btn btn-link text-decoration-none text-dark fw-bold d-flex align-items-center p-0 font-oswald text-uppercase tracking-wide" type="button" @click.stop="isSortDropdownOpen = !isSortDropdownOpen" style="font-size: 0.95rem;">
                  Sắp xếp: 
                  <span class="ms-2 text-muted fw-normal font-inter text-capitalize" style="letter-spacing: 0;">{{ sortOptions[filters.sort] }}</span>
                  <i class="bi fs-6 text-muted ms-2" :class="isSortDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </button>
                <div v-show="isSortDropdownOpen" class="dropdown-menu-wrapper position-absolute shadow border-light-subtle rounded-1 bg-white" style="right: 0; top: 100%; min-width: 180px; z-index: 1000; margin-top: 8px;">
                  <!-- Cầu nối tàng hình -->
                  <div class="position-absolute w-100 bg-transparent" style="height: 12px; top: -12px; left: 0;"></div>
                  <ul class="dropdown-menu position-static d-block w-100 shadow-none border-0 m-0" style="padding: 0.5rem 0;">
                    <li><a class="dropdown-item custom-sort-item py-2 font-inter" :class="{ 'active-sort': filters.sort === 'recommended' }" href="#" @click.prevent="setSort('recommended')">Mặc định</a></li>
                    <li><a class="dropdown-item custom-sort-item py-2 font-inter" :class="{ 'active-sort': filters.sort === 'new' }" href="#" @click.prevent="setSort('new')">Mới nhất</a></li>
                    <li><a class="dropdown-item custom-sort-item py-2 font-inter" :class="{ 'active-sort': filters.sort === 'price_asc' }" href="#" @click.prevent="setSort('price_asc')">Giá tăng dần</a></li>
                    <li><a class="dropdown-item custom-sort-item py-2 font-inter" :class="{ 'active-sort': filters.sort === 'price_desc' }" href="#" @click.prevent="setSort('price_desc')">Giá giảm dần</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeFilterLabels.length" class="active-filter-row mb-4">
            <button v-for="item in activeFilterLabels" :key="item.key" type="button" class="active-filter-chip"
              @click="removeFilter(item)">
              <span>{{ item.label }}</span>
              <i class="bi bi-x-lg"></i>
            </button>
            <button type="button" class="active-filter-reset" @click="resetFilters">Xóa bộ lọc</button>
          </div>

          <SoraProductGridSkeleton v-if="showInitialProductSkeleton" :count="8" min="260px" gap="2.5rem 1.5rem" />

          <!-- LƯỚI SẢN PHẨM THỰC TẾ -->
          <div v-else class="product-grid product-grid-live" :class="{ 'is-refreshing': isProductRefreshing }">
            <ProductCard v-for="product in allProducts" :key="product.id" :product="product" :shop-slug="shopSlug"
              :is-in-wishlist="isFavourited(product.id)" :is-in-compare="isInCompare(product.id)" :show-wishlist="true"
              :show-compare="true" :show-add-to-cart="true" @toggle-wishlist="handleToggleWishlist" />
          </div>

          <!-- Empty State -->
          <div v-if="allProducts.length === 0 && !isLoadingProducts"
            class="text-center py-5 my-5 bg-light sora-border-light border" style="border-radius: 12px;">
            <i class="bi bi-gem fs-1 mb-3" style="color: var(--sora-secondary);"></i>
            <p class="text-dark playfair-font fs-4 mb-2">Không tìm thấy kiệt tác nào</p>
            <p class="text-muted mb-4 fw-light">Vui lòng thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
            <button @click="resetFilters"
              class="btn text-uppercase ls-widest px-5 py-3 transition-colors sora-btn-primary"
              style="font-size: 0.8rem; border-radius: 8px;">Xóa Bộ Lọc</button>
          </div>

          <!-- PHÂN TRANG -->
          <div v-if="pagination.last_page > 1"
            class="d-flex justify-content-center align-items-center mt-5 pt-5 border-top sora-border-light">
            <nav aria-label="Page navigation">
              <ul class="pagination sora-custom-pagination gap-2 mb-0">
                <li class="page-item" :class="{ 'disabled': Number(pagination.current_page) === 1 }">
                  <button class="page-link shadow-sm" @click="changePage(Number(pagination.current_page) - 1)"
                    :disabled="Number(pagination.current_page) === 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>

                <li class="page-item" v-for="(page, index) in visiblePages" :key="index"
                  :class="{ 'active': page !== '...' && Number(page) === Number(pagination.current_page), 'disabled': page === '...' }">
                  <span v-if="page === '...'" class="page-link border-0 text-muted bg-transparent px-2">...</span>
                  <button v-else class="page-link shadow-sm font-serif fw-bold" @click="changePage(page)">{{ page
                    }}</button>
                </li>

                <li class="page-item"
                  :class="{ 'disabled': Number(pagination.current_page) === Number(pagination.last_page) }">
                  <button class="page-link shadow-sm" @click="changePage(Number(pagination.current_page) + 1)"
                    :disabled="Number(pagination.current_page) === Number(pagination.last_page)">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>

    <CompareModal :shop-slug="shopSlug" @update-list="compareList = $event" />

    <!-- MODAL QUICK ADD -->
    <div v-if="quickAddModal.isOpen"
      class="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      @click.self="closeQuickAdd"
      style="z-index: 9999 !important; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px);">
      <div class="bg-white rounded shadow-lg d-flex flex-column position-relative"
        style="width: 90%; max-width: 480px; max-height: 90vh; overflow: hidden; animation: slideUp 0.3s ease-out; border-radius: 12px !important;">
        <div class="d-flex justify-content-between align-items-center px-4 py-3" style="background-color: #9f273b;">
          <h5 class="mb-0 text-white fw-bold font-serif fs-5" style="letter-spacing: 0.5px;">Tùy chọn Sản phẩm</h5>
          <button @click="closeQuickAdd" class="btn text-white p-0 m-0 border-0" style="opacity: 0.8;">
            <i class="bi bi-x-lg fs-4"></i>
          </button>
        </div>
        <div class="p-4 overflow-y-auto" style="flex-grow: 1;">
          <div class="d-flex gap-3 mb-4 pb-4 border-bottom">
            <div class="flex-shrink-0 border rounded sora-img-container"
              style="width: 90px; height: 90px; overflow: hidden; border-color: #eaeaea;">
              <img :src="getImageUrl(currentVariant?.image_url || quickAddModal.product.thumbnail_image)"
                class="w-100 h-100 object-fit-cover bg-light position-relative z-1" @error="handleImageError">
            </div>
            <div class="d-flex flex-column justify-content-center">
              <span class="text-uppercase fw-bold mb-1"
                style="font-size: 0.7rem; color: #e7ce7d; letter-spacing: 2px;">{{
                  quickAddModal.product.category?.name || 'SẢN PHẨM' }}</span>
              <h6 class="fs-5 mb-2 fw-bold text-dark font-serif">{{ quickAddModal.product.name }}</h6>
              <div class="d-flex align-items-center flex-wrap gap-2">
                <span class="fw-bold fs-5" style="color: #9f273b;">{{ displayPriceFormatted }}</span>
                <span v-if="modalOldPrice" class="text-muted text-decoration-line-through" style="font-size: 0.95rem;">
                  {{ formatPrice(modalOldPrice) }}
                </span>
                <span v-if="modalDiscount > 0" class="sora-discount-tag" style="padding: 2px 6px; font-size: 0.75rem;">
                  -{{ modalDiscount }}%
                </span>
              </div>
            </div>
          </div>
          <div v-for="(options, attrName) in quickAddModal.attributes" :key="attrName" class="mb-4">
            <label class="d-block text-uppercase fw-bold mb-2 text-dark font-oswald"
              style="font-size: 0.85rem; letter-spacing: 1px;">
              {{ attrName }}:
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button v-for="opt in options" :key="opt" @click="quickAddModal.selectedOptions[attrName] = opt"
                class="btn variant-select-btn px-4 py-2 fw-medium border"
                :class="{ 'selected': quickAddModal.selectedOptions[attrName] === opt }">
                {{ opt }}
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="d-block text-uppercase fw-bold mb-2 text-dark font-oswald"
              style="font-size: 0.85rem; letter-spacing: 1px;">SỐ LƯỢNG:</label>
            <div class="d-flex align-items-center gap-3">
              <div class="input-group" style="width: 140px;">
                <button @click="updateQuickAddQty(-1)" class="btn btn-outline-secondary" type="button"><i
                    class="bi bi-dash"></i></button>
                <input type="number" v-model.number="quickAddModal.quantity" @change="validateQuickAddQty"
                  class="form-control text-center fw-bold text-dark"
                  style="appearance: textfield; -moz-appearance: textfield;">
                <button @click="updateQuickAddQty(1)" class="btn btn-outline-secondary" type="button"><i
                    class="bi bi-plus"></i></button>
              </div>
              <span v-if="isAllAttributesSelected && currentVariant" class="text-muted small fw-medium">
                {{ currentVariant.stock_quantity > 0 ? `Còn ${currentVariant.stock_quantity} sản phẩm` : 'Hết hàng' }}
              </span>
              <span v-else class="text-muted small fw-medium fst-italic">Vui lòng chọn phân loại</span>
            </div>
          </div>
          <div v-if="!isAllAttributesSelected && Object.keys(quickAddModal.attributes).length > 0"
            class="alert alert-info py-2 small mb-0"><i class="bi bi-info-circle me-1"></i> Vui lòng chọn đầy đủ phân
            loại
            sản phẩm.</div>
          <div v-else-if="!currentVariant && Object.keys(quickAddModal.attributes).length > 0"
            class="alert alert-warning py-2 small mb-0"><i class="bi bi-exclamation-triangle me-1"></i> Phân loại này
            tạm
            thời không khả dụng.</div>
          <div v-else-if="currentVariant && currentVariant.stock_quantity <= 0"
            class="alert alert-danger py-2 small mb-0">
            <i class="bi bi-slash-circle me-1"></i> Sản phẩm này đã hết hàng trong kho.
          </div>
        </div>
        <div class="p-3 bg-light border-top">
          <button @click="confirmAddToCart"
            :disabled="quickAddModal.isAdding || !isAllAttributesSelected || !currentVariant || currentVariant.stock_quantity <= 0"
            class="btn w-100 py-3 text-uppercase fw-bold text-white d-flex justify-content-center align-items-center gap-2"
            style="background-color: #9f273b; border-radius: 8px; font-family: 'Oswald', sans-serif; letter-spacing: 1px; border: none; font-size: 0.95rem;">
            <span v-if="quickAddModal.isAdding" class="spinner-border spinner-border-sm" role="status"></span>
            <template v-else><i class="bi bi-cart-plus me-1"></i> XÁC NHẬN THÊM</template>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue';
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import SoraProductGridSkeleton from '@/components/ui/SoraProductGridSkeleton.vue';
import { useWishlist } from '@/composables/useWishlist';
import Toast from '@/utils/toastConfig';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import { getStorageUrl } from '@/utils/env';
import clientApiClient from '@/utils/clientApiClient';

const route = useRoute();
const router = useRouter();
const shopSlug = computed(() => route.params.shop_slug || 'aurora-jewelry');

const soraAlert = createSoraAlert({
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded shadow-sm fw-bold font-oswald tracking-widest text-uppercase' },
  didOpen: (modal) => { if (modal.parentElement) modal.parentElement.style.zIndex = '10005'; }
});

const { fetchFavorites, isFavourited, toggleFavourite } = useWishlist();

const isPageLoading = ref(true);

const filterTop = ref('100px');
let lastScrollY = 0;
let isHeaderHidden = false;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > 200) {
    if (currentScrollY > lastScrollY && !isHeaderHidden) {
      isHeaderHidden = true;
    } else if (currentScrollY < lastScrollY && isHeaderHidden) {
      isHeaderHidden = false;
    }
  } else {
    isHeaderHidden = false;
  }
  filterTop.value = isHeaderHidden ? '20px' : '100px';
  lastScrollY = currentScrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const compareList = ref([]);
const categoryImagesLoaded = ref({});
const categories = computed(() => categoriesData.value || []);
const showAllCategories = ref(false);
const showAllSidebarCategories = ref(false);

const expandedAttributes = reactive({});
const filterCollapses = ref({
  categories: true,
  colors: true
});


const currentPage = ref(1);

const selectedAttributes = ref([]);
const colorOptions = computed(() => colorsData.value || []);
const selectedColors = ref([]);
const filters = reactive({ sort: 'recommended', categories: '' });
const hasActiveFilters = computed(() => Boolean(filters.categories || selectedColors.value.length || selectedAttributes.value.length || filters.sort !== 'recommended'));
const visibleResultStart = computed(() => {
  if (!pagination.value.total) return 0;
  const perPage = Number(pagination.value.per_page) || allProducts.value.length || 1;
  return ((Number(pagination.value.current_page) || 1) - 1) * perPage + 1;
});
const visibleResultEnd = computed(() => Math.min(pagination.value.total || 0, visibleResultStart.value + allProducts.value.length - 1));

const toggleCollapse = (key) => {
  const newCollapses = { ...filterCollapses.value };
  if (newCollapses[key] === undefined) {
    newCollapses[key] = false;
  } else {
    newCollapses[key] = !newCollapses[key];
  }
  filterCollapses.value = newCollapses;
};

const getVisibleAttributeValues = (attr) => {
  if (expandedAttributes[attr.name]) return attr.values;
  return attr.values.slice(0, 5);
};

const toggleAttributeExpanded = (name) => {
  expandedAttributes[name] = !expandedAttributes[name];
};

const handleBirthdayCouponFromUrl = async () => {
  const couponCode = route.query.coupon;
  if (!couponCode) return;

  const code = Array.isArray(couponCode) ? couponCode[0] : couponCode;

  try {
    const { data } = await clientApiClient.post('/client/cart/apply-birthday-coupon', { code }, {
      ensureCartSession: true,
      ignoreAuthRedirect: true
    });
    if (data.success) {
      localStorage.setItem('birthday_coupon_code', data.coupon || code);
      Toast.fire({ icon: 'success', title: data.message || 'Đã lưu voucher sinh nhật vào giỏ hàng.' });
    } else {
      localStorage.removeItem('birthday_coupon_code');
      soraAlert.fire({
        icon: 'error',
        title: 'Không thể áp dụng voucher',
        text: data.message || 'Voucher chi danh cho thanh vien hang Bac tro len.'
      });
    }
  } catch (error) {
    soraAlert.fire({
      icon: 'error',
      title: 'Lỗi áp dụng voucher',
      text: 'Không thể kiểm tra voucher lúc này.'
    });
  } finally {
    const { coupon, ...query } = route.query;
    router.replace({ query }).catch(() => { });
  }
};

const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'Liên Hệ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const getImageUrl = (path) => getStorageUrl(path);

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };
const handleHoverImageError = (e) => { e.target.style.display = 'none'; };
const hasHoverImage = (product) => product.hover_image && product.hover_image !== product.thumbnail_image;

const handleToggleWishlist = (product) => {
  toggleFavourite(product, Toast, soraAlert, router);
};

const isInCompare = (id) => compareList.value.some(item => item.id === id);

const isColorAttribute = (attrName) => {
  const name = attrName.toLowerCase();
  return name.includes('màu') || name.includes('color');
};

const isMaterialAttribute = (attrName) => {
  const name = attrName.toLowerCase();
  return name.includes('chất liệu') || name.includes('material');
};

const getColorCode = (colorName) => {
  const map = {
    'đỏ': '#cc1e2e', 'red': '#cc1e2e',
    'xanh': '#2e5b9f', 'blue': '#2e5b9f', 'xanh dương': '#2e5b9f',
    'vàng': '#e7ce7d', 'gold': '#e7ce7d', 'vàng 18k': '#d4af37',
    'trắng': '#fcfcfc', 'white': '#fcfcfc', 'vàng trắng': '#f4f4f4',
    'đen': '#2c2c2c', 'black': '#2c2c2c',
    'hồng': '#f4a4b4', 'pink': '#f4a4b4', 'vàng hồng': '#b76e79',
    'bạc': '#c0c0c0', 'silver': '#c0c0c0'
  };
  return map[colorName.toLowerCase().trim()] || '#e0e0e0';
};

const buildFilterOptionParams = () => {
  const params = {};
  if (filters.categories) params.categories = filters.categories;
  return params;
};

// SỬ DỤNG TANSTACK QUERY ĐỂ QUẢN LÝ CACHE VÀ FETCHING
const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
  queryKey: computed(() => ['shopCategories', shopSlug.value]),
  queryFn: async () => {
    const { data } = await clientApiClient.get(`/shop/${shopSlug.value}/categories`, { ignoreAuthRedirect: true });
    if (data?.success) {
      return data.data.sort((a, b) => {
        const orderA = (a.sort_order !== null && a.sort_order !== undefined) ? Number(a.sort_order) : 9999;
        const orderB = (b.sort_order !== null && b.sort_order !== undefined) ? Number(b.sort_order) : 9999;
        return orderA - orderB;
      });
    }
    return [];
  },
  staleTime: 30 * 60 * 1000,
});

const { data: colorsData } = useQuery({
  queryKey: computed(() => ['shopColors', shopSlug.value, filters.categories]),
  queryFn: async () => {
    const params = buildFilterOptionParams();
    const { data } = await clientApiClient.get(`/shop/${shopSlug.value}/colors`, { params, ignoreAuthRedirect: true });
    return data?.success ? data.data : [];
  },
  staleTime: 10 * 60 * 1000,
});

const { data: attrsData, isLoading: isLoadingAttributes } = useQuery({
  queryKey: computed(() => ['shopAttributes', shopSlug.value, filters.categories]),
  queryFn: async () => {
    const params = buildFilterOptionParams();
    const { data } = await clientApiClient.get(`/shop/${shopSlug.value}/attributes`, { params, ignoreAuthRedirect: true });
    return data?.success ? data.data : [];
  },
  staleTime: 10 * 60 * 1000,
});

const dynamicAttributes = computed(() => {
  if (!attrsData.value) return [];
  return attrsData.value.filter(attr => !isColorAttribute(attr.name)).map(attr => ({
    id: attr.id,
    name: attr.name,
    values: attr.values
  }));
});

watch(dynamicAttributes, (attrs) => {
  Object.keys(expandedAttributes).forEach((key) => {
    if (!attrs.some((attr) => attr.name === key)) delete expandedAttributes[key];
  });
  
  const newCollapses = { ...filterCollapses.value };
  let hasChanges = false;
  attrs.forEach(attr => {
    if (newCollapses[attr.name] === undefined) {
      newCollapses[attr.name] = true;
      hasChanges = true;
    }
  });
  if (hasChanges) filterCollapses.value = newCollapses;
}, { immediate: true });

const { data: productsData, isLoading: isLoadingProducts, isFetching: isProductRefreshing } = useQuery({
  queryKey: computed(() => ['shopProducts', shopSlug.value, currentPage.value, filters.sort, filters.categories, selectedColors.value, selectedAttributes.value]),
  queryFn: async ({ signal }) => {
    const queryPayload = { page: currentPage.value, sort: filters.sort };
    if (filters.categories) queryPayload.categories = filters.categories;
    if (selectedColors.value.length > 0) queryPayload.color = selectedColors.value.join(',');
    if (selectedAttributes.value.length > 0) queryPayload.attribute_values = selectedAttributes.value.join(',');

    const { data } = await clientApiClient.get(`/shop/${shopSlug.value}/products`, {
      params: queryPayload,
      signal,
      ignoreAuthRedirect: true
    });
    return data?.success ? data.data : null;
  },
  staleTime: 5 * 60 * 1000,
  placeholderData: keepPreviousData,
});

const allProducts = computed(() => productsData.value?.data || []);
const pagination = computed(() => ({
  current_page: productsData.value?.current_page || 1,
  last_page: productsData.value?.last_page || 1,
  total: productsData.value?.total || 0,
  per_page: productsData.value?.per_page || 0
}));

const hasLoadedProducts = computed(() => !!productsData.value);
const showInitialProductSkeleton = computed(() => isLoadingProducts.value && !hasLoadedProducts.value);

const filterByCategory = (categorySlug) => {
  selectedColors.value = [];
  selectedAttributes.value = [];
  filters.categories = filters.categories === categorySlug ? '' : categorySlug;
  currentPage.value = 1;
};

const sortOptions = {
  'recommended': 'Mặc định',
  'new': 'Mới nhất',
  'price_asc': 'Giá tăng dần',
  'price_desc': 'Giá giảm dần'
};

const isSortDropdownOpen = ref(false);

const setSort = (val) => {
  filters.sort = val;
  isSortDropdownOpen.value = false;
  applyFilters();
};

const closeSortDropdown = () => {
  isSortDropdownOpen.value = false;
};

onMounted(() => {
  window.addEventListener('click', closeSortDropdown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeSortDropdown);
});

const applyFilters = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  filters.categories = '';
  filters.sort = 'recommended';
  selectedAttributes.value = [];
  selectedColors.value = [];
  currentPage.value = 1;
};

const visibleCategories = computed(() => {
  if (showAllCategories.value) return categories.value;
  return categories.value.slice(0, 5);
});

const visibleSidebarCategories = computed(() => {
  if (showAllSidebarCategories.value) return categories.value;
  return categories.value.slice(0, 5);
});

const sortLabels = {
  new: 'Mới nhất',
  price_asc: 'Giá thấp đến cao',
  price_desc: 'Giá cao đến thấp',
};

const activeFilterLabels = computed(() => {
  const labels = [];
  if (filters.categories) {
    const category = categories.value.find((item) => item.slug === filters.categories);
    labels.push({ key: 'category', type: 'category', label: category?.name || filters.categories });
  }
  selectedColors.value.forEach((color) => labels.push({ key: `color-${color}`, type: 'color', value: color, label: color }));
  selectedAttributes.value.forEach((value) => labels.push({ key: `attr-${value}`, type: 'attribute', value, label: value }));
  if (filters.sort !== 'recommended') {
    labels.push({ key: 'sort', type: 'sort', label: sortLabels[filters.sort] || filters.sort });
  }
  return labels;
});

const removeFilter = (item) => {
  if (item.type === 'category') {
    filters.categories = '';
  } else if (item.type === 'color') {
    selectedColors.value = selectedColors.value.filter((color) => color !== item.value);
  } else if (item.type === 'attribute') {
    selectedAttributes.value = selectedAttributes.value.filter((value) => value !== item.value);
  } else if (item.type === 'sort') {
    filters.sort = 'recommended';
  }
  currentPage.value = 1;
};

const toggleColor = (color) => {
  selectedAttributes.value = [];
  const index = selectedColors.value.indexOf(color);
  if (index > -1) {
    selectedColors.value.splice(index, 1);
  } else {
    selectedColors.value.push(color);
  }
  currentPage.value = 1;
};

const toggleAttribute = (val) => {
  selectedColors.value = [];
  const index = selectedAttributes.value.indexOf(val);
  if (index > -1) {
    selectedAttributes.value.splice(index, 1);
  } else {
    selectedAttributes.value.push(val);
  }
  currentPage.value = 1;
};

const visiblePages = computed(() => {
  const current = Number(pagination.value.current_page) || 1;
  const last = Number(pagination.value.last_page) || 1;
  const delta = 1;
  let pages = [];

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
});

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    currentPage.value = page;
    const shopTopBar = document.querySelector('.shop-top-bar');
    if (shopTopBar) {
      const y = shopTopBar.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
};



const quickAddModal = reactive({
  isOpen: false, product: null, attributes: {}, selectedOptions: {}, quantity: 1, isAdding: false
});

const openQuickAdd = (productSummary) => {
  quickAddModal.product = productSummary;
  quickAddModal.selectedOptions = {};
  quickAddModal.quantity = 1;
  quickAddModal.isAdding = false;

  const attrs = {};
  productSummary.variants?.forEach(variant => {
    const attrVals = variant.attribute_values || variant.attributeValues || [];
    attrVals.forEach(av => {
      const attrName = av.attribute?.name;
      if (attrName) {
        if (!attrs[attrName]) attrs[attrName] = new Set();
        attrs[attrName].add(av.value);
      }
    });
  });

  quickAddModal.attributes = Object.fromEntries(
    Object.entries(attrs).map(([key, valueSet]) => [key, Array.from(valueSet)])
  );

  document.body.style.overflow = 'hidden';
  quickAddModal.isOpen = true;
};

const closeQuickAdd = () => {
  document.body.style.overflow = 'auto';
  quickAddModal.isOpen = false;
  quickAddModal.product = null;
};

const isAllAttributesSelected = computed(() => {
  const requiredAttrs = Object.keys(quickAddModal.attributes || {});
  if (requiredAttrs.length === 0) return true;
  return requiredAttrs.every(attr => quickAddModal.selectedOptions[attr] != null);
});

const currentVariant = computed(() => {
  const variants = quickAddModal.product?.variants;
  if (!variants?.length) return null;
  if (Object.keys(quickAddModal.attributes).length === 0) return variants[0];
  if (!isAllAttributesSelected.value) return null;

  return variants.find(v => {
    const attrVals = v.attribute_values || v.attributeValues || [];
    return Object.entries(quickAddModal.selectedOptions).every(([attrName, selectedVal]) => {
      return attrVals.some(av =>
        av.attribute?.name === attrName && String(av.value) === String(selectedVal)
      );
    });
  });
});

const displayPriceFormatted = computed(() => {
  if (currentVariant.value) {
    return formatPrice(currentVariant.value.promotional_price || currentVariant.value.price);
  }
  if (quickAddModal.product) {
    if (quickAddModal.product.variants?.length > 0) {
      const prices = quickAddModal.product.variants.map(v => parseFloat(v.promotional_price || v.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min !== max && !isNaN(min) && !isNaN(max)) return `${formatPrice(min)} - ${formatPrice(max)}`;
      return formatPrice(min);
    }
    return formatPrice(quickAddModal.product.promotional_price || quickAddModal.product.base_price);
  }
  return formatPrice(0);
});

const modalOldPrice = computed(() => {
  if (currentVariant.value && currentVariant.value.promotional_price && currentVariant.value.price > currentVariant.value.promotional_price) {
    return currentVariant.value.price;
  }
  if (!currentVariant.value && quickAddModal.product?.promotional_price && quickAddModal.product?.base_price > quickAddModal.product?.promotional_price) {
    return quickAddModal.product.base_price;
  }
  return null;
});

const modalDiscount = computed(() => {
  if (currentVariant.value && currentVariant.value.promotional_price && currentVariant.value.price > currentVariant.value.promotional_price) {
    return Math.round(((currentVariant.value.price - currentVariant.value.promotional_price) / currentVariant.value.price) * 100);
  }
  if (!currentVariant.value && quickAddModal.product?.promotional_price && quickAddModal.product?.base_price > quickAddModal.product?.promotional_price) {
    return Math.round(((quickAddModal.product.base_price - quickAddModal.product.promotional_price) / quickAddModal.product.base_price) * 100);
  }
  return 0;
});

const updateQuickAddQty = (delta) => {
  if (!isAllAttributesSelected.value) { return Toast.fire({ icon: 'info', title: 'Vui lòng chọn đầy đủ phân loại.' }); }
  const maxStock = currentVariant.value?.stock_quantity || 0;
  let newQty = quickAddModal.quantity + delta;

  if (newQty < 1) newQty = 1;
  if (newQty > maxStock) {
    Toast.fire({ icon: 'warning', title: `Chỉ còn tối đa ${maxStock} sản phẩm` });
    newQty = maxStock;
  }
  quickAddModal.quantity = newQty;
};

const validateQuickAddQty = () => {
  if (!isAllAttributesSelected.value) {
    quickAddModal.quantity = 1;
    return Toast.fire({ icon: 'info', title: 'Vui lòng chọn đầy đủ phân loại.' });
  }
  const maxStock = currentVariant.value?.stock_quantity || 0;
  let qty = parseInt(quickAddModal.quantity);

  if (isNaN(qty) || qty < 1) quickAddModal.quantity = 1;
  else if (qty > maxStock) {
    Toast.fire({ icon: 'warning', title: `Chỉ còn tối đa ${maxStock} sản phẩm` });
    quickAddModal.quantity = maxStock;
  }
};

const confirmAddToCart = async () => {
  if (!isAllAttributesSelected.value || !currentVariant.value) {
    return Toast.fire({ icon: 'warning', title: 'Vui lòng chọn đầy đủ phân loại.' });
  }
  const maxStock = currentVariant.value.stock_quantity || 0;
  if (quickAddModal.quantity > maxStock) {
    return soraAlert.fire({ icon: 'error', title: 'Vượt quá tồn kho', text: `Rất tiếc, cửa hàng chỉ còn ${maxStock} sản phẩm khả dụng.` });
  }

  quickAddModal.isAdding = true;
  try {
    const { data } = await clientApiClient.post('/client/cart', {
      product_variant_id: currentVariant.value.id,
      quantity: quickAddModal.quantity
    }, {
      ensureCartSession: true,
      ignoreAuthRedirect: true
    });
    if (data.session_id) {
      localStorage.setItem('cart_session_id', data.session_id);
    }
    if (data.success) { closeQuickAdd(); router.push('/cart'); }
    else { soraAlert.fire({ icon: 'error', title: 'Không thể thêm', text: data.message || "Đã có lỗi xảy ra." }); }
  } catch (error) {
    soraAlert.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi kết nối tới máy chủ.' });
  } finally {
    quickAddModal.isAdding = false;
  }
};

onMounted(() => {
  handleBirthdayCouponFromUrl();
  fetchFavorites().finally(() => isPageLoading.value = false);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Oswald:wght@400;500;600;700&display=swap');

.shop-page {
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
  --sora-text: #2c2c2c;
  --sora-border: #eaeaea;
  font-family: 'Manrope', sans-serif;
  color: var(--sora-text);
}

.playfair-font {
  font-family: 'Josefin Sans', sans-serif;
}

.font-oswald {
  font-family: 'Oswald', sans-serif;
}

.font-serif {
  font-family: 'Josefin Sans', sans-serif;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

.sora-border-light {
  border-color: var(--sora-border) !important;
}

/* Banner (Sora Banner Style) */
.text-champagne {
  color: #ead089 !important;
}

.z-index-2 {
  z-index: 2;
}

.sora-banner {
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
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
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
  .banner-line-art {
    opacity: 0.45;
  }
}

@media (max-width: 768px) {
  .banner-line-art {
    display: none;
  }

  .banner-monogram {
    bottom: 10px !important;
    font-size: 3.5rem !important;
  }
}

.sora-btn-primary {
  background-color: var(--sora-primary);
  color: #fff;
  border: 1px solid var(--sora-primary);
}

.sora-btn-primary:hover {
  background-color: #831f30;
  border-color: #831f30;
  color: #fff;
}

.filter-panel {
  position: sticky;
  top: 88px;
  padding: 18px 16px;
  border: 1px solid rgba(231, 206, 125, 0.38);
  border-radius: 10px;
  background: linear-gradient(180deg, #fffdf8 0%, #ffffff 72%);
  box-shadow: 0 18px 40px rgba(65, 35, 24, 0.06);
}

.filter-clear-link {
  border: 0;
  background: transparent;
  color: var(--sora-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0;
}

.filter-widget {
  border-color: rgba(231, 206, 125, 0.28) !important;
}

.active-filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  border-radius: 10px;
  background: #fffdf8;
}

.active-filter-chip,
.active-filter-reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.active-filter-chip {
  border: 1px solid rgba(159, 39, 59, 0.18);
  background: #fff;
  color: #6b5451;
  padding: 6px 12px;
}

.active-filter-chip:hover {
  color: var(--sora-primary);
  border-color: rgba(159, 39, 59, 0.38);
}

.active-filter-reset {
  border: 0;
  background: transparent;
  color: var(--sora-primary);
  padding: 6px 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.product-grid-live {
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.product-grid-live.is-refreshing {
  opacity: 0.58;
  filter: saturate(0.9);
  pointer-events: none;
}

/* -------------------------------------
   CSS NÚT XEM THÊM VÀ HIỆU ỨNG TRƯỢT
   ------------------------------------- */
.sora-btn-outline-gold {
  background-color: transparent;
  border: 1px solid var(--sora-secondary);
  color: var(--sora-secondary);
  border-radius: 20px;
  padding: 6px 24px;
  font-family: 'Oswald', sans-serif;
  letter-spacing: 1px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.sora-btn-outline-gold:hover {
  background-color: var(--sora-secondary);
  color: #fff;
}

.cat-list-enter-active,
.cat-list-leave-active {
  transition: all 0.4s ease;
}

.cat-list-enter-from,
.cat-list-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

/* -------------------------------------
   CSS CUSTOM CHO DROPDOWN SẮP XẾP
   ------------------------------------- */
.custom-sort-item {
  color: #444;
  transition: all 0.2s ease;
}

.custom-sort-item:hover,
.custom-sort-item:focus {
  background-color: #fcf4f5 !important;
  color: var(--sora-primary) !important;
}

.custom-sort-item.active-sort,
.custom-sort-item:active {
  background-color: #fdf5f6 !important;
  color: var(--sora-primary) !important;
  font-weight: 600;
}

/* -------------------------------------
   CSS MỚI DÀNH CHO BỘ LỌC CHECKBOX (THUỘC TÍNH)
   ------------------------------------- */
.attr-checkbox-item {
  padding: 6px 0;
  transition: all 0.3s ease;
}

.custom-square-checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #ccc;
  border-radius: 3px;
  transition: all 0.3s ease;
  background-color: transparent;
}

.custom-square-checkbox .check-icon {
  color: white;
  font-size: 1.1rem;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
}

.attr-checkbox-item:hover .custom-square-checkbox {
  border-color: var(--sora-primary);
}

.attr-checkbox-item.active .custom-square-checkbox {
  background-color: var(--sora-primary);
  border-color: var(--sora-primary);
}

.attr-checkbox-item.active .custom-square-checkbox .check-icon {
  opacity: 1;
  transform: scale(1);
}

.attr-checkbox-item .label-text {
  font-size: 0.95rem;
  color: #555;
  transition: all 0.3s ease;
}

.attr-checkbox-item:hover .label-text {
  color: var(--sora-primary);
}

.attr-checkbox-item.active .label-text {
  color: var(--sora-primary);
  font-weight: 600;
}

.filter-show-more-btn {
  border: 0;
  background: transparent;
  color: #7c6964;
  font-size: 0.84rem;
  font-style: italic;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.filter-show-more-btn:hover {
  color: var(--sora-primary);
}

/* -------------------------------------
   CSS MỚI DÀNH CHO DANH MỤC SẢN PHẨM (CLEAN TEXT)
   ------------------------------------- */
.category-elegant-item {
  position: relative;
  padding-left: 0 !important;
  transition: all 0.3s ease;
}

.category-elegant-item .cat-name {
  font-size: 0.95rem;
  color: #555;
  transition: all 0.3s ease;
}

.category-elegant-item:hover .cat-name {
  color: var(--sora-primary);
  transform: translateX(6px);
}

.category-elegant-item.active .cat-name {
  color: var(--sora-primary);
  font-weight: 700;
  transform: translateX(6px);
}

.category-elegant-item i.bi-chevron-right {
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(-10px);
}

.category-elegant-item:hover i.bi-chevron-right,
.category-elegant-item.active i.bi-chevron-right {
  opacity: 1;
  color: var(--sora-primary) !important;
  transform: translateX(0);
}

.last-no-border:last-child {
  border-bottom: none !important;
}

/* Các thành phần còn lại giữ nguyên */
.color-filter-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-filter-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.color-filter-circle.selected {
  border: 2px solid #111;
  transform: scale(1.1);
}

.sora-custom-pagination .page-link {
  color: var(--sora-text);
  border-radius: 4px;
  margin: 0 2px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background-color: #fff;
  transition: all 0.3s;
}

.sora-custom-pagination .page-link:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #ddd;
  color: var(--sora-primary);
}

.sora-custom-pagination .page-item.active .page-link {
  background-color: var(--sora-primary) !important;
  border-color: var(--sora-primary) !important;
  color: #fff !important;
}

.sora-custom-pagination .page-item.disabled .page-link {
  color: #ccc;
  background-color: transparent;
  box-shadow: none !important;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2.5rem 1.5rem;
}

.sora-luxury-card {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.4s;
  cursor: pointer;
  height: 100%;
}

.sora-luxury-card:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  border-color: #e5e5e5;
  transform: translateY(-5px);
}

/* SORA-IMG-CONTAINER MẶC ĐỊNH */
.sora-img-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-color: #f9f9f9;
}

.circle-img-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f5efe8;
  /* Màu nền nhẹ khi chưa có ảnh */
}



.sora-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.6s ease;
}

.sora-main-img {
  z-index: 1;
  position: relative;
}

.sora-hover-img {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: 0;
}

/* SỬA Ở ĐÂY: XÓA DOÒNG opacity: 0 CỦA ẢNH CHÍNH, BÂY GIỜ CHỈ CHO ẢNH HOVER HIỆN LÊN ĐÈ LÊN ẢNH CHÍNH THÔI */
.sora-luxury-card:hover .sora-card-image.has-hover-image .sora-hover-img {
  opacity: 1;
}

.sora-card-badges {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sora-badge {
  background: #ffffff;
  color: #222;
  font-family: 'Oswald', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 4px 10px;
  border-radius: 2px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.sale-badge {
  background-color: #9f273b !important;
  color: white !important;
}

.sora-card-info {
  padding: 20px 15px 70px 15px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sora-card-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sora-card-category {
  font-family: 'Josefin Sans', sans-serif;
  font-style: italic;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 15px;
}

.sora-card-action {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transform: translateY(100%);
  transition: transform 0.4s;
  z-index: 10;
}

.sora-luxury-card:hover .sora-card-action {
  transform: translateY(0);
}

.sora-action-btn {
  width: 100%;
  padding: 14px 0;
  background: #731621;
  color: #ffffff;
  border: none;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.sora-action-btn:hover {
  background: #500f17;
  color: #fff;
}

/* CSS QUICK ADD MODAL */
@keyframes slideUp {
  from {
    transform: translateY(30px) scale(0.98);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.variant-select-btn:hover {
  border-color: #9f273b;
  color: #9f273b;
}

.variant-select-btn.selected {
  border-color: #9f273b;
  color: #9f273b;
  font-weight: 700;
  background-color: #fdf5f6;
  box-shadow: inset 0 0 0 1px #9f273b;
}

.sora-discount-tag {
  background-color: #cc1e2e;
  color: white;
  font-weight: bold;
  border-radius: 2px;
}
</style>