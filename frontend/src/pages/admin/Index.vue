<template>
  <div>
    <!-- Màn hình Loading -->
    <div v-if="isLoading && hasAccess" class="d-flex flex-column justify-content-center align-items-center w-100"
      style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu tổng quan...
      </p>
    </div>

    <!-- Không có quyền truy cập: hiển thị ngay, không chờ load -->
    <div v-else-if="!hasAccess" class="d-flex justify-content-center align-items-center w-100"
      style="min-height: 70vh;">
      <div class="text-center">
        <h3 class="text-danger">Bạn không có quyền truy cập</h3>
        <p class="text-muted">Tài khoản của bạn không có cấp độ phù hợp để xem trang này.</p>
        <router-link :to="{ name: 'admin-login' }" class="btn btn-brand mt-3">Đăng nhập bằng tài khoản
          khác</router-link>
      </div>
    </div>

    <!-- Nội dung Dashboard -->
    <div v-else class="dashboard-wrapper min-vh-100 p-1">

      <!-- Nút xuất báo cáo fixed -->
      <div class="dropdown position-fixed" style="bottom: 30px; right: 30px; z-index: 1050;">
        <button class="btn btn-brand shadow-lg d-flex align-items-center justify-content-center transition-all"
          type="button" id="exportDropdown" data-bs-toggle="dropdown" aria-expanded="false"
          :disabled="isExporting"
          style="width: 60px; height: 60px; border-radius: 50%; padding: 0;"
          title="Xuất báo cáo Excel">
          <span v-if="isExporting" class="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-file-earmark-arrow-down-fill fs-4 text-white"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-end shadow border mb-3 p-3" aria-labelledby="exportDropdown" style="border-radius: 20px; min-width: 260px; border-color: rgba(0,0,0,0.08) !important;">
          <h6 class="dropdown-header text-uppercase fw-bold text-muted font-size-xs px-1 mb-3" style="letter-spacing: 1px;">Chọn kỳ xuất dữ liệu</h6>
          <div class="d-flex flex-column gap-2">
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-semibold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('today')">
              <div class="d-flex align-items-center justify-content-center bg-primary-soft text-primary rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-calendar-day"></i></div>
              Hôm nay
            </button>
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-semibold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('last_7_days')">
              <div class="d-flex align-items-center justify-content-center bg-info-soft text-info rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-calendar-week"></i></div>
              7 ngày qua
            </button>
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-semibold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('last_30_days')">
              <div class="d-flex align-items-center justify-content-center bg-warning-soft text-warning rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-calendar-month"></i></div>
              30 ngày qua
            </button>
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-semibold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('this_month')">
              <div class="d-flex align-items-center justify-content-center bg-brand-soft text-brand rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-calendar-event"></i></div>
              Tháng này
            </button>
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-semibold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('last_month')">
              <div class="d-flex align-items-center justify-content-center bg-secondary-soft text-secondary rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-calendar-minus"></i></div>
              Tháng trước
            </button>
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-semibold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('all')">
              <div class="d-flex align-items-center justify-content-center bg-success-soft text-success rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-infinity"></i></div>
              Toàn thời gian
            </button>
            <hr class="my-1">
            <button type="button" class="btn btn-light border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-bold rounded-4 transition-all hover-shadow-sm text-primary" @click="showCustomExportModal">
              <div class="d-flex align-items-center justify-content-center bg-primary-soft text-primary rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-calendar-check"></i></div>
              Tùy chọn thời gian...
            </button>
            <button type="button" class="btn btn-brand-soft border-0 text-start d-flex align-items-center gap-3 py-2 px-3 fw-bold rounded-4 transition-all hover-shadow-sm" @click="exportWithPeriod('current')">
              <div class="d-flex align-items-center justify-content-center bg-brand text-white rounded-circle" style="width: 32px; height: 32px;"><i class="bi bi-funnel"></i></div>
              Kỳ đang lọc (Mặc định)
            </button>
          </div>
        </div>
      </div>

      <!-- Hàng 1: Các thẻ thống kê tổng quan (Compact) -->
      <div class="row row-cols-1 row-cols-md-3 row-cols-xl-6 g-3 g-xl-2 mb-3">

        <!-- Tổng doanh thu -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Doanh thu kỳ lọc</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate"
                    :title="formatCurrency(stats.totalRevenue)">{{ formatCompactCurrency(stats.totalRevenue) }}</h4>
                </div>
                <div class="icon-circle bg-brand-soft text-brand flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-cash-stack fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1 font-size-xs" :class="getGrowthClass(stats.revenueGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.revenueGrowth)"></i> {{ formatGrowth(stats.revenueGrowth)
                  }}
                </span>
                <span class="text-muted font-size-xs fw-medium text-truncate">So với kỳ trước</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lợi nhuận ròng -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Lợi nhuận ròng</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate"
                    :title="formatCurrency(stats.netProfit || 0)">{{ formatCompactCurrency(stats.netProfit || 0) }}</h4>
                </div>
                <div class="icon-circle bg-success-soft text-success flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-wallet2 fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1 font-size-xs" :class="getGrowthClass(stats.netProfitGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.netProfitGrowth)"></i> {{ formatGrowth(stats.netProfitGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium text-truncate">So với kỳ trước</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Đơn hàng mới -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Đơn hàng kỳ lọc</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate">{{ stats.newOrders }}</h4>
                </div>
                <div class="icon-circle bg-info-soft text-info flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-bag-check fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1 font-size-xs" :class="getGrowthClass(stats.ordersGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.ordersGrowth)"></i> {{ formatGrowth(stats.ordersGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium text-truncate">So với kỳ trước</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tổng Tồn Kho -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Tổng Tồn
                    Kho</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate">{{ stats.inventory }}</h4>
                </div>
                <div class="icon-circle bg-warning-soft text-warning flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-box-seam fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge bg-secondary-soft text-secondary fw-bold me-2 px-2 py-1 font-size-xs">Cập nhật</span>
                <span class="text-muted font-size-xs fw-medium text-truncate">Vừa xong</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Khách hàng -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Khách mới kỳ lọc</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate">{{ stats.totalCustomers }}</h4>
                </div>
                <div class="icon-circle bg-danger-soft text-danger flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-people fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1 font-size-xs" :class="getGrowthClass(stats.customersGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.customersGrowth)"></i> {{
                    formatGrowth(stats.customersGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium text-truncate">So với kỳ trước</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nhân sự hôm nay -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Nhân sự (Hôm nay)</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate">
                    {{ staffStats.total }} <span class="text-muted font-size-xs fw-medium">Tổng</span>
                  </h4>
                </div>
                <div class="icon-circle bg-primary-soft text-primary flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-person-badge fs-5"></i>
                </div>
              </div>
              <div class="d-flex gap-2 font-size-xs">
                <span class="text-success fw-bold"><i class="bi bi-dot fs-5 align-middle me-n1"></i>{{ staffStats.online
                  }} On</span>
                <span class="text-secondary fw-bold"><i class="bi bi-dot fs-5 align-middle me-n1"></i>{{
                  staffStats.offline }} Off</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Hàng 2: Biểu đồ Doanh thu & Phương thức -->
      <div class="row g-3 g-xl-3 mb-3">
        <div class="col-12 col-xl-9">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div
              class="card-header bg-transparent border-0 pt-3 pb-0 px-3 px-xxl-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <h5 class="fw-bold text-dark mb-0">Thống kê doanh thu</h5>
                <span class="text-muted font-size-xs">Kỳ {{ periodInfo.label }} · {{ periodInfo.start_date }} đến {{ periodInfo.end_date }}</span>
              </div>

              <!-- Bộ lọc ngày thông minh -->
              <div class="d-flex flex-wrap align-items-center gap-2 dashboard-period-filter">
                <button v-for="preset in periodPresets" :key="preset.key" @click="selectPeriod(preset.key)"
                  class="btn btn-sm rounded-pill px-3 fw-semibold dashboard-period-button d-flex align-items-center gap-1"
                  :class="filterParams.period === preset.key ? 'btn-brand' : 'btn-light border-light text-secondary'"
                  :disabled="isFetching">
                  <span v-if="isFetching && filterParams.period === preset.key" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {{ preset.label }}
                </button>

                <div v-if="filterParams.period === 'custom'"
                  class="d-flex align-items-center gap-1 bg-white rounded-3 px-3 py-1 shadow-sm border border-light transition-all filter-group position-relative">
                  <i class="bi bi-calendar-range text-brand me-1"></i>
                  <div class="d-flex flex-column position-relative">
                    <input type="date" v-model="filterParams.startDate" :max="maxDate"
                      class="form-control form-control-sm border-0 bg-transparent shadow-none text-dark fw-semibold font-size-sm p-1 cursor-pointer custom-date-input"
                      title="Từ ngày">
                    <span class="helper-date-label">Từ ngày</span>
                  </div>
                  <span class="text-muted font-size-xs fw-bold px-1">-</span>
                  <div class="d-flex flex-column position-relative">
                    <input type="date" v-model="filterParams.endDate" :min="filterParams.startDate || undefined" :max="maxDate"
                      class="form-control form-control-sm border-0 bg-transparent shadow-none text-dark fw-semibold font-size-sm p-1 cursor-pointer custom-date-input"
                      title="Đến ngày">
                    <span class="helper-date-label">Đến ngày</span>
                  </div>
                </div>

                <button v-if="filterParams.period === 'custom'" @click="applyDashboardFilter"
                  class="btn btn-brand rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all shadow-sm"
                  style="height: 42px;" :disabled="isFetching">
                  <span v-if="isFetching" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                  <i v-else class="bi bi-funnel-fill"></i>
                </button>

                <button @click="selectPeriod('custom')"
                  class="btn btn-light border-light rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all shadow-sm text-secondary"
                  style="height: 42px;" :class="{ 'border-brand text-brand': filterParams.period === 'custom' }"
                  :disabled="isFetching">
                  <i class="bi bi-sliders"></i> Tùy chỉnh
                </button>
                <p v-if="filterError" class="w-100 mb-0 text-danger font-size-xs fw-semibold">{{ filterError }}</p>
              </div>
            </div>
            <div class="card-body p-3 p-xxl-4">
              <div class="row g-2 mb-3">
                <div class="col-12 col-md-4">
                  <div class="dashboard-inline-kpi">
                    <span>Giá trị đơn TB</span>
                    <strong>{{ formatCompactCurrency(stats.averageOrderValue) }}</strong>
                  </div>
                </div>
                <div class="col-6 col-md-4">
                  <div class="dashboard-inline-kpi">
                    <span>Đơn hoàn tất</span>
                    <strong class="text-success">{{ stats.successfulOrders }}</strong>
                  </div>
                </div>
                <div class="col-6 col-md-4">
                  <div class="dashboard-inline-kpi">
                    <span>Đơn hủy/hoàn</span>
                    <strong class="text-danger">{{ stats.cancelledOrders }}</strong>
                  </div>
                </div>
              </div>
              <div style="height: 310px; width: 100%;">
                <canvas id="revenueChart" ref="chartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-3">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-bottom pt-3 pb-2 px-3 px-xxl-4">
              <h5 class="fw-bold mb-0 text-dark">Phương thức thanh toán</h5>
              <span class="text-muted font-size-xs">Tỷ lệ thanh toán trong kỳ được lọc</span>
            </div>
            <div class="card-body d-flex flex-column align-items-center justify-content-center p-3 p-xxl-4">
              <div style="height: 220px; width: 100%; max-width: 220px;" class="mb-4 position-relative">
                <canvas id="paymentMethodChart"></canvas>
              </div>

              <div class="w-100 mt-2">
                <div class="d-flex justify-content-between align-items-center mb-2 font-size-sm border-bottom pb-2">
                  <span class="d-flex align-items-center gap-2"><span
                      class="badge rounded-circle p-1" style="background-color: #005baa;">&nbsp;</span> VNPay (Ví điện tử)</span>
                  <span class="fw-bold text-dark">{{ paymentStats.vnpayPercent }}%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 font-size-sm border-bottom pb-2">
                  <span class="d-flex align-items-center gap-2"><span
                      class="badge rounded-circle p-1" style="background-color: #a50064;">&nbsp;</span> MoMo (Ví điện tử)</span>
                  <span class="fw-bold text-dark">{{ paymentStats.momoPercent }}%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 font-size-sm border-bottom pb-2">
                  <span class="d-flex align-items-center gap-2"><span
                      class="badge rounded-circle p-1" style="background-color: #10b981;">&nbsp;</span> COD (Tiền mặt)</span>
                  <span class="fw-bold text-dark">{{ paymentStats.codPercent }}%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center font-size-sm">
                  <span class="d-flex align-items-center gap-2"><span
                      class="badge rounded-circle p-1 bg-secondary">&nbsp;</span> Chuyển khoản</span>
                  <span class="fw-bold text-dark">{{ paymentStats.bankPercent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 3: Phân tích chuyên sâu (Insights) -->
      <div class="row g-3 g-xl-3 mb-3">
        <!-- Khách hàng mua nhiều nhất -->
        <div class="col-12 col-md-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4" style="background: linear-gradient(to bottom right, rgba(13,110,253,0.05), var(--bs-card-bg));">
            <div class="card-body p-3 d-flex flex-column position-relative overflow-hidden">
              <div class="position-absolute end-0 top-0 mt-3 me-3 opacity-25" style="font-size: 3rem; color: #005baa; pointer-events: none;">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div class="d-flex align-items-start justify-content-between mb-3 z-index-1" style="position: relative; z-index: 2;">
                <div class="pe-2 min-w-0">
                  <p class="text-primary fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Top 5 mua nhiều nhất (Trong kỳ)</p>
                </div>
              </div>
              <div class="d-flex flex-column gap-2 z-index-1 position-relative custom-scrollbar" style="z-index: 2; overflow-y: auto; max-height: 220px; padding-right: 4px;">
                <div v-if="!customerInsights?.topBuyers || customerInsights.topBuyers.length === 0" class="text-muted font-size-sm">Không có dữ liệu</div>
                <div v-else v-for="(buyer, idx) in customerInsights.topBuyers" :key="buyer.name || idx" class="d-flex align-items-center rounded-3 p-2 shadow-sm border border-light transition-all table-row-hover position-relative overflow-hidden" :style="{ backgroundColor: getRankBgStyle(idx) }">
                   <!-- Watermark Icon Giới tính -->
                   <div class="position-absolute d-flex align-items-center justify-content-center" style="font-size: 2.8rem; right: 10px; top: 0; bottom: 0; pointer-events: none; z-index: 0; opacity: 0.1;"
                        :class="{'text-info': buyer.gender?.toLowerCase() === 'male' || buyer.gender?.toLowerCase() === 'nam', 
                                 'text-danger': buyer.gender?.toLowerCase() === 'female' || buyer.gender?.toLowerCase() === 'nữ',
                                 'text-secondary': buyer.gender?.toLowerCase() === 'other' || buyer.gender?.toLowerCase() === 'khác'}">
                     <i v-if="buyer.gender?.toLowerCase() === 'male' || buyer.gender?.toLowerCase() === 'nam'" class="bi bi-gender-male"></i>
                     <i v-else-if="buyer.gender?.toLowerCase() === 'female' || buyer.gender?.toLowerCase() === 'nữ'" class="bi bi-gender-female"></i>
                     <i v-else-if="buyer.gender?.toLowerCase() === 'other' || buyer.gender?.toLowerCase() === 'khác'" class="bi bi-gender-ambiguous"></i>
                   </div>

                   <div class="rank-badge fw-bolder shadow-sm flex-shrink-0 me-2 position-relative z-index-1" :class="getRankClass(idx)" style="width: 24px; height: 24px; font-size: 12px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">{{ idx + 1 }}</div>
                   <div class="position-relative me-2 flex-shrink-0 z-index-1" style="width: 36px; height: 36px;">
                     <div class="avatar-circle bg-primary-soft text-primary fw-bolder shadow-sm d-flex align-items-center justify-content-center" 
                          :style="{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: buyer.tierName ? `2px solid ${getTierColor(buyer.tierName)}` : '1px solid #dee2e6' }">
                       <img v-if="buyer.avatar && !buyerAvatarErrors[buyer.name || idx]" :src="buyer.avatar" class="w-100 h-100 object-fit-cover" @error="buyerAvatarErrors[buyer.name || idx] = true" />
                       <span v-else>{{ getInitialName(buyer.name) }}</span>
                     </div>
                     <span v-if="buyer.tierName" class="position-absolute top-0 start-50 translate-middle badge rounded-pill" 
                           :style="{ backgroundColor: getTierColor(buyer.tierName), fontSize: '8px', padding: '2px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }" :title="buyer.tierName">
                       <i class="bi bi-star-fill text-white"></i>
                     </span>
                   </div>
                   <div class="flex-grow-1 min-w-0 position-relative z-index-1">
                      <p class="mb-0 fw-bold font-size-sm text-dark text-truncate" :title="buyer.name">{{ buyer.name }}</p>
                      <span class="font-size-xs text-brand fw-bold">{{ formatCompactCurrency(buyer.spent) }}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nhóm khách hàng chủ lực -->
        <div class="col-12 col-md-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 transition-all" 
               :style="{ background: customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'linear-gradient(to bottom right, rgba(13,202,240,0.05), var(--bs-card-bg))' : 'linear-gradient(to bottom right, rgba(165,0,100,0.05), var(--bs-card-bg))' }">
            <div class="card-body p-4 d-flex flex-column position-relative overflow-hidden">
              <div class="position-absolute" style="font-size: 8rem; right: -20px; bottom: -30px; pointer-events: none; z-index: 0; opacity: 0.06;"
                   :class="customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'text-info' : (customerInsights?.topGender?.gender?.toLowerCase() === 'nữ' ? 'text-danger' : 'text-secondary')">
                <i class="bi" :class="customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'bi-gender-male' : (customerInsights?.topGender?.gender?.toLowerCase() === 'nữ' ? 'bi-gender-female' : 'bi-people-fill')"></i>
              </div>
              
              <div class="z-index-1" style="position: relative; z-index: 2;">
                <p class="fw-bold font-size-xs mb-0 text-uppercase letter-spacing-1 text-truncate" 
                   :class="customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'text-info' : 'text-gender-female'">
                  Nhóm KH chủ lực
                </p>
              </div>

              <div class="z-index-1 my-auto py-2" style="position: relative; z-index: 2;">
                <h2 class="fw-bolder display-6 mb-2" style="letter-spacing: -1px;"
                    :class="customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'text-gender-male' : 'text-gender-female'"
                    :style="{ 
                      textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }">
                  {{ customerInsights?.topGender?.gender ? 'Phái ' + customerInsights.topGender.gender : 'Chưa xác định' }}
                </h2>
                <div v-if="customerInsights?.topGender?.age_range" class="d-inline-flex align-items-center gap-1 bg-white border rounded-pill px-3 py-1 shadow-sm mt-1">
                  <i class="bi bi-person-hearts" :class="customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'text-info' : 'text-gender-female'"></i>
                  <span class="font-size-xs text-secondary fw-semibold">Độ tuổi phổ biến:</span>
                  <span class="font-size-sm fw-bold text-dark">{{ customerInsights.topGender.age_range }}</span>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top border-light fw-bold text-dark text-truncate z-index-1 d-flex align-items-center gap-2" style="position: relative; z-index: 2;">
                <span class="badge rounded-pill px-2 py-1 text-white font-size-sm" 
                      :class="customerInsights?.topGender?.gender?.toLowerCase() === 'nam' ? 'bg-info' : 'bg-gender-female'">
                  <i class="bi bi-pie-chart-fill"></i> Đóng góp
                </span> 
                <span class="fs-5">{{ formatCurrency(customerInsights?.topGender?.spent || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mùa bội thu -->
        <div class="col-12 col-md-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 bg-gradient-to-br from-success-soft to-white" style="background: linear-gradient(to bottom right, rgba(16,185,129,0.05), #ffffff);">
            <div class="card-body p-4 d-flex flex-column position-relative overflow-hidden">
              <div class="position-absolute text-success" style="font-size: 8rem; right: -20px; bottom: -30px; pointer-events: none; z-index: 0; opacity: 0.06;">
                <i class="bi bi-calendar2-heart-fill"></i>
              </div>
              
              <div class="z-index-1" style="position: relative; z-index: 2;">
                <p class="text-success fw-bold font-size-xs mb-0 text-uppercase letter-spacing-1 text-truncate">
                  Mùa bội thu (All-time)
                </p>
              </div>

              <div class="z-index-1 my-auto py-2" style="position: relative; z-index: 2;">
                <h2 class="fw-bolder fs-2 mb-2 text-success" style="letter-spacing: -1px; line-height: 1.2; text-shadow: 0 2px 10px rgba(16,185,129,0.1);">
                  {{ customerInsights?.bestMonth?.label || 'Đang cập nhật' }}
                </h2>
                <div v-if="customerInsights?.bestMonth?.best_day" class="d-inline-flex align-items-center gap-1 bg-white border border-success border-opacity-25 rounded-pill px-3 py-1 shadow-sm mt-1">
                  <i class="bi bi-calendar-star-fill text-success"></i>
                  <span class="font-size-xs text-secondary fw-semibold">Ngày bùng nổ:</span>
                  <span class="font-size-sm fw-bold text-dark">{{ customerInsights.bestMonth.best_day }}</span>
                </div>
                <div v-if="customerInsights?.bestMonth?.best_day" class="font-size-xs text-muted mt-2 ps-2">
                  <i class="bi bi-arrow-return-right me-1"></i>Đạt doanh thu: <span class="fw-bold text-success">{{ formatCompactCurrency(customerInsights.bestMonth.best_day_spent) }}</span>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top border-light fw-bold text-dark text-truncate z-index-1 d-flex align-items-center gap-2" style="position: relative; z-index: 2;">
                <span class="badge bg-success rounded-pill px-2 py-1 text-white font-size-sm">
                  <i class="bi bi-graph-up-arrow"></i> Kỷ lục
                </span> 
                <span class="fs-5">{{ formatCurrency(customerInsights?.bestMonth?.spent || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 3.5: Khu vực bán hàng & Danh mục -->
      <div class="row g-3 g-xl-3 mb-3">
        <!-- Doanh thu theo Danh mục -->
        <div class="col-12 col-xl-6">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span class="badge p-1 rounded" style="background-color: #8b5cf6">&nbsp;</span> Doanh thu theo Danh mục
              </h5>
            </div>
            <div class="card-body p-3 p-xxl-4 position-relative d-flex justify-content-center align-items-center" style="min-height: 250px;">
              <div v-if="!customerInsights?.categoryRevenue || customerInsights.categoryRevenue.length === 0" class="text-center text-muted">Không có dữ liệu</div>
              <div v-else class="w-100 h-100" style="max-height: 250px;">
                <canvas id="categoryChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Khu Vực -->
        <div class="col-12 col-xl-6">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-primary border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i class="bi bi-geo-alt-fill text-primary"></i> Phân bổ Khách hàng (Top 5 Khu vực)
              </h5>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 290px; overflow-y: auto;">
              <p v-if="!customerInsights?.topRegions || customerInsights.topRegions.length === 0" class="text-center text-muted py-3">Không có dữ liệu</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="(region, idx) in customerInsights.topRegions" :key="idx" class="d-flex align-items-center p-2 rounded-3 bg-light-soft border border-light">
                  <div class="rank-badge shadow-sm me-3" :class="getRankClass(idx)" style="width: 28px; height: 28px; font-size: 13px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">{{ idx + 1 }}</div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="mb-1 fw-bold text-dark text-truncate">{{ region.region || 'Không xác định' }}</h6>
                    <div class="d-flex justify-content-between font-size-xs text-secondary">
                      <span><i class="bi bi-box-seam me-1"></i>{{ region.order_count }} đơn hàng</span>
                      <span class="text-brand fw-bold">{{ formatCurrency(region.revenue) }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 4: Giao dịch & Tương tác -->
      <div class="row g-3 g-xl-3 mb-3">
        <div class="col-12 col-xl-7">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div
              class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark">Đơn hàng mới nhất</h5>
              <router-link :to="{ path: '/admin/orders' }"
                class="btn btn-sm bg-brand-soft text-brand fw-bold rounded-pill px-3 transition-all border border-light">
                Xem tất cả

              </router-link>
            </div>
            <div class="card-body p-0 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 custom-table">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-4 py-3 fw-bold text-secondary border-0">Mã ĐH</th>
                      <th class="py-3 fw-bold text-secondary border-0">Khách hàng</th>
                      <th class="py-3 fw-bold text-secondary border-0">Ngày đặt</th>
                      <th class="py-3 fw-bold text-secondary border-0">Tổng tiền</th>
                      <th class="pe-4 py-3 fw-bold text-secondary border-0 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="recentOrders?.length === 0">
                      <td colspan="5" class="text-center py-4 text-muted font-size-sm">Chưa có đơn hàng nào.</td>
                    </tr>
                    <tr v-else v-for="order in recentOrders" :key="order.id"
                      class="border-bottom border-light transition-all table-row-hover">
                      <td class="ps-4 py-3"><span class="text-brand fw-bold font-size-xs whitespace-nowrap"
                          :title="order.code">#{{ order.code?.substring(0, 5) }}...</span></td>
                      <td class="py-3">
                        <div>
                          <h6 class="mb-0 fw-bold text-dark font-size-sm text-truncate" style="max-width: 140px;">{{
                            order.customer || 'Khách lẻ' }}</h6>
                        </div>
                      </td>
                      <td class="py-3 text-secondary font-size-xs fw-medium whitespace-nowrap">{{
                        order.date?.replace(/\/\d{4}\s/, '-') || '' }}</td>
                      <td class="py-3 fw-bold text-dark font-size-sm text-end whitespace-nowrap">{{
                        formatCompactCurrency(order.total) }}</td>
                      <td class="pe-4 py-3 text-center">
                        <span
                          class="badge rounded-pill border-0 fw-bold px-2 py-1 shadow-sm d-inline-flex align-items-center gap-1 justify-content-center font-size-xs"
                          :class="getStatusBadgeClass(order.status)" style="min-width: 105px;">
                          <i :class="getStatusIcon(order.status)"></i> {{ translateStatus(order.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-5">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div
              class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark">Đánh giá mới nhất</h5>
              <router-link :to="{ path: '/admin/reviews' }"
                class="btn btn-sm bg-brand-soft text-brand fw-bold rounded-pill px-3 transition-all border border-light">
                Quản lý
              </router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="recentReviews?.length === 0" class="text-center text-muted py-3">Chưa có đánh giá nào.</p>

              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="review in recentReviews" :key="review.id"
                  class="d-flex align-items-start gap-3 border-bottom pb-3 mb-1">
                  <div
                    class="avatar-circle bg-light-soft text-dark fw-bolder border border-light shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center"
                    style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden;">
                    <img v-if="review.user_avatar && !reviewAvatarErrors[review.id]" :src="review.user_avatar"
                      @load="handleImageLoad('review-' + review.id)" @error="reviewAvatarErrors[review.id] = true" class="w-100 h-100 object-fit-cover img-fade-in" :class="{ 'img-loaded': isImageLoaded('review-' + review.id) }" />
                    <span v-else>{{ getInitialName(review.user_name) }}</span>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h6 class="mb-0 fw-bold text-dark font-size-sm text-truncate pe-2">{{ review.user_name }}</h6>
                      <span class="text-muted font-size-xs whitespace-nowrap">{{ review.date }}</span>
                    </div>
                    <div class="text-warning mb-1 font-size-xs">
                      <i v-for="n in review.rating" :key="'star-' + n" class="bi bi-star-fill me-1"></i>
                      <i v-for="n in (5 - review.rating)" :key="'empty-' + n"
                        class="bi bi-star text-secondary me-1"></i>
                    </div>
                    <p class="text-secondary font-size-sm mb-0"
                      style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      "{{ review.comment || 'Không có nội dung' }}"
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 4: Sản phẩm & Chiến dịch -->
      <div class="row g-3 g-xl-3 mb-3">
        <!-- Top Bán Chạy -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-brand border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4">
              <h5 class="fw-bold mb-0 text-dark">Top Bán Chạy</h5>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="topProducts?.length === 0" class="text-center text-muted py-3">Chưa có sản phẩm nào được bán.</p>

              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="(product, index) in topProducts" :key="product.id"
                  class="d-flex align-items-center product-item pb-2 border-bottom border-light">
                  <div class="rank-badge fw-bolder shadow-sm flex-shrink-0" :class="getRankClass(index)">{{ index + 1 }}
                  </div>

                  <div
                    class="product-img-box ms-3 me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light"
                    style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="product.image" :src="product.image" @load="handleImageLoad('top-product-' + product.id)" @error="handleImageError" alt="Product"
                      class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0 img-fade-in" :class="{ 'img-loaded': isImageLoaded('top-product-' + product.id) }"
                      style="object-fit: cover; z-index: 1;" />
                    <div v-if="!product.image"
                      class="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-secondary rounded-2">
                      <i class="bi bi-box-seam"></i>
                    </div>
                  </div>

                  <div class="flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate"
                      :class="{ 'text-decoration-line-through text-muted opacity-75': product.is_deleted }"
                      :title="product.name">
                      {{ product.name }}
                    </h6>
                    <div class="d-flex justify-content-between align-items-end mt-1 flex-wrap gap-1">
                      <p class="mb-0 text-secondary font-size-xs fw-medium">
                        Bán: <span class="text-dark fw-bold">{{ product.sold }}</span>
                      </p>
                      <div class="fw-bolder text-brand font-size-sm whitespace-nowrap">{{ formatCurrency(product.price)
                        }}</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Cảnh báo Hết Hàng -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-danger border-3">
            <div
              class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill text-danger"></i> Sắp hết hàng
              </h5>
              <router-link :to="{ path: '/admin/inventory' }"
                class="btn btn-sm bg-danger-soft text-danger fw-bold rounded-pill px-3 transition-all border border-light">Quản
                lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="lowStockProducts?.length === 0" class="text-center text-muted py-3">Kho hàng đang dồi dào, chưa
                có mã nào sắp hết.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="product in lowStockProducts" :key="product.id"
                  class="d-flex align-items-center product-item pb-2 border-bottom border-light">
                  <div
                    class="product-img-box me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light"
                    style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="product.image" :src="product.image" @load="handleImageLoad('lowstock-' + product.id)" @error="handleImageError"
                      class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0 img-fade-in" :class="{ 'img-loaded': isImageLoaded('lowstock-' + product.id) }"
                      style="object-fit: cover;" />
                    <i v-else class="bi bi-box-seam text-secondary"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate" :title="product.name">{{ product.name
                      }}</h6>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                      <span class="text-secondary font-size-xs">SKU: {{ product.sku || 'N/A' }}</span>
                      <span class="badge bg-danger-soft text-danger fw-bolder px-2 py-1">Tồn: {{ product.stock }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Combo đang chạy -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-info border-3">
            <div
              class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i class="bi bi-gift-fill text-info"></i> Combo Đang chạy
              </h5>
              <router-link :to="{ path: '/admin/combos' }"
                class="btn btn-sm bg-info-soft text-info fw-bold rounded-pill px-3 transition-all border border-light">Quản
                lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="activeCombos?.length === 0" class="text-center text-muted py-3">Không có combo nào đang hoạt
                động.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="combo in activeCombos" :key="combo.id" class="combo-ticket position-relative">
                  <div class="d-flex align-items-stretch bg-white border border-info border-opacity-25 rounded-3 shadow-sm overflow-hidden h-100">
                    <!-- Hình ảnh bên trái -->
                    <div class="position-relative bg-light flex-shrink-0" style="width: 85px;">
                      <img v-if="combo.image" :src="combo.image" @load="handleImageLoad('combo-' + combo.id)" @error="handleImageError"
                        class="img-fluid w-100 h-100 object-fit-cover img-fade-in" :class="{ 'img-loaded': isImageLoaded('combo-' + combo.id) }" />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center bg-info-soft text-info">
                        <i class="bi bi-gift fs-3"></i>
                      </div>
                      
                      <!-- Tag giảm giá đè lên ảnh -->
                      <div class="position-absolute bottom-0 start-0 w-100 bg-info text-white text-center py-1 bg-opacity-75 backdrop-blur" style="font-size: 0.75rem; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                        -{{ combo.discount_type === 'percentage' ? combo.discount_value + '%' : formatCompactCurrency(combo.discount_value) }}
                      </div>
                    </div>
                    
                    <!-- Phần đường rọc xé (Dashed line) -->
                    <div class="position-relative d-flex flex-column align-items-center bg-info-soft" style="width: 16px;">
                      <!-- Vòng tròn khuyết trên -->
                      <div class="position-absolute bg-white rounded-circle" style="width: 12px; height: 12px; top: -6px; border-bottom: 1px solid rgba(13, 202, 240, 0.25);"></div>
                      
                      <!-- Đường nét đứt -->
                      <div class="h-100 border-start border-info border-opacity-25" style="border-left-style: dashed !important; border-left-width: 2px !important; margin-top: 6px; margin-bottom: 6px;"></div>
                      
                      <!-- Vòng tròn khuyết dưới -->
                      <div class="position-absolute bg-white rounded-circle" style="width: 12px; height: 12px; bottom: -6px; border-top: 1px solid rgba(13, 202, 240, 0.25);"></div>
                    </div>

                    <!-- Nội dung bên phải -->
                    <div class="p-3 flex-grow-1 d-flex flex-column justify-content-center min-w-0 bg-info-soft bg-opacity-10">
                      <h6 class="fw-bold text-dark mb-2 font-size-sm text-truncate" :title="combo.name">{{ combo.name }}</h6>
                      <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div class="d-flex align-items-center text-secondary" style="font-size: 0.75rem;">
                          <i class="bi bi-calendar-event me-1 text-info"></i>HSD: <span class="ms-1 fw-bold text-dark">{{ combo.end_date }}</span>
                        </div>
                        <span v-if="isComboEndingSoon(combo.end_date)" class="badge bg-warning-soft text-warning px-2 py-1 border border-warning border-opacity-25" style="font-size: 0.7rem;">Sắp hết hạn</span>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 5: Vận hành & Cảnh báo -->
      <div class="row g-3 g-xl-3 mb-3">
        <!-- Giá trị Kho & Hàng tồn đọng -->
        <div class="col-12 col-xl-6">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-warning border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i class="bi bi-boxes text-warning"></i> Giá trị Kho & Hàng Tồn đọng
              </h5>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <!-- Tổng Giá trị Kho -->
              <div class="d-flex align-items-center justify-content-between p-3 rounded-4 mb-3 bg-gradient-to-r from-warning-soft to-white border border-light shadow-sm">
                <div>
                  <p class="text-secondary fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1">Tổng Vốn Tồn Kho</p>
                  <h4 class="fw-bolder mb-0 text-dark">{{ formatCurrency(customerInsights?.inventoryValue || 0) }}</h4>
                </div>
                <div class="avatar-circle bg-warning text-white d-flex align-items-center justify-content-center shadow-sm" style="width: 48px; height: 48px; border-radius: 50%;">
                  <i class="bi bi-safe2 fs-4"></i>
                </div>
              </div>

              <!-- Danh sách Dead Stock -->
              <div class="d-flex justify-content-between align-items-center mb-3 mt-4">
                <h6 class="fw-bold text-dark mb-0"><i class="bi bi-exclamation-circle text-danger me-1"></i> Top 5 Tồn đọng</h6>
                <span class="badge bg-danger text-white rounded-pill px-2 py-1" v-if="customerInsights?.deadStockCount > 0" title="Tổng số mẫu mã tồn đọng (30 ngày chưa bán được)">
                  Tổng: {{ customerInsights.deadStockCount }} mẫu mã
                </span>
              </div>
              <p v-if="!customerInsights?.deadStock || customerInsights.deadStock.length === 0" class="text-center text-muted py-3">Kho hàng đang luân chuyển rất tốt, không có hàng tồn đọng.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="(item, idx) in customerInsights.deadStock" :key="idx" class="d-flex align-items-center pb-2 border-bottom border-light">
                  <div class="product-img-box me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light" style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="item.thumbnail_image" :src="item.thumbnail_image" @error="handleImageError" class="img-fluid rounded-2 h-100 w-100 object-fit-cover" />
                    <i v-else class="bi bi-box-seam text-secondary"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate" :title="item.name">{{ item.name }}</h6>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                      <span class="badge bg-danger-soft text-danger fw-bolder px-2 py-1">Tồn: {{ item.total_stock }}</span>
                      <span class="text-secondary font-size-xs fw-medium">Vốn đọng: <strong class="text-dark">{{ formatCompactCurrency(item.total_stock * item.cost_price) }}</strong></span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Lý do Hủy/Hoàn Đơn -->
        <div class="col-12 col-xl-6">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-danger border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i class="bi bi-clipboard-x-fill text-danger"></i> Phân tích Hủy/Hoàn Đơn
              </h5>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="!customerInsights?.cancelReasons || customerInsights.cancelReasons.length === 0" class="text-center text-muted py-3">Không có dữ liệu hủy/hoàn đơn trong kỳ này.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="(reason, idx) in customerInsights.cancelReasons" :key="idx" class="d-flex align-items-start gap-3 p-3 rounded-3 bg-light-soft border border-light">
                  <div class="avatar-circle bg-danger-soft text-danger d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style="width: 32px; height: 32px; border-radius: 50%;">
                    <i class="bi bi-x-circle-fill"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <h6 class="mb-0 fw-bold text-dark font-size-sm lh-base pe-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ reason.note }}</h6>
                    </div>
                    <span class="badge bg-secondary-soft text-secondary fw-bold px-2 py-1 mt-1"><i class="bi bi-hash"></i> Số lượng: {{ reason.count }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 6: Thống kê Khuyến mãi & Mã giảm giá -->
      <div class="row g-3 g-xl-4 mt-1">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
              <span
                class="bg-purple text-white rounded-3 p-2 d-inline-flex align-items-center justify-content-center shadow-sm"
                style="width: 32px; height: 32px;">
                <i class="bi bi-percent font-size-sm"></i>
              </span>
              Khuyến mãi & Mã giảm giá
            </h4>
            <router-link :to="{ name: 'admin-coupon-create' }"
              class="btn bg-purple text-white rounded-3 px-3 py-2 fw-semibold font-size-sm shadow-sm d-flex align-items-center gap-2">
              <i class="bi bi-plus-lg"></i> Thêm mã mới
            </router-link>
          </div>
        </div>

        <div class="col-12">
          <div class="card custom-card border-0 shadow-sm rounded-4">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 custom-table">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-4 py-3 fw-bold text-secondary border-0">Mã / Tên</th>
                      <th class="py-3 fw-bold text-secondary border-0">Mức giảm</th>
                      <th class="py-3 fw-bold text-secondary border-0" style="min-width: 140px;">Đã dùng</th>
                      <th class="py-3 fw-bold text-secondary border-0">Thời hạn</th>
                      <th class="py-3 fw-bold text-secondary border-0 text-center">Trạng thái</th>
                      <th class="pe-4 py-3 fw-bold text-secondary border-0 text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!couponData.list || couponData.list.length === 0">
                      <td colspan="6" class="text-center py-4 text-muted">Hiện chưa có mã giảm giá nào.</td>
                    </tr>
                    <tr v-else v-for="coupon in couponData.list" :key="coupon.id" class="border-bottom border-light">
                      <td class="ps-4 py-3">
                        <div class="fw-bold text-dark font-size-sm">{{ coupon.name }}</div>
                        <div class="text-muted font-size-xs">{{ coupon.desc }}</div>
                      </td>
                      <td class="py-3">
                        <span class="fw-bolder" style="color: #8b5cf6;">{{ coupon.value_display }}</span>
                        <div class="text-muted font-size-xs mt-1"><span class="badge bg-light text-dark border">{{
                          coupon.type }}</span></div>
                      </td>
                      <td class="py-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span class="fw-bold text-dark font-size-sm">{{ coupon.usage_count }} / {{ coupon.usage_limit
                            || '∞' }}</span>
                          <span class="text-muted font-size-xs">{{ getUsagePercentage(coupon) }}%</span>
                        </div>
                        <div class="progress progress-thin bg-light" style="height: 5px;">
                          <div class="progress-bar bg-dark" role="progressbar"
                            :style="{ width: getUsagePercentage(coupon) + '%' }"></div>
                        </div>
                      </td>
                      <td class="py-3 text-secondary font-size-sm fw-medium"><i class="bi bi-calendar3 me-1"></i>{{
                        formatCouponDate(coupon.expires_at) }}</td>
                      <td class="py-3 text-center">
                        <span class="badge rounded-pill fw-bold px-3 py-1" :class="getCouponBadgeClass(coupon.status)">
                          {{ coupon.status === 'active' ? 'Hoạt động' : (coupon.status === 'expired' ? 'Hết hạn' :
                            (coupon.status === 'inactive' ? 'Ẩn đi' : 'Sắp tới')) }}
                        </span>
                      </td>
                      <td class="pe-4 py-3 text-end">
                        <div class="d-flex justify-content-end gap-2">
                          <button v-if="coupon.status === 'active'" @click="toggleCouponStatus(coupon)"
                            :disabled="isUpdatingCoupon === coupon.id"
                            class="btn btn-sm btn-danger-soft text-danger border-0 fw-semibold">
                            <span v-if="isUpdatingCoupon === coupon.id" class="spinner-border spinner-border-sm"
                              role="status"></span>
                            <span v-else>Dừng</span>
                          </button>
                          <button v-else-if="['inactive', 'expired', 'soon'].includes(coupon.status)"
                            @click="toggleCouponStatus(coupon)" :disabled="isUpdatingCoupon === coupon.id"
                            class="btn btn-sm btn-success-soft text-success border-0 fw-semibold">
                            <span v-if="isUpdatingCoupon === coupon.id" class="spinner-border spinner-border-sm"
                              role="status"></span>
                            <span v-else>Kích hoạt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Thanh tóm tắt thống kê -->
        <div class="col-12 mt-3">
          <div class="row g-3">
            <!-- Hoạt động -->
            <div class="col-6 col-md-3">
              <div class="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--bs-card-bg) 100%);">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="avatar-circle bg-success text-white flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; border-radius: 50%;">
                    <i class="bi bi-check-circle-fill fs-4"></i>
                  </div>
                  <div>
                    <h3 class="fw-bolder text-dark mb-0 lh-1">{{ couponData.summary.active || 0 }}</h3>
                    <span class="text-secondary font-size-sm fw-medium">Hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Sắp tới -->
            <div class="col-6 col-md-3">
              <div class="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bs-card-bg) 100%);">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="avatar-circle bg-warning text-white flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; border-radius: 50%;">
                    <i class="bi bi-clock-fill fs-4"></i>
                  </div>
                  <div>
                    <h3 class="fw-bolder text-dark mb-0 lh-1">{{ couponData.summary.upcoming || 0 }}</h3>
                    <span class="text-secondary font-size-sm fw-medium">Sắp tới</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Đã hết hạn -->
            <div class="col-6 col-md-3">
              <div class="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--bs-card-bg) 100%);">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="avatar-circle bg-danger text-white flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; border-radius: 50%;">
                    <i class="bi bi-x-circle-fill fs-4"></i>
                  </div>
                  <div>
                    <h3 class="fw-bolder text-dark mb-0 lh-1">{{ couponData.summary.expired || 0 }}</h3>
                    <span class="text-secondary font-size-sm fw-medium">Đã hết hạn</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tổng lượt dùng -->
            <div class="col-6 col-md-3">
              <div class="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, var(--bs-card-bg) 100%);">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="avatar-circle flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; border-radius: 50%; background-color: #8b5cf6; color: white;">
                    <i class="bi bi-ticket-perforated-fill fs-4"></i>
                  </div>
                  <div>
                    <h3 class="fw-bolder text-dark mb-0 lh-1">{{ couponData.summary.total_uses || 0 }}</h3>
                    <span class="text-secondary font-size-sm fw-medium">Lượt sử dụng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Biểu đồ sử dụng Coupon -->
        <div class="col-12 mt-3">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-3 px-xxl-4">
              <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <span class="badge p-1 rounded bg-purple">&nbsp;</span> Biểu đồ sử dụng mã giảm giá
              </h5>
              <span class="text-muted font-size-xs">Hiển thị lịch sử sử dụng mã giảm giá qua các đơn hàng</span>
            </div>
            <div class="card-body p-3 p-xxl-4">
              <div style="height: 300px; width: 100%;">
                <canvas id="couponChart" ref="couponChartCanvas"></canvas>
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
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import Chart from 'chart.js/auto';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';
import defaultImage from '@/assets/images/defaults/placeholder.png';

const toDateInputValue = (date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().split('T')[0];
};
const maxDate = toDateInputValue(new Date());
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const getInitialName = (name) => {
  if (!name) return 'K';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const loadedImages = ref(new Set());

const handleImageLoad = (id) => {
  loadedImages.value.add(id);
};

const handleImageError = (e) => {
  e.target.src = defaultImage;
  e.target.onerror = null;
};

const isImageLoaded = (id) => loadedImages.value.has(id);

const formatCompactCurrency = (value) => {
  if (!value) return '0đ';
  const num = Number(value);
  if (isNaN(num)) return '0đ';

  if (num >= 1000000000) {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(num / 1000000000) + ' Tỷ';
  }
  if (num >= 1000000) {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(num / 1000000) + ' Tr';
  }
  return formatCurrency(num);
};

const isComboEndingSoon = (endDateStr) => {
  if (!endDateStr) return false;
  const parts = endDateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`);
    const diff = d - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  }
  return false;
};

const exportWithPeriod = async (period) => {
  if (period === 'current') {
    exportToExcel();
    return;
  }
  
  isExporting.value = true;
  
  // Backup state
  const prevFilter = { ...filterParams.value };
  const prevApplied = { ...appliedFilterParams.value };
  
  // Apply new period temp
  filterParams.value.period = period;
  if (period !== 'custom') {
    filterParams.value.startDate = '';
    filterParams.value.endDate = '';
  }
  appliedFilterParams.value = { ...filterParams.value };
  
  try {
    const { isError } = await refetch();
    if (isError) throw new Error("Fetch failed");
    
    // Process and download Excel
    exportToExcel(); 
    // exportToExcel will toggle isExporting.value = false at the end
  } catch (err) {
    console.error("Lỗi lấy dữ liệu xuất Excel:", err);
    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải dữ liệu báo cáo.' });
    isExporting.value = false;
  } finally {
    // Restore quietly without blocking UI
    filterParams.value = prevFilter;
    appliedFilterParams.value = prevApplied;
    refetch();
  }
};

const showCustomExportModal = async () => {
  // Load flatpickr dynamically from bundle if not exist
  if (!window.flatpickrLoaded) {
    try {
      await Promise.race([
        (async () => {
          await import('flatpickr/dist/flatpickr.min.css');
          const flatpickrMod = await import('flatpickr');
          const vnLocaleMod = await import('flatpickr/dist/l10n/vn.js');
          
          window.flatpickr = flatpickrMod.default || flatpickrMod;
          
          if (!document.getElementById('flatpickr-custom-style')) {
            const style = document.createElement('style');
            style.id = 'flatpickr-custom-style';
            style.innerHTML = '.flatpickr-calendar { font-family: inherit; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: none; border-radius: 12px; padding: 5px; } .flatpickr-day.selected { background: #00B171 !important; border-color: #00B171 !important; }';
            document.head.appendChild(style);
          }
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Flatpickr load timeout')), 10000))
      ]);
      window.flatpickrLoaded = true;
    } catch (error) {
      console.error('Failed to load Flatpickr:', error);
      Swal.fire('Lỗi', 'Không thể tải thư viện chọn ngày. Vui lòng thử lại sau.', 'error');
      return;
    }
  }

  const { value: formValues } = await Swal.fire({
    title: 'Chọn thời gian xuất báo cáo',
    didOpen: () => {
      const flatpickrConfig = { 
        maxDate: "today", 
        dateFormat: "Y-m-d", 
        locale: "vn", 
        altInput: true, 
        altFormat: "d/m/Y", 
        allowInput: true,
        onReady: function(selectedDates, dateStr, instance) {
          instance.altInput.addEventListener('input', function(e) {
            // Ngăn việc format lại khi đang nhấn phím Backspace để xóa
            if (e.inputType === 'deleteContentBackward') return;
            
            let v = this.value.replace(/\D/g, '');
            if (v.length > 8) v = v.substring(0, 8);
            
            if (v.length >= 5) {
              this.value = `${v.substring(0,2)}/${v.substring(2,4)}/${v.substring(4,8)}`;
            } else if (v.length >= 3) {
              this.value = `${v.substring(0,2)}/${v.substring(2)}`;
            }
          });
        }
      };
      window.flatpickr("#swal-input1", flatpickrConfig);
      window.flatpickr("#swal-input2", flatpickrConfig);
    },
    html:
      '<div class="mb-3 text-start"><label class="form-label fw-bold text-dark">Từ ngày</label>' +
      '<input id="swal-input1" type="text" class="form-control px-3 py-2 bg-light border-0 shadow-sm transition-all" style="cursor: pointer; border-radius: 10px;" placeholder="dd/mm/yyyy"></div>' +
      '<div class="mb-3 text-start"><label class="form-label fw-bold text-dark">Đến ngày</label>' +
      '<input id="swal-input2" type="text" class="form-control px-3 py-2 bg-light border-0 shadow-sm transition-all" style="cursor: pointer; border-radius: 10px;" placeholder="dd/mm/yyyy"></div>' +
      '<div class="alert alert-info mt-3 mb-0 text-start d-flex gap-2 align-items-center" style="border-radius: 10px; font-size: 0.85rem;"><i class="bi bi-info-circle-fill fs-5"></i> <span>Để xuất dữ liệu của <b>1 ngày</b>, hãy chọn Từ ngày và Đến ngày giống nhau.</span></div>',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Xuất Excel',
    confirmButtonColor: '#00B171',
    cancelButtonText: 'Hủy',
    preConfirm: () => {
      const start = document.getElementById('swal-input1').value;
      const end = document.getElementById('swal-input2').value;
      if (!start || !end) {
        Swal.showValidationMessage('Vui lòng chọn đầy đủ Từ ngày và Đến ngày');
        return false;
      }
      if (start > end) {
        Swal.showValidationMessage('Đến ngày phải sau hoặc bằng Từ ngày');
        return false;
      }
      return { start, end };
    }
  });

  if (formValues) {
    exportWithCustomDates(formValues.start, formValues.end);
  }
};

const exportWithCustomDates = async (start, end) => {
  isExporting.value = true;
  
  const prevFilter = { ...filterParams.value };
  const prevApplied = { ...appliedFilterParams.value };
  
  filterParams.value.period = 'custom';
  filterParams.value.startDate = start;
  filterParams.value.endDate = end;
  
  appliedFilterParams.value = { ...filterParams.value };
  
  try {
    const { isError } = await refetch();
    if (isError) throw new Error("Fetch failed");
    
    exportToExcel(); 
  } catch (err) {
    console.error("Lỗi lấy dữ liệu xuất Excel:", err);
    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải dữ liệu báo cáo.' });
    isExporting.value = false;
  } finally {
    filterParams.value = prevFilter;
    appliedFilterParams.value = prevApplied;
    refetch();
  }
};

const exportToExcel = () => {
  isExporting.value = true;
  try {
    const wb = XLSX.utils.book_new();

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    const formatNumber = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

    const exportedAt = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    const createReportSheet = ({ title, headers, rows, widths, rightAligned = [] }) => {
      const data = [
        [title],
        ['Xuất báo cáo: ' + exportedAt],
        [],
        headers,
        ...rows,
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const lastColumn = headers.length - 1;
      const lastRow = rows.length + 3;
      const borderColor = '000000'; // Đổi sang viền đen rõ nét


      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumn } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumn } },
      ];
      ws['!cols'] = widths.map((width) => ({ wch: width }));
      ws['!rows'] = [{ hpt: 28 }, { hpt: 18 }, { hpt: 8 }, { hpt: 22 }];
      ws['!autofilter'] = { ref: 'A4:' + XLSX.utils.encode_col(lastColumn) + String(lastRow + 1) };
      ws['!views'] = [{ showGridLines: false }];

      for (let row = 0; row <= lastRow; row += 1) {
        for (let column = 0; column <= lastColumn; column += 1) {
          const address = XLSX.utils.encode_cell({ r: row, c: column });
          if (!ws[address]) continue;

          const isHeader = row === 3;
          const isDataRow = row > 3;
          const value = String(ws[address].v ?? '');
          const cellStyle = {
            font: {
              name: 'Times New Roman',
              sz: row === 0 ? 16 : 12,
              bold: row === 0 || isHeader || (isDataRow && column === 0),
              color: { rgb: row <= 1 || isHeader ? 'FFFFFF' : (value.startsWith('-') ? 'C0392B' : '000000') },
            },
            fill: {
              fgColor: {
                rgb: row === 0
                  ? '009981'
                  : (row === 1 ? '007A67' : (isHeader ? '0B5D52' : (isDataRow && row % 2 === 0 ? 'F2FAF8' : 'FFFFFF'))),
              },
            },
            alignment: {
              vertical: 'center',
              horizontal: row <= 1 ? 'left' : (isHeader ? 'center' : (rightAligned.includes(column) ? 'right' : 'left')),
              wrapText: true,
            },
          };
          if (isHeader || isDataRow) {
            cellStyle.border = {
              top: { style: 'thin', color: { rgb: borderColor } },
              bottom: { style: 'thin', color: { rgb: borderColor } },
              left: { style: 'thin', color: { rgb: borderColor } },
              right: { style: 'thin', color: { rgb: borderColor } },
            };
          }
          ws[address].s = cellStyle;
        }
      }

      return ws;
    };

    const overviewData = [
      { "Chỉ số": "Doanh thu kỳ lọc", "Giá trị": formatMoney(stats.value.totalRevenue) },
      { "Chỉ số": "Tăng trưởng doanh thu", "Giá trị": formatGrowth(stats.value.revenueGrowth) },
      { "Chỉ số": "Đơn hàng kỳ lọc", "Giá trị": formatNumber(stats.value.newOrders) },
      { "Chỉ số": "Tăng trưởng đơn hàng", "Giá trị": formatGrowth(stats.value.ordersGrowth) },
      { "Chỉ số": "Khách mới kỳ lọc", "Giá trị": formatNumber(stats.value.totalCustomers) },
      { "Chỉ số": "Tăng trưởng khách hàng", "Giá trị": formatGrowth(stats.value.customersGrowth) },
      { "Chỉ số": "Tổng tồn kho hệ thống", "Giá trị": formatNumber(stats.value.inventory) },
      { "Chỉ số": "Tổng vốn tồn kho", "Giá trị": formatMoney(customerInsights.value?.inventoryValue) },
      { "Chỉ số": "Số lượng SP tồn đọng", "Giá trị": formatNumber(customerInsights.value?.deadStockCount) },
      { "Chỉ số": "Số SP sắp hết hàng", "Giá trị": formatNumber(lowStockProducts.value?.length || 0) },
      { "Chỉ số": "Combo đang hoạt động", "Giá trị": formatNumber(activeCombos.value?.length || 0) },
      { "Chỉ số": "Số lý do hủy/hoàn đơn", "Giá trị": formatNumber(customerInsights.value?.cancelReasons?.reduce((sum, item) => sum + item.count, 0) || 0) },
      { "Chỉ số": "Mã giảm giá đang hoạt động", "Giá trị": formatNumber(couponData.value?.summary?.active) },
      { "Chỉ số": "Tổng lượt dùng mã giảm giá", "Giá trị": formatNumber(couponData.value?.summary?.total_uses) },
      { "Chỉ số": "Tổng nhân sự hôm nay", "Giá trị": formatNumber(staffStats.value.total) },
      { "Chỉ số": "Nhân sự ca hiện tại", "Giá trị": staffStats.value.current_shift || 'Không có ca làm' },
      { "Chỉ số": "Tỷ lệ TT VNPay", "Giá trị": `${paymentStats.value.vnpayPercent}%` },
      { "Chỉ số": "Tỷ lệ TT MoMo", "Giá trị": `${paymentStats.value.momoPercent}%` },
      { "Chỉ số": "Tỷ lệ TT COD", "Giá trị": `${paymentStats.value.codPercent}%` },
      { "Chỉ số": "Tỷ lệ TT Chuyển khoản", "Giá trị": `${paymentStats.value.bankPercent}%` }
    ];
    const wsOverview = createReportSheet({
      title: 'BÁO CÁO TỔNG QUAN THINKHUB',
      headers: ['Chỉ số', 'Giá trị'],
      rows: overviewData.map((item) => [item['Chỉ số'], item['Giá trị']]),
      widths: [38, 28],
      rightAligned: [1],
    });
    XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng Quan");

    if (recentOrders.value?.length) {
      const ordersData = recentOrders.value.map(o => ({
        "Mã ĐH": o.code,
        "Khách hàng": o.customer,
        "Ngày đặt": o.date,
        "Tổng tiền": formatMoney(o.total),
        "Trạng thái": o.status === 'delivered' ? 'Đã giao hàng' : (o.status === 'shipping' ? 'Đang giao' : (o.status === 'pending' ? 'Chờ xác nhận' : o.status))
      }));
      const wsOrders = createReportSheet({
        title: 'ĐƠN HÀNG GẦN ĐÂY',
        headers: ['Mã ĐH', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Trạng thái'],
        rows: ordersData.map((item) => [item['Mã ĐH'], item['Khách hàng'], item['Ngày đặt'], item['Tổng tiền'], item['Trạng thái']]),
        widths: [16, 28, 20, 20, 20],
        rightAligned: [3],
      });
      XLSX.utils.book_append_sheet(wb, wsOrders, "Đơn Hàng Gần Đây");
    }

    if (topProducts.value?.length) {
      const topData = topProducts.value.map(p => ({
        "Tên Sản phẩm": p.name,
        "Số lượng đã bán": formatNumber(p.sold),
        "Tồn kho": formatNumber(p.stock),
        "Giá bán": formatMoney(p.price)
      }));
      const wsTop = createReportSheet({
        title: 'SẢN PHẨM BÁN CHẠY',
        headers: ['Tên sản phẩm', 'Số lượng đã bán', 'Tồn kho', 'Giá bán'],
        rows: topData.map((item) => [item['Tên Sản phẩm'], item['Số lượng đã bán'], item['Tồn kho'], item['Giá bán']]),
        widths: [48, 20, 16, 20],
        rightAligned: [1, 2, 3],
      });
      XLSX.utils.book_append_sheet(wb, wsTop, "Top Bán Chạy");
    }

    if (lowStockProducts.value?.length) {
      const lowStockData = lowStockProducts.value.map(p => ({
        "Tên Sản phẩm": p.name,
        "SKU": p.sku || 'Không có',
        "Tồn kho": formatNumber(p.stock)
      }));
      const wsLowStock = createReportSheet({
        title: 'SẢN PHẨM SẮP HẾT HÀNG',
        headers: ['Tên sản phẩm', 'SKU', 'Tồn kho'],
        rows: lowStockData.map((item) => [item['Tên Sản phẩm'], item.SKU, item['Tồn kho']]),
        widths: [48, 24, 16],
        rightAligned: [2],
      });
      XLSX.utils.book_append_sheet(wb, wsLowStock, "Sắp Hết Hàng");
    }

    if (activeCombos.value?.length) {
      const comboData = activeCombos.value.map(c => ({
        "Tên Combo": c.name,
        "Mức giảm": c.discount_type === 'percentage' ? `${c.discount_value}%` : formatCurrency(c.discount_value),
        "Ngày bắt đầu": c.start_date,
        "Ngày kết thúc": c.end_date
      }));
      const wsCombo = createReportSheet({
        title: 'COMBO ĐANG HOẠT ĐỘNG',
        headers: ['Tên combo', 'Mức giảm', 'Ngày bắt đầu', 'Ngày kết thúc'],
        rows: comboData.map((item) => [item['Tên Combo'], item['Mức giảm'], item['Ngày bắt đầu'], item['Ngày kết thúc']]),
        widths: [42, 18, 18, 18],
        rightAligned: [1],
      });
      XLSX.utils.book_append_sheet(wb, wsCombo, "Combo Đang Chạy");
    }

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Bao_Cao_ThinkHub_${dateStr}.xlsx`);

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Xuất Excel thành công!', showConfirmButton: false, timer: 3000 });
  } catch (err) {
    console.error("Lỗi xuất Excel:", err);
    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tạo file Excel.' });
  } finally {
    isExporting.value = false;
  }
};

const getHeaders = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') ||
    localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') ||
    localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') ||
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const isExporting = ref(false);
const reviewAvatarErrors = ref({});
const buyerAvatarErrors = ref({});
const isUpdatingCoupon = ref(null);
let chartInstance = null;
let paymentChartInstance = null;
let couponChartInstance = null;
let categoryChartInstance = null;

const filterParams = ref({
  period: 'this_month',
  startDate: '',
  endDate: ''
});
const appliedFilterParams = ref({ ...filterParams.value });
const filterError = ref('');
const periodPresets = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'last_7_days', label: '7 ngày' },
  { key: 'last_30_days', label: '30 ngày' },
  { key: 'this_month', label: 'Tháng này' },
  { key: 'last_month', label: 'Tháng trước' },
  { key: 'all', label: 'Tất cả' }
];

const paymentStats = ref({
  vnpayPercent: 0,
  momoPercent: 0,
  codPercent: 0,
  bankPercent: 0
});

// ==========================================
// 1. TANSTACK QUERY: LẤY DỮ LIỆU CHÍNH
// ==========================================
// Quick local permission check to avoid unnecessary loading when user lacks role
const REQUIRED_ADMIN_LEVEL = 1; // adjust this value if your admin level scheme differs
let _storedInfo = {};
const storedAdminInfo = localStorage.getItem('admin_info') || sessionStorage.getItem('admin_info');
try { _storedInfo = JSON.parse(storedAdminInfo || '{}'); } catch (e) { _storedInfo = {}; }
const storedLevel = Number(localStorage.getItem('admin_level') || sessionStorage.getItem('admin_level') || _storedInfo?.role?.level || 0);
const hasAccess = ref(Boolean(
  localStorage.getItem('admin_token') ||
  sessionStorage.getItem('admin_token') ||
  localStorage.getItem('adminToken') ||
  sessionStorage.getItem('adminToken')
) && storedLevel >= REQUIRED_ADMIN_LEVEL);

const { data: dashboardData, isLoading, isFetching, refetch, error: queryError } = useQuery({
  queryKey: ['admin-dashboard-main', appliedFilterParams],
  queryFn: async () => {
    const res = await axios.get(`${apiUrl}/admin/dashboard`, {
      params: {
        period: appliedFilterParams.value.period,
        start_date: appliedFilterParams.value.startDate || undefined,
        end_date: appliedFilterParams.value.endDate || undefined
      },
      headers: getHeaders()
    });
    return res.data.data;
  },
  staleTime: 5 * 60 * 1000,
  placeholderData: keepPreviousData,
  enabled: hasAccess
});

const stats = computed(() => dashboardData.value?.stats || {
  totalRevenue: 0, revenueGrowth: 0, newOrders: 0, ordersGrowth: 0,
  inventory: 0, totalCustomers: 0, customersGrowth: 0,
  averageOrderValue: 0, successfulOrders: 0, cancelledOrders: 0
});
const periodInfo = computed(() => dashboardData.value?.period || {
  label: 'Tháng này',
  start_date: '',
  end_date: ''
});
const recentOrders = computed(() => dashboardData.value?.recentOrders || []);
const topProducts = computed(() => dashboardData.value?.topProducts || []);
const lowStockProducts = computed(() => dashboardData.value?.lowStockProducts || []);
const customerInsights = computed(() => dashboardData.value?.customerInsights || {});
const recentReviews = computed(() => dashboardData.value?.recentReviews || []);
const activeCombos = computed(() => dashboardData.value?.activeCombos || []);
const staffStats = computed(() => dashboardData.value?.staffStats || {
  total: 0,
  current_shift: 'Không có ca làm'
});

// Lấy dữ liệu danh sách coupon
const couponData = computed(() => {
  return dashboardData.value?.coupons || { summary: {}, list: [] };
});

// Cập nhật trạng thái Payment Chart và Main Chart khi có dữ liệu mới
watch(dashboardData, (newData) => {
  if (newData?.chartData) {
    if (newData.paymentStats) {
      paymentStats.value = newData.paymentStats;
    }
    nextTick(() => {
      initOrUpdateChart([...newData.chartData.labels], [...newData.chartData.values], [...(newData.chartData.netProfits || [])], [...(newData.chartData.orderCounts || [])]);
      initPaymentChart();
      initCategoryChart();
      if (newData.couponChart) {
        initCouponChart([...newData.couponChart.labels], [...newData.couponChart.values]);
      }
    });
  }
}, { immediate: true });

const selectPeriod = (period) => {
  filterError.value = '';
  filterParams.value.period = period;

  if (period !== 'custom') {
    filterParams.value.startDate = '';
    filterParams.value.endDate = '';
    applyDashboardFilter();
  }
};

const applyDashboardFilter = async () => {
  filterError.value = '';

  if (filterParams.value.period === 'custom') {
    if (!filterParams.value.startDate || !filterParams.value.endDate) {
      filterError.value = 'Vui lòng chọn đầy đủ từ ngày và đến ngày.';
      return;
    }

    if (filterParams.value.startDate > filterParams.value.endDate) {
      filterError.value = 'Đến ngày phải sau hoặc bằng từ ngày.';
      return;
    }
  }

  appliedFilterParams.value = { ...filterParams.value };
  
  // Vue Query tự động refetch, nhưng ta gọi refetch() nếu muốn áp dụng lại bộ lọc không thay đổi
  refetch();
};

watch(queryError, (newError) => {
  if (newError) {
    const errors = newError?.response?.data?.errors;
    filterError.value = errors ? Object.values(errors).flat().join(' ') : 'Không thể tải dữ liệu cho kỳ đã chọn.';
  } else {
    filterError.value = '';
  }
});

// API: Kích hoạt / Dừng mã giảm giá (DÙNG PATCH DO ROUTE LÀ PATCH)
const toggleCouponStatus = async (coupon) => {
  isUpdatingCoupon.value = coupon.id;
  const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
  try {
    const res = await axios.patch(`${apiUrl}/admin/coupons/${coupon.id}`, { status: newStatus }, { headers: getHeaders() });

    if (res && res.data.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật trạng thái mã!', showConfirmButton: false, timer: 1500 });
      refetch(); // Tải lại Dashboard Data để thay đổi trạng thái ngay lập tức
    }
  } catch (e) {
    console.error(e);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi cập nhật',
      text: 'Không thể cập nhật trạng thái mã giảm giá.'
    });
  } finally {
    isUpdatingCoupon.value = null;
  }
};

// ==========================================
// 3. CHART.JS LOGIC
// ==========================================
const threeColorPalette = ['#009981', '#FF9F1C', '#2EC4B6'];
const generateColors = (count) => {
  let colors = [];
  for (let i = 0; i < count; i++) colors.push(threeColorPalette[i % threeColorPalette.length]);
  return colors;
};

const initOrUpdateChart = (labels, values, netProfits = [], orderCounts = []) => {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = values;
    chartInstance.data.datasets[1].data = netProfits;
    chartInstance.data.datasets[2].data = orderCounts;
    chartInstance.data.datasets[0].backgroundColor = generateColors(labels.length);
    chartInstance.data.datasets[1].backgroundColor = '#8b5cf6'; // Tím (Purple) contrast
    chartInstance.data.datasets[0].barPercentage = labels.length > 15 ? 0.8 : 0.5;
    chartInstance.data.datasets[1].barPercentage = labels.length > 15 ? 0.8 : 0.5;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh thu',
            data: values,
            backgroundColor: generateColors(labels.length),
            borderRadius: 6,
            barPercentage: 0.5,
            yAxisID: 'yRevenue'
          },
          {
            label: 'Lợi nhuận ròng',
            data: netProfits,
            backgroundColor: '#8b5cf6', // Tím contrast
            borderRadius: 6,
            barPercentage: 0.5,
            yAxisID: 'yRevenue' // Dùng chung trục Y với doanh thu
          },
          {
            type: 'line',
            label: 'Số đơn hoàn tất',
            data: orderCounts,
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b',
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#f59e0b',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.35,
            yAxisID: 'yOrders'
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 11, weight: '600' } }
          }
        },
        scales: {
          yRevenue: {
            beginAtZero: true,
            position: 'left',
            grid: { color: '#eef2f6', drawBorder: false, borderDash: [5, 5] },
            ticks: { callback: (value) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value) + ' đ' }
          },
          yOrders: {
            beginAtZero: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { precision: 0, callback: (value) => value + ' đơn' }
          },
          x: { grid: { display: false, drawBorder: false } }
        }
      }
    });
  }
};

const initPaymentChart = () => {
  const ctx = document.getElementById('paymentMethodChart');
  if (!ctx) return;
  if (paymentChartInstance) paymentChartInstance.destroy(); // Hủy chart cũ trước khi render dữ liệu lọc mới để mượt mà
  paymentChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['VNPay', 'MoMo', 'COD', 'Chuyển khoản'], datasets: [{ data: [paymentStats.value.vnpayPercent, paymentStats.value.momoPercent, paymentStats.value.codPercent, paymentStats.value.bankPercent], backgroundColor: ['#005baa', '#a50064', '#10b981', '#6c757d'], borderWidth: 2, borderColor: '#ffffff' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }
  });
};

const initCategoryChart = () => {
  const ctx = document.getElementById('categoryChart');
  if (!ctx || !customerInsights.value?.categoryRevenue) return;
  if (categoryChartInstance) categoryChartInstance.destroy();
  
  const labels = customerInsights.value.categoryRevenue.map(item => item.name);
  const data = customerInsights.value.categoryRevenue.map(item => item.revenue);
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
  
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' ' + new Intl.NumberFormat('vi-VN').format(context.raw) + ' đ';
            }
          }
        }
      }
    }
  });
};

const initCouponChart = (labels, values) => {
  const ctx = document.getElementById('couponChart');
  if (!ctx) return;

  let gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

  if (couponChartInstance) {
    couponChartInstance.data.labels = labels;
    couponChartInstance.data.datasets[0].data = values;
    couponChartInstance.update();
  } else {
    couponChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Lượt sử dụng',
          data: values,
          borderColor: '#8b5cf6',
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#eef2f6', drawBorder: false }, ticks: { stepSize: 2 } },
          x: { grid: { display: false, drawBorder: false } }
        }
      }
    });
  }
};


// ==========================================
// 5. HELPER FORMAT CHUNG
// ==========================================
const getGrowthClass = (value) => {
  if (value === null || value === undefined) return 'bg-secondary-soft text-secondary';
  return value >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger';
};
const getGrowthIcon = (value) => {
  if (value === null || value === undefined) return 'bi-dash';
  return value >= 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
};
const formatGrowth = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value > 0 ? '+' : ''}${value}%`;
};
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const translateStatus = (status) => {
  const map = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy',
    'returned': 'Đã hoàn trả',
    'return_requested': 'Yêu cầu hoàn trả'
  };
  return map[status] || status;
};

const getStatusBadgeClass = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'delivered') return 'badge-gradient-success';
  if (s === 'processing' || s === 'confirmed') return 'badge-gradient-warning';
  if (s === 'shipping') return 'badge-gradient-info';
  if (s === 'cancelled' || s === 'returned' || s === 'return_requested') return 'badge-gradient-danger';
  if (s === 'pending') return 'badge-gradient-primary';
  return 'badge-gradient-secondary';
};

const getStatusIcon = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'delivered') return 'bi-check-circle-fill';
  if (s === 'shipping') return 'bi-truck';
  if (s === 'cancelled') return 'bi-x-circle-fill';
  if (s === 'returned' || s === 'return_requested') return 'bi-arrow-return-left';
  return 'bi-info-circle-fill';
};

const getRankClass = (index) => {
  if (index === 0) return 'rank-1 bg-warning text-white';
  if (index === 1) return 'rank-2 bg-secondary text-white';
  if (index === 2) return 'rank-3 bg-orange text-white';
  return 'rank-normal bg-light text-secondary';
};

const getTierColor = (tierName) => {
  if (!tierName) return 'transparent';
  const name = tierName.toLowerCase();
  if (name.includes('vàng')) return '#ffc107'; 
  if (name.includes('bạc')) return '#adb5bd'; 
  if (name.includes('kim cương')) return '#0dcaf0'; 
  if (name.includes('đồng')) return '#cd7f32'; 
  return '#6c757d'; 
};

const getRankBgStyle = (index) => {
  if (index === 0) return 'rgba(255, 193, 7, 0.15)'; // Vàng
  if (index === 1) return 'rgba(108, 117, 125, 0.1)'; // Bạc
  if (index === 2) return 'rgba(253, 126, 20, 0.15)'; // Đồng
  return 'transparent';
};

// ==========================================
// 6. HELPER FORMAT RIÊNG CHO COUPON
// ==========================================
const getCouponCardClass = (status) => {
  if (status === 'active') return 'coupon-active';
  if (status === 'expired') return 'coupon-expired';
  if (status === 'inactive') return 'coupon-inactive';
  return 'coupon-soon';
};

const getCouponBadgeClass = (status) => {
  if (status === 'active') return 'bg-success-soft text-success';
  if (status === 'expired') return 'bg-danger-soft text-danger';
  if (status === 'inactive') return 'bg-secondary-soft text-secondary';
  return 'bg-warning-soft text-warning';
};

const getCouponIcon = (type) => {
  if (type.includes('%')) return 'bi-percent';
  return 'bi-bullseye';
};

const getUsagePercentage = (coupon) => {
  if (!coupon.usage_limit || coupon.usage_limit === 0) return 0;
  return Math.min(((coupon.usage_count / coupon.usage_limit) * 100), 100).toFixed(1);
};

const formatCouponDate = (dateStr) => {
  if (!dateStr || dateStr === 'Không giới hạn') return 'Không giới hạn hạn dùng';
  return `Hạn dùng: ${dateStr}`;
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');


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

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.dashboard-wrapper {
  background-color: #f8f9fc;
  font-family: 'Inter', sans-serif;
}

.font-size-lg {
  font-size: 1.125rem;
}

.font-size-sm {
  font-size: 0.875rem;
}

.font-size-xs {
  font-size: 0.75rem;
}

.letter-spacing-1 {
  letter-spacing: 0.5px;
}

.tracking-tight {
  letter-spacing: -0.5px;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.transition-all {
  transition: all 0.3s ease;
}

.min-w-0 {
  min-width: 0;
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
  color: white;
  transition: 0.2s;
}

.btn-brand:hover {
  background-color: #007a67;
  color: white;
}

.bg-brand-soft {
  background-color: rgba(0, 153, 129, 0.1) !important;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}

.bg-light-purple {
  background-color: #f5f3ff !important;
}

.custom-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.custom-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.06) !important;
}

.filter-group:hover {
  border-color: #009981 !important;
  box-shadow: 0 4px 10px rgba(0, 153, 129, 0.1) !important;
}

.dashboard-period-filter {
  max-width: 100%;
}

.dashboard-period-button {
  min-height: 34px;
  white-space: nowrap;
}

.dashboard-inline-kpi {
  min-height: 62px;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e7edf2;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #fbfefd 0%, #f1faf7 100%);
}

.dashboard-inline-kpi span {
  display: block;
  margin-bottom: 0.2rem;
  color: #728091;
  font-size: 0.72rem;
  font-weight: 700;
}

.dashboard-inline-kpi strong {
  color: #243447;
  font-size: 1rem;
}

.icon-circle {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-number {
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.bg-info-soft {
  background-color: rgba(13, 202, 240, 0.1) !important;
  color: #0dcaf0 !important;
}

.bg-success-soft {
  background-color: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
}

.bg-warning-soft {
  background-color: rgba(245, 158, 11, 0.1) !important;
  color: #f59e0b !important;
}

.bg-danger-soft {
  background-color: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.bg-secondary-soft {
  background-color: rgba(108, 117, 125, 0.1) !important;
  color: #6c757d !important;
}

.bg-light-soft {
  background-color: #f9fafb !important;
}

.bg-orange {
  background-color: #fd7e14 !important;
}

/* Styling riêng cho Khu vực Coupon */
.coupon-card {
  border: 2px solid transparent;
}

.coupon-active {
  border-color: rgba(16, 185, 129, 0.3);
}

.coupon-expired {
  border-color: rgba(239, 68, 68, 0.2);
}

.coupon-inactive {
  border-color: rgba(108, 117, 125, 0.2);
}

.coupon-soon {
  border-color: rgba(245, 158, 11, 0.3);
}

.coupon-icon {
  border-width: 2px !important;
}

.progress-thin {
  height: 6px;
  border-radius: 10px;
  background-color: #e5e7eb;
}

.progress-thin .progress-bar {
  border-radius: 10px;
}

.btn-danger-soft {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger-soft:hover {
  background-color: #fca5a5;
}

.btn-success-soft {
  background-color: #d1fae5;
  color: #059669;
}

.btn-success-soft:hover {
  background-color: #a7f3d0;
}

.badge-gradient-success {
  background: linear-gradient(135deg, #2EC4B6, #009981);
  color: white;
  box-shadow: 0 4px 10px rgba(0, 153, 129, 0.2);
}

.badge-gradient-warning {
  background: linear-gradient(135deg, #FFB75E, #ED8F03);
  color: white;
  box-shadow: 0 4px 10px rgba(237, 143, 3, 0.2);
}

.badge-gradient-info {
  background: linear-gradient(135deg, #4CC9F0, #4361EE);
  color: white;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.2);
}

.badge-gradient-danger {
  background: linear-gradient(135deg, #FF5A5F, #E63946);
  color: white;
  box-shadow: 0 4px 10px rgba(230, 57, 70, 0.2);
}

.badge-gradient-primary {
  background: linear-gradient(135deg, #9FA8DA, #4361EE);
  color: white;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.2);
}

.badge-gradient-secondary {
  background: linear-gradient(135deg, #E0E0E0, #9E9E9E);
  color: white;
  box-shadow: 0 4px 10px rgba(158, 158, 158, 0.2);
}

.product-img-box {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  overflow: hidden;
}

.rank-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.9rem;
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700, #F79D00);
}

.rank-2 {
  background: linear-gradient(135deg, #E0E0E0, #9E9E9E);
}

.rank-3 {
  background: linear-gradient(135deg, #FFB75E, #ED8F03);
}

.table-row-hover:hover {
  background-color: #fcfdfd;
}

.custom-table th {
  border-bottom: 1px solid #f1f3f5;
}

.custom-table tr:last-child {
  border-bottom: none !important;
}

.custom-date-input {
  width: 110px;
}

.custom-date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

.helper-date-label {
  font-size: 0.65rem;
  color: #8792a3;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: -3px;
  text-align: center;
}

select:focus,
input:focus,
button:focus {
  outline: none;
  box-shadow: none !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

[data-bs-theme="dark"] .dashboard-wrapper .custom-card {
  border-radius: 12px !important;
}

.custom-card {
  border-radius: 12px !important;
}

/* Image fade-in animation */
.img-fade-in {
  opacity: 0;
  will-change: opacity;
}

.img-fade-in.img-loaded {
  animation: fadeInImage 0.5s ease-in-out forwards;
}

@keyframes fadeInImage {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');


/* TỐI ƯU DARK MODE - KHÔNG SCOPED ĐỂ FIX LỖI NHẬN CSS */
[data-bs-theme="dark"] .dashboard-wrapper {
  background-color: transparent !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .bg-white,
[data-bs-theme="dark"] .dashboard-wrapper .card,
[data-bs-theme="dark"] .dashboard-wrapper .custom-card,
[data-bs-theme="dark"] .dashboard-wrapper .coupon-card {
  background-color: #1e2125 !important;
  border-color: #373b3e !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .text-dark {
  color: #f8f9fa !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .text-secondary,
[data-bs-theme="dark"] .dashboard-wrapper .text-muted {
  color: #adb5bd !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .bg-light,
[data-bs-theme="dark"] .dashboard-wrapper .bg-light-soft {
  background-color: #2b3035 !important;
  color: #f8f9fa !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .bg-light-purple {
  background-color: #2b3035 !important;
  border: 1px solid #373b3e !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .border-light,
[data-bs-theme="dark"] .dashboard-wrapper .border-bottom {
  border-color: #373b3e !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .btn-light {
  background-color: #2b3035 !important;
  border-color: #373b3e !important;
  color: #f8f9fa !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .btn-light:hover {
  background-color: #343a40 !important;
  border-color: #495057 !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .filter-group {
  background-color: #1e2125 !important;
  border-color: #373b3e !important;
}

[data-bs-theme="dark"] .dashboard-inline-kpi {
  background: #17212f;
  border-color: #334155;
}

[data-bs-theme="dark"] .dashboard-inline-kpi span {
  color: #94a3b8;
}

[data-bs-theme="dark"] .dashboard-inline-kpi strong {
  color: #e2e8f0;
}

[data-bs-theme="dark"] .dashboard-wrapper .custom-date-input {
  color: #f8f9fa !important;
  background-color: transparent !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .custom-date-input::-webkit-calendar-picker-indicator {
  filter: invert(1) !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .coupon-icon {
  background-color: #2b3035 !important;
  color: #f8f9fa !important;
  border-color: #373b3e !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .progress-thin {
  background-color: #373b3e !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .progress-bar.bg-dark {
  background-color: #009981 !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .rank-normal {
  background-color: transparent !important;
  color: #adb5bd !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .table-row-hover:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .custom-table th,
[data-bs-theme="dark"] .dashboard-wrapper .custom-table td {
  background-color: transparent !important;
  border-bottom-color: #373b3e !important;
  color: #f8f9fa !important;
}

[data-bs-theme="dark"] .dashboard-wrapper .table-hover>tbody>tr:hover>* {
  color: #f8f9fa !important;
}

/* Gender theme classes */
.text-gender-male { color: #005baa !important; }
.text-gender-female { color: #a50064 !important; }
.bg-gender-female { background-color: #a50064 !important; }

[data-bs-theme="dark"] .dashboard-wrapper .text-gender-male { color: #66b2ff !important; }
[data-bs-theme="dark"] .dashboard-wrapper .text-gender-female { color: #ff77c2 !important; }
[data-bs-theme="dark"] .dashboard-wrapper .bg-gender-female { background-color: #d84596 !important; }

/* SweetAlert Dark Mode Overrides */
[data-bs-theme="dark"] .swal2-popup {
  background-color: #2b3035 !important;
  color: #f8f9fa !important;
}
[data-bs-theme="dark"] .swal2-title {
  color: #f8f9fa !important;
}
[data-bs-theme="dark"] .swal2-popup .text-dark {
  color: #f8f9fa !important;
}
[data-bs-theme="dark"] .swal2-popup .bg-light {
  background-color: #1e2125 !important;
}
[data-bs-theme="dark"] .swal2-popup .form-control {
  background-color: #1e2125 !important;
  color: #f8f9fa !important;
}
[data-bs-theme="dark"] .swal2-popup .form-control::placeholder {
  color: #6c757d !important;
}
[data-bs-theme="dark"] .swal2-popup .alert-info {
  background-color: rgba(13, 202, 240, 0.1) !important;
  color: #9eeaf9 !important;
  border-color: rgba(13, 202, 240, 0.2) !important;
}
</style>
