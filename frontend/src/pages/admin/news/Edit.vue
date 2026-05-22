<template>
    <div class="news-edit-wrapper pb-5 mb-5">
        <!-- Loading Shimmer lúc tải chi tiết lần đầu -->
        <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
            <h1 class="logo-shimmer mb-3">ThinkHub</h1>
            <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu bài viết...</p>
        </div>

        <div class="container-fluid py-4" v-else>
            <form @submit.prevent="handleSave" autocomplete="off">
                <!-- Header chung 1 hàng -->
                <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div class="d-flex align-items-center">
                        <router-link :to="{ name: 'admin-news' }"
                            class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                            style="width: 42px; height: 42px;">
                            <i class="bi bi-arrow-left fw-bold"></i>
                        </router-link>
                        <div>
                            <h3 class="fw-bold text-dark mb-0">Chỉnh Sửa Bài Viết</h3>
                            <p class="text-secondary mb-0 small mt-1">Cập nhật nội dung cho bài viết #{{ formData.id }}</p>
                        </div>
                    </div>
                    
                    <!-- Các nút tác vụ được đưa lên góc phải -->
                    <div class="d-flex align-items-center gap-2">
                        <button type="button" class="btn btn-light border px-4 py-2 fw-semibold shadow-sm text-nowrap" @click="router.push('/admin/news')">Hủy bỏ</button>
                        <button type="submit" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm text-nowrap" :disabled="isSaving">
                            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                            <i v-else class="bi bi-save-fill me-1"></i> Lưu Thay Đổi
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
                                    <label class="form-label fw-semibold text-dark required">Đường dẫn thân thiện (Slug)</label>
                                    <div class="input-group shadow-sm rounded-3 overflow-hidden border">
                                        <span class="input-group-text bg-light border-0 text-muted">/tin-tuc/</span>
                                        <input type="text" class="form-control border-0 bg-white" v-model="formData.slug" placeholder="tu-dong-tao-tu-tieu-de" required>
                                    </div>
                                </div>

                                <!-- Mô tả ngắn -->
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark required">Mô tả ngắn (Excerpt)</label>
                                    <textarea class="form-control border rounded-3 bg-white shadow-sm" rows="3" v-model="formData.excerpt" 
                                              placeholder="Tóm tắt ngắn gọn nội dung bài viết (sẽ hiển thị ở trang chủ và danh sách tin tức)..." required></textarea>
                                </div>

                                <!-- Trình soạn thảo Quill Editor -->
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
                                    <img :src="previewImage" @error="handleImageError" class="img-fluid rounded-3 object-fit-cover w-100" style="height: 180px;">
                                    <button v-if="hasPreviewImage" type="button" @click.stop="removeImage" 
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
                                        <option value="published" class="text-success fw-bold">Xuất bản ngay</option>
                                        <option value="pending" class="text-warning fw-bold">Đợi duyệt</option>
                                        <option value="draft" class="text-secondary fw-bold">Lưu nháp (Ẩn)</option>
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

                                <div class="mb-3">
                                    <label class="form-label fw-semibold text-dark text-sm">Meta Keywords</label>
                                    <input type="text" class="form-control form-control-sm border shadow-sm rounded-3 bg-white py-2" v-model="formData.meta_keywords" placeholder="Từ khóa cách nhau bằng dấu phẩy...">
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { getFullImage } from '@/composables/useUtilities';
import defaultImage from '../../../assets/images/defaults/placeholder.png';

defineOptions({
    name: 'NewsEdit'
});

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || apiUrl?.replace(/\/api\/?$/, '');
const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

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

const isFirstLoad = ref(true);
const fileInput = ref(null);
const selectedFile = ref(null);
const isRemoveImage = ref(false);
const previewImage = ref(defaultImage);
const hasPreviewImage = computed(() => previewImage.value && previewImage.value !== defaultImage);

const formData = reactive({
    id: null, title: '', excerpt: '', content: '', slug: '',
    status: 'pending', author_name: '', category: '', 
    meta_title: '', meta_description: '', meta_keywords: ''
});

// TANSTACK QUERY: Lấy thông tin bài viết cũ
const { data: newsDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['admin-news-detail', route.params.id],
    queryFn: async () => {
        const res = await axios.get(`${apiUrl}/admin/news/${route.params.id}`, { headers: getHeaders() });
        return res.data.data ? res.data.data : res.data;
    },
    staleTime: 5 * 60 * 1000
});

// Tự động đồng bộ hóa thông tin chi tiết bài viết vào form phản hồi nhanh
watch(newsDetail, (item) => {
    if (item) {
        Object.assign(formData, { ...item, content: item.content || '' });
        if (!formData.category) formData.category = ''; 
        if (item.image_url) {
            previewImage.value = getFullImage(item.image_url);
        } else {
            previewImage.value = defaultImage;
        }
        isFirstLoad.value = false;
    }
}, { immediate: true });

const getStatusColor = (status) => {
    if(status === 'published') return 'text-success bg-success bg-opacity-10 border-success';
    if(status === 'pending') return 'text-warning bg-warning bg-opacity-10 border-warning';
    return 'text-secondary bg-secondary bg-opacity-10 border-secondary';
};

const handleImageError = (e) => {
    e.target.src = defaultImage;
    previewImage.value = defaultImage;
    selectedFile.value = null;
};

const createSlug = (str) => {
    if(!str) return '';
    return str.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ồ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

watch(() => formData.title, (newVal) => {
    if (!formData.slug) {
        formData.slug = createSlug(newVal);
    }
});

const triggerFileInput = () => fileInput.value.click();

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire('Lỗi File', 'Dung lượng tối đa 10MB.', 'error');
            e.target.value = null;
            return;
        }
        selectedFile.value = file;
        isRemoveImage.value = false;
        previewImage.value = URL.createObjectURL(file);
    }
};

const removeImage = () => {
    selectedFile.value = null;
    previewImage.value = defaultImage;
    if (fileInput.value) fileInput.value.value = '';
    isRemoveImage.value = true;
};

// TANSTACK MUTATION: Thực thi lưu bài viết
const { mutate: mutateUpdate, isPending: isSaving } = useMutation({
    mutationFn: async (submitData) => {
        return axios.post(`${apiUrl}/admin/news/${formData.id}`, submitData, { headers: getHeaders(true) });
    },
    onSuccess: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật bài viết thành công!', timer: 1500, showConfirmButton: false });
        queryClient.invalidateQueries({ queryKey: ['admin-news-all'] });
        queryClient.invalidateQueries({ queryKey: ['admin-news-detail', route.params.id] });
        router.push('/admin/news');
    },
    onError: (error) => {
        console.error('Save error:', error);
        if (error.response?.status === 422) {
            const errs = error.response.data.errors;
            let html = '<ul class="mb-0 text-start">' + Object.values(errs).map(e => `<li class="text-danger fw-semibold">${e[0]}</li>`).join('') + '</ul>';
            Swal.fire({ title: 'Dữ liệu không hợp lệ', html: html, icon: 'warning' });
        } else {
            Swal.fire('Lỗi', error.response?.data?.message || 'Không thể cập nhật bài viết.', 'error');
        }
    }
});

const handleSave = () => {
    if (!formData.title || !formData.excerpt || !formData.content || formData.content === '<p><br></p>') {
        return Swal.fire('Cảnh báo', 'Vui lòng nhập đủ Tiêu đề, Mô tả ngắn và Nội dung.', 'warning');
    }

    if (!formData.author_name) {
        return Swal.fire('Cảnh báo', 'Vui lòng nhập tên tác giả.', 'warning');
    }

    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, formData[key]);
        }
    });

    if (selectedFile.value) submitData.append('image', selectedFile.value);
    if (!selectedFile.value && isRemoveImage.value) submitData.append('remove_image', '1');
    
    // Yêu cầu của Laravel khi gửi file qua form edit
    submitData.append('_method', 'PUT');

    mutateUpdate(submitData);
};

onMounted(() => {
    const id = route.params.id;
    if (!id) {
        router.push('/admin/news');
    }
});
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }

.required::after { content: " *"; color: #dc3545; }
.border-dashed { border-style: dashed !important; border-width: 2px !important; border-color: #dee2e6 !important; }

.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn-brand-solid:disabled { background-color: #a5d6cd !important; cursor: not-allowed; }

.image-upload-box:hover { border-color: #009981 !important; background-color: #f8fcfb !important; }

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