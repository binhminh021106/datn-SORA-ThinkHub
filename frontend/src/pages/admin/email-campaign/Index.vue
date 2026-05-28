<template>
  <div class="email-campaign-page pb-4">
    <div class="container-fluid py-3">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-2 mb-3">
        <div>
          
          <h4 class="fw-bold text-dark mb-1">Gửi email tự động Lễ & Sinh nhật</h4>
          <p class="text-muted small mb-0">Quản lý chiến dịch, mẫu nội dung và thao tác kiểm tra gửi email cho khách hàng.</p>
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
                      <td class="px-3 py-2 small fw-semibold">{{ log.sentAt }}</td>
                      <td class="px-3 py-2"><span class="badge bg-secondary bg-opacity-10 text-secondary border">{{ log.eventType }}</span></td>
                      <td class="px-3 py-2">
                        <div class="fw-bold small">{{ log.customerName }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">{{ log.email }}</div>
                      </td>
                      <td class="px-3 py-2">
                        <span v-if="log.voucherCode" class="badge bg-light text-dark border font-monospace">{{ log.voucherCode }}</span>
                        <span v-else class="text-muted" style="font-size: 0.75rem;">Không có</span>
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
                        <div class="text-muted text-truncate" style="font-size: 0.75rem;" :title="event.subject">{{ event.subject }}</div>
                      </td>
                      <td class="px-3 py-2 fw-bold font-monospace text-brand small">{{ formatEventDate(event) }}</td>
                      <td class="px-3 py-2"><span class="badge bg-light text-dark border fw-normal">{{ targetLabel(event.target) }}</span></td>
                      <td class="px-3 py-2">
                        <span v-if="event.voucherCode" class="badge bg-success bg-opacity-10 text-success border border-success font-monospace">{{ event.voucherCode }}</span>
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const activeTab = ref('dashboard');
const isSending = ref(false);
const holidaySearch = ref('');

const today = new Date();
const currentYear = today.getFullYear();
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

// Dữ liệu mẫu
const holidays = ref([
  { id: 1, name: 'Quốc tế Phụ nữ 8/3', day: 8, month: 3, target: 'female', subject: 'SORA gửi bạn ưu đãi đặc biệt ngày 8/3', voucherCode: 'SORA0803', status: 'active' },
  { id: 2, name: 'Black Friday', day: 25, month: 11, target: 'all', subject: 'Black Friday: ưu đãi đặc quyền từ SORA', voucherCode: 'BLACK25', status: 'active' },
]);

// ĐÃ SỬA: Chuyển voucher dùng chung thành mảng theo hạng thành viên
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

// ĐÃ SỬA: Cập nhật tier ID của khách mẫu để tương thích với mảng tiers
const sampleCustomers = ref([
  { id: 1, name: 'Lê Thị Mỹ Duyên', email: 'myduyen@example.com', birthday: toBirthdayDate(today), gender: 'female', tier: 'diamond' },
  { id: 2, name: 'Trần Quốc Bảo', email: 'quocbao@example.com', birthday: toBirthdayDate(today), gender: 'male', tier: 'regular' },
  { id: 3, name: 'Lê Thanh Hà', email: 'thanhha@example.com', birthday: '1998-03-08', gender: 'female', tier: 'gold' },
]);

const emailLogs = ref([
  { id: 1, customerId: 3, customerName: 'Lê Thanh Hà', email: 'thanhha@example.com', eventType: 'Sinh nhật', voucherCode: 'BDAYGOLD', year: currentYear, sentAt: new Date(today.getTime() - 86400000).toLocaleString('vi-VN'), status: 'success' },
]);

// Trạng thái chọn hạng thành viên để xem trước
const previewTierId = ref('diamond');

// Computed
const filteredHolidays = computed(() => {
  const q = holidaySearch.value.toLowerCase();
  if (!q) return holidays.value;
  return holidays.value.filter((event) =>
    event.name.toLowerCase().includes(q) ||
    event.subject.toLowerCase().includes(q) ||
    (event.voucherCode || '').toLowerCase().includes(q)
  );
});

const stats = computed(() => [
  { label: 'Sự kiện đang bật', value: holidays.value.filter((item) => item.status === 'active').length, icon: 'bi-calendar-check', iconClass: 'green' },
  { label: 'Mẫu sinh nhật', value: birthdaySettings.value.enabled ? 'Đang bật' : 'Đang tắt', icon: 'bi-cake2', iconClass: 'pink' },
  { label: 'Log gửi mẫu', value: emailLogs.value.length, icon: 'bi-envelope-check', iconClass: 'blue' },
]);

// Cập nhật Computed Preview để lấy voucher từ hạng đang chọn
const previewTierData = computed(() => {
  return birthdaySettings.value.tiers.find(t => t.id === previewTierId.value) || birthdaySettings.value.tiers[0];
});

const previewBirthdaySubject = computed(() => replaceTokens(birthdaySettings.value.subject || '', sampleCustomers.value[0], previewTierData.value.voucherCode));
const previewBirthdayContent = computed(() => replaceTokens(birthdaySettings.value.content || '', sampleCustomers.value[0], previewTierData.value.voucherCode).replace(/\n/g, '<br>'));


// Navigation Functions
function goToCreate() {
  router.push({ name: 'admin-email-campaigns-create' });
}

function goToEdit(event) {
  router.push({ 
    name: 'admin-email-campaigns-edit', 
    params: { id: event.id } 
  });
}

// Logic Utils
function targetLabel(target) {
  return targetLabels[target] || target;
}

function formatEventDate(event) {
  return `${String(event.day).padStart(2, '0')}/${String(event.month).padStart(2, '0')}`;
}

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
  holidays.value = holidays.value.filter((item) => item.id !== event.id);
  showToast('Đã xóa sự kiện');
}

function toggleHolidayStatus(event) {
  event.status = event.status === 'active' ? 'inactive' : 'active';
  showToast(event.status === 'active' ? 'Đã bật sự kiện' : 'Đã tắt sự kiện');
}

function insertToken(type, token) {
  if (type === 'birthday') {
    birthdaySettings.value.content = `${birthdaySettings.value.content}${birthdaySettings.value.content ? ' ' : ''}${token}`;
  }
}

function saveBirthdaySettings() {
  showToast('Đã lưu cấu hình sinh nhật');
}

async function runBirthdayCampaign() {
  if (!birthdaySettings.value.enabled) {
    Swal.fire('Đã tắt tính năng', 'Email sinh nhật đang tắt nên hệ thống bỏ qua.', 'info');
    return;
  }
  isSending.value = true;
  await wait(500);
  
  const customers = sampleCustomers.value.filter((customer) => isSameMonthDay(customer.birthday, today));
  const pending = customers.filter((customer) => !alreadyLogged(customer.id, 'Sinh nhật'));
  
  pending.forEach((customer) => {
    // ĐÃ SỬA: Tìm voucher tương ứng với hạng của khách hàng
    const customerTierInfo = birthdaySettings.value.tiers.find(t => t.id === customer.tier) || birthdaySettings.value.tiers[0];
    pushLog(customer, 'Sinh nhật', customerTierInfo.voucherCode);
  });
  
  isSending.value = false;
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Đã gửi thành công ${pending.length} email sinh nhật.`, showConfirmButton: false, timer: 2200 });
}

async function runHolidayCampaign() {
  isSending.value = true;
  await wait(500);
  const todayEvents = holidays.value.filter((event) => event.status === 'active' && Number(event.day) === today.getDate() && Number(event.month) === today.getMonth() + 1);

  if (todayEvents.length === 0) {
    isSending.value = false;
    Swal.fire('Hoàn tất kiểm tra!', 'Hôm nay không có sự kiện nào được cài đặt.', 'info');
    return;
  }

  let sentCount = 0;
  todayEvents.forEach((event) => {
    const customers = sampleCustomers.value.filter((customer) => matchTarget(customer, event.target));
    const pending = customers.filter((customer) => !alreadyLogged(customer.id, event.name));
    pending.forEach((customer) => pushLog(customer, event.name, event.voucherCode));
    sentCount += pending.length;
  });

  isSending.value = false;
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Đã gửi thành công ${sentCount} email sự kiện.`, showConfirmButton: false, timer: 2200 });
}

function pushLog(customer, eventType, voucherCode) {
  emailLogs.value.unshift({
    id: Date.now() + Math.random(),
    customerId: customer.id,
    customerName: customer.name,
    email: customer.email,
    eventType,
    voucherCode,
    year: currentYear,
    sentAt: new Date().toLocaleString('vi-VN'),
    status: 'success',
  });
}

function alreadyLogged(customerId, eventType) {
  return emailLogs.value.some((log) => log.customerId === customerId && log.eventType === eventType && log.year === currentYear && log.status === 'success');
}

function matchTarget(customer, target) {
  if (target === 'all') return true;
  if (target === 'vip') return customer.tier === 'vip' || customer.tier === 'diamond'; // Điều chỉnh giả lập
  if (target === 'regular') return customer.tier === 'regular';
  return customer.gender === target || customer.tier === target;
}

function isSameMonthDay(dateValue, targetDate) {
  const d = new Date(dateValue);
  return d.getDate() === targetDate.getDate() && d.getMonth() === targetDate.getMonth();
}

function replaceTokens(text, customer, voucherCode) {
  return text.replaceAll('[Tên_Khách_Hàng]', customer.name).replaceAll('[Voucher_Code]', voucherCode || '');
}

function toBirthdayDate(date) {
  return `1995-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function clearLogs() {
  emailLogs.value = [];
  showToast('Đã xóa log mẫu');
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function showToast(title) { Swal.fire({ toast: true, position: 'top-end', icon: 'success', title, showConfirmButton: false, timer: 1500 }); }
</script>

<style scoped>
/* Base Colors & Utilities */
.text-brand { color: #9F273B; }
.bg-brand { background-color: #009981; }
.border-brand-focus:focus { border-color: #009981; box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.15); }
.cursor-pointer { cursor: pointer; }

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