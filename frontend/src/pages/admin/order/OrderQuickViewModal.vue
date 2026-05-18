<template>
  <div class="modal fade" id="quickViewOrderModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;" ref="modalRef">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div id="invoice-printable" class="modal-content rounded-4 border-0 shadow">
        <div class="modal-header border-bottom pb-3 bg-light rounded-top-4 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold text-dark mb-0 flex-grow-1"><i class="bi bi-receipt text-brand me-2"></i>Đơn Hàng <span class="text-brand font-monospace">{{ order?.order_code }}</span></h5>
          
          <div class="d-flex align-items-center gap-2 gap-md-3 no-print">
             <!-- ĐÃ FIX: Nút này luôn luôn hiện dù đơn bị hủy -->
             <select v-if="order"
                     class="form-select form-select-sm border-brand text-brand fw-bold shadow-sm cursor-pointer bg-white"
                     style="width: auto; min-width: 140px; border-width: 2px;"
                     v-model="localSelectedWarehouseId"
                     title="Chọn kho xuất phát">
                <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">
                  Kho {{ wh.name }}
                </option>
             </select>

             <button v-if="order" 
                     type="button" 
                     class="btn btn-sm btn-brand  action-btn-hover fw-bold shadow-sm d-flex align-items-center border-0 px-3 py-1.5" 
                     @click="triggerTracking">
                <i class="bi bi-geo-alt-fill me-2"></i> Tracking Bản Đồ
             </button>
          </div>

          <button type="button" class="btn btn-sm btn-danger text-white rounded action-btn-hover ms-2 no-print d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; padding: 0;" @click="hide" title="Đóng">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="modal-body p-4 bg-white" v-if="order">
          <div class="row g-4">
              <div class="col-lg-4 border-end">
                  <h6 class="fw-bold text-muted text-uppercase mb-3"><i class="bi bi-person-badge me-2 text-brand"></i>Người nhận</h6>
                  <div class="mb-2"><span class="text-muted fw-semibold">Họ tên:</span> <strong class="text-dark float-end">{{ order.customer_name }}</strong></div>
                  <div class="mb-2"><span class="text-muted fw-semibold">Điện thoại:</span> <strong class="text-dark float-end">{{ order.customer_phone }}</strong></div>
                  <div class="mb-3">
                      <span class="text-muted fw-semibold d-block mb-1">Địa chỉ giao hàng:</span> 
                      <div class="p-2 bg-light border rounded small fw-medium">{{ order.customer_address }}</div>
                  </div>
                  <div class="mb-4">
                      <span class="text-muted fw-semibold d-block mb-1">Ghi chú của khách:</span> 
                      <div class="p-2 bg-warning bg-opacity-10 text-dark fw-medium border border-warning rounded small fst-italic">{{ order.order_note || 'Không có ghi chú' }}</div>
                  </div>

                  <h6 class="fw-bold text-muted text-uppercase mb-3 border-top pt-4"><i class="bi bi-credit-card me-2 text-brand"></i>Thanh toán</h6>
                  <div class="mb-2 d-flex justify-content-between align-items-center">
                      <span class="text-muted fw-semibold">Phương thức:</span> 
                      <span class="badge bg-secondary text-uppercase">{{ order.payment_method }}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-between align-items-center">
                      <span class="text-muted fw-semibold">Trạng thái TT:</span> 
                      <span class="badge shadow-sm border" :class="getPaymentBadge(order.payment_status)">{{ formatPaymentStatus(order.payment_status) }}</span>
                  </div>
              </div>

              <div class="col-lg-8">
                  <h6 class="fw-bold text-muted text-uppercase mb-3"><i class="bi bi-box-seam me-2 text-brand"></i>Sản phẩm đã đặt</h6>
                  <div class="table-responsive border rounded mb-4" style="max-height: 250px; overflow-y: auto;">
                      <table class="table table-hover align-middle mb-0 small">
                          <thead class="bg-light sticky-top">
                              <tr>
                                  <th class="ps-3 fw-semibold text-muted border-0">Sản phẩm</th>
                                  <th class="text-center fw-semibold text-muted border-0">Đơn giá</th>
                                  <th class="text-center fw-semibold text-muted border-0">SL</th>
                                  <th class="text-end pe-3 fw-semibold text-muted border-0">Thành tiền</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="item in order.items" :key="item.id">
                                  <td class="ps-3 py-3">
                                      <div class="d-flex align-items-center gap-2">
                                          <img :src="item.variant_image ? getFullImage(item.variant_image) : 'https://placehold.co/40'" class="rounded border shadow-sm" style="width: 45px; height: 45px; object-fit: cover;">
                                          <div>
                                              <div class="fw-bold text-dark text-wrap" style="max-width: 250px;">{{ item.product_name }}</div>
                                              <div class="text-muted" style="font-size: 0.7rem;">SKU: {{ item.variant_sku }}</div>
                                              
                                              <div class="text-brand mt-1" style="font-size: 0.7rem;" v-if="item.combo_id">
                                                  <span class="badge bg-light text-brand border border-brand-subtle">
                                                      <i class="bi bi-stars text-brand me-1"></i> Combo ({{ parseCombo(item.combo_selections).length }} món)
                                                  </span>
                                              </div>
                                              <div class="mt-1 text-secondary fw-medium" style="font-size: 0.7rem;" v-else-if="item.variant_attributes">
                                                  <span v-for="(val, key) in parseAttributes(item.variant_attributes)" :key="key" class="me-2">[{{ key }}: {{ val }}]</span>
                                              </div>
                                          </div>
                                      </div>
                                  </td>
                                  <td class="text-center fw-medium">{{ formatCurrency(item.price) }}</td>
                                  <td class="text-center fw-bold text-brand fs-6">x{{ item.quantity }}</td>
                                  <td class="text-end pe-3 fw-bold text-success fs-6">{{ formatCurrency(item.total_price) }}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <div class="row justify-content-end">
                      <div class="col-md-6">
                          <div class="bg-light p-3 rounded border">
                              <div class="d-flex justify-content-between mb-2 small">
                                <span class="text-muted fw-medium">Tạm tính:</span> 
                                <strong>{{ formatCurrency(order.sub_total) }}</strong>
                              </div>
                              <div class="d-flex justify-content-between mb-2 small">
                                <span class="text-muted fw-medium">Phí giao hàng:</span> 
                                <strong>{{ formatCurrency(order.shipping_fee) }}</strong>
                              </div>

                              <div class="d-flex justify-content-between mb-2 small text-danger" v-if="order.discount_amount > 0">
                                <span class="text-muted fw-medium">Giảm giá Coupon <span v-if="order.coupon_code">({{ order.coupon_code }})</span>:</span> 
                                <strong>- {{ formatCurrency(order.discount_amount) }}</strong>
                              </div>

                              <div class="d-flex justify-content-between mb-2 small text-success" v-if="order.tier_discount_amount > 0">
                                <span class="text-muted fw-medium"><i class="bi bi-star-fill text-warning me-1"></i>Ưu đãi hạng TV:</span> 
                                <strong>- {{ formatCurrency(order.tier_discount_amount) }}</strong>
                              </div>

                              <div class="d-flex justify-content-between mt-3 pt-2 border-top border-2 border-dark align-items-center">
                                <span class="fw-bold text-dark text-uppercase tracking-wide">TỔNG CỘNG:</span> 
                                <strong class="fs-4 text-brand font-oswald">{{ formatCurrency(order.total_amount) }}</strong>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div class="mt-4">
                      <h6 class="fw-bold text-muted text-uppercase mb-3"><i class="bi bi-clock-history me-2 text-brand"></i>Lịch sử cập nhật</h6>
                      <ul class="list-group list-group-flush border rounded custom-scrollbar-y" style="max-height: 200px; overflow-y: auto;">
                          <li class="list-group-item d-flex justify-content-between align-items-start p-3" v-for="(history, index) in order.histories" :key="history.id" :class="{'bg-light': index % 2 === 0}">
                              <div class="ms-2 me-auto w-100">
                                  <div class="d-flex justify-content-between align-items-center w-100 mb-1">
                                      <div class="fw-bold text-dark small">
                                          Chuyển sang <span class="badge ms-1 border shadow-sm" :class="getOrderStatusBadge(history.new_status)">{{ formatOrderStatus(history.new_status) }}</span>
                                      </div>
                                      <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i>{{ formatDateTime(history.created_at) }}</span>
                                  </div>
                                  <div class="text-muted mt-2" style="font-size: 0.75rem;">
                                      <span class="badge bg-secondary bg-opacity-10 text-dark border me-2"><i class="bi bi-person-fill me-1"></i>Bởi: {{ history.changer?.fullName || 'Hệ thống/Khách' }}</span>
                                      <span v-if="history.note" class="fst-italic text-danger fw-medium d-block d-md-inline mt-2 mt-md-0"><i class="bi bi-chat-right-text me-1"></i>"{{ history.note }}"</span>
                                  </div>
                              </div>
                          </li>
                      </ul>
                  </div>

              </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-top-0 rounded-bottom-4 gap-2 no-print">
           <button type="button" class="btn btn-outline-dark rounded-pill px-4 fw-bold action-btn-hover" @click="hide">Đóng</button>
           <button type="button" class="btn btn-dark text-white rounded-pill px-4 fw-bold action-btn-hover" @click="printInvoice"><i class="bi bi-printer me-2"></i> In Hóa Đơn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { getFullImage } from '@/composables/useUtilities';
import { downloadAdminInvoice } from '@/utils/adminInvoice.js';

const props = defineProps({
    order: {
        type: Object,
        default: null
    },
    warehouses: {
        type: Array,
        default: () => []
    },
    defaultWarehouseId: {
        type: String,
        default: 'bmt'
    }
});

const emit = defineEmits(['open-tracking', 'print']);

const modalRef = ref(null);
let bsModal = null;
const localSelectedWarehouseId = ref(props.defaultWarehouseId);

onMounted(() => {
    if (modalRef.value) {
        bsModal = new window.bootstrap.Modal(modalRef.value, {
            backdrop: 'static',
            keyboard: false
        });
    }
});

onUnmounted(() => {
    if (bsModal) {
        bsModal.dispose();
    }
});

watch(() => props.defaultWarehouseId, (newVal) => {
    localSelectedWarehouseId.value = newVal;
});

const show = () => {
    if (bsModal) bsModal.show();
};

const hide = () => {
    if (bsModal) bsModal.hide();
};

const triggerTracking = () => {
    hide();
    emit('open-tracking', props.order.id, localSelectedWarehouseId.value);
};

const printInvoice = () => {
    if (!props.order) return;
    downloadAdminInvoice({ orderId: props.order.id, orderCode: props.order.order_code });
};

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '---';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
};

const formatDateTime = (dateString) => { 
    if (!dateString) return ''; 
    const d = new Date(dateString); 
    return d.toLocaleString('vi-VN'); 
};

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

const formatPaymentStatus = (status) => {
    const map = { 'unpaid': 'Chưa TT', 'paid': 'Đã TT', 'refunded': 'Đã hoàn', 'failed': 'Thất bại' };
    return map[status] || status;
};

const getPaymentBadge = (status) => {
    const map = { 'unpaid': 'bg-warning text-dark border-warning', 'paid': 'bg-success text-white border-success', 'refunded': 'bg-info text-dark border-info', 'failed': 'bg-danger text-white border-danger' };
    return map[status] || 'bg-secondary';
};

const formatOrderStatus = (status) => {
    const map = { 'pending': 'Chờ duyệt', 'confirmed': 'Đã xác nhận', 'processing': 'Đang chuẩn bị', 'shipping': 'Đang giao', 'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'returned': 'Hoàn trả' };
    return map[status] || status;
};

const getOrderStatusBadge = (status) => {
    const map = { 
        'pending': 'bg-warning text-dark border-warning', 
        'confirmed': 'bg-info text-dark border-info', 
        'processing': 'bg-primary text-white border-primary', 
        'shipping': 'bg-primary text-white border-primary', 
        'delivered': 'bg-success text-white border-success', 
        'cancelled': 'bg-danger text-white border-danger', 
        'returned': 'bg-secondary text-white border-secondary' 
    };
    return map[status] || 'bg-light text-dark';
};

defineExpose({
    show,
    hide
});
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.border-brand { border-color: #009981 !important; }
.border-brand-subtle { border-color: rgba(0, 153, 129, 0.3) !important; }

.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-wide { letter-spacing: 1px; }

/* Nút Action Hover Mượt Mà */
.action-btn-hover { transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) !important; }
.action-btn-hover:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 12px rgba(0, 153, 129, 0.25) !important; filter: brightness(1.1) !important; }

.custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
.custom-scrollbar-y::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-y::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
  @media print {
    body * { visibility: hidden !important; }
    #invoice-printable, #invoice-printable * { visibility: visible !important; }
    #invoice-printable { position: absolute; left: 0; top: 0; width: 100%; }
    .no-print { display: none !important; }
  }</style>