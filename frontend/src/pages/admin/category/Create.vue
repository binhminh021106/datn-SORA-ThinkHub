<template>
    <div class="category-create-wrapper">
        <div class="container-fluid py-4">
            <div class="d-flex align-items-center mb-4">
                <router-link :to="{ name: 'admin-categories' }"
                    class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 40px; height: 40px;">
                    <i class="bi bi-arrow-left fw-bold"></i>
                </router-link>
                <div>
                    <h3 class="fw-bold text-dark mb-0">Thêm Danh Mục Gốc</h3>
                    <p class="text-muted mb-0 small">Phân loại sản phẩm cho hệ thống cửa hàng</p>
                </div>
            </div>

            <form @submit.prevent="saveCategory" autocomplete="off">
                <div class="row g-4">
                    <!-- Cột Trái: Thumbnail & Trạng thái -->
                    <div class="col-md-4 col-lg-3">
                        <div class="card border-0 shadow-sm rounded-4 text-center p-4 h-100">
                            <label class="form-label fw-bold mb-3">Ảnh đại diện</label>
                            <div class="position-relative d-inline-block mx-auto mb-4 w-100">
                                <img :src="previewImage"
                                    class="rounded-4 shadow-sm border border-2 border-light object-fit-cover w-100"
                                    style="height: 200px;" alt="Thumbnail">
                                <label for="imageUpload"
                                    class="position-absolute bottom-0 end-0 bg-brand rounded-circle shadow-sm p-2 text-white m-2"
                                    style="cursor: pointer;">
                                    <i class="bi bi-camera-fill fs-6"></i>
                                </label>
                                <input type="file" id="imageUpload" class="d-none" accept="image/png, image/jpeg, image/webp"
                                    @change="handleImageChange">
                            </div>

                            <div class="mb-3 text-start">
                                <label class="form-label fw-bold">Trạng thái <span class="text-danger">*</span></label>
                                <select class="form-select" v-model="form.status" :class="{'is-invalid': errors.status}">
                                    <option value="active">Hiển thị (Active)</option>
                                    <option value="hidden">Ẩn (Hidden)</option>
                                </select>
                                <div class="invalid-feedback">{{ errors.status?.[0] }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Cột Phải: Thông tin chi tiết -->
                    <div class="col-md-8 col-lg-9">
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4">
                                <h5 class="fw-bold mb-4 text-brand"><i class="bi bi-info-square-fill me-2"></i>Thông tin danh mục</h5>
                                
                                <div class="alert alert-danger d-flex align-items-center mb-4" role="alert" v-if="Object.keys(errors).length > 0">
                                    <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                                    <div>Vui lòng kiểm tra lại các trường bị báo đỏ bên dưới.</div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Tên danh mục <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" v-model="form.name" :class="{'is-invalid': errors.name || errors.slug}"
                                            placeholder="VD: Nhẫn Kim Cương" @input="generateSlug">
                                        <div class="invalid-feedback d-block" v-if="errors.name || errors.slug">
                                            {{ errors.name?.[0] }} <br v-if="errors.name && errors.slug" /> {{ errors.slug?.[0] }}
                                        </div>
                                        <small class="text-muted fst-italic mt-1 d-block" v-if="!errors.name && !errors.slug">Đường dẫn (Slug) tự động tạo.</small>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Danh mục cha</label>
                                        <select class="form-select" v-model="form.parent_id" :class="{'is-invalid': errors.parent_id}">
                                            <option :value="null">-- Là Danh Mục Gốc --</option>
                                            <option v-for="cat in treeCategories" :key="cat.id" :value="cat.id">
                                                {{ cat.name }}
                                            </option>
                                        </select>
                                        <div class="invalid-feedback">{{ errors.parent_id?.[0] }}</div>
                                    </div>

                                    <!-- Thêm trường Thứ tự hiển thị -->
                                    <div class="col-md-12 mb-3">
                                        <label class="form-label fw-bold">Thứ tự ưu tiên</label>
                                        <input type="number" class="form-control" v-model="form.sort_order" :class="{'is-invalid': errors.sort_order}" min="0" placeholder="VD: 0, 1, 2...">
                                        <div class="invalid-feedback">{{ errors.sort_order?.[0] }}</div>
                                        <small class="text-muted fst-italic mt-1 d-block">Nhỏ hiển thị trước. Mặc định: 0.</small>
                                    </div>

                                    <div class="col-12 mb-3">
                                        <label class="form-label fw-bold">Mô tả chi tiết</label>
                                        <textarea class="form-control" v-model="form.description" rows="3" placeholder="Nhập mô tả cho danh mục này..." :class="{'is-invalid': errors.description}"></textarea>
                                        <div class="invalid-feedback">{{ errors.description?.[0] }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quản lý Attributes Schema -->
                        <div class="card border-0 shadow-sm rounded-4">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="fw-bold mb-0 text-brand"><i class="bi bi-tags-fill me-2"></i>Định nghĩa Thuộc tính</h5>
                                    <button type="button" class="btn btn-sm btn-outline-brand rounded-pill px-3" @click="addAttribute">
                                        <i class="bi bi-plus-lg"></i> Thêm thuộc tính
                                    </button>
                                </div>
                                <p class="text-muted small mb-4">Ví dụ: Size nhẫn, Chất liệu vàng. Áp dụng cho tất cả sản phẩm thuộc danh mục.</p>
                                
                                <div v-if="form.attributes_schema.length === 0" class="text-center p-4 bg-light rounded-3 border-dashed border-secondary-subtle">
                                    <span class="text-muted">Chưa có thuộc tính nào được định nghĩa.</span>
                                </div>

                                <div class="row g-2 mb-3" v-for="(attr, index) in form.attributes_schema" :key="index">
                                    <div class="col-10 col-md-11">
                                        <input type="text" class="form-control bg-light" v-model="form.attributes_schema[index]" placeholder="Nhập tên thuộc tính (VD: Màu sắc)">
                                    </div>
                                    <div class="col-2 col-md-1 text-end">
                                        <button type="button" class="btn btn-danger text-white w-100" @click="removeAttribute(index)" title="Xóa">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <hr class="text-muted opacity-25 my-4">
                                <div class="text-end">
                                    <router-link :to="{ name: 'admin-categories' }"
                                        class="btn btn-light me-2 px-4 shadow-sm fw-bold">Hủy</router-link>
                                    <button type="submit" class="btn btn-brand btn-brand-solid px-5 fw-bold shadow-sm"
                                        :disabled="isSaving">
                                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> 
                                        {{ isSaving ? 'ĐANG LƯU...' : 'XÁC NHẬN THÊM' }}
                                    </button>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import defaultImage from '../../../assets/images/defaults/placeholder.png';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const isSaving = ref(false);
const previewImage = ref(defaultImage);
const selectedFile = ref(null);
const errors = ref({});
const treeCategories = ref([]);

const form = ref({
    name: '', parent_id: null, description: '', status: 'active', sort_order: 0, attributes_schema: [] 
});

const getHeaders = () => ({ 
    'Accept': 'application/json', 
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
});

const fetchTreeCategories = async () => {
    try {
        const res = await axios.get(`${API_URL}/admin/categories/tree`, { headers: getHeaders() });
        treeCategories.value = res.data.data;
    } catch (e) {
        console.error("Lỗi lấy danh mục cha:", e);
    }
};

const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 15 * 1024 * 1024) { 
            Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error'); 
            return; 
        }
        selectedFile.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const addAttribute = () => { form.value.attributes_schema.push(''); };
const removeAttribute = (index) => { form.value.attributes_schema.splice(index, 1); };

const generateSlug = () => {
    let slug = form.value.name.toLowerCase();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    slug = slug.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-\-+/g, '-'); 
    form.value.slug = slug;
};

const saveCategory = async () => {
    form.value.attributes_schema = form.value.attributes_schema.filter(attr => attr.trim() !== '');
    
    isSaving.value = true;
    errors.value = {}; 
    
    const formData = new FormData();
    Object.keys(form.value).forEach(key => {
        if (key === 'attributes_schema') {
            formData.append('attributes_schema', JSON.stringify(form.value.attributes_schema));
        } else if (key === 'parent_id') {
            formData.append('parent_id', form.value[key] === null ? '' : form.value[key]);
        } else if (form.value[key] !== null && form.value[key] !== '') {
            formData.append(key, form.value[key]);
        } else if (key === 'sort_order') {
            formData.append('sort_order', form.value[key]);
        }
    });
    
    if (selectedFile.value) formData.append('thumbnail', selectedFile.value);

    try {
        const res = await axios.post(`${API_URL}/admin/categories`, formData, {
            headers: getHeaders()
        });
        
        Swal.fire({ icon: 'success', title: 'Thành công', text: res.data.message || 'Đã thêm danh mục', timer: 1500, showConfirmButton: false });
        router.push({ name: 'admin-categories' });

    } catch (err) { 
        if (err.response) {
            if (err.response.status === 422) {
                errors.value = err.response.data.errors || {};
                
                let errorHtml = '<ul class="text-start text-danger small mt-2" style="max-height: 200px; overflow-y: auto; padding-left: 20px;">';
                Object.values(errors.value).flat().forEach(msg => {
                    errorHtml += `<li class="mb-1">${msg}</li>`;
                });
                errorHtml += '</ul>';

                Swal.fire({ title: 'Dữ liệu không hợp lệ', html: errorHtml, icon: 'error', confirmButtonColor: '#dc3545' });
            } else if (err.response.status === 401) {
                Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
            } else {
                Swal.fire('Lỗi', err.response.data.message || 'Có lỗi xảy ra', 'error');
            }
        } else {
            Swal.fire('Lỗi', 'Mất kết nối server', 'error'); 
        }
    } finally { 
        isSaving.value = false; 
    }
};

onMounted(() => { fetchTreeCategories(); });
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; transition: all 0.2s ease; border: none; }
.btn-brand-solid:hover { background-color: #007a67 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn-brand-solid:disabled { background-color: #a5d6cd !important; cursor: not-allowed; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; }
.btn-outline-brand:hover { background-color: #009981; color: white;}
.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.border-dashed { border-style: dashed !important; border-width: 2px !important; }
.invalid-feedback { font-size: 0.8rem; font-weight: 500; }
</style>