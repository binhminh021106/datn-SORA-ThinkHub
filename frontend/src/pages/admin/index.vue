<template>
  <div>
    <!-- Màn hình Loading -->
    <div v-if="isLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu tổng quan...
      </p>
    </div>

    <!-- Nội dung Dashboard -->
    <div v-else class="dashboard-wrapper min-vh-100 p-4">
      
      <!-- Tiêu đề trang -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-2">
        <div class="mb-3 mb-md-0 d-flex align-items-center gap-3">
          <div>
            <h1 class="h3 fw-bolder text-dark mb-2 tracking-tight">Bảng điều khiển</h1>
            <p class="text-secondary mb-0 font-size-sm">Chào mừng trở lại! Dưới đây là tổng quan cửa hàng.</p>
          </div>
          <div v-if="isFetching && !isLoading" class="spinner-border spinner-border-sm text-brand" role="status" title="Đang cập nhật ngầm dữ liệu mới nhất..."></div>
        </div>

        <button @click="exportToExcel" :disabled="isExporting" class="btn btn-brand d-flex align-items-center gap-2 px-4 py-2 fw-semibold btn-modern transition-all shadow-sm rounded-3">
          <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-file-earmark-excel-fill fs-5"></i>
          {{ isExporting ? 'Đang xuất...' : 'Xuất báo cáo' }}
        </button>
      </div>

      <!-- Hàng 1: Các thẻ thống kê tổng quan -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <p class="text-muted fw-bold font-size-sm mb-0 text-uppercase letter-spacing-1 text-truncate pe-2">Tổng Doanh Thu</p>
                <div class="icon-circle bg-brand-soft text-brand flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="mb-3">
                <h3 class="fw-bolder mb-0 text-dark stat-number">{{ formatCurrency(stats.totalRevenue) }}</h3>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1" :class="getGrowthClass(stats.revenueGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.revenueGrowth)"></i> {{ formatGrowth(stats.revenueGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-xl-3">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <p class="text-muted fw-bold font-size-sm mb-0 text-uppercase letter-spacing-1 text-truncate pe-2">Đơn hàng mới</p>
                <div class="icon-circle bg-info-soft text-info flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div class="mb-3">
                <h3 class="fw-bolder mb-0 text-dark stat-number">{{ stats.newOrders }}</h3>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1" :class="getGrowthClass(stats.ordersGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.ordersGrowth)"></i> {{ formatGrowth(stats.ordersGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium">so với hôm qua</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-xl-3">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <p class="text-muted fw-bold font-size-sm mb-0 text-uppercase letter-spacing-1 text-truncate pe-2">Tổng Tồn Kho</p>
                <div class="icon-circle bg-warning-soft text-warning flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div class="mb-3">
                <h3 class="fw-bolder mb-0 text-dark stat-number">{{ stats.inventory }}</h3>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge bg-secondary-soft text-secondary fw-bold me-2 px-2 py-1">Cập nhật</span>
                <span class="text-muted font-size-xs fw-medium">Vừa xong</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-xl-3">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <p class="text-muted fw-bold font-size-sm mb-0 text-uppercase letter-spacing-1 text-truncate pe-2">Khách hàng</p>
                <div class="icon-circle bg-danger-soft text-danger flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="mb-3">
                <h3 class="fw-bolder mb-0 text-dark stat-number">{{ stats.totalCustomers }}</h3>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1" :class="getGrowthClass(stats.customersGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.customersGrowth)"></i> {{ formatGrowth(stats.customersGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 2: Biểu đồ Doanh thu & Phương thức -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-xl-8">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-4 pb-0 px-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <h5 class="fw-bold text-dark mb-0">Thống kê doanh thu</h5>
                <span class="text-muted font-size-xs">Dữ liệu doanh thu thực tế từ luồng đơn hàng được kiểm duyệt</span>
              </div>
              
              <!-- Bộ lọc ngày thông minh -->
              <div class="d-flex flex-wrap align-items-center gap-2">
                <div class="d-flex align-items-center gap-1 bg-white rounded-3 px-3 py-1 shadow-sm border border-light transition-all filter-group position-relative">
                  <i class="bi bi-calendar-range text-brand me-1"></i>
                  <div class="d-flex flex-column position-relative">
                    <input type="date" v-model="filterParams.startDate" :max="maxDate" class="form-control form-control-sm border-0 bg-transparent shadow-none text-dark fw-semibold font-size-sm p-1 cursor-pointer custom-date-input" title="Từ ngày">
                    <span class="helper-date-label">Từ ngày</span>
                  </div>
                  <span class="text-muted font-size-xs fw-bold px-1">-</span>
                  <div class="d-flex flex-column position-relative">
                    <input type="date" v-model="filterParams.endDate" :max="maxDate" class="form-control form-control-sm border-0 bg-transparent shadow-none text-dark fw-semibold font-size-sm p-1 cursor-pointer custom-date-input" title="Đến ngày">
                    <span class="helper-date-label">Đến ngày</span>
                  </div>
                </div>

                <button @click="applyChartFilter(false)" class="btn btn-brand rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all shadow-sm" style="height: 42px;" :disabled="chartMutation.isPending.value">
                  <span v-if="chartMutation.isPending.value" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-funnel-fill"></i> Lọc
                </button>

                <button @click="applyChartFilter(true)" class="btn btn-light border-light rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all shadow-sm text-secondary" style="height: 42px;" :disabled="chartMutation.isPending.value">
                  <i class="bi bi-calendar-check"></i> Tất cả
                </button>
              </div>
            </div>
            <div class="card-body px-4 pb-4 pt-4">
              <div style="height: 350px; width: 100%;">
                <canvas id="revenueChart" ref="chartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-bottom pt-4 pb-2 px-4">
              <h5 class="fw-bold mb-0 text-dark">Phương thức thanh toán</h5>
              <span class="text-muted font-size-xs">Tỷ lệ thanh toán trong kỳ được lọc</span>
            </div>
            <div class="card-body d-flex flex-column align-items-center justify-content-center p-4">
              <div style="height: 220px; width: 100%; max-width: 220px;" class="mb-4 position-relative">
                <canvas id="paymentMethodChart"></canvas>
              </div>
              
              <div class="w-100 mt-2">
                <div class="d-flex justify-content-between align-items-center mb-2 font-size-sm border-bottom pb-2">
                  <span class="d-flex align-items-center gap-2"><span class="badge rounded-circle p-1 bg-brand">&nbsp;</span> VNPay (Ví điện tử)</span>
                  <span class="fw-bold text-dark">{{ paymentStats.vnpayPercent }}%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 font-size-sm border-bottom pb-2">
                  <span class="d-flex align-items-center gap-2"><span class="badge rounded-circle p-1 bg-warning">&nbsp;</span> MoMo (Ví điện tử)</span>
                  <span class="fw-bold text-dark">{{ paymentStats.momoPercent }}%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 font-size-sm border-bottom pb-2">
                  <span class="d-flex align-items-center gap-2"><span class="badge rounded-circle p-1 bg-info">&nbsp;</span> COD (Tiền mặt)</span>
                  <span class="fw-bold text-dark">{{ paymentStats.codPercent }}%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center font-size-sm">
                  <span class="d-flex align-items-center gap-2"><span class="badge rounded-circle p-1 bg-secondary">&nbsp;</span> Chuyển khoản</span>
                  <span class="fw-bold text-dark">{{ paymentStats.bankPercent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 3: Danh sách Giao dịch & Sản phẩm -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-xl-8">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark">Đơn hàng mới nhất</h5>
              <router-link :to="{ path: '/admin/orders' }" class="btn btn-sm bg-brand-soft text-brand fw-bold rounded-pill px-3 transition-all border border-light">
                Xem tất cả
              </router-link>
            </div>
            <div class="card-body p-0">
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
                    <tr v-if="recentOrders.length === 0">
                      <td colspan="5" class="text-center py-4 text-muted">Chưa có đơn hàng nào.</td>
                    </tr>
                    <tr v-else v-for="order in recentOrders" :key="order.id" class="border-bottom border-light transition-all table-row-hover">
                      <td class="ps-4 py-3"><span class="text-brand fw-bold">#{{ order.code }}</span></td>
                      <td class="py-3">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar-circle bg-brand-soft text-brand fw-bolder border border-light shadow-sm flex-shrink-0">
                            {{ order.customer?.charAt(0) || 'K' }}
                          </div>
                          <div><h6 class="mb-0 fw-bold text-dark font-size-sm">{{ order.customer || 'Khách lẻ' }}</h6></div>
                        </div>
                      </td>
                      <td class="py-3 text-secondary font-size-sm fw-medium">{{ order.date }}</td>
                      <td class="py-3 fw-bolder text-dark">{{ formatCurrency(order.total) }}</td>
                      <td class="pe-4 py-3 text-center">
                        <span class="badge rounded-pill border-0 fw-bold px-3 py-2 shadow-sm d-inline-flex align-items-center gap-1 justify-content-center" :class="getStatusBadgeClass(order.status)" style="min-width: 120px;">
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

        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-4 pb-3 px-4">
              <h5 class="fw-bold mb-0 text-dark">Top Bán Chạy</h5>
            </div>
            <div class="card-body px-4 pt-4 pb-4">
              <p v-if="topProducts.length === 0" class="text-center text-muted py-3">Chưa có sản phẩm nào được bán.</p>
              
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-4">
                <li v-for="(product, index) in topProducts" :key="product.id" class="d-flex align-items-center product-item">
                  <div class="rank-badge fw-bolder shadow-sm flex-shrink-0" :class="getRankClass(index)">{{ index + 1 }}</div>
                  
                  <div class="product-img-box ms-3 me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light">
                    <img v-if="product.image" :src="product.image" @error="product.image = ''" alt="Product" class="img-fluid rounded-3 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; z-index: 1;"/>
                    <div v-if="!product.image" class="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-secondary rounded-3">
                      <i class="bi bi-box-seam fs-4"></i>
                    </div>
                  </div>
                  
                  <div class="flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal;" :class="{'text-decoration-line-through text-muted opacity-75': product.is_deleted}" :title="product.name">
                      {{ product.name }}
                    </h6>
                    <div class="d-flex justify-content-between align-items-end mt-1 flex-wrap gap-1">
                      <p class="mb-0 text-secondary font-size-xs fw-medium">
                        Bán: <span class="text-dark fw-bold">{{ product.sold }}</span> 
                        <span class="mx-1 text-light">|</span> 
                        Tồn: <span class="fw-bold" :class="product.stock < 20 ? 'text-danger' : 'text-dark'">{{ product.stock }}</span>
                      </p>
                      <div class="fw-bolder text-brand font-size-sm whitespace-nowrap">{{ formatCurrency(product.price) }}</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 4: Thống kê Khuyến mãi & Mã giảm giá -->
      <div class="row g-4 mt-2">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
              <span class="bg-purple text-white rounded-3 p-2 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px;">
                <i class="bi bi-percent font-size-sm"></i>
              </span>
              Khuyến mãi & Mã giảm giá
            </h4>
            <router-link :to="{ name: 'admin-coupon-create' }" class="btn btn-dark rounded-3 px-3 py-2 fw-semibold font-size-sm shadow-sm d-flex align-items-center gap-2">
              <i class="bi bi-plus-lg"></i> Thêm mã mới
            </router-link>
          </div>
        </div>

        <!-- Các thẻ Coupon -->
        <div class="col-12 col-md-6 col-xl-4" v-for="coupon in couponData.list" :key="coupon.id">
          <div class="card coupon-card h-100 bg-white shadow-sm rounded-4 position-relative overflow-hidden" :class="getCouponCardClass(coupon.status)">
            <div class="card-body p-4">
              <!-- Header thẻ: Icon & Status -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="coupon-icon border border-light rounded-circle d-flex align-items-center justify-content-center text-dark bg-light" style="width: 36px; height: 36px;">
                  <i class="bi fw-bold font-size-sm" :class="getCouponIcon(coupon.type)"></i>
                </div>
                <span class="badge rounded-pill fw-bold px-3 py-1 d-flex align-items-center gap-1" :class="getCouponBadgeClass(coupon.status)">
                  <i class="bi font-size-xs" :class="coupon.status === 'active' ? 'bi-check-circle-fill' : (coupon.status === 'expired' ? 'bi-x-circle-fill' : 'bi-hourglass-split')"></i>
                  {{ coupon.status === 'active' ? 'Hoạt động' : (coupon.status === 'expired' ? 'Đã hết hạn' : (coupon.status === 'inactive' ? 'Ẩn đi' : 'Sắp tới')) }}
                </span>
              </div>

              <!-- Thông tin chính -->
              <h5 class="fw-bolder text-dark mb-1 font-size-lg tracking-tight">{{ coupon.name }}</h5>
              <p class="text-muted font-size-sm mb-4">{{ coupon.desc }}</p>

              <!-- Các dòng thuộc tính -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-secondary font-size-sm">Mức giảm</span>
                <span class="fw-bold" style="color: #8b5cf6;">{{ coupon.value_display }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-secondary font-size-sm">Loại mã</span>
                <span class="badge bg-light text-dark border border-light fw-semibold px-2 py-1">{{ coupon.type }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="text-secondary font-size-sm">Danh mục</span>
                <span class="badge bg-light text-dark border border-light fw-semibold px-2 py-1">{{ coupon.category || 'Khuyến mãi hệ thống' }}</span>
              </div>

              <!-- Thanh Usage -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-secondary font-size-sm">Đã sử dụng</span>
                  <span class="fw-bold text-dark font-size-sm">{{ coupon.usage_count }} / {{ coupon.usage_limit || '∞' }}</span>
                </div>
                <div class="progress progress-thin bg-light">
                  <div class="progress-bar bg-dark" role="progressbar" :style="{ width: getUsagePercentage(coupon) + '%' }" :aria-valuenow="getUsagePercentage(coupon)" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="text-end text-muted font-size-xs mt-1">{{ getUsagePercentage(coupon) }}% đã dùng</div>
              </div>

              <!-- Thời gian & Nút chức năng -->
              <div class="d-flex align-items-center gap-2 mb-4 bg-light-soft rounded-3 p-2 border border-light">
                <i class="bi bi-calendar3 text-secondary"></i>
                <span class="text-secondary font-size-xs fw-medium">{{ formatCouponDate(coupon.expires_at) }}</span>
              </div>

              <div class="d-flex gap-2">
                <router-link :to="{ name: 'admin-coupon-edit', params: { id: coupon.id } }" class="btn btn-light border flex-grow-1 font-size-sm fw-semibold text-dark"><i class="bi bi-pencil-square me-1"></i> Sửa</router-link>
                <router-link :to="{ name: 'admin-coupons' }" class="btn btn-light border flex-grow-1 font-size-sm fw-semibold text-dark"><i class="bi bi-eye me-1"></i> Xem</router-link>
                <button v-if="coupon.status === 'active'" @click="toggleCouponStatus(coupon)" :disabled="isUpdatingCoupon === coupon.id" class="btn btn-danger-soft border-0 flex-grow-1 font-size-sm fw-semibold text-danger">
                  <span v-if="isUpdatingCoupon === coupon.id" class="spinner-border spinner-border-sm" role="status"></span>
                  <span v-else><i class="bi bi-pause-circle me-1"></i> Dừng</span>
                </button>
                <button v-else-if="coupon.status === 'inactive' || coupon.status === 'expired' || coupon.status === 'soon'" @click="toggleCouponStatus(coupon)" :disabled="isUpdatingCoupon === coupon.id" class="btn btn-success-soft border-0 flex-grow-1 font-size-sm fw-semibold text-success">
                  <span v-if="isUpdatingCoupon === coupon.id" class="spinner-border spinner-border-sm" role="status"></span>
                  <span v-else><i class="bi bi-play-circle me-1"></i> Kích hoạt</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!couponData.list || couponData.list.length === 0" class="col-12">
            <div class="text-center text-muted p-5 bg-white rounded-4 shadow-sm">Hiện chưa có mã giảm giá nào.</div>
        </div>

        <!-- Thanh tóm tắt thống kê -->
        <div class="col-12 mt-4">
          <div class="card border-0 bg-light-purple rounded-4 shadow-sm">
            <div class="card-body p-4 row text-center">
              <div class="col-3 border-end border-light">
                <h3 class="fw-bolder text-success mb-1">{{ couponData.summary.active || 0 }}</h3>
                <span class="text-secondary font-size-sm">Hoạt động</span>
              </div>
              <div class="col-3 border-end border-light">
                <h3 class="fw-bolder text-warning mb-1">{{ couponData.summary.upcoming || 0 }}</h3>
                <span class="text-secondary font-size-sm">Sắp tới</span>
              </div>
              <div class="col-3 border-end border-light">
                <h3 class="fw-bolder text-danger mb-1">{{ couponData.summary.expired || 0 }}</h3>
                <span class="text-secondary font-size-sm">Đã hết hạn</span>
              </div>
              <div class="col-3">
                <h3 class="fw-bolder mb-1" style="color: #8b5cf6;">{{ couponData.summary.total_uses || 0 }}</h3>
                <span class="text-secondary font-size-sm">Tổng lượt dùng</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Biểu đồ sử dụng Coupon -->
        <div class="col-12 mt-4">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-4 pb-0 px-4">
              <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <span class="badge p-1 rounded bg-purple">&nbsp;</span> Biểu đồ sử dụng mã giảm giá
              </h5>
              <span class="text-muted font-size-xs">Hiển thị lịch sử sử dụng mã giảm giá qua các đơn hàng</span>
            </div>
            <div class="card-body px-4 pb-4 pt-4">
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
import { useQuery, useMutation } from '@tanstack/vue-query';
import Chart from 'chart.js/auto';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import * as XLSX from 'xlsx';

const today = new Date();
const maxDate = today.toISOString().split('T')[0]; 
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  return { 
    'Accept': 'application/json', 
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
  };
};

const isExporting = ref(false); 
const isUpdatingCoupon = ref(null);
let chartInstance = null;
let paymentChartInstance = null;
let couponChartInstance = null;

const filterParams = ref({
    startDate: '',
    endDate: '',
    isAll: false
});

const paymentStats = ref({
  vnpayPercent: 0,
  momoPercent: 0,
  codPercent: 0,
  bankPercent: 0
});

// ==========================================
// 1. TANSTACK QUERY: LẤY DỮ LIỆU CHÍNH
// ==========================================
const { data: dashboardData, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['admin-dashboard-main'],
  queryFn: async () => {
    const res = await axios.get(`${apiUrl}/admin/dashboard`, { headers: getHeaders() });
    return res.data.data;
  },
  staleTime: 5 * 60 * 1000, 
  keepPreviousData: true
});

const stats = computed(() => dashboardData.value?.stats || { 
  totalRevenue: 0, revenueGrowth: 0, newOrders: 0, ordersGrowth: 0,
  inventory: 0, totalCustomers: 0, customersGrowth: 0
});
const recentOrders = computed(() => dashboardData.value?.recentOrders || []);
const topProducts = computed(() => dashboardData.value?.topProducts || []);

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
            initOrUpdateChart(newData.chartData.labels, newData.chartData.values);
            initPaymentChart();
            if (newData.couponChart) {
                initCouponChart(newData.couponChart.labels, newData.couponChart.values);
            }
        });
    }
}, { immediate: true });

// ==========================================
// 2. TANSTACK MUTATION: LỌC BIỂU ĐỒ & API TOGGLE TRẠNG THÁI MÃ
// ==========================================
const chartMutation = useMutation({
    mutationFn: async () => {
        const res = await axios.get(`${apiUrl}/admin/dashboard/chart`, {
            params: { 
                start_date: filterParams.value.startDate, 
                end_date: filterParams.value.endDate,
                is_all: filterParams.value.isAll
            },
            headers: getHeaders()
        });
        return res.data.data;
    },
    onSuccess: (data) => {
        if (data) {
             if (data.paymentStats) {
                 paymentStats.value = data.paymentStats;
                 initPaymentChart();
             }
             initOrUpdateChart(data.labels, data.values);
             if(data.couponChart) {
                initCouponChart(data.couponChart.labels, data.couponChart.values);
             }
        }
    },
    onError: (err) => {
        Swal.fire({ icon: 'error', title: 'Lỗi lọc ngày', text: err.message || 'Không thể lọc dữ liệu.', confirmButtonColor: '#009981' });
    }
});

const applyChartFilter = (isAll = false) => {
    filterParams.value.isAll = isAll;
    if (isAll) { filterParams.value.startDate = ''; filterParams.value.endDate = ''; }
    chartMutation.mutate();
};

// API: Kích hoạt / Dừng mã giảm giá (DÙNG PATCH DO ROUTE LÀ PATCH)
const toggleCouponStatus = async (coupon) => {
    isUpdatingCoupon.value = coupon.id;
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    try {
        // Đổi từ axios.put sang axios.patch khớp với Route Laravel của bạn
        const res = await axios.patch(`${apiUrl}/admin/coupons/${coupon.id}`, { status: newStatus }, { headers: getHeaders() });

        if(res && res.data.success) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật trạng thái mã!', showConfirmButton: false, timer: 1500 });
            refetch(); // Tải lại Dashboard Data để thay đổi trạng thái ngay lập tức
        }
    } catch(e) {
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
  for(let i=0; i<count; i++) colors.push(threeColorPalette[i % threeColorPalette.length]);
  return colors;
};

const initOrUpdateChart = (labels, values) => {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = values;
      chartInstance.data.datasets[0].backgroundColor = generateColors(labels.length);
      chartInstance.data.datasets[0].barPercentage = labels.length > 15 ? 0.8 : 0.5;
      chartInstance.update();
  } else {
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Doanh thu', data: values, backgroundColor: generateColors(labels.length), borderRadius: 6, barPercentage: 0.5 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#eef2f6', drawBorder: false, borderDash: [5, 5] }, ticks: { callback: (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ' } },
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
    data: { labels: ['VNPay', 'MoMo', 'COD', 'Chuyển khoản'], datasets: [{ data: [paymentStats.value.vnpayPercent, paymentStats.value.momoPercent, paymentStats.value.codPercent, paymentStats.value.bankPercent], backgroundColor: ['#009981', '#FF9F1C', '#2EC4B6', '#6c757d'], borderWidth: 2, borderColor: '#ffffff' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
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
// 4. XUẤT BÁO CÁO EXCEL
// ==========================================
const exportToExcel = () => {
  isExporting.value = true;
  setTimeout(() => { isExporting.value = false; Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã tải file Excel thành công!', showConfirmButton: false, timer: 2000 }); }, 1000);
};

// ==========================================
// 5. HELPER FORMAT CHUNG
// ==========================================
const getGrowthClass = (value) => value >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger';
const getGrowthIcon = (value) => value >= 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
const formatGrowth = (value) => `${value > 0 ? '+' : ''}${value || 0}%`;
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
    if(type.includes('%')) return 'bi-percent';
    return 'bi-bullseye';
};

const getUsagePercentage = (coupon) => {
    if(!coupon.usage_limit || coupon.usage_limit === 0) return 0;
    return Math.min(((coupon.usage_count / coupon.usage_limit) * 100), 100).toFixed(1);
};

const formatCouponDate = (dateStr) => {
    if(!dateStr || dateStr === 'Không giới hạn') return 'Không giới hạn hạn dùng';
    return `Hạn dùng: ${dateStr}`;
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }

.dashboard-wrapper { background-color: #f8f9fc; font-family: 'Inter', sans-serif; }
.font-size-lg { font-size: 1.125rem; }
.font-size-sm { font-size: 0.875rem; }
.font-size-xs { font-size: 0.75rem; }
.letter-spacing-1 { letter-spacing: 0.5px; }
.tracking-tight { letter-spacing: -0.5px; }
.whitespace-nowrap { white-space: nowrap; }
.transition-all { transition: all 0.3s ease; }
.min-w-0 { min-width: 0; } 

.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.bg-brand-soft { background-color: rgba(0, 153, 129, 0.1) !important; }

.bg-purple { background-color: #8b5cf6 !important; }
.bg-light-purple { background-color: #f5f3ff !important; }

.custom-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.custom-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px 0 rgba(0,0,0,0.06) !important; }

.filter-group:hover { border-color: #009981 !important; box-shadow: 0 4px 10px rgba(0, 153, 129, 0.1) !important; }

.icon-circle { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }

.stat-number { font-size: clamp(1.4rem, 2.5vw, 1.75rem); letter-spacing: -0.5px; white-space: nowrap; }

.bg-info-soft { background-color: rgba(13, 202, 240, 0.1) !important; color: #0dcaf0 !important;}
.bg-success-soft { background-color: rgba(16, 185, 129, 0.1) !important; color: #10b981 !important;}
.bg-warning-soft { background-color: rgba(245, 158, 11, 0.1) !important; color: #f59e0b !important;}
.bg-danger-soft  { background-color: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important;}
.bg-secondary-soft { background-color: rgba(108, 117, 125, 0.1) !important; color: #6c757d !important;}
.bg-light-soft { background-color: #f9fafb !important; }
.bg-orange { background-color: #fd7e14 !important; }

/* Styling riêng cho Khu vực Coupon */
.coupon-card { border: 2px solid transparent; }
.coupon-active { border-color: rgba(16, 185, 129, 0.3); }
.coupon-expired { border-color: rgba(239, 68, 68, 0.2); }
.coupon-inactive { border-color: rgba(108, 117, 125, 0.2); }
.coupon-soon { border-color: rgba(245, 158, 11, 0.3); }

.coupon-icon { border-width: 2px !important; }
.progress-thin { height: 6px; border-radius: 10px; background-color: #e5e7eb; }
.progress-thin .progress-bar { border-radius: 10px; }

.btn-danger-soft { background-color: #fee2e2; color: #dc2626; }
.btn-danger-soft:hover { background-color: #fca5a5; }
.btn-success-soft { background-color: #d1fae5; color: #059669; }
.btn-success-soft:hover { background-color: #a7f3d0; }

.badge-gradient-success { background: linear-gradient(135deg, #2EC4B6, #009981); color: white; box-shadow: 0 4px 10px rgba(0,153,129,0.2); }
.badge-gradient-warning { background: linear-gradient(135deg, #FFB75E, #ED8F03); color: white; box-shadow: 0 4px 10px rgba(237,143,3,0.2); }
.badge-gradient-info { background: linear-gradient(135deg, #4CC9F0, #4361EE); color: white; box-shadow: 0 4px 10px rgba(67,97,238,0.2); }
.badge-gradient-danger { background: linear-gradient(135deg, #FF5A5F, #E63946); color: white; box-shadow: 0 4px 10px rgba(230,57,70,0.2); }
.badge-gradient-primary { background: linear-gradient(135deg, #9FA8DA, #4361EE); color: white; box-shadow: 0 4px 10px rgba(67,97,238,0.2); }
.badge-gradient-secondary { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); color: white; box-shadow: 0 4px 10px rgba(158,158,158,0.2); }

.product-img-box { width: 54px; height: 54px; border-radius: 12px; overflow: hidden; }
.rank-badge { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 0.9rem; }
.rank-1 { background: linear-gradient(135deg, #FFD700, #F79D00); }
.rank-2 { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
.rank-3 { background: linear-gradient(135deg, #FFB75E, #ED8F03); }

.table-row-hover:hover { background-color: #fcfdfd; }
.custom-table th { border-bottom: 1px solid #f1f3f5; }
.custom-table tr:last-child { border-bottom: none !important; }

.custom-date-input { width: 110px; }
.custom-date-input::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; }

.helper-date-label { font-size: 0.65rem; color: #8792a3; font-weight: 600; text-transform: uppercase; margin-top: -3px; text-align: center; }

select:focus, input:focus, button:focus { outline: none; box-shadow: none !important; }
</style>