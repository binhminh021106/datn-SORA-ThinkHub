<template>
    <div class="coupon-edit-wrapper">
        <!-- SKELETON CHỜ KHI KHÔNG CÓ CACHE (F5) -->
        <div v-if="isLoading" class="container-fluid py-4">
            <div class="row mb-4"><div class="col-6"><span class="placeholder col-8 rounded" style="height: 40px;"></span></div></div>
            <div class="row g-4">
                <div class="col-md-4 col-lg-3"><div class="card border-0 shadow-sm rounded-4 placeholder-glow p-4"><span class="placeholder col-12 rounded mb-3" style="height: 200px;"></span></div></div>
                <div class="col-md-8 col-lg-9"><div class="card border-0 shadow-sm rounded-4 placeholder-glow p-4"><span class="placeholder col-12 rounded mb-3" style="height: 400px;"></span></div></div>
            </div>
        </div>
        
        <div class="container-fluid py-4" v-else>
            <div class="d-flex align-items-center mb-4">
                <router-link :to="{ name: 'admin-coupons' }"
                    class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 40px; height: 40px;">
                    <i class="bi bi-arrow-left fw-bold"></i>
                </router-link>
                <div>
                    <h3 class="fw-bold text-dark mb-0">Cập Nhật Mã Giảm Giá</h3>
                    <p class="text-muted mb-0 small">
                        Mã: <span class="fw-bold text-brand">{{ form.code }}</span>
                        <span v-if="isFetching" class="spinner-border spinner-border-sm text-brand ms-2" title="Đang đồng bộ ngầm"></span>
                    </p>
                </div>
            </div>

            <form @submit.prevent="submitForm" autocomplete="off">
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

                            <div class="mb-3 text-start mt-auto">
                                <p class="small text-muted mb-0"><i class="bi bi-clock me-1"></i>Hết hạn: {{ form.expires_at ? formatDate(form.expires_at) : 'Không có' }}</p>
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
                                    <div class="col-md-6 mb-3">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="nameInput" v-model="form.name" :class="{'is-invalid': errors.name}" placeholder="Tên chương trình">
                                            <label for="nameInput" class="fw-bold">Tên chương trình giảm giá <span class="text-danger">*</span></label>
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.name">{{ errors.name?.[0] }}</div>
                                    </div>
                                    
                                    <div class="col-md-6 mb-4">
                                        <div class="input-group">
                                            <div class="form-floating">
                                                <input type="text" class="form-control font-monospace fw-bold text-uppercase text-brand" id="codeInput" v-model="form.code" :class="{'is-invalid': errors.code}"
                                                    style="letter-spacing: 1px;" placeholder="Mã giảm giá" @input="form.code = form.code.toUpperCase()">
                                                <label for="codeInput" class="fw-bold">Mã Code <span class="text-danger">*</span></label>
                                            </div>
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.code">{{ errors.code?.[0] }}</div>
                                    </div>

                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Thiết lập Giá trị</h6>

                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-bold">Loại giảm giá <span class="text-danger">*</span></label>
                                        <select class="form-select" v-model="form.type" :class="{'is-invalid': errors.type}">
                                            <option value="fixed">Số tiền cố định (VNĐ)</option>
                                            <option value="percentage">Phần trăm (%)</option>
                                        </select>
                                        <div class="invalid-feedback">{{ errors.type?.[0] }}</div>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label class="form-label fw-bold">Giá trị giảm <span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" v-model.number="form.value" :class="{'is-invalid': errors.value}" min="1">
                                            <span class="input-group-text bg-light fw-bold">{{ form.type === 'percentage' ? '%' : 'VNĐ' }}</span>
                                        </div>
                                        <small class="text-brand fw-bold mt-1 d-block" v-if="form.type === 'fixed' && form.value">{{ formatCurrency(form.value) }}</small>
                                        <div class="invalid-feedback d-block" v-if="errors.value">{{ errors.value?.[0] }}</div>
                                    </div>

                                    <div class="col-md-4 mb-4">
                                        <label class="form-label fw-bold">Chi tiêu tối thiểu (VNĐ) <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" v-model.number="form.min_spend" :class="{'is-invalid': errors.min_spend}" min="0">
                                        <small class="text-brand fw-bold mt-1 d-block" v-if="form.min_spend">{{ formatCurrency(form.min_spend) }}</small>
                                        <div class="invalid-feedback">{{ errors.min_spend?.[0] }}</div>
                                        <small class="text-muted fst-italic d-block mt-1">Đơn tối thiểu</small>
                                    </div>

                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Thiết lập Giới hạn & Thời gian</h6>

                                    <div class="col-md-6 mb-3">
                                        <div class="form-floating">
                                            <input type="number" class="form-control" id="usageLimitInput" v-model.number="form.usage_limit" :class="{'is-invalid': errors.usage_limit}" min="1" placeholder="100">
                                            <label for="usageLimitInput" class="fw-bold">Tổng lượt sử dụng <span class="text-danger">*</span></label>
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.usage_limit">{{ errors.usage_limit?.[0] }}</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <div class="form-floating">
                                            <input type="number" class="form-control" id="usageLimitPerUserInput" v-model.number="form.usage_limit_per_user" :class="{'is-invalid': errors.usage_limit_per_user}" min="1" placeholder="Không giới hạn">
                                            <label for="usageLimitPerUserInput" class="fw-bold">Lượt dùng mỗi khách hàng <span class="text-muted fw-normal fst-italic">(Tùy chọn)</span></label>
                                        </div>
                                        <div class="invalid-feedback d-block" v-if="errors.usage_limit_per_user">{{ errors.usage_limit_per_user?.[0] }}</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Ngày hết hạn <span class="text-muted fw-normal fst-italic">(Tùy chọn)</span></label>
                                        <input type="datetime-local" class="form-control" v-model="form.expires_at" :class="{'is-invalid': errors.expires_at}">
                                        <div class="invalid-feedback">{{ errors.expires_at?.[0] }}</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label class="form-label fw-bold">Trạng thái <span class="text-danger">*</span></label>
                                        <select class="form-select" v-model="form.status" :class="{'is-invalid': errors.status}">
                                            <option value="active">Hoạt động (Active)</option>
                                            <option value="inactive">Tạm dừng (Inactive)</option>
                                        </select>
                                        <div class="invalid-feedback">{{ errors.status?.[0] }}</div>
                                    </div>

                                </div>

                                <hr class="text-muted opacity-25 my-4">
                                <div class="text-end">
                                    <button type="button" class="btn btn-light me-2 px-4 shadow-sm fw-bold" @click="handleRestore" :disabled="isRestoring || isUpdating">
                                      <span v-if="isRestoring" class="spinner-border spinner-border-sm me-2"></span>Khôi phục gốc
                                    </button>
                                    <button type="submit" class="btn btn-brand btn-brand-solid px-5 fw-bold shadow-sm"
                                        :disabled="isUpdating">
                                        <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span> 
                                        {{ isUpdating ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI' }}
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
import { ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import adminApiClient from '@/utils/adminApiClient.js';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const queryClient = useQueryClient();
const router = useRouter();
const route = useRoute();
const couponId = route.params.id;

const isRestoring = ref(false);
const errors = ref({});
const usage_count = ref(0);

const form = ref({
    name: '', code: '', type: '', value: 0, min_spend: 0, usage_limit: 0, usage_limit_per_user: 0, expires_at: '', status: ''
});

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'});
};

const formatForPayload = (dateLocal) => {
    if (!dateLocal) return '';
    return dateLocal.replace('T', ' ') + ':00'; // Parse lại format SQL Backend hiểu nếu dùng datetime-local
};

// 1. Fetch/Lấy Cache Coupon Detail (Triệt tiêu mồ côi)
const fetchCouponDetail = async () => {
  const res = await adminApiClient.get(`/coupons/${couponId}`);
  return res.data.data;
};

const { data: couponData, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['admin', 'coupon', couponId],
  queryFn: fetchCouponDetail,
  initialData: () => {
    return queryClient.getQueryData(['admin', 'coupons'])?.find(d => d.id == couponId);
  },
  staleTime: 1000 * 60 * 5,
});

// Map Cache sang Local State
watchEffect(() => {
  if (couponData.value) {
    const u = couponData.value;
    form.value = { 
      name: u.name, code: u.code, type: u.type, value: u.value, min_spend: u.min_spend,
      usage_limit: u.usage_limit, usage_limit_per_user: u.usage_limit_per_user,
      expires_at: formatForInput(u.expires_at), status: u.status
    };
    usage_count.value = u.usage_count || 0;
  }
});

const handleRestore = async () => {
  isRestoring.value = true;
  await refetch();
  errors.value = {};
  setTimeout(() => {
    isRestoring.value = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Khôi phục form thành công', timer: 1500, showConfirmButton: false });
  }, 400); 
};

// 2. Mutation Cập nhật API (Cập nhật Cache danh sách khi thành công)
const { mutate: updateCoupon, isLoading: isUpdating } = useMutation({
  mutationFn: async (payload) => {
    try {
        const res = await adminApiClient.patch(`/coupons/${couponId}`, payload);
        return res.data.data;
    } catch (err) {
        if (err.response && err.response.status === 422) {
            throw { isValidation: true, errors: err.response.data.errors };
        }
        throw new Error(err.response?.data?.message || 'Lỗi hệ thống');
    }
  },
  onSuccess: (updatedData) => {
    queryClient.setQueryData(['admin', 'coupon', couponId], updatedData);
    queryClient.setQueryData(['admin', 'coupons'], (oldList) => {
      if(!oldList) return oldList;
      return oldList.map(c => c.id == couponId ? updatedData : c);
    });
    
    Swal.fire({ icon: 'success', title: 'Thành công', text: 'Cập nhật mã giảm giá thành công!', timer: 1500, showConfirmButton: false });
    router.push({ name: 'admin-coupons' });
  },
  onError: (err) => {
    if (err.isValidation) {
        errors.value = err.errors;
        Swal.fire('Chú ý', 'Vui lòng kiểm tra lại thông tin.', 'warning');
    } else {
        Swal.fire('Lỗi', err.message || 'Mất kết nối', 'error');
    }
  }
});

const submitForm = () => {
    if (!form.value.name || form.value.name.trim().length < 3) { Swal.fire('Lỗi', 'Tên chương trình phải có ít nhất 3 ký tự.', 'warning'); return; }
    if (!form.value.code || form.value.code.trim().length < 5 || !/^[A-Z0-9]+$/.test(form.value.code)) { Swal.fire('Lỗi', 'Mã code phải có ít nhất 5 ký tự và chỉ chứa chữ in hoa, số.', 'warning'); return; }
    if (form.value.type === 'fixed' && form.value.value < 1000) { Swal.fire('Lỗi', 'Mức giảm giá tiền mặt phải từ 1.000 VNĐ trở lên.', 'warning'); return; }
    if (form.value.type === 'percentage' && (form.value.value < 1 || form.value.value >= 100)) { Swal.fire('Lỗi', 'Mức giảm giá phần trăm phải từ 1% đến 99%.', 'warning'); return; }
    if (form.value.usage_limit_per_user && form.value.usage_limit_per_user > form.value.usage_limit) { Swal.fire('Lỗi', 'Giới hạn mỗi user không được vượt quá tổng số lượng mã.', 'warning'); return; }
    errors.value = {}; 
    const payload = { ...form.value, expires_at: formatForPayload(form.value.expires_at) };
    if (payload.usage_limit_per_user === '' || payload.usage_limit_per_user === null) {
        payload.usage_limit_per_user = null;
    }

    updateCoupon(payload);
};
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
.form-floating > label { transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
</style>