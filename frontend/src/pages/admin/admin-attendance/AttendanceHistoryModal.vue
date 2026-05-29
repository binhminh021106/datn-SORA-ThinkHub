<template>
  <div v-if="showHistoryModal" class="modal-backdrop-custom" @click.self="closeHistoryModal">
    <div class="modal-dialog-custom modal-xl mx-auto my-4 px-2">
      <div class="card shadow-lg rounded-4 overflow-hidden border-0">
        <div class="card-header p-4 d-flex justify-content-between align-items-center bg-white border-bottom">
          <div>
            <h4 class="mb-1 fw-bold text-dark d-flex align-items-center"><i
                class="bi bi-calendar2-week text-brand me-2"></i>Lịch sử chấm công cá nhân</h4>
            <p class="text-muted small mb-0 fw-semibold">{{ activeHistoryAdmin?.fullname }} - <span
                class="fw-normal">{{ activeHistoryAdmin?.email }}</span></p>
            <div v-if="activeAssignment" class="mt-2">
              <span class="badge bg-light text-dark border px-2 py-1 shadow-sm me-2">
                <i class="bi bi-clock me-1 text-brand"></i> {{ activeAssignment.work_shift?.name || 'Ca làm việc' }}
              </span>
              <span class="text-muted small">
                <i class="bi bi-play-circle me-1"></i>Từ: <strong class="text-dark">{{ formatDateUI(activeAssignment.valid_from) }}</strong> 
                <span class="ms-1"><i class="bi bi-stop-circle me-1"></i>Đến: </span><strong class="text-dark">{{ activeAssignment.valid_to ? formatDateUI(activeAssignment.valid_to) : 'Vô thời hạn' }}</strong>
              </span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <input type="month" v-model="selectedMonth" @change="handleMonthChange" class="form-control bg-light border-0 shadow-none fw-bold text-dark" style="width: 150px; cursor: pointer;">
            <button type="button" class="btn btn-light rounded-circle shadow-sm" style="width: 40px; height: 40px;"
              @click="closeHistoryModal"><i class="bi bi-x-lg"></i></button>
          </div>
        </div>
        <div class="card-body p-4 bg-light">
          <div v-if="historyLoading">
            <div class="calendar-container shadow-sm">
              <div class="calendar-header-row rounded-top-3">
                <div class="calendar-header-col" v-for="i in 7" :key="'h-' + i">Thứ {{ i + 1 }}</div>
              </div>
              <div class="calendar-body">
                <div class="calendar-week" v-for="w in 5" :key="'w-' + w">
                  <div class="calendar-day" v-for="d in 7" :key="'d-' + d">
                    <div class="skeleton ms-auto mb-2" style="width: 20px; height: 20px; border-radius: 4px;"></div>
                    <div class="skeleton w-100 mb-1" style="height: 25px; border-radius: 6px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="calendar-container shadow-sm">
              <div class="calendar-header-row rounded-top-3">
                <div class="calendar-header-col">Thứ 2</div>
                <div class="calendar-header-col">Thứ 3</div>
                <div class="calendar-header-col">Thứ 4</div>
                <div class="calendar-header-col">Thứ 5</div>
                <div class="calendar-header-col">Thứ 6</div>
                <div class="calendar-header-col text-primary bg-light">Thứ 7</div>
                <div class="calendar-header-col text-danger bg-light">Chủ Nhật</div>
              </div>
              <div class="calendar-body">
                <div class="calendar-week" v-for="(week, index) in historyGrid" :key="index">
                  <div class="calendar-day" v-for="day in week" :key="day.date || Math.random()" :class="{
                    'not-current-month': !day.isCurrentMonth,
                    'is-today': isToday(day.date),
                    'is-weekend': !isStaffWorkingDay(day.date, day)
                  }">
                    <div class="day-number" :class="{ 'text-brand fw-bolder': isToday(day.date) }">
                      <span v-if="isToday(day.date)" class="badge bg-brand text-white rounded-circle p-1 px-2 me-1"
                        style="font-size: 0.7rem;">Hôm nay</span>{{ day.dayNumber }}
                    </div>

                    <div class="day-data mt-2" v-if="day.data">
                      <div
                        class="time-item text-success bg-success-subtle rounded px-2 py-1 mb-1 border border-success border-opacity-25 shadow-sm">
                        <span><i class="bi bi-box-arrow-in-right me-1"></i>Vào:</span>
                        <span class="fw-bold">{{ formatMiniTime(day.data.clock_in) }}</span>
                      </div>

                      <div class="time-item rounded px-2 py-1 mb-1 border shadow-sm" v-if="day.data.clock_out"
                        :class="day.data.checkout_status === 'forgotten' ? 'bg-danger-subtle text-danger border-danger border-opacity-25' : 'bg-warning-subtle text-warning-emphasis border-warning border-opacity-25'">
                        <span><i class="bi bi-box-arrow-left me-1"></i>Ra:</span>
                        <span class="fw-bold">{{ formatMiniTime(day.data.clock_out) }}</span>
                      </div>

                      <div class="d-flex flex-wrap gap-1 mt-2 justify-content-end">
                        <span :class="getStatusBadgeClassGrid(getRealStatus(day.data))" class="badge">{{
                          getStatusLabel(getRealStatus(day.data)) }}</span>

                        <span v-if="getRealLateMinutes(day.data) > 0"
                          class="badge bg-warning text-dark shadow-sm">Muộn {{
                            formatDuration(getRealLateMinutes(day.data)) }}</span>
                        <span v-if="getRealEarlyLeave(day.data) > 0" class="badge text-white shadow-sm"
                          style="background-color: #fd7e14;">Về sớm {{ formatDuration(getRealEarlyLeave(day.data))
                          }}</span>

                        <span v-if="day.data.checkout_status === 'forgotten'" class="badge bg-danger shadow-sm">Quên
                          Checkout</span>
                        <span v-if="!isStaffWorkingDay(day.date, day) && getRealEarlyLeave(day.data) <= 0"
                          class="badge bg-dark text-white shadow-sm">Tăng ca</span>
                      </div>
                    </div>

                    <div class="day-data mt-2 text-center" v-else-if="day.isCurrentMonth">
                      <span :class="getAttendanceCellBadgeClass(day)">{{ getAttendanceCellLabel(day) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useQuery } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const showHistoryModal = ref(false);
const activeHistoryAdmin = ref(null);
const drillDownDate = ref(new Date().toISOString().split('T')[0]);
const selectedMonth = ref(new Date().toISOString().substring(0, 7));
const activeAssignment = ref(null);

const formatDateUI = (dateStr) => {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0];
  const [y, m, d] = dateOnly.split('-');
  return `${d}/${m}/${y}`;
};

// EXPOSE METHODS
const openModal = (admin, date = null, assignment = null) => {
  activeHistoryAdmin.value = admin;
  activeAssignment.value = assignment;
  if (date) {
    drillDownDate.value = date;
    selectedMonth.value = date.substring(0, 7);
  } else {
    drillDownDate.value = new Date().toISOString().split('T')[0];
    selectedMonth.value = new Date().toISOString().substring(0, 7);
  }
  showHistoryModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeHistoryModal = () => {
  showHistoryModal.value = false;
  activeHistoryAdmin.value = null;
  activeAssignment.value = null;
  document.body.style.overflow = '';
};

const handleMonthChange = () => {
  drillDownDate.value = `${selectedMonth.value}-01`;
};

defineExpose({
  openModal,
  closeHistoryModal
});

// FETCH HISTORY
const { data: adminHistoryData, isFetching: historyLoading } = useQuery({
  queryKey: computed(() => ['adminAttendanceHistory', activeHistoryAdmin.value?.id, drillDownDate.value]),
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const date = new Date(drillDownDate.value);
      const start = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      const end = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

      const response = await axios.get(`${API_URL}/admin/attendances/history/${activeHistoryAdmin.value.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: start, end_date: end }
      });
      return response.data;
    } catch (error) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Không thể tải lịch sử của nhân viên này!',
        showConfirmButton: false,
        timer: 3000
      });
      throw error;
    }
  },
  enabled: computed(() => !!activeHistoryAdmin.value && showHistoryModal.value),
  staleTime: 1000 * 60 * 5,
  keepPreviousData: true,
});

// COMPUTED & HELPERS
const historyAssignments = computed(() => {
  return adminHistoryData.value?.assignments || [];
});

const adminHistoryMap = computed(() => {
  const map = {};
  const items = adminHistoryData.value?.data?.data || [];
  items.forEach(item => { map[item.attendance_date.split('T')[0]] = item; });
  return map;
});

const historyGrid = computed(() => {
  if (!drillDownDate.value) return [];
  const date = new Date(drillDownDate.value);
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  let days = [];
  const prevMonthDays = new Date(year, month, 0).getDate();

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ dayNumber: prevMonthDays - i, isCurrentMonth: false, date: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNumber: i, isCurrentMonth: true, date: dateStr, data: adminHistoryMap.value[dateStr] || null });
  }

  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextMonthDay = 1;
  while (days.length < totalCells) {
    days.push({ dayNumber: nextMonthDay++, isCurrentMonth: false, date: null });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) { weeks.push(days.slice(i, i + 7)); }
  return weeks;
});

const formatDuration = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}p`;
  if (h > 0) return `${h}h`;
  return `${m}p`;
};

const getRealLateMinutes = (att) => {
  if (!att || !att.clock_in) return att?.late_minutes || 0;
  const startTime = att.shift_start_time || att.work_shift?.start_time;
  if (!startTime) return att.late_minutes || 0;

  try {
    const clockInTime = new Date(att.clock_in).getTime();
    const dateOnly = att.clock_in.split('T')[0].split(' ')[0];
    const expectedTime = new Date(`${dateOnly}T${startTime}`).getTime();

    const diffMins = Math.floor((clockInTime - expectedTime) / 60000);
    const tolerance = parseInt(att.shift_late_tolerance || att.work_shift?.late_tolerance || 0);

    if (diffMins > tolerance) return diffMins - tolerance;
    return 0;
  } catch (e) {
    return att.late_minutes || 0;
  }
};

const getRealEarlyLeave = (att) => {
  if (!att || !att.clock_out) return att?.early_leave_minutes || 0;
  const endTime = att.shift_end_time || att.work_shift?.end_time;
  const startTime = att.shift_start_time || att.work_shift?.start_time;
  if (!endTime) return att.early_leave_minutes || 0;

  try {
    const clockOutTime = new Date(att.clock_out).getTime();
    const dateOnly = att.clock_out.split('T')[0].split(' ')[0];
    let expectedTimeObj = new Date(`${dateOnly}T${endTime}`);

    if (startTime && endTime <= startTime) {
      expectedTimeObj.setDate(expectedTimeObj.getDate() + 1);
    }

    const diffMins = Math.floor((expectedTimeObj.getTime() - clockOutTime) / 60000);
    if (diffMins > 0) return diffMins;
    return 0;
  } catch (e) {
    return att.early_leave_minutes || 0;
  }
};

const getRealStatus = (att) => {
  if (!att) return 'absent';
  if (att.status === 'on_leave') return 'on_leave';
  if (getRealLateMinutes(att) > 0) return 'late';
  return 'present'; 
};

const getStatusLabel = (status) => ({
  present: 'Đúng giờ', late: 'Đi muộn', absent: 'Vắng', on_leave: 'Nghỉ phép'
}[status] || status);

const getStatusBadgeClassGrid = (status) => ({
  present: 'badge bg-success text-white shadow-sm',
  late: 'badge bg-warning text-dark shadow-sm',
  absent: 'badge bg-danger text-white shadow-sm',
  on_leave: 'badge bg-info text-white shadow-sm'
}[status] || 'badge bg-secondary');

const getWeekdayIndex = (dateStr) => {
  if (!dateStr) return null;
  const dayOfWeek = new Date(dateStr).getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
};

const getWorkShiftFromObject = (obj) => {
  if (!obj) return null;
  return obj.workShift || obj.work_shift || null;
};

const getAssignedWorkShift = () => {
  if (activeAssignment.value && activeAssignment.value.work_shift) return activeAssignment.value.work_shift;
  if (!activeHistoryAdmin.value) return null;
  return getWorkShiftFromObject(activeHistoryAdmin.value.shiftAssignment) || getWorkShiftFromObject(activeHistoryAdmin.value.shift_assignment);
};

const getDayWorkShift = (day) => {
  if (!day) return null;
  if (day.data && (day.data.workShift || day.data.work_shift)) {
    return day.data.workShift || day.data.work_shift;
  }
  
  if (day.date && historyAssignments.value.length > 0) {
    const dateObj = new Date(day.date);
    dateObj.setHours(0,0,0,0);
    
    // Tìm kiếm trong mảng assignments
    const matchingAssignment = historyAssignments.value.find(a => {
      const from = new Date(a.valid_from);
      from.setHours(0,0,0,0);
      
      let to = null;
      if (a.valid_to) {
        to = new Date(a.valid_to);
        to.setHours(23,59,59,999);
      }
      
      return dateObj >= from && (!to || dateObj <= to);
    });
    
    if (matchingAssignment) {
      return matchingAssignment.workShift || matchingAssignment.work_shift;
    }
  }

  // Fallback về giá trị active assignment cuối cùng nếu không tìm thấy (trường hợp hiếm)
  return getAssignedWorkShift();
};

const isStaffWorkingDay = (dateStr, day = null) => {
  if (!dateStr) return false;
  const arrayIndex = getWeekdayIndex(dateStr);
  const shift = getDayWorkShift(day);

  if (shift && Array.isArray(shift.working_days)) {
    return !!shift.working_days[arrayIndex];
  }
  return arrayIndex >= 0 && arrayIndex < 5;
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  return dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const isPastOrToday = (dateStr) => {
  if (!dateStr) return false;
  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return targetDate <= today;
};

const getAttendanceCellLabel = (day) => {
  if (!day || !day.date) return '';
  if (day.data) {
    if (day.data.status === 'on_leave') return 'Nghỉ phép';
    if (!isStaffWorkingDay(day.date, day) && getRealEarlyLeave(day.data) <= 0) return 'Tăng ca';
    return getStatusLabel(getRealStatus(day.data));
  }
  if (day.isCurrentMonth) {
    if (isPastOrToday(day.date)) {
      return isStaffWorkingDay(day.date, day) ? 'Vắng mặt' : 'Nghỉ tuần';
    } else {
      return isStaffWorkingDay(day.date, day) ? '' : 'Nghỉ tuần';
    }
  }
  return '';
};

const getAttendanceCellBadgeClass = (day) => {
  if (!day || !day.date) return 'd-none';
  if (day.data) {
    if (day.data.status === 'on_leave') return 'badge bg-info text-white shadow-sm w-100 py-2';
    if (!isStaffWorkingDay(day.date, day) && getRealEarlyLeave(day.data) <= 0) return 'badge bg-dark text-white shadow-sm w-100 py-2';
    return getStatusBadgeClassGrid(getRealStatus(day.data)) + ' w-100 py-2';
  }
  if (day.isCurrentMonth) {
    if (isPastOrToday(day.date)) {
      return isStaffWorkingDay(day.date, day)
        ? 'badge bg-secondary-subtle text-secondary border border-secondary border-dashed w-100 py-2 mt-2'
        : 'badge bg-light text-muted border border-secondary-subtle border-dashed w-100 py-2 mt-2';
    } else {
      return isStaffWorkingDay(day.date, day)
        ? 'd-none'
        : 'badge bg-light text-muted opacity-50 border border-dashed border-secondary-subtle w-100 py-2 mt-2';
    }
  }
  return 'd-none';
};

const formatMiniTime = (value) => {
  if (!value) return '--:--';
  if (typeof value === 'string' && value.length === 8) return value.substring(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  z-index: 9999 !important;
  overflow-y: auto;
  padding-bottom: 2rem;
  backdrop-filter: blur(4px);
}

.modal-dialog-custom {
  max-width: 1140px;
  pointer-events: auto;
}

.calendar-container {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
}

.calendar-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 2px solid #dee2e6;
}

.calendar-header-col {
  padding: 14px 0;
  text-align: center;
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #495057;
  border-right: 1px solid #e9ecef;
}

.calendar-header-col:last-child {
  border-right: none;
}

.calendar-body {
  display: flex;
  flex-direction: column;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e9ecef;
}

.calendar-week:last-child {
  border-bottom: none;
}

.calendar-day {
  min-height: 120px;
  border-right: 1px solid #e9ecef;
  padding: 10px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  background-color: #fff;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-day:hover:not(.not-current-month) {
  background-color: #f8f9fa;
  transform: scale(1.02);
  z-index: 10;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.day-number {
  font-weight: 700;
  font-size: 1rem;
  text-align: right;
  color: #adb5bd;
  margin-bottom: 6px;
}

.not-current-month {
  background-color: #fcfcfc !important;
  pointer-events: none;
  opacity: 0.4;
}

.is-weekend {
  background-color: #f8f9fa !important;
}

.is-today {
  background-color: #e6f5f2 !important;
  border: 2px solid #009981 !important;
  border-radius: 8px;
}

.time-item {
  font-size: 0.75rem;
}

.text-brand {
  color: #009981 !important;
}

.bg-brand {
  background-color: #009981 !important;
}

.skeleton {
  background: #eee;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 5px;
  background-size: 200% 100%;
  animation: 1.5s shine-skeleton linear infinite;
}

@keyframes shine-skeleton {
  to {
    background-position-x: -200%;
  }
}
</style>
