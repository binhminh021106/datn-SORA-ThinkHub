<template>
  <div class="order-config-tab animation-fade-in">
    <!-- Cấu hình thời gian delay -->
    <div class="card border-0 shadow-sm rounded-4 mb-3">
      <div class="card-header bg-white border-bottom-0 py-3 px-4 d-flex align-items-center">
        <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
          <i class="bi bi-clock-history me-2 text-primary"></i> Cấu hình Thời Gian Delay Đặt Hàng
        </h6>
      </div>
      <div class="card-body px-4 pb-3">
        <p class="text-muted small mb-3">Thời gian chờ (phút) giữa 2 lần đặt hàng liên tiếp. Nếu bằng 0 thì không giới hạn.</p>
        <div class="d-flex align-items-center mb-3 mb-md-0">
          <input type="number" v-model="cooldownMinutes" class="form-control form-control-lg border-0 shadow-sm text-center fw-bold" style="width: 100px;">
          <span class="ms-3 fw-medium text-muted">phút</span>
          <button @click="updateConfig" :disabled="isSavingConfig" class="btn btn-dark rounded px-4 ms-4 fw-bold shadow-sm d-flex align-items-center">
            <span v-if="isSavingConfig" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            LƯU LẠI
          </button>
        </div>
      </div>
    </div>

    <!-- Bảng Theo dõi User -->
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-header bg-white border-bottom-0 py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h6 class="fw-bold mb-0 text-dark d-flex align-items-center flex-shrink-0">
          <i class="bi bi-shield-lock-fill me-2 text-danger"></i> Quản lý Chống Spam
        </h6>
        <!-- Filters -->
        <div class="d-flex flex-column flex-md-row justify-content-end align-items-center gap-2 w-100">
          <input type="text" v-model="searchInput" @keyup.enter="handleSearch" class="form-control form-control-sm rounded-pill flex-grow-1" placeholder="Tìm theo Tên/Email/Số ĐT..." style="max-width: 300px;">
          <select v-model="sortBy" @change="handleSortChange" class="form-select form-select-sm rounded-pill" style="width: auto;">
            <option value="recent_orders_count|desc">Nhiều đơn gần đây</option>
            <option value="orders_count|desc">Nhiều đơn nhất</option>
            <option value="orders_count|asc">Ít đơn nhất</option>
            <option value="created_at|desc">Mới nhất</option>
            <option value="created_at|asc">Cũ nhất</option>
          </select>
        </div>
      </div>

      <div class="card-body p-0">

        <div class="table-responsive border-0" style="min-height: 200px;">
          <table class="table table-hover align-middle mb-0 w-100">
            <thead class="bg-light">
              <tr>
                <th class="py-3 px-4 text-secondary border-0 text-start" style="width: 25%;">Tài Khoản</th>
                <th class="py-3 px-3 text-secondary border-0 text-start" style="width: 20%;">Số Đơn Hàng</th>
                <th class="py-3 px-3 text-secondary border-0 text-start" style="width: 15%;">Trạng Thái</th>
                <th class="py-3 px-4 text-secondary border-0 text-start" style="width: 40%;">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton Loading -->
              <template v-if="isLoading">
                <tr v-for="i in 5" :key="'skeleton-' + i">
                  <td class="py-3 px-4">
                    <div class="d-flex align-items-center">
                      <div class="placeholder-glow me-3">
                        <div class="placeholder rounded-circle" style="width: 45px; height: 45px;"></div>
                      </div>
                      <div class="placeholder-glow flex-grow-1">
                        <span class="placeholder col-8 mb-1"></span>
                        <span class="placeholder col-10 placeholder-sm"></span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-start placeholder-glow">
                    <span class="placeholder col-6 p-2 rounded"></span>
                  </td>
                  <td class="py-3 px-3 text-start placeholder-glow">
                    <span class="placeholder col-8 p-2 rounded"></span>
                  </td>
                  <td class="py-3 px-4 text-start placeholder-glow">
                    <span class="placeholder col-4 p-3 rounded me-2"></span>
                    <span class="placeholder col-4 p-3 rounded"></span>
                  </td>
                </tr>
              </template>

              <!-- Empty State -->
              <tr v-else-if="users.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>

              <!-- Data Rows -->
              <template v-else>
                <tr v-for="user in users" :key="user.id">
                <td class="py-3 px-4 text-start">
                  <div class="d-flex align-items-center">
                    <img :src="user.avatar_url ? getFullImage(user.avatar_url) : defaultAvatar" @error="(e) => e.target.src = defaultAvatar" class="rounded-circle me-3 border shadow-sm" style="width: 45px; height: 45px; object-fit: cover;" />
                    <div>
                      <div class="fw-bold text-dark">{{ user.fullName }}</div>
                      <div class="small text-muted">{{ user.email }} <br v-if="user.phone"/> {{ user.phone }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-start">
                  <div class="d-flex flex-column gap-1 align-items-start">
                    <span class="badge bg-dark rounded px-3 py-2 fs-6 shadow-sm">Tổng: {{ user.orders_count }} đơn</span>
                    <span class="badge border border-warning text-warning rounded px-2 py-1" v-if="user.recent_orders_count > 0">
                      Gần đây (24h): {{ user.recent_orders_count }} đơn
                    </span>
                  </div>
                </td>
                <td class="py-3 px-3 text-start">
                  <div class="d-flex flex-column gap-1 align-items-start">
                    <span v-if="user.status === 'locked'" class="badge bg-danger">Tài khoản Khóa</span>
                    <span v-else class="badge bg-success">Tài khoản Hoạt động</span>
                    <span v-if="user.is_order_blocked" class="badge bg-warning text-dark">Bị chặn Đặt hàng</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-start">
                  <button @click="toggleBlockOrder(user)"
                          class="btn btn-sm rounded px-3 me-2"
                          :class="user.is_order_blocked ? 'btn-outline-secondary' : 'btn-outline-danger'">
                    <i class="bi bi-cart-x me-1"></i>
                    {{ user.is_order_blocked ? 'Mở Khóa Đặt Hàng' : 'Khóa Đặt Hàng' }}
                  </button>
                  <button @click="toggleLockAccount(user)"
                          class="btn btn-sm rounded px-3"
                          :class="user.status === 'active' ? 'btn-danger' : 'btn-outline-secondary'">
                    <i class="bi bi-person-x-fill me-1"></i>
                    {{ user.status === 'active' ? 'Khóa T.Khoản' : 'Mở T.Khoản' }}
                  </button>
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Phân trang -->
        <div class="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-top rounded-bottom-4" v-if="totalPages > 1">
          <span class="text-muted small fw-semibold">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link text-brand" @click="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page"
              :class="{ active: currentPage === page }">
              <button class="page-link"
                :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'"
                @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link text-brand" @click="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import adminApiClient from '@/utils/adminApiClient';
import Toast from '@/utils/toastConfig';
import Swal from 'sweetalert2';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';
import { getFullImage } from '@/composables/useUtilities';

const queryClient = useQueryClient();

const cooldownMinutes = ref(0);
const isSavingConfig = ref(false);

const searchInput = ref('');
const searchQuery = ref('');
const sortBy = ref('recent_orders_count|desc');
const currentPage = ref(1);

const handleSearch = () => {
  searchQuery.value = searchInput.value;
  currentPage.value = 1;
};

const handleSortChange = () => {
  currentPage.value = 1;
};

const changePage = (page) => {
  currentPage.value = page;
};

const { data: configData, isFetching: isLoading, refetch } = useQuery({
  queryKey: ['order-config', currentPage, searchQuery, sortBy],
  queryFn: async () => {
    const [sortField, sortDirection] = sortBy.value.split('|');
    const res = await adminApiClient.get(`/order-config`, {
      params: { 
        page: currentPage.value, 
        per_page: 5,
        search: searchQuery.value,
        sort_by: sortField,
        sort_dir: sortDirection
      }
    });
    return res.data;
  },
  keepPreviousData: true,
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000,
});

const users = computed(() => configData.value?.users?.data || []);
const totalPages = computed(() => configData.value?.users?.last_page || 1);

watch(configData, (newData) => {
  if (newData?.cooldown_minutes !== undefined) {
    cooldownMinutes.value = newData.cooldown_minutes;
  }
}, { immediate: true });



const updateConfig = async () => {
  if (cooldownMinutes.value < 0) {
    Toast.fire({ icon: 'warning', title: 'Thời gian delay không hợp lệ' });
    return;
  }
  isSavingConfig.value = true;
  try {
    const res = await adminApiClient.post('/order-config/cooldown', { cooldown_minutes: cooldownMinutes.value });
    Toast.fire({ icon: 'success', title: res.data.message });
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Lỗi cập nhật cấu hình' });
  } finally {
    isSavingConfig.value = false;
  }
};

const toggleBlockOrder = async (user) => {
  const actionText = user.is_order_blocked ? 'Mở lại chức năng đặt hàng' : 'CHẶN đặt hàng';
  const result = await Swal.fire({
    title: `${actionText} cho ${user.fullName}?`,
    text: user.is_order_blocked ? 'Khách hàng này sẽ được phép đặt đơn trở lại.' : 'Khách hàng này sẽ không thể tạo đơn hàng mới.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: user.is_order_blocked ? '#28a745' : '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy'
  });

  if (result.isConfirmed) {
    try {
      const res = await adminApiClient.post(`/order-config/toggle-block-order/${user.id}`);
      queryClient.invalidateQueries(['order-config']);
      Toast.fire({ icon: 'success', title: res.data.message });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Lỗi thực thi' });
    }
  }
};

const toggleLockAccount = async (user) => {
  const isLocked = user.status === 'locked';
  const actionText = isLocked ? 'Mở khóa toàn bộ' : 'KHÓA HOÀN TOÀN';
  const result = await Swal.fire({
    title: `${actionText} tài khoản ${user.fullName}?`,
    text: isLocked ? 'Khách hàng sẽ có thể đăng nhập bình thường.' : 'Khách hàng sẽ bị đăng xuất và cấm đăng nhập.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isLocked ? '#28a745' : '#343a40',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy'
  });

  if (result.isConfirmed) {
    try {
      const res = await adminApiClient.post(`/order-config/toggle-lock-account/${user.id}`);
      queryClient.invalidateQueries(['order-config']);
      Toast.fire({ icon: 'success', title: res.data.message });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Lỗi thực thi' });
    }
  }
};


</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
