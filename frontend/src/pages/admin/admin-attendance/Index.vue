<template>
  <div class="attendance-dashboard-wrapper pb-5 mb-5">

    <div v-if="isFirstVisit && isLoading"
      class="d-flex flex-column justify-content-center align-items-center w-100 shimmer-wrapper">
      <div class="logo-shimmer-container text-center">
        <h1 class="logo-shimmer mb-2">ThinkHub</h1>
        <p class="loading-text text-muted fw-bold small text-uppercase tracking-widest mt-2"
          style="letter-spacing: 3px; font-size: 0.75rem;">Đang tải dữ liệu...</p>
      </div>
    </div>

    <div class="container-fluid py-4 px-4" v-show="!isFirstVisit || !isLoading">

      <div class="row mb-4 align-items-center gy-3">
        <div class="col-lg-6">
          <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="bi bi-calendar3 text-brand"></i>
            Chấm công tháng
          </h3>
          <p class="text-muted small mb-0">Lọc nhanh theo tháng, ca làm và chức vụ.</p>
        </div>
      </div>

      <div class="row g-3 mb-4" v-if="isSummaryLoading">
        <div class="col-xl-3 col-md-6" v-for="i in 4" :key="'kpi-skel-' + i">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3 d-flex align-items-center gap-3">
              <div class="skeleton" style="width: 44px; height: 44px; border-radius: 12px;"></div>
              <div class="flex-grow-1">
                <div class="skeleton mb-2" style="width: 60%; height: 12px; border-radius: 4px;"></div>
                <div class="skeleton" style="width: 30%; height: 24px; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4" v-else>
        <div class="col-xl-3 col-md-6" v-for="kpi in kpiSummaries" :key="kpi.title">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3 d-flex align-items-center gap-3">
              <div class="icon-box-small" :class="kpi.bgClass"><i :class="kpi.icon"></i></div>
              <div>
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.75rem;">{{ kpi.title }}
                </div>
                <h4 class="fw-black mb-0 text-dark">{{ kpi.value }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 bg-white mb-4">
        <div class="card-body p-4">
          
          <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center mb-3 gap-3">
            <div class="me-auto">
              <h5 class="fw-bold text-dark mb-1">Chấm Công Tháng {{ formatMonthYear(selectedMonth) }}</h5>
            </div>
            
            <div class="d-flex gap-3 flex-wrap align-items-center">
              <div class="filter-control-panel d-flex align-items-center bg-white border rounded-4 px-3 py-2 shadow-sm">
                <i class="bi bi-calendar-month text-brand me-2 fs-6"></i>
                <input type="month" v-model="selectedMonth" @change="handleMonthChange"
                  class="form-control form-control-sm border-0 shadow-none p-0 fw-bold text-dark bg-transparent"
                  style="outline: none; min-width: 130px; cursor: pointer;">
              </div>

              <!-- Lọc theo Ca làm việc -->
              <div class="filter-control-panel bg-white border rounded-4 px-3 py-2 shadow-sm d-flex align-items-center">
                <i class="bi bi-clock text-brand me-2 fs-6"></i>
                <select v-model="selectedShift"
                  class="form-select form-select-sm border-0 shadow-none p-0 fw-bold text-dark bg-transparent pe-3"
                  style="outline: none; min-width: 130px; cursor: pointer;">
                  <option value="all">Tất cả ca làm</option>
                  <option v-for="shift in availableShifts" :key="shift.id" :value="shift.id">
                    {{ shift.name }}
                  </option>
                </select>
              </div>

              <!-- Lọc theo Chức vụ -->
              <div class="filter-control-panel bg-white border rounded-4 px-3 py-2 shadow-sm d-flex align-items-center">
                <i class="bi bi-person-badge text-brand me-2 fs-6"></i>
                <select v-model="selectedRole"
                  class="form-select form-select-sm border-0 shadow-none p-0 fw-bold text-dark bg-transparent pe-3"
                  style="outline: none; min-width: 130px; cursor: pointer;">
                  <option value="all">Tất cả chức vụ</option>
                  <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <div class="d-flex gap-2">
                <button @click="refetchAll"
                  class="btn btn-brand btn-icon shadow-sm rounded-circle text-white"
                  type="button"
                  title="Tải lại dữ liệu">
                  <i class="bi bi-arrow-clockwise fs-5" :class="{ 'fa-spin': isLoading }"></i>
                </button>
                <button @click="resetFilters"
                  class="btn btn-light btn-icon shadow-sm rounded-circle text-dark"
                  type="button"
                  title="Xóa bộ lọc">
                  <i class="bi bi-eraser fs-5"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-0 shadow-sm rounded-4 bg-light-subtle p-3 mb-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-3">
                  <div>
                    <h5 class="fw-bold text-dark mb-1">Xu hướng điểm danh</h5>
                  </div>
                </div>
                <div class="position-relative" style="min-height: 280px;">
                  <canvas id="attendanceTrendChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex gap-3 align-items-center flex-wrap mb-3 px-1" style="font-size: 0.8rem;">
            <span class="d-flex align-items-center gap-2 text-muted">
              <span class="legend-dot bg-success shadow-sm"></span> Đúng giờ
            </span>
            <span class="d-flex align-items-center gap-2 text-muted">
              <span class="legend-dot bg-warning shadow-sm"></span> Đi muộn
            </span>
            <span class="d-flex align-items-center gap-2 text-muted">
              <span class="legend-dot bg-danger shadow-sm"></span> Vắng
            </span>
          </div>

          <div class="calendar-container shadow-sm border rounded-4 overflow-hidden" v-if="isSummaryLoading">
            <div class="calendar-header-row bg-light">
              <div class="calendar-header-col"
                v-for="dayName in ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']"
                :key="'skel-head-' + dayName">
                {{ dayName }}
              </div>
            </div>
            <div class="calendar-body">
              <div class="calendar-week" v-for="w in 5" :key="'skel-week-' + w">
                <div class="calendar-day-summary" v-for="d in 7" :key="'skel-day-' + d">
                  <div class="d-flex justify-content-end mb-2">
                    <div class="skeleton" style="width: 18px; height: 18px; border-radius: 4px;"></div>
                  </div>
                  <div class="mt-auto d-flex flex-column gap-1">
                    <div class="skeleton w-100 rounded-pill" style="height: 6px;"></div>
                    <div class="d-flex justify-content-between mt-1">
                      <div class="skeleton" style="width: 30%; height: 8px;"></div>
                      <div class="skeleton" style="width: 45%; height: 8px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="calendar-container shadow-sm border rounded-4 overflow-hidden" v-else>
            <div class="calendar-header-row bg-light">
              <div class="calendar-header-col"
                v-for="dayName in ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']" :key="dayName">
                {{ dayName }}
              </div>
            </div>

            <div class="calendar-body">
              <div class="calendar-week" v-for="(week, wIndex) in monthlyGrid" :key="'week-' + wIndex">
                <div class="calendar-day-summary" v-for="day in week" :key="day.date || Math.random()" :class="{
                  'not-current-month': !day.isCurrentMonth,
                  'is-today': isToday(day.date),
                  'is-selected-day': drillDownDate === day.date,
                  'heatmap-warning': day.isCurrentMonth && isLateWarning(day.summaryData)
                }" @click="handleDayClick(day)">
                  <div class="day-number-row d-flex justify-content-between align-items-center">
                    <span v-if="isToday(day.date)" class="badge bg-brand text-white py-1 px-2"
                      style="font-size: 0.65rem;">Hôm nay</span>
                    <span v-else></span>
                    <span class="day-num" :class="{ 'text-brand fw-black': isToday(day.date) }">{{ day.dayNumber }}</span>
                  </div>

                  <div class="day-summary-visual mt-2 flex-grow-1 d-flex flex-column justify-content-end"
                    v-if="day.isCurrentMonth && day.summaryData">

                    <div class="progress progress-stacked-mini rounded-pill mb-2" style="height: 6px;">
                      <div class="progress-bar bg-success"
                        :style="{ width: getPercentage(day.summaryData.present, day.summaryData.total) + '%' }"
                        title="Đúng giờ"></div>
                      <div class="progress-bar bg-warning"
                        :style="{ width: getPercentage(day.summaryData.late, day.summaryData.total) + '%' }"
                        title="Đi muộn"></div>
                      <div class="progress-bar bg-danger"
                        :style="{ width: getPercentage(day.summaryData.absent, day.summaryData.total) + '%' }"
                        title="Vắng"></div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center text-muted fw-semibold"
                      style="font-size: 0.68rem; letter-spacing: -0.2px;">
                      <span>Tổng: <strong class="text-dark">{{ day.summaryData.total }}</strong></span>
                      <span class="d-flex gap-1">
                        <span class="text-success" title="Đúng giờ">{{ day.summaryData.present }}</span>/
                        <span class="text-warning-emphasis fw-bold" title="Đi muộn">{{ day.summaryData.late }}m</span>/
                        <span class="text-danger" title="Vắng">{{ day.summaryData.absent }}v</span>
                      </span>
                    </div>

                    <div v-if="isLateWarning(day.summaryData)"
                      class="alert-pulse-badge mt-1 text-center py-0 px-1 rounded">
                      <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 0.65rem;"></i>
                      <span class="text-warning-emphasis ms-1" style="font-size: 0.6rem; font-weight: 800;">Cảnh báo đi
                        muộn</span>
                    </div>
                  </div>

                  <div
                    class="day-summary-visual mt-2 flex-grow-1 d-flex flex-column justify-content-center align-items-center text-muted"
                    v-else-if="day.isCurrentMonth">
                    <span class="text-uppercase"
                      :class="isPastOrToday(day.date) ? 'text-secondary opacity-50 fw-bold' : 'text-muted opacity-25 fw-normal'"
                      style="font-size: 0.68rem; letter-spacing: 0.5px;">
                      Nghỉ tuần
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 bg-white table-card mt-4" ref="drillDownSection">
        <div class="card-body p-4 d-flex flex-column h-100">

          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom pb-3 mb-4 gap-2">
            <div class="table-heading-group">
              <h5 class="fw-bold text-dark mb-1 d-flex align-items-center flex-wrap gap-2">
                <i class="bi bi-box-arrow-in-down-right text-brand"></i>
                Chi tiết nhân sự ngày:
                <span class="badge bg-brand text-white px-3 py-1.5 fs-6 shadow-sm">{{ formatDateVN(drillDownDate)
                  }}</span>
              </h5>
              <p class="text-muted small mb-0">Danh sách đi làm chi tiết, trạng thái Check-in/Check-out của ngày được
                chọn.</p>
            </div>
          </div>

          <div class="row g-3 mb-4" v-if="isDailyLoading">
            <div class="col-6 col-lg-3" v-for="i in 4" :key="'detail-skel-' + i">
              <div class="card border-0 shadow-sm rounded-4 bg-light-subtle">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="skeleton" style="width: 44px; height: 44px; border-radius: 12px;"></div>
                  <div class="flex-grow-1">
                    <div class="skeleton mb-2" style="width: 70%; height: 12px;"></div>
                    <div class="skeleton" style="width: 40%; height: 22px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-3 mb-4" v-else>
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                :class="statusFilter === 'all' ? 'active-metric-filter' : 'bg-light-subtle'"
                @click="statusFilter = 'all'" title="Xem tất cả nhân sự">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-primary-subtle text-primary"><i class="bi bi-people-fill"></i></div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate"
                      style="font-size: 0.72rem; letter-spacing: 0.5px;">Tổng nhân sự</div>
                    <h4 class="fw-black mb-0 text-dark">{{ drillDownList.length }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                :class="statusFilter === 'present' ? 'active-metric-filter-success' : 'bg-light-subtle'"
                @click="statusFilter = 'present'" title="Xem nhân sự đúng giờ">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-success-subtle text-success"><i class="bi bi-person-check-fill"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate"
                      style="font-size: 0.72rem; letter-spacing: 0.5px;">Đã Check-in</div>
                    <h4 class="fw-black mb-0 text-success">{{ getCountByStatus('present') }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                :class="statusFilter === 'late' ? 'active-metric-filter-warning' : 'bg-light-subtle'"
                @click="statusFilter = 'late'" title="Xem nhân sự đi muộn">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-warning-subtle text-warning-emphasis"><i
                      class="bi bi-person-exclamation"></i></div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate"
                      style="font-size: 0.72rem; letter-spacing: 0.5px;">Đi muộn</div>
                    <h4 class="fw-black mb-0 text-warning-emphasis">{{ getCountByStatus('late') }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                :class="statusFilter === 'absent' ? 'active-metric-filter-danger' : 'bg-light-subtle'"
                @click="statusFilter = 'absent'" title="Xem nhân sự chưa check-in">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-secondary-subtle text-secondary"><i class="bi bi-person-dash-fill"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate"
                      style="font-size: 0.72rem; letter-spacing: 0.5px;">Chưa Check-in</div>
                    <h4 class="fw-black mb-0 text-secondary">{{ getCountByStatus('absent') }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-12">
              <div class="search-panel w-100">
                <div class="input-group shadow-sm rounded-3 overflow-hidden">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" v-model="searchQuery"
                    class="form-control bg-white border-start-0 ps-0 shadow-none py-2"
                    placeholder="Tìm tên hoặc email nhân sự trong danh sách ngày...">
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive flex-grow-1">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="border-0 text-muted small py-3 align-top rounded-start-3">Nhân sự</th>
                  <th class="border-0 text-muted small py-3 align-top">Ca làm việc</th>
                  <th class="border-0 text-muted small py-3 align-top">Bắt đầu</th>
                  <th class="border-0 text-muted small py-3 align-top">Kết thúc</th>
                  <th class="border-0 text-muted small py-3 align-top">Giờ Vào</th>
                  <th class="border-0 text-muted small py-3 align-top">Giờ Ra</th>
                  <th class="border-0 text-muted small py-3 align-top">Trạng thái ca</th>
                  <th class="border-0 text-muted small py-3 align-top">Checkout</th>
                  <th class="border-0 text-muted small py-3 align-top rounded-end-3">Hành động</th>
                </tr>
              </thead>

              <tbody v-if="isDailyLoading">
                <tr v-for="i in 5" :key="'table-skel-' + i">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="skeleton rounded-circle me-3" style="width: 42px; height: 42px;"></div>
                      <div>
                        <div class="skeleton mb-2" style="width: 130px; height: 14px;"></div>
                        <div class="skeleton" style="width: 90px; height: 12px;"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 90px; height: 14px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 45px; height: 14px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 45px; height: 14px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 45px; height: 14px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 45px; height: 14px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 80px; height: 24px; border-radius: 12px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 80px; height: 24px; border-radius: 12px;"></div>
                  </td>
                  <td>
                    <div class="skeleton" style="width: 110px; height: 32px; border-radius: 8px;"></div>
                  </td>
                </tr>
              </tbody>

              <tbody v-else>
                <tr v-for="admin in paginatedDrillDownList" :key="admin.id">
                  <td class="fw-bold text-dark">
                    <div class="d-flex align-items-center">
                      <div class="avatar-small me-3">
                        <SoraImage v-if="admin.avatar_url" :src="getFullImage(admin.avatar_url)"
                          :placeholder="defaultAvatar" imgClass="rounded-circle w-100 h-100 shadow-sm"
                          style="object-fit: cover;" alt="Avatar" />
                        <span v-else>{{ admin.fullname?.charAt(0) }}</span>
                      </div>
                      <div>
                        <div class="mb-1">{{ admin.fullname }}</div>
                        <div class="d-flex flex-column gap-1 align-items-start">
                          <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.7rem;">{{ admin.email }}</span>
                          <span v-if="admin.role" class="badge fw-normal"
                            :class="admin.role.badgeClass || 'bg-primary-subtle text-primary'"
                            style="font-size: 0.7rem;">
                            {{ admin.role.label }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span v-if="getAdminShift(admin)" class="fw-semibold text-dark">{{ getAdminShift(admin).name
                      }}</span><span v-else class="text-muted small fst-italic">Hành chính</span></td>
                  <td><span v-if="getAdminShift(admin)" class="text-dark fw-semibold">{{
                    formatTimeOnly(getAdminShift(admin).start_time) }}</span><span v-else
                      class="text-muted">--:--</span></td>
                  <td><span v-if="getAdminShift(admin)" class="text-dark fw-semibold">{{
                    formatTimeOnly(getAdminShift(admin).end_time) }}</span><span v-else
                      class="text-muted">--:--</span></td>
                  <td>
                    <div v-if="admin.attendance?.clock_in" class="fw-bold text-success">{{
                      formatTimeOnly(admin.attendance.clock_in) }}</div>
                    <div v-else class="text-muted small">--:--</div>
                  </td>
                  <td>
                    <div v-if="admin.attendance?.clock_out" class="fw-bold text-warning-emphasis">{{
                      formatTimeOnly(admin.attendance.clock_out) }}</div>
                    <div v-else class="text-muted small">--:--</div>
                  </td>
                  <td>
                    <span v-if="admin.attendance" :class="getStatusBadgeClass(getRealStatus(admin.attendance))">
                      {{ getStatusLabel(getRealStatus(admin.attendance)) }}
                      <small v-if="getRealLateMinutes(admin.attendance) > 0">({{
                        formatDuration(getRealLateMinutes(admin.attendance)) }})</small>
                    </span>
                    <span v-else
                      class="badge bg-secondary-subtle text-secondary border border-secondary border-dashed">Chưa
                      Check-in</span>
                  </td>
                  <td>
                    <span v-if="admin.attendance"
                      :class="getCheckoutStatusBadgeClass(getDisplayCheckoutStatus(admin.attendance, drillDownDate))">{{
                        getCheckoutStatusLabel(getDisplayCheckoutStatus(admin.attendance, drillDownDate)) }}</span>
                    <div v-if="admin.attendance && getRealEarlyLeave(admin.attendance) > 0" class="mt-1">
                      <span class="badge bg-warning-subtle text-warning-emphasis border border-warning"
                        style="font-size: 0.65rem;">Về sớm {{ formatDuration(getRealEarlyLeave(admin.attendance))
                        }}</span>
                    </div>
                    <span v-else-if="!admin.attendance" class="text-muted small">--</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-2">
                      <button class="btn btn-sm btn-outline-primary shadow-sm rounded-3" @click="openHistoryModal(admin)">
                        <i class="bi bi-calendar-check me-1"></i>Xem lịch tháng
                      </button>
                      <button class="btn btn-sm btn-outline-success shadow-sm rounded-3" @click="openAdjustmentModal(admin)">
                        <i class="bi bi-pencil-square me-1"></i>Điều chỉnh
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedDrillDownList.length === 0">
                  <td colspan="9" class="text-center py-5 text-muted">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                      <i class="bi bi-search fs-1 mb-3 opacity-50"></i>
                      <p class="mb-0 fw-semibold">Không tìm thấy nhân sự nào khớp với điều kiện.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3"
            v-if="totalPages > 1 && !isDailyLoading">
            <span class="text-muted small fw-semibold">
              Đang hiển thị <span class="text-dark">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> đến <span
                class="text-dark">{{ Math.min(currentPage * itemsPerPage, filteredDrillDownList.length) }}</span> trong
              tổng số <span class="text-dark">{{ filteredDrillDownList.length }}</span> bản ghi
            </span>
            <ul class="pagination pagination-sm mb-0 shadow-sm">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--"><i class="bi bi-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 bg-white table-card mt-4">
        <div class="card-body p-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
            <div>
              <h5 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-clock-history text-brand"></i>
                Lịch sử điều chỉnh giờ công
              </h5>
              <p class="text-muted small mb-0">Các lần chỉnh sửa trong tháng đang chọn, phục vụ đối soát và truy vết.</p>
            </div>
            <button class="btn btn-light btn-sm rounded-3 shadow-sm" @click="refetchAdjustments">
              <i class="bi bi-arrow-clockwise me-1"></i>Tải lại
            </button>
          </div>

          <div v-if="isAdjustmentsLoading" class="d-flex flex-column gap-2">
            <div v-for="i in 3" :key="'adjustment-skel-' + i" class="skeleton rounded-3" style="height: 58px;"></div>
          </div>
          <div v-else-if="adjustmentLogs.length === 0" class="text-center py-4 text-muted">
            <i class="bi bi-journal-check fs-2 d-block mb-2 opacity-50"></i>
            Chưa có điều chỉnh nào trong tháng này.
          </div>
          <div v-else class="adjustment-log-list">
            <div v-for="log in adjustmentLogs" :key="log.id" class="adjustment-log-item">
              <div class="d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div>
                  <div class="fw-bold text-dark">
                    {{ log.admin?.fullname || 'Nhân sự' }}
                    <span class="text-muted fw-normal small">({{ log.admin?.email || '--' }})</span>
                  </div>
                  <div class="small text-muted">
                    Ngày {{ formatDateVN(log.attendance_date?.split?.('T')?.[0] || log.attendance_date) }}
                    • {{ log.work_shift?.name || 'Không có ca' }}
                    • Sửa bởi {{ log.adjusted_by?.fullname || 'Quản lý' }}
                  </div>
                  <div class="small text-secondary mt-1">Lý do: {{ log.reason }}</div>
                </div>
                <div class="text-lg-end small flex-shrink-0">
                  <div>
                    <span class="text-muted">Vào:</span>
                    <strong>{{ formatTimeOnly(log.old_clock_in) }}</strong>
                    <i class="bi bi-arrow-right mx-1 text-muted"></i>
                    <strong class="text-success">{{ formatTimeOnly(log.new_clock_in) }}</strong>
                  </div>
                  <div>
                    <span class="text-muted">Ra:</span>
                    <strong>{{ formatTimeOnly(log.old_clock_out) }}</strong>
                    <i class="bi bi-arrow-right mx-1 text-muted"></i>
                    <strong class="text-warning-emphasis">{{ formatTimeOnly(log.new_clock_out) }}</strong>
                  </div>
                  <div class="text-muted mt-1">{{ formatDateTimeVN(log.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <AttendanceHistoryModal ref="historyModalRef" />
    <AttendanceAdjustmentModal ref="adjustmentModalRef" :work-shifts="availableShifts" @saved="handleAdjustmentSaved" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onActivated, onUnmounted } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';

import SoraImage from '@/components/ui/SoraImage.vue';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';
import { getFullImage } from '@/composables/useUtilities';
import adminApiClient from '@/utils/adminApiClient';
import AttendanceHistoryModal from './AttendanceHistoryModal.vue';
import AttendanceAdjustmentModal from './AttendanceAdjustmentModal.vue';

// Cấu hình Toast thông báo
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

// State chính
const isFirstVisit = ref(sessionStorage.getItem('visited_attendance_dashboard') !== 'true');
const selectedMonth = ref(getVietnamDateString().substring(0, 7)); 
const drillDownDate = ref(getVietnamDateString()); 
const searchQuery = ref('');
const statusFilter = ref('all'); 
const selectedRole = ref('all'); 
const selectedShift = ref('all'); // State mới cho chức năng Lọc Ca Làm Việc
const currentPage = ref(1);
const itemsPerPage = 6; 

const historyModalRef = ref(null);
const adjustmentModalRef = ref(null);
const drillDownSection = ref(null);
let attendanceChartInstance = null;

// Reset tất cả các bộ lọc về mặc định ban đầu
const resetFilters = () => {
  selectedMonth.value = getVietnamDateString().substring(0, 7);
  drillDownDate.value = getVietnamDateString();
  searchQuery.value = '';
  statusFilter.value = 'all';
  selectedRole.value = 'all';
  selectedShift.value = 'all'; // Reset ca làm việc
  currentPage.value = 1;
  refetchSummary();
  refetchDailyDetail();
};

const handleMonthChange = () => {
  drillDownDate.value = `${selectedMonth.value}-01`;
  currentPage.value = 1;
};

// 0. QUERY API LẤY DANH SÁCH ROLE
const { data: rolesList } = useQuery({
  queryKey: ['rolesListForFilter'],
  queryFn: async () => {
    try {
      const response = await adminApiClient.get('/attendances/roles');
      return response.data.success ? response.data.data : [];
    } catch (e) {
      console.warn("API lỗi roles, dùng Fallback");
      return [];
    }
  },
  staleTime: 1000 * 60 * 60,
  initialData: []
});

// 1. QUERY API LẤY DANH SÁCH WORK SHIFTS
const { data: workShiftsList } = useQuery({
  queryKey: ['workShiftsForFilter'],
  queryFn: async () => {
    try {
      const response = await adminApiClient.get('/attendances/work-shifts');
      return response.data.success ? response.data.data : [];
    } catch (e) {
      console.warn("API lỗi work-shifts, dùng Fallback");
      return [];
    }
  },
  staleTime: 1000 * 60 * 60,
  initialData: []
});

// 2. QUERY API TỔNG HỢP THEO THÁNG
const { data: monthlySummaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
  queryKey: ['monthlySummary', selectedMonth, selectedRole, selectedShift], // Theo dõi thêm selectedShift
  queryFn: async () => {
    try {
      const [year, month] = selectedMonth.value.split('-');
      const response = await adminApiClient.get('/attendances/monthly-summary', {
        params: { 
          month, 
          year, 
          role_id: selectedRole.value,
          work_shift_id: selectedShift.value // Gửi tham số work_shift_id lên Server
        }
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }
      return {};
    } catch (error) {
      return {};
    }
  },
  keepPreviousData: true,
  staleTime: 1000 * 60,
  refetchOnWindowFocus: false,
});

// 3. QUERY API CHI TIẾT NGÀY ĐƯỢC CHỌN (DRILL-DOWN)
const { data: dailyData, isLoading: isDailyLoading, refetch: refetchDailyDetail } = useQuery({
  queryKey: ['dailyAttendanceAll', drillDownDate, selectedRole, selectedShift], // Theo dõi thêm selectedShift
  queryFn: async () => {
    try {
      const response = await adminApiClient.get('/attendances/daily-status', {
        params: {
          date: drillDownDate.value,
          role_id: selectedRole.value !== 'all' ? selectedRole.value : undefined,
          work_shift_id: selectedShift.value !== 'all' ? selectedShift.value : undefined // Gửi tham số work_shift_id
        }
      });
      return response.data;
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Không thể tải chi tiết danh sách ngày này!' });
      throw error;
    }
  },
  keepPreviousData: true,
  staleTime: 1000 * 30,
  refetchOnWindowFocus: false,
});

// --- CƠ CHẾ FALLBACK TẠO DROPDOWN NẾU API LỖI ROUTE ---
const { data: adjustmentsData, isLoading: isAdjustmentsLoading, refetch: refetchAdjustments } = useQuery({
  queryKey: ['attendanceAdjustments', selectedMonth],
  queryFn: async () => {
    const [year, month] = selectedMonth.value.split('-');
    const endDay = new Date(Number(year), Number(month), 0).getDate();
    const response = await adminApiClient.get('/attendances/adjustments', {
      params: {
        start_date: `${year}-${month}-01`,
        end_date: `${year}-${month}-${String(endDay).padStart(2, '0')}`,
        limit: 20
      }
    });
    return response.data?.success ? response.data.data : [];
  },
  initialData: [],
  keepPreviousData: true,
  staleTime: 1000 * 60,
  refetchOnWindowFocus: false,
});

const extractedRolesMap = ref(new Map());
const extractedShiftsMap = ref(new Map());

watch(() => dailyData.value?.data, (users) => {
  if (users && Array.isArray(users)) {
    users.forEach(admin => {
      // Extract Roles
      if (admin.role && !extractedRolesMap.value.has(admin.role.id)) {
        extractedRolesMap.value.set(admin.role.id, admin.role);
      }
      
      // Extract Shifts
      const shift = getAdminShift(admin);
      if (shift && !extractedShiftsMap.value.has(shift.id)) {
        extractedShiftsMap.value.set(shift.id, shift);
      }
    });
  }
}, { immediate: true });

const availableRoles = computed(() => {
  if (rolesList.value && rolesList.value.length > 0) return rolesList.value;
  return Array.from(extractedRolesMap.value.values());
});

const availableShifts = computed(() => {
  if (workShiftsList.value && workShiftsList.value.length > 0) return workShiftsList.value;
  return Array.from(extractedShiftsMap.value.values());
});


const isLoading = computed(() => isSummaryLoading.value || isDailyLoading.value);
watch(isLoading, (newVal) => {
  if (!newVal && isFirstVisit.value) {
    sessionStorage.setItem('visited_attendance_dashboard', 'true');
    setTimeout(() => { isFirstVisit.value = false; }, 300);
  }
});

const refetchAll = () => {
  refetchSummary();
  refetchDailyDetail();
  refetchAdjustments();
};

// Removed adminHistoryData Query

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

const isLateWarning = (summaryData) => {
  if (!summaryData || summaryData.total === 0) return false;
  const lateRate = (summaryData.late / summaryData.total) * 100;
  return lateRate > 10;
};

const getPercentage = (value, total) => {
  if (!total) return 0;
  return ((value / total) * 100).toFixed(1);
};

const monthlySummaryMap = computed(() => {
  return monthlySummaryData.value || {};
});

const monthlyGrid = computed(() => {
  if (!selectedMonth.value) return [];
  const [yearStr, monthStr] = selectedMonth.value.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1;

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
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      date: dateStr,
      summaryData: monthlySummaryMap.value[dateStr] || null
    });
  }

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

const attendanceChartData = computed(() => {
  const data = monthlySummaryData.value || {};
  if (!selectedMonth.value) {
    return { labels: [], datasets: [] };
  }

  const [yearStr, monthStr] = selectedMonth.value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const daysInMonth = new Date(year, month, 0).getDate();

  const labels = [];
  const present = [];
  const late = [];
  const absent = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    labels.push(String(day));
    present.push(data[dateKey]?.present || 0);
    late.push(data[dateKey]?.late || 0);
    absent.push(data[dateKey]?.absent || 0);
  }

  return {
    labels,
    datasets: [
      {
        label: 'Đúng giờ',
        data: present,
        backgroundColor: '#009981',
        borderColor: '#009981',
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.75,
        categoryPercentage: 0.85
      },
      {
        label: 'Đi muộn',
        data: late,
        backgroundColor: '#ffb703',
        borderColor: '#ffb703',
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.75,
        categoryPercentage: 0.85
      },
      {
        label: 'Vắng',
        data: absent,
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.75,
        categoryPercentage: 0.85
      }
    ]
  };
});

const initOrUpdateAttendanceChart = () => {
  const ctx = document.getElementById('attendanceTrendChart');
  if (!ctx) return;
  const chartData = attendanceChartData.value;

  if (attendanceChartInstance) {
    attendanceChartInstance.data.labels = chartData.labels;
    attendanceChartInstance.data.datasets = chartData.datasets;
    attendanceChartInstance.update();
    return;
  }

  attendanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: {
            maxRotation: 0,
            autoSkip: false,
            font: { size: 11 }
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
};

const scheduleAttendanceChartRender = () => {
  nextTick(() => {
    if (!isSummaryLoading.value) {
      initOrUpdateAttendanceChart();
    }
  });
};

onMounted(scheduleAttendanceChartRender);
onActivated(scheduleAttendanceChartRender);

onUnmounted(() => {
  if (attendanceChartInstance) {
    attendanceChartInstance.destroy();
    attendanceChartInstance = null;
  }
});

watch([attendanceChartData, isSummaryLoading], scheduleAttendanceChartRender, {
  immediate: true,
  flush: 'post',
});

const kpiSummaries = computed(() => {
  let totalStaff = 0;
  let totalPresent = 0;
  let totalLate = 0;
  let totalAbsent = 0;
  let warningDaysCount = 0;

  const summaryValues = Object.values(monthlySummaryMap.value);
  summaryValues.forEach(day => {
    if (day) {
      totalStaff = Math.max(totalStaff, day.total);
      totalPresent += day.present;
      totalLate += day.late;
      totalAbsent += day.absent;
      if (isLateWarning(day)) {
        warningDaysCount++;
      }
    }
  });

  return [
    { title: 'Tổng nhân sự theo dõi', value: totalStaff, icon: 'bi bi-people-fill text-primary', bgClass: 'bg-primary-subtle text-primary' },
    { title: 'Số lượt Đúng Giờ', value: totalPresent, icon: 'bi bi-check-circle-fill text-success', bgClass: 'bg-success-subtle text-success' },
    { title: 'Số lượt Đi Muộn', value: totalLate, icon: 'bi bi-exclamation-octagon-fill text-warning', bgClass: 'bg-warning-subtle text-warning-emphasis' },
    { title: 'Báo Động (>10% muộn)', value: warningDaysCount, icon: 'bi bi-fire text-danger', bgClass: 'bg-danger-subtle text-danger' }
  ];
});

const handleDayClick = (day) => {
  if (!day.isCurrentMonth || !day.date) return;
  drillDownDate.value = day.date;
  currentPage.value = 1;
  nextTick(() => {
    if (drillDownSection.value) drillDownSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const drillDownList = computed(() => dailyData.value?.data || []);
const adjustmentLogs = computed(() => adjustmentsData.value || []);

const getCountByStatus = (status) => {
  if (status === 'absent') {
    return drillDownList.value.filter(admin => !admin.attendance).length;
  }
  return drillDownList.value.filter(admin => admin.attendance && getRealStatus(admin.attendance) === status).length;
};

const filteredDrillDownList = computed(() => {
  let list = [...drillDownList.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(admin =>
      admin.fullname.toLowerCase().includes(query) || admin.email.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'absent') {
      list = list.filter(admin => !admin.attendance);
    } else {
      list = list.filter(admin => admin.attendance && getRealStatus(admin.attendance) === statusFilter.value);
    }
  }

  return list;
});

// Reset pagination when ANY filter changes
watch([searchQuery, statusFilter, drillDownDate, selectedShift, selectedRole], () => { currentPage.value = 1; });

const totalPages = computed(() => Math.ceil(filteredDrillDownList.value.length / itemsPerPage) || 1);

const paginatedDrillDownList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredDrillDownList.value.slice(start, start + itemsPerPage);
});

function openHistoryModal(admin) {
  if (historyModalRef.value) {
    historyModalRef.value.openModal(admin, drillDownDate.value);
  }
}

function openAdjustmentModal(admin) {
  if (adjustmentModalRef.value) {
    adjustmentModalRef.value.openModal(admin, drillDownDate.value);
  }
}

const handleAdjustmentSaved = () => {
  refetchSummary();
  refetchDailyDetail();
  refetchAdjustments();
};

const isWeekend = (dateStr) => {
  if (!dateStr) return false;
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
};

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
  if (!activeHistoryAdmin.value) return null;
  return getWorkShiftFromObject(activeHistoryAdmin.value.shiftAssignment) || getWorkShiftFromObject(activeHistoryAdmin.value.shift_assignment);
};

const getDayWorkShift = (day) => {
  if (!day) return null;
  return getWorkShiftFromObject(day.data) || getAssignedWorkShift();
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
  return getAttendanceDateOnly(dateStr) === getVietnamDateString();
};

const isPastOrToday = (dateStr) => {
  if (!dateStr) return false;
  return getAttendanceDateOnly(dateStr) <= getVietnamDateString();
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

const formatDateVN = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateTimeVN = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatMonthYear = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  return `${month}/${year}`;
};

const formatTimeOnly = (dateString) => {
  if (!dateString) return '--:--';
  if (dateString.length === 8) return `${dateString.split(':')[0]}:${dateString.split(':')[1]}`;
  return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusLabel = (status) => ({
  present: 'Đúng giờ', late: 'Đi muộn', absent: 'Vắng', on_leave: 'Nghỉ phép'
}[status] || status);

function getAdminShift(admin) {
  return admin.attendance?.work_shift || admin.shift_assignment?.work_shift || null;
}

const getStatusBadgeClass = (status) => ({
  present: 'badge bg-success-subtle text-success border border-success',
  late: 'badge bg-warning-subtle text-warning-emphasis border border-warning',
  absent: 'badge bg-danger-subtle text-danger border border-danger',
  on_leave: 'badge bg-info-subtle text-info border border-info'
}[status] || 'badge bg-secondary');

const getStatusBadgeClassGrid = (status) => ({
  present: 'badge bg-success text-white shadow-sm',
  late: 'badge bg-warning text-dark shadow-sm',
  absent: 'badge bg-danger text-white shadow-sm',
  on_leave: 'badge bg-info text-white shadow-sm'
}[status] || 'badge bg-secondary');

const getDisplayCheckoutStatus = (attendance, fallbackDate = null) => {
  if (!attendance) return null;
  if (shouldShowMissCheckout(attendance, fallbackDate)) {
    return 'miss_checkout';
  }
  return attendance.checkout_status;
};

const shouldShowMissCheckout = (attendance, fallbackDate = null) => {
  if (!attendance || attendance.checkout_status !== 'pending') return false;
  if (!attendance.clock_in || attendance.clock_out) return false;

  const dateOnly = getAttendanceDateOnly(fallbackDate || attendance.attendance_date);
  if (!isPastAttendanceDate(dateOnly)) return false;

  const shiftEnd = getAttendanceShiftEndDate(attendance, dateOnly);
  if (!shiftEnd) return true;

  return new Date() > shiftEnd;
};

const getAttendanceShiftEndDate = (attendance, fallbackDate = null) => {
  const dateOnly = getAttendanceDateOnly(fallbackDate || attendance.attendance_date);
  const startTime = attendance.shift_start_time || attendance.work_shift?.start_time;
  const endTime = attendance.shift_end_time || attendance.work_shift?.end_time;

  if (!dateOnly || !endTime) return null;

  const shiftEnd = new Date(`${dateOnly}T${normalizeTimeForDate(endTime)}`);
  if (Number.isNaN(shiftEnd.getTime())) return null;

  if (startTime && normalizeTimeForCompare(endTime) <= normalizeTimeForCompare(startTime)) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return shiftEnd;
};

const normalizeTimeForDate = (time) => {
  const value = String(time || '');
  return value.length === 5 ? `${value}:00` : value;
};

const normalizeTimeForCompare = (time) => String(time || '').substring(0, 5);

const getAttendanceDateOnly = (value) => String(value || '').split('T')[0].split(' ')[0];

const isPastAttendanceDate = (value) => {
  if (!value) return false;
  const dateOnly = getAttendanceDateOnly(value);
  return dateOnly < getVietnamDateString();
};

const getCheckoutStatusLabel = (status) => ({
  pending: 'Đang làm', completed: 'Đã về', forgotten: 'Quên Checkout', miss_checkout: 'Miss checkout'
}[status] || status);

const getCheckoutStatusBadgeClass = (status) => ({
  pending: 'badge bg-info-subtle text-info border border-info',
  completed: 'badge bg-success-subtle text-success border border-success',
  forgotten: 'badge bg-danger-subtle text-danger border border-danger',
  miss_checkout: 'badge bg-danger-subtle text-danger border border-danger'
}[status] || 'badge bg-secondary');

</script>

<style scoped>
/* CSS LOGO SHIMMER */
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

@keyframes shine-logo {
  to {
    background-position: 200% center;
  }
}

@keyframes pulse-text {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

/* CSS SKELETON LOADING */
.skeleton {
  background: #eee;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 5px;
  background-size: 200% 100%;
  animation: 1.5s shine-skeleton linear infinite;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 4px;
  border-radius: 4px;
}

@keyframes shine-skeleton {
  to {
    background-position-x: -200%;
  }
}

.bg-brand {
  background-color: #009981 !important;
}

.text-brand {
  color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  border: none;
  color: #fff;
  transition: 0.2s;
}

.btn-brand:hover {
  background-color: #007a67;
  color: #fff;
}

.btn-icon {
  width: 42px;
  height: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.attendance-dashboard-wrapper {
  width: 100%;
}

.filter-control-panel {
  transition: all 0.2s ease-in-out;
}
.filter-control-panel:hover {
  border-color: #009981 !important;
  box-shadow: 0 .25rem .5rem rgba(0, 153, 129, 0.1) !important;
}

.icon-box-small {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.1rem;
}

.cursor-pointer {
  cursor: pointer;
}

.table-heading-group {
  flex: 0 0 auto;
  min-width: 260px;
  max-width: 100%;
}

.table-heading-group h5 {
  white-space: normal;
  word-break: keep-all;
}

.table-card {
  min-height: 480px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.search-panel .form-control {
  min-height: 40px;
}

.table-responsive {
  overflow-x: auto;
}

.avatar-small {
  width: 42px;
  height: 42px;
  background-color: #e6f5f2;
  color: #009981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.1rem;
}

.border-dashed {
  border-style: dashed !important;
}

.fw-black {
  font-weight: 900;
}

/* PHÂN TRANG CUSTOM */
.pagination .page-link {
  color: #495057;
  border-color: #dee2e6;
  padding: 0.5rem 0.75rem;
}

.pagination .page-item.active .page-link {
  background-color: #009981;
  border-color: #009981;
  color: #fff;
}

.pagination .page-link:hover {
  color: #007a67;
  background-color: #e6f5f2;
}

/* ---- HEATMAP CALENDAR DESIGN ---- */
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bg-light-warning {
  background-color: #fff9e6;
}

.calendar-container {
  border: 1px solid rgba(0, 153, 129, 0.16);
  border-radius: 16px;
  overflow: hidden;
  background-color: #f6fbf8;
}

.calendar-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid rgba(0, 153, 129, 0.16);
  background-color: rgba(0, 153, 129, 0.04);
}

.calendar-header-col {
  padding: 14px 0;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #3f5d53;
  border-right: 1px solid rgba(0, 153, 129, 0.1);
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
  border-bottom: 1px solid rgba(0, 153, 129, 0.08);
}

.calendar-week:last-child {
  border-bottom: none;
}

.calendar-day-summary {
  min-height: 105px;
  border-right: 1px solid rgba(0, 153, 129, 0.06);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
  background-color: #ffffff;
  cursor: pointer;
}

.calendar-day-summary:last-child {
  border-right: none;
}

.calendar-day-summary:hover:not(.not-current-month) {
  background-color: #ecf7f0;
  transform: translateY(-2px);
  z-index: 5;
  box-shadow: 0 0.5rem 1rem rgba(0, 153, 129, 0.14);
  border-radius: 8px;
}

.day-number-row {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f5132;
}

.is-selected-day {
  border: 2px solid #009981 !important;
  background-color: #eaf7ee !important;
  box-shadow: inset 0 0 10px rgba(0, 153, 129, 0.12);
  border-radius: 8px;
}

/* Hiệu ứng Pulse cảnh báo */
.heatmap-warning {
  background-color: rgba(255, 193, 7, 0.16) !important;
}

.alert-pulse-badge {
  background-color: #fff4e5;
  color: #8a6d3b;
  border: 1px solid rgba(255, 193, 7, 0.35);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

.progress-stacked-mini {
  background-color: #e9ecef;
  display: flex;
  overflow: hidden;
}

.not-current-month {
  background-color: #fcfcfc !important;
  pointer-events: none;
  opacity: 0.4;
}

/* CÁC CARD LỌC TRẠNG THÁI */
.filter-metric-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent !important;
  background-color: #ffffff;
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .04) !important;
}

.filter-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .08) !important;
}

.active-metric-filter {
  border-color: #009981 !important;
  background-color: #f0fcf9 !important;
  box-shadow: 0 .4rem .8rem rgba(0, 153, 129, 0.1) !important;
}

.active-metric-filter-success {
  border-color: #198754 !important;
  background-color: #f1fbf7 !important;
  box-shadow: 0 .4rem .8rem rgba(25, 135, 84, 0.1) !important;
}

.active-metric-filter-warning {
  border-color: #ffc107 !important;
  background-color: #fffdf5 !important;
  box-shadow: 0 .4rem .8rem rgba(255, 193, 7, 0.1) !important;
}

.active-metric-filter-danger {
  border-color: #6c757d !important;
  background-color: #f8f9fa !important;
  box-shadow: 0 .4rem .8rem rgba(108, 117, 125, 0.1) !important;
}

/* FIX Z-INDEX MODAL */
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.adjustment-log-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.adjustment-log-item {
  border: 1px solid rgba(0, 153, 129, 0.14);
  border-radius: 14px;
  padding: 1rem;
  background: #fbfffe;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.adjustment-log-item:hover {
  border-color: rgba(0, 153, 129, 0.32);
  box-shadow: 0 0.5rem 1rem rgba(0, 153, 129, 0.08);
}

/* DARK MODE OVERRIDES */
[data-bs-theme="dark"] .bg-white {
  background-color: var(--bs-dark) !important;
}
[data-bs-theme="dark"] .bg-light,
[data-bs-theme="dark"] .table-light {
  background-color: var(--bs-gray-800) !important;
  color: var(--bs-light) !important;
}
[data-bs-theme="dark"] .text-dark {
  color: var(--bs-light) !important;
}
[data-bs-theme="dark"] .text-muted {
  color: #adb5bd !important;
}
[data-bs-theme="dark"] .calendar-container,
[data-bs-theme="dark"] .calendar-day-summary,
[data-bs-theme="dark"] .calendar-day {
  background-color: var(--bs-dark) !important;
  border-color: var(--bs-border-color) !important;
}
[data-bs-theme="dark"] .calendar-header-row,
[data-bs-theme="dark"] .calendar-week,
[data-bs-theme="dark"] .calendar-header-col {
  border-color: var(--bs-border-color) !important;
}
[data-bs-theme="dark"] .table-card {
  border-color: var(--bs-border-color) !important;
}
[data-bs-theme="dark"] .card {
  background-color: var(--bs-dark) !important;
  border-color: var(--bs-border-color) !important;
}
[data-bs-theme="dark"] .filter-metric-card {
  background-color: var(--bs-gray-900) !important;
}
[data-bs-theme="dark"] .filter-metric-card.bg-light-subtle {
  background-color: var(--bs-gray-900) !important;
}
[data-bs-theme="dark"] .active-metric-filter {
  background-color: rgba(0, 153, 129, 0.15) !important;
}
[data-bs-theme="dark"] .active-metric-filter-success {
  background-color: rgba(25, 135, 84, 0.15) !important;
}
[data-bs-theme="dark"] .active-metric-filter-warning {
  background-color: rgba(255, 193, 7, 0.15) !important;
}
[data-bs-theme="dark"] .active-metric-filter-danger {
  background-color: rgba(108, 117, 125, 0.15) !important;
}
[data-bs-theme="dark"] .not-current-month {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
[data-bs-theme="dark"] .calendar-day-summary:hover:not(.not-current-month) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
[data-bs-theme="dark"] .day-summary-visual .bg-light-warning {
  background-color: rgba(255, 193, 7, 0.1) !important;
}
[data-bs-theme="dark"] .is-selected-day {
  background-color: rgba(0, 153, 129, 0.15) !important;
}
[data-bs-theme="dark"] .filter-control-panel {
  background-color: var(--bs-gray-800) !important;
  border-color: var(--bs-border-color) !important;
}
[data-bs-theme="dark"] .filter-control-panel select,
[data-bs-theme="dark"] .filter-control-panel input {
  color: var(--bs-light) !important;
}
</style>
