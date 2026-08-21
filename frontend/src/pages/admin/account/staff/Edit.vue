<template>
  <div class="staff-edit-wrapper">

    <div class="container-fluid py-3" v-if="isLoaded">
      <!-- Header & Badge Cấp độ trang -->
      <div class="row mb-3 align-items-center">
        <div class="col-md-8 d-flex align-items-center">
          <router-link :to="{ name: 'admin-staff-index' }"
            class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div>
            <h3 class="fw-bold text-dark mb-0">
              Hồ sơ Nhân Sự
              <span v-if="isCurrentUser" class="badge bg-primary align-middle ms-2"
                style="font-size: 0.75rem;">(Bạn)</span>
            </h3>
            <p class="text-muted mb-0 small">Cập nhật thông tin nhân viên #{{ route.params.id }}</p>
          </div>
        </div>

        <div class="col-md-4 text-md-end mt-3 mt-md-0">
          <div class="border rounded px-3 py-1 bg-white shadow-sm text-muted small d-inline-block"
            v-if="currentPageLevel">
            <i class="bi bi-shield-check text-success me-1"></i>
            Trang yêu cầu: <span class="badge" :class="getLevelColor(currentPageLevel)">Cấp {{ currentPageLevel
              }}</span>
          </div>
        </div>
      </div>

      <div class="alert alert-info border-0 shadow-sm mb-4" v-if="isCurrentUser">
        <i class="bi bi-info-circle-fill me-2"></i>
        <strong>Lưu ý:</strong> Bạn đang sửa tài khoản của chính mình. Bạn không thể tự thay đổi <strong>Chức
          vụ</strong> và <strong>Trạng thái</strong> của bản thân.
      </div>

      <form class="account-edit-form" @submit.prevent="updateStaff">
        <div class="row g-3">
          <!-- ================= CỘT TRÁI: AVATAR & TRẠNG THÁI ================= -->
          <div class="col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 text-center p-3 h-100">
              <label class="form-label fw-bold mb-3 text-dark">Ảnh đại diện</label>
              <div class="position-relative d-inline-block mx-auto mb-3" style="width: 120px; height: 120px;">
                <!-- Sử dụng SoraImage thay cho img thường để xử lý lỗi ảnh mượt mà -->
                <SoraImage :src="previewAvatar" :placeholder="defaultAvatar"
                  imgClass="rounded-circle shadow-sm border border-3 border-white object-fit-cover"
                  style="width: 120px; height: 120px;" alt="Avatar" />
                <label for="avatarUpload"
                  class="position-absolute bottom-0 end-0 bg-brand rounded-circle shadow-sm p-2 text-white cursor-pointer"
                  style="line-height: 1;" title="Đổi ảnh đại diện">
                  <i class="bi bi-camera-fill fs-6"></i>
                </label>
                <input type="file" id="avatarUpload" class="d-none" accept="image/png, image/jpeg"
                  @change="handleAvatarChange">
              </div>

              <h5 class="fw-bold text-dark mb-1">{{ form.fullname || 'Nhân viên' }}</h5>
              <span class="badge mb-3 px-3 py-2 rounded-pill text-white"
                :class="form.status === 'active' ? 'bg-success' : 'bg-danger'">
                <i class="bi me-1" :class="form.status === 'active' ? 'bi-check-circle' : 'bi-lock-fill'"></i>
                {{ form.status === 'active' ? 'Hoạt động' : 'Đã bị khóa' }}
              </span>

              <div class="mb-3" v-if="previewAvatar && previewAvatar !== defaultAvatar && !selectedFile">
                <button type="button" @click="removeAvatar"
                  class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold w-100 shadow-sm">
                  <i class="bi bi-trash me-1"></i> Xóa ảnh hiện tại
                </button>
              </div>

              <hr class="text-muted opacity-25 my-3">

              <div class="text-start">
                <label class="form-label fw-bold text-muted small text-uppercase mb-2">Cập nhật Trạng thái</label>
                <!-- Nút chọn trạng thái được thu nhỏ và thêm nền tương phản -->
                <select class="form-select fw-bold shadow-sm" v-model="form.status" required :disabled="isCurrentUser"
                  :class="form.status === 'active' ? 'text-success border-success bg-success bg-opacity-10' : 'text-danger border-danger bg-danger bg-opacity-10'">
                  <option value="active" class="text-success fw-bold">Hoạt động (Active)</option>
                  <option value="locked" class="text-danger fw-bold">Khóa (Locked)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ================= CỘT PHẢI: THÔNG TIN CHI TIẾT ================= -->
          <div class="col-md-8 col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 account-edit-card">
              <div class="card-header bg-white border-bottom-0 pt-3 pb-0 px-3">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-person-lines-fill text-brand me-2"></i> Thông tin cá
                  nhân</h5>
              </div>
              <div class="card-body p-3 pt-2">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <div class="form-floating">
                      <input type="text" id="staffName" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.fullname" placeholder="Nhập họ tên" required>
                      <label for="staffName" class="fw-bold text-dark">Họ và tên <span class="text-danger">*</span></label>
                    </div>
                  </div>
                  <div class="col-md-6 mb-4">
                    <div class="form-floating">
                      <input type="text" id="staffPhone" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.phone" placeholder="Nhập SĐT">
                      <label for="staffPhone" class="fw-bold text-dark">Số điện thoại</label>
                    </div>
                  </div>

                  <div class="col-md-6 mb-4">
                    <div class="input-group shadow-sm">
                      <span class="input-group-text bg-light text-muted border-secondary-subtle"><i class="bi bi-envelope"></i></span>
                      <div class="form-floating flex-grow-1">
                        <input type="email" id="staffEmail" class="form-control bg-light text-muted cursor-not-allowed border-secondary-subtle shadow-none" v-model="form.email" placeholder="name@domain.com" required readonly disabled>
                        <label for="staffEmail" class="fw-bold text-muted" style="z-index: 4;">Email đăng nhập <span class="text-danger">*</span></label>
                      </div>
                    </div>
                    <small class="text-danger mt-1 d-block" style="font-size: 0.75rem;">Không được phép thay đổi
                      email.</small>
                  </div>

                  <div class="col-md-6 mb-4">
                    <div class="input-group shadow-sm">
                      <span class="input-group-text bg-white text-muted border-secondary-subtle"><i class="bi bi-key"></i></span>
                      <div class="form-floating flex-grow-1">
                        <input type="text" id="staffPassword" class="form-control bg-white border-secondary-subtle shadow-none" v-model="form.password" placeholder="Bỏ trống nếu không đổi">
                        <label for="staffPassword" class="fw-bold text-dark" style="z-index: 4;">Đổi mật khẩu <span class="text-muted fw-normal small">(Tùy chọn)</span></label>
                      </div>
                    </div>
                  </div>

                  <!-- ================= DROPDOWN ĐỊA CHỈ XỊN XÒ ================= -->
                  <div class="col-12 mb-2 mt-2">
                    <label class="form-label fw-bold text-dark border-bottom pb-2 w-100"><i
                        class="bi bi-geo-alt-fill text-brand me-1"></i> Địa chỉ thường trú</label>
                  </div>

                  <div class="col-12 mb-3">
                    <VietnamAddressPicker v-model:province="selectedCityName" v-model:district="selectedDistrictName"
                      v-model:ward="selectedWardName"
                      input-class="bg-white border-secondary-subtle shadow-none fw-medium"
                      label-class="fw-semibold text-dark small" />
                  </div>
                  <div class="col-md-12 mb-4">
                    <div class="form-floating">
                      <input type="text" id="staffAddress" class="form-control bg-white border-secondary-subtle shadow-none" v-model="specificAddress" placeholder="VD: Số 12, Đường ABCD">
                      <label for="staffAddress" class="fw-semibold text-dark">Địa chỉ cụ thể (Số nhà, đường)</label>
                    </div>
                  </div>
                  <!-- ================= KẾT THÚC ĐỊA CHỈ ================= -->

                  <div class="col-12 mb-4 mt-2">
                    <div class="form-floating">
                      <select class="form-select bg-light border-secondary-subtle fw-bold text-dark" id="staffRole" v-model="form.role_id" required :disabled="isCurrentUser || route.params.id == 1">
                        <option value="" disabled>-- Hãy chọn một Chức vụ --</option>
                        <option v-for="r in roles" :key="r.id" :value="r.id">
                          Cấp {{ r.level }}: {{ r.label }}
                        </option>
                      </select>
                      <label for="staffRole" class="fw-bold text-dark">Cấp quyền Chức vụ (Role) <span class="text-danger">*</span></label>
                    </div>
                  </div>
                </div>

                <div class="text-end border-top pt-3 mt-2">
                  <router-link :to="{ name: 'admin-staff-index' }" class="btn btn-light me-2 px-4 fw-bold shadow-sm">Hủy
                    bỏ</router-link>
                  <button type="submit" class="btn btn-brand px-5 fw-bold text-white shadow-sm" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU THAY ĐỔI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- HIỆU ỨNG LOGO SHIMMER (MÀN HÌNH CHỜ) -->
    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
        Đang tải dữ liệu...
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { getFullImage } from '@/composables/useUtilities';

// Tái sử dụng SoraImage và defaultAvatar đồng bộ thống nhất
import SoraImage from '@/components/ui/SoraImage.vue';
import VietnamAddressPicker from '@/components/ui/VietnamAddressPicker.vue';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const isSaving = ref(false);
const currentPageLevel = ref(null);

const API_URL = import.meta.env.VITE_API_BASE_URL;

const previewAvatar = ref(defaultAvatar);
const selectedFile = ref(null);
const isRemoveAvatar = ref(false);

const form = ref({ fullname: '', email: '', password: '', phone: '', address: '', role_id: '', status: '' });

const selectedCityName = ref('');
const selectedDistrictName = ref('');
const selectedWardName = ref('');
const specificAddress = ref('');

const currentAdmin = JSON.parse(localStorage.getItem('admin_info') || '{}');
const currentUserId = currentAdmin.id;

const isCurrentUser = computed(() => {
  return Number(route.params.id) === currentUserId;
});

const getHeaders = () => ({
  'Accept': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
});

const getLevelColor = (level) => {
  if (!level) return 'bg-secondary';
  const l = parseInt(level);
  switch (l) {
    case 1: return 'bg-danger text-white border-danger shadow-sm';
    case 2: return 'bg-warning text-dark border-warning';
    case 3: return 'bg-info text-dark border-info';
    case 4: return 'bg-primary bg-opacity-10 text-primary border-primary';
    case 5: return 'bg-success bg-opacity-10 text-success border-success';
    default: return 'bg-light text-secondary border-secondary';
  }
};

const parseAddressToDropdowns = async (fullAddress) => {
  if (!fullAddress) return;
  const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);

  if (parts.length >= 4) {
    selectedCityName.value = parts[parts.length - 1] || '';
    selectedDistrictName.value = parts[parts.length - 2] || '';
    selectedWardName.value = parts[parts.length - 3] || '';
    specificAddress.value = parts.slice(0, parts.length - 3).join(', ');
  } else if (parts.length === 3) {
    selectedCityName.value = parts[2] || '';
    selectedDistrictName.value = '';
    selectedWardName.value = parts[1] || '';
    specificAddress.value = parts[0] || '';
  } else {
    specificAddress.value = fullAddress;
  }
};

// ==========================================
// TANSTACK VUE QUERY - FETCH DATA
// ==========================================

// 1. Dùng chung danh sách roles đã lưu trong cache Tanstack của Index.vue
const { data: rolesResponse } = useQuery({
  queryKey: ['adminRoles'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/roles`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 30 * 60 * 1000
});

const roles = computed(() => rolesResponse.value?.data || []);

// 2. Dùng chung danh sách modules đã lưu trong cache
const { data: modulesResponse } = useQuery({
  queryKey: ['adminModules'],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/modules`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 30 * 60 * 1000
});

// Thiết lập quyền hạn cấp trang từ dữ liệu modules
computed(() => {
  const modules = modulesResponse.value?.data || [];
  const currentCode = route.meta.moduleCode;
  if (currentCode && modules.length > 0) {
    const currentModule = modules.find(m => m.module_code === currentCode);
    if (currentModule) currentPageLevel.value = currentModule.required_level;
  }
  return modules;
});

// 3. Tải thông tin chi tiết của nhân viên cần chỉnh sửa
const { data: staffResponse, isLoading: isStaffLoading } = useQuery({
  queryKey: ['adminStaff_id', route.params.id],
  queryFn: async () => {
    const response = await axios.get(`${API_URL}/admin/staff/${route.params.id}`, { headers: getHeaders() });
    return response.data;
  },
  staleTime: 2 * 60 * 1000 // Cache cục bộ 2 phút
});

const rawStaffData = computed(() => staffResponse.value?.data);

// Thiết lập trạng thái load màn hình hoàn thành
const isLoaded = computed(() => !isStaffLoading.value);

// Đồng bộ hóa thông tin nhân viên từ TanStack Query vào Form an toàn sau khi load xong các danh mục tỉnh thành
watch(rawStaffData, async (newVal) => {
  if (newVal) {
    form.value = {
      fullname: newVal.fullname,
      email: newVal.email,
      phone: newVal.phone,
      address: newVal.address || '',
      role_id: newVal.role_id,
      status: newVal.status,
      password: ''
    };

    // Đồng bộ preview avatar của SoraImage
    previewAvatar.value = newVal.avatar_url ? getFullImage(newVal.avatar_url) : defaultAvatar;

    await parseAddressToDropdowns(newVal.address);
  }
}, { immediate: true });

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
    isRemoveAvatar.value = false;
  }
};

const removeAvatar = () => {
  selectedFile.value = null;
  previewAvatar.value = defaultAvatar;
  isRemoveAvatar.value = true;
};

// ==========================================
// TANSTACK VUE QUERY - MUTATION (LƯU THAY ĐỔI)
// ==========================================

const updateStaffMutation = useMutation({
  mutationFn: async (formData) => {
    const response = await axios.post(`${API_URL}/admin/staff/${route.params.id}`, formData, {
      headers: getHeaders()
    });
    return response.data;
  },
  onMutate: () => {
    isSaving.value = true;
  },
  onSuccess: (data) => {
    Swal.fire({ icon: 'success', title: 'Thành công', text: data.message, timer: 1500, showConfirmButton: false });

    // Nếu cập nhật chính tài khoản của bạn, tự động cập nhật cả LocalStorage và cache Header
    if (isCurrentUser.value) {
      const updatedAdmin = { ...currentAdmin, fullname: form.value.fullname, phone: form.value.phone };
      if (isRemoveAvatar.value || (data.data && !data.data.avatar_url)) {
        updatedAdmin.avatar_url = null;
      } else if (data.data && data.data.avatar_url) {
        updatedAdmin.avatar_url = data.data.avatar_url;
      }
      localStorage.setItem('admin_info', JSON.stringify(updatedAdmin));

      // Đồng bộ làm tươi profile ở Header ngay lập tức
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    }

    // Làm tươi danh sách nhân viên ở trang index
    queryClient.invalidateQueries({ queryKey: ['adminStaffs'] });

    router.push({ name: 'admin-staff-index' });
  },
  onError: (err) => {
    if (err.response && err.response.data) {
      let errorMsg = err.response.data.message || '';
      if (errorMsg.includes('Duplicate entry')) {
        let text = 'Dữ liệu này đã tồn tại hoặc nằm trong thùng rác.';
        if (errorMsg.includes('staff_email_unique') || errorMsg.includes('email')) {
          text = 'Email này đã tồn tại hoặc nằm trong thùng rác.';
        } else if (errorMsg.includes('staff_phone_unique') || errorMsg.includes('phone')) {
          text = 'Số điện thoại này đã tồn tại hoặc nằm trong thùng rác.';
        }
        Swal.fire('Lỗi', text, 'error');
      } else {
        Swal.fire('Lỗi', errorMsg || (err.response.data.errors ? Object.values(err.response.data.errors).flat().join('\n') : 'Lỗi hệ thống'), 'error');
      }
    } else {
      Swal.fire('Lỗi', 'Không thể kết nối máy chủ để cập nhật dữ liệu.', 'error');
    }
  },
  onSettled: () => {
    isSaving.value = false;
  }
});

const updateStaff = async () => {
  const finalAddress = [
    specificAddress.value,
    selectedWardName.value,
    selectedDistrictName.value,
    selectedCityName.value,
  ].filter(Boolean).join(', ');
  form.value.address = finalAddress.replace(/(^, )|(,$)/g, '').trim();

  const formData = new FormData();
  formData.append('_method', 'PUT');

  Object.keys(form.value).forEach(key => {
    if (key === 'password' && !form.value.password) return;
    if (key === 'status' && isCurrentUser.value) return formData.append('status', form.value.status);
    if (key === 'role_id' && isCurrentUser.value) return formData.append('role_id', form.value.role_id);
    if (key === 'email') return formData.append('email', form.value.email);

    formData.append(key, form.value[key] || '');
  });
  if (selectedFile.value) formData.append('avatar', selectedFile.value);
  if (isRemoveAvatar.value) formData.append('remove_avatar', 'true');

  updateStaffMutation.mutate(formData);
};

</script>

<style scoped>
/* LOGO SHIMMER (SÓNG BIỂN LẤP LÁNH) */
.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 1.5s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.bg-brand {
  background-color: #009981 !important;
}

.text-brand {
  color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  transition: 0.2s;
  border: none;
}

.btn-brand:hover {
  background-color: #007a67;
}

.form-control:focus,
.form-select:focus {
  border-color: #009981;
  box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25);
}

.cursor-not-allowed {
  cursor: not-allowed;
  opacity: 0.7;
}

.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: scale(1.1);
}

.account-edit-form .card-body .row > [class*='col-'] {
  margin-bottom: 1rem !important;
}

.account-edit-form .form-label {
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
}

.account-edit-form .form-label {
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
}


/* Smooth floating label transition */
.form-floating > label {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}
</style>
