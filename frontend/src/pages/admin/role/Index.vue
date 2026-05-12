<template>
  <div class="role-index-wrapper pb-5 mb-5">
    
    <div class="container-fluid py-4" v-if="!isPageLoading">
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Phân Quyền & Cấp Độ</h3>
        </div>
        
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>

          <button v-if="activeTab === 'roles'" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill" @click="openRoleModal('create')">
            <i class="bi bi-plus-circle me-1"></i> Thêm Role
          </button>
        </div>
      </div>

      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab"
               href="#"
               :class="{ 'active-tab': activeTab === 'roles' }"
               @click.prevent="switchTab('roles')">
              <i class="bi bi-person-badge me-2"></i> Danh sách Chức vụ
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab"
               href="#"
               :class="{ 'active-tab': activeTab === 'modules' }"
               @click.prevent="switchTab('modules')">
              <i class="bi bi-shield-lock me-2"></i> Cài đặt Cấp độ Trang
            </a>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'roles'" class="card border-0 shadow-sm rounded-4 mb-4">
        <!-- ĐÃ TỐI ƯU GIAO DIỆN HEADER TRÊN MOBILE: Chuyển d-flex thành flex-column trên mobile -->
        <div class="card-header bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
          <div class="d-flex align-items-center justify-content-between gap-2">
            <h6 class="fw-bold mb-0 text-dark text-nowrap"><i class="bi bi-list-ul me-2"></i>Danh sách Roles</h6>
            <select class="form-select form-select-sm ms-2 border-0 bg-light fw-semibold text-secondary" v-model="roleFilterStatus" style="width: 140px; box-shadow: none;" @change="currentPageRoles = 1">
              <option value="active">Đang hoạt động</option>
              <option value="deleted">Đã xóa</option>
            </select>
          </div>
          <div class="search-box position-relative w-100" style="max-width: 350px;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2 w-100" v-model="searchQueryRoles" @input="currentPageRoles = 1" placeholder="Tìm kiếm role...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <!-- ĐÃ SỬA: Đổi style cứng thành class .responsive-table để CSS xử lý Responsive -->
          <div class="table-responsive border-0">
            <table class="table table-hover align-middle mb-0 responsive-table w-100">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 10%;">ID</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 30%;">Tên hiển thị</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Mã hệ thống</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Quyền Hạn (Level)</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 15%;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingRoles">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <span class="spinner-border spinner-border-sm me-2 text-brand"></span> Đang tải dữ liệu...
                  </td>
                </tr>
                <tr v-else-if="paginatedRoles.length === 0">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không tìm thấy dữ liệu.
                  </td>
                </tr>
                <!-- ĐÃ SỬA: Gắn thêm data-label="" cho từng ô <td> để trên điện thoại nó tự biết tên cột -->
                <tr v-else v-for="role in paginatedRoles" :key="role.id" :class="{'bg-light opacity-75': role.deleted_at}">
                  <td data-label="ID" class="px-4 fw-bold text-muted font-monospace">#{{ role.id }}</td>
                  <td data-label="Tên hiển thị" class="px-4 fw-semibold">
                    <span class="badge rounded-pill px-3 py-2" :class="role.badgeClass || 'bg-secondary'">{{ role.label }}</span>
                  </td>
                  <td data-label="Mã hệ thống" class="px-4 text-muted font-monospace small">{{ role.value }}</td>
                  <td data-label="Quyền Hạn" class="px-4">
                    <span class="badge border py-2 px-3 shadow-sm" :class="getLevelColor(role.level)">
                      <i class="bi bi-star-fill me-1" v-if="role.level === 1"></i> Cấp {{ role.level || 5 }}
                    </span>
                  </td>
                  <td data-label="Thao tác" class="px-4 text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <template v-if="!role.deleted_at">
                        <button class="btn btn-sm btn-light text-primary shadow-sm border" @click="openRoleModal('edit', role)" title="Sửa">
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDeleteRole(role.id, role.label)" :disabled="role.id === 1" title="Xóa">
                          <i class="bi bi-trash"></i>
                        </button>
                      </template>
                      <template v-else>
                        <button class="btn btn-sm btn-light text-success shadow-sm border px-3" @click="restoreRole(role.id)" title="Khôi phục">
                          <i class="bi bi-arrow-counterclockwise me-1"></i> Khôi phục
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3" v-if="totalPageRoles > 1">
          <span class="text-muted small text-center">
            Hiển thị {{ (currentPageRoles - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPageRoles * itemsPerPage, processedRoles.length) }}
          </span>
          <nav>
            <ul class="pagination pagination-sm mb-0 shadow-sm">
              <li class="page-item" :class="{ disabled: currentPageRoles === 1 }">
                <button class="page-link text-brand" @click="currentPageRoles--"><i class="bi bi-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="page in totalPageRoles" :key="page" :class="{ active: currentPageRoles === page }">
                <button class="page-link" :class="currentPageRoles === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPageRoles = page">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPageRoles === totalPageRoles }">
                <button class="page-link text-brand" @click="currentPageRoles++"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- TƯƠNG TỰ VỚI TAB MODULES -->
      <div v-if="activeTab === 'modules'" class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
          <div class="d-flex align-items-center justify-content-between gap-3">
            <h6 class="fw-bold mb-0 text-dark text-nowrap"><i class="bi bi-hdd-network me-2"></i>Cấp độ trang</h6>
            <button v-if="isSuperAdmin" class="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3 shadow-sm text-nowrap" @click="syncModules" :disabled="isSyncing">
              <i class="bi bi-arrow-repeat me-1" :class="{'bi-spin': isSyncing}"></i> <span class="d-none d-sm-inline">{{ isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ hệ thống' }}</span><span class="d-inline d-sm-none">Đồng bộ</span>
            </button>
          </div>
          <div class="search-box position-relative w-100" style="max-width: 350px;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2 w-100" v-model="searchQueryModules" @input="currentPageModules = 1" placeholder="Tìm kiếm trang/module...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
          </div>
        </div>
        <div class="card-body p-0 mt-2">
          <div class="table-responsive border-0">
            <table class="table table-hover align-middle mb-0 responsive-table w-100">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 30%;">Tên Trang (Module)</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 30%;">Mã Route (Code)</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 20%;">Cấp độ tối thiểu</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 20%;">Cấu hình</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingModules">
                  <td colspan="4" class="text-center py-5 text-muted">
                    <span class="spinner-border spinner-border-sm me-2 text-brand"></span> Đang tải cấu hình trang...
                  </td>
                </tr>
                <tr v-else-if="paginatedModules.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">
                    <i class="bi bi-hdd me-2 fs-3 d-block opacity-50 mb-2"></i> Không có dữ liệu.
                  </td>
                </tr>
                <tr v-else v-for="module in paginatedModules" :key="module.id">
                  <td data-label="Tên Trang" class="px-4 fw-bold text-dark">{{ module.module_name }}</td>
                  <td data-label="Mã Route" class="px-4">
                    <span class="text-muted font-monospace small bg-light border px-2 py-1 rounded">{{ module.module_code }}</span>
                  </td>
                  <td data-label="Cấp tối thiểu" class="px-4 text-center">
                    <div class="d-flex align-items-center justify-content-center gap-2">
                      <span v-if="editingModuleId !== module.id" class="badge shadow-sm px-3 py-2" :class="getLevelColor(module.required_level)">Cấp {{ module.required_level }}</span>
                      
                      <div v-if="isSuperAdmin && editingModuleId === module.id" class="input-group input-group-sm shadow-sm border border-brand rounded" style="width: 100px;">
                        <button class="btn btn-light bg-white text-brand border-end" type="button" @click="editLevelValue > 1 ? editLevelValue-- : null"><i class="bi bi-dash"></i></button>
                        <input type="text" class="form-control text-center fw-bold text-brand px-0 bg-white" :value="editLevelValue" readonly>
                        <button class="btn btn-light bg-white text-brand border-start" type="button" @click="editLevelValue < 10 ? editLevelValue++ : null"><i class="bi bi-plus"></i></button>
                      </div>
                    </div>
                  </td>
                  <td data-label="Cấu hình" class="px-4 text-center">
                    <button v-if="isSuperAdmin && editingModuleId !== module.id" class="btn btn-sm btn-outline-brand fw-semibold rounded-pill px-3 shadow-sm" @click="startEditModule(module)">
                      <i class="bi bi-sliders me-1"></i> Đổi cấp
                    </button>
                    
                    <div v-if="isSuperAdmin && editingModuleId === module.id" class="d-flex justify-content-center gap-1">
                      <button class="btn btn-sm btn-success fw-bold px-3 rounded-pill shadow-sm" @click="saveModuleLevel(module.id)" :disabled="isSavingLevel"><i class="bi bi-check-lg"></i> Lưu</button>
                      <button class="btn btn-sm btn-light border text-danger rounded-pill px-3 shadow-sm" @click="editingModuleId = null">Hủy</button>
                    </div>

                    <span v-if="!isSuperAdmin" class="text-muted small"><i class="bi bi-dash-lg"></i> Không có quyền</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3" v-if="totalPageModules > 1">
          <span class="text-muted small text-center">
            Hiển thị {{ (currentPageModules - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPageModules * itemsPerPage, processedModules.length) }}
          </span>
          <nav>
            <ul class="pagination pagination-sm mb-0 shadow-sm">
              <li class="page-item" :class="{ disabled: currentPageModules === 1 }">
                <button class="page-link text-brand" @click="currentPageModules--"><i class="bi bi-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="page in totalPageModules" :key="page" :class="{ active: currentPageModules === page }">
                <button class="page-link" :class="currentPageModules === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPageModules = page">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPageModules === totalPageModules }">
                <button class="page-link text-brand" @click="currentPageModules++"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải cấu hình phân quyền...
      </p>
    </div>

    <!-- MODAL ROLE RESPONSIVE -->
    <div class="modal fade" id="roleModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="fw-bold text-dark"><i class="bi bi-person-vcard text-brand me-2"></i>{{ modalMode === 'create' ? 'Thêm Role Mới' : 'Cập Nhật Role' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3 p-md-4">
            
            <div class="alert alert-danger d-flex align-items-center mb-4" role="alert" v-if="Object.keys(errors).length > 0">
              <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
              <div class="small">Vui lòng kiểm tra lại các trường bị báo đỏ bên dưới.</div>
            </div>

            <form @submit.prevent="saveRole">
              <div class="row g-3">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold text-dark">Tên hiển thị (Label) <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="roleForm.label" :class="{'is-invalid': errors.label}" placeholder="VD: Kế Toán Trưởng">
                  <div class="invalid-feedback fw-bold">{{ errors.label?.[0] }}</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold text-dark">Mã hệ thống (Value) <span class="text-danger">*</span></label>
                  <input type="text" class="form-control font-monospace" v-model="roleForm.value" :class="{'is-invalid': errors.value}" placeholder="VD: accountant_manager">
                  <div class="invalid-feedback fw-bold">{{ errors.value?.[0] }}</div>
                </div>
              </div>

              <div class="mb-3 p-3 p-md-4 bg-light rounded-4 border border-light-subtle shadow-sm">
                <label class="form-label fw-bold text-brand mb-3">Định vị Cấp độ (Level) <span class="text-danger">*</span></label>
                <!-- ĐÃ SỬA: flex-column trên mobile, flex-row trên PC -->
                <div class="d-flex align-items-stretch gap-3 flex-column flex-md-row">
                    <div class="input-group shadow-sm flex-shrink-0 border border-brand rounded mx-auto mx-md-0" style="width: 140px; height: fit-content;">
                        <button class="btn btn-light bg-white border-end" type="button" @click="roleForm.level > 1 && roleForm.id !== 1 ? roleForm.level-- : null" :disabled="roleForm.id === 1">
                            <i class="bi bi-dash-lg text-brand fw-bold"></i>
                        </button>
                        <input type="text" class="form-control text-center fw-bold fs-5 text-brand bg-white px-0" :value="roleForm.level" readonly>
                        <button class="btn btn-light bg-white border-start" type="button" @click="roleForm.level < 10 && roleForm.id !== 1 ? roleForm.level++ : null" :disabled="roleForm.id === 1">
                            <i class="bi bi-plus-lg text-brand fw-bold"></i>
                        </button>
                    </div>
                    <div class="flex-grow-1 p-3 bg-white rounded-3 border border-info border-opacity-50 shadow-sm w-100">
                        <h6 class="fw-bold text-info mb-3" style="font-size: 0.85rem;">
                            <i class="bi bi-eye-fill me-1"></i>Trang mà cấp độ này có thể truy cập:
                        </h6>
                        <div class="d-flex flex-wrap gap-2 custom-scrollbar-y" style="max-height: 110px; overflow-y: auto;">
                            <span v-if="accessibleModulesPreview.length === 0" class="text-muted small fst-italic">Không có quyền truy cập trang nào.</span>
                            <span v-else v-for="m in accessibleModulesPreview" :key="m.id" class="badge bg-light text-dark border border-secondary-subtle fw-medium py-2 px-2" style="font-size: 0.75rem;">
                                <i class="bi bi-check2 text-success me-1"></i> {{ m.module_name }} <span class="text-muted opacity-75">(Cấp {{ m.required_level }})</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <small class="text-danger d-block fw-semibold" v-if="roleForm.id === 1"><i class="bi bi-x-octagon-fill me-1"></i>Không thể thay đổi Cấp độ của Super Admin gốc.</small>
                    <small class="text-muted d-block fst-italic" v-else><i class="bi bi-info-circle-fill me-1"></i>Số Level càng nhỏ thì quyền hạn càng lớn.</small>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold text-dark">Màu sắc Nhãn (Tùy chọn)</label>
                <select class="form-select fw-semibold" v-model="roleForm.badgeClass" :class="roleForm.badgeClass">
                  <option value="">Mặc định (Xám)</option>
                  <option value="bg-primary text-white" class="bg-primary text-white">Xanh dương (Primary)</option>
                  <option value="bg-success text-white" class="bg-success text-white">Xanh lá (Success)</option>
                  <option value="bg-danger text-white" class="bg-danger text-white">Đỏ (Danger)</option>
                  <option value="bg-warning text-dark" class="bg-warning text-dark">Vàng (Warning)</option>
                  <option value="bg-info text-dark" class="bg-info text-dark">Xanh ngọc (Info)</option>
                  <option value="bg-dark text-white" class="bg-dark text-white">Đen (Dark)</option>
                </select>
              </div>
              <div class="text-end pt-3 border-top">
                <button type="button" class="btn btn-light me-2 px-4 shadow-sm border fw-bold" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-brand text-white px-5 fw-bold shadow-sm" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> {{ modalMode === 'create' ? 'Tạo Mới' : 'Cập Nhật' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const isSuperAdmin = computed(() => localStorage.getItem('admin_role') == 1);
const isPageLoading = ref(true);

const activeTab = ref('roles');
const itemsPerPage = 8; 

const roles = ref([]);
const isLoadingRoles = ref(false);
const roleFilterStatus = ref('active');
const searchQueryRoles = ref('');
const currentPageRoles = ref(1);
const isSaving = ref(false);

const systemModules = ref([]);
const isLoadingModules = ref(false);
const searchQueryModules = ref('');
const currentPageModules = ref(1);
const editingModuleId = ref(null);
const editLevelValue = ref(1);
const isSavingLevel = ref(false);
const isSyncing = ref(false);
const currentPageLevel = ref(null); 

const modalMode = ref('create');
let bRoleModal = null;
const roleForm = ref({ id: null, label: '', value: '', badgeClass: '', level: 5 });
const errors = ref({}); 

const socket = io("http://localhost:3000");

const getHeaders = () => ({
  'Accept': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
});

const handleAxiosError = (e, defaultMsg = 'Lỗi hệ thống') => {
  if (e.response) {
    if (e.response.status === 401) {
      Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
    } else if (e.response.data && e.response.data.errors) {
      errors.value = e.response.data.errors; 
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

const processedRoles = computed(() => {
  let res = roles.value;
  if (roleFilterStatus.value === 'deleted') {
    res = res.filter(r => r.deleted_at);
  } else {
    res = res.filter(r => !r.deleted_at);
  }
  if (searchQueryRoles.value) {
    const q = searchQueryRoles.value.toLowerCase();
    res = res.filter(r => r.label.toLowerCase().includes(q) || r.value.toLowerCase().includes(q));
  }
  return res;
});

const paginatedRoles = computed(() => {
  const start = (currentPageRoles.value - 1) * itemsPerPage;
  return processedRoles.value.slice(start, start + itemsPerPage);
});
const totalPageRoles = computed(() => Math.ceil(processedRoles.value.length / itemsPerPage) || 1);

const processedModules = computed(() => {
  let res = systemModules.value;
  if (searchQueryModules.value) {
    const q = searchQueryModules.value.toLowerCase();
    res = res.filter(m => m.module_name.toLowerCase().includes(q) || m.module_code.toLowerCase().includes(q));
  }
  return res;
});

const paginatedModules = computed(() => {
  const start = (currentPageModules.value - 1) * itemsPerPage;
  return processedModules.value.slice(start, start + itemsPerPage);
});
const totalPageModules = computed(() => Math.ceil(processedModules.value.length / itemsPerPage) || 1);

const accessibleModulesPreview = computed(() => {
    if (!roleForm.value.level) return [];
    return systemModules.value
        .filter(m => roleForm.value.level <= m.required_level)
        .sort((a,b) => a.required_level - b.required_level);
});

const fetchRoles = async (silent = false) => {
  if (!silent) isLoadingRoles.value = true;
  try {
    const res = await axios.get(`${API_URL}/admin/roles`, { headers: getHeaders() });
    roles.value = res.data.data;
  } catch (err) { 
      console.error('Lỗi tải roles', err); 
  } finally { 
      if (!silent) isLoadingRoles.value = false; 
  }
};

const fetchModules = async (silent = false) => {
  if (!silent) isLoadingModules.value = true;
  try {
    const res = await axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() });
    systemModules.value = res.data.data;
    
    const currentCode = route.meta.moduleCode;
    if (currentCode) {
      const currentModule = systemModules.value.find(m => m.module_code === currentCode);
      if (currentModule) currentPageLevel.value = currentModule.required_level;
    }
  } catch (err) { 
      console.error('Lỗi tải modules', err); 
  } finally { 
      if (!silent) isLoadingModules.value = false; 
  }
};

const openRoleModal = (mode, role = null) => {
  modalMode.value = mode;
  errors.value = {}; 

  roleForm.value = mode === 'edit' && role 
    ? { id: role.id, label: role.label, value: role.value, badgeClass: role.badgeClass || '', level: role.level || 5 }
    : { id: null, label: '', value: '', badgeClass: '', level: 5 };
  
  if(!bRoleModal) bRoleModal = new window.bootstrap.Modal(document.getElementById('roleModal'));
  bRoleModal.show();
};

const saveRole = async () => {
  isSaving.value = true;
  errors.value = {};
  
  const url = modalMode.value === 'create' ? `${API_URL}/admin/roles` : `${API_URL}/admin/roles/${roleForm.value.id}`;
  
  try {
    const payload = roleForm.value;
    let res;
    if (modalMode.value === 'create') {
        res = await axios.post(url, payload, { headers: getHeaders() });
    } else {
        res = await axios.put(url, payload, { headers: getHeaders() });
    }
    
    Swal.fire({ icon: 'success', title: 'Thành công', text: res.data.message, timer: 1500, showConfirmButton: false });
    bRoleModal.hide();
    fetchRoles(); 
  } catch (err) { 
      handleAxiosError(err, 'Không thể lưu chức vụ (Role)');
  } finally { 
      isSaving.value = false; 
  }
};

const confirmDeleteRole = (id, roleName) => {
  Swal.fire({
    title: 'Xóa Role này?', 
    html: `Xóa chức vụ <b>${roleName}</b> sẽ ảnh hưởng đến các nhân viên đang sở hữu chức vụ này.<br>Bạn có chắc chắn?`, 
    icon: 'warning',
    showCancelButton: true, 
    confirmButtonColor: '#d33', 
    cancelButtonColor: '#6c757d', 
    confirmButtonText: 'Xóa ngay'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/admin/roles/${id}`, { headers: getHeaders() });
        Swal.fire({ icon: 'success', title: 'Đã xóa', text: res.data.message, timer: 1500, showConfirmButton: false }); 
        fetchRoles();
      } catch (err) { 
          handleAxiosError(err, 'Không thể xóa Role này');
      }
    }
  });
};

const restoreRole = (id) => {
  Swal.fire({
    title: 'Khôi phục Role?',
    text: "Chức vụ này sẽ hoạt động trở lại.",
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    confirmButtonText: 'Khôi phục ngay'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.post(`${API_URL}/admin/roles/${id}/restore`, {}, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Thành công', text: res.data.message, showConfirmButton: false, timer: 1500 });
        fetchRoles(); 
      } catch (err) { 
        handleAxiosError(err, 'Không thể khôi phục Role này');
      }
    }
  });
};

const syncModules = async () => {
  isSyncing.value = true;
  try {
    const res = await axios.post(`${API_URL}/admin/modules/sync`, {}, { headers: getHeaders() });
    Swal.fire({ icon: 'success', title: 'Hoàn tất', text: res.data.message, timer: 2000, showConfirmButton: false });
    fetchModules(); 
  } catch (err) { 
      handleAxiosError(err, 'Không thể đồng bộ cấu hình trang');
  } finally { 
      isSyncing.value = false; 
  }
};

const startEditModule = (module) => {
  editingModuleId.value = module.id;
  editLevelValue.value = module.required_level;
};

const saveModuleLevel = async (moduleId) => {
  isSavingLevel.value = true;
  try {
    const payload = { required_level: editLevelValue.value };
    await axios.put(`${API_URL}/admin/modules/${moduleId}/level`, payload, { headers: getHeaders() });
    
    const target = systemModules.value.find(m => m.id === moduleId);
    if(target) target.required_level = editLevelValue.value;
    
    const currentCode = route.meta.moduleCode;
    if(target.module_code === currentCode) currentPageLevel.value = editLevelValue.value;

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật cấp độ trang', timer: 1500, showConfirmButton: false });
    editingModuleId.value = null;
  } catch (err) { 
      handleAxiosError(err, 'Không thể lưu cấp độ cho trang này');
  } finally { 
      isSavingLevel.value = false; 
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
};

onMounted(async () => {
  isPageLoading.value = true; 
  await Promise.all([fetchRoles(), fetchModules()]);
  isPageLoading.value = false; 

  socket.on("refresh_admin_data", (data) => {
    if (data.module === 'roles') {
      fetchRoles(true);
      Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Có cập nhật mới!', showConfirmButton: false, timer: 2000 });
    }
  });
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; } .border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; } .btn-brand:hover { background-color: #007a67; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; } .btn-outline-brand:hover { background-color: #009981; color: white; }
.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.bi-spin { display: inline-block; animation: bi-spin 2s infinite linear; }
@keyframes bi-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(359deg); } }
.invalid-feedback { font-size: 0.8rem; }

/* CSS XỬ LÝ RESPONSIVE BẢNG THÀNH DẠNG CARD (KHÔNG THANH CUỘN NGANG) */
@media (max-width: 767.98px) {
  .responsive-table {
    display: block;
    width: 100%;
  }
  .responsive-table thead {
    display: none;
  }
  .responsive-table tbody, .responsive-table tr, .responsive-table td {
    display: block;
    width: 100%;
  }
  .responsive-table tr {
    margin-bottom: 1rem;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 0.5rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .responsive-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 0.75rem 1rem !important;
    border: none;
    border-bottom: 1px solid #f8f9fa;
  }
  .responsive-table td:last-child {
    border-bottom: none;
  }
  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #6c757d;
    margin-right: 1rem;
    text-align: left;
    flex-shrink: 0;
  }
  .responsive-table td > div, .responsive-table td > span {
    justify-content: flex-end !important;
    text-align: right;
  }
  .responsive-table td[colspan] {
    justify-content: center;
  }
  .responsive-table td[colspan]::before {
    display: none;
  }
}
@media (min-width: 768px) {
  .responsive-table {
    display: table;
    min-width: 800px;
  }
}

.custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
.custom-scrollbar-y::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-y::-webkit-scrollbar-thumb { background: #00998150; border-radius: 10px; }
</style>