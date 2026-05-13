<template>
  <div class="coupon-index-wrapper pb-5 mb-5">
    
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <!-- Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Danh Sách Mã Giảm Giá</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>

          <router-link :to="{ name: 'admin-coupon-create' }" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm">
            <i class="bi bi-plus-circle-fill me-1"></i> Thêm Mã Mới
          </router-link>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden custom-scrollbar-x pb-1">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ coupons.filter(c => !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'active' }" @click.prevent="switchTab('active')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Hoạt động
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">{{ coupons.filter(c => c.status === 'active' && !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'inactive' }" @click.prevent="switchTab('inactive')">
              <i class="bi bi-pause-circle-fill me-2 text-warning"></i> Tạm dừng
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'inactive'}">{{ coupons.filter(c => c.status === 'inactive' && !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'deleted' }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2 text-danger"></i> Đã xóa
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'deleted'}">{{ coupons.filter(c => c.deleted_at).length }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Bảng Dữ liệu -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi bi-ticket-perforated text-brand me-1"></i> Danh sách hiển thị
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <!-- Search box -->
            <div class="search-box position-relative" style="width: 280px; max-width: 100%;">
              <input type="text" class="form-control form-control-sm rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên hoặc mã code...">
              <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1100px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Mã & Tên Chương Trình</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 15%;">Mức Giảm</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 17%;">Lượt dùng</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 15%;">Hạn sử dụng</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 15%;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <div class="spinner-border spinner-border-sm text-brand mb-2" role="status"></div>
                    <div class="small fw-semibold">Đang tải dữ liệu...</div>
                  </td>
                </tr>
                <tr v-else-if="displayCoupons.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                  </td>
                </tr>
                <tr v-else v-for="coupon in displayCoupons" :key="coupon.id" 
                    :class="{'bg-light opacity-75': coupon.deleted_at || coupon.status === 'inactive'}">
                  
                  <!-- Tên và Code (KHỐI MÀU XANH) -->
                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                      <div class="bg-brand text-white fw-bold rounded-3 text-center me-3 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style="width: 85px; height: 50px; letter-spacing: 1px;">
                        {{ coupon.code }}
                      </div>
                      <div class="overflow-hidden">
                        <h6 class="mb-0 fw-bold text-dark text-truncate" :title="coupon.name">{{ coupon.name }}</h6>
                        <small class="text-muted d-block mt-1 text-truncate">Đơn tối thiểu: {{ formatCurrency(coupon.min_spend) }}</small>
                      </div>
                    </div>
                  </td>

                  <!-- Mức giảm -->
                  <td class="px-4">
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary fs-6">
                      {{ coupon.type === 'percentage' ? `Giảm ${coupon.value}%` : `Giảm ${formatCurrency(coupon.value)}` }}
                    </span>
                  </td>

                  <!-- Lượt dùng -->
                  <td class="px-4">
                    <div class="d-flex flex-column">
                      <div class="d-flex justify-content-between small fw-bold mb-1">
                        <span>{{ coupon.usage_count || 0 }} / {{ coupon.usage_limit }}</span>
                        <span :class="getUsageColorClass(coupon)">
                          {{ Math.round(((coupon.usage_count || 0) / coupon.usage_limit) * 100) }}%
                        </span>
                      </div>
                      <div class="progress" style="height: 5px;">
                        <div class="progress-bar" :class="getUsageProgressBarClass(coupon)" role="progressbar" 
                             :style="{ width: `${((coupon.usage_count || 0) / coupon.usage_limit) * 100}%` }"></div>
                      </div>
                      <small class="text-muted mt-1" style="font-size: 0.7rem;">Tối đa {{ coupon.usage_limit_per_user }}/khách</small>
                    </div>
                  </td>

                  <!-- Hạn sử dụng -->
                  <td class="px-4">
                    <div class="small fw-semibold" :class="isExpired(coupon.expires_at) && !coupon.deleted_at ? 'text-danger' : 'text-dark'">
                      {{ formatDate(coupon.expires_at) }}
                    </div>
                    <small v-if="isExpired(coupon.expires_at) && !coupon.deleted_at" class="badge bg-danger bg-opacity-10 text-danger mt-1">Đã hết hạn</small>
                  </td>

                  <!-- Cột Trạng thái (Inline Edit) -->
                  <td class="px-4 text-center">
                    <span v-if="coupon.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i class="bi bi-trash3-fill"></i> Đã xóa</span>
                    <div v-else class="d-flex align-items-center justify-content-center gap-1">
                      <select class="form-select form-select-sm border shadow-sm fw-semibold" 
                              style="width: 120px; font-size: 0.8rem;"
                              :class="getStatusSelectClass(coupon.localStatus || coupon.status)"
                              v-model="coupon.localStatus"
                              @change="checkStatusChange(coupon)"
                              :disabled="coupon.isUpdatingStatus">
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                      </select>
                      
                      <button v-if="coupon.isStatusChanged && !coupon.isUpdatingStatus" @click="saveCouponStatus(coupon)" class="btn btn-sm btn-success rounded-circle shadow-sm px-2 py-1" title="Lưu">
                        <i class="bi bi-check-lg fw-bold"></i>
                      </button>
                      <button v-if="coupon.isStatusChanged && !coupon.isUpdatingStatus" @click="cancelStatusChange(coupon)" class="btn btn-sm btn-light rounded-circle shadow-sm px-2 py-1 text-danger border" title="Hủy">
                        <i class="bi bi-x-lg fw-bold"></i>
                      </button>
                      <span v-if="coupon.isUpdatingStatus" class="spinner-border spinner-border-sm text-brand ms-1"></span>
                    </div>
                  </td>

                  <!-- Thao tác -->
                  <td class="px-4 text-center">
                    <button class="btn btn-sm btn-light text-info me-1 shadow-sm border" title="Xem chi tiết" @click="openQuickView(coupon)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <template v-if="!coupon.deleted_at">
                      <router-link :to="{ name: 'admin-coupon-edit', params: { id: coupon.id } }" class="btn btn-sm btn-light text-primary me-1 shadow-sm border" title="Chỉnh sửa">
                        <i class="bi bi-pencil-square"></i>
                      </router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(coupon.id, coupon.code)" title="Xóa">
                        <i class="bi bi-trash"></i>
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Phân trang -->
      <div class="d-flex justify-content-between align-items-center" v-if="totalPages > 1">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedCoupons.length) }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"><button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- POPUP QUICK VIEW -->
    <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="fw-bold text-dark"><i class="bi bi-ticket-detailed-fill text-brand me-2"></i>Chi Tiết Coupon</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedCoupon">
            
            <div class="text-center mb-4">
              <div class="border border-dashed border-brand bg-brand bg-opacity-10 text-brand fw-bold px-4 py-3 rounded-3 d-inline-block fs-4 mb-2" style="letter-spacing: 2px;">
                {{ selectedCoupon.code }}
              </div>
              <h5 class="fw-bold mb-1">{{ selectedCoupon.name }}</h5>
              <span class="badge px-3 py-2 rounded-pill mt-2" :class="selectedCoupon.status === 'active' ? 'bg-success text-white' : 'bg-warning text-dark'">
                {{ selectedCoupon.status === 'active' ? 'Đang hoạt động' : 'Đang tạm dừng' }}
              </span>
            </div>

            <div class="bg-light p-3 rounded-4 shadow-sm border border-light-subtle small mb-3">
              <div class="row mb-2 pb-2 border-bottom">
                <div class="col-6 text-muted fw-semibold">Loại giảm:</div>
                <div class="col-6 fw-bold text-end">{{ selectedCoupon.type === 'percentage' ? 'Phần trăm (%)' : 'Cố định (VNĐ)' }}</div>
              </div>
              <div class="row mb-2 pb-2 border-bottom">
                <div class="col-6 text-muted fw-semibold">Mức giảm:</div>
                <div class="col-6 fw-bold text-end text-primary fs-6">{{ selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : formatCurrency(selectedCoupon.value) }}</div>
              </div>
              <div class="row mb-2 pb-2 border-bottom">
                <div class="col-6 text-muted fw-semibold">Đơn tối thiểu:</div>
                <div class="col-6 fw-bold text-end">{{ formatCurrency(selectedCoupon.min_spend) }}</div>
              </div>
              <div class="row mb-2 pb-2 border-bottom">
                <div class="col-6 text-muted fw-semibold">Hạn sử dụng:</div>
                <div class="col-6 fw-bold text-end" :class="{'text-danger': isExpired(selectedCoupon.expires_at)}">{{ formatDate(selectedCoupon.expires_at) }}</div>
              </div>
              <div class="row mb-2 pb-2 border-bottom">
                <div class="col-6 text-muted fw-semibold">Lượt dùng:</div>
                <div class="col-6 fw-bold text-end">{{ selectedCoupon.usage_count || 0 }} / {{ selectedCoupon.usage_limit }}</div>
              </div>
              <div class="row">
                <div class="col-8 text-muted fw-semibold">Giới hạn mỗi User:</div>
                <div class="col-4 fw-bold text-end">{{ selectedCoupon.usage_limit_per_user }} lượt</div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios'; // Bỏ moment đi

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Khai báo Component name bằng multi-word để fix cảnh báo ESLint
defineOptions({
  name: 'CouponIndex'
});

const route = useRoute();
const coupons = ref([]);
const systemModules = ref([]);
const currentPageLevel = ref(null);
const isLoading = ref(true);
const isFirstLoad = ref(true); 
const searchQuery = ref('');
const activeTab = ref('active');
const currentPage = ref(1);
const itemsPerPage = 10;

const selectedCoupon = ref(null);
let quickViewModalInstance = null;

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

// Formatters
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Viết lại hàm formatDate và isExpired bằng JS Thuần (Khỏi cần dùng moment)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString; // Fallback nếu chuỗi lỗi

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const isExpired = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;
  return d < new Date();
};

const getUsageColorClass = (coupon) => {
  const percent = ((coupon.usage_count || 0) / coupon.usage_limit) * 100;
  if (percent >= 90) return 'text-danger';
  if (percent >= 70) return 'text-warning';
  return 'text-success';
};

const getUsageProgressBarClass = (coupon) => {
  const percent = ((coupon.usage_count || 0) / coupon.usage_limit) * 100;
  if (percent >= 90) return 'bg-danger';
  if (percent >= 70) return 'bg-warning';
  return 'bg-success';
};

const getLevelColor = (level) => {
  if(!level) return 'bg-secondary';
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

const fetchData = async () => {
  if (!isFirstLoad.value) isLoading.value = true;
  try {
    const [resCoupons, resModules] = await Promise.all([
      axios.get(`${API_URL}/admin/coupons`, { headers: getHeaders() }),
      axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() })
    ]);

    if (resCoupons.data) {
        let rawData = Array.isArray(resCoupons.data) ? resCoupons.data : (resCoupons.data.data || []);
        
        coupons.value = rawData.map(c => ({
          ...c, localStatus: c.status, isStatusChanged: false, isUpdatingStatus: false
        }));
    }
    if (resModules.data) {
      systemModules.value = resModules.data.data;
      const currentModule = systemModules.value.find(m => m.module_code === (route.meta?.moduleCode || 'admin_coupons'));
      if (currentModule) currentPageLevel.value = currentModule.required_level;
    }
  } catch (err) { 
      console.error('Lỗi khi tải dữ liệu:', err); 
  } finally { 
    isLoading.value = false;
    isFirstLoad.value = false;
  }
};

// ================= INLINE STATUS =================
const getStatusSelectClass = (status) => {
  const map = { 
    'active': 'text-success border-success bg-success bg-opacity-10', 
    'inactive': 'text-warning border-warning bg-warning bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

const checkStatusChange = (coupon) => { coupon.isStatusChanged = (coupon.localStatus !== coupon.status); };
const cancelStatusChange = (coupon) => { coupon.localStatus = coupon.status; coupon.isStatusChanged = false; };

const saveCouponStatus = async (coupon) => {
  coupon.isUpdatingStatus = true;
  
  // FIXED: Chỉ gửi duy nhất cột Status lên để tránh Request Rule ở Laravel chửi lỗi trường expires_at phải sau today (khi edit coupon hết hạn)
  const payload = {
    status: coupon.localStatus
  };

  try {
    // FIXED lỗi no-unused-vars bằng cách bỏ khởi tạo biến const res =
    await axios.put(`${API_URL}/admin/coupons/${coupon.id}`, payload, {
        headers: getHeaders()
    });
    
    coupon.status = coupon.localStatus; 
    coupon.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
  } catch (err) { 
    console.error('Lỗi cập nhật trạng thái:', err);
    cancelStatusChange(coupon); 
    Swal.fire('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái', 'error'); 
  } finally { 
    coupon.isUpdatingStatus = false; 
  }
};

const switchTab = (tabId) => { 
  activeTab.value = tabId; 
  currentPage.value = 1; 
};

const openQuickView = (coupon) => {
  selectedCoupon.value = coupon;
  if (!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewModal'));
  quickViewModalInstance.show();
};

const processedCoupons = computed(() => {
  let result = coupons.value;
  if (activeTab.value === 'deleted') { result = result.filter(c => c.deleted_at); } 
  else {
    result = result.filter(c => !c.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(c => c.status === activeTab.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c => (c.name?.toLowerCase().includes(q)) || (c.code?.toLowerCase().includes(q)));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedCoupons.value.length / itemsPerPage) || 1);

const displayCoupons = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage; 
  return processedCoupons.value.slice(start, start + itemsPerPage);
});

const confirmDelete = (id, code) => {
  Swal.fire({ title: 'Xóa mã giảm giá?', text: `Mã "${code}" sẽ bị xóa khỏi hệ thống!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý xóa' }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        await axios.delete(`${API_URL}/admin/coupons/${id}`, { headers: getHeaders() });
        Swal.fire({icon: 'success', title: 'Đã xóa', timer: 1500, showConfirmButton: false});
        fetchData();
      } catch (err) {
        console.error('Lỗi khi xóa:', err);
        isLoading.value = false;
        Swal.fire('Lỗi', err.response?.data?.message || 'Không thể xóa', 'error');
      }
    }
  });
};

onMounted(() => fetchData());
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }
.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; } .border-brand { border-color: #009981 !important; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.border-dashed { border-style: dashed !important; border-width: 2px !important; }

.custom-scrollbar-x::-webkit-scrollbar { height: 4px; }
.custom-scrollbar-x::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
</style>