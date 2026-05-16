<template>
  <div class="banner-index-wrapper pb-5 mb-5">
    
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu banner...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Banner Quảng Cáo</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3 flex-wrap">
          <router-link :to="{ name: 'admin-banners-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill" v-if="!isReorderMode">
            <i class="bi bi-plus-circle me-1"></i> Thêm Banner
          </router-link>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4" :class="{'border-warning border-2': isReorderMode}">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark">
            <i class="bi" :class="isReorderMode ? 'bi-arrows-move text-warning' : 'bi-images'"></i> 
            {{ isReorderMode ? 'Kéo thả dòng để thay đổi thứ tự ưu tiên' : 'Danh sách Banner' }}
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm px-3 py-2 fw-bold shadow-sm transition-all" 
                    :class="isReorderMode ? 'btn-warning text-dark' : 'btn-light border text-dark'"
                    @click="toggleReorderMode">
              <i class="bi" :class="isReorderMode ? 'bi-x-circle' : 'bi-arrows-move'"></i> 
              {{ isReorderMode ? 'Hủy Sắp Xếp' : 'Sắp xếp thứ tự' }}
            </button>
            <button v-if="isReorderMode" class="btn btn-sm btn-success text-white fw-bold px-4 shadow-sm py-2" @click="saveReorder" :disabled="isSavingOrder">
              <span v-if="isSavingOrder" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-floppy-fill me-1" v-else></i> LƯU THỨ TỰ
            </button>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1000px;" :class="{'table-reorder': isReorderMode}">
              <thead class="bg-light">
                <tr>
                  <th v-if="isReorderMode" class="py-3 px-4 text-secondary border-0 text-center" style="width: 50px;"></th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 80px;">STT</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Hiển thị (PC & Mobile)</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Thông tin Chiến dịch</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Thời gian chạy</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 15%" v-if="!isReorderMode">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isTableLoading"><td :colspan="isReorderMode ? 6 : 7" class="text-center py-5"><div class="spinner-border text-brand mb-2"></div></td></tr>
                <tr v-else-if="banners.length === 0"><td :colspan="isReorderMode ? 6 : 7" class="text-center py-5 text-muted">Không có banner nào.</td></tr>
                
                <tr v-else v-for="(banner, index) in displayBanners" :key="banner.id" 
                    :class="{'bg-light opacity-75': banner.deleted_at || banner.status === 'hidden', 'drag-item': isReorderMode, 'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index}"
                    :draggable="isReorderMode" @dragstart="onDragStart(index, $event)" @dragover.prevent="onDragOver(index, $event)" @dragenter.prevent="onDragEnter(index)" @dragleave="onDragLeave(index)" @drop="onDrop(index)" @dragend="onDragEnd">
                  
                  <td v-if="isReorderMode" class="px-4 text-muted cursor-move text-center"><i class="bi bi-grip-vertical fs-5 text-warning"></i></td>
                  
                  <td class="px-4 fw-bold text-center" :class="isReorderMode ? 'text-warning' : 'text-muted'">
                    {{ isReorderMode ? index + 1 : (banner.sort_order ? banner.sort_order : '-') }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="d-flex gap-2 align-items-center">
                      <div class="position-relative shadow-sm border rounded overflow-hidden bg-white" style="width: 80px; height: 45px;">
                        <img :src="getImageUrl(banner.image_desktop)" class="w-100 h-100 object-fit-cover">
                        <span class="position-absolute bottom-0 start-0 bg-dark text-white opacity-75 fw-bold" style="font-size: 0.55rem; padding: 1px 4px;">PC</span>
                      </div>
                      <div class="position-relative shadow-sm border rounded overflow-hidden bg-white" style="width: 30px; height: 45px;">
                        <img :src="getImageUrl(banner.image_mobile)" class="w-100 h-100 object-fit-cover">
                        <span class="position-absolute bottom-0 start-0 bg-dark text-white opacity-75 fw-bold" style="font-size: 0.55rem; padding: 1px 2px;">MB</span>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-4">
                    <div class="fw-bold text-dark mb-1 text-truncate" :title="banner.title">{{ banner.title }}</div>
                    <div class="text-muted small">
                      <i class="bi bi-building text-brand me-1"></i> 
                      <span v-if="banner.brand" class="badge bg-light text-dark border">{{ banner.brand.name }}</span>
                      <span v-else class="badge bg-secondary text-white">Toàn hệ thống</span>
                    </div>
                  </td>

                  <td class="px-4">
                    <div class="small font-monospace">
                      <div class="text-success text-truncate"><i class="bi bi-play-circle-fill me-1"></i>{{ formatDate(banner.start_date) || 'Ngay lập tức' }}</div>
                      <div class="text-danger text-truncate mt-1"><i class="bi bi-stop-circle-fill me-1"></i>{{ formatDate(banner.end_date) || 'Không giới hạn' }}</div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <span v-if="banner.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"><i class="bi bi-trash3-fill"></i> Đã xóa</span>
                    <select v-else class="form-select form-select-sm border shadow-sm fw-semibold mx-auto" 
                            style="width: 120px; font-size: 0.8rem;"
                            :class="banner.status === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-warning border-warning bg-warning bg-opacity-10'"
                            v-model="banner.status" @change="updateStatus(banner)" :disabled="isReorderMode">
                      <option value="active">Đang hiển thị</option>
                      <option value="hidden">Đang ẩn</option>
                    </select>
                  </td>

                  <td class="px-4 text-center" v-if="!isReorderMode">
                    <template v-if="!banner.deleted_at">
                      <router-link :to="{ name: 'admin-banners-edit', params: {id: banner.id} }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border" title="Sửa"><i class="bi bi-pencil-square"></i></router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(banner.id)" title="Xóa"><i class="bi bi-trash"></i></button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-light text-success shadow-sm border" @click="restoreBanner(banner.id)" title="Khôi phục"><i class="bi bi-arrow-counterclockwise"></i></button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';
import { getFullImage } from '@/composables/useUtilities';

const banners = ref([]);
const isFirstLoad = ref(true);
const isTableLoading = ref(false);

const API_URL = import.meta.env.VITE_API_BASE_URL;
import { getFullImage, STORAGE_URL } from '@/utils/axios';

const isReorderMode = ref(false);
const isSavingOrder = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const reorderList = ref([]);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });
const getImageUrl = (path) => path ? getFullImage(path) : '/placeholder.png';

const formatDate = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  return d.toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'});
};

const fetchData = async () => {
  if(!isFirstLoad.value) isTableLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/admin/banners`, { headers: getHeaders() });
    if (res.ok) banners.value = (await res.json()).data;
  } catch (err) {} finally { isFirstLoad.value = false; isTableLoading.value = false; }
};

const displayBanners = computed(() => {
  return isReorderMode.value ? reorderList.value : banners.value;
});

const updateStatus = async (banner) => {
  const fd = new FormData();
  fd.append('_method', 'PUT'); 
  fd.append('title', banner.title);
  fd.append('status', banner.status);
  
  try {
    const res = await fetch(`${API_URL}/admin/banners/${banner.id}`, { method: 'POST', headers: getHeaders(), body: fd });
    if(res.ok) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái', showConfirmButton: false, timer: 1500 });
        fetchData();
    }
  } catch(e) { Swal.fire('Lỗi', 'Không thể cập nhật', 'error'); }
};

const confirmDelete = (id) => {
  Swal.fire({ title: 'Xóa Banner?', text: 'Banner sẽ được đưa vào thùng rác.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Xóa', confirmButtonColor: '#d33' }).then(async (res) => {
    if (res.isConfirmed) {
      await fetch(`${API_URL}/admin/banners/${id}`, { method: 'DELETE', headers: getHeaders() });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa banner', showConfirmButton: false, timer: 1500 });
      fetchData();
    }
  });
};

const restoreBanner = async (id) => {
    const res = await fetch(`${API_URL}/admin/banners/${id}/restore`, { method: 'POST', headers: getHeaders() });
    if(res.ok) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã khôi phục', showConfirmButton: false, timer: 1500 });
        fetchData();
    }
}

// Drag & Drop (Giống Brand)
const toggleReorderMode = () => {
  isReorderMode.value = !isReorderMode.value;
  if (isReorderMode.value) reorderList.value = JSON.parse(JSON.stringify(banners.value.filter(b => !b.deleted_at && b.status === 'active')));
};
const onDragStart = (idx, e) => { draggedIndex.value = idx; e.dataTransfer.effectAllowed = 'move'; };
const onDragOver = (idx, e) => { e.dataTransfer.dropEffect = 'move'; };
const onDragEnter = (idx) => { if (draggedIndex.value !== idx) dragOverIndex.value = idx; };
const onDragLeave = (idx) => { if (dragOverIndex.value === idx) dragOverIndex.value = null; };
const onDrop = (idx) => {
  if (draggedIndex.value !== null && draggedIndex.value !== idx) {
    const item = reorderList.value.splice(draggedIndex.value, 1)[0];
    reorderList.value.splice(idx, 0, item);
  }
  dragOverIndex.value = null;
};
const onDragEnd = () => { draggedIndex.value = null; dragOverIndex.value = null; };

const saveReorder = async () => {
  isSavingOrder.value = true;
  const payload = reorderList.value.map((b, idx) => ({ id: b.id, sort_order: idx + 1 }));
  try {
    const res = await fetch(`${API_URL}/admin/banners/reorder`, { method: 'POST', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ items: payload }) });
    if(res.ok) {
        Swal.fire({icon: 'success', title: 'Đã lưu thứ tự!', timer: 1500, showConfirmButton: false});
        isReorderMode.value = false; fetchData();
    }
  } catch (e) {} finally { isSavingOrder.value = false; }
};

useAdminRefreshListener((payload) => {
  if (payload.module === 'banners') {
    fetchData();
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Banner đã được cập nhật', showConfirmButton: false, timer: 2000 });
  }
});

useAdminRefreshListener((payload) => {
  if (payload.module === 'banners') {
    fetchData();
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Banner đã được cập nhật', showConfirmButton: false, timer: 2000 });
  }
});

onMounted(() => fetchData());
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; background: linear-gradient(120deg, #009981, #4dffdf, #009981); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }

.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; }

.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; } 
.btn-outline-brand:hover { background-color: #009981; color: white; }

.cursor-move { cursor: grab; }
.drag-over { border-top: 3px solid #ffc107 !important; background-color: #fff9e6 !important; }
.dragging { opacity: 0.5; }
</style>