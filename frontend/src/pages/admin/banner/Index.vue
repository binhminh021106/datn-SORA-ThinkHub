<template>
  <div class="banner-index-wrapper pb-5 mb-5">
    
    <!-- 1. SHIMMER CHỈ CHẠY 1 LẦN ĐẦU TIÊN KHI CHƯA CÓ CACHE (isLoading) -->
    <div v-if="isLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu banner...</p>
    </div>

    <!-- 2. NỘI DUNG CHÍNH (Đã có Cache) -->
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
            
            <!-- Icon Loading nhỏ góc Header khi fetch ngầm -->
            <span v-if="isFetching && !isLoading" class="spinner-border spinner-border-sm text-brand ms-2" title="Đang đồng bộ dữ liệu..."></span>
          </h6>
          
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm px-3 py-2 fw-bold shadow-sm transition-all" 
                    :class="isReorderMode ? 'btn-warning text-dark' : 'btn-light border text-dark'"
                    @click="toggleReorderMode" :disabled="isFetching || isMutating">
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
                <!-- SKELETON LOADING KHI CHUYỂN TAB / ĐANG FETCH NGẦM -->
                <template v-if="isFetching && !isLoading && displayBanners.length === 0">
                  <tr v-for="i in 5" :key="'skel'+i" class="placeholder-glow">
                    <td class="px-4 text-center"><span class="placeholder col-6 rounded"></span></td>
                    <td class="px-4 py-3">
                      <div class="d-flex gap-2">
                        <span class="placeholder rounded" style="width: 80px; height: 45px;"></span>
                        <span class="placeholder rounded" style="width: 30px; height: 45px;"></span>
                      </div>
                    </td>
                    <td class="px-4"><span class="placeholder col-8 rounded mb-1"></span><br><span class="placeholder col-4 rounded-pill"></span></td>
                    <td class="px-4"><span class="placeholder col-10 rounded mb-1"></span><br><span class="placeholder col-8 rounded"></span></td>
                    <td class="px-4 text-center"><span class="placeholder col-8 rounded-pill" style="height: 30px;"></span></td>
                    <td class="px-4 text-center"><span class="placeholder col-10 rounded" style="height: 30px;"></span></td>
                  </tr>
                </template>

                <tr v-else-if="displayBanners.length === 0"><td :colspan="isReorderMode ? 6 : 7" class="text-center py-5 text-muted">Không có banner nào.</td></tr>
                
                <tr v-else v-for="(banner, index) in displayBanners" :key="banner.id" 
                    :class="{'bg-light opacity-75': banner.deleted_at || banner.status === 'hidden', 'drag-item': isReorderMode, 'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index}"
                    :draggable="isReorderMode" @dragstart="onDragStart(index, $event)" @dragover.prevent="onDragOver(index, $event)" @dragenter.prevent="onDragEnter(index)" @dragleave="onDragLeave(index)" @drop="onDrop(index)" @dragend="onDragEnd">
                  
                  <td v-if="isReorderMode" class="px-4 text-muted cursor-move text-center"><i class="bi bi-grip-vertical fs-5 text-warning"></i></td>
                  
                  <td class="px-4 fw-bold text-center" :class="isReorderMode ? 'text-warning' : 'text-muted'">
                    {{ isReorderMode ? index + 1 : (banner.sort_order ? banner.sort_order : '-') }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="d-flex gap-2 align-items-center">
                      <!-- Tích hợp @error fallback image -->
                      <div class="position-relative shadow-sm border rounded overflow-hidden bg-white" style="width: 80px; height: 45px;">
                        <img :src="getImageUrl(banner.image_desktop)" @error="handleImageError" class="w-100 h-100 object-fit-cover">
                        <span class="position-absolute bottom-0 start-0 bg-dark text-white opacity-75 fw-bold" style="font-size: 0.55rem; padding: 1px 4px;">PC</span>
                      </div>
                      <div class="position-relative shadow-sm border rounded overflow-hidden bg-white" style="width: 30px; height: 45px;">
                        <img :src="getImageUrl(banner.image_mobile)" @error="handleImageError" class="w-100 h-100 object-fit-cover">
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
                            :value="banner.status" @change="(e) => onStatusChange(banner, e.target.value)" :disabled="isReorderMode || isMutating">
                      <option value="active">Đang hiển thị</option>
                      <option value="hidden">Đang ẩn</option>
                    </select>
                  </td>

                  <td class="px-4 text-center" v-if="!isReorderMode">
                    <template v-if="!banner.deleted_at">
                      <router-link :to="{ name: 'admin-banners-edit', params: {id: banner.id} }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border" title="Sửa"><i class="bi bi-pencil-square"></i></router-link>
                      <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(banner.id)" title="Xóa" :disabled="isMutating"><i class="bi bi-trash"></i></button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-light text-success shadow-sm border" @click="handleRestore(banner.id)" title="Khôi phục" :disabled="isMutating"><i class="bi bi-arrow-counterclockwise"></i></button>
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
import { ref, computed, watch } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';
import { getFullImage } from '@/composables/useUtilities';

const queryClient = useQueryClient();
const API_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const isReorderMode = ref(false);
const isSavingOrder = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const reorderList = ref([]);
const isMutating = ref(false); // Khóa UI khi có mutation đang chạy

const getImageUrl = (path) => path ? getFullImage(path) : '/placeholder.png';
const handleImageError = (e) => { e.target.src = '/placeholder.png'; };
const formatDate = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  return d.toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'});
};

// --- TANSTACK QUERY: FETCH LIST ---
const fetchBanners = async () => {
  const res = await fetch(`${API_URL}/admin/banners`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Network error');
  return (await res.json()).data;
};

const { data: rawBanners, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['admin', 'banners'],
  queryFn: fetchBanners,
  staleTime: 5 * 60 * 1000, 
  gcTime: 10 * 60 * 1000,
});

// Sync data thô ra view, tách riêng logic Reorder
const displayBanners = computed(() => {
  if (isReorderMode.value) return reorderList.value;
  return rawBanners.value || [];
});

// --- MUTATIONS: CẬP NHẬT TRẠNG THÁI (OPTIMISTIC UPDATE) ---
const statusMutation = useMutation({
  mutationFn: async ({ id, title, status }) => {
    const fd = new FormData(); fd.append('_method', 'PUT'); fd.append('title', title); fd.append('status', status);
    const res = await fetch(`${API_URL}/admin/banners/${id}`, { method: 'POST', headers: getHeaders(), body: fd });
    if (!res.ok) throw new Error('Error updating status');
    return await res.json();
  },
  onMutate: async ({ id, status }) => {
    isMutating.value = true;
    await queryClient.cancelQueries(['admin', 'banners']);
    const previousBanners = queryClient.getQueryData(['admin', 'banners']);
    // Cập nhật Cache tức thời
    if (previousBanners) {
      queryClient.setQueryData(['admin', 'banners'], old => 
        old.map(b => b.id === id ? { ...b, status: status, sort_order: status === 'active' ? 999 : null } : b)
      );
    }
    return { previousBanners };
  },
  onError: (err, variables, context) => {
    if (context?.previousBanners) queryClient.setQueryData(['admin', 'banners'], context.previousBanners);
    Swal.fire('Lỗi', 'Không thể cập nhật trạng thái', 'error');
  },
  onSettled: () => { isMutating.value = false; queryClient.invalidateQueries(['admin', 'banners']); }
});

const onStatusChange = (banner, newStatus) => {
  statusMutation.mutate({ id: banner.id, title: banner.title, status: newStatus });
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã lưu trạng thái', showConfirmButton: false, timer: 1000 });
};

// --- MUTATIONS: XÓA ---
const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const res = await fetch(`${API_URL}/admin/banners/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error deleting');
    return id;
  },
  onMutate: async (id) => {
    isMutating.value = true;
    await queryClient.cancelQueries(['admin', 'banners']);
    const prev = queryClient.getQueryData(['admin', 'banners']);
    // Optimistic Delete
    if (prev) queryClient.setQueryData(['admin', 'banners'], old => old.map(b => b.id === id ? { ...b, deleted_at: new Date().toISOString(), sort_order: null } : b));
    return { prev };
  },
  onError: (err, id, ctx) => { if (ctx?.prev) queryClient.setQueryData(['admin', 'banners'], ctx.prev); Swal.fire('Lỗi', 'Xóa thất bại', 'error'); },
  onSettled: () => { isMutating.value = false; queryClient.invalidateQueries(['admin', 'banners']); }
});

const confirmDelete = (id) => {
  Swal.fire({ title: 'Xóa Banner?', text: 'Banner sẽ được đưa vào thùng rác.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Xóa', confirmButtonColor: '#d33' }).then((res) => {
    if (res.isConfirmed) {
      deleteMutation.mutate(id);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã đưa vào thùng rác', showConfirmButton: false, timer: 1500 });
    }
  });
};

// --- MUTATIONS: KHÔI PHỤC ---
const restoreMutation = useMutation({
  mutationFn: async (id) => {
    const res = await fetch(`${API_URL}/admin/banners/${id}/restore`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error('Error restoring');
    return (await res.json()).data;
  },
  onMutate: () => { isMutating.value = true; },
  onSuccess: (data) => {
    // Cập nhật record bằng data thật từ server trả về để cache chuẩn
    queryClient.setQueryData(['admin', 'banners'], old => old.map(b => b.id === data.id ? data : b));
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã khôi phục', showConfirmButton: false, timer: 1500 });
  },
  onError: () => Swal.fire('Lỗi', 'Khôi phục thất bại', 'error'),
  onSettled: () => { isMutating.value = false; queryClient.invalidateQueries(['admin', 'banners']); }
});
const handleRestore = (id) => restoreMutation.mutate(id);

// --- KÉO THẢ (REORDER) ---
const toggleReorderMode = () => {
  isReorderMode.value = !isReorderMode.value;
  if (isReorderMode.value && rawBanners.value) {
    reorderList.value = JSON.parse(JSON.stringify(rawBanners.value.filter(b => !b.deleted_at && b.status === 'active')));
  }
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
        isReorderMode.value = false; 
        queryClient.invalidateQueries(['admin', 'banners']); // Fetch lại lấy thứ tự chuẩn từ DB
    }
  } catch (e) {
    Swal.fire('Lỗi', 'Không thể lưu thứ tự', 'error');
  } finally { isSavingOrder.value = false; }
};

useAdminRefreshListener((payload) => {
  if (payload.module === 'banners') {
    queryClient.invalidateQueries(['admin', 'banners']);
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Dữ liệu được cập nhật từ máy chủ', showConfirmButton: false, timer: 2000 });
  }
});
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