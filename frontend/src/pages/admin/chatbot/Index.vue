<template>
  <div class="chatbot-admin-wrapper pb-5">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-0">Quản Lý Kịch Bản AI</h3>
          <p class="text-muted small mt-1">Dạy cho trợ lý SORA cách trả lời khách hàng</p>
        </div>
        <button @click="openModal()" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold shadow-sm rounded-3">
          <i class="bi bi-plus-lg me-2"></i> Thêm Kịch Bản Mới
        </button>
      </div>

      <div class="card border-0 shadow-sm rounded-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 py-3">Từ khóa (Khách hỏi)</th>
                <th class="py-3">Phản hồi của SORA</th>
                <th class="py-3">Ngày tạo</th>
                <th class="text-end pe-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="chatbotData.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">Chưa có kịch bản nào. Hãy thêm mới nhé!</td>
              </tr>
              <tr v-for="item in chatbotData" :key="item.id">
                <td class="ps-4 py-3">
                  <span class="badge bg-light text-brand border border-brand px-3 py-2 fs-6">{{ item.keyword }}</span>
                </td>
                <td class="text-muted w-50" style="white-space: pre-wrap;">{{ item.reply }}</td>
                <td>{{ new Date(item.created_at).toLocaleDateString('vi-VN') }}</td>
                <td class="text-end pe-4">
                  <button @click="openModal(item)" class="btn btn-sm btn-light border shadow-sm me-2 rounded-3"><i class="bi bi-pencil text-primary"></i></button>
                  <button @click="deleteItem(item.id)" class="btn btn-sm btn-light border shadow-sm rounded-3"><i class="bi bi-trash text-danger"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content-custom bg-white p-4 p-md-5 shadow-lg rounded-4 overflow-auto" style="max-height: 90vh;">
        <h4 class="fw-bold mb-4 text-dark">{{ isEdit ? 'Cập Nhật' : 'Thêm Mới' }} Kịch Bản</h4>
        
        <div class="mb-4">
          <label class="form-label fw-bold text-dark">Từ khóa kích hoạt <span class="text-danger">*</span></label>
          <input v-model="form.keyword" type="text" class="form-control form-control-lg bg-light border-0 shadow-sm" placeholder="VD: địa chỉ, giá vàng...">
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold text-dark">Câu trả lời của Bot <span class="text-danger">*</span></label>
          <textarea v-model="form.reply" class="form-control bg-light border-0 shadow-sm" rows="3" placeholder="Nhập nội dung SORA sẽ tư vấn..."></textarea>
        </div>

        <div class="mb-4 p-3 bg-light rounded-3 border border-secondary border-opacity-10">
          <label class="form-label fw-bold text-brand"><i class="bi bi-ui-radios-grid me-1"></i> Các nút Gợi ý (Tùy chọn)</label>
          
          <div v-for="(opt, index) in form.options" :key="index" class="d-flex gap-2 mb-2 align-items-center">
            <input v-model="opt.label" type="text" class="form-control shadow-sm" placeholder="Tên nút (VD: Lắc vàng)">
            <input v-model="opt.link" type="text" class="form-control shadow-sm" placeholder="Link (Bỏ trống nếu chat tiếp)">
            <button @click="removeOption(index)" class="btn btn-sm btn-danger shadow-sm"><i class="bi bi-trash"></i></button>
          </div>

          <button @click="addOption" class="btn btn-sm btn-outline-brand fw-bold mt-2">
            <i class="bi bi-plus-circle me-1"></i> Thêm nút gợi ý
          </button>
          <small class="text-muted mt-2 d-block fst-italic">Nếu ô Link để trống, khi khách bấm vào, Bot sẽ tiếp tục chat từ khóa đó.</small>
        </div>

        <div class="d-flex justify-content-end gap-3 pt-3 border-top">
          <button @click="showModal = false" class="btn btn-light border px-4 py-2 fw-semibold">Hủy Bỏ</button>
          <button @click="saveData" class="btn btn-brand btn-brand-solid px-4 py-2 fw-bold" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu Kịch Bản' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const chatbotData = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const isSubmitting = ref(false);

const form = reactive({ id: null, keyword: '', reply: '', options: [] });

const getHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const fetchChatbot = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/chatbot`, { headers: getHeaders() });
  chatbotData.value = res.data.data;
};

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true;
    form.id = item.id; form.keyword = item.keyword; form.reply = item.reply;
    try {
      form.options = item.options ? JSON.parse(item.options) : [];
    } catch(e) { form.options = []; }
  } else {
    isEdit.value = false;
    form.id = null; form.keyword = ''; form.reply = ''; form.options = [];
  }
  showModal.value = true;
};

const addOption = () => form.options.push({ label: '', link: '' });
const removeOption = (idx) => form.options.splice(idx, 1);

const saveData = async () => {
  if (!form.keyword || !form.reply) return Swal.fire('Cảnh báo', 'Nhập đủ từ khóa và câu trả lời!', 'warning');
  // Xóa các option trống
  form.options = form.options.filter(o => o.label.trim() !== '');

  isSubmitting.value = true;
  try {
    const url = isEdit.value ? `/admin/chatbot/${form.id}` : '/admin/chatbot';
    const method = isEdit.value ? 'put' : 'post';
    await axios[method](`${import.meta.env.VITE_API_BASE_URL}${url}`, form, { headers: getHeaders() });
    
    Swal.fire({ icon: 'success', title: 'Thành công', timer: 1500, showConfirmButton: false });
    showModal.value = false;
    fetchChatbot();
  } catch (error) {
    Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
  } finally { isSubmitting.value = false; }
};

const deleteItem = async (id) => {
  if((await Swal.fire({title: 'Xóa?', icon:'warning', showCancelButton: true})).isConfirmed){
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/chatbot/${id}`, { headers: getHeaders() });
    fetchChatbot();
  }
};
onMounted(fetchChatbot);
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1050; display: flex; align-items: center; justify-content: center; }
.modal-content-custom { width: 100%; max-width: 600px; animation: slideDown 0.3s ease; }
@keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.bg-brand { background-color: #009981 !important; } 
.text-brand { color: #009981 !important; } 
.btn-outline-brand { color: #009981; border-color: #009981; background: white; }
.btn-outline-brand:hover { background: #009981; color: white; }
.btn-brand-solid { background-color: #009981 !important; color: white !important; border: none; }
</style>