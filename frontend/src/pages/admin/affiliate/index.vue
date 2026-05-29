<template>
  <div class="admin-affiliate-wrapper pb-5 mb-5">
    
    <div v-if="isLoading && applications.length === 0" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản Lý Đăng Ký Affiliate</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <button @click="fetchApplications(true)" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm" :disabled="isFetching">
            <i class="bi bi-arrow-clockwise me-1" :class="{'spin': isFetching}"></i> Làm mới dữ liệu
          </button>
        </div>
      </div>

      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden custom-scrollbar-x pb-1">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ countByTab('all') }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'pending' }" @click.prevent="switchTab('pending')">
              <i class="bi bi-hourglass-split me-2 text-warning"></i> Đang chờ
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'pending'}">{{ countByTab('pending') }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'approved' }" @click.prevent="switchTab('approved')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đã duyệt
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'approved'}">{{ countByTab('approved') }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'rejected' }" @click.prevent="switchTab('rejected')">
              <i class="bi bi-x-circle-fill me-2 text-danger"></i> Từ chối
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'rejected'}">{{ countByTab('rejected') }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-secondary" href="#" :class="{ 'active-tab': activeTab === 'revoked' }" @click.prevent="switchTab('revoked')">
              <i class="bi bi-slash-circle-fill me-2"></i> Đã hủy
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'revoked'}">{{ countByTab('revoked') }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi bi-person-lines-fill text-brand me-1"></i> Danh sách hiển thị
            <span v-if="isFetching" class="spinner-border spinner-border-sm text-brand ms-2" title="Đang đồng bộ dữ liệu..."></span>
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <div class="search-box position-relative" style="width: 280px; max-width: 100%;">
              <input type="text" class="form-control form-control-sm rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên, email hoặc SĐT...">
              <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1100px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Thông Tin Người Nộp</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 18%;">Link Quảng Bá</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 22%;">Lời Giới Thiệu</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 12%;">Ngày Nộp</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 12%;">Trạng Thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 11%;">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="isFetching && displayApps.length === 0">
                  <tr v-for="i in 5" :key="'skel'+i" class="placeholder-glow">
                    <td class="px-4 py-3"><div class="w-100"><span class="placeholder col-10 rounded mb-1"></span><br><span class="placeholder col-6 rounded"></span></div></td>
                    <td class="px-4"><span class="placeholder col-10 rounded mb-1"></span></td>
                    <td class="px-4"><span class="placeholder col-12 rounded mb-1"></span><br><span class="placeholder col-8 rounded" style="height: 10px;"></span></td>
                    <td class="px-4"><span class="placeholder col-8 rounded mb-1"></span></td>
                    <td class="px-4 text-center"><span class="placeholder col-10 rounded-pill" style="height: 25px;"></span></td>
                    <td class="px-4 text-center"><span class="placeholder col-8 rounded"></span></td>
                  </tr>
                </template>

                <tr v-else-if="displayApps.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu phù hợp.
                  </td>
                </tr>

                <tr v-else v-for="app in displayApps" :key="app.id" :class="{'bg-light bg-opacity-50': app.status === 'revoked'}">
                  
                  <td class="px-4 py-3">
                    <div class="overflow-hidden">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge bg-light text-dark border border-secondary border-opacity-25 font-monospace text-uppercase shadow-sm">#{{ app.id }}</span>
                        <h6 class="mb-0 fw-bold text-dark text-truncate" :class="{'text-decoration-line-through text-muted': app.status === 'revoked'}">
                          {{ app.user?.fullName || 'Khách vãng lai' }}
                        </h6>
                      </div>
                      <small class="text-muted d-block text-truncate"><i class="bi bi-envelope me-1"></i>{{ app.user?.email }}</small>
                      <small class="text-muted d-block text-truncate"><i class="bi bi-telephone me-1"></i>{{ app.user?.phone || 'Chưa cập nhật' }}</small>
                    </div>
                  </td>

                  <td class="px-4">
                    <a :href="app.social_links" target="_blank" class="text-brand text-decoration-none text-truncate d-inline-block w-100 fw-medium" title="Click để xem">
                      <i class="bi bi-link-45deg me-1"></i>{{ app.social_links }}
                    </a>
                  </td>

                  <td class="px-4">
                    <span class="text-truncate-2 small text-secondary" :title="app.introduce_message">
                      {{ app.introduce_message }}
                    </span>
                  </td>

                  <td class="px-4">
                    <div class="small fw-semibold text-dark">
                      {{ formatDate(app.created_at) }}
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <span class="badge px-3 py-2 rounded-pill fs-7" :class="getStatusBadgeClass(app.status)">
                      {{ getStatusText(app.status) }}
                    </span>
                  </td>

                  <td class="px-4 text-center">
                    <div v-if="app.status === 'pending'" class="d-flex justify-content-center gap-1">
                      <button class="btn btn-sm btn-light text-success shadow-sm border" @click="approveApp(app.id)" title="Duyệt" :disabled="isActionLoading">
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="rejectApp(app.id)" title="Từ chối" :disabled="isActionLoading">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                    
                    <div v-else-if="app.status === 'approved'" class="d-flex justify-content-center gap-1">
                      <button class="btn btn-sm btn-light text-danger shadow-sm border px-3" @click="revokeApp(app.id)" title="Hủy tư cách" :disabled="isActionLoading">
                        <i class="bi bi-slash-circle me-1"></i> Hủy
                      </button>
                    </div>

                    <div v-else-if="app.status === 'rejected'" class="small text-danger fw-medium cursor-pointer" :title="app.admin_notes">
                      <i class="bi bi-info-circle me-1"></i>Lý do
                    </div>

                    <div v-else-if="app.status === 'revoked'" class="text-muted small">
                      <i class="bi bi-dash-circle"></i> Đã vô hiệu hóa
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center" v-if="totalPages > 1">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedApps.length) }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"><button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');
const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('access_token');

// --- STATE QUẢN LÝ DỮ LIỆU ---
const applications = ref([]);
const isLoading = ref(true); 
const isFetching = ref(false); 
const isActionLoading = ref(false); 

// --- STATE GIAO DIỆN LỌC & PHÂN TRANG ---
const activeTab = ref('all');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// --- API FETCH ---
const fetchApplications = async (silent = false) => {
  if (silent) isFetching.value = true;
  else isLoading.value = true;

  try {
    const res = await axios.get(`${API_BASE}/api/admin/affiliates/applications`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.data.success) {
      applications.value = res.data.data;
    }
  } catch (error) {
    Swal.fire('Lỗi', 'Không thể tải danh sách đơn đăng ký', 'error');
  } finally {
    isLoading.value = false;
    isFetching.value = false;
  }
};

// --- HÀM TƯƠNG TÁC API ---
const approveApp = async (id) => {
  Swal.fire({
    title: 'Phê duyệt đối tác?',
    text: "Hệ thống sẽ tự động cấp một mã Affiliate độc quyền cho khách hàng này.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    confirmButtonText: 'Đồng ý Duyệt',
    cancelButtonText: 'Hủy'
  }).then(async (result) => {
    if (result.isConfirmed) {
      isActionLoading.value = true;
      try {
        const res = await axios.post(`${API_BASE}/api/admin/affiliates/applications/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.data.success) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã phê duyệt!', showConfirmButton: false, timer: 1500 });
          fetchApplications(true); 
        }
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
      } finally {
        isActionLoading.value = false;
      }
    }
  });
};

const rejectApp = async (id) => {
  Swal.fire({
    title: 'Từ chối đơn đăng ký',
    input: 'textarea',
    inputLabel: 'Lý do từ chối (Khách hàng sẽ nhìn thấy nội dung này)',
    inputPlaceholder: 'Ví dụ: Tệp khách hàng chưa phù hợp...',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Từ Chối',
    cancelButtonText: 'Hủy'
  }).then(async (result) => {
    if (result.isConfirmed) {
      isActionLoading.value = true;
      try {
        const res = await axios.post(`${API_BASE}/api/admin/affiliates/applications/${id}/reject`, {
          admin_notes: result.value
        }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.data.success) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã từ chối đơn', showConfirmButton: false, timer: 1500 });
          fetchApplications(true); 
        }
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
      } finally {
        isActionLoading.value = false;
      }
    }
  });
};

// THÊM MỚI: Hàm Hủy tư cách
const revokeApp = async (id) => {
  Swal.fire({
    title: 'Hủy tư cách đối tác?',
    text: "Mã Affiliate của người này sẽ bị vô hiệu hóa và họ không thể nhận thêm hoa hồng từ các đơn hàng mới.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Đồng ý Hủy',
    cancelButtonText: 'Đóng'
  }).then(async (result) => {
    if (result.isConfirmed) {
      isActionLoading.value = true;
      try {
        const res = await axios.post(`${API_BASE}/api/admin/affiliates/applications/${id}/revoke`, {}, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.data.success) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã vô hiệu hóa đối tác', showConfirmButton: false, timer: 1500 });
          fetchApplications(true); 
        }
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
      } finally {
        isActionLoading.value = false;
      }
    }
  });
};

// --- LOGIC LỌC TÌM & PHÂN TRANG ---
const switchTab = (tabId) => { 
  activeTab.value = tabId; 
  currentPage.value = 1; 
};

const countByTab = (tab) => {
  if (tab === 'all') return applications.value.length;
  return applications.value.filter(a => a.status === tab).length;
};

const processedApps = computed(() => {
  let result = applications.value || [];
  
  if (activeTab.value !== 'all') {
    result = result.filter(a => a.status === activeTab.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(a => 
      (a.user?.fullName?.toLowerCase().includes(q)) || 
      (a.user?.email?.toLowerCase().includes(q)) ||
      (a.user?.phone?.includes(q))
    );
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedApps.value.length / itemsPerPage) || 1);

const displayApps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage; 
  return processedApps.value.slice(start, start + itemsPerPage);
});

// --- FORMATTERS ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Đang Chờ';
    case 'approved': return 'Đã Duyệt';
    case 'rejected': return 'Từ Chối';
    case 'revoked': return 'Đã Hủy';
    default: return status;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-warning bg-opacity-10 text-warning border border-warning';
    case 'approved': return 'bg-success bg-opacity-10 text-success border border-success';
    case 'rejected': return 'bg-danger bg-opacity-10 text-danger border border-danger';
    case 'revoked': return 'bg-secondary bg-opacity-10 text-secondary border border-secondary';
    default: return 'bg-secondary bg-opacity-10 text-secondary border border-secondary';
  }
};

onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
/* CSS Dùng chung từ file Coupon */
.logo-shimmer { 
  font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; 
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); 
  background-size: 200% auto; color: transparent; 
  -webkit-background-clip: text; background-clip: text; 
  animation: shine 1.5s linear infinite; 
}
@keyframes shine { to { background-position: 200% center; } }

.custom-tab { 
  font-weight: 600 !important; color: #6c757d; 
  border-bottom: 2px solid transparent !important; 
  margin-bottom: -1px; transition: color 0.2s ease; 
}
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }

.tab-badge { 
  font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; 
  color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; 
}
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.border-brand { border-color: #009981 !important; }

.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

.custom-scrollbar-x::-webkit-scrollbar { height: 4px; }
.custom-scrollbar-x::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fs-7 { font-size: 0.85rem; }
.cursor-pointer { cursor: pointer; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>