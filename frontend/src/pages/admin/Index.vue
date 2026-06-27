<template>
  <div>
    <!-- Màn hình Loading -->
    <div v-if="isLoading && hasAccess" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu tổng quan...
      </p>
    </div>

    <!-- Không có quyền truy cập: hiển thị ngay, không chờ load -->
    <div v-else-if="!hasAccess" class="d-flex justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <div class="text-center">
        <h3 class="text-danger">Bạn không có quyền truy cập</h3>
        <p class="text-muted">Tài khoản của bạn không có cấp độ phù hợp để xem trang này.</p>
        <router-link :to="{ name: 'admin-login' }" class="btn btn-brand mt-3">Đăng nhập bằng tài khoản khác</router-link>
      </div>
    </div>

    <!-- Nội dung Dashboard -->
    <div v-else class="dashboard-wrapper min-vh-100 p-3 p-xl-4">
      
      <!-- Nút xuất báo cáo fixed -->
      <button @click="exportToExcel" :disabled="isExporting" class="btn btn-brand position-fixed shadow-lg d-flex align-items-center justify-content-center transition-all" style="bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; z-index: 1050; padding: 0;" title="Xuất báo cáo Excel">
        <span v-if="isExporting" class="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
        <i v-else class="bi bi-file-earmark-arrow-down-fill fs-4 text-white"></i>
      </button>

      <!-- Hàng 1: Các thẻ thống kê tổng quan (Compact) -->
      <div class="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-3 g-xl-4 mb-4">
        
        <!-- Tổng doanh thu -->
        <div class="col">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <div class="pe-2 min-w-0">
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Tổng Doanh Thu</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate" :title="formatCurrency(stats.totalRevenue)">{{ formatCompactCurrency(stats.totalRevenue) }}</h4>
                </div>
                <div class="icon-circle bg-brand-soft text-brand flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-cash-stack fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1 font-size-xs" :class="getGrowthClass(stats.revenueGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.revenueGrowth)"></i> {{ formatGrowth(stats.revenueGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium text-truncate">Tháng trước</span>
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
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Đơn hàng mới</p>
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
                <span class="text-muted font-size-xs fw-medium text-truncate">Hôm qua</span>
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
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Tổng Tồn Kho</p>
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
                  <p class="text-muted fw-bold font-size-xs mb-1 text-uppercase letter-spacing-1 text-truncate">Khách hàng</p>
                  <h4 class="fw-bolder mb-0 text-dark stat-number text-truncate">{{ stats.totalCustomers }}</h4>
                </div>
                <div class="icon-circle bg-danger-soft text-danger flex-shrink-0" style="width: 38px; height: 38px;">
                  <i class="bi bi-people fs-5"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-auto">
                <span class="badge fw-bold me-2 px-2 py-1 font-size-xs" :class="getGrowthClass(stats.customersGrowth)">
                  <i class="me-1" :class="getGrowthIcon(stats.customersGrowth)"></i> {{ formatGrowth(stats.customersGrowth) }}
                </span>
                <span class="text-muted font-size-xs fw-medium text-truncate">Tháng trước</span>
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
              <div class="d-flex align-items-center mt-auto font-size-xs fw-medium text-muted gap-2 text-truncate">
                <span class="text-primary"><i class="bi bi-calendar2-check"></i> {{ staffStats.current_shift || 'Đang cập nhật...' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Hàng 2: Biểu đồ Doanh thu & Phương thức -->
      <div class="row g-3 g-xl-4 mb-4">
        <div class="col-12 col-xl-8">
          <div class="card custom-card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-3 px-xxl-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
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
                  <i v-else class="bi bi-funnel-fill"></i>
                </button>

                <button @click="applyChartFilter(true)" class="btn btn-light border-light rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all shadow-sm text-secondary" style="height: 42px;" :disabled="chartMutation.isPending.value">
                  <i class="bi bi-calendar-check"></i> Tất cả
                </button>
              </div>
            </div>
            <div class="card-body p-3 p-xxl-4">
              <div style="height: 350px; width: 100%;">
                <canvas id="revenueChart" ref="chartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
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

      <!-- Hàng 3: Giao dịch & Tương tác -->
      <div class="row g-3 g-xl-4 mb-4">
        <div class="col-12 col-xl-7">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark">Đơn hàng mới nhất</h5>
              <router-link :to="{ path: '/admin/orders' }" class="btn btn-sm bg-brand-soft text-brand fw-bold rounded-pill px-3 transition-all border border-light">
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

        <div class="col-12 col-xl-5">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark">Đánh giá mới nhất</h5>
              <router-link :to="{ path: '/admin/reviews' }" class="btn btn-sm bg-brand-soft text-brand fw-bold rounded-pill px-3 transition-all border border-light">
                Quản lý
              </router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="recentReviews?.length === 0" class="text-center text-muted py-3">Chưa có đánh giá nào.</p>
              
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="review in recentReviews" :key="review.id" class="d-flex align-items-start gap-3 border-bottom pb-3 mb-1">
                  <div class="avatar-circle bg-light-soft text-dark fw-bolder border border-light shadow-sm flex-shrink-0" style="width: 40px; height: 40px;">
                    <img v-if="review.user_avatar" :src="review.user_avatar" class="w-100 h-100 rounded-circle object-fit-cover" />
                    <span v-else>{{ review.user_name?.charAt(0) || 'K' }}</span>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h6 class="mb-0 fw-bold text-dark font-size-sm text-truncate pe-2">{{ review.user_name }}</h6>
                      <span class="text-muted font-size-xs whitespace-nowrap">{{ review.date }}</span>
                    </div>
                    <div class="text-warning mb-1 font-size-xs">
                      <i v-for="n in review.rating" :key="'star-'+n" class="bi bi-star-fill me-1"></i>
                      <i v-for="n in (5 - review.rating)" :key="'empty-'+n" class="bi bi-star text-secondary me-1"></i>
                    </div>
                    <p class="text-secondary font-size-sm mb-0" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
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
      <div class="row g-3 g-xl-4 mb-4">
        <!-- Top Bán Chạy -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4">
              <h5 class="fw-bold mb-0 text-dark">Top Bán Chạy</h5>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="topProducts?.length === 0" class="text-center text-muted py-3">Chưa có sản phẩm nào được bán.</p>
              
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="(product, index) in topProducts" :key="product.id" class="d-flex align-items-center product-item pb-2 border-bottom border-light">
                  <div class="rank-badge fw-bolder shadow-sm flex-shrink-0" :class="getRankClass(index)">{{ index + 1 }}</div>
                  
                  <div class="product-img-box ms-3 me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light" style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="product.image" :src="product.image" @error="handleImageError" alt="Product" class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; z-index: 1;"/>
                    <div v-if="!product.image" class="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-secondary rounded-2">
                      <i class="bi bi-box-seam"></i>
                    </div>
                  </div>
                  
                  <div class="flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate" :class="{'text-decoration-line-through text-muted opacity-75': product.is_deleted}" :title="product.name">
                      {{ product.name }}
                    </h6>
                    <div class="d-flex justify-content-between align-items-end mt-1 flex-wrap gap-1">
                      <p class="mb-0 text-secondary font-size-xs fw-medium">
                        Bán: <span class="text-dark fw-bold">{{ product.sold }}</span> 
                      </p>
                      <div class="fw-bolder text-brand font-size-sm whitespace-nowrap">{{ formatCurrency(product.price) }}</div>
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
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                 <i class="bi bi-exclamation-triangle-fill text-danger"></i> Sắp hết hàng
              </h5>
              <router-link :to="{ path: '/admin/inventory' }" class="btn btn-sm bg-danger-soft text-danger fw-bold rounded-pill px-3 transition-all border border-light">Quản lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="lowStockProducts?.length === 0" class="text-center text-muted py-3">Kho hàng đang dồi dào, chưa có mã nào sắp hết.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="product in lowStockProducts" :key="product.id" class="d-flex align-items-center product-item pb-2 border-bottom border-light">
                  <div class="product-img-box me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light" style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="product.image" :src="product.image" @error="handleImageError" class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover;" />
                    <i v-else class="bi bi-box-seam text-secondary"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate" :title="product.name">{{ product.name }}</h6>
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
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                 <i class="bi bi-gift-fill text-info"></i> Combo Đang chạy
              </h5>
              <router-link :to="{ path: '/admin/combos' }" class="btn btn-sm bg-info-soft text-info fw-bold rounded-pill px-3 transition-all border border-light">Quản lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="activeCombos?.length === 0" class="text-center text-muted py-3">Không có combo nào đang hoạt động.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="combo in activeCombos" :key="combo.id" class="d-flex align-items-center product-item pb-2 border-bottom border-light">
                  <div class="product-img-box me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-info" style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="combo.image" :src="combo.image" @error="handleImageError" class="img-fluid h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; border-radius: 8px;" />
                    <i v-else class="bi bi-basket2 text-info fs-4"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate" :title="combo.name">{{ combo.name }}</h6>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                      <div class="d-flex align-items-center gap-2">
                        <span class="text-secondary font-size-xs"><i class="bi bi-clock me-1"></i>{{ combo.end_date }}</span>
                        <span v-if="isComboEndingSoon(combo.end_date)" class="badge bg-warning text-dark px-1 py-0" style="font-size: 10px;">Sắp kết thúc</span>
                      </div>
                      <span class="fw-bolder text-info font-size-sm whitespace-nowrap">
                        -{{ combo.discount_type === 'percentage' ? combo.discount_value + '%' : formatCurrency(combo.discount_value) }}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 4: Thống kê Khuyến mãi & Mã giảm giá -->
      <div class="row g-3 g-xl-4 mt-1">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
              <span class="bg-purple text-white rounded-3 p-2 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px;">
                <i class="bi bi-percent font-size-sm"></i>
              </span>
              Khuyến mãi & Mã giảm giá
            </h4>
            <router-link :to="{ name: 'admin-coupon-create' }" class="btn bg-purple text-white rounded-3 px-3 py-2 fw-semibold font-size-sm shadow-sm d-flex align-items-center gap-2">
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
                        <div class="text-muted font-size-xs mt-1"><span class="badge bg-light text-dark border">{{ coupon.type }}</span></div>
                      </td>
                      <td class="py-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span class="fw-bold text-dark font-size-sm">{{ coupon.usage_count }} / {{ coupon.usage_limit || '∞' }}</span>
                          <span class="text-muted font-size-xs">{{ getUsagePercentage(coupon) }}%</span>
                        </div>
                        <div class="progress progress-thin bg-light" style="height: 5px;">
                          <div class="progress-bar bg-dark" role="progressbar" :style="{ width: getUsagePercentage(coupon) + '%' }"></div>
                        </div>
                      </td>
                      <td class="py-3 text-secondary font-size-sm fw-medium"><i class="bi bi-calendar3 me-1"></i>{{ formatCouponDate(coupon.expires_at) }}</td>
                      <td class="py-3 text-center">
                        <span class="badge rounded-pill fw-bold px-3 py-1" :class="getCouponBadgeClass(coupon.status)">
                          {{ coupon.status === 'active' ? 'Hoạt động' : (coupon.status === 'expired' ? 'Hết hạn' : (coupon.status === 'inactive' ? 'Ẩn đi' : 'Sắp tới')) }}
                        </span>
                      </td>
                      <td class="pe-4 py-3 text-end">
                        <div class="d-flex justify-content-end gap-2">
                           <button v-if="coupon.status === 'active'" @click="toggleCouponStatus(coupon)" :disabled="isUpdatingCoupon === coupon.id" class="btn btn-sm btn-danger-soft text-danger border-0 fw-semibold">
                             <span v-if="isUpdatingCoupon === coupon.id" class="spinner-border spinner-border-sm" role="status"></span>
                             <span v-else>Dừng</span>
                           </button>
                           <button v-else-if="['inactive', 'expired', 'soon'].includes(coupon.status)" @click="toggleCouponStatus(coupon)" :disabled="isUpdatingCoupon === coupon.id" class="btn btn-sm btn-success-soft text-success border-0 fw-semibold">
                             <span v-if="isUpdatingCoupon === coupon.id" class="spinner-border spinner-border-sm" role="status"></span>
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
          <div class="card border-0 bg-light-purple rounded-4 shadow-sm">
            <div class="card-body p-3 p-xxl-4 row text-center">
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
import { useQuery, useMutation } from '@tanstack/vue-query';
import Chart from 'chart.js/auto';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import * as XLSX from 'xlsx';
import defaultImage from '@/assets/images/defaults/placeholder.png';

const today = new Date();
const maxDate = today.toISOString().split('T')[0]; 
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const handleImageError = (e) => {
  e.target.src = defaultImage; 
  e.target.onerror = null; 
};

const formatCompactCurrency = (value) => {
  if (!value) return '0đ';
  const num = Number(value);
  if (isNaN(num)) return '0đ';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' Tỷ';
  }
  if (num >= 1000000) {
    return (num / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' Tr';
  }
  return num.toLocaleString('vi-VN') + 'đ';
};

const isComboEndingSoon = (endDateStr) => {
  if (!endDateStr) return false;
  const parts = endDateStr.split('/');
  if(parts.length === 3) {
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`);
    const diff = d - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  }
  return false;
};

const exportToExcel = () => {
    isExporting.value = true;
    try {
        const wb = XLSX.utils.book_new();

        const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
        const formatNumber = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

        const overviewData = [
            { "Chỉ số": "Tổng doanh thu", "Giá trị": formatMoney(stats.value.totalRevenue) },
            { "Chỉ số": "Đơn hàng mới", "Giá trị": formatNumber(stats.value.newOrders) },
            { "Chỉ số": "Tổng khách hàng", "Giá trị": formatNumber(stats.value.totalCustomers) },
            { "Chỉ số": "Tổng tồn kho hệ thống", "Giá trị": formatNumber(stats.value.inventory) },
            { "Chỉ số": "Mã giảm giá đang hoạt động", "Giá trị": formatNumber(couponData.value?.summary?.active) },
            { "Chỉ số": "Tổng lượt dùng mã giảm giá", "Giá trị": formatNumber(couponData.value?.summary?.total_uses) }
        ];
        const wsOverview = XLSX.utils.json_to_sheet(overviewData);
        wsOverview['!cols'] = [{ wch: 35 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng Quan");

        if (recentOrders.value?.length) {
            const ordersData = recentOrders.value.map(o => ({
                "Mã ĐH": o.code,
                "Khách hàng": o.customer,
                "Ngày đặt": o.date,
                "Tổng tiền": formatMoney(o.total),
                "Trạng thái": o.status === 'delivered' ? 'Đã giao hàng' : (o.status === 'shipping' ? 'Đang giao' : (o.status === 'pending' ? 'Chờ xác nhận' : o.status))
            }));
            const wsOrders = XLSX.utils.json_to_sheet(ordersData);
            wsOrders['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, wsOrders, "Đơn Hàng Gần Đây");
        }

        if (topProducts.value?.length) {
            const topData = topProducts.value.map(p => ({
                "Tên Sản phẩm": p.name,
                "Số lượng đã bán": formatNumber(p.sold),
                "Tồn kho": formatNumber(p.stock),
                "Giá bán": formatMoney(p.price)
            }));
            const wsTop = XLSX.utils.json_to_sheet(topData);
            wsTop['!cols'] = [{ wch: 50 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, wsTop, "Top Bán Chạy");
        }

        if (lowStockProducts.value?.length) {
            const lowStockData = lowStockProducts.value.map(p => ({
                "Tên Sản phẩm": p.name,
                "SKU": p.sku || 'Không có',
                "Tồn kho": formatNumber(p.stock)
            }));
            const wsLowStock = XLSX.utils.json_to_sheet(lowStockData);
            wsLowStock['!cols'] = [{ wch: 50 }, { wch: 20 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, wsLowStock, "Sắp Hết Hàng");
        }

        if (activeCombos.value?.length) {
            const comboData = activeCombos.value.map(c => ({
                "Tên Combo": c.name,
                "Mức giảm": c.discount_type === 'percentage' ? `${c.discount_value}%` : formatCurrency(c.discount_value),
                "Ngày bắt đầu": c.start_date,
                "Ngày kết thúc": c.end_date
            }));
            const wsCombo = XLSX.utils.json_to_sheet(comboData);
            wsCombo['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
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

const { data: dashboardData, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['admin-dashboard-main'],
  queryFn: async () => {
    const res = await axios.get(`${apiUrl}/admin/dashboard`, { headers: getHeaders() });
    return res.data.data;
  },
  staleTime: 5 * 60 * 1000, 
  keepPreviousData: true,
  enabled: hasAccess
});

const stats = computed(() => dashboardData.value?.stats || { 
  totalRevenue: 0, revenueGrowth: 0, newOrders: 0, ordersGrowth: 0,
  inventory: 0, totalCustomers: 0, customersGrowth: 0
});
const recentOrders = computed(() => dashboardData.value?.recentOrders || []);
const topProducts = computed(() => dashboardData.value?.topProducts || []);
const lowStockProducts = computed(() => dashboardData.value?.lowStockProducts || []);
const recentReviews = computed(() => dashboardData.value?.recentReviews || []);
const activeCombos = computed(() => dashboardData.value?.activeCombos || []);
const staffStats = computed(() => dashboardData.value?.staffStats || {
  total: 8,
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
</style>

<style>
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
    background-color: #2b3035 !important;
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
</style>
