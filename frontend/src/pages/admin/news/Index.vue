<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

// ==========================================
// 1. CONFIGURATION & SETUP
// ==========================================
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
const BACKEND_URL = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

const router = useRouter();

// ==========================================
// 2. AUTHENTICATION & HEADERS
// ==========================================
const currentUser = ref({});

const getHeaders = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
    return {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const hasRole = (allowedRoles) => {
    const roleMap = { 1: 'admin', 12: 'staff', 13: 'blogger' };
    const userRoleId = Number(currentUser.value?.role_id);
    const userRoleName = roleMap[userRoleId] || '';

    if (!userRoleName) return false;
    if (userRoleName === 'admin') return true; 
    return allowedRoles.includes(userRoleName);
};

const checkAuthState = async () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
    if (!token) return false;

    const storedAdmin = localStorage.getItem('adminData') || localStorage.getItem('user_info');
    let userData = null;

    try {
        if (storedAdmin) userData = JSON.parse(storedAdmin);
    } catch (e) {
        console.error("Lỗi parse user data:", e);
    }

    if (userData) {
        currentUser.value = { 
            ...userData, 
            role_id: Number(userData.role_id), 
            name: userData.fullname || userData.full_name || userData.name || 'Admin' 
        };
        return true;
    }

    try {
        const response = await axios.get(`${apiUrl}/user`, { headers: getHeaders() });
        let data = response.data?.data && !response.data?.id ? response.data.data : response.data;
        currentUser.value = { 
            ...data, 
            role_id: Number(data.role_id), 
            name: data.fullname || data.full_name || data.name || 'Admin' 
        };
        localStorage.setItem('adminData', JSON.stringify(currentUser.value));
        return true;
    } catch (error) {
        return false;
    }
};

const requireLogin = () => {
    if (!currentUser.value?.id) {
        Swal.fire({ icon: 'error', title: 'Truy cập bị từ chối', text: 'Phiên làm việc hết hạn hoặc chưa đăng nhập.', confirmButtonText: 'Đóng' });
        return false;
    }
    return true;
};

// ==========================================
// 3. STATE MANAGEMENT
// ==========================================
const isFirstLoad = ref(true);
const isLoading = ref(true);
const isSilentLoading = ref(false);
const news = ref([]);
const searchQuery = ref('');
const currentTab = ref('all');
const sortOption = ref('newest');
const currentPage = ref(1);
const itemsPerPage = ref(10); 

// ==========================================
// 4. COMPUTED & WATCHERS
// ==========================================
const statusCounts = computed(() => {
    const list = news.value || [];
    return {
        // Chỉ đếm những bài chưa bị xóa (deleted_at == null)
        all: list.filter(i => !i.deleted_at).length,
        pending: list.filter(i => i.status === 'pending' && !i.deleted_at).length,
        published: list.filter(i => i.status === 'published' && !i.deleted_at).length,
        draft: list.filter(i => i.status === 'draft' && !i.deleted_at).length,
        // Đếm bài đã xóa
        deleted: list.filter(i => i.deleted_at).length
    };
});

const processedNews = computed(() => {
    let result = [...(news.value || [])];

    // Lọc theo Tab Xóa hoặc Tab Thường
    if (currentTab.value === 'deleted') {
        result = result.filter(item => item.deleted_at);
    } else {
        result = result.filter(item => !item.deleted_at);
        if (currentTab.value !== 'all') {
            result = result.filter(item => item.status === currentTab.value);
        }
    }

    // Lọc theo từ khóa tìm kiếm
    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
        result = result.filter(item => item.title?.toLowerCase().includes(query));
    }
    
    // Sắp xếp
    result.sort((a, b) => {
        if (sortOption.value === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortOption.value === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortOption.value === 'a-z') return (a.title || '').localeCompare(b.title || '');
        if (sortOption.value === 'z-a') return (b.title || '').localeCompare(a.title || '');
        return 0;
    });

    return result;
});

const totalPages = computed(() => Math.ceil(processedNews.value.length / itemsPerPage.value) || 1);

const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    if (start >= processedNews.value.length && currentPage.value > 1) {
        currentPage.value = 1;
        return processedNews.value.slice(0, itemsPerPage.value);
    }
    return processedNews.value.slice(start, start + itemsPerPage.value);
});

watch([searchQuery, currentTab, sortOption], () => {
    currentPage.value = 1;
});

// ==========================================
// 5. HELPER FUNCTIONS
// ==========================================
const getFullImage = (path) => {
    if (!path) return 'https://placehold.co/800x400?text=No+Image';
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
    });
};

const getDisplayAuthor = (item) => item?.author_name || 'Không rõ';

const getStatusInfo = (status) => {
    const map = {
        'published': { text: 'Xuất bản', class: 'bg-success bg-opacity-10 text-success border border-success', icon: 'bi-check-circle-fill' },
        'pending': { text: 'Đợi duyệt', class: 'bg-warning bg-opacity-10 text-warning border border-warning', icon: 'bi-hourglass-split' },
        'draft': { text: 'Đã ẩn', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', icon: 'bi-eye-slash-fill' }
    };
    return map[status] || { text: 'Không rõ', class: 'bg-light text-dark', icon: 'bi-question-circle' };
};

const switchTab = (tabId) => { 
    currentTab.value = tabId; 
    currentPage.value = 1; 
};

// ==========================================
// 6. NAVIGATION & ACTIONS
// ==========================================
const goToCreate = () => router.push('/admin/news/create');
const goToEdit = (id) => router.push(`/admin/news/edit/${id}`);
const viewOnFrontend = (slug) => {
    if (slug) window.open(`${FRONTEND_URL}/tin-tuc/${slug}`, '_blank');
    else Swal.fire('Lỗi', 'Bài viết chưa có đường dẫn.', 'error');
};

async function fetchNews(silent = false) {
    if (silent) isSilentLoading.value = true;
    else isLoading.value = true;

    try {
        const response = await axios.get(`${apiUrl}/admin/news`, { headers: getHeaders() });
        news.value = response.data?.data || response.data || [];
    } catch (error) {
        if (error.response?.status === 401) {
            Swal.fire('Hết phiên', 'Vui lòng đăng nhập lại.', 'warning');
        } else {
            Swal.fire('Lỗi', 'Không thể tải danh sách tin tức.', 'error');
        }
    } finally {
        isLoading.value = false;
        isSilentLoading.value = false;
        isFirstLoad.value = false;
    }
}

async function handleToggleStatus(newsItem) {
    if (!requireLogin()) return;
    
    if (!hasRole(['admin'])) {
        return Swal.fire('Quyền hạn', 'Bạn không có quyền duyệt bài viết này.', 'warning');
    }

    const newStatus = (newsItem.status === 'published') ? 'draft' : 'published';
    const actionName = newStatus === 'published' ? 'XUẤT BẢN' : 'ẨN BÀI VIẾT';
    
    const result = await Swal.fire({ 
        title: 'Thay đổi trạng thái?', 
        text: `Bạn có muốn ${actionName} bài viết này?`, 
        icon: 'question', 
        showCancelButton: true, 
        confirmButtonColor: '#009981',
        confirmButtonText: 'Đồng ý', 
        cancelButtonText: 'Hủy' 
    });

    if (result.isConfirmed) {
        isSilentLoading.value = true;
        try {
            await axios.patch(`${apiUrl}/admin/news/${newsItem.id}`, { status: newStatus }, { headers: getHeaders() });
            newsItem.status = newStatus;
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', timer: 1500, showConfirmButton: false });
        } catch (e) { 
            Swal.fire('Lỗi', 'Không thể cập nhật trạng thái.', 'error'); 
        } finally {
            isSilentLoading.value = false;
        }
    }
}

async function handleDelete(newsItem) {
    if (!requireLogin()) return;
    
    const isAuthor = newsItem.author_name === currentUser.value.name;
    if (!hasRole(['admin']) && !isAuthor) {
        return Swal.fire('Quyền hạn', 'Bạn không có quyền xóa bài viết này.', 'error');
    }

    const result = await Swal.fire({ 
        title: 'Xóa bài viết?', 
        text: `Bài viết "${newsItem.title}" sẽ được đưa vào thùng rác. Bạn có thể khôi phục sau.`, 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#d33', 
        confirmButtonText: 'Xóa ngay', 
        cancelButtonText: 'Hủy' 
    });

    if (result.isConfirmed) {
        isSilentLoading.value = true;
        try {
            await axios.delete(`${apiUrl}/admin/news/${newsItem.id}`, { headers: getHeaders() });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã đưa vào thùng rác', showConfirmButton: false, timer: 1500 });
            fetchNews(true); // Cập nhật lại list sau khi xóa (bài viết sẽ chuyển sang tab Đã xóa)
        } catch (e) { 
            Swal.fire('Lỗi', 'Không thể xóa bài viết.', 'error'); 
            isSilentLoading.value = false;
        }
    }
}

async function handleRestore(newsItem) {
    if (!requireLogin()) return;
    
    if (!hasRole(['admin'])) {
        return Swal.fire('Quyền hạn', 'Bạn không có quyền khôi phục bài viết này.', 'error');
    }

    const result = await Swal.fire({ 
        title: 'Khôi phục bài viết?', 
        text: `Khôi phục bài viết "${newsItem.title}" về danh sách hiển thị?`, 
        icon: 'info', 
        showCancelButton: true, 
        confirmButtonColor: '#009981', 
        confirmButtonText: 'Đồng ý', 
        cancelButtonText: 'Hủy' 
    });

    if (result.isConfirmed) {
        isSilentLoading.value = true;
        try {
            await axios.post(`${apiUrl}/admin/news/${newsItem.id}/restore`, {}, { headers: getHeaders() });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã khôi phục thành công', showConfirmButton: false, timer: 1500 });
            fetchNews(true);
        } catch (e) { 
            Swal.fire('Lỗi', 'Không thể khôi phục bài viết.', 'error'); 
            isSilentLoading.value = false;
        }
    }
}

// ==========================================
// 7. LIFECYCLE HOOKS
// ==========================================
onMounted(async () => {
    const isAuthenticated = await checkAuthState();
    if (!isAuthenticated) {
        isFirstLoad.value = false;
        isLoading.value = false;
        requireLogin(); 
        return;
    }
    fetchNews();
});
</script>

<template>
    <div class="news-index-wrapper pb-5 mb-5">
        
        <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
            <h1 class="logo-shimmer mb-3">ThinkHub</h1>
            <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải tin tức...</p>
        </div>

        <div class="container-fluid py-4" v-else>
            <div class="row mb-4 align-items-center">
                <div class="col-md-6">
                    <h3 class="fw-bold text-dark mb-0">Quản lý Tin tức</h3>
                </div>
                <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3">
                    <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="fetchNews(true)">
                        <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
                    </button>
                    <button @click="goToCreate" class="btn btn-brand px-4 py-2 fw-bold shadow-sm text-white rounded-pill">
                        <i class="bi bi-plus-circle me-1"></i> Viết bài mới
                    </button>
                </div>
            </div>

            <!-- Tabs Navigation Đồng Bộ (Cho phép rớt dòng & Thêm tab Đã xóa) -->
            <div class="mb-3">
                <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
                    <li class="nav-item">
                        <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': currentTab === 'all' }" @click.prevent="switchTab('all')">
                            <i class="bi bi-grid-fill me-2"></i> Tất cả
                            <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': currentTab === 'all'}">{{ statusCounts.all }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': currentTab === 'published' }" @click.prevent="switchTab('published')">
                            <i class="bi bi-check-circle-fill me-2 text-success"></i> Đã xuất bản
                            <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': currentTab === 'published'}">{{ statusCounts.published }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': currentTab === 'pending' }" @click.prevent="switchTab('pending')">
                            <i class="bi bi-hourglass-split me-2 text-warning"></i> Đợi duyệt
                            <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': currentTab === 'pending'}">{{ statusCounts.pending }}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': currentTab === 'draft' }" @click.prevent="switchTab('draft')">
                            <i class="bi bi-eye-slash-fill me-2 text-secondary"></i> Đã ẩn
                            <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': currentTab === 'draft'}">{{ statusCounts.draft }}</span>
                        </a>
                    </li>
                    
                    <!-- TAB ĐÃ XÓA nằm góc phải giống hệt màn hình Trang sức -->
                    <li class="nav-item ms-auto">
                        <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" href="#" :class="{ 'active-tab': currentTab === 'deleted' }" @click.prevent="switchTab('deleted')">
                            <i class="bi bi-trash3-fill me-2"></i> Đã xóa
                            <span class="badge ms-2 rounded-pill bg-danger text-white">{{ statusCounts.deleted }}</span>
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Filter (Sắp xếp) -->
            <div class="d-flex flex-wrap gap-3 mb-4">
                <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
                    <span class="text-muted small fw-semibold me-2"><i class="bi bi-sort-down text-brand"></i> Sắp xếp:</span>
                    <select class="form-select form-select-sm border-0 bg-transparent fw-bold p-0 pe-4 cursor-pointer" style="width: auto; box-shadow: none;" v-model="sortOption">
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="a-z">Tên (A-Z)</option>
                        <option value="z-a">Tên (Z-A)</option>
                    </select>
                </div>
            </div>

            <!-- Bảng danh sách -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
                <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
                        <i class="bi bi-newspaper me-2"></i>Danh sách Bài viết
                        <div v-if="isSilentLoading || isLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></div>
                    </h6>
                    <div class="search-box position-relative" style="width: 300px; max-width: 100%;">
                        <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0" v-model="searchQuery" @input="currentPage = 1" placeholder="Tìm tên bài viết...">
                        <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                    </div>
                </div>
                
                <div class="card-body p-0 mt-2">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1100px;">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 px-4 text-secondary border-0" style="width: 30%;">Thông tin bài viết</th>
                                    <th class="py-3 px-4 text-secondary border-0" style="width: 15%;">Tác giả</th>
                                    <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 10%;">Lượt xem</th>
                                    <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Trạng thái</th>
                                    <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 12%;">Ngày tạo</th>
                                    <th class="py-3 px-4 text-secondary text-end border-0" style="width: 18%;">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody :class="{'pe-none': isSilentLoading}">
                                <tr v-if="paginatedNews.length === 0 && !isSilentLoading && !isLoading">
                                    <td colspan="6" class="text-center py-5 text-muted">
                                        <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                                    </td>
                                </tr>
                                
                                <!-- Làm mờ dòng nếu bị xóa mềm (deleted_at) -->
                                <tr v-else v-for="item in paginatedNews" :key="item.id" 
                                    :class="{'bg-warning bg-opacity-10': item.status === 'pending' && !item.deleted_at, 'bg-light opacity-75': item.deleted_at}">
                                    
                                    <td class="px-4 py-3">
                                        <div class="d-flex align-items-center">
                                            <div class="position-relative d-inline-block me-3 shadow-sm border rounded-3 overflow-hidden bg-white flex-shrink-0" style="width: 80px; height: 50px;">
                                                <img :src="getFullImage(item.image_url)" class="w-100 h-100 object-fit-cover" :alt="item.title" onerror="this.src='https://placehold.co/80x50?text=Img'">
                                            </div>
                                            <div class="overflow-hidden">
                                                <div class="d-flex align-items-center gap-2 mb-1">
                                                    <span class="badge bg-light text-secondary border" v-if="item.category">{{ item.category }}</span>
                                                    <span class="text-muted small">#{{ item.id }}</span>
                                                </div>
                                                <div class="fw-bold text-dark fs-6 mb-1 text-truncate" :title="item.title">
                                                    {{ item.title }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td class="px-4">
                                        <div class="d-flex align-items-center">
                                            <div class="avatar-circle text-white fw-bold me-2 shadow-sm flex-shrink-0" style="background-color: #009981;">
                                                {{ getDisplayAuthor(item).charAt(0).toUpperCase() }}
                                            </div>
                                            <span class="fw-medium text-truncate" style="max-width: 120px;" :title="getDisplayAuthor(item)">{{ getDisplayAuthor(item) }}</span>
                                        </div>
                                    </td>

                                    <td class="px-4 text-center fw-bold text-secondary">
                                        <i class="bi bi-eye me-1"></i> {{ item.views || 0 }}
                                    </td>

                                    <td class="px-4 text-center">
                                        <!-- Hiển thị badge Đã Xóa thay vì trạng thái bình thường -->
                                        <span v-if="item.deleted_at" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-3 py-2 rounded-pill fw-medium">
                                            <i class="bi bi-trash3-fill me-1"></i> Đã xóa
                                        </span>
                                        <span v-else class="badge px-3 py-2 rounded-pill fw-medium" :class="getStatusInfo(item.status).class">
                                            <i class="bi me-1" :class="getStatusInfo(item.status).icon"></i>{{ getStatusInfo(item.status).text }}
                                        </span>
                                    </td>

                                    <td class="px-4 text-center small text-secondary fw-medium">
                                        {{ getFormattedDate(item.created_at) }}
                                    </td>

                                    <td class="px-4 text-end">
                                        <div class="d-flex justify-content-end align-items-center gap-2">
                                            <!-- Thao tác hiển thị khi BÀI VIẾT BÌNH THƯỜNG -->
                                            <template v-if="!item.deleted_at">
                                                <div class="form-check form-switch m-0 d-flex align-items-center me-1" v-if="hasRole(['admin'])" title="Đổi trạng thái xuất bản/ẩn">
                                                    <input class="form-check-input custom-switch" type="checkbox" role="switch" :checked="item.status === 'published'" @click.prevent="handleToggleStatus(item)">
                                                </div>
                                                
                                                <button class="btn btn-sm btn-light text-info shadow-sm border" @click="viewOnFrontend(item.slug)" title="Xem bài viết">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-light text-primary shadow-sm border" @click="goToEdit(item.id)" title="Chỉnh sửa">
                                                    <i class="bi bi-pencil-square"></i>
                                                </button>
                                                <button class="btn btn-sm btn-light text-danger shadow-sm border" v-if="hasRole(['admin']) || item.author_name === currentUser.name" @click="handleDelete(item)" title="Xóa bài">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </template>

                                            <!-- Thao tác hiển thị khi BÀI VIẾT ĐÃ XÓA MỀM (Thùng rác) -->
                                            <template v-else>
                                                <button class="btn btn-sm btn-light text-info shadow-sm border" @click="viewOnFrontend(item.slug)" title="Xem bài viết đã xóa">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-light text-success shadow-sm border" v-if="hasRole(['admin']) || item.author_name === currentUser.name" @click="handleRestore(item)" title="Khôi phục">
                                                    <i class="bi bi-arrow-counterclockwise"></i>
                                                </button>
                                            </template>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="totalPages > 1 && !isLoading">
                <span class="text-muted small">Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, processedNews.length) }}</span>
                <nav>
                    <ul class="pagination pagination-sm mb-0 shadow-sm">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link text-brand" @click="currentPage--"><i class="bi bi-chevron-left"></i></button>
                        </li>
                        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                            <button class="page-link" :class="currentPage === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="currentPage = page">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <button class="page-link text-brand" @click="currentPage++"><i class="bi bi-chevron-right"></i></button>
                        </li>
                    </ul>
                </nav>
            </div>
            
        </div>
    </div>
</template>

<style scoped>
/* Đồng bộ màu sắc chủ đạo */
.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }

/* Tabs đồng bộ */
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }

.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

/* Switch của Admin */
.custom-switch { cursor: pointer; width: 2.5em; height: 1.25em; }
.custom-switch:checked { background-color: #009981; border-color: #009981; }

/* Avatar tác giả */
.avatar-circle {
    width: 30px; 
    height: 30px; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 0.8rem; 
}

/* Hiệu ứng loading shimmer */
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
@keyframes shine { to { background-position: 200% center; } }
</style>