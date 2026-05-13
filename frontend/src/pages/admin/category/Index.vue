<template>
  <div class="category-index-wrapper pb-5 mb-5">
    
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải danh mục...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <!-- Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Danh Mục Sản Phẩm</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>

          <router-link :to="{ name: 'admin-category-create' }" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm" v-if="!isReorderMode">
            <i class="bi bi-plus-circle-fill me-1"></i> Thêm Danh Mục
          </router-link>
        </div>
      </div>

      <!-- TABS ĐÃ FIX RESPONSIVE: Thêm flex-wrap và gap để tự động rớt dòng mượt mà -->
      <div class="mb-4" :class="{'opacity-50 pe-none': isReorderMode}">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ categories.filter(c => !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'active' }" @click.prevent="switchTab('active')">
              <i class="bi bi-eye-fill me-2 text-success"></i> Hiển thị
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">{{ categories.filter(c => c.status === 'active' && !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'hidden' }" @click.prevent="switchTab('hidden')">
              <i class="bi bi-eye-slash-fill me-2 text-warning"></i> Ẩn
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'hidden'}">{{ categories.filter(c => c.status === 'hidden' && !c.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'deleted' }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2 text-danger"></i> Đã xóa
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'deleted'}">{{ categories.filter(c => c.deleted_at).length }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Bảng Dữ liệu -->
      <div class="card border-0 shadow-sm rounded-4 mb-4" :class="{'border-warning border-2': isReorderMode}">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi" :class="isReorderMode ? 'bi-arrows-move text-warning' : 'bi-list-ul'"></i> 
            {{ isReorderMode ? 'Kéo thả dòng để thay đổi thứ tự ưu tiên' : 'Danh sách hiển thị' }}
          </h6>
          
          <!-- THANH CÔNG CỤ ĐÃ FIX RESPONSIVE: Thêm flex-wrap -->
          <div class="d-flex align-items-center flex-wrap gap-2">
            
            <template v-if="activeTab === 'active' && !searchQuery">
              <button class="btn btn-sm px-3 py-2 fw-bold shadow-sm transition-all" 
                      :class="isReorderMode ? 'btn-warning text-dark' : 'btn-light border text-dark'"
                      @click="toggleReorderMode">
                <i class="bi" :class="isReorderMode ? 'bi-x-circle' : 'bi-arrows-move'"></i> 
                {{ isReorderMode ? 'Hủy Sắp Xếp' : 'Sắp xếp thứ tự' }}
              </button>
            </template>

            <!-- Nút Lưu Thứ Tự xuất hiện khi bật Reorder Mode -->
            <button v-if="isReorderMode" class="btn btn-sm btn-warning text-dark fw-bold px-4 shadow-sm py-2" @click="saveReorder" :disabled="isSavingOrder">
              <span v-if="isSavingOrder" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-floppy-fill me-1" v-else></i> LƯU THỨ TỰ
            </button>

            <!-- Search box (Ẩn khi đang reorder) -->
            <div class="search-box position-relative" style="width: 280px; max-width: 100%;" v-show="!isReorderMode">
              <input type="text" class="form-control form-control-sm rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên danh mục...">
              <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" :class="{'table-reorder': isReorderMode}" style="table-layout: fixed; width: 100%; min-width: 1000px;">
              <thead class="bg-light">
                <tr>
                  <th v-if="isReorderMode" class="py-3 px-4 text-secondary border-0" style="width: 50px;"></th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 80px;">Thứ tự</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Danh mục</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 15%;">Cấp độ</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Thuộc tính (Schema)</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 20%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 20%;" v-if="!isReorderMode">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td :colspan="isReorderMode ? 6 : 7" class="text-center py-5 text-muted">
                    <div class="spinner-border spinner-border-sm text-brand mb-2" role="status"></div>
                    <div class="small fw-semibold">Đang tải dữ liệu...</div>
                  </td>
                </tr>
                <tr v-else-if="displayCategories.length === 0">
                  <td :colspan="isReorderMode ? 6 : 7" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                  </td>
                </tr>
                <!-- NATIVE HTML5 DRAG & DROP -->
                <tr v-else v-for="(cat, index) in displayCategories" :key="cat.id" 
                    :class="{'bg-light opacity-75': cat.deleted_at || cat.status === 'hidden', 'drag-item': isReorderMode, 'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index}"
                    :draggable="isReorderMode"
                    @dragstart="onDragStart(index, $event)"
                    @dragover.prevent="onDragOver(index)"
                    @dragenter.prevent="onDragEnter(index)"
                    @dragleave="onDragLeave(index)"
                    @drop="onDrop(index)"
                    @dragend="onDragEnd">
                  
                  <td v-if="isReorderMode" class="px-4 text-muted cursor-move text-center">
                    <i class="bi bi-grip-vertical fs-5 text-warning"></i>
                  </td>
                  
                  <td class="px-4 fw-bold text-center" :class="isReorderMode ? 'text-warning' : 'text-muted'">
                    {{ isReorderMode ? index + 1 : (cat.sort_order ? cat.sort_order : '-') }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                      <img :src="getImageUrl(cat.thumbnail)" @error="handleImageError" class="rounded-3 object-fit-cover me-3 border shadow-sm pe-none" style="width: 45px; height: 45px;">
                      <div class="overflow-hidden">
                        <h6 class="mb-0 fw-bold text-dark text-truncate" :title="cat.name">{{ cat.name }}</h6>
                        <small class="text-muted d-block mt-1 text-truncate"><i class="bi bi-link-45deg"></i> {{ cat.slug }}</small>
                      </div>
                    </div>
                  </td>
                  <td class="px-4">
                    <span v-if="!cat.parent_id" class="badge bg-primary bg-opacity-10 text-primary border border-primary">Danh mục Gốc</span>
                    <div v-else class="text-muted small text-truncate" :title="cat.parent?.name">Thuộc: <span class="fw-bold text-dark">{{ cat.parent?.name || '---' }}</span></div>
                  </td>
                  <td class="px-4">
                    <div class="d-flex flex-wrap gap-1" style="max-width: 200px;">
                      <span v-if="!cat.attributes_schema || cat.attributes_schema.length === 0" class="text-muted small fst-italic">Không có</span>
                      <span v-else v-for="(attr, i) in (cat.attributes_schema.slice(0, 3))" :key="i" class="badge bg-light text-secondary border">{{ attr }}</span>
                      <span v-if="cat.attributes_schema && cat.attributes_schema.length > 3" class="badge bg-light text-secondary border">...</span>
                    </div>
                  </td>

                  <!-- Cột Trạng thái (Inline Edit) -->
                  <td class="px-4 text-center">
                    <span v-if="cat.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i class="bi bi-trash3-fill"></i> Đã xóa</span>
                    <div v-else class="d-flex align-items-center justify-content-center gap-1">
                      <select class="form-select form-select-sm border shadow-sm fw-semibold flex-shrink-0" 
                              style="width: 110px; font-size: 0.8rem;"
                              :class="getStatusSelectClass(cat.localStatus || cat.status)"
                              v-model="cat.localStatus"
                              @change="checkStatusChange(cat)"
                              :disabled="cat.isUpdatingStatus || isReorderMode">
                        <option value="active">Hiển thị</option>
                        <option value="hidden">Đang ẩn</option>
                      </select>
                      
                      <!-- Khung cố định chống nhảy -->
                      <div class="d-flex align-items-center justify-content-start flex-shrink-0" style="min-width: 55px; height: 28px;">
                        <div v-if="cat.isUpdatingStatus" class="spinner-border text-brand ms-1" style="width: 1.1rem; height: 1.1rem; border-width: 0.15em;" role="status"></div>
                        <template v-else-if="cat.isStatusChanged">
                          <button @click="saveCategoryStatus(cat)" class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Lưu">
                            <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                          <button @click="cancelStatusChange(cat)" class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0;" title="Hủy">
                            <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                          </button>
                        </template>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 text-center" v-if="!isReorderMode">
                    <button class="btn btn-sm btn-light text-info me-2 shadow-sm border" title="Xem chi tiết" @click="openQuickView(cat)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <template v-if="!cat.deleted_at">
                      <router-link :to="{ name: 'admin-category-edit', params: { id: cat.id } }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border" title="Chỉnh sửa">
                        <i class="bi bi-pencil-square"></i>
                      </router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(cat.id, cat.name)" title="Đưa vào thùng rác">
                        <i class="bi bi-trash"></i>
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-light text-success shadow-sm border" @click="restoreCategory(cat.id)" title="Khôi phục">
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Phân trang (Ẩn khi đang sắp xếp) -->
      <div class="d-flex justify-content-between align-items-center" v-if="totalPages > 1 && !isReorderMode">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedCategories.length) }}</span>
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
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="fw-bold text-dark">Chi Tiết Danh Mục</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedCategory">
            <div class="row">
              <div class="col-md-5 text-center border-end mb-4 mb-md-0">
                <img :src="getImageUrl(selectedCategory.thumbnail)" @error="handleImageError" class="rounded-4 shadow-sm border border-2 border-light object-fit-cover mb-3" style="width: 100%; max-height: 250px;">
                <h5 class="fw-bold mb-1">{{ selectedCategory.name }}</h5>
                <p class="text-muted small mb-3">/{{ selectedCategory.slug }}</p>
                <span class="badge px-3 py-2 rounded-pill" :class="selectedCategory.status === 'active' ? 'bg-success text-white' : (selectedCategory.status === 'hidden' ? 'bg-warning text-dark' : 'bg-danger text-white')">
                  {{ selectedCategory.status === 'active' ? 'Đang hiển thị' : 'Đang ẩn' }}
                </span>
              </div>
              <div class="col-md-7">
                <div class="bg-light p-3 rounded-4 shadow-sm border border-light-subtle small mb-3">
                  <div class="mb-2 pb-2 border-bottom">
                    <span class="text-muted fw-semibold d-block mb-1"><i class="bi bi-diagram-3 text-brand me-1"></i>Cấp độ:</span>
                    <span v-if="!selectedCategory.parent_id" class="badge bg-primary bg-opacity-10 text-primary border border-primary">Danh mục Gốc</span>
                    <span v-else class="fw-bold text-dark">Thuộc: {{ selectedCategory.parent?.name || 'Không xác định' }}</span>
                  </div>
                  <div class="mb-2 pb-2 border-bottom">
                    <span class="text-muted fw-semibold d-block mb-1"><i class="bi bi-card-text text-brand me-1"></i>Mô tả:</span>
                    <span class="text-dark">{{ selectedCategory.description || 'Chưa có mô tả.' }}</span>
                  </div>
                  <div class="mb-2 pb-2 border-bottom">
                    <span class="text-muted fw-semibold d-block mb-1"><i class="bi bi-sort-numeric-down text-brand me-1"></i>Thứ tự ưu tiên:</span>
                    <span class="badge bg-dark text-white">{{ selectedCategory.sort_order || '-' }}</span>
                  </div>
                  <div class="mb-2">
                    <span class="text-muted fw-semibold d-block mb-2"><i class="bi bi-tags text-brand me-1"></i>Thuộc tính Schema:</span>
                    <div class="d-flex flex-wrap gap-2">
                      <span v-if="!selectedCategory.attributes_schema || selectedCategory.attributes_schema.length === 0" class="text-muted fst-italic">Không có thuộc tính.</span>
                      <span v-else v-for="(attr, i) in selectedCategory.attributes_schema" :key="i" class="badge bg-white text-secondary border shadow-sm px-2 py-1">{{ attr }}</span>
                    </div>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Import fallback image
import defaultImage from '../../../assets/images/defaults/placeholder.png'; 

const route = useRoute();
const categories = ref([]);
const systemModules = ref([]);
const currentPageLevel = ref(null);
const isLoading = ref(true);
const isFirstLoad = ref(true); 
const searchQuery = ref('');
const activeTab = ref('all');
const currentPage = ref(1);
const itemsPerPage = 10;

const selectedCategory = ref(null);
let quickViewModalInstance = null;

// DRAG & DROP STATES
const isReorderMode = ref(false);
const isSavingOrder = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const reorderList = ref([]); 

// AXIOS: Header
const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

// HÀM BẮT LỖI AXIOS DÙNG CHUNG
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

const getImageUrl = (path) => path ? `${API_URL}/storage/${path}` : defaultImage;
const handleImageError = (e) => { e.target.src = defaultImage; };

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

// AXIOS: FETCH DATA
const fetchData = async () => {
  if (!isFirstLoad.value) isLoading.value = true;
  try {
    const [resCategories, resModules] = await Promise.all([
      axios.get(`${API_URL}/admin/categories`, { headers: getHeaders() }),
      axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() })
    ]);

    const rawData = Array.isArray(resCategories.data.data) ? resCategories.data.data : (resCategories.data.data?.data || []);
    
    categories.value = rawData.map(c => ({
      ...c, localStatus: c.status, isStatusChanged: false, isUpdatingStatus: false
    })).sort((a, b) => a.sort_order - b.sort_order);
    
    systemModules.value = resModules.data.data;
    const currentModule = systemModules.value.find(m => m.module_code === (route.meta?.moduleCode || 'admin_categories'));
    if (currentModule) currentPageLevel.value = currentModule.required_level;
    
  } catch (err) { 
    console.error('Lỗi khi tải dữ liệu', err); 
  } finally { 
    isLoading.value = false;
    isFirstLoad.value = false;
  }
};

// ======================= DRAG AND DROP LOGIC =======================
const toggleReorderMode = () => {
  if (activeTab.value !== 'active') {
    Swal.fire('Lưu ý', 'Chỉ có thể sắp xếp các danh mục đang Hiển thị!', 'info');
    return;
  }
  
  isReorderMode.value = !isReorderMode.value;
  if (isReorderMode.value) {
    searchQuery.value = ''; 
    reorderList.value = JSON.parse(JSON.stringify(processedCategories.value));
  }
};

const onDragStart = (index, event) => {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.dropEffect = 'move';
  setTimeout(() => event.target.classList.add('opacity-50'), 0);
};
const onDragOver = (index) => { event.dataTransfer.dropEffect = 'move'; };
const onDragEnter = (index) => { if (draggedIndex.value !== index) dragOverIndex.value = index; };
const onDragLeave = (index) => { if (dragOverIndex.value === index) dragOverIndex.value = null; };
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

// AXIOS: LƯU SẮP XẾP
const saveReorder = async () => {
  isSavingOrder.value = true;
  const payload = reorderList.value.map((cat, index) => ({
    id: cat.id,
    sort_order: index + 1
  }));

  try {
    await axios.post(`${API_URL}/admin/categories/reorder`, { categories: payload }, { headers: getHeaders() });
    Swal.fire({icon: 'success', title: 'Đã lưu thứ tự!', timer: 1500, showConfirmButton: false});
    isReorderMode.value = false;
    await fetchData(); 
  } catch (err) {
    handleAxiosError(err, 'Không thể cập nhật thứ tự');
  } finally {
    isSavingOrder.value = false;
  }
};

// ================= INLINE STATUS =================
const getStatusSelectClass = (status) => {
  const map = { 
    'active': 'text-success border-success bg-success bg-opacity-10', 
    'hidden': 'text-warning border-warning bg-warning bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

const checkStatusChange = (cat) => { cat.isStatusChanged = (cat.localStatus !== cat.status); };
const cancelStatusChange = (cat) => { cat.localStatus = cat.status; cat.isStatusChanged = false; };

// AXIOS: CẬP NHẬT TRẠNG THÁI NHANH
const saveCategoryStatus = async (cat) => {
  cat.isUpdatingStatus = true;
  const formData = new FormData();
  formData.append('_method', 'PUT'); 
  formData.append('name', cat.name);
  formData.append('slug', cat.slug);
  formData.append('status', cat.localStatus); 

  try {
    await axios.post(`${API_URL}/admin/categories/${cat.id}`, formData, { headers: getHeaders() });
    cat.status = cat.localStatus; 
    cat.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
    fetchData(); 
  } catch (error) { 
    cancelStatusChange(cat); 
    handleAxiosError(error, 'Không thể cập nhật trạng thái');
  } finally { 
    cat.isUpdatingStatus = false; 
  }
};

const switchTab = (tabId) => { 
  activeTab.value = tabId; 
  currentPage.value = 1; 
  isReorderMode.value = false; 
};

const openQuickView = (cat) => {
  selectedCategory.value = cat;
  if (!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewModal'));
  quickViewModalInstance.show();
};

const processedCategories = computed(() => {
  let result = categories.value;
  if (activeTab.value === 'deleted') { result = result.filter(c => c.deleted_at); } 
  else {
    result = result.filter(c => !c.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(c => c.status === activeTab.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c => (c.name?.toLowerCase().includes(q)) || (c.slug?.toLowerCase().includes(q)));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedCategories.value.length / itemsPerPage) || 1);

const displayCategories = computed(() => {
  if (isReorderMode.value) return reorderList.value;
  const start = (currentPage.value - 1) * itemsPerPage; 
  return processedCategories.value.slice(start, start + itemsPerPage);
});

// AXIOS: ĐƯA VÀO THÙNG RÁC
const confirmDelete = (id, name) => {
  Swal.fire({ title: 'Xóa danh mục?', text: `Danh mục "${name}" sẽ bị đưa vào thùng rác!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý xóa' }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        await axios.delete(`${API_URL}/admin/categories/${id}`, { headers: getHeaders() });
        Swal.fire({icon: 'success', title: 'Đã xóa', timer: 1500, showConfirmButton: false});
        fetchData();
      } catch(e) {
        isLoading.value = false;
        handleAxiosError(e, 'Không thể xóa');
      }
    }
  });
};

// AXIOS: KHÔI PHỤC DANH MỤC
const restoreCategory = (id) => {
  Swal.fire({ title: 'Khôi phục danh mục?', icon: 'info', showCancelButton: true, confirmButtonColor: '#009981', confirmButtonText: 'Khôi phục' }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        await axios.post(`${API_URL}/admin/categories/${id}/restore`, {}, { headers: getHeaders() });
        Swal.fire({icon: 'success', title: 'Đã khôi phục', timer: 1500, showConfirmButton: false});
        fetchData();
      } catch(e) {
        isLoading.value = false;
        handleAxiosError(e, 'Không thể khôi phục');
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
.cursor-move { cursor: grab; }
.cursor-move:active { cursor: grabbing; }
.drag-item { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.drag-over { border-top: 3px solid #ffc107 !important; background-color: #fff9e6 !important; }
.dragging { opacity: 0.5; background-color: #f8f9fa; }
.transition-all { transition: all 0.3s ease; }
</style>