<template>
  <div class="email-campaign-edit pb-5">
    <div class="container-fluid py-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <button class="btn btn-light border fw-semibold shadow-sm" @click="router.back()">
          <i class="bi bi-arrow-left"></i> Quay lại
        </button>
        <div>
          <h4 class="fw-bold text-dark mb-0">Cập nhật sự kiện</h4>
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
        <!-- Cột Form Nhập Liệu -->
        <div class="col-xl-6">
          <div class="card border-0 shadow-sm form-card h-100">
            <div class="card-header bg-white border-0 pt-4 px-4">
              <h5 class="fw-bold mb-0 text-brand">Sửa đổi cấu hình</h5>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="updateHoliday">
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted text-uppercase">Tên sự kiện / ngày lễ</label>
                  <input v-model.trim="holidayForm.name" type="text" class="form-control" required>
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label class="form-label fw-bold small text-muted text-uppercase">Ngày</label>
                    <input v-model="holidayForm.day" type="number" min="1" max="31" class="form-control" required>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-bold small text-muted text-uppercase">Tháng</label>
                    <input v-model="holidayForm.month" type="number" min="1" max="12" class="form-control" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted text-uppercase">Đối tượng nhận</label>
                  <select v-model="holidayForm.target" class="form-select">
                    <option value="all">Tất cả</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="member">Hạng Thành viên</option>
                    <option value="silver">Hạng Bạc</option>
                    <option value="gold">Hạng Vàng</option>
                    <option value="diamond">Hạng Kim cương</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted text-uppercase">Tiêu đề email</label>
                  <input v-model.trim="holidayForm.subject" type="text" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted text-uppercase">Nội dung email</label>
                  <div class="editor-toolbar border rounded-top bg-light px-2 py-1">
                    <button type="button" class="btn btn-sm btn-light border me-1" title="Chèn tên khách" @click="insertToken('[Tên_Khách_Hàng]')">
                      <i class="bi bi-person-badge"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-light border" title="Chèn mã voucher" @click="insertToken('[Voucher_Code]')">
                      <i class="bi bi-ticket-perforated"></i>
                    </button>
                  </div>
                  <textarea v-model="holidayForm.content" class="form-control rounded-top-0 border-top-0" rows="6" required></textarea>
                </div>
                <div class="d-flex align-items-center justify-content-between bg-light border rounded-3 p-3 mb-3">
                  <div>
                    <div class="fw-bold text-dark">Kèm quà tặng</div>
                  </div>
                  <div class="form-check form-switch m-0 fs-5">
                    <input v-model="holidayForm.hasVoucher" class="form-check-input" type="checkbox" role="switch">
                  </div>
                </div>
                <div class="row g-3 mb-4" v-if="holidayForm.hasVoucher">
                  <div class="col-sm-6">
                    <label class="form-label fw-bold small text-muted text-uppercase">Mã quà tặng</label>
                    <input v-model.trim="holidayForm.voucherCode" type="text" class="form-control text-uppercase">
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-bold small text-muted text-uppercase">Mức ưu đãi</label>
                    <input v-model.trim="holidayForm.discount" type="text" class="form-control">
                  </div>
                </div>
                <div class="mt-4 border-top pt-4">
                  <button class="btn btn-brand text-white fw-bold px-5" type="submit">
                    <i class="bi bi-floppy me-1"></i> Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Cột Preview Email -->
        <div class="col-xl-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 pt-4 px-4">
              <h5 class="fw-bold mb-1">Xem trước email</h5>
            </div>
            <div class="card-body p-4 bg-light rounded-bottom-3 overflow-auto">
              <div class="sora-template-preview shadow-sm border mx-auto">
                <div class="sora-tp-header">HỆ THỐNG SORA THINKHUB</div>
                <div class="sora-tp-body">
                  <div class="sora-tp-banner">
                    ✨ QUÀ TẶNG ĐẶC QUYỀN {{ holidayForm.name ? `NHÂN DỊP ${holidayForm.name.toUpperCase()}` : 'NHÂN DỊP LỄ' }}!
                  </div>
                  <div class="sora-tp-content" v-html="previewHolidayContent"></div>
                  
                  <table class="sora-tp-table" v-if="holidayForm.hasVoucher">
                    <tr>
                      <td>Mã quà tặng:</td>
                      <td class="text-danger fw-bold fs-6">{{ holidayForm.voucherCode || '...' }}</td>
                    </tr>
                    <tr>
                      <td>Mức ưu đãi:</td>
                      <td class="text-danger fw-bold">{{ holidayForm.discount || '...' }}</td>
                    </tr>
                    <tr>
                      <td>Áp dụng cho:</td>
                      <td>Tất cả các bộ sưu tập trang sức</td>
                    </tr>
                    <tr>
                      <td>Hạn sử dụng:</td>
                      <td>30/05/2026</td>
                    </tr>
                  </table>
                  <button class="sora-tp-btn mt-4">CHỌN MÓN TRANG SỨC CHO RIÊNG MÌNH</button>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const eventId = route.params.id; // Lấy ID từ URL

const isLoading = ref(true);

const holidayForm = ref({
  name: '',
  day: 1,
  month: 1,
  target: 'all',
  subject: '',
  content: '',
  hasVoucher: false,
  voucherCode: '',
  discount: '',
});

// Giả lập Dữ liệu Cũ
onMounted(() => {
  // TODO: Call API GET detail Event theo `eventId` tại đây. (Ví dụ: axios.get(`/api/holidays/${eventId}`))
  setTimeout(() => {
    holidayForm.value = {
      name: 'Quốc tế Phụ nữ 8/3',
      day: 8,
      month: 3,
      target: 'female',
      subject: 'SORA gửi bạn ưu đãi đặc biệt ngày 8/3',
      content: 'Xin chào [Tên_Khách_Hàng],\n\nCảm ơn bạn đã tin tưởng đồng hành cùng chúng tôi. SORA xin dành tặng bạn một ưu đãi đặc biệt.',
      hasVoucher: true,
      voucherCode: 'SORA0803',
      discount: '15%',
    };
    isLoading.value = false;
  }, 500); // Fake delay load API
});

const mockCustomer = { name: 'Lê Thị Mỹ Duyên' };

const previewHolidayContent = computed(() => {
  let content = holidayForm.value.content || '';
  const voucher = holidayForm.value.hasVoucher ? holidayForm.value.voucherCode : '';
  content = content.replaceAll('[Tên_Khách_Hàng]', mockCustomer.name);
  content = content.replaceAll('[Voucher_Code]', voucher);
  return content.replace(/\n/g, '<br>');
});

function insertToken(token) {
  holidayForm.value.content = `${holidayForm.value.content}${holidayForm.value.content ? ' ' : ''}${token}`;
}

async function updateHoliday() {
  // TODO: Tích hợp API PUT update sự kiện tại đây
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Đã cập nhật sự kiện!',
    showConfirmButton: false,
    timer: 1500
  });

  setTimeout(() => {
    router.push('/admin/email-campaign');
  }, 1000);
}
</script>

<style scoped>
.text-brand { color: #009981; }
.btn-brand { background: #009981; border-color: #009981; }
.btn-brand:hover { background: #007f6c; border-color: #007f6c; }
.card { border-radius: 8px; }
.editor-toolbar .btn { width: 34px; height: 30px; padding: 0; }

/* SORA EMAIL PREVIEW CSS */
.sora-template-preview { background: #fff; border-radius: 4px; overflow: hidden; font-family: Arial, sans-serif; max-width: 100%; }
.sora-tp-header { background-color: #343a40; color: #fff; text-align: center; padding: 20px; font-weight: 700; font-size: 16px; text-transform: uppercase; }
.sora-tp-body { padding: 30px; }
.sora-tp-banner { background-color: #fdf3f4; color: #a42637; padding: 12px 16px; border-left: 4px solid #a42637; font-weight: bold; font-size: 14px; margin-bottom: 24px; text-transform: uppercase; }
.sora-tp-content { color: #495057; line-height: 1.7; font-size: 14px; margin-bottom: 28px; }
.sora-tp-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px; }
.sora-tp-table td { padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
.sora-tp-table tr:last-child td { border-bottom: none; }
.sora-tp-table td:first-child { color: #6c757d; font-weight: 600; width: 35%; }
.sora-tp-table td:last-child { color: #212529; font-weight: 700; }
.sora-tp-table .text-danger { color: #a42637 !important; }
.sora-tp-btn { background-color: #a42637; color: #fff; border: none; padding: 14px 24px; font-weight: bold; border-radius: 4px; display: block; margin: 0 auto; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
.sora-tp-btn:hover { opacity: 0.9; }
</style>