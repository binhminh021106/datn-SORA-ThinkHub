<template>
  <div class="tier-index-wrapper pb-5 mb-5">
    <div v-if="isLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <div class="spinner-border text-brand mb-3" style="width: 3rem; height: 3rem;"></div>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest">Đang tải dữ liệu hạng...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Cấu Hình Hạng Hội Viên</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <router-link :to="{ name: 'admin-tiers-create' }" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
            <i class="bi bi-plus-circle me-1"></i> Thêm Hạng Mới
          </router-link>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="width: 100%; min-width: 1000px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Hạng Thành Viên</th>
                  <th class="py-3 px-4 text-secondary border-0 text-end" style="width: 20%;">Chi tiêu tối thiểu</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Giảm giá & Lượt dùng</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Số lần Vệ sinh/năm</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Số Khách hàng</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 10%;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="tiers.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">Chưa có dữ liệu Hạng hội viên.</td>
                </tr>
                
                <tr v-else v-for="tier in tiers" :key="tier.id" :class="{'bg-light': tier.min_spent == 0}">
                  <td class="px-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="position-relative shadow-sm border rounded-circle bg-white d-flex justify-content-center align-items-center overflow-hidden" style="width: 45px; height: 45px;">
                        <img v-if="tier.icon" :src="getImageUrl(tier.icon)" class="w-100 h-100 object-fit-cover" @error="handleImageError">
                        <i v-else class="bi bi-award-fill fs-4 text-warning"></i>
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

                  <!-- Đã Gộp cột hiển thị % Giảm Giá và Số lượt/Năm -->
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
                    <router-link :to="{ name: 'admin-tiers-edit', params: {id: tier.id} }" class="btn btn-sm btn-light text-primary me-2 shadow-sm border" title="Sửa">
                      <i class="bi bi-pencil-square"></i>
                    </router-link>
                    
                    <button v-if="tier.min_spent != 0 && tier.users_count == 0" class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(tier.id)" title="Xóa">
                      <i class="bi bi-trash"></i>
                    </button>
                    <button v-else class="btn btn-sm btn-light text-muted shadow-sm border opacity-50" title="Không thể xóa hạng đang sử dụng" disabled>
                      <i class="bi bi-trash"></i>
                    </button>
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
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { getFullImage } from '@/composables/useUtilities';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || API_URL.replace(/\/api\/?$/, '');

const tiers = ref([]);
const isLoading = ref(true);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });
const getImageUrl = (path) => path ? getFullImage(path) : ''; 
const handleImageError = (e) => { e.target.style.display = 'none'; }; 

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/admin/tiers`, { headers: getHeaders() });
    if (res.ok) {
        tiers.value = (await res.json()).data;
    }
  } catch (err) {
      console.error(err);
  } finally { 
      isLoading.value = false; 
  }
};

const confirmDelete = (id) => {
  Swal.fire({ 
    title: 'Xóa Hạng này?', 
    text: 'Bạn không thể hoàn tác thao tác này!', 
    icon: 'warning', 
    showCancelButton: true, 
    confirmButtonText: 'Xóa', 
    confirmButtonColor: '#d33' 
  }).then(async (res) => {
    if (res.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/admin/tiers/${id}`, { method: 'DELETE', headers: getHeaders() });
        const data = await response.json();
        
        if (response.ok) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: data.message, showConfirmButton: false, timer: 1500 });
          fetchData(); 
        } else {
          Swal.fire('Lỗi', data.message, 'error');
        }
      } catch (error) {
        Swal.fire('Lỗi', 'Mất kết nối đến server', error);
      }
    }
  });
};

onMounted(() => fetchData());
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
</style>  