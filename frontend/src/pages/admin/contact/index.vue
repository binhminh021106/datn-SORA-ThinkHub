<template>
  <div class="admin-contact-page p-4 min-vh-100">
    <!-- Tiêu đề & Thống kê & Bộ lọc -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h2 class="h3 font-serif mb-2 fw-bold">Hộp Thư Khách Hàng</h2>
        <div class="d-flex align-items-center gap-3">
          <p class="text-secondary mb-0 small">Quản lý các yêu cầu liên hệ Real-time.</p>
          <span v-if="isSocketActive" class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill small py-1 px-2">
            <span class="spinner-grow spinner-grow-sm me-1" style="width: 6px; height: 6px;"></span> Trực tuyến
          </span>
        </div>
      </div>
      
      <!-- KHU VỰC BỘ LỌC VÀ TÁC VỤ NHANH -->
      <div class="d-flex flex-wrap align-items-center gap-2">
        <!-- Bộ lọc trạng thái -->
        <select class="form-select form-select-sm shadow-sm border-0 rounded-3 w-auto px-3" v-model="filterStatus">
          <option value="all">Tất cả thư</option>
          <option value="pending">Chưa xử lý</option>
          <option value="resolved">Đã xử lý</option>
        </select>

        <!-- Nút Xóa hàng loạt (Chỉ hiện khi có tích chọn) -->
        <button v-if="selectedIds.length > 0" @click="bulkDelete" class="btn btn-sm btn-danger px-3 shadow-sm rounded-3 d-inline-flex align-items-center">
          <i class="bi bi-trash-fill me-2"></i> Xóa {{ selectedIds.length }} mục đã chọn
        </button>
      </div>
    </div>

    <!-- Bảng danh sách liên hệ -->
    <div class="card shadow-sm rounded-4 border-0 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr class="table-dark">
                <!-- CỘT TÍCH CHỌN TẤT CẢ -->
                <th scope="col" class="ps-4 py-3" style="width: 50px;">
                  <div class="form-check custom-checkbox">
                    <input class="form-check-input" type="checkbox" @change="selectAll($event)" :checked="isAllSelected">
                  </div>
                </th>
                <th scope="col" class="py-3 text-uppercase small">Khách Hàng</th>
                <th scope="col" class="py-3 text-uppercase small">Thông Tin</th>
                <th scope="col" class="py-3 text-uppercase small" style="max-width: 250px;">Nội Dung</th>
                <th scope="col" class="py-3 text-uppercase small text-center">Trạng Thái</th>
                <th scope="col" class="py-3 text-uppercase small">Thời Gian</th>
                <th scope="col" class="pe-4 py-3 text-uppercase small text-end">Tác Vụ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr v-else-if="filteredContacts.length === 0">
                <td colspan="7" class="text-center py-5 text-muted small">Không tìm thấy yêu cầu nào phù hợp.</td>
              </tr>
              <!-- DANH SÁCH ĐÃ ĐƯỢC LỌC VÀ SẮP XẾP -->
              <tr v-else v-for="contact in filteredContacts" :key="contact.id" :class="{'table-warning-custom': contact.status === 'pending'}">
                <td class="ps-4">
                  <div class="form-check custom-checkbox">
                    <input class="form-check-input" type="checkbox" v-model="selectedIds" :value="contact.id">
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle text-white fw-bold me-3" style="background-color: #9f273b;">
                      {{ contact.fullname.charAt(0).toUpperCase() }}
                    </div>
                    <span class="fw-bold">{{ contact.fullname }}</span>
                  </div>
                </td>
                <td class="small">
                  <div><i class="bi bi-telephone me-1 opacity-50"></i> {{ contact.phone }}</div>
                  <div class="text-muted"><i class="bi bi-envelope me-1 opacity-50"></i> {{ contact.email }}</div>
                </td>
                <td style="max-width: 250px;">
                  <p class="mb-0 text-truncate opacity-75 small" :title="contact.message">{{ contact.message }}</p>
                </td>
                <td class="text-center">
                  <span v-if="contact.status === 'pending'" class="badge bg-warning text-dark px-3 py-2 rounded-pill small">Chờ xử lý</span>
                  <span v-else class="badge bg-success text-white px-3 py-2 rounded-pill small">Đã trả lời</span>
                </td>
                <td class="small text-secondary">{{ formatDate(contact.created_at) }}</td>
                <td class="pe-4 text-end">
                  <button class="btn btn-sm btn-outline-primary me-2 shadow-sm d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px; padding: 0;" @click="viewDetail(contact)">
                    <i class="bi bi-reply-fill"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger shadow-sm d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px; padding: 0;" @click="confirmDelete(contact.id)">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết & Gửi Mail (Giữ nguyên giao diện sang trọng) -->
    <div class="modal fade" id="contactDetailModal" tabindex="-1" ref="detailModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" v-if="selectedContact">
          <div class="modal-header border-bottom py-3">
            <h5 class="modal-title font-serif fw-bold">Chi Tiết Yêu Cầu #{{ selectedContact.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0 d-flex flex-column flex-md-row">
            <div class="col-md-5 p-4 border-end">
              <h6 class="text-uppercase fw-bold text-muted small mb-3">Người gửi</h6>
              <p class="mb-1 fw-bold fs-6">{{ selectedContact.fullname }}</p>
              <p class="mb-1 small">{{ selectedContact.phone }}</p>
              <p class="mb-4 small text-primary">{{ selectedContact.email }}</p>
              <h6 class="text-uppercase fw-bold text-muted small mb-2">Lời nhắn:</h6>
              <div class="bg-light p-3 rounded-3 small mb-3" style="white-space: pre-wrap; line-height: 1.6;">
                {{ selectedContact.message }}
              </div>
            </div>
            <div class="col-md-7 p-4">
              <h6 class="text-uppercase fw-bold text-main small mb-3">Phản hồi qua Email</h6>
              <form @submit.prevent="sendReplyEmail">
                <input type="text" class="form-control mb-3" v-model="replyForm.subject" placeholder="Chủ đề phản hồi" required>
                <textarea class="form-control mb-4" v-model="replyForm.message" rows="6" placeholder="Nội dung phản hồi từ chuyên viên SORA..." required></textarea>
                <div class="text-end">
                  <button type="submit" class="btn btn-primary px-4 rounded-3 shadow-sm d-inline-flex align-items-center" :disabled="isReplying">
                    <span v-if="isReplying" class="spinner-border spinner-border-sm me-2"></span>Gửi Phản Hồi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap'; 

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- QUẢN LÝ DỮ LIỆU ---
const contacts = ref([]);
const isLoading = ref(true);
const selectedIds = ref([]);
const filterStatus = ref('all'); // State bộ lọc
const isSocketActive = ref(false);

// --- MODAL & FORM ---
const selectedContact = ref(null);
const replyForm = ref({ subject: '', message: '' });
const isReplying = ref(false);
let bsModal = null;

// --- 1. LOGIC LỌC VÀ SẮP XẾP THÔNG MINH ---
// Pending luôn lên đầu, sau đó mới đến thời gian mới nhất
const filteredContacts = computed(() => {
  let result = [...contacts.value];

  // Lọc theo trạng thái dropdown
  if (filterStatus.value !== 'all') {
    result = result.filter(c => c.status === filterStatus.value);
  }

  // Sắp xếp: Thư mới (pending) lên đầu, sau đó mới đến thời gian
  return result.sort((a, b) => {
    // Nếu a đang pending mà b đã xong -> a lên đầu (-1)
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    // Nếu cùng trạng thái, so sánh thời gian (mới nhất lên trước)
    return new Date(b.created_at) - new Date(a.created_at);
  });
});

// --- 2. LOGIC CHỌN HÀNG LOẠT ---
const isAllSelected = computed(() => {
  return filteredContacts.value.length > 0 && selectedIds.value.length === filteredContacts.value.length;
});

const selectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = filteredContacts.value.map(c => c.id);
  } else {
    selectedIds.value = [];
  }
};

const axiosConfig = computed(() => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
    Accept: 'application/json' 
  }
}));

const fetchContacts = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(API_URL, axiosConfig.value);
    contacts.value = res.data.data.data || res.data.data;
  } catch (err) { console.error(err); } finally { isLoading.value = false; }
};

const bulkDelete = async () => {
  const result = await Swal.fire({
    title: `Xóa ${selectedIds.value.length} mục đã chọn?`,
    text: "Hành động này không thể hoàn tác!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Đồng ý xóa hết'
  });

  if (result.isConfirmed) {
    try {
      // Sếp lưu ý: Sẽ cần thêm route 'bulk-delete' ở backend
      await axios.post(`${API_URL}/bulk-delete`, { ids: selectedIds.value }, axiosConfig.value);
      contacts.value = contacts.value.filter(c => !selectedIds.value.includes(c.id));
      selectedIds.value = [];
      Swal.fire({ icon: 'success', title: 'Đã xóa hoàn tất!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể xóa hàng loạt', 'error');
    }
  }
};

const sendReplyEmail = async () => {
  isReplying.value = true;
  try {
    const res = await axios.post(`${API_URL}/${selectedContact.value.id}/reply`, replyForm.value, axiosConfig.value);
    if (res.data.status) {
      Swal.fire({ icon: 'success', title: 'Đã Gửi!', text: 'Email phản hồi đã bay đi.' });
      bsModal.hide();
      // Cập nhật trạng thái tại chỗ
      const target = contacts.value.find(c => c.id === selectedContact.value.id);
      if (target) target.status = 'resolved';
    }
  } catch (e) { Swal.fire('Lỗi', 'Gửi mail thất bại', 'error'); } finally { isReplying.value = false; }
};

const viewDetail = (contact) => {
  selectedContact.value = contact;
  replyForm.value.subject = `SORA Jewelry - Phản hồi khách hàng ${contact.fullname}`;
  if (!bsModal) bsModal = new Modal(document.getElementById('contactDetailModal'));
  bsModal.show();
};

const confirmDelete = (id) => {
  Swal.fire({ title: 'Xóa yêu cầu?', icon: 'warning', showCancelButton: true }).then(async (result) => {
    if (result.isConfirmed) {
      await axios.delete(`${API_URL}/${id}`, axiosConfig.value);
      contacts.value = contacts.value.filter(c => c.id !== id);
    }
  });
};

const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '';

onMounted(() => {
  fetchContacts();
  if (window.Echo) {
    isSocketActive.value = true;
    window.Echo.channel('admin-contacts').listen('.NewContactSubmitted', (e) => {
      Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: '🔔 Liên hệ mới!', showConfirmButton: false, timer: 4000 });
      contacts.value.unshift(e.contact);
    });
  }
});
</script>

<style scoped>
.font-serif { font-family: "Playfair Display", serif; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }

/* Màu cho dòng đang chờ xử lý */
.table-warning-custom {
  background-color: rgba(255, 193, 7, 0.05) !important;
}
.table-warning-custom td {
  font-weight: 500;
}

/* Custom checkbox */
.custom-checkbox .form-check-input:checked {
  background-color: #9f273b;
  border-color: #9f273b;
}

/* Nâng cấp table */
.custom-table thead th { border: none; font-size: 0.75rem; letter-spacing: 0.5px; }
.custom-table tbody td { border-bottom: 1px solid var(--bs-border-color); }
</style>