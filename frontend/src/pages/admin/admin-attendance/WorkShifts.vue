<template>
  <div class="container-fluid py-4 pb-5 mb-5 page-container">
    
    <!-- Shimmer Khởi động -->
    <div v-if="isFirstVisit && isLoadingShifts" class="d-flex flex-column justify-content-center align-items-center w-100 shimmer-wrapper">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải cài đặt chấm công...</p>
    </div>

    <div v-show="!isFirstVisit || !isLoadingShifts">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">Quản lý Ca làm việc</h2>
          <p class="text-muted mb-0">Thiết lập giờ làm và phân công lịch cố định cho nhân sự</p>
        </div>
        <div v-if="mainTab === 'shifts' && shiftSubTab === 'active'">
          <button class="btn btn-brand px-4 py-2 fw-semibold shadow-sm text-white" @click="openCreateShift()">
            <i class="bi bi-plus-lg me-2"></i> Tạo ca mới
          </button>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="mb-4 d-flex">
        <div class="nav-segment-wrapper p-1 bg-light rounded-pill border d-inline-flex shadow-sm">
          <button 
            class="btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center transition-all border-0" 
            :class="mainTab === 'shifts' ? 'bg-white shadow-sm text-brand' : 'text-muted bg-transparent'"
            @click="mainTab = 'shifts'"
          >
            <i class="bi bi-clock-history me-2"></i> Danh sách Ca làm
          </button>
          <button 
            class="btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center transition-all border-0"
            :class="mainTab === 'assignments' ? 'bg-white shadow-sm text-brand' : 'text-muted bg-transparent'"
            @click="mainTab = 'assignments'"
          >
            <i class="bi bi-people me-2"></i> Phân công Nhân viên
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: DANH SÁCH CA LÀM VIỆC               -->
      <!-- ========================================== -->
      <div v-if="mainTab === 'shifts'">
        
        <!-- Sub-tabs -->
        <div class="mb-4">
          <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden pb-1">
            <li class="nav-item">
              <a class="nav-link py-2 px-3 d-flex align-items-center custom-sub-tab" href="#" 
                 :class="{ 'active-tab': shiftSubTab === 'active' }" @click.prevent="shiftSubTab = 'active'">
                <i class="bi bi-calendar2-check-fill me-2"></i> Đang hoạt động
                <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': shiftSubTab === 'active'}">
                  {{ activeShiftsCount }}
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2 px-3 d-flex align-items-center custom-sub-tab text-danger" href="#" 
                 :class="{ 'active-tab text-danger': shiftSubTab === 'deleted' }" @click.prevent="shiftSubTab = 'deleted'">
                <i class="bi bi-trash-fill me-2"></i> Đã xóa tạm thời
                <span class="badge ms-2 rounded-pill bg-danger text-white">
                  {{ deletedShiftsCount }}
                </span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="isLoadingShifts && !isFirstVisit" class="row g-4">
          <div v-for="i in 3" :key="i" class="col-12 col-md-6 col-xl-4">
            <div class="card shift-card skeleton-card h-100">
              <div class="card-body p-4">
                <div class="skeleton mb-3" style="width: 140px; height: 20px; border-radius: 8px;"></div>
                <div class="skeleton mb-2" style="width: 100%; height: 14px; border-radius: 8px;"></div>
                <div class="skeleton mb-4" style="width: 70%; height: 14px; border-radius: 8px;"></div>
                <div class="d-flex gap-2">
                  <div class="skeleton-avatar" v-for="j in 5" :key="j"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!shifts || shifts.length === 0" class="empty-state text-center py-5 bg-white rounded-4 shadow-sm">
          <div class="empty-icon mb-3">
            <i class="bi" :class="shiftSubTab === 'deleted' ? 'bi-trash-slash text-muted' : 'bi-calendar-x text-muted'" style="font-size: 4rem;"></i>
          </div>
          <h5 class="fw-bold text-dark">{{ shiftSubTab === 'deleted' ? 'Không có ca làm việc nào đã bị xóa' : 'Chưa có ca làm việc nào' }}</h5>
          <p class="text-muted">Bắt đầu bằng cách tạo ca làm việc đầu tiên cho hệ thống.</p>
          <button v-if="shiftSubTab === 'active'" class="btn btn-brand mt-2 text-white" @click="openCreateShift()">Tạo ca ngay</button>
        </div>

        <!-- Shift Grid -->
        <div v-else class="row g-4">
          <div v-for="shift in shifts" :key="shift.id" class="col-12 col-md-6 col-xl-4">
            <div class="card shift-card h-100 shadow-sm border-0 transition-hover d-flex flex-column" :class="{'border border-danger border-opacity-25': shiftSubTab === 'deleted'}">
              <div class="card-body p-4 position-relative flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    {{ shift.name }}
                    <span v-if="shift.is_overnight" class="badge bg-dark-subtle text-dark border rounded-pill small" title="Ca qua đêm">
                      <i class="bi bi-moon-stars-fill text-warning"></i> Đêm
                    </span>
                  </h5>
                  <span :class="['badge rounded-pill', shift.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                    {{ shift.is_active ? 'Hoạt động' : 'Tạm ngưng' }}
                  </span>
                </div>

                <div class="time-display mb-3 bg-light rounded-3 p-3 text-center border">
                  <span class="fs-4 fw-bold text-brand">{{ formatTimeUI(shift.start_time) }}</span>
                  <span class="mx-3 text-muted"><i class="bi bi-arrow-right"></i></span>
                  <span class="fs-4 fw-bold text-brand">{{ formatTimeUI(shift.end_time) }}</span>
                  <div class="text-muted small mt-1">
                    <i class="bi bi-stopwatch me-1"></i> Cho phép đi trễ: <strong>{{ shift.late_tolerance }} phút</strong>
                  </div>
                </div>

                <div class="mb-3 shift-meta py-3 px-3 rounded-4 bg-white border">
                  <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <span class="small text-muted fw-semibold">Lịch làm:</span>
                    <span v-for="(day, idx) in daysOfWeek" :key="'badge-day-'+idx" class="badge badge-day shadow-sm"
                          :class="shift.working_days && shift.working_days[idx] ? 'badge-active' : 'badge-inactive'">
                      {{ day }}
                    </span>
                  </div>
                  <div class="small text-muted border-top pt-2 mt-2">
                    <i class="bi bi-lightning-charge-fill text-warning me-1"></i>
                    Tăng ca (OT): <span class="fw-semibold text-dark">{{ formatOTDays(shift.overtime_days) }}</span>
                  </div>
                </div>

                <div v-if="shiftSubTab === 'active'" class="border-top pt-3 mt-auto">
                   <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="small fw-semibold text-muted">Nhân sự (Hiện tại):</span>
                    <span class="badge bg-light text-dark border">{{ activeAssignsForShift(shift.id).length }} người</span>
                  </div>
                  <div class="d-flex flex-wrap gap-1">
                    <div v-if="activeAssignsForShift(shift.id).length === 0" class="small text-muted fst-italic">
                      Chưa có ai
                    </div>
                    <div v-for="assign in activeAssignsForShift(shift.id).slice(0, 5)" :key="assign.id" 
                         class="avatar-sm bg-brand text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer hover-zoom" 
                         :title="assign.admin?.fullname + ' (Click để xem lịch)'"
                         @click.stop="openHistoryModal(assign.admin, assign)">
                      {{ assign.admin?.fullname?.charAt(0) || 'U' }}
                    </div>
                    <div v-if="activeAssignsForShift(shift.id).length > 5" 
                         class="avatar-sm bg-light text-muted border rounded-circle d-flex align-items-center justify-content-center">
                      +{{ activeAssignsForShift(shift.id).length - 5 }}
                    </div>
                  </div>
                </div>

              </div>
              <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2 justify-content-end">
                <template v-if="shiftSubTab === 'active'">
                  <button class="btn btn-outline-primary btn-sm flex-grow-1 shadow-sm fw-medium" @click="openEditShift(shift)"><i class="bi bi-pencil-square me-1"></i> Sửa</button>
                  <button class="btn btn-outline-secondary btn-sm flex-grow-1 shadow-sm fw-medium" @click="openAssignModal(shift)"><i class="bi bi-person-plus me-1"></i> Gán người</button>
                  <button class="btn btn-outline-danger btn-sm shadow-sm px-3" @click="removeShift(shift)"><i class="bi bi-trash"></i></button>
                </template>
                <template v-else-if="shiftSubTab === 'deleted'">
                  <button class="btn btn-success btn-sm w-100 shadow-sm text-white fw-medium" @click="restoreShift(shift)"><i class="bi bi-arrow-counterclockwise me-1"></i> Khôi phục ca làm</button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: PHÂN CÔNG NHÂN VIÊN                 -->
      <!-- ========================================== -->
      <div v-if="mainTab === 'assignments'">
        
        <!-- Sub-tabs for Assignments -->
        <div class="mb-4">
          <ul class="nav nav-underline border-bottom mb-2 flex-nowrap overflow-hidden pb-1">
            <li class="nav-item">
              <a class="nav-link py-2 px-3 d-flex align-items-center custom-sub-tab" href="#" 
                 :class="{ 'active-tab': assignmentSubTab === 'assigned' }" @click.prevent="assignmentSubTab = 'assigned'">
                <i class="bi bi-person-check-fill me-2"></i> Đã phân công
                <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': assignmentSubTab === 'assigned'}">
                  {{ activeAssignments.length }}
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2 px-3 d-flex align-items-center custom-sub-tab text-secondary" href="#" 
                 :class="{ 'active-tab text-secondary': assignmentSubTab === 'unassigned' }" @click.prevent="assignmentSubTab = 'unassigned'">
                <i class="bi bi-person-dash-fill me-2"></i> Chưa phân công
                <span class="badge ms-2 rounded-pill bg-secondary text-white">
                  {{ unassignedAdmins.length }}
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div v-if="assignmentSubTab === 'assigned'">
        <!-- Bảng điều khiển Gỡ ca hàng loạt -->
        <div v-if="bulkSelectedAssignments.length > 0" class="alert bg-danger-subtle text-danger border-danger border border-opacity-25 d-flex justify-content-between align-items-center shadow-sm rounded-4 mb-3 p-3 transition-all">
          <div>
            <i class="bi bi-check-square-fill me-2 fs-5"></i> 
            Đang chọn <strong>{{ bulkSelectedAssignments.length }}</strong> nhân sự để thao tác.
          </div>
          <button class="btn btn-danger btn-sm fw-bold px-4 shadow-sm" @click="removeBulkAssignments">
            <i class="bi bi-trash-fill me-1"></i> Gỡ ca hàng loạt
          </button>
        </div>

        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="search-box position-relative flex-grow-1" style="max-width: 400px;">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input type="text" class="form-control ps-5 bg-light border-0 rounded-pill" placeholder="Tìm kiếm nhân viên được phân công..." v-model="searchQuery">
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-brand fw-bold text-white shadow-sm" @click="openAutoAssignModal()">
                <i class="bi bi-magic me-1"></i> Tự động xếp ca
              </button>
              <button class="btn btn-outline-primary fw-medium shadow-sm btn-manual" @click="openAssignModal(null)">
                <i class="bi bi-person-plus me-1"></i> Thủ công
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-table">
                <thead class="table-light text-muted small text-uppercase">
                  <tr>
                    <th class="ps-4 text-center" style="width: 50px;">
                      <input class="form-check-input shadow-none" type="checkbox" 
                             :checked="isAllSelected" 
                             @change="toggleSelectAllAssignments">
                    </th>
                    <th>Nhân viên</th>
                    <th>Ca làm cố định</th>
                    <th>Thời gian áp dụng</th>
                    <th class="text-end pe-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoadingShifts">
                    <td colspan="5" class="text-center py-5"><div class="spinner-border text-brand" role="status"></div></td>
                  </tr>
                  <tr v-else-if="!paginatedAssignments.length">
                    <td colspan="5" class="text-center py-5 text-muted">Không tìm thấy dữ liệu phân công phù hợp.</td>
                  </tr>
                  <tr v-for="assign in paginatedAssignments" :key="assign.id" :class="{'bg-light': isAssignmentSelected(assign)}">
                    <td class="ps-4 text-center">
                      <input class="form-check-input shadow-none" type="checkbox" 
                             :value="{ adminId: assign.admin_id, shiftId: assign.work_shift_id }" 
                             v-model="bulkSelectedAssignments">
                    </td>
                    <td>
                      <div class="d-flex align-items-center cursor-pointer hover-bg-light p-1 rounded transition-all" @click="openHistoryModal(assign.admin, assign)" title="Click để xem lịch sử làm việc">
                        <div class="avatar bg-brand text-white rounded-circle me-3 fw-bold d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 40px;">
                          {{ assign.admin?.fullname?.charAt(0) || 'U' }}
                        </div>
                        <div>
                          <h6 class="mb-0 fw-bold text-dark hover-text-brand transition-all">{{ assign.admin?.fullname || 'N/A' }}</h6>
                          <span class="text-muted small">
                            {{ assign.admin?.email || '' }} 
                            <span v-if="assign.admin?.role" class="badge bg-secondary-subtle text-secondary ms-1">{{ assign.admin.role.label }}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border px-3 py-2 fw-medium shadow-sm">
                        <i class="bi bi-clock me-1 text-brand"></i> {{ assign.work_shift?.name || 'Ca đã bị xóa' }}
                      </span>
                    </td>
                    <td>
                      <div class="text-muted small">
                        <div><i class="bi bi-play-circle me-1"></i> Từ: <strong class="text-dark">{{ formatDateUI(assign.valid_from) }}</strong></div>
                        <div v-if="assign.valid_to"><i class="bi bi-stop-circle me-1"></i> Đến: <strong class="text-dark">{{ formatDateUI(assign.valid_to) }}</strong></div>
                        <div v-else><i class="bi bi-infinity me-1"></i> Đến: <span class="badge bg-success-subtle text-success">Vô thời hạn</span></div>
                      </div>
                    </td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-danger fw-medium shadow-sm" 
                              @click="removeAssignment(assign.admin_id, assign.work_shift_id)"
                              title="Gỡ ngay">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Pagination -->
          <div class="card-footer bg-white p-3 border-top d-flex justify-content-between align-items-center">
            <span class="text-muted small fw-medium">Hiển thị {{ paginatedAssignments.length }} / {{ filteredAssignments.length }} kết quả</span>
            <nav v-if="totalPages > 1">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link shadow-none" href="#" @click.prevent="currentPage--">Trước</a>
                </li>
                <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: currentPage === p }">
                  <a class="page-link shadow-none" href="#" @click.prevent="currentPage = p">{{ p }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link shadow-none" href="#" @click.prevent="currentPage++">Sau</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        </div>

        <div v-if="assignmentSubTab === 'unassigned'">
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div class="search-box position-relative flex-grow-1" style="max-width: 400px;">
                <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input type="text" class="form-control ps-5 bg-light border-0 rounded-pill" placeholder="Tìm kiếm nhân viên chưa có ca..." v-model="searchQuery">
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary fw-medium shadow-sm btn-manual" @click="openAssignModal(null)">
                  <i class="bi bi-person-plus me-1"></i> Phân công ngay
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 custom-table">
                  <thead class="table-light text-muted small text-uppercase">
                    <tr>
                      <th class="ps-4">Nhân viên</th>
                      <th>Chức vụ</th>
                      <th>Email</th>
                      <th class="text-end pe-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="adminsLoading">
                      <td colspan="4" class="text-center py-5"><div class="spinner-border text-brand" role="status"></div></td>
                    </tr>
                    <tr v-else-if="!paginatedUnassignedAdmins.length">
                      <td colspan="4" class="text-center py-5 text-muted">Tất cả nhân viên đã được phân công ca làm.</td>
                    </tr>
                    <tr v-for="admin in paginatedUnassignedAdmins" :key="admin.id">
                      <td class="ps-4">
                        <div class="d-flex align-items-center cursor-pointer hover-bg-light p-1 rounded transition-all" @click="openHistoryModal(admin)" title="Click để xem lịch sử làm việc">
                          <div class="avatar bg-secondary-subtle text-dark rounded-circle me-3 fw-bold d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 40px;">
                            {{ admin.fullname?.charAt(0) || 'U' }}
                          </div>
                          <div>
                            <h6 class="mb-0 fw-bold text-dark hover-text-brand transition-all">{{ admin.fullname || 'N/A' }}</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span v-if="admin.role" class="badge bg-secondary-subtle text-secondary">{{ admin.role.label }}</span>
                      </td>
                      <td>
                        <span class="text-muted small">{{ admin.email }}</span>
                      </td>
                      <td class="text-end pe-4">
                        <span class="badge bg-warning-subtle text-warning border border-warning-subtle">Chưa có ca làm</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Pagination -->
            <div class="card-footer bg-white p-3 border-top d-flex justify-content-between align-items-center">
              <span class="text-muted small fw-medium">Hiển thị {{ paginatedUnassignedAdmins.length }} / {{ filteredUnassignedAdmins.length }} kết quả</span>
              <nav v-if="unassignedTotalPages > 1">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link shadow-none" href="#" @click.prevent="currentPage--">Trước</a>
                  </li>
                  <li class="page-item" v-for="p in unassignedTotalPages" :key="p" :class="{ active: currentPage === p }">
                    <a class="page-link shadow-none" href="#" @click.prevent="currentPage = p">{{ p }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === unassignedTotalPages }">
                    <a class="page-link shadow-none" href="#" @click.prevent="currentPage++">Sau</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Gọi Component Modal Tạo/Sửa Ca Làm Việc -->
    <ShiftModal ref="shiftModalComponent" @saved="onShiftSaved" />

    <!-- Gọi Component Lịch Sử Ca Làm Cá Nhân -->
    <AttendanceHistoryModal ref="historyModalRef" />

    <!-- ========================================== -->
    <!-- MODAL: PHÂN CÔNG THỦ CÔNG                  -->
    <!-- ========================================== -->
    <div class="modal fade" id="assignModal" tabindex="-1" style="z-index: 10600;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pb-0 pt-4 px-4">
            <div>
              <h5 class="modal-title fw-bold text-dark">Phân công ca làm việc (Thủ công)</h5>
              <small class="text-muted">Tự chọn nhân viên cụ thể và thời gian áp dụng</small>
            </div>
            <button type="button" class="btn-close shadow-none" @click="closeModal('assignModal')"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-4">
              <!-- Cột chọn Ca làm & Thời gian -->
              <div class="col-md-5 border-end pe-4">
                <div class="mb-4">
                  <label class="form-label fw-semibold text-dark">Ca làm việc áp dụng <span class="text-danger">*</span></label>
                  <select class="form-select form-select-lg bg-light border-0 shadow-none fw-bold text-brand" v-model="formAssign.work_shift_id" required>
                    <option value="" disabled>-- Chọn ca làm việc --</option>
                    <option v-for="shift in activeShifts" :key="shift.id" :value="shift.id">
                      {{ shift.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold text-dark">Từ ngày <span class="text-danger">*</span></label>
                  <input type="date" class="form-control bg-light border-0 shadow-none" v-model="formAssign.valid_from" required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label fw-semibold text-dark">Thời gian áp dụng</label>
                  <select class="form-select bg-light border-0 shadow-none mb-2" v-model="assignDurationType">
                    <option value="custom">Tùy chọn ngày kết thúc</option>
                    <option value="1w">1 Tuần</option>
                    <option value="1m">1 Tháng</option>
                    <option value="3m">3 Tháng</option>
                    <option value="6m">6 Tháng</option>
                    <option value="1y">1 Năm</option>
                    <option value="forever">Vô thời hạn</option>
                  </select>
                  
                  <div v-if="assignDurationType === 'custom'">
                    <input type="date" class="form-control bg-light border-0 shadow-none" v-model="formAssign.valid_to">
                  </div>
                  <div v-else-if="assignDurationType !== 'forever'" class="form-control bg-light border-0 text-muted">
                    Đến: <strong>{{ formatDateUI(formAssign.valid_to) }}</strong>
                  </div>
                  
                  <div v-if="isAssignDurationOverYear" class="alert alert-danger mt-2 py-1 px-2 small mb-0 border-0">
                    <i class="bi bi-exclamation-circle-fill me-1"></i> Cảnh báo: Thời gian quá 1 năm!
                  </div>
                </div>
              </div>

              <!-- Cột chọn Nhân viên -->
              <div class="col-md-7 ps-md-4">
                <label class="form-label fw-semibold text-dark mb-3">Chọn nhân viên (Có thể chọn nhiều) <span class="text-danger">*</span></label>
                
                <div v-if="adminsLoading" class="text-center py-5"><div class="spinner-border text-brand"></div></div>
                
                <div v-else class="row g-2 overflow-auto custom-scrollbar" style="max-height: 280px; padding-right: 5px;">
                  <div v-for="a in admins" :key="a.id" class="col-12">
                    <div class="form-check custom-checkbox-brand p-2 border rounded-3 d-flex align-items-center transition-all bg-white" 
                         :class="{'border-brand bg-light': selectedAdmins.includes(a.id)}">
                      <input class="form-check-input ms-1 me-3 shadow-none flex-shrink-0" type="checkbox" :id="`assign-${a.id}`" v-model="selectedAdmins" :value="a.id" style="width: 20px; height: 20px;">
                      
                      <label class="form-check-label w-100 cursor-pointer d-flex align-items-center justify-content-between" :for="`assign-${a.id}`">
                        <div class="d-flex align-items-center">
                          <div class="avatar bg-secondary-subtle text-dark rounded-circle me-2 fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px; font-size: 14px;">
                            {{ a.fullname.charAt(0) }}
                          </div>
                          <div class="text-truncate" style="max-width: 140px;">
                            <div class="fw-bold text-dark fs-sm text-truncate" :title="a.fullname">{{ a.fullname }}</div>
                            <div class="text-muted text-truncate" style="font-size: 0.75rem;" :title="a.email">{{ a.email }}</div>
                          </div>
                        </div>
                        <!-- CẢNH BÁO ĐANG CÓ CA LÀM -->
                        <div v-if="getAdminCurrentShift(a.id)" class="badge bg-warning-subtle text-warning border border-warning-subtle text-truncate ms-2" style="max-width: 90px;" :title="getAdminCurrentShift(a.id).name">
                          Bận: {{ getAdminCurrentShift(a.id).name }}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button type="button" class="btn btn-light px-4 fw-medium shadow-sm" @click="closeModal('assignModal')">Hủy</button>
              <button type="button" class="btn btn-outline-primary px-4 fw-bold shadow-sm" :disabled="assignLoading" @click="applyAssignments">
                <span v-if="assignLoading" class="spinner-border spinner-border-sm me-2"></span>
                Xác nhận Phân công
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL: TỰ ĐỘNG PHÂN CÔNG (AUTO-ASSIGN) XL  -->
    <!-- ========================================== -->
    <div class="modal fade" id="autoAssignModal" tabindex="-1" style="z-index: 10600;">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pb-0 pt-4 px-4 bg-light bg-gradient rounded-top-4">
            <div>
              <h5 class="modal-title fw-bold text-dark d-flex align-items-center">
                <i class="bi bi-magic text-warning me-2"></i> Tự động Xếp ca
              </h5>
              <small class="text-muted">Quét nhân sự phù hợp, lọc theo phòng ban để phân công tự động một cách tối ưu.</small>
            </div>
            <button type="button" class="btn-close shadow-none" @click="closeModal('autoAssignModal')"></button>
          </div>
          <div class="modal-body p-4 p-md-5">
            <form @submit.prevent="runAutoAssign">
              <div class="row g-4">
                
                <!-- Cột trái: Cấu hình thuật toán & Thời gian (Chiếm 4 cột) -->
                <div class="col-lg-4 border-end pe-lg-4">
                  <h6 class="fw-bold mb-3 text-brand border-bottom pb-2"><i class="bi bi-gear-fill me-2"></i>Cài đặt Ca làm</h6>
                  
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-dark">Ca cần lấp đầy <span class="text-danger">*</span></label>
                    <select class="form-select bg-light border-0 shadow-none fw-bold text-brand" v-model="formAutoAssign.work_shift_id" required>
                      <option value="" disabled>-- Chọn ca làm việc --</option>
                      <option v-for="shift in activeShifts" :key="shift.id" :value="shift.id">
                        {{ shift.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Giới hạn số người -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-dark d-flex justify-content-between">
                      <span>Số lượng nhân sự bổ sung</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-0 text-muted"><i class="bi bi-people"></i></span>
                      <input type="number" class="form-control bg-light border-0 shadow-none" 
                             v-model.number="formAutoAssign.max_employees" 
                             placeholder="VD: Để trống = Không giới hạn" min="1">
                    </div>
                  </div>

                  <!-- Chế độ phân công -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-dark mb-2">Chế độ phân công</label>
                    <div class="form-check custom-radio mb-2">
                      <input class="form-check-input shadow-none" type="radio" name="assignMode" id="modeFree" :value="false" v-model="formAutoAssign.override_existing">
                      <label class="form-check-label cursor-pointer" for="modeFree">
                        <span class="fw-bold d-block text-dark small">Chỉ xếp cho người rảnh</span>
                        <small class="text-muted text-xs">Bỏ qua người đã có ca trong giai đoạn này.</small>
                      </label>
                    </div>
                    <div class="form-check custom-radio">
                      <input class="form-check-input shadow-none" type="radio" name="assignMode" id="modeOverride" :value="true" v-model="formAutoAssign.override_existing">
                      <label class="form-check-label cursor-pointer" for="modeOverride">
                        <span class="fw-bold d-block text-danger small">Phân công lại tất cả (Ghi đè)</span>
                        <small class="text-muted text-xs">Đổi ca những người đang có lịch thành ca này.</small>
                      </label>
                    </div>
                  </div>

                  <!-- Chọn khoảng thời gian -->
                  <div class="row g-2 mb-3">
                    <div class="col-12">
                      <label class="form-label fw-semibold text-dark small">Từ ngày <span class="text-danger">*</span></label>
                      <input type="date" class="form-control bg-light border-0 shadow-none" v-model="formAutoAssign.valid_from" required>
                    </div>
                    <div class="col-12 mt-2">
                      <label class="form-label fw-semibold text-dark small">Đến ngày <span class="text-danger">*</span></label>
                      <select class="form-select bg-light border-0 shadow-none mb-1" v-model="autoAssignDurationType">
                        <option value="custom">Tùy chọn ngày</option>
                        <option value="1w">1 Tuần</option>
                        <option value="1m">1 Tháng</option>
                        <option value="3m">3 Tháng</option>
                      </select>
                      <input v-if="autoAssignDurationType === 'custom'" type="date" class="form-control bg-light border-0 shadow-none" v-model="formAutoAssign.valid_to" required>
                      <div v-else class="text-muted small mt-1">Hết hạn: <strong>{{ formatDateUI(formAutoAssign.valid_to) }}</strong></div>
                    </div>
                  </div>
                </div>

                <!-- Cột phải: Danh sách ứng viên (Chiếm 8 cột) -->
                <div class="col-lg-8 ps-lg-4">
                  <div class="d-flex justify-content-between align-items-end mb-3 border-bottom pb-2">
                     <h6 class="fw-bold mb-0 text-brand"><i class="bi bi-person-lines-fill me-2"></i>Kho Ứng viên Đầu vào</h6>
                     <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary" @click="selectAllCandidates">Chọn hết lọc hiện tại</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" @click="formAutoAssign.candidate_admin_ids = []">Bỏ chọn hết</button>
                     </div>
                  </div>

                  <!-- Bộ lọc nâng cao & Tính năng ẩn người bận -->
                  <div class="row g-2 mb-3 align-items-center">
                    <div class="col-md-5">
                      <div class="input-group shadow-sm rounded-pill" style="overflow:hidden;">
                        <span class="input-group-text bg-white border-0"><i class="bi bi-search text-muted small"></i></span>
                        <input type="text" class="form-control border-0 bg-white shadow-none text-sm py-2" placeholder="Tìm theo tên/email..." v-model="candidateSearchQuery">
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="input-group shadow-sm rounded-pill" style="overflow:hidden;">
                        <span class="input-group-text bg-white border-0"><i class="bi bi-funnel text-muted small"></i></span>
                        <select class="form-select border-0 bg-white shadow-none text-sm py-2" v-model="candidateRoleFilter">
                          <option value="">Tất cả role</option>
                          <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.label || role.value }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3 text-end">
                      <div class="form-check form-switch d-inline-block text-start">
                        <input class="form-check-input" type="checkbox" id="hideBusy" v-model="hideBusyCandidates">
                        <label class="form-check-label text-dark fw-medium small pt-1" style="cursor: pointer;" for="hideBusy">Ẩn người bận</label>
                      </div>
                    </div>
                  </div>

                  <div v-if="adminsLoading || rolesLoading" class="text-center py-5"><div class="spinner-border text-brand"></div></div>
                  
                  <!-- Danh sách Grid 2 cột -->
                  <div v-else class="row g-2 overflow-auto custom-scrollbar border rounded-3 p-3 bg-light bg-opacity-50" style="max-height: 400px;">
                    <div v-for="a in filteredCandidates" :key="'cand-'+a.id" class="col-md-6">
                      <div class="form-check custom-checkbox-brand p-2 border rounded-3 d-flex align-items-center transition-all bg-white shadow-xs h-100"
                           :class="{'border-brand bg-emerald-light': formAutoAssign.candidate_admin_ids.includes(a.id)}">
                        <input class="form-check-input ms-1 me-3 shadow-none flex-shrink-0" type="checkbox" :id="`cand-${a.id}`" v-model="formAutoAssign.candidate_admin_ids" :value="a.id" style="width: 20px; height: 20px;">
                        
                        <label class="form-check-label w-100 cursor-pointer d-flex align-items-center justify-content-between" :for="`cand-${a.id}`">
                          <div class="d-flex align-items-center">
                            <div class="avatar bg-secondary-subtle text-dark rounded-circle me-2 fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style="width: 35px; height: 35px; font-size: 14px;">
                              {{ a.fullname.charAt(0) }}
                            </div>
                            <div class="text-truncate" style="max-width: 140px;">
                              <div class="fw-bold text-dark fs-sm text-truncate mb-0" :title="a.fullname">{{ a.fullname }}</div>
                              <div class="text-muted text-truncate" style="font-size: 0.75rem;" :title="a.email">
                                <span v-if="a.role" class="fw-medium text-secondary">[{{ a.role.label }}]</span> 
                                {{ a.email }}
                              </div>
                            </div>
                          </div>
                          <!-- Trạng thái -->
                          <div class="ms-2">
                            <span v-if="getAdminCurrentShift(a.id)" class="badge bg-warning-subtle text-warning border border-warning-subtle text-xs text-truncate" style="max-width:80px;" :title="getAdminCurrentShift(a.id).name">
                              {{ getAdminCurrentShift(a.id).name }}
                            </span>
                            <span v-else class="badge bg-success-subtle text-success border border-success-subtle text-xs">
                              Rảnh
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div v-if="filteredCandidates.length === 0" class="col-12 text-center py-5 text-muted">
                      <i class="bi bi-person-x fs-1 d-block mb-2 text-black-50"></i>
                      Không tìm thấy nhân viên nào khớp với bộ lọc (Hoặc tất cả đều đang bận).
                    </div>
                  </div>
                  
                  <!-- Dòng thông báo chọn -->
                  <div class="alert alert-info border-0 bg-info-subtle small rounded-3 d-flex align-items-center mt-3 py-2 px-3">
                    <i class="bi bi-info-circle-fill text-info fs-5 me-2"></i>
                    <span class="flex-grow-1">Đang chọn: <strong class="fs-6 text-dark">{{ formAutoAssign.candidate_admin_ids.length }}</strong> nhân sự làm ứng viên.</span>
                    <span v-if="formAutoAssign.candidate_admin_ids.length === 0" class="text-danger fw-bold ms-auto"><i class="bi bi-exclamation-triangle-fill"></i> Chọn ít nhất 1 người!</span>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-3 mt-4 pt-4 border-top">
                <button type="button" class="btn btn-light px-5 py-2 fw-medium shadow-sm" @click="closeModal('autoAssignModal')">Hủy bỏ</button>
                <button type="submit" class="btn btn-brand px-5 py-2 fw-bold text-white shadow-sm" :disabled="isAutoAssigning || formAutoAssign.candidate_admin_ids.length === 0">
                  <span v-if="isAutoAssigning" class="spinner-border spinner-border-sm me-2"></span>
                  <span v-else><i class="bi bi-cpu-fill me-1"></i></span> 
                  Thực thi Phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
import ShiftModal from './ShiftModal.vue'; // Import Component con vừa tách
import AttendanceHistoryModal from './AttendanceHistoryModal.vue';

// --- CONFIG & TOKENS ---
const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('admin_token');
const queryClient = useQueryClient();

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
});

// Xóa triệt để bóng mờ đen (Backdrop) khi file Component cha (WorkShifts.vue) unmount
onBeforeUnmount(() => {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});

// --- STATE CHUNG ---
const isFirstVisit = ref(sessionStorage.getItem('visited_workshifts') !== 'true');
const mainTab = ref('shifts'); // 'shifts' | 'assignments'
const shiftSubTab = ref('active'); // 'active' | 'deleted'
const assignmentSubTab = ref('assigned'); // 'assigned' | 'unassigned'

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// --- BULK UNASSIGN STATE (GỠ CA HÀNG LOẠT) ---
const bulkSelectedAssignments = ref([]);

// --- MODAL REFS ---
const historyModalRef = ref(null);

const openHistoryModal = (admin, assignment = null) => {
  if (historyModalRef.value && admin) {
    historyModalRef.value.openModal(admin, null, assignment);
  }
};

// --- API QUERIES ---
const fetchShifts = async () => {
  const isTrashed = shiftSubTab.value === 'deleted' ? 'true' : 'false';
  const res = await axios.get(`${API_URL}/admin/work-shifts?trashed=${isTrashed}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return res.data.success ? res.data.data : [];
};

const fetchAdmins = async () => {
  const res = await axios.get(`${API_URL}/admin/staff?per_page=1000`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return res.data.success ? (res.data.data.data || res.data.data) : [];
};

const fetchRoles = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/roles`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    return res.data.success ? res.data.data : [];
  } catch (e) {
    return []; // Fallback nếu API chưa sẵn sàng
  }
};

const fetchActiveShifts = async () => {
  const res = await axios.get(`${API_URL}/admin/work-shifts?trashed=false`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return res.data.success ? res.data.data : [];
};

const { data: allActiveShiftsData } = useQuery({ 
  queryKey: ['activeWorkShifts'], 
  queryFn: fetchActiveShifts, 
  staleTime: 1000 * 60 * 5 
});

const { data: shiftsData, isLoading: shiftsLoading } = useQuery({ 
  queryKey: ['workShifts', shiftSubTab], 
  queryFn: fetchShifts, 
  staleTime: 1000 * 60 * 5 
});

const { data: adminsData, isFetching: adminsFetching, refetch: refetchAdmins } = useQuery({ 
  queryKey: ['workShiftAdmins'], 
  queryFn: fetchAdmins, 
  enabled: computed(() => mainTab.value === 'assignments') 
});

const { data: rolesData, isFetching: rolesLoading } = useQuery({
  queryKey: ['adminRoles'],
  queryFn: fetchRoles,
  staleTime: 1000 * 60 * 60
});

// --- COMPUTED DATA ---
const shifts = computed(() => shiftsData.value || []);
const isLoadingShifts = computed(() => shiftsLoading.value);
const activeShiftsForAssignments = computed(() => allActiveShiftsData.value || []);
const activeShifts = computed(() => activeShiftsForAssignments.value);

const admins = computed(() => adminsData.value || []);
const adminsLoading = computed(() => adminsFetching.value);
const roles = computed(() => rolesData.value || []);

const activeShiftsCount = computed(() => {
  if (shiftSubTab.value === 'active') return shifts.value.length;
  const cache = queryClient.getQueryData(['workShifts', ref('active')]);
  return cache ? cache.length : shifts.value.filter(s => !s.deleted_at).length;
});

const deletedShiftsCount = computed(() => {
  if (shiftSubTab.value === 'deleted') return shifts.value.length;
  const cache = queryClient.getQueryData(['workShifts', ref('deleted')]);
  return cache ? cache.length : shifts.value.filter(s => s.deleted_at).length;
});

watch(isLoadingShifts, (newVal) => {
  if (!newVal && isFirstVisit.value) {
    sessionStorage.setItem('visited_workshifts', 'true');
    setTimeout(() => { isFirstVisit.value = false; }, 300);
  }
});

// TẤT CẢ PHÂN CÔNG (Làm phẳng)
const allAssignments = computed(() => {
  if (!activeShiftsForAssignments.value) return [];
  return activeShiftsForAssignments.value.flatMap(shift => {
    return (shift.assignments || []).map(assign => ({
      ...assign,
      work_shift: { id: shift.id, name: shift.name }
    }));
  });
});

// PHÂN CÔNG HIỆN ĐANG ACTIVE
const activeAssignments = computed(() => {
  const today = getLocalDateString();
  return allAssignments.value.filter(a => !a.valid_to || a.valid_to >= today);
});

// Helper functions
const activeAssignsForShift = (shiftId) => activeAssignments.value.filter(a => a.work_shift_id === shiftId);
const getAdminCurrentShift = (adminId) => {
  const assign = activeAssignments.value.find(a => a.admin_id === adminId);
  return assign ? assign.work_shift : null;
};

// Table Pagination
const filteredAssignments = computed(() => {
  let list = activeAssignments.value;
  if (!searchQuery.value) return list;
  const lowerQuery = searchQuery.value.toLowerCase();
  return list.filter(a => a.admin?.fullname?.toLowerCase().includes(lowerQuery));
});
const totalPages = computed(() => Math.ceil(filteredAssignments.value.length / itemsPerPage) || 1);
const paginatedAssignments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredAssignments.value.slice(start, start + itemsPerPage);
});

// Unassigned Pagination
const unassignedAdmins = computed(() => {
  if (!admins.value) return [];
  const assignedAdminIds = activeAssignments.value.map(a => a.admin_id);
  return admins.value.filter(admin => !assignedAdminIds.includes(admin.id));
});

const filteredUnassignedAdmins = computed(() => {
  let list = unassignedAdmins.value;
  if (!searchQuery.value) return list;
  const lowerQuery = searchQuery.value.toLowerCase();
  return list.filter(a => a.fullname?.toLowerCase().includes(lowerQuery) || a.email?.toLowerCase().includes(lowerQuery));
});

const unassignedTotalPages = computed(() => Math.ceil(filteredUnassignedAdmins.value.length / itemsPerPage) || 1);
const paginatedUnassignedAdmins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUnassignedAdmins.value.slice(start, start + itemsPerPage);
});

// Reset lựa chọn Bulk khi đổi trang hoặc tab
watch([currentPage, mainTab, assignmentSubTab, searchQuery], () => {
  bulkSelectedAssignments.value = [];
});

const isAllSelected = computed(() => {
  return paginatedAssignments.value.length > 0 && bulkSelectedAssignments.value.length === paginatedAssignments.value.length;
});

const isAssignmentSelected = (assign) => {
  return bulkSelectedAssignments.value.some(item => item.adminId === assign.admin_id && item.shiftId === assign.work_shift_id);
};

const toggleSelectAllAssignments = (event) => {
  if (event.target.checked) {
    bulkSelectedAssignments.value = paginatedAssignments.value.map(a => ({ adminId: a.admin_id, shiftId: a.work_shift_id }));
  } else {
    bulkSelectedAssignments.value = [];
  }
};

// --- UI FORMATTERS ---
const formatTimeUI = (timeStr) => timeStr ? (timeStr.length > 5 ? timeStr.substring(0, 5) : timeStr) : '--:--';
const formatDateUI = (dateStr) => {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0];
  const [y, m, d] = dateOnly.split('-');
  return `${d}/${m}/${y}`;
};
const formatOTDays = (otArr) => {
  if (!otArr || !Array.isArray(otArr)) return 'Chưa cấu hình';
  const selectedDays = daysOfWeek.filter((_, idx) => otArr[idx]);
  if (selectedDays.length === 7) return 'Cả tuần';
  if (selectedDays.length === 0) return 'Không có';
  return selectedDays.join(', ');
};
const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const closeModal = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (modalEl) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
  }
};

const calculateEndDate = (startDateStr, durationType) => {
  if (!startDateStr || durationType === 'forever' || durationType === 'custom') return '';
  const date = new Date(startDateStr);
  if (durationType === '1w') date.setDate(date.getDate() + 7);
  if (durationType === '1m') date.setMonth(date.getMonth() + 1);
  if (durationType === '3m') date.setMonth(date.getMonth() + 3);
  if (durationType === '6m') date.setMonth(date.getMonth() + 6);
  if (durationType === '1y') date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
};

const checkDurationOverYear = (fromStr, toStr) => {
  if (!fromStr || !toStr) return false;
  const from = new Date(fromStr);
  const to = new Date(toStr);
  const diffTime = Math.abs(to - from);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 365;
};

// --- QUẢN LÝ COMPONENT TẠO/SỬA CA LÀM ---
const shiftModalComponent = ref(null);

function openCreateShift() {
  shiftModalComponent.value?.openModal();
}
function openEditShift(shift) {
  shiftModalComponent.value?.openModal(shift);
}
function onShiftSaved() {
  queryClient.invalidateQueries({ queryKey: ['workShifts'] });
}

// Xóa & Khôi phục ca
async function removeShift(shift) {
  const result = await Swal.fire({
    title: `Xóa ca "${shift.name}"?`,
    text: 'Hệ thống sẽ xóa mềm ca này và tự động gỡ nhân sự thuộc ca để đưa họ về trạng thái rảnh!',
    icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6c757d',
    confirmButtonText: 'Đồng ý xóa', cancelButtonText: 'Hủy'
  });
  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/admin/work-shifts/${shift.id}`, { headers: { Authorization: `Bearer ${token}` } });
      queryClient.invalidateQueries({ queryKey: ['workShifts'] });
      Toast.fire({ icon: 'success', title: 'Đã xóa ca làm việc.' });
    } catch (err) { Toast.fire({ icon: 'error', title: 'Xóa ca thất bại.' }); }
  }
}
async function restoreShift(shift) {
  try {
    await axios.post(`${API_URL}/admin/work-shifts/${shift.id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } });
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    Toast.fire({ icon: 'success', title: 'Khôi phục thành công!' });
  } catch (err) { Toast.fire({ icon: 'error', title: 'Khôi phục thất bại.' }); }
}


// --- MODAL PHÂN CÔNG (MANUAL) ---
const assignLoading = ref(false);
const isRemovingAssign = ref(false);
const selectedAdmins = ref([]);
const assignDurationType = ref('1m');

const formAssign = ref({ work_shift_id: '', valid_from: getLocalDateString(), valid_to: '' });

watch([() => formAssign.value.valid_from, assignDurationType], ([newFrom, newType]) => {
  if (newType === 'forever') formAssign.value.valid_to = '';
  else if (newType !== 'custom') formAssign.value.valid_to = calculateEndDate(newFrom, newType);
}, { immediate: true });

const isAssignDurationOverYear = computed(() => {
  if (assignDurationType.value === 'forever') return false;
  return checkDurationOverYear(formAssign.value.valid_from, formAssign.value.valid_to);
});

function openAssignModal(shiftPreset = null) {
  selectedAdmins.value = [];
  assignDurationType.value = '1m';
  formAssign.value = {
    work_shift_id: shiftPreset ? shiftPreset.id : '',
    valid_from: getLocalDateString(), 
    valid_to: calculateEndDate(getLocalDateString(), '1m')
  };
  if (!admins.value.length) refetchAdmins();
  const modal = new bootstrap.Modal(document.getElementById('assignModal'));
  modal.show();
}

async function applyAssignments() {
  if (!formAssign.value.work_shift_id || !selectedAdmins.value.length) {
    Toast.fire({ icon: 'warning', title: 'Vui lòng chọn ca và ít nhất 1 nhân viên!' }); return;
  }
  const conflicts = selectedAdmins.value.filter(id => getAdminCurrentShift(id) != null);
  if (conflicts.length > 0) {
    const confirm = await Swal.fire({
      title: 'Xác nhận ghi đè',
      html: `Có <b>${conflicts.length}</b> nhân viên đang có ca làm việc khác. <br/>Chuyển họ sang ca này?`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#009981', cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý Đổi ca'
    });
    if (!confirm.isConfirmed) return;
  }
  assignLoading.value = true;
  try {
    await axios.post(`${API_URL}/admin/work-shifts/assign-multiple`, {
      admin_ids: selectedAdmins.value, work_shift_id: formAssign.value.work_shift_id,
      valid_from: formAssign.value.valid_from, valid_to: assignDurationType.value === 'forever' ? undefined : formAssign.value.valid_to,
    }, { headers: { Authorization: `Bearer ${token}` } });
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    Toast.fire({ icon: 'success', title: 'Phân công thành công.' });
    closeModal('assignModal');
  } catch (err) { Toast.fire({ icon: 'error', title: 'Có lỗi khi phân công.' }); } 
  finally { assignLoading.value = false; }
}

async function removeAssignment(adminId, shiftId) {
  isRemovingAssign.value = true;
  try {
    // Không dùng SweetAlert bắt confirm thủ công để thao tác ĐƯỢC NHANH HƠN 
    await axios.delete(`${API_URL}/admin/work-shifts/assignments/${adminId}`, {
      params: { work_shift_id: shiftId }, headers: { Authorization: `Bearer ${token}` }
    });
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    Toast.fire({ icon: 'success', title: 'Đã gỡ ca làm việc' });
  } catch (err) { Toast.fire({ icon: 'error', title: 'Thất bại.' }); }
  finally { isRemovingAssign.value = false; }
}

// Xử lý Gỡ ca HÀNG LOẠT cực nhanh
async function removeBulkAssignments() {
  const result = await Swal.fire({
    title: `Gỡ ca ${bulkSelectedAssignments.value.length} nhân sự?`,
    text: 'Bạn sắp gỡ bỏ phân công lịch cố định của các nhân sự đã chọn!',
    icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Đồng ý gỡ'
  });
  if (result.isConfirmed) {
    try {
      // Loop bắn API gỡ từng người (có thể gộp API bulk delete ở BE nếu muốn tối ưu hơn)
      const deletePromises = bulkSelectedAssignments.value.map(item => 
        axios.delete(`${API_URL}/admin/work-shifts/assignments/${item.adminId}`, {
          params: { work_shift_id: item.shiftId }, headers: { Authorization: `Bearer ${token}` }
        })
      );
      await Promise.all(deletePromises);
      queryClient.invalidateQueries({ queryKey: ['workShifts'] });
      Toast.fire({ icon: 'success', title: `Đã gỡ ${bulkSelectedAssignments.value.length} nhân sự khỏi ca.` });
      bulkSelectedAssignments.value = []; // Reset sau khi xóa xong
    } catch (err) { Toast.fire({ icon: 'error', title: 'Có lỗi khi gỡ hàng loạt.' }); }
  }
}

// --- MODAL TỰ ĐỘNG PHÂN CÔNG (AUTO-ASSIGN) NÂNG CẤP ---
const isAutoAssigning = ref(false);
const autoAssignDurationType = ref('1w');
const candidateSearchQuery = ref('');
const candidateRoleFilter = ref('');
const hideBusyCandidates = ref(false); // Tính năng ẩn người bận theo yêu cầu

const formAutoAssign = ref({
  work_shift_id: '',
  valid_from: getLocalDateString(),
  valid_to: '',
  override_existing: false, 
  max_employees: null,      
  candidate_admin_ids: []   
});

// Lọc ứng viên (Search Name/Email + Role Filter + Hide Busy)
const filteredCandidates = computed(() => {
  if (!admins.value) return [];
  return admins.value.filter(a => {
    const q = candidateSearchQuery.value.toLowerCase();
    const matchNameEmail = a.fullname?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
    const matchRole = candidateRoleFilter.value === '' || (a.role_id === candidateRoleFilter.value || a.role?.id === candidateRoleFilter.value);
    
    // Nếu bật công tắc "Ẩn người bận", loại bỏ những ai đang có ca làm
    if (hideBusyCandidates.value && getAdminCurrentShift(a.id)) {
      return false;
    }

    return matchNameEmail && matchRole;
  });
});

watch([() => formAutoAssign.value.valid_from, autoAssignDurationType], ([newFrom, newType]) => {
  if (newType !== 'custom') formAutoAssign.value.valid_to = calculateEndDate(newFrom, newType);
}, { immediate: true });

function openAutoAssignModal() {
  autoAssignDurationType.value = '1w';
  candidateSearchQuery.value = '';
  candidateRoleFilter.value = '';
  hideBusyCandidates.value = false;
  
  formAutoAssign.value = {
    work_shift_id: '',
    valid_from: getLocalDateString(),
    valid_to: calculateEndDate(getLocalDateString(), '1w'),
    override_existing: false,
    max_employees: null,
    candidate_admin_ids: [] // MẶC ĐỊNH BỎ CHỌN TRỐNG NHƯ YÊU CẦU
  };

  if (!admins.value.length) refetchAdmins();

  const modal = new bootstrap.Modal(document.getElementById('autoAssignModal'));
  modal.show();
}

function selectAllCandidates() {
  // Chọn tất cả những người CÓ TRONG KẾT QUẢ LỌC HIỆN TẠI (Đã bao gồm điều kiện loại người bận nếu bật công tắc)
  formAutoAssign.value.candidate_admin_ids = filteredCandidates.value.map(a => a.id);
}

async function runAutoAssign() {
  if (!formAutoAssign.value.work_shift_id) { Toast.fire({ icon: 'warning', title: 'Chọn ca để xếp!' }); return; }
  
  isAutoAssigning.value = true;
  try {
    const res = await axios.post(`${API_URL}/admin/work-shifts/auto-assign`, formAutoAssign.value, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    queryClient.invalidateQueries({ queryKey: ['workShifts'] });
    Swal.fire({ icon: 'success', title: 'Xếp ca thành công!', text: res.data.message || 'Hoàn tất.', confirmButtonColor: '#009981' });
    closeModal('autoAssignModal');
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Không thể xếp ca', text: err.response?.data?.message || 'Lỗi cấu hình phân công.', confirmButtonColor: '#009981' });
  } finally {
    isAutoAssigning.value = false;
  }
}

</script>

<style>
/* FIX Z-INDEX CHO MODAL VÀ BACKDROP TOÀN CỤC BỊ SIDEBAR ĐÈ:
  (Không được dùng scoped cho phần này để tác động được ra ngoài body)
*/
.modal-backdrop {
  z-index: 10590 !important;
}
</style>

<style scoped>
.page-container { max-width: 1400px; }
.btn-brand { background-color: #009981; border-color: #009981; }
.btn-brand:hover, .btn-brand:active { background-color: #007a67 !important; border-color: #007a67 !important; }
.text-brand { color: #009981 !important; }
.bg-brand { background-color: #009981 !important; }
.border-brand { border-color: #009981 !important; }

.btn-manual { border-color: #0d6efd; color: #0d6efd; background-color: transparent;}
.btn-manual:hover { background-color: #0d6efd !important; color: white !important;}
.nav-segment-wrapper { background-color: #f1f5f9; }

.custom-sub-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; text-decoration: none; }
.custom-sub-tab:hover { color: #009981; }
.custom-sub-tab.active-tab { color: #009981 !important; border-bottom: 2.5px solid #009981 !important; }
.custom-sub-tab.active-tab.text-danger { color: #dc3545 !important; border-bottom: 2.5px solid #dc3545 !important; }

.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

.shift-card { border-radius: 1rem; transition: transform 0.2s ease, box-shadow 0.2s ease; border: 1px solid rgba(0,0,0,0.06); }
.transition-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; }
.shift-card .card-body { min-height: 280px; }
.avatar-sm { width: 28px; height: 28px; font-size: 12px; font-weight: bold;}

.badge-day { font-size: 0.75rem; padding: 0.5em 0.8em; border-radius: 999px; }
.badge-active { background-color: #009981; color: #ffffff; }
.badge-inactive { background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }

.custom-checkbox-brand input:checked + label .fs-sm { color: #009981 !important; }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease-in-out; }

.custom-radio .form-check-input:checked { background-color: #009981; border-color: #009981;}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

.skeleton-card { border-color: #f1f5f9; }
.skeleton-line { background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%); background-size: 200% 100%; animation: 1.5s pulse linear infinite; }
.skeleton-avatar { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; animation: pulse 1.5s infinite; }
.shimmer-wrapper { min-height: 60vh; }
.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: pulse 1.5s linear infinite; }

.bg-emerald-light { background-color: #ecfdf5 !important; }
.text-xs { font-size: 0.75rem !important; }
.fs-xs { font-size: 0.825rem !important; }
.shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
@keyframes pulse { 0% { background-position-x: -200%; } 100% { background-position-x: 200%; } }
</style>