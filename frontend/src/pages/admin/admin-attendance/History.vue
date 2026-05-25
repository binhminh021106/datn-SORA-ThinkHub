<template>
  <div class="attendance-history-wrapper pb-5 mb-5">
    
    <!-- 1. SHIMMER LOGO (Chỉ hiện lần đầu tiên) -->
    <div v-if="isFirstVisit && isLoading" class="d-flex flex-column justify-content-center align-items-center w-100 shimmer-wrapper">
      <div class="logo-shimmer-container text-center">
        <h1 class="logo-shimmer mb-2">ThinkHub</h1>
        <p class="loading-text text-muted fw-bold small text-uppercase tracking-widest mt-2" style="letter-spacing: 3px; font-size: 0.75rem;">ĐANG TẢI DỮ LIỆU...</p>
      </div>
    </div>

    <!-- NỘI DUNG CHÍNH (Ẩn đi khi đang hiện Shimmer) -->
    <div class="container-fluid py-4" v-show="!isFirstVisit || !isLoading">
      
      <!-- HEADER TRANG -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 d-flex align-items-center">
          <router-link :to="{ name: 'admin-dashboard' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div class="d-flex flex-column">
            <h3 class="fw-bold text-dark mb-0">Lịch sử làm việc cá nhân</h3>
            <p class="text-muted small mb-0 mt-1 fw-semibold">Theo dõi giờ giấc Check-in/out và tổng kết chuyên cần tháng</p>
          </div>
        </div>
      </div>

      <!-- BẢNG ĐIỀU HƯỚNG CHÚ THÍCH & KPI CÁ NHÂN -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6" v-for="kpi in kpiSummaries" :key="kpi.title">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3 d-flex align-items-center gap-3">
              <div class="icon-box-small" :class="kpi.bgClass"><i :class="kpi.icon"></i></div>
              <div>
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.75rem;">{{ kpi.title }}</div>
                <h4 class="fw-black mb-0" :class="kpi.textClass || 'text-dark'">{{ kpi.value }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BẢNG GRID CALENDAR -->
      <div class="card border-0 shadow-sm rounded-4 bg-white">
        <div class="card-body p-4 p-md-5">
          
          <!-- Thanh điều hướng Tháng/Năm -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
            <h4 class="fw-bold mb-0 text-dark d-flex align-items-center">
              <i class="bi bi-calendar2-week text-brand me-2 fs-3"></i>
              Tháng {{ currentMonth }} - {{ currentYear }}
            </h4>
            <div class="d-flex gap-2">
              <button class="btn btn-light border shadow-sm rounded-3 fw-bold px-3" @click="prevMonth">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button class="btn btn-brand shadow-sm rounded-3 fw-bold text-white px-4" @click="goToToday">
                Hôm nay
              </button>
              <button class="btn btn-light border shadow-sm rounded-3 fw-bold px-3" @click="nextMonth">
                <i class="bi bi-chevron-right"></i>
              </button>
              <button class="btn btn-outline-secondary shadow-sm rounded-3 fw-bold px-3 ms-2" @click="refetch" :disabled="isLoading">
                <i class="bi bi-arrow-clockwise" :class="{'fa-spin': isLoading && !isFirstVisit}"></i> Làm mới
              </button>
            </div>
          </div>

          <!-- 2. SKELETON LƯỚI LỊCH (Hiển thị khi tải dữ liệu cho các lần sau) -->
          <div v-if="isLoading && !isFirstVisit" class="calendar-container shadow-sm">
            <!-- Header Thứ -->
            <div class="calendar-header-row rounded-top-3">
              <div class="calendar-header-col">Thứ 2</div>
              <div class="calendar-header-col">Thứ 3</div>
              <div class="calendar-header-col">Thứ 4</div>
              <div class="calendar-header-col">Thứ 5</div>
              <div class="calendar-header-col">Thứ 6</div>
              <div class="calendar-header-col text-primary bg-light">Thứ 7</div>
              <div class="calendar-header-col text-danger bg-light">Chủ Nhật</div>
            </div>

            <!-- Body Lịch (Skeleton) -->
            <div class="calendar-body">
              <div class="calendar-week" v-for="w in 5" :key="'sw-'+w">
                <div class="calendar-day" v-for="d in 7" :key="'sd-'+d">
                  <div class="skeleton ms-auto mb-3" style="width: 25px; height: 25px; border-radius: 4px;"></div>
                  <div class="skeleton w-100 mb-2" style="height: 28px; border-radius: 6px;"></div>
                  <div class="skeleton w-100" style="height: 28px; border-radius: 6px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Khu vực Lịch Dữ Liệu Thật -->
          <div class="calendar-container shadow-sm" v-else>
            <!-- Header Thứ -->
            <div class="calendar-header-row rounded-top-3">
              <div class="calendar-header-col">Thứ 2</div>
              <div class="calendar-header-col">Thứ 3</div>
              <div class="calendar-header-col">Thứ 4</div>
              <div class="calendar-header-col">Thứ 5</div>
              <div class="calendar-header-col">Thứ 6</div>
              <div class="calendar-header-col text-primary bg-light">Thứ 7</div>
              <div class="calendar-header-col text-danger bg-light">Chủ Nhật</div>
            </div>

            <!-- Body Lịch -->
            <div class="calendar-body">
              <div class="calendar-week" v-for="(week, index) in calendarGrid" :key="index">
                <div 
                  class="calendar-day" 
                  v-for="day in week" 
                  :key="day.date || day.dayNumber"
                  :class="{ 
                    'not-current-month': !day.isCurrentMonth,
                    'is-today': isToday(day.date),
                    'is-weekend': day.isCurrentMonth && !isStaffWorkingDay(day.date, day)
                  }"
                >
                  <!-- Ngày (Hiển thị to ở góc) -->
                  <div class="day-number" :class="{'text-brand fw-bolder': isToday(day.date)}">
                    <span v-if="isToday(day.date)" class="badge bg-brand text-white rounded-circle p-1 px-2 me-1" style="font-size: 0.7rem;">Hôm nay</span>
                    {{ day.dayNumber }}
                  </div>

                  <!-- Thông tin điểm danh thực tế -->
                  <div class="day-data mt-2" v-if="day.data">
                    <div class="time-item text-success bg-success-subtle rounded px-2 py-1 mb-1 border border-success border-opacity-25 shadow-sm">
                      <span><i class="bi bi-box-arrow-in-right me-1"></i>Vào:</span>
                      <span class="fw-bold">{{ formatTime(day.data.clock_in) }}</span>
                    </div>
                    
                    <div class="time-item rounded px-2 py-1 mb-1 border shadow-sm" 
                         v-if="day.data.clock_out"
                         :class="day.data.checkout_status === 'forgotten' ? 'bg-danger-subtle text-danger border-danger border-opacity-25' : 'bg-warning-subtle text-warning-emphasis border-warning border-opacity-25'">
                      <span><i class="bi bi-box-arrow-left me-1"></i>Ra:</span>
                      <span class="fw-bold">{{ formatTime(day.data.clock_out) }}</span>
                    </div>

                    <!-- Hiển thị đầy đủ Badge trạng thái và giờ phút -->
                    <div class="d-flex flex-wrap gap-1 mt-2 justify-content-end">
                      <span :class="getStatusBadgeClass(getRealStatus(day.data))" class="badge">
                        {{ getStatusLabel(getRealStatus(day.data)) }}
                      </span>
                      <span v-if="getRealLateMinutes(day.data) > 0" class="badge bg-warning text-dark shadow-sm">
                        Muộn {{ formatDuration(getRealLateMinutes(day.data)) }}
                      </span>
                      <span v-if="getRealEarlyLeave(day.data) > 0" class="badge text-white shadow-sm" style="background-color: #fd7e14;">
                        Về sớm {{ formatDuration(getRealEarlyLeave(day.data)) }}
                      </span>
                      <span v-if="day.data.checkout_status === 'forgotten'" class="badge bg-danger shadow-sm">Quên Checkout</span>
                      
                      <!-- Chỉ hiển thị Tăng ca nếu không về sớm -->
                      <span v-if="!isStaffWorkingDay(day.date, day) && getRealEarlyLeave(day.data) <= 0" class="badge bg-dark text-white shadow-sm">Tăng ca</span>
                    </div>
                  </div>

                  <!-- Không có dữ liệu điểm danh -->
                  <div class="day-data mt-2 text-center" v-else-if="day.isCurrentMonth">
                     <span v-if="getAttendanceCellLabel(day)" :class="getAttendanceCellBadgeClass(day)">
                       {{ getAttendanceCellLabel(day) }}
                     </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
          
          <!-- Chú thích -->
          <div class="d-flex flex-wrap align-items-center justify-content-center gap-4 mt-4 pt-4 border-top">
            <div class="d-flex align-items-center"><span class="badge bg-success text-white shadow-sm me-2 py-2 px-3">Đúng giờ</span></div>
            <div class="d-flex align-items-center"><span class="badge bg-warning text-dark shadow-sm me-2 py-2 px-3">Đi muộn</span></div>
            <div class="d-flex align-items-center"><span class="badge bg-danger text-white shadow-sm me-2 py-2 px-3">Quên Checkout</span></div>
            <div class="d-flex align-items-center"><span class="badge bg-secondary-subtle text-secondary border border-secondary border-dashed me-2 py-2 px-3">Vắng mặt</span></div>
            <div class="d-flex align-items-center"><span class="badge bg-light text-muted border border-secondary border-dashed me-2 py-2 px-3">Ngày nghỉ</span></div>
            <div class="d-flex align-items-center"><span class="badge bg-dark text-white shadow-sm me-2 py-2 px-3">Tăng ca</span></div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useQuery } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Cấu hình Toast 
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

// Shimmer State
const isFirstVisit = ref(sessionStorage.getItem('visited_history_page') !== 'true');

// 1. Quản lý State Ngày tháng
const currentDate = ref(new Date());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);
const currentYear = computed(() => currentDate.value.getFullYear());
const isLoggedIn = computed(() => !!localStorage.getItem('admin_token'));

// Tính khoảng ngày đầu - cuối tháng để gọi API
const dateRange = computed(() => {
  const start = new Date(currentYear.value, currentMonth.value - 1, 1);
  const end = new Date(currentYear.value, currentMonth.value, 0);

  const formatDate = (d) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  return { start: formatDate(start), end: formatDate(end) };
});

// Lấy thông tin cơ bản của user hiện tại
const { data: currentUserData } = useQuery({
  queryKey: ['currentUserProfile'],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (e) {
      return null;
    }
  },
  enabled: isLoggedIn,
  staleTime: 1000 * 60 * 30, // Caching 30 phút
});

// Lấy danh sách toàn bộ phân công ca
const { data: assignmentsData } = useQuery({
  queryKey: ['workShiftAssignments'],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/work-shifts/assignments`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      return response.data.success ? response.data.data : [];
    } catch (e) {
      return [];
    }
  },
  enabled: isLoggedIn,
  staleTime: 1000 * 60 * 30,
});

// Xác định chính xác ca làm việc đang được gán cho user hiện tại
const currentUserShift = computed(() => {
  if (currentUserData.value?.shift_assignment?.work_shift) {
    return currentUserData.value.shift_assignment.work_shift;
  }
  if (currentUserData.value?.shiftAssignment?.workShift) {
    return currentUserData.value.shiftAssignment.workShift;
  }
  // So khớp với bảng danh sách phân công
  if (assignmentsData.value && currentUserData.value) {
    const myId = currentUserData.value.id;
    const myAssignment = assignmentsData.value.find(a => a.admin_id === myId || a.admin?.id === myId);
    return myAssignment?.work_shift || myAssignment?.workShift || null;
  }
  return null;
});

// Lấy cấu hình ngày nghỉ toàn hệ thống của doanh nghiệp (Làm Fallback cuối cùng)
const { data: workDaySettings } = useQuery({
  queryKey: ['globalWorkDaySettings'],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/settings/work-days`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success ? response.data.data : null;
    } catch (e) {
      return null;
    }
  },
  enabled: isLoggedIn,
  staleTime: 1000 * 60 * 10,
});

// 2. Fetch API qua TanStack Query điểm danh trong tháng
const { data: attendanceResponse, isLoading, refetch } = useQuery({
  queryKey: ['attendanceMonthHistory', currentMonth, currentYear],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if(!token) throw new Error("Chưa đăng nhập");

      const response = await axios.get(`${API_URL}/admin/attendances`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: dateRange.value.start,
          end_date: dateRange.value.end,
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Tải lịch làm việc thất bại, vui lòng thử lại!'
      });
      throw error;
    }
  },
  enabled: isLoggedIn,
  staleTime: 1000 * 60 * 5, 
  keepPreviousData: true,
  refetchOnWindowFocus: true, 
});

// Lắng nghe khi tải xong lần đầu thì tắt Shimmer và lưu Session
watch(isLoading, (newVal) => {
  if (!newVal && isFirstVisit.value) {
    sessionStorage.setItem('visited_history_page', 'true');
    setTimeout(() => { isFirstVisit.value = false; }, 300); 
  }
});

// Map dữ liệu thành dạng Dictionary Key-Value với Key là YYYY-MM-DD
const attendanceMap = computed(() => {
  const map = {};
  const items = attendanceResponse.value?.data?.data || [];
  items.forEach(item => {
    const dateStr = item.attendance_date.split('T')[0];
    map[dateStr] = item;
  });
  return map;
});

// 5. Helpers logic nhận diện ngày nghỉ/đi làm chính xác 100%
const getWeekdayIndex = (dateStr) => {
  if (!dateStr) return null;
  // FIX: Tránh timezone shift bằng cách bóc tách năm, tháng, ngày
  const [year, month, day] = dateStr.split('-');
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0-6 = T2-CN
};

// Chuẩn hóa hàm kiểm tra ngày hiện tại và quá khứ 
const isToday = (dateStr) => {
  if (!dateStr) return false;
  // FIX: Tránh timezone shift bằng cách bóc tách năm, tháng, ngày
  const [year, month, day] = dateStr.split('-');
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate.getTime() === today.getTime();
};

const isPastOrToday = (dateStr) => {
  if (!dateStr) return false;
  // FIX: Tránh timezone shift bằng cách bóc tách năm, tháng, ngày
  const [year, month, day] = dateStr.split('-');
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return targetDate <= today;
};

// Ưu tiên lấy ca làm việc được lưu trong lịch sử điểm danh của ngày đó (nếu có)
const getDayWorkShift = (day) => {
  if (!day) return null;
  if (day.data && (day.data.workShift || day.data.work_shift)) {
    return day.data.workShift || day.data.work_shift;
  }
  return currentUserShift.value;
};

// Kiểm tra ngày này nhân sự CÓ BẮT BUỘC ĐI LÀM KHÔNG
const isStaffWorkingDay = (dateStr, day = null) => {
  if (!dateStr) return false;
  const arrayIndex = getWeekdayIndex(dateStr);
  const shift = getDayWorkShift(day);

  // So với ca cá nhân
  if (shift && Array.isArray(shift.working_days)) {
    return !!shift.working_days[arrayIndex];
  }

  // So với ca công ty
  if (workDaySettings.value && Array.isArray(workDaySettings.value.working_days)) {
    return !!workDaySettings.value.working_days[arrayIndex];
  }

  // Fallback mặc định
  return arrayIndex >= 0 && arrayIndex < 5;
};

// ----------------------------------------------------------------------
// CÁC HÀM TÍNH TOÁN & ĐỊNH DẠNG TỪ SNAPSHOT FE (PORT TỪ INDEX.VUE)
// ----------------------------------------------------------------------

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
  } catch(e) {
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
    if (startTime && endTime <= startTime) expectedTimeObj.setDate(expectedTimeObj.getDate() + 1);
    const diffMins = Math.floor((expectedTimeObj.getTime() - clockOutTime) / 60000);
    if (diffMins > 0) return diffMins;
    return 0;
  } catch(e) {
    return att.early_leave_minutes || 0;
  }
};

const getRealStatus = (att) => {
  if (!att) return 'absent';
  if (att.status === 'on_leave') return 'on_leave';
  if (getRealLateMinutes(att) > 0) return 'late';
  return 'present';
};

// THỐNG KÊ THÁNG CÁ NHÂN (KPI CỦA CÁ NHÂN)
const kpiSummaries = computed(() => {
  let totalWorkDays = 0;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let overtimeCount = 0;

  const year = currentYear.value;
  const month = currentMonth.value - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayData = attendanceMap.value[dateStr];
    const mockDay = { date: dateStr, data: dayData, isCurrentMonth: true };
    
    const isWorkingDay = isStaffWorkingDay(dateStr, mockDay);
    
    if (isWorkingDay) totalWorkDays++; // Tổng số ngày yêu cầu đi làm trong tháng

    if (dayData) {
       // Đã check-in có dữ liệu
       if (isWorkingDay) {
          presentCount++; // Đi làm đúng lịch
       } else {
          // Nếu làm vào ngày nghỉ nhưng về sớm thì KHÔNG tính là tăng ca
          if (getRealEarlyLeave(dayData) <= 0) {
              overtimeCount++; 
          }
       }
       if (getRealLateMinutes(dayData) > 0) lateCount++;
    } else if (isWorkingDay && isPastOrToday(dateStr)) {
       // Đã qua hoặc hôm nay mà chưa có data -> Bị đánh dấu vắng mặt
       absentCount++;
    }
  }

  return [
    { title: 'Công thực tế tháng', value: `${presentCount} / ${totalWorkDays}`, icon: 'bi bi-check2-circle text-success', bgClass: 'bg-success-subtle text-success', textClass: 'text-success' },
    { title: 'Số lần đi muộn', value: lateCount, icon: 'bi bi-exclamation-triangle text-warning', bgClass: 'bg-warning-subtle text-warning-emphasis', textClass: 'text-warning-emphasis' },
    { title: 'Ngày vắng mặt', value: absentCount, icon: 'bi bi-person-x text-danger', bgClass: 'bg-danger-subtle text-danger', textClass: 'text-danger' },
    { title: 'Ngày tăng ca', value: overtimeCount, icon: 'bi bi-briefcase text-primary', bgClass: 'bg-primary-subtle text-primary', textClass: 'text-primary' }
  ];
});

// 3. Logic render Lưới lịch 2 chiều (Grid Calendar)
const calendarGrid = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value - 1;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Đưa Thứ 2 làm ngày đầu tuần
  let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  let days = [];
  
  // Những ngày của tháng trước (in mờ)
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ dayNumber: prevMonthDays - i, isCurrentMonth: false, date: null });
  }

  // Những ngày của tháng này
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      date: dateStr,
      data: attendanceMap.value[dateStr] || null
    });
  }

  // Những ngày của tháng sau để cho vuông lịch
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextMonthDay = 1;
  while (days.length < totalCells) {
    days.push({ dayNumber: nextMonthDay++, isCurrentMonth: false, date: null });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
});

// 4. Hàm điều khiển
const prevMonth = () => { currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1); };
const nextMonth = () => { currentDate.value = new Date(currentYear.value, currentMonth.value, 1); };
const goToToday = () => { currentDate.value = new Date(); };

// Logic hiển thị Nhãn (Label) cho ô ngày trống (Không có điểm danh)
const getAttendanceCellLabel = (day) => {
  if (!day || !day.date || !day.isCurrentMonth) return '';
  
  // Trường hợp đã trôi qua hoặc hiện tại
  if (isPastOrToday(day.date)) {
    return isStaffWorkingDay(day.date, day) ? 'Vắng mặt' : 'Ngày nghỉ';
  } 
  // Trường hợp tương lai (Chưa tới)
  else {
    return !isStaffWorkingDay(day.date, day) ? 'Ngày nghỉ' : ''; // Trống trơn nếu ngày làm việc tương lai
  }
};

// Logic hiển thị Badge cho ô ngày trống
const getAttendanceCellBadgeClass = (day) => {
  if (!day || !day.date || !day.isCurrentMonth) return '';
  
  if (isPastOrToday(day.date)) {
    return isStaffWorkingDay(day.date, day)
      ? 'badge bg-secondary-subtle text-secondary border border-secondary border-dashed w-100 py-2 mt-4'
      : 'badge bg-light text-muted border border-secondary border-dashed w-100 py-2 mt-4';
  } else {
    return !isStaffWorkingDay(day.date, day)
      ? 'badge bg-light text-muted border border-secondary border-dashed w-100 py-2 mt-4 opacity-50'
      : 'd-none';
  }
};

const formatTime = (timeString) => {
  if (!timeString) return '--:--';
  if (typeof timeString === 'string' && timeString.length === 8) return timeString.substring(0, 5); 
  const d = new Date(timeString);
  if (Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusLabel = (status) => {
  const map = { present: 'Đúng giờ', late: 'Đi muộn', absent: 'Vắng mặt', on_leave: 'Nghỉ phép' };
  return map[status] || status;
};

const getStatusBadgeClass = (status) => {
  const map = {
    present: 'badge bg-success text-white shadow-sm',
    late: 'badge bg-warning text-dark shadow-sm',
    absent: 'badge bg-danger text-white shadow-sm',
    on_leave: 'badge bg-info text-white shadow-sm'
  };
  return map[status] || 'badge bg-secondary';
};
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; }

/* Thêm Class CSS cho KPI Grid */
.icon-box-small { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 1.1rem; }
.fw-black { font-weight: 900; }

/* CALENDAR CSS CHUYÊN NGHIỆP */
.calendar-container {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
}
.calendar-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}
.calendar-header-col {
  padding: 16px 0;
  text-align: center;
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #495057;
  letter-spacing: 0.5px;
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
  min-height: 140px;
  border-right: 1px solid #e9ecef;
  padding: 12px;
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
  font-size: 1.1rem;
  text-align: right;
  color: #adb5bd;
  margin-bottom: 8px;
}
.not-current-month {
  background-color: #f8f9fa !important;
  pointer-events: none;
  opacity: 0.6;
}

/* Các ngày không làm việc (ngày nghỉ tuần) được tô xám nhạt */
.is-weekend {
  background-color: #f6f8f9 !important;
}
.is-today {
  background-color: #e6f5f2 !important;
  border: 2px solid #009981 !important;
  border-radius: 8px;
}
.time-item {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.border-dashed {
  border-style: dashed !important;
}

/* CSS LOGO SHIMMER LÀM LẠI THEO THIẾT KẾ MỚI CỦA INDEX.VUE */
.shimmer-wrapper { 
  min-height: 80vh; 
  background-color: #ffffff; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  z-index: 9999;
}
.logo-shimmer { 
  font-size: 4rem; 
  font-weight: 900; 
  letter-spacing: -2px; 
  background: linear-gradient(90deg, #12d8a0 0%, #009981 100%); 
  background-size: 200% auto; 
  color: transparent; 
  -webkit-background-clip: text; 
  background-clip: text; 
  animation: shine-logo 2s linear infinite; 
}
.loading-text {
  color: #6c757d;
  opacity: 0.8;
  animation: pulse-text 1.5s infinite ease-in-out;
}
@keyframes shine-logo { to { background-position: 200% center; } }
@keyframes pulse-text {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* CSS SKELETON LOADING */
.skeleton {
  background: #eee;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  background-size: 200% 100%;
  animation: 1.5s shine-skeleton linear infinite;
}
@keyframes shine-skeleton {
  to { background-position-x: -200%; }
}
</style>