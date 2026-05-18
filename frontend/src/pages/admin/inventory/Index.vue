<template>
  <div class="inventory-index-wrapper pb-5 mb-5">
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100"
      style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ
        liệu kho hàng...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Kho (Inventory)</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel
            }}</span>
          </div>
          <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="fetchData(true)">
            <i class="bi bi-arrow-clockwise me-1"></i> Đồng bộ kho
          </button>
        </div>
      </div>

      <div class="mb-3">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'all_variants' }" @click.prevent="switchTab('all_variants')">
              <i class="bi bi-box-seam me-2"></i> Kho Phân Loại (Biến Thể)
              <span class="badge ms-2 rounded-pill tab-badge"
                :class="{ 'active-badge': activeTab === 'all_variants' }">{{
                  counts.all_variants }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'low_stock' }" @click.prevent="switchTab('low_stock')">
              <i class="bi bi-exclamation-triangle-fill me-2 text-warning"></i> Sắp hết hàng
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'low_stock' }">{{
                counts.low_stock }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'active_combos' }" @click.prevent="switchTab('active_combos')">
              <i class="bi bi-stars me-2 text-primary"></i> Kho Combo
              <span class="badge ms-2 rounded-pill tab-badge"
                :class="{ 'active-badge': activeTab === 'active_combos' }">{{ counts.active_combos }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'expired_combos' }" @click.prevent="switchTab('expired_combos')">
              <i class="bi bi-calendar-x me-2 text-secondary"></i> Combo hết hạn
              <span class="badge ms-2 rounded-pill tab-badge"
                :class="{ 'active-badge': activeTab === 'expired_combos' }">{{ counts.expired_combos }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm"
          v-if="['all_variants', 'low_stock'].includes(activeTab)">
          <span class="text-muted small fw-semibold me-2"><i class="bi bi-bell-fill text-warning"></i> Cảnh báo mức tồn
            kho:</span>
          <div class="input-group input-group-sm" style="width: 110px;">
            <button class="btn btn-outline-secondary border-light-subtle bg-light text-dark fw-bold px-2"
              @click="lowStockThreshold = Math.max(0, lowStockThreshold - 1)">-</button>
            <input type="text" class="form-control text-center fw-bold text-danger border-light-subtle px-1"
              v-model.number="lowStockThreshold"
              @input="lowStockThreshold = Math.max(0, parseInt(lowStockThreshold) || 0)">
            <button class="btn btn-outline-secondary border-light-subtle bg-light text-dark fw-bold px-2"
              @click="lowStockThreshold++">+</button>
          </div>
        </div>

        <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm"
          v-if="['all_variants', 'low_stock'].includes(activeTab)">
          <span class="text-muted small fw-semibold me-2"><i class="bi bi-filter text-brand"></i> Lọc trạng thái SP
            gốc:</span>
          <select class="form-select form-select-sm border-0 bg-transparent fw-bold p-0 pe-4 cursor-pointer"
            style="box-shadow: none; width: auto;" v-model="filters.product_status">
            <option value="all">Tất cả</option>
            <option value="published">Đang bán</option>
            <option value="draft">Bản nháp</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div
          class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
            <i class="bi bi-layers-fill me-2"></i>{{ tableTitle }}
            <div v-if="isSilentLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></div>
          </h6>
          <div class="search-box position-relative" style="width: 300px; max-width: 100%;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0" v-model="searchQuery"
              placeholder="Tìm tên, SKU...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>

        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table v-if="['all_variants', 'low_stock'].includes(activeTab)" class="table table-hover align-middle mb-0"
              style="table-layout: fixed; width: 100%; min-width: 1000px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 8%;">Ảnh</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 35%;">Thông tin Phân loại (Biến thể)</th>
                  <th class="py-3 px-4 text-secondary border-0 text-end" style="width: 15%;">Giá niêm yết</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 25%;">Nhập thêm Tồn kho</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 17%;">Trạng thái SP</th>
                </tr>
              </thead>
              <tbody :class="{ 'pe-none': isSilentLoading }">
                <tr v-if="filteredVariants.length === 0 && !isSilentLoading">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu tồn kho.
                  </td>
                </tr>

                <tr v-else v-for="variant in paginatedVariants" :key="variant.id"
                  :class="{ 'bg-danger bg-opacity-10': variant.stock_quantity <= lowStockThreshold }">
                  <td class="px-4 py-3">
                    <img :src="getThumbnail(variant.image_url || variant.product_thumbnail)" @error="handleImageError"
                      class="rounded border object-fit-cover shadow-sm bg-white" style="width: 50px; height: 50px;">
                  </td>

                  <td class="px-4 overflow-hidden">
                    <div class="d-flex flex-wrap gap-1 mb-2">
                      <span v-for="(val, key) in parseAttributes(variant.attributes)" :key="key"
                        class="badge bg-white text-dark border border-secondary-subtle fw-normal shadow-sm"
                        style="font-size: 0.75rem;">
                        {{ key }}: <span class="fw-bold">{{ val }}</span>
                      </span>
                      <span v-if="Object.keys(parseAttributes(variant.attributes)).length === 0"
                        class="badge bg-white text-dark border border-secondary-subtle fw-normal shadow-sm"
                        style="font-size: 0.75rem;">Bản tiêu chuẩn</span>
                    </div>
                    <div class="font-monospace fw-bold text-brand mb-1">SKU: {{ variant.sku }}</div>
                    <div class="text-muted small text-truncate" :title="variant.product_name">
                      <i class="bi bi-box-seam me-1"></i>SP gốc: <span class="fw-medium text-dark">{{
                        variant.product_name }}</span>
                    </div>
                  </td>

                  <td class="px-4 text-end">
                    <div class="fw-bold text-success">{{ formatCurrency(variant.promotional_price || variant.price) }}
                    </div>
                  </td>
                  
                  <td class="px-4">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="text-center me-3 border-end pe-3">
                        <span class="d-block small text-muted mb-1">Hiện tại</span>
                        <span class="fw-bold fs-6" :class="{ 'text-danger': variant.stock_quantity <= lowStockThreshold }">{{ variant.stock_quantity }}</span>
                      </div>
                      
                      <!-- Giao diện nhập kho mới -->
                      <div class="d-flex flex-column">
                        <div class="d-flex align-items-center position-relative" style="width: max-content;">
                          <input type="number" class="form-control form-control-sm text-center fw-bold shadow-sm"
                            style="width: 85px; font-size: 0.85rem;"
                            :style="variant.stockAdjustment < 0 ? 'border-color: #dc3545 !important;' : 'border-color: #ced4da !important;'"
                            :class="variant.stockAdjustment < 0 ? 'text-danger' : 'text-success'"
                            placeholder="+ Thêm"
                            v-model.number="variant.stockAdjustment" @input="checkVariantStockChange(variant)"
                            :disabled="variant.isUpdating" min="1">

                          <div class="position-absolute start-100 ms-2 d-flex align-items-center" style="width: 60px;">
                            <div v-if="variant.isUpdating" class="spinner-border text-brand"
                              style="width: 1.25rem; height: 1.25rem; border-width: 0.15em;"></div>

                            <template v-else-if="variant.isChanged">
                              <button @click="promptSaveVariantStock(variant)"
                                class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                style="width: 24px; height: 24px; padding: 0;" title="Nhập kho">
                                <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                              </button>
                              <button @click="cancelVariantStockChange(variant)"
                                class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1"
                                style="width: 24px; height: 24px; padding: 0;" title="Hủy">
                                <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                              </button>
                            </template>
                          </div>
                        </div>
                        <div class="text-center mt-1" style="min-height: 18px;">
                           <small class="text-success fw-bold" v-if="variant.stockAdjustment > 0">Dự kiến: {{ variant.stock_quantity + variant.stockAdjustment }}</small>
                           <small class="text-danger fw-bold" v-else-if="variant.stockAdjustment < 0">&gt; 0</small>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <span class="badge" :class="getStatusBadgeClass(variant.product_status)">{{
                      getStatusText(variant.product_status)
                    }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <table v-else class="table table-hover align-middle mb-0"
              style="table-layout: fixed; width: 100%; min-width: 1100px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 8%;">Ảnh</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Tên Gói Ưu Đãi (Combo)</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 22%;">Thời gian áp dụng</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 10%;">Đã bán</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 25%;">Giới hạn số lượng bán
                  </th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 10%;">Trạng thái</th>
                </tr>
              </thead>
              <tbody :class="{ 'pe-none': isSilentLoading }">
                <tr v-if="filteredCombos.length === 0 && !isSilentLoading">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu gói ưu đãi.
                  </td>
                </tr>

                <tr v-else v-for="combo in paginatedCombos" :key="combo.id"
                  :class="{ 'bg-light opacity-75': isComboExpired(combo) }">
                  <td class="px-4 py-3">
                    <img :src="getThumbnail(combo.thumbnail_image)" @error="handleImageError"
                      class="rounded border object-fit-cover shadow-sm bg-white" style="width: 50px; height: 50px;">
                  </td>
                  <td class="px-4 overflow-hidden">
                    <div class="fw-bold text-dark text-truncate mb-1 cursor-pointer hover-brand">{{ combo.name }}</div>
                    <div class="small text-brand font-monospace">Mã: COMBO-{{ combo.id }}</div>
                  </td>
                  <td class="px-4">
                    <div class="small text-dark mb-1"><span class="text-muted">Từ:</span> <span class="fw-medium">{{
                      formatDateTime(combo.start_date) || 'Vô thời hạn' }}</span></div>
                    <div class="small text-dark"><span class="text-muted">Đến:</span> <span class="fw-medium"
                        :class="{ 'text-danger': isComboExpired(combo) }">{{ formatDateTime(combo.end_date) || 'Vô thời hạn' }}</span>
                    </div>
                  </td>
                  <td class="px-4 text-center">
                    <div class="fw-bold fs-5 text-dark">{{ combo.usage_count || 0 }}</div>
                  </td>
                  <td class="px-4">
                    <div class="d-flex flex-column align-items-center">
                      <div class="d-flex align-items-center position-relative" style="width: max-content;">
                        <input type="number" class="form-control form-control-sm text-center fw-bold shadow-sm"
                          style="width: 110px; border-color: #ced4da !important; font-size: 0.85rem;"
                          :class="{ 'text-danger': combo.localLimit !== '' && combo.localLimit <= 0 }"
                          v-model.number="combo.localLimit" placeholder="Vô hạn" @input="checkComboLimitChange(combo)"
                          :disabled="combo.isUpdating" min="0">

                        <div class="position-absolute start-100 ms-2 d-flex align-items-center" style="width: 60px;">
                          <div v-if="combo.isUpdating" class="spinner-border text-brand"
                            style="width: 1.25rem; height: 1.25rem; border-width: 0.15em;"></div>

                          <template v-else-if="combo.isChanged">
                            <button @click="saveComboLimit(combo)"
                              class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                              style="width: 24px; height: 24px; padding: 0;" title="Lưu">
                              <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                            </button>
                            <button @click="cancelComboLimitChange(combo)"
                              class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1"
                              style="width: 24px; height: 24px; padding: 0;" title="Hủy">
                              <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                            </button>
                          </template>
                        </div>
                      </div>
                      <small class="text-muted mt-1" style="font-size: 0.65rem;">(Bỏ trống = Vô hạn)</small>
                    </div>
                  </td>
                  <td class="px-4 text-center">
                    <span class="badge"
                      :class="isComboExpired(combo) ? 'bg-secondary' : getStatusBadgeClass(combo.status)">
                      {{ isComboExpired(combo) ? 'Đã kết thúc' : getStatusText(combo.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4" v-if="totalPages > 1">
            <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, ['all_variants', 'low_stock'].includes(activeTab) ? filteredVariants.length : filteredCombos.length) }}</span>
            <nav>
              <ul class="pagination pagination-sm mb-0 shadow-sm">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link text-brand" @click="currentPage = Math.max(1, currentPage - 1)"><i class="bi bi-chevron-left"></i></button>
                </li>
                <li class="page-item" v-for="(page, idx) in visiblePages" :key="idx" :class="{ active: currentPage === page, disabled: page === '...' }">
                  <button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="page !== '...' && (currentPage = page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link text-brand" @click="currentPage = Math.min(totalPages, currentPage + 1)"><i class="bi bi-chevron-right"></i></button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';
import { getFullImage } from '@/composables/useUtilities';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const apiBase = import.meta.env.VITE_API_BASE_URL;

const isFirstLoad = ref(true);
const isSilentLoading = ref(false);
const currentPageLevel = ref(null);

const activeTab = ref('all_variants');
const searchQuery = ref('');
const lowStockThreshold = ref(10);
const filters = ref({ product_status: 'all' });

const allVariantsData = ref([]);
const allCombosData = ref([]);

const currentPage = ref(1);
const itemsPerPage = 10;

const counts = ref({ all_variants: 0, low_stock: 0, active_combos: 0, expired_combos: 0 });

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getThumbnail = (url) => {
  if (!url) return defaultPlaceholder;
  return getFullImage(url);
};

const handleImageError = (e) => {
  e.target.src = defaultPlaceholder;
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

const parseAttributes = (attr) => {
  if (!attr) return {};
  if (typeof attr === 'object') return attr;
  try { return JSON.parse(attr); } catch { return {}; }
};

const getStatusText = (status) => {
  const map = { 'published': 'Đang bán', 'draft': 'Bản nháp', 'hidden': 'Đang ẩn', 'active': 'Đang chạy' };
  return map[status] || status;
};

const getStatusBadgeClass = (status) => {
  const map = {
    'published': 'bg-success text-white shadow-sm',
    'active': 'bg-success text-white shadow-sm',
    'draft': 'bg-warning text-dark shadow-sm',
    'hidden': 'bg-secondary text-white shadow-sm'
  };
  return map[status] || 'bg-light text-dark';
};

const isComboExpired = (combo) => {
  if (!combo.end_date) return false;
  const end = new Date(combo.end_date).getTime();
  return end < new Date().getTime();
};

const checkVariantStockChange = (variant) => {
  const adj = parseInt(variant.stockAdjustment);
  // Chỉ cho phép nhập số DƯƠNG lớn hơn 0
  if (!isNaN(adj) && adj > 0) {
    variant.isChanged = true;
  } else {
    variant.isChanged = false;
  }
};

const cancelVariantStockChange = (variant) => { 
  variant.stockAdjustment = ''; 
  variant.isChanged = false; 
};

const checkComboLimitChange = (combo) => {
  const currentVal = combo.usage_limit === null ? '' : combo.usage_limit;
  combo.isChanged = String(combo.localLimit) !== String(currentVal);
};
const cancelComboLimitChange = (combo) => {
  combo.localLimit = combo.usage_limit === null ? '' : combo.usage_limit;
  combo.isChanged = false;
};

watch(lowStockThreshold, () => {
  updateCounts();
});

watch([activeTab, searchQuery, filters], () => {
  currentPage.value = 1;
});

// Hàm hiển thị Popup hỏi lý do trước khi Lưu
const promptSaveVariantStock = async (variant) => {
  const quantity = parseInt(variant.stockAdjustment);
  if (isNaN(quantity) || quantity <= 0) {
    Swal.fire({ icon: 'warning', title: 'Không hợp lệ', text: 'Chỉ được phép nhập số lượng cộng thêm (lớn hơn 0).' });
    return;
  }

  const { value: note } = await Swal.fire({
    title: 'Xác nhận nhập kho',
    html: `Bạn đang thêm <b>${quantity}</b> sản phẩm vào kho.<br><br>Vui lòng nhập <b>Mã phiếu nhập</b> hoặc <b>Lý do</b> để lưu vết (bắt buộc):`,
    input: 'text',
    inputPlaceholder: 'VD: PN-012023 hoặc Hàng trả bảo hành',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận nhập kho',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#009981',
    inputValidator: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Lý do nhập kho không được để trống!';
      }
    }
  });

  if (note) {
    executeSaveVariantStock(variant, quantity, note.trim());
  }
};

// Hàm gửi API thực sự sau khi có Lý do
const executeSaveVariantStock = async (variant, quantity, note) => {
  variant.isUpdating = true;
  try {
    const payload = {
      action: 'add',
      quantity: quantity,
      note: note
    };

    await axios.put(`${apiBase}/admin/inventory/variants/${variant.id}/stock`, payload, { headers: getHeaders() });

    variant.stock_quantity += quantity;
    variant.stockAdjustment = '';
    variant.isChanged = false;
    updateCounts();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Nhập kho thành công', showConfirmButton: false, timer: 1500 });
  } catch (error) {
    cancelVariantStockChange(variant);

    let errorMsg = 'Không thể lưu thay đổi';
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.response?.data?.errors?.note) {
      errorMsg = error.response.data.errors.note[0];
    } else if (error.response?.data?.errors?.quantity) {
      errorMsg = error.response.data.errors.quantity[0];
    }

    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: errorMsg, showConfirmButton: false, timer: 3000 });
  } finally {
    variant.isUpdating = false;
  }
};

const saveComboLimit = async (combo) => {
  combo.isUpdating = true;
  try {
    const payload = {
      usage_limit: combo.localLimit === '' ? null : combo.localLimit
    };

    await axios.put(`${apiBase}/admin/inventory/combos/${combo.id}/limit`, payload, { headers: getHeaders() });

    combo.usage_limit = combo.localLimit === '' ? null : combo.localLimit;
    combo.isChanged = false;
    updateCounts();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật giới hạn thành công', showConfirmButton: false, timer: 1500 });
  } catch (error) {
    cancelComboLimitChange(combo);

    let errorMsg = 'Không thể lưu thay đổi';
    if (error.response?.data?.errors?.usage_limit) {
      errorMsg = error.response.data.errors.usage_limit[0];
    }

    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: errorMsg, showConfirmButton: false, timer: 2000 });
  } finally {
    combo.isUpdating = false;
  }
};

const fetchData = async (silent = false) => {
  if (silent) isSilentLoading.value = true;

  try {
    const [resVariants, resCombos, resModules] = await Promise.all([
      axios.get(`${apiBase}/admin/inventory/variants`, { headers: getHeaders() }),
      axios.get(`${apiBase}/admin/combos?per_page=1000`, { headers: getHeaders() }),
      axios.get(`${apiBase}/admin/modules`, { headers: getHeaders() })
    ]);

    const sysModules = resModules.data.data;
    const currentModule = sysModules.find(m => m.module_code === 'admin_products');
    if (currentModule) currentPageLevel.value = currentModule.required_level;

    let vArray = [];
    const variantsData = resVariants.data.data;

    variantsData.forEach(v => {
      if (v.product) {
        vArray.push({
          ...v,
          product_id: v.product.id,
          product_name: v.product.name,
          product_slug: v.product.slug,
          product_category_id: v.product.category_id,
          product_base_price: v.product.base_price,
          product_status: v.product.status,
          product_thumbnail: v.product.thumbnail_image,
          category_name: v.product.category?.name || 'Uncategorized',
          stockAdjustment: '',
          attributes: v.formatted_attributes,
          isChanged: false,
          isUpdating: false
        });
      }
    });
    allVariantsData.value = vArray;

    const combosData = resCombos.data.data.data ? resCombos.data.data.data : resCombos.data.data;
    allCombosData.value = combosData.map(c => ({
      ...c,
      localLimit: c.usage_limit === null ? '' : c.usage_limit,
      isChanged: false,
      isUpdating: false
    }));

    updateCounts();

  } catch (error) {
    console.error(error);
  } finally {
    isFirstLoad.value = false;
    isSilentLoading.value = false;
  }
};

const updateCounts = () => {
  counts.value.all_variants = allVariantsData.value.length;
  counts.value.low_stock = allVariantsData.value.filter(v => v.stock_quantity <= lowStockThreshold.value).length;

  let activeC = 0; let expC = 0;
  allCombosData.value.forEach(c => {
    if (isComboExpired(c)) expC++; else activeC++;
  });
  counts.value.active_combos = activeC;
  counts.value.expired_combos = expC;
};

const switchTab = (tabId) => {
  activeTab.value = tabId;
};

const tableTitle = computed(() => {
  const map = {
    'all_variants': 'Danh sách Biến thể Sản phẩm',
    'low_stock': 'Cảnh báo Sắp hết hàng',
    'active_combos': 'Gói Ưu đãi đang chạy',
    'expired_combos': 'Gói Ưu đãi đã khép lại'
  };
  return map[activeTab.value] || '';
});

const filteredVariants = computed(() => {
  let result = allVariantsData.value;

  if (activeTab.value === 'low_stock') {
    result = result.filter(v => v.stock_quantity <= lowStockThreshold.value);
  }

  if (filters.value.product_status !== 'all') {
    result = result.filter(v => v.product_status === filters.value.product_status);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(v =>
      v.sku.toLowerCase().includes(q) ||
      v.product_name.toLowerCase().includes(q)
    );
  }
  return result;
});

const paginatedVariants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredVariants.value.slice(start, end);
});

const filteredCombos = computed(() => {
  let result = allCombosData.value;

  if (activeTab.value === 'expired_combos') {
    result = result.filter(c => isComboExpired(c));
  } else {
    result = result.filter(c => !isComboExpired(c));
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (`combo-${c.id}`.includes(q))
    );
  }
  return result;
});

const paginatedCombos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCombos.value.slice(start, end);
});

const totalPages = computed(() => {
  const data = ['all_variants', 'low_stock'].includes(activeTab.value) ? filteredVariants.value : filteredCombos.value;
  return Math.ceil(data.length / itemsPerPage);
});

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  } else if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  } else {
    return [1, '...', current - 1, current, current + 1, '...', total];
  }
});

onMounted(() => {
  fetchData();
});

useAdminRefreshListener((payload) => {
  if (!payload || !payload.module) return;
  if (['products', 'combos', 'inventory', 'all'].includes(payload.module)) {
    fetchData(1, true);
  }
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

.cursor-pointer {
  cursor: pointer;
}

.hover-brand:hover {
  color: #009981 !important;
}
</style>