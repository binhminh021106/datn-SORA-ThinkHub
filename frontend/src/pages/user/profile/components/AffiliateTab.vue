<template>
  <div class="affiliate-dashboard-wrapper fade-in pt-2 bg-white shadow-sm border border-light rounded-3 p-4 p-md-5 mb-4">
    <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-10">
      <div class="bg-primary-luxury text-white rounded-circle d-flex justify-content-center align-items-center" style="width: 45px; height: 45px;">
        <i class="bi bi-diagram-3-fill fs-5"></i>
      </div>
      <div>
        <h4 class="font-serif fw-bold text-dark mb-1">Chương Trình Đối Tác</h4>
        <p class="text-muted small mb-0 font-luxury">Trở thành Đại sứ thương hiệu SORA</p>
      </div>
    </div>

    <SoraListSkeleton v-if="isLoading" :rows="4" :image="false" card />

    <div v-else>
      <div v-if="affiliateData.is_affiliate" class="affiliate-dashboard">
        
        <div class="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
          <div class="flex-grow-1">
            <h5 class="font-serif fw-bold text-dark mb-2">
              Chào mừng Đại sứ, <span class="text-primary-luxury">{{ affiliateData.affiliate_code }}</span> <i class="bi bi-patch-check-fill text-gold ms-1"></i>
            </h5>
            <div class="input-group shadow-sm" style="width: 100%; max-width: 550px;">
              <input type="text" class="form-control bg-white font-luxury small text-muted border-secondary border-opacity-25" :value="generateAffiliateLink()" readonly>
              <button @click="copyLink" class="btn bg-primary-luxury text-white font-oswald tracking-widest text-uppercase" style="font-size: 0.8rem;">
                <i class="bi bi-clipboard me-1"></i> Copy Link
              </button>
            </div>
          </div>
          <button @click="openWithdrawModal" class="editorial-btn shadow-sm rounded-pill">
            <i class="bi bi-wallet2 me-2"></i> Yêu cầu Rút tiền
          </button>
        </div>

        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="card border-0 shadow-sm rounded-4 h-100 bg-primary-luxury text-white overflow-hidden position-relative">
                    <div class="card-body p-4 position-relative z-1">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px;">
                                <i class="bi bi-cash-coin fs-4 text-gold"></i>
                            </div>
                            <h6 class="mb-0 fw-semibold text-white-50 font-luxury">Số dư Khả dụng</h6>
                        </div>
                        <h2 class="fw-bold mb-0 font-oswald">{{ formatCurrency(dashboardStats.available_balance) }}</h2>
                        <small class="text-gold mt-2 d-block font-luxury"><i class="bi bi-check2-circle me-1"></i>Có thể rút ngay</small>
                    </div>
                    <i class="bi bi-stars position-absolute text-white opacity-10" style="font-size: 8rem; bottom: -20px; right: -20px;"></i>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card border border-secondary border-opacity-10 shadow-sm rounded-4 h-100 bg-white">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px;">
                                <i class="bi bi-hourglass-split fs-4"></i>
                            </div>
                            <h6 class="mb-0 fw-semibold text-muted font-luxury">Hoa hồng Chờ duyệt</h6>
                        </div>
                        <h2 class="fw-bold text-dark mb-0 font-oswald">{{ formatCurrency(dashboardStats.pending_balance) }}</h2>
                        <small class="text-muted mt-2 d-block font-luxury">Đơn hàng đang giao dịch</small>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card border border-secondary border-opacity-10 shadow-sm rounded-4 h-100 bg-white">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px;">
                                <i class="bi bi-bank fs-4"></i>
                            </div>
                            <h6 class="mb-0 fw-semibold text-muted font-luxury">Tổng tiền Đã rút</h6>
                        </div>
                        <h2 class="fw-bold text-dark mb-0 font-oswald">{{ formatCurrency(dashboardStats.total_withdrawn) }}</h2>
                        <small class="text-muted mt-2 d-block font-luxury">Từ trước đến nay</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border border-secondary border-opacity-10 shadow-sm rounded-4 mb-4">
            <div class="card-header bg-white pt-4 pb-3 border-bottom px-4">
                <h6 class="font-serif fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-primary-luxury"></i>Lịch sử biến động số dư</h6>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 font-luxury">
                        <thead class="bg-light text-muted small text-uppercase tracking-wide font-oswald">
                            <tr>
                                <th class="px-4 py-3">Thời gian</th>
                                <th class="py-3">Mã Giao dịch / Đơn hàng</th>
                                <th class="py-3">Phân loại</th>
                                <th class="py-3 text-end">Số tiền</th>
                                <th class="px-4 py-3 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="histories.length === 0">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    <i class="bi bi-inbox fs-2 opacity-25 d-block mb-2"></i>
                                    Chưa có giao dịch nào phát sinh.
                                </td>
                            </tr>
                            <tr v-else v-for="item in histories" :key="item.id">
                                <td class="px-4 py-3 text-muted small">{{ item.created_at }}</td>
                                <td class="py-3 fw-semibold text-dark">{{ item.reference_code }}</td>
                                <td class="py-3">
                                    <span v-if="item.type === 'earn'" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 fw-normal">Nhận Hoa Hồng</span>
                                    <span v-else class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 fw-normal">Rút Tiền</span>
                                </td>
                                <td class="py-3 text-end fw-bold font-oswald tracking-wide" :class="item.type === 'earn' ? 'text-success' : 'text-primary-luxury'">
                                    {{ item.type === 'earn' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span v-if="item.status === 'approved' || item.status === 'withdrawn'" class="text-success small fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Thành công</span>
                                    <span v-else-if="item.status === 'pending'" class="text-warning small fw-bold"><i class="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>
                                    <span v-else-if="item.status === 'rejected'" class="text-danger small fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Từ chối</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <div v-else-if="applicationStatus === 'pending'" class="py-5">
        <div class="mb-4">
          <i class="bi bi-hourglass-split text-gold display-1 opacity-75"></i>
        </div>
        <h4 class="font-serif fw-bold text-dark mb-3">Đơn Đăng Ký Đang Được Xử Lý</h4>
        <p class="text-muted lh-lg font-luxury">
          Cảm ơn bạn đã quan tâm đến chương trình Đối tác của SORA. Đội ngũ của chúng tôi đang tiến hành xem xét hồ sơ của bạn và sẽ phản hồi trong thời gian sớm nhất.
        </p>
      </div>

      <div v-else-if="applicationStatus === 'rejected'" class="py-5">
        <div class="mb-4">
          <i class="bi bi-x-circle text-danger display-1 opacity-75"></i>
        </div>
        <h4 class="font-serif fw-bold text-dark mb-3">Đơn Đăng Ký Chưa Phù Hợp</h4>
        <p class="text-muted mb-2 font-luxury">Rất tiếc, hồ sơ của bạn hiện tại chưa phù hợp với tiêu chí của chương trình Đại sứ SORA.</p>
        <p v-if="adminNotes" class="text-danger small fst-italic mb-4 font-luxury">"{{ adminNotes }}"</p>
        
        <button @click="resetForm" class="editorial-btn-outline px-4 py-2">
          Đăng ký lại
        </button>
      </div>

      <div v-else class="affiliate-form py-4">
        <div class="mb-5">
          <h4 class="font-serif fw-bold text-dark mb-3">Đăng Ký Trở Thành Đại Sứ</h4>
          <p class="text-muted small font-luxury lh-lg">
            Chia sẻ đam mê trang sức và nhận hoa hồng hấp dẫn. Vui lòng cung cấp thông tin để chúng tôi hiểu hơn về nền tảng và tiềm năng hợp tác cùng bạn.
          </p>
        </div>

        <form @submit.prevent="submitApplication" class="w-100">
          <div class="mb-4">
            <label class="form-label font-oswald tracking-wide small text-dark fw-bold text-uppercase">Liên kết Mạng xã hội / Website <span class="text-danger">*</span></label>
            <textarea v-model="form.social_links" class="form-control rounded-0 font-luxury sora-textarea" rows="3" placeholder="Ví dụ: Link Facebook, Tiktok, Instagram hoặc Website cá nhân của bạn..." required></textarea>
            <div class="form-text small text-muted mt-2 fst-italic font-serif"><i class="bi bi-info-circle me-1"></i>Những nền tảng bạn dự định sử dụng để chia sẻ sản phẩm SORA.</div>
          </div>

          <div class="mb-4">
            <label class="form-label font-oswald tracking-wide small text-dark fw-bold text-uppercase">Giới thiệu ngắn về bạn <span class="text-danger">*</span></label>
            <textarea v-model="form.introduce_message" class="form-control rounded-0 font-luxury sora-textarea" rows="4" placeholder="Chia sẻ lý do bạn muốn hợp tác và tệp khách hàng bạn đang hướng tới..." required></textarea>
          </div>

          <div class="mt-5">
            <button type="submit" class="editorial-btn px-5 py-3 sora-btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐƠN ĐĂNG KÝ TỚI SORA' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal fade" id="withdrawModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-0 shadow">
          <div class="modal-header border-bottom py-3 bg-white rounded-0">
            <h5 class="modal-title font-serif fw-bold text-dark d-flex align-items-center tracking-wide">
              <i class="bi bi-bank text-primary-luxury me-2 fs-4"></i> TẠO YÊU CẦU RÚT TIỀN
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="submitWithdraw">
            <div class="modal-body p-4 font-luxury">
              <div class="p-3 bg-light rounded-0 mb-4 d-flex align-items-center justify-content-between border">
                <span class="small text-muted fw-medium font-oswald text-uppercase tracking-wide">Số dư khả dụng hiện tại:</span>
                <span class="fw-bold text-primary-luxury fs-4 font-oswald">{{ formatCurrency(dashboardStats.available_balance) }}</span>
              </div>

              <div class="mb-3">
                <label class="form-label font-oswald tracking-wide small text-dark fw-bold text-uppercase">Số tiền muốn rút (VND) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input type="number" v-model.number="withdrawForm.amount" class="form-control rounded-0 font-luxury fw-bold text-dark sora-input" min="200000" :max="dashboardStats.available_balance" placeholder="Tối thiểu 200.000đ" required>
                  <span class="input-group-text bg-white rounded-0 text-muted font-oswald sora-input-addon">VNĐ</span>
                </div>
                <div class="form-text text-muted small mt-1 font-serif fst-italic">Hạn mức rút tối thiểu là 200.000đ mỗi giao dịch.</div>
              </div>

              <div class="mb-3">
                <label class="form-label font-oswald tracking-wide small text-dark fw-bold text-uppercase">Tên Ngân Hàng <span class="text-danger">*</span></label>
                <input type="text" v-model="withdrawForm.bank_name" class="form-control rounded-0 font-luxury sora-input" placeholder="VD: Vietcombank, Techcombank, MB Bank..." required>
              </div>

              <div class="mb-3">
                <label class="form-label font-oswald tracking-wide small text-dark fw-bold text-uppercase">Số Tài Khoản Ngân Hàng <span class="text-danger">*</span></label>
                <input type="text" v-model="withdrawForm.account_number" class="form-control rounded-0 font-monospace sora-input" placeholder="Nhập số tài khoản..." required>
              </div>

              <div class="mb-3">
                <label class="form-label font-oswald tracking-wide small text-dark fw-bold text-uppercase">Tên Chủ Tài Khoản (Viết hoa không dấu) <span class="text-danger">*</span></label>
                <input type="text" v-model="withdrawForm.account_holder_name" class="form-control rounded-0 font-luxury text-uppercase sora-input" placeholder="VD: NGUYEN VAN A" required>
              </div>
            </div>
            
            <div class="modal-footer border-top p-3 bg-white justify-content-center">
              <button type="button" class="editorial-btn-outline px-4 py-2" data-bs-dismiss="modal">Hủy Bỏ</button>
              <button type="submit" class="editorial-btn px-5 py-2" :disabled="isWithdrawing || dashboardStats.available_balance < 200000">
                <span v-if="isWithdrawing" class="spinner-border spinner-border-sm me-2"></span>
                Xác Nhận Rút Tiền
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Toast from '@/utils/toastConfig';
import soraAlert from '@/utils/soraAlertConfig';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import clientApiClient from '@/utils/clientApiClient';

const isLoading = ref(true);
const isSubmitting = ref(false);
const isWithdrawing = ref(false);

const affiliateData = reactive({
  is_affiliate: false,
  affiliate_code: null,
  commission_balance: 0,
});

const dashboardStats = ref({
    available_balance: 0,
    pending_balance: 0,
    total_withdrawn: 0
});
const histories = ref([]);

const applicationStatus = ref(null); 
const adminNotes = ref('');

const form = reactive({
  social_links: '',
  introduce_message: ''
});

// Form dữ liệu rút tiền
const withdrawForm = reactive({
  amount: '',
  bank_name: '',
  account_number: '',
  account_holder_name: ''
});

// ==========================================
// 1. TẢI TRẠNG THÁI & THỐNG KÊ TỪ API
// ==========================================
const fetchStatus = async () => {
  isLoading.value = true;
  try {
    const { data: result } = await clientApiClient.get('/client/affiliate/status');
    
    if (result.success && result.data) {
      affiliateData.is_affiliate = result.data.is_affiliate;
      affiliateData.affiliate_code = result.data.affiliate_code;
      affiliateData.commission_balance = result.data.commission_balance;
      
      if (result.data.application) {
        applicationStatus.value = result.data.application.status;
        adminNotes.value = result.data.application.admin_notes || '';
      }

      if (result.data.is_affiliate) {
          dashboardStats.value = result.data.dashboard_stats || { 
              available_balance: 0, 
              pending_balance: 0, 
              total_withdrawn: 0 
          };
          histories.value = result.data.histories || [];
      }
    }
  } catch (error) {
    console.error("Lỗi kết nối hệ thống Affiliate:", error);
  } finally {
    isLoading.value = false;
  }
};

// ==========================================
// 2. GỬI ĐƠN ĐĂNG KÝ LÀM ĐỐI TÁC
// ==========================================
const submitApplication = async () => {
  if (!form.social_links.trim() || !form.introduce_message.trim()) return;
  
  isSubmitting.value = true;
  try {
    const { data: result } = await clientApiClient.post('/client/affiliate/apply', {
      social_links: form.social_links,
      introduce_message: form.introduce_message
    });
    
    if (result.success) {
      soraAlert.fire({ icon: 'success', title: 'Thành công!', text: result.message });
      applicationStatus.value = 'pending'; 
    } else {
      soraAlert.fire({ icon: 'error', title: 'Lỗi', text: result.message });
    }
  } catch (error) {
    soraAlert.fire({ icon: 'error', title: 'Lỗi hệ thống', text: 'Vui lòng thử lại sau.' });
  } finally {
    isSubmitting.value = false;
  }
};

// ==========================================
// 3. GỬI YÊU CẦU ĐẶT LỆNH RÚT TIỀN THẬT
// ==========================================
const submitWithdraw = async () => {
  if (withdrawForm.amount < 200000) {
    soraAlert.fire('Chú ý', 'Số tiền rút tối thiểu phải từ 200.000đ trở lên.', 'warning');
    return;
  }
  if (withdrawForm.amount > dashboardStats.value.available_balance) {
    soraAlert.fire('Thất bại', 'Số dư tài khoản của bạn không đủ để rút số tiền này.', 'error');
    return;
  }

  isWithdrawing.value = true;
  try {
    const { data: result } = await clientApiClient.post('/client/affiliate/withdraw', withdrawForm);
    
    if (result.success) {
      // Ẩn modal rút tiền bằng Bootstrap API
      const modalEl = document.getElementById('withdrawModal');
      const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      soraAlert.fire({ icon: 'success', title: 'Đã gửi yêu cầu!', text: result.message });
      
      // Reset form rút tiền
      withdrawForm.amount = '';
      withdrawForm.bank_name = '';
      withdrawForm.account_number = '';
      withdrawForm.account_holder_name = '';

      // Tải lại bảng thống kê số dư mới sau khi đã bị đóng băng trừ tiền
      fetchStatus(); 
    } else {
      soraAlert.fire({ icon: 'error', title: 'Lỗi', text: result.message });
    }
  } catch (error) {
    soraAlert.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.' });
  } finally {
    isWithdrawing.value = false;
  }
};

// Tiện ích
const resetForm = () => {
  applicationStatus.value = null;
  form.social_links = '';
  form.introduce_message = '';
};

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const generateAffiliateLink = () => {
  const domain = window.location.origin;
  return `${domain}?ref=${affiliateData.affiliate_code}`;
};

const copyLink = () => {
  navigator.clipboard.writeText(generateAffiliateLink());
  Toast.fire({ icon: 'success', title: 'Đã copy link!', timer: 1500 });
};

// Mở modal rút tiền bằng Bootstrap
const openWithdrawModal = () => {
  if (dashboardStats.value.available_balance < 200000) {
    soraAlert.fire('Hạn mức không đủ', 'Số dư ví khả dụng phải có tối thiểu từ 200.000đ trở lên để làm lệnh rút tiền.', 'warning');
    return;
  }
  const m = new window.bootstrap.Modal(document.getElementById('withdrawModal'));
  m.show();
};

onMounted(() => {
  fetchStatus();
});
</script>

<style scoped>
.form-control:focus {
  border-color: #9f273b;
  box-shadow: none;
  outline: none;
}

.sora-input {
  border: 1px solid #e0e0e0;
  padding: 12px 15px;
}

.sora-textarea {
  border: 1px solid #e0e0e0;
  padding: 15px;
}

.sora-input-addon {
  border: 1px solid #e0e0e0;
  border-left: none;
}

.sora-btn-submit {
  letter-spacing: 0.1em;
  border-radius: 10px;
}

.max-w-400 { max-width: 400px; }
.max-w-500 { max-width: 500px; }
.max-w-600 { max-width: 600px; }

/* CSS Tái sử dụng nút luxury */
.bg-primary-luxury { background-color: #9f273b !important; }
.text-primary-luxury { color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }
.font-luxury { font-family: 'Manrope', sans-serif; }
.font-serif { font-family: 'Josefin Sans', sans-serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-widest { letter-spacing: 0.15em; }
.tracking-wide { letter-spacing: 0.1em; }



.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
