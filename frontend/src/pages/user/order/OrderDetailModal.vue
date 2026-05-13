<template>
  <div v-if="isOpen" class="custom-modal-backdrop" @click.self="$emit('close')">
    <!-- ĐÃ FIX: Bỏ Fullscreen, dùng Modal Box bo góc hiện đại nằm giữa màn hình -->
    <div class="custom-modal-content shadow-lg border-0 rounded-4 slide-up d-flex flex-column" style="width: 1000px; max-width: 95vw; max-height: 90vh;">
      
      <!-- HEADER MÀU ĐỎ SORA QUEN THUỘC -->
      <div class="p-3 p-md-4 d-flex justify-content-between align-items-center bg-sora-primary text-white rounded-top-4 flex-shrink-0">
        <div>
          <h4 class="mb-1 fw-bold font-serif tracking-wider">ĐƠN HÀNG #{{ order?.order_code }}</h4>
          <span class="opacity-75 small font-oswald tracking-wide"><i class="bi bi-calendar3 me-2"></i>Ngày đặt: {{ formatDateTime(order?.created_at) }}</span>
        </div>
        <button @click="$emit('close')" class="btn text-white fs-4 p-0 shadow-none hover-scale border-0"><i class="bi bi-x-lg"></i></button>
      </div>

      <!-- KHU VỰC NỘI DUNG TỰ CUỘN -->
      <div class="modal-body p-4 bg-light flex-grow-1 overflow-auto custom-scrollbar-y">
        <div class="row g-4">
            
            <!-- CỘT TRÁI: TIẾN TRÌNH & SẢN PHẨM -->
            <div class="col-lg-7">
                <!-- Tiến trình -->
                <div class="bg-white p-4 shadow-sm border border-light-subtle mb-4 rounded-3">
                    <h6 class="fw-bold mb-4 font-serif text-sora-primary text-uppercase tracking-wider border-bottom pb-2">
                        <i class="bi bi-clock-history me-2"></i> Tiến Trình
                    </h6>
                    
                    <div v-if="!['cancelled', 'returned', 'return_requested'].includes(order?.status)" class="order-stepper-horizontal d-none d-md-flex mt-2 mb-3">
                        <div v-for="(step, index) in orderSteps" :key="index" 
                            class="stepper-step" 
                            :class="{ 'completed': isStepCompleted(order?.status, step.value), 'active': order?.status === step.value }">
                        <div class="step-icon-wrap">
                            <div class="step-icon"><i :class="step.icon"></i></div>
                        </div>
                        <div class="step-text">
                            <div class="step-title">{{ step.label }}</div>
                            <div class="step-date" v-if="getStepDate(order, step.value)">{{ getStepDate(order, step.value) }}</div>
                        </div>
                        </div>
                    </div>
                    
                    <ul v-if="!['cancelled', 'returned', 'return_requested'].includes(order?.status)" class="timeline-vertical d-md-none mt-3">
                        <li v-for="(h, idx) in order?.histories" :key="h.id" :class="{'latest': idx === 0}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h6 class="fw-bold mb-1 font-oswald text-uppercase tracking-wide" :class="idx === 0 ? 'text-sora-primary' : 'text-dark'">{{ translateStatus(h.new_status) }}</h6>
                            <div class="text-muted small mb-1">{{ formatDateTime(h.created_at) }}</div>
                            <div v-if="h.note" class="fst-italic text-secondary small">"{{ h.note }}"</div>
                        </div>
                        </li>
                    </ul>

                    <div v-if="['cancelled', 'returned', 'return_requested'].includes(order?.status)" class="alert bg-danger-subtle text-danger border-danger-subtle rounded-3 mb-0 d-flex align-items-center py-3 px-3">
                        <i class="bi bi-x-circle-fill me-3 fs-3"></i>
                        <div>
                        <strong class="d-block mb-1">
                            Đơn hàng đã bị {{ order?.status === 'cancelled' ? 'Hủy' : (order?.status === 'return_requested' ? 'Yêu cầu hoàn trả' : 'Hoàn trả') }}.
                        </strong>
                        <span class="small font-oswald tracking-wide text-uppercase">Cập nhật lúc: {{ getCancelTime(order) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Sản phẩm -->
                <div class="bg-white p-4 shadow-sm border border-light-subtle rounded-3">
                    <h6 class="fw-bold mb-3 font-serif text-sora-primary text-uppercase tracking-wider border-bottom pb-2">
                        <i class="bi bi-bag-check me-2"></i> Chi tiết Mua Sắm
                    </h6>
                    
                    <div class="table-responsive">
                        <table class="table table-borderless align-middle mb-0">
                            <tbody>
                                <template v-for="item in order?.items" :key="item.id">
                                    
                                    <!-- Sản phẩm lẻ -->
                                    <tr v-if="!item.combo_id" class="border-bottom border-light-subtle">
                                        <td class="ps-0 py-3" style="width: 70%;">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="product-img-wrap flex-shrink-0" style="width: 60px; height: 60px;">
                                                    <img :src="getImageUrl(item.variant_image)" @error="handleImageError" class="w-100 h-100 object-fit-cover rounded border">
                                                </div>
                                                <div class="flex-grow-1">
                                                    <h6 class="fw-bold text-dark mb-1 font-serif fs-6">{{ item.product_name }}</h6>
                                                    <div v-if="item.variant_attributes" class="text-muted" style="font-size: 0.75rem;">
                                                        <template v-for="(val, key, index) in parseAttributes(item.variant_attributes)" :key="key">
                                                            <span class="text-uppercase" style="font-size: 0.65rem;">{{ key }}:</span>
                                                            <strong class="text-dark ms-1 me-1">{{ val }}</strong>
                                                            <span v-if="index < Object.keys(parseAttributes(item.variant_attributes)).length - 1" class="mx-1 text-secondary opacity-25">|</span>
                                                        </template>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="text-center fw-bold fs-6 font-oswald text-muted">x{{ item.quantity || 1 }}</td>
                                        <td class="text-end pe-0 fw-bold text-dark text-nowrap fs-6">{{ formatPrice(item.total_price || (item.price * (item.quantity || 1))) }}</td>
                                    </tr>

                                    <!-- Sản phẩm Combo -->
                                    <tr v-else class="border-bottom border-light-subtle bg-light rounded">
                                        <td colspan="3" class="p-3 border-start border-end border-light-subtle rounded">
                                            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light-subtle">
                                                <div class="d-flex align-items-center gap-3">
                                                    <div class="product-img-wrap flex-shrink-0" style="width: 50px; height: 50px;">
                                                        <img :src="getImageUrl(item.variant_image)" @error="handleImageError" class="w-100 h-100 object-fit-cover rounded">
                                                    </div>
                                                    <div>
                                                        <h6 class="fw-bold text-dark mb-1 font-serif fs-6">{{ item.product_name }}</h6>
                                                        <div class="badge bg-sora-primary text-white font-oswald tracking-wide small"><i class="bi bi-stars me-1"></i> Combo</div>
                                                    </div>
                                                </div>
                                                <div class="text-end">
                                                    <div class="fw-bold text-dark fs-6">x{{ item.quantity || 1 }}</div>
                                                    <div class="fw-bold text-sora-primary">{{ formatPrice(item.total_price || (item.price * (item.quantity || 1))) }}</div>
                                                </div>
                                            </div>

                                            <div class="ps-2 ms-2 border-start border-2 border-secondary border-opacity-25">
                                                <div v-for="(selection, selIdx) in parseCombo(item.combo_selections)" :key="selIdx" class="d-flex align-items-center gap-2 mb-2 last-mb-0">
                                                    <span class="small text-muted font-oswald">{{ selIdx + 1 }}.</span>
                                                    <div class="flex-grow-1">
                                                        <span class="fw-bold text-dark small">{{ selection.product_name || `Lựa chọn ${selIdx + 1}` }}</span>
                                                        <span v-if="selection.attributes" class="text-muted font-oswald ms-2" style="font-size: 0.65rem;">
                                                            (<template v-for="(val, key, sIdx) in parseAttributes(selection.attributes)" :key="key">
                                                                {{ val }}<span v-if="sIdx < Object.keys(parseAttributes(selection.attributes)).length - 1">, </span>
                                                            </template>)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- CỘT PHẢI: GIAO HÀNG & TỔNG TIỀN -->
            <div class="col-lg-5">
                <div class="d-flex flex-column h-100 gap-4">
                    
                    <!-- Thông tin Khách hàng -->
                    <div class="bg-white p-4 shadow-sm border border-light-subtle rounded-3">
                        <h6 class="fw-bold mb-3 font-serif text-sora-primary text-uppercase tracking-wider border-bottom pb-2">
                            <i class="bi bi-person-lines-fill me-2"></i> Giao Hàng Tới
                        </h6>
                        <div class="mb-3">
                            <span class="fw-bold text-dark fs-6 d-block">{{ order?.customer_name }}</span>
                            <span class="text-muted small"><i class="bi bi-telephone-fill me-1"></i> {{ order?.customer_phone }}</span>
                        </div>
                        <div class="mb-3">
                            <span class="text-dark small lh-base d-block"><i class="bi bi-geo-alt-fill text-muted me-1"></i> {{ order?.customer_address }}</span>
                        </div>
                        <div v-if="order?.order_note" class="p-2 bg-light border border-warning-subtle rounded fst-italic small">
                            <i class="bi bi-pencil-square text-warning me-1"></i> "{{ order?.order_note }}"
                        </div>
                    </div>

                    <!-- Thanh toán và Tổng tiền -->
                    <div class="bg-white p-4 shadow-sm border border-light-subtle rounded-3 flex-grow-1">
                        <h6 class="fw-bold mb-3 font-serif text-sora-primary text-uppercase tracking-wider border-bottom pb-2">
                            <i class="bi bi-receipt me-2"></i> Hóa Đơn
                        </h6>

                        <div class="d-flex justify-content-between mb-2 small text-muted">
                            <span>Phương thức TT:</span>
                            <span class="fw-bold text-dark">{{ translatePaymentMethod(order?.payment_method) }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-3 pb-3 border-bottom border-light-subtle small text-muted">
                            <span>Trạng thái TT:</span>
                            <span class="badge" :class="getPaymentStatusClass(order?.payment_status)">{{ translatePaymentStatus(order?.payment_status) }}</span>
                        </div>

                        <div class="d-flex justify-content-between mb-2 small">
                            <span class="text-muted">Tạm tính:</span>
                            <span class="fw-bold text-dark">{{ formatPrice(order?.sub_total) }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2 small">
                            <span class="text-muted">Phí giao hàng:</span>
                            <span class="fw-bold" :class="order?.shipping_fee === 0 ? 'text-success' : 'text-dark'">
                                {{ order?.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order?.shipping_fee) }}
                            </span>
                        </div>
                        <div v-if="order?.discount_amount > 0" class="d-flex justify-content-between mb-3 small text-success fw-bold">
                            <span>Giảm giá <span class="badge bg-success-subtle text-success ms-1 border border-success-subtle">{{ order?.coupon_code }}</span>:</span>
                            <span>- {{ formatPrice(order?.discount_amount) }}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-2 border-dark">
                            <span class="fw-bold text-dark text-uppercase font-oswald">Tổng cộng:</span>
                            <h4 class="fw-bold text-sora-primary mb-0 font-serif">{{ formatPrice(order?.total_amount) }}</h4>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>

      <!-- FOOTER: NÚT ACTION TINH GỌN, SANG TRỌNG -->
      <div class="p-3 border-top bg-white rounded-bottom-4 d-flex flex-wrap justify-content-center justify-content-md-end gap-2 flex-shrink-0">
        <button v-if="order?.status === 'delivered' && (!order?.reviews || order?.reviews.length === 0)" @click="handleReview" class="btn btn-outline-dark btn-sm fw-bold px-3 font-oswald tracking-wide text-uppercase">
            <i class="bi bi-star-fill me-1"></i> Đánh Giá
        </button>
        
        <button v-if="order?.status === 'delivered' && order?.reviews && order?.reviews.length > 0" @click="$emit('open-review', order)" class="btn btn-outline-info btn-sm fw-bold px-3 font-oswald tracking-wide text-uppercase">
            <i class="bi bi-eye-fill me-1"></i> Xem Đánh Giá
        </button>
        
        <button v-if="order?.status === 'delivered'" @click="handleReturn" class="btn btn-outline-warning text-dark border-warning btn-sm fw-bold px-3 font-oswald tracking-wide text-uppercase hover-warning">
            <i class="bi bi-arrow-return-left me-1"></i> Hoàn Trả
        </button>
        
        <button v-if="order?.id" @click="handleDownloadInvoice" class="btn btn-outline-success btn-sm fw-bold px-3 font-oswald tracking-wide text-uppercase">
            <i class="bi bi-file-earmark-pdf me-1"></i> Xuất PDF
        </button>
        
        <button v-if="['delivered', 'cancelled', 'returned', 'return_requested'].includes(order?.status)" @click="handleReorder" class="btn btn-sora-primary btn-sm fw-bold px-4 font-oswald tracking-wide text-uppercase shadow-sm">
            <i class="bi bi-cart-plus me-1"></i> Mua Lại
        </button>
        
        <button @click="$emit('close')" class="btn btn-secondary btn-sm fw-bold px-4 ms-md-2 font-oswald tracking-wide text-uppercase">
            Đóng
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();

const props = defineProps({
  isOpen: Boolean,
  order: Object
});

const emit = defineEmits(['close', 'refresh', 'open-review']);

const orderSteps = [
  { value: 'pending', label: 'Chờ xác nhận', icon: 'bi-receipt' },
  { value: 'confirmed', label: 'Đã xác nhận', icon: 'bi-box-seam' },
  { value: 'processing', label: 'Đang xử lý', icon: 'bi-gear' },
  { value: 'shipping', label: 'Đang giao', icon: 'bi-truck' },
  { value: 'delivered', label: 'Hoàn tất', icon: 'bi-check-circle-fill' }
];

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { 'Accept': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

const isStepCompleted = (currentStatus, stepValue) => {
  if (!currentStatus) return false;
  if (['cancelled', 'returned', 'return_requested'].includes(currentStatus)) return false;
  const currentIdx = orderSteps.findIndex(s => s.value === currentStatus);
  const stepIdx = orderSteps.findIndex(s => s.value === stepValue);
  return currentIdx >= stepIdx;
};

const getStepDate = (order, stepValue) => {
  if (!order?.histories || !Array.isArray(order.histories)) return '';
  const history = order.histories.find(h => h.new_status === stepValue);
  if (history) {
    const d = new Date(history.created_at);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
  }
  return '';
};

const getCancelTime = (order) => {
  if (!order?.histories || !Array.isArray(order.histories)) return 'N/A';
  const history = order.histories.find(h => ['cancelled', 'returned', 'return_requested'].includes(h.new_status));
  return history ? formatDateTime(history.created_at) : 'N/A';
};

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value || 0));
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
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

const getImageUrl = (path) => {
  if (!path) return defaultPlaceholder;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};

const handleImageError = (e) => { e.target.src = defaultPlaceholder; };

const translateStatus = (status) => {
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Hoàn tất',
    cancelled: 'Đã hủy',
    returned: 'Đã trả hàng',
    return_requested: 'Yêu cầu hoàn trả'
  };
  return map[status] || status;
};

const translatePaymentMethod = (method) => {
  const map = {
    'cod': 'Thanh toán khi nhận hàng (COD)',
    'vnpay': 'VNPAY',
    'momo': 'Ví MoMo',
    'bank_transfer': 'Chuyển khoản'
  };
  return map[method] || method || 'N/A';
};

const translatePaymentStatus = (status) => {
  const map = {
    'unpaid': 'CHƯA THANH TOÁN',
    'paid': 'ĐÃ THANH TOÁN',
    'refunded': 'ĐÃ HOÀN TIỀN'
  };
  return map[status] || status || 'N/A';
};

const getPaymentStatusClass = (status) => {
  if (status === 'paid') return 'bg-success-subtle text-success border-success-subtle';
  if (status === 'refunded') return 'bg-info-subtle text-info border-info-subtle';
  return 'bg-warning-subtle text-warning-emphasis border-warning-subtle'; 
};

// ================= CÁC HÀM XỬ LÝ NÚT BẤM =================

const handleReview = () => {
  if (!props.order?.items?.length) {
    Swal.fire({ icon: 'info', title: 'Không có sản phẩm để đánh giá' });
    return;
  }
  emit('open-review', props.order);
};

const handleReturn = async () => {
    const quickNotes = [
        'Sản phẩm bị lỗi, trầy xước từ trước',
        'Giao sai sản phẩm / sai phân loại',
        'Sản phẩm không giống như mô tả',
        'Thiếu phụ kiện, hộp, quà tặng',
        'Tôi đổi ý, không muốn mua nữa'
    ];
    
    // ĐÃ FIX: Danh sách Checkbox tròn (Radio buttons) xịn xò
    let radiosHtml = '<div class="text-start custom-radio-list px-2 px-md-4 mt-3">';
    quickNotes.forEach((n, idx) => {
        radiosHtml += `
            <label class="d-flex align-items-center mb-3 cursor-pointer">
                <input type="radio" name="return_reason_radio" value="${n}" class="form-check-input me-3 mt-0" style="width: 1.25rem; height: 1.25rem; cursor: pointer; flex-shrink: 0;">
                <span class="text-dark" style="font-size: 0.95rem;">${n}</span>
            </label>
        `;
    });
    
    radiosHtml += `
            <label class="d-flex align-items-center mb-2 cursor-pointer">
                <input type="radio" name="return_reason_radio" value="other" id="radio_other_reason" class="form-check-input me-3 mt-0" style="width: 1.25rem; height: 1.25rem; cursor: pointer; flex-shrink: 0;">
                <span class="text-dark" style="font-size: 0.95rem;">Lý do khác...</span>
            </label>
            <div id="other_reason_container" style="display: none; padding-left: 2.2rem; margin-top: 10px;">
                <textarea id="swal-return-note" class="form-control shadow-sm rounded-3 p-3" rows="3" placeholder="Nhập chi tiết lý do hoàn trả của bạn vào đây..." style="font-size: 0.9rem;"></textarea>
            </div>
        </div>
    `;

    const { value: noteText, isDismissed } = await Swal.fire({
        title: 'Yêu cầu Hoàn trả',
        html: `
            <p class="mb-2 text-muted font-serif fs-6">Đơn hàng <strong class="text-sora-primary font-monospace">#${props.order.order_code}</strong></p>
            ${radiosHtml}
        `,
        showCancelButton: true,
        confirmButtonColor: '#9f273b',
        cancelButtonColor: '#212529',
        confirmButtonText: 'Gửi yêu cầu',
        cancelButtonText: 'Hủy bỏ',
        customClass: {
            confirmButton: 'rounded-0 px-4 py-2 fw-bold text-uppercase font-oswald tracking-widest',
            cancelButton: 'rounded-0 px-4 py-2 fw-bold text-uppercase font-oswald tracking-widest'
        },
        didOpen: () => {
            const radios = document.querySelectorAll('input[name="return_reason_radio"]');
            const otherContainer = document.getElementById('other_reason_container');
            const textarea = document.getElementById('swal-return-note');

            // Xử lý ẩn/hiện textarea khi chọn "Khác"
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'other') {
                        otherContainer.style.display = 'block';
                        textarea.focus();
                    } else {
                        otherContainer.style.display = 'none';
                        textarea.value = ''; 
                    }
                });
            });
        },
        preConfirm: () => {
            const selectedRadio = document.querySelector('input[name="return_reason_radio"]:checked');
            if (!selectedRadio) {
                Swal.showValidationMessage('Vui lòng chọn một lý do hoàn trả!');
                return false;
            }

            let reason = selectedRadio.value;
            // Nếu chọn "Khác" thì phải điền text
            if (reason === 'other') {
                const val = document.getElementById('swal-return-note').value;
                if (!val.trim() || val.trim().length < 5) {
                    Swal.showValidationMessage('Vui lòng nhập lý do cụ thể hơn (ít nhất 5 ký tự)!');
                    return false;
                }
                reason = val.trim();
            }
            return reason;
        }
    });

    if (isDismissed || !noteText) return;

    Swal.fire({ title: 'Đang gửi...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
        await axios.post(`${API_URL}/client/orders/${props.order.order_code}/return`, {
            return_reason: noteText
        }, { headers: getHeaders() });
        
        Swal.fire({ 
            icon: 'success', title: 'Thành công', 
            text: 'Đã gửi yêu cầu. SORA sẽ liên hệ trong 24h!', confirmButtonColor: '#9f273b' 
        });
        emit('refresh'); 
        emit('close');   
    } catch (e) {
        Swal.fire('Lỗi', e.response?.data?.message || 'Không thể gửi yêu cầu lúc này.', 'error');
    }
};

const handleReorder = async () => {
  Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    await axios.post(`${API_URL}/client/orders/${props.order.order_code}/reorder`, {}, { headers: getHeaders() });
    Swal.fire({ 
        icon: 'success', title: 'Thành công', text: 'Sản phẩm đã được thêm vào Giỏ hàng!', 
        confirmButtonColor: '#9f273b', timer: 2000, showConfirmButton: false 
    }).then(() => {
        emit('close');
        router.push('/cart');
    });
  } catch(e) {
    Swal.fire('Lỗi', e.response?.data?.message || 'Sản phẩm đã ngừng kinh doanh.', 'error');
  }
};

const handleDownloadInvoice = async () => {
  Swal.fire({ title: 'Đang xuất PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    const res = await axios.get(`${API_URL}/client/orders/${props.order.order_code}/invoice`, { 
      headers: getHeaders(), responseType: 'blob' 
    });
    
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hoa_Don_${props.order.order_code}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Swal.close();
  } catch(e) {
    Swal.fire({icon: 'error', title: 'Lỗi', text: 'Chưa thể xuất hóa đơn lúc này.', confirmButtonColor: '#9f273b'});
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.text-primary-custom, .text-sora-primary { color: #9f273b !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }

.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-wide { letter-spacing: 1px; }
.tracking-widest { letter-spacing: 2px; }

/* Nút Bootstrap chuẩn SORA */
.btn-sora-primary { background-color: #9f273b; color: white; border: none; }
.btn-sora-primary:hover { background-color: #7a1c2d; color: white; }
.btn-outline-dark:hover { background-color: #212529; color: white; }
.hover-warning:hover { background-color: #ffc107 !important; color: #212529 !important; }
.hover-scale:hover { transform: scale(1.1); transition: 0.2s; }

/* MODAL BOX CHUẨN */
.custom-modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(3px);
  z-index: 1050; display: flex; align-items: center; justify-content: center; 
  padding: 15px; 
}

.custom-modal-content {
  background: #f8f9fa; 
  position: relative; 
  overflow: hidden;
}

@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.slide-up { animation: slideUp 0.3s ease-out; }

/* THANH CUỘN LÕI */
.custom-scrollbar-y::-webkit-scrollbar { width: 6px; }
.custom-scrollbar-y::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-y::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }

/* THANH TIẾN TRÌNH (Nhỏ gọn hơn) */
.order-stepper-horizontal { position: relative; justify-content: space-between; width: 100%; padding: 0 10px; }
.order-stepper-horizontal::before { content: ''; position: absolute; top: 15px; left: 30px; right: 30px; height: 2px; background-color: #e9ecef; z-index: 1; }
.stepper-step { position: relative; z-index: 2; text-align: center; flex: 1; }
.step-icon-wrap { display: flex; justify-content: center; margin-bottom: 5px; }
.step-icon { width: 32px; height: 32px; background-color: #f8f9fa; color: #adb5bd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; border: 2px solid #fff; transition: all 0.3s; box-shadow: 0 0 0 1px #dee2e6; }
.stepper-step.completed .step-icon { background-color: #9f273b; color: #fff; border-color: #fff; box-shadow: none; }
.stepper-step.active .step-icon { background-color: #9f273b; color: #fff; border-color: #fff; box-shadow: 0 0 0 4px rgba(159, 39, 59, 0.15); }
.step-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #adb5bd; font-family: 'Oswald', sans-serif; }
.stepper-step.completed .step-title, .stepper-step.active .step-title { color: #9f273b; }
.step-date { font-size: 0.65rem; color: #6c757d; margin-top: 0; }

.timeline-vertical { list-style: none; padding: 0; margin: 0; position: relative; }
.timeline-vertical::before { content: ''; position: absolute; top: 10px; bottom: 0; left: 6px; width: 2px; background: #e9ecef; }
.timeline-vertical li { position: relative; padding-left: 25px; margin-bottom: 15px; }
.timeline-vertical li:last-child { margin-bottom: 0; }
.timeline-dot { position: absolute; left: 0; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid #adb5bd; z-index: 2; }
.timeline-vertical li.latest .timeline-dot { border-color: #9f273b; background: #9f273b; box-shadow: 0 0 0 3px rgba(159, 39, 59, 0.2); }
</style>

<style>
.swal2-container { z-index: 9999 !important; }

/* Thay màu Checkbox tròn mặc định của Bootstrap thành màu Đỏ SORA */
.custom-radio-list .form-check-input:checked {
  background-color: #9f273b;
  border-color: #9f273b;
}
.custom-radio-list .form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(159, 39, 59, 0.25);
  border-color: #9f273b;
}
</style>