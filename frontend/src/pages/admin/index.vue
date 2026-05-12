<template>
  <div>
    <!-- Màn hình Loading hiệu ứng Shimmer -->
    <div v-if="isLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu tổng quan...
      </p>
    </div>

    <!-- Nội dung Dashboard (Hiển thị khi load xong) -->
    <div v-else class="dashboard-wrapper min-vh-100 p-4">
      <!-- Tiêu đề trang -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-2">
        <div class="mb-3 mb-md-0">
          <h1 class="h3 fw-bolder text-dark mb-2 tracking-tight">Bảng điều khiển</h1>
          <p class="text-secondary mb-0 font-size-sm">Chào mừng trở lại! Dưới đây là tổng quan cửa hàng hôm nay.</p>
        </div>
        <!-- Nút hành động nhanh -->
        <button @click="exportToExcel" :disabled="isExporting" class="btn btn-brand d-flex align-items-center gap-2 px-4 py-2 fw-semibold btn-modern transition-all shadow-sm rounded-pill">
          <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-file-earmark-excel-fill fs-5"></i>
          {{ isExporting ? 'Đang xuất...' : 'Xuất báo cáo' }}
        </button>
      </div>

      <!-- Hàng 1: Các thẻ thống kê (Thẻ tổng quan) -->
      <div class="row g-4 mb-5">
        <!-- Thẻ Doanh thu -->
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

        <!-- Thẻ Đơn hàng mới -->
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

        <!-- Thẻ Tồn kho -->
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
                <span class="badge bg-secondary-soft text-secondary fw-bold me-2 px-2 py-1">
                  Cập nhật
                </span>
                <span class="text-muted font-size-xs fw-medium">Vừa xong</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Thẻ Khách hàng -->
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

      <!-- Hàng 2: Biểu đồ Doanh thu -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card custom-card border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-0 pt-4 pb-0 px-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <h5 class="fw-bold text-dark mb-0">Thống kê doanh thu</h5>
              
              <!-- Vùng Bộ lọc Thiết kế mới -->
              <div class="d-flex flex-wrap align-items-center gap-3">
                <div class="d-flex align-items-center gap-1 bg-white rounded-pill px-3 py-1 shadow-sm border border-light transition-all filter-group">
                  <i class="bi bi-calendar-range text-brand me-1"></i>
                  <input type="date" v-model="startDate" class="form-control form-control-sm border-0 bg-transparent shadow-none text-dark fw-medium font-size-sm p-1 cursor-pointer custom-date-input" title="Từ ngày">
                  <span class="text-muted font-size-xs fw-bold px-1">-</span>
                  <input type="date" v-model="endDate" class="form-control form-control-sm border-0 bg-transparent shadow-none text-dark fw-medium font-size-sm p-1 cursor-pointer custom-date-input" title="Đến ngày">
                </div>

                <div class="bg-white rounded-pill shadow-sm border border-light d-flex align-items-center px-2 py-1 transition-all filter-group">
                  <i class="bi bi-clock-history text-brand ms-2"></i>
                  <select v-model="selectedTimeRange" class="form-select form-select-sm border-0 bg-transparent shadow-none cursor-pointer fw-semibold text-dark ps-2 pe-4 py-1" style="min-width: 145px; color: #2b2c40 !important; background-color: transparent !important;">
                    <option value="custom" style="color: #2b2c40;">Tùy chọn ngày</option>
                    <option value="7" style="color: #2b2c40;">7 ngày qua</option>
                    <option value="15" style="color: #2b2c40;">15 ngày qua</option>
                    <option value="30" style="color: #2b2c40;">30 ngày qua</option>
                    <option value="this_month" style="color: #2b2c40;">Tháng này</option>
                  </select>
                </div>

                <button @click="filterData" class="btn btn-brand rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-all shadow-sm" style="height: 40px;" :disabled="isFiltering">
                  <span v-if="isFiltering" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-funnel-fill"></i> Lọc
                </button>
              </div>
            </div>
            <div class="card-body px-4 pb-4 pt-4">
              <!-- Canvas cho Chart.js -->
              <div style="height: 350px; width: 100%;">
                <canvas id="revenueChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hàng 3: Danh sách -->
      <div class="row g-4">
        
        <!-- Cột Trái: Đơn hàng gần đây -->
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
                      <td class="ps-4 py-3">
                        <span class="text-brand fw-bold">#{{ order.code }}</span>
                      </td>
                      <td class="py-3">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar-circle bg-brand-soft text-brand fw-bolder border border-light shadow-sm flex-shrink-0">
                            {{ order.customer?.charAt(0) || 'K' }}
                          </div>
                          <div>
                            <h6 class="mb-0 fw-bold text-dark font-size-sm">{{ order.customer || 'Khách lẻ' }}</h6>
                          </div>
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

        <!-- Cột Phải: Sản phẩm bán chạy -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-4 pb-3 px-4">
              <h5 class="fw-bold mb-0 text-dark">Top Bán Chạy</h5>
            </div>
            <div class="card-body px-4 pt-4 pb-4">
              <p v-if="topProducts.length === 0" class="text-center text-muted py-3">Chưa có sản phẩm nào được bán.</p>
              
              <!-- Danh sách hiển thị Top Products Đã Fix Giao Diện -->
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-4">
                <li v-for="(product, index) in topProducts" :key="product.id" class="d-flex align-items-center product-item">
                  <!-- Xếp hạng (Badge) -->
                  <div class="rank-badge fw-bolder shadow-sm flex-shrink-0" :class="getRankClass(index)">
                    {{ index + 1 }}
                  </div>
                  
                  <!-- Hình ảnh có xử lý Error Fallback -->
                  <div class="product-img-box ms-3 me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-light">
                    <!-- Ảnh thật (Nếu load lỗi, tự động gán product.image = rỗng để hiện Box Icon) -->
                    <img v-if="product.image" :src="product.image" @error="product.image = ''" alt="Product" class="img-fluid rounded-3 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; z-index: 1;"/>
                    
                    <!-- Icon Placeholder (Hiện khi không có ảnh) -->
                    <div v-if="!product.image" class="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-secondary rounded-3">
                      <i class="bi bi-box-seam fs-4"></i>
                    </div>
                  </div>
                  
                  <!-- Thông tin được cấu trúc lại Flexbox để không bao giờ bị ép -->
                  <div class="flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                    <!-- Tên SP: Hiển thị 2 dòng rồi mới thêm dấu ... -->
                    <h6 class="mb-1 fw-bold text-dark font-size-sm" 
                        style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal;" 
                        :class="{'text-decoration-line-through text-muted opacity-75': product.is_deleted}" 
                        :title="product.name">
                      {{ product.name }}
                    </h6>
                    
                    <!-- Hàng chứa Thông số và Giá được đẩy xuống dòng dưới -->
                    <div class="d-flex justify-content-between align-items-end mt-1 flex-wrap gap-1">
                      <p class="mb-0 text-secondary font-size-xs fw-medium">
                        Bán: <span class="text-dark fw-bold">{{ product.sold }}</span> 
                        <span class="mx-1 text-light">|</span> 
                        Tồn: <span class="fw-bold" :class="product.stock < 20 ? 'text-danger' : 'text-dark'">{{ product.stock }}</span>
                      </p>
                      
                      <div class="fw-bolder text-brand font-size-sm whitespace-nowrap">
                        {{ formatCurrency(product.price) }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import * as XLSX from 'xlsx';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  return { 
    'Accept': 'application/json', 
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
  };
};

// -- CÁC BIẾN STATE (REFS) --
const isLoading = ref(true); 
const isFiltering = ref(false); 
const isExporting = ref(false); 

let chartInstance = null;

const selectedTimeRange = ref('7');
const startDate = ref('');
const endDate = ref('');

watch([startDate, endDate], () => {
  if (startDate.value || endDate.value) {
    selectedTimeRange.value = 'custom';
  }
});

const threeColorPalette = ['#009981', '#FF9F1C', '#2EC4B6'];
const generateColors = (count) => {
  let colors = [];
  for(let i=0; i<count; i++) colors.push(threeColorPalette[i % threeColorPalette.length]);
  return colors;
};

// -- Dữ liệu mặc định --
const stats = ref({ 
  totalRevenue: 0, revenueGrowth: 0,
  newOrders: 0, ordersGrowth: 0,
  inventory: 0, 
  totalCustomers: 0, customersGrowth: 0
});
const recentOrders = ref([]);
const topProducts = ref([]);
const chartDataObj = ref({ labels: [], data: [] });

// -- 1. GỌI API LẤY DỮ LIỆU TỔNG QUAN KHI VÀO TRANG --
const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(`${apiUrl}/admin/dashboard`, { headers: getHeaders() });
    
    if (res.data && res.data.status) {
      const responseData = res.data.data || {};
      
      // Map đúng dữ liệu từ backend sang
      stats.value = responseData.stats || { 
        totalRevenue: 0, revenueGrowth: 0,
        newOrders: 0, ordersGrowth: 0,
        inventory: 0, 
        totalCustomers: 0, customersGrowth: 0
      };
      
      recentOrders.value = responseData.recentOrders || [];
      
      // Cập nhật lấy hoàn toàn từ API
      topProducts.value = responseData.topProducts || [];
      
      chartDataObj.value = {
        labels: responseData.chartData?.labels || [],
        data: responseData.chartData?.values || []
      };
    } else {
       Swal.fire('Lỗi', res.data.message || 'Dữ liệu không hợp lệ', 'error');
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
    
    if (error.response) {
       if (error.response.status === 404) {
         Swal.fire('Lỗi API (404)', 'Backend chưa thiết lập Route.', 'error');
       } else if (error.response.status === 500) {
         Swal.fire('Lỗi Code Laravel (500)', error.response.data.message || 'Lỗi máy chủ', 'error');
       }
    }
    chartDataObj.value = { labels: [], data: [] };
  } finally {
    isLoading.value = false;
    nextTick(() => { initChart(); });
  }
};

// -- 2. KHỞI TẠO BIỂU ĐỒ CHART.JS --
const initChart = () => {
  const ctx = document.getElementById('revenueChart');
  if (ctx) {
    if (chartInstance) chartInstance.destroy();

    const safeLabels = chartDataObj.value.labels || [];
    const safeData = chartDataObj.value.data || [];

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: safeLabels,
        datasets: [{
          label: 'Doanh thu',
          data: safeData,
          backgroundColor: generateColors(safeLabels.length),
          borderRadius: 6,
          barPercentage: 0.5,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2b2c40',
            padding: 12,
            titleFont: { size: 14, family: "'Inter', sans-serif" },
            bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#eef2f6', drawBorder: false, borderDash: [5, 5] },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 12 },
              color: '#8792a3',
              callback: function(value) {
                return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
              }
            }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: "'Inter', sans-serif", size: 12 }, color: '#8792a3' }
          }
        }
      }
    });
  }
};

// -- 3. GỌI API KHI BẤM NÚT "LỌC" BIỂU ĐỒ --
const filterData = async () => {
  if(!chartInstance) return;
  isFiltering.value = true;

  try {
    const res = await axios.get(`${apiUrl}/admin/dashboard/chart`, {
      params: { range: selectedTimeRange.value, start_date: startDate.value, end_date: endDate.value },
      headers: getHeaders()
    });

    if (res.data && res.data.status) {
      const responseData = res.data.data || {};
      const newLabels = responseData.labels || [];
      const newData = responseData.values || [];
      
      chartInstance.data.labels = newLabels;
      chartInstance.data.datasets[0].data = newData;
      chartInstance.data.datasets[0].backgroundColor = generateColors(newLabels.length);
      chartInstance.data.datasets[0].barPercentage = newLabels.length > 15 ? 0.8 : 0.5;
      chartInstance.update();
    } else {
       Swal.fire('Lỗi', res.data.message || 'Dữ liệu không hợp lệ', 'error');
    }
  } catch (error) {
    console.error('Lỗi khi lọc biểu đồ:', error);
    if (error.response && error.response.status === 500) {
       Swal.fire('Lỗi Code Laravel', error.response.data.message || 'Lỗi server', 'error');
    }
  } finally {
    isFiltering.value = false;
  }
};

// -- 4. HÀM XUẤT BÁO CÁO EXCEL --
const exportToExcel = () => {
  isExporting.value = true;

  try {
    const overviewData = [
      ['CHỈ SỐ THỐNG KÊ', 'GIÁ TRỊ'],
      ['Tổng Doanh Thu (VNĐ)', stats.value.totalRevenue],
      ['Đơn Hàng Mới', stats.value.newOrders],
      ['Tổng Khách Hàng', stats.value.totalCustomers],
      ['Tổng Tồn Kho (Sản phẩm)', stats.value.inventory],
    ];

    const productsData = topProducts.value.map((p, index) => ({
      'Xếp hạng': 'Top ' + (index + 1),
      'Tên sản phẩm': p.name,
      'Số lượng đã bán': p.sold,
      'Tồn kho hiện tại': p.stock,
      'Đơn giá (VNĐ)': p.price
    }));

    const ordersData = recentOrders.value.map(o => ({
      'Mã Đơn Hàng': o.code,
      'Tên Khách Hàng': o.customer,
      'Ngày Đặt Hàng': o.date,
      'Tổng Tiền (VNĐ)': o.total,
      'Trạng Thái': translateStatus(o.status)
    }));

    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    const wsProducts = XLSX.utils.json_to_sheet(productsData);
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);

    wsOverview['!cols'] = [{ wch: 25 }, { wch: 20 }];
    wsProducts['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    wsOrders['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");
    XLSX.utils.book_append_sheet(wb, wsProducts, "Top Sản Phẩm");
    XLSX.utils.book_append_sheet(wb, wsOrders, "Đơn Hàng Mới");

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_Cao_ThinkHub_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Đã tải file Excel thành công!',
      showConfirmButton: false,
      timer: 2000
    });

  } catch (error) {
    console.error("Lỗi xuất Excel:", error);
    Swal.fire('Lỗi', 'Có lỗi xảy ra trong quá trình xuất file Excel.', 'error');
  } finally {
    isExporting.value = false;
  }
};

// -- CÁC HÀM TIỆN ÍCH DÀNH RIÊNG CHO PHẦN TRĂM (%) TĂNG TRƯỞNG --
const getGrowthClass = (value) => {
  return value >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger';
};

const getGrowthIcon = (value) => {
  return value >= 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
};

const formatGrowth = (value) => {
  if (value === undefined || value === null) return '0%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}%`;
};

// -- UTILS FORMAT & STYLES --
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Dịch trạng thái từ API tiếng Anh sang tiếng Việt mượt mà
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

// --- MÀU SẮC ĐẶC SẮC (GRADIENT) BẮT CHUẨN API ---
const getStatusBadgeClass = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'delivered') return 'badge-gradient-success';
  if (s === 'processing' || s === 'confirmed') return 'badge-gradient-warning';
  if (s === 'shipping') return 'badge-gradient-info';
  if (s === 'cancelled' || s === 'returned' || s === 'return_requested') return 'badge-gradient-danger';
  if (s === 'pending') return 'badge-gradient-primary';
  return 'badge-gradient-secondary';
};

// --- ICON ĐI KÈM CHO BADGE TRẠNG THÁI ---
const getStatusIcon = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'delivered') return 'bi-check-circle-fill';
  if (s === 'processing' || s === 'confirmed') return 'bi-box-seam-fill';
  if (s === 'shipping') return 'bi-truck';
  if (s === 'cancelled' || s === 'returned') return 'bi-x-circle-fill';
  if (s === 'return_requested') return 'bi-arrow-return-left';
  if (s === 'pending') return 'bi-hourglass-split';
  return 'bi-info-circle-fill';
};

const getRankClass = (index) => {
  if (index === 0) return 'rank-1 bg-warning text-white'; 
  if (index === 1) return 'rank-2 bg-secondary text-white'; 
  if (index === 2) return 'rank-3 bg-orange text-white'; 
  return 'rank-normal bg-light text-secondary';
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }

.dashboard-wrapper { background-color: #f8f9fc; font-family: 'Inter', sans-serif; }
.font-size-sm { font-size: 0.875rem; }
.font-size-xs { font-size: 0.75rem; }
.letter-spacing-1 { letter-spacing: 0.5px; }
.tracking-tight { letter-spacing: -0.5px; }
.whitespace-nowrap { white-space: nowrap; }
.transition-all { transition: all 0.3s ease; }
/* Đảm bảo text không bị bung dãn */
.min-w-0 { min-width: 0; } 

.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; color: white; transition: 0.2s; } 
.btn-brand:hover { background-color: #007a67; color: white; }
.bg-brand-soft { background-color: rgba(0, 153, 129, 0.1) !important; }

.btn-modern { box-shadow: 0 4px 12px 0 rgba(0, 153, 129, 0.2); }
.btn-modern:hover { transform: translateY(-2px); box-shadow: 0 6px 15px 0 rgba(0, 153, 129, 0.3); }

.custom-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.custom-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px 0 rgba(0,0,0,0.06) !important; }

.filter-group:hover { border-color: #009981 !important; box-shadow: 0 4px 10px rgba(0, 153, 129, 0.1) !important; }

/* Thu nhỏ icon circle lại một chút để vừa vặn khi đưa lên cùng hàng tiêu đề */
.icon-circle { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }

/* Style mới cho chữ số, chống rớt dòng thông minh và tự ép nhỏ chữ (clamp) nếu dãy số quá dài */
.stat-number { 
  font-size: clamp(1.4rem, 2.5vw, 1.75rem); 
  letter-spacing: -0.5px; 
  white-space: nowrap; 
}

.bg-info-soft { background-color: rgba(13, 202, 240, 0.1) !important; color: #0dcaf0 !important;}
.bg-success-soft { background-color: rgba(25, 135, 84, 0.1) !important; color: #198754 !important;}
.bg-warning-soft { background-color: rgba(255, 159, 28, 0.1) !important; color: #FF9F1C !important;}
.bg-danger-soft  { background-color: rgba(220, 53, 69, 0.1) !important; color: #dc3545 !important;}
.bg-secondary-soft { background-color: rgba(108, 117, 125, 0.1) !important; color: #6c757d !important;}
.bg-light-soft { background-color: #f8f9fa !important; }
.bg-orange { background-color: #fd7e14 !important; }

/* === LÀM MÀU MÈ ĐẶC SẮC (GRADIENT BADGES) BÁM THEO CHUẨN API === */
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

select:focus, input:focus, button:focus { outline: none; box-shadow: none !important; }

/* Fix dropdown text visibility */
select.form-select, select.form-select-sm {
  color: #2b2c40 !important;
  background-color: transparent !important;
}

select.form-select option, select.form-select-sm option {
  color: #2b2c40 !important;
  background-color: #fff !important;
  padding: 8px;
}
</style>