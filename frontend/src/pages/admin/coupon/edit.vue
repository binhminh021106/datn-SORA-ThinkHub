<template>
    <div class="coupon-edit-wrapper">
        <div class="container-fluid py-4" v-if="isLoaded">
            <div class="d-flex align-items-center mb-4">
                <router-link :to="{ name: 'admin-coupons' }"
                    class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 40px; height: 40px;">
                    <i class="bi bi-arrow-left fw-bold"></i>
                </router-link>
                <div>
                    <h3 class="fw-bold text-dark mb-0">Cập Nhật Mã Giảm Giá</h3>
                    <p class="text-muted mb-0 small">Mã: <span class="fw-bold text-brand">{{ form.code }}</span></p>
                </div>
            </div>

            <form @submit.prevent="updateCoupon" autocomplete="off">
                <div class="row g-4">
                    <!-- Cột Trái: Preview Coupon & Trạng thái -->
                    <div class="col-md-4 col-lg-3">
                        <div class="card border-0 shadow-sm rounded-4 text-center p-4 h-100 position-sticky" style="top: 20px;">
                            <label class="form-label fw-bold mb-3 text-brand">Trực Quan VOUCHER</label>
                            
                            <!-- Thẻ Ticket mô phỏng -->
                            <div class="ticket-preview mb-4 bg-light rounded-4 border border-dashed border-2 border-brand p-3 position-relative overflow-hidden">
                                <div class="bg-brand text-white fw-bold py-1 px-3 position-absolute top-0 start-0 w-100 small" style="letter-spacing: 1px;">VOUCHER</div>
                                <div class="mt-4">
                                    <h3 class="fw-bold text-dark text-truncate mb-1">{{ form.type === 'percentage' ? (form.value ? form.value + '%' : '0%') : formatCurrency(form.value) }}</h3>
                                    <p class="small text-muted mb-2 text-truncate">{{ form.name || 'Tên chương trình' }}</p>
                                    <div class="bg-white border border-secondary border-opacity-25 rounded-3 py-2 fw-bold text-brand fs-5" style="letter-spacing: 2px;">
                                        {{ form.code || 'CODE' }}
                                    </div>
                                    <p class="small text-muted mt-2 mb-0" style="font-size: 0.75rem;">Đơn tối thiểu: {{ formatCurrency(form.min_spend) }}</p>
                                </div>
                            </div>

                            <!-- Box Thông kê nhỏ -->
                            <div class="bg-light p-3 rounded-3 mb-4 text-start">
                                <span class="d-block small text-muted fw-bold mb-1"><i class="bi bi-bar-chart-fill me-1"></i> Đã sử dụng</span>
                                <h4 class="fw-bold mb-0">{{ usage_count }} <span class="fs-6 text-muted fw-normal">/ {{ form.usage_limit }} lượt</span></h4>
                            </div>

                            <div class="text-start border-top pt-3 mt-auto">
                                <label class="form-label fw-bold">Cập nhật trạng thái</label>
                                <select class="form-select fw-bold shadow-sm" v-model="form.status" :class="form.status === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-danger border-danger bg-danger bg-opacity-10'">
                                    <option value="active" class="text-success fw-bold">Hoạt động (Active)</option>
                                    <option value="inactive" class="text-danger fw-bold">Tạm dừng (Inactive)</option>
                                </select>
                                <div class="invalid-feedback">{{ errors.status?.[0] }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Cột Phải: Thông tin chi tiết -->
                    <div class="col-md-8 col-lg-9">
                        <div class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-4">
                                <h5 class="fw-bold mb-4 text-brand"><i class="bi bi-info-square-fill me-2"></i>Chi tiết mã giảm giá</h5>
                                
                                <div class="alert alert-danger d-flex align-items-center mb-4" role="alert" v-if="Object.keys(errors).length > 0">
                                    <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                                    <div>Vui lòng kiểm tra lại các trường bị báo đỏ bên dưới.</div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label class="form-label fw-bold">Tên chương trình giảm giá <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" v-model="form.name" :class="{'is-invalid': errors.name}">
                                        <div class="invalid-feedback">{{ errors.name?.[0] }}</div>
                                    </div>
                                    
                                    <div class="col-md-12 mb-4">
                                        <label class="form-label fw-bold">Mã Code <span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="text" class="form-control font-monospace fw-bold text-uppercase text-brand" v-model="form.code" :class="{'is-invalid': errors.code}"
                                                style="letter-spacing: 1px;" @input="form.code = form.code.toUpperCase()">
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.code">{{ errors.code?.[0] }}</div>
                                    </div>

                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Thiết lập Giá trị</h6>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Loại giảm giá <span class="text-danger">*</span></label>
                                        <select class="form-select" v-model="form.type" :class="{'is-invalid': errors.type}">
                                            <option value="fixed">Số tiền cố định (VNĐ)</option>
                                            <option value="percentage">Phần trăm (%)</option>
                                        </select>
                                        <div class="invalid-feedback">{{ errors.type?.[0] }}</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Giá trị giảm <span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" v-model="form.value" :class="{'is-invalid': errors.value}" min="1">
                                            <span class="input-group-text bg-light fw-bold">{{ form.type === 'percentage' ? '%' : 'VNĐ' }}</span>
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.value">{{ errors.value?.[0] }}</div>
                                    </div>

                                    <div class="col-md-12 mb-4">
                                        <label class="form-label fw-bold">Mức chi tiêu tối thiểu (VNĐ) <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" v-model="form.min_spend" :class="{'is-invalid': errors.min_spend}" min="1">
                                        <div class="invalid-feedback">{{ errors.min_spend?.[0] }}</div>
                                    </div>

                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Thiết lập Giới hạn & Thời gian</h6>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Tổng lượt sử dụng <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" v-model="form.usage_limit" :class="{'is-invalid': errors.usage_limit}" min="1">
                                        <div class="invalid-feedback">{{ errors.usage_limit?.[0] }}</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Lượt dùng mỗi khách hàng <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" v-model="form.usage_limit_per_user" :class="{'is-invalid': errors.usage_limit_per_user}" min="1">
                                        <div class="invalid-feedback">{{ errors.usage_limit_per_user?.[0] }}</div>
                                    </div>

                                    <div class="col-md-12 mb-3">
                                        <label class="form-label fw-bold">Ngày hết hạn <span class="text-danger">*</span></label>
                                        <input type="datetime-local" class="form-control" v-model="form.expires_at" :class="{'is-invalid': errors.expires_at}">
                                        <div class="invalid-feedback">{{ errors.expires_at?.[0] }}</div>
                                    </div>

                                </div>

                                <hr class="text-muted opacity-25 my-4">
                                <div class="text-end">
                                    <button type="button" class="btn btn-light me-2 px-4 shadow-sm fw-bold" @click="handleRestore" :disabled="isRestoring">
                                      <span v-if="isRestoring" class="spinner-border spinner-border-sm me-2"></span>Khôi phục gốc
                                    </button>
                                    <button type="submit" class="btn btn-brand btn-brand-solid px-5 fw-bold shadow-sm"
                                        :disabled="isSaving">
                                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> 
                                        {{ isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        
        <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
          <h1 class="logo-shimmer mb-3">ThinkHub</h1>
          <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import moment from 'moment';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const route = useRoute();

const isLoaded = ref(false);
const isSaving = ref(false);
const isRestoring = ref(false);
const errors = ref({});

const usage_count = ref(0); // Chỉ để show, không edit

const form = ref({
    name: '', 
    code: '', 
    type: '', 
    value: 0,
    min_spend: 0,
    usage_limit: 0,
    usage_limit_per_user: 0,
    expires_at: '',
    status: ''
});

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatCurrency = (val) => {
    if (!val) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const fetchCoupon = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/coupons/${route.params.id}`, { headers: getHeaders() });
    const u = res.data.data;
    
    // Cần format lại expires_at thành YYYY-MM-DDTHH:mm cho thẻ input type="datetime-local"
    const formattedExpireDate = moment(u.expires_at).format('YYYY-MM-DDTHH:mm');

    form.value = { 
      name: u.name, 
      code: u.code, 
      type: u.type, 
      value: u.value,
      min_spend: u.min_spend,
      usage_limit: u.usage_limit,
      usage_limit_per_user: u.usage_limit_per_user,
      expires_at: formattedExpireDate,
      status: u.status
    };
    
    usage_count.value = u.usage_count || 0;

  } catch (err) {
    console.error('Lỗi khi fetch chi tiết coupon:', err); 
    router.push({ name: 'admin-coupons' });
  } finally { 
    isLoaded.value = true; 
  }
};

const handleRestore = async () => {
  isRestoring.value = true;
  await fetchCoupon();
  setTimeout(() => {
    isRestoring.value = false;
    Swal.fire({ icon: 'success', title: 'Khôi phục thành công', timer: 1500, showConfirmButton: false });
  }, 400); 
};

const updateCoupon = async () => {
    isSaving.value = true;
    errors.value = {}; 

    // Convert lại format ngày trước khi gửi nếu cần (để Backend dễ parse)
    const payloadDate = moment(form.value.expires_at).format('YYYY-MM-DD HH:mm:ss');
    const payload = { ...form.value, expires_at: payloadDate };

    try {
        const res = await axios.patch(`${API_URL}/admin/coupons/${route.params.id}`, payload, {
            headers: getHeaders()
        });
        
        Swal.fire({ icon: 'success', title: 'Thành công', text: res.data.message, timer: 1500, showConfirmButton: false });
        fetchCoupon();
    } catch (err) { 
        if (err.response && err.response.status === 422) {
            errors.value = err.response.data.errors;
            Swal.fire('Chú ý', 'Vui lòng kiểm tra lại thông tin.', 'warning');
        } else { 
            Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra', 'error'); 
        }
    } finally { 
        isSaving.value = false; 
    }
};

onMounted(() => {
    fetchCoupon();
});
</script>

<style scoped>
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
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