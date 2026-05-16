<template>
  <div class="gallery-index-wrapper pb-5 mb-5">
    
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Chân Dung SORA</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>

          <router-link :to="{ name: 'admin-gallery-create' }" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm">
            <i class="bi bi-plus-circle-fill me-1"></i> Thêm Ảnh Mới
          </router-link>
        </div>
      </div>

      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden custom-scrollbar-x pb-1">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ galleries.filter(g => !g.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'active' }" @click.prevent="switchTab('active')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Hiển thị
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">{{ galleries.filter(g => g.mappedStatus === 'active' && !g.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'inactive' }" @click.prevent="switchTab('inactive')">
              <i class="bi bi-eye-slash-fill me-2 text-warning"></i> Đã ẩn
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'inactive'}">{{ galleries.filter(g => g.mappedStatus === 'inactive' && !g.deleted_at).length }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'deleted' }" @click.prevent="switchTab('deleted')">
              <i class="bi bi-trash3-fill me-2 text-danger"></i> Đã xóa
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'deleted'}">{{ galleries.filter(g => g.deleted_at).length }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi bi-images text-brand me-1"></i> Thư viện ảnh
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <div class="search-box position-relative" style="width: 280px; max-width: 100%;">
              <input type="text" class="form-control form-control-sm rounded-pill pe-5 shadow-sm bg-light border-0 py-2" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm kiếm tiêu đề ảnh...">
              <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            </div>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 900px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 15%;">Hình ảnh</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 35%;">Tiêu đề</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Ngày tải lên</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 15%;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <div class="spinner-border spinner-border-sm text-brand mb-2" role="status"></div>
                    <div class="small fw-semibold">Đang tải dữ liệu...</div>
                  </td>
                </tr>
                <tr v-else-if="displayGalleries.length === 0">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-images fs-1 d-block mb-2 opacity-25"></i>Không có hình ảnh nào.
                  </td>
                </tr>
                <tr v-else v-for="item in displayGalleries" :key="item.id" 
                    :class="{'bg-light opacity-75': item.deleted_at || item.mappedStatus === 'inactive'}">
                  
                  <td class="px-4 py-3">
                    <div class="gallery-thumbnail shadow-sm border position-relative overflow-hidden" 
                         style="background-color: #f3f4f6;">
                      <img v-if="item.mappedImageUrl" :src="item.mappedImageUrl" class="w-100 h-100 object-fit-cover" alt="Image" @error="handleImageError" />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                        <i class="bi bi-image"></i>
                      </div>
                    </div>
                  </td>

                  <td class="px-4">
                    <h6 class="mb-0 fw-bold text-dark text-truncate" :title="item.mappedTitle">{{ item.mappedTitle }}</h6>
                    <small class="text-muted d-block mt-1">ID: #{{ item.id }}</small>
                  </td>

                  <td class="px-4">
                    <div class="small fw-semibold text-dark">
                      {{ formatDate(item.created_at) }}
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <span v-if="item.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i class="bi bi-trash3-fill"></i> Đã xóa</span>
                    <div v-else class="d-flex align-items-center justify-content-center gap-1">
                      <select class="form-select form-select-sm border shadow-sm fw-semibold" 
                              style="width: 110px; font-size: 0.8rem;"
                              :class="getStatusSelectClass(item.localStatus)"
                              v-model="item.localStatus"
                              @change="checkStatusChange(item)"
                              :disabled="item.isUpdatingStatus">
                        <option value="active">Hiển thị</option>
                        <option value="inactive">Đã ẩn</option>
                      </select>
                      
                      <button v-if="item.isStatusChanged && !item.isUpdatingStatus" @click="saveGalleryStatus(item)" class="btn btn-sm btn-success rounded-circle shadow-sm px-2 py-1" title="Lưu">
                        <i class="bi bi-check-lg fw-bold"></i>
                      </button>
                      <button v-if="item.isStatusChanged && !item.isUpdatingStatus" @click="cancelStatusChange(item)" class="btn btn-sm btn-light rounded-circle shadow-sm px-2 py-1 text-danger border" title="Hủy">
                        <i class="bi bi-x-lg fw-bold"></i>
                      </button>
                      <span v-if="item.isUpdatingStatus" class="spinner-border spinner-border-sm text-brand ms-1"></span>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <button class="btn btn-sm btn-light text-info me-1 shadow-sm border" title="Xem ảnh lớn" @click="openQuickView(item)">
                      <i class="bi bi-arrows-fullscreen"></i>
                    </button>
                    <template v-if="!item.deleted_at">
                      <router-link :to="{ name: 'admin-gallery-edit', params: { id: item.id } }" class="btn btn-sm btn-light text-primary me-1 shadow-sm border" title="Chỉnh sửa">
                        <i class="bi bi-pencil-square"></i>
                      </router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(item.id, item.mappedTitle)" title="Xóa">
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

      <div class="d-flex justify-content-between align-items-center" v-if="totalPages > 1">
        <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedGalleries.length) }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"><button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0 position-absolute w-100 z-3" style="top: 0;">
            <button type="button" class="btn-close bg-white rounded-circle p-2 shadow-sm ms-auto mt-2 me-2" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0" v-if="selectedGallery">
            
            <div class="row g-0">
              <div class="col-md-7 bg-light rounded-start-4 d-flex align-items-center justify-content-center p-3" style="min-height: 400px;">
                <img :src="selectedGallery.mappedImageUrl" class="img-fluid rounded shadow-sm" style="max-height: 60vh; object-fit: contain;" alt="Preview" @error="handleImageError" />
              </div>
              
              <div class="col-md-5 p-4 d-flex flex-column justify-content-center">
                <div class="mb-4">
                  <span class="badge px-3 py-2 rounded-pill mb-3 shadow-sm" :class="selectedGallery.mappedStatus === 'active' ? 'bg-success text-white' : 'bg-warning text-dark'">
                    {{ selectedGallery.mappedStatus === 'active' ? 'Đang hiển thị' : 'Đang ẩn' }}
                  </span>
                  <h4 class="fw-bold mb-2">{{ selectedGallery.mappedTitle }}</h4>
                  <p class="text-muted small mb-0"><i class="bi bi-calendar3 me-1"></i> Tải lên: {{ formatDate(selectedGallery.created_at) }}</p>
                </div>

                <div class="bg-light p-3 rounded-4 shadow-sm border border-light-subtle small mt-auto">
                  <div class="row mb-2 pb-2 border-bottom">
                    <div class="col-5 text-muted fw-semibold">ID Ảnh:</div>
                    <div class="col-7 fw-bold text-end text-brand">#{{ selectedGallery.id }}</div>
                  </div>
                  <div class="row">
                    <div class="col-12 mt-2">
                      <button class="btn btn-outline-brand w-100 btn-sm" @click="copyToClipboard(selectedGallery.mappedImageUrl)">
                        <i class="bi bi-link-45deg me-1"></i> Sao chép Link Ảnh
                      </button>
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
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';

defineOptions({ name: 'GalleryIndex' });

const route = useRoute();
const galleries = ref([]);
const systemModules = ref([]);
const currentPageLevel = ref(null);
const isLoading = ref(true);
const isFirstLoad = ref(true); 
const searchQuery = ref('');
const activeTab = ref('active');
const currentPage = ref(1);
const itemsPerPage = 8; 

const selectedGallery = ref(null);
let quickViewModalInstance = null;

// SỬ DỤNG .ENV CHO API BASE URL NHƯ BẠN YÊU CẦU
const API_URL = import.meta.env.VITE_API_BASE_URL;
import { getFullImage, STORAGE_URL } from '@/utils/axios';
// Lấy đường dẫn base (không có /api) để trỏ vào thư mục storage ảnh
const BASE_URL = API_URL.replace('/api', '');

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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

// Hàm xử lý ảnh lỗi an toàn, không gọi ra nguồn ngoài chống vòng lặp vô hạn
const handleImageError = (e) => {
  e.target.onerror = null; 
  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22150%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23888%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3Eno%20image%3C%2Ftext%3E%3C%2Fsvg%3E';
};

const fetchData = async () => {
  if (!isFirstLoad.value) isLoading.value = true;
  try {
    const [resGalleries, resModules] = await Promise.all([
      axios.get(`${API_URL}/admin/galleries`, { headers: getHeaders() }),
      axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() })
    ]);

    if (resGalleries.data) {
        let rawData = Array.isArray(resGalleries.data) ? resGalleries.data : (resGalleries.data.data || []);
        
        galleries.value = rawData.map(g => {
          
          // MAP 1: Lấy cột title mới tạo, nếu rỗng thì hiện ID cho đỡ trống
          const mappedTitle = g.title || `Ảnh chân dung #${g.id}`;
          
          // MAP 2: Xử lý đường dẫn ảnh (áp dụng BASE_URL)
          let mappedImageUrl = g.image_path || '';
          if (mappedImageUrl && !mappedImageUrl.startsWith('http') && !mappedImageUrl.startsWith('data:image')) {
              mappedImageUrl = `${BASE_URL}/storage/${mappedImageUrl}`;
          }

          // MAP 3: Bắt đúng cột is_active của Backend
          let mappedStatus = (g.is_active === 1 || g.is_active === true || g.is_active === '1') ? 'active' : 'inactive';

          return {
            ...g,
            mappedTitle: mappedTitle,
            mappedImageUrl: mappedImageUrl,
            mappedStatus: mappedStatus,
            localStatus: mappedStatus,
            isStatusChanged: false,
            isUpdatingStatus: false
          };
        });
    }
    
    if (resModules.data) {
      systemModules.value = resModules.data.data;
      const currentModule = systemModules.value.find(m => m.module_code === (route.meta?.moduleCode || 'admin_gallery'));
      if (currentModule) currentPageLevel.value = currentModule.required_level;
    }
  } catch (err) { 
      console.error('Lỗi khi tải dữ liệu:', err); 
  } finally { 
    isLoading.value = false;
    isFirstLoad.value = false;
  }
};

const getStatusSelectClass = (status) => {
  const map = { 
    'active': 'text-success border-success bg-success bg-opacity-10', 
    'inactive': 'text-warning border-warning bg-warning bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

useAdminRefreshListener((payload) => {
  if (payload.module === 'galleries') {
    fetchData();
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Kho ảnh đã được cập nhật', showConfirmButton: false, timer: 2000 });
  }
});

const checkStatusChange = (item) => { item.isStatusChanged = (item.localStatus !== item.mappedStatus); };
const cancelStatusChange = (item) => { item.localStatus = item.mappedStatus; item.isStatusChanged = false; };

const saveGalleryStatus = async (item) => {
  item.isUpdatingStatus = true;
  
  // Trả ngược data về chuẩn is_active của Backend
  const payload = { 
    is_active: item.localStatus === 'active' ? 1 : 0 
  };

  try {
    // Đã thay thế bằng API_URL
    await axios.put(`${API_URL}/admin/galleries/${item.id}`, payload, { headers: getHeaders() });
    
    item.mappedStatus = item.localStatus; 
    item.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
  } catch (err) { 
    console.error('Lỗi cập nhật:', err);
    cancelStatusChange(item); 
    Swal.fire('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái', 'error'); 
  } finally { 
    item.isUpdatingStatus = false; 
  }
};

const switchTab = (tabId) => { 
  activeTab.value = tabId; 
  currentPage.value = 1; 
};

const openQuickView = (item) => {
  selectedGallery.value = item;
  if (!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewModal'));
  quickViewModalInstance.show();
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã copy link ảnh!', showConfirmButton: false, timer: 1500 });
  });
};

const processedGalleries = computed(() => {
  let result = galleries.value;
  if (activeTab.value === 'deleted') { result = result.filter(g => g.deleted_at); } 
  else {
    result = result.filter(g => !g.deleted_at);
    if (activeTab.value !== 'all') result = result.filter(g => g.mappedStatus === activeTab.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(g => g.mappedTitle?.toLowerCase().includes(q));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(processedGalleries.value.length / itemsPerPage) || 1);

const displayGalleries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage; 
  return processedGalleries.value.slice(start, start + itemsPerPage);
});

const confirmDelete = (id, title) => {
  Swal.fire({ title: 'Xóa hình ảnh?', text: `Ảnh "${title}" sẽ bị xóa khỏi hệ thống!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý xóa' }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        // Đã thay thế bằng API_URL
        await axios.delete(`${API_URL}/admin/galleries/${id}`, { headers: getHeaders() });
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

.gallery-thumbnail {
  width: 70px;
  height: 70px;
  border-radius: 10px;
}
.object-fit-cover { object-fit: cover; }

.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }
.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.border-brand { border-color: #009981 !important; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn-outline-brand { color: #009981; border: 1px solid #009981; background: transparent; transition: all 0.2s ease; }
.btn-outline-brand:hover { background: #009981; color: white; }

.custom-scrollbar-x::-webkit-scrollbar { height: 4px; }
.custom-scrollbar-x::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
</style>