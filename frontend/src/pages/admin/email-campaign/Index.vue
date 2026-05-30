<template>
  <div class="email-campaign-page pb-4">
    <div class="container-fluid py-3">
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
      <section v-if="activeTab === 'dashboard'" class="row g-3">
        <div class="col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 pt-3 px-3 pb-0">
              <h6 class="fw-bold mb-1">Bảng điều khiển gửi</h6>
              <p class="text-muted small mb-0" style="font-size: 0.8rem;">Kiểm tra và gửi thủ công theo ngày hiện tại.</p>
            </div>
            <div class="card-body p-3 d-grid gap-2">
              <button class="action-button birthday" :disabled="isSending" @click="runBirthdayCampaign">
                <i class="bi bi-cake2"></i>
                <span>
                  <strong>Kiểm tra & Gửi Sinh Nhật</strong>
                  <small>Quét khách có sinh nhật hôm nay</small>
                </span>
              </button>
              <button class="action-button holiday" :disabled="isSending" @click="runHolidayCampaign">
                <i class="bi bi-calendar2-heart"></i>
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
                      <td class="px-3 py-2 small fw-semibold">{{ formatDateTime(log.sent_at) }}</td>
                      <td class="px-3 py-2"><span class="badge bg-secondary bg-opacity-10 text-secondary border">{{ formatEventType(log.event_type) }}</span></td>
                      <td class="px-3 py-2">
                        <div class="fw-bold small">{{ log.user?.name || 'N/A' }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">{{ log.user?.email || 'N/A' }}</div>
                      </td>
                      <td class="px-3 py-2">
                        <span class="text-muted" style="font-size: 0.75rem;">Theo sự kiện</span>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span class="badge" :class="log.status === 'success' ? 'bg-success' : 'bg-danger'">
                          {{ log.status === 'success' ? 'Thành công' : 'Thất bại' }}
                        </span>
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
                      <th class="px-3 py-2 text-center small text-secondary">Trạng thái</th>
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
                        <div class="form-check form-switch d-inline-flex m-0">
                          <input class="form-check-input cursor-pointer" type="checkbox" :checked="event.status === 'active'" @change="toggleHolidayStatus(event)">
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
        <div class="col-xl-6">
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
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark small mb-1">Tiêu đề mẫu email</label>
                <input v-model.trim="birthdaySettings.subject" type="text" class="form-control form-control-sm bg-light border-0">
              </div>
              
              <!-- SECTION MỚI: QUÀ TẶNG THEO HẠNG THÀNH VIÊN -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark small mb-2">Quà tặng theo hạng thành viên</label>
                <div class="border rounded-2 p-3 bg-light bg-opacity-25">
                  <div 
                    class="row g-3 align-items-center mb-3" 
                    v-for="(tier, index) in birthdaySettings.tiers" 
                    :key="tier.id"
                    :class="{'border-bottom pb-3 mb-0': index !== birthdaySettings.tiers.length - 1}">
                    
                    <div class="col-md-4 d-flex align-items-center gap-2">
                      <div class="text-secondary d-flex align-items-center justify-content-center border bg-white rounded shadow-sm" style="width:24px; height:24px;">
                        <i class="bi bi-person-badge-fill" style="font-size: 0.75rem;"></i>
                      </div>
                      <span class="fw-bold small text-dark">{{ tier.name }}</span>
                    </div>
                    <div class="col-md-4">
                      <input 
                        v-model.trim="tier.voucherCode" 
                        type="text" 
                        class="form-control form-control-sm text-danger fw-bold text-uppercase border-brand-focus bg-white" 
                        placeholder="Nhập mã">
                    </div>
                    <div class="col-md-4">
                      <input 
                        v-model.trim="tier.discount" 
                        type="text" 
                        class="form-control form-control-sm border-brand-focus bg-white" 
                        placeholder="Mức ưu đãi">
                    </div>
                    
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <label class="form-label fw-semibold text-dark small mb-0">Nội dung email chung</label>
                  <div class="text-brand fw-semibold cursor-pointer" style="font-size: 0.75rem;" @click="insertToken('birthday', '[Tên_Khách_Hàng]')">
                    <i class="bi bi-plus-circle me-1"></i>Chèn Tên
                  </div>
                </div>
                
                <div class="custom-editor-wrapper border rounded-2 overflow-hidden">
                  <div class="editor-toolbar bg-white border-bottom px-2 py-1 d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-light border-0 py-0 px-2" title="Đậm"><i class="bi bi-type-bold"></i></button>
                    <button type="button" class="btn btn-sm btn-light border-0 py-0 px-2" title="Nghiêng"><i class="bi bi-type-italic"></i></button>
                    <div class="vr mx-1"></div>
                    <button type="button" class="btn btn-sm btn-light border fw-semibold text-dark py-0 px-2" style="font-size: 0.75rem;" title="Chèn mã voucher" @click="insertToken('birthday', '[Voucher_Code]')">
                      <i class="bi bi-ticket-perforated text-brand me-1"></i> [Voucher_Code]
                    </button>
                  </div>
                  <textarea v-model="birthdaySettings.content" class="form-control border-0 rounded-0 bg-light small" rows="8" style="resize: none; font-size: 0.85rem;"></textarea>
                </div>
              </div>

              <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                <div class="status-indicator d-flex align-items-center gap-1" :class="birthdaySettings.enabled ? 'text-success' : 'text-warning'">
                  <i class="bi" :class="birthdaySettings.enabled ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'"></i>
                  <span class="fw-semibold" style="font-size: 0.8rem;">{{ birthdaySettings.enabled ? 'Hệ thống Đang bật tự động' : 'Hệ thống Đang tắt' }}</span>
                </div>
                <button class="btn btn-sm btn-brand text-white fw-bold px-3 shadow-sm" @click="saveBirthdaySettings">
                  <i class="bi bi-floppy me-1"></i> Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6">
          <div class="card border-0 shadow-sm h-100 preview-card-bg">
            <div class="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-end">
              <div>
                <h6 class="fw-bold mb-1 text-dark">Xem trước email hiển thị</h6>
                <p class="text-muted small mb-0" style="font-size: 0.75rem;">Dựa trên dữ liệu của một khách hàng mẫu.</p>
              </div>
              <select v-model="previewTierId" class="form-select form-select-sm bg-white" style="width: auto; font-size: 0.75rem;">
                <option v-for="tier in birthdaySettings.tiers" :key="tier.id" :value="tier.id">
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
                    
                    <div class="sora-tp-voucher-box p-2 rounded-2 bg-light border" v-if="previewTierData.voucherCode">
                      <table class="sora-tp-table mb-0">
                        <tr>
                          <td class="text-muted">Mã quà tặng:</td>
                          <td class="text-danger fw-bold font-monospace">{{ previewTierData.voucherCode }}</td>
                        </tr>
                        <tr>
                          <td class="text-muted">Mức ưu đãi:</td>
                          <td class="text-dark fw-bold">{{ previewTierData.discount || '...' }}</td>
                        </tr>
                        <tr>
                          <td class="text-muted">Áp dụng:</td>
                          <td class="text-dark">Tất cả bộ sưu tập</td>
                        </tr>
                        <tr>
                          <td class="text-muted pb-0 border-0">Hạn sử dụng:</td>
                          <td class="text-dark pb-0 border-0">30/05/2026</td>
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
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import apiClient from '@/utils/apiClient';

const router = useRouter();
const activeTab = ref('dashboard');
const isSending = ref(false);
const holidaySearch = ref('');

const today = new Date();
const todayLabel = computed(() => today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }));

const targetLabels = {
  all: 'Tất cả',
  female: 'Khách nữ',
  male: 'Khách nam',
  vip: 'VIP',
  member: 'Hạng Thành viên',
  silver: 'Hạng Bạc',
  gold: 'Hạng Vàng',
  diamond: 'Hạng Kim cương',
  regular: 'Khách thường',
};

// DỮ LIỆU TỪ API CHUẨN
const holidays = ref([]);
const emailLogs = ref([]);

// CẤU HÌNH UI (Do Backend chưa có table này nên lưu local trên Form)
const birthdaySettings = ref({
  enabled: true,
  subject: 'Chúc mừng sinh nhật [Tên_Khách_Hàng]',
  content: 'Xin chào [Tên_Khách_Hàng],\n\nNhân dịp sinh nhật, SORA ThinkHub xin gửi đến bạn lời chúc một tuổi mới thật nhiều niềm vui, hạnh phúc và luôn tỏa sáng theo cách riêng của mình.\n\nCảm ơn bạn đã tin tưởng đồng hành cùng chúng tôi. SORA xin dành tặng bạn một ưu đãi đặc biệt để ngày sinh nhật thêm trọn vẹn và ý nghĩa.',
  tiers: [
    { id: 'regular', name: 'Khách Thường', voucherCode: 'BDAYREG', discount: 'Miễn phí Ship' },
    { id: 'silver', name: 'Hạng Bạc', voucherCode: 'BDAYSILVER', discount: '5%' },
    { id: 'gold', name: 'Hạng Vàng', voucherCode: 'BDAYGOLD', discount: '10%' },
    { id: 'diamond', name: 'Hạng Kim cương', voucherCode: 'BDAYDIAMOND', discount: '15%' },
  ]
});

// Giả lập Khách hàng mẫu cho Khung Xem trước (Preview)
const sampleCustomers = ref([
  { id: 1, name: 'Lê Thị Mỹ Duyên', email: 'myduyen@example.com', gender: 'female', tier: 'diamond' },
]);
const previewTierId = ref('diamond');

// ================= FETCH DATA TỪ API =================
const fetchRecentLogs = async () => {
  try {
    const res = await apiClient.get('/admin/email-campaign/recent-logs');
    if (res.data?.success) emailLogs.value = res.data.data;
  } catch (err) {
    console.error('Lỗi fetch log:', err);
  }
};

const fetchHolidayEvents = async () => {
  try {
    const res = await apiClient.get('/admin/holiday-events');
    if (res.data?.success) holidays.value = res.data.data;
  } catch (err) {
    console.error('Lỗi fetch holiday:', err);
  }
};

const fetchBirthdaySettings = async () => {
  try {
    const res = await apiClient.get('/admin/email-campaign/settings');
    if (res.data?.success) {
      birthdaySettings.value.enabled = !!res.data.data.is_auto_birthday;
      birthdaySettings.value.subject = res.data.data.birthday_subject || '';
      birthdaySettings.value.content = res.data.data.birthday_content || '';
    }
  } catch (err) {
    console.error('Loi fetch birthday setting:', err);
  }
};

onMounted(() => {
  fetchRecentLogs();
  fetchHolidayEvents();
  fetchBirthdaySettings();
});

// ================= COMPUTED =================
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

const previewTierData = computed(() => {
  return birthdaySettings.value.tiers.find(t => t.id === previewTierId.value) || birthdaySettings.value.tiers[0];
});
const previewBirthdaySubject = computed(() => replaceTokens(birthdaySettings.value.subject || '', sampleCustomers.value[0], previewTierData.value.voucherCode));
const previewBirthdayContent = computed(() => replaceTokens(birthdaySettings.value.content || '', sampleCustomers.value[0], previewTierData.value.voucherCode).replace(/\n/g, '<br>'));


// ================= ACTIONS KẾT NỐI API =================

// Gửi Email Sinh Nhật (Luồng A)
async function runBirthdayCampaign() {
  if (!birthdaySettings.value.enabled) {
    Swal.fire('Đã tắt tính năng', 'Email sinh nhật đang tắt nên hệ thống bỏ qua.', 'info');
    return;
  }
  isSending.value = true;
  try {
    const response = await apiClient.post('/admin/email-campaign/trigger-birthday');
    if (response.data?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: response.data.message || `Đã kiểm tra và gửi email sinh nhật.`, showConfirmButton: false, timer: 3000 });
      await fetchRecentLogs();
    } else {
      showToast(response.data.message || 'Lỗi khi gửi email sinh nhật.', 'error');
    }
  } catch (error) {
    showToast('Lỗi máy chủ! Không thể gửi email.', 'error');
  } finally {
    isSending.value = false;
  }
}

// Gửi Email Sự Kiện (Luồng B)
async function runHolidayCampaign() {
  isSending.value = true;
  try {
    const response = await apiClient.post('/admin/email-campaign/trigger-holiday');
    if (response.data?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: response.data.message || `Đã kiểm tra và gửi email sự kiện.`, showConfirmButton: false, timer: 3000 });
      await fetchRecentLogs();
    } else {
      showToast(response.data.message || 'Lỗi khi gửi email sự kiện.', 'error');
    }
  } catch (error) {
    showToast('Lỗi máy chủ! Không thể gửi email sự kiện.', 'error');
  } finally {
    isSending.value = false;
  }
}

// Bật tắt sự kiện bằng API
async function toggleHolidayStatus(event) {
  const newStatus = event.status === 'active' ? 'inactive' : 'active';
  try {
    const res = await apiClient.put(`/admin/holiday-events/${event.id}`, { ...event, status: newStatus });
    if (res.data?.success) {
      event.status = newStatus;
      showToast(newStatus === 'active' ? 'Đã bật sự kiện' : 'Đã tắt sự kiện');
    }
  } catch (err) {
    showToast('Có lỗi xảy ra khi đổi trạng thái', 'error');
  }
}

// Xóa sự kiện bằng API
async function deleteHoliday(event) {
  const result = await Swal.fire({
    title: 'Xóa sự kiện?',
    text: `Sự kiện "${event.name}" sẽ được gỡ khỏi danh sách.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#dc3545',
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
      emailLogs.value = emailLogs.value.filter((log) => log.event_type !== `holiday_${event.id}`);
      showToast('Sự kiện đã bị xóa trước đó.');
      return;
    }

    showToast('Xóa thất bại', 'error');
  }
}


// ================= TIỆN ÍCH UI =================

function goToCreate() { router.push({ name: 'admin-email-campaign-create' }); }

function goToEdit(event) { router.push({ name: 'admin-email-campaign-edit', params: { id: event.id } }); }

function targetLabel(target) { return targetLabels[target] || target; }

function insertToken(type, token) {
  if (type === 'birthday') {
    birthdaySettings.value.content = `${birthdaySettings.value.content}${birthdaySettings.value.content ? ' ' : ''}${token}`;
  }
}

async function saveBirthdaySettings() {
  try {
    const res = await apiClient.post('/admin/email-campaign/settings', {
      is_auto_birthday: birthdaySettings.value.enabled,
      birthday_subject: birthdaySettings.value.subject,
      birthday_content: birthdaySettings.value.content,
    });

    if (res.data?.success) {
      birthdaySettings.value.enabled = !!res.data.data.is_auto_birthday;
      birthdaySettings.value.subject = res.data.data.birthday_subject || '';
      birthdaySettings.value.content = res.data.data.birthday_content || '';
      showToast(res.data.message || 'Da luu cau hinh sinh nhat');
    } else {
      showToast(res.data?.message || 'Luu cau hinh that bai', 'error');
    }
  } catch (err) {
    showToast('Luu cau hinh that bai', 'error');
  }
}

function replaceTokens(text, customer, voucherCode) {
  return text.replaceAll('[Tên_Khách_Hàng]', customer.name).replaceAll('[Voucher_Code]', voucherCode || '');
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleString('vi-VN');
}

function formatEventType(typeStr) {
  if (typeStr === 'birthday') return 'Sinh nhật';
  if (typeStr?.startsWith('holiday_')) return `Sự kiện #${typeStr.split('_')[1]}`;
  return typeStr;
}

async function clearLogs() {
  const result = await Swal.fire({
    title: 'Xóa vĩnh viễn lịch sử?',
    text: 'Toàn bộ log gửi email đang hiển thị sẽ bị xóa khỏi hệ thống.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa lịch sử',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#dc3545',
  });

  if (!result.isConfirmed) return;

  try {
    const res = await apiClient.delete('/admin/email-campaign/recent-logs');
    if (res.data?.success) {
      emailLogs.value = [];
      showToast(res.data.message || 'Đã xóa vĩnh viễn lịch sử');
    } else {
      showToast(res.data?.message || 'Xóa lịch sử thất bại', 'error');
    }
  } catch (err) {
    showToast('Xóa lịch sử thất bại', 'error');
  }
}

function showToast(title, icon = 'success') { 
  Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 1500 }); 
}
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
.search-box { width: 240px; max-width: 100%; }
.search-box .form-control { padding-left: 16px; font-size: 0.85rem; }
.holiday-table { min-width: 700px; }
.log-table { min-width: 700px; }
.text-sm th, .text-sm td { font-size: 0.85rem; }

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
.action-button:disabled { opacity: 0.65; cursor: not-allowed; }
.action-button i:first-child { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 8px; font-size: 1.25rem; }
.action-button.birthday i:first-child { background: #fde8f1; color: #c23b6e; }
.action-button.holiday i:first-child { background: #e5f6f2; color: #00856f; }
.action-button strong, .action-button small { display: block; font-size: 0.9rem;}
.action-button small { color: #6c757d; margin-top: 2px; font-size: 0.75rem;}
.today-box { border-radius: 8px; background: #f8faf9; border: 1px solid #edf0f2; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }

@media (max-width: 575.98px) {
  .email-tabs-wrapper { overflow-x: auto; flex-wrap: nowrap; width: 100%; }
  .email-tabs-wrapper .btn { white-space: nowrap; }
  .sora-tp-body { padding: 16px; }
}
</style>
