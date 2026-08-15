<template>
  <div class="order-config-tab animation-fade-in">
    <!-- Cấu hình thời gian delay -->
    <div class="card anti-spam-card anti-spam-config-card mb-3">
      <div class="card-header anti-spam-card-header d-flex align-items-start gap-3">
        <span class="anti-spam-title-icon"><i class="bi bi-shield-check"></i></span>
        <div>
          <h6 class="fw-bold mb-1 text-dark">Cấu hình nhịp đặt hàng</h6>
          <p class="mb-0 small text-muted">Thiết lập giới hạn mềm theo từng tài khoản để giảm thao tác đặt đơn liên tiếp.</p>
        </div>
      </div>
      <div class="card-body anti-spam-config-body">
        <div class="cooldown-helper"><i class="bi bi-info-circle"></i> Giá trị 0 tắt cooldown; chỉ dùng khi các limiter server vẫn được bật.</div>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <label class="cooldown-label" for="order-cooldown">Chờ giữa hai đơn mới</label>
          <div class="cooldown-control">
            <input id="order-cooldown" type="number" v-model="cooldownMinutes" min="0" max="60" class="form-control text-center fw-bold">
            <span>phút</span>
          </div>
          <button @click="updateConfig" :disabled="isSavingConfig" class="btn admin-action admin-action-primary">
            <span v-if="isSavingConfig" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-check2-circle me-2"></i>Lưu cấu hình
          </button>
        </div>
      </div>
    </div>

    <!-- Bảng Theo dõi User -->
    <div class="card anti-spam-card">
      <div class="card-header anti-spam-toolbar d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
        <div>
          <h6 class="fw-bold mb-1 text-dark d-flex align-items-center"><i class="bi bi-shield-exclamation me-2 text-brand"></i>Giám sát chống spam</h6>
          <p class="mb-0 small text-muted">Ưu tiên xem đơn chờ thanh toán trước khi khóa hoặc dọn dữ liệu của tài khoản.</p>
        </div>
        <!-- Filters -->
        <div class="d-flex flex-column flex-md-row justify-content-end align-items-center gap-2 w-100">
          <div class="admin-search-wrap">
            <i class="bi bi-search"></i>
            <input type="text" v-model="searchInput" @keyup.enter="handleSearch" class="form-control" placeholder="Tìm tên, email hoặc số điện thoại">
          </div>
          <select v-model="sortBy" @change="handleSortChange" class="form-select admin-sort-select">
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
          <table class="table anti-spam-table align-middle mb-0 w-100">
            <thead>
              <tr>
                <th class="py-3 px-4 text-secondary border-0 text-start" style="width: 34%;">Tài Khoản</th>
                <th class="py-3 px-3 text-secondary border-0 text-start" style="width: 20%;">Đơn hàng</th>
                <th class="py-3 px-3 text-secondary border-0 text-start" style="width: 20%;">Trạng Thái</th>
                <th class="py-3 px-4 text-secondary border-0 text-start" style="width: 26%;">Hành Động</th>
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
                    <img :src="user.avatar_url ? getFullImage(user.avatar_url) : defaultAvatar" @error="(e) => e.target.src = defaultAvatar" class="anti-spam-avatar me-3" />
                    <div>
                      <div class="fw-bold text-dark">{{ user.fullName }}</div>
                      <div class="small text-muted">{{ user.email }} <br v-if="user.phone"/> {{ user.phone }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-start">
                  <div class="d-flex flex-column gap-1 align-items-start">
                    <span class="order-stat-pill"><strong>{{ user.orders_count }}</strong> tổng đơn</span>
                    <span class="order-stat-pill order-stat-pill-warning" v-if="user.recent_orders_count > 0">
                      {{ user.recent_orders_count }} đơn / 24h
                    </span>
                    <span class="order-stat-pill order-stat-pill-danger" v-if="user.pending_unpaid_orders_count > 0">{{ user.pending_unpaid_orders_count }} đơn chờ</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-start">
                  <div class="d-flex flex-column gap-1 align-items-start">
                    <span v-if="user.status === 'locked'" class="status-pill status-pill-danger">Tài khoản khóa</span>
                    <span v-else class="status-pill status-pill-success">Tài khoản hoạt động</span>
                    <span v-if="user.is_order_blocked" class="status-pill status-pill-warning">Chặn đặt hàng</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-start">
                  <div class="admin-row-actions">
                  <button @click="toggleBlockOrder(user)"
                          class="btn btn-sm admin-action admin-action-outline"
                          :class="{ 'admin-action-active': user.is_order_blocked }">
                    <i class="bi bi-cart-x me-1"></i>
                    {{ user.is_order_blocked ? 'Mở chặn đơn' : 'Chặn đơn' }}
                  </button>
                  <button @click="toggleLockAccount(user)"
                          class="btn btn-sm admin-action admin-action-danger">
                    <i class="bi bi-person-x-fill me-1"></i>
                    {{ user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa' }}
                  </button>
                  <button @click="cleanupSpamOrders(user)" :disabled="cleaningUserId === user.id || user.pending_unpaid_orders_count === 0" class="btn btn-sm admin-action admin-action-cleanup" :title="user.pending_unpaid_orders_count > 0 ? 'Hủy và ẩn mềm các đơn pending chưa thanh toán' : 'Tài khoản không có đơn chờ thanh toán để dọn'">
                    <span v-if="cleaningUserId === user.id" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                    <i v-else class="bi bi-trash3 me-1"></i>Dọn spam ({{ user.pending_unpaid_orders_count || 0 }})
                  </button>
                  </div>
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
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import adminApiClient from '@/utils/adminApiClient';
import Toast from '@/utils/toastConfig';
import Swal from 'sweetalert2';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';
import { getFullImage } from '@/composables/useUtilities';

const queryClient = useQueryClient();

const cooldownMinutes = ref(0);
const isSavingConfig = ref(false);
const cleaningUserId = ref(null);

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

const { data: configData, isFetching: isLoading } = useQuery({
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
  if (cooldownMinutes.value === '' || cooldownMinutes.value === null) {
    Toast.fire({ icon: 'warning', title: 'Vui lòng nhập thời gian chờ' });
    return;
  }
  if (cooldownMinutes.value < 0 || cooldownMinutes.value > 60) {
    Toast.fire({ icon: 'warning', title: 'Thời gian delay phải từ 0 đến 60 phút' });
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
      queryClient.invalidateQueries({ queryKey: ['order-config'] });
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
      queryClient.invalidateQueries({ queryKey: ['order-config'] });
      Toast.fire({ icon: 'success', title: res.data.message });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Lỗi thực thi' });
    }
  }
};

const cleanupSpamOrders = async (user) => {
  const result = await Swal.fire({
    title: 'Dọn đơn spam?',
    text: `Chỉ dọn ${user.pending_unpaid_orders_count} đơn chờ thanh toán của ${user.fullName}. Đơn sẽ được hủy, hoàn tồn kho và ẩn mềm; đơn đã thanh toán không bị tác động.`,
    input: 'textarea',
    inputLabel: 'Lý do xử lý',
    inputPlaceholder: 'Ví dụ: phát hiện tạo đơn bất thường từ automation',
    inputValidator: (value) => value?.trim().length >= 5 ? undefined : 'Hãy nhập lý do tối thiểu 5 ký tự.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Dọn đơn spam',
    cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  cleaningUserId.value = user.id;
  try {
    const res = await adminApiClient.post(`/order-config/users/${user.id}/cleanup-spam-orders`, { reason: result.value.trim() });
    queryClient.invalidateQueries({ queryKey: ['order-config'] });
    Toast.fire({ icon: 'success', title: res.data.message });
  } catch (error) {
    Toast.fire({ icon: 'error', title: error.response?.data?.message || 'Không thể dọn đơn spam.' });
  } finally {
    cleaningUserId.value = null;
  }
};


</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.order-config-tab {
  --admin-brand: #009a83;
  --admin-brand-dark: #007b6a;
  --admin-brand-soft: #e7f7f2;
  --admin-border: #e7edf2;
  --admin-text-muted: #687788;
}

.anti-spam-card {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  box-shadow: 0 5px 18px rgba(27, 50, 70, 0.055);
  overflow: hidden;
}

.anti-spam-card-header,
.anti-spam-toolbar {
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fcfb 100%);
  border-bottom: 1px solid var(--admin-border);
}

.anti-spam-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: var(--admin-brand);
  background: var(--admin-brand-soft);
  border-radius: 11px;
  font-size: 1.05rem;
}

.anti-spam-config-body {
  padding: 18px 24px 22px;
}

.cooldown-helper {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 15px;
  color: var(--admin-text-muted);
  font-size: 0.82rem;
}

.cooldown-label {
  margin-right: 4px;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 700;
}

.cooldown-control {
  display: flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid #c9ddd7;
  border-radius: 9px;
  background: #fff;
}

.cooldown-control input {
  width: 72px;
  min-height: 37px;
  border: 0;
  box-shadow: none;
}

.cooldown-control input:focus {
  box-shadow: none;
}

.cooldown-control span {
  padding: 0 12px;
  color: var(--admin-text-muted);
  font-size: 0.82rem;
  border-left: 1px solid #e6eeeb;
}

.admin-action {
  min-height: 34px;
  padding: 0.42rem 0.72rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  transition: background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease;
}

.admin-action-primary {
  color: #fff;
  background: var(--admin-brand);
  border-color: var(--admin-brand);
}

.admin-action-primary:hover:not(:disabled) {
  color: #fff;
  background: var(--admin-brand-dark);
  border-color: var(--admin-brand-dark);
  box-shadow: 0 5px 12px rgba(0, 154, 131, 0.2);
}

.admin-search-wrap {
  position: relative;
  width: min(100%, 315px);
}

.admin-search-wrap i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 12px;
  color: #7a8795;
  transform: translateY(-50%);
}

.admin-search-wrap input {
  min-height: 37px;
  padding-left: 34px;
  border-color: #dbe4ea;
  border-radius: 9px;
  font-size: 0.84rem;
}

.admin-search-wrap input:focus,
.admin-sort-select:focus {
  border-color: #8ccfc2;
  box-shadow: 0 0 0 .18rem rgba(0, 154, 131, 0.1);
}

.admin-sort-select {
  min-height: 37px;
  width: auto;
  border-color: #dbe4ea;
  border-radius: 9px;
  color: #4b5a69;
  font-size: 0.82rem;
}

.anti-spam-table thead th {
  padding-top: 13px;
  padding-bottom: 13px;
  color: #718092;
  background: #f7fafb;
  border-bottom: 1px solid var(--admin-border);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: .035em;
  text-transform: uppercase;
}

.anti-spam-table tbody td {
  border-color: #edf1f4;
}

.anti-spam-table {
  table-layout: fixed;
}

.anti-spam-table tbody tr:hover {
  background: #fbfefd;
}

.anti-spam-avatar {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border: 2px solid #eff5f3;
  border-radius: 50%;
}

.order-stat-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 25px;
  padding: 0.25rem 0.52rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 650;
}

.order-stat-pill {
  color: #445464;
  background: #f1f5f7;
}

.order-stat-pill strong {
  margin-right: 4px;
  color: #1f3142;
}

.order-stat-pill-warning { color: #986a00; background: #fff8e5; }
.order-stat-pill-danger { color: #bd3348; background: #fff0f2; }
.status-pill-success { color: #137f5b; background: #e8f7f0; }
.status-pill-warning { color: #9a6900; background: #fff5d9; }
.status-pill-danger { color: #bf3648; background: #fff0f2; }

.admin-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.admin-action-outline {
  color: #3d5966;
  background: #fff;
  border: 1px solid #cbd8de;
}

.admin-action-outline:hover,
.admin-action-active {
  color: #fff;
  background: #5e6b75;
  border-color: #5e6b75;
}

.admin-action-danger {
  color: #c6394c;
  background: #fff;
  border: 1px solid #f1b8c0;
}

.admin-action-danger:hover { color: #fff; background: #d44355; border-color: #d44355; }

.admin-action-cleanup {
  color: #9d6900;
  background: #fffaf0;
  border: 1px solid #f0d28d;
}

.admin-action-cleanup:hover:not(:disabled) { color: #8a230f; background: #fff0e8; border-color: #e89a78; }
.admin-action-cleanup:disabled { color: #9aa8ae; background: #f4f7f7; border-color: #e0e7e8; cursor: not-allowed; }

@media (max-width: 767.98px) {
  .anti-spam-card-header,
  .anti-spam-toolbar,
  .anti-spam-config-body { padding-right: 16px; padding-left: 16px; }
  .admin-search-wrap { width: 100%; }
  .admin-sort-select { width: 100%; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
