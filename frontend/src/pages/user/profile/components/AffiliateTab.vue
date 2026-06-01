<template>
  <div class="affiliate-dashboard-wrapper fade-in">
    <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-10">
      <div class="bg-primary-luxury text-white rounded-circle d-flex justify-content-center align-items-center" style="width: 45px; height: 45px;">
        <i class="bi bi-diagram-3-fill fs-5"></i>
      </div>
      <div>
        <h4 class="font-serif fw-bold text-dark mb-1">Chương Trình Đối Tác</h4>
        <p class="text-muted small mb-0 font-luxury">Trở thành Đại sứ thương hiệu SORA</p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary-luxury" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <div v-if="affiliateData.is_affiliate" class="affiliate-dashboard">
        <div class="alert bg-light border border-gold border-opacity-50 rounded-4 p-4 mb-4 shadow-sm text-center position-relative overflow-hidden">
          <i class="bi bi-stars position-absolute text-gold opacity-25" style="font-size: 8rem; top: -20px; right: -10px;"></i>
          <h5 class="font-serif fw-bold text-dark mb-3">Chào mừng Đại sứ SORA!</h5>
          <p class="text-muted small mb-4">Chia sẻ mã hoặc đường link dưới đây để nhận hoa hồng từ mỗi đơn hàng thành công.</p>
          
          <div class="row g-4 justify-content-center">
            <div class="col-md-5">
              <div class="p-3 bg-white rounded-3 border shadow-sm">
                <span class="d-block text-muted small text-uppercase tracking-widest font-oswald mb-2">Mã Giới Thiệu Của Bạn</span>
                <h3 class="fw-bold text-primary-luxury font-serif mb-0 tracking-widest">{{ affiliateData.affiliate_code }}</h3>
              </div>
            </div>
            <div class="col-md-5">
              <div class="p-3 bg-white rounded-3 border shadow-sm">
                <span class="d-block text-muted small text-uppercase tracking-widest font-oswald mb-2">Số Dư Hoa Hồng</span>
                <h3 class="fw-bold text-success font-serif mb-0">{{ formatCurrency(affiliateData.commission_balance) }}</h3>
              </div>
            </div>
          </div>

          <div class="mt-4 max-w-500 mx-auto">
            <div class="input-group shadow-sm">
              <input type="text" class="form-control bg-white font-luxury small text-muted" :value="generateAffiliateLink()" readonly>
              <button @click="copyLink" class="btn btn-luxury-primary font-oswald tracking-widest text-uppercase" style="font-size: 0.85rem;">
                <i class="bi bi-clipboard me-1"></i> Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="applicationStatus === 'pending'" class="text-center py-5">
        <div class="mb-4">
          <i class="bi bi-hourglass-split text-gold display-1 opacity-75"></i>
        </div>
        <h4 class="font-serif fw-bold text-dark mb-3">Đơn Đăng Ký Đang Được Xử Lý</h4>
        <p class="text-muted max-w-600 mx-auto lh-lg">
          Cảm ơn bạn đã quan tâm đến chương trình Đối tác của SORA. Đội ngũ của chúng tôi đang tiến hành xem xét hồ sơ của bạn và sẽ phản hồi trong thời gian sớm nhất.
        </p>
      </div>

      <div v-else-if="applicationStatus === 'rejected'" class="text-center py-5">
        <div class="mb-4">
          <i class="bi bi-x-circle text-danger display-1 opacity-75"></i>
        </div>
        <h4 class="font-serif fw-bold text-dark mb-3">Đơn Đăng Ký Chưa Phù Hợp</h4>
        <p class="text-muted max-w-600 mx-auto mb-2">Rất tiếc, hồ sơ của bạn hiện tại chưa phù hợp với tiêu chí của chương trình Đại sứ SORA.</p>
        <p v-if="adminNotes" class="text-danger small fst-italic mb-4">"{{ adminNotes }}"</p>
        
        <button @click="resetForm" class="btn btn-outline-main font-oswald tracking-wide text-uppercase px-4 py-2">
          Đăng ký lại
        </button>
      </div>

      <div v-else class="affiliate-form bg-light p-4 p-md-5 rounded-4 border border-secondary border-opacity-10">
        <div class="text-center mb-4">
          <h4 class="font-serif fw-bold text-dark mb-2">Đăng Ký Trở Thành Đại Sứ</h4>
          <p class="text-muted small">Vui lòng cung cấp thông tin để chúng tôi hiểu hơn về tiềm năng hợp tác cùng bạn.</p>
        </div>

        <form @submit.prevent="submitApplication">
          <div class="mb-4">
            <label class="form-label font-luxury fw-bold small text-dark">Liên kết Mạng xã hội / Website <span class="text-danger">*</span></label>
            <textarea v-model="form.social_links" class="form-control font-luxury custom-input" rows="3" placeholder="Nhập link Facebook, Tiktok, Instagram hoặc Website cá nhân của bạn..." required></textarea>
            <div class="form-text small text-muted">Những nền tảng bạn dự định sử dụng để giới thiệu SORA.</div>
          </div>

          <div class="mb-4">
            <label class="form-label font-luxury fw-bold small text-dark">Giới thiệu ngắn về bạn <span class="text-danger">*</span></label>
            <textarea v-model="form.introduce_message" class="form-control font-luxury custom-input" rows="4" placeholder="Chia sẻ lý do bạn muốn hợp tác và tệp khách hàng bạn đang hướng tới..." required></textarea>
          </div>

          <div class="text-center mt-5">
            <button type="submit" class="btn btn-main text-uppercase tracking-wide font-oswald px-5 py-3 w-100 max-w-400" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              Gửi Đơn Đăng Ký
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Swal from 'sweetalert2';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');
const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('access_token');

const isLoading = ref(true);
const isSubmitting = ref(false);

const affiliateData = reactive({
  is_affiliate: false,
  affiliate_code: null,
  commission_balance: 0,
});

const applicationStatus = ref(null); // 'pending', 'approved', 'rejected', null
const adminNotes = ref('');

const form = reactive({
  social_links: '',
  introduce_message: ''
});

// Lấy trạng thái hiện tại
const fetchStatus = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/client/affiliate/status`, {
      headers: { 
        'Authorization': `Bearer ${getToken()}`,
        'Accept': 'application/json' 
      }
    });
    const result = await res.json();
    
    if (result.success && result.data) {
      affiliateData.is_affiliate = result.data.is_affiliate;
      affiliateData.affiliate_code = result.data.affiliate_code;
      affiliateData.commission_balance = result.data.commission_balance || 0;
      
      if (result.data.application) {
        applicationStatus.value = result.data.application.status;
        adminNotes.value = result.data.application.admin_notes || '';
      }
    }
  } catch (error) {
    console.error("Lỗi tải dữ liệu Affiliate:", error);
  } finally {
    isLoading.value = false;
  }
};

// Gửi form nộp đơn
const submitApplication = async () => {
  if (!form.social_links.trim() || !form.introduce_message.trim()) return;
  
  isSubmitting.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/client/affiliate/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        social_links: form.social_links,
        introduce_message: form.introduce_message
      })
    });
    
    const result = await res.json();
    
    if (result.success) {
      Swal.fire({ icon: 'success', title: 'Thành công!', text: result.message, confirmButtonColor: '#9f273b' });
      applicationStatus.value = 'pending'; // Cập nhật giao diện ngay lập tức
    } else {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: result.message });
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi hệ thống', text: 'Vui lòng thử lại sau.' });
  } finally {
    isSubmitting.value = false;
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
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã copy link!', showConfirmButton: false, timer: 1500 });
};

onMounted(() => {
  fetchStatus();
});
</script>

<style scoped>
.custom-input {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 15px;
  transition: all 0.3s ease;
}
.custom-input:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.15);
  outline: none;
}
.max-w-400 { max-width: 400px; }
.max-w-500 { max-width: 500px; }
.max-w-600 { max-width: 600px; }

/* CSS Tái sử dụng nút luxury (Nếu component cha chưa có) */
.bg-primary-luxury { background-color: #9f273b !important; }
.text-primary-luxury { color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }
.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-widest { letter-spacing: 0.15em; }
.tracking-wide { letter-spacing: 0.1em; }

.btn-main { background-color: #9f273b; color: white; border: 1px solid #9f273b; border-radius: 4px; transition: all 0.3s ease; }
.btn-main:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159,39,59,0.3); }

.btn-outline-main { color: #9f273b; border: 1px solid #9f273b; border-radius: 4px; background: transparent; transition: all 0.3s ease; }
.btn-outline-main:hover { background-color: #9f273b; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159,39,59,0.3); }

.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>