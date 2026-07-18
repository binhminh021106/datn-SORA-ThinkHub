<template>
  <div>
      <!-- Hiển thị bộ lọc và tab nếu đã từng có đơn hàng hoặc đang tải -->
      <div class="mb-4">
        <!-- Vẫn hiển thị bộ lọc nếu đã từng có đơn hàng, ngay cả khi đang loading skeleton bên dưới -->
        <div v-show="hasEverHadOrders || isQueryLoading" class="bg-white p-2 p-md-3 shadow-sm border border-light-subtle d-flex flex-column gap-3 mb-3">
          <div class="order-tabs d-flex gap-3 overflow-auto pb-3 pt-2 text-nowrap hide-scrollbar" style="scrollbar-width: none;">
            <button v-for="tab in statusTabs" :key="tab.value" v-on:click="filterStatus = tab.value"
              class="btn rounded-pill fw-semibold text-uppercase position-relative transition-all"
              style="font-size: 0.75rem; padding: 0.35rem 1rem;"
              :class="filterStatus === tab.value ? 'bg-sora-primary text-white shadow-sm' : 'bg-white text-secondary border border-light-subtle'">
              <span>{{ tab.label }}</span>
              <span v-if="orderCounts && orderCounts[tab.value]"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill border border-white"
                :class="filterStatus === tab.value ? 'bg-dark text-white' : 'bg-secondary text-white'"
                style="font-size: 0.6rem; padding: 0.2rem 0.4rem;">
                {{ orderCounts[tab.value] }}
              </span>
            </button>
          </div>

          <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 align-items-lg-center">
            <div class="input-group" style="max-width: 350px;">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-start-0 bg-light shadow-none"
                placeholder="Tìm mã đơn hàng (VD: ORD-...)" v-model="searchQuery">
            </div>

            <div class="d-flex flex-wrap gap-2">
              <select class="form-select shadow-none bg-light text-secondary fw-medium border-light-subtle"
                style="width: auto;" v-model="filterDate">
                <option value="all">Thời gian: Tất cả</option>
                <option value="30days">30 ngày qua</option>
                <option value="6months">6 tháng qua</option>
                <option value="this_year">Năm nay</option>
              </select>
              <select class="form-select shadow-none bg-light text-secondary fw-medium border-light-subtle"
                style="width: auto;" v-model="sortBy">
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="oldest">Sắp xếp: Cũ nhất</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="price_asc">Giá tăng dần</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Hiệu ứng loading Skeleton cho riêng phần danh sách đơn hàng -->
        <div v-if="showSkeleton" class="d-flex flex-column gap-4">
          <div v-for="i in 3" :key="i" class="card border border-light-subtle shadow-sm rounded-0 p-3">
            <!-- Header Skeleton -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex gap-2 w-50">
                <SoraSkeleton width="30%" height="24px" radius="4px" />
                <SoraSkeleton width="20%" height="24px" radius="4px" />
              </div>
              <SoraSkeleton width="15%" height="28px" radius="50px" />
            </div>
            <!-- Body Skeleton -->
            <div class="d-flex align-items-center gap-3 mb-3">
              <SoraSkeleton width="60px" height="60px" radius="4px" class="flex-shrink-0" />
              <div class="flex-grow-1">
                <SoraSkeleton width="50%" height="20px" class="mb-2" />
                <SoraSkeleton width="25%" height="16px" />
              </div>
            </div>
            <hr class="mt-0 mb-3 border-light-subtle">
            <!-- Footer Skeleton -->
            <div class="d-flex flex-column align-items-end gap-2">
              <SoraSkeleton width="120px" height="14px" />
              <SoraSkeleton width="150px" height="30px" />
              <SoraSkeleton width="200px" height="38px" class="mt-2" />
            </div>
          </div>
        </div>

        <div v-else-if="!hasEverHadOrders" class="text-center py-5 bg-white shadow-sm border-top border-4 border-danger-custom mt-3">
          <div class="py-5">
            <i class="bi bi-bag-x text-muted opacity-25 d-block mb-3" style="font-size: 5rem;"></i>
            <h3 class="fs-4 text-dark mb-3 font-serif">Bạn chưa có đơn hàng nào</h3>
            <p class="text-secondary mb-4">Những kiệt tác trang sức SORA đang chờ bạn khám phá.</p>
            <button v-on:click="router.push('/shop')"
              class="editorial-btn border-0 px-5 py-3 mt-2">Bắt đầu mua sắm</button>
          </div>
        </div>

        <div v-else-if="displayOrders.length === 0" class="text-center py-5 my-4 bg-white border border-light-subtle">
          <i class="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
          <p class="fs-5 text-secondary font-serif fst-italic">Không tìm thấy đơn hàng nào phù hợp.</p>
          <button v-on:click="resetFilters" class="btn btn-link text-primary-custom text-decoration-none fw-bold">✕ Xóa
            bộ lọc</button>
        </div>

        <div v-else class="order-list">
          <div class="card border border-light-subtle shadow-sm rounded-0 mb-3 order-card-luxury hover-lift"
            v-for="order in displayOrders" :key="order.id">

            <div
              class="card-header bg-white border-bottom-0 pt-3 pb-0 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="d-flex align-items-center gap-3">
                <span class="fw-bold text-dark fs-5 font-oswald" style="letter-spacing: 1px;">#<span
                    v-text="order.order_code"></span></span>
                <span class="text-muted small d-none d-sm-inline">|</span>
                <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i> <span
                    v-text="formatDate(order.created_at)"></span></span>
              </div>
              <span :class="['status-badge px-3 py-1 rounded-pill small fw-bold', getStatusClass(order.status)]">
                <i :class="getStatusIcon(order.status)" class="me-1"></i> <span
                  v-text="translateStatus(order.status)"></span>
              </span>
            </div>

            <div class="card-body p-2">
              <div v-if="!['cancelled', 'returned', 'return_requested', 'return_negotiating', 'return_retrieving'].includes(order.status)"
                class="order-stepper-horizontal d-none d-md-flex mb-3 mt-1">
                <div v-for="(step, index) in orderSteps" :key="index" class="stepper-step"
                  :class="{ 'completed': isStepCompleted(order.status, step.value), 'active': order.status === step.value }">
                  <div class="step-icon-wrap">
                    <div class="step-icon"><i :class="step.icon"></i></div>
                  </div>
                  <div class="step-text">
                    <div class="step-title" v-text="step.label"></div>
                  </div>
                </div>
              </div>
              <div v-else-if="order.status === 'cancelled'"
                class="alert bg-light border border-light-subtle rounded-0 mb-3 d-flex align-items-center py-2 px-3">
                <i class="bi bi-x-circle-fill text-secondary me-2 fs-5"></i>
                <div class="text-muted small"><strong>Đơn hàng đã bị hủy.</strong> Quá trình giao dịch đã dừng lại.
                </div>
              </div>
              <div v-else-if="['returned', 'return_requested', 'return_negotiating', 'return_retrieving'].includes(order.status)"
                class="alert bg-light border border-light-subtle rounded-0 mb-2 py-2 px-2">
                <div class="d-flex align-items-center">
                    <i class="bi bi-arrow-return-left text-secondary me-2 fs-5"></i>
                    <div class="text-muted small"><strong>Đơn hàng hoàn/trả.</strong> {{ order.status === 'returned' ? 'Hàng hóa đã được hoàn lại.' : 'Đang trong quá trình xử lý hoàn trả.' }}
                    </div>
                </div>

                <div v-if="order.status === 'return_negotiating' && order.refund_amount !== null" class="mt-2 p-2 bg-white border border-warning-subtle rounded shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-dark small fw-bold"><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>SORA đề xuất mức hoàn tiền:</span>
                        <strong class="text-danger fs-5 font-oswald">{{ formatPrice(order.refund_amount) }}</strong>
                    </div>
                    <div class="small text-muted mb-2 pb-2 border-bottom d-flex justify-content-between">
                        <span>Khấu trừ: <strong class="text-danger">-{{ formatPrice(order.total_amount - order.refund_amount) }}</strong> <span v-if="order.total_amount > 0">({{ Math.round((order.total_amount - order.refund_amount) / order.total_amount * 100) }}%)</span></span>
                    </div>
                    <div v-if="order.refund_note" class="small text-muted fst-italic mb-3">
                        <i class="bi bi-chat-left-text me-1"></i> Lời nhắn: {{ order.refund_note }}
                    </div>
                    <div class="d-flex gap-2">
                        <button @click="handleConfirmRefund(order, true)" class="btn btn-sm btn-success fw-bold w-100"><i class="bi bi-check2-circle me-1"></i>Đồng ý đề xuất</button>
                    </div>
                </div>
              </div>

              <hr class="mt-0 mb-2 border-light-subtle">

              <div class="row align-items-center g-2">
                <div class="col-lg-8 border-end-lg pe-lg-2">
                  <div v-for="item in order.items.slice(0, 2)" :key="item.id"
                    class="d-flex align-items-center gap-2 mb-2" style="cursor: pointer;" @click="goToProduct(item)">
                    <div class="img-wrapper border p-1" style="width: 60px; height: 60px; background: #fff;">
                      <img :src="getImageUrl(item.variant_image)" v-on:error="handleImageError"
                        class="w-100 h-100 object-fit-cover">
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-1 text-truncate text-dark fw-bold" style="max-width: 90%;"><span
                          v-text="item.product_name"></span></h6>
                      <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="small text-muted"><span v-text="formatPrice(item.price)"></span> <span
                            class="mx-1">x</span> <span v-text="item.quantity"></span></span>
                        <span class="fw-medium text-dark" v-text="formatPrice(item.price * item.quantity)"></span>
                      </div>
                    </div>
                  </div>
                  <div v-if="order.items.length > 2" class="text-center mt-2">
                    <span class="badge bg-light text-secondary border px-3 py-2 fw-normal">+<span
                        v-text="order.items.length - 2"></span> sản phẩm khác...</span>
                  </div>
                </div>

                <div class="col-lg-4 text-lg-end mt-3 mt-lg-0 ps-lg-3">
                  <p class="text-muted small mb-1 text-uppercase fw-bold" style="letter-spacing: 1px;">Thành tiền</p>
                  
                  <template v-if="order.status === 'returned' && order.refund_amount !== null">
                    <div class="mb-1 d-flex justify-content-end align-items-center">
                        <span class="text-muted small me-2">Tổng ban đầu:</span>
                        <span class="fw-bold text-muted text-decoration-line-through font-oswald" style="font-size: 0.95rem;" v-text="formatPrice(order.total_amount)"></span>
                    </div>
                    <div class="mb-3 d-flex justify-content-end align-items-center">
                        <span class="text-danger small fw-bold me-2"><i class="bi bi-check-circle-fill me-1"></i>Thực nhận:</span>
                        <span class="fw-bold text-danger fs-3 font-oswald" v-text="formatPrice(order.refund_amount)"></span>
                    </div>
                  </template>
                  <template v-else>
                    <h3 class="fw-bold text-primary-custom mb-3 font-oswald" v-text="formatPrice(order.total_amount)"></h3>
                  </template>

                  <div class="d-flex flex-column gap-2">
                    <!-- Chi tiết đơn hàng - Màu trung tính -->
                    <button v-on:click="openDetails(order)"
                      class="btn py-2 px-2 fw-bold small text-uppercase w-100 btn-luxury-neutral">
                      Chi tiết đơn hàng
                    </button>

                    <!-- Hủy đơn - Nền đỏ nhạt, chữ đỏ đậm -->
                    <button v-if="order.status === 'pending'" v-on:click="confirmCancel(order)"
                      class="btn py-2 px-4 small fw-bold text-uppercase w-100 btn-luxury-danger">
                      Hủy đơn
                    </button>

                    <!-- Đánh giá - Màu chủ đạo -->
                    <button v-if="order.status === 'delivered' && (!order.reviews || order.reviews.length === 0)"
                      v-on:click="openReview(order)"
                      class="editorial-btn fw-bold w-100 border-0 btn-luxury-gold">
                      <i class="bi bi-star-fill me-1"></i> Đánh giá
                    </button>

                    <!-- Xem đánh giá - Màu xanh lá -->
                    <button v-if="order.status === 'delivered' && order.reviews && order.reviews.length > 0"
                      v-on:click="openViewReview(order)"
                      class="btn py-2 px-4 small fw-bold text-uppercase w-100 btn-luxury-success">
                      <i class="bi bi-eye-fill me-1"></i> Xem đánh giá
                    </button>

                    <!-- Mua lại - Màu xanh lá nhạt -->
                    <button v-on:click="handleReorder(order)"
                      class="btn py-2 px-4 small fw-bold text-uppercase w-100 mt-2 btn-luxury-success-light">
                      Mua lại
                    </button>

                    <!-- Xuất hóa đơn - Màu chủ đạo (để nổi bật tài liệu) -->
                    <button v-on:click="exportInvoice(order)"
                      class="editorial-btn w-100 border-0 mt-2 text-white fw-bold">
                      <i class="bi bi-file-earmark-pdf me-1"></i> Xuất hóa đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav v-if="pagination.last_page > 1" class="mt-4 d-flex justify-content-center">
            <ul class="pagination pagination-custom shadow-sm">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }"><a class="page-link"
                  href="javascript:void(0)" v-on:click="changePage(1)">«</a></li>
              <li v-for="page in pagination.last_page" :key="page" class="page-item"
                :class="{ active: pagination.current_page === page }">
                <a class="page-link" href="javascript:void(0)" v-on:click="changePage(page)"><span
                    v-text="page"></span></a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }"><a
                  class="page-link" href="javascript:void(0)" v-on:click="changePage(pagination.last_page)">»</a></li>
            </ul>
          </nav>
        </div>
      </div>

    <!-- MODALS -->
    <OrderDetailModal :is-open="isModalOpen" :order="selectedOrder" v-on:close="closeModal"
      v-on:cancel-order="confirmCancel" v-on:open-review="openReview" v-on:reorder="handleReorder" />

    <ReviewModal :is-open="isReviewModalOpen" :order="selectedOrderForReview" v-on:close="closeReviewModal"
      v-on:review-success="fetchOrders(pagination.current_page)" />

    <ViewReviewModal :is-open="isViewReviewModalOpen" :order="selectedOrderForViewReview" v-on:close="closeViewReviewModal" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import Toast from '@/utils/toastConfig';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import OrderDetailModal from './OrderDetailModal.vue';
import ReviewModal from './ReviewModal.vue';
import ViewReviewModal from './ViewReviewModal.vue';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
import { getStorageUrl } from '@/utils/env';
import clientApiClient from '@/utils/clientApiClient';

const router = useRouter();
const queryClient = useQueryClient();

const currentPage = ref(1);

const isModalOpen = ref(false);
const selectedOrder = ref(null);

const isReviewModalOpen = ref(false);
const selectedOrderForReview = ref(null);

const filterStatus = ref('all');
const filterDate = ref('all');
const sortBy = ref('newest');
const searchQuery = ref('');

// Tạo debounce cho search
const debouncedSearch = ref('');
let searchTimeout = null;
watch(searchQuery, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        debouncedSearch.value = newVal;
        currentPage.value = 1;
    }, 400); 
});

watch([filterStatus, filterDate, sortBy], () => {
    currentPage.value = 1;
});

const statusTabs = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Hoàn tất', value: 'delivered' },
  { label: 'Đã hủy', value: 'cancelled' },
  { label: 'Trả hàng / Hoàn tiền', value: 'returned' }
];

const orderSteps = [
  { value: 'pending', label: 'Chờ xác nhận', icon: 'bi-receipt' },
  { value: 'confirmed', label: 'Đã xác nhận', icon: 'bi-box-seam' },
  { value: 'processing', label: 'Đang xử lý', icon: 'bi-gear' },
  { value: 'shipping', label: 'Đang giao', icon: 'bi-truck' },
  { value: 'delivered', label: 'Hoàn tất', icon: 'bi-check-circle-fill' }
];

const isStepCompleted = (currentStatus, stepValue) => {
  if (['cancelled', 'returned'].includes(currentStatus)) return false;
  const currentIdx = orderSteps.findIndex(s => s.value === currentStatus);
  const stepIdx = orderSteps.findIndex(s => s.value === stepValue);
  return currentIdx >= stepIdx;
};

const soraAlert = createSoraAlert({
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold', cancelButton: 'px-4 py-2 mx-2 rounded-0 fw-bold' }
});

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const getImageUrl = (p) => getStorageUrl(p, defaultPlaceholder);
const handleImageError = (e) => { e.target.src = defaultPlaceholder; };

const getStatusClass = (s) => ({
  pending: 'bg-warning-custom text-dark', confirmed: 'bg-info-custom text-white', processing: 'bg-primary text-white',
  shipping: 'bg-primary text-white', delivered: 'bg-success text-white', cancelled: 'bg-light text-secondary border',
  return_requested: 'bg-warning-custom text-dark', return_negotiating: 'bg-info-custom text-white', return_retrieving: 'bg-primary text-white',
  returned: 'bg-success text-white'
}[s] || 'bg-secondary text-white');

const getStatusIcon = (s) => ({
  pending: 'bi-hourglass-split', confirmed: 'bi-check2-circle', shipping: 'bi-truck',
  delivered: 'bi-box-seam', cancelled: 'bi-x-circle',
  return_requested: 'bi-inbox-fill', return_negotiating: 'bi-envelope-paper-fill', return_retrieving: 'bi-truck',
  returned: 'bi-check-circle-fill'
}[s] || 'bi-info-circle');

const translateStatus = (s) => ({
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang xử lý',
  shipping: 'Đang giao hàng', delivered: 'Hoàn tất', cancelled: 'Đã hủy',
  return_requested: 'Yêu cầu trả hàng', return_negotiating: 'Chờ thỏa thuận giá', return_retrieving: 'Đang thu hồi hàng',
  returned: 'Đã hoàn tiền'
}[s] || s);

const hasActiveFilters = computed(() => filterStatus.value !== 'all' || filterDate.value !== 'all' || sortBy.value !== 'newest' || searchQuery.value !== '');
const resetFilters = () => { filterStatus.value = 'all'; filterDate.value = 'all'; sortBy.value = 'newest'; searchQuery.value = ''; };

const fetchOrdersApi = async ({ queryKey }) => {
  const [_key, page, status, search, date, sort] = queryKey;
  const res = await clientApiClient.get('/client/orders', { 
      params: { 
          page, 
          per_page: 5,
          status,
          search,
          date,
          sort
      } 
  });
  return res.data;
};

const { data: ordersQueryData, isLoading: isQueryLoading, isFetching: isQueryFetching, isPlaceholderData } = useQuery({
  queryKey: computed(() => ['client_orders', currentPage.value, filterStatus.value, debouncedSearch.value, filterDate.value, sortBy.value]),
  queryFn: fetchOrdersApi,
  placeholderData: keepPreviousData,
  staleTime: 5 * 60 * 1000,
});

const orders = computed(() => ordersQueryData.value?.data || []);
const orderCounts = computed(() => ordersQueryData.value?.counts || {});
const hasEverHadOrders = computed(() => orders.value.length > 0 || hasActiveFilters.value || (orderCounts.value && orderCounts.value.all > 0));
const showSkeleton = computed(() => isQueryLoading.value || (isQueryFetching.value && isPlaceholderData.value));
const pagination = computed(() => ({
  current_page: ordersQueryData.value?.current_page || 1,
  last_page: ordersQueryData.value?.last_page || 1
}));

const displayOrders = computed(() => orders.value);

const openDetails = async (order) => {
  try {
    const res = await clientApiClient.get(`/client/orders/${order.order_code}`);
    selectedOrder.value = res.data.data;
    isModalOpen.value = true;
    document.body.style.overflow = 'hidden';
  } catch (err) { Toast.fire({ icon: 'error', title: 'Không thể lấy chi tiết đơn hàng', err }); }
};

const closeModal = () => { isModalOpen.value = false; document.body.style.overflow = 'auto'; };

const openReview = (order) => {
  selectedOrderForReview.value = order;
  isReviewModalOpen.value = true;
  if (isModalOpen.value) closeModal();
  document.body.style.overflow = 'hidden';
};

const closeReviewModal = () => {
  isReviewModalOpen.value = false;
  selectedOrderForReview.value = null;
  document.body.style.overflow = 'auto';
};

const isViewReviewModalOpen = ref(false);
const selectedOrderForViewReview = ref(null);

const openViewReview = (order) => {
  selectedOrderForViewReview.value = order;
  isViewReviewModalOpen.value = true;
  if (isModalOpen.value) closeModal();
  document.body.style.overflow = 'hidden';
};

const closeViewReviewModal = () => {
  isViewReviewModalOpen.value = false;
  selectedOrderForViewReview.value = null;
  document.body.style.overflow = 'auto';
};

const changePage = (p) => { 
  if (p !== currentPage.value) {
    currentPage.value = p;
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }
};

const goToProduct = (item) => {
  if (item.combo_id && item.combo) {
    router.push({ name: 'client-combo-detail', params: { slug: item.combo.slug } }).catch(()=>{});
  } else if (item.product && item.product.slug) {
    router.push({ name: 'productDetail', params: { shop_slug: 'aurora-jewelry', slug: item.product.slug } }).catch(()=>{});
  }
};

const handleReorder = async (order) => {
  if (isModalOpen.value) closeModal();

  try {
    // Hiện loading trước khi gọi API
    soraAlert.fire({
      title: 'Đang xử lý...',
      text: 'Đang đẩy sản phẩm vào giỏ hàng...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Bắn request tới backend để add vào bảng Carts
    const response = await clientApiClient.post(`/client/orders/${order.order_code}/reorder`, {}, {
      ensureCartSession: true,
      ignoreAuthRedirect: true
    });

    const data = response.data?.data || {};
    const added = data.added || [];
    const outOfStock = data.out_of_stock || [];

    let htmlContent = '<div class="text-start mt-3" style="font-family: \'Josefin Sans\', sans-serif;">';
    
    if (added.length > 0) {
        htmlContent += `<div class="mb-3">
            <h6 class="text-success fw-bold font-oswald tracking-wide"><i class="bi bi-check-circle-fill me-1"></i> ĐÃ THÊM VÀO GIỎ:</h6>
            <ul class="text-muted small ps-3 mb-0" style="list-style-type: disc;">
                ${added.map(name => `<li>${escapeHtml(name)}</li>`).join('')}
            </ul>
        </div>`;
    }

    if (outOfStock.length > 0) {
        htmlContent += `<div>
            <h6 class="text-danger fw-bold font-oswald tracking-wide"><i class="bi bi-x-circle-fill me-1"></i> HẾT HÀNG (KHÔNG THỂ THÊM):</h6>
            <ul class="text-muted small ps-3 mb-0" style="list-style-type: disc;">
                ${outOfStock.map(name => `<li>${escapeHtml(name)}</li>`).join('')}
            </ul>
        </div>`;
    }
    htmlContent += '</div>';

    // Tắt loading và hiện thông báo
    soraAlert.fire({
      icon: outOfStock.length > 0 ? 'warning' : 'success',
      title: '<span class="font-oswald tracking-wider fs-4 text-dark">KẾT QUẢ THÊM GIỎ HÀNG</span>',
      html: htmlContent,
      confirmButtonText: 'Đến giỏ hàng',
      showCancelButton: true,
      cancelButtonText: 'Đóng',
      buttonsStyling: false,
      customClass: {
        popup: 'border-0 shadow-lg',
        confirmButton: 'editorial-btn px-4 py-2 ms-2',
        cancelButton: 'editorial-btn-outline px-4 py-2'
      },
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/cart');
      }
    });

  } catch (err) {
    // Bắt lỗi nếu API trả về fail (ví dụ tất cả đều hết hàng)
    const errData = err.response?.data?.data || {};
    const outOfStock = errData.out_of_stock || [];
    let errorHtml = escapeHtml(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng lúc này.');

    if (outOfStock.length > 0) {
        errorHtml = `<div class="text-start mt-3" style="font-family: 'Josefin Sans', sans-serif;">
            <p class="text-danger fw-bold mb-2">${errorHtml}</p>
            <ul class="text-muted small ps-3 mb-0" style="list-style-type: disc;">
                ${outOfStock.map(name => `<li>${escapeHtml(name)}</li>`).join('')}
            </ul>
        </div>`;
    }

    soraAlert.fire({
      icon: 'error',
      title: '<span class="font-oswald tracking-wider fs-4 text-dark">LỖI THÊM VÀO GIỎ</span>',
      html: errorHtml,
      confirmButtonText: 'Đóng',
      buttonsStyling: false,
      customClass: {
        popup: 'border-0 shadow-lg',
        confirmButton: 'editorial-btn px-4 py-2'
      }
    });
  }
};

const escapeHtml = (v = '') =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const confirmCancel = async (order) => {
  const safeOrderCode = escapeHtml(order?.order_code ?? '');
  soraAlert.fire({
    title: `<span class="font-oswald tracking-wider fs-4 text-dark">HỦY ĐƠN HÀNG <span class="text-sora-primary">#${safeOrderCode}</span></span>`,
    html: `
      <div class="text-center mb-4">
        <p class="text-muted font-sans" style="font-size: 0.95rem;">Hành động này không thể hoàn tác. Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.</p>
      </div>
      <div class="text-start p-3 bg-light border" style="border-radius: 4px;">
        <label class="form-label fw-bold text-dark font-serif" style="font-size: 0.95rem;">Lý do hủy đơn <span class="text-danger">*</span></label>
        <div class="custom-radio-group mt-2">
          ${[
            'Tôi muốn thay đổi địa chỉ nhận hàng',
            'Tôi muốn thay đổi phương thức thanh toán',
            'Tôi muốn thêm/bớt sản phẩm trong đơn',
            'Thời gian giao hàng quá lâu',
            'Lý do khác'
          ].map((reason, idx) => `
            <div class="form-check mb-2">
              <input class="form-check-input cancel-reason-radio" type="radio" name="cancelReason" id="reason${idx}" value="${reason}">
              <label class="form-check-label font-sans text-secondary" style="font-size: 0.9rem; cursor: pointer;" for="reason${idx}">
                ${reason === 'Lý do khác' ? 'Lý do khác (Vui lòng nhập chi tiết)...' : reason}
              </label>
            </div>
          `).join('')}
        </div>
        <div id="cancelReasonTextareaWrapper" style="display: none; animation: fadeIn 0.3s ease; margin-top: 10px;">
          <textarea id="cancelReasonTextarea" class="form-control border-secondary shadow-none py-2 font-sans" rows="3" style="font-size: 0.9rem; resize: none; border-radius: 4px;" placeholder="Chia sẻ thêm lý do cụ thể của bạn để chúng tôi cải thiện dịch vụ..."></textarea>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận hủy',
    cancelButtonText: 'Đóng',
    buttonsStyling: false,
    customClass: {
      popup: 'border-0 shadow-lg',
      confirmButton: 'editorial-btn px-4 py-2 ms-2',
      cancelButton: 'editorial-btn-outline px-4 py-2'
    },
    reverseButtons: true,
    didOpen: () => {
      const radios = document.querySelectorAll('.cancel-reason-radio');
      const wrapper = document.getElementById('cancelReasonTextareaWrapper');
      const textarea = document.getElementById('cancelReasonTextarea');
      radios.forEach(radio => {
        radio.addEventListener('change', function () {
          if (this.value === 'Lý do khác') {
            if (wrapper) wrapper.style.display = 'block';
            if (textarea) textarea.focus();
          } else {
            if (wrapper) wrapper.style.display = 'none';
          }
        });
      });
    },
    preConfirm: () => {
      const selectedRadio = document.querySelector('.cancel-reason-radio:checked');
      if (!selectedRadio) {
        soraAlert.showValidationMessage('Vui lòng chọn một lý do!');
        return false;
      }
      const selectVal = selectedRadio.value;
      if (selectVal === 'Lý do khác') {
        const textVal = document.getElementById('cancelReasonTextarea').value.trim();
        if (!textVal || textVal.length < 5) {
          soraAlert.showValidationMessage('Vui lòng nhập lý do cụ thể (ít nhất 5 ký tự)!');
          return false;
        }
        return textVal;
      }
      return selectVal;
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await clientApiClient.put(`/client/orders/${order.order_code}`, { action: 'cancel', cancel_reason: result.value });
        soraAlert.fire({ icon: 'success', title: 'Thành công', text: 'Đơn hàng đã được hủy.' });
        if (isModalOpen.value) closeModal();
        queryClient.invalidateQueries(['client_orders']);
      } catch (err) {
        soraAlert.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Không thể hủy đơn' });
      }
    }
  });
};

const handleConfirmRefund = async (order, isAccepted) => {
    try {
        const textStr = isAccepted ? 'đồng ý với mức hoàn tiền được đề xuất' : 'từ chối mức hoàn tiền (yêu cầu hoàn trả sẽ bị hủy)';
        const result = await soraAlert.fire({
            title: 'Xác nhận',
            text: `Bạn có chắc chắn muốn ${textStr}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Đóng',
            customClass: { confirmButton: 'btn btn-primary px-4 me-2', cancelButton: 'btn btn-secondary px-4' },
            buttonsStyling: false
        });
        
        if (result.isConfirmed) {
            Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const res = await clientApiClient.post(`/client/orders/${order.order_code}/return/confirm`, {
                is_accepted: isAccepted
            });
            Swal.fire('Thành công', res.data.message || 'Cập nhật thành công', 'success');
            queryClient.invalidateQueries(['client_orders']);
        }
    } catch (err) {
        Swal.fire('Lỗi', err.response?.data?.message || 'Không thể cập nhật yêu cầu', 'error');
    }
};

const exportInvoice = async (order) => {
  if (!order?.order_code) return;

  try {
    const res = await clientApiClient.get(`/client/orders/${order.order_code}/invoice`, {
      headers: { Accept: 'application/pdf' },
      responseType: 'blob',
    });

    // Tạo link tải file
    const blobUrl = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `hoa-don-${order.order_code}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

  } catch (err) {
    console.error(err);
    soraAlert.fire({
      icon: 'error',
      title: 'Lỗi',
      text: err.response?.data?.message || 'Không thể tải hóa đơn',
    });
  }
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');


.font-oswald {
  font-family: 'Oswald', sans-serif !important;
}

.text-primary-custom {
  color: #9f273b !important;
}

.bg-primary-custom {
  background-color: #9f273b !important;
}

.btn-primary-custom {
  background: #9f273b;
  border: none;
  color: white;
  transition: 0.3s;
}

.btn-primary-custom:hover {
  background: #cc1e2e;
  color: white;
}

.btn-outline-primary-custom {
  color: #9f273b;
  border: 1px solid #9f273b;
  background: transparent;
  transition: 0.3s;
}

.btn-outline-primary-custom:hover {
  background: #9f273b;
  color: white;
}

/* Button Luxury States */
.btn-luxury-neutral, .btn-luxury-danger, .btn-luxury-success, .btn-luxury-success-light {
  position: relative;
  overflow: hidden;
  font-family: 'Oswald', sans-serif;
}

.btn-luxury-neutral::after, 
.btn-luxury-danger::after, 
.btn-luxury-success::after, 
.btn-luxury-success-light::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.btn-luxury-neutral:hover::after, 
.btn-luxury-danger:hover::after, 
.btn-luxury-success:hover::after, 
.btn-luxury-success-light:hover::after {
  transform: rotate(45deg) translateY(200%);
}

.btn-luxury-neutral {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-neutral:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.06);
}

.btn-luxury-danger {
  background-color: #FCF0F1;
  color: #9F273B;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-danger:hover {
  background-color: #9F273B;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(159,39,59,0.25);
}

.editorial-btn.btn-luxury-gold {
  background-color: #e7ce7d !important;
  color: #fff !important;
}
.editorial-btn.btn-luxury-gold:hover {
  background-color: #d4af37 !important;
  box-shadow: 0 8px 20px rgba(231,206,125,0.4) !important;
}

.btn-luxury-success {
  background-color: #009981;
  color: #fff;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-success:hover {
  background-color: #007b67;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,153,129,0.3);
}

.btn-luxury-success-light {
  background-color: #E2F3E5;
  color: #009981;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.btn-luxury-success-light:hover {
  background-color: #009981;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,153,129,0.2);
}

.border-danger-custom {
  border-color: #9f273b !important;
}

.bg-warning-custom {
  background: #ffecb5;
  border: 1px solid #ffe69c;
}

.bg-info-custom {
  background: #17a2b8;
}

.font-serif {
  font-family: 'Josefin Sans', sans-serif;
}

.tracking-wider {
  letter-spacing: 0.1em;
}

.hover-primary:hover {
  color: #9f273b !important;
}

.order-tabs::-webkit-scrollbar {
  height: 4px;
}

.order-tabs::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 10px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0 0 10px 0;
  color: #6c757d;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #343a40;
}

.tab-btn.active {
  color: #9f273b;
  border-bottom: 2px solid #9f273b;
}

.order-card-luxury {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important;
}

.pagination-custom .page-link {
  color: #495057;
  border: none;
  background: white;
  margin: 0 5px;
  border-radius: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: 0.3s;
}

.pagination-custom .page-link:hover {
  background: #f8f9fa;
  color: #9f273b;
}

.pagination-custom .active .page-link {
  background: #9f273b;
  color: white;
}

.order-stepper-horizontal {
  position: relative;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
}

.order-stepper-horizontal::before {
  content: '';
  position: absolute;
  top: 18px;
  left: 40px;
  right: 40px;
  height: 2px;
  background-color: #e9ecef;
  z-index: 1;
}

.stepper-step {
  position: relative;
  z-index: 2;
  text-align: center;
  flex: 1;
}

.step-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.step-icon {
  width: 38px;
  height: 38px;
  background-color: #f8f9fa;
  color: #adb5bd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  border: 3px solid #fff;
  transition: all 0.3s;
  box-shadow: 0 0 0 1px #dee2e6;
}

.stepper-step.completed .step-icon {
  background-color: #9f273b;
  color: #fff;
  border-color: #fff;
  box-shadow: none;
}

.stepper-step.active .step-icon {
  background-color: #9f273b;
  color: #fff;
  border-color: #fff;
  box-shadow: 0 0 0 4px rgba(159, 39, 59, 0.15);
}

.step-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #adb5bd;
  letter-spacing: 0.05em;
}

.stepper-step.completed .step-title,
.stepper-step.active .step-title {
  color: #9f273b;
}

@media (min-width: 992px) {
  .border-end-lg {
    border-right: 1px solid #dee2e6;
  }
}

.editorial-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  background: var(--sora-primary, #9f273b);
  color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb, 231, 206, 125), 0.5);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.editorial-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.editorial-btn:hover {
  background: var(--sora-accent, #cc1e2e);
  color: #fff;
  border-color: var(--sora-secondary, #e7ce7d);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.editorial-btn:hover::after {
  transform: rotate(45deg) translateY(200%);
}

/* Banner (Sora Banner Style) */
.text-champagne {
  color: #ead089 !important;
}

.z-index-2 {
  z-index: 2;
}

.sora-banner {
  min-height: 380px;
  background:
    linear-gradient(135deg, rgba(54, 6, 17, 0.98), rgba(114, 20, 38, 0.96) 48%, rgba(74, 9, 24, 0.98)),
    repeating-linear-gradient(120deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 14px);
  isolation: isolate;
}

.sora-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 236, 189, 0.2), transparent 42%),
    linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.08) 44%, transparent 64%);
  opacity: 0.9;
  z-index: 0;
}

.banner-ambient {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 84px 84px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 68%);
  z-index: 0;
}

.banner-glow {
  position: absolute;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(231, 206, 125, 0.2), transparent 68%);
  filter: blur(3px);
  z-index: 0;
}

.banner-glow-left {
  left: -120px;
  bottom: -150px;
}

.banner-glow-right {
  right: -100px;
  top: -120px;
}

.banner-monogram {
  position: absolute;
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3.4rem, 9vw, 8.8rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
  bottom: 52px;
}

.banner-content {
  max-width: 850px;
}

.banner-content h1 {
  letter-spacing: 0;
  line-height: 1.05;
  text-shadow: 0 10px 35px rgba(0, 0, 0, 0.32);
}

.banner-subtitle {
  color: rgba(255, 248, 231, 0.9);
  line-height: 1.75;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.banner-line-art {
  position: absolute;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  transform: rotate(45deg);
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-line-art-left {
  left: 8%;
  top: 24%;
}

.banner-line-art-right {
  right: 8%;
  bottom: 22%;
}

@media (max-width: 992px) {
  .sora-banner {
    min-height: 340px;
  }

  .banner-line-art {
    opacity: 0.45;
  }
}

@media (max-width: 768px) {
  .sora-banner {
    min-height: 320px;
  }

  .banner-content h1 {
    font-size: 2.45rem;
  }

  .banner-subtitle {
    font-size: 1rem !important;
  }

  .banner-line-art {
    display: none;
  }

  .banner-monogram {
    bottom: 38px;
    font-size: 3.5rem;
  }
}

/* Image wrapper (Border xoắn) */
.img-wrapper {
  padding: 1rem;
}

.img-wrapper img {
  position: relative;
  z-index: 2;
}

.img-border {
  top: 0;
  left: 0;
  right: 2rem;
  bottom: 2rem;
  border: 1px solid #e7ce7d;
  z-index: 1;
}

.custom-img-portrait {
  aspect-ratio: 4/5;
}

/* Đường kẻ ngăn cách (Divider) */
.divider {
  width: 4rem;
  height: 2px;
}

/* Card Mission & Vision */
.card-hover {
  transition: box-shadow 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
}

.card-indicator {
  width: 4px;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.card-hover:hover .card-indicator {
  width: 100%;
  opacity: 0.05;
}

/* Icon vòng tròn */
.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid;
}

/* Khối sản phẩm (Fix ảnh vuông tuyệt đối) */
.square-ratio {
  width: 100%;
  padding-bottom: 100%;
  /* Tạo tỷ lệ vuông chuẩn 1:1 */
  display: block;
  overflow: hidden;
}

.img-zoom-wrapper img {
  transition: transform 0.7s ease;
}

.product-card:hover .img-zoom-wrapper img {
  transform: scale(1.1);
}

.product-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 2;
}

/* Link khám phá */
.product-link:hover {
  color: #cc1e2e !important;
}

/* Combo Carousel Container Overrides */
.combos-editorial {
  background-color: #fffafa;
  overflow: hidden;
}

.combos-container {
  max-width: var(--home-container-width, 1400px);
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 3rem;
}

.section-kicker {
  display: block;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sora-primary, #9f273b);
  margin-bottom: 0.75rem;
}

.section-heading h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}

.text-gold {
  color: #d4af37 !important;
}
</style>