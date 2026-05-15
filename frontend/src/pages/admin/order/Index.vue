<template>
  <div class="order-index-wrapper pb-5 mb-5">

    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100"
      style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ
        liệu đơn hàng...</p>
    </div>

    <div class="container-fluid py-4" v-else>

      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-0">Quản lý Đơn Hàng</h3>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="border rounded px-3 py-2 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel
              }}</span>
          </div>
          <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="fetchData(1, true)">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
        </div>
      </div>

      <div class="mb-3">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'all' }">{{
                statusCounts['all'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'pending' }" @click.prevent="switchTab('pending')">
              <i class="bi bi-hourglass-split me-2 text-warning"></i> Chờ duyệt
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'pending' }">{{
                statusCounts['pending'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'confirmed' }" @click.prevent="switchTab('confirmed')">
              <i class="bi bi-check-circle me-2 text-info"></i> Đã xác nhận
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'confirmed' }">{{
                statusCounts['confirmed'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'processing' }" @click.prevent="switchTab('processing')">
              <i class="bi bi-box-seam-fill me-2 text-primary"></i> Đang chuẩn bị
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'processing' }">{{
                statusCounts['processing'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'shipping' }" @click.prevent="switchTab('shipping')">
              <i class="bi bi-truck me-2 text-primary"></i> Đang giao
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'shipping' }">{{
                statusCounts['shipping'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#"
              :class="{ 'active-tab': activeTab === 'delivered' }" @click.prevent="switchTab('delivered')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đã giao
              <span class="badge ms-2 rounded-pill tab-badge" :class="{ 'active-badge': activeTab === 'delivered' }">{{
                statusCounts['delivered'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#"
              :class="{ 'active-tab': activeTab === 'cancelled' }" @click.prevent="switchTab('cancelled')">
              <i class="bi bi-x-circle-fill me-2"></i> Đã hủy
              <span class="badge ms-2 rounded-pill bg-danger text-white">{{ statusCounts['cancelled'] || 0 }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Lọc -->
      <div class="d-flex flex-column flex-md-row flex-wrap gap-3 gap-md-4 mb-4 align-items-start">

        <div class="filter-wrapper">
          <label class="form-label small text-muted fw-bold mb-2"><i
              class="bi bi-credit-card-fill text-brand me-1"></i>Trạng thái Thanh toán</label>
          <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
            <select class="form-select form-select-sm border-0 bg-transparent fw-bold p-0 pe-4 cursor-pointer"
              style="min-width: 140px; box-shadow: none;" v-model="filters.payment_status" @change="fetchData(1, true)">
              <option value="all">Tất cả trạng thái</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>

        <div class="filter-wrapper">
          <label class="form-label small text-muted fw-bold mb-2"><i
              class="bi bi-calendar-range text-brand me-1"></i>Lọc theo Khoảng thời gian</label>
          <div class="d-flex flex-wrap gap-2">
            <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
              <span class="text-muted small fw-semibold me-2">Từ:</span>
              <input type="date" class="form-control form-control-sm border-0 bg-transparent fw-bold p-0"
                style="box-shadow: none; width: 115px;" v-model="filters.start_date" @change="fetchData(1, true)">
            </div>
            <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
              <span class="text-muted small fw-semibold me-2">Đến:</span>
              <input type="date" class="form-control form-control-sm border-0 bg-transparent fw-bold p-0"
                style="box-shadow: none; width: 115px;" v-model="filters.end_date" @change="fetchData(1, true)">
            </div>
          </div>
        </div>

      </div>

      <!-- Bảng Đơn Hàng -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div
          class="card-header bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
            <i class="bi bi-receipt me-2"></i>Danh sách Đơn hàng
            <div v-if="isSilentLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></div>
          </h6>

          <div class="search-box position-relative w-100" style="max-width: 350px;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2 w-100"
              v-model="searchQuery" @keyup.enter="fetchData(1, true)" placeholder="Tìm Mã đơn, Tên KH, SĐT...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted cursor-pointer"
              @click="fetchData(1, true)"></i>
          </div>
        </div>

        <div class="card-body p-0 mt-2">
          <div class="table-responsive border-0">
            <table class="table table-hover align-middle mb-0 responsive-table w-100">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-3 text-secondary border-0" style="width: 15%;">Mã Đơn / Ngày</th>
                  <th class="py-3 px-3 text-secondary border-0" style="width: 20%;">Khách hàng</th>
                  <th class="py-3 px-3 text-secondary border-0 text-end" style="width: 14%;">Tổng tiền</th>
                  <th class="py-3 px-3 text-secondary border-0 text-center" style="width: 21%;">Thanh toán <span
                      class="d-none d-xl-inline">(Sửa nhanh)</span></th>
                  <th class="py-3 px-3 text-secondary border-0 text-center" style="width: 21%;">Trạng thái <span
                      class="d-none d-xl-inline">(Sửa nhanh)</span></th>
                  <th class="py-3 px-3 text-secondary text-center border-0" style="width: 9%;">Chi tiết</th>
                </tr>
              </thead>
              <tbody :class="{ 'pe-none': isSilentLoading }">
                <tr v-if="orders.length === 0 && !isSilentLoading">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không tìm thấy đơn hàng nào.
                  </td>
                </tr>

                <template v-else>
                  <tr v-for="order in displayedOrders" :key="order.id" :class="getOrderRowClass(order.status)">

                    <td data-label="Mã Đơn / Ngày" class="px-3 py-3 text-nowrap">
                      <div :class="`fw-bold fs-6 mb-1 font-monospace cursor-pointer ${getOrderCodeClass(order.status)}`" @click="openQuickView(order.id)">{{ order.order_code }}</div>
                      <div class="text-muted small"><i class="bi bi-clock me-1"></i>{{ formatDate(order.created_at) }}
                      </div>
                    </td>

                    <td data-label="Khách hàng" class="px-3 overflow-hidden">
                      <div class="fw-bold text-dark text-truncate mb-1"><i
                          class="bi bi-person-fill me-1 text-secondary"></i> {{ order.customer_name }}</div>
                      <div class="small text-muted text-truncate"><i class="bi bi-telephone-fill me-1"></i> {{
                        order.customer_phone }}</div>
                    </td>

                    <td data-label="Tổng tiền" class="px-3 text-end text-nowrap">
                      <div class="fw-bold text-success">{{ formatCurrency(order.total_amount) }}</div>
                      <div class="small text-muted mt-1">{{ order.items_count || 0 }} Món</div>
                    </td>

                    <td data-label="Thanh toán" class="px-3">
                      <div class="d-flex flex-column align-items-end align-items-md-center w-100"
                        style="max-width: 150px; margin: 0 auto;">
                        <select
                          class="form-select form-select-sm border shadow-sm fw-bold cursor-pointer text-dark bg-white w-100"
                          style="font-size: 0.75rem; border-color: #ced4da !important;"
                          :class="getPaymentSelectClass(order.localPaymentStatus || order.payment_status)"
                          v-model="order.localPaymentStatus" @change="checkPaymentStatusChange(order)"
                          :disabled="order.isUpdatingPayment || ['delivered', 'cancelled', 'returned'].includes(order.status) || order.payment_status === 'refunded'">
                          <option value="unpaid" v-if="canPaymentTransitionTo(order.payment_status, 'unpaid')">Chưa TT
                          </option>
                          <option value="paid" v-if="canPaymentTransitionTo(order.payment_status, 'paid')">Đã TT
                          </option>
                          <option value="refunded" v-if="canPaymentTransitionTo(order.payment_status, 'refunded')">Đã
                            hoàn tiền</option>
                          <option value="failed" v-if="canPaymentTransitionTo(order.payment_status, 'failed')">Thất bại
                          </option>
                        </select>

                        <div v-if="order.isUpdatingPayment" class="mt-2 text-center w-100">
                          <div class="spinner-border text-brand"
                            style="width: 1.1rem; height: 1.1rem; border-width: 0.15em;" role="status"></div>
                        </div>

                        <div v-else-if="order.isPaymentStatusChanged" class="mt-2 w-100 d-flex gap-1 animate-fade-in">
                          <button @click="savePaymentStatus(order)"
                            class="btn btn-sm btn-brand text-white flex-grow-1 shadow-sm d-flex align-items-center justify-content-center action-btn-hover"
                            style="padding: 0.35rem; font-size: 0.75rem;" title="Xác nhận">
                            <i class="bi bi-send-check-fill me-1"></i> Xác nhận
                          </button>
                          <button @click="cancelPaymentStatusChange(order)"
                            class="btn btn-sm btn-light border shadow-sm d-flex align-items-center justify-content-center action-btn-hover"
                            style="padding: 0.35rem 0.5rem;" title="Hủy">
                            <i class="bi bi-x-lg text-danger" style="font-size: 0.75rem;"></i>
                          </button>
                        </div>

                        <div class="small fw-semibold text-muted text-uppercase mt-2 text-nowrap"
                          style="font-size: 0.65rem;" v-if="!order.isPaymentStatusChanged && !order.isUpdatingPayment">
                          <i class="bi bi-wallet2 me-1"></i> {{ order.payment_method }}
                        </div>
                      </div>
                    </td>

                    <td data-label="Trạng thái" class="px-3">
                      <div class="d-flex flex-column align-items-end align-items-md-center w-100"
                        style="max-width: 150px; margin: 0 auto;">
                        <select
                          class="form-select form-select-sm border shadow-sm fw-bold cursor-pointer text-dark bg-white w-100"
                          style="font-size: 0.75rem; border-color: #ced4da !important;"
                          :class="getOrderStatusClass(order.localStatus || order.status)" v-model="order.localStatus"
                          @change="checkStatusChange(order)"
                          :disabled="order.isUpdatingStatus || ['delivered', 'cancelled', 'returned'].includes(order.status)">
                          <option value="pending" v-if="canTransitionTo(order.status, 'pending')">Chờ duyệt</option>
                          <option value="confirmed" v-if="canTransitionTo(order.status, 'confirmed')">Đã xác nhận
                          </option>
                          <option value="processing" v-if="canTransitionTo(order.status, 'processing')">Đang chuẩn bị
                          </option>
                          <option value="shipping" v-if="canTransitionTo(order.status, 'shipping')">Đang giao</option>
                          <option value="delivered" v-if="canTransitionTo(order.status, 'delivered')">Đã giao</option>
                          <option value="cancelled" v-if="canTransitionTo(order.status, 'cancelled')">Hủy đơn</option>
                        </select>

                        <div v-if="order.isUpdatingStatus" class="mt-2 text-center w-100">
                          <div class="spinner-border text-brand"
                            style="width: 1.1rem; height: 1.1rem; border-width: 0.15em;" role="status"></div>
                        </div>

                        <div v-else-if="order.isStatusChanged" class="mt-2 w-100 d-flex gap-1 animate-fade-in">
                          <button @click="saveOrderStatus(order)"
                            class="btn btn-sm btn-brand text-white flex-grow-1 shadow-sm d-flex align-items-center justify-content-center action-btn-hover"
                            style="padding: 0.35rem; font-size: 0.75rem;" title="Xác nhận">
                            <i class="bi bi-send-check-fill me-1"></i> Xác nhận
                          </button>
                          <button @click="cancelStatusChange(order)"
                            class="btn btn-sm btn-light border shadow-sm d-flex align-items-center justify-content-center action-btn-hover"
                            style="padding: 0.35rem 0.5rem;" title="Hủy">
                            <i class="bi bi-x-lg text-danger" style="font-size: 0.75rem;"></i>
                          </button>
                        </div>
                      </div>
                    </td>

                    <td data-label="Thao tác" class="px-3 text-center">
                      <div class="d-flex justify-content-end justify-content-md-center gap-2">
                        <button class="btn btn-sm btn-light text-brand shadow-sm border action-btn-hover"
                          @click="openQuickView(order.id)" title="Xem nhanh (Quick View)">
                          <i class="bi bi-eye-fill"></i>
                        </button>
                        <router-link :to="{ name: 'admin-orders-edit', params: { id: order.id } }"
                          class="btn btn-sm btn-light text-primary shadow-sm border action-btn-hover"
                          title="Xử lý đơn (Sửa chi tiết)">
                          <i class="bi bi-pencil-square"></i>
                        </router-link>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3"
        v-if="pagination.lastPage > 1 && !isTableLoading">
        <span class="text-muted small text-center">Hiển thị trang {{ pagination.currentPage }} / {{ pagination.lastPage
          }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }"><button
                class="page-link text-brand" @click="fetchData(pagination.currentPage - 1, true)"><i
                  class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in pagination.lastPage" :key="page"
              :class="{ active: pagination.currentPage === page }"><button class="page-link"
                :class="pagination.currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'"
                @click="fetchData(page, true)">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.lastPage }"><button
                class="page-link text-brand" @click="fetchData(pagination.currentPage + 1, true)"><i
                  class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- MODAL QUICK VIEW (CHI TIẾT ĐƠN HÀNG) -->
    <OrderQuickViewModal ref="quickViewModalRef" :order="selectedOrder" :warehouses="warehouses"
      :defaultWarehouseId="selectedWarehouseId" @open-tracking="handleOpenTracking" />

    <!-- MODAL LIVE MAP TRACKING -->
    <TrackingMapModal ref="trackingMapModalRef" />

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import OrderQuickViewModal from './OrderQuickViewModal.vue';
import TrackingMapModal from '@/components/admin/TrackingMapModal.vue';

let adminChannel = null;

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const orders = ref([]);
const systemModules = ref([]);

const isFirstLoad = ref(true);
const isTableLoading = ref(false);
const isSilentLoading = ref(false);

const searchQuery = ref('');
const activeTab = ref('all');
const filters = ref({ payment_status: 'all', start_date: '', end_date: '' });
const currentPageLevel = ref(null);

const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 });
const selectedOrder = ref(null);
const quickViewModalRef = ref(null);
const trackingMapModalRef = ref(null);
let isUnmounted = false;

const statusCounts = ref({ all: 0, pending: 0, confirmed: 0, processing: 0, shipping: 0, delivered: 0, cancelled: 0, returned: 0 });
const tabCache = ref({});

const warehouses = [
  { id: 'bmt', name: 'Buôn Ma Thuột' },
  { id: 'hn', name: 'Hà Nội' },
  { id: 'hcm', name: 'TP.HCM' },
  { id: 'dn', name: 'Đà Nẵng' },
  { id: 'ct', name: 'Cần Thơ' }
];
const selectedWarehouseId = ref('bmt');

const quickNotesDict = {
  'pending': ['Đơn hàng mới tiếp nhận', 'Đang chờ xác nhận thông vị'],
  'confirmed': ['Đơn hàng đã được xác nhận', 'Hàng đã sẵn sàng', 'Đang chờ điều phối từ kho'],
  'processing': ['Đơn hàng đang được xử lý', 'Đang đóng gói sản phẩm', 'Đang kiểm tra chất lượng trước khi giao'],
  'shipping': ['Đơn hàng đã bắt đầu vận chuyển', 'Đã bàn giao cho bưu tá', 'Đơn hàng đang trên đường giao đến bạn'],
  'delivered': ['Giao hàng thành công', 'Khách đã nhận hàng và đồng kiểm'],
  'cancelled': ['Khách hàng không nghe máy', 'Khách hàng đổi ý', 'Sản phẩm tạm hết hàng', 'Sai thông tin địa chỉ'],
  'returned': ['Khách từ chối nhận hàng', 'Hàng hoàn về kho']
};

const defaultNotesDict = {
  'pending': 'Hệ thống đã tiếp nhận đơn hàng.',
  'confirmed': 'Đơn hàng đã được xác nhận thành công.',
  'processing': 'Đơn hàng đang trong quá trình đóng gói và kiểm tra chất lượng.',
  'shipping': 'Đơn hàng đã được bàn giao cho đối tác vận chuyển.',
  'delivered': 'Đơn hàng đã giao thành công đến quý khách.',
  'cancelled': '',
  'returned': ''
};

onBeforeUnmount(() => {
  isUnmounted = true;
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = ''; document.body.style = '';

  if (window.Echo) {
    window.Echo.leave('admin');
  }
});

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });
const formatCurrency = (val) => { if (val === null || val === undefined || val === '' || isNaN(val)) return '---'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val); };
const formatDate = (dateString) => { if (!dateString) return ''; const d = new Date(dateString); return d.toLocaleDateString('vi-VN'); };
const formatDateTime = (dateString) => { if (!dateString) return ''; const d = new Date(dateString); return d.toLocaleString('vi-VN'); };

const getLevelColor = (level) => {
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

const formatPaymentStatus = (status) => ({ 'unpaid': 'Chưa TT', 'paid': 'Đã TT', 'refunded': 'Đã hoàn', 'failed': 'Thất bại' }[status] || status);
const getPaymentSelectClass = (status) => ({ 'unpaid': 'text-warning border-warning bg-warning bg-opacity-10', 'paid': 'text-success border-success bg-success bg-opacity-10', 'refunded': 'text-info border-info bg-info bg-opacity-10', 'failed': 'text-danger border-danger bg-danger bg-opacity-10' }[status] || 'bg-light text-secondary');
const getOrderStatusClass = (status) => ({ 'pending': 'text-warning border-warning bg-warning bg-opacity-10', 'confirmed': 'text-info border-info bg-info bg-opacity-10', 'processing': 'text-primary border-primary bg-primary bg-opacity-10', 'shipping': 'text-primary border-primary bg-primary bg-opacity-10', 'delivered': 'text-success border-success bg-success bg-opacity-10', 'cancelled': 'text-danger border-danger bg-danger bg-opacity-10', 'returned': 'text-secondary border-secondary bg-secondary bg-opacity-10', 'return_requested': 'text-danger border-danger bg-danger bg-opacity-10' }[status] || 'bg-light text-secondary');
const formatOrderStatus = (status) => ({ 'pending': 'Chờ duyệt', 'confirmed': 'Đã xác nhận', 'processing': 'Đang chuẩn bị', 'shipping': 'Đang giao', 'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'returned': 'Hoàn trả' }[status] || status);

const allowedTransitions = { 'pending': ['pending', 'confirmed', 'cancelled'], 'confirmed': ['confirmed', 'processing', 'cancelled'], 'processing': ['processing', 'shipping', 'cancelled'], 'shipping': ['shipping', 'delivered', 'cancelled'], 'delivered': ['delivered'], 'cancelled': ['cancelled'], 'returned': ['returned'], 'return_requested': ['return_requested'] };
const canTransitionTo = (currentStatus, targetStatus) => allowedTransitions[currentStatus]?.includes(targetStatus);

const getOrderRowClass = (status) => {
  const classes = {
    'pending': 'bg-warning bg-opacity-20',
    'confirmed': 'bg-info bg-opacity-20',
    'processing': 'bg-primary bg-opacity-20',
    'shipping': 'bg-primary bg-opacity-20',
    'delivered': 'bg-success bg-opacity-20',
    'cancelled': 'bg-danger bg-opacity-20',
    'returned': 'bg-secondary bg-opacity-20'
  };
  return classes[status] || '';
};

const getOrderCodeClass = (status) => {
  const classes = {
    'pending': 'text-warning',
    'confirmed': 'text-info',
    'processing': 'text-primary',
    'shipping': 'text-primary',
    'delivered': 'text-success',
    'cancelled': 'text-danger',
    'returned': 'text-secondary'
  };
  return classes[status] || 'text-brand';
};

const checkStatusChange = (order) => { order.isStatusChanged = (order.localStatus !== order.status); };
const cancelStatusChange = (order) => { order.localStatus = order.status; order.isStatusChanged = false; };

const saveOrderStatus = async (order) => {
  if (order.localStatus === 'delivered' && order.payment_status !== 'paid') {
    Swal.fire({ title: 'Khoan đã! Chưa thu tiền', text: 'Để đảm bảo doanh thu, vui lòng cập nhật trạng thái Thanh toán thành "Đã TT" trước khi xác nhận Giao hàng Hoàn tất.', icon: 'warning', confirmButtonColor: '#009981' });
    cancelStatusChange(order); return;
  }

  const isRequireNote = order.localStatus === 'cancelled';
  const notes = quickNotesDict[order.localStatus] || [];
  const defaultNote = defaultNotesDict[order.localStatus] || '';

  let radiosHtml = '';
  if (notes.length > 0) {
    notes.forEach((n, idx) => {
      const checked = idx === 0 ? 'checked' : '';
      radiosHtml += `
          <div class="form-check text-start mb-2 px-3 py-2 bg-white rounded border border-light-subtle shadow-sm cursor-pointer note-radio-wrap">
              <input class="form-check-input note-radio custom-radio cursor-pointer mt-1" type="radio" name="status_note_index" id="idx_note_${idx}" value="${n}" ${checked}>
              <label class="form-check-label cursor-pointer w-100 fw-medium" for="idx_note_${idx}" style="font-size: 0.9rem;">${n}</label>
          </div>`;
    });
  }

  radiosHtml += `
  <div class="form-check text-start mb-2 px-3 py-2 bg-white rounded border border-light-subtle shadow-sm cursor-pointer note-radio-wrap">
      <input class="form-check-input note-radio custom-radio cursor-pointer mt-1" type="radio" name="status_note_index" id="idx_note_other" value="OTHER" ${notes.length === 0 ? 'checked' : ''}>
      <label class="form-check-label cursor-pointer w-100 fw-medium" for="idx_note_other" style="font-size: 0.9rem;">Khác (Tự nhập lý do)</label>
  </div>`;

  const { value: noteText, isDismissed } = await Swal.fire({
    title: 'Cập nhật Trạng thái',
    html: `
        <p class="mb-3">Chuyển đơn hàng sang: <strong class="text-brand fs-5">${formatOrderStatus(order.localStatus)}</strong></p>
        <div class="bg-light p-3 rounded border mb-3 custom-scrollbar-y" style="max-height: 220px; overflow-y: auto;">
            <p class="text-start fw-bold small text-muted mb-2"><i class="bi bi-list-check me-1 text-brand"></i> Chọn lý do thay đổi:</p>
            ${radiosHtml}
        </div>
        <textarea id="swal-custom-note" class="form-control shadow-sm border-brand ${notes.length > 0 ? 'd-none' : ''}" rows="3" placeholder="Nhập ghi chú chi tiết bắt buộc...">${notes.length === 0 ? defaultNote : ''}</textarea>
    `,
    showCancelButton: true,
    confirmButtonColor: '#009981',
    cancelButtonText: 'Hủy bỏ',
    confirmButtonText: 'Lưu cập nhật',
    didOpen: () => {
      const radios = document.querySelectorAll('.note-radio');
      const wrappers = document.querySelectorAll('.note-radio-wrap');
      const textarea = document.getElementById('swal-custom-note');

      const checkedRadio = document.querySelector('.note-radio:checked');
      if (checkedRadio) checkedRadio.closest('.note-radio-wrap').classList.add('active-radio');

      wrappers.forEach((w, i) => {
        w.addEventListener('click', () => {
          radios[i].checked = true; radios[i].dispatchEvent(new Event('change'));
          wrappers.forEach(wr => wr.classList.remove('active-radio'));
          w.classList.add('active-radio');
        });
      });

      radios.forEach(r => {
        r.addEventListener('change', (e) => {
          if (e.target.value === 'OTHER') { textarea.classList.remove('d-none'); textarea.focus(); }
          else { textarea.classList.add('d-none'); }
        });
      });
    },
    preConfirm: () => {
      const checkedRadio = document.querySelector('.note-radio:checked');
      if (!checkedRadio) return defaultNote;
      if (checkedRadio.value === 'OTHER') {
        const val = document.getElementById('swal-custom-note').value.trim();
        if (isRequireNote && !val) { Swal.showValidationMessage('Bạn cần nhập lý do hủy đơn!'); return false; }
        return val;
      }
      return checkedRadio.value;
    }
  });

  if (isDismissed) { cancelStatusChange(order); return; }

  order.isUpdatingStatus = true;
  await sendUpdateRequest(order, { status: order.localStatus, payment_status: order.payment_status, note: noteText }, 'isUpdatingStatus', 'status', order.localStatus, 'isStatusChanged');
};

const allowedPaymentTransitions = { 'unpaid': ['unpaid', 'paid', 'failed'], 'paid': ['paid', 'refunded'], 'failed': ['failed', 'unpaid', 'paid'], 'refunded': ['refunded'] };
const canPaymentTransitionTo = (currentStatus, targetStatus) => allowedPaymentTransitions[currentStatus]?.includes(targetStatus);
const checkPaymentStatusChange = (order) => { order.isPaymentStatusChanged = (order.localPaymentStatus !== order.payment_status); };
const cancelPaymentStatusChange = (order) => { order.localPaymentStatus = order.payment_status; order.isPaymentStatusChanged = false; };

const savePaymentStatus = async (order) => {
  const { isDismissed } = await Swal.fire({
    title: 'Cập nhật Thanh toán',
    text: `Xác nhận đổi trạng thái thu tiền thành: ${formatPaymentStatus(order.localPaymentStatus)}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    cancelButtonText: 'Hủy bỏ',
    confirmButtonText: 'Đồng ý cập nhật'
  });

  if (isDismissed) { cancelPaymentStatusChange(order); return; }

  order.isUpdatingPayment = true;
  await sendUpdateRequest(order, { status: order.status, payment_status: order.localPaymentStatus, note: `Kế toán cập nhật thanh toán: ${formatPaymentStatus(order.localPaymentStatus)}` }, 'isUpdatingPayment', 'payment_status', order.localPaymentStatus, 'isPaymentStatusChanged');
};

const sendUpdateRequest = async (order, payload, loadingFlag, targetField, newValue, changedFlag) => {
  try {
    const res = await axios.put(`${API_URL}/admin/orders/${order.id}/status`, payload, { headers: getHeaders() });
    order[targetField] = newValue; order[changedFlag] = false;

    if (targetField === 'status' && newValue === 'delivered') {
      Swal.fire({ icon: 'success', title: 'Giao hàng thành công!', text: 'Đang khởi động hệ thống theo dõi xe tải...', timer: 1500, showConfirmButton: false }).then(() => {
        if (trackingMapModalRef.value) trackingMapModalRef.value.show(order.id, 'bmt', 'delivered', true);
      });
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật hệ thống thành công', showConfirmButton: false, timer: 1500 });
    }

    tabCache.value = {};
    fetchData(pagination.value.currentPage, true);
  } catch (error) {
    if (targetField === 'status') cancelStatusChange(order); else cancelPaymentStatusChange(order);
    if (error.response) {
      if (error.response.status === 422) {
        const errors = error.response.data.errors;
        let errorMsg = error.response.data.message || 'Dữ liệu không hợp lệ!';
        if (errors) { errorMsg = Object.values(errors)[0][0]; }
        Swal.fire({ icon: 'error', title: 'Không được phép!', text: errorMsg, confirmButtonColor: '#009981' });
      } else if (error.response.status === 401) { Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error'); }
      else { Swal.fire('Lỗi', `Máy chủ từ chối cập nhật (Lỗi ${error.response.status})`, 'error'); }
    } else { Swal.fire('Lỗi', 'Lỗi kết nối mạng', 'error'); }
  } finally {
    order[loadingFlag] = false;
  }
};

const openQuickView = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/admin/orders/${id}`, { headers: getHeaders() });
    if (!isUnmounted) {
      selectedOrder.value = res.data.data;
      if (quickViewModalRef.value) quickViewModalRef.value.show();
    }
  } catch (e) { }
};

const handleOpenTracking = (orderId, warehouseId) => {
  selectedWarehouseId.value = warehouseId;
  const targetOrder = orders.value.find(o => o.id === orderId) || selectedOrder.value;
  if (trackingMapModalRef.value) {
      trackingMapModalRef.value.show(orderId, warehouseId, targetOrder?.status || 'pending', false);
  }
};

const fetchData = async (page = 1, silent = false) => {
  const cacheKey = `${activeTab.value}_${page}_${filters.value.payment_status}_${filters.value.start_date}_${filters.value.end_date}_${searchQuery.value}`;

  if (tabCache.value[cacheKey]) {
    orders.value = tabCache.value[cacheKey].data;
    pagination.value = tabCache.value[cacheKey].pagination;
    isSilentLoading.value = true;
  } else {
    if (silent) isSilentLoading.value = true;
    else if (!isFirstLoad.value) isTableLoading.value = true;
  }

  let queryParams = new URLSearchParams({ page });
  if (activeTab.value !== 'all') queryParams.append('status', activeTab.value);
  if (filters.value.payment_status !== 'all') queryParams.append('payment_status', filters.value.payment_status);
  if (filters.value.start_date) queryParams.append('start_date', filters.value.start_date);
  if (filters.value.end_date) queryParams.append('end_date', filters.value.end_date);
  if (searchQuery.value) queryParams.append('search', searchQuery.value);

  try {
    const [resOrders, resModules] = await Promise.all([
      axios.get(`${API_URL}/admin/orders?${queryParams.toString()}`, { headers: getHeaders() }),
      axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() })
    ]);
    if (isUnmounted) return;

    const sysModules = resModules.data.data;
    const currentModule = sysModules.find(m => m.module_code === (route.meta.moduleCode || 'admin_orders'));
    if (currentModule) currentPageLevel.value = currentModule.required_level;

    const result = resOrders.data;
    const dataPayload = result.data.data ? result.data.data : result.data;
    if (result.counts) statusCounts.value = result.counts;

    const mappedOrders = dataPayload.map(o => ({
      ...o, localStatus: o.status, isStatusChanged: false, isUpdatingStatus: false,
      localPaymentStatus: o.payment_status, isPaymentStatusChanged: false, isUpdatingPayment: false
    }));

    const newPagination = result.data.last_page ? { currentPage: result.data.current_page, lastPage: result.data.last_page, total: result.data.total } : pagination.value;
    orders.value = mappedOrders; pagination.value = newPagination;
    tabCache.value[cacheKey] = { data: mappedOrders, pagination: newPagination };
  } catch (error) {
  } finally {
    if (!isUnmounted) { isFirstLoad.value = false; isTableLoading.value = false; isSilentLoading.value = false; }
  }
};

const switchTab = (tabId) => { activeTab.value = tabId; fetchData(1, true); };

const displayedOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value.filter(o => !['returned', 'return_requested'].includes(o.status));
  return orders.value;
});

onMounted(() => {
  fetchData(1);

  if (window.Echo) {
    adminChannel = window.Echo.private('admin');

    adminChannel.listen('.NewOrderReceived', (data) => {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'CÓ ĐƠN HÀNG MỚI!', html: `Mã đơn: <b>${data.orderCode}</b>`, showConfirmButton: false, timer: 5000 });
      tabCache.value = {}; fetchData(1, true);
    });

    adminChannel.listen('.AdminRefresh', (data) => {
      if (data.module === 'orders') {
        Swal.fire({ toast: true, position: 'bottom-start', icon: 'info', title: 'Hệ thống tự động', text: data.message, showConfirmButton: false, timer: 4000 });
        tabCache.value = {}; fetchData(pagination.value.currentPage, true);
      }
    });
  }
});
</script>

<style scoped>
.custom-tab {
  font-weight: 600 !important;
  color: #6c757d;
  border-bottom: 2px solid transparent !important;
  margin-bottom: -1px;
  transition: color 0.2s ease;
}

.custom-tab:hover {
  color: #009981;
}

.custom-tab.active-tab {
  color: #009981 !important;
  border-bottom: 2px solid #009981 !important;
}

.tab-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.active-badge {
  background-color: #e6f5f2 !important;
  color: #009981 !important;
  border-color: #009981 !important;
}

.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 1.5s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.bg-brand {
  background-color: #009981 !important;
}

.text-brand {
  color: #009981 !important;
}

.border-brand {
  border-color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  border: none;
  transition: 0.2s;
  color: white;
}

.btn-brand:hover {
  background-color: #007a67;
  color: white;
}

.btn-outline-brand {
  color: #009981;
  border-color: #009981;
  transition: 0.2s;
}

.btn-outline-brand:hover {
  background-color: #009981;
  color: white;
}

/* Nút Action Hover Mượt Mà (Đồng bộ với Edit.vue) */
.action-btn-hover {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-btn-hover:hover:not(:disabled) {
  transform: translateY(-3px) !important;
  box-shadow: 0 5px 15px rgba(0, 153, 129, 0.25) !important;
  filter: brightness(1.1) !important;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cursor-pointer {
  cursor: pointer;
}

.custom-scrollbar-y::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar-y::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-y::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.glass-modal {
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.3);
}

@media (max-width: 767.98px) {
  .responsive-table {
    display: block;
    width: 100%;
  }

  .responsive-table thead {
    display: none;
  }

  .responsive-table tbody,
  .responsive-table tr,
  .responsive-table td {
    display: block;
    width: 100%;
  }

  .responsive-table tr {
    margin-bottom: 1rem;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 0.5rem 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .responsive-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 0.75rem 1rem !important;
    border: none;
    border-bottom: 1px solid #f8f9fa;
  }

  .responsive-table td:last-child {
    border-bottom: none;
  }

  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #6c757d;
    margin-right: 1rem;
    text-align: left;
    flex-shrink: 0;
  }

  .responsive-table td>div,
  .responsive-table td>span {
    justify-content: flex-end !important;
    text-align: right;
  }

  .responsive-table td[colspan] {
    justify-content: center;
  }

  .responsive-table td[colspan]::before {
    display: none;
  }
}

@media (min-width: 768px) {
  .responsive-table {
    display: table;
    min-width: 750px;
  }
}
</style>

<style>
/* ĐÃ FIX: Chống mù màu Radio list cho form Sửa Nhanh ngoài Index.vue */
.note-radio-wrap {
  transition: all 0.2s ease;
  border: 1px solid #dee2e6;
}

.note-radio-wrap:hover {
  background-color: #f0fdfa !important;
  border-color: #009981 !important;
}

.note-radio-wrap.active-radio {
  background-color: #e6f5f2 !important;
  border-color: #009981 !important;
  border-width: 2px;
  color: #009981 !important;
}

.custom-radio:checked {
  background-color: #009981;
  border-color: #009981;
}
</style>