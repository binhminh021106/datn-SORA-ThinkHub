<template>
    <div class="news-create-wrapper pb-5 mb-5">
        <div class="container-fluid py-4">
            <form @submit.prevent="handleSave" autocomplete="off">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div class="d-flex align-items-center">
                        <router-link :to="{ name: 'admin-news' }"
                            class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                            style="width: 42px; height: 42px;">
                            <i class="bi bi-arrow-left fw-bold"></i>
                        </router-link>
                        <div>
                            <h3 class="fw-bold text-dark mb-0">Viết Bài Tin Tức Mới</h3>
                            <p class="text-secondary mb-0 small mt-1">Soạn thảo và xuất bản nội dung lên hệ thống.</p>
                        </div>
                    </div>
                    
                    <!-- Các nút tác vụ được đưa lên góc phải -->
                    <div class="d-flex align-items-center gap-2">
                        <button type="button" class="btn btn-light border px-4 py-2 fw-semibold shadow-sm text-nowrap" @click="router.push('/admin/news')">Hủy bỏ</button>
                        <button type="submit" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm text-nowrap" :disabled="isLoading">
                            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                            <i v-else class="bi bi-send-fill me-1"></i> Xuất Bản Bài Viết
                        </button>
                    </div>
                </div>

                <div class="row g-4">
                    <!-- CỘT TRÁI: Nội dung chính -->
                    <div class="col-lg-8">
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-4 text-dark"><i class="bi bi-journal-text text-brand me-2"></i>Nội dung bài viết</h6>
                                
                                <!-- Tiêu đề -->
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark required">Tiêu đề bài viết</label>
                                    <input type="text" class="form-control form-control-lg border rounded-3 bg-white shadow-sm fs-5 fw-bold" 
                                           v-model="formData.title" placeholder="Nhập tiêu đề thật hấp dẫn..." required>
                                </div>

                                <!-- Đường dẫn (Slug) -->
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark">Đường dẫn thân thiện (Slug)</label>
                                    <div class="input-group shadow-sm rounded-3 overflow-hidden border">
                                        <span class="input-group-text bg-light border-0 text-muted">/tin-tuc/</span>
                                        <input type="text" class="form-control border-0 bg-white" v-model="formData.slug" placeholder="tu-dong-tao-tu-tieu-de">
                                    </div>
                                    <small class="text-muted mt-1 d-block">Để trống hệ thống sẽ tự động tạo từ tiêu đề.</small>
                                </div>

                                <!-- Mô tả ngắn -->
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark required">Mô tả ngắn (Excerpt)</label>
                                    <textarea class="form-control border rounded-3 bg-white shadow-sm" rows="3" v-model="formData.excerpt" 
                                              placeholder="Tóm tắt ngắn gọn nội dung bài viết (sẽ hiển thị ở trang chủ và danh sách tin tức)..." required></textarea>
                                </div>

                                <!-- Trình soạn thảo Word (Quill Editor) -->
                                <div class="mb-3">
                                    <label class="form-label fw-semibold text-dark required">Nội dung chi tiết</label>
                                    <div class="editor-container shadow-sm rounded-4">
                                        <QuillEditor theme="snow" toolbar="full" v-model:content="formData.content" contentType="html" placeholder="Bắt đầu soạn thảo nội dung..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CỘT PHẢI: Cài đặt & SEO -->
                    <div class="col-lg-4">
                        
                        <!-- Ảnh đại diện -->
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4 text-center">
                                <h6 class="fw-bold text-start mb-3 text-dark"><i class="bi bi-image text-brand me-2"></i>Ảnh đại diện</h6>
                                <div class="image-upload-box bg-white border border-2 border-dashed border-secondary rounded-4 p-3 position-relative shadow-sm"
                                     @click="triggerFileInput" style="cursor: pointer; min-height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column; transition: 0.3s;">
                                    <img v-if="previewImage" :src="previewImage" class="img-fluid rounded-3 object-fit-cover w-100" style="height: 180px;">
                                    <div v-else class="text-muted">
                                        <i class="bi bi-cloud-arrow-up fs-1 text-brand opacity-50"></i>
                                        <p class="mt-2 mb-0 fw-semibold">Click để chọn ảnh</p>
                                        <small>(Khuyên dùng ảnh tỷ lệ 16:9)</small>
                                    </div>
                                    <!-- Nút xóa ảnh -->
                                    <button v-if="previewImage" type="button" @click.stop="removeImage" 
                                            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow" style="width: 30px; height: 30px; padding: 0;">
                                        <i class="bi bi-x-lg"></i>
                                    </button>
                                </div>
                                <input type="file" class="d-none" ref="fileInput" @change="handleFileChange" accept="image/*">
                            </div>
                        </div>

                        <!-- Cài đặt bài viết -->
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3 text-dark"><i class="bi bi-gear text-brand me-2"></i>Cài đặt chung</h6>
                                
                                <div class="mb-3">
                                    <label class="form-label fw-semibold text-dark text-sm">Trạng thái hiển thị</label>
                                    <select class="form-select border shadow-sm rounded-3 bg-white py-2 fw-medium" v-model="formData.status" :class="getStatusColor(formData.status)">
                                        <option value="published" class="text-success fw-bold">🚀 Xuất bản ngay</option>
                                        <option value="pending" class="text-warning fw-bold">⏳ Đợi duyệt</option>
                                        <option value="draft" class="text-secondary fw-bold">🔒 Lưu nháp (Ẩn)</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold text-dark text-sm">Danh mục</label>
                                    <select class="form-select border shadow-sm rounded-3 bg-white py-2" v-model="formData.category">
                                        <option value="">-- Chọn danh mục --</option>
                                        <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
                                    </select>
                                </div>

                                <div class="mb-0">
                                    <label class="form-label fw-semibold text-dark text-sm required">Bút danh (Tác giả)</label>
                                    <input type="text" class="form-control border shadow-sm rounded-3 bg-white py-2" v-model="formData.author_name" placeholder="Tên tác giả hiển thị..." required>
                                </div>
                            </div>
                        </div>

                        <!-- SEO Meta -->
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4">
                                <h6 class="fw-bold mb-3 text-dark"><i class="bi bi-search text-brand me-2"></i>Tối ưu tìm kiếm (SEO)</h6>
                                
                                <div class="mb-3">
                                    <label class="form-label fw-semibold text-dark text-sm">Meta Title</label>
                                    <input type="text" class="form-control form-control-sm border shadow-sm rounded-3 bg-white py-2" v-model="formData.meta_title" placeholder="Mặc định lấy tiêu đề bài viết...">
                                </div>

                                <div class="mb-0">
                                    <label class="form-label fw-semibold text-dark text-sm">Meta Description</label>
                                    <textarea class="form-control form-control-sm border shadow-sm rounded-3 bg-white py-2" rows="3" v-model="formData.meta_description" placeholder="Mặc định lấy mô tả ngắn..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
// Import bộ soạn thảo Quill chuẩn Word
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

// Khai báo Component name
defineOptions({
    name: 'NewsCreate'
});

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
    return {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(isMultipart ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' })
    };
};

const CATEGORIES = [
    { id: 'tech', name: 'Xu hướng trang sức' },
    { id: 'review', name: 'Bí quyết chọn trang sức' },
    { id: 'tips', name: 'Trang sức theo dịp' },
    { id: 'promo', name: 'Kiến thức đá quý & kim loại' },
    { id: 'other', name: 'Khác' }
];

const currentUser = ref({});
const isLoading = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const previewImage = ref(null);

const formData = reactive({
    title: '', excerpt: '', content: '', slug: '',
    status: 'published', author_name: '', category: '', meta_title: '', meta_description: ''
});

// Lấy thông tin user hiện tại để gán sẵn tên tác giả
const checkAuthState = async () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminData');
    const storedUser = localStorage.getItem('user_info');
    let userData = null;

    try {
        if (storedAdmin) userData = JSON.parse(storedAdmin);
        else if (storedUser) userData = JSON.parse(storedUser);
    } catch (e) { console.error("Parse user error", e); }

    // Nếu có data lưu sẵn thì lấy tên ra luôn
    if (userData) {
        currentUser.value = { ...userData, name: userData.fullname || userData.full_name || userData.name || 'Admin' };
        // Gán tên vào ô Bút danh
        formData.author_name = currentUser.value.name;
        return;
    }

    // Nếu không có, gọi API lấy thông tin mới nhất
    if (token) {
        try {
            const response = await axios.get(`${apiUrl}/user`, { headers: getHeaders() });
            let data = response.data.data && !response.data.id ? response.data.data : response.data;
            currentUser.value = { ...data, name: data.fullname || data.full_name || data.name || 'Admin' };
            localStorage.setItem('adminData', JSON.stringify(currentUser.value));
            
            // Gán tên vào ô Bút danh
            formData.author_name = currentUser.value.name;
        } catch (error) { 
            console.error("Không lấy được thông tin user", error); 
        }
    }
};

const getStatusColor = (status) => {
    if(status === 'published') return 'text-success bg-success bg-opacity-10 border-success';
    if(status === 'pending') return 'text-warning bg-warning bg-opacity-10 border-warning';
    return 'text-secondary bg-secondary bg-opacity-10 border-secondary';
};

// Auto generate Slug từ Title
const createSlug = (str) => {
    if(!str) return '';
    return str.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

watch(() => formData.title, (newVal) => {
    if (!formData.slug || formData.slug === createSlug(newVal.slice(0, -1))) {
        formData.slug = createSlug(newVal);
    }
});

const triggerFileInput = () => fileInput.value.click();

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const removeImage = () => {
    selectedFile.value = null;
    previewImage.value = null;
    if (fileInput.value) fileInput.value.value = '';
};

const handleSave = async () => {
    if (!formData.title || !formData.excerpt || !formData.content || formData.content === '<p><br></p>') {
        return Swal.fire('Cảnh báo', 'Vui lòng nhập đủ Tiêu đề, Mô tả ngắn và Nội dung.', 'warning');
    }

    if (!formData.author_name) {
        return Swal.fire('Cảnh báo', 'Vui lòng nhập tên tác giả.', 'warning');
    }

    isLoading.value = true;
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, formData[key]);
        }
    });

    if (selectedFile.value) submitData.append('image', selectedFile.value);

    try {
        await axios.post(`${apiUrl}/admin/news`, submitData, { headers: getHeaders(true) });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Thêm bài viết thành công!', timer: 1500, showConfirmButton: false });
        router.push('/admin/news');
    } catch (err) {
        console.error('Save error:', err);
        Swal.fire('Lỗi', err.response?.data?.message || 'Không thể lưu bài viết.', 'error');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    checkAuthState(); // Gọi hàm lấy thông tin user để tự động điền Tên tác giả
});
</script>

<style scoped>
.required::after { content: " *"; color: #dc3545; }
.border-dashed { border-style: dashed !important; border-width: 2px !important; border-color: #dee2e6 !important; }

/* Nút & Màu chủ đạo */
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn-brand-solid:disabled { background-color: #a5d6cd !important; cursor: not-allowed; }

.image-upload-box:hover { border-color: #009981 !important; background-color: #f8fcfb !important; }

/* Tùy chỉnh giao diện bộ soạn thảo Quill (Word-like) siêu xịn */
.editor-container {
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #dee2e6;
}
:deep(.ql-toolbar.ql-snow) {
    border: none !important;
    border-bottom: 1px solid #dee2e6 !important;
    border-top-left-radius: 0.75rem;
    border-top-right-radius: 0.75rem;
    background-color: #f8f9fa;
    padding: 12px;
    font-family: inherit;
}
:deep(.ql-container.ql-snow) {
    border: none !important;
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    min-height: 450px;
    font-size: 1.05rem;
    font-family: inherit;
    background-color: #ffffff;
}
:deep(.ql-editor) {
    min-height: 450px;
    padding: 1.5rem;
}
:deep(.ql-editor:focus) {
    outline: none;
}
</style>