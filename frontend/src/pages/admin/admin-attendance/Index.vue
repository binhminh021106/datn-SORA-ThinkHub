<template>
  <div class="attendance-dashboard-wrapper pb-5 mb-5">
    
    <!-- 1. SHIMMER LOGO (Chỉ hiện lần đầu tiên) -->
    <div v-if="isFirstVisit && isLoading" class="d-flex flex-column justify-content-center align-items-center w-100 shimmer-wrapper">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải tổng hợp chấm công...</p>
    </div>

    <!-- NỘI DUNG CHÍNH -->
    <div class="container-fluid py-4 px-4" v-show="!isFirstVisit || !isLoading">
      
      <!-- HEADER TRANG -->
      <div class="row mb-4 align-items-center gy-3">
        <div class="col-lg-5">
            <h3 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-calendar3 text-brand"></i>
              Tổng quan Chấm công Tháng
            </h3>
            <p class="text-muted small mb-0 mt-1">Hệ thống Heatmap cảnh báo sớm tỷ lệ đi muộn và vắng mặt</p>
        </div>
        <div class="col-lg-7">
          <div class="d-flex flex-column gap-3 h-100 justify-content-center">
            <div class="d-flex gap-3 flex-wrap justify-content-lg-end align-items-center">
              
              <!-- Bộ chọn Tháng/Năm -->
              <div class="date-picker-panel d-flex align-items-center bg-white border rounded-4 px-3 py-2 shadow-sm">
                <i class="bi bi-calendar-month text-brand me-2"></i>
                <input type="month" v-model="selectedMonth" @change="handleMonthChange" class="form-control form-control-sm border-0 shadow-none p-0 fw-bold text-dark" style="outline: none; min-width: 140px;">
              </div>

              <!-- Bộ lọc Chức vụ (Roles) thay cho Phòng ban -->
              <div class="bg-white border rounded-4 px-3 py-2 shadow-sm d-flex align-items-center">
                <i class="bi bi-person-badge text-brand me-2"></i>
                <select v-model="selectedRole" class="form-select form-select-sm border-0 shadow-none p-0 fw-bold text-dark" style="outline: none; min-width: 130px;">
                  <option value="all">Tất cả chức vụ</option>
                  <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <button @click="refetchAll" class="btn btn-brand shadow-sm rounded-4 fw-bold text-white d-flex align-items-center">
                <i class="bi bi-arrow-clockwise me-1" :class="{'fa-spin': isLoading}"></i> Làm mới
              </button>
              <button @click="resetFilters" class="btn btn-light border shadow-sm rounded-4 fw-bold text-dark d-flex align-items-center">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Đặt lại
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- BẢNG ĐIỀU HƯỚNG CHÚ THÍCH (LEGEND & KPI CHUNG THÁNG) -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6" v-for="kpi in kpiSummaries" :key="kpi.title">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3 d-flex align-items-center gap-3">
              <div class="icon-box-small" :class="kpi.bgClass"><i :class="kpi.icon"></i></div>
              <div>
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.75rem;">{{ kpi.title }}</div>
                <h4 class="fw-black mb-0 text-dark">{{ kpi.value }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID CHÍNH: LỊCH HEATMAP TỔNG HỢP THÁNG -->
      <div class="card border-0 shadow-sm rounded-4 bg-white mb-4">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h5 class="fw-bold text-dark mb-1">Lưới Giám Sát Chấm Công Tháng {{ formatMonthYear(selectedMonth) }}</h5>
              <p class="text-muted small mb-0">Rê chuột xem nhanh thông số. Click chọn ngày để tải nhanh danh sách chi tiết bên dưới.</p>
            </div>
            
            <!-- Chú thích màu sắc Heatmap -->
            <div class="d-flex gap-3 align-items-center flex-wrap" style="font-size: 0.8rem;">
              <span class="d-flex align-items-center gap-1 text-muted">
                <span class="legend-dot bg-success"></span> Đúng giờ
              </span>
              <span class="d-flex align-items-center gap-1 text-muted">
                <span class="legend-dot bg-warning"></span> Đi muộn
              </span>
              <span class="d-flex align-items-center gap-1 text-muted">
                <span class="legend-dot bg-danger"></span> Vắng / Chưa Check-in
              </span>
              <span class="d-flex align-items-center gap-1 text-muted">
                <span class="legend-dot border border-dashed bg-light-warning"></span> Cảnh báo đi muộn (>10%)
              </span>
            </div>
          </div>

          <!-- Lịch Heatmap -->
          <div class="calendar-container shadow-sm border rounded-4 overflow-hidden">
            <div class="calendar-header-row bg-light">
              <div class="calendar-header-col" v-for="dayName in ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']" :key="dayName">
                {{ dayName }}
              </div>
            </div>
            
            <div class="calendar-body">
              <div class="calendar-week" v-for="(week, wIndex) in monthlyGrid" :key="'week-'+wIndex">
                <div 
                  class="calendar-day-summary" 
                  v-for="day in week" 
                  :key="day.date || Math.random()"
                  :class="{
                    'not-current-month': !day.isCurrentMonth,
                    'is-today': isToday(day.date),
                    'is-selected-day': drillDownDate === day.date,
                    'heatmap-warning': day.isCurrentMonth && isLateWarning(day.summaryData)
                  }"
                  @click="handleDayClick(day)"
                >
                  <div class="day-number-row d-flex justify-content-between align-items-center">
                    <span v-if="isToday(day.date)" class="badge bg-brand text-white py-1 px-2" style="font-size: 0.65rem;">Hôm nay</span>
                    <span v-else></span>
                    <span class="day-num" :class="{'text-brand fw-black': isToday(day.date)}">{{ day.dayNumber }}</span>
                  </div>

                  <!-- Thống kê tổng hợp dạng Visual Chart trong ô ngày -->
                  <div class="day-summary-visual mt-2 flex-grow-1 d-flex flex-column justify-content-end" v-if="day.isCurrentMonth && day.summaryData">
                    
                    <!-- Stacked Bar Chart Mini -->
                    <div class="progress progress-stacked-mini rounded-pill mb-2" style="height: 6px;">
                      <div class="progress-bar bg-success" :style="{ width: getPercentage(day.summaryData.present, day.summaryData.total) + '%' }" title="Đúng giờ"></div>
                      <div class="progress-bar bg-warning" :style="{ width: getPercentage(day.summaryData.late, day.summaryData.total) + '%' }" title="Đi muộn"></div>
                      <div class="progress-bar bg-danger" :style="{ width: getPercentage(day.summaryData.absent, day.summaryData.total) + '%' }" title="Vắng"></div>
                    </div>

                    <!-- Chỉ số text rất nhỏ bên dưới -->
                    <div class="d-flex justify-content-between align-items-center text-muted fw-semibold" style="font-size: 0.68rem; letter-spacing: -0.2px;">
                      <span>Tổng: <strong class="text-dark">{{ day.summaryData.total }}</strong></span>
                      <span class="d-flex gap-1">
                        <span class="text-success" title="Đúng giờ">{{ day.summaryData.present }}</span>/
                        <span class="text-warning-emphasis fw-bold" title="Đi muộn">{{ day.summaryData.late }}m</span>/
                        <span class="text-danger" title="Vắng">{{ day.summaryData.absent }}v</span>
                      </span>
                    </div>

                    <!-- Nhãn cảnh báo thông minh nếu tỷ lệ đi muộn cao -->
                    <div v-if="isLateWarning(day.summaryData)" class="alert-pulse-badge mt-1 text-center py-0 px-1 rounded">
                      <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 0.65rem;"></i>
                      <span class="text-warning-emphasis ms-1" style="font-size: 0.6rem; font-weight: 800;">Cảnh báo đi muộn</span>
                    </div>
                  </div>

                  <!-- Hiển thị ngày nghỉ mờ linh hoạt theo trạng thái quá khứ / tương lai -->
                  <div class="day-summary-visual mt-2 flex-grow-1 d-flex flex-column justify-content-center align-items-center text-muted" v-else-if="day.isCurrentMonth">
                    <span 
                      class="text-uppercase" 
                      :class="isPastOrToday(day.date) ? 'text-secondary opacity-50 fw-bold' : 'text-muted opacity-25 fw-normal'"
                      style="font-size: 0.68rem; letter-spacing: 0.5px;"
                    >
                      Nghỉ tuần
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BẢNG CHI TIẾT NHÂN SỰ CHO NGÀY ĐƯỢC CHỌN (DRILL-DOWN PANEL) -->
      <div class="card border-0 shadow-sm rounded-4 bg-white table-card mt-4" ref="drillDownSection">
        <div class="card-body p-4 d-flex flex-column h-100">
          
          <!-- HÀNG 1: TIÊU ĐỀ CHI TIẾT -->
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom pb-3 mb-4 gap-2">
            <div class="table-heading-group">
              <h5 class="fw-bold text-dark mb-1 d-flex align-items-center flex-wrap gap-2">
                <i class="bi bi-box-arrow-in-down-right text-brand"></i>
                Chi tiết nhân sự ngày: 
                <span class="badge bg-brand text-white px-3 py-1.5 fs-6 shadow-sm">{{ formatDateVN(drillDownDate) }}</span>
              </h5>
              <p class="text-muted small mb-0">Danh sách đi làm chi tiết, trạng thái Check-in/Check-out của ngày được chọn.</p>
            </div>
          </div>

          <!-- HÀNG 2: 4 LABEL ĐỒNG BỘ THEO DẠNG CARD LỌC TRẠNG THÁI -->
          <div class="row g-3 mb-4">
            <!-- 1. Tổng nhân sự -->
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card" 
                   :class="statusFilter === 'all' ? 'active-metric-filter' : 'bg-light-subtle'"
                   @click="statusFilter = 'all'"
                   title="Xem tất cả nhân sự">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-primary-subtle text-primary"><i class="bi bi-people-fill"></i></div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate" style="font-size: 0.72rem; letter-spacing: 0.5px;">Tổng nhân sự</div>
                    <h4 class="fw-black mb-0 text-dark">{{ drillDownList.length }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <!-- 2. Đúng giờ -->
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                   :class="statusFilter === 'present' ? 'active-metric-filter-success' : 'bg-light-subtle'"
                   @click="statusFilter = 'present'"
                   title="Xem nhân sự đúng giờ">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-success-subtle text-success"><i class="bi bi-person-check-fill"></i></div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate" style="font-size: 0.72rem; letter-spacing: 0.5px;">Đã Check-in</div>
                    <h4 class="fw-black mb-0 text-success">{{ getCountByStatus('present') }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <!-- 3. Đi muộn -->
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                   :class="statusFilter === 'late' ? 'active-metric-filter-warning' : 'bg-light-subtle'"
                   @click="statusFilter = 'late'"
                   title="Xem nhân sự đi muộn">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-warning-subtle text-warning-emphasis"><i class="bi bi-person-exclamation"></i></div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate" style="font-size: 0.72rem; letter-spacing: 0.5px;">Đi muộn</div>
                    <h4 class="fw-black mb-0 text-warning-emphasis">{{ getCountByStatus('late') }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <!-- 4. Chưa Check-in -->
            <div class="col-6 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 cursor-pointer filter-metric-card"
                   :class="statusFilter === 'absent' ? 'active-metric-filter-danger' : 'bg-light-subtle'"
                   @click="statusFilter = 'absent'"
                   title="Xem nhân sự chưa check-in">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="icon-box-small bg-secondary-subtle text-secondary"><i class="bi bi-person-dash-fill"></i></div>
                  <div class="flex-grow-1">
                    <div class="text-muted text-uppercase fw-bold text-truncate" style="font-size: 0.72rem; letter-spacing: 0.5px;">Chưa Check-in</div>
                    <h4 class="fw-black mb-0 text-secondary">{{ getCountByStatus('absent') }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- HÀNG 3: THANH TÌM KIẾM ĐƯỢC ĐƯA XUỐNG HÀNG RIÊNG TRÁNH LỖI LAYOUT -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="search-panel w-100">
                <div class="input-group shadow-sm rounded-3 overflow-hidden">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" v-model="searchQuery" class="form-control bg-white border-start-0 ps-0 shadow-none py-2" placeholder="Tìm tên hoặc email nhân sự trong danh sách ngày...">
                </div>
              </div>
            </div>
          </div>

          <!-- Bảng Data Thực Tế -->
          <div class="table-responsive flex-grow-1">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="border-0 text-muted small py-3 rounded-start-3">Nhân sự</th>
                  <th class="border-0 text-muted small py-3">Ca làm việc</th>
                  <th class="border-0 text-muted small py-3">Bắt đầu</th>
                  <th class="border-0 text-muted small py-3">Kết thúc</th>
                  <th class="border-0 text-muted small py-3">Giờ Vào</th>
                  <th class="border-0 text-muted small py-3">Giờ Ra</th>
                  <th class="border-0 text-muted small py-3">Trạng thái ca</th>
                  <th class="border-0 text-muted small py-3">Checkout</th>
                  <th class="border-0 text-muted small py-3 rounded-end-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="admin in paginatedDrillDownList" :key="admin.id">
                  <td class="fw-bold text-dark">
                    <div class="d-flex align-items-center">
                      <div class="avatar-small me-3">
                        <SoraImage v-if="admin.avatar_url" :src="getFullImage(admin.avatar_url)" :placeholder="defaultAvatar" imgClass="rounded-circle w-100 h-100 shadow-sm" style="object-fit: cover;" alt="Avatar" />
                        <span v-else>{{ admin.fullname?.charAt(0) }}</span>
                      </div>
                      <div>
                        <div class="mb-1">{{ admin.fullname }}</div>
                        <div class="d-flex flex-wrap gap-1 align-items-center">
                          <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.7rem;">{{ admin.email }}</span>
                          <!-- Hiển thị nhãn Chức vụ trực quan -->
                          <span v-if="admin.role" class="badge fw-normal" :class="admin.role.badgeClass || 'bg-primary-subtle text-primary'" style="font-size: 0.7rem;">
                            {{ admin.role.label }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span v-if="getAdminShift(admin)" class="fw-semibold text-dark">{{ getAdminShift(admin).name }}</span><span v-else class="text-muted small fst-italic">Hành chính</span></td>
                  <td><span v-if="getAdminShift(admin)" class="text-dark fw-semibold">{{ formatTimeOnly(getAdminShift(admin).start_time) }}</span><span v-else class="text-muted">--:--</span></td>
                  <td><span v-if="getAdminShift(admin)" class="text-dark fw-semibold">{{ formatTimeOnly(getAdminShift(admin).end_time) }}</span><span v-else class="text-muted">--:--</span></td>
                  <td><div v-if="admin.attendance?.clock_in" class="fw-bold text-success">{{ formatTimeOnly(admin.attendance.clock_in) }}</div><div v-else class="text-muted small">--:--</div></td>
                  <td><div v-if="admin.attendance?.clock_out" class="fw-bold text-warning-emphasis">{{ formatTimeOnly(admin.attendance.clock_out) }}</div><div v-else class="text-muted small">--:--</div></td>
                  <td>
                    <span v-if="admin.attendance" :class="getStatusBadgeClass(admin.attendance.status)">{{ getStatusLabel(admin.attendance.status) }} <small v-if="admin.attendance.status === 'late' && admin.attendance.late_minutes > 0">({{ admin.attendance.late_minutes }}p)</small></span>
                    <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary border-dashed">Chưa Check-in</span>
                  </td>
                  <td>
                    <span v-if="admin.attendance" :class="getCheckoutStatusBadgeClass(admin.attendance.checkout_status)">{{ getCheckoutStatusLabel(admin.attendance.checkout_status) }}</span>
                    <span v-else class="text-muted small">--</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary shadow-sm rounded-3" @click="openHistoryModal(admin)">
                      <i class="bi bi-calendar-check me-1"></i>Xem lịch tháng
                    </button>
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

          <!-- PHÂN TRANG -->
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3" v-if="totalPages > 1">
            <span class="text-muted small fw-semibold">
              Đang hiển thị <span class="text-dark">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> đến <span class="text-dark">{{ Math.min(currentPage * itemsPerPage, filteredDrillDownList.length) }}</span> trong tổng số <span class="text-dark">{{ filteredDrillDownList.length }}</span> bản ghi
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

    </div>

    <!-- MODAL LỊCH SỬ CHẤM CÔNG CỦA CÁ NHÂN (Đã được chuyển vào bên trong root div) -->
    <div v-if="showHistoryModal" class="modal-backdrop-custom" @click.self="closeHistoryModal">
       <div class="modal-dialog-custom modal-xl mx-auto my-4 px-2">
        <div class="card shadow-lg rounded-4 overflow-hidden border-0">
          <div class="card-header p-4 d-flex justify-content-between align-items-center bg-white border-bottom">
            <div>
              <h4 class="mb-1 fw-bold text-dark d-flex align-items-center"><i class="bi bi-calendar2-week text-brand me-2"></i>Lịch sử chấm công cá nhân</h4>
              <p class="text-muted small mb-0 fw-semibold">{{ activeHistoryAdmin?.fullname }} - <span class="fw-normal">{{ activeHistoryAdmin?.email }}</span></p>
            </div>
            <button type="button" class="btn btn-light rounded-circle shadow-sm" style="width: 40px; height: 40px;" @click="closeHistoryModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="card-body p-4 bg-light">
            <!-- Skeleton Lịch cho Modal -->
            <div v-if="historyLoading">
               <div class="calendar-container shadow-sm">
                  <div class="calendar-header-row rounded-top-3"><div class="calendar-header-col" v-for="i in 7" :key="'h-'+i">Thứ {{i+1}}</div></div>
                  <div class="calendar-body">
                    <div class="calendar-week" v-for="w in 5" :key="'w-'+w">
                      <div class="calendar-day" v-for="d in 7" :key="'d-'+d">
                         <div class="skeleton skeleton-text ms-auto mb-2" style="width: 20px; height: 20px;"></div>
                         <div class="skeleton skeleton-text w-100 mb-1" style="height: 25px;"></div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Nội dung Lịch Modal Thực Tế -->
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
                    <div 
                      class="calendar-day" 
                      v-for="day in week" 
                      :key="day.date || Math.random()" 
                      :class="{
                        'not-current-month': !day.isCurrentMonth, 
                        'is-today': isToday(day.date), 
                        'is-weekend': !isStaffWorkingDay(day.date, day)
                      }"
                    >
                      <div class="day-number" :class="{'text-brand fw-bolder': isToday(day.date)}">
                        <span v-if="isToday(day.date)" class="badge bg-brand text-white rounded-circle p-1 px-2 me-1" style="font-size: 0.7rem;">Hôm nay</span>{{ day.dayNumber }}
                      </div>
                      
                      <!-- Có dữ liệu điểm danh thực tế -->
                      <div class="day-data mt-2" v-if="day.data">
                        <div class="time-item text-success bg-success-subtle rounded px-2 py-1 mb-1 border border-success border-opacity-25 shadow-sm">
                          <span><i class="bi bi-box-arrow-in-right me-1"></i>Vào:</span>
                          <span class="fw-bold">{{ formatMiniTime(day.data.clock_in) }}</span>
                        </div>
                        
                        <div class="time-item rounded px-2 py-1 mb-1 border shadow-sm" v-if="day.data.clock_out" :class="day.data.checkout_status === 'forgotten' ? 'bg-danger-subtle text-danger border-danger border-opacity-25' : 'bg-warning-subtle text-warning-emphasis border-warning border-opacity-25'">
                          <span><i class="bi bi-box-arrow-left me-1"></i>Ra:</span>
                          <span class="fw-bold">{{ formatMiniTime(day.data.clock_out) }}</span>
                        </div>
                        
                        <div class="d-flex flex-wrap gap-1 mt-2 justify-content-end">
                          <span :class="getStatusBadgeClassGrid(day.data.status)" class="badge">{{ getStatusLabel(day.data.status) }}</span>
                          <span v-if="day.data.checkout_status === 'forgotten'" class="badge bg-danger shadow-sm">Quên Checkout</span>
                          <!-- Nếu là ngày nghỉ (không có lịch) mà vẫn đi làm thì báo Tăng ca -->
                          <span v-if="!isStaffWorkingDay(day.date, day)" class="badge bg-dark text-white shadow-sm">Tăng ca</span>
                        </div>
                      </div>

                      <!-- Không có dữ liệu điểm danh (Hiển thị linh hoạt tương lai/quá khứ) -->
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

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import { useQuery } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

import SoraImage from '@/components/ui/SoraImage.vue';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';
import { getFullImage } from '@/composables/useUtilities';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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

// State chính
const isFirstVisit = ref(sessionStorage.getItem('visited_attendance_dashboard') !== 'true');
const selectedMonth = ref(new Date().toISOString().substring(0, 7)); // Định dạng 'YYYY-MM'
const drillDownDate = ref(new Date().toISOString().split('T')[0]); // Ngày đang được chọn để xem chi tiết bên dưới
const searchQuery = ref('');
const statusFilter = ref('all'); // Bộ lọc trạng thái cho ngày được drill-down
const selectedRole = ref('all'); // Sử dụng selectedRole thay cho phòng ban
const currentPage = ref(1);
const itemsPerPage = 6; // Phân trang chi tiết

const showHistoryModal = ref(false);
const activeHistoryAdmin = ref(null);
const drillDownSection = ref(null);

// Reset tất cả các bộ lọc về mặc định ban đầu
const resetFilters = () => {
  selectedMonth.value = new Date().toISOString().substring(0, 7);
  drillDownDate.value = new Date().toISOString().split('T')[0];
  searchQuery.value = '';
  statusFilter.value = 'all';
  selectedRole.value = 'all';
  currentPage.value = 1;
  refetchSummary();
  refetchDailyDetail();
};

const handleMonthChange = () => {
  // Khi đổi tháng, tự động gán ngày drill-down về ngày đầu tiên của tháng đó
  drillDownDate.value = `${selectedMonth.value}-01`;
  currentPage.value = 1;
};

// 0. QUERY API LẤY DANH SÁCH ROLE (CHỨC VỤ) DÀNH CHO BỘ LỌC
const { data: rolesList } = useQuery({
  queryKey: ['rolesListForFilter'],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      // Đường dẫn giả định khớp với controller mới bổ sung, bạn có thể chỉnh lại router url nếu cần thiết
      const response = await axios.get(`${API_URL}/admin/attendances/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success ? response.data.data : [];
    } catch (e) {
      console.warn("⚠️ API lấy chức vụ đang bị lỗi (Do chưa thêm khai báo Route trong api.php). Chuyển sang Fallback dùng dữ liệu trực tiếp.");
      return [];
    }
  },
  staleTime: 1000 * 60 * 60, // Cache role 1 tiếng
  initialData: [] // Thêm fallback mảng rỗng để tránh undefined
});

// Loại bỏ QUERY API LẤY CẤU HÌNH NGÀY NGHỈ HỆ THỐNG (/settings/work-days)
// vì cấu hình `working_days` đã được đính kèm trực tiếp trong ca làm việc (WorkShift).

// 2. QUERY API TỔNG HỢP THEO THÁNG
const { data: monthlySummaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
  queryKey: ['monthlySummary', selectedMonth, selectedRole],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [year, month] = selectedMonth.value.split('-');
      const response = await axios.get(`${API_URL}/admin/attendances/monthly-summary`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year, role_id: selectedRole.value }
      });
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return {};
    } catch (error) {
      const [year, month] = selectedMonth.value.split('-');
      return {};
    }
  },
  keepPreviousData: true,
  refetchOnWindowFocus: false,
});

// 3. QUERY API CHI TIẾT NGÀY ĐƯỢC CHỌN (DRILL-DOWN)
const { data: dailyData, isLoading: isDailyLoading, refetch: refetchDailyDetail } = useQuery({
  queryKey: ['dailyAttendanceAll', drillDownDate, selectedRole],
  queryFn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/attendances/daily-status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          date: drillDownDate.value,
          role_id: selectedRole.value !== 'all' ? selectedRole.value : undefined
        }
      });
      return response.data;
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Không thể tải chi tiết danh sách ngày này!'
      });
      throw error;
    }
  },
  keepPreviousData: true,
  refetchOnWindowFocus: true,
});

// --- CƠ CHẾ FALLBACK TẠO DROPDOWN NẾU API LỖI ROUTE ---
const extractedRolesMap = ref(new Map());

// Cập nhật các roles có sẵn mỗi khi danh sách nhân viên được tải về
watch(() => dailyData.value?.data, (users) => {
  if (users && Array.isArray(users)) {
    users.forEach(admin => {
      if (admin.role && !extractedRolesMap.value.has(admin.role.id)) {
        extractedRolesMap.value.set(admin.role.id, admin.role);
      }
    });
  }
}, { immediate: true });

// Computed Property tính toán các Role đưa lên UI
const availableRoles = computed(() => {
  // 1. Ưu tiên sử dụng API lấy danh sách roles nếu nó hoạt động
  if (rolesList.value && rolesList.value.length > 0) {
    return rolesList.value;
  }
  // 2. Nếu API bị 404, trả về mảng các chức vụ đã quét được từ danh sách Admin
  return Array.from(extractedRolesMap.value.values());
});


// Khóa màn hình Shimmer lần đầu khi đã tải xong
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
};

// 4. QUERY CHI TIẾT LỊCH SỬ CỦA 1 NHÂN SỰ KHI BẤM NÚT "XEM LỊCH THÁNG"
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
      Toast.fire({ icon: 'error', title: 'Không thể tải lịch sử của nhân viên này!' });
      throw error;
    }
  },
  enabled: computed(() => !!activeHistoryAdmin.value && showHistoryModal.value),
  staleTime: 1000 * 60 * 5,
  keepPreviousData: true,
});

// ---- XỬ LÝ LOGIC GRID HEATMAP THÁNG ----

// Kiểm tra sắc thái cảnh báo đi muộn (Tỷ lệ đi muộn vượt quá 10%)
const isLateWarning = (summaryData) => {
  if (!summaryData || summaryData.total === 0) return false;
  const lateRate = (summaryData.late / summaryData.total) * 100;
  return lateRate > 10;
};

// Phục vụ việc hiển thị tỉ lệ phần trăm của Stacked Bar
const getPercentage = (value, total) => {
  if (!total) return 0;
  return ((value / total) * 100).toFixed(1);
};

// Map dữ liệu tổng quan tháng lấy được từ API vào từng ngày trên lưới lịch
const monthlySummaryMap = computed(() => {
  return monthlySummaryData.value || {};
});

// Tính toán Grid lịch hiển thị bao gồm cả ngày thừa của tháng trước và sau
const monthlyGrid = computed(() => {
  if (!selectedMonth.value) return [];
  const [yearStr, monthStr] = selectedMonth.value.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1; // 0-indexed trong JS
  
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Thứ 2 trên grid là 0, CN là 6. JS getDay(): 0 là CN, 1 là Thứ 2, ...
  let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  let days = []; 
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  // Điền ngày tháng trước
  for (let i = startDay - 1; i >= 0; i--) { 
    days.push({ dayNumber: prevMonthDays - i, isCurrentMonth: false, date: null }); 
  }
  // Điền ngày tháng hiện tại
  for (let i = 1; i <= daysInMonth; i++) { 
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; 
    days.push({ 
      dayNumber: i, 
      isCurrentMonth: true, 
      date: dateStr, 
      summaryData: monthlySummaryMap.value[dateStr] || null 
    }); 
  }
  
  // Điền ngày tháng sau để vừa khít grid 7 cột
  const totalCells = Math.ceil(days.length / 7) * 7; 
  let nextMonthDay = 1;
  while (days.length < totalCells) { 
    days.push({ dayNumber: nextMonthDay++, isCurrentMonth: false, date: null }); 
  }
  
  // Gom nhóm thành từng tuần (7 ô)
  const weeks = []; 
  for (let i = 0; i < days.length; i += 7) { 
    weeks.push(days.slice(i, i + 7)); 
  } 
  return weeks;
});

// KPI chung của tháng được hiển thị phía trên Grid
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
    { title: 'Số ngày Báo Động (>10% muộn)', value: warningDaysCount, icon: 'bi bi-fire text-danger', bgClass: 'bg-danger-subtle text-danger' }
  ];
});

// Khi nhấn vào một ngày trên Grid lịch
const handleDayClick = (day) => {
  if (!day.isCurrentMonth || !day.date) return;
  drillDownDate.value = day.date;
  currentPage.value = 1; // Reset trang chi tiết
  
  // Tự động scroll mượt xuống bảng chi tiết để tối ưu UX
  nextTick(() => {
    if (drillDownSection.value) {
      drillDownSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};

// ---- DRILL-DOWN: XỬ LÝ DANH SÁCH CHI TIẾT TRONG NGÀY ĐƯỢC CHỌN ----

const drillDownList = computed(() => dailyData.value?.data || []);

// Tổng hợp đếm số lượng phục vụ bộ lọc trạng thái
const getCountByStatus = (status) => {
  if (status === 'absent') {
    return drillDownList.value.filter(admin => !admin.attendance).length;
  }
  return drillDownList.value.filter(admin => admin.attendance?.status === status).length;
};

// Xử lý bộ lọc tìm kiếm và trạng thái
const filteredDrillDownList = computed(() => {
  let list = [...drillDownList.value];

  // 1. Lọc theo tìm kiếm tên hoặc email
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(admin => 
      admin.fullname.toLowerCase().includes(query) || 
      admin.email.toLowerCase().includes(query)
    );
  }

  // 2. Lọc theo danh mục trạng thái được chọn (Đúng giờ / Đi muộn / Chưa check-in)
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'absent') {
      list = list.filter(admin => !admin.attendance);
    } else {
      list = list.filter(admin => admin.attendance?.status === statusFilter.value);
    }
  }

  return list;
});

// Tránh lỗi phân trang khi người dùng gõ tìm kiếm
watch([searchQuery, statusFilter, drillDownDate], () => {
  currentPage.value = 1;
});

// Tính toán phân trang
const totalPages = computed(() => Math.ceil(filteredDrillDownList.value.length / itemsPerPage) || 1);

const paginatedDrillDownList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredDrillDownList.value.slice(start, end);
});


// ---- PHẦN LOGIC XỬ LÝ LỊCH SỬ CHẤM CÔNG TRÊN MODAL CÁ NHÂN ----

const adminHistoryMap = computed(() => {
  const map = {}; 
  const items = adminHistoryData.value?.data?.data || [];
  items.forEach(item => { 
    map[item.attendance_date.split('T')[0]] = item; 
  }); 
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
  for (let i = 0; i < days.length; i += 7) { 
    weeks.push(days.slice(i, i + 7)); 
  } 
  return weeks;
});

function openHistoryModal(admin) { 
  activeHistoryAdmin.value = admin; 
  showHistoryModal.value = true; 
  document.body.style.overflow = 'hidden'; 
}

function closeHistoryModal() { 
  showHistoryModal.value = false; 
  activeHistoryAdmin.value = null; 
  document.body.style.overflow = ''; 
}


// ---- CÁC HÀM TIỆN ÍCH HỖ TRỢ HOẠT ĐỘNG CHUNG ----

const isWeekend = (dateStr) => {
  if (!dateStr) return false;
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6; // Thứ 7 hoặc CN
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

  // Vì không còn API globalSettings, chỉ phụ thuộc vào cấu hình ca làm việc của cá nhân đó
  if (shift && Array.isArray(shift.working_days)) {
    return !!shift.working_days[arrayIndex];
  }
  
  // Fallback mặc định: Đi làm từ Thứ 2 -> Thứ 6
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

// Hiển thị trạng thái linh hoạt theo logic quá khứ/tương lai và ngày nghỉ tuần
const getAttendanceCellLabel = (day) => {
  if (!day || !day.date) return '';
  if (day.data) {
    if (day.data.status === 'on_leave') return 'Nghỉ phép';
    if (!isStaffWorkingDay(day.date, day)) return 'Tăng ca';
    return getStatusLabel(day.data.status);
  }
  if (day.isCurrentMonth) {
    if (isPastOrToday(day.date)) {
      // Quá khứ không điểm danh: Báo vắng mặt (nếu có lịch) hoặc Nghỉ tuần (nếu là ngày nghỉ)
      return isStaffWorkingDay(day.date, day) ? 'Vắng mặt' : 'Nghỉ tuần';
    } else {
      // Tương lai: Để trống (nếu có lịch) hoặc hiện mờ Nghỉ tuần (nếu là ngày nghỉ)
      return isStaffWorkingDay(day.date, day) ? '' : 'Nghỉ tuần';
    }
  }
  return '';
};

// Kiểu huy hiệu linh hoạt cho từng ô trạng thái
const getAttendanceCellBadgeClass = (day) => {
  if (!day || !day.date) return 'd-none';
  if (day.data) {
    if (day.data.status === 'on_leave') return 'badge bg-info text-white shadow-sm w-100 py-2';
    if (!isStaffWorkingDay(day.date, day)) return 'badge bg-dark text-white shadow-sm w-100 py-2';
    return getStatusBadgeClassGrid(day.data.status) + ' w-100 py-2';
  }
  if (day.isCurrentMonth) {
    if (isPastOrToday(day.date)) {
      return isStaffWorkingDay(day.date, day)
        ? 'badge bg-secondary-subtle text-secondary border border-secondary border-dashed w-100 py-2 mt-2'
        : 'badge bg-light text-muted border border-secondary-subtle border-dashed w-100 py-2 mt-2';
    } else {
      // Tương lai: Nghỉ tuần hiện mờ, ngày đi làm ẩn trống
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

const formatMonthYear = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  return `${month}/${year}`;
};

const formatTimeOnly = (dateString) => { 
  if (!dateString) return '--:--'; 
  if(dateString.length === 8) return `${dateString.split(':')[0]}:${dateString.split(':')[1]}`; 
  return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); 
};

const getStatusLabel = (status) => ({ 
  present: 'Đúng giờ', late: 'Đi muộn', absent: 'Vắng', on_leave: 'Nghỉ phép' 
}[status] || status);

const getAdminShift = (admin) => admin.attendance?.work_shift || admin.shift_assignment?.work_shift || null;

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

const getCheckoutStatusLabel = (status) => ({ 
  pending: 'Đang làm', completed: 'Đã về', forgotten: 'Quên Checkout' 
}[status] || status);

const getCheckoutStatusBadgeClass = (status) => ({ 
  pending: 'badge bg-info-subtle text-info border border-info', 
  completed: 'badge bg-success-subtle text-success border border-success', 
  forgotten: 'badge bg-danger-subtle text-danger border border-danger' 
}[status] || 'badge bg-secondary');


</script>

<style scoped>
/* CSS LOGO SHIMMER */
.shimmer-wrapper { min-height: 70vh; }
.logo-shimmer { 
  font-size: 3.5rem; 
  font-weight: 900; 
  letter-spacing: -1.5px; 
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); 
  background-size: 200% auto; 
  color: transparent; 
  -webkit-background-clip: text; 
  background-clip: text; 
  animation: shine 1.5s linear infinite; 
}
@keyframes shine { to { background-position: 200% center; } }

/* CSS SKELETON LOADING */
.skeleton {
  background: #eee;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 5px;
  background-size: 200% 100%;
  animation: 1.5s shine-skeleton linear infinite;
}
.skeleton-text { height: 16px; margin-bottom: 4px; border-radius: 4px; }
@keyframes shine-skeleton { to { background-position-x: -200%; } }

.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: #fff; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: #fff; }
.attendance-dashboard-wrapper { width: 100%; }
.date-picker-panel { min-width: 200px; border: 1px solid rgba(0,0,0,0.04); }

.icon-box-small { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 1.1rem; }
.cursor-pointer { cursor: pointer; }
.table-heading-group { flex: 0 0 auto; min-width: 260px; max-width: 100%; }
.table-heading-group h5 { white-space: normal; word-break: keep-all; }

.table-card { min-height: 480px; border: 1px solid rgba(0,0,0,0.04); }
.search-panel .form-control { min-height: 40px; }
.table-responsive { overflow-x: auto; }
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
.border-dashed { border-style: dashed !important; } 
.fw-black { font-weight: 900; }

/* PHÂN TRANG CUSTOM */
.pagination .page-link { color: #495057; border-color: #dee2e6; padding: 0.5rem 0.75rem; }
.pagination .page-item.active .page-link { background-color: #009981; border-color: #009981; color: #fff; }
.pagination .page-link:hover { color: #007a67; background-color: #e6f5f2; }

/* ---- HEATMAP CALENDAR DESIGN ---- */
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.bg-light-warning { background-color: #fff9e6; }

.calendar-container { border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; background-color: #fff; }
.calendar-header-row { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 2px solid #dee2e6; }
.calendar-header-col { padding: 14px 0; text-align: center; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; color: #495057; border-right: 1px solid #e9ecef; }
.calendar-header-col:last-child { border-right: none; }
.calendar-body { display: flex; flex-direction: column; }
.calendar-week { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid #e9ecef; }
.calendar-week:last-child { border-bottom: none; }

.calendar-day-summary { 
  min-height: 105px; 
  border-right: 1px solid #e9ecef; 
  padding: 10px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
  transition: all 0.2s; 
  background-color: #fff; 
  cursor: pointer;
}
.calendar-day-summary:last-child { border-right: none; }
.calendar-day-summary:hover:not(.not-current-month) { 
  background-color: #f0fcf9; 
  transform: translateY(-2px); 
  z-index: 5; 
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08); 
  border-radius: 6px; 
}

.day-number-row { font-size: 0.9rem; font-weight: 700; color: #adb5bd; }
.is-selected-day {
  border: 2px solid #009981 !important;
  background-color: #f0fcf9 !important;
  box-shadow: inset 0 0 8px rgba(0, 153, 129, 0.1);
  border-radius: 6px;
}

/* Hiệu ứng Pulse cảnh báo */
.heatmap-warning {
  background-color: #fff9e6 !important;
}
.alert-pulse-badge {
  background-color: #ffeeba;
  animation: pulse-border 2s infinite;
}
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
}

.progress-stacked-mini { background-color: #e9ecef; display: flex; overflow: hidden; }
.not-current-month { background-color: #fcfcfc !important; pointer-events: none; opacity: 0.4; }

/* HOÀN THIỆN CÁC CARD LỌC TRẠNG THÁI (Đồng bộ thiết kế Metric) */
.filter-metric-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent !important;
  background-color: #ffffff;
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.04) !important;
}
.filter-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.08) !important;
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

/* FIX HOÀN TOÀN LỖI SIDEBAR CHE MODAL (Z-INDEX 9999) */
.modal-backdrop-custom { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(15, 23, 42, 0.65); 
  z-index: 9999 !important;
  overflow-y: auto; 
  padding-bottom: 2rem; 
  backdrop-filter: blur(4px); 
}
.modal-dialog-custom { max-width: 1140px; pointer-events: auto; }
.calendar-day { min-height: 120px; border-right: 1px solid #e9ecef; padding: 10px; display: flex; flex-direction: column; transition: all 0.2s; background-color: #fff; }
.calendar-day:last-child { border-right: none; }
.calendar-day:hover:not(.not-current-month) { background-color: #f8f9fa; transform: scale(1.02); z-index: 10; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05); border-radius: 8px; }
.day-number { font-weight: 700; font-size: 1rem; text-align: right; color: #adb5bd; margin-bottom: 6px; }

.is-weekend { background-color: #f8f9fa !important; }
.is-today { background-color: #e6f5f2 !important; border: 2px solid #009981 !important; border-radius: 8px; }
.time-item { font-size: 0.75rem; display: flex; align-items: center; justify-content: space-between; }
</style>