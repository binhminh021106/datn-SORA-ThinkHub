<template>
  <div class="brand-index-wrapper pb-5 mb-5">
    
    <!-- MÀN HÌNH CHỜ ĐỘC LẬP (SHIMMER) CHỈ CHẠY 1 LẦN ĐẦU TIÊN VÀO TRANG -->
    <div v-if="isPageLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu thương hiệu...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Thương hiệu (Brands)</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
<router-link :to="{ name: 'admin-brands-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill" v-if="!isReorderMode">
            <i class="bi bi-plus-circle me-1"></i> Thêm Thương hiệu
          </router-link>
        </div>
      </div>

      <!-- TABS LỌC TRẠNG THÁI -->
      <div class="mb-4" :class="{'opacity-50 pe-none': isReorderMode}">
        <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden custom-scrollbar-x pb-1">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">
                {{ localBrands.filter(b => !b.deleted_at).length }}
              </span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'active' }" @click.prevent="switchTab('active')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đang hiển thị
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">
                {{ localBrands.filter(b => b.status === 'active' && !b.deleted_at).length }}
              </span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'hidden' }" @click.prevent="switchTab('hidden')">
              <i class="bi bi-eye-slash-fill me-2 text-warning"></i> Đang ẩn
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'hidden'}">
                {{ localBrands.filter(b => b.status === 'hidden' && !b.deleted_at).length }}
              </span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'deleted' }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2"></i> Đã xóa
              <span class="badge ms-2 rounded-pill bg-danger text-white">
                {{ localBrands.filter(b => b.deleted_at).length }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4" :class="{'border-warning border-2': isReorderMode}">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi" :class="isReorderMode ? 'bi-arrows-move text-warning' : 'bi-list-ul'"></i> 
            {{ isReorderMode ? 'Kéo thả dòng để thay đổi thứ tự ưu tiên' : 'Danh sách Thương hiệu' }}
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <template v-if="activeTab === 'active' && !searchQuery">
              <button class="btn btn-sm px-3 py-2 fw-bold shadow-sm transition-all" 
                      :class="isReorderMode ? 'btn-warning text-dark' : 'btn-light border text-dark'"
                      @click="toggleReorderMode">
                <i class="bi" :class="isReorderMode ? 'bi-x-circle' : 'bi-arrows-move'"></i> 
                {{ isReorderMode ? 'Hủy Sắp Xếp' : 'Sắp xếp thứ tự' }}
              </button>
            </template>

            <button v-if="isReorderMode" class="btn btn-sm btn-success text-white fw-bold px-4 shadow-sm py-2" @click="saveReorder" :disabled="isSavingOrder">
              <span v-if="isSavingOrder" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-floppy-fill me-1" v-else></i> LƯU THỨ TỰ
            </button>

            <div class="search-box position-relative" style="width: 280px; max-width: 100%;" v-show="!isReorderMode">
              <input type="text" class="form-control form-control-sm rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên thương hiệu...">
              <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 800px;" :class="{'table-reorder': isReorderMode}">
              <thead class="bg-light">
                <tr>
                  <th v-if="isReorderMode" class="py-3 px-4 text-secondary border-0" style="width: 50px;"></th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 80px;">Thứ tự</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 35%;">Thông tin Thương hiệu</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Số Sản phẩm</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 20%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 20%" v-if="!isReorderMode">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <!-- HIỆU ỨNG SKELETON KHI CHUYỂN TABS HOẶC LOADING NHẸ -->
                <template v-if="isTableLoading">
                  <tr v-for="i in 5" :key="'skeleton-'+i">
                    <td v-if="isReorderMode" style="width: 50px;"></td>
                    <td class="text-center placeholder-glow"><span class="placeholder col-4 rounded py-2"></span></td>
                    <td class="px-4 py-3">
                      <div class="d-flex align-items-center">
                        <div class="placeholder-glow flex-shrink-0 me-3">
                          <div class="placeholder rounded-3" style="width: 55px; height: 55px;"></div>
                        </div>
                        <div class="overflow-hidden w-100 placeholder-glow">
                          <span class="placeholder col-6 mb-1 rounded"></span>
                          <span class="placeholder col-4 d-block rounded"></span>
                        </div>
                      </div>
                    </td>
                    <td class="text-center placeholder-glow"><span class="placeholder col-6 rounded py-2"></span></td>
                    <td class="text-center placeholder-glow"><span class="placeholder col-8 rounded py-2"></span></td>
                    <td class="text-center placeholder-glow" v-if="!isReorderMode"><span class="placeholder col-8 rounded py-2"></span></td>
                  </tr>
                </template>

                <!-- HIỂN THỊ DỮ LIỆU THẬT -->
                <template v-else>
                  <tr v-if="displayBrands.length === 0">
                    <td :colspan="isReorderMode ? 5 : 6" class="text-center py-5 text-muted">
                      <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                    </td>
                  </tr>
                  
                  <tr v-else v-for="(brand, index) in displayBrands" :key="brand.id" 
                      :class="{'bg-light opacity-75': brand.deleted_at || brand.status === 'hidden', 'drag-item': isReorderMode, 'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index}"
                      :draggable="isReorderMode"
                      @dragstart="onDragStart(index, $event)"
                      @dragover.prevent="onDragOver(index, $event)"
                      @dragenter.prevent="onDragEnter(index)"
                      @dragleave="onDragLeave(index)"
                      @drop="onDrop(index)"
                      @dragend="onDragEnd">
                    
                    <td v-if="isReorderMode" class="px-4 text-muted cursor-move text-center">
                      <i class="bi bi-grip-vertical fs-5 text-warning"></i>
                    </td>

                    <td class="px-4 fw-bold text-center" :class="isReorderMode ? 'text-warning' : 'text-muted'">
                      {{ isReorderMode ? index + 1 : (brand.sort_order ? brand.sort_order : '-') }}
                    </td>

                    <td class="px-4 py-3">
                      <div class="d-flex align-items-center">
                        <!-- ÁP DỤNG COMPONENT SORAIMAGE VÀO THƯƠNG HIỆU -->
                        <div class="position-relative d-inline-block me-3 shadow-sm border rounded-3 overflow-hidden bg-white flex-shrink-0" style="width: 55px; height: 55px; padding: 4px;">
                          <SoraImage 
                            :src="brand.logo" 
                            :placeholder="defaultImage" 
                            imgClass="w-100 h-100 object-fit-contain pe-none" 
                            alt="Logo"
                          />
                        </div>
                        <div class="overflow-hidden">
                          <div class="fw-bold text-dark fs-6 mb-1 text-truncate" :title="brand.name">{{ brand.name }}</div>
                          <div class="text-muted small font-monospace"><i class="bi bi-link-45deg"></i> {{ brand.slug }}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-4 text-center">
                      <div class="badge bg-light text-dark border px-3 py-2 rounded-pill shadow-sm">
                          <i class="bi bi-box-seam text-brand me-1"></i> {{ brand.products_count || 0 }} SP
                      </div>
                    </td>

                    <td class="px-4 text-center">
                      <span v-if="brand.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i class="bi bi-trash3-fill"></i> Đã xóa</span>
                      <div v-else class="d-flex align-items-center justify-content-center gap-1">
                        <!-- SỬA TRẠNG THÁI NHANH (OPTIMISTIC UPDATE) -->
                        <select class="form-select form-select-sm border shadow-sm fw-semibold" 
                                style="width: 120px; font-size: 0.8rem;"
                                :class="getStatusSelectClass(brand.localStatus || brand.status)"
                                v-model="brand.localStatus"
                                @change="checkStatusChange(brand)"
                                :disabled="isUpdatingStatusId === brand.id || isReorderMode">
                          <option value="active">Đang hoạt động</option>
                          <option value="hidden">Đang ẩn</option>
                        </select>
                        
                        <div class="d-flex align-items-center justify-content-start flex-shrink-0" style="min-width: 55px; height: 28px;">
                          <span v-if="isUpdatingStatusId === brand.id" class="spinner-border spinner-border-sm text-brand ms-1"></span>
                          <template v-else-if="brand.isStatusChanged">
                            <button @click="saveBrandStatus(brand)" class="btn btn-sm btn-success rounded-circle shadow-sm px-2 py-1 ms-1" title="Lưu">
                              <i class="bi bi-check-lg fw-bold"></i>
                            </button>
                            <button @click="cancelStatusChange(brand)" class="btn btn-sm btn-light rounded-circle shadow-sm px-2 py-1 text-danger border ms-1" title="Hủy">
                              <i class="bi bi-x-lg fw-bold"></i>
                            </button>
                          </template>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 text-center" v-if="!isReorderMode">
                      <button class="btn btn-sm btn-light text-info me-2 shadow-sm border" @click="openQuickView(brand)" title="Xem nhanh"><i class="bi bi-eye"></i></button>
                      <template v-if="!brand.deleted_at">
                        <router-link :to="{ name: 'admin-brands-edit', params: {id: brand.id} }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border" title="Sửa"><i class="bi bi-pencil-square"></i></router-link>
                        <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(brand.id, brand.name)" title="Xóa"><i class="bi bi-trash"></i></button>
                      </template>
                      <template v-else>
                        <button class="btn btn-sm btn-light text-success shadow-sm border" @click="restoreBrand(brand.id)" title="Khôi phục"><i class="bi bi-arrow-counterclockwise"></i> Khôi phục</button>
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="totalPages > 1 && !isReorderMode && !isTableLoading">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedBrands.length) }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"><button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- QUICK VIEW MODAL -->
    <div class="modal fade" id="quickViewBrandModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-light border-bottom pb-3">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-building text-brand me-2"></i>Chi tiết Thương hiệu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4 text-center" v-if="selectedBrand">
            <div class="mb-4 position-relative mx-auto bg-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 120px; height: 120px; padding: 15px;">
              <SoraImage 
                :src="selectedBrand.logo" 
                :placeholder="defaultImage" 
                imgClass="img-fluid object-fit-contain" 
                style="max-height: 100%; max-width: 100%;" 
                alt="Logo"
              />
            </div>
            <h4 class="fw-bold text-dark mb-1">{{ selectedBrand.name }}</h4>
            <p class="text-muted font-monospace small mb-3">/{{ selectedBrand.slug }}</p>
            
            <div class="d-flex justify-content-center gap-3 mb-4">
              <span class="badge px-3 py-2 bg-light text-dark border shadow-sm"><i class="bi bi-box-seam text-brand me-1"></i> {{ selectedBrand.products_count || 0 }} Sản phẩm</span>
              <span class="badge px-3 py-2" :class="selectedBrand.status === 'active' ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning bg-opacity-10 text-warning border border-warning'">
                <i class="bi" :class="selectedBrand.status === 'active' ? 'bi-check-circle' : 'bi-eye-slash'"></i> 
                {{ selectedBrand.status === 'active' ? 'Đang hoạt động' : 'Đang ẩn' }}
              </span>
            </div>

            <div class="bg-light p-3 rounded-3 text-start small text-secondary shadow-sm border">
              <p class="mb-0"><strong>Mô tả:</strong> {{ selectedBrand.description || 'Chưa có mô tả.' }}</p>
            </div>
          </div>
          <div class="modal-footer border-top-0 bg-light">
             <button type="button" class="btn btn-outline-brand rounded-pill px-4 fw-bold" data-bs-dismiss="modal">Đóng</button>
             <router-link v-if="selectedBrand && !selectedBrand.deleted_at" :to="{ name: 'admin-brands-edit', params: {id: selectedBrand.id} }" class="btn btn-brand text-white rounded-pill px-4 fw-bold" @click="closeQuickView">Sửa thông tin</router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';
import { getFullImage } from '@/composables/useUtilities';

import SoraImage from '@/components/ui/SoraImage.vue';
import defaultImage from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const queryClient = useQueryClient();

const searchQuery = ref('');
const activeTab = ref('all');
const currentPageLevel = ref(null);
const isUpdatingStatusId = ref(null); 
const isTableLoading = ref(false); 

const currentPage = ref(1);
const itemsPerPage = 8; 

const isReorderMode = ref(false);
const isSavingOrder = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const reorderList = ref([]);

const selectedBrand = ref(null);
let quickViewModalInstance = null;

onBeforeUnmount(() => {
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
});

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

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

// ==========================================
// TANSTACK VUE QUERY - FETCH DATA
// ==========================================
const { data: brandsResponse, isLoading: isBrandsLoading } = useQuery({
  queryKey: ['adminBrands'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/brands`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 5 * 60 * 1000 // Cache dữ liệu thương hiệu trong 5 phút
});

const { data: modulesResponse } = useQuery({
  queryKey: ['adminModules'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 30 * 60 * 1000
});

const isPageLoading = computed(() => isBrandsLoading.value);

const localBrands = ref([]);
const rawBrandsList = computed(() => brandsResponse.value?.data || []);

// Hàm định nghĩa trước watch để đồng bộ
const syncLocalBrands = () => {
  localBrands.value = rawBrandsList.value.map(b => {
    const existing = localBrands.value.find(lb => lb.id === b.id);
    return {
      ...b,
      localStatus: existing ? existing.localStatus : b.status,
      isStatusChanged: existing ? existing.isStatusChanged : false
    };
  });
};

watch(rawBrandsList, (newList) => {
  if (newList && newList.length > 0) {
    syncLocalBrands();
  }
}, { immediate: true });

// Thiết lập quyền hạn cấp trang
watchEffect(() => {
  const modules = modulesResponse.value?.data || [];
  const currentCode = route.meta.moduleCode || 'admin_brands';
  if (currentCode && modules.length > 0) {
    const currentModule = modules.find(m => m.module_code === currentCode);
    if (currentModule) currentPageLevel.value = currentModule.required_level;
  }
  return modules;
});

const toggleReorderMode = () => {
  if (activeTab.value !== 'active') {
    Swal.fire('Lưu ý', 'Chỉ có thể sắp xếp các thương hiệu đang hoạt động!', 'info');
    return;
  }
  
  isReorderMode.value = !isReorderMode.value;
  if (isReorderMode.value) {
    searchQuery.value = ''; 
    reorderList.value = JSON.parse(JSON.stringify(processedBrands.value));
  }
};

const onDragStart = (index, event) => {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.dropEffect = 'move';
  setTimeout(() => event.target.classList.add('opacity-50'), 0);
};

const onDragOver = (index, event) => {
  event.dataTransfer.dropEffect = 'move';
};

const onDragEnter = (index) => {
  if (draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const onDragLeave = (index) => {
  if (dragOverIndex.value === index) dragOverIndex.value = null;
};

const onDrop = (index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const draggedItem = reorderList.value[draggedIndex.value];
    reorderList.value.splice(draggedIndex.value, 1);
    reorderList.value.splice(index, 0, draggedItem);
  }
  dragOverIndex.value = null;
};

const onDragEnd = (event) => {
  event.target.classList.remove('opacity-50');
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

// MUTATION SẮP XẾP THỨ TỰ (REORDER)
const reorderBrandsMutation = useMutation({
  mutationFn: async (payload) => {
    const response = await axios.post(`${API_URL}/admin/brands/reorder`, { items: payload }, { headers: getHeaders() });
    return response.data;
  },
  onMutate: () => { isSavingOrder.value = true; },
  onSuccess: (data) => {
    Swal.fire({ icon: 'success', title: 'Đã lưu thứ tự!', timer: 1500, showConfirmButton: false });
    isReorderMode.value = false;
    queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
  },
  onError: (err) => handleAxiosError(err, 'Không thể cập nhật thứ tự'),
  onSettled: () => { isSavingOrder.value = false; }
});

const saveReorder = () => {
  const payload = reorderList.value.map((brand, index) => ({
    id: brand.id,
    sort_order: index + 1
  }));
  reorderBrandsMutation.mutate(payload);
};

const switchTab = (tabId) => { 
  if (activeTab.value === tabId) return;
  isTableLoading.value = true;
  activeTab.value = tabId; 
  currentPage.value = 1; 
  isReorderMode.value = false;
  setTimeout(() => isTableLoading.value = false, 350);
};

const processedBrands = computed(() => {
  let result = localBrands.value;
  if (activeTab.value === 'deleted') { result = result.filter(r => r.deleted_at); } 
  else {
    result = result.filter(r => !r.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(r => r.status === activeTab.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(r => (r.name?.toLowerCase().includes(q)));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedBrands.value.length / itemsPerPage) || 1);

const displayBrands = computed(() => {
  if (isReorderMode.value) return reorderList.value;
  const start = (currentPage.value - 1) * itemsPerPage; 
  return processedBrands.value.slice(start, start + itemsPerPage);
});

const getStatusSelectClass = (status) => {
  const map = { 'active': 'text-success border-success bg-success bg-opacity-10', 'hidden': 'text-warning border-warning bg-warning bg-opacity-10' }; 
  return map[status] || 'bg-light text-secondary'; 
};

useAdminRefreshListener((payload) => {
  if (payload.module === 'brands') {
    queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Thương hiệu đã được cập nhật', showConfirmButton: false, timer: 2000 });
  }
});

const checkStatusChange = (brand) => { brand.isStatusChanged = (brand.localStatus !== brand.status); };
const cancelStatusChange = (brand) => { brand.localStatus = brand.status; brand.isStatusChanged = false; };

// MUTATION CẬP NHẬT TRẠNG THÁI NHANH (STATUS OPTIMISTIC UPDATE)
const updateStatusMutation = useMutation({
  mutationFn: async ({ id, formData }) => {
    const response = await axios.post(`${API_URL}/admin/brands/${id}`, formData, { headers: getHeaders() });
    return response.data;
  },
  onMutate: ({ id }) => { isUpdatingStatusId.value = id; },
  onSuccess: (data, variables) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
    queryClient.setQueryData(['adminBrands'], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map(b => b.id === variables.id ? { ...b, status: variables.status } : b)
      };
    });
    queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
  },
  onError: (error, variables) => {
    const brand = localBrands.value.find(b => b.id === variables.id);
    if (brand) cancelStatusChange(brand);
    handleAxiosError(error, 'Không thể cập nhật trạng thái');
  },
  onSettled: () => { isUpdatingStatusId.value = null; }
});

const saveBrandStatus = (brand) => {
  const formData = new FormData();
  formData.append('_method', 'PUT'); 
  formData.append('name', brand.name);
  formData.append('slug', brand.slug);
  formData.append('status', brand.localStatus); 

  updateStatusMutation.mutate({ id: brand.id, status: brand.localStatus, formData });
};

const openQuickView = (brand) => {
    selectedBrand.value = brand;
    if(!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewBrandModal'));
    quickViewModalInstance.show();
};
const closeQuickView = () => { if(quickViewModalInstance) quickViewModalInstance.hide(); };

// MUTATION XÓA MỀM
const deleteBrandMutation = useMutation({
  mutationFn: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/brands/${id}`, { headers: getHeaders() });
    return response.data;
  },
  onMutate: () => { isTableLoading.value = true; },
  onSuccess: (data, id) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã đưa vào thùng rác', showConfirmButton: false, timer: 1500 });
    queryClient.setQueryData(['adminBrands'], (old) => {
      if (!old) return old;
      return { ...old, data: old.data.map(b => b.id === id ? { ...b, deleted_at: new Date().toISOString() } : b) };
    });
    queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
  },
  onError: (err) => handleAxiosError(err, 'Không thể xóa thương hiệu'),
  onSettled: () => { isTableLoading.value = false; }
});

const confirmDelete = (id, name) => {
  Swal.fire({ title: 'Xóa Thương hiệu?', text: `Thương hiệu "${name}" sẽ bị đưa vào thùng rác!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý' }).then((result) => {
    if (result.isConfirmed) {
      deleteBrandMutation.mutate(id);
    }
  });
};

// MUTATION KHÔI PHỤC
const restoreBrandMutation = useMutation({
  mutationFn: async (id) => {
    const response = await axios.post(`${API_URL}/admin/brands/${id}/restore`, {}, { headers: getHeaders() });
    return response.data;
  },
  onMutate: () => { isTableLoading.value = true; },
  onSuccess: (data, id) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã khôi phục thành công', showConfirmButton: false, timer: 1500 });
    queryClient.setQueryData(['adminBrands'], (old) => {
      if (!old) return old;
      return { ...old, data: old.data.map(b => b.id === id ? { ...b, deleted_at: null } : b) };
    });
    queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
  },
  onError: (err) => handleAxiosError(err, 'Không thể khôi phục thương hiệu'),
  onSettled: () => { isTableLoading.value = false; }
});

const restoreBrand = (id) => {
  Swal.fire({ title: 'Khôi phục?', text: "Khôi phục thương hiệu này?", icon: 'info', showCancelButton: true, confirmButtonColor: '#009981', confirmButtonText: 'Đồng ý' }).then((result) => {
    if (result.isConfirmed) {
      restoreBrandMutation.mutate(id);
    }
  });
};
</script>

<style scoped>
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }
.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; } .border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; } .btn-brand:hover { background-color: #007a67; }

.cursor-move { cursor: grab; }
.cursor-move:active { cursor: grabbing; }
.drag-item { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.drag-over { border-top: 3px solid #ffc107 !important; background-color: #fff9e6 !important; }
.dragging { opacity: 0.5; background-color: #f8f9fa; }

.custom-scrollbar-x::-webkit-scrollbar { height: 4px; }
.custom-scrollbar-x::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
</style>