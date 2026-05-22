<template>
  <div class="combo-edit-wrapper pb-5 mb-5">
    <div class="container-fluid py-4" v-if="!isPageLoading">
      
      <!-- HEADER -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-8 d-flex align-items-center">
          <router-link :to="{ name: 'admin-combos' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div class="d-flex flex-column">
            <h3 class="fw-bold text-dark mb-0">Cập nhật Combo</h3>
            <p class="text-muted small mb-0 mt-1">Chỉnh sửa thông tin, giá bán và cấu trúc sản phẩm của gói</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitCombo">
        <div class="row g-4">
          
          <!-- CỘT TRÁI -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-4 text-brand border-bottom pb-2"><i class="bi bi-info-circle-fill me-2"></i>Thông tin Gói</h6>
                
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label fw-bold">Tên Combo <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.name" @input="generateSlug" required>
                  </div>
                  
                  <div class="col-md-12">
                    <label class="form-label fw-bold text-muted small">Đường dẫn (Slug)</label>
                    <input type="text" class="form-control bg-light text-muted font-monospace" v-model="form.slug" readonly>
                  </div>

                  <div class="col-md-12">
                    <label class="form-label fw-bold text-muted small">Mô tả ngắn</label>
                    <textarea class="form-control" v-model="form.description" rows="3"></textarea>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold text-muted small">Phân loại đối tượng <span class="text-danger">*</span></label>
                    <select class="form-select fw-semibold" v-model="form.target_gender" required>
                      <option value="unisex">Dùng chung (Unisex)</option>
                      <option value="female">Nữ giới</option>
                      <option value="male">Nam giới</option>
                      <option value="couple">Cặp đôi (Couple)</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold text-muted small">Độ tuổi</label>
                    <input type="text" class="form-control" v-model="form.target_age_group">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold text-muted small">Chủ đề / Dịp</label>
                    <input type="text" class="form-control" v-model="form.theme">
                  </div>
                </div>
              </div>
            </div>

            <!-- BẢNG DANH SÁCH MÓN ĐỒ -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold text-brand mb-0"><i class="bi bi-box-seam-fill me-2"></i>Thành phần Gói Sản phẩm</h6>
                <button type="button" class="btn btn-sm btn-outline-brand fw-bold rounded-pill px-3" @click="addItemRow">
                  <i class="bi bi-plus-lg me-1"></i> Thêm món
                </button>
              </div>
              <div class="card-body p-0">
                <div class="alert alert-danger m-3 bg-opacity-10 border-danger text-dark small" v-if="comboItems.length < 2">
                  <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i> Combo cần có ít nhất 2 sản phẩm.
                </div>

                <div class="table-responsive" v-else style="overflow: visible;">
                  <table class="table table-bordered align-middle mb-0">
                    <thead class="bg-light text-muted small text-center text-uppercase">
                      <tr>
                        <th style="width: 45%;">Sản phẩm</th>
                        <th style="width: 30%;">Biến thể (Size/Màu)</th>
                        <th style="width: 15%;">Số lượng</th>
                        <th style="width: 10%;">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in comboItems" :key="index">
                        <td class="p-2 position-relative">
                          <!-- CUSTOM SELECT DROPDOWN (VUE-DRIVEN) -->
                          <div class="custom-select-wrapper w-100 position-relative">
                              <button class="btn btn-light bg-white border w-100 text-start d-flex justify-content-between align-items-center shadow-sm"
                                      type="button" @click="item.isDropdownOpen = !item.isDropdownOpen" style="min-height: 38px;">
                                  <span class="text-truncate fw-semibold text-dark" style="max-width: 90%;">{{ getProductName(item.product_id) }}</span>
                                  <i class="bi bi-chevron-down text-muted small"></i>
                              </button>
                              
                              <!-- Lớp Overlay bắt sự kiện click ra ngoài để đóng Dropdown -->
                              <div v-if="item.isDropdownOpen" class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 1050; cursor: default;" @click="item.isDropdownOpen = false"></div>
                              
                              <div v-if="item.isDropdownOpen" class="dropdown-menu show p-0 shadow-lg border-0 rounded-3 overflow-hidden position-absolute mt-1" style="width: 360px; z-index: 1060; top: 100%; left: 0;">
                                  <!-- Khung tìm kiếm & lọc -->
                                  <div class="p-3 border-bottom bg-light">
                                      <div class="input-group input-group-sm mb-2 shadow-sm">
                                          <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                                          <input type="text" class="form-control border-start-0 ps-0 fw-semibold" v-model="item.searchQuery" placeholder="Tìm kiếm nhanh (VD: suc, vàng)...">
                                      </div>
                                      <select class="form-select form-select-sm fw-semibold text-brand shadow-sm border-0" v-model="item.priceFilter">
                                          <option value="all">Tất cả mức giá</option>
                                          <option value="under_1m">Dưới 1.000.000 đ</option>
                                          <option value="1m_to_5m">1.000.000 đ - 5.000.000 đ</option>
                                          <option value="over_5m">Trên 5.000.000 đ</option>
                                      </select>
                                  </div>
                                  
                                  <!-- Danh sách sản phẩm -->
                                  <div class="product-list-scroll bg-white custom-scrollbar" style="max-height: 280px; overflow-y: auto;">
                                      <template v-for="(group, catName) in getFilteredAndGroupedProducts(item, index)" :key="catName">
                                          
                                          <!-- Tên danh mục (Sticky) kèm Tính năng Collapse & Sort -->
                                          <div class="bg-light fw-bold text-secondary px-3 py-2 small sticky-top border-bottom border-top d-flex justify-content-between align-items-center" style="z-index: 2; top: 0;">
                                              <div class="cursor-pointer d-flex align-items-center flex-grow-1" @click="toggleCategory(item, catName, group)">
                                                  <i class="bi bi-tags-fill me-1 text-brand"></i> 
                                                  <span class="me-2">{{ catName }} ({{ group.length }})</span>
                                                  <i class="bi" :class="isCollapsed(item, catName, group) ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
                                              </div>
                                              
                                              <!-- Các nút Lọc/Sort nhanh giá (ĐÃ FIX: Trắng chữ khi active) -->
                                              <div class="d-flex align-items-center bg-white border rounded shadow-sm">
                                                  <button type="button" class="btn btn-sm px-2 py-0 border-end hover-brand" 
                                                          @click.stop="sortCategory(item, catName, 'asc')" 
                                                          :class="{'text-white bg-brand': item.categorySorts[catName] === 'asc', 'text-muted': item.categorySorts[catName] !== 'asc'}" 
                                                          title="Giá tăng dần">
                                                      <i class="bi bi-sort-numeric-down"></i>
                                                  </button>
                                                  <button type="button" class="btn btn-sm px-2 py-0 hover-brand" 
                                                          @click.stop="sortCategory(item, catName, 'desc')" 
                                                          :class="{'text-white bg-brand': item.categorySorts[catName] === 'desc', 'text-muted': item.categorySorts[catName] !== 'desc'}" 
                                                          title="Giá giảm dần">
                                                      <i class="bi bi-sort-numeric-up-alt"></i>
                                                  </button>
                                              </div>
                                          </div>
                                          
                                          <!-- Nút sản phẩm (Bị ẩn nếu danh mục Collapse) -->
                                          <template v-if="!isCollapsed(item, catName, group)">
                                            <button v-for="p in group" :key="p.id"
                                                    type="button"
                                                    class="dropdown-item text-wrap px-3 py-2 border-bottom d-flex justify-content-between align-items-center dropdown-hover"
                                                    :class="{ 'bg-brand text-white fw-bold': item.product_id === p.id, 'disabled opacity-50': isProductAlreadySelected(p.id, index) }"
                                                    @click.prevent="selectProduct(index, p.id)">
                                                <span class="small pe-2" style="flex: 1; line-height: 1.4;">{{ p.name }}</span>
                                                <span class="fw-bold small text-nowrap" :class="item.product_id === p.id ? 'text-white' : 'text-danger'">{{ formatCurrency(p.base_price) }}</span>
                                            </button>
                                          </template>
                                      </template>
                                      <div v-if="Object.keys(getFilteredAndGroupedProducts(item, index)).length === 0" class="text-center py-4 text-muted small bg-light">
                                          <i class="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>
                                          Không tìm thấy sản phẩm phù hợp
                                      </div>
                                  </div>
                              </div>
                          </div>
                        </td>
                        
                        <td class="p-2 text-center">
                          <div v-if="item.isLoadingVariants" class="spinner-border spinner-border-sm text-brand"></div>
                          <span v-else-if="!item.product_id" class="text-muted small fst-italic">---</span>
                          <select v-else class="form-select form-select-sm" v-model="item.product_variant_id">
                            <option :value="null" class="text-success fw-bold">[Khách hàng tự do chọn Size]</option>
                            <option v-for="v in item.available_variants" :key="v.id" :value="v.id">
                              SKU: {{ v.sku }} ({{ formatCurrency(v.price) }})
                            </option>
                          </select>
                        </td>
                        
                        <td class="p-2">
                          <input type="number" class="form-control form-control-sm text-center fw-bold" v-model.number="item.quantity" min="1" required>
                        </td>
                        <td class="p-2 text-center">
                          <button type="button" class="btn btn-sm text-danger border-0 bg-transparent hover-bg-danger" @click="removeItemRow(index)">
                            <i class="bi bi-trash-fill fs-6"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- CỘT PHẢI: QUẢN LÝ ITEMS & BẢNG TÍNH LỢI NHUẬN -->
          <div class="col-lg-4">
            
            <div class="card border-0 shadow-sm rounded-4 mb-4 text-center p-4">
              <h6 class="fw-bold mb-3 text-start"><i class="bi bi-image me-2"></i>Ảnh Đại Diện Combo <span class="text-danger">*</span></h6>
              <div class="mb-3 position-relative border rounded-4 overflow-hidden bg-white shadow-sm mx-auto" style="width: 100%; height: 200px;">
                <!-- HIỂN THỊ ẢNH PREVIEW LÚC UPLOAD HOẶC SORA IMAGE TỪ DB -->
                <img v-if="thumbnailPreview" :src="thumbnailPreview" class="w-100 h-100 object-fit-cover">
                <SoraImage v-else-if="form.thumbnail_image" 
                           :src="form.thumbnail_image" 
                           imgClass="w-100 h-100 object-fit-cover" 
                           :placeholder="defaultPlaceholder" />
                <div v-else class="d-flex flex-column justify-content-center align-items-center h-100 text-muted bg-light">
                  <i class="bi bi-images fs-1 mb-2 opacity-50"></i>
                </div>
              </div>
              <input type="file" class="d-none" id="comboUpload" accept="image/*" @change="handleThumbnailUpload">
              <label for="comboUpload" class="btn btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer">
                <i class="bi bi-upload me-1"></i> {{ thumbnailFile ? 'Đổi ảnh khác' : 'Tải ảnh mới lên' }}
              </label>
            </div>

            <!-- SMART CALCULATOR BOX -->
            <div class="card border-brand border-2 shadow-sm rounded-4 mb-4">
              <div class="card-header bg-brand text-white border-0 py-3 rounded-top-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-calculator-fill me-2"></i>Bảng tính Lợi nhuận</h6>
              </div>
              <div class="card-body p-4 bg-light">
                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Hình thức giảm giá</label>
                  <select class="form-select bg-white fw-semibold" v-model="form.discount_type">
                    <option value="percentage">Giảm theo Phần trăm (%)</option>
                    <option value="fixed_amount">Trừ thẳng tiền (VNĐ)</option>
                  </select>
                </div>
                
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark small">Mức giảm</label>
                  <div class="input-group shadow-sm">
                    <input type="number" class="form-control fw-bold text-danger fs-5 text-end" v-model.number="form.discount_value" min="0" required>
                    <span class="input-group-text bg-white fw-bold">{{ form.discount_type === 'percentage' ? '%' : 'VNĐ' }}</span>
                  </div>
                </div>

                <hr class="opacity-25 border-secondary my-4">

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted fw-semibold">Tổng giá gốc (Ước tính):</span>
                  <span class="fw-bold text-secondary text-decoration-line-through">{{ formatCurrency(originalTotal) }}</span>
                </div>
                <div class="d-flex justify-content-between p-3 mt-3 bg-white border border-brand rounded-3 shadow-sm">
                  <span class="fw-bold text-dark">KHÁCH MUA GIÁ:</span>
                  <span class="fw-bold fs-5 text-brand">{{ formatCurrency(finalEstimatedPrice) }}</span>
                </div>
                <div class="text-center mt-3">
                  <div class="badge bg-success text-white px-3 py-2 rounded-pill w-100 shadow-sm">
                    <i class="bi bi-piggy-bank-fill me-1"></i> Khách tiết kiệm: {{ savingsPercentage }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- OPTIONS KÈM THÊM LỊCH FLATPICKR XỊN XÒ -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-gear me-2"></i>Cài đặt Khác</h6>
                
                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Giới hạn số lần bán (Tùy chọn)</label>
                  <input type="number" class="form-control form-control-sm" v-model.number="form.usage_limit" min="1" placeholder="Để trống nếu không giới hạn">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Bắt đầu bán từ</label>
                  <div class="input-group shadow-sm">
                    <span class="input-group-text bg-white text-brand border-end-0"><i class="bi bi-calendar-event"></i></span>
                    <input type="datetime-local" id="start_date" class="form-control fw-semibold border-start-0 ps-0 bg-white cursor-pointer" v-model="form.start_date">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Kết thúc vào</label>
                  <div class="input-group shadow-sm">
                    <span class="input-group-text bg-white text-danger border-end-0"><i class="bi bi-calendar-x"></i></span>
                    <input type="datetime-local" id="end_date" class="form-control fw-semibold border-start-0 ps-0 bg-white cursor-pointer" v-model="form.end_date">
                  </div>
                </div>
                <hr class="opacity-25 border-secondary my-3">

                <div class="form-check form-switch mb-3">
                  <input class="form-check-input cursor-pointer border-secondary" type="checkbox" id="stackable" v-model="form.is_discount_stackable">
                  <label class="form-check-label fw-semibold cursor-pointer text-dark" for="stackable">Cho phép áp Voucher ngoài</label>
                </div>

                <div class="mb-2">
                  <label class="form-label fw-bold text-dark small">Trạng thái hiển thị</label>
                  <select class="form-select" v-model="form.isActive">
                    <option :value="true">Đang hoạt động (Active)</option>
                    <option :value="false">Lưu nháp / Ẩn (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="border-top pt-4 text-end mt-2">
          <router-link :to="{ name: 'admin-combos' }" class="btn btn-light px-4 me-2 border fw-semibold">Hủy bỏ</router-link>
          <!-- Sử dụng trạng thái isPending của TanStack Query -->
          <button type="submit" class="btn btn-brand px-5 py-2 fw-bold shadow-sm rounded-pill" :disabled="updateMutation.isPending.value || comboItems.length < 2">
            <span v-if="updateMutation.isPending.value" class="spinner-border spinner-border-sm me-2"></span> 
            LƯU THAY ĐỔI COMBO
          </button>
        </div>
      </form>
    </div>

    <!-- MÀN HÌNH CHỜ -->
    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu Combo...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'; 
import Swal from 'sweetalert2';
import axios from 'axios';

// Import Component SoraImage và Ảnh Placeholder
import SoraImage from '@/components/ui/SoraImage.vue';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();
const comboId = route.params.id;
const queryClient = useQueryClient(); 

const isFormInitialized = ref(false); 
const thumbnailFile = ref(null);
const thumbnailPreview = ref(null);

const form = ref({
  name: '', slug: '', description: '',
  target_gender: 'unisex', target_age_group: '', theme: '',
  discount_type: 'percentage', discount_value: 0, is_discount_stackable: false,
  usage_limit: null, start_date: '', end_date: '',
  isActive: true, thumbnail_image: null
});

const comboItems = ref([]);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

// ============================================================================
// TANSTACK QUERY 1: LẤY DANH SÁCH SẢN PHẨM (Kèm Bắt Lỗi Mạng/Auth)
// ============================================================================
const { data: allProducts } = useQuery({
  queryKey: ['admin-products'],
  queryFn: async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/products`, { headers: getHeaders() });
      const pData = res.data?.data;
      return Array.isArray(pData?.data) ? pData.data : pData || [];
    } catch (error) {
      console.error('Lỗi lấy danh sách sản phẩm:', error);
      return []; 
    }
  },
  staleTime: 5 * 60 * 1000, 
});

// ============================================================================
// TANSTACK QUERY 2: LẤY CHI TIẾT COMBO (Kèm Bắt Lỗi Mạng/Auth)
// ============================================================================
const { data: comboData, isLoading: isLoadingCombo } = useQuery({
  queryKey: ['admin-combo', comboId],
  queryFn: async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/combos/${comboId}`, { headers: getHeaders() });
      return res.data?.data || null;
    } catch (error) {
      console.error('Lỗi lấy chi tiết combo:', error);
      Swal.fire('Lỗi', 'Không thể tải chi tiết Combo hoặc phiên đăng nhập hết hạn!', 'error').then(() => {
         router.push({ name: 'admin-combos' }).catch(() => {});
      });
      return null; 
    }
  },
});

const isPageLoading = computed(() => isLoadingCombo.value || !isFormInitialized.value);

const formatFromDBDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
};

const formatToDBDate = (str) => {
    if (!str) return '';
    let cleanStr = str.split('.')[0].replace('Z', '').replace('T', ' ');
    if (cleanStr.length === 16) cleanStr += ':00';
    return cleanStr;
};

// ============================================================================
// TỐI ƯU HÓA BỘ LỌC TÌM KIẾM, PHÂN NHÓM & QUẢN LÝ UI DROPDOWN
// ============================================================================

// Hàm chuẩn hóa chuỗi để tìm kiếm mờ (xoá dấu tiếng Việt)
const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D')
              .toLowerCase();
};

const eligibleProducts = computed(() => {
    if (!allProducts.value) return [];
    return allProducts.value.filter(p => p.deleted_at === null && p.status === 'published' && p.variants_count > 0);
});

const getProductName = (productId) => {
    if (!productId) return '-- Vui lòng chọn sản phẩm --';
    const p = eligibleProducts.value.find(x => x.id === productId);
    return p ? `${p.name} (${formatCurrency(p.base_price)})` : 'Sản phẩm không tồn tại';
};

// Quản lý trạng thái Thu/Gọn của từng Category
const isCollapsed = (item, catName, groupProducts) => {
    // Luôn mở hết nếu đang gõ tìm kiếm
    if (item.searchQuery) return false; 
    
    // Nếu người dùng đã tự click Tắt/Mở, ưu tiên trạng thái đó
    if (item.collapsedCategories[catName] !== undefined) {
        return item.collapsedCategories[catName];
    }
    
    // Auto-Expand: Tự động mở danh mục ĐANG CHỨA sản phẩm được chọn
    if (item.product_id && groupProducts.some(p => p.id === item.product_id)) {
        return false;
    }
    
    // Mặc định ban đầu là Thu gọn (Gọn gàng)
    return true; 
};

const toggleCategory = (item, catName, groupProducts) => {
    const currentState = isCollapsed(item, catName, groupProducts);
    item.collapsedCategories[catName] = !currentState;
};

// Quản lý chức năng Sắp xếp (Sort) theo giá
const sortCategory = (item, catName, direction) => {
    if (item.categorySorts[catName] === direction) {
        item.categorySorts[catName] = null; // Huỷ sort nếu click lại
    } else {
        item.categorySorts[catName] = direction;
        item.collapsedCategories[catName] = false; // Mở category đó ra nếu đang đóng
    }
};

const getFilteredAndGroupedProducts = (item, currentIndex) => {
    let filtered = eligibleProducts.value || [];

    // Tìm kiếm mờ (Fuzzy Search)
    if (item.searchQuery) {
        const q = removeAccents(item.searchQuery);
        filtered = filtered.filter(p => removeAccents(p.name).includes(q));
    }

    // Lọc theo khoảng giá
    if (item.priceFilter !== 'all') {
        filtered = filtered.filter(p => {
            const price = parseFloat(p.base_price);
            if (item.priceFilter === 'under_1m') return price < 1000000;
            if (item.priceFilter === '1m_to_5m') return price >= 1000000 && price <= 5000000;
            if (item.priceFilter === 'over_5m') return price > 5000000;
            return true;
        });
    }

    const limited = filtered.slice(0, 100); // Tránh lag DOM
    
    // Đảm bảo item đã chọn không bị ẩn
    if (item.product_id) {
        const selectedProd = eligibleProducts.value.find(p => p.id === item.product_id);
        if (selectedProd && !limited.some(p => p.id === selectedProd.id)) {
            limited.unshift(selectedProd);
        }
    }

    // Grouping
    const grouped = {};
    limited.forEach(p => {
        const catName = p.category?.name || p.category_name || 'Khác';
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(p);
    });
    
    // Áp dụng Sort cho từng Category nếu có
    for (const cat in grouped) {
        const sortDir = item.categorySorts[cat];
        if (sortDir === 'asc') {
            grouped[cat].sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
        } else if (sortDir === 'desc') {
            grouped[cat].sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
        }
    }

    return grouped;
};

// Khi chọn 1 sản phẩm
const selectProduct = async (index, productId) => {
    if (isProductAlreadySelected(productId, index)) return;
    
    comboItems.value[index].product_id = productId;
    comboItems.value[index].isDropdownOpen = false; // Đóng mượt mà
    
    await handleProductSelect(index, false);
};


// ============================================================================
// HÀM XỬ LÝ LẤY BIẾN THỂ TỪ CACHE TANSTACK
// ============================================================================
const handleProductSelect = async (index, isInit = false) => {
  const item = comboItems.value[index];

  if (!isInit) item.product_variant_id = null; 
  item.available_variants = [];
  
  if (!item.product_id) return;
  item.isLoadingVariants = true;
  
  try {
    const productData = await queryClient.ensureQueryData({
      queryKey: ['admin-product-detail', item.product_id],
      queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/products/${item.product_id}`, { headers: getHeaders() });
        return res.data?.data || null;
      },
      staleTime: 10 * 60 * 1000 // Cache variants 10 phút
    });

    if (productData && productData.variants) {
       item.available_variants = productData.variants;
    }
  } catch (error) { 
    console.error('Lỗi API lấy biến thể sản phẩm:', error); 
  } finally { 
    item.isLoadingVariants = false; 
  }
};


// ============================================================================
// ĐIỀN DỮ LIỆU VÀO FORM (Chỉ chạy 1 lần)
// ============================================================================
watch(comboData, async (c) => {
  if (c && !isFormInitialized.value) {
    form.value = {
        name: c.name, slug: c.slug, description: c.description || '',
        target_gender: c.target_gender, target_age_group: c.target_age_group || '', theme: c.theme || '',
        discount_type: c.discount_type, discount_value: parseFloat(c.discount_value), is_discount_stackable: !!c.is_discount_stackable,
        usage_limit: c.usage_limit || null,
        start_date: formatFromDBDate(c.start_date),
        end_date: formatFromDBDate(c.end_date),
        isActive: c.status === 'active',
        thumbnail_image: c.thumbnail_image
    };

    // KHỞI TẠO TẤT CẢ BIẾN STATE 
    comboItems.value = c.items.map(i => ({
        product_id: i.product_id,
        product_variant_id: i.product_variant_id,
        quantity: i.quantity,
        available_variants: [],
        isLoadingVariants: false,
        searchQuery: '',
        priceFilter: 'all',
        isDropdownOpen: false,
        collapsedCategories: {}, // Lưu trạng thái Collapsed
        categorySorts: {} // Lưu trạng thái Sort
    }));

    for (let i = 0; i < comboItems.value.length; i++) {
        await handleProductSelect(i, true);
    }
    
    isFormInitialized.value = true;
    setTimeout(() => loadFlatpickr(), 500);
  }
}, { immediate: true });


const isProductAlreadySelected = (productId, currentIndex) => {
    return comboItems.value.some((item, index) => item.product_id === productId && index !== currentIndex);
};

const originalTotal = computed(() => {
  let total = 0;
  comboItems.value.forEach(item => {
    if (item.product_id && eligibleProducts.value) {
      if (item.product_variant_id && item.available_variants.length > 0) {
        const variant = item.available_variants.find(v => v.id === item.product_variant_id);
        if (variant) { total += parseFloat(variant.price) * item.quantity; return; }
      }
      const product = eligibleProducts.value.find(p => p.id === item.product_id);
      if (product) total += parseFloat(product.base_price) * item.quantity;
    }
  });
  return total;
});

const finalEstimatedPrice = computed(() => {
  let final = originalTotal.value;
  let discountVal = parseFloat(form.value.discount_value) || 0;
  if (form.value.discount_type === 'percentage') {
    if (discountVal > 100) discountVal = 100;
    final = final - (final * (discountVal / 100));
  } else {
    final = final - discountVal;
    if (final < 0) final = 0;
  }
  return final;
});

const savingsPercentage = computed(() => {
  if (originalTotal.value === 0) return 0;
  const savings = originalTotal.value - finalEstimatedPrice.value;
  return Math.round((savings / originalTotal.value) * 100);
});

// Chỉnh sửa Format tiền theo đúng chuẩn đơn giản: 100.000 VNĐ
const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
};

const generateSlug = () => {
  let s = form.value.name.toLowerCase();
  s = removeAccents(s); // Dùng lại hàm removeAccents cho nhất quán
  form.value.slug = s.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-\-+/g, '-');
};

const handleThumbnailUpload = (e) => {
  const f = e.target.files[0];
  if(f) { 
      if(f.size > 15 * 1024 * 1024) { Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error'); return; }
      thumbnailFile.value = f; 
      thumbnailPreview.value = URL.createObjectURL(f); 
  }
};

const addItemRow = () => comboItems.value.push({ 
    product_id: '', product_variant_id: null, quantity: 1, 
    available_variants: [], isLoadingVariants: false,
    searchQuery: '', priceFilter: 'all', isDropdownOpen: false,
    collapsedCategories: {}, categorySorts: {} 
});

const removeItemRow = (index) => { if (comboItems.value.length <= 2) Swal.fire('Chú ý', 'Combo phải chứa ít nhất 2 sản phẩm!', 'warning'); else comboItems.value.splice(index, 1); };

const loadFlatpickr = () => {
  if (!document.querySelector('#fp-css')) {
    const link = document.createElement('link');
    link.id = 'fp-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
    document.head.appendChild(link);
  }

  if (!window.flatpickr) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
    script.onload = initPickers;
    document.head.appendChild(script);
  } else {
    initPickers();
  }
};

const initPickers = () => {
  const config = {
    enableTime: true,
    time_24hr: true,
    dateFormat: "Y-m-d H:i",
    disableMobile: true,
  };
  try {
    window.flatpickr("#start_date", { ...config, onChange: (dates, str) => form.value.start_date = str });
    window.flatpickr("#end_date", { ...config, onChange: (dates, str) => form.value.end_date = str });
  } catch (e) {
    console.warn("Flatpickr failed to init, fallback to native datetime-local");
  }
};


// ============================================================================
// TANSTACK MUTATION: XỬ LÝ CẬP NHẬT COMBO
// ============================================================================
const updateMutation = useMutation({
  mutationFn: async (formData) => {
    return axios.post(`${API_URL}/admin/combos/${comboId}`, formData, { headers: getHeaders() });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
    queryClient.invalidateQueries({ queryKey: ['admin-combo', comboId] });

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 }).then(() => {
        router.push({ name: 'admin-combos' }).catch(() => {});
    });
  },
  onError: (error) => {
    const errorMsg = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join('\n') : 'Lỗi Server';
    Swal.fire('Lỗi Cập nhật', errorMsg, 'error');
  }
});

const submitCombo = () => {
  const hasEmptyProduct = comboItems.value.some(item => !item.product_id);
  if (hasEmptyProduct) { Swal.fire('Lỗi', 'Vui lòng chọn Sản phẩm cho tất cả các dòng.', 'error'); return; }
  if (form.value.discount_type === 'percentage' && form.value.discount_value > 100) { Swal.fire('Lỗi', 'Giảm giá tối đa 100%', 'error'); return; }

  const formData = new FormData();
  formData.append('_method', 'PUT'); 
  
  formData.append('name', form.value.name);
  formData.append('slug', form.value.slug);
  if(form.value.description) formData.append('description', form.value.description);
  formData.append('target_gender', form.value.target_gender);
  if(form.value.target_age_group) formData.append('target_age_group', form.value.target_age_group);
  if(form.value.theme) formData.append('theme', form.value.theme);
  formData.append('discount_type', form.value.discount_type);
  formData.append('discount_value', form.value.discount_value);
  formData.append('is_discount_stackable', form.value.is_discount_stackable ? 1 : 0);
  
  if (form.value.usage_limit) formData.append('usage_limit', form.value.usage_limit);
  
  if (form.value.start_date) formData.append('start_date', formatToDBDate(form.value.start_date));
  if (form.value.end_date) formData.append('end_date', formatToDBDate(form.value.end_date));

  formData.append('status', form.value.isActive ? 'active' : 'hidden');
  
  if (thumbnailFile.value) formData.append('thumbnail_image', thumbnailFile.value);
  
  const cleanItems = comboItems.value.map(i => ({
      product_id: i.product_id,
      product_variant_id: i.product_variant_id,
      quantity: i.quantity
  }));
  formData.append('items_data', JSON.stringify(cleanItems));

  updateMutation.mutate(formData);
};
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.border-brand { border-color: #009981 !important; }

/* FIX HIỂN THỊ CHỮ TRONG NỀN TỐI TOÀN CỤC */
.btn-brand { background-color: #009981; color: white !important; border: none; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; color: white !important; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; background: transparent; }
.btn-outline-brand:hover { background-color: #009981; color: white; }

.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.cursor-pointer { cursor: pointer; }
.hover-bg-danger:hover { color: #dc3545 !important; background-color: #fff5f5; border-radius: 4px; }
.hover-brand:hover { color: #009981 !important; }

/* CSS CHI TIẾT CHO CUSTOM SELECT DROPDOWN */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #009981; }
.dropdown-hover:hover { background-color: #f8f9fa; cursor: pointer; }

/* GHI ĐÈ MÀU XANH & ÉP MÀU CHỮ TRẮNG CHO LỊCH FLATPICKR ĐỂ ĐỒNG BỘ THEME THINKHUB */
:deep(.flatpickr-calendar) { box-shadow: 0 15px 30px rgba(0,0,0,0.1); border: none; border-radius: 12px; font-family: inherit; }
:deep(.flatpickr-day.selected),
:deep(.flatpickr-day.startRange),
:deep(.flatpickr-day.endRange),
:deep(.flatpickr-day.selected:focus),
:deep(.flatpickr-day.selected:hover) { background: #009981 !important; border-color: #009981 !important; color: white !important; }
:deep(.flatpickr-time input:hover),
:deep(.flatpickr-time input:focus) { background: #e6f5f2; }

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
@keyframes shine { to { background-position: 200% center; } }
</style>