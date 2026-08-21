<template>
  <div class="admin-affiliate-wrapper">
    
    <div v-if="isLoading && withdrawals.length === 0" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu tài chính...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-3 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản Lý Yêu Cầu Rút Tiền</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <button @click="fetchWithdrawals(true)" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm" :disabled="isFetching">
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
              <i class="bi bi-hourglass-split me-2 text-warning"></i> Chờ xử lý
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'pending'}">{{ countByTab('pending') }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'approved' }" @click.prevent="switchTab('approved')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đã chuyển khoản
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'approved'}">{{ countByTab('approved') }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'rejected' }" @click.prevent="switchTab('rejected')">
              <i class="bi bi-x-circle-fill me-2 text-danger"></i> Từ chối (Hoàn tiền)
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'rejected'}">{{ countByTab('rejected') }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-2 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi bi-wallet2 text-brand me-1"></i> Danh sách lệnh rút tiền
            <span v-if="isFetching" class="spinner-border spinner-border-sm text-brand ms-2" title="Đang đồng bộ dữ liệu..."></span>
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <div class="search-box position-relative" style="width: 320px; max-width: 100%;">
              <input type="text" class="form-control form-control-sm rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên, email, sđt hoặc ngân hàng...">
              <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1100px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Đối Tác Yêu Cầu</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 15%;">Số Tiền & Ngày</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 30%;">Thông Tin Nhận Tiền</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Trạng Thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 15%;">Thao Tác Kế Toán</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="isFetching && displayWithdrawals.length === 0">
                  <tr v-for="i in 5" :key="'skel'+i" class="placeholder-glow">
                    <td class="px-4 py-3"><div class="w-100"><span class="placeholder col-10 rounded mb-1"></span><br><span class="placeholder col-6 rounded"></span></div></td>
                    <td class="px-4"><span class="placeholder col-12 rounded mb-1" style="height: 18px;"></span><br><span class="placeholder col-8 rounded" style="height: 12px;"></span></td>
                    <td class="px-4"><span class="placeholder col-12 rounded mb-1"></span><br><span class="placeholder col-10 rounded"></span></td>
                    <td class="px-4 text-center"><span class="placeholder col-10 rounded-pill" style="height: 25px;"></span></td>
                    <td class="px-4 text-center"><span class="placeholder col-8 rounded"></span></td>
                  </tr>
                </template>

                <tr v-else-if="displayWithdrawals.length === 0">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-receipt fs-1 d-block mb-2 opacity-25"></i>Không có yêu cầu rút tiền nào phù hợp.
                  </td>
                </tr>

                <tr v-else v-for="item in displayWithdrawals" :key="item.id" :class="{'bg-light bg-opacity-50': item.status === 'rejected'}">
                  
                  <td class="px-4 py-3">
                    <div class="overflow-hidden">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge bg-light text-dark border border-secondary border-opacity-25 font-monospace text-uppercase shadow-sm">#{{ item.id }}</span>
                        <h6 class="mb-0 fw-bold text-dark text-truncate" :class="{'text-muted': item.status === 'rejected'}">
                          {{ item.user?.fullName || 'Đối tác ẩn' }}
                        </h6>
                      </div>
                      <small class="text-muted d-block text-truncate"><i class="bi bi-envelope me-1"></i>{{ item.user?.email }}</small>
                      <small class="text-muted d-block text-truncate"><i class="bi bi-telephone me-1"></i>{{ item.user?.phone || 'Chưa cập nhật' }}</small>
                    </div>
                  </td>

                  <td class="px-4">
                    <div class="fw-bold fs-5 mb-1" :class="item.status === 'rejected' ? 'text-muted text-decoration-line-through' : 'text-danger'">
                      {{ formatCurrency(item.amount) }}
                    </div>
                    <div class="small fw-semibold text-secondary">
                      <i class="bi bi-clock me-1"></i>{{ formatDate(item.created_at) }}
                    </div>
                  </td>

                  <td class="px-4">
                    <div class="bank-info-box p-2 rounded shadow-sm border border-light" :class="item.status === 'rejected' ? 'bg-light text-muted' : 'bg-white'">
                      <i class="bi bi-bank me-2 text-brand"></i>
                      <span class="small fw-medium">{{ item.description }}</span>
                      
                      <div v-if="item.status === 'rejected'" class="mt-2 pt-2 border-top text-danger small fw-bold">
                        <i class="bi bi-exclamation-triangle me-1"></i> Kế toán ghi chú: {{ extractRejectReason(item.description) }}
                      </div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <span class="badge px-3 py-2 rounded-pill fs-7 shadow-sm" :class="getStatusBadgeClass(item.status)">
                      <i class="bi" :class="getStatusIcon(item.status)"></i> {{ getStatusText(item.status) }}
                    </span>
                  </td>

                  <td class="px-4 text-center">
                    <div v-if="item.status === 'pending'" class="d-flex justify-content-center gap-2">
                      <button class="btn btn-sm btn-brand-solid shadow-sm fw-medium px-3" @click="approveWithdrawal(item)" title="Đánh dấu đã chuyển khoản" :disabled="isActionLoading">
                        <i class="bi bi-check-circle me-1"></i> Duyệt
                      </button>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border fw-medium px-3" @click="rejectWithdrawal(item)" title="Từ chối & Hoàn tiền" :disabled="isActionLoading">
                        <i class="bi bi-x-circle me-1"></i> Từ chối
                      </button>
                    </div>
                    
                    <div v-else-if="item.status === 'approved'" class="text-success small fw-medium">
                      <i class="bi bi-check2-all fs-5 d-block mb-1"></i> Kế toán đã xử lý
                    </div>

                    <div v-else-if="item.status === 'rejected'" class="text-danger small fw-medium">
                      <i class="bi bi-arrow-counterclockwise fs-5 d-block mb-1"></i> Đã hoàn ví
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center" v-if="totalPages > 1">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedWithdrawals.length) }}</span>
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
import { getAdminToken } from '@/composables/useUtilities';
import { API_BASE_URL } from '@/utils/env';

const getToken = () => getAdminToken();

const withdrawals = ref([]);
const isLoading = ref(true); 
const isFetching = ref(false); 
const isActionLoading = ref(false); 

const activeTab = ref('all');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const fetchWithdrawals = async (silent = false) => {
  if (silent) isFetching.value = true;
  else isLoading.value = true;

  try {
    const res = await axios.get(`${API_BASE_URL}/admin/affiliates/withdrawals`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.data.success) {
      withdrawals.value = res.data.data;
    }
  } catch (error) {
    Swal.fire('Lỗi', 'Không thể tải danh sách lệnh rút tiền', 'error');
  } finally {
    isLoading.value = false;
    isFetching.value = false;
  }
};

// duyệt lệnh rút tiền
const approveWithdrawal = async (item) => {
  Swal.fire({
    title: 'Xác nhận Đã chuyển khoản?',
    html: `Bạn xác nhận đã chuyển số tiền <b><span class="text-danger">${formatCurrency(item.amount)}</span></b><br> cho đối tác <b>${item.user?.fullName}</b> chưa?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    confirmButtonText: 'Đã Chuyển Khoản & Duyệt',
    cancelButtonText: 'Hủy'
  }).then(async (result) => {
    if (result.isConfirmed) {
      isActionLoading.value = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/admin/affiliates/withdrawals/${item.id}/approve`, {}, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.data.success) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã duyệt lệnh rút tiền!', showConfirmButton: false, timer: 1500 });
          fetchWithdrawals(true); 
        }
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
      } finally {
        isActionLoading.value = false;
      }
    }
  });
};

// từ chối và hoàn tiền hh lại
const rejectWithdrawal = async (item) => {
  Swal.fire({
    title: 'Từ chối & Hoàn tiền',
    input: 'textarea',
    inputLabel: 'Lý do từ chối (Ví dụ: Sai số tài khoản, Ngân hàng lỗi...)',
    inputPlaceholder: 'Nhập lý do từ chối để thông báo cho đối tác...',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Từ Chối & Hoàn Tiền Vào Ví',
    cancelButtonText: 'Hủy'
  }).then(async (result) => {
    if (result.isConfirmed) {
      if (!result.value) {
        Swal.fire('Cảnh báo', 'Vui lòng nhập lý do từ chối để kế toán kiểm soát!', 'warning');
        return;
      }
      isActionLoading.value = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/admin/affiliates/withdrawals/${item.id}/reject`, {
          admin_notes: result.value
        }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.data.success) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã từ chối và Hoàn tiền!', showConfirmButton: false, timer: 1500 });
          fetchWithdrawals(true); 
        }
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
      } finally {
        isActionLoading.value = false;
      }
    }
  });
};

const switchTab = (tabId) => { 
  activeTab.value = tabId; 
  currentPage.value = 1; 
};

const countByTab = (tab) => {
  if (tab === 'all') return withdrawals.value.length;
  return withdrawals.value.filter(a => a.status === tab).length;
};

const processedWithdrawals = computed(() => {
  let result = withdrawals.value || [];
  
  if (activeTab.value !== 'all') {
    result = result.filter(a => a.status === activeTab.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(a => 
      (a.user?.fullName?.toLowerCase().includes(q)) || 
      (a.user?.email?.toLowerCase().includes(q)) ||
      (a.user?.phone?.includes(q)) ||
      (a.description?.toLowerCase().includes(q))
    );
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedWithdrawals.value.length / itemsPerPage) || 1);

const displayWithdrawals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage; 
  return processedWithdrawals.value.slice(start, start + itemsPerPage);
});

// định dạng tiền
const formatCurrency = (value) => {
  if (!value) return '0 đ';
  return parseInt(value).toLocaleString('vi-VN') + ' đ';
};

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

const extractRejectReason = (description) => {
  if (!description) return '';
  const parts = description.split('| Từ chối:');
  return parts.length > 1 ? parts[1].trim() : 'Không rõ lý do';
};

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'approved': return 'Đã chuyển khoản';
    case 'rejected': return 'Bị từ chối';
    default: return status;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return 'bi-hourglass-split';
    case 'approved': return 'bi-check2';
    case 'rejected': return 'bi-x-lg';
    default: return '';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-warning bg-opacity-10 text-warning border border-warning';
    case 'approved': return 'bg-success bg-opacity-10 text-success border border-success';
    case 'rejected': return 'bg-danger bg-opacity-10 text-danger border border-danger';
    default: return 'bg-secondary bg-opacity-10 text-secondary border border-secondary';
  }
};

onMounted(() => {
  fetchWithdrawals();
});
</script>

<style scoped>
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

.bank-info-box {
  line-height: 1.5;
}

.custom-scrollbar-x::-webkit-scrollbar { height: 4px; }
.custom-scrollbar-x::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }

.fs-7 { font-size: 0.85rem; }
.cursor-pointer { cursor: pointer; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>