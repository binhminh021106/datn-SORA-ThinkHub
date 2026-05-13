<template>
  <div class="user-index-wrapper pb-5 mb-5">
    
    <div v-if="isLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu khách hàng...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <!-- Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Khách Hàng</h3>
        </div>
        
        <!-- ĐÃ FIX RESPONSIVE: Thêm flex-wrap -->
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>
          <router-link :to="{ name: 'admin-user-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
            <i class="bi bi-person-plus-fill me-1"></i> Thêm Khách Hàng
          </router-link>
        </div>
      </div>

      <!-- TABS PHÂN LOẠI (ĐÃ FIX RESPONSIVE) -->
      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-people-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ users.filter(u => !u.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'active' }" @click.prevent="switchTab('active')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đang hoạt động
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">{{ users.filter(u => u.status === 'active' && !u.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'locked' }" @click.prevent="switchTab('locked')">
              <i class="bi bi-lock-fill me-2 text-warning"></i> Bị khóa
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'locked'}">{{ users.filter(u => u.status === 'locked' && !u.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'deleted', 'text-danger': true }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2"></i> Đã xóa
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'deleted', 'bg-danger text-white border-danger': activeTab !== 'deleted'}">{{ users.filter(u => u.deleted_at).length }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Bảng Dữ liệu -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-list-ul me-2"></i>Danh sách hiển thị</h6>
          <div class="search-box position-relative" style="width: 280px; max-width: 100%;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên, email, SĐT...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>

        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1050px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 24%;">Khách hàng</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Thông tin liên hệ</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 26%;">Địa chỉ mặc định</th>
                  <th class="py-3 px-2 text-secondary border-0 text-center" style="width: 16%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 14%;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedUsers.length === 0">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                    Không có dữ liệu trong danh sách này.
                  </td>
                </tr>
                <tr v-else v-for="user in paginatedUsers" :key="user.id" :class="{'bg-light opacity-75': user.deleted_at}">
                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                      <!-- ẢNH CLICK ĐỂ PHÓNG TO -->
                      <img :src="getAvatarUrl(user.avatar_url)" 
                           @error="handleImageError"
                           @click="viewFullImage(getAvatarUrl(user.avatar_url))"
                           class="rounded-circle object-fit-cover me-3 border shadow-sm flex-shrink-0 cursor-pointer hover-zoom" 
                           style="width: 45px; height: 45px;">
                      
                      <div class="overflow-hidden">
                        <h6 class="mb-0 fw-bold text-dark text-truncate" :title="user.fullName">{{ user.fullName }}</h6>
                        <small class="text-muted d-block mt-1 text-truncate">
                          <i class="bi bi-calendar-event me-1"></i> Sinh: {{ formatDate(user.birthday) }}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 overflow-hidden">
                    <div class="text-dark fw-medium text-truncate mb-1" :title="user.phone"><i class="bi bi-telephone text-brand me-1"></i> {{ user.phone || 'Chưa cập nhật' }}</div>
                    <div class="text-muted small text-truncate font-monospace" :title="user.email"><i class="bi bi-envelope me-1"></i> {{ user.email }}</div>
                  </td>
                  <td class="px-4">
                    <template v-if="user.default_address">
                      <div class="text-dark small text-truncate" style="max-width: 250px;" :title="formatFullAddress(user.default_address)">
                        {{ user.default_address.shipping_address }}
                      </div>
                      <div class="text-muted small mt-1 text-truncate" style="font-size: 0.75rem;">
                        {{ [user.default_address.ward, user.default_address.district, user.default_address.city].filter(Boolean).join(', ') }}
                      </div>
                    </template>
                    <span v-else class="text-muted small fst-italic">Chưa có địa chỉ</span>
                  </td>
                  
                  <!-- CỘT SỬA TRẠNG THÁI NHANH -->
                  <td class="px-2 text-center">
                    <span v-if="user.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary" title="Đã chuyển vào thùng rác">
                      <i class="bi bi-trash3-fill"></i> Đã xóa
                    </span>
                    <div v-else class="d-flex align-items-center justify-content-center gap-1 flex-nowrap w-100">
                      <select class="form-select form-select-sm border shadow-sm fw-semibold flex-shrink-0" 
                              style="width: 110px; font-size: 0.8rem; border-color: #ced4da !important;"
                              :class="getStatusSelectClass(user.localStatus || user.status)"
                              v-model="user.localStatus"
                              @change="checkStatusChange(user)"
                              :disabled="user.isUpdatingStatus">
                        <option value="active">Hoạt động</option>
                        <option value="locked">Bị Khóa</option>
                      </select>
                      
                      <!-- Khung cố định chống nhảy -->
                      <div class="d-flex align-items-center justify-content-start flex-shrink-0" style="min-width: 55px; height: 28px;">
                        <div v-if="user.isUpdatingStatus" class="spinner-border text-brand ms-1" style="width: 1.25rem; height: 1.25rem; border-width: 0.15em;" role="status"></div>
                        <template v-else-if="user.isStatusChanged">
                          <button @click="saveUserStatus(user)" class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Lưu">
                            <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                          <button @click="cancelStatusChange(user)" class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Hủy">
                            <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                        </template>
                      </div>
                    </div>
                  </td>

                  <!-- ĐÃ CĂN CHỈNH LẠI: NÚT THAO TÁC LUÔN NẰM TRÊN 1 HÀNG -->
                  <td class="px-4 text-center">
                    <div class="d-flex justify-content-center align-items-center gap-1 flex-nowrap">
                      <button class="btn btn-sm btn-light text-info shadow-sm border" title="Xem chi tiết" @click="openQuickView(user)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <template v-if="!user.deleted_at">
                        <router-link :to="{ name: 'admin-user-edit', params: { id: user.id } }" class="btn btn-sm btn-light text-primary shadow-sm border" title="Chỉnh sửa">
                          <i class="bi bi-pencil-square"></i>
                        </router-link>
                        <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(user.id, user.fullName)" title="Đưa vào thùng rác">
                          <i class="bi bi-trash"></i>
                        </button>
                      </template>
                      <template v-else>
                        <button class="btn btn-sm btn-light text-success shadow-sm border w-100" @click="restoreUser(user.id)" title="Khôi phục tài khoản">
                          <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Phân trang -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="totalPages > 1">
        <span class="text-muted small">
          Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedUsers.length) }}
        </span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"><button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- POPUP XEM CHI TIẾT (QUICK VIEW) BAO GỒM TẤT CẢ ĐỊA CHỈ -->
    <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="fw-bold text-dark"><i class="bi bi-person-vcard text-brand me-2"></i>Hồ sơ Khách Hàng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedUser">
            <div class="row">
              <!-- Cột thông tin cơ bản -->
              <div class="col-md-5 text-center border-end mb-4 mb-md-0">
                <div class="position-relative d-inline-block mb-3">
                  <img :src="getAvatarUrl(selectedUser.avatar_url)" 
                       @error="handleImageError"
                       @click="viewFullImage(getAvatarUrl(selectedUser.avatar_url))"
                       class="rounded-circle shadow-sm border border-3 border-white object-fit-cover cursor-pointer hover-zoom" 
                       style="width: 130px; height: 130px;">
                  <span v-if="!selectedUser.deleted_at" class="position-absolute bottom-0 end-0 p-2 border border-light rounded-circle" :class="selectedUser.status === 'active' ? 'bg-success' : 'bg-warning'" style="width: 18px; height: 18px;"></span>
                  <span v-else class="position-absolute bottom-0 end-0 p-2 border border-light rounded-circle bg-secondary" style="width: 18px; height: 18px;"></span>
                </div>
                <h5 class="fw-bold mb-1">{{ selectedUser.fullName }}</h5>
                <p class="text-muted small mb-3 font-monospace">{{ selectedUser.email }}</p>
                
                <div class="text-start bg-light p-3 rounded-4 shadow-sm border border-light-subtle small">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted fw-semibold"><i class="bi bi-telephone text-brand me-1"></i>SĐT:</span>
                    <span class="fw-bold text-dark">{{ selectedUser.phone || 'N/A' }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted fw-semibold"><i class="bi bi-gender-ambiguous text-brand me-1"></i>Giới tính:</span>
                    <span class="text-dark">{{ selectedUser.gender || 'N/A' }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted fw-semibold"><i class="bi bi-calendar-event text-brand me-1"></i>Ngày sinh:</span>
                    <span class="text-dark">{{ formatDate(selectedUser.birthday) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted fw-semibold"><i class="bi bi-clock-history text-brand me-1"></i>Tham gia:</span>
                    <span class="text-dark">{{ formatDate(selectedUser.created_at) }}</span>
                  </div>
                </div>
                
                <div class="mt-4" v-if="!selectedUser.deleted_at">
                  <button type="button" @click="goToEditUser(selectedUser.id)" class="btn btn-outline-brand rounded-pill fw-semibold w-100">
                    <i class="bi bi-pencil-square me-1"></i> Chỉnh sửa tài khoản
                  </button>
                </div>
              </div>
              
              <!-- Cột Sổ địa chỉ -->
              <div class="col-md-7">
                <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-journal-bookmark text-brand me-2"></i>Sổ địa chỉ đã lưu</span>
                  <span class="badge bg-brand">{{ selectedUser.addresses?.length || 0 }}</span>
                </h6>
                
                <div class="address-list custom-scrollbar pe-2" style="max-height: 350px; overflow-y: auto;">
                  <div v-if="!selectedUser.addresses || selectedUser.addresses.length === 0" class="text-center p-4 bg-light rounded-4 border border-dashed">
                    <i class="bi bi-geo-alt text-muted fs-3 mb-2 d-block opacity-50"></i>
                    <span class="text-muted small">Khách hàng chưa lưu địa chỉ nào.</span>
                  </div>

                  <div v-else v-for="addr in selectedUser.addresses" :key="addr.id" 
                       class="p-3 mb-3 rounded-4 border position-relative" 
                       :class="addr.is_default ? 'bg-brand bg-opacity-10 border-brand' : 'bg-light border-light-subtle'">
                    
                    <span v-if="addr.is_default" class="badge bg-brand position-absolute top-0 end-0 rounded-start-0 rounded-bottom-0 rounded-end-4 px-2 py-1" style="font-size: 0.65rem;">
                      <i class="bi bi-star-fill text-warning me-1"></i> Mặc định
                    </span>

                    <div class="fw-bold text-dark mb-1">{{ addr.customer_name }} <span class="text-muted fw-normal ms-2">| {{ addr.customer_phone }}</span></div>
                    <div class="text-muted small mb-1">{{ addr.shipping_address }}</div>
                    <div class="text-muted small">{{ [addr.ward, addr.district, addr.city].filter(Boolean).join(', ') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios'; 
import defaultAvatar from '../../../../assets/images/defaults/avatar1.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();
const users = ref([]);
const systemModules = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const activeTab = ref('all');
const currentPageLevel = ref(null);

const currentPage = ref(1);
const itemsPerPage = 8; 

const selectedUser = ref(null);
let quickViewModalInstance = null;

onBeforeUnmount(() => {
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
  document.body.style = '';
});

const goToEditUser = (id) => {
  if (quickViewModalInstance) quickViewModalInstance.hide();
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.className = '';
    document.body.style = '';
    router.push({ name: 'admin-user-edit', params: { id } });
  }, 300);
};

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const handleAxiosError = (e, defaultMsg = 'Lỗi hệ thống') => {
  if (e.response) {
    if (e.response.status === 401) {
      Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
    } else if (e.response.data && e.response.data.errors) {
      let errorHtml = '<ul class="text-start text-danger small mt-2" style="max-height: 200px; overflow-y: auto; padding-left: 20px;">';
      Object.values(e.response.data.errors).flat().forEach(msg => {
          errorHtml += `<li class="mb-1">${msg}</li>`;
      });
      errorHtml += '</ul>';
      Swal.fire({ title: 'Dữ liệu không hợp lệ', html: errorHtml, icon: 'error', confirmButtonColor: '#dc3545' });
    } else {
      Swal.fire('Lỗi', e.response.data.message || defaultMsg, 'error');
    }
  } else {
    Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
  }
};

const getAvatarUrl = (path) => path ? `${API_URL}/storage/${path}` : defaultAvatar;
const handleImageError = (e) => { e.target.src = defaultAvatar; };

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
const formatDateTime = (dateString) => dateString ? `${new Date(dateString).toLocaleDateString('vi-VN')} ${new Date(dateString).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}` : '';

const formatFullAddress = (addr) => {
  if (!addr) return '';
  return `${addr.shipping_address}, ${[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}`;
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

const viewFullImage = (url) => {
  Swal.fire({
    imageUrl: url,
    imageAlt: 'Avatar',
    imageWidth: 300,
    imageHeight: 300,
    showCloseButton: true,
    showConfirmButton: false,
    width: 'auto',
    background: 'transparent',
    backdrop: 'rgba(0, 0, 0, 0.85)',
    customClass: {
      image: 'rounded-circle border border-3 border-white object-fit-cover shadow-lg',
    }
  });
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [resUsers, resModules] = await Promise.all([
      axios.get(`${API_URL}/admin/users`, { headers: getHeaders() }),
      axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() })
    ]);
    
    const rawUsers = Array.isArray(resUsers.data.data) ? resUsers.data.data : (resUsers.data.data?.data || []);
    users.value = rawUsers.map(u => ({
        ...u, localStatus: u.status, isStatusChanged: false, isUpdatingStatus: false
    }));

    systemModules.value = resModules.data.data;
    const currentModule = systemModules.value.find(m => m.module_code === (route.meta?.moduleCode || 'admin_users'));
    if (currentModule) currentPageLevel.value = currentModule.required_level;
    
  } catch (err) { 
      console.error('Lỗi khi tải dữ liệu: ', err); 
  } finally { 
      isLoading.value = false; 
  }
};

const switchTab = (tabId) => { activeTab.value = tabId; currentPage.value = 1; };

const openQuickView = (user) => {
  if (user.addresses) {
    user.addresses.sort((a, b) => b.is_default - a.is_default);
  }
  selectedUser.value = user;
  if (!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewModal'));
  quickViewModalInstance.show();
};

const getStatusSelectClass = (status) => {
  const map = { 
    'active': 'text-success border-success bg-success bg-opacity-10', 
    'locked': 'text-warning border-warning bg-warning bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

const checkStatusChange = (user) => { user.isStatusChanged = (user.localStatus !== user.status); };
const cancelStatusChange = (user) => { user.localStatus = user.status; user.isStatusChanged = false; };

const saveUserStatus = async (user) => {
  user.isUpdatingStatus = true;
  
  const payload = {
      _method: 'PUT',
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      gender: user.gender || '',
      birthday: user.birthday || '',
      status: user.localStatus
  };

  try {
    await axios.post(`${API_URL}/admin/users/${user.id}`, payload, { headers: getHeaders() });
    user.status = user.localStatus; 
    user.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
  } catch (error) { 
    cancelStatusChange(user); 
    handleAxiosError(error, 'Không thể cập nhật trạng thái');
  } finally { 
    user.isUpdatingStatus = false; 
  }
};

const processedUsers = computed(() => {
  let result = users.value;
  if (activeTab.value === 'deleted') { result = result.filter(u => u.deleted_at); } 
  else {
    result = result.filter(u => !u.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(u => u.status === activeTab.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(u => (u.fullName?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q)) || (u.phone?.includes(q)));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedUsers.value.length / itemsPerPage) || 1);
const paginatedUsers = computed(() => { const start = (currentPage.value - 1) * itemsPerPage; return processedUsers.value.slice(start, start + itemsPerPage); });

const confirmDelete = (id, name) => {
  Swal.fire({ 
    title: 'Xóa tài khoản này?', 
    text: `Khách hàng "${name}" sẽ bị đưa vào thùng rác!`, 
    icon: 'warning', 
    showCancelButton: true, 
    confirmButtonColor: '#d33', 
    confirmButtonText: 'Đồng ý xóa' 
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/admin/users/${id}`, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa', text: res.data.message, showConfirmButton: false, timer: 1500 }); 
        fetchData(); 
      } catch (err) {
        handleAxiosError(err, 'Không thể xóa khách hàng này');
      }
    }
  });
};

const restoreUser = (id) => {
  Swal.fire({ 
    title: 'Khôi phục tài khoản?', 
    icon: 'info', 
    showCancelButton: true, 
    confirmButtonColor: '#009981', 
    confirmButtonText: 'Khôi phục' 
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.post(`${API_URL}/admin/users/${id}/restore`, {}, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Thành công', text: res.data.message, showConfirmButton: false, timer: 1500 }); 
        fetchData(); 
      } catch (err) {
        handleAxiosError(err, 'Không thể khôi phục tài khoản');
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
.btn-brand { background-color: #009981; border: none; transition: 0.2s; } .btn-brand:hover { background-color: #007a67; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; } .btn-outline-brand:hover { background-color: #009981; color: white; }

/* Scrollbar tùy chỉnh cho danh sách địa chỉ */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
.border-dashed { border-style: dashed !important; }

/* Image Hover Zoom */
.cursor-pointer { cursor: pointer; }
.hover-zoom { transition: transform 0.2s ease; }
.hover-zoom:hover { transform: scale(1.1); box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important; }
</style>