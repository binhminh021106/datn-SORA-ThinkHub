<template>
  <div class="container-fluid py-4 pb-5 mb-5">
    
    <div v-if="isFirstVisit && loading" class="d-flex flex-column justify-content-center align-items-center w-100 shimmer-wrapper">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải cài đặt chấm công...</p>
    </div>

    <div v-show="!isFirstVisit || !loading">
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Ca làm việc</h3>
        </div>
        <div class="col-md-6 text-end" v-if="activeTab === 'active'">
          <button class="btn btn-brand shadow-sm rounded-pill px-4 py-2 fw-bold text-white" @click="openShiftModal()">
            <i class="bi bi-plus-circle me-1"></i> Tạo ca mới
          </button>
        </div>
      </div>

      <!-- TABS LỌC TRẠNG THÁI THEO PHONG CÁCH UNERLINE ĐỒNG BỘ -->
      <div class="mb-4">
        <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden pb-1">
          <li class="nav-item">
            <a 
              class="nav-link py-2 px-3 d-flex align-items-center custom-tab" 
              href="#" 
              :class="{ 'active-tab': activeTab === 'active' }" 
              @click.prevent="switchTab('active')"
            >
              <i class="bi bi-calendar2-check-fill me-2"></i> Đang hoạt động
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'active'}">
                {{ activeShiftsCount }}
              </span>
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link py-2 px-3 d-flex align-items-center custom-tab text-danger" 
              href="#" 
              :class="{ 'active-tab': activeTab === 'deleted' }" 
              @click.prevent="switchTab('deleted')"
            >
              <i class="bi bi-trash-fill me-2"></i> Đã xóa tạm thời
              <span class="badge ms-2 rounded-pill bg-danger text-white">
                {{ deletedShiftsCount }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <div class="row g-4">
        <div class="col-12">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4">

              <!-- SKELETON LOADING -->
              <div v-if="loading && !isFirstVisit">
                <div class="row row-cols-1 row-cols-xl-2 g-4">
                  <div v-for="i in 4" :key="'skel-shift-'+i" class="col">
                    <div class="card rounded-4 border shadow-sm p-4">
                      <div class="skeleton mb-3" style="width: 140px; height: 20px; border-radius: 8px;"></div>
                      <div class="skeleton mb-2" style="width: 100%; height: 14px; border-radius: 8px;"></div>
                      <div class="skeleton mb-2" style="width: 90%; height: 14px; border-radius: 8px;"></div>
                      <div class="skeleton" style="width: 70%; height: 14px; border-radius: 8px;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- KHÔNG CÓ DỮ LIỆU -->
              <div v-else-if="shifts.length === 0" class="text-center py-5">
                <div class="text-muted mb-3">
                  <i class="bi" :class="activeTab === 'deleted' ? 'bi-trash-slash fs-1' : 'bi-calendar-x fs-1'"></i>
                </div>
                <h5 class="fw-semibold text-dark">{{ activeTab === 'deleted' ? 'Không có ca làm việc nào đã bị xóa' : 'Chưa có ca làm việc nào được tạo' }}</h5>
                <p class="text-muted small">Vui lòng khởi tạo các khung ca phù hợp với quy trình chấm công.</p>
                <button v-if="activeTab === 'active'" class="btn btn-brand px-4 py-2 mt-2 rounded-pill fw-semibold text-white" @click="openShiftModal()">
                  <i class="bi bi-plus-lg me-1"></i> Tạo ca mới ngay
                </button>
              </div>

              <!-- DANH SÁCH CA LÀM VIỆC -->
              <div v-else class="row row-cols-1 row-cols-xl-2 g-4">
                <div v-for="shift in shifts" :key="shift.id" class="col">
                  <div class="card shift-card h-100 shadow-sm rounded-4 border-0 transition-all hover-card" :class="{'border border-danger border-opacity-25': activeTab === 'deleted'}">
                    <div class="card-body p-4">
                      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                        <div class="shift-header">
                          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                            <h6 class="fw-bold mb-0" :class="activeTab === 'deleted' ? 'text-danger' : 'text-dark'">{{ shift.name }}</h6>
                            <span v-if="shift.is_overnight" class="badge bg-dark text-white fw-normal shadow-sm small"><i class="bi bi-moon-stars me-1"></i> Qua đêm</span>
                          </div>
                          <div class="text-muted small">
                            <i class="bi bi-clock me-1"></i> {{ formatTimeUI(shift.start_time) }} - {{ formatTimeUI(shift.end_time) }}
                            <span class="mx-1">•</span>
                            Trễ sau <span class="fw-semibold text-dark">{{ shift.late_tolerance }} phút</span>
                          </div>
                        </div>

                        <div class="shift-action-group d-flex flex-wrap justify-content-end gap-2">
                          <template v-if="activeTab === 'active'">
                            <button class="btn btn-outline-primary btn-sm shadow-sm" @click="openShiftModal(shift)"><i class="bi bi-pencil-square me-1"></i> Sửa</button>
                            <button class="btn btn-outline-secondary btn-sm shadow-sm" @click="openAssignPanel(shift)"><i class="bi bi-person-lines-fill me-1"></i> Phân công</button>
                            <button class="btn btn-outline-danger btn-sm shadow-sm" @click="removeShift(shift)"><i class="bi bi-trash"></i></button>
                          </template>
                          <template v-else-if="activeTab === 'deleted'">
                            <button class="btn btn-success btn-sm shadow-sm text-white" @click="restoreShift(shift)"><i class="bi bi-arrow-counterclockwise me-1"></i> Khôi phục</button>
                          </template>
                        </div>
                      </div>

                      <div class="mb-3 shift-meta py-3 px-3 rounded-4 bg-white border">
                        <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
                          <span class="small text-muted">Lịch làm:</span>
                          <span v-for="(day, idx) in weekdays" :key="'badge-day-'+idx" class="badge badge-day"
                                :class="shift.working_days && shift.working_days[idx] ? 'badge-active' : 'badge-inactive'">
                            {{ day }}
                          </span>
                        </div>
                        <div class="small text-muted">
                          <i class="bi bi-lightning-charge-fill text-warning me-1"></i>
                          Cho phép Tăng ca (OT): <span class="fw-semibold text-dark">{{ formatOTDays(shift.overtime_days) }}</span>
                        </div>
                      </div>

                      <div v-if="activeTab === 'active'" class="shift-assignments p-3 rounded-4 bg-light border">
                        <div class="fw-semibold text-dark mb-2">Nhân sự thuộc ca ({{ shift.assignments?.length || 0 }})</div>
                        <div v-if="shift.assignments && shift.assignments.length" class="d-flex flex-wrap gap-2">
                          <span v-for="item in shift.assignments" :key="item.admin?.id || item.id" class="badge bg-white text-dark border px-3 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm">
                            <i class="bi bi-person-circle text-brand"></i>
                            <span>{{ item.admin?.fullname || 'Nhân viên chưa rõ' }}</span>
                            <button type="button" class="btn-close ms-2" style="font-size: 0.6rem;" aria-label="Gỡ" @click.stop="removeAssignment(shift.id, item.admin?.id)"></button>
                          </span>
                        </div>
                        <div v-else class="small text-muted fst-italic"><i class="bi bi-info-circle me-1"></i>Chưa có nhân viên được phân công</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PHÂN CÔNG PANEL -->
              <div v-if="currentAssignShift && activeTab === 'active'" class="mt-4 p-4 border rounded-4 bg-light shadow-sm transition-all">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div class="fw-bold text-dark fs-6">Phân công ca: <span class="text-brand">{{ currentAssignShift.name }}</span></div>
                    <small class="text-muted">Chọn nhân viên và nhấn Áp dụng.</small>
                  </div>
                  <button class="btn btn-sm btn-light border rounded-circle shadow-sm" @click="closeAssignPanel"><i class="bi bi-x-lg"></i></button>
                </div>

                <div v-if="adminsLoading" class="text-center py-4"><div class="spinner-border spinner-border-sm text-brand"></div></div>
                <div v-else class="row g-2 border rounded p-2 bg-white" style="max-height:220px; overflow:auto;">
                  <div v-for="a in admins" :key="a.id" class="col-12 col-sm-6">
                    <div class="form-check custom-checkbox-brand p-2 border rounded-3 h-100 d-flex align-items-center" :class="{ 'opacity-75': assignedElsewhere.has(a.id) && !selectedAdmins.includes(a.id) }">
                      <input class="form-check-input ms-0 me-2" type="checkbox" :id="`assign-${a.id}`" v-model="selectedAdmins" :value="a.id" :disabled="assignedElsewhere.has(a.id) && !selectedAdmins.includes(a.id)">
                      <label class="form-check-label w-100 cursor-pointer" :for="`assign-${a.id}`" :class="{ 'text-muted': assignedElsewhere.has(a.id) && !selectedAdmins.includes(a.id) }">
                        <div class="fw-semibold text-dark fs-sm">{{ a.fullname }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">{{ a.email }}</div>
                      </label>
                    </div>
                    <div v-if="assignedElsewhere.has(a.id) && !selectedAdmins.includes(a.id)" class="text-danger small mt-1">Đã được gán ca khác, không thể chọn lại.</div>
                  </div>
                </div>

                <div class="mt-3 d-flex gap-2 flex-wrap">
                  <button class="btn btn-brand btn-sm shadow-sm px-3" :disabled="assignLoading || selectedAdmins.length === 0" @click="applyAssignments">
                    <span v-if="assignLoading" class="d-flex align-items-center gap-2"><span class="spinner-border spinner-border-sm text-white"></span>Đang lưu...</span>
                    <span v-else>Lưu phân công</span>
                  </button>
                  <button class="btn btn-outline-secondary btn-sm shadow-sm px-3" @click="closeAssignPanel">Hủy bỏ</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM / SỬA CA -->
    <div v-if="showShiftModal">
      <div class="modal-backdrop-custom" @click.self="closeShiftModal"></div>
      <div class="modal-card">
        <div class="modal-content-custom border-0 rounded-4">
          <div class="modal-header-custom d-flex justify-content-between align-items-center border-bottom bg-white p-4">
            <div>
              <h5 class="mb-0 fw-bold text-dark">{{ form.id ? 'Chỉnh sửa ca làm việc' : 'Tạo ca làm việc mới' }}</h5>
              <small class="text-muted">Cập nhật chính xác giờ giấc và ngày áp dụng ca.</small>
            </div>
            <button type="button" class="btn btn-light rounded-circle shadow-sm" style="width: 36px; height: 36px;" @click="closeShiftModal"><i class="bi bi-x-lg"></i></button>
          </div>

          <div class="modal-body-custom p-4 bg-light">
            <div class="card border-0 shadow-sm rounded-3 mb-3">
              <div class="card-body p-3">
                <div class="mb-3">
                  <label class="form-label fw-semibold text-dark small">Tên ca làm việc</label>
                  <input v-model="form.name" class="form-control form-control-lg bg-light" placeholder="VD: Ca sáng, Ca Hành chính..." required>
                </div>

                <div class="mb-3 px-3 py-2 border rounded-3 bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <label class="form-label fw-bold text-dark small mb-0"><i class="bi bi-moon-stars text-brand me-2"></i>Ca làm qua đêm</label>
                    <small class="text-muted d-block" style="font-size: 0.7rem;">Tick nếu giờ kết thúc lố sang ngày hôm sau</small>
                  </div>
                  <div class="form-check form-switch ms-3 mb-0">
                    <input class="form-check-input" type="checkbox" role="switch" v-model="form.is_overnight" style="width: 40px; height: 20px;">
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold text-dark small">Giờ bắt đầu</label>
                    <input v-model="form.start_time" type="time" class="form-control bg-light" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold text-dark small">Giờ kết thúc</label>
                    <input v-model="form.end_time" type="time" class="form-control bg-light" required>
                  </div>
                </div>

                <div class="mb-1">
                  <label class="form-label fw-semibold text-dark small">Số phút trễ cho phép (Grace Period)</label>
                  <div class="input-group">
                    <input v-model.number="form.late_tolerance" type="number" min="0" class="form-control bg-light" placeholder="0">
                    <span class="input-group-text bg-white">phút</span>
                  </div>
                  <small class="text-muted mt-1 d-block">Nhân viên check-in trong khoảng này sẽ không bị đánh dấu "Đi muộn".</small>
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm rounded-3">
              <div class="card-body p-3">
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark small mb-2"><i class="bi bi-calendar-week text-brand me-2"></i>Ngày áp dụng ca</label>
                  <div class="d-flex gap-2 flex-wrap">
                    <button v-for="(label, idx) in weekdays" :key="`modal-wdbtn-${idx}`" type="button"
                      class="btn btn-sm rounded-pill px-3 shadow-sm transition-all"
                      :class="form.working_days[idx] ? 'btn-brand text-white' : 'btn-light border text-muted'"
                      @click="toggleFormWorkingDay(idx)">
                      <i class="bi bi-check2 me-1" v-if="form.working_days[idx]"></i>{{ label }}
                    </button>
                  </div>
                  <small class="text-muted mt-2 d-block">Những ngày yêu cầu nhân sự đi làm trong ca này.</small>
                </div>

                <div>
                  <label class="form-label fw-bold text-dark small mb-2"><i class="bi bi-lightning-charge-fill text-warning me-2"></i>Ngày cho phép Tăng ca (OT)</label>
                  <div class="d-flex gap-2 flex-wrap">
                    <button v-for="(label, idx) in weekdays" :key="`modal-otbtn-${idx}`" type="button"
                      class="btn btn-sm rounded-pill px-3 shadow-sm transition-all"
                      :class="form.overtime_days[idx] ? 'btn-warning text-dark border-warning fw-semibold' : 'btn-light border text-muted'"
                      @click="toggleFormOvertimeDay(idx)">
                      <i class="bi bi-lightning-charge-fill me-1" v-if="form.overtime_days[idx]"></i>{{ label }}
                    </button>
                  </div>
                  <small class="text-muted mt-2 d-block">Giờ làm thêm ngoài ca vào những ngày này sẽ được ghi nhận là Tăng ca (OT).</small>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-custom p-3 border-top bg-white d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary px-4 shadow-sm" type="button" @click="closeShiftModal">Hủy bỏ</button>
            <button class="btn btn-brand px-4 shadow-sm" type="button" :disabled="formSubmitting" @click="saveShift">
              <span v-if="formSubmitting" class="d-flex align-items-center gap-2"><span class="spinner-border spinner-border-sm text-white"></span>Đang lưu...</span>
              <span v-else><i class="bi bi-save me-1"></i> Lưu thông tin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('admin_token');
const queryClient = useQueryClient();

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

const isFirstVisit = ref(sessionStorage.getItem('visited_workshifts') !== 'true');

const activeTab = ref('active'); // 'active' | 'deleted'
const showShiftModal = ref(false);
const currentAssignShift = ref(null);
const selectedAdmins = ref([]);
const assignLoading = ref(false);

const form = ref({ 
  id: null, name: '', start_time: '', end_time: '', late_tolerance: 0, is_overnight: false,
  working_days: [true, true, true, true, true, false, false],
  overtime_days: [true, true, true, true, true, true, true] 
});
const formSubmitting = ref(false);

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Lấy danh sách ca làm việc cho tab hiện tại
const fetchShifts = async () => {
  const isTrashed = activeTab.value === 'deleted' ? 'true' : 'false';
  const res = await axios.get(`${API_URL}/admin/work-shifts?trashed=${isTrashed}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.success ? res.data.data : [];
};

const fetchAdmins = async () => {
  const res = await axios.get(`${API_URL}/admin/staff?per_page=1000`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.success ? (res.data.data.data || res.data.data) : [];
};

const { data: shiftsData, isLoading: shiftsLoading } = useQuery({ 
  queryKey: ['workShifts', activeTab], // Tải lại khi thay đổi activeTab
  queryFn: fetchShifts, 
  staleTime: 1000 * 60 * 5 
});

const { data: adminsData, isFetching: adminsFetching, refetch: refetchAdmins } = useQuery({ 
  queryKey: ['workShiftAdmins'], 
  queryFn: fetchAdmins, 
  enabled: false, 
  staleTime: 1000 * 60 * 5 
});

const shifts = computed(() => shiftsData.value || []);
const admins = computed(() => adminsData.value || []);
const loading = computed(() => shiftsLoading.value);
const adminsLoading = computed(() => adminsFetching.value);

// Đếm số lượng để hiển thị nhanh trên Badge của Tab (đếm dựa trên query cache hoặc giá trị đang có)
const activeShiftsCount = computed(() => {
  if (activeTab.value === 'active') return shifts.value.length;
  // Fallback tạm thời nếu đang đứng ở tab deleted
  const cache = queryClient.getQueryData(['workShifts', ref('active')]);
  return cache ? cache.length : shifts.value.filter(s => !s.deleted_at).length;
});

const deletedShiftsCount = computed(() => {
  if (activeTab.value === 'deleted') return shifts.value.length;
  const cache = queryClient.getQueryData(['workShifts', ref('deleted')]);
  return cache ? cache.length : shifts.value.filter(s => s.deleted_at).length;
});

watch(loading, (newVal) => {
  if (!newVal && isFirstVisit.value) {
    sessionStorage.setItem('visited_workshifts', 'true');
    setTimeout(() => { isFirstVisit.value = false; }, 300);
  }
});

// Kiểm tra xem nhân viên đã được gán vào ca làm việc khác (active) hay chưa
const assignedElsewhere = computed(() => {
  const blocked = new Set();
  if (!currentAssignShift.value) return blocked;
  
  shifts.value.forEach(shift => {
    if (shift.id !== currentAssignShift.value.id && shift.assignments) {
      shift.assignments.forEach(item => {
        if (item.admin && item.admin.id) {
          blocked.add(item.admin.id);
        }
      });
    }
  });
  return blocked;
});

const formatTimeUI = (timeStr) => {
  if (!timeStr) return '--:--';
  return timeStr.length > 5 ? timeStr.substring(0, 5) : timeStr;
};

const formatOTDays = (otArr) => {
  if (!otArr || !Array.isArray(otArr)) return 'Chưa cấu hình';
  const selectedDays = weekdays.filter((_, idx) => otArr[idx]);
  if (selectedDays.length === 7) return 'Cả tuần';
  if (selectedDays.length === 0) return 'Không có';
  return selectedDays.join(', ');
};

function openShiftModal(shift = null) {
  if (shift) {
    form.value = { 
      id: shift.id,
      name: shift.name,
      start_time: shift.start_time ? shift.start_time.substring(0, 5) : '',
      end_time: shift.end_time ? shift.end_time.substring(0, 5) : '',
      late_tolerance: shift.late_tolerance,
      is_overnight: shift.is_overnight ? true : false,
      working_days: shift.working_days ? [...shift.working_days] : [true, true, true, true, true, false, false],
      overtime_days: shift.overtime_days ? [...shift.overtime_days] : [true, true, true, true, true, true, true]
    };
  } else {
    form.value = { 
      id: null, name: '', start_time: '', end_time: '', late_tolerance: 0, is_overnight: false,
      working_days: [true, true, true, true, true, false, false],
      overtime_days: [true, true, true, true, true, true, true]
    };
  }
  showShiftModal.value = true;
}

function closeShiftModal() {
  showShiftModal.value = false;
  resetForm();
}

function toggleFormWorkingDay(idx) {
  form.value.working_days[idx] = !form.value.working_days[idx];
}

function toggleFormOvertimeDay(idx) {
  form.value.overtime_days[idx] = !form.value.overtime_days[idx];
}

function openAssignPanel(shift) {
  currentAssignShift.value = shift;
  selectedAdmins.value = (shift.assignments || []).map(item => item.admin?.id).filter(Boolean);
  if (!admins.value.length) {
    refetchAdmins();
  }
}

function closeAssignPanel() {
  currentAssignShift.value = null;
  selectedAdmins.value = [];
}

const switchTab = (tabId) => {
  activeTab.value = tabId;
};

async function applyAssignments() {
  if (!currentAssignShift.value) return;
  if (!selectedAdmins.value.length) {
    Toast.fire({ icon: 'warning', title: 'Vui lòng chọn ít nhất 1 nhân viên để phân công.' });
    return;
  }

  assignLoading.value = true;
  try {
    await axios.post(`${API_URL}/admin/work-shifts/assign-multiple`, {
      admin_ids: selectedAdmins.value,
      work_shift_id: currentAssignShift.value.id,
    }, { headers: { Authorization: `Bearer ${token}` } });

    // Invalidate cache của TanStack Query để tự động render lại UI mượt mà
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    
    Toast.fire({ icon: 'success', title: 'Đã phân công nhân viên thành công.' });
    closeAssignPanel();
  } catch (err) {
    const message = err.response?.data?.message || 'Có lỗi khi phân công.';
    Toast.fire({ icon: 'error', title: message });
  } finally {
    assignLoading.value = false;
  }
}

async function removeAssignment(shiftId, adminId) {
  const result = await Swal.fire({
    title: 'Xác nhận gỡ',
    text: 'Bạn có chắc chắn muốn gỡ nhân viên này khỏi ca?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy bỏ'
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${API_URL}/admin/work-shifts/assignments/${adminId}`, {
      params: { work_shift_id: shiftId },
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Clear cache để load lại
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    Toast.fire({ icon: 'success', title: 'Đã gỡ phân công thành công.' });
  } catch (err) {
    const message = err.response?.data?.message || 'Xóa phân công thất bại.';
    Toast.fire({ icon: 'error', title: message });
  }
}

function resetForm() {
  form.value = { id: null, name: '', start_time: '', end_time: '', late_tolerance: 0, is_overnight: false, working_days: [true, true, true, true, true, false, false], overtime_days: [true, true, true, true, true, true, true] };
  formSubmitting.value = false;
}

async function saveShift() {
  if (!form.value.name || !form.value.start_time || !form.value.end_time) {
    Toast.fire({ icon: 'warning', title: 'Vui lòng điền đủ thông tin ca làm việc!' });
    return;
  }

  if (!form.value.working_days.includes(true)) {
    Toast.fire({ icon: 'warning', title: 'Ca làm việc phải được áp dụng ít nhất 1 ngày trong tuần!' });
    return;
  }

  formSubmitting.value = true;
  const payload = {
    name: form.value.name,
    start_time: form.value.start_time,
    end_time: form.value.end_time,
    late_tolerance: parseInt(form.value.late_tolerance, 10) || 0,
    is_overnight: form.value.is_overnight,
    working_days: form.value.working_days,
    overtime_days: form.value.overtime_days 
  };

  try {
    if (form.value.id) {
      await axios.put(`${API_URL}/admin/work-shifts/${form.value.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post(`${API_URL}/admin/work-shifts`, payload, { headers: { Authorization: `Bearer ${token}` } });
    }
    
    // Clear cache để tự động đồng bộ
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    
    Toast.fire({ icon: 'success', title: form.value.id ? 'Cập nhật ca thành công!' : 'Tạo ca làm việc mới thành công!' });
    closeShiftModal();
  } catch (err) {
    const message = err.response?.data?.message || 'Lưu ca thất bại. Kiểm tra lại dữ liệu.';
    Toast.fire({ icon: 'error', title: message });
  } finally {
    formSubmitting.value = false;
  }
}

async function removeShift(shift) {
  const result = await Swal.fire({
    title: `Xóa ca "${shift.name}"?`,
    text: 'Hệ thống sẽ xóa mềm ca này và tự động gỡ toàn bộ nhân viên thuộc ca để đưa họ về trạng thái rảnh!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${API_URL}/admin/work-shifts/${shift.id}`, { headers: { Authorization: `Bearer ${token}` } });
    
    // Đánh dấu cache bẩn để ép fetch lại dữ liệu mới nhất
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    
    Toast.fire({ icon: 'success', title: 'Đã xóa ca làm việc.' });
  } catch (err) {
    const message = err.response?.data?.message || 'Xóa ca thất bại.';
    Toast.fire({ icon: 'error', title: message });
  }
}

async function restoreShift(shift) {
  const result = await Swal.fire({
    title: `Khôi phục ca "${shift.name}"?`,
    text: "Khôi phục lại ca này để tiếp tục sử dụng và gán nhân sự hoạt động trở lại.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Khôi phục',
    cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  try {
    await axios.post(`${API_URL}/admin/work-shifts/${shift.id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } });
    
    // Refresh toàn bộ cache danh sách ca
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    
    Toast.fire({ icon: 'success', title: 'Khôi phục thành công!' });
  } catch (err) {
    Toast.fire({ icon: 'error', title: 'Khôi phục thất bại.' });
  }
}
</script>

<style scoped>
/* STYLE NAV UNDERLINE ĐỒNG BỘ THEO TEMPLATE BRANDS */
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; text-decoration: none; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2.5px solid #009981 !important; }
.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

/* CSS LOGO SHIMMER */
.shimmer-wrapper { min-height: 70vh; }
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }

/* CSS SKELETON LOADING */
.skeleton { background: #eee; background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%); background-size: 200% 100%; animation: 1.5s shine-skeleton linear infinite; }
@keyframes shine-skeleton { to { background-position-x: -200%; } }

.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; color: #fff }
.btn-brand:hover { background-color: #007a67; color: #fff }
.fs-sm { font-size: 0.875rem; }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease-in-out; }

.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); z-index: 1050; backdrop-filter: blur(3px); }
.modal-card { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 1060; padding: 1rem; pointer-events: none;}
.modal-content-custom { width: 100%; max-width: 640px; max-height: calc(100vh - 2rem); background: #fff; border-radius: 1rem; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22); overflow: hidden; display: flex; flex-direction: column; pointer-events: auto;}
.modal-body-custom { padding: 1.25rem; overflow-y: auto; }
.shift-action-group { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: flex-end; }
.shift-action-group .btn { min-width: 84px; }
.shift-card { border: 1px solid rgba(0,0,0,0.06); }
.shift-card .card-body { min-height: 320px; }
.shift-header h6 { font-size: 1rem; }
.shift-meta { background: #ffffff; }
.badge-day { font-size: 0.75rem; padding: 0.45em 0.75em; border-radius: 999px; }
.badge-active { background-color: #009981; color: #ffffff; }
.badge-inactive { background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
.shift-assignments .badge { min-width: 170px; }
.hover-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; }
@media (max-width: 1199.98px) {
  .shift-card .card-body { min-height: auto; }
}
</style>