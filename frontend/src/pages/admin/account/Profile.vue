<template>
    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-12 d-flex align-items-center">
                <div>
                    <h3 class="fw-bold text-dark mb-1">
                        Hồ sơ admin
                    </h3>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <!-- CỘT TRÁI: AVATAR & MENU NAV -->
            <div class="col-md-4 col-lg-3">
                <div class="card border-0 shadow-sm rounded-4 text-center p-4 mb-4">
                    <div class="position-relative d-inline-block mx-auto mb-3">
                        <img :src="previewAvatar || adminData.avatar"
                            class="rounded-circle shadow-sm border border-2 border-white object-fit-cover"
                            style="width: 150px; height: 150px;" alt="Admin Avatar" @error="handleImageError">

                        <label for="avatarUpload"
                            class="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-2 cursor-pointer"
                            style="cursor: pointer; color: #009981;">
                            <i class="bi bi-camera-fill fs-5"></i>
                        </label>
                        <input type="file" id="avatarUpload" class="d-none"
                            accept="image/png, image/jpeg, image/jpg, image/webp" @change="handleAvatarChange">
                    </div>

                    <h5 class="fw-bold mb-1">{{ adminData.fullname }}</h5>
                    <span class="badge mt-1" :class="adminData.status === 'active' ? 'bg-success' : 'bg-danger'">
                        <i class="bi me-1"
                            :class="adminData.status === 'active' ? 'bi-check-circle' : 'bi-lock-fill'"></i>
                        {{ adminData.status === 'active' ? 'Đang hoạt động' : 'Bị khóa' }}
                    </span>

                    <div class="mt-4">
                        <button
                            v-if="previewAvatar || (adminData.avatar && !adminData.avatar.includes('ui-avatars') && !adminData.avatar.includes('avatar1.png'))"
                            @click="removeAvatar" class="btn btn-outline-danger btn-sm rounded-pill w-100 fw-bold">
                            <i class="bi bi-trash me-1"></i> Xóa ảnh hiện tại
                        </button>
                    </div>
                </div>

                <div class="card border-0 shadow-sm rounded-4 p-2">
                    <div class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
                        <button class="nav-link text-start fs-6 py-3 fw-semibold mb-2 custom-tab"
                            :class="{ 'active-tab': activeTab === 'info' }" @click="activeTab = 'info'">
                            <i class="bi bi-person-lines-fill me-2 fs-5 align-middle"></i> Thông tin chung
                        </button>
                        <button class="nav-link text-start fs-6 py-3 fw-semibold custom-tab"
                            :class="{ 'active-tab': activeTab === 'password' }" @click="activeTab = 'password'">
                            <i class="bi bi-shield-lock-fill me-2 fs-5 align-middle"></i> Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </div>

            <!-- CỘT PHẢI: NỘI DUNG -->
            <div class="col-md-8 col-lg-9">
                <div class="card border-0 shadow-sm rounded-4 h-100">
                    <div class="card-body p-4 p-lg-5">

                        <!-- TAB 1: THÔNG TIN CHUNG -->
                        <div v-if="activeTab === 'info'">
                            <h4 class="fw-bold mb-4">Cập nhật thông tin</h4>
                            <form @submit.prevent="updateProfile">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-semibold">Họ và tên <span
                                                class="text-danger">*</span></label>
                                        <input type="text" class="form-control form-control-lg fs-6"
                                            v-model="adminData.fullname" required>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-semibold">Số điện thoại <span
                                                class="text-danger">*</span></label>
                                        <input type="tel" class="form-control form-control-lg fs-6"
                                            v-model="adminData.phone" required @input="validatePhone">
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-semibold text-muted">Email đăng nhập</label>
                                        <input type="email" class="form-control bg-light text-muted cursor-not-allowed"
                                            :value="adminData.email" readonly disabled>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-semibold text-muted">Phân quyền</label>
                                        <input type="text" class="form-control bg-light text-muted cursor-not-allowed"
                                            :value="getRoleName(adminData.role_id)" readonly disabled>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-semibold text-muted">Trạng thái tài khoản</label>
                                        <input type="text" class="form-control bg-light text-muted cursor-not-allowed"
                                            :value="adminData.status === 'active' ? 'Hoạt động' : 'Khóa'" readonly
                                            disabled>
                                    </div>

                                    <!-- Địa chỉ hiện tại -->
                                    <div class="col-12 mb-2 mt-2">
                                        <label class="form-label fw-semibold">Địa chỉ hiện tại</label>
                                        <input type="text" class="form-control bg-light text-muted"
                                            :value="adminData.address || 'Chưa có dữ liệu'" readonly disabled>
                                    </div>

                                    <!-- Cập nhật địa chỉ mới -->
                                    <div class="col-12 mb-4">
                                        <label class="form-label fw-semibold">Cập nhật địa chỉ mới <span
                                                class="text-muted fw-normal fs-7">(Tùy chọn)</span></label>
                                        <div class="card border border-light-subtle shadow-none bg-light p-3 rounded-3">
                                            <div class="row g-3">
                                                <div class="col-md-4">
                                                    <select class="form-select" v-model="addressSelector.province">
                                                        <option value="">-- Tỉnh / Thành phố --</option>
                                                        <option v-for="p in provinces" :key="p.code" :value="p.name">{{
                                                            p.name }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-4">
                                                    <select class="form-select" v-model="addressSelector.district"
                                                        :disabled="!addressSelector.province">
                                                        <option value="">-- Quận / Huyện --</option>
                                                        <option v-for="d in availableDistricts" :key="d.code"
                                                            :value="d.name">{{ d.name }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-4">
                                                    <select class="form-select" v-model="addressSelector.ward"
                                                        :disabled="!addressSelector.district">
                                                        <option value="">-- Phường / Xã --</option>
                                                        <option v-for="w in availableWards" :key="w.code"
                                                            :value="w.name">{{ w.name }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-12">
                                                    <input type="text" class="form-control"
                                                        v-model="addressSelector.street"
                                                        placeholder="Số nhà, tên đường (Ví dụ: 123 Đường Ngọc Hồi)">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="text-end mt-4 pt-3 border-top">
                                    <button type="submit" class="btn btn-brand px-5 py-2 fw-bold text-white shadow-sm"
                                        :disabled="isLoading">
                                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- TAB 2: ĐỔI MẬT KHẨU (ĐÃ FIX LAYOUT TRẢI ĐỀU 2 CỘT) -->
                        <div v-if="activeTab === 'password'">
                            <h4 class="fw-bold mb-4">Đổi mật khẩu</h4>
                            <form @submit.prevent="updatePassword">

                                <div
                                    class="alert alert-warning border-0 bg-warning bg-opacity-10 text-dark mb-4 rounded-3 d-flex align-items-center">
                                    <i class="bi bi-shield-lock-fill me-3 text-warning fs-3"></i>
                                    <div>
                                        <strong>Yêu cầu bảo mật:</strong> Mật khẩu phải có ít nhất 8 ký tự. Nên kết hợp
                                        chữ cái và số để đảm bảo an toàn cho hệ thống.
                                    </div>
                                </div>

                                <!-- Giao diện 2 cột song song -->
                                <div class="row g-4">
                                    <!-- Input Mật khẩu mới -->
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Mật khẩu mới <span
                                                class="text-danger">*</span></label>
                                        <div class="position-relative">
                                            <input :type="showNewPassword ? 'text' : 'password'"
                                                class="form-control form-control-lg fs-6 pe-5"
                                                v-model="passwordForm.new_password" placeholder="Nhập mật khẩu mới"
                                                required minlength="8">
                                            <button type="button"
                                                class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1"
                                                @click="showNewPassword = !showNewPassword">
                                                <i class="bi" :class="showNewPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Input Xác nhận mật khẩu mới -->
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Xác nhận mật khẩu mới <span
                                                class="text-danger">*</span></label>
                                        <div class="position-relative">
                                            <input :type="showConfirmPassword ? 'text' : 'password'"
                                                class="form-control form-control-lg fs-6 pe-5"
                                                v-model="passwordForm.new_password_confirmation"
                                                placeholder="Nhập lại mật khẩu mới" required minlength="8">
                                            <button type="button"
                                                class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1"
                                                @click="showConfirmPassword = !showConfirmPassword">
                                                <i class="bi"
                                                    :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="text-end mt-5 pt-3 border-top">
                                    <button type="submit" class="btn btn-brand px-5 py-2 fw-bold text-white shadow-sm"
                                        :disabled="isLoading">
                                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue';
import Swal from 'sweetalert2';
import { apiClient, getFullImage as getFullImageImported, API_BASE_URL, STORAGE_URL } from '@/utils/axios';
import defaultAvatar from '../../../assets/images/defaults/avatar1.png';

const activeTab = ref('info');
const isLoading = ref(false);

const adminData = ref({
    fullname: '', phone: '', address: '', email: '', role_id: '', status: '', avatar: defaultAvatar
});

const passwordForm = ref({ new_password: '', new_password_confirmation: '' });
const selectedFile = ref(null);
const previewAvatar = ref(null);
const isRemoveAvatar = ref(false);

const handleAxiosError = (e, defaultMsg = 'Lỗi hệ thống') => {
    if (e.response) {
        if (e.response.status === 422) {
            let errorHtml = '<ul class="text-start text-danger small mt-2" style="max-height: 200px; overflow-y: auto; padding-left: 20px;">';
            Object.values(e.response.data.errors).flat().forEach(msg => {
                errorHtml += `<li class="mb-1">${msg}</li>`;
            });
            errorHtml += '</ul>';
            Swal.fire({ title: 'Dữ liệu không hợp lệ', html: errorHtml, icon: 'error', confirmButtonColor: '#dc3545' });
        } else if (e.response.status === 401) {
            Swal.fire('Lỗi xác thực', 'Phiên đăng nhập đã hết hạn!', 'error');
        } else {
            Swal.fire('Lỗi', e.response.data.message || defaultMsg, 'error');
        }
    } else {
        Swal.fire('Lỗi', 'Mất kết nối Server', 'error');
    }
};

const handleImageError = (e) => { e.target.src = defaultAvatar; };

const provinces = ref([]);
const addressSelector = ref({ province: '', district: '', ward: '', street: '' });

const fetchProvinces = async () => {
    try {
        // Dùng fetch thay vì axios để tránh lỗi dính Header Auth/CORS
        const response = await fetch('https://provinces.open-api.vn/api/?depth=3');
        
        if (!response.ok) {
            throw new Error('Lỗi lấy dữ liệu từ API mở');
        }
        
        const data = await response.json();
        provinces.value = data;
    } catch (error) {
        console.error("Lỗi tải dữ liệu địa chỉ:", error);
    }
};

const availableDistricts = computed(() => {
    const p = provinces.value.find(x => x.name === addressSelector.value.province);
    return p ? p.districts : [];
});

const availableWards = computed(() => {
    const d = availableDistricts.value.find(x => x.name === addressSelector.value.district);
    return d ? d.wards : [];
});

watch(() => addressSelector.value.province, () => {
    addressSelector.value.district = ''; addressSelector.value.ward = '';
});
watch(() => addressSelector.value.district, () => {
    addressSelector.value.ward = '';
});

const validatePhone = (e) => {
    adminData.value.phone = e.target.value.replace(/\D/g, '').slice(0, 11);
};

const getRoleName = (id) => {
    return id == 1 ? 'Super Admin' : (id == 2 ? 'Quản lý' : 'Nhân viên');
};

onMounted(() => {
    fetchProvinces();
    const savedInfo = localStorage.getItem('admin_info');
    if (savedInfo) {
        const data = JSON.parse(savedInfo);
        adminData.value = {
            ...data,
            avatar: data.avatar_url ? getFullImageImported(data.avatar_url) : defaultAvatar
        };
    }
});

const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            Swal.fire('Lỗi', 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)', 'error'); return;
        }
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire('Lỗi', 'Dung lượng tối đa 2MB', 'error'); return;
        }
        selectedFile.value = file;
        previewAvatar.value = URL.createObjectURL(file);
        isRemoveAvatar.value = false;
    }
};

const removeAvatar = () => {
    selectedFile.value = null;
    previewAvatar.value = defaultAvatar;
    isRemoveAvatar.value = true;
    document.getElementById('avatarUpload').value = '';
};

const updateProfile = async () => {
    isLoading.value = true;

    let finalAddress = adminData.value.address;
    if (addressSelector.value.province && addressSelector.value.district && addressSelector.value.ward) {
        const streetPart = addressSelector.value.street ? `${addressSelector.value.street}, ` : '';
        finalAddress = `${streetPart}${addressSelector.value.ward}, ${addressSelector.value.district}, ${addressSelector.value.province}`;
    }

    const formData = new FormData();
    formData.append('fullname', adminData.value.fullname);
    formData.append('phone', adminData.value.phone);
    if (finalAddress) formData.append('address', finalAddress);
    if (selectedFile.value) formData.append('avatar', selectedFile.value);
    if (isRemoveAvatar.value) formData.append('remove_avatar', true);

    try {
        const res = await apiClient.post('/admin/profile', formData);
        const updatedData = res.data.data;

        localStorage.setItem('admin_info', JSON.stringify(updatedData));

        if (currentUser) {
            currentUser.value = updatedData;
        }

        adminData.value.avatar = updatedData.avatar_url ? getFullImageImported(updatedData.avatar_url) : defaultAvatar;
        adminData.value.address = updatedData.address;

        previewAvatar.value = null;
        selectedFile.value = null;
        isRemoveAvatar.value = false;

        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã cập nhật hồ sơ.', confirmButtonColor: '#009981' });

    } catch (error) {
        handleAxiosError(error, 'Cập nhật thất bại');
    } finally {
        isLoading.value = false;
    }
};

const updatePassword = async () => {
    if (passwordForm.value.new_password.length < 8) {
        Swal.fire('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự!', 'warning'); return;
    }
    if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
        Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'warning'); return;
    }

    isLoading.value = true;
    try {
        const res = await apiClient.put('/admin/profile/password', passwordForm.value);

        Swal.fire({ icon: 'success', title: 'Thành công', text: res.data.message || 'Mật khẩu đã được đổi. Vui lòng đăng nhập lại.', confirmButtonColor: '#009981' })
            .then(() => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_info');
                localStorage.removeItem('admin_level');
                window.location.href = '/admin/login';
            });
    } catch (error) {
        handleAxiosError(error, 'Đổi mật khẩu thất bại');
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.bg-brand {
    background-color: #009981 !important;
}

.text-brand {
    color: #009981 !important;
}

.btn-brand {
    background-color: #009981;
    border: none;
    transition: 0.2s;
}

.btn-brand:hover {
    background-color: #007a67;
}

.custom-tab {
    color: #495057;
    border-radius: 10px;
    transition: all 0.2s ease-in-out;
}

.custom-tab:hover {
    background-color: #f8f9fa;
    color: #009981;
}

.active-tab {
    background-color: #009981 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 6px rgba(0, 153, 129, 0.2);
}

.form-control:focus,
.form-select:focus {
    border-color: #009981;
    box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25);
}

.cursor-not-allowed {
    cursor: not-allowed;
    opacity: 0.8;
}

.cursor-pointer {
    cursor: pointer;
}

.cursor-pointer:hover {
    background-color: #f8f9fa !important;
    transform: scale(1.05);
    transition: 0.2s;
}

.fs-7 {
    font-size: 0.85rem;
}
</style>