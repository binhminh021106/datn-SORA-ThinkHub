<template>
  <div class="order-edit-wrapper pb-5 mb-5">
    
    <!-- HIỆU ỨNG SKELETON KHI ĐANG LOAD TRANG -->
    <div v-if="isPageLoading" class="container-fluid py-4">
       <div class="d-flex align-items-center mb-4">
           <div class="skeleton-box rounded-circle me-3" style="width: 45px; height: 45px;"></div>
           <div>
               <div class="skeleton-box mb-2" style="width: 250px; height: 28px; border-radius: 4px;"></div>
               <div class="skeleton-box" style="width: 180px; height: 16px; border-radius: 4px;"></div>
           </div>
       </div>
       <div class="row g-4">
           <div class="col-lg-7 col-xl-8">
               <div class="skeleton-box mb-4 shadow-sm" style="height: 250px; width: 100%; border-radius: 1rem;"></div>
               <div class="skeleton-box mb-4 shadow-sm" style="height: 400px; width: 100%; border-radius: 1rem;"></div>
           </div>
           <div class="col-lg-5 col-xl-4 d-flex flex-column gap-4">
               <div class="skeleton-box shadow-sm" style="height: 500px; width: 100%; border-radius: 1rem;"></div>
           </div>
       </div>
    </div>

    <!-- NỘI DUNG CHÍNH (SAU KHI LOAD XONG) -->
    <div v-else class="container-fluid py-4 animate-fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div class="d-flex align-items-center">
          <router-link :to="{ name: 'admin-orders' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center border" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left text-dark"></i>
          </router-link>
          <div>
            <h3 class="fw-bold text-dark mb-0 d-flex align-items-center">
              Xử Lý Đơn Hàng 
              <span class="ms-2 text-brand font-monospace border rounded px-2 bg-white shadow-sm" style="font-size: 1.2rem;">#{{ order?.order_code }}</span>
            </h3>
            <p class="text-muted small mb-0 mt-1"><i class="bi bi-clock me-1"></i> Ngày đặt: {{ formatDateTime(order?.created_at) }}</p>
          </div>
        </div>
        <div class="d-flex gap-2">
           <button class="btn btn-light border shadow-sm fw-bold px-4" @click="fetchOrderData(false)">
             <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
           </button>
           <button class="btn btn-dark text-white fw-bold px-4 action-btn-hover" @click="printOrder">
             <i class="bi bi-printer me-1"></i> In Đơn
           </button>
        </div>
      </div>

      <div class="row g-4">
        <!-- CỘT TRÁI: THÔNG TIN -->
        <div class="col-lg-7 col-xl-8">
          
          <div class="card border-0 shadow-sm rounded-4 mb-4 border-start border-brand border-4">
            <div class="card-header bg-white border-bottom pb-2 pt-4 px-4">
              <h6 class="fw-bold mb-0 text-dark text-uppercase tracking-wide"><i class="bi bi-person-vcard me-2 text-brand"></i>Thông tin Khách hàng</h6>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted small fw-semibold">Họ và tên</p>
                  <p class="fw-bold text-dark mb-0 fs-6">{{ order?.customer_name }}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted small fw-semibold">Số điện thoại</p>
                  <p class="fw-bold text-dark mb-0 fs-6">{{ order?.customer_phone }}</p>
                </div>
                <div class="col-md-12 border-top pt-3 mt-3">
                  <p class="mb-1 text-muted small fw-semibold">Địa chỉ giao hàng cụ thể</p>
                  <p class="fw-bold text-dark mb-0"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ order?.customer_address }}</p>
                </div>
                <div class="col-md-12" v-if="order?.order_note">
                  <div class="p-3 bg-warning bg-opacity-10 border border-warning rounded">
                    <p class="mb-1 text-warning-emphasis small fw-bold"><i class="bi bi-chat-quote-fill me-1"></i>Ghi chú của khách:</p>
                    <p class="text-dark mb-0 fst-italic fw-medium">{{ order?.order_note }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-header bg-white border-bottom pb-2 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h6 class="fw-bold mb-0 text-dark text-uppercase tracking-wide"><i class="bi bi-box-seam me-2 text-brand"></i>Sản phẩm đã đặt</h6>
              <span class="badge bg-light text-dark border">{{ order?.items?.length || 0 }} Món</span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table align-middle mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-4 text-muted border-0 fw-semibold">Sản phẩm</th>
                      <th class="text-center text-muted border-0 fw-semibold">Đơn giá</th>
                      <th class="text-center text-muted border-0 fw-semibold">SL</th>
                      <th class="text-end pe-4 text-muted border-0 fw-semibold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order?.items" :key="item.id">
                        <td class="ps-4 py-3">
                            <div class="d-flex align-items-center gap-3">
                                <img :src="getImageUrl(item.variant_image)" @error="handleImageError" class="rounded border shadow-sm" style="width: 50px; height: 50px; object-fit: cover;">
                                <div>
                                    <div class="fw-bold text-dark text-wrap" style="max-width: 250px;">{{ item.product_name }}</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">SKU: {{ item.variant_sku }}</div>
                                    <div class="mt-1" style="font-size: 0.75rem;">
                                      <span class="badge bg-light text-brand border border-brand-subtle" v-if="item.combo_id">
                                          <i class="bi bi-stars"></i> Combo ({{ parseCombo(item.combo_selections).length }} món)
                                      </span>
                                      <span v-else-if="item.variant_attributes" class="text-secondary fw-medium">
                                          <span v-for="(val, key) in parseAttributes(item.variant_attributes)" :key="key" class="me-2">[{{ key }}: {{ val }}]</span>
                                      </span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center fw-medium">{{ formatCurrency(item.price) }}</td>
                        <td class="text-center fw-bold text-brand fs-6">x{{ item.quantity }}</td>
                        <td class="text-end pe-4 fw-bold text-success fs-6">{{ formatCurrency(item.total_price) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card-footer bg-white border-top-0 p-4">
              <div class="row justify-content-end">
                <div class="col-md-7 col-lg-6 col-xl-5">
                  <div class="d-flex justify-content-between mb-2 small"><span class="text-muted fw-medium">Tạm tính:</span> <strong>{{ formatCurrency(order?.sub_total) }}</strong></div>
                  <div class="d-flex justify-content-between mb-2 small"><span class="text-muted fw-medium">Phí vận chuyển:</span> <strong>{{ formatCurrency(order?.shipping_fee) }}</strong></div>
                  
                  <div class="d-flex justify-content-between mb-2 small text-danger" v-if="order?.discount_amount > 0">
                    <span class="text-muted fw-medium">Mã giảm giá <span v-if="order?.coupon_code" class="fw-bold">({{ order.coupon_code }})</span>:</span> 
                    <strong>- {{ formatCurrency(order?.discount_amount) }}</strong>
                  </div>
                  
                  <div class="d-flex justify-content-between mb-2 small text-success" v-if="order?.tier_discount_amount > 0">
                    <span class="text-muted fw-medium"><i class="bi bi-star-fill text-warning me-1"></i>Ưu đãi Hạng TV:</span> 
                    <strong>- {{ formatCurrency(order?.tier_discount_amount) }}</strong>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-2 border-dark">
                    <span class="fw-bold text-dark text-uppercase tracking-wide">Tổng Cộng:</span> 
                    <strong class="fs-4 text-brand font-oswald">{{ formatCurrency(order?.total_amount) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 mb-4">
             <div class="card-header bg-white border-bottom pb-2 pt-4 px-4">
              <h6 class="fw-bold mb-0 text-dark text-uppercase tracking-wide"><i class="bi bi-clock-history me-2 text-brand"></i>Lịch sử trạng thái</h6>
            </div>
            <div class="card-body p-0">
               <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between align-items-start p-3" v-for="(history, index) in order?.histories" :key="history.id" :class="{'bg-light': index % 2 === 0}">
                      <div class="ms-2 me-auto w-100">
                          <div class="d-flex justify-content-between align-items-center w-100 mb-1">
                            <div class="fw-bold text-dark small">
                                Chuyển sang <span class="badge ms-1 border shadow-sm" :class="getOrderStatusBadge(history.new_status)">{{ formatOrderStatus(history.new_status) }}</span>
                            </div>
                            <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i>{{ formatDateTime(history.created_at) }}</span>
                          </div>
                          <div class="text-muted mt-2" style="font-size: 0.8rem;">
                              <span class="badge bg-secondary bg-opacity-10 text-dark border me-2"><i class="bi bi-person-fill me-1"></i>{{ history.changer?.fullName || 'Hệ thống tự động' }}</span>
                              <span v-if="history.note" class="fst-italic text-danger fw-medium d-block d-md-inline mt-2 mt-md-0"><i class="bi bi-chat-right-text me-1"></i>"{{ history.note }}"</span>
                          </div>
                      </div>
                  </li>
              </ul>
            </div>
          </div>

        </div>

        <!-- CỘT PHẢI -->
        <div class="col-lg-5 col-xl-4 d-flex flex-column gap-4">
          
          <div class="card border-0 shadow-sm rounded-4 border-top border-brand border-4 overflow-hidden">
            <div class="card-body p-4">
              <h6 class="fw-bold text-dark text-uppercase tracking-wide mb-4 d-flex align-items-center"><i class="bi bi-toggles me-2 text-brand fs-4"></i>Xử Lý Đơn Hàng</h6>
              
              <!-- Cập nhật Thanh toán -->
              <div class="mb-4 bg-light p-3 rounded border border-light-subtle shadow-sm">
                <label class="form-label fw-bold text-dark small text-uppercase mb-2">Tình trạng Thu tiền</label>
                <div class="d-flex gap-2">
                  <select v-model="localPaymentStatus" class="form-select fw-bold border-brand-subtle shadow-sm bg-white" :disabled="isUpdatingPayment">
                      <option value="unpaid" v-if="canPaymentTransitionTo('unpaid')">Chưa thanh toán</option>
                      <option value="paid" v-if="canPaymentTransitionTo('paid')">Đã thanh toán (Đã thu)</option>
                      <option value="refunded" v-if="canPaymentTransitionTo('refunded')">Đã hoàn tiền</option>
                      <option value="failed" v-if="canPaymentTransitionTo('failed')">Thanh toán thất bại</option>
                  </select>
                  <button class="btn btn-brand fw-bold flex-shrink-0 shadow-sm px-3 d-flex align-items-center justify-content-center" 
                          @click="submitPaymentUpdate" 
                          :disabled="localPaymentStatus === order?.payment_status || isUpdatingPayment" 
                          title="Lưu thanh toán">
                    <span v-if="isUpdatingPayment" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-floppy2-fill"></i>
                  </button>
                </div>
                <div class="mt-2 small text-muted fst-italic">
                  Đang chọn phương thức: <span class="fw-bold text-brand text-uppercase">{{ order?.payment_method }}</span>
                </div>
              </div>

              <!-- Cập nhật Trạng thái -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark small text-uppercase mb-2">Trạng thái Giao hàng</label>
                <select v-model="localStatus" @change="handleStatusChange" class="form-select fw-bold mb-3 border-brand-subtle shadow-sm bg-white py-2" :disabled="isUpdatingStatus">
                    <option value="pending" v-if="canTransitionTo('pending')">Chờ duyệt đơn</option>
                    <option value="confirmed" v-if="canTransitionTo('confirmed')">Đã xác nhận (Gom hàng)</option>
                    <option value="processing" v-if="canTransitionTo('processing')">Đang đóng gói</option>
                    <option value="shipping" v-if="canTransitionTo('shipping')">Đang giao hàng</option>
                    <option value="delivered" v-if="canTransitionTo('delivered')">Giao hàng thành công</option>
                    <option value="cancelled" v-if="canTransitionTo('cancelled')">Hủy đơn hàng</option>
                </select>

                <div class="notes-section bg-light p-3 rounded border border-light-subtle shadow-sm" v-if="localStatus !== order?.status">
                  <label class="form-label fw-bold text-dark small mb-2"><i class="bi bi-card-checklist me-1 text-brand"></i>Lý do / Ghi chú (Bắt buộc):</label>
                  
                  <div class="d-flex flex-column gap-2 mb-2">
                    <label class="note-radio-wrap border rounded bg-white px-3 py-2 cursor-pointer shadow-sm d-flex align-items-center" 
                           v-for="(note, idx) in currentQuickNotes" :key="idx"
                           :class="{'active-radio': selectedNoteOption === note}">
                      <input type="radio" class="form-check-input mt-0 me-2 custom-radio" name="quickNote" :value="note" v-model="selectedNoteOption">
                      <span class="small fw-bold">{{ note }}</span>
                    </label>
                    
                    <label class="note-radio-wrap border rounded bg-white px-3 py-2 cursor-pointer shadow-sm d-flex align-items-center"
                           :class="{'active-radio': selectedNoteOption === 'OTHER'}">
                      <input type="radio" class="form-check-input mt-0 me-2 custom-radio" name="quickNote" value="OTHER" v-model="selectedNoteOption">
                      <span class="small fw-bold">Khác (Tự nhập lý do)</span>
                    </label>
                  </div>

                  <div class="collapse show" v-if="selectedNoteOption === 'OTHER'">
                    <textarea v-model="customNoteText" class="form-control text-sm border-brand shadow-sm mt-2 fw-medium" rows="3" placeholder="Gõ lý do chi tiết vào đây..."></textarea>
                  </div>
                </div>

                <button class="btn btn-brand w-100 fw-bold py-3 mt-3 shadow text-uppercase tracking-widest d-flex justify-content-center align-items-center" 
                        @click="submitStatusUpdate" 
                        :disabled="localStatus === order?.status || isUpdatingStatus">
                    <span v-if="isUpdatingStatus" class="spinner-border spinner-border-sm me-2"></span>
                    <span v-else class="d-flex align-items-center">
                        <i class="bi bi-send-check-fill me-2 fs-5"></i> XÁC NHẬN
                    </span>
                </button>
              </div>

            </div>
          </div>

          <!-- NÚT GỌI BẢN ĐỒ TRACKING TÁCH RỜI -->
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden border border-light-subtle">
            <div class="card-body p-4 text-center">
                <h6 class="fw-bold mb-3 text-uppercase tracking-wide d-flex align-items-center justify-content-center">
                  <i class="bi bi-geo-alt-fill text-warning me-2"></i>Live Tracking SORA
                </h6>
                <p class="text-muted small mb-4">Hệ thống theo dõi lộ trình di chuyển của xe tải giao hàng được bảo mật bằng OSRM Navigation.</p>
                
                <button class="btn btn-dark w-100 fw-bold py-3 shadow-sm text-uppercase tracking-widest d-flex justify-content-center align-items-center rounded-pill" @click="openTrackingModal">
                    <i class="bi bi-map me-2 fs-5"></i> MỞ BẢN ĐỒ LỘ TRÌNH
                </button>
            </div>
          </div>

          <!-- BẢN ĐỒ TRACKING INLINE CHO ĐƠN HÀNG ĐANG GIAO HOẶC ĐÃ GIAO -->
          <div v-if="order?.status === 'shipping' || order?.status === 'delivered'" class="card border-0 shadow-sm rounded-4 overflow-hidden border border-light-subtle">
            <div class="card-header bg-white border-bottom pb-2 pt-4 px-4">
              <h6 class="fw-bold mb-0 text-dark text-uppercase tracking-wide"><i class="bi bi-geo-alt-fill text-warning me-2"></i>Bản đồ lộ trình hiện tại</h6>
            </div>
            <div class="card-body p-0 position-relative">
              <div id="order-tracking-map" style="height: 300px; width: 100%; background-color: #f8f9fa;"></div>
              <div v-if="isMapLoading" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style="z-index: 10;">
                <div class="spinner-border text-brand mb-2" style="width: 3rem; height: 3rem;"></div>
                <div class="fw-bold text-brand text-uppercase tracking-widest small">Đang kết nối vệ tinh Mapbox...</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <!-- Component Tracking Map -->
      <TrackingMapModal ref="trackingMapModalRef" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import TrackingMapModal from '@/components/admin/TrackingMapModal.vue';
import { downloadAdminInvoice } from '@/utils/adminInvoice.js';
import { getFullImage } from '@/composables/useUtilities';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || API_URL.replace(/\/api\/?$/, '');

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

const isPageLoading = ref(true);
const order = ref(null);

const localStatus = ref('');
const localPaymentStatus = ref('');
const isUpdatingStatus = ref(false);
const isUpdatingPayment = ref(false);

const selectedNoteOption = ref('');
const customNoteText = ref('');
const currentQuickNotes = ref([]);

const trackingMapModalRef = ref(null);

// Biến cho bản đồ inline
const isMapLoading = ref(false);
const mapData = ref(null);
let leafletMap = null;
let routingLine = null;
let truckMarker = null;
let animationFrameId = null;
const selectedWarehouseId = ref('bmt');
const warehouses = ref([
  { id: 'bmt', name: 'Buôn Ma Thuột', lat: 12.6667, lng: 108.0383 },
  { id: 'hn', name: 'Hà Nội', lat: 21.028511, lng: 105.804817 },
  { id: 'hcm', name: 'TP.HCM', lat: 10.762622, lng: 106.660172 },
  { id: 'dn', name: 'Đà Nẵng', lat: 16.054407, lng: 108.202164 },
  { id: 'ct', name: 'Cần Thơ', lat: 10.045162, lng: 105.746857 }
]);

const quickNotesDict = {
    'pending': ['Đơn hàng mới tiếp nhận', 'Đang chờ xác nhận thông tin lại với khách'],
    'confirmed': ['Đã xác nhận đơn hàng', 'Kho đã tiếp nhận, chuẩn bị gom hàng'],
    'processing': ['Đang tiến hành đóng gói sản phẩm', 'Đang kiểm định chất lượng trước khi xuất'],
    'shipping': ['Đã bàn giao cho đối tác vận chuyển', 'Kiện hàng đang trên đường đi'],
    'delivered': ['Giao hàng thành công, khách đã ký nhận', 'Hoàn tất quy trình đơn hàng'],
    'cancelled': ['Khách hàng yêu cầu hủy đơn', 'Gọi điện nhiều lần không nghe máy', 'Sai địa chỉ/số điện thoại', 'Sản phẩm tạm hết hàng'],
    'returned': ['Khách từ chối nhận hàng', 'Hàng hoàn về kho nhập lại']
};

const defaultNotesDict = {
    'pending': 'Hệ thống đã tiếp nhận đơn hàng.',
    'confirmed': 'Đơn hàng đã được xác nhận thành công.',
    'processing': 'Đơn hàng đang được đóng gói.',
    'shipping': 'Đơn hàng đã được bàn giao cho bưu tá.',
    'delivered': 'Đơn hàng đã giao thành công.',
    'cancelled': 'Đã hủy đơn hàng.', 
    'returned': 'Hoàn trả đơn hàng.'   
};

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatCurrency = (val) => val != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val) : '---';
const formatDateTime = (val) => val ? new Date(val).toLocaleString('vi-VN') : '';
const getImageUrl = (path) => path ? getFullImage(path) : defaultPlaceholder;
const handleImageError = (e) => { e.target.src = defaultPlaceholder; };
const parseAttributes = (attr) => { try { return typeof attr === 'object' ? attr : JSON.parse(attr); } catch { return {}; } };
const parseCombo = (combo) => { try { return typeof combo === 'object' ? combo : JSON.parse(combo); } catch { return []; } };

const formatOrderStatus = (status) => ({ 'pending': 'Chờ duyệt', 'confirmed': 'Đã xác nhận', 'processing': 'Đang chuẩn bị', 'shipping': 'Đang giao', 'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'returned': 'Hoàn trả' }[status] || status);
const getOrderStatusBadge = (status) => ({ 'pending': 'bg-warning text-dark border-warning', 'confirmed': 'bg-info text-dark border-info', 'processing': 'bg-primary text-white border-primary', 'shipping': 'bg-primary text-white border-primary', 'delivered': 'bg-success text-white border-success', 'cancelled': 'bg-danger text-white border-danger', 'returned': 'bg-secondary text-white border-secondary' }[status] || 'bg-light text-dark');

const allowedTransitions = {
    'pending': ['pending', 'confirmed', 'cancelled'],
    'confirmed': ['confirmed', 'processing', 'cancelled'],
    'processing': ['processing', 'shipping', 'cancelled'],
    'shipping': ['shipping', 'delivered', 'cancelled'],
    'delivered': ['delivered'],
    'cancelled': ['cancelled'],
    'returned': ['returned']
};
const canTransitionTo = (target) => allowedTransitions[order.value?.status]?.includes(target);

const canPaymentTransitionTo = (target) => {
    const allowedPaymentTransitions = {
        'unpaid': ['unpaid', 'paid', 'failed'],
        'paid': ['paid', 'refunded'], 
        'failed': ['failed', 'unpaid', 'paid'], 
        'refunded': ['refunded'] 
    };
    return allowedPaymentTransitions[order.value?.payment_status]?.includes(target);
};

const fetchOrderData = async (silent = false) => {
  if (!silent) isPageLoading.value = true;
  try {
    const res = await axios.get(`${API_URL}/admin/orders/${orderId}`, { headers: getHeaders() });
    order.value = res.data.data;
    localStatus.value = order.value.status;
    localPaymentStatus.value = order.value.payment_status;
    handleStatusChange();
    // Init map nếu đơn hàng đang giao hoặc đã giao
    if (order.value.status === 'shipping' || order.value.status === 'delivered') {
      initInlineMap();
    }
  } catch (error) {
    Swal.fire('Lỗi', 'Không tìm thấy đơn hàng này!', 'error').then(() => router.push({name: 'admin-orders'}));
  } finally {
    isPageLoading.value = false;
  }
};

const handleStatusChange = () => {
    const notes = quickNotesDict[localStatus.value] || [];
    currentQuickNotes.value = notes;
    customNoteText.value = '';
    if (notes.length > 0) selectedNoteOption.value = notes[0];
    else { selectedNoteOption.value = 'OTHER'; customNoteText.value = defaultNotesDict[localStatus.value] || ''; }
};

const submitStatusUpdate = async () => {
    if (localStatus.value === 'delivered' && order.value.payment_status !== 'paid') {
        Swal.fire({ title: 'Khoan đã! Chưa thu tiền', text: 'Để đảm bảo doanh thu, vui lòng cập nhật trạng thái Thanh toán thành "Đã TT" trước khi giao hàng.', icon: 'warning', confirmButtonColor: '#009981' });
        localStatus.value = order.value.status;
        handleStatusChange();
        return;
    }

    let finalNote = selectedNoteOption.value;
    if (finalNote === 'OTHER') {
        finalNote = customNoteText.value.trim();
        if (localStatus.value === 'cancelled' && !finalNote) {
            Swal.fire('Bắt buộc', 'Vui lòng nhập lý do cụ thể khi Hủy đơn hàng!', 'warning');
            return;
        }
    }

    isUpdatingStatus.value = true;
    try {
        await axios.put(`${API_URL}/admin/orders/${orderId}/status`, {
            status: localStatus.value,
            payment_status: order.value.payment_status,
            note: finalNote || defaultNotesDict[localStatus.value]
        }, { headers: getHeaders() });
        
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 });
        
        order.value.status = localStatus.value;
        fetchOrderData(true); 
        
        if (localStatus.value === 'delivered') {
            if (trackingMapModalRef.value) trackingMapModalRef.value.show(orderId, 'bmt', 'delivered', true);
        }
        
        // Init inline map nếu chuyển sang shipping hoặc delivered
        if (localStatus.value === 'shipping' || localStatus.value === 'delivered') {
            initInlineMap();
        }
        
    } catch (e) {
        Swal.fire('Lỗi', e.response?.data?.message || 'Lỗi cập nhật', 'error');
        localStatus.value = order.value.status;
        handleStatusChange();
    } finally {
        isUpdatingStatus.value = false;
    }
};

const submitPaymentUpdate = async () => {
    isUpdatingPayment.value = true;
    try {
        await axios.put(`${API_URL}/admin/orders/${orderId}/status`, {
            status: order.value.status,
            payment_status: localPaymentStatus.value,
            note: `Cập nhật thanh toán: ${localPaymentStatus.value.toUpperCase()}`
        }, { headers: getHeaders() });
        
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã lưu thanh toán', showConfirmButton: false, timer: 1500 });
        fetchOrderData(true);
    } catch (e) {
        Swal.fire('Lỗi', 'Lưu thanh toán thất bại!', 'error');
        localPaymentStatus.value = order.value.payment_status;
    } finally {
        isUpdatingPayment.value = false;
    }
};

const openTrackingModal = () => {
    if (trackingMapModalRef.value) {
        trackingMapModalRef.value.show(orderId, 'bmt', order.value?.status, false);
    }
};

const printOrder = () => {
    if (!order.value?.id) return;
    downloadAdminInvoice({ orderId: order.value.id, orderCode: order.value.order_code });
};

// Hàm cho bản đồ inline
const loadLeafletScript = () => {
  return new Promise((resolve) => {
    if (window.L) return resolve();
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = () => resolve(); document.head.appendChild(script);
  });
};

const stopAnimation = () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };

const fetchRobustRoute = async (p1, p2) => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;
    const res = await axios.get(url, { timeout: 8000 });
    if (res.data?.routes?.[0]) {
      return res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    }
  } catch (err) {
    console.warn("Mapbox lỗi hoặc hết hạn, chuyển sang OSRM dự phòng...");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`;
    const resOsrm = await axios.get(osrmUrl);
    if (resOsrm.data?.routes?.[0]) return resOsrm.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  }
  throw new Error("No route found");
};

const interpolateLine = (points, targetCount = 350) => {
  if (points.length >= targetCount) return points;
  const newPoints = [];
  const segments = Math.max(2, Math.ceil(targetCount / Math.max(1, points.length - 1)));
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]; const end = points[i+1];
    for (let j = 0; j < segments; j++) {
      newPoints.push([ start[0] + (end[0] - start[0]) * (j / segments), start[1] + (end[1] - start[1]) * (j / segments) ]);
    }
  }
  newPoints.push(points[points.length - 1]);
  return newPoints;
};

const initInlineMap = async () => {
  if (!orderId || !order.value) return;
  isMapLoading.value = true;
  stopAnimation();

  try {
    const res = await axios.get(`${API_URL}/admin/orders/${orderId}/simulation`, { 
        headers: getHeaders() 
    });
    mapData.value = res.data.data;

    const selectedWh = warehouses.value.find(w => w.id === selectedWarehouseId.value);
    if (selectedWh) mapData.value.origin = { name: `SORA (${selectedWh.name})`, lat: selectedWh.lat, lng: selectedWh.lng };

    const p1 = [mapData.value.origin.lat, mapData.value.origin.lng];
    const p2 = [mapData.value.destination.lat, mapData.value.destination.lng];

    await loadLeafletScript();

    if (!leafletMap) {
      leafletMap = window.L.map('order-tracking-map', { scrollWheelZoom: false }).setView(p1, 6);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(leafletMap);
    } else {
      if (routingLine) leafletMap.removeLayer(routingLine);
      if (truckMarker) leafletMap.removeLayer(truckMarker);
    }

    nextTick(() => { leafletMap.invalidateSize(); });

    let routeCoords = [];
    try {
      routeCoords = await fetchRobustRoute(p1, p2);
    } catch (err) {
      routeCoords = [p1, p2];
    }
    
    routeCoords = interpolateLine(routeCoords, 400);

    routingLine = window.L.polyline(routeCoords, { color: '#009981', weight: 6, opacity: 0.9 }).addTo(leafletMap);
    leafletMap.fitBounds(routingLine.getBounds(), { padding: [50, 50] });

    const iconA = window.L.divIcon({ html: `<div class="map-icon-point">A</div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    const iconB = window.L.divIcon({ html: `<div class="map-icon-point">B</div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    window.L.marker(p1, { icon: iconA }).bindPopup('Xuất phát').addTo(leafletMap);
    window.L.marker(p2, { icon: iconB }).bindPopup('Điểm nhận').addTo(leafletMap);

    const truckIcon = window.L.divIcon({ html: `<div class="map-icon-truck"><i class="bi bi-truck"></i></div>`, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
    let currentIndex = 0; let speed = 0;
    const totalPoints = routeCoords.length;

    if (order.value.status === 'delivered') {
      currentIndex = totalPoints - 1; speed = 0;
    } else if (order.value.status === 'shipping') {
      currentIndex = 0; speed = Math.max(1, Math.floor(totalPoints / 400));
    }

    truckMarker = window.L.marker(routeCoords[currentIndex], { icon: truckIcon }).addTo(leafletMap);
    isMapLoading.value = false;

    if (speed > 0) {
      const animate = () => {
        if (currentIndex < totalPoints - 1) {
          currentIndex += speed;
          if (currentIndex >= totalPoints) currentIndex = totalPoints - 1;
          truckMarker.setLatLng(routeCoords[currentIndex]);
          animationFrameId = requestAnimationFrame(animate);
        } else {
          if (order.value.status === 'shipping') { currentIndex = 0; animationFrameId = requestAnimationFrame(animate); }
          else { truckMarker.bindPopup('<b class="text-success">GIAO HÀNG THÀNH CÔNG!</b>').openPopup(); }
        }
      };
      animate();
    }
  } catch (e) {
    isMapLoading.value = false;
  }
};

onMounted(() => { fetchOrderData(); });
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.border-brand { border-color: #009981 !important; }
.bg-brand-subtle { background-color: #e6f5f2 !important; }
.border-brand-subtle { border-color: #009981 !important; }

.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-widest { letter-spacing: 2px; }

/* Skeleton mượt */
.skeleton-box { display: inline-block; position: relative; overflow: hidden; background-color: #e9ecef; }
.skeleton-box::after { position: absolute; top: 0; right: 0; bottom: 0; left: 0; transform: translateX(-100%); background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.4) 20%, rgba(255, 255, 255, 0.7) 60%, rgba(255, 255, 255, 0)); animation: shimmer 1.8s infinite; content: ''; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

.btn-brand {
    --bs-btn-color: #fff;
    --bs-btn-bg: #009981;
    --bs-btn-border-color: #009981;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #007a67;
    --bs-btn-hover-border-color: #007a67;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #007a67;
    --bs-btn-active-border-color: #007a67;
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #009981;
    --bs-btn-disabled-border-color: #009981;
    transition: all 0.2s ease-in-out;
}
.btn-brand:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 153, 129, 0.3);
}

.note-radio-wrap { transition: all 0.2s ease; border: 1px solid #dee2e6; }
.note-radio-wrap:hover { background-color: #f0fdfa; border-color: #009981 !important; }
.note-radio-wrap.active-radio { background-color: #e6f5f2 !important; border-color: #009981 !important; border-width: 2px; color: #009981 !important; }
.custom-radio:checked { background-color: #009981; border-color: #009981; }

.custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
.custom-scrollbar-y::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-y::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }

.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

<style>
.map-icon-point { background-color: #212529; color: #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid #e7ce7d; font-weight: bold; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); }
.map-icon-truck { background-color: #009981; color: #fff; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0, 153, 129, 0.5); font-size: 20px; }
</style>