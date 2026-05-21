<template>
  <div class="order-returns-wrapper pb-5 mb-5">
    
    <!-- HIỂU ỨNG LOGO SHIMMER CHO LẦN ĐẦU TẢI TRANG DUY NHẤT -->
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Tải dữ liệu hoàn trả...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-0">Xử lý Hàng Hoàn / Trả</h3>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" style="border-radius: 8px;" @click="handleRefresh">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
        </div>
      </div>

      <!-- TABS TRẠNG THÁI -->
      <div class="mb-3">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả yêu cầu
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ statusCounts['all'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'pending' }" @click.prevent="switchTab('pending')">
              <i class="bi bi-inbox-fill me-2 text-warning"></i> Chờ xử lý
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'pending'}">{{ statusCounts['pending'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'proposing' }" @click.prevent="switchTab('proposing')">
              <i class="bi bi-envelope-paper-fill me-2 text-info"></i> Thương lượng
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'proposing'}">{{ statusCounts['proposing'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'refunded' }" @click.prevent="switchTab('refunded')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đã hoàn tiền
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'refunded'}">{{ statusCounts['refunded'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item ms-auto">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': activeTab === 'rejected' }" @click.prevent="switchTab('rejected')">
              <i class="bi bi-x-circle-fill me-2"></i> Đã từ chối
              <span class="badge ms-2 rounded-pill bg-danger text-white">{{ statusCounts['rejected'] || 0 }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- BỘ LỌC THỜI GIAN -->
      <div class="d-flex flex-column flex-md-row flex-wrap gap-3 gap-md-4 mb-4 align-items-start">
        <div class="filter-wrapper">
          <label class="form-label small text-muted fw-bold mb-2"><i class="bi bi-calendar-range text-brand me-1"></i>Lọc theo Khoảng thời gian</label>
          <div class="d-flex flex-wrap gap-2">
            <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
              <span class="text-muted small fw-semibold me-2">Từ:</span>
              <input type="date" class="form-control form-control-sm border-0 bg-transparent fw-bold p-0" style="box-shadow: none; width: 115px;" v-model="filters.start_date">
            </div>
            <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
              <span class="text-muted small fw-semibold me-2">Đến:</span>
              <input type="date" class="form-control form-control-sm border-0 bg-transparent fw-bold p-0" style="box-shadow: none; width: 115px;" v-model="filters.end_date">
            </div>
          </div>
        </div>
      </div>

      <!-- BẢNG DỮ LIỆU -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
            <i class="bi bi-arrow-return-left text-danger me-2"></i>Danh sách Đơn hoàn trả
            <div v-if="isFetching" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></div>
          </h6>
          
          <div class="search-box position-relative w-100" style="max-width: 350px;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2 w-100" v-model="searchQuery" @keyup.enter="handleSearch" placeholder="Tìm Mã đơn, Tên KH, SĐT...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted cursor-pointer" @click="handleSearch"></i>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive border-0">
            <table class="table table-hover align-middle mb-0 responsive-table w-100">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-2 px-md-3 text-secondary border-0" style="width: 18%;">Mã Đơn / Cập nhật</th>
                  <th class="py-3 px-2 px-md-3 text-secondary border-0" style="width: 22%;">Khách hàng</th>
                  <th class="py-3 px-2 px-md-3 text-secondary border-0 text-end" style="width: 15%;">Giá trị hoàn</th>
                  <th class="py-3 px-2 px-md-3 text-secondary border-0 text-center" style="width: 18%;">Trạng thái Yêu cầu</th>
                  <th class="py-3 px-2 px-md-3 text-secondary text-center border-0" style="width: 27%;">Thao tác</th>
                </tr>
              </thead>
              <tbody :class="{'opacity-50 pe-none': isFetching}" style="transition: opacity 0.2s;">
                <tr v-if="displayedOrders.length === 0 && !isFetching">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-shield-check fs-1 d-block mb-2 text-success opacity-50"></i>Tuyệt vời! Không tìm thấy yêu cầu hoàn trả nào.
                  </td>
                </tr>
                <tr v-else v-for="order in displayedOrders" :key="order.id" class="bg-light">
                  
                  <td data-label="Mã Đơn / Cập nhật" class="px-2 px-md-3 py-3 text-nowrap">
                    <div class="fw-bold text-danger fs-6 mb-1 font-monospace cursor-pointer" @click="openQuickView(order.id)">{{ order.order_code }}</div>
                    <div class="text-muted small"><i class="bi bi-clock me-1"></i>{{ formatDateTime(order.updated_at) }}</div>
                  </td>
                  
                  <td data-label="Khách hàng" class="px-2 px-md-3 overflow-hidden">
                    <div class="fw-bold text-dark text-truncate mb-1"><i class="bi bi-person-fill me-1 text-secondary"></i> {{ order.customer_name }}</div>
                    <div class="small text-muted text-truncate"><i class="bi bi-telephone-fill me-1"></i> {{ order.customer_phone }}</div>
                  </td>
                  
                  <td data-label="Giá trị hoàn" class="px-2 px-md-3 text-end text-nowrap">
                    <div v-if="order.refund_amount !== null && order.refund_amount < order.total_amount" class="text-muted text-decoration-line-through small">{{ formatCurrency(order.total_amount) }}</div>
                    <div class="fw-bold text-danger fs-5">{{ formatCurrency(order.refund_amount !== null ? order.refund_amount : order.total_amount) }}</div>
                  </td>

                  <td data-label="Trạng thái Yêu cầu" class="px-2 px-md-3 text-center">
                    <div class="badge px-3 py-2 w-100 text-uppercase border" :class="getReturnStatusUi(order).class">
                        <i class="bi me-1" :class="getReturnStatusUi(order).icon"></i>
                        {{ getReturnStatusUi(order).text }}
                    </div>
                  </td>

                  <td data-label="Thao tác" class="px-2 px-md-3 text-center">
                    <div class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-sm btn-light text-brand shadow-sm border action-btn-hover" @click="openQuickView(order.id)" title="Xem chi tiết đơn hoàn">
                          <i class="bi bi-eye-fill"></i>
                      </button>
                      
                      <button v-if="['pending', 'proposing', 'rejected'].includes(getReturnStatusUi(order).statusCode)" 
                              class="btn btn-sm shadow-sm fw-bold flex-grow-1 action-btn-hover"
                              :class="getReturnStatusUi(order).statusCode === 'rejected' ? 'btn-outline-danger' : (getReturnStatusUi(order).statusCode === 'pending' ? 'btn-primary' : 'btn-info text-white')" 
                              @click="processRefund(order)">
                          <i class="bi" :class="getReturnStatusUi(order).statusCode === 'rejected' ? 'bi-arrow-counterclockwise' : (getReturnStatusUi(order).statusCode === 'pending' ? 'bi-shield-exclamation' : 'bi-envelope-paper')"></i> 
                          {{ getReturnStatusUi(order).statusCode === 'rejected' ? 'Thương lượng lại' : 'Xử lý / Cập nhật' }}
                      </button>
                      
                      <div v-else-if="getReturnStatusUi(order).statusCode === 'refunded'" class="text-success small fw-bold flex-grow-1 d-flex align-items-center justify-content-center border rounded bg-success bg-opacity-10">
                          <i class="bi bi-check-all fs-5 me-1"></i> Hoàn tất
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3" v-if="pagination.lastPage > 1">
        <span class="text-muted small text-center">Hiển thị trang {{ pagination.currentPage }} / {{ pagination.lastPage }} (Tổng: {{ pagination.total }} đơn)</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }"><button class="page-link text-brand" @click="changePage(pagination.currentPage - 1)"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in pagination.lastPage" :key="page" :class="{ active: pagination.currentPage === page }"><button class="page-link" :class="pagination.currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="changePage(page)">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.lastPage }"><button class="page-link text-brand" @click="changePage(pagination.currentPage + 1)"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
      
      <!-- MODAL CHI TIẾT (QUICK VIEW CHO RETURNS) -->
      <div class="modal fade" id="quickViewOrderModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header border-bottom pb-3 bg-light rounded-top-4">
              <h5 class="fw-bold text-dark mb-0 d-flex align-items-center">
                <i class="bi bi-receipt text-danger me-2"></i>Chi Tiết Yêu Cầu Hoàn Trả 
                <span class="text-danger font-monospace ms-1" v-if="selectedOrder">{{ selectedOrder.order_code }}</span>
                <div v-if="isFetchingDetail" class="spinner-border spinner-border-sm text-brand ms-3" role="status"></div>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            
            <div class="modal-body p-4 bg-white" v-if="selectedOrder">
              <div class="row g-4">
                  <div class="col-lg-4 border-end">
                      <h6 class="fw-bold text-muted text-uppercase mb-3"><i class="bi bi-person-badge me-2"></i>Người yêu cầu</h6>
                      <div class="mb-2"><span class="text-muted">Họ tên:</span> <strong class="text-dark float-end">{{ selectedOrder.customer_name }}</strong></div>
                      <div class="mb-2"><span class="text-muted">Điện thoại:</span> <strong class="text-dark float-end">{{ selectedOrder.customer_phone }}</strong></div>
                      <div class="mb-3">
                          <span class="text-muted d-block mb-1">Địa chỉ nhận hàng:</span> 
                          <div class="p-2 bg-light border rounded small">{{ selectedOrder.customer_address }}</div>
                      </div>
                      <div class="mb-4">
                          <span class="text-muted d-block mb-1">Ghi chú lúc mua:</span> 
                          <div class="p-2 bg-warning bg-opacity-10 text-dark fw-medium border border-warning rounded small fst-italic">{{ selectedOrder.order_note || 'Không có ghi chú' }}</div>
                      </div>

                      <h6 class="fw-bold text-muted text-uppercase mb-3 border-top pt-4"><i class="bi bi-credit-card me-2"></i>Phương thức ban đầu</h6>
                      <div class="mb-2 d-flex justify-content-between align-items-center">
                          <span class="text-muted">Thanh toán:</span> 
                          <span class="badge bg-secondary text-uppercase">{{ selectedOrder.payment_method }}</span>
                      </div>
                  </div>

                  <div class="col-lg-8">
                      <h6 class="fw-bold text-danger text-uppercase mb-3"><i class="bi bi-box-seam me-2"></i>Các mặt hàng cần hoàn trả</h6>
                      <div class="table-responsive border rounded mb-4 border-danger border-opacity-25" style="max-height: 250px; overflow-y: auto;">
                          <table class="table table-hover align-middle mb-0 small">
                              <thead class="bg-light sticky-top">
                                  <tr>
                                      <th class="ps-3">Sản phẩm</th>
                                      <th class="text-center">Đơn giá</th>
                                      <th class="text-center">SL</th>
                                      <th class="text-end pe-3">Thành tiền</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="item in selectedOrder.items" :key="item.id">
                                      <td class="ps-3 py-3">
                                          <div class="d-flex align-items-center gap-2">
                                              <img :src="item.variant_image ? getFullImage(item.variant_image) : defaultPlaceholder" @error="handleImageError" class="rounded border" style="width: 40px; height: 40px; object-fit: cover;">
                                              <div>
                                                  <div class="fw-bold text-dark text-wrap" style="max-width: 250px;">{{ item.product_name }}</div>
                                                  <div class="text-muted" style="font-size: 0.7rem;">SKU: {{ item.variant_sku }}</div>
                                                  
                                                  <div class="text-brand mt-1" style="font-size: 0.7rem;" v-if="item.combo_id">
                                                      <span class="badge bg-light text-dark border">
                                                          <i class="bi bi-stars text-brand me-1"></i> Combo ({{ parseCombo(item.combo_selections).length }} món)
                                                      </span>
                                                  </div>
                                                  <div class="text-brand mt-1" style="font-size: 0.7rem;" v-else-if="item.variant_attributes">
                                                      <span v-for="(val, key) in parseAttributes(item.variant_attributes)" :key="key" class="me-2 badge bg-light text-dark border">[{{ key }}: {{ val }}]</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                      <td class="text-center fw-medium">{{ formatCurrency(item.price) }}</td>
                                      <td class="text-center fw-bold text-brand">x{{ item.quantity }}</td>
                                      <td class="text-end pe-3 fw-bold text-danger">{{ formatCurrency(item.total_price) }}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>

                      <div class="row justify-content-end">
                          <div class="col-md-7">
                              <div class="bg-danger bg-opacity-10 p-3 rounded border border-danger border-opacity-25">
                                  <div class="d-flex justify-content-between mb-2 small"><span class="text-muted fw-medium">Tạm tính hàng:</span> <strong class="text-dark">{{ formatCurrency(selectedOrder.sub_total) }}</strong></div>
                                  <div class="d-flex justify-content-between mb-2 small"><span class="text-muted fw-medium">Phí giao hàng:</span> <strong class="text-dark">{{ formatCurrency(selectedOrder.shipping_fee) }}</strong></div>
                                  
                                  <div class="d-flex justify-content-between mb-2 small text-danger" v-if="selectedOrder.discount_amount > 0">
                                      <span class="text-muted fw-medium">Giảm giá Coupon <span v-if="selectedOrder.coupon_code">({{ selectedOrder.coupon_code }})</span>:</span> 
                                      <strong>- {{ formatCurrency(selectedOrder.discount_amount) }}</strong>
                                  </div>
                                  
                                  <div class="d-flex justify-content-between mb-2 small text-success" v-if="selectedOrder.tier_discount_amount > 0">
                                      <span class="text-muted fw-medium"><i class="bi bi-star-fill text-warning me-1"></i>Ưu đãi Hạng TV:</span> 
                                      <strong>- {{ formatCurrency(selectedOrder.tier_discount_amount) }}</strong>
                                  </div>

                                  <div class="d-flex justify-content-between mt-3 pt-2 border-top border-danger border-opacity-25 align-items-center"><span class="fw-bold text-dark tracking-wide">SỐ TIỀN GỐC CỦA ĐƠN:</span> <strong class="fs-5 text-danger font-oswald">{{ formatCurrency(selectedOrder.total_amount) }}</strong></div>
                                  
                                  <div class="mt-3 pt-3 border-top border-danger border-opacity-25" v-if="selectedOrder.refund_amount !== null">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="fw-bold text-primary text-uppercase tracking-wide" style="font-size: 0.8rem;">SỐ TIỀN HOÀN THỰC TẾ:</span> 
                                        <strong class="fs-4 text-primary font-serif">{{ formatCurrency(selectedOrder.refund_amount) }}</strong>
                                    </div>
                                    <div class="small text-muted fst-italic mt-2 bg-white p-2 rounded border border-light-subtle">
                                        <i class="bi bi-chat-left-dots-fill text-secondary me-1"></i> Ghi chú: {{ selectedOrder.refund_note || 'Không có' }}
                                    </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="mt-4">
                          <h6 class="fw-bold text-muted text-uppercase mb-3"><i class="bi bi-clock-history me-2"></i>Lịch sử cập nhật</h6>
                          <ul class="list-group list-group-flush border rounded custom-scrollbar-y" style="max-height: 200px; overflow-y: auto;">
                              <li class="list-group-item d-flex justify-content-between align-items-start bg-light" v-for="history in selectedOrder.histories" :key="history.id">
                                  <div class="ms-2 me-auto">
                                      <div class="fw-bold text-dark small">
                                          <span class="text-muted fw-normal me-1">{{ formatDateTime(history.created_at) }}</span>
                                          Cập nhật tiến trình
                                      </div>
                                      <div class="text-muted mt-1" style="font-size: 0.75rem;">
                                          <i class="bi bi-person-fill me-1"></i>Bởi: <strong>{{ history.changer?.fullName || 'Hệ thống/Khách' }}</strong>
                                          <span v-if="history.note" class="ms-2 fst-italic text-danger fw-semibold">- "{{ history.note }}"</span>
                                      </div>
                                  </div>
                              </li>
                          </ul>
                      </div>

                  </div>
              </div>
            </div>
            
            <div class="modal-body p-5 text-center bg-white" v-else-if="isFetchingDetail">
                <div class="spinner-border text-brand" style="width: 3rem; height: 3rem; border-width: 0.25em;" role="status"></div>
                <p class="text-muted mt-3 fw-semibold">Đang truy xuất dữ liệu hoàn trả...</p>
            </div>

            <div class="modal-footer bg-light border-top-0 rounded-bottom-4 mt-3">
               <button type="button" class="btn btn-outline-brand rounded-pill px-4 fw-bold action-btn-hover" data-bs-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getFullImage } from '@/composables/useUtilities';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;
let adminChannel = null;

const route = useRoute();
const queryClient = useQueryClient();

const activeTab = ref('all');
const currentPage = ref(1);
const searchQuery = ref('');
const serverSearch = ref('');
const filters = ref({ start_date: '', end_date: '' });

let quickViewModalInstance = null;
let isUnmounted = false;

// Cấu hình từ điển SweetAlert (Được giữ nguyên theo thiết kế)
const quickRefundNotes = {
    propose: [
        'SORA xin phép khấu trừ 10% phí làm mới sản phẩm.',
        'Sản phẩm bị xước nhẹ, khấu trừ 20% giá trị.',
        'SORA xin phép trừ 150.000đ phí hộp và vận chuyển.'
    ],
    refunded: [
        'Đã hoàn tiền thành công vào số tài khoản quý khách cung cấp.',
        'Kế toán đã duyệt chi. Vui lòng kiểm tra biến động số dư.',
    ],
    reject: [
        'Sản phẩm không đáp ứng điều kiện hoàn trả (đã qua sử dụng).',
        'Sản phẩm đã quá thời hạn 7 ngày đổi trả theo quy định.',
        'Sản phẩm bị hư hỏng nặng, không thể bảo hành hoặc hoàn tiền.'
    ]
};

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);
const formatDateTime = (dateString) => { if (!dateString) return ''; const d = new Date(dateString); return d.toLocaleString('vi-VN'); };
const handleImageError = (e) => { e.target.src = defaultPlaceholder; };

const parseAttributes = (attr) => {
  if (!attr) return {};
  if (typeof attr === 'object') return attr;
  try { return JSON.parse(attr); } catch { return {}; }
};

const parseCombo = (combo) => {
  if (!combo) return [];
  if (typeof combo === 'object') return combo;
  try { return JSON.parse(combo); } catch { return []; }
};

const getReturnStatusUi = (order) => {
    if (order.status === 'return_requested') {
        return { text: 'Chờ Xử Lý', class: 'bg-warning text-dark border-warning', icon: 'bi-inbox-fill', statusCode: 'pending' };
    }
    if (order.payment_status === 'refunded') {
        return { text: 'Đã Hoàn Tiền', class: 'bg-success text-white border-success', icon: 'bi-check-circle-fill', statusCode: 'refunded' };
    }
    if (order.refund_amount !== null && parseFloat(order.refund_amount) === 0) {
        return { text: 'Đã Từ Chối', class: 'bg-danger text-white border-danger', icon: 'bi-x-circle-fill', statusCode: 'rejected' };
    }
    if (order.refund_amount !== null && parseFloat(order.refund_amount) > 0) {
        return { text: 'Thương Lượng', class: 'bg-info text-white border-info', icon: 'bi-envelope-paper-fill', statusCode: 'proposing' };
    }
    return { text: 'Chờ Xử Lý', class: 'bg-warning text-dark border-warning', icon: 'bi-inbox-fill', statusCode: 'pending' };
};

// ==========================================
// TANSTACK QUERY LẤY DANH SÁCH HOÀN TRẢ
// ==========================================
const { data: queryData, isFetching, refetch } = useQuery({
  queryKey: ['admin-returns', activeTab, currentPage, filters, serverSearch],
  queryFn: async () => {
    let queryParams = new URLSearchParams({ page: currentPage.value, is_return_page: '1' });
    if (activeTab.value !== 'all') queryParams.append('return_tab', activeTab.value);
    if (filters.value.start_date) queryParams.append('start_date', filters.value.start_date);
    if (filters.value.end_date) queryParams.append('end_date', filters.value.end_date);
    if (serverSearch.value) queryParams.append('search', serverSearch.value);

    const res = await axios.get(`${API_URL}/admin/orders?${queryParams.toString()}`, { headers: getHeaders() });
    return res.data;
  },
  keepPreviousData: true,
  staleTime: 30000
});

// Chuyển isLoading của useQuery thành biến check First Load thực tế
const isFirstLoad = ref(true);

watch(queryData, (newData) => {
  if (newData) {
    isFirstLoad.value = false;
  }
}, { immediate: true });

const localOrders = computed(() => {
    return queryData.value?.data?.data || queryData.value?.data || [];
});

const statusCounts = computed(() => queryData.value?.counts || { all: 0, pending: 0, proposing: 0, refunded: 0, rejected: 0 });

const pagination = computed(() => {
  const result = queryData.value?.data;
  return result?.last_page 
    ? { currentPage: result.current_page, lastPage: result.last_page, total: result.total }
    : { currentPage: 1, lastPage: 1, total: 0 };
});

const displayedOrders = computed(() => {
    let result = localOrders.value;
    if (searchQuery.value && searchQuery.value !== serverSearch.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(o => 
            (o.order_code && o.order_code.toLowerCase().includes(q)) || 
            (o.customer_name && o.customer_name.toLowerCase().includes(q)) || 
            (o.customer_phone && o.customer_phone.includes(q))
        );
    }
    return result;
});

// ==========================================
// TANSTACK QUERY LẤY CHI TIẾT MODAL
// ==========================================
const activeOrderId = ref(null);
const { data: fetchedOrder, isFetching: isFetchingDetail } = useQuery({
    queryKey: ['admin-order-detail-return', activeOrderId],
    queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/orders/${activeOrderId.value}`, { headers: getHeaders() });
        return res.data.data;
    },
    enabled: computed(() => !!activeOrderId.value),
    staleTime: 5 * 60 * 1000
});

const selectedOrder = computed(() => fetchedOrder.value);

const openQuickView = (id) => {
    activeOrderId.value = id;
    if(!quickViewModalInstance) {
        quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewOrderModal'));
    }
    quickViewModalInstance.show();
};

// ==========================================
// TANSTACK MUTATION CHO THẨM ĐỊNH HOÀN TIỀN
// ==========================================
const processRefundMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
        return axios.post(`${API_URL}/admin/orders/${id}/refund-process`, payload, { headers: getHeaders() });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['admin-returns']);
        queryClient.invalidateQueries(['admin-orders']); 
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xử lý hoàn tất!', showConfirmButton: false, timer: 1500 });
    },
    onError: (error) => {
        if (error.response?.status === 401) {
            Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
        } else if (error.response?.status === 422) {
            let errStr = Object.values(error.response.data.errors)[0][0];
            Swal.fire('Dữ liệu không hợp lệ', errStr, 'error');
        } else {
            Swal.fire('Lỗi', 'Không thể cập nhật hệ thống', 'error');
        }
    }
});

const processRefund = async (order) => {
  const currentStatus = getReturnStatusUi(order).statusCode;
  
  const defaultRefundValue = (order.refund_amount !== null && order.refund_amount > 0) 
      ? Math.round(order.refund_amount) 
      : Math.round(order.total_amount);
      
  const defaultNoteValue = order.refund_note || '';

  const { value: formValues, isDismissed } = await Swal.fire({
    title: 'Thẩm Định & Xử Lý Hoàn Tiền',
    html: `
      <div class="row text-start mt-2">
        <div class="col-lg-5 border-end-lg pe-lg-3 mb-4 mb-lg-0">
          <div class="bg-light p-3 rounded border mb-3">
              <div class="text-muted small fw-bold text-uppercase mb-1">Khách hàng</div>
              <div class="fw-bold text-dark fs-6">${order.customer_name}</div>
              <div class="text-muted small text-truncate">${order.customer_email || 'Không có Email'}</div>
          </div>
          <div class="bg-danger bg-opacity-10 border border-danger-subtle p-3 rounded text-center mb-3">
              <div class="text-danger small fw-bold text-uppercase mb-1">Giá trị đơn gốc</div>
              <div class="fw-bold text-danger fs-4 font-serif">${formatCurrency(order.total_amount)}</div>
          </div>
          <div class="alert alert-warning small border-warning py-2 mb-0">
              <i class="bi bi-info-circle-fill me-1"></i> <strong>Lưu ý:</strong> Mọi khoản khấu trừ sẽ được thông báo tự động cho khách qua Email.
          </div>
        </div>
        
        <div class="col-lg-7 ps-lg-4">
          <div class="mb-4">
              <label class="form-label fw-bold small text-muted text-uppercase tracking-wide"><i class="bi bi-calculator text-brand me-1"></i> 1. Mức bồi hoàn</label>
              
              <div class="d-flex flex-wrap gap-2 mb-3">
                  <input type="radio" class="btn-check" name="refund_type" id="rt_full" value="full" checked>
                  <label class="btn btn-outline-secondary btn-sm fw-bold px-3" for="rt_full">Hoàn 100%</label>

                  <input type="radio" class="btn-check" name="refund_type" id="rt_percent" value="percent">
                  <label class="btn btn-outline-secondary btn-sm fw-bold px-3" for="rt_percent">Trừ % Phí</label>

                  <input type="radio" class="btn-check" name="refund_type" id="rt_fixed" value="fixed">
                  <label class="btn btn-outline-secondary btn-sm fw-bold px-3" for="rt_fixed">Trừ Tiền Mặt</label>
              </div>

              <div id="deduction_input_wrap" style="display: none;" class="mb-3">
                  <div class="input-group shadow-sm">
                      <span class="input-group-text bg-light fw-bold" id="deduction_label">%</span>
                      <input type="number" id="deduction_value" class="form-control border-start-0 ps-0 fw-bold text-brand" placeholder="Nhập mức khấu trừ..." min="0">
                  </div>
              </div>

              <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded border border-light-subtle">
                  <span class="fw-bold text-dark font-oswald text-uppercase small">Khách thực nhận:</span>
                  <span id="final_refund_display" class="fw-bold text-success fs-3 font-serif">${formatCurrency(defaultRefundValue)}</span>
              </div>
              <input type="hidden" id="swal-refund-amount" value="${defaultRefundValue}">
          </div>

          <div class="mb-4">
              <label class="form-label fw-bold small text-muted text-uppercase tracking-wide"><i class="bi bi-check2-square text-brand me-1"></i> 2. Hướng xử lý</label>
              
              <div class="list-group shadow-sm">
                  <label class="list-group-item list-group-item-action d-flex align-items-center cursor-pointer p-3">
                    <input class="form-check-input me-3 mt-0 fs-5" type="radio" name="refund_action" value="propose" ${['pending', 'proposing'].includes(currentStatus) ? 'checked' : ''}>
                    <div>
                        <div class="fw-bold text-dark"><i class="bi bi-envelope-paper text-primary me-2"></i>Gửi Email Thỏa Thuận Giá</div>
                        <div class="text-muted small" style="font-size: 0.75rem;">Báo cho khách số tiền sẽ hoàn để chờ phản hồi.</div>
                    </div>
                  </label>
                  <label class="list-group-item list-group-item-action d-flex align-items-center cursor-pointer p-3">
                    <input class="form-check-input me-3 mt-0 fs-5" type="radio" name="refund_action" value="refunded" ${currentStatus === 'refunded' ? 'checked' : ''}>
                    <div>
                        <div class="fw-bold text-dark"><i class="bi bi-check-circle text-success me-2"></i>Đã Chuyển Khoản Trả Khách</div>
                        <div class="text-muted small" style="font-size: 0.75rem;">Xác nhận Kế toán đã chuyển khoản thành công.</div>
                    </div>
                  </label>
                  <label class="list-group-item list-group-item-action d-flex align-items-center cursor-pointer p-3 bg-danger bg-opacity-10 border-danger border-opacity-25">
                    <input class="form-check-input me-3 mt-0 fs-5" type="radio" name="refund_action" value="reject" ${currentStatus === 'rejected' ? 'checked' : ''}>
                    <div>
                        <div class="fw-bold text-danger"><i class="bi bi-x-circle text-danger me-2"></i>Từ chối hoàn tiền</div>
                        <div class="text-muted small" style="font-size: 0.75rem;">Gửi Email từ chối & đóng băng quy trình hoàn trả.</div>
                    </div>
                  </label>
              </div>
          </div>

          <div>
              <label class="form-label fw-bold small text-muted text-uppercase tracking-wide"><i class="bi bi-pencil-square text-brand me-1"></i> 3. Lời nhắn / Ghi chú <span class="text-danger">*</span></label>
              <div id="quick-notes-container" class="d-flex flex-wrap gap-2 mb-2"></div>
              <textarea id="swal-refund-note" class="form-control shadow-sm" rows="3" placeholder="Ví dụ: SORA xin phép khấu trừ 10% phí đánh bóng lại sản phẩm...">${defaultNoteValue}</textarea>
              <div class="form-text small" style="font-size: 0.7rem;">Nội dung này sẽ được đính kèm vào Email gửi đi.</div>
          </div>
        </div>
      </div>
    `,
    width: '900px',
    showCancelButton: true,
    confirmButtonText: 'Xác Nhận & Lưu',
    cancelButtonText: 'Đóng lại',
    confirmButtonColor: '#009981',
    customClass: {
      confirmButton: 'px-5 py-2 mx-2 rounded shadow-sm fw-bold',
      cancelButton: 'px-5 py-2 mx-2 rounded fw-bold btn-light border'
    },
    didOpen: () => {
      const typeRadios = document.querySelectorAll('input[name="refund_type"]');
      const wrap = document.getElementById('deduction_input_wrap');
      const label = document.getElementById('deduction_label');
      const input = document.getElementById('deduction_value');
      const display = document.getElementById('final_refund_display');
      const hiddenAmt = document.getElementById('swal-refund-amount');
      const note = document.getElementById('swal-refund-note');
      const actionRadios = document.querySelectorAll('input[name="refund_action"]');
      const container = document.getElementById('quick-notes-container');
      
      const origAmt = parseFloat(order.total_amount);
      const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

      const renderChips = (action) => {
          const notesList = quickRefundNotes[action] || [];
          if(notesList.length === 0) {
              container.innerHTML = '';
              return;
          }
          let html = '';
          notesList.forEach(n => {
              html += `<span class="badge bg-light text-dark border border-secondary-subtle shadow-sm quick-note-chip" style="font-size: 0.75rem; padding: 6px 10px; transition: all 0.2s; cursor: pointer;">${n}</span>`;
          });
          container.innerHTML = html;
          
          container.querySelectorAll('.quick-note-chip').forEach(chip => {
              chip.addEventListener('click', () => {
                  note.value = chip.innerText;
                  chip.style.backgroundColor = '#009981';
                  chip.style.color = '#fff';
                  chip.style.transform = 'translateY(-2px)';
                  setTimeout(() => {
                      chip.style.backgroundColor = '#f8f9fa';
                      chip.style.color = '#212529';
                      chip.style.transform = 'translateY(0)';
                  }, 200);
              });
          });
      };

      const currentAction = document.querySelector('input[name="refund_action"]:checked').value;
      renderChips(currentAction);

      if (order.refund_amount !== null && order.refund_amount < origAmt && order.refund_amount > 0) {
          document.getElementById('rt_fixed').checked = true;
          wrap.style.display = 'block';
          label.innerText = 'VNĐ';
          input.value = origAmt - order.refund_amount;
      } else {
          document.getElementById('rt_full').checked = true;
          wrap.style.display = 'none';
          input.value = '';
      }

      const calc = () => {
        const type = document.querySelector('input[name="refund_type"]:checked').value;
        let finalAmt = origAmt;
        const val = parseFloat(input.value) || 0;

        if (type === 'percent') {
          finalAmt = Math.max(0, origAmt - (origAmt * val / 100));
        } else if (type === 'fixed') {
          finalAmt = Math.max(0, origAmt - val);
        }
        
        display.innerText = fmt(finalAmt);
        hiddenAmt.value = finalAmt;
      };

      typeRadios.forEach(r => r.addEventListener('change', (e) => {
         if(e.target.value === 'full') {
             wrap.style.display = 'none';
             input.value = '';
         } else {
             wrap.style.display = 'block';
             label.innerText = e.target.value === 'percent' ? '%' : 'VNĐ';
         }
         calc();
      }));

      input.addEventListener('input', calc);

      actionRadios.forEach(r => r.addEventListener('change', (e) => {
         renderChips(e.target.value); 
         
         if (e.target.value === 'reject') {
             display.innerText = fmt(0);
             hiddenAmt.value = 0;
         } else {
             calc();
         }
      }));
    },
    preConfirm: () => {
      const amount = document.getElementById('swal-refund-amount').value;
      const note = document.getElementById('swal-refund-note').value;
      const action = document.querySelector('input[name="refund_action"]:checked').value;
      
      if (!amount || amount < 0) {
        Swal.showValidationMessage('Vui lòng kiểm tra lại số tiền hoàn!');
        return false;
      }
      if (!note && action !== 'refunded') {
        Swal.showValidationMessage('Vui lòng nhập Ghi chú để gửi vào Email giải thích cho khách hàng!');
        return false;
      }
      return { amount, note, action };
    }
  });

  if (isDismissed || !formValues) return;

  const payload = {
      action: formValues.action,
      refund_amount: formValues.amount,
      refund_note: formValues.note
  };

  Swal.fire({
      title: 'Đang xử lý...',
      text: 'Hệ thống đang đồng bộ dữ liệu và cấu hình Email...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
  });

  processRefundMutation.mutate({ id: order.id, payload });
};

// ==========================================
// ĐIỀU KHIỂN & SỰ KIỆN
// ==========================================
const switchTab = (tabId) => { 
    activeTab.value = tabId; 
    currentPage.value = 1; 
};

const changePage = (page) => { 
    currentPage.value = page; 
};

const handleSearch = () => { 
    serverSearch.value = searchQuery.value; 
    currentPage.value = 1; 
};

const handleRefresh = () => { 
    refetch(); 
};

onBeforeUnmount(() => {
  isUnmounted = true;
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
  document.body.style = '';

  if (window.Echo) {
    window.Echo.leave('admin');
  }
});

onMounted(() => {
    if (window.Echo) {
      adminChannel = window.Echo.private('admin');

      adminChannel.listen('.AdminRefresh', (data) => {
        if (data.module === 'orders') {
          Swal.fire({
            toast: true,
            position: 'bottom-start',
            icon: 'info',
            title: 'Hệ thống tự động',
            text: data.message || 'Có cập nhật mới từ nhân viên khác.',
            showConfirmButton: false,
            timer: 4000
          });
          queryClient.invalidateQueries(['admin-returns']);
        }
      });
    }
});
</script>

<style scoped>
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }
.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; } .border-brand { border-color: #009981 !important; }

/* Nút Action Hover Mượt Mà */
.action-btn-hover { transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); }
.action-btn-hover:hover { transform: translateY(-3px) !important; box-shadow: 0 5px 15px rgba(0, 153, 129, 0.25) !important; filter: brightness(1.1) !important; }

.cursor-pointer { cursor: pointer; }
.custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
.custom-scrollbar-y::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-y::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }

@media (min-width: 992px) {
  :deep(.border-end-lg) {
    border-right: 1px solid #dee2e6;
  }
}

/* CSS XỬ LÝ RESPONSIVE BẢNG THÀNH DẠNG CARD (KHÔNG THANH CUỘN NGANG) */
@media (max-width: 767.98px) {
  .responsive-table {
    display: block;
    width: 100%;
  }
  .responsive-table thead {
    display: none;
  }
  .responsive-table tbody, .responsive-table tr, .responsive-table td {
    display: block;
    width: 100%;
  }
  .responsive-table tr {
    margin-bottom: 1rem;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 0.5rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
  .responsive-table td > div, .responsive-table td > span {
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
    min-width: 850px;
  }
}
</style>

<style>
/* Style global (không scoped) cho các thẻ Quick Notes sinh ra động từ SweetAlert */
.quick-note-chip:hover {
    background-color: #009981 !important;
    color: #fff !important;
    border-color: #009981 !important;
    transform: translateY(-2px);
}
</style>