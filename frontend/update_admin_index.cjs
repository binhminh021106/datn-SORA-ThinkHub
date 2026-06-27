const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'admin', 'Index.vue');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace Title & Export Button
content = content.replace(
`      <!-- Tiêu đề trang -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-1">
        <div class="mb-3 mb-md-0 d-flex align-items-center gap-3">
          <div>
            <h1 class="h3 fw-bolder text-dark mb-2 tracking-tight">Admin Dashboard</h1>
          </div>
          <div v-if="isFetching && !isLoading" class="spinner-border spinner-border-sm text-brand" role="status" title="Đang cập nhật ngầm dữ liệu mới nhất..."></div>
        </div>

        <button @click="exportToExcel" :disabled="isExporting" class="btn btn-brand d-flex align-items-center gap-2 px-4 py-2 fw-semibold btn-modern transition-all shadow-sm rounded-3">
          <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-file-earmark-excel-fill fs-5"></i>
          {{ isExporting ? 'Đang xuất...' : 'Xuất báo cáo' }}
        </button>
      </div>`,
`      <!-- Tiêu đề trang -->
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div class="d-flex align-items-center gap-2">
          <h1 class="h4 fw-bolder text-dark mb-0 tracking-tight">Admin Dashboard</h1>
          <div v-if="isFetching && !isLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status" title="Đang cập nhật ngầm dữ liệu mới nhất..."></div>
        </div>

        <button @click="exportToExcel" :disabled="isExporting" class="btn btn-outline-brand d-flex align-items-center gap-2 px-3 py-1 fw-semibold transition-all rounded-3 shadow-sm" style="font-size: 0.95rem;">
          <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-file-earmark-arrow-down-fill"></i> Xuất báo cáo
        </button>
      </div>`
);

// 2. Orders max-height
content = content.replace(
`<div class="card-body p-0">
              <div class="table-responsive">`,
`<div class="card-body p-0 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <div class="table-responsive">`
);

// 3. Reviews max-height
content = content.replace(
`<div class="card-body p-3 p-xxl-4">
              <p v-if="recentReviews?.length === 0" class="text-center text-muted py-3">Chưa có đánh giá nào.</p>`,
`<div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
              <p v-if="recentReviews?.length === 0" class="text-center text-muted py-3">Chưa có đánh giá nào.</p>`
);

// 4. Products & Combos layout
content = content.replace(
`      <!-- Hàng 4: Sản phẩm & Chiến dịch -->
      <div class="row g-3 g-xl-4 mb-4">
        <!-- Top Bán Chạy -->
        <div class="col-12 col-md-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4">
              <h5 class="fw-bold mb-0 text-dark">Top Bán Chạy</h5>
            </div>
            <div class="card-body p-3 p-xxl-4">`,
`      <!-- Hàng 4: Sản phẩm & Chiến dịch -->
      <div class="row g-3 g-xl-4 mb-4">
        <!-- Top Bán Chạy -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4">
              <h5 class="fw-bold mb-0 text-dark">Top Bán Chạy</h5>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">`
);

content = content.replace(
`        <!-- Cảnh báo Hết Hàng -->
        <div class="col-12 col-md-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-danger border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                 <i class="bi bi-exclamation-triangle-fill text-danger"></i> Sắp hết hàng
              </h5>
              <router-link :to="{ path: '/admin/inventory' }" class="btn btn-sm bg-danger-soft text-danger fw-bold rounded-pill px-3 transition-all border border-light">Quản lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4">`,
`        <!-- Cảnh báo Hết Hàng -->
        <div class="col-12 col-xl-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-danger border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                 <i class="bi bi-exclamation-triangle-fill text-danger"></i> Sắp hết hàng
              </h5>
              <router-link :to="{ path: '/admin/inventory' }" class="btn btn-sm bg-danger-soft text-danger fw-bold rounded-pill px-3 transition-all border border-light">Quản lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4 custom-scrollbar" style="max-height: 420px; overflow-y: auto;">`
);

content = content.replace(
`        <!-- Combo đang chạy -->
        <div class="col-12 col-md-4">
          <div class="card custom-card h-100 border-0 shadow-sm rounded-4 border-top border-info border-3">
            <div class="card-header bg-transparent border-bottom pt-3 pb-3 px-3 px-xxl-4 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                 <i class="bi bi-gift-fill text-info"></i> Combo Đang chạy
              </h5>
              <router-link :to="{ path: '/admin/combos' }" class="btn btn-sm bg-info-soft text-info fw-bold rounded-pill px-3 transition-all border border-light">Quản lý</router-link>
            </div>
            <div class="card-body p-3 p-xxl-4">
              <p v-if="activeCombos?.length === 0" class="text-center text-muted py-3">Không có combo nào đang hoạt động.</p>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-3">
                <li v-for="combo in activeCombos" :key="combo.id" class="d-flex align-items-center product-item pb-2 border-bottom border-light">
                  <div class="product-img-box me-3 bg-light-soft position-relative d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-info" style="width: 48px; height: 48px; border-radius: 8px;">
                    <img v-if="combo.image" :src="combo.image" class="img-fluid h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; border-radius: 8px;" />
                    <i v-else class="bi bi-basket2 text-info fs-4"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="mb-1 fw-bold text-dark font-size-sm text-truncate" :title="combo.name">{{ combo.name }}</h6>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                      <span class="text-secondary font-size-xs"><i class="bi bi-clock me-1"></i>{{ combo.end_date }}</span>
                      <span class="fw-bolder text-info font-size-sm whitespace-nowrap">`,
`        <!-- Combo đang chạy -->
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
                      <span class="fw-bolder text-info font-size-sm whitespace-nowrap">`
);

// 5. Image handlers
content = content.replace(
`<img v-if="product.image" :src="product.image" @error="product.image = ''" alt="Product" class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; z-index: 1;"/>`,
`<img v-if="product.image" :src="product.image" @error="handleImageError" alt="Product" class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover; z-index: 1;"/>`
);

content = content.replace(
`<img v-if="product.image" :src="product.image" class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover;" />`,
`<img v-if="product.image" :src="product.image" @error="handleImageError" class="img-fluid rounded-2 h-100 w-100 position-absolute top-0 start-0" style="object-fit: cover;" />`
);

// 6. Scripts: handleImageError, isComboEndingSoon
content = content.replace(
`const exportToExcel = () => {`,
`const handleImageError = (e) => {
  e.target.src = '/image-error.png'; 
  e.target.onerror = null; 
};

const isComboEndingSoon = (endDateStr) => {
  if (!endDateStr) return false;
  const parts = endDateStr.split('/');
  if(parts.length === 3) {
    const d = new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}T23:59:59\`);
    const diff = d - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  }
  return false;
};

const exportToExcel = () => {`
);

// 7. CSS overrides for custom radius & scrollbar
content = content.replace(
`</style>`,
`.custom-scrollbar::-webkit-scrollbar {
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
</style>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated successfully');
