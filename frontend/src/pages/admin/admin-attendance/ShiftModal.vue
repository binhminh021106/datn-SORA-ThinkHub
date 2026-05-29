<template>
  <div class="modal fade" id="shiftComponentModal" tabindex="-1" ref="modalRef" style="z-index: 10600;">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4">
        <div class="modal-header border-bottom-0 pb-0 pt-4 px-4">
          <h5 class="modal-title fw-bold">{{ isEditing ? 'Cập nhật Ca làm việc' : 'Tạo Ca làm việc mới' }}</h5>
          <button type="button" class="btn-close shadow-none" @click="closeModal()"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="saveShift">
            <div class="row g-4">
              <div class="col-12">
                <label class="form-label fw-semibold">Tên ca làm <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-lg bg-light border-0 shadow-none" v-model="formShift.name" placeholder="VD: Ca Sáng, Ca Hành Chính" required>
                <div class="text-danger small mt-1" v-if="errors.name">{{ errors.name[0] }}</div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Giờ bắt đầu <span class="text-danger">*</span></label>
                <input type="time" class="form-control bg-light border-0 shadow-none" v-model="formShift.start_time" required>
                <div class="text-danger small mt-1" v-if="errors.start_time">{{ errors.start_time[0] }}</div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Giờ kết thúc <span class="text-danger">*</span></label>
                <input type="time" class="form-control bg-light border-0 shadow-none" v-model="formShift.end_time" required>
                <div class="text-danger small mt-1" v-if="errors.end_time">{{ errors.end_time[0] }}</div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Cho phép trễ</label>
                <div class="input-group">
                  <input type="number" class="form-control bg-light border-0 shadow-none" v-model="formShift.late_tolerance" min="0">
                  <span class="input-group-text bg-light border-0">phút</span>
                </div>
              </div>

              <div class="col-12">
                <div v-if="crossMidnightWarning" class="alert alert-warning py-2 small d-flex align-items-center mb-3 border-warning">
                  <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i> Giờ kết thúc nhỏ hơn giờ bắt đầu. Vui lòng bật "Ca xuyên đêm".
                </div>

                <div class="d-flex gap-4 p-3 bg-light rounded-3 border">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="compIsOvernight" v-model="formShift.is_overnight" style="width: 40px; height: 20px;">
                    <label class="form-check-label fw-bold ms-2 text-dark pt-1" for="compIsOvernight">Ca xuyên đêm</label>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="compIsActive" v-model="formShift.is_active" style="width: 40px; height: 20px;">
                    <label class="form-check-label fw-bold ms-2 text-dark pt-1" for="compIsActive">Đang hoạt động</label>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Ngày làm việc chính <span class="text-muted fw-normal small">(Click để chọn)</span></label>
                <div class="d-flex gap-2 flex-wrap">
                  <button type="button" v-for="(day, index) in daysOfWeek" :key="'w'+index"
                          class="btn flex-fill fw-bold rounded-pill shadow-none transition-all"
                          :class="formShift.working_days[index] ? 'btn-brand text-white' : 'btn-outline-secondary bg-light'"
                          @click="formShift.working_days[index] = !formShift.working_days[index]">
                    {{ day }}
                  </button>
                </div>
                <div class="text-danger small mt-1" v-if="errors.working_days">{{ errors.working_days[0] }}</div>
              </div>

              <div class="col-12 mb-2">
                <label class="form-label fw-semibold">Ngày cho phép Đăng ký Tăng ca (OT)</label>
                <div class="d-flex gap-2 flex-wrap">
                  <button type="button" v-for="(day, index) in daysOfWeek" :key="'o'+index"
                          class="btn flex-fill fw-bold rounded-pill shadow-none transition-all"
                          :class="formShift.overtime_days[index] ? 'btn-warning text-dark border-warning' : 'btn-outline-secondary bg-light'"
                          @click="formShift.overtime_days[index] = !formShift.overtime_days[index]">
                    {{ day }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2 mt-5 pt-3 border-top">
              <button type="button" class="btn btn-light px-4 fw-medium shadow-sm" @click="closeModal()">Hủy</button>
              <button type="submit" class="btn btn-brand px-5 fw-bold shadow-sm text-white" :disabled="formSubmitting">
                <span v-if="formSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditing ? 'Lưu thay đổi' : 'Tạo ca làm' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('admin_token');

const emit = defineEmits(['saved']);
const modalRef = ref(null);
let bootstrapModalInstance = null;

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const isEditing = ref(false);
const formSubmitting = ref(false);
const errors = ref({});

const formShift = ref({
  id: null, name: '', start_time: '', end_time: '', late_tolerance: 0, is_overnight: false, is_active: true,
  working_days: [false, true, true, true, true, true, false],
  overtime_days: [false, false, false, false, false, false, false]
});

const crossMidnightWarning = computed(() => {
  if (!formShift.value.start_time || !formShift.value.end_time) return false;
  return formShift.value.start_time > formShift.value.end_time && !formShift.value.is_overnight;
});

// Xóa triệt để bóng mờ đen (Backdrop) khi component bị unmount (chuyển tab/route)
onBeforeUnmount(() => {
  if (bootstrapModalInstance) {
    bootstrapModalInstance.hide();
    bootstrapModalInstance.dispose();
  }
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});

// Hàm để Component Cha (WorkShifts.vue) gọi ra
const openModal = (shift = null) => {
  errors.value = {};
  if (shift) {
    isEditing.value = true;
    formShift.value = { 
      id: shift.id, name: shift.name,
      start_time: shift.start_time ? shift.start_time.substring(0, 5) : '',
      end_time: shift.end_time ? shift.end_time.substring(0, 5) : '',
      late_tolerance: shift.late_tolerance, is_overnight: !!shift.is_overnight, is_active: !!shift.is_active,
      working_days: Array.isArray(shift.working_days) ? [...shift.working_days] : [false, true, true, true, true, true, false],
      overtime_days: Array.isArray(shift.overtime_days) ? [...shift.overtime_days] : [false, false, false, false, false, false, false]
    };
  } else {
    isEditing.value = false;
    formShift.value = { 
      id: null, name: '', start_time: '', end_time: '', late_tolerance: 0, is_overnight: false, is_active: true,
      working_days: [false, true, true, true, true, true, false],
      overtime_days: [false, false, false, false, false, false, false] 
    };
  }

  if (!bootstrapModalInstance && modalRef.value) {
    bootstrapModalInstance = new bootstrap.Modal(modalRef.value);
  }
  bootstrapModalInstance?.show();
};

// Cung cấp hàm ra bên ngoài cho Cha sử dụng
defineExpose({ openModal });

const closeModal = () => {
  bootstrapModalInstance?.hide();
};

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
});

async function saveShift() {
  if (!formShift.value.working_days.includes(true)) {
    Toast.fire({ icon: 'warning', title: 'Ca làm việc phải được áp dụng ít nhất 1 ngày trong tuần!' });
    return;
  }

  formSubmitting.value = true;
  errors.value = {};
  const payload = { ...formShift.value };

  try {
    if (isEditing.value) {
      await axios.put(`${API_URL}/admin/work-shifts/${payload.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post(`${API_URL}/admin/work-shifts`, payload, { headers: { Authorization: `Bearer ${token}` } });
    }
    
    emit('saved'); // Báo cho Cha refresh Data
    Toast.fire({ icon: 'success', title: isEditing.value ? 'Cập nhật ca thành công!' : 'Tạo ca làm việc thành công!' });
    closeModal();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Lưu ca thất bại.' });
    }
  } finally {
    formSubmitting.value = false;
  }
}
</script>

<style scoped>
.btn-brand { background-color: #009981; border-color: #009981; }
.btn-brand:hover, .btn-brand:active { background-color: #007a67 !important; border-color: #007a67 !important; }
.transition-all { transition: all 0.2s ease-in-out; }
</style>