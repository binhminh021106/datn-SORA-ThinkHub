<template>
  <div v-if="showModal" class="modal-backdrop-custom" @click.self="closeModal">
    <div class="modal-dialog-custom modal-lg mx-auto my-4 px-2">
      <div class="card shadow-lg rounded-4 overflow-hidden border-0">
        <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-start gap-3">
          <div>
            <h4 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i class="bi bi-pencil-square text-brand"></i>
              Điều chỉnh giờ công
            </h4>
            <p class="text-muted mb-0 small">Bổ sung hoặc sửa giờ công khi hệ thống ghi nhận thiếu/sai.</p>
          </div>
          <button type="button" class="btn btn-light rounded-circle shadow-sm flex-shrink-0" @click="closeModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="card-body p-4 bg-light">
          <div v-if="activeAdmin" class="row g-4">
            <div class="col-lg-5">
              <div class="card border-0 rounded-4 shadow-sm h-100">
                <div class="card-body p-4">
                  <div class="d-flex align-items-start gap-3 mb-4">
                    <div class="staff-avatar">{{ activeAdmin.fullname?.charAt(0) || 'S' }}</div>
                    <div class="min-w-0">
                      <h5 class="fw-bold mb-1 text-dark">{{ activeAdmin.fullname }}</h5>
                      <div class="small text-muted text-break"><i class="bi bi-envelope me-1"></i>{{ activeAdmin.email || '--' }}</div>
                      <div class="small text-muted"><i class="bi bi-telephone me-1"></i>{{ activeAdmin.phone || 'Chưa có SĐT' }}</div>
                    </div>
                  </div>

                  <div class="info-row">
                    <span>Ngày công</span>
                    <strong>{{ formatDateVN(form.attendance_date) }}</strong>
                  </div>
                  <div class="info-row">
                    <span>Ca làm</span>
                    <strong>{{ selectedShift?.name || 'Chưa xác định' }}</strong>
                  </div>
                  <div class="info-row">
                    <span>Giờ chuẩn</span>
                    <strong>{{ formatTimeOnly(selectedShift?.start_time) }} - {{ formatTimeOnly(selectedShift?.end_time) }}</strong>
                  </div>
                  <div class="info-row">
                    <span>Hiện tại</span>
                    <strong>{{ currentTimeSummary }}</strong>
                  </div>

                  <div class="preview-box mt-4">
                    <div class="small text-uppercase fw-bold text-muted mb-2">Preview sau chỉnh sửa</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge" :class="preview.status === 'late' ? 'bg-warning text-dark' : 'bg-success'">
                        {{ preview.status === 'late' ? 'Đi muộn' : 'Đúng giờ' }}
                      </span>
                      <span v-if="preview.lateMinutes > 0" class="badge bg-warning text-dark">
                        Muộn {{ formatDuration(preview.lateMinutes) }}
                      </span>
                      <span v-if="preview.earlyLeaveMinutes > 0" class="badge text-white" style="background-color:#fd7e14;">
                        Về sớm {{ formatDuration(preview.earlyLeaveMinutes) }}
                      </span>
                      <span v-if="preview.otMinutes > 0" class="badge bg-dark">
                        OT {{ formatDuration(preview.otMinutes) }}
                      </span>
                      <span class="badge" :class="getCheckoutPreviewBadgeClass(preview.checkoutStatus)">
                        {{ getCheckoutPreviewLabel(preview.checkoutStatus) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-7">
              <form class="card border-0 rounded-4 shadow-sm" @submit.prevent="submitAdjustment">
                <div class="card-body p-4">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-bold small text-muted">Ngày công</label>
                      <input v-model="form.attendance_date" type="date" class="form-control rounded-3" :max="todayString">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold small text-muted">Ca làm</label>
                      <select v-model="form.work_shift_id" class="form-select rounded-3">
                        <option value="">Tự động theo phân ca</option>
                        <option v-for="shift in workShifts" :key="shift.id" :value="shift.id">{{ shift.name }}</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold small text-muted">Giờ vào mới</label>
                      <input v-model="form.clock_in" type="time" class="form-control rounded-3">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold small text-muted">Giờ ra mới</label>
                      <input v-model="form.clock_out" type="time" class="form-control rounded-3">
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-bold small text-muted">Lý do điều chỉnh <span class="text-danger">*</span></label>
                      <select v-model="selectedReasonTemplate" class="form-select rounded-3 mb-2" @change="applyReasonTemplate">
                        <option value="">Chọn lý do mẫu để nhập nhanh</option>
                        <option v-for="template in reasonTemplates" :key="template" :value="template">{{ template }}</option>
                      </select>
                      <textarea v-model.trim="form.reason" class="form-control rounded-3" rows="3" placeholder="Ví dụ: Máy quét bị lag nên không ghi nhận giờ ra thực tế..."></textarea>
                      <div class="form-text">Lý do cần tối thiểu 10 ký tự để phục vụ đối soát.</div>
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-bold small text-muted">Ghi chú quản lý</label>
                      <select v-model="selectedNoteTemplate" class="form-select rounded-3 mb-2" @change="applyNoteTemplate">
                        <option value="">Chọn ghi chú mẫu để nhập nhanh</option>
                        <option v-for="template in noteTemplates" :key="template" :value="template">{{ template }}</option>
                      </select>
                      <textarea v-model.trim="form.note" class="form-control rounded-3" rows="2" placeholder="Ghi chú nội bộ nếu cần"></textarea>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white border-top p-3 d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-light rounded-3 px-4" @click="closeModal">Hủy</button>
                  <button type="submit" class="btn btn-brand rounded-3 px-4 text-white fw-bold" :disabled="submitting">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    Lưu điều chỉnh
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
import { computed, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import adminApiClient from '@/utils/adminApiClient';

const props = defineProps({
  workShifts: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['saved']);

function getVietnamDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

const showModal = ref(false);
const activeAdmin = ref(null);
const submitting = ref(false);
const fallbackShift = ref(null);
const selectedReasonTemplate = ref('');
const selectedNoteTemplate = ref('');

const reasonTemplates = [
  'Hệ thống bị lag nên không ghi nhận giờ chấm công thực tế.',
  'Camera hoặc máy quét không nhận diện được tại thời điểm chấm công.',
  'Nhân sự đã vào ca đúng thực tế nhưng bị miss check-in do lỗi thiết bị.',
  'Nhân sự đã tan ca đúng thực tế nhưng bị miss check-out do lỗi thiết bị.',
  'Quản lý xác nhận điều chỉnh theo biên bản/chứng cứ nội bộ.',
];

const noteTemplates = [
  'Đã đối chiếu với quản lý ca và xác nhận hợp lệ.',
  'Đã kiểm tra camera/log vận hành trước khi điều chỉnh.',
  'Điều chỉnh do lỗi hệ thống, không tính là vi phạm cá nhân.',
  'Cần theo dõi thêm nếu lỗi thiết bị tiếp tục lặp lại.',
];

const form = reactive({
  admin_id: null,
  attendance_date: '',
  work_shift_id: '',
  clock_in: '',
  clock_out: '',
  reason: '',
  note: '',
});

const todayString = computed(() => {
  return getVietnamDateString();
});

const selectedShift = computed(() => {
  if (form.work_shift_id) {
    return props.workShifts.find((shift) => String(shift.id) === String(form.work_shift_id)) || fallbackShift.value;
  }
  return fallbackShift.value;
});

const currentTimeSummary = computed(() => {
  const attendance = activeAdmin.value?.attendance;
  const inTime = formatTimeOnly(attendance?.clock_in);
  const outTime = formatTimeOnly(attendance?.clock_out);
  return `${inTime} - ${outTime}`;
});

const preview = computed(() => {
  const clockIn = combineDateTime(form.attendance_date, form.clock_in, false);
  const clockOut = combineDateTime(form.attendance_date, form.clock_out, true, clockIn);
  const shift = selectedShift.value;
  const lateMinutes = calculateLateMinutes(clockIn, shift, form.attendance_date);
  const earlyLeaveMinutes = calculateEarlyLeaveMinutes(clockOut, shift, form.attendance_date);
  const otMinutes = calculateOtMinutes(clockOut, shift, form.attendance_date);

  return {
    status: lateMinutes > 0 ? 'late' : 'present',
    checkoutStatus: clockOut ? 'completed' : getOpenCheckoutPreviewStatus(clockIn, shift, form.attendance_date),
    lateMinutes,
    earlyLeaveMinutes,
    otMinutes,
  };
});

const openModal = (admin, date) => {
  const attendance = admin?.attendance || null;
  const shift = getAdminShift(admin);

  activeAdmin.value = admin;
  fallbackShift.value = shift;
  form.admin_id = admin?.id || null;
  form.attendance_date = date || todayString.value;
  form.work_shift_id = shift?.id || '';
  form.clock_in = toTimeInput(attendance?.clock_in);
  form.clock_out = toTimeInput(attendance?.clock_out);
  form.reason = '';
  form.note = '';
  selectedReasonTemplate.value = '';
  selectedNoteTemplate.value = '';
  showModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  showModal.value = false;
  activeAdmin.value = null;
  fallbackShift.value = null;
  document.body.style.overflow = '';
};

const submitAdjustment = async () => {
  if (!form.reason || form.reason.length < 10) {
    Swal.fire({ icon: 'warning', title: 'Lý do chưa đủ rõ', text: 'Vui lòng nhập lý do điều chỉnh tối thiểu 10 ký tự.' });
    return;
  }

  submitting.value = true;
  try {
    const response = await adminApiClient.post('/attendances/adjustments', {
      admin_id: form.admin_id,
      attendance_date: form.attendance_date,
      work_shift_id: form.work_shift_id || null,
      clock_in: form.clock_in || null,
      clock_out: form.clock_out || null,
      reason: form.reason,
      note: form.note || null,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Không thể lưu điều chỉnh.');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Đã lưu điều chỉnh',
      text: response.data.message || 'Dữ liệu chấm công đã được cập nhật.',
      confirmButtonColor: '#009981',
    });
    emit('saved', response.data);
    closeModal();
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Không thể lưu điều chỉnh giờ công.';
    Swal.fire({ icon: 'error', title: 'Lưu điều chỉnh thất bại', text: message, confirmButtonColor: '#009981' });
  } finally {
    submitting.value = false;
  }
};

const applyReasonTemplate = () => {
  if (selectedReasonTemplate.value) {
    form.reason = selectedReasonTemplate.value;
  }
};

const applyNoteTemplate = () => {
  if (selectedNoteTemplate.value) {
    form.note = selectedNoteTemplate.value;
  }
};

const getAdminShift = (admin) => admin?.attendance?.work_shift || admin?.shift_assignment?.work_shift || null;

const toTimeInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.length === 8) return value.substring(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatTimeOnly = (value) => {
  if (!value) return '--:--';
  if (typeof value === 'string' && value.length === 8) return value.substring(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatDateVN = (dateStr) => {
  if (!dateStr) return '--';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatDuration = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}p`;
  if (h > 0) return `${h}h`;
  return `${m}p`;
};

const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  return String(dateStr).split('T')[0].split(' ')[0] < getVietnamDateString();
};

const getOpenCheckoutPreviewStatus = (clockIn, shift, date) => {
  if (!clockIn) return 'pending';
  if (!isPastDate(date)) return 'pending';

  const shiftEnd = getShiftEndDate(date, shift);
  if (!shiftEnd) return 'miss_checkout';

  return new Date() > shiftEnd ? 'miss_checkout' : 'pending';
};

const getShiftEndDate = (date, shift) => {
  if (!date || !shift?.end_time) return null;

  const shiftEnd = new Date(`${date}T${normalizeTimeForDate(shift.end_time)}`);
  if (Number.isNaN(shiftEnd.getTime())) return null;

  if (shift.start_time && normalizeTimeForCompare(shift.end_time) <= normalizeTimeForCompare(shift.start_time)) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return shiftEnd;
};

const normalizeTimeForDate = (time) => {
  const value = String(time || '');
  return value.length === 5 ? `${value}:00` : value;
};

const normalizeTimeForCompare = (time) => String(time || '').substring(0, 5);

const getCheckoutPreviewLabel = (status) => ({
  completed: 'Đã về',
  miss_checkout: 'Miss checkout',
  pending: 'Đang làm',
}[status] || status);

const getCheckoutPreviewBadgeClass = (status) => ({
  completed: 'bg-success',
  miss_checkout: 'bg-danger',
  pending: 'bg-info',
}[status] || 'bg-secondary');

const combineDateTime = (date, time, isClockOut, clockIn = null) => {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}:00`);
  const shift = selectedShift.value;

  if (isClockOut) {
    const isOvernight = shift?.start_time && shift?.end_time && shift.end_time <= shift.start_time;
    if (isOvernight || (clockIn && value < clockIn)) {
      value.setDate(value.getDate() + 1);
    }
  }

  return value;
};

const calculateLateMinutes = (clockIn, shift, date) => {
  if (!clockIn || !shift?.start_time || !date) return 0;
  const expected = new Date(`${date}T${shift.start_time}`);
  const diff = Math.floor((clockIn.getTime() - expected.getTime()) / 60000);
  const tolerance = parseInt(shift.late_tolerance || 0, 10);
  return diff > tolerance ? diff - tolerance : 0;
};

const calculateEarlyLeaveMinutes = (clockOut, shift, date) => {
  if (!clockOut || !shift?.end_time || !date) return 0;
  const expected = new Date(`${date}T${shift.end_time}`);
  if (shift.start_time && shift.end_time <= shift.start_time) {
    expected.setDate(expected.getDate() + 1);
  }
  const diff = Math.floor((expected.getTime() - clockOut.getTime()) / 60000);
  return diff > 0 ? diff : 0;
};

const calculateOtMinutes = (clockOut, shift, date) => {
  if (!clockOut || !shift?.end_time || !date) return 0;
  const expected = new Date(`${date}T${shift.end_time}`);
  if (shift.start_time && shift.end_time <= shift.start_time) {
    expected.setDate(expected.getDate() + 1);
  }
  const diff = Math.floor((clockOut.getTime() - expected.getTime()) / 60000);
  return diff > 0 ? diff : 0;
};

defineExpose({ openModal, closeModal });
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  z-index: 9999;
  overflow-y: auto;
  padding-bottom: 2rem;
  backdrop-filter: blur(4px);
}

.modal-dialog-custom {
  max-width: 980px;
  pointer-events: auto;
}

.text-brand {
  color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  border-color: #009981;
}

.btn-brand:hover {
  background-color: #007a67;
  border-color: #007a67;
}

.staff-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #e6f5f2;
  color: #009981;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px dashed rgba(0, 153, 129, 0.2);
  font-size: 0.9rem;
}

.info-row span {
  color: #6c757d;
}

.info-row strong {
  text-align: right;
  color: #212529;
}

.preview-box {
  background: #f0fcf9;
  border: 1px solid rgba(0, 153, 129, 0.18);
  border-radius: 14px;
  padding: 1rem;
}

.min-w-0 {
  min-width: 0;
}

:global(.swal2-container) {
  z-index: 12000 !important;
}
</style>
