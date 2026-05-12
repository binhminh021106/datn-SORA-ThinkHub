<template>
  <div class="combo-index-wrapper pb-5 mb-5">
    
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải danh sách Combo...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Combo</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3">
          <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="fetchData(true)">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
          <router-link :to="{ name: 'admin-combos-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
            <i class="bi bi-plus-circle me-1"></i> Thêm Combo
          </router-link>
        </div>
      </div>

      <div class="mb-3">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ combos.filter(c => !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'active' }" @click.prevent="switchTab('active')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đang hoạt động
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">{{ combos.filter(c => c.status === 'active' && !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'hidden' }" @click.prevent="switchTab('hidden')">
              <i class="bi bi-eye-slash-fill me-2 text-secondary"></i> Đang ẩn
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'hidden'}">{{ combos.filter(c => c.status === 'hidden' && !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'deleted' }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2"></i> Đã xóa
              <span class="badge ms-2 rounded-pill bg-danger text-white">{{ combos.filter(c => c.deleted_at).length }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="d-flex flex-wrap gap-3 mb-4">
        <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
          <span class="text-muted small fw-semibold me-2"><i class="bi bi-gender-ambiguous text-brand"></i> Đối tượng:</span>
          <select class="form-select form-select-sm border-0 bg-transparent fw-bold p-0 pe-4 cursor-pointer" style="width: auto; box-shadow: none;" v-model="selectedGenderFilter">
            <option value="all">Tất cả</option>
            <option value="female">Nữ giới</option>
            <option value="male">Nam giới</option>
            <option value="couple">Cặp đôi</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
            <i class="bi bi-list-ul me-2"></i>Danh sách Combo
            <div v-if="isSilentLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></div>
          </h6>
          <div class="search-box position-relative" style="width: 300px; max-width: 100%;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên Combo, chủ đề...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1000px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 30%;">Thông tin Combo</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 12%;">Số lượng món</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 18%;">Chiết khấu</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 20%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 20%;">Thao tác</th>
                </tr>
              </thead>
              <tbody :class="{'pe-none': isSilentLoading}">
                <tr v-if="paginatedCombos.length === 0 && !isSilentLoading && !isTableLoading">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                  </td>
                </tr>
                <tr v-else v-for="combo in paginatedCombos" :key="combo.id" :class="{'bg-light opacity-75': combo.deleted_at}">
                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                      <div class="position-relative d-inline-block me-3 shadow-sm border rounded-3 overflow-hidden bg-white flex-shrink-0" style="width: 60px; height: 60px;">
                        <img :src="getThumbnail(combo.thumbnail_image)" class="w-100 h-100 object-fit-cover">
                      </div>
                      <div class="overflow-hidden">
                        <div class="fw-bold text-dark fs-6 mb-1 text-truncate" :title="combo.name">{{ combo.name }}</div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-light text-secondary border" v-if="combo.theme"><i class="bi bi-bookmark-star me-1"></i>{{ combo.theme }}</span>
                            <span class="badge bg-light text-secondary border"><i class="bi bi-gender-ambiguous me-1"></i>{{ getGenderLabel(combo.target_gender) }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-4 text-center">
                    <span class="badge bg-opacity-10 text-brand border border-brand px-3 py-2">
                      <i class="bi bi-box-seam me-1"></i> {{ combo.items_count || 0 }} món
                    </span>
                  </td>
                  
                  <td class="px-4">
                    <div class="fw-bold text-danger mb-1">
                      Giảm: {{ combo.discount_type === 'percentage' ? combo.discount_value + '%' : formatCurrency(combo.discount_value) }}
                    </div>
                    <div class="small fw-semibold" :class="combo.is_discount_stackable ? 'text-success' : 'text-muted'">
                      <i class="bi" :class="combo.is_discount_stackable ? 'bi-check2-circle' : 'bi-dash-circle'"></i> 
                      {{ combo.is_discount_stackable ? 'Cho phép dùng Voucher' : 'Không cộng dồn KM' }}
                    </div>
                  </td>
                  
                  <td class="px-4 text-center">
                    <span v-if="combo.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i class="bi bi-trash3-fill"></i> Đã xóa</span>
                    <div v-else class="d-flex align-items-center justify-content-center gap-1 flex-nowrap w-100">
                      <select class="form-select form-select-sm border shadow-sm fw-semibold cursor-pointer flex-shrink-0" 
                              style="width: 125px; font-size: 0.8rem;"
                              :class="getStatusSelectClass(combo.localStatus || combo.status)"
                              v-model="combo.localStatus"
                              @change="checkStatusChange(combo)"
                              :disabled="combo.isUpdatingStatus">
                        <option value="active">Đang hoạt động</option>
                        <option value="hidden">Đang ẩn</option>
                      </select>
                      
                      <div class="d-flex align-items-center justify-content-start" style="min-width: 55px; height: 28px; flex-shrink: 0 !important;">
                        <div v-if="combo.isUpdatingStatus" class="spinner-border text-brand ms-1" style="width: 1.25rem; height: 1.25rem; border-width: 0.15em;" role="status"></div>
                        <template v-else-if="combo.isStatusChanged">
                          <button @click="saveComboStatus(combo)" class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Lưu">
                            <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                          <button @click="cancelStatusChange(combo)" class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Hủy">
                            <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                        </template>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <button class="btn btn-sm btn-light text-info me-2 shadow-sm border" @click="openQuickView(combo.id)"><i class="bi bi-eye"></i></button>
                    <template v-if="!combo.deleted_at">
                      <router-link :to="{ name: 'admin-combos-edit', params: {id: combo.id} }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border"><i class="bi bi-pencil-square"></i></router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(combo.id, combo.name)"><i class="bi bi-trash"></i></button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-light text-success shadow-sm border" @click="restoreCombo(combo.id)"><i class="bi bi-arrow-counterclockwise"></i></button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="totalPages > 1 && !isTableLoading">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedCombos.length) }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"><button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- MODAL QUICK VIEW COMBO (ĐÃ THÊM GIÁ TỔNG VÀ BẢNG TÍNH) -->
    <div class="modal fade" id="quickViewComboModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom pb-3 bg-light rounded-top-4">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-box2-heart text-brand me-2"></i>Chi tiết Combo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-0" v-if="selectedCombo">
            <!-- Header Modal -->
            <div class="p-3 bg-white border-bottom d-flex align-items-center gap-3">
              <img :src="getThumbnail(selectedCombo.thumbnail_image)" class="rounded border object-fit-cover shadow-sm" style="width: 80px; height: 80px;">
              <div class="flex-grow-1">
                 <h5 class="mb-1 fw-bold text-dark">{{ selectedCombo.name }}</h5>
                 <div class="text-muted small mb-2">{{ selectedCombo.description || 'Không có mô tả' }}</div>
                 
                 <!-- Tags Giới hạn & Thời gian -->
                 <div class="d-flex flex-wrap gap-2">
                    <span class="badge bg-danger">Giảm: {{ selectedCombo.discount_type === 'percentage' ? selectedCombo.discount_value + '%' : formatCurrency(selectedCombo.discount_value) }}</span>
                    <span v-if="selectedCombo.usage_limit" class="badge border border-info text-info"><i class="bi bi-person-fill me-1"></i>Giới hạn: {{ selectedCombo.usage_limit }} lượt mua</span>
                    <span v-else class="badge border border-success text-success"><i class="bi bi-infinity me-1"></i>Không giới hạn lượt mua</span>
                 </div>
                 <div class="small mt-2 text-muted fw-semibold" v-if="selectedCombo.start_date || selectedCombo.end_date">
                    <i class="bi bi-clock-history me-1"></i>
                    {{ formatDateTime(selectedCombo.start_date) || 'Bất kỳ lúc nào' }} 
                    <i class="bi bi-arrow-right mx-1"></i> 
                    {{ formatDateTime(selectedCombo.end_date) || 'Không có ngày kết thúc' }}
                 </div>
              </div>
            </div>
            
            <div class="p-3 bg-light">
              <h6 class="fw-bold text-dark mb-3">Sản phẩm có trong gói ({{ selectedCombo.items?.length || 0 }} món):</h6>
              <div class="table-responsive">
                <table class="table table-bordered bg-white shadow-sm mb-0 align-middle small">
                  <thead class="table-light">
                    <tr>
                      <th class="px-3">Sản phẩm (Bản gốc)</th>
                      <th class="px-3 text-center">Biến thể áp dụng</th>
                      <th class="px-3 text-center">SL</th>
                      <!-- THÊM CỘT GIÁ Ở ĐÂY -->
                      <th class="px-3 text-end">Đơn giá (Gốc)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedCombo.items" :key="item.id">
                      <td class="px-3">
                        <div class="d-flex align-items-center gap-2">
                          <img :src="getThumbnail(item.product?.thumbnail_image)" class="rounded border" style="width: 40px; height: 40px; object-fit: cover;">
                          <div class="fw-semibold">{{ item.product?.name }}</div>
                        </div>
                      </td>
                      <td class="px-3 text-center">
                        <span v-if="item.product_variant_id" class="badge bg-light text-dark border">
                          SKU: {{ item.variant?.sku }}
                        </span>
                        <span v-else class="badge bg-success bg-opacity-10 text-success border border-success">
                          Khách tự chọn
                        </span>
                      </td>
                      <td class="px-3 text-center fw-bold">{{ item.quantity }}</td>
                      <td class="px-3 text-end fw-bold text-secondary">{{ formatCurrency(getItemPrice(item)) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- BẢNG TÍNH TỔNG GIÁ COMBO -->
              <div class="bg-white border rounded-3 p-3 mt-3 shadow-sm ms-auto" style="max-width: 350px;">
                  <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted fw-semibold">Tổng giá gốc ước tính:</span>
                      <strong class="text-dark">{{ formatCurrency(quickViewOriginalTotal) }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2 text-danger">
                      <span class="fw-semibold">Trừ khuyến mãi Combo:</span>
                      <strong>- {{ formatCurrency(quickViewDiscountAmount) }}</strong>
                  </div>
                  <div class="d-flex justify-content-between pt-2 border-top mt-2">
                      <span class="fw-bold text-dark">Giá Combo xuất bán:</span>
                      <strong class="fs-5 text-brand">{{ formatCurrency(quickViewFinalPrice) }}</strong>
                  </div>
              </div>

            </div>
          </div>
          <div class="modal-footer bg-light border-top-0 rounded-bottom-4">
             <button type="button" class="btn btn-outline-brand rounded-pill px-4 fw-bold" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const combos = ref([]);

const isFirstLoad = ref(true);
const isTableLoading = ref(false);
const isSilentLoading = ref(false);

const searchQuery = ref('');
const activeTab = ref('all');
const selectedGenderFilter = ref('all');

const currentPage = ref(1);
const itemsPerPage = 8; 

const selectedCombo = ref(null);
let quickViewModalInstance = null;
let isUnmounted = false;

onBeforeUnmount(() => {
  isUnmounted = true;
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
  document.body.style = '';
});

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatCurrency = (val) => { 
  if (val === null || val === undefined || isNaN(val)) return '---'; 
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val); 
};
const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('vi-VN')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const getThumbnail = (url) => url ? `${API_URL}/storage/${url}` : 'https://placehold.co/150x150/e0e0e0/6c757d?text=No+Image'; 

const getGenderLabel = (val) => {
    const map = { 'male': 'Nam', 'female': 'Nữ', 'unisex': 'Unisex', 'couple': 'Cặp đôi' };
    return map[val] || val;
};

const checkStatusChange = (combo) => { combo.isStatusChanged = (combo.localStatus !== combo.status); };
const cancelStatusChange = (combo) => { combo.localStatus = combo.status; combo.isStatusChanged = false; };

const saveComboStatus = async (combo) => {
  combo.isUpdatingStatus = true;
  try {
    const res = await axios.patch(`${API_URL}/admin/combos/${combo.id}/status`, { status: combo.localStatus }, { headers: getHeaders() });
    combo.status = combo.localStatus; 
    combo.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
  } catch (error) { 
    cancelStatusChange(combo);
    Swal.fire('Lỗi', 'Không thể cập nhật trạng thái', 'error');
  } finally {
    combo.isUpdatingStatus = false;
  }
};

const getStatusSelectClass = (status) => {
  const map = { 
    'active': 'text-success border-success bg-success bg-opacity-10', 
    'hidden': 'text-secondary border-secondary bg-secondary bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

const fetchData = async (silent = false) => {
  if (silent) isSilentLoading.value = true;
  else if (!isFirstLoad.value) isTableLoading.value = true;
  
  try {
    const res = await axios.get(`${API_URL}/admin/combos`, { headers: getHeaders() });
    if (isUnmounted) return;
    
    combos.value = res.data.data.map(c => ({
      ...c,
      localStatus: c.status, 
      isStatusChanged: false,
      isUpdatingStatus: false
    }));
  } catch (err) {
    console.error('Lỗi Load Combo:', err);
  } finally { 
    if(!isUnmounted) { isFirstLoad.value = false; isTableLoading.value = false; isSilentLoading.value = false; }
  }
};

const openQuickView = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/admin/combos/${id}`, { headers: getHeaders() });
    if(!isUnmounted) {
      selectedCombo.value = res.data.data;
      if(!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewComboModal'));
      quickViewModalInstance.show();
    }
  } catch(e) {}
};

const getItemPrice = (item) => {
    if (item.product_variant_id && item.variant) {
        return parseFloat(item.variant.price);
    }
    return item.product ? parseFloat(item.product.base_price) : 0;
};

const quickViewOriginalTotal = computed(() => {
    if (!selectedCombo.value || !selectedCombo.value.items) return 0;
    return selectedCombo.value.items.reduce((total, item) => {
        return total + (getItemPrice(item) * item.quantity);
    }, 0);
});

const quickViewDiscountAmount = computed(() => {
    if (!selectedCombo.value) return 0;
    const discountVal = parseFloat(selectedCombo.value.discount_value) || 0;
    if (selectedCombo.value.discount_type === 'percentage') {
        return quickViewOriginalTotal.value * (Math.min(discountVal, 100) / 100);
    }
    return discountVal;
});

const quickViewFinalPrice = computed(() => {
    const final = quickViewOriginalTotal.value - quickViewDiscountAmount.value;
    return final > 0 ? final : 0;
});

const switchTab = (tabId) => { activeTab.value = tabId; currentPage.value = 1; };

const processedCombos = computed(() => {
  let result = combos.value;
  if (activeTab.value === 'deleted') { result = result.filter(r => r.deleted_at); } 
  else {
    result = result.filter(r => !r.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(r => r.status === activeTab.value);
  }
  if (selectedGenderFilter.value !== 'all') result = result.filter(r => r.target_gender === selectedGenderFilter.value);
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(r => (r.name?.toLowerCase().includes(q)) || (r.theme?.toLowerCase().includes(q)));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedCombos.value.length / itemsPerPage) || 1);
const paginatedCombos = computed(() => { const start = (currentPage.value - 1) * itemsPerPage; return processedCombos.value.slice(start, start + itemsPerPage); });

const confirmDelete = (id, name) => {
  Swal.fire({ title: 'Xóa Combo?', text: `Gói "${name}" sẽ bị chuyển vào thùng rác!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý' }).then(async (result) => {
    if (result.isConfirmed) {
      isSilentLoading.value = true;
      try {
        await axios.delete(`${API_URL}/admin/combos/${id}`, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa Combo', showConfirmButton: false, timer: 1500 });
        fetchData(true); 
      } catch(e) { Swal.fire('Lỗi', 'Không thể xóa', 'error'); isSilentLoading.value = false; }
    }
  });
};

const restoreCombo = (id) => {
  Swal.fire({ title: 'Khôi phục?', text: "Khôi phục Combo này?", icon: 'info', showCancelButton: true, confirmButtonColor: '#009981', confirmButtonText: 'Đồng ý' }).then(async (result) => {
    if (result.isConfirmed) {
      isSilentLoading.value = true;
      try {
          await axios.post(`${API_URL}/admin/combos/${id}/restore`, {}, { headers: getHeaders() });
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Khôi phục thành công', showConfirmButton: false, timer: 1500 });
          fetchData(true); 
      } catch(e) { Swal.fire('Lỗi', 'Không thể khôi phục', 'error'); isSilentLoading.value = false; }
    }
  });
};

onMounted(() => fetchData());
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; } 
.btn-outline-brand:hover { background-color: #009981; color: white; }

.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }

.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

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