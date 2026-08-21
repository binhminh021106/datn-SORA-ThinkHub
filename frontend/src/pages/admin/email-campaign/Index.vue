<template>
  <div class="email-campaign-page pb-4">
    <!-- MÀN HÌNH CHỜ ĐỘC LẬP (SHIMMER) CHỈ CHẠY 1 LẦN ĐẦU -->
    <div v-if="isPageLoading" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu chiến dịch...</p>
    </div>

    <!-- MÀN HÌNH LỖI KHI LOAD DATA THẤT BẠI -->
    <div v-else-if="pageError" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <i class="bi bi-exclamation-triangle-fill text-danger mb-3" style="font-size: 3rem;"></i>
      <h4 class="fw-bold text-dark mb-2">Tải dữ liệu thất bại</h4>
      <p class="text-muted mb-4">Không thể kết nối với máy chủ để lấy thông tin chiến dịch.</p>
      <button class="btn btn-primary px-4 py-2 fw-bold rounded-3 shadow-sm hover-scale" @click="loadData">
        <i class="bi bi-arrow-clockwise me-2"></i>Thử lại
      </button>
    </div>

    <div class="container-fluid py-3" v-else>
      <!-- Page Header -->
      <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-2 mb-3">
        <div>

          <h4 class="fw-bold text-dark mb-1">Gửi email tự động Lễ & Sinh nhật</h4>
          <p class="text-muted small mb-0">Quản lý chiến dịch, mẫu nội dung và thao tác kiểm tra gửi email cho khách hàng.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
</div>
      </div>

      <!-- Thống kê -->
      <div class="row g-2 mb-3">
        <div class="col-md-4" v-for="item in stats" :key="item.label">
          <div class="metric-card bg-white border shadow-sm">
            <div class="metric-icon" :class="item.iconClass"><i class="bi" :class="item.icon"></i></div>
            <div>
              <div class="text-muted small fw-semibold" style="font-size: 0.8rem;">{{ item.label }}</div>
              <div class="fs-5 fw-bold text-dark">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Tabs Segmented Control -->
      <div class="d-inline-flex bg-white border rounded-3 shadow-sm p-1 mb-3 email-tabs-wrapper">
        <button class="btn btn-sm fw-semibold" :class="{ 'active-tab': activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
          <i class="bi bi-activity me-1"></i> Bảng điều khiển gửi
        </button>
        <button class="btn btn-sm fw-semibold" :class="{ 'active-tab': activeTab === 'holidays' }" @click="activeTab = 'holidays'">
          <i class="bi bi-calendar-heart me-1"></i> Quản lý ngày lễ
        </button>
        <button class="btn btn-sm fw-semibold" :class="{ 'active-tab': activeTab === 'birthday' }" @click="activeTab = 'birthday'">
          <i class="bi bi-balloon-heart me-1"></i> Cấu hình sinh nhật
        </button>
      </div>

      <!-- TAB 1: BẢNG ĐIỀU KHIỂN GỬI -->
      <section v-if="activeTab === 'dashboard'" class="row g-3 align-items-start dashboard-grid">
        <div class="col-xl-4">
          <div class="card border-0 shadow-sm dashboard-action-card">
            <div class="card-header bg-white border-0 pt-3 px-3 pb-0">
              <h6 class="fw-bold mb-1">Bảng điều khiển gửi</h6>
              <p class="text-muted small mb-0" style="font-size: 0.8rem;">Kiểm tra và gửi thủ công theo ngày hiện tại.</p>
            </div>
            <div class="card-body p-3 d-grid gap-2">
              <button
                class="action-button birthday"
                :class="{ 'is-running': sendingCampaign === 'birthday' }"
                :disabled="!!sendingCampaign"
                @click="runBirthdayCampaign"
              >
                <span v-if="sendingCampaign === 'birthday'" class="spinner-border spinner-border-sm d-flex align-items-center justify-content-center m-auto" style="width: 20px; height: 20px;"></span>
                <i v-else class="bi bi-cake2"></i>
                <span>
                  <strong>Kiểm tra & Gửi Sinh Nhật</strong>
                  <small>Quét khách có sinh nhật hôm nay</small>
                </span>
              </button>
              <button
                class="action-button holiday"
                :class="{ 'is-running': sendingCampaign === 'holiday' }"
                :disabled="!!sendingCampaign"
                @click="runHolidayCampaign"
              >
                <span v-if="sendingCampaign === 'holiday'" class="spinner-border spinner-border-sm d-flex align-items-center justify-content-center m-auto" style="width: 20px; height: 20px;"></span>
                <i v-else class="bi bi-calendar2-heart"></i>
                <span>
                  <strong>Kiểm tra & Gửi Sự Kiện</strong>
                  <small>Quét sự kiện đang bật hôm nay</small>
                </span>
              </button>
              <div class="today-box mt-2">
                <i class="bi bi-clock-history text-brand fs-4"></i>
                <div>
                  <div class="text-muted small fw-semibold" style="font-size: 0.75rem;">Ngày hệ thống</div>
                  <div class="fw-bold fs-6">{{ todayLabel }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <h6 class="fw-bold mb-0">Lịch sử gửi gần nhất</h6>
              <button class="btn btn-sm btn-light border fw-semibold" @click="clearLogs">
                <i class="bi bi-eraser me-1"></i> Xóa lịch sử
              </button>
            </div>
            <div class="card-body p-0 mt-2 border-top">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 log-table text-sm">
                  <thead class="bg-light">
                    <tr>
                      <th class="px-3 py-2 small text-secondary">Thời gian</th>
                      <th class="px-3 py-2 small text-secondary">Loại sự kiện</th>
                      <th class="px-3 py-2 small text-secondary">Người nhận</th>
                      <th class="px-3 py-2 small text-secondary">Voucher</th>
                      <th class="px-3 py-2 text-center small text-secondary">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="emailLogs.length === 0">
                      <td colspan="5" class="text-center text-muted py-4 small">Chưa có log gửi email.</td>
                    </tr>
                    <tr v-for="log in emailLogs" :key="log.id">
                      <td class="px-3 py-2 small fw-semibold">{{ formatDateTime(log.sent_at || log.queued_at) }}</td>
                      <td class="px-3 py-2">
                        <span class="event-type-badge badge bg-secondary bg-opacity-10 text-secondary border">
                          {{ formatEventType(log.event_type) }}
                        </span>
                      </td>
                      <td class="px-3 py-2 recipient-cell">
                        <div class="recipient-name">{{ log.user?.name || 'N/A' }}</div>
                        <div class="recipient-email">{{ log.user?.email || 'N/A' }}</div>
                      </td>
                      <td class="px-3 py-2">
                        <span class="text-muted" style="font-size: 0.75rem;">Theo sự kiện</span>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span class="badge" :class="emailStatusClass(log.status)" :title="log.error_message || ''">
                          {{ emailStatusLabel(log.status) }}
                        </span>
                        <div v-if="log.error_message" class="small text-danger mt-1" :title="log.error_message">
                          {{ log.error_message }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: QUẢN LÝ NGÀY LỄ (Danh sách) -->
      <section v-else-if="activeTab === 'holidays'" class="row g-3 fade-in">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <h6 class="fw-bold mb-0">Danh sách ngày lễ</h6>
              <div class="d-flex align-items-center gap-2">
                <div class="search-box position-relative">
                  <input v-model.trim="holidaySearch" type="text" class="form-control form-control-sm rounded-pill pe-5 bg-light border-0" placeholder="Tìm tên hoặc mã voucher...">
                  <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style="font-size: 0.85rem;"></i>
                </div>
                <button class="btn btn-sm btn-brand text-white fw-bold px-3 py-1" @click="goToCreate">
                  <i class="bi bi-plus-lg me-1"></i> Thêm sự kiện
                </button>
              </div>
            </div>
            <div class="card-body p-0 mt-2 border-top">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 holiday-table text-sm">
                  <thead class="bg-light">
                    <tr>
                      <th class="px-3 py-2 small text-secondary">Sự kiện</th>
                      <th class="px-3 py-2 small text-secondary">Ngày diễn ra</th>
                      <th class="px-3 py-2 small text-secondary">Đối tượng</th>
                      <th class="px-3 py-2 small text-secondary">Voucher</th>
                      <th class="px-3 py-2 text-center small text-secondary">Trạng thái <span class="d-none d-xl-inline">(Sửa nhanh)</span></th>
                      <th class="px-3 py-2 text-center small text-secondary">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="filteredHolidays.length === 0">
                      <td colspan="6" class="text-center text-muted py-4 small">
                        <i class="bi bi-inbox fs-3 d-block mb-1 text-light"></i>
                        Chưa có sự kiện phù hợp.
                      </td>
                    </tr>
                    <tr v-for="event in filteredHolidays" :key="event.id">
                      <td class="px-3 py-2">
                        <div class="fw-bold text-dark text-truncate small" :title="event.name">{{ event.name }}</div>
                        <div class="text-muted text-truncate" style="font-size: 0.75rem;" :title="event.email_subject">{{ event.email_subject }}</div>
                      </td>
                      <td class="px-3 py-2 fw-bold font-monospace text-brand small">{{ event.event_date }}</td>
                      <td class="px-3 py-2"><span class="badge bg-light text-dark border fw-normal">{{ targetLabel(event.target_audience) }}</span></td>
                      <td class="px-3 py-2">
                        <span v-if="event.voucher_code" class="badge bg-success bg-opacity-10 text-success border border-success font-monospace">{{ event.voucher_code }}</span>
                        <span v-else class="text-muted" style="font-size: 0.75rem;">Không kèm</span>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <div class="w-100 mx-auto" style="max-width: 130px;">
                          <StatusConfirmSelect
                            v-model="event.localStatus"
                            :originalValue="event.status"
                            :selectClass="(event.localStatus || event.status) === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-warning border-warning bg-warning bg-opacity-10'"
                            :isUpdating="event.isUpdatingStatus"
                            @confirm="saveHolidayStatus(event)"
                            @cancel="cancelStatusChange(event)"
                          >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm dừng</option>
                          </StatusConfirmSelect>
                        </div>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <button class="btn btn-sm btn-light border text-primary me-1 py-0 px-2" title="Sửa" @click="goToEdit(event)"><i class="bi bi-pencil-square" style="font-size: 0.85rem;"></i></button>
                        <button class="btn btn-sm btn-light border text-danger py-0 px-2" title="Xóa" @click="deleteHoliday(event)"><i class="bi bi-trash" style="font-size: 0.85rem;"></i></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: CẤU HÌNH SINH NHẬT -->
      <section v-else-if="activeTab === 'birthday'" class="row g-3 fade-in">
        <div class="col-xl-12">
          <div class="card border-0 shadow-sm form-card h-100">
            <div class="card-header bg-white border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-start gap-2">
              <div>
                <h6 class="fw-bold mb-1">Cấu hình email sinh nhật</h6>
                <p class="text-muted mb-0" style="font-size: 0.75rem;">Mẫu này dùng cho khách có ngày sinh trùng ngày hệ thống kiểm tra.</p>
              </div>
              <div class="form-check form-switch mb-0" title="Bật/Tắt tự động gửi">
                <input v-model="birthdaySettings.enabled" class="form-check-input cursor-pointer" type="checkbox">
              </div>
            </div>
            <div class="card-body p-3">
              <div class="form-floating mb-3">
                <input v-model.trim="birthdaySettings.subject" type="text" class="form-control bg-light border-0" id="bdaySubject" placeholder="Tiêu đề mẫu email">
                <label for="bdaySubject" class="fw-semibold text-dark">Tiêu đề mẫu email <span class="text-danger">*</span></label>
              </div>
              
              <!-- SECTION MỚI: QUÀ TẶNG THEO HẠNG THÀNH VIÊN -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark small mb-2">Quà tặng theo hạng thành viên</label>
               <div :class="getTierClass(tier.name)" class="rounded-2 p-3 mb-3 shadow-sm border" v-for="(tier, index) in birthdaySettings.tiers" :key="tier.tier_id">
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary-subtle">
                  <span class="fw-bold text-dark"><i :class="getTierIcon(tier.name)" class="me-1"></i> {{ tier.name }}</span>
                  
                  <!-- Công tắc Trạng thái (Active/Inactive) -->
                  <div class="form-check form-switch m-0">
                    <input v-model="tier.status" class="form-check-input cursor-pointer" type="checkbox" true-value="active" false-value="inactive" title="Bật/Tắt quà cho hạng này">
                  </div>
                </div>

                <div class="row g-2" v-if="tier.status === 'active'">
                  <!-- Dữ liệu cơ bản -->
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input v-model.trim="tier.voucherCode" type="text" class="form-control text-uppercase fw-bold border-brand-focus" :id="'vc_' + tier.tier_id" placeholder="VD: BDAY2024">
                      <label :for="'vc_' + tier.tier_id" class="text-muted fw-semibold">Mã Voucher <span class="text-danger">*</span></label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating">
                      <select v-model="tier.type" class="form-select border-brand-focus" :id="'type_' + tier.tier_id">
                        <option value="fixed">VNĐ</option>
                        <option value="percentage">%</option>
                      </select>
                      <label :for="'type_' + tier.tier_id" class="text-muted fw-semibold">Loại giảm</label>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-floating">
                      <input v-model.number="tier.value" type="number" class="form-control border-brand-focus" :id="'val_' + tier.tier_id" placeholder="0">
                      <label :for="'val_' + tier.tier_id" class="text-muted fw-semibold">Mức giảm <span class="text-danger">*</span></label>
                    </div>
                  </div>

                  <!-- Hạn mức và Hạn sử dụng -->
                  <div class="col-md-4 mt-2">
                    <div class="form-floating">
                      <input :value="formatCurrency(tier.min_spend)" @input="handleMinSpendInput($event, tier)" type="text" class="form-control border-brand-focus" :id="'min_' + tier.tier_id" placeholder="0">
                      <label :for="'min_' + tier.tier_id" class="text-muted fw-semibold">Đơn tối thiểu</label>
                    </div>
                  </div>
                  <div class="col-md-4 mt-2">
                    <div class="form-floating">
                      <input v-model.number="tier.usage_limit_per_user" type="number" class="form-control border-brand-focus" :id="'use_' + tier.tier_id" placeholder="1">
                      <label :for="'use_' + tier.tier_id" class="text-muted fw-semibold">Lượt dùng/Khách</label>
                    </div>
                  </div>
                  <div class="col-md-4 mt-2">
                    <div class="form-floating">
                      <input v-model.number="tier.validity_days" type="number" class="form-control border-brand-focus" :id="'valdays_' + tier.tier_id" placeholder="Tính từ ngày gửi">
                      <label :for="'valdays_' + tier.tier_id" class="text-muted fw-semibold">Hạn sử dụng (Ngày)</label>
                    </div>
                  </div>
                  <div class="col-md-12 mt-2 d-none">
                     <!-- Ẩn trường này đi vì sinh nhật thường không giới hạn tổng lượt phát -->
                    <input type="hidden" v-model.number="tier.usage_limit">
                  </div>
                </div>
              </div>
              </div>




              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <label class="form-label fw-semibold text-dark small mb-0">Nội dung email chung <span class="text-danger">*</span></label>
                  <div class="text-brand fw-semibold cursor-pointer" style="font-size: 0.75rem;" @click="insertToken('birthday', '[Tên_Khách_Hàng]')">
                    <i class="bi bi-plus-circle me-1"></i>Chèn Tên
                  </div>
                </div>
                
                <div class="custom-editor-wrapper border rounded-2 overflow-hidden bg-white">
                  <div class="editor-toolbar bg-light border-bottom px-2 py-1 d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-white border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn mã voucher" @click="insertToken('birthday', '[Voucher_Code]')">
                      <i class="bi bi-ticket-perforated text-brand me-1"></i> [Voucher_Code]
                    </button>
                  </div>
                  <QuillEditor v-model:content="birthdaySettings.content" contentType="html" toolbar="full" theme="snow" class="bg-white" style="min-height: 200px;"/>
                </div>
              </div>

              <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                <div class="status-indicator d-flex align-items-center gap-1" :class="birthdaySettings.enabled ? 'text-success' : 'text-warning'">
                  <i class="bi" :class="birthdaySettings.enabled ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'"></i>
                  <span class="fw-semibold" style="font-size: 0.8rem;">{{ birthdaySettings.enabled ? 'Hệ thống Đang bật tự động' : 'Hệ thống Đang tắt' }}</span>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-light border fw-bold px-3 shadow-sm" @click="showPreviewModal = true">
                    <i class="bi bi-eye me-1"></i> Xem trước
                  </button>
                  <button class="btn btn-sm btn-brand text-white fw-bold px-3 shadow-sm" @click="saveBirthdaySettings">
                    <i class="bi bi-floppy me-1"></i> Lưu cấu hình
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MODAL XEM TRƯỚC EMAIL -->
      <div v-if="showPreviewModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8); z-index: 1055" @click="showPreviewModal = false" @keydown.esc="showPreviewModal = false">
        <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
          <div class="modal-content bg-transparent border-0">
            <div class="modal-header border-0 pb-0 justify-content-end">
              <button type="button" class="btn-close btn-close-white" @click="showPreviewModal = false"></button>
            </div>
            <div class="modal-body pt-0">
              <div class="card border-0 shadow-sm preview-card-bg w-100">
            <div class="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-end">
              <div>
                <h6 class="fw-bold mb-1 text-dark">Xem trước email hiển thị</h6>
                <p class="text-muted small mb-0" style="font-size: 0.75rem;">Dựa trên dữ liệu của một khách hàng mẫu.</p>
              </div>
             <select v-model="previewTierId" class="form-select form-select-sm bg-white" style="width: auto; font-size: 0.75rem;">
  <option v-for="tier in birthdaySettings.tiers" :key="tier.tier_id" :value="tier.tier_id">
    Xem theo: {{ tier.name }}
  </option>
</select>
            </div>
            <div class="card-body p-3 d-flex align-items-center justify-content-center">
              
              <!-- SORA Mail App Window Preview -->
              <div class="mail-window-preview shadow-sm w-100">
                <div class="mail-window-header d-flex align-items-center px-2 py-1">
                  <div class="window-dots d-flex gap-1">
                    <span class="dot bg-danger"></span>
                    <span class="dot bg-warning"></span>
                    <span class="dot bg-success"></span>
                  </div>
                  <div class="window-title mx-auto text-muted fw-semibold" style="font-size: 0.7rem;">
                    Thư mới - {{ previewBirthdaySubject }}
                  </div>
                </div>
                <div class="mail-window-body p-3 bg-white">
                  <!-- Nội dung Mail -->
                  <div class="sora-tp-header rounded-top-2">HỆ THỐNG SORA THINKHUB</div>
                  <div class="sora-tp-body border border-top-0 rounded-bottom-2">
                    <div class="sora-tp-banner d-flex align-items-center gap-2">
                      <i class="bi bi-stars text-brand fs-6"></i> 
                      <span>QUÀ TẶNG ĐẶC QUYỀN SINH NHẬT!</span>
                    </div>
                    
                    <div class="sora-tp-content" v-html="previewBirthdayContent"></div>
               <div class="sora-tp-voucher-box p-2 rounded-2 bg-light border" v-if="previewTierData?.voucherCode">
  <table class="sora-tp-table mb-0">
    <tr>
      <td class="text-muted">Mã quà tặng:</td>
      <td class="text-danger fw-bold font-monospace">{{ previewTierData?.voucherCode }}</td>
    </tr>
   <tr>
  <td class="text-muted">Mức ưu đãi:</td>
  <td class="text-dark fw-bold">{{ previewDiscountText }}</td>
</tr>
    <tr>
      <td class="text-muted">Áp dụng:</td>
      <td class="text-dark">Tất cả bộ sưu tập</td>
    </tr>
    <tr>
      <td class="text-muted pb-0 border-0">Hạn sử dụng:</td>
      <td class="text-dark pb-0 border-0 fw-bold">{{ expireBirthdayDateDisplay }}</td>
    </tr>
  </table>
</div>
                    
                    <button class="sora-tp-btn mt-3 w-100 shadow-sm">CHỌN MÓN TRANG SỨC NGAY</button>
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
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'; // THÊM IMPORT watch
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import apiClient from '@/utils/apiClient';
import StatusConfirmSelect from '@/components/admin/StatusConfirmSelect.vue';
import { sanitizeRichHtml } from '@/utils/sanitizeHtml';

const router = useRouter();
const showPreviewModal = ref(false);


const allowedTabs = new Set(['dashboard', 'holidays', 'birthday']);

// HÀM TIỆN ÍCH UI
function getTierClass(name) {
  const n = name.toLowerCase();
  if (n.includes('bạc') || n.includes('silver')) return 'bg-light border-secondary';
  if (n.includes('vàng') || n.includes('gold')) return 'bg-warning-subtle border-warning';
  if (n.includes('kim cương') || n.includes('diamond')) return 'bg-info-subtle border-info';
  // Khách thường
  return 'bg-white border-light-subtle';
}

function getTierIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('bạc') || n.includes('silver')) return 'bi bi-star text-secondary';
  if (n.includes('vàng') || n.includes('gold')) return 'bi bi-star-fill text-warning';
  if (n.includes('kim cương') || n.includes('diamond')) return 'bi bi-gem text-info';
  return 'bi bi-person-fill text-muted';
}

// DÙNG SESSION STORAGE để lưu giữ tab và VALIDATE dữ liệu
const savedTab = sessionStorage.getItem('activeCampaignTab');
const activeTab = ref(allowedTabs.has(savedTab) ? savedTab : 'dashboard');

function formatCurrency(val) {
  if (!val && val !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(val);
}

function handleMinSpendInput(e, tier) {
  const rawValue = e.target.value.toString().replace(/\D/g, '');
  tier.min_spend = rawValue ? parseInt(rawValue, 10) : 0;
  e.target.value = formatCurrency(tier.min_spend);
}

// Bất cứ khi nào bạn đổi tab, nó lưu vào bộ nhớ (kèm theo kiểm tra an toàn)
watch(activeTab, (newVal) => {
  sessionStorage.setItem('activeCampaignTab', allowedTabs.has(newVal) ? newVal : 'dashboard');
});

const sendingCampaign = ref(null);
const holidaySearch = ref('');

const today = new Date();
const todayLabel = computed(() => today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }));

const targetLabels = {
  all: 'Tất cả', female: 'Khách nữ', male: 'Khách nam', vip: 'VIP', member: 'Hạng Thành viên',
  silver: 'Hạng Bạc', gold: 'Hạng Vàng', diamond: 'Hạng Kim cương', regular: 'Khách thường',
};

const holidays = ref([]);
const emailLogs = ref([]);

const birthdaySettings = ref({
  enabled: true,
  subject: '',
  content: 'Xin chào [Tên_Khách_Hàng],\n\nNhân dịp sinh nhật, SORA ThinkHub xin gửi đến bạn lời chúc một tuổi mới thật nhiều niềm vui, hạnh phúc và luôn tỏa sáng theo cách riêng của mình.\n\nCảm ơn bạn đã tin tưởng đồng hành cùng chúng tôi. SORA xin dành tặng bạn một ưu đãi đặc biệt để ngày sinh nhật thêm trọn vẹn và ý nghĩa.',
  tiers: []
});

const sampleCustomers = ref([{ id: 1, name: 'Lê Thị Mỹ Duyên', email: 'myduyen@example.com', gender: 'female', tier: 'diamond' }]);
const previewTierId = ref(null);
const fetchRecentLogs = async () => {
  const res = await apiClient.get('/admin/email-campaign/recent-logs');
  if (res.data?.success) emailLogs.value = res.data.data;
};

const fetchHolidayEvents = async () => {
  const res = await apiClient.get('/admin/holiday-events');
  if (res.data?.success) {
    holidays.value = res.data.data.map(h => ({
      ...h,
      localStatus: h.status,
      isStatusChanged: false,
      isUpdatingStatus: false
    }));
  }
};

const fetchBirthdaySettings = async () => {
  const res = await apiClient.get('/admin/email-campaign/settings');
  if (res.data?.success) {
    birthdaySettings.value.enabled = !!res.data.data.is_auto_birthday;
    birthdaySettings.value.subject = res.data.data.birthday_subject || '';
    birthdaySettings.value.content = res.data.data.birthday_content || '';
    
    // Đổ dữ liệu THẬT TỪ DATABASE vào biến giao diện
    if (res.data.data.tiers && res.data.data.tiers.length > 0) {
      birthdaySettings.value.tiers = res.data.data.tiers.map(tier => ({
        ...tier,
        type: tier.type ?? 'fixed',
      }));
      // Gán hạng mặc định để hiển thị ở màn hình Preview bên phải
      previewTierId.value = res.data.data.tiers[0].tier_id; 
    }
  }
};

const isPageLoading = ref(true);
const pageError = ref(false);

const loadData = async () => {
  isPageLoading.value = true;
  pageError.value = false;
  
  const results = await Promise.allSettled([
    fetchRecentLogs(),
    fetchHolidayEvents(),
    fetchBirthdaySettings()
  ]);

  if (results.some(result => result.status === 'rejected')) {
    pageError.value = true;
  }
  
  isPageLoading.value = false;
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showPreviewModal.value) {
    showPreviewModal.value = false;
  }
};

onMounted(() => {
  loadData();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const filteredHolidays = computed(() => {
  const q = holidaySearch.value.toLowerCase();
  if (!q) return holidays.value;
  return holidays.value.filter((event) =>
    event.name.toLowerCase().includes(q) ||
    event.email_subject.toLowerCase().includes(q) ||
    (event.voucher_code || '').toLowerCase().includes(q)
  );
});

const stats = computed(() => [
  { label: 'Sự kiện đang bật', value: holidays.value.filter((item) => item.status === 'active').length, icon: 'bi-calendar-check', iconClass: 'green' },
  { label: 'Mẫu sinh nhật', value: birthdaySettings.value.enabled ? 'Đang bật' : 'Đang tắt', icon: 'bi-cake2', iconClass: 'pink' },
  { label: 'Log gửi email', value: emailLogs.value.length, icon: 'bi-envelope-check', iconClass: 'blue' },
]);

// Dữ liệu của hạng đang được chọn để xem trước
const previewTierData = computed(() => {
  return birthdaySettings.value.tiers?.find(t => t.tier_id === previewTierId.value) 
    || birthdaySettings.value.tiers?.[0] 
    || { voucherCode: '', type: 'fixed', value: 0, validity_days: 7 };
});

const previewBirthdaySubject = computed(() => {
  return birthdaySettings.value.subject || '[Nhập tiêu đề...]';
});

const previewBirthdayContent = computed(() => {
  let text = birthdaySettings.value.content || '[Nhập nội dung...]';
  
  text = sanitizeRichHtml(text);
             
  text = text.replace(/\[Tên_Khách_Hàng\]/g, '<strong>Lê Thị Mỹ Duyên</strong>');
  
  const vCode = String(previewTierData.value?.voucherCode || 'TIERVANG')
                 .replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#039;');
  text = text.replace(/\[Voucher_Code\]/g, () => `<strong>${vCode}</strong>`);
  
  return text;
});

// Chuyển đổi định dạng tiền tệ hoặc % cho màn hình preview
const previewDiscountText = computed(() => {
  const data = previewTierData.value;
  if (!data?.value) return '...';
  if (data.type === 'percentage') return `${data.value}%`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.value);
});

// Hạn sử dụng động (tính theo số ngày cài đặt, thay vì cộng cứng 3 ngày)
const expireBirthdayDateDisplay = computed(() => {
  const data = previewTierData.value;
  const days = data?.validity_days ? parseInt(data.validity_days) : 7;
  
  const d = new Date();
  d.setDate(d.getDate() + days);
  
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
});

async function runBirthdayCampaign() {
  if (sendingCampaign.value) return;
  if (!birthdaySettings.value.enabled) {
    Swal.fire('Đã tắt tính năng', 'Email sinh nhật đang tắt nên hệ thống bỏ qua.', 'info');
    return;
  }
  sendingCampaign.value = 'birthday';
  try {
    const response = await apiClient.post('/admin/email-campaign/trigger-birthday');
    if (response.data?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: response.data.message || `Đã kiểm tra và gửi email sinh nhật.`, showConfirmButton: false, timer: 3000 });
      await fetchRecentLogs();
    } else { showToast(response.data.message || 'Lỗi khi gửi email sinh nhật.', 'error'); }
  } catch (error) { 
    if (error.response?.status === 429) {
      const msg = error.response?.data?.message;
      showToast(msg === 'Too Many Attempts.' ? 'Thao tác quá nhanh! Vui lòng thử lại sau 1 phút.' : (msg || 'Thao tác quá nhanh! Vui lòng thử lại sau 1 phút.'), 'error');
    } else {
      showToast('Lỗi máy chủ! Không thể gửi email.', 'error'); 
    }
  } finally { sendingCampaign.value = null; }
}

async function runHolidayCampaign() {
  if (sendingCampaign.value) return;
  sendingCampaign.value = 'holiday';
  try {
    const response = await apiClient.post('/admin/email-campaign/trigger-holiday');
    if (response.data?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: response.data.message || `Đã kiểm tra và gửi email sự kiện.`, showConfirmButton: false, timer: 3000 });
      await fetchRecentLogs();
    } else { showToast(response.data.message || 'Lỗi khi gửi email sự kiện.', 'error'); }
  } catch (error) { 
    if (error.response?.status === 429) {
      const msg = error.response?.data?.message;
      showToast(msg === 'Too Many Attempts.' ? 'Thao tác quá nhanh! Vui lòng thử lại sau 1 phút.' : (msg || 'Thao tác quá nhanh! Vui lòng thử lại sau 1 phút.'), 'error');
    } else {
      showToast('Lỗi máy chủ! Không thể gửi email sự kiện.', 'error'); 
    }
  } finally { sendingCampaign.value = null; }
}

async function saveHolidayStatus(event) {
  event.isUpdatingStatus = true;
  try {
    const res = await apiClient.put(`/admin/holiday-events/${event.id}`, { ...event, status: event.localStatus });
    if (res.data?.success) { 
      event.status = event.localStatus; 
      showToast(event.localStatus === 'active' ? 'Đã bật sự kiện' : 'Đã tắt sự kiện'); 
    } else {
      cancelStatusChange(event);
      showToast('Có lỗi xảy ra', 'error');
    }
  } catch (err) { 
    cancelStatusChange(event);
    showToast('Có lỗi xảy ra khi đổi trạng thái', 'error'); 
  } finally {
    event.isUpdatingStatus = false;
  }
}

function cancelStatusChange(event) {
  event.localStatus = event.status;
}

async function deleteHoliday(event) {
  const result = await Swal.fire({
    title: 'Xóa sự kiện?', text: `Sự kiện "${event.name}" sẽ được gỡ khỏi danh sách.`, icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Đồng ý xóa', cancelButtonText: 'Hủy', confirmButtonColor: '#dc3545',
  });
  if (!result.isConfirmed) return;
  try {
    const res = await apiClient.delete(`/admin/holiday-events/${event.id}`);
    if (res.data?.success) {
      holidays.value = holidays.value.filter((item) => item.id !== event.id);
      emailLogs.value = emailLogs.value.filter((log) => log.event_type !== `holiday_${event.id}`);
      showToast(res.data.message || 'Đã xóa sự kiện thành công');
      await Promise.all([fetchHolidayEvents(), fetchRecentLogs()]);
    }
  } catch (err) {
    if (err.response?.status === 404) {
      holidays.value = holidays.value.filter((item) => item.id !== event.id);
      showToast('Sự kiện đã bị xóa trước đó.'); return;
    }
    showToast('Xóa thất bại', 'error');
  }
}


// ================= TIỆN ÍCH UI =================

function goToCreate() { router.push({ name: 'admin-email-campaigns-create' }); }

function goToEdit(event) { router.push({ name: 'admin-email-campaigns-edit', params: { id: event.id } }); }

function targetLabel(target) { return targetLabels[target] || target; }
function insertToken(type, token) { if (type === 'birthday') { birthdaySettings.value.content = `${birthdaySettings.value.content}${birthdaySettings.value.content ? ' ' : ''}${token}`; } }

async function saveBirthdaySettings() {
  try {
    const res = await apiClient.post('/admin/email-campaign/settings', {
      is_auto_birthday: birthdaySettings.value.enabled, 
      birthday_subject: birthdaySettings.value.subject, 
      birthday_content: birthdaySettings.value.content,
      tiers: birthdaySettings.value.tiers // THÊM DÒNG NÀY ĐỂ GỬI LÊN BACKEND
    });
    if (res.data?.success) {
      // Cập nhật lại state an toàn
      birthdaySettings.value.enabled = res.data.data.is_auto_birthday;
      birthdaySettings.value.subject = res.data.data.birthday_subject;
      birthdaySettings.value.content = res.data.data.birthday_content;
      if (res.data.data.tiers) {
        birthdaySettings.value.tiers = res.data.data.tiers;
      }
      showToast(res.data.message || 'Đã lưu cấu hình sinh nhật');
    } else { 
      showToast(res.data?.message || 'Lưu cấu hình thất bại', 'error'); 
    }
  } catch (err) { showToast('Lưu cấu hình thất bại', 'error'); }
}

function replaceTokens(text, customer, voucherCode) { return text.replaceAll('[Tên_Khách_Hàng]', customer.name).replaceAll('[Voucher_Code]', voucherCode || ''); }
function formatDateTime(dateString) { if (!dateString) return 'N/A'; const d = new Date(dateString); return d.toLocaleString('vi-VN'); }
function formatEventType(typeStr) { if (typeStr === 'birthday') return 'Sinh nhật'; if (typeStr?.startsWith('holiday_')) return `Sự kiện #${typeStr.split('_')[1]}`; return typeStr; }
function emailStatusLabel(status) { return ({ queued: 'Đang chờ queue', sent: 'Đã gửi', success: 'Đã gửi', failed: 'Thất bại' })[status] || status || 'Không rõ'; }
function emailStatusClass(status) { return ({ queued: 'bg-warning text-dark', sent: 'bg-success', success: 'bg-success', failed: 'bg-danger' })[status] || 'bg-secondary'; }

async function clearLogs() {
  const result = await Swal.fire({ title: 'Xóa vĩnh viễn lịch sử?', text: 'Toàn bộ log gửi email đang hiển thị sẽ bị xóa khỏi hệ thống.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Xóa lịch sử', cancelButtonText: 'Hủy', confirmButtonColor: '#dc3545', });
  if (!result.isConfirmed) return;
  try {
    const res = await apiClient.delete('/admin/email-campaign/recent-logs');
    if (res.data?.success) { emailLogs.value = []; showToast(res.data.message || 'Đã xóa vĩnh viễn lịch sử'); } else { showToast(res.data?.message || 'Xóa lịch sử thất bại', 'error'); }
  } catch (err) { showToast('Xóa lịch sử thất bại', 'error'); }
}
function showToast(title, icon = 'success') { Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 1500 }); }
</script>

<style scoped>
/* Base Colors & Utilities */
.text-brand { color: #9F273B; }
.bg-brand { background-color: #009981; }
.border-brand-focus:focus { border-color: #009981; box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15); }
.cursor-pointer { cursor: pointer; color: #009981; }

.btn-brand { background: #009981; border-color: #009981; }
.btn-brand:hover { background: #00856f; border-color: #00856f; }

.fade-in { animation: fadeIn 0.25s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

/* Metrics */
.metric-card { min-height: 72px; border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
.metric-icon { width: 40px; height: 40px; border-radius: 8px; display: grid; place-items: center; font-size: 1.1rem; }
.metric-icon.green { color: #00856f; background: #e5f6f2; }
.metric-icon.pink { color: #c23b6e; background: #fde8f1; }
.metric-icon.blue { color: #2f6fbd; background: #e8f1ff; }

/* Custom Segmented Tabs */
.email-tabs-wrapper { padding: 4px; gap: 4px; }
.email-tabs-wrapper .btn { border: none; color: #6c757d; border-radius: 6px; padding: 6px 14px; font-size: 0.85rem; transition: all 0.2s; }
.email-tabs-wrapper .btn:hover { background-color: #f8f9fa; color: #212529; }
.email-tabs-wrapper .btn.active-tab { background-color: #e5f6f2; color: #00856f; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

/* Card & Tables */
.form-card, .card { border-radius: 10px; }
.dashboard-grid { position: relative; }
.dashboard-action-card {
  height: auto;
  position: relative;
  z-index: 1;
  overflow: visible;
}
.dashboard-action-card .card-header,
.dashboard-action-card .card-body {
  position: relative;
  z-index: 2;
}
.dashboard-action-card .card-body {
  background: #fff;
  border-radius: 0 0 10px 10px;
}
.search-box { width: 240px; max-width: 100%; }
.search-box .form-control { padding-left: 16px; font-size: 0.85rem; }
.holiday-table { min-width: 700px; }
.log-table { min-width: 700px; }
.text-sm th, .text-sm td { font-size: 0.85rem; }
.event-type-badge {
  min-height: 24px;
  min-width: 92px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  white-space: normal;
  padding: 5px 8px;
}
.recipient-cell { min-width: 170px; }
.recipient-name {
  color: #212529;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.25;
}
.recipient-email {
  color: #8a94a3;
  font-size: 0.74rem;
  line-height: 1.25;
  margin-top: 2px;
  word-break: break-word;
}

/* Custom Editor */
.custom-editor-wrapper:focus-within { border-color: #009981 !important; box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15); }
.custom-editor-wrapper textarea:focus { box-shadow: none; outline: none; }

/* SORA EMAIL PREVIEW - Window Style */
.preview-card-bg { background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%); }
.mail-window-preview { border-radius: 8px; overflow: hidden; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; border: 1px solid #e0e4e8;}
.mail-window-header { background: #f1f3f5; border-bottom: 1px solid #dee2e6; }
.window-dots .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

/* SORA Internal Template Design */
.sora-tp-header { background-color: #212529; color: #fff; text-align: center; padding: 12px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; }
.sora-tp-body { padding: 20px; background: #fff;}
.sora-tp-banner { background-color: #FCF0F1; color: #9F273B; padding: 10px 14px; border-left: 3px solid #c23b6e; font-weight: 700; font-size: 12px; margin-bottom: 18px; border-radius: 0 6px 6px 0; }
.sora-tp-content { color: #495057; line-height: 1.6; font-size: 13px; margin-bottom: 20px; }
.sora-tp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sora-tp-table td { padding: 8px 0; border-bottom: 1px solid #e9ecef; }
.sora-tp-content { color: #495057; line-height: 1.6; font-size: 13px; margin-bottom: 20px; }
.sora-tp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sora-tp-table td { padding: 8px 0; border-bottom: 1px solid #e9ecef; }
.sora-tp-btn { background-color: #9F273B; color: #fff; border: none; padding: 10px 20px; font-weight: 700; border-radius: 4px; font-size: 12px; transition: all 0.2s; }
.sora-tp-btn:hover { background-color: #7a1d2d; transform: translateY(-1px); }

/* Action Buttons for Dashboard */
.action-button { border: 1px solid #e8ecef; border-radius: 10px; background: #fff; padding: 14px; display: flex; align-items: center; gap: 14px; text-align: left; transition: all 0.2s ease; width: 100%; }
.action-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(33, 37, 41, 0.08); border-color: #dee2e6; }
.action-button:disabled { cursor: not-allowed;
 }
.action-button.is-running {
  opacity: 0.62;
  background: #f8f9fa;
  border-color: #e9ecef;
}
.action-button i:first-child { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 8px; font-size: 1.25rem; }
.action-button span {
  min-width: 0;
  position: relative;
  z-index: 1;
}
.action-button.birthday i:first-child { background: #fde8f1; color: #c23b6e; }
.action-button.holiday i:first-child { background: #e5f6f2; color: #00856f; }
.action-button strong, .action-button small { display: block; font-size: 0.9rem; overflow-wrap: anywhere; }
.action-button small { color: #6c757d; margin-top: 2px; font-size: 0.75rem;}
.today-box { border-radius: 8px; background: #f8faf9; border: 1px solid #edf0f2; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }

@media (max-width: 575.98px) {
  .email-tabs-wrapper { overflow-x: auto; flex-wrap: nowrap; width: 100%; }
  .email-tabs-wrapper .btn { white-space: nowrap; }
  .sora-tp-body { padding: 16px; }
}

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

.form-check-input:checked {
  background-color: #009981;
  border-color: #009981;
}

.form-switch .form-check-input:focus {
  --bs-form-switch-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23009981'/%3e%3c/svg%3e");
}

/* Smooth floating label transition */
.form-floating > label {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}
</style>
