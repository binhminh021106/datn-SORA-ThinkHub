<template>
  <div class="tier-index-wrapper pb-5 mb-5">
    
    <!-- MÀN HÌNH CHỜ ĐỘC LẬP (SHIMMER) CHỈ CHẠY 1 LẦN ĐẦU -->
    <div v-if="isPageLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu hạng...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Cấu Hình Hạng Hội Viên</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-2">
<router-link :to="{ name: 'admin-tiers-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
            <i class="bi bi-plus-circle me-1"></i> Thêm Hạng Mới
          </router-link>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 tier-table" style="width: 100%; min-width: 1100px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0 table-column-nowrap" style="width: 23%; min-width: 200px;">Hạng Thành Viên</th>
                  <th class="py-3 px-4 text-secondary border-0 text-end table-column-nowrap" style="width: 18%; min-width: 180px;">Chi tiêu tối thiểu</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center table-column-nowrap" style="width: 18%; min-width: 180px;">Giảm giá & Lượt dùng</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center table-column-nowrap" style="width: 16%; min-width: 170px;">Số lần Vệ sinh/năm</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center table-column-nowrap" style="width: 15%; min-width: 160px;">Số Khách hàng</th>
                  <th class="py-3 px-4 text-secondary text-center border-0 table-column-nowrap" style="width: 10%; min-width: 170px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <!-- HIỆU ỨNG SKELETON KHI REFETCH HOẶC LỌC DỮ LIỆU -->
                <template v-if="isTableLoading">
                  <tr v-for="i in 3" :key="'skeleton-'+i">
                    <td class="px-4 py-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="placeholder-glow"><div class="placeholder rounded-circle" style="width: 45px; height: 45px;"></div></div>
                        <div class="placeholder-glow w-50"><span class="placeholder col-10 rounded"></span></div>
                      </div>
                    </td>
                    <td class="px-4 text-end placeholder-glow"><span class="placeholder col-8 rounded py-2"></span></td>
                    <td class="px-4 text-center placeholder-glow"><span class="placeholder col-6 rounded py-2"></span></td>
                    <td class="px-4 text-center placeholder-glow"><span class="placeholder col-6 rounded py-2"></span></td>
                    <td class="px-4 text-center placeholder-glow"><span class="placeholder col-6 rounded py-2"></span></td>
                    <td class="px-4 text-center placeholder-glow"><span class="placeholder col-8 rounded py-2"></span></td>
                  </tr>
                </template>
                
                <template v-else>
                  <tr v-if="tiers.length === 0">
                    <td colspan="6" class="text-center py-5 text-muted">
                      <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                      Chưa có dữ liệu Hạng hội viên.
                    </td>
                  </tr>
                  
                  <tr v-else v-for="tier in tiers" :key="tier.id" :class="{'bg-light': tier.min_spent == 0}">
                    <td class="px-4 py-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="position-relative shadow-sm border rounded-circle bg-white d-flex justify-content-center align-items-center overflow-hidden" style="width: 45px; height: 45px; padding: 0.2rem;">
                          <!-- Sử dụng SoraImage thay cho img thường -->
                          <SoraImage 
                            :src="tier.icon" 
                            :placeholder="placeholderImg"
                            imgClass="w-100 h-100 object-fit-contain" 
                            alt="Tier Icon"
                          />
                        </div>
                        <div>
                          <div class="fw-bold text-dark fs-6">{{ tier.name }}</div>
                          <span v-if="tier.min_spent == 0" class="badge bg-secondary bg-opacity-10 text-secondary border mt-1" style="font-size: 0.65rem;">Hạng Mặc định (Gốc)</span>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 text-end fw-bold text-danger">
                      {{ formatCurrency(tier.min_spent) }}
                      <div class="text-muted small fw-normal mt-1" v-if="tier.min_orders > 0">hoặc {{ tier.min_orders }} đơn hàng</div>
                    </td>

                    <td class="px-4 text-center">
                      <span class="badge bg-success fs-6">{{ tier.discount_percent }}%</span>
                      <div class="text-muted small mt-1 fw-bold text-warning" style="color: #fd7e14 !important;">{{ tier.yearly_discount_quota }} lần/năm</div>
                    </td>

                    <td class="px-4 text-center fw-bold text-brand">
                      {{ tier.yearly_service_quota }} <span class="fw-normal text-muted small">lần</span>
                    </td>

                    <td class="px-4 text-center">
                      <span class="badge rounded-pill border fw-bold px-3 py-2" :class="tier.users_count > 0 ? 'border-primary text-primary bg-primary bg-opacity-10' : 'border-secondary text-secondary bg-light'">
                        <i class="bi bi-people-fill me-1"></i> {{ tier.users_count }}
                      </span>
                    </td>

                    <td class="px-4 text-center">
                      <div class="action-buttons d-inline-flex align-items-center justify-content-center flex-wrap gap-2">
                        <router-link :to="{ name: 'admin-tiers-edit', params: {id: tier.id} }" class="btn btn-sm btn-light text-primary shadow-sm border" title="Sửa">
                          <i class="bi bi-pencil-square"></i>
                        </router-link>
                        <button v-if="tier.min_spent != 0 && tier.users_count == 0" class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(tier.id)" title="Xóa">
                          <i class="bi bi-trash"></i>
                        </button>
                        <button v-else class="btn btn-sm btn-light text-muted shadow-sm border opacity-50" title="Không thể xóa hạng đang sử dụng" disabled>
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

import SoraImage from '@/components/ui/SoraImage.vue';
import placeholderImg from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const queryClient = useQueryClient();

const isTableLoading = ref(false); // Ref để trigger Skeleton khi cần thiết (VD: filter)

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const handleAxiosError = (e, defaultMsg = 'Lỗi hệ thống') => {
  if (e.response) {
    if (e.response.status === 401) Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
    else Swal.fire('Lỗi', e.response.data.message || defaultMsg, 'error');
  } else {
    Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
  }
};

// ==========================================
// TANSTACK VUE QUERY - FETCH DATA
// ==========================================
const { data: tiersResponse, isLoading: isUsersLoading } = useQuery({
  queryKey: ['adminTiers'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/tiers`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 5 * 60 * 1000
});

const isPageLoading = computed(() => isUsersLoading.value);
const tiers = computed(() => tiersResponse.value?.data || []);

// ==========================================
// TANSTACK VUE QUERY - MUTATIONS
// ==========================================
const deleteTierMutation = useMutation({
  mutationFn: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/tiers/${id}`, { headers: getHeaders() });
    return response.data;
  },
  onSuccess: (data, id) => {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: data.message, showConfirmButton: false, timer: 1500 });
    // Cập nhật lại UI lập tức bằng cách lọc bỏ tier đã xóa khỏi cache
    queryClient.setQueryData(['adminTiers'], (old) => {
      if (!old) return old;
      return { ...old, data: old.data.filter(t => t.id !== id) };
    });
  },
  onError: (err) => handleAxiosError(err, 'Không thể xóa hạng này')
});

const confirmDelete = (id) => {
  Swal.fire({ 
    title: 'Xóa Hạng này?', 
    text: 'Bạn không thể hoàn tác thao tác này!', 
    icon: 'warning', 
    showCancelButton: true, 
    confirmButtonText: 'Xóa', 
    confirmButtonColor: '#d33' 
  }).then((res) => {
    if (res.isConfirmed) {
      deleteTierMutation.mutate(id);
    }
  });
};
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.tier-table th.table-column-nowrap,
.tier-table td.table-column-nowrap {
  white-space: nowrap;
}
.action-buttons {
  gap: 0.5rem;
}
.action-buttons .btn {
  min-width: 38px;
}
</style>