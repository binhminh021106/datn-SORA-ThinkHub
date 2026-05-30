<template>
  <div class="email-campaign-create pb-5">
    <div class="container-fluid py-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <button class="btn btn-sm btn-light border fw-semibold shadow-sm px-3" @click="router.back()">
          <i class="bi bi-arrow-left"></i> Quay lại
        </button>
        <div>
          <h5 class="fw-bold text-dark mb-0">Thêm sự kiện ngày lễ mới</h5>
          <small class="text-muted">Tạo mẫu email chúc mừng tự động.</small>
        </div>
      </div>

      <div class="row g-4">
        <!-- Cột Form Nhập Liệu -->
        <div class="col-xl-6">
          <div class="card border-0 shadow-sm form-card h-100">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold mb-0 text-brand">Cấu hình sự kiện</h6>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="saveHoliday">
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Tên sự kiện / ngày lễ</label>
                  <input v-model.trim="holidayForm.name" type="text" class="form-control form-control-sm bg-light border-0" placeholder="Ví dụ: Quốc tế Phụ nữ 8/3" required>
                </div>
                
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Ngày</label>
                    <input v-model="holidayForm.day" type="number" min="1" max="31" class="form-control form-control-sm bg-light border-0" required>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Tháng</label>
                    <input v-model="holidayForm.month" type="number" min="1" max="12" class="form-control form-control-sm bg-light border-0" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-muted text-uppercase mb-2">Đối tượng nhận (Có thể chọn nhiều)</label>
                  <div class="d-flex flex-wrap gap-3 bg-light p-3 rounded-2">
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-all" value="all" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small fw-semibold" for="t-all">Tất cả</label>
                    </div>
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-male" value="male" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small" for="t-male">Nam</label>
                    </div>
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-female" value="female" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small" for="t-female">Nữ</label>
                    </div>
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-member" value="member" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small" for="t-member">Thành viên</label>
                    </div>
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-silver" value="silver" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small" for="t-silver">Hạng Bạc</label>
                    </div>
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-gold" value="gold" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small" for="t-gold">Hạng Vàng</label>
                    </div>
                    <div class="form-check mb-0">
                      <input class="form-check-input cursor-pointer shadow-none border-brand-focus" type="checkbox" id="t-diamond" value="diamond" v-model="holidayForm.target">
                      <label class="form-check-label cursor-pointer small" for="t-diamond">Hạng Kim cương</label>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-end mb-1">
                    <label class="form-label fw-semibold small text-muted text-uppercase mb-0">Nội dung email</label>
                  </div>
                  
                  <div class="custom-editor-wrapper border rounded-2 overflow-hidden">
                    <div class="editor-toolbar bg-white border-bottom px-2 py-1 d-flex gap-1">
                      <button type="button" class="btn btn-sm btn-light border-0 py-0 px-2" title="Đậm"><i class="bi bi-type-bold"></i></button>
                      <button type="button" class="btn btn-sm btn-light border-0 py-0 px-2" title="Nghiêng"><i class="bi bi-type-italic"></i></button>
                      <div class="vr mx-1"></div>
                      <button type="button" class="btn btn-sm btn-light border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn mã voucher" @click="insertToken('[Voucher_Code]')">
                        <i class="bi bi-ticket-perforated text-brand me-1"></i> [Voucher_Code]
                      </button>
                    </div>
                    <textarea v-model="holidayForm.content" class="form-control border-0 rounded-0 bg-light small" rows="12" style="resize: none; font-size: 0.85rem;" required></textarea>
                  </div>
                </div>

                <div class="d-flex align-items-center justify-content-between bg-light border rounded-3 p-3 mb-3">
                  <div>
                    <div class="fw-bold text-dark" style="font-size: 0.9rem;">Kèm quà tặng</div>
                    <small class="text-muted" style="font-size: 0.75rem;">Bật để hiển thị bảng quà tặng trong email.</small>
                  </div>
                  <div class="form-check form-switch m-0 fs-5">
                    <input v-model="holidayForm.hasVoucher" class="form-check-input cursor-pointer border-brand-focus" type="checkbox" role="switch">
                  </div>
                </div>

                <div class="row g-3 mb-4" v-if="holidayForm.hasVoucher">
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Mã quà tặng</label>
                    <input v-model.trim="holidayForm.voucherCode" type="text" class="form-control form-control-sm text-uppercase fw-bold border-brand-focus" placeholder="VD: SORA0803">
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Mức ưu đãi</label>
                    <input v-model.trim="holidayForm.discount" type="text" class="form-control form-control-sm border-brand-focus" placeholder="VD: 5%">
                  </div>
                </div>

                <div class="mt-4 border-top pt-4">
                  <button class="btn btn-sm btn-brand text-white fw-bold px-4 py-2 w-100 shadow-sm" type="submit" :disabled="isSubmitting">
                    <i class="bi bi-floppy me-1"></i> {{ isSubmitting ? 'Đang tạo...' : 'Tạo sự kiện mới' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Cột Preview Email -->
        <div class="col-xl-6">
          <div class="card border-0 shadow-sm h-100 preview-card-bg">
            <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold mb-1 text-dark">Xem trước email hiển thị</h6>
              <p class="text-muted small mb-0" style="font-size: 0.75rem;">Minh họa khi khách hàng nhận được email.</p>
            </div>
            <div class="card-body p-4 d-flex align-items-center justify-content-center">
              
              <!-- SORA Mail App Window Preview - GIAO DIỆN LỄ HỘI -->
              <div class="mail-window-preview shadow-sm w-100">
                <div class="mail-window-header d-flex align-items-center px-2 py-1">
                  <div class="window-dots d-flex gap-1">
                    <span class="dot bg-danger"></span>
                    <span class="dot bg-warning"></span>
                    <span class="dot bg-success"></span>
                  </div>
                  <div class="window-title mx-auto text-muted fw-semibold" style="font-size: 0.7rem;">
                    Thư mời - {{ holidaySubject }}
                  </div>
                </div>
                <div class="mail-window-body p-3 bg-white">
                  <!-- Nội dung Mail Sự Kiện / Lễ -->
                  <div class="sora-tp-header rounded-top-2">
                    HỆ THỐNG SORA THINKHUB
                  </div>
                  <div class="sora-tp-body border border-top-0 rounded-bottom-2">
                    
                    <div class="sora-tp-banner-holiday text-center mb-4 rounded-3 shadow-sm">
                      <span class="fw-bold fs-6 text-uppercase">QUÀ TẶNG {{ holidayForm.name ? holidayForm.name : '[TÊN NGÀY LỄ]' }}</span>
                    </div>
                    
                    <div class="sora-tp-content" v-html="previewHolidayContent"></div>
                    
                    <div class="sora-tp-voucher-box-holiday p-3 rounded-3 mb-2 mt-4" v-if="holidayForm.hasVoucher">
                      <div class="text-center mb-3">
                        <span class="badge bg-danger text-white rounded-pill px-3 py-1 fw-semibold shadow-sm"><i class="bi bi-star-fill me-1 text-warning"></i> ƯU ĐÃI ĐẶC QUYỀN <i class="bi bi-star-fill ms-1 text-warning"></i></span>
                      </div>
                      <table class="sora-tp-table mb-0 w-100">
                        <tr>
                          <td class="text-muted border-0 py-1">Mã quà tặng:</td>
                          <td class="fw-bold fs-5 font-monospace border-0 py-1 text-end text-danger">{{ holidayForm.voucherCode || '...' }}</td>
                        </tr>
                        <tr>
                          <td class="text-muted border-0 py-1">Mức ưu đãi:</td>
                          <td class="text-dark fw-bold border-0 py-1 text-end">{{ holidayForm.discount || '...' }}</td>
                        </tr>
                        <tr>
                          <td class="text-muted border-0 py-1">Áp dụng:</td>
                          <td class="text-dark border-0 py-1 text-end">Tất cả bộ sưu tập</td>
                        </tr>
                        <tr>
                          <td class="text-muted pb-0 border-0 py-1">Hạn sử dụng:</td>
                          <td class="text-dark pb-0 border-0 py-1 text-end">30/05/2026</td>
                        </tr>
                      </table>
                    </div>
                    
                    <button class="sora-tp-btn-holiday mt-4 w-100 shadow-sm">CHỌN MÓN TRANG SỨC CHO RIÊNG MÌNH</button>
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
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/apiClient'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const isSubmitting = ref(false)

// Khai báo Form state (Đồng bộ v-model ở template)
const holidayForm = reactive({
  name: '',
  day: '',
  month: '',
  target: ['all'],
  content: '',
  hasVoucher: false,
  voucherCode: '',
  discount: '',
  status: 'active'
})

const previewHolidayContent = computed(() => {
  return replaceTokens(holidayForm.content || '').replace(/\n/g, '<br>')
})

const holidaySubject = computed(() => {
  return holidayForm.name ? `${holidayForm.name} - Ưu đãi đặc biệt từ SORA ThinkHub` : 'Ưu đãi đặc biệt từ SORA ThinkHub'
})

// Xử lý lưu sự kiện mới
const saveHoliday = async () => {
  // 1. Validate cơ bản
  if (!holidayForm.name || !holidayForm.day || !holidayForm.month || !holidayForm.content) {
    toast.warning('Vui lòng nhập đầy đủ các trường thông tin bắt buộc (*).')
    return
  }

  // 2. Gửi API
  isSubmitting.value = true
  try {
    const response = await apiClient.post('/admin/holiday-events', buildPayload())
    
    if (response.data && response.data.success) {
      toast.success('Thêm mới sự kiện thành công!')
      // Trở về trang danh sách (Lưu ý: đổi tên route phù hợp với cấu hình router/admin.js của bạn)
      router.push({ path: '/admin/email-campaign' }) 
    } else {
      toast.error(response.data.message || 'Lỗi khi thêm mới sự kiện.')
    }
  } catch (error) {
    console.error('Lỗi Create Event:', error)
    if (error.response && error.response.status === 422) {
      toast.error('Dữ liệu không hợp lệ, vui lòng kiểm tra lại form.')
    } else {
      toast.error('Có lỗi xảy ra từ phía máy chủ.')
    }
  } finally {
    isSubmitting.value = false
  }
}

function buildPayload() {
  return {
    name: holidayForm.name,
    day: holidayForm.day,
    month: holidayForm.month,
    target_audience: normalizeTarget(),
    email_subject: holidaySubject.value,
    email_content: holidayForm.content,
    voucher_code: holidayForm.hasVoucher ? holidayForm.voucherCode : null,
    status: holidayForm.status,
  }
}

function normalizeTarget() {
  if (!Array.isArray(holidayForm.target) || holidayForm.target.length === 0) {
    return 'all'
  }

  if (holidayForm.target.includes('all')) {
    return 'all'
  }

  return holidayForm.target[0]
}

function insertToken(token) {
  holidayForm.content = `${holidayForm.content}${holidayForm.content ? ' ' : ''}${token}`
}

function replaceTokens(text) {
  return text.replaceAll('[Voucher_Code]', holidayForm.voucherCode || '')
}
</script>

<style scoped>
/* Base Colors & Utilities */
.text-brand {
  color: #009981;
}
.bg-brand {
  background-color: #009981;
}
.border-brand-focus:focus {
  border-color: #009981 !important;
  box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15) !important;
}
.cursor-pointer {
  cursor: pointer;
}
.btn-brand {
  background: #009981;
  border-color: #009981;
}
.btn-brand:hover {
  background: #00856f;
  border-color: #00856f;
}

/* Card */
.form-card, .card {
  border-radius: 10px;
}

/* Custom Editor */
.custom-editor-wrapper:focus-within {
  border-color: #009981 !important;
  box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15);
}
.custom-editor-wrapper textarea:focus {
  box-shadow: none;
  outline: none;
}

/* Checkboxes */
.form-check-input:checked {
  background-color: #009981;
  border-color: #009981;
}

/* SORA EMAIL PREVIEW - Window Style */
.preview-card-bg {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}
.mail-window-preview {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  border: 1px solid #e0e4e8;
}
.mail-window-header {
  background: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
}
.window-dots .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

/* SORA EMAIL PREVIEW - HOLIDAY EDITION */
.sora-tp-header {
  background-color: #343a40;
  color: #fff;
  text-align: center;
  padding: 14px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.sora-tp-body {
  padding: 20px;
  background: #fff;
}
.sora-tp-banner-holiday {
  background: linear-gradient(135deg, #9b111e 0%, #720b15 100%);
  color: #fff;
  padding: 20px;
  border: 1px solid #5a0911;
}
.text-holiday {
  color: #f8d7da;
}
.sora-tp-content {
  color: #495057;
  line-height: 1.6;
  font-size: 13px;
  margin-bottom: 20px;
}
.sora-tp-voucher-box-holiday {
  background: #fff0f3;
  border: 1px dashed #dc3545;
  position: relative;
}
.sora-tp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.sora-tp-btn-holiday {
  background: linear-gradient(135deg, #dc3545 0%, #a71d2a 100%);
  color: #fff;
  border: none;
  padding: 12px 20px;
  font-weight: 800;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.2);
}
.sora-tp-btn-holiday:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(220, 53, 69, 0.3);
}

@media (max-width: 575.98px) {
  .sora-tp-body {
    padding: 16px;
  }
}
</style>