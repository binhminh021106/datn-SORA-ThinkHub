<template>
  <div class="staff-index-wrapper pb-5 mb-5">
    
    <div class="container-fluid py-4" v-if="!isLoading">
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Nhân sự (Nội bộ)</h3>
        </div>
        
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
<router-link :to="{ name: 'admin-staff-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
            <i class="bi bi-person-plus-fill me-1"></i> Thêm Tài Khoản
          </router-link>
        </div>
      </div>

      <!-- TABS PHÂN LOẠI -->
      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item" v-for="tab in allTabs" :key="tab.id" :class="{'ms-auto': tab.isEnd}">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab"
               href="#"
               :class="[{ 'active-tab': activeTab === tab.id }, tab.isEnd ? 'text-danger' : '']"
               @click.prevent="switchTab(tab.id)">
              <i class="bi me-2" :class="tab.icon"></i>
              {{ tab.name }}
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === tab.id, 'bg-danger text-white border-danger': tab.isEnd && activeTab !== tab.id}">
                {{ tab.count }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-list-ul me-2"></i>Danh sách hiển thị</h6>
          <div class="search-box position-relative" style="width: 280px; max-width: 100%;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2" 
                   v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên, email, SĐT...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>

        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1000px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Nhân viên</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Chức vụ (Role)</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 22%;">Thông tin liên hệ</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 18%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 15%;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <!-- HIỆU ỨNG SKELETON KHI CHUYỂN TAB -->
                <template v-if="isTableLoading">
                  <tr v-for="i in 5" :key="'skeleton-'+i">
                    <td class="px-4 py-3">
                      <div class="d-flex align-items-center">
                        <div class="placeholder-glow flex-shrink-0 me-3">
                          <div class="placeholder rounded-circle" style="width: 45px; height: 45px;"></div>
                        </div>
                        <div class="overflow-hidden w-100 placeholder-glow">
                          <span class="placeholder col-6 mb-1 rounded"></span>
                          <span class="placeholder col-4 d-block rounded"></span>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 placeholder-glow"><span class="placeholder col-8 rounded py-2"></span></td>
                    <td class="px-4 placeholder-glow">
                      <span class="placeholder col-10 mb-1 rounded"></span>
                      <span class="placeholder col-8 d-block rounded"></span>
                    </td>
                    <td class="px-4 text-center placeholder-glow"><span class="placeholder col-6 rounded py-2"></span></td>
                    <td class="px-4 text-center placeholder-glow"><span class="placeholder col-8 rounded py-2"></span></td>
                  </tr>
                </template>

                <!-- DỮ LIỆU THẬT -->
                <template v-else>
                  <tr v-if="paginatedStaff.length === 0">
                    <td colspan="5" class="text-center py-5 text-muted">
                      <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                      Không có dữ liệu trong danh sách này.
                    </td>
                  </tr>
                  <tr v-else v-for="staff in paginatedStaff" :key="staff.id" :class="{'bg-light opacity-75': staff.deleted_at, 'bg-light': staff.id === currentUserId && !staff.deleted_at}">
                    
                    <td class="px-4 py-3">
                      <div class="d-flex align-items-center">
                        <!-- Áp dụng SoraImage thay cho thẻ img truyền thống để xử lý lỗi ảnh mượt mà -->
                        <div class="position-relative flex-shrink-0 cursor-pointer hover-zoom me-3" style="width: 45px; height: 45px;">
                          <SoraImage 
                            :src="staff.avatar_url" 
                            :placeholder="defaultAvatar"
                            imgClass="rounded-circle object-fit-cover border shadow-sm" 
                            style="width: 45px; height: 45px;"
                            alt="Avatar"
                            @click="viewFullImage(getAvatarUrl(staff.avatar_url))"
                          />
                        </div>
                        
                        <div class="overflow-hidden">
                          <h6 class="mb-0 fw-bold text-dark text-truncate d-flex align-items-center" :title="staff.fullname">
                            {{ staff.fullname }} 
                            <span v-if="staff.id === currentUserId" class="badge bg-brand text-white ms-2" style="font-size: 0.65rem;">BẠN</span>
                            <span v-if="staff.id === 1 && staff.id !== currentUserId" class="badge bg-danger text-white ms-2" style="font-size: 0.65rem;">GỐC</span>
                          </h6>
                          <small class="text-muted d-block text-truncate font-monospace mt-1" :title="staff.email">{{ staff.email }}</small>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-4">
                      <span class="badge" :class="staff.role?.badgeClass || 'bg-secondary'">{{ staff.role?.label || 'Chưa gán' }}</span>
                    </td>
                    
                    <td class="px-4 overflow-hidden">
                      <div class="text-dark fw-medium small mb-1 text-truncate" :title="staff.phone"><i class="bi bi-telephone text-brand me-1"></i> {{ staff.phone || 'Chưa cập nhật' }}</div>
                      <div class="text-muted small text-truncate" :title="staff.address">
                        <i class="bi bi-geo-alt text-brand me-1"></i> {{ staff.address || 'Chưa cập nhật' }}
                      </div>
                    </td>
                    
                    <!-- SỬA TRẠNG THÁI NHANH (INLINE EDIT) -->
                    <td class="px-4 text-center">
                      <span v-if="staff.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary" title="Đã chuyển vào thùng rác">
                        <i class="bi bi-trash3-fill"></i> Đã xóa
                      </span>
                      <div v-else class="d-flex align-items-center justify-content-center gap-1 flex-nowrap w-100">
                        <!-- Khóa không cho sửa tài khoản Gốc (1) hoặc Tự khóa chính mình -->
                        <select class="form-select form-select-sm border shadow-sm fw-semibold flex-shrink-0" 
                                style="width: 120px; font-size: 0.8rem; border-color: #ced4da !important;"
                                :class="getStatusSelectClass(staff.localStatus ?? staff.status)"
                                v-model="staff.localStatus"
                                @change="checkStatusChange(staff)"
                                :disabled="isUpdatingStatusId === staff.id || staff.id === 1 || staff.id === currentUserId">
                          <option value="active">Hoạt động</option>
                          <option value="locked">Bị Khóa</option>
                        </select>
                        
                        <!-- Khung cố định chống nhảy -->
                        <div class="d-flex align-items-center justify-content-start flex-shrink-0" style="min-width: 55px; height: 28px;">
                          <div v-if="isUpdatingStatusId === staff.id" class="spinner-border text-brand ms-1" style="width: 1.25rem; height: 1.25rem; border-width: 0.15em;" role="status"></div>
                          <template v-else-if="staff.isStatusChanged">
                            <button @click="saveStaffStatus(staff)" class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Lưu">
                              <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                            </button>
                            <button @click="cancelStatusChange(staff)" class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Hủy">
                              <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                            </button>
                          </template>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-4 text-center">
                      <button class="btn btn-sm btn-light text-info me-2 shadow-sm border" title="Xem chi tiết" @click="openQuickView(staff)">
                        <i class="bi bi-eye"></i>
                      </button>

                      <template v-if="!staff.deleted_at">
                        <router-link :to="{ name: 'admin-staff-edit', params: { id: staff.id } }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border" title="Chỉnh sửa">
                          <i class="bi bi-pencil-square"></i>
                        </router-link>
                        <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(staff.id, staff.fullname)" :disabled="staff.id === 1 || staff.id === currentUserId" title="Đưa vào thùng rác">
                          <i class="bi bi-trash"></i>
                        </button>
                      </template>
                      <template v-else>
                        <button class="btn btn-sm btn-light text-success shadow-sm border" @click="restoreStaff(staff.id)" title="Khôi phục tài khoản">
                          <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="totalPages > 1">
        <span class="text-muted small">
          Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedStaff.length) }}
        </span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- MÀN HÌNH CHỜ ĐỘC LẬP (Chỉ chạy 1 lần duy nhất khi vừa vào trang) -->
    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu...
      </p>
    </div>

    <!-- POPUP (MODAL) XEM CHI TIẾT NHÂN VIÊN -->
    <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="fw-bold text-dark"><i class="bi bi-person-vcard text-brand me-2"></i>Hồ sơ Nhân viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 text-center" v-if="selectedStaff">
            <div class="position-relative d-inline-block mb-3" style="width: 110px; height: 110px;">
              <!-- Sử dụng SoraImage thay cho thẻ img truyền thống ở Modal chi tiết -->
              <SoraImage 
                :src="selectedStaff.avatar_url" 
                :placeholder="defaultAvatar"
                imgClass="rounded-circle shadow-sm border border-2 border-white object-fit-cover cursor-pointer hover-zoom" 
                style="width: 110px; height: 110px;"
                alt="Avatar"
                @click="viewFullImage(getAvatarUrl(selectedStaff.avatar_url))"
              />
                   
              <span v-if="!selectedStaff.deleted_at" class="position-absolute bottom-0 end-0 p-2 border border-light rounded-circle" :class="selectedStaff.status === 'active' ? 'bg-success' : 'bg-warning'" style="width: 15px; height: 15px;"></span>
              <span v-else class="position-absolute bottom-0 end-0 p-2 border border-light rounded-circle bg-secondary" style="width: 15px; height: 15px;"></span>
            </div>
            
            <h5 class="fw-bold mb-1 d-flex align-items-center justify-content-center">
              {{ selectedStaff.fullname }}
              <span v-if="selectedStaff.id === currentUserId" class="badge bg-brand text-white ms-2 align-middle" style="font-size: 0.7rem;">BẠN</span>
              <span v-if="selectedStaff.id === 1 && selectedStaff.id !== currentUserId" class="badge bg-danger text-white ms-2 align-middle" style="font-size: 0.7rem;">GỐC</span>
            </h5>
            <p class="text-muted small mb-2 font-monospace">{{ selectedStaff.email }}</p>
            <span class="badge mb-4" :class="selectedStaff.role?.badgeClass || 'bg-secondary'">{{ selectedStaff.role?.label || 'Chưa gán quyền' }}</span>
            
            <div class="text-start bg-light p-3 rounded-4 shadow-sm border border-light-subtle">
              <div class="row mb-2">
                <div class="col-5 text-muted fw-semibold"><i class="bi bi-telephone text-brand me-2"></i>SĐT:</div>
                <div class="col-7 fw-bold text-dark">{{ selectedStaff.phone || 'Chưa cập nhật' }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted fw-semibold"><i class="bi bi-geo-alt text-brand me-2"></i>Địa chỉ:</div>
                <div class="col-7 text-dark">{{ selectedStaff.address || 'Chưa cập nhật' }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted fw-semibold"><i class="bi bi-clock-history text-brand me-2"></i>Ngày tạo:</div>
                <div class="col-7 text-dark">{{ formatDateTime(selectedStaff.created_at) }}</div>
              </div>
              <div class="row" v-if="selectedStaff.deleted_at">
                <div class="col-5 text-muted fw-semibold"><i class="bi bi-trash3 text-danger me-2"></i>Đã xóa lúc:</div>
                <div class="col-7 text-danger fw-semibold">{{ formatDateTime(selectedStaff.deleted_at) }}</div>
              </div>
            </div>
            
            <!-- Chuyển trang an toàn -->
            <div class="mt-4" v-if="!selectedStaff.deleted_at">
              <button type="button" @click="goToEditStaff(selectedStaff.id)" class="btn btn-outline-brand rounded-pill px-4 fw-semibold w-100">
                <i class="bi bi-pencil-square me-1"></i> Chỉnh sửa thông tin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { getFullImage } from '@/composables/useUtilities';

// Tái sử dụng linh hoạt SoraImage và defaultAvatar thống nhất hệ thống
import SoraImage from '@/components/ui/SoraImage.vue';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const searchQuery = ref('');
const activeTab = ref('all');
const currentPageLevel = ref(null);
const isUpdatingStatusId = ref(null); // Quản lý spin-loading theo id riêng biệt tránh nhiễu loạn UI
const isTableLoading = ref(false); // Quản lý trạng thái hiển thị Skeleton Loading

const API_URL = import.meta.env.VITE_API_BASE_URL;

const currentAdmin = JSON.parse(localStorage.getItem('admin_info') || '{}');
const currentUserId = currentAdmin.id;

const currentPage = ref(1);
const itemsPerPage = 8; 

const selectedStaff = ref(null);
let quickViewModalInstance = null;

onBeforeUnmount(() => {
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
  document.body.style = '';
});

const goToEditStaff = (id) => {
  if (quickViewModalInstance) quickViewModalInstance.hide();
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.className = '';
    document.body.style = '';
    router.push({ name: 'admin-staff-edit', params: { id } });
  }, 300);
}; 

const getHeaders = () => ({
  'Accept': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
});

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

const getAvatarUrl = (path) => path ? getFullImage(path) : defaultAvatar;

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

const formatDateTime = (dateString) => {
  if(!dateString) return '';
  const d = new Date(dateString);
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
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

// ==========================================
// TANSTACK VUE QUERY - FETCH DATA
// ==========================================

// Query lấy danh sách staff
const { data: staffsResponse, isLoading: isStaffsLoading } = useQuery({
  queryKey: ['adminStaffs'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/staff`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 5 * 60 * 1000 // Cache dữ liệu trong 5 phút
});

// Query lấy danh sách roles
const { data: rolesResponse } = useQuery({
  queryKey: ['adminRoles'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/roles`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 30 * 60 * 1000 // Roles ít thay đổi, cache 30 phút
});

// Query lấy danh sách modules
const { data: modulesResponse } = useQuery({
  queryKey: ['adminModules'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 30 * 60 * 1000
});

// isLoading dùng cho giao diện Shimmer ở lần load ĐẦU TIÊN
const isLoading = computed(() => isStaffsLoading.value);

// Chuyển đổi dữ liệu thô sang reactive state tương thích cục bộ
const localStaffs = ref([]);
const roles = computed(() => rolesResponse.value?.data || []);

const rawStaffsList = computed(() => staffsResponse.value?.data || []);

// ĐỊNH NGHĨA HÀM KHỞI TẠO ĐỒNG BỘ TRƯỚC (ĐỂ ĐẢM BẢO KHÔNG BỊ TRUY CẬP TRƯỚC KHI KHỞI TẠO)
const syncLocalStaffs = () => {
  localStaffs.value = rawStaffsList.value.map(s => {
    // Giữ lại trạng thái thay đổi cục bộ hiện tại nếu có
    const existing = localStaffs.value.find(ls => ls.id === s.id);
    return {
      ...s,
      localStatus: existing ? existing.localStatus : s.status,
      isStatusChanged: existing ? existing.isStatusChanged : false
    };
  });
};

// SỬ DỤNG WATCH SAU KHI CÁC HÀM PHỤ TRỢ ĐÃ ĐƯỢC ĐỊNH NGHĨA AN TOÀN
watch(rawStaffsList, (newList) => {
  if (newList && newList.length > 0) {
    syncLocalStaffs();
  }
}, { immediate: true });

// Thiết lập quyền hạn cấp trang từ dữ liệu modules đã load
computed(() => {
  const modules = modulesResponse.value?.data || [];
  const currentCode = route.meta.moduleCode;
  if (currentCode && modules.length > 0) {
    const currentModule = modules.find(m => m.module_code === currentCode);
    if (currentModule) currentPageLevel.value = currentModule.required_level;
  }
  return modules;
});

const openQuickView = (staff) => {
  selectedStaff.value = staff;
  if (!quickViewModalInstance) {
    quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewModal'));
  }
  quickViewModalInstance.show();
};

const allTabs = computed(() => {
  const list = localStaffs.value;
  const tabs = [
    { id: 'all', name: 'Tất cả', count: list.filter(s => !s.deleted_at).length, icon: 'bi-people-fill' },
    { id: 'locked', name: 'Bị khóa', count: list.filter(s => s.status === 'locked' && !s.deleted_at).length, icon: 'bi-lock-fill text-warning' }
  ];

  roles.value.forEach(r => {
    tabs.push({
      id: `role_${r.id}`,
      name: r.label,
      count: list.filter(s => s.role_id === r.id && !s.deleted_at).length,
      icon: 'bi-person-badge text-primary'
    });
  });

  tabs.push({ 
    id: 'deleted', 
    name: 'Thùng rác', 
    count: list.filter(s => s.deleted_at).length, 
    icon: 'bi-trash3-fill text-danger',
    isEnd: true 
  });

  return tabs;
});

const switchTab = (tabId) => {
  if (activeTab.value === tabId) return;

  // Bật Skeleton table
  isTableLoading.value = true;
  activeTab.value = tabId;
  currentPage.value = 1; 

  // Tạo độ trễ nhỏ để trải nghiệm giao diện mượt mà hơn khi chuyển tab
  setTimeout(() => {
    isTableLoading.value = false;
  }, 350);
};

const getStatusSelectClass = (status) => {
  const map = { 
    'active': 'text-success border-success bg-success bg-opacity-10', 
    'locked': 'text-warning border-warning bg-warning bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

const checkStatusChange = (staff) => { staff.isStatusChanged = (staff.localStatus !== staff.status); };
const cancelStatusChange = (staff) => { staff.localStatus = staff.status; staff.isStatusChanged = false; };

// ==========================================
// TANSTACK VUE QUERY - MUTATIONS (THAY ĐỔI DỮ LIỆU)
// ==========================================

// 1. Cập nhật trạng thái
const updateStatusMutation = useMutation({
  mutationFn: async ({ id, payload }) => {
    const response = await axios.post(`${API_URL}/admin/staff/${id}`, payload, { headers: getHeaders() });
    return response.data;
  },
  onMutate: async ({ id, payload }) => {
    isUpdatingStatusId.value = id;
  },
  onSuccess: (data, variables) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
    
    // Đồng bộ nóng (optimistic updates) dữ liệu cache mà không cần reload
    queryClient.setQueryData(['adminStaffs'], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map(s => s.id === variables.id ? { ...s, status: variables.payload.status } : s)
      };
    });

    // Nếu sửa trạng thái của chính mình, đồng bộ luôn query thông tin profile cá nhân ở Header
    if (variables.id === currentUserId) {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    }
  },
  onError: (error, variables) => {
    // Nếu lỗi, rollback giá trị cũ của nhân viên tương ứng
    const staff = localStaffs.value.find(s => s.id === variables.id);
    if (staff) cancelStatusChange(staff);
    handleAxiosError(error, 'Không thể cập nhật trạng thái');
  },
  onSettled: () => {
    isUpdatingStatusId.value = null;
  }
});

const saveStaffStatus = (staff) => {
  const payload = {
      _method: 'PUT',
      fullname: staff.fullname,
      email: staff.email,
      role_id: staff.role_id,
      phone: staff.phone || '',
      address: staff.address || '',
      status: staff.localStatus
  };
  updateStatusMutation.mutate({ id: staff.id, payload });
};

// 2. Xóa mềm nhân viên
const deleteStaffMutation = useMutation({
  mutationFn: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/staff/${id}`, { headers: getHeaders() });
    return response.data;
  },
  onSuccess: (data, id) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa', text: data.message, showConfirmButton: false, timer: 1500 });
    
    // Optimistic update: Chuyển dữ liệu của nhân sự này sang trạng thái deleted_at cục bộ
    queryClient.setQueryData(['adminStaffs'], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map(s => s.id === id ? { ...s, deleted_at: new Date().toISOString() } : s)
      };
    });
  },
  onError: (err) => {
    handleAxiosError(err, 'Không thể xóa nhân viên này');
  }
});

const confirmDelete = (id, name) => {
  Swal.fire({
    title: 'Đưa vào thùng rác?', text: `Nhân viên "${name}" sẽ bị vô hiệu hóa và chuyển vào thùng rác!`, icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý xóa'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteStaffMutation.mutate(id);
    }
  });
};

// 3. Khôi phục nhân viên
const restoreStaffMutation = useMutation({
  mutationFn: async (id) => {
    const response = await axios.post(`${API_URL}/admin/staff/${id}/restore`, {}, { headers: getHeaders() });
    return response.data;
  },
  onSuccess: (data, id) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Thành công', text: data.message, showConfirmButton: false, timer: 1500 });
    
    // Optimistic update: Khôi phục trạng thái deleted_at về null ngay lập tức
    queryClient.setQueryData(['adminStaffs'], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map(s => s.id === id ? { ...s, deleted_at: null } : s)
      };
    });
  },
  onError: (err) => {
    handleAxiosError(err, 'Không thể khôi phục nhân viên');
  }
});

const restoreStaff = (id) => {
  Swal.fire({
    title: 'Khôi phục tài khoản?',
    text: "Tài khoản này sẽ hoạt động trở lại bình thường.",
    icon: 'info',
    showCancelButton: true, confirmButtonColor: '#009981', confirmButtonText: 'Khôi phục ngay'
  }).then((result) => {
    if (result.isConfirmed) {
      restoreStaffMutation.mutate(id);
    }
  });
};

// ==========================================
// FILTERS & PAGINATION LOGIC
// ==========================================

const processedStaff = computed(() => {
  let result = localStaffs.value;

  if (activeTab.value === 'deleted') {
    result = result.filter(s => s.deleted_at);
  } else {
    result = result.filter(s => !s.deleted_at);

    if (activeTab.value === 'locked') {
      result = result.filter(s => s.status === 'locked');
    } else if (activeTab.value.startsWith('role_')) {
      const roleId = parseInt(activeTab.value.split('_')[1]);
      result = result.filter(s => s.role_id === roleId);
    }
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(s => 
      s.fullname.toLowerCase().includes(q) || 
      s.email.toLowerCase().includes(q) || 
      (s.phone && s.phone.includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  }

  return result.sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    if (a.id === 1) return -1;
    if (b.id === 1) return 1;
    return b.id - a.id;
  });
});

const totalPages = computed(() => Math.ceil(processedStaff.value.length / itemsPerPage) || 1);

const paginatedStaff = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return processedStaff.value.slice(start, start + itemsPerPage);
});
</script>

<style scoped>
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
  to { background-position: 200% center; }
}

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

.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; background: transparent; }
.btn-outline-brand:hover { background-color: #009981; color: white; }

.cursor-pointer { cursor: pointer; }
.hover-zoom { transition: transform 0.2s ease; }
.hover-zoom:hover { transform: scale(1.1); box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important; }
</style>