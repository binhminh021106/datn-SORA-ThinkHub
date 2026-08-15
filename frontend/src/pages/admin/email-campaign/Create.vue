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
        <div class="col-xl-12">
          <div class="card border-0 shadow-sm form-card h-100">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold mb-0 text-brand">Cấu hình sự kiện</h6>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="saveHoliday">
                <div class="mb-4 bg-light p-3 rounded-3 border border-light">
                  <label class="form-label fw-semibold small text-muted text-uppercase mb-2 d-flex align-items-center gap-2">
                    <i class="bi bi-magic text-warning fs-6"></i> Gợi ý sự kiện phổ biến
                  </label>
                  <div class="d-flex flex-wrap gap-2">
                    <button 
                      type="button" 
                      v-for="(item, index) in sortedHolidays" 
                      :key="index"
                      @click="applySuggestion(item)"
                      class="btn btn-sm border border-opacity-25 rounded-pill px-3 py-1 shadow-sm custom-hover-btn"
                      :class="{'ai-suggestion': isToday(item), 'bg-white border-secondary text-dark': !isToday(item)}"
                      :style="isToday(item) ? 'font-size: 0.85rem;' : 'font-size: 0.75rem;'"
                    >
                      <i v-if="isToday(item)" class="bi bi-stars text-warning me-1"></i>
                      {{ item.name }} <span class="fw-bold ms-1" :class="isToday(item) ? 'text-white' : 'text-brand'">({{ item.day }}/{{ item.month }})</span>
                    </button>
                  </div>
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-md-7">
                    <div class="form-floating h-100">
                      <input v-model.trim="holidayForm.name" type="text" id="holidayName" class="form-control bg-light border-0 h-100" :class="{'is-invalid': errors.name}" placeholder="Ví dụ: Quốc tế Phụ nữ 8/3">
                      <label for="holidayName" class="fw-semibold text-dark">Tên sự kiện / ngày lễ <span class="text-danger">*</span></label>
                      <div class="invalid-feedback d-block" v-if="errors.name">{{ errors.name[0] }}</div>
                    </div>
                  </div>
                  
                  <div class="col-md-5">
                    <div class="form-floating focus-within-brand rounded-2 bg-light">
                      <input v-model="displayDate" type="date" id="holidayDate" class="form-control bg-transparent border-0 shadow-none ps-3 cursor-pointer" :class="{'is-invalid': errors.event_date}" placeholder="Ngày diễn ra" >
                      <label for="holidayDate" class="fw-semibold text-dark">Ngày diễn ra (Hàng năm) <span class="text-danger">*</span></label>
                      <div class="invalid-feedback d-block px-2" v-if="errors.event_date">{{ errors.event_date[0] }}</div>
                    </div>
                    <small class="text-muted mt-1 d-block ms-1" style="font-size: 0.7rem;" v-if="!errors.event_date">Hệ thống chỉ lưu lại ngày và tháng để lặp lại vào mỗi năm.</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-dark text-uppercase mb-2" style="font-size: 0.9rem;">Đối tượng nhận <span class="text-danger">*</span> <span class="text-muted text-lowercase fw-normal">(có thể chọn nhiều)</span></label>
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

                <div class="form-floating mb-3">
                  <input v-model.trim="holidayForm.subject" type="text" id="holidaySubject" class="form-control bg-light border-0" :class="{'is-invalid': errors.email_subject}" placeholder="Tiêu đề email" >
                  <label for="holidaySubject" class="fw-semibold text-dark">Tiêu đề email <span class="text-danger">*</span></label>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-end mb-3">
                    <label class="form-label fw-bold text-dark text-uppercase mb-0" style="font-size: 0.9rem;">Nội dung email <span class="text-danger">*</span></label>
                    <button type="button" class="btn btn-preview-email d-flex align-items-center gap-2" @click="showPreviewModal = true">
                      <i class="bi bi-eye fs-5"></i> <span>Xem trước Email</span>
                    </button>
                  </div>
                  
                  <div class="custom-editor-wrapper border rounded-2 overflow-hidden">
                    <div class="editor-toolbar bg-white border-bottom px-2 py-2 d-flex gap-2">
                      <span class="text-muted small fw-semibold d-flex align-items-center">Chèn nhanh:</span>
                      <button type="button" class="btn btn-sm btn-light border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn tên khách" @click="insertToken('[Tên_Khách_Hàng]')">
                        <i class="bi bi-person-badge text-brand me-1"></i> [Tên]
                      </button>
                      <div class="vr mx-1"></div>
                      <button type="button" class="btn btn-sm btn-light border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn mã voucher" @click="insertToken('[Voucher_Code]')">
                        <i class="bi bi-ticket-perforated text-brand me-1"></i> [Voucher_Code]
                      </button>
                    </div>
                    <QuillEditor v-model:content="holidayForm.content" contentType="html" toolbar="full" theme="snow" class="bg-white" style="min-height: 200px;"/>
                  </div>
                  <div class="invalid-feedback d-block mt-2" v-if="errors.email_content">{{ errors.email_content[0] }}</div>
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
                  <div class="col-md-6 col-lg-4">
                    <div class="form-floating">
                      <input v-model.trim="holidayForm.voucherCode" type="text" class="form-control text-uppercase fw-bold border-brand-focus" :class="{'is-invalid': errors.voucher_code}" id="vCode" placeholder="VD: SORA0803" >
                      <label for="vCode" class="fw-semibold text-muted">Mã quà tặng <span class="text-danger">*</span></label>
                      <div class="invalid-feedback d-block" v-if="errors.voucher_code">{{ errors.voucher_code[0] }}</div>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-4">
                    <div class="form-floating">
                      <select v-model="holidayForm.discountType" class="form-select border-brand-focus" id="vType">
                        <option value="fixed">VNĐ</option>
                        <option value="percentage">%</option>
                      </select>
                      <label for="vType" class="fw-semibold text-muted">Loại giảm</label>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-4">
                    <div class="form-floating">
                      <input v-model.number="holidayForm.discountValue" type="number" min="0" class="form-control border-brand-focus" :class="{'is-invalid': errors.discount_value}" id="vDiscount" placeholder="Mức ưu đãi" >
                      <label for="vDiscount" class="fw-semibold text-muted">Mức giảm <span class="text-danger">*</span></label>
                      <div class="invalid-feedback d-block" v-if="errors.discount_value">{{ errors.discount_value[0] }}</div>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-4">
                    <div class="form-floating">
                      <input v-model="formattedMinSpend" type="text" class="form-control border-brand-focus" id="vMinSpend" placeholder="0">
                      <label for="vMinSpend" class="fw-semibold text-muted">Đơn tối thiểu (VNĐ)</label>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-4">
                    <div class="form-floating">
                      <input v-model.number="holidayForm.usageLimitPerUser" type="number" min="1" class="form-control border-brand-focus" id="vLimit" placeholder="1">
                      <label for="vLimit" class="fw-semibold text-muted">Lượt dùng / Khách</label>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-4">
                    <div class="form-floating">
                      <input v-model.number="holidayForm.validityDays" type="number" min="1" class="form-control border-brand-focus" id="vValidity" placeholder="7">
                      <label for="vValidity" class="fw-semibold text-muted">Hạn sử dụng (Ngày)</label>
                    </div>
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
      </div>

      <!-- MODAL XEM TRƯỚC EMAIL -->
      <div v-if="showPreviewModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8); z-index: 1055" @click.self="showPreviewModal = false">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg preview-card-bg">
            <div class="modal-header border-0 pb-0">
              <div>
                <h5 class="modal-title fw-bold text-dark mb-0">Xem trước email hiển thị</h5>
                <p class="text-muted small mb-0">Minh họa khi khách hàng nhận được email.</p>
              </div>
              <button type="button" class="btn-close" @click="showPreviewModal = false"></button>
            </div>
            <div class="modal-body p-4 d-flex align-items-center justify-content-center">
              <div class="mail-window-preview shadow w-100">
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
                          <td class="text-dark fw-bold border-0 py-1 text-end">
                              {{ holidayForm.discountValue ? (holidayForm.discountType === 'percentage' ? holidayForm.discountValue + '%' : Number(holidayForm.discountValue).toLocaleString('vi-VN') + 'đ') : '...' }}
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted border-0 py-1">Áp dụng:</td>
                          <td class="text-dark border-0 py-1 text-end">{{ holidayForm.minSpend > 0 ? 'Đơn từ ' + Number(holidayForm.minSpend).toLocaleString('vi-VN') + 'đ' : 'Mọi đơn hàng hợp lệ' }}</td>
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
                    
                    <div class="text-center mt-4" v-if="holidayForm.hasVoucher">
                      <button class="sora-tp-btn-holiday w-100">
                        CHỌN MÓN TRANG SỨC CHO RIÊNG MÌNH
                      </button>
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
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import apiClient from '@/utils/apiClient'
import { textWithLineBreaks } from '@/utils/sanitizeHtml'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const router = useRouter()
const toast = useToast()
const quillEditorRef = ref(null)

const isSubmitting = ref(false)
const today = new Date()
const errors = ref({})

const holidayForm = reactive({
  name: '',
  day: today.getDate(),         
  month: today.getMonth() + 1,
  target: ['all'], 
  content: '',
  hasVoucher: false,
  voucherCode: '',
  discountType: 'percentage',
  discountValue: '',
  minSpend: 0,
  usageLimitPerUser: 1,
  validityDays: 7,
  status: 'active'
})

// Đồng bộ checkbox mục tiêu y hệt Edit.vue
watch(() => [...holidayForm.target], (newVal, oldVal) => {
  const added = newVal.filter(x => !oldVal.includes(x))
  if (added.includes('all')) {
    holidayForm.target = ['all']
  } else if (newVal.includes('all') && newVal.length > 1) {
    holidayForm.target = holidayForm.target.filter(item => item !== 'all')
  } else if (newVal.length === 0) {
    holidayForm.target = ['all']
  }
})

const popularHolidays = [
  { name: 'Lễ Tình nhân (Valentine)', day: 14, month: 2 },
  { name: 'Quốc tế Phụ nữ', day: 8, month: 3 },
  { name: 'Giải phóng Miền Nam', day: 30, month: 4 },
  { name: 'Quốc tế Lao động', day: 1, month: 5 },
  { name: 'Tết Trung thu', day: 15, month: 8 }, 
  { name: 'Phụ nữ Việt Nam', day: 20, month: 10 },
  { name: 'Nhà giáo Việt Nam', day: 20, month: 11 },
  { name: 'Lễ Giáng sinh', day: 24, month: 12 },
]

const showPreviewModal = ref(false)

const isToday = (item) => {
  return item.month === today.getMonth() + 1 && item.day === today.getDate();
}

const sortedHolidays = computed(() => {
  const tMonth = today.getMonth() + 1;
  const tDay = today.getDate();
  const holidays = [...popularHolidays];
  return holidays.sort((a, b) => {
    const aIsToday = a.month === tMonth && a.day === tDay;
    const bIsToday = b.month === tMonth && b.day === tDay;
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;
    return 0;
  });
})

const applySuggestion = (holiday) => {
  holidayForm.name = holiday.name
  holidayForm.day = holiday.day
  holidayForm.month = holiday.month
}

const currentDateDisplay = computed(() => {
  if (!holidayForm.day || !holidayForm.month) return '...'
  const yyyy = new Date().getFullYear()
  const mm = String(holidayForm.month).padStart(2, '0')
  const dd = String(holidayForm.day).padStart(2, '0')
  return `${dd}/${mm}/${yyyy}`
})

const expireDateDisplay = computed(() => {
  if (!holidayForm.day || !holidayForm.month) return '...'
  let yyyy = new Date().getFullYear()
  let d = new Date(yyyy, holidayForm.month - 1, holidayForm.day)

  const validity = holidayForm.validityDays || 7
  d.setDate(d.getDate() + validity)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (d < today) {
    yyyy++
    d = new Date(yyyy, holidayForm.month - 1, holidayForm.day)
    d.setDate(d.getDate() + validity)
  }

  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
})

const displayDate = computed({
  get() {
    if (!holidayForm.month || !holidayForm.day) return ''
    let yy = new Date().getFullYear()
    if (holidayForm.month === 2 && holidayForm.day === 29) {
      yy = 2024
    }
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
  return textWithLineBreaks(replaceTokens(holidayForm.content || ''))
})

const holidaySubject = computed(() => {
  return holidayForm.name ? `${holidayForm.name} - Ưu đãi đặc biệt từ SORA ThinkHub` : 'Ưu đãi đặc biệt từ SORA ThinkHub'
})

const formattedMinSpend = computed({
  get() {
    return holidayForm.minSpend ? new Intl.NumberFormat('vi-VN').format(holidayForm.minSpend) : ''
  },
  set(val) {
    const rawValue = val.toString().replace(/\D/g, '')
    holidayForm.minSpend = rawValue ? parseInt(rawValue, 10) : 0
  }
})

const saveHoliday = async () => {
  errors.value = {}
  let isValid = true

  if (!holidayForm.name) {
    errors.value.name = ['Vui lòng nhập tên sự kiện.']
    isValid = false
  } else if (!/^[a-zA-Z0-9\sÀ-ỹ\-\/\&\.]+$/.test(holidayForm.name)) {
    errors.value.name = ['Tên sự kiện không được chứa ký tự đặc biệt (chỉ cho phép dấu -, /, &, .).']
    isValid = false
  }
  
  if (!holidayForm.day || !holidayForm.month) {
    errors.value.event_date = ['Vui lòng chọn ngày diễn ra.']
    isValid = false
  }

  const pureContent = holidayForm.content ? holidayForm.content.replace(/<[^>]*>?/gm, '').trim() : ''
  if (pureContent.length < 5) {
    errors.value.email_content = ['Nội dung email phải có ít nhất 5 ký tự.']
    toast.warning('Vui lòng nhập nội dung email.')
    isValid = false
  }

  if (holidayForm.hasVoucher) {
    if (!holidayForm.voucherCode) {
      errors.value.voucher_code = ['Vui lòng nhập mã quà tặng.']
      isValid = false
    } else if (!/^[a-zA-Z0-9]+$/.test(holidayForm.voucherCode)) {
      errors.value.voucher_code = ['Mã quà tặng chỉ được chứa chữ cái và số, không khoảng trắng hoặc ký tự đặc biệt.']
      isValid = false
    }

    if (!holidayForm.discountValue && holidayForm.discountValue !== 0) {
      errors.value.discount_value = ['Vui lòng nhập mức giảm.']
      isValid = false
    }
  }

  if (!isValid) {
    toast.warning('Vui lòng kiểm tra lại các trường bị thiếu.')
    return
  }

  isSubmitting.value = true

  try {
    const response = await apiClient.post(
      '/admin/holiday-events',
      buildPayload()
    )

    if (response.data && response.data.success) {
      toast.success('Thêm mới sự kiện thành công!')
      router.push({ path: '/admin/email-campaigns' })
    } else {
      toast.error(response.data.message || 'Lỗi khi thêm mới sự kiện.')
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {}
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
    target_audience: holidayForm.target.length > 0 ? holidayForm.target.join(',') : 'all',
    email_subject: holidaySubject.value,
    email_content: holidayForm.content,
    voucher_code: holidayForm.hasVoucher ? holidayForm.voucherCode : null,
    discount_type: holidayForm.hasVoucher ? holidayForm.discountType : null,    
    discount_value: holidayForm.hasVoucher ? holidayForm.discountValue : null,    
    min_spend: holidayForm.hasVoucher ? holidayForm.minSpend : 0,    
    usage_limit_per_user: holidayForm.hasVoucher ? holidayForm.usageLimitPerUser : 1,    
    validity_days: holidayForm.hasVoucher ? holidayForm.validityDays : 7,    
    status: holidayForm.status
  }
}

function insertToken(token) {
  const content = holidayForm.content || '';
  if (content.endsWith('</p>')) {
     holidayForm.content = content.slice(0, -4) + ' ' + token + '</p>';
  } else {
     holidayForm.content = `${content}${content ? ' ' : ''}${token}`;
  }
}

function replaceTokens(text) {
  return text
    // Thay đổi này để đồng bộ hóa với file Edit.vue
    .replaceAll('[Tên_Khách_Hàng]', 'Nguyễn Văn A')
    .replaceAll('[Voucher_Code]', holidayForm.voucherCode || '')
}
</script>

<style scoped>
/* Base Colors & Utilities */
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

@media (max-width: 575.98px) {
  .sora-tp-body { padding: 16px; }
}


/* Custom hover cho nút gợi ý */
.custom-hover-btn {
  transition: all 0.2s ease;
}
.custom-hover-btn:hover {
  background-color: #009981 !important;
  color: #fff !important;
  border-color: #009981 !important;
}
.custom-hover-btn:hover .text-brand {
  color: #fff !important;
}

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

.btn-outline-brand { color: #009981; border-color: #009981; }
.btn-outline-brand:hover { background-color: #009981; color: white; }

.ai-suggestion {
  background: linear-gradient(135deg, #009981, #00d2b1);
  color: white;
  border: none !important;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 153, 129, 0.4) !important;
  font-weight: bold;
}
.ai-suggestion:hover {
  transform: scale(1.08);
}

/* Smooth floating label transition */
.form-floating > label {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.btn-preview-email {
  background-color: #f39c12; /* Refined warm amber */
  color: #fff;
  border: none;
  border-radius: 12px; /* User requested 12px border radius */
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  font-size: 0.85rem;
  box-shadow: 0 4px 6px rgba(243, 156, 18, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn-preview-email:hover {
  background-color: #d68910; /* Darker amber on hover */
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(214, 137, 16, 0.35);
}
</style>
