<template>
  <div class="email-campaign-edit pb-5">
    <div class="container-fluid py-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <button class="btn btn-sm btn-light border fw-semibold shadow-sm px-3" @click="router.back()">
          <i class="bi bi-arrow-left"></i> Quay lại
        </button>
        <div>
          <h5 class="fw-bold text-dark mb-0">Cập nhật sự kiện</h5>
          <small class="text-muted">ID Sự kiện: #{{ eventId }}</small>
        </div>
      </div>

      <div class="row g-4" v-if="isLoading">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-brand" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <div class="row g-4" v-else>
        <div class="col-xl-6">
          <div class="card border-0 shadow-sm form-card h-100">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold mb-0 text-brand">Sửa đổi cấu hình</h6>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="updateHoliday">
                
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Tên sự kiện / ngày lễ</label>
                  <input v-model.trim="holidayForm.name" type="text" class="form-control form-control-sm bg-light border-0" placeholder="Ví dụ: Quốc tế Phụ nữ 8/3" required>
                </div>
                
                <div class="mb-4">
                  <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Ngày diễn ra (Hàng năm)</label>
                  <div class="input-group input-group-sm bg-light border-0 rounded-2 overflow-hidden focus-within-brand">
                    <span class="input-group-text bg-transparent border-0 text-muted"><i class="bi bi-calendar-event"></i></span>
                    <input 
                      v-model="displayDate" 
                      type="date" 
                      class="form-control form-control-sm bg-transparent border-0 shadow-none ps-0 cursor-pointer" 
                      required
                    >
                  </div>
                  <small class="text-muted mt-1 d-block" style="font-size: 0.7rem;">Hệ thống chỉ lưu lại ngày và tháng để lặp lại vào mỗi năm.</small>
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
                  <label class="form-label fw-semibold small text-muted text-uppercase mb-1">Tiêu đề email</label>
                  <input v-model.trim="holidayForm.subject" type="text" class="form-control form-control-sm bg-light border-0" required>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-end mb-1">
                    <label class="form-label fw-semibold small text-muted text-uppercase mb-0">Nội dung email</label>
                  </div>
                  
                  <div class="custom-editor-wrapper border rounded-2 overflow-hidden">
                    <div class="editor-toolbar bg-white border-bottom px-2 py-1 d-flex gap-1">
                      <button type="button" class="btn btn-sm btn-light border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn tên khách" @click="insertToken('[Tên_Khách_Hàng]')">
                        <i class="bi bi-person-badge text-brand me-1"></i> [Tên]
                      </button>
                      <div class="vr mx-1"></div>
                      <button type="button" class="btn btn-sm btn-light border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn mã voucher" @click="insertToken('[Voucher_Code]')">
                        <i class="bi bi-ticket-perforated text-brand me-1"></i> [Voucher_Code]
                      </button>
                    </div>
                    <textarea v-model="holidayForm.content" class="form-control border-0 rounded-0 bg-light small" rows="10" style="resize: none; font-size: 0.85rem;" required></textarea>
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
                    <i class="bi bi-floppy me-1"></i> {{ isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-6">
          <div class="card border-0 shadow-sm h-100 preview-card-bg">
            <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold mb-1 text-dark">Xem trước email hiển thị</h6>
              <p class="text-muted small mb-0" style="font-size: 0.75rem;">Minh họa khi khách hàng nhận được email.</p>
            </div>
            <div class="card-body p-4 d-flex align-items-center justify-content-center">
              
              <div class="mail-window-preview shadow-sm w-100">
                <div class="mail-window-header d-flex align-items-center px-2 py-1">
                  <div class="window-dots d-flex gap-1">
                    <span class="dot bg-danger"></span>
                    <span class="dot bg-warning"></span>
                    <span class="dot bg-success"></span>
                  </div>
                  <div class="window-title mx-auto text-muted fw-semibold" style="font-size: 0.7rem;">
                    Thư mời - {{ holidayForm.subject }}
                  </div>
                </div>
                <div class="mail-window-body p-3 bg-white">
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
                          <td class="text-muted border-0 py-1">Ngày cấp:</td>
                          <td class="text-dark border-0 py-1 text-end fw-bold">{{ currentDateDisplay }}</td>
                        </tr>
                        <tr>
                          <td class="text-muted pb-0 border-0 py-1">Hạn sử dụng:</td>
                          <td class="text-danger fw-bold pb-0 border-0 py-1 text-end">{{ expireDateDisplay }}</td>
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
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/utils/apiClient'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const eventId = route.params.id 
const isFetching = ref(true)
const isSubmitting = ref(false)
const isLoading = computed(() => isFetching.value)

const holidayForm = reactive({
  name: '',
  day: '',
  month: '',
  target: [], 
  subject: '',
  content: '',
  hasVoucher: false,
  voucherCode: '',
  discount: '',
  status: 'active'
})

// Tính ngày cấp chuẩn từ form
const currentDateDisplay = computed(() => {
  if (!holidayForm.day || !holidayForm.month) return '...'
  const yyyy = new Date().getFullYear()
  const mm = String(holidayForm.month).padStart(2, '0')
  const dd = String(holidayForm.day).padStart(2, '0')
  return `${dd}/${mm}/${yyyy}`
})

// Tính ngày hết hạn chuẩn (Cộng 3 ngày)
const expireDateDisplay = computed(() => {
  if (!holidayForm.day || !holidayForm.month) return '...'
  const yyyy = new Date().getFullYear()
  const d = new Date(yyyy, holidayForm.month - 1, holidayForm.day)
  d.setDate(d.getDate() + 3) 
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
})

const displayDate = computed({
  get() {
    if (!holidayForm.month || !holidayForm.day) return ''
    let yy = new Date().getFullYear()
    if (holidayForm.month === 2 && holidayForm.day === 29) { yy = 2024 }
    const mm = String(holidayForm.month).padStart(2, '0')
    const dd = String(holidayForm.day).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  },
  set(val) {
    if (val) {
      const parts = val.split('-')
      holidayForm.month = parseInt(parts[1], 10)
      holidayForm.day = parseInt(parts[2], 10)
    } else {
      holidayForm.month = ''
      holidayForm.day = ''
    }
  }
})

const previewHolidayContent = computed(() => {
  return replaceTokens(holidayForm.content || '').replace(/\n/g, '<br>')
})

const fetchEventDetail = async () => {
  isFetching.value = true
  try {
    const response = await apiClient.get(`/admin/holiday-events/${eventId}`)
    
    if (response.data && response.data.success) {
     const data = response.data.data
      holidayForm.name = data.name
      const [day = '', month = ''] = String(data.event_date || '').split('/')
      
      // Ép kiểu sang số nguyên
      const parsedDay = Number.parseInt(day, 10)
      const parsedMonth = Number.parseInt(month, 10)
      
      // Kiểm tra NaN, nếu lỗi thì gán rỗng, nếu thành công thì gán số đã ép kiểu
      holidayForm.day = Number.isNaN(parsedDay) ? '' : parsedDay
      holidayForm.month = Number.isNaN(parsedMonth) ? '' : parsedMonth
      
      // Xử lý chuỗi đối tượng nhận thành mảng
      holidayForm.target = normalizeTargetAudience(data.target_audience)
      
      holidayForm.subject = data.email_subject
      holidayForm.content = data.email_content
      holidayForm.hasVoucher = !!data.voucher_code
      holidayForm.voucherCode = data.voucher_code || ''
      holidayForm.discount = data.discount || ''
      holidayForm.status = data.status || 'active'
    } else {
      toast.error('Không tìm thấy thông tin sự kiện.')
      router.push({ path: '/admin/email-campaigns' })
    }
  } catch (error) {
    toast.error('Lỗi tải dữ liệu. Sự kiện có thể đã bị xóa.')
    router.push({ path: '/admin/email-campaigns' })
  } finally {
    isFetching.value = false
  }
}

const updateHoliday = async () => {
  if (!holidayForm.name || !holidayForm.day || !holidayForm.month || !holidayForm.subject || !holidayForm.content) {
    toast.warning('Vui lòng nhập đầy đủ các trường thông tin bắt buộc (*).')
    return
  }
  if (holidayForm.hasVoucher && (!holidayForm.voucherCode || !holidayForm.discount)) {
    toast.warning('Vui lòng nhập đầy đủ Mã quà tặng và Mức ưu đãi.')
    return
  }

  isSubmitting.value = true
  try {
    const response = await apiClient.put(`/admin/holiday-events/${eventId}`, buildPayload())
    
    if (response.data && response.data.success) {
      toast.success('Cập nhật sự kiện thành công!')
      router.push({ path: '/admin/email-campaigns' })
    } else {
      toast.error(response.data.message || 'Lỗi khi cập nhật sự kiện.')
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      toast.error('Dữ liệu cập nhật không hợp lệ.')
    } else {
      toast.error('Lỗi máy chủ khi cập nhật.')
    }
  } finally {
    isSubmitting.value = false
  }
}

function normalizeTargetAudience(value) {
  if (Array.isArray(value)) {
    const targets = value.map(target => String(target).trim()).filter(Boolean)
    return targets.length ? targets : ['all']
  }

  if (!value) return ['all']

  const rawValue = String(value).trim()
  if (!rawValue) return ['all']

  try {
    const parsed = JSON.parse(rawValue)
    if (Array.isArray(parsed)) {
      const targets = parsed.map(target => String(target).trim()).filter(Boolean)
      return targets.length ? targets : ['all']
    }
  } catch (error) {
    // Keep compatibility with legacy comma-separated values.
  }

  const targets = rawValue.split(',').map(target => target.trim()).filter(Boolean)
  return targets.length ? targets : ['all']
}

function buildPayload() {
  let expiresAtFormatted = null
  if (holidayForm.hasVoucher && holidayForm.day && holidayForm.month) {
    const yyyy = new Date().getFullYear()
    const d = new Date(yyyy, holidayForm.month - 1, holidayForm.day)
    d.setDate(d.getDate() + 3) 
    
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    expiresAtFormatted = `${y}-${m}-${day} 23:59:59` 
  }

  return {
    name: holidayForm.name,
    day: holidayForm.day,
    month: holidayForm.month,
    target_audience: holidayForm.target.length > 0 ? holidayForm.target.join(',') : 'all',
    email_subject: holidayForm.subject,
    email_content: holidayForm.content,
    voucher_code: holidayForm.hasVoucher ? holidayForm.voucherCode : null,
    discount: holidayForm.hasVoucher ? holidayForm.discount : null,
    status: holidayForm.status,
    expires_at: expiresAtFormatted // Đồng bộ chính xác
  }
}

function insertToken(token) {
  holidayForm.content = `${holidayForm.content}${holidayForm.content ? ' ' : ''}${token}`
}

function replaceTokens(text) {
  return text
    .replaceAll('[Tên_Khách_Hàng]', 'Le Thi My Duyen')
    .replaceAll('[Voucher_Code]', holidayForm.voucherCode || '')
}

onMounted(() => {
  if (eventId) {
    fetchEventDetail()
  } else {
    toast.error('Thiếu tham số ID.')
    router.back()
  }
})
</script>


<style scoped>
/* Base Colors & Utilities Đồng bộ với Create.vue */
.text-brand { color: #009981; }
.bg-brand { background-color: #009981; }
.border-brand-focus:focus { border-color: #009981 !important; box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15) !important; }
.cursor-pointer { cursor: pointer; }
.btn-brand { background: #009981; border-color: #009981; }
.btn-brand:hover { background: #00856f; border-color: #00856f; }
.form-card, .card { border-radius: 10px; }
.custom-editor-wrapper:focus-within { border-color: #009981 !important; box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15); }
.custom-editor-wrapper textarea:focus { box-shadow: none; outline: none; }
.form-check-input:checked { background-color: #009981; border-color: #009981; }

/* SORA EMAIL PREVIEW CSS */
.preview-card-bg { background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%); }
.mail-window-preview { border-radius: 8px; overflow: hidden; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; border: 1px solid #e0e4e8; }
.mail-window-header { background: #f1f3f5; border-bottom: 1px solid #dee2e6; }
.window-dots .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.sora-tp-header { background-color: #343a40; color: #fff; text-align: center; padding: 14px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
.sora-tp-body { padding: 20px; background: #fff; }
.sora-tp-banner-holiday { background: linear-gradient(135deg, #9b111e 0%, #720b15 100%); color: #fff; padding: 20px; border: 1px solid #5a0911; }
.text-holiday { color: #f8d7da; }
.sora-tp-content { color: #495057; line-height: 1.6; font-size: 13px; margin-bottom: 20px; }
.sora-tp-voucher-box-holiday { background: #fff0f3; border: 1px dashed #dc3545; position: relative; }
.sora-tp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sora-tp-btn-holiday { background: linear-gradient(135deg, #dc3545 0%, #a71d2a 100%); color: #fff; border: none; padding: 12px 20px; font-weight: 800; border-radius: 6px; font-size: 13px; transition: all 0.2s; box-shadow: 0 4px 10px rgba(220, 53, 69, 0.2); }
.sora-tp-btn-holiday:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(220, 53, 69, 0.3); }

/* Hiệu ứng viền xanh khi click vào ô Datepicker */
.focus-within-brand {
  transition: box-shadow 0.2s, border-color 0.2s;
  border: 1px solid transparent;
}
.focus-within-brand:focus-within {
  border-color: #009981 !important;
  background-color: #fff !important;
  box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15);
}

@media (max-width: 575.98px) {
  .sora-tp-body { padding: 16px; }
}
</style>
