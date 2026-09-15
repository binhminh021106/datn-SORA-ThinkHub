<template>
    <div class="modal fade" tabindex="-1" :class="{ 'show d-block': show }" v-if="show"
        style="background-color: rgba(0,0,0,0.5); z-index: 1060;">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header bg-light border-bottom-0 pb-3">
                    <div>
                        <h5 class="modal-title fw-bold text-dark mb-1">
                            Lịch sử cập nhật
                        </h5>
                        <p class="text-muted mb-0 small" v-if="orderCode">
                            Mã đơn hàng: <span class="fw-bold text-brand" style="color: #009981;">{{ orderCode }}</span>
                        </p>
                    </div>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>


                <div class="modal-body position-relative">
                    <div v-if="isLoading" class="d-flex justify-content-center py-5">
                        <div class="spinner-border text-brand" style="color: #009981;" role="status">
                            <span class="visually-hidden">Đang tải...</span>
                        </div>
                    </div>

                    <div v-else-if="!histories || histories.length === 0" class="text-center py-5 text-muted">
                        <i class="bi bi-clock-history fs-1 mb-3 d-block text-secondary opacity-50"></i>
                        Không có dữ liệu lịch sử nào cho đơn hàng này.
                    </div>


                    <div v-else class="timeline-wrapper px-2 py-3">
                        <div class="timeline">
                            <div v-for="(history, index) in sortedHistories" :key="index" class="timeline-item">

                                <div class="timeline-indicator">
                                    <div class="indicator-dot"></div>
                                    <div class="indicator-line" v-if="index !== sortedHistories.length - 1"></div>
                                </div>


                                <div class="timeline-content mb-4 ms-4">
                                    <div class="card border-0 shadow-sm rounded-3">
                                        <div class="card-body p-3">

                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <span class="badge bg-light text-dark border">
                                                    {{ formatDateTime(history.created_at) }}
                                                </span>
                                                <span class="small text-muted fst-italic">
                                                    Hệ thống ghi nhận
                                                </span>
                                            </div>


                                            <div class="status-change d-flex align-items-center bg-light rounded p-2 mb-3 border">
                                                <div class="flex-fill text-center">
                                                    <span class="small text-muted d-block mb-1">Từ trạng thái</span>
                                                    <span class="badge bg-secondary opacity-75">
                                                        {{ formatOrderStatus(history.old_status) || 'Khởi tạo' }}
                                                    </span>
                                                </div>
                                                <div class="px-2">
                                                    <i class="bi bi-arrow-right-circle text-brand fs-5" style="color: #009981;"></i>
                                                </div>
                                                <div class="flex-fill text-center">
                                                    <span class="small text-muted d-block mb-1">Sang trạng thái</span>
                                                    <span class="badge" :class="getStatusBadgeClass(history.new_status)">
                                                        {{ formatOrderStatus(history.new_status) }}
                                                    </span>
                                                </div>
                                            </div>


                                            <div class="d-flex align-items-center bg-light bg-opacity-50 p-2 rounded border border-light">

                                                <img v-if="history.changed_by_type === 'admin' && history.changer?.avatar" 
                                                     :src="getFullImage(history.changer.avatar)" 
                                                     class="rounded-circle me-2 object-fit-cover shadow-sm border" 
                                                     width="36" height="36" alt="Avatar">
                                                <div v-else class="rounded-circle me-2 bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center text-secondary border shadow-sm" style="width: 36px; height: 36px;">
                                                    <i class="bi" :class="history.changed_by_type === 'admin' ? 'bi-shield-lock-fill' : 'bi-person-fill'"></i>
                                                </div>
                                                
                                                <div>
                                                    <div class="fw-bold text-dark" style="font-size: 0.9rem;">
                                                        <span v-if="history.changed_by_type === 'admin'">
                                                            {{ history.changer?.fullName || history.changer?.name || 'Admin ẩn danh' }}
                                                            <i class="bi bi-patch-check-fill text-brand ms-1" style="color: #009981;" title="Quản trị viên"></i>
                                                        </span>
                                                        <span v-else-if="history.changed_by_type === 'user'">
                                                            Khách hàng 
                                                            <span class="fw-normal text-muted" v-if="history.changer">({{ history.changer.fullName || history.changer.name }})</span>
                                                        </span>
                                                        <span v-else>Hệ thống tự động</span>
                                                    </div>
                                                    <div class="text-muted small d-flex align-items-center mt-1" v-if="history.changed_by_type === 'admin' && history.changer?.role">
                                                        <span class="badge bg-secondary bg-opacity-25 text-secondary border-0 px-2 py-1" style="font-size: 0.7rem;">
                                                            {{ history.changer.role?.name || history.changer.role?.guard_name || 'Staff' }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>


                                            <div v-if="history.note" class="mt-3 p-2 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded small text-dark d-flex">
                                                <i class="bi bi-info-circle text-warning me-2 mt-1"></i>
                                                <div style="white-space: pre-line;">{{ history.note }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { getFullImage } from '@/composables/useUtilities';

const props = defineProps({
    show: Boolean,
    orderId: [Number, String]
});

const emit = defineEmits(['close']);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const isLoading = ref(false);
const orderCode = ref('');
const histories = ref([]);

const sortedHistories = computed(() => {
    if (!histories.value) return [];
    return [...histories.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const fetchOrderHistory = async () => {
    if (!props.orderId) return;
    
    try {
        isLoading.value = true;
        const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        };
        const res = await axios.get(`${API_URL}/admin/orders/${props.orderId}`, { headers });
        const orderData = res.data.data;
        
        orderCode.value = orderData.order_code;
        histories.value = orderData.histories || [];
    } catch (error) {
        console.error("Lỗi lấy lịch sử đơn hàng:", error);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.show, (newVal) => {
    if (newVal && props.orderId) {
        fetchOrderHistory();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        histories.value = [];
        orderCode.value = '';
    }
});

const closeModal = () => {
    emit('close');
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

const formatOrderStatus = (status) => {
    if (!status) return '';
    const map = {
        'pending': 'Chờ duyệt',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang chuẩn bị',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy',
        'return_requested': 'Yêu cầu hoàn trả',
        'return_negotiating': 'Đang thương lượng',
        'return_retrieving': 'Đang thu hồi',
        'returned': 'Đã hoàn trả'
    };
    return map[status] || status;
};

const getStatusBadgeClass = (status) => {
    const map = {
        'pending': 'bg-warning text-dark',
        'confirmed': 'bg-info text-dark',
        'processing': 'bg-primary',
        'shipping': 'bg-primary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger',
        'return_requested': 'bg-warning text-dark',
        'return_negotiating': 'bg-info text-dark',
        'return_retrieving': 'bg-primary',
        'returned': 'bg-success'
    };
    return map[status] || 'bg-secondary';
};
</script>

<style scoped>
.timeline-wrapper {
    position: relative;
}

.timeline {
    position: relative;
    padding-left: 15px;
}

.timeline-item {
    position: relative;
    min-height: 80px;
}

.timeline-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.indicator-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #009981;
    border: 3px solid #e9ecef;
    z-index: 2;
    margin-top: 10px;
    box-shadow: 0 0 0 3px rgba(0, 153, 129, 0.1);
}

.indicator-line {
    flex: 1;
    width: 2px;
    background-color: #dee2e6;
    margin-top: -10px;
    margin-bottom: -15px;
    z-index: 1;
}

[data-bs-theme="dark"] .modal-content {
    background-color: var(--bs-body-bg) !important;
}

[data-bs-theme="dark"] .bg-light {
    background-color: #2b3035 !important;
}

[data-bs-theme="dark"] .border {
    border-color: #495057 !important;
}

[data-bs-theme="dark"] .indicator-line {
    background-color: #495057;
}

[data-bs-theme="dark"] .indicator-dot {
    border-color: #2b3035;
}

[data-bs-theme="dark"] .card {
    background-color: #212529 !important;
    border: 1px solid #495057 !important;
}
</style>
