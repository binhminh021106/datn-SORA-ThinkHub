<template>
  <div class="review-index-wrapper pb-5 mb-5">
    
    <div v-if="isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải hệ thống đánh giá...</p>
    </div>

    <div class="container-fluid py-4" v-else>
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h3 class="fw-bold text-dark mb-0">Quản lý Đánh giá</h3>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex justify-content-md-end align-items-center gap-3">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small" v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel }}</span>
          </div>
          <button class="btn btn-light border shadow-sm fw-bold text-dark px-4 py-2" @click="fetchData(1, true)">
            <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
        </div>
      </div>

      <div class="mb-3">
        <ul class="nav nav-underline border-bottom mb-2 pb-1" style="flex-wrap: wrap !important; gap: 8px;">
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'all' }" @click.prevent="switchTab('all')">
              <i class="bi bi-grid-fill me-2"></i> Tất cả
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'all'}">{{ statusCounts['all'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'pending' }" @click.prevent="switchTab('pending')">
              <i class="bi bi-hourglass-split me-2 text-warning"></i> Chờ duyệt
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'pending'}">{{ statusCounts['pending'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'approved' }" @click.prevent="switchTab('approved')">
              <i class="bi bi-check-circle-fill me-2 text-success"></i> Đã duyệt
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'approved'}">{{ statusCounts['approved'] || 0 }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link py-2 px-3 d-flex align-items-center custom-tab" href="#" :class="{ 'active-tab': activeTab === 'hidden' }" @click.prevent="switchTab('hidden')">
              <i class="bi bi-eye-slash-fill me-2 text-secondary"></i> Đã ẩn
              <span class="badge ms-2 rounded-pill tab-badge" :class="{'active-badge': activeTab === 'hidden'}">{{ statusCounts['hidden'] || 0 }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="d-flex flex-wrap gap-3 mb-4">
        <div class="d-flex align-items-center bg-white px-3 py-2 rounded-pill border shadow-sm">
          <span class="text-muted small fw-semibold me-2"><i class="bi bi-star-half text-brand"></i> Số sao:</span>
          <select class="form-select form-select-sm border-0 bg-transparent fw-bold p-0 pe-4 cursor-pointer" style="width: auto; box-shadow: none;" v-model="filters.rating" @change="fetchData(1, true)">
            <option value="">Tất cả</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center">
            <i class="bi bi-list-ul me-2"></i>Danh sách Đánh giá
            <div v-if="isSilentLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></div>
          </h6>
          <div class="search-box position-relative" style="width: 300px; max-width: 100%;">
            <input type="text" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0" v-model="searchQuery" @keyup.enter="fetchData(1, true)" placeholder="Tìm theo SP, Combo, KH...">
            <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted cursor-pointer" @click="fetchData(1, true)"></i>
          </div>
        </div>
        
        <div class="card-body p-0 mt-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="table-layout: fixed; width: 100%; min-width: 1100px;">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 25%;">Khách hàng & Đánh giá</th>
                  <th class="py-3 px-4 text-secondary border-0" style="width: 20%;">Mục đánh giá</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 15%;">Số sao</th>
                  <th class="py-3 px-4 text-secondary border-0 text-center" style="width: 20%;">Trạng thái</th>
                  <th class="py-3 px-4 text-secondary text-center border-0" style="width: 20%;">Thao tác</th>
                </tr>
              </thead>
              <tbody :class="{'pe-none': isSilentLoading}">
                <tr v-if="reviews.length === 0 && !isSilentLoading && !isTableLoading">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>Không có dữ liệu.
                  </td>
                </tr>
                <tr v-else v-for="review in displayedReviews" :key="review.id" :class="{'bg-light opacity-75': review.status === 'hidden'}">
                  
                  <td class="px-4 py-3 overflow-hidden">
                    <div class="d-flex align-items-start gap-3">
                      <div class="bg-secondary bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold border shadow-sm flex-shrink-0" style="width: 45px; height: 45px;">
                        {{ review.user?.fullName?.charAt(0).toUpperCase() || 'U' }}
                      </div>
                      <div class="overflow-hidden">
                        <div class="fw-bold text-dark fs-6 mb-1 text-truncate">{{ review.user?.fullName || 'Khách vãng lai' }}</div>
                        <div class="text-muted small text-truncate mb-2"><i class="bi bi-envelope me-1"></i>{{ review.user?.email || 'N/A' }}</div>
                        <div class="text-truncate small fst-italic text-dark bg-light px-2 py-1 rounded border cursor-pointer hover-brand" :title="review.comment" @click="openQuickView(review)">
                           "{{ review.comment || 'Không có bình luận' }}"
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 overflow-hidden">
                    <div v-if="review.product">
                        <span class="badge bg-info text-white fw-semibold mb-1"><i class="bi bi-gem me-1"></i>Sản phẩm</span>
                        <div class="fw-bold text-dark small text-truncate cursor-pointer hover-brand" title="Xem chi tiết" @click="openQuickView(review)">{{ review.product.name }}</div>
                    </div>
                    <div v-else-if="review.combo">
                        <span class="badge bg-primary text-white fw-semibold mb-1"><i class="bi bi-stars me-1"></i>Combo</span>
                        <div class="fw-bold text-dark small text-truncate cursor-pointer hover-brand" title="Xem chi tiết" @click="openQuickView(review)">{{ review.combo.name }}</div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <div class="text-warning fs-6 mb-1">
                      <i v-for="n in 5" :key="n" class="bi" :class="n <= review.rating ? 'bi-star-fill' : 'bi-star'"></i>
                    </div>
                    <div class="small text-muted fw-semibold">{{ formatDate(review.created_at) }}</div>
                  </td>

                  <td class="px-4">
                    <div class="d-flex flex-column align-items-start" style="width: max-content; margin: 0 auto;">
                      <div class="d-flex align-items-center gap-1 flex-nowrap w-100">
                        <select class="form-select form-select-sm border shadow-sm fw-semibold cursor-pointer flex-shrink-0" 
                                style="width: 120px; font-size: 0.8rem; border-color: #ced4da !important;"
                                :class="getStatusSelectClass(review.localStatus || review.status)"
                                v-model="review.localStatus"
                                @change="checkStatusChange(review)"
                                :disabled="review.isUpdatingStatus">
                          <option value="pending" :hidden="!canTransitionTo(review.status, 'pending')">Chờ duyệt</option>
                          <option value="approved" :hidden="!canTransitionTo(review.status, 'approved')">Đã duyệt</option>
                          <option value="hidden" :hidden="!canTransitionTo(review.status, 'hidden')">Đã ẩn</option>
                        </select>
                        
                        <div class="d-flex align-items-center justify-content-start" style="min-width: 55px; height: 28px; flex-shrink: 0 !important;">
                          <div v-if="review.isUpdatingStatus" class="spinner-border text-brand ms-1" style="width: 1.25rem; height: 1.25rem; border-width: 0.15em; flex-shrink: 0 !important;" role="status"></div>
                          <template v-else-if="review.isStatusChanged">
                            <button @click="saveReviewStatus(review)" class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0; flex-shrink: 0 !important;" title="Lưu">
                              <i class="bi bi-check-lg fw-bold" style="font-size: 0.7rem;"></i>
                            </button>
                            <button @click="cancelStatusChange(review)" class="btn btn-sm btn-light rounded-circle shadow-sm text-danger border d-flex align-items-center justify-content-center ms-1" style="width: 24px; height: 24px; padding: 0; flex-shrink: 0 !important;" title="Hủy">
                              <i class="bi bi-x-lg fw-bold" style="font-size: 0.7rem;"></i>
                            </button>
                          </template>
                        </div>
                      </div>
                      <div v-if="review.admin_reply" class="mt-1 ms-1 text-success small fw-bold d-flex align-items-center">
                          <i class="bi bi-check-circle-fill me-1"></i> Đã phản hồi
                      </div>
                    </div>
                  </td>

                  <td class="px-4 text-center">
                    <button class="btn btn-sm btn-light text-brand shadow-sm border me-2 fw-bold" title="Xem chi tiết & Phản hồi" @click="openQuickView(review)">
                      <i class="bi bi-reply-fill me-1"></i> Phản hồi
                    </button>
                    <button class="btn btn-sm btn-light text-danger shadow-sm border" @click="confirmDelete(review.id)" title="Xóa vĩnh viễn">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="pagination.last_page > 1 && !isTableLoading">
        <span class="text-muted small">Hiển thị trang {{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <nav>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }"><button class="page-link text-brand" @click="fetchData(pagination.current_page - 1, true)"><i class="bi bi-chevron-left"></i></button></li>
            <li class="page-item" v-for="page in pagination.last_page" :key="page" :class="{ active: pagination.current_page === page }"><button class="page-link" :class="pagination.current_page === page ? 'bg-brand border-brand text-white' : 'text-dark'" @click="fetchData(page, true)">{{ page }}</button></li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }"><button class="page-link text-brand" @click="fetchData(pagination.current_page + 1, true)"><i class="bi bi-chevron-right"></i></button></li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- MODAL PHẢN HỒI ĐÁNH GIÁ & THÔNG TIN SẢN PHẨM (QUICK VIEW) -->
    <div class="modal fade" id="quickViewReviewModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          <div class="modal-header border-bottom pb-3 bg-light">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-chat-quote-fill text-brand me-2"></i>Chi Tiết & Phản Hồi Đánh Giá</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-0 bg-light custom-scrollbar-y" style="max-height: 80vh; overflow-y: auto;" v-if="selectedReview">
            
            <div class="row g-0">
              <!-- Cột Trái: Thông tin Đánh giá & Phản hồi (Đã thu gọn thành Col 5) -->
              <div class="col-lg-5 bg-white p-4 border-end">
                <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
                  <div class="bg-secondary bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold border shadow-sm fs-4" style="width: 50px; height: 50px;">
                    {{ selectedReview.user?.fullName?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <h5 class="fw-bold text-dark mb-1">{{ selectedReview.user?.fullName || 'Khách vãng lai' }}</h5>
                    <div class="text-muted small">{{ selectedReview.user?.email || 'N/A' }}</div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                     <div class="text-warning fs-5">
                       <i v-for="n in 5" :key="n" class="bi" :class="n <= selectedReview.rating ? 'bi-star-fill' : 'bi-star'"></i>
                     </div>
                     <span class="badge" :class="getStatusBadgeClass(selectedReview.status)">{{ getStatusText(selectedReview.status) }}</span>
                  </div>
                  <p class="text-muted small mb-3"><i class="bi bi-clock me-1"></i> {{ formatDateTime(selectedReview.created_at) }}</p>
                  
                  <div class="p-3 bg-light border border-light-subtle rounded small text-dark fst-italic lh-base">
                    "{{ selectedReview.comment || 'Khách hàng không để lại nhận xét.' }}"
                  </div>

                  <div v-if="selectedReview.images && selectedReview.images.length" class="mt-3 d-flex gap-2 flex-wrap">
                    <img v-for="(img, idx) in selectedReview.images" :key="idx" :src="img" class="rounded border shadow-sm object-fit-cover cursor-pointer hover-brand" style="width: 70px; height: 70px;">
                  </div>
                </div>

                <div class="border-top border-light-subtle pt-4 mt-4">
                  <h6 class="fw-bold text-dark mb-3 text-uppercase small"><i class="bi bi-reply-fill text-brand me-2"></i>Cửa hàng phản hồi</h6>
                  <textarea class="form-control border-light-subtle rounded-3 shadow-sm bg-light" rows="5" 
                            v-model="editForm.admin_reply" 
                            placeholder="Nhập nội dung phản hồi, cảm ơn hoặc xin lỗi khách hàng..."
                            :class="{'is-invalid': errors.admin_reply}"></textarea>
                  <div class="invalid-feedback" v-if="errors.admin_reply">{{ errors.admin_reply[0] }}</div>
                </div>
              </div>

              <!-- Cột Phải: Cấu hình chi tiết Sản Phẩm/Combo được đánh giá -->
              <div class="col-lg-7 bg-light">
                <div v-if="isFetchingDetail" class="d-flex flex-column justify-content-center align-items-center h-100 p-5 text-muted">
                    <div class="spinner-border text-brand mb-3" role="status"></div>
                    <span class="small fw-semibold text-uppercase tracking-widest">Đang truy xuất thông tin...</span>
                </div>

                <div v-else-if="selectedItemDetail && selectedItemType === 'product'" class="p-0">
                  <div class="bg-white p-4 border-bottom">
                    <div class="row align-items-center g-4">
                      <div class="col-md-3 text-center">
                        <div class="position-relative d-inline-block shadow-sm border rounded-4 overflow-hidden p-1 bg-light">
                          <img :src="getThumbnail(selectedItemDetail.thumbnail_image)" class="w-100 h-100 object-fit-cover rounded-3" style="aspect-ratio: 1/1;">
                        </div>
                      </div>
                      
                      <div class="col-md-9">
                        <h4 class="fw-bold text-dark mb-1">{{ selectedItemDetail.name }}</h4>
                        <p class="text-muted mb-3 font-monospace small"><i class="bi bi-link-45deg"></i> /{{ selectedItemDetail.slug }}</p>
                        
                        <div class="row g-3 mb-3">
                          <div class="col-sm-6">
                            <div class="p-2 bg-light rounded border border-light-subtle h-100 text-center">
                              <small class="text-muted d-block text-uppercase fw-bold mb-1" style="font-size: 0.65rem;">Giá Tham Khảo</small>
                              <strong class="fs-6 text-success">{{ formatCurrency(selectedItemDetail.base_price) }}</strong>
                            </div>
                          </div>
                          <div class="col-sm-6">
                            <div class="p-2 bg-light rounded border border-light-subtle h-100 text-center">
                              <small class="text-muted d-block text-uppercase fw-bold mb-1" style="font-size: 0.65rem;">Tổng Kho (Hệ thống)</small>
                              <strong class="fs-6 text-primary">{{ selectedItemDetail.total_stock || 0 }} SP</strong>
                            </div>
                          </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2">
                          <span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">
                            <i class="bi bi-folder2-open me-1"></i> {{ selectedItemDetail.category?.name || 'Không có danh mục' }}
                          </span>
                          <span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">
                            <i class="bi bi-award me-1"></i> {{ selectedItemDetail.brand?.name || 'No Brand' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="p-4">
                    <h6 class="fw-bold text-dark mb-3 text-uppercase small"><i class="bi bi-boxes text-brand me-2"></i>Danh sách Phân loại (Biến thể)</h6>
                    <div v-if="!selectedItemDetail.variants || selectedItemDetail.variants.length === 0" class="text-center py-4 bg-white border rounded small text-muted">
                       Sản phẩm chưa cấu hình biến thể.
                    </div>
                    <div v-else class="table-responsive bg-white rounded border shadow-sm custom-scrollbar-x" style="max-height: 250px;">
                      <table class="table table-hover align-middle mb-0 text-nowrap small">
                        <thead class="table-light sticky-top">
                          <tr>
                            <th class="px-3 py-2 text-secondary fw-bold" style="width: 50px;">Ảnh</th>
                            <th class="px-3 py-2 text-secondary fw-bold">Mã SKU</th>
                            <th class="px-3 py-2 text-secondary fw-bold">Thuộc tính</th>
                            <th class="px-3 py-2 text-secondary fw-bold text-end">Giá Niêm yết</th>
                            <th class="px-3 py-2 text-secondary fw-bold text-center">Kho</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="v in selectedItemDetail.variants" :key="v.id">
                            <td class="px-3 py-2"><img :src="getThumbnail(v.image_url)" class="rounded border object-fit-cover shadow-sm bg-white" style="width: 35px; height: 35px;"></td>
                            <td class="px-3 font-monospace fw-bold text-dark">{{ v.sku }}</td>
                            <td class="px-3">
                              <div class="d-flex flex-wrap gap-1">
                                <span v-for="(val, key) in v.attributes" :key="key" class="badge bg-light text-dark border border-secondary-subtle">
                                    <span class="text-muted fw-normal me-1">{{ getAttributeName(key) }}:</span>
                                    <span class="fw-bold">{{ getAttributeValueName(key, val) }}</span>
                                </span>
                              </div>
                            </td>
                            <td class="px-3 text-end"><span class="fw-semibold text-success">{{ formatCurrency(v.price) }}</span></td>
                            <td class="px-3 text-center"><span class="badge" :class="v.stock_quantity > 0 ? 'bg-success' : 'bg-danger'">{{ v.stock_quantity }}</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div v-else-if="selectedItemDetail && selectedItemType === 'combo'" class="p-0">
                  <div class="bg-white p-4 border-bottom">
                    <div class="d-flex align-items-center gap-3">
                       <div class="position-relative d-inline-block shadow-sm border rounded-4 overflow-hidden p-1 bg-light" style="width: 90px; height: 90px; flex-shrink: 0;">
                         <img :src="getThumbnail(selectedItemDetail.thumbnail_image)" class="w-100 h-100 object-fit-cover rounded-3">
                       </div>
                       <div>
                         <span class="badge bg-primary text-white mb-2"><i class="bi bi-stars me-1"></i>Combo Đặc Quyền</span>
                         <h4 class="fw-bold text-dark mb-1 fs-5">{{ selectedItemDetail.name }}</h4>
                         <p class="text-muted mb-2 font-monospace small"><i class="bi bi-link-45deg"></i> /{{ selectedItemDetail.slug }}</p>
                         <div class="text-danger fw-bold small">Giảm: {{ selectedItemDetail.discount_type === 'percentage' ? selectedItemDetail.discount_value + '%' : formatCurrency(selectedItemDetail.discount_value) }}</div>
                       </div>
                    </div>
                  </div>
                  <div class="p-4">
                     <h6 class="fw-bold text-dark mb-3 text-uppercase small"><i class="bi bi-box-seam text-brand me-2"></i>Sản phẩm trong Combo</h6>
                     <div class="bg-white border rounded shadow-sm">
                       <div v-for="(item, idx) in selectedItemDetail.items" :key="item.id" class="d-flex align-items-center gap-3 p-3" :class="{'border-bottom border-light-subtle': idx < selectedItemDetail.items.length - 1}">
                          <img :src="getThumbnail(item.product?.thumbnail_image)" class="rounded border object-fit-cover shadow-sm bg-white flex-shrink-0" style="width: 50px; height: 50px;">
                          <div>
                            <div class="fw-bold text-dark fs-6">{{ item.product?.name }}</div>
                            <div class="small text-muted mt-1">
                              <span v-if="!item.product_variant_id"><i class="bi bi-sliders me-1"></i>Khách hàng tự chọn phân loại</span>
                              <span v-else class="badge bg-light text-dark border"><i class="bi bi-pin-angle-fill text-brand me-1"></i>Phiên bản cố định</span>
                            </div>
                          </div>
                          <div class="ms-auto fs-5 fw-bold text-brand">x{{ item.quantity }}</div>
                       </div>
                     </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div class="modal-footer bg-white border-top py-3 d-flex justify-content-between">
             <button type="button" class="btn btn-outline-brand rounded-pill px-4 fw-bold" data-bs-dismiss="modal">Hủy bỏ</button>
             <button type="button" class="btn btn-brand rounded-pill px-5 fw-bold shadow-sm" @click="saveReviewReply" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-send-fill me-1"></i> Lưu Thay Đổi
             </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getFullImage } from '@/composables/useUtilities';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || API_URL.replace(/\/api\/?$/, '');

const route = useRoute();
const router = useRouter();
const reviews = ref([]);
const systemModules = ref([]); 
const systemAttributes = ref([]); // Thêm ref để chứa thuộc tính hệ thống

const isFirstLoad = ref(true);
const isTableLoading = ref(false);
const isSilentLoading = ref(false);
const isSaving = ref(false);

const searchQuery = ref('');
const activeTab = ref('all');
const filters = ref({ rating: '' });
const currentPageLevel = ref(null);

const pagination = ref({ current_page: 1, last_page: 1, total: 0 });
const statusCounts = ref({ all: 0, pending: 0, approved: 0, hidden: 0 });

const selectedReview = ref(null);
let quickViewModalInstance = null;
let isUnmounted = false;

const editForm = ref({ admin_reply: '' });
const errors = ref({});

const tabCache = ref({});

// Logic cho QuickView Details
const isFetchingDetail = ref(false);
const selectedItemDetail = ref(null);
const selectedItemType = ref(''); // 'product' or 'combo'

// Logic chặn chuyển trạng thái ngược
const allowedTransitions = {
    'pending': ['pending', 'approved', 'hidden'],
    'approved': ['approved', 'hidden'], 
    'hidden': ['hidden', 'approved', 'pending'] 
};

const canTransitionTo = (currentStatus, targetStatus) => {
    return allowedTransitions[currentStatus]?.includes(targetStatus);
};

onBeforeUnmount(() => {
  isUnmounted = true;
  if (quickViewModalInstance) quickViewModalInstance.hide();
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.className = '';
  document.body.style = '';
});

const getHeaders = () => ({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (val) => { 
  if (val === null || val === undefined || val === '' || isNaN(val)) return '---'; 
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val); 
};

const getThumbnail = (url) => { 
    if (url) return getFullImage(url); 
    return 'https://placehold.co/150x150/e0e0e0/6c757d?text=No+Image'; 
};

const getAttributeName = (attrId) => {
    const a = systemAttributes.value.find(x => x.id == attrId);
    return a ? a.name : `Attr_${attrId}`;
};

const getAttributeValueName = (attrId, valId) => {
    const a = systemAttributes.value.find(x => x.id == attrId);
    if(a && a.values) {
        const v = a.values.find(x => x.id == valId);
        return v ? v.value : `Val_${valId}`;
    }
    return `Val_${valId}`;
};

const getLevelColor = (level) => {
  if(!level) return 'bg-secondary';
  const l = parseInt(level);
  switch (l) {
    case 1: return 'bg-danger text-white border-danger shadow-sm';        
    case 2: return 'bg-warning text-dark border-warning';                  
    case 3: return 'bg-info text-dark border-info';                        
    case 4: return 'bg-primary bg-opacity-10 text-primary border-primary'; 
    case 5: return 'bg-success bg-opacity-10 text-success border-success'; 
    default: return 'bg-light text-secondary border-secondary'; 
  }
};

const checkStatusChange = (review) => {
  review.isStatusChanged = (review.localStatus !== review.status);
};

const cancelStatusChange = (review) => {
  review.localStatus = review.status; 
  review.isStatusChanged = false;
};

const getStatusSelectClass = (status) => {
  const map = { 
    'pending': 'text-warning border-warning bg-warning bg-opacity-10', 
    'approved': 'text-success border-success bg-success bg-opacity-10', 
    'hidden': 'text-secondary border-secondary bg-secondary bg-opacity-10'
  }; 
  return map[status] || 'bg-light text-secondary'; 
};

const getStatusText = (status) => {
  const map = { 'pending': 'Chờ duyệt', 'approved': 'Đã duyệt', 'hidden': 'Đã ẩn' };
  return map[status] || status;
};

const getStatusBadgeClass = (status) => {
  const map = { 
    'pending': 'bg-warning text-dark shadow-sm', 
    'approved': 'bg-success text-white shadow-sm', 
    'hidden': 'bg-secondary text-white shadow-sm'
  }; 
  return map[status] || 'bg-light text-dark'; 
};

const fetchAttributes = async () => {
    try {
        const res = await axios.get(`${API_URL}/admin/attributes`, { headers: getHeaders() });
        systemAttributes.value = Array.isArray(res.data.data) ? res.data.data : [];
    } catch(e) {}
};

const fetchCounts = async () => {
    try {
        const statuses = ['all', 'pending', 'approved', 'hidden'];
        const requests = statuses.map(status => {
            let url = `${API_URL}/admin/reviews?page=1`;
            if (status !== 'all') url += `&status=${status}`;
            return axios.get(url, { headers: getHeaders() }).then(res => res.data);
        });

        const results = await Promise.all(requests);
        statuses.forEach((status, index) => {
            if (results[index] && results[index].data) {
                statusCounts.value[status] = results[index].data.total;
            }
        });
    } catch (e) { console.error(e); }
};

const fetchData = async (page = 1, silent = false) => {
  const cacheKey = `${activeTab.value}_${page}_${filters.value.rating}_${searchQuery.value}`;

  if (tabCache.value[cacheKey]) {
      reviews.value = tabCache.value[cacheKey].data;
      pagination.value = tabCache.value[cacheKey].pagination;
      isSilentLoading.value = true;
  } else {
      if (silent) isSilentLoading.value = true;
      else if (!isFirstLoad.value) isTableLoading.value = true;
  }
  
  try {
    let queryParams = new URLSearchParams({ page });
    if (activeTab.value !== 'all') queryParams.append('status', activeTab.value);
    if (filters.value.rating) queryParams.append('rating', filters.value.rating);

    const [resReviews, resModules] = await Promise.all([
      axios.get(`${API_URL}/admin/reviews?${queryParams.toString()}`, { headers: getHeaders() }),
      axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() })
    ]);
    
    if (isUnmounted) return;

    const sysModules = resModules.data.data;
    const currentModule = sysModules.find(m => m.module_code === (route.meta.moduleCode || 'admin_reviews'));
    if (currentModule) currentPageLevel.value = currentModule.required_level;

    const result = resReviews.data;
    const dataPayload = result.data.data ? result.data.data : result.data; 
    
    const mappedReviews = dataPayload.map(r => ({
      ...r,
      localStatus: r.status, 
      isStatusChanged: false,
      isUpdatingStatus: false
    }));

    const newPagination = result.data.last_page ? {
        current_page: result.data.current_page,
        last_page: result.data.last_page,
        total: result.data.total
    } : pagination.value;

    reviews.value = mappedReviews;
    pagination.value = newPagination;
    tabCache.value[cacheKey] = { data: mappedReviews, pagination: newPagination };

  } catch (err) {
      console.error('Lỗi Axios Load Data:', err);
  } finally { 
    if(!isUnmounted) {
      isFirstLoad.value = false;
      isTableLoading.value = false;
      isSilentLoading.value = false;
    }
  }
};

const switchTab = (tabId) => { 
    activeTab.value = tabId; 
    fetchData(1, true); 
};

const openQuickView = async (review) => {
  selectedReview.value = review;
  editForm.value.admin_reply = review.admin_reply || '';
  errors.value = {};
  selectedItemDetail.value = null;
  selectedItemType.value = review.product ? 'product' : 'combo';

  if(!quickViewModalInstance) quickViewModalInstance = new window.bootstrap.Modal(document.getElementById('quickViewReviewModal'));
  quickViewModalInstance.show();

  // Gọi API lấy dữ liệu chi tiết Sản phẩm/Combo
  isFetchingDetail.value = true;
  try {
      const endpoint = review.product 
          ? `${API_URL}/admin/products/${review.product.id}`
          : `${API_URL}/admin/combos/${review.combo.id}`;
      
      const res = await axios.get(endpoint, { headers: getHeaders() });
      
      let detailData = res.data.data;
      if (review.product && detailData.variants) {
          detailData.variants = detailData.variants.map(v => {
              if (typeof v.attributes === 'string') {
                  try { v.attributes = JSON.parse(v.attributes); } catch(e) {}
              }
              return v;
          });
      }
      selectedItemDetail.value = detailData;
  } catch (e) {
      console.error("Lỗi lấy chi tiết mục đánh giá:", e);
  } finally {
      isFetchingDetail.value = false;
  }
};

const saveReviewStatus = async (review) => {
  review.isUpdatingStatus = true;
  try {
    await axios.put(`${API_URL}/admin/reviews/${review.id}`, {
      status: review.localStatus,
      admin_reply: review.admin_reply
    }, { headers: getHeaders() });
    
    review.status = review.localStatus; 
    review.isStatusChanged = false;
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật trạng thái thành công', showConfirmButton: false, timer: 1500 });
    
    tabCache.value = {}; 
    fetchCounts();
  } catch (error) { 
    cancelStatusChange(review); 
    let errorMsg = 'Không thể cập nhật trạng thái';
    if (error.response?.data?.errors?.status) errorMsg = error.response.data.errors.status[0];
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: errorMsg, showConfirmButton: false, timer: 2000 });
  } finally { 
    review.isUpdatingStatus = false; 
  }
};

const saveReviewReply = async () => {
  isSaving.value = true;
  errors.value = {};
  
  // Khi ở trong Modal (chỉnh sửa status từ dropdown của Modal nếu có, hoặc chỉ lưu reply)
  // Ở đây Modal không có chọn dropdown status, nên lấy từ selectedReview.status
  try {
    await axios.put(`${API_URL}/admin/reviews/${selectedReview.value.id}`, {
      status: selectedReview.value.status,
      admin_reply: editForm.value.admin_reply
    }, { headers: getHeaders() });
    
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã lưu phản hồi', showConfirmButton: false, timer: 1500 });
    quickViewModalInstance.hide();
    
    tabCache.value = {};
    fetchData(pagination.value.current_page, true);
  } catch (error) {
    if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors || {};
    } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Không thể lưu phản hồi', showConfirmButton: false, timer: 2000 });
    }
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (id) => {
  Swal.fire({ title: 'Xóa Đánh giá?', text: `Đánh giá này sẽ bị xóa vĩnh viễn!`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Đồng ý xóa' }).then(async (result) => {
    if (result.isConfirmed) {
      isSilentLoading.value = true;
      try {
        await axios.delete(`${API_URL}/admin/reviews/${id}`, { headers: getHeaders() });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa đánh giá', showConfirmButton: false, timer: 1500 });
        
        tabCache.value = {};
        fetchData(pagination.value.current_page, true); 
        fetchCounts();
      } catch(e) {
        Swal.fire('Lỗi', 'Không thể xóa đánh giá', 'error');
        isSilentLoading.value = false;
      }
    }
  });
};

const displayedReviews = computed(() => {
  let result = reviews.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(r => 
        (r.user?.fullName?.toLowerCase().includes(q)) || 
        (r.product?.name?.toLowerCase().includes(q)) ||
        (r.combo?.name?.toLowerCase().includes(q))
    );
  }
  return result;
});

onMounted(() => {
  fetchAttributes(); // Cần load trước để map được tên Thuộc tính
  fetchData(1);
  fetchCounts();
});
</script>

<style scoped>
.custom-tab { font-weight: 600 !important; color: #6c757d; border-bottom: 2px solid transparent !important; margin-bottom: -1px; transition: color 0.2s ease; }
.custom-tab:hover { color: #009981; }
.custom-tab.active-tab { color: #009981 !important; border-bottom: 2px solid #009981 !important; }
.tab-badge { font-size: 0.75rem; font-weight: 600; background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; transition: all 0.2s ease; }
.active-badge { background-color: #e6f5f2 !important; color: #009981 !important; border-color: #009981 !important; }

.logo-shimmer { font-size: 3.5rem; font-weight: 900; letter-spacing: -1.5px; background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: shine 1.5s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }

.bg-brand { background-color: #009981 !important; } .text-brand { color: #009981 !important; } .border-brand { border-color: #009981 !important; }
.btn-brand { background-color: #009981; border: none; transition: 0.2s; color: white;} .btn-brand:hover { background-color: #007a67; color: white;}
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; } .btn-outline-brand:hover { background-color: #009981; color: white; }

.cursor-pointer { cursor: pointer; }
.hover-brand:hover { color: #009981 !important; border-color: #009981 !important; }

.custom-scrollbar-x::-webkit-scrollbar { height: 6px; }
.custom-scrollbar-x::-webkit-scrollbar-track { background: #f8f9fa; }
.custom-scrollbar-x::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #adb5bd; }

.custom-scrollbar-y::-webkit-scrollbar { width: 6px; }
.custom-scrollbar-y::-webkit-scrollbar-track { background: #f8f9fa; }
.custom-scrollbar-y::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
.custom-scrollbar-y::-webkit-scrollbar-thumb:hover { background: #adb5bd; }
</style>