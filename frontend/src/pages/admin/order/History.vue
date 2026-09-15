<template>
    <div class="order-history-wrapper container-fluid py-4">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
                <h3 class="fw-bold text-dark mb-0 d-flex align-items-center">
                    <i class="bi bi-clock-history me-2"></i>Lịch sử hoạt động đơn hàng
                </h3>
            </div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
                <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="handleRefresh">
                    <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
                </button>
            </div>
        </div>

        <div class="d-flex flex-column flex-md-row flex-wrap gap-3 gap-md-4 mb-4 align-items-start">
            <div class="filter-wrapper">
                <label class="form-label small text-muted fw-bold mb-2">
                    <i class="bi bi-funnel-fill text-brand me-1"></i>Trạng thái Đơn hàng
                </label>
                <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
                    <select
                        class="form-select form-select-sm border-0 bg-transparent fw-bold p-0 pe-4 cursor-pointer"
                        style="min-width: 140px; box-shadow: none;" v-model="filters.status" @change="handleFilterChange">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="processing">Đang chuẩn bị</option>
                        <option value="shipping">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="returned">Hoàn trả</option>
                    </select>
                </div>
            </div>

            <div class="filter-wrapper">
                <label class="form-label small text-muted fw-bold mb-2">
                    <i class="bi bi-calendar-range text-brand me-1"></i>Lọc theo Khoảng thời gian
                </label>
                <div class="d-flex flex-wrap gap-2">
                    <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
                        <span class="text-muted small fw-semibold me-2">Từ:</span>
                        <input type="date" class="form-control form-control-sm border-0 bg-transparent fw-bold p-0"
                            style="box-shadow: none; width: 115px;" v-model="filters.start_date" @change="handleFilterChange">
                    </div>
                    <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
                        <span class="text-muted small fw-semibold me-2">Đến:</span>
                        <input type="date" class="form-control form-control-sm border-0 bg-transparent fw-bold p-0"
                            style="box-shadow: none; width: 115px;" v-model="filters.end_date" @change="handleFilterChange">
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-header bg-white border-bottom-0 pt-3 pb-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
                <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
                    <i class="bi bi-list-ul me-2"></i>Chi tiết lịch sử
                </h6>
                <div class="search-box position-relative w-100" style="max-width: 350px;">
                    <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0 py-2 w-100"
                        v-model="searchQuery" @keyup.enter="handleSearch" placeholder="Tìm Mã đơn, Tên KH, SĐT...">
                    <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted cursor-pointer"
                        @click="handleSearch"></i>
                </div>
            </div>

            <div class="card-body p-0 mt-2 position-relative">

                <div v-if="isFetching" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75" style="z-index: 10;">
                    <div class="w-100 h-100 d-flex align-items-center justify-content-center">
                        <AdminLoadingSpinner size="32" label="Đang tải dữ liệu" />
                    </div>
                </div>

                <div class="table-responsive border-0" style="min-height: 300px;">
                    <table class="table table-hover align-middle mb-0 responsive-table w-100">
                        <thead class="bg-light">
                            <tr>
                                <th class="py-3 px-3 text-secondary border-0" style="width: 15%;">Mã Đơn</th>
                                <th class="py-3 px-2 text-secondary border-0" style="width: 25%;">Khách hàng</th>
                                <th class="py-3 px-2 text-secondary border-0" style="width: 20%;">Trạng thái hiện tại</th>
                                <th class="py-3 px-2 text-secondary border-0" style="width: 20%;">Cập nhật lần cuối</th>
                                <th class="py-3 px-2 text-secondary text-center border-0" style="width: 20%;">Hành động</th>
                            </tr>
                        </thead>
                        <tbody :class="{ 'pe-none opacity-50': isFetching }" style="transition: opacity 0.2s;">
                            <tr v-if="orders.length === 0 && !isFetching">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không tìm thấy đơn hàng nào.
                                </td>
                            </tr>
                            <template v-else>
                                <tr v-for="order in orders" :key="order.id">
                                    <td data-label="Mã Đơn" class="px-3 py-3 text-nowrap">
                                        <div class="fw-bold fs-6 mb-1 font-monospace" style="color: #009981;">
                                            {{ order.order_code }}
                                        </div>
                                    </td>
                                    <td data-label="Khách hàng" class="px-2 overflow-hidden">
                                        <div class="fw-bold text-dark text-truncate mb-1">
                                            <i class="bi bi-person-fill me-1 text-secondary"></i> {{ order.customer_name }}
                                        </div>
                                        <div class="small text-muted text-truncate">
                                            <i class="bi bi-telephone-fill me-1"></i> {{ order.customer_phone }}
                                        </div>
                                    </td>
                                    <td data-label="Trạng thái" class="px-2">
                                        <span class="badge py-2 fs-6" :class="getOrderStatusClass(order.status)">
                                            {{ formatOrderStatus(order.status) }}
                                        </span>
                                    </td>
                                    <td data-label="Cập nhật" class="px-2">
                                        <div class="text-muted small"><i class="bi bi-clock me-1"></i>{{ formatDate(order.updated_at) }}</div>
                                    </td>
                                    <td data-label="Hành động" class="px-2 text-center">
                                        <button class="btn btn-sm btn-light shadow-sm border action-btn-hover fw-bold" style="color: #009981; border-color: #009981;"
                                            @click="openHistoryModal(order.id, order.order_code)" title="Xem lịch sử">
                                            <i class="bi bi-clock-history me-1"></i> Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>


            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3" v-if="pagination.lastPage > 1">
                <span class="text-muted small text-center">Hiển thị trang {{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
                <nav>
                    <ul class="pagination pagination-sm mb-0 shadow-sm">
                        <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                            <button class="page-link" style="color: #009981;" @click="changePage(pagination.currentPage - 1)"><i class="bi bi-chevron-left"></i></button>
                        </li>
                        <li class="page-item" v-for="page in pagination.lastPage" :key="page" :class="{ active: pagination.currentPage === page }">
                            <button class="page-link" :class="pagination.currentPage === page ? 'text-white' : 'text-dark'" :style="pagination.currentPage === page ? 'background-color: #009981; border-color: #009981;' : ''" @click="changePage(page)">
                                {{ page }}
                            </button>
                        </li>
                        <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.lastPage }">
                            <button class="page-link" style="color: #009981;" @click="changePage(pagination.currentPage + 1)"><i class="bi bi-chevron-right"></i></button>
                        </li>
                    </ul>
                </nav>
            </div>

            <OrderHistoryDetailModal :show="isHistoryModalVisible" :orderId="selectedHistoryOrderId" @close="closeHistoryModal" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import axios from 'axios';
import AdminLoadingSpinner from '@/components/admin/AdminLoadingSpinner.vue';
import OrderHistoryDetailModal from './OrderHistoryDetailModal.vue';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const queryClient = useQueryClient();
const searchQuery = ref('');
const serverSearch = ref('');
const currentPage = ref(1);
const filters = ref({ status: 'all', start_date: '', end_date: '' });

const handleFilterChange = () => {
    currentPage.value = 1;
};

const isHistoryModalVisible = ref(false);
const selectedHistoryOrderId = ref(null);
const selectedHistoryOrderCode = ref('');

const getHeaders = () => ({
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
});

const { data: queryData, isFetching } = useQuery({
    queryKey: ['admin-orders-history-page', currentPage, serverSearch, filters],
    queryFn: async () => {
        let queryParams = new URLSearchParams({ page: currentPage.value });
        if (serverSearch.value) queryParams.append('search', serverSearch.value);
        if (filters.value.status !== 'all') queryParams.append('status', filters.value.status);
        if (filters.value.start_date) queryParams.append('start_date', filters.value.start_date);
        if (filters.value.end_date) queryParams.append('end_date', filters.value.end_date);
        
        const response = await axios.get(`${API_URL}/admin/orders?${queryParams.toString()}`, { headers: getHeaders() });
        return response.data;
    },
    keepPreviousData: true,
    staleTime: 30000
});

const orders = computed(() => {
    return queryData.value?.data?.data || queryData.value?.data || [];
});

const pagination = computed(() => {
    const result = queryData.value?.data;
    return result?.last_page
        ? { currentPage: result.current_page, lastPage: result.last_page, total: result.total }
        : { currentPage: 1, lastPage: 1, total: 0 };
});

const handleSearch = () => {
    currentPage.value = 1;
    serverSearch.value = searchQuery.value;
};

const handleRefresh = () => {
    queryClient.invalidateQueries(['admin-orders-history-page']);
};

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.lastPage) {
        currentPage.value = page;
    }
};

const openHistoryModal = (orderId, orderCode) => {
    selectedHistoryOrderId.value = orderId;
    selectedHistoryOrderCode.value = orderCode;
    isHistoryModalVisible.value = true;
};

const closeHistoryModal = () => {
    isHistoryModalVisible.value = false;
    selectedHistoryOrderId.value = null;
    selectedHistoryOrderCode.value = '';
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
};

const getOrderStatusClass = (status) => ({
    'pending': 'text-warning border-warning bg-warning bg-opacity-10',
    'confirmed': 'text-info border-info bg-info bg-opacity-10',
    'processing': 'text-primary border-primary bg-primary bg-opacity-10',
    'shipping': 'text-primary border-primary bg-primary bg-opacity-10',
    'delivered': 'text-success border-success bg-success bg-opacity-10',
    'cancelled': 'text-danger border-danger bg-danger bg-opacity-10',
    'returned': 'text-secondary border-secondary bg-secondary bg-opacity-10',
    'return_requested': 'text-danger border-danger bg-danger bg-opacity-10'
}[status] || 'bg-light text-secondary');

const formatOrderStatus = (status) => ({
    'pending': 'Chờ duyệt',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang chuẩn bị',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy',
    'returned': 'Hoàn trả',
    'return_requested': 'Y/C Hoàn trả'
}[status] || status);
</script>

<style scoped>
.responsive-table th {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.action-btn-hover:hover {
    background-color: #009981 !important;
    color: white !important;
}

.page-link:hover {
    background-color: #e9ecef;
}

@media (max-width: 768px) {
    .responsive-table thead {
        display: none;
    }

    .responsive-table tr {
        display: block;
        margin-bottom: 1rem;
        background-color: #fff;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        padding: 0.5rem;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .responsive-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-bottom: 1px solid #e9ecef;
    }

    .responsive-table td:last-child {
        border-bottom: 0;
    }

    .responsive-table td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #6c757d;
        text-transform: uppercase;
        font-size: 0.75rem;
        margin-right: 1rem;
    }
}
</style>
