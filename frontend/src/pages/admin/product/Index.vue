<template>
  <div class="product-index-wrapper pb-5 mb-5">

    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100"
      style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải kho
        trang sức...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Kho Trang Sức</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel
              }}</span>
          </div>
          <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="fetchData(true)">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
          <router-link :to="{ name: 'admin-products-create' }"
            class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
            <i class="bi bi-plus-circle me-1"></i> Thêm Sản phẩm
          </router-link>
        </div>
      </div>

      <div class="mb-3">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'all' }">{{
                products.filter(p => !p.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'published' }" @click.prevent="switchTab('published')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đang bán
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'published' }">{{
                products.filter(p => p.status === 'published' && !p.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'draft' }" @click.prevent="switchTab('draft')">
              <i class="bi bi-pencil-square me-2 text-warning"></i> Bản nháp
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'draft' }">{{
                products.filter(p => p.status === 'draft' && !p.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'hidden' }" @click.prevent="switchTab('hidden')">
              <i class="bi bi-eye-slash-fill me-2 text-secondary"></i> Đang ẩn
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'hidden' }">{{
                products.filter(p => p.status === 'hidden' && !p.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#"
              :class="{ 'active-tab': activeTab === 'deleted' }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2"></i> Đã xóa
              <span class="badge ms-2 rounded-pill bg-danger text-white">{{products.filter(p => p.deleted_at).length
                }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="d-flex flex-wrap gap-3 mb-4">
        <div class="d-flex align-items-center bg-white px-3 py-2 rounded-3 border shadow-sm filter-box">
          <span class="text-muted small fw-semibold me-2 text-nowrap"><i class="bi bi-tags-fill text-brand"></i> Danh
            mục:</span>
          <select
            class="form-select form-select-sm border-0 bg-transparent fw-bold py-0 ps-1 pe-4 cursor-pointer text-dark filter-select"
            style="box-shadow: none; width: auto; min-width: 110px; font-size: 0.875rem;"
            v-model="selectedCategoryFilter">
            <option value="all" class="fw-normal">Tất cả</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id" class="fw-normal">{{ cat.name }}
            </option>
          </select>
        </div>

        <div class="d-flex align-items-center bg-white px-3 py-2 rounded-3 border shadow-sm filter-box">
          <span class="text-muted small fw-semibold me-2 text-nowrap"><i class="bi bi-award-fill text-brand"></i> Thương
            hiệu:</span>
          <select
            class="form-select form-select-sm border-0 bg-transparent fw-bold py-0 ps-1 pe-4 cursor-pointer text-dark filter-select"
            style="box-shadow: none; width: auto; min-width: 110px; font-size: 0.875rem;" v-model="selectedBrandFilter">
            <option value="all" class="fw-normal">Tất cả</option>
            <option v-for="brand in availableBrands" :key="brand.id" :value="brand.id" class="fw-normal">{{ brand.name
              }}</option>
          </select>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div
          class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
            <i class="bi bi-list-ul me-2"></i>Danh sách Sản phẩm
            <div v-if="isSilentLoading || isTableLoading" class="spinner-border spinner-border-sm text-brand ms-2"
              role="status"></div>
          </h6>
          <div class="search-box position-relative" style="width: 300px; max-width: 100%;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0" v-model="searchQuery"
              @input="currentPage = 1" placeholder="Tìm theo tên sản phẩm, SKU...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>

        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0"
              style="table-layout: fixed; width: 100%; min-width: 1000px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 28%;">Sản phẩm (Bản gốc)</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 17%;">Phân loại</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Số Biến thể</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 20%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 20%;">Thao tác</th>
                </tr>
              </thead>
              <tbody :class="{ 'pe-none': isSilentLoading }">
                <tr v-if="paginatedProducts.length === 0 && !isSilentLoading && !isTableLoading">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                  </td>
                </tr>
                <tr v-else v-for="product in paginatedProducts" :key="product.id"
                  :class="{ 'bg-light opacity-75': product.deleted_at }">
                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                      <div
                        class="position-relative d-inline-block me-3 shadow-sm border rounded-3 overflow-hidden bg-white flex-shrink-0"
                        style="width: 55px; height: 55px;">
                        <SoraImage :src="product.thumbnail_image" imgClass="w-100 h-100 object-fit-cover"
                          :placeholder="defaultPlaceholder" />
                      </div>
                      <div class="overflow-hidden">
                        <div class="fw-bold text-dark fs-6 mb-1 text-truncate cursor-pointer hover-brand"
                          @click="openQuickView(product.id)" :title="product.name">{{ product.name }}</div>

                        <div class="d-flex align-items-center gap-2">
                          <div class="text-muted small fw-semibold text-success border-end pe-2">
                            Giá sàn: {{ formatCurrency(product.base_price) }}
                          </div>
                          <div class="small d-flex align-items-center"
                            :class="(product.review_count > 0) ? 'text-warning fw-bold' : 'text-muted'"
                            :title="product.review_count > 0 ? `Điểm trung bình: ${product.rating_avg} sao` : 'Sản phẩm chưa có đánh giá'">
                            <i class="bi" :class="(product.review_count > 0) ? 'bi-star-fill' : 'bi-star'"></i>
                            <span class="ms-1">{{ product.review_count > 0 ? product.rating_avg : 'Chưa có ĐG' }}</span>
                            <span class="text-secondary fw-normal ms-1" v-if="product.review_count > 0">({{
                              product.review_count }})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 overflow-hidden">
                    <div v-if="product.category" class="fw-semibold text-secondary text-truncate mb-1"
                      :title="product.category.name">
                      <i class="bi bi-folder2-open me-1"></i> {{ product.category.name }}
                    </div>
                    <div v-else class="text-danger small fst-italic text-truncate mb-1"><i
                        class="bi bi-exclamation-triangle-fill"></i> Mất danh mục</div>

                    <div v-if="product.brand" class="small text-muted text-truncate fw-medium"
                      :title="product.brand.name">
                      <i class="bi bi-award me-1"></i> {{ product.brand.name }}
                    </div>
                    <div v-else class="small text-black-50 fst-italic text-truncate">
                      <i class="bi bi-award me-1"></i> No Brand
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <div class="badge bg-light text-dark border px-2 py-1 mb-1">
                      <i class="bi bi-diagram-3-fill text-brand me-1"></i> {{ product.variants_count || 0 }} Biến thể
                    </div>
                    <div class="small fw-semibold mt-1"
                      :class="(product.total_stock || 0) > 0 ? 'text-success' : 'text-danger'">
                      Tồn kho: {{ product.total_stock || 0 }}
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <span v-if="product.deleted_at"
                      class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i
                        class="bi bi-trash3-fill"></i> Đã xóa</span>
                    <div v-else class="d-flex align-items-center justify-content-center gap-1 flex-nowrap w-100">
                      <select
                        class="form-select form-select-sm border shadow-sm fw-semibold cursor-pointer flex-shrink-0"
                        style="width: 120px; font-size: 0.8rem; border-color: #ced4da !important;"
                        :class="getStatusSelectClass(product.localStatus || product.status)"
                        v-model="product.localStatus" @change="checkStatusChange(product)"
                        :disabled="product.isUpdatingStatus">
                        <option value="published">Đang bán</option>
                        <option value="draft">Bản nháp</option>
                        <option value="hidden">Đang ẩn</option>
                      </select>

                      <div class="d-flex align-items-center justify-content-start"
                        style="min-width: 55px; height: 28px; flex-shrink: 0 !important;">
                        <div v-if="product.isUpdatingStatus" class="spinner-border text-brand ms-1"
                          style="width: 1.25rem; height: 1.25rem; border-width: 0.15em; flex-shrink: 0 !important;"
                          role="status"></div>

                        <template v-else-if="product.isStatusChanged">
                          <button @click="saveProductStatus(product)"
                            class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center ms-1"
                            style="width: 24px; height: 24px; padding: 0; flex-shrink: 0 !important;" title="Lưu">
                            <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                          <button @click="cancelStatusChange(product)"
                            class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1"
                            style="width: 24px; height: 24px; padding: 0; flex-shrink: 0 !important;" title="Hủy">
                            <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                        </template>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <button class="btn btn-sm btn-light text-info me-2 shadow-sm border"
                      @click="openQuickView(product.id)"><i class="bi bi-eye"></i></button>
                    <template v-if="!product.deleted_at">
                      <router-link :to="{ name: 'admin-products-edit', params: { id: product.id } }"
                        class="btn btn-sm btn-light text-primary me-2 shadow-sm border"><i
                          class="bi bi-pencil-square"></i></router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border"
                        @click="confirmDelete(product.id, product.name)"><i class="bi bi-trash"></i></button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-light text-success shadow-sm border"
                        @click="restoreProduct(product.id)"><i class="bi bi-arrow-counterclockwise"></i></button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2"
        v-if="totalPages > 1 && !isTableLoading">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage *
          itemsPerPage, processedProducts.length) }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand"
                @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'"
                @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand"
                @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="modal fade" id="quickViewProductModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom pb-3 bg-light rounded-top-4">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-box-seam text-brand me-2"></i>Quản lý Kho Biến thể (SKU)
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body p-0" v-if="selectedProduct">
            <div class="p-3 bg-white border-bottom d-flex align-items-center gap-3 position-relative">
              <div v-if="isFetchingDetail"
                class="position-absolute top-0 end-0 m-3 text-brand small fw-bold d-flex align-items-center bg-white px-2 py-1 rounded shadow-sm border">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div> Đang tải biến thể...
              </div>

              <SoraImage :src="selectedProduct.thumbnail_image" imgClass="rounded border object-fit-cover shadow-sm"
                style="width: 60px; height: 60px;" :placeholder="defaultPlaceholder" />
              <div>
                <h5 class="mb-1 fw-bold text-dark">{{ selectedProduct.name }}</h5>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                  <span class="badge bg-light text-secondary border"><i class="bi bi-folder2 me-1"></i> {{
                    selectedProduct.category?.name || 'Không xác định' }}</span>
                  <span class="badge bg-light text-secondary border" v-if="selectedProduct.brand"><i
                      class="bi bi-award me-1"></i> {{ selectedProduct.brand?.name }}</span>

                  <span class="badge bg-warning bg-opacity-10 text-warning border border-warning"
                    v-if="selectedProduct.review_count > 0">
                    <i class="bi bi-star-fill me-1"></i> {{ selectedProduct.rating_avg }} ({{
                      selectedProduct.review_count
                    }})
                  </span>
                  <span class="badge bg-light text-secondary border" v-else>
                    <i class="bi bi-star me-1"></i> Chưa có ĐG
                  </span>

                  <span class="badge bg-success bg-opacity-10 text-success border border-success">Tổng Tồn: {{
                    selectedProduct.total_stock || 0 }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedProduct.isPartial && isFetchingDetail"
              class="text-center py-5 bg-white border rounded-3 shadow-sm my-3 mx-3">
              <div class="spinner-border text-brand mb-3" style="width: 2.5rem; height: 2.5rem;" role="status"></div>
              <div class="text-muted small fw-semibold text-uppercase tracking-widest">Đang trích xuất biến thể sản
                phẩm...
              </div>
            </div>

            <div v-else class="table-responsive bg-light p-3" style="max-height: 50vh;">
              <div v-if="!selectedProduct.variants || selectedProduct.variants.length === 0"
                class="text-center py-4 text-muted">
                Sản phẩm này chưa được cấu hình biến thể nào.
              </div>
              <table v-else class="table table-hover bg-white border rounded shadow-sm mb-0 align-middle small">
                <thead class="table-light sticky-top">
                  <tr>
                    <th class="px-3" style="width: 50px;">Ảnh</th>
                    <th class="px-3" style="width: 150px;">Mã SKU</th>
                    <th class="px-3">Thuộc tính (Phân loại)</th>
                    <th class="px-3 text-end" style="width: 120px;">Giá bán</th>
                    <th class="px-3 text-center" style="width: 100px;">Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in selectedProduct.variants" :key="v.id">
                    <td class="px-3">
                      <SoraImage :src="v.image_url" imgClass="rounded border object-fit-cover"
                        style="width: 40px; height: 40px;" :placeholder="defaultPlaceholder" />
                    </td>
                    <td class="px-3 font-monospace fw-bold text-secondary">{{ v.sku }}</td>
                    <td class="px-3">
                      <span v-for="(val, key) in v.attributes" :key="key"
                        class="me-1 mb-1 badge bg-light text-dark border shadow-sm">
                        {{ getAttributeName(key) }}: <span class="text-brand">{{ getAttributeValueName(key, val)
                          }}</span>
                      </span>
                    </td>
                    <td class="px-3 text-end fw-bold text-success">{{ formatCurrency(v.price) }}</td>
                    <td class="px-3 text-center">
                      <span class="badge w-100 py-2" :class="v.stock_quantity > 0 ? 'bg-success' : 'bg-danger'">
                        {{ v.stock_quantity }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light border-top-0 rounded-bottom-4">
            <button type="button" class="btn btn-outline-brand rounded-pill px-4 fw-bold"
              data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';
import { useQuery } from '@tanstack/vue-query';

import SoraImage from '@/components/ui/SoraImage.vue';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const activeTab = ref('all');
const selectedCategoryFilter = ref('all');
const selectedBrandFilter = ref('all');
const currentPageLevel = ref(null);

const currentPage = ref(1);
const itemsPerPage = 8;

const selectedProduct = ref(null);
const isFetchingDetail = ref(false);

// Tách isFirstLoad thành một biến reactive cục bộ để kiểm soát màn hình loading chào mừng độc lập khi đổi route
const isFirstLoad = ref(true);

let quickViewModalInstance = null;
let isUnmounted = false;

onBeforeUnmount(() => {
  isUnmounted = true;
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
  document.body.style = '';
});

const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
};

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '---';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
};

const getLevelColor = (level) => {
  if (!level) return 'bg-secondary';
  const l = parseInt(level);
  switch (l) {
    case 1: return 'bg-danger text-white border-danger shadow-sm';
    case 2: return 'bg-warning text-dark border-warning';
    case 3: return 'bg-info text-dark border-info';
    case 4: return 'bg-primary bg-opacity-10 text-primary border-primary';
    case 5: return 'bg-success bg-opacity-10 text-success border-success';
    default: return 'bg-light text-secondary border-secondary';
  }
};

const checkStatusChange = (product) => {
  product.isStatusChanged = (product.localStatus !== product.status);
};

const cancelStatusChange = (product) => {
  product.localStatus = product.status;
  product.isStatusChanged = false;
};

const saveProductStatus = async (product) => {
  product.isUpdatingStatus = true;
  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('category_id', product.category_id);
  if (product.brand_id) formData.append('brand_id', product.brand_id);
  formData.append('name', product.name);
  formData.append('slug', product.slug);
  formData.append('base_price', product.base_price);
  formData.append('status', product.localStatus);
  formData.append('variants_data', '[]');

  try {
    await axios.post(`${API_URL}/admin/products/${product.id}`, formData, {
      headers: getHeaders()
    });

    product.status = product.localStatus;
    product.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
  } catch (error) {
    cancelStatusChange(product);
    if (error.response && error.response.status === 401) {
      Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
    } else {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái lúc này', 'error');
    }
  } finally {
    product.isUpdatingStatus = false;
  }
};

const getStatusSelectClass = (status) => {
  const map = {
    'published': 'text-success border-success bg-success bg-opacity-10',
    'draft': 'text-warning border-warning bg-warning bg-opacity-10',
    'hidden': 'text-secondary border-secondary bg-secondary bg-opacity-10'
  };
  return map[status] || 'bg-light text-secondary';
};

const fetchProducts = async () => {
  const res = await axios.get(`${API_URL}/admin/products`, { headers: getHeaders() });
  return res.data.data.map(p => ({
    ...p,
    localStatus: p.status,
    isStatusChanged: false,
    isUpdatingStatus: false,
    review_count: p.review_count || 0,
    rating_avg: p.rating_avg || 0
  }));
};

const { data: productsData, isFetching: isTableLoading, refetch: refetchProducts } = useQuery({
  queryKey: ['adminProducts'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000,
});

const products = computed(() => productsData.value || []);

const fetchSystemMeta = async () => {
  const [resCats, resAttr, resModules, resBrands] = await Promise.all([
    axios.get(`${API_URL}/admin/categories`, { headers: getHeaders() }),
    axios.get(`${API_URL}/admin/attributes`, { headers: getHeaders() }),
    axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() }),
    axios.get(`${API_URL}/admin/brands`, { headers: getHeaders() })
  ]);

  return {
    categories: Array.isArray(resCats.data.data) ? resCats.data.data : (Array.isArray(resCats.data.data?.data) ? resCats.data.data.data : []),
    attributes: Array.isArray(resAttr.data.data) ? resAttr.data.data : [],
    modules: resModules.data.data || [],
    brands: Array.isArray(resBrands.data.data) ? resBrands.data.data : []
  };
};

const { data: metaData } = useQuery({
  queryKey: ['adminSystemMeta'],
  queryFn: fetchSystemMeta,
  staleTime: 30 * 60 * 1000,
});

const activeProductData = computed(() => {
  return products.value.filter(p => p.status === 'published' && !p.deleted_at && p.total_stock > 0);
});

const activeCategoryIds = computed(() => new Set(activeProductData.value.map(p => p.category_id)));
const activeBrandIds = computed(() => new Set(activeProductData.value.map(p => p.brand_id)));

const availableCategories = computed(() => {
  const cats = metaData.value?.categories || [];
  return cats.filter(c => activeCategoryIds.value.has(c.id));
});

const availableBrands = computed(() => {
  const brs = metaData.value?.brands || [];
  return brs.filter(b => activeBrandIds.value.has(b.id));
});

const getAttributeName = (attrId) => {
  const attrs = metaData.value?.attributes || [];
  const a = attrs.find(x => x.id == attrId);
  return a ? a.name : `Attr_${attrId}`;
};

const getAttributeValueName = (attrId, valId) => {
  const attrs = metaData.value?.attributes || [];
  const a = attrs.find(x => x.id == attrId);
  if (a && a.values) {
    const v = a.values.find(x => x.id == valId);
    return v ? v.value : `Val_${valId}`;
  }
  return `Val_${valId}`;
};

watch(() => metaData.value?.modules, (sysModules) => {
  if (sysModules && sysModules.length > 0) {
    const currentModule = sysModules.find(m => m.module_code === (route.meta.moduleCode || 'admin_products'));
    if (currentModule) currentPageLevel.value = currentModule.required_level;
  }
}, { immediate: true });


const isSilentLoading = ref(false);
const fetchData = async (silent = false) => {
  if (silent) isSilentLoading.value = true;
  await refetchProducts();
  if (silent) isSilentLoading.value = false;
};

const openQuickView = async (id) => {
  const cachedProduct = products.value.find(p => p.id === id);
  if (cachedProduct) {
    selectedProduct.value = { ...cachedProduct, isPartial: true };
    if (!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewProductModal'));
    quickViewModalInstance.show();
  }

  isFetchingDetail.value = true;
  try {
    const res = await axios.get(`${API_URL}/admin/products/${id}`, { headers: getHeaders() });
    if (!isUnmounted) {
      selectedProduct.value = res.data.data;
      if (!cachedProduct) {
        if (!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewProductModal'));
        quickViewModalInstance.show();
      }
    }
  } catch (e) {
    Swal.fire('Lỗi', 'Không thể tải cấu hình Biến thể', 'error');
  } finally {
    isFetchingDetail.value = false;
  }
};


const switchTab = (tabId) => {
  activeTab.value = tabId;
  currentPage.value = 1;
};

const processedProducts = computed(() => {
  let result = products.value;
  if (activeTab.value === 'deleted') { result = result.filter(r => r.deleted_at); }
  else {
    result = result.filter(r => !r.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(r => r.status === activeTab.value);
  }

  if (selectedCategoryFilter.value !== 'all') result = result.filter(r => r.category_id == selectedCategoryFilter.value);
  if (selectedBrandFilter.value !== 'all') result = result.filter(r => r.brand_id == selectedBrandFilter.value);

  if (searchQuery.value) {
    const q = removeAccents(searchQuery.value);
    result = result.filter(r => {
      const normalizedName = removeAccents(r.name);
      const normalizedSku = removeAccents(r.sku);
      return normalizedName.includes(q) || normalizedSku.includes(q);
    });
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedProducts.value.length / itemsPerPage) || 1);
const paginatedProducts = computed(() => { const start = (currentPage.value - 1) * itemsPerPage; return processedProducts.value.slice(start, start + itemsPerPage); });

const confirmDelete = (id, name) => {
  Swal.fire({ title: 'Xóa Sản phẩm?', text: `Sản phẩm "${name}" cùng toàn bộ Biến thể sẽ bị xóa!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý' }).then(async (result) => {
    if (result.isConfirmed) {
      isSilentLoading.value = true;
      try {
        await axios.delete(`${API_URL}/admin/products/${id}`, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã đưa vào thùng rác', showConfirmButton: false, timer: 1500 });
        await refetchProducts();
      } catch (e) {
        Swal.fire('Lỗi', 'Không thể xóa', 'error');
      } finally {
        isSilentLoading.value = false;
      }
    }
  });
};

useAdminRefreshListener((payload) => {
  if (payload.module === 'products') {
    fetchData(true);
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Sản phẩm đã được cập nhật', showConfirmButton: false, timer: 2000 });
  }
});

const restoreProduct = (id) => {
  Swal.fire({ title: 'Khôi phục?', text: "Khôi phục sản phẩm này về danh sách bán?", icon: 'info', showCancelButton: true, confirmButtonColor: '#009981', confirmButtonText: 'Đồng ý' }).then(async (result) => {
    if (result.isConfirmed) {
      isSilentLoading.value = true;
      try {
        await axios.post(`${API_URL}/admin/products/${id}/restore`, {}, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã khôi phục thành công', showConfirmButton: false, timer: 1500 });
        await refetchProducts();
      } catch (e) {
        Swal.fire('Lỗi', 'Không thể khôi phục', 'error');
      } finally {
        isSilentLoading.value = false;
      }
    }
  });
};

// Đảm bảo chạy màn hình chào mượt mà mỗi khi component được Mount (vào lại trang)
onMounted(async () => {
  isFirstLoad.value = true;
  await fetchData();
  setTimeout(() => {
    isFirstLoad.value = false;
  }, 450); // Chờ 450ms tạo cảm giác loading mượt mà, dễ chịu
});
</script>

<style scoped>
.custom-tab {
  font-weight: 600 !important;
  color: #6c757d;
  border-bottom: 2px solid transparent !important;
  margin-bottom: -1px;
  transition: color 0.2s ease;
}

.custom-tab:hover {
  color: #009981;
}

.custom-tab.active-tab {
  color: #009981 !important;
  border-bottom: 2px solid #009981 !important;
}

.tab-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.active-badge {
  background-color: #e6f5f2 !important;
  color: #009981 !important;
  border-color: #009981 !important;
}

.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 1.5s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.bg-brand {
  background-color: #009981 !important;
}

.text-brand {
  color: #009981 !important;
}

.border-brand {
  border-color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  border: none;
  transition: 0.2s;
}

.btn-brand:hover {
  background-color: #007a67;
}

.btn-outline-brand {
  color: #009981;
  border-color: #009981;
  transition: 0.2s;
}

.btn-outline-brand:hover {
  background-color: #009981;
  color: white;
}

.cursor-pointer {
  cursor: pointer;
}

.custom-scrollbar-x::-webkit-scrollbar {
  height: 4px;
}

.custom-scrollbar-x::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
  background: #c0c0c0;
}

/* CSS NÂNG CẤP BỘ LỌC DANH MỤC & THƯƠNG HIỆU ĐỒNG BỘ */
.filter-box {
  min-width: 250px;
  max-width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-box:hover {
  border-color: #009981 !important;
}

.filter-select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  /* Thêm mũi tên SVG màu thương hiệu #009981 sang xịn mịn */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23009981' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right center !important;
  background-size: 12px !important;
  padding-right: 1.5rem !important;
}
</style>