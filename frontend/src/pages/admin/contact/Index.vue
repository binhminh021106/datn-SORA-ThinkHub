<template>
  <div class="admin-contact-page min-vh-100" :class="{ 'has-selection-bar': selectedIds.length > 0 }">
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
      
    </div>

    <div class="contact-tabs-row">
      <ul class="nav nav-underline border-bottom mb-0 pb-1 contact-status-tabs" role="tablist" aria-label="Lọc trạng thái liên hệ">
        <li class="nav-item">
          <button type="button" class="nav-link contact-status-tab" :class="{ active: filterStatus === 'all' }" @click="filterStatus = 'all'">
            <i class="bi bi-grid-fill me-2"></i>Tất cả <span>{{ statusCounts.all }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link contact-status-tab" :class="{ active: filterStatus === 'pending' }" @click="filterStatus = 'pending'">
            <i class="bi bi-hourglass-split me-2"></i>Chờ xử lý <span>{{ statusCounts.pending }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link contact-status-tab" :class="{ active: filterStatus === 'resolved' }" @click="filterStatus = 'resolved'">
            <i class="bi bi-check-circle-fill me-2"></i>Đã trả lời <span>{{ statusCounts.resolved }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Bảng danh sách liên hệ -->
    <div class="card contact-inbox-card overflow-hidden">
      <div class="card-header contact-list-toolbar">
        <div class="d-flex flex-wrap align-items-center gap-3">
          <h6 class="fw-bold mb-0 text-dark d-flex align-items-center"><i class="bi bi-list-ul me-2"></i>Danh sách liên hệ <span v-if="isContactsFetching && !isLoading" class="spinner-border spinner-border-sm text-brand ms-2" role="status"></span></h6>
          <div class="contact-sort-filter">
            <span><i class="bi bi-sort-down-alt"></i>Sắp xếp:</span>
            <select v-model="sortOrder" class="form-select form-select-sm">
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <div class="contact-search-wrap">
            <input v-model="searchInput" type="search" class="form-control rounded-pill pe-5 shadow-sm bg-light border-0" placeholder="Tìm tên, email, SĐT..." @input="handleSearchInput">
            <i class="bi bi-search"></i>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr class="contact-table-head">
                <!-- CỘT TÍCH CHỌN TẤT CẢ -->
                <th scope="col" class="ps-4 py-3" style="width: 50px;">
                  <div class="form-check custom-checkbox">
                    <input class="form-check-input" type="checkbox" @change="selectAll($event)" :checked="isAllSelected">
                  </div>
                </th>
                <th scope="col" class="py-3 text-uppercase small">Khách hàng</th>
                <th scope="col" class="py-3 text-uppercase small">Nội dung &amp; thời gian</th>
                <th scope="col" class="py-3 text-uppercase small text-center">Trạng Thái</th>
                <th scope="col" class="pe-4 py-3 text-uppercase small text-end">Tác Vụ</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isLoading">
                <tr v-for="row in 5" :key="`contact-skeleton-${row}`" class="contact-skeleton-row">
                  <td class="ps-4"><span class="contact-skeleton contact-skeleton-check"></span></td>
                  <td><div class="d-flex align-items-center gap-3"><span class="contact-skeleton contact-skeleton-avatar"></span><span class="contact-skeleton contact-skeleton-name"></span></div><span class="contact-skeleton contact-skeleton-line short mt-2 ms-5"></span></td>
                  <td><span class="contact-skeleton contact-skeleton-message"></span><span class="contact-skeleton contact-skeleton-date mt-2"></span></td>
                  <td class="text-center"><span class="contact-skeleton contact-skeleton-badge"></span></td>
                  <td class="pe-4 text-end"><span class="contact-skeleton contact-skeleton-action"></span></td>
                </tr>
              </template>
              <tr v-else-if="contacts.length === 0">
                <td colspan="5" class="text-center py-5 text-muted small">Không tìm thấy yêu cầu nào phù hợp.</td>
              </tr>
              <!-- DANH SÁCH ĐÃ ĐƯỢC LỌC VÀ SẮP XẾP -->
              <tr v-else v-for="contact in contacts" :key="contact.id" :class="{'contact-row-pending': contact.status === 'pending'}">
                <td class="ps-4">
                  <div class="form-check custom-checkbox">
                    <input class="form-check-input" type="checkbox" v-model="selectedIds" :value="contact.id">
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <img v-if="contact.customer_account?.avatar_url" :src="getFullImage(contact.customer_account.avatar_url)" class="contact-avatar-image me-3" :alt="contact.fullname" @error="handleAvatarError">
                    <div v-else class="avatar-circle text-white fw-bold me-3">
                      {{ contact.fullname.charAt(0).toUpperCase() }}
                    </div>
                    <div class="contact-customer-info">
                      <span class="d-block fw-bold">{{ contact.fullname }}</span>
                      <div class="contact-identity-meta">
                        <span><i class="bi bi-telephone"></i>{{ contact.phone }}</span>
                        <span><i class="bi bi-envelope"></i>{{ contact.email }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="contact-message-cell">
                  <p class="contact-message-preview mb-1 opacity-75 small" :title="contact.message">{{ contact.message }}</p>
                  <span class="contact-message-date"><i class="bi bi-clock"></i>{{ formatDate(contact.created_at) }}</span>
                </td>
                <td class="text-center">
                  <span v-if="contact.status === 'pending'" class="contact-status contact-status-pending">Chờ xử lý</span>
                  <span v-else class="contact-status contact-status-resolved">Đã trả lời</span>
                </td>
                <td class="pe-4 text-end">
                  <button class="btn btn-sm contact-icon-action contact-icon-action-view me-2 d-inline-flex align-items-center justify-content-center" @click="quickView(contact)" title="Xem nhanh">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm contact-icon-action contact-icon-action-reply me-2 d-inline-flex align-items-center justify-content-center" @click="viewDetail(contact)" title="Phản hồi email">
                    <i class="bi bi-reply-fill"></i>
                  </button>
                  <button class="btn btn-sm contact-icon-action contact-icon-action-delete d-inline-flex align-items-center justify-content-center" @click="confirmDelete(contact.id)" title="Xóa yêu cầu">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="pagination.lastPage > 1" class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 px-1">
      <span class="small text-muted">Hiển thị {{ pagination.from }}–{{ pagination.to }} trong {{ pagination.total }} yêu cầu</span>
      <div class="btn-group shadow-sm" role="group" aria-label="Phân trang liên hệ">
        <button type="button" class="btn btn-sm btn-light border" :disabled="pagination.currentPage === 1 || isLoading" @click="fetchContacts(pagination.currentPage - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button type="button" class="btn btn-sm btn-light border disabled">{{ pagination.currentPage }} / {{ pagination.lastPage }}</button>
        <button type="button" class="btn btn-sm btn-light border" :disabled="pagination.currentPage === pagination.lastPage || isLoading" @click="fetchContacts(pagination.currentPage + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <Transition name="contact-selection">
      <div v-if="selectedIds.length > 0" class="contact-selection-bar">
        <div class="d-flex align-items-center gap-2">
          <span class="contact-selection-count">{{ selectedIds.length }}</span>
          <span class="fw-semibold">yêu cầu đã chọn</span>
          <button type="button" class="btn btn-sm contact-selection-clear" @click="selectedIds = []">Bỏ chọn</button>
        </div>
        <button type="button" class="btn btn-danger contact-selection-delete" @click="bulkDelete">
          <i class="bi bi-trash-fill me-2"></i>Xóa các mục đã chọn
        </button>
      </div>
    </Transition>

    <!-- Modal Chi Tiết & Gửi Mail (Giữ nguyên giao diện sang trọng) -->
    <div class="modal fade" id="contactDetailModal" tabindex="-1" ref="detailModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content contact-modal border-0 shadow-lg overflow-hidden" v-if="selectedContact">
          <div class="modal-header contact-modal-header py-3">
            <h5 class="modal-title font-serif fw-bold">Chi Tiết Yêu Cầu #{{ selectedContact.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0 d-flex flex-column flex-md-row">
            <div class="col-md-5 contact-modal-profile">
              <h6 class="text-uppercase fw-bold text-muted small mb-3">Người gửi</h6>
              <p class="mb-1 fw-bold fs-6">{{ selectedContact.fullname }}</p>
              <p class="mb-1 small">{{ selectedContact.phone }}</p>
              <p class="mb-4 small contact-email">{{ selectedContact.email }}</p>
              <h6 class="text-uppercase fw-bold text-muted small mb-2">Lời nhắn:</h6>
              <div class="contact-message-box small mb-3">
                {{ selectedContact.message }}
              </div>
            </div>
            <div class="col-md-7 contact-modal-reply">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <h6 class="text-uppercase fw-bold text-main small mb-0">Phản hồi qua Email</h6>
              </div>

              <div v-if="selectedContact.reply_message && !isReplyEditorOpen" class="contact-reply-history">
                <div class="contact-reply-history-meta">
                  <span><i class="bi bi-check2-circle"></i> Đã gửi {{ formatDate(selectedContact.replied_at) }}</span>
                  <span v-if="selectedContact.replied_by?.fullname">bởi {{ selectedContact.replied_by.fullname }}</span>
                </div>
                <p v-if="selectedContact.reply_subject" class="contact-reply-subject">{{ selectedContact.reply_subject }}</p>
                <div class="contact-reply-message" v-html="selectedContact.reply_message"></div>
              </div>

              <div v-else-if="!isReplyEditorOpen" class="contact-quick-empty">
                <i class="bi bi-envelope-paper"></i>
                <p class="mb-3">Yêu cầu này chưa có phản hồi email.</p>
                <button type="button" class="btn contact-reply-button" @click="isReplyEditorOpen = true"><i class="bi bi-reply-fill me-2"></i>Soạn phản hồi</button>
              </div>

              <form v-else @submit.prevent="sendReplyEmail">
                <input type="text" class="form-control contact-form-control mb-3" v-model="replyForm.subject" placeholder="Chủ đề phản hồi" required>
                <div class="contact-quick-replies">
                  <span>Trả lời nhanh</span>
                  <button v-for="template in quickReplyTemplates" :key="template.label" type="button" @click="applyQuickReply(template)">{{ template.label }}</button>
                </div>
                <div class="contact-editor-container mb-4">
                  <QuillEditor
                    v-model:content="replyForm.message"
                    content-type="html"
                    theme="snow"
                    :toolbar="replyToolbar"
                    placeholder="Nội dung phản hồi từ chuyên viên SORA..."
                  />
                </div>
                <div class="text-end">
                  <button type="submit" class="btn contact-reply-button d-inline-flex align-items-center" :disabled="isReplying">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap'; 
import { getFullImage } from '@/composables/useUtilities';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/admin/contacts';

// --- QUẢN LÝ DỮ LIỆU ---
const selectedIds = ref([]);
const searchInput = ref('');
const searchQuery = ref('');
const filterStatus = ref('all'); // State bộ lọc
const sortOrder = ref('latest');
const isSocketActive = ref(false);
const currentPage = ref(1);
const queryClient = useQueryClient();

// --- MODAL & FORM ---
const selectedContact = ref(null);
const replyForm = ref({ subject: '', message: '' });
const isReplying = ref(false);
const isReplyEditorOpen = ref(false);
let bsModal = null;
let searchTimer = null;

const replyToolbar = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

const quickReplyTemplates = [
  { label: 'Đã tiếp nhận', message: 'SORA đã tiếp nhận yêu cầu của bạn và sẽ phản hồi trong thời gian sớm nhất.' },
  { label: 'Cần thêm thông tin', message: 'Bạn vui lòng cung cấp thêm thông tin để SORA hỗ trợ chính xác hơn.' },
  { label: 'Hẹn liên hệ', message: 'Chuyên viên SORA sẽ liên hệ lại với bạn trong giờ làm việc gần nhất.' },
  { label: 'Cảm ơn', message: 'Cảm ơn bạn đã liên hệ SORA. Chúng tôi luôn sẵn sàng hỗ trợ bạn.' },
];

// --- 2. LOGIC CHỌN HÀNG LOẠT ---
const isAllSelected = computed(() => {
  return contacts.value.length > 0 && contacts.value.every((contact) => selectedIds.value.includes(contact.id));
});

const selectAll = (event) => {
  const currentPageIds = contacts.value.map((contact) => contact.id);

  if (event.target.checked) {
    selectedIds.value = [...new Set([...selectedIds.value, ...currentPageIds])];
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !currentPageIds.includes(id));
  }
};

const axiosConfig = computed(() => ({
  headers: { 
    Authorization: `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
    Accept: 'application/json' 
  }
}));

const { data: contactsResponse, isLoading: isContactsInitialLoading, isFetching: isContactsFetching, refetch: refetchContacts } = useQuery({
  queryKey: ['admin-contacts', currentPage, filterStatus, searchQuery, sortOrder],
  queryFn: async () => {
    const res = await axios.get(API_URL, {
      ...axiosConfig.value,
      params: {
        page: currentPage.value,
        ...(filterStatus.value !== 'all' ? { status: filterStatus.value } : {}),
        ...(searchQuery.value ? { search: searchQuery.value } : {}),
        sort: sortOrder.value,
      },
    });
    return res.data;
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 15 * 60 * 1000,
  placeholderData: keepPreviousData,
});

const contacts = computed(() => contactsResponse.value?.data?.data || []);
const isLoading = computed(() => isContactsInitialLoading.value && !contactsResponse.value);
const pagination = computed(() => {
  const result = contactsResponse.value?.data || {};

  return {
    currentPage: result.current_page || 1,
    lastPage: result.last_page || 1,
    from: result.from || 0,
    to: result.to || 0,
    total: result.total || 0,
  };
});
const statusCounts = computed(() => contactsResponse.value?.status_counts || { all: 0, pending: 0, resolved: 0 });

const fetchContacts = async (page = currentPage.value) => {
  const pageChanged = currentPage.value !== page;
  currentPage.value = page;

  if (!pageChanged) {
    await refetchContacts();
  }
};

const refreshContacts = async () => {
  await queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
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
      selectedIds.value = [];
      await refreshContacts();
      Swal.fire({ icon: 'success', title: 'Đã xóa hoàn tất!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể xóa hàng loạt', 'error');
    }
  }
};

const sendReplyEmail = async () => {
  if (!hasReplyContent(replyForm.value.message)) {
    Swal.fire('Thiếu nội dung', 'Vui lòng nhập nội dung phản hồi trước khi gửi.', 'warning');
    return;
  }

  isReplying.value = true;
  try {
    const res = await axios.post(`${API_URL}/${selectedContact.value.id}/reply`, replyForm.value, axiosConfig.value);
    if (res.data.status) {
      Swal.fire({ icon: 'success', title: 'Đã Gửi!', text: 'Email phản hồi đã bay đi.' });
      if (res.data.data) {
        selectedContact.value = res.data.data;
      } else {
        selectedContact.value = contacts.value.find((contact) => contact.id === selectedContact.value?.id) || selectedContact.value;
      }
      await refreshContacts();
      isReplyEditorOpen.value = false;
    }
  } catch (e) {
    Swal.fire('Lỗi', e.response?.data?.message || 'Gửi email phản hồi thất bại.', 'error');
  } finally { isReplying.value = false; }
};

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character]));

const applyQuickReply = (template) => {
  const customerName = escapeHtml(selectedContact.value?.fullname || 'bạn');
  replyForm.value.message = `<p>Chào ${customerName},</p><p>${template.message}</p><p>Trân trọng,<br>SORA Jewelry</p>`;
};

const hasReplyContent = (html) => {
  const plainText = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return plainText.length > 0;
};

const openContact = (contact, openReplyEditor) => {
  selectedContact.value = contact;
  replyForm.value = {
    subject: `SORA Jewelry - Phản hồi khách hàng ${contact.fullname}`,
    message: ''
  };
  isReplyEditorOpen.value = openReplyEditor;
  if (!bsModal) bsModal = new Modal(document.getElementById('contactDetailModal'));
  bsModal.show();
};

const quickView = (contact) => openContact(contact, false);
const viewDetail = (contact) => openContact(contact, contact.status === 'pending' && !contact.reply_message);

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery.value = searchInput.value.trim();
    selectedIds.value = [];
    currentPage.value = 1;
  }, 300);
};

const handleAvatarError = (event) => {
  event.target.onerror = null;
  event.target.src = defaultAvatar;
};

const confirmDelete = (id) => {
  Swal.fire({ title: 'Xóa yêu cầu?', icon: 'warning', showCancelButton: true }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`, axiosConfig.value);
        await refreshContacts();
      } catch (error) {
        console.error(error);
        Swal.fire('Lỗi', 'Không thể xóa', 'error');
      }
    }
  });
};

const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '';

onMounted(() => {
  if (window.Echo) {
    isSocketActive.value = true;
    window.Echo.channel('admin-contacts').listen('.NewContactSubmitted', (e) => {
      Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: '🔔 Liên hệ mới!', showConfirmButton: false, timer: 4000 });
      refreshContacts();
    });
  }
});

watch([filterStatus, sortOrder], () => {
  selectedIds.value = [];
  currentPage.value = 1;
});

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
  if (window.Echo) {
    window.Echo.leave('admin-contacts');
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');


.font-serif { font-family: 'Josefin Sans', sans-serif; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }

/* Màu cho dòng đang chờ xử lý */
.table-warning-custom {
  background-color: rgba(255, 193, 7, 0.05) !important;
}
.table-warning-custom td {
  font-weight: 500;
}

.contact-skeleton-row td {
  height: 72px;
}

.contact-skeleton {
  display: inline-block;
  position: relative;
  overflow: hidden;
  border-radius: 0.4rem;
  background: #eaf5f2;
}

.contact-skeleton::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  transform: translateX(-100%);
  animation: contact-skeleton-shimmer 1.4s infinite;
  content: '';
}

.contact-skeleton-check { width: 16px; height: 16px; }
.contact-skeleton-avatar { width: 36px; height: 36px; border-radius: 50%; }
.contact-skeleton-name { width: 110px; height: 14px; }
.contact-skeleton-line { display: block; width: 130px; height: 11px; }
.contact-skeleton-line.short { width: 95px; }
.contact-skeleton-message { width: 170px; height: 12px; }
.contact-skeleton-badge { width: 82px; height: 24px; border-radius: 50rem; }
.contact-skeleton-date { width: 96px; height: 12px; }
.contact-skeleton-action { width: 70px; height: 30px; }

@keyframes contact-skeleton-shimmer {
  to { transform: translateX(100%); }
}

/* Custom checkbox */
.custom-checkbox .form-check-input:checked {
  background-color: #9f273b;
  border-color: #9f273b;
}

/* Nâng cấp table */
.custom-table thead th { border: none; font-size: 0.75rem; letter-spacing: 0.5px; }
.custom-table tbody td { border-bottom: 1px solid var(--bs-border-color); }

.admin-contact-page {
  --contact-brand: #009a83;
  --contact-brand-dark: #007e6c;
  --contact-soft: #e8f7f2;
  --contact-border: #e5edf0;
  --contact-muted: #6e7d8b;
}
.admin-contact-page.has-selection-bar { padding-bottom: 88px; }

.contact-filter {
  min-height: 36px;
  border: 1px solid #dbe5e7;
  border-radius: 9px;
  color: #405464;
  box-shadow: none;
  font-size: .84rem;
}
.contact-filter:focus { border-color: #83cabb; box-shadow: 0 0 0 .18rem rgba(0, 154, 131, .1); }

.contact-tabs-row {
  margin-bottom: 1rem;
}

.contact-list-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: .65rem 1rem;
  background: #fff;
  border: 0;
  gap: 10px;
}

.contact-status-tabs {
  flex-wrap: wrap;
  gap: 8px;
}

.contact-status-tab {
  min-height: 37px;
  padding: .45rem .8rem;
  color: #687987;
  background: transparent;
  border: 0;
  border-radius: 0;
  font-size: .88rem;
  font-weight: 700;
}

.contact-status-tab span {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  margin-left: .25rem;
  padding: 0 .28rem;
  color: #627584;
  background: #e3eceb;
  border-radius: 999px;
  font-size: .67rem;
}

.contact-status-tab:hover { color: var(--contact-brand); }
.contact-status-tab.active { color: var(--contact-brand); border-bottom-color: var(--contact-brand); }
.contact-status-tab.active span { color: var(--contact-brand); background: #ddf3ed; }

.contact-search-wrap { position: relative; width: min(100%, 320px); }
.contact-search-wrap > i { position: absolute; z-index: 1; top: 50%; right: 13px; color: #80909b; transform: translateY(-50%); }
.contact-search-wrap input { min-height: 38px; padding-left: .9rem; padding-right: 2.5rem; border: 1px solid #dbe5e7; border-radius: 999px; font-size: .84rem; box-shadow: none; }
.contact-search-wrap input:focus { border-color: #83cabb; box-shadow: 0 0 0 .18rem rgba(0, 154, 131, .1); }
.contact-sort-filter { display: inline-flex; align-items: center; gap: .4rem; padding: .38rem .7rem; background: #fff; border: 1px solid #dbe8e5; border-radius: 999px; box-shadow: 0 2px 6px rgba(27, 50, 70, .05); }
.contact-sort-filter > span { color: #718391; font-size: .78rem; font-weight: 650; white-space: nowrap; }
.contact-sort-filter > span i { margin-right: .28rem; color: var(--contact-brand); }
.contact-sort-filter .form-select { width: 100px; padding: 0 1.25rem 0 0; color: #263846; background-color: transparent; border: 0; box-shadow: none; font-size: .78rem; font-weight: 750; }

.contact-inbox-card { border: 1px solid var(--contact-border); border-radius: 15px; box-shadow: 0 5px 18px rgba(27, 50, 70, .055); }

.custom-table .contact-table-head th {
  color: #738193;
  background: #f6f9fa;
  border: 0;
  border-bottom: 1px solid var(--contact-border);
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .045em;
}
.custom-table tbody td { border-bottom-color: #ebf0f2; }
.contact-row-pending { background: rgba(0, 154, 131, .025); }
.contact-row-pending:hover, .custom-table tbody tr:hover { background: #f8fcfb; }
.custom-checkbox { display: flex; align-items: center; min-height: 24px; }
.custom-checkbox .form-check-input {
  width: 19px;
  height: 19px;
  margin: 0;
  cursor: pointer;
  border: 1.5px solid #a8bac1;
  box-shadow: none;
  opacity: 1;
}
.custom-checkbox .form-check-input:focus { border-color: var(--contact-brand); box-shadow: 0 0 0 .16rem rgba(0, 154, 131, .13); }

.avatar-circle {
  color: #fff;
  background: linear-gradient(135deg, #009a83, #007561);
  box-shadow: 0 4px 10px rgba(0, 154, 131, .18);
}

.contact-avatar-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid #e7f4f1;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(16, 71, 62, .1);
}

.contact-customer-info { min-width: 0; }
.contact-identity-meta { display: flex; flex-wrap: wrap; gap: .18rem .8rem; margin-top: .25rem; color: #70808d; font-size: .76rem; line-height: 1.35; }
.contact-identity-meta span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.contact-identity-meta i { margin-right: .24rem; color: #8ba1ab; }
.contact-message-cell { min-width: 260px; max-width: 430px; }
.contact-message-preview {
  display: -webkit-box;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.45;
  word-break: break-word;
}
.contact-message-date { display: inline-flex; align-items: center; gap: .3rem; color: #7b8b97; font-size: .74rem; }
.contact-message-date i { color: #8ca4ab; }

.contact-status {
  display: inline-flex;
  align-items: center;
  min-height: 27px;
  padding: .28rem .65rem;
  border-radius: 7px;
  font-size: .74rem;
  font-weight: 750;
}
.contact-status-pending { color: #986900; background: #fff5d9; }
.contact-status-resolved { color: #08765b; background: #e5f6ee; }

.contact-icon-action {
  width: 33px;
  height: 33px;
  padding: 0;
  border-radius: 8px;
  box-shadow: none;
  transition: color .18s ease, background-color .18s ease, border-color .18s ease;
}
.contact-icon-action-reply { color: var(--contact-brand); border-color: #9ed9ce; background: #fff; }
.contact-icon-action-reply:hover { color: #fff; border-color: var(--contact-brand); background: var(--contact-brand); }
.contact-icon-action-view { color: #4c6d8b; border-color: #bfd0df; background: #fff; }
.contact-icon-action-view:hover { color: #fff; border-color: #4c6d8b; background: #4c6d8b; }
.contact-icon-action-delete { color: #ce4050; border-color: #f1b7bf; background: #fff; }
.contact-icon-action-delete:hover { color: #fff; border-color: #d74a5a; background: #d74a5a; }

.contact-modal { border-radius: 16px; }
.contact-modal-header { padding-right: 1.5rem; padding-left: 1.5rem; border-bottom: 1px solid var(--contact-border); background: #fff; }
.contact-modal-profile { padding: 1.5rem; background: #fbfdfd; border-right: 1px solid var(--contact-border); }
.contact-modal-reply { padding: 1.5rem; }
.contact-email { color: var(--contact-brand); }
.contact-message-box { padding: 1rem; color: #435363; overflow-wrap: anywhere; background: #f2f7f6; border: 1px solid #deebe8; border-radius: 10px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.contact-form-control { border-color: #d8e4e2; border-radius: 9px; box-shadow: none; }
.contact-form-control:focus { border-color: #87cbbb; box-shadow: 0 0 0 .18rem rgba(0, 154, 131, .1); }
.contact-reply-button { min-height: 39px; padding: .5rem 1rem; color: #fff; background: var(--contact-brand); border: 1px solid var(--contact-brand); border-radius: 8px; font-size: .84rem; font-weight: 700; }
.contact-reply-button:hover:not(:disabled) { color: #fff; background: var(--contact-brand-dark); border-color: var(--contact-brand-dark); }
.custom-checkbox .form-check-input:checked { background-color: var(--contact-brand); border-color: var(--contact-brand); }

.contact-reply-history { padding: 1rem; background: #f7fcfa; border: 1px solid #d9eee8; border-radius: 10px; }
.contact-reply-history-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-bottom: .7rem; color: #548071; font-size: .78rem; font-weight: 650; }
.contact-reply-history-meta i { color: var(--contact-brand); }
.contact-reply-subject { margin-bottom: .55rem; color: #263846; font-size: .9rem; font-weight: 750; }
.contact-reply-message { color: #435363; font-size: .88rem; line-height: 1.65; }
.contact-reply-message :deep(p:last-child), .contact-reply-message :deep(ol:last-child), .contact-reply-message :deep(ul:last-child) { margin-bottom: 0; }
.contact-quick-empty { display: flex; min-height: 215px; flex-direction: column; align-items: center; justify-content: center; color: #718190; text-align: center; }
.contact-quick-empty > i { margin-bottom: .7rem; color: #8dcfc1; font-size: 2rem; }
.contact-quick-replies { display: flex; flex-wrap: wrap; align-items: center; gap: .42rem; margin-bottom: .75rem; }
.contact-quick-replies > span { margin-right: .15rem; color: #607381; font-size: .76rem; font-weight: 700; }
.contact-quick-replies button { padding: .28rem .52rem; color: #087c6a; background: #f1faf7; border: 1px solid #bfe6db; border-radius: 999px; font-size: .73rem; font-weight: 650; transition: color .15s ease, background-color .15s ease, border-color .15s ease; }
.contact-quick-replies button:hover { color: #fff; background: var(--contact-brand); border-color: var(--contact-brand); }
.contact-editor-container { overflow: hidden; border: 1px solid #d8e4e2; border-radius: 9px; }
.contact-editor-container :deep(.ql-toolbar.ql-snow) { border: 0; border-bottom: 1px solid #d8e4e2; background: #f8fcfb; }
.contact-editor-container :deep(.ql-container.ql-snow) { min-height: 155px; border: 0; font-family: inherit; font-size: .9rem; }
.contact-editor-container :deep(.ql-editor) { min-height: 155px; color: #435363; }
.contact-editor-container :deep(.ql-stroke) { stroke: #607381; }
.contact-editor-container :deep(.ql-fill) { fill: #607381; }
.contact-editor-container :deep(.ql-picker) { color: #607381; }

.contact-selection-bar {
  position: fixed;
  z-index: 1060;
  bottom: 20px;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(580px, calc(100vw - 32px));
  padding: .7rem .8rem .7rem 1rem;
  color: #fff;
  background: #253641;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(22, 40, 51, .28);
  transform: translateX(-50%);
}
.contact-selection-count { display: inline-flex; min-width: 24px; height: 24px; align-items: center; justify-content: center; color: #fff; background: var(--contact-brand); border-radius: 50%; font-size: .78rem; font-weight: 800; }
.contact-selection-clear { padding: .22rem .45rem; color: #c8d3d8; border: 0; background: transparent; font-size: .74rem; text-decoration: underline; }
.contact-selection-clear:hover { color: #fff; }
.contact-selection-delete { min-height: 36px; padding: .45rem .85rem; border-radius: 8px; font-size: .8rem; font-weight: 750; }
.contact-selection-enter-active, .contact-selection-leave-active { transition: opacity .18s ease, transform .18s ease; }
.contact-selection-enter-from, .contact-selection-leave-to { opacity: 0; transform: translate(-50%, 12px); }

@media (max-width: 767.98px) {
  .contact-modal-profile { border-right: 0; border-bottom: 1px solid var(--contact-border); }
  .contact-list-toolbar, .contact-search-wrap { width: 100%; }
  .contact-list-toolbar > div { width: 100%; justify-content: space-between; }
  .contact-status-tabs { width: 100%; }
  .contact-status-tab { flex: 1; padding-right: .4rem; padding-left: .4rem; font-size: .76rem; }
  .contact-selection-bar { align-items: stretch; flex-direction: column; gap: .55rem; }
  .contact-selection-bar > div, .contact-selection-delete { width: 100%; }
  .contact-selection-bar > div { justify-content: center; }
}
</style>
