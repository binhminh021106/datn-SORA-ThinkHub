<template>
  <Teleport to="body">
    <Transition name="face-fade">
      <div v-if="isVisible" class="face-id-overlay d-flex align-items-center justify-content-center" @click.self="closeModal">
        <div class="face-id-wrapper w-100 h-100 d-flex align-items-center justify-content-center">
          
          <!-- SETUP STATE -->
          <div v-if="uiState === 'setup'" class="face-id-setup bg-white shadow-lg overflow-hidden d-flex flex-column">
            <div class="face-manager-header px-3 py-2 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center bg-brand text-white">
              <div>
                <h6 class="fw-bold mb-0">{{ modalTitle }}</h6>
                <p class="small mb-0 text-white-50">{{ modalSubtitle }}</p>
              </div>
              <div class="d-flex align-items-center gap-3">
                <button
                  v-if="isManageMode"
                  type="button"
                  class="btn btn-light text-brand fw-bold rounded-pill px-3"
                  :disabled="isFetchingInitialData"
                  @click="startScanningMode('verify')"
                >
                  <i class="bi bi-search me-2"></i>Đối chiếu thử
                </button>
                <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeModal"></button>
              </div>
            </div>
            
            <div class="face-manager-content p-3 p-md-4 flex-grow-1 overflow-auto bg-light">
              <template v-if="isManageMode">
                <section class="face-manager-toolbar mb-3">
                  <div>
                    <h6 class="fw-bold text-dark mb-1">Hồ sơ nhân sự</h6>
                    <p class="small text-muted mb-0">Tìm và chọn đúng nhân sự trước khi đăng ký khuôn mặt.</p>
                  </div>
                  <div class="input-group face-manager-search">
                    <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-search"></i></span>
                    <input
                      v-model="searchQuery"
                      type="search"
                      class="form-control border-start-0 ps-0"
                      placeholder="Tìm tên, email hoặc số điện thoại..."
                      @input="scheduleAdminSearch"
                    />
                  </div>
                </section>

                <div class="row g-3 face-manager-grid">
                  <div class="col-12 col-xxl-8">
                    <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative">
                      <div v-if="isFetchingInitialData && hasLoadedAdmins" class="face-manager-refreshing">
                        <AdminLoadingSpinner size="20" label="Đang cập nhật danh sách nhân sự" />
                        <span>Đang cập nhật</span>
                      </div>
                      <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0 face-manager-table">
                          <thead>
                            <tr>
                              <th class="text-center" style="width: 56px;">Chọn</th>
                              <th>Nhân sự</th>
                              <th>Liên hệ</th>
                              <th>Hồ sơ khuôn mặt</th>
                            </tr>
                          </thead>
                          <tbody v-if="!hasLoadedAdmins">
                            <tr>
                              <td colspan="4" class="py-5 text-center">
                                <AdminLoadingSpinner size="32" label="Đang tải danh sách nhân sự" />
                                <div class="small text-muted mt-3">Đang tải danh sách nhân sự...</div>
                              </td>
                            </tr>
                          </tbody>
                          <tbody v-else :class="{ 'opacity-50': isFetchingInitialData }">
                            <tr
                              v-for="admin in admins"
                              :key="admin.id"
                              class="face-manager-row"
                              :class="{ 'is-selected': String(selectedAdminId) === String(admin.id) }"
                              @click="selectAdmin(admin.id)"
                            >
                              <td class="text-center">
                                <input
                                  class="form-check-input staff-select-control"
                                  type="radio"
                                  name="face-registration-admin"
                                  :value="String(admin.id)"
                                  :checked="String(selectedAdminId) === String(admin.id)"
                                  :aria-label="`Chọn ${displayAdminName(admin)}`"
                                  @click.stop
                                  @change="selectAdmin(admin.id)"
                                >
                              </td>
                              <td>
                                <div class="d-flex align-items-center gap-3">
                                  <SoraImage
                                    :src="admin.avatar_url"
                                    :placeholder="defaultAvatar"
                                    imgClass="rounded-circle object-fit-cover border shadow-sm"
                                    style="width:42px; height:42px;"
                                    alt="Avatar nhân sự"
                                  />
                                  <div class="min-w-0">
                                    <div class="fw-bold text-dark text-truncate">{{ displayAdminName(admin) }}</div>
                                    <div class="small text-muted">Mã nhân sự #{{ admin.id }}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div class="small text-muted"><i class="bi bi-envelope me-2"></i>{{ displayAdminEmail(admin) }}</div>
                                <div class="small text-muted mt-1"><i class="bi bi-telephone me-2"></i>{{ displayAdminPhone(admin) }}</div>
                              </td>
                              <td>
                                <span class="badge" :class="admin.face_profile?.requires_reset ? 'bg-warning text-dark' : (admin.face_profile ? 'bg-success' : 'bg-secondary')">
                                  {{ faceProfileStatus(admin.face_profile) }}
                                </span>
                                <div v-if="admin.face_profile" class="small text-muted mt-1">{{ admin.face_profile.sample_count || 0 }}/5 mẫu</div>
                              </td>
                            </tr>
                            <tr v-if="admins.length === 0">
                              <td colspan="4" class="py-5 text-center text-muted">
                                <i class="bi bi-people fs-3 d-block mb-2"></i>Không tìm thấy nhân sự phù hợp.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="face-manager-pagination border-top px-3 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <span class="small text-muted">Hiển thị {{ pagination.from || 0 }}–{{ pagination.to || 0 }} / {{ pagination.total || 0 }} nhân sự</span>
                        <div class="btn-group">
                          <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="isFetchingInitialData || pagination.currentPage <= 1" @click="changeAdminPage(pagination.currentPage - 1)">
                            <i class="bi bi-chevron-left"></i>
                          </button>
                          <span class="btn btn-light btn-sm disabled">Trang {{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
                          <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="isFetchingInitialData || pagination.currentPage >= pagination.lastPage" @click="changeAdminPage(pagination.currentPage + 1)">
                            <i class="bi bi-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <aside class="col-12 col-xxl-4">
                    <div v-if="selectedAdmin" class="card border-0 shadow-sm rounded-4 h-100">
                      <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex align-items-center gap-3 mb-4">
                          <SoraImage
                            :src="selectedAdmin.avatar_url"
                            :placeholder="defaultAvatar"
                            imgClass="rounded-circle object-fit-cover border shadow-sm flex-shrink-0"
                            style="width:56px; height:56px;"
                            alt="Avatar nhân sự"
                          />
                          <div class="min-w-0">
                            <div class="small text-brand fw-semibold text-uppercase mb-1">Đã chọn để đăng ký</div>
                            <h6 class="fw-bold text-dark mb-0 text-truncate">{{ selectedAdminLabel }}</h6>
                          </div>
                        </div>
                        <div class="small text-muted text-break"><i class="bi bi-envelope me-2"></i>{{ displayAdminEmail(selectedAdmin) }}</div>
                        <div class="small text-muted mt-2"><i class="bi bi-telephone me-2"></i>{{ displayAdminPhone(selectedAdmin) }}</div>
                        <div class="profile-sample-status rounded-3 p-3 my-4">
                          <div class="d-flex justify-content-between small text-muted mb-2"><span>Định danh đã lưu</span><strong class="text-dark">{{ profile.sample_count || 0 }}/5 mẫu</strong></div>
                          <div class="progress" role="progressbar" :aria-valuenow="profile.sample_count || 0" aria-valuemin="0" aria-valuemax="5">
                            <div class="progress-bar bg-brand" :style="{ width: `${Math.min((profile.sample_count || 0) * 20, 100)}%` }"></div>
                          </div>
                        </div>
                        <div class="d-grid gap-2">
                          <button v-if="canRegister" class="btn btn-brand fw-bold text-white" @click="confirmAndStartRegistration">
                            <i class="bi bi-person-add me-2"></i>Bắt đầu đăng ký
                          </button>
                          <div v-else-if="isFetchingProfile" class="small text-center text-muted py-2"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Đang kiểm tra hồ sơ...</div>
                          <div v-else class="alert alert-success small mb-0 py-2 text-center"><i class="bi bi-check-circle me-1"></i>Hồ sơ đã đủ 5 mẫu.</div>
                          <button type="button" class="btn btn-outline-danger" @click="resetFaceProfile" :disabled="!canResetProfile">
                            <i class="bi bi-trash3 me-2"></i>Xóa hồ sơ
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="card border-0 shadow-sm rounded-4 h-100">
                      <div class="card-body d-flex flex-column align-items-center justify-content-center text-center p-4">
                        <div class="avatar bg-light text-muted rounded-circle d-flex align-items-center justify-content-center mb-3" style="width:64px; height:64px; font-size:26px;">
                          <i class="bi bi-person-check"></i>
                        </div>
                        <h6 class="fw-bold text-dark">Chọn một nhân sự</h6>
                        <p class="small text-muted mb-0">Tích chọn một dòng trong bảng để kiểm tra và đăng ký hồ sơ khuôn mặt.</p>
                      </div>
                    </div>
                  </aside>
                </div>
              </template>

              <template v-else>
                 <div class="text-center py-4">
                    <div class="avatar bg-brand text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow" style="width:80px; height:80px; font-size:36px;">
                      <i class="bi bi-person-check"></i>
                    </div>
                    <h4 class="fw-bold text-dark mb-2">Chấm công bằng khuôn mặt</h4>
                    <p class="text-muted mb-4 px-3">Camera sẽ định danh nhân sự từ hồ sơ đã đăng ký và ghi nhận vào ca làm hợp lệ của hôm nay.</p>
                    
                    <button class="btn btn-brand btn-lg fw-bold rounded-pill px-5 text-white shadow-sm" @click="startScanningMode('attendance')">
                      <i class="bi bi-camera-video me-2"></i> Mở Camera Quét
                    </button>
                 </div>
              </template>
            </div>
          </div>

          <!-- SCANNING STATE (Face ID Style) -->
          <div v-if="uiState === 'scanning'" class="face-id-scanner w-100 h-100 d-flex flex-column align-items-center justify-content-center position-relative">
            <button
              type="button"
              class="btn btn-outline-light rounded-pill px-3 py-2 scanner-retry-control position-absolute top-0 start-0 m-4 z-3"
              :disabled="!canRetryCurrentScan"
              @click="retryCurrentScan"
            >
              <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>Quét lại
            </button>
            <button type="button" class="btn-close-scanner btn-close btn-close-white position-absolute top-0 end-0 m-4 z-3" aria-label="Close" @click="stopScanningMode"></button>

            <aside v-if="scanningAction === 'verify' && resultType === 'success' && matchedAdmin" class="scanner-verification-result z-2">
              <div class="scanner-identity-icon"><i class="bi bi-person-check" aria-hidden="true"></i></div>
              <div class="min-w-0">
                <div class="scanner-identity-label">Đối chiếu thành công</div>
                <div class="scanner-identity-name text-truncate">{{ displayAdminName(matchedAdmin) }}</div>
                <div class="scanner-identity-detail text-truncate"><i class="bi bi-envelope me-2"></i>{{ displayAdminEmail(matchedAdmin) }}</div>
                <div class="scanner-identity-detail text-truncate"><i class="bi bi-telephone me-2"></i>{{ displayAdminPhone(matchedAdmin) }}</div>
              </div>
            </aside>

            <aside v-if="scanningAction === 'register' && selectedAdmin" class="scanner-registration-identity d-none d-lg-flex z-2">
              <div class="scanner-identity-icon"><i class="bi bi-person-bounding-box" aria-hidden="true"></i></div>
              <div class="min-w-0">
                <div class="scanner-identity-label">Đang đăng ký cho</div>
                <div class="scanner-identity-name text-truncate">{{ selectedAdminLabel }}</div>
                <div class="scanner-identity-detail text-truncate"><i class="bi bi-envelope me-2"></i>{{ displayAdminEmail(selectedAdmin) }}</div>
                <div class="scanner-identity-detail text-truncate"><i class="bi bi-telephone me-2"></i>{{ displayAdminPhone(selectedAdmin) }}</div>
              </div>
            </aside>
            
            <div class="scanner-header text-center mb-4 z-2 position-relative">
              <h4 class="text-white fw-bold mb-1">{{ scanningTitle }}</h4>
              <p class="text-white-50 fs-6 mb-0">{{ scanningSubtitle }}</p>
              <div v-if="scanningAction === 'register' && selectedAdmin" class="scanner-registration-identity-mobile d-lg-none mt-3">
                <strong>{{ selectedAdminLabel }}</strong>
                <span>{{ displayAdminEmail(selectedAdmin) }}</span>
              </div>
              <label v-if="videoInputDevices.length > 1" class="scanner-camera-picker mt-3">
                <i class="bi bi-camera-video" aria-hidden="true"></i>
                <select v-model="selectedCameraId" aria-label="Chọn thiết bị camera" :disabled="isSwitchingCamera" @change="switchCamera">
                  <option v-for="(device, index) in videoInputDevices" :key="device.deviceId" :value="device.deviceId">
                    {{ device.label || `Camera ${index + 1}` }}
                  </option>
                </select>
              </label>
            </div>

            <div class="face-id-ring-container position-relative" :class="{'zoom-closer': isRegistering && currentRegStep === 4}">
              <!-- SVG Dashed Ring -->
              <svg class="face-id-svg" viewBox="0 0 100 136">
                <ellipse class="ring-bg" cx="50" cy="68" rx="66" ry="48" transform="rotate(-90 50 68)"></ellipse>
                <ellipse class="ring-progress" :class="{'is-success': resultType === 'success', 'is-warning': resultType === 'warning', 'is-danger': !!errorMessage}" cx="50" cy="68" rx="66" ry="48" transform="rotate(-90 50 68)" :style="{ strokeDashoffset: ringDashoffset }"></ellipse>
              </svg>

              <!-- Camera Video Cutout -->
              <div class="face-id-camera-wrapper">
                 <video ref="videoRef" class="camera-video" autoplay muted playsinline></video>
              </div>

              <!-- Loading / Processing state -->
              <div v-if="isLoadingModels" class="scanner-overlay position-absolute d-flex align-items-center justify-content-center rounded-circle z-2">
                 <div class="spinner-border text-white opacity-75" style="width: 3rem; height: 3rem;"></div>
              </div>
            </div>

            <div class="scanner-footer text-center mt-5 z-2 position-relative">
              <Transition name="fade" mode="out-in">
                <div :key="resultMessage || errorMessage" class="fw-bold fs-6 px-3 lh-sm" :class="messageColorClass">
                  {{ errorMessage || resultMessage || 'Đang chuẩn bị camera...' }}
                </div>
              </Transition>
              <div class="mt-4" v-if="isRegistering">
                <div class="d-flex justify-content-center gap-3">
                  <div v-for="n in 5" :key="n" class="step-dot" :class="{'is-active': currentRegStep >= n - 1}"></div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref } from 'vue';
import apiClient from '@/utils/apiClient';
import Swal from 'sweetalert2';
import SoraImage from '@/components/ui/SoraImage.vue';
import AdminLoadingSpinner from '@/components/admin/AdminLoadingSpinner.vue';
import defaultAvatar from '@/assets/images/defaults/avatar1.png';

const MODEL_URL = '/face-api-models';
const MODEL_NAME = 'face-api.js';
const MODEL_VERSION = '0.22.2';

const isVisible = ref(false);
const isFetchingInitialData = ref(false);
const hasLoadedAdmins = ref(false);
const isLoadingModels = ref(false);
const isProcessing = ref(false);
const isCameraActive = ref(false);
const videoRef = ref(null);
const streamRef = ref(null);
const cameraAspectRatio = ref('4 / 3');
const videoInputDevices = ref([]);
const selectedCameraId = ref('');
const isSwitchingCamera = ref(false);
const admins = ref([]);
const selectedAdminId = ref('');
const searchQuery = ref('');
const isFetchingProfile = ref(false);
const profile = ref({ has_profile: false, sample_count: 0, requires_reset: false });
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  perPage: 25,
  total: 0,
  from: 0,
  to: 0,
});
const modalMode = ref('manage');
const resultMessage = ref('');
const resultType = ref('info');
const errorMessage = ref('');
const matchedAdmin = ref(null);
const lastDistance = ref(null);
const isAutoScanEnabled = ref(false);

const registrationSteps = [
  "Vui lòng nhìn thẳng vào camera",
  "Hơi quay mặt sang TRÁI",
  "Hơi quay mặt sang PHẢI",
  "Hơi ngước mặt lên trên",
  "Đưa khuôn mặt lại gần camera hơn"
];
const currentRegStep = ref(0);
const isRegistering = ref(false);

const uiState = ref('setup');
const scanProgress = ref(0);
const scanningAction = ref('');
let activeScanSession = 0;

const scanningTitle = computed(() => {
  if (scanningAction.value === 'register') return 'Đăng ký khuôn mặt';
  if (scanningAction.value === 'verify') return 'Đối chiếu khuôn mặt';
  return 'Chấm công khuôn mặt';
});
const scanningSubtitle = computed(() => {
  if (scanningAction.value === 'register') return 'Làm theo hướng dẫn để lấy 5 mẫu khuôn mặt';
  return 'Đưa khuôn mặt vào giữa vòng tròn';
});
const ringDashoffset = computed(() => {
  const c = 360.4; // circumference of ellipse rx=48, ry=66
  return c * (1 - scanProgress.value);
});
const messageColorClass = computed(() => {
  if (errorMessage.value || resultType.value === 'danger') return 'text-danger';
  if (resultType.value === 'success') return 'text-success';
  if (resultType.value === 'warning') return 'text-warning';
  return 'text-white';
});
const canRetryCurrentScan = computed(() => (
  !isProcessing.value
  && !isLoadingModels.value
  && !isRegistering.value
  && !isSwitchingCamera.value
));

const startScanningMode = async (action) => {
  scanningAction.value = action;
  uiState.value = 'scanning';
  scanProgress.value = 0;
  clearMessages();
  await startCamera();
  if (action === 'attendance') {
    startAutoScan();
  } else if (action === 'verify') {
    await verifyFace();
  } else if (action === 'register') {
    await registerFace();
  }
};

const stopScanningMode = () => {
  activeScanSession++;
  stopAutoScan();
  stopCamera();
  uiState.value = 'setup';
  scanProgress.value = 0;
};

const retryCurrentScan = async () => {
  if (!canRetryCurrentScan.value) return;

  clearMessages();
  scanProgress.value = 0;

  if (!isCameraActive.value) {
    await startCamera();
  }

  if (!isCameraActive.value) return;

  if (scanningAction.value === 'attendance') {
    await attendanceByFace();
    startAutoScan();
  } else if (scanningAction.value === 'verify') {
    await verifyFace();
  } else if (scanningAction.value === 'register') {
    await registerFace();
  }
};

let modelLoadPromise = null;
let faceApiModule = null;
let autoScanTimer = null;
let adminSearchTimer = null;
let adminsRequestVersion = 0;

const selectAdmin = (id) => {
  selectedAdminId.value = id;
  profile.value = { has_profile: false, sample_count: 0, requires_reset: false };
  fetchProfile();
};

const clearSelectedAdmin = () => {
  selectedAdminId.value = '';
  isFetchingProfile.value = false;
  profile.value = { has_profile: false, sample_count: 0, requires_reset: false };
};

const scheduleAdminSearch = () => {
  if (adminSearchTimer) {
    window.clearTimeout(adminSearchTimer);
  }

  adminSearchTimer = window.setTimeout(() => {
    clearSelectedAdmin();
    fetchAdmins(1);
  }, 300);
};

const openModal = async (mode = 'manage') => {
  modalMode.value = mode;
  uiState.value = 'setup';
  stopAutoScan();
  isVisible.value = true;
  clearMessages();
  await nextTick();
  if (isManageMode.value) {
    clearSelectedAdmin();
    searchQuery.value = '';
    await fetchAdmins(1);
  }
};

const emit = defineEmits(['attendance-success']);
const isManageMode = computed(() => modalMode.value === 'manage');
const isAttendanceMode = computed(() => modalMode.value === 'attendance');
const isReady = computed(() => isCameraActive.value && !isLoadingModels.value && !isProcessing.value);
const cameraPanelStyle = computed(() => ({
  aspectRatio: cameraAspectRatio.value,
}));
const canRegister = computed(() => !!selectedAdminId.value && !isFetchingProfile.value && (!profile.value?.has_profile || profile.value.requires_reset || profile.value.sample_count < 5) && !isProcessing.value);
const canResetProfile = computed(() => !!selectedAdminId.value && !isFetchingProfile.value && !!profile.value?.has_profile && !isProcessing.value);
const selectedAdmin = computed(() => admins.value.find((admin) => String(admin.id) === String(selectedAdminId.value)));
const selectedAdminLabel = computed(() => selectedAdmin.value ? displayAdminName(selectedAdmin.value) : 'Chưa chọn');
const profileStatusLabel = computed(() => {
  if (profile.value?.requires_reset) return 'Cần đăng ký lại';
  return profile.value?.has_profile ? (profile.value.sample_count >= 5 ? 'Đã đăng ký (Tối đa)' : 'Đang đăng ký') : 'Chưa đăng ký';
});
const profileBadgeClass = computed(() => {
  if (profile.value?.requires_reset) return 'bg-warning text-dark';
  return profile.value?.has_profile ? 'bg-success' : 'bg-secondary';
});
const cameraHint = computed(() => isLoadingModels.value ? 'Đang tải model nhận diện...' : 'Camera chưa bật');
const loadingText = computed(() => isLoadingModels.value ? 'Đang tải face-api.js và model...' : 'Đang xử lý khuôn mặt...');
const resultClass = computed(() => ({
  'alert-success': resultType.value === 'success',
  'alert-warning': resultType.value === 'warning',
  'alert-info': resultType.value === 'info',
}));
const formattedDistance = computed(() => {
  if (lastDistance.value === null || lastDistance.value === undefined) return '--';
  return Number(lastDistance.value).toFixed(4);
});
const modalTitle = computed(() => (
  isAttendanceMode.value ? 'Chấm công bằng khuôn mặt' : 'Quản lý định danh khuôn mặt'
));
const modalSubtitle = computed(() => (
  isAttendanceMode.value
    ? 'Quét mặt để check-in hoặc check-out theo ca làm hiện tại.'
    : 'Ghi mẫu, xóa hồ sơ và đối chiếu định danh cho từng nhân sự.'
));
const helperText = computed(() => (
  isAttendanceMode.value
    ? 'Đưa khuôn mặt vào khung hình, giữ camera ổn định và bấm quét để chấm công.'
    : 'Mỗi tài khoản chỉ lưu một định danh. Muốn thay đổi cần xóa định danh cũ.'
));


const closeModal = () => {
  if (adminSearchTimer) {
    window.clearTimeout(adminSearchTimer);
    adminSearchTimer = null;
  }
  stopScanningMode();
  isVisible.value = false;
};

const clearMessages = () => {
  resultMessage.value = '';
  errorMessage.value = '';
  matchedAdmin.value = null;
  lastDistance.value = null;
};

const fetchAdmins = async (page = pagination.value.currentPage) => {
  const requestVersion = ++adminsRequestVersion;
  isFetchingInitialData.value = true;
  try {
    const response = await apiClient.get('/admin/face-recognition/admins', {
      params: {
        page,
        per_page: pagination.value.perPage,
        search: searchQuery.value.trim() || undefined,
      },
    });
    if (requestVersion !== adminsRequestVersion) return;

    admins.value = response.data?.data || [];
    const meta = response.data?.meta || {};
    pagination.value = {
      currentPage: Number(meta.current_page || page),
      lastPage: Number(meta.last_page || 1),
      perPage: Number(meta.per_page || pagination.value.perPage),
      total: Number(meta.total || 0),
      from: Number(meta.from || 0),
      to: Number(meta.to || 0),
    };

    if (selectedAdminId.value) {
      await fetchProfile();
    }
  } catch (error) {
    if (requestVersion === adminsRequestVersion) {
      errorMessage.value = error.response?.data?.message || 'Không thể tải danh sách nhân sự.';
    }
  } finally {
    if (requestVersion === adminsRequestVersion) {
      hasLoadedAdmins.value = true;
      isFetchingInitialData.value = false;
    }
  }
};

const changeAdminPage = (page) => {
  if (page < 1 || page > pagination.value.lastPage || page === pagination.value.currentPage) return;
  clearSelectedAdmin();
  fetchAdmins(page);
};

const fetchProfile = async () => {
  if (!selectedAdminId.value) {
    profile.value = { has_profile: false, sample_count: 0, requires_reset: false };
    return;
  }

  const requestedAdminId = selectedAdminId.value;
  isFetchingProfile.value = true;
  try {
    const response = await apiClient.get('/admin/face-recognition/profile', {
      params: { admin_id: requestedAdminId },
    });
    if (String(selectedAdminId.value) === String(requestedAdminId)) {
      profile.value = response.data?.data || { has_profile: false, sample_count: 0, requires_reset: false };
    }
  } catch (error) {
    if (String(selectedAdminId.value) === String(requestedAdminId)) {
      errorMessage.value = error.response?.data?.message || 'Không thể tải trạng thái mẫu khuôn mặt.';
    }
  } finally {
    if (String(selectedAdminId.value) === String(requestedAdminId)) {
      isFetchingProfile.value = false;
    }
  }
};

const confirmAndStartRegistration = async () => {
  if (!canRegister.value || !selectedAdmin.value) return;

  const result = await Swal.fire({
    title: 'Xác nhận đăng ký khuôn mặt',
    html: identityConfirmHtml(selectedAdmin.value, 'Camera sẽ ghi các mẫu mới cho đúng tài khoản này.'),
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#009981',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Bắt đầu đăng ký',
    cancelButtonText: 'Kiểm tra lại',
  });

  if (result.isConfirmed) {
    await startScanningMode('register');
  }
};

const loadModels = async () => {
  if (modelLoadPromise) return modelLoadPromise;

  modelLoadPromise = (async () => {
    isLoadingModels.value = true;
    faceApiModule = faceApiModule || await import('face-api.js');
    await Promise.all([
      faceApiModule.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceApiModule.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceApiModule.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return faceApiModule;
  })()
    .catch((error) => {
      modelLoadPromise = null;
      throw error;
    })
    .finally(() => {
      isLoadingModels.value = false;
    });

  return modelLoadPromise;
};

const startCamera = async () => {
  clearMessages();

  try {
    await loadModels();

    if (streamRef.value) {
      isCameraActive.value = true;
      syncVideoAspect();
      await refreshVideoInputs();
      return;
    }

    const createStream = (deviceId = '') => navigator.mediaDevices.getUserMedia({
      video: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false,
    });

    let stream;
    try {
      stream = await createStream(selectedCameraId.value);
    } catch (error) {
      if (!selectedCameraId.value || !['NotFoundError', 'OverconstrainedError'].includes(error?.name)) {
        throw error;
      }

      selectedCameraId.value = '';
      stream = await createStream();
    }

    streamRef.value = stream;
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      await videoRef.value.play();
      syncVideoAspect();
    }
    isCameraActive.value = true;
    await refreshVideoInputs();
  } catch (error) {
    isCameraActive.value = false;
    errorMessage.value = error.message || 'Không thể bật camera hoặc tải model nhận diện.';
  }
};

const refreshVideoInputs = async () => {
  if (!navigator.mediaDevices?.enumerateDevices) return;

  let devices;
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    console.warn('Không thể liệt kê thiết bị camera.', error);
    return;
  }

  videoInputDevices.value = devices.filter((device) => device.kind === 'videoinput');

  const activeCameraId = streamRef.value?.getVideoTracks?.()[0]?.getSettings?.().deviceId;
  if (activeCameraId) {
    selectedCameraId.value = activeCameraId;
  } else if (!selectedCameraId.value && videoInputDevices.value.length > 0) {
    selectedCameraId.value = videoInputDevices.value[0].deviceId;
  }
};

const switchCamera = async () => {
  if (isSwitchingCamera.value || !selectedCameraId.value) return;

  isSwitchingCamera.value = true;
  activeScanSession++;
  stopAutoScan();
  stopCamera();
  clearMessages();
  scanProgress.value = 0;

  try {
    await startCamera();
    if (isAttendanceMode.value && isCameraActive.value) {
      startAutoScan();
    }
  } finally {
    isSwitchingCamera.value = false;
  }
};

const syncVideoAspect = () => {
  const video = videoRef.value;
  if (!video?.videoWidth || !video?.videoHeight) {
    cameraAspectRatio.value = '4 / 3';
    return;
  }

  cameraAspectRatio.value = `${video.videoWidth} / ${video.videoHeight}`;
};

const stopCamera = () => {
  stopAutoScan();

  if (streamRef.value) {
    streamRef.value.getTracks().forEach((track) => track.stop());
    streamRef.value = null;
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }

  isCameraActive.value = false;
  cameraAspectRatio.value = '4 / 3';
};

const toggleAutoScan = () => {
  if (isAutoScanEnabled.value) {
    stopAutoScan();
    return;
  }

  startAutoScan();
};

const startAutoScan = () => {
  if (!isAttendanceMode.value || !isCameraActive.value || autoScanTimer) return;

  isAutoScanEnabled.value = true;
  autoScanTimer = window.setInterval(async () => {
    if (!isVisible.value || !isAttendanceMode.value || !isReady.value || Swal.isVisible()) return;

    await attendanceByFace(false, { source: 'auto' });
  }, 3500);
};

const stopAutoScan = () => {
  if (autoScanTimer) {
    window.clearInterval(autoScanTimer);
    autoScanTimer = null;
  }

  isAutoScanEnabled.value = false;
};

const getDistance = (point1, point2) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

const validateFaceAction = (landmarks, actionType) => {
  if (!landmarks || !landmarks.positions || landmarks.positions.length < 68) return false;
  const pts = landmarks.positions;
  
  if (actionType === 'straight') {
    const distLeft = getDistance(pts[0], pts[30]);
    const distRight = getDistance(pts[16], pts[30]);
    const ratio = distLeft / distRight;
    return ratio >= 0.65 && ratio <= 1.5;
  }
  
  if (actionType === 'left') {
    const distLeft = getDistance(pts[0], pts[30]);
    const distRight = getDistance(pts[16], pts[30]);
    const ratio = distLeft / distRight;
    // Quay trái (thực tế) -> mũi lệch sang phải trên ảnh (chưa lật) -> ratio lớn
    return ratio > 1.45;
  }
  
  if (actionType === 'right') {
    const distLeft = getDistance(pts[0], pts[30]);
    const distRight = getDistance(pts[16], pts[30]);
    const ratio = distLeft / distRight;
    // Quay phải (thực tế) -> mũi lệch sang trái trên ảnh -> ratio nhỏ
    return ratio < 0.65;
  }
  
  if (actionType === 'up') {
    const distNoseBridge = getDistance(pts[27], pts[30]);
    const distNoseChin = getDistance(pts[30], pts[8]);
    const pitchRatio = distNoseBridge / distNoseChin;
    return pitchRatio < 0.45;
  }
  
  if (actionType === 'closer') {
    const faceWidth = getDistance(pts[0], pts[16]);
    
    if (videoRef.value && videoRef.value.videoWidth) {
      // Yêu cầu khuôn mặt to hơn (chiếm khoảng >25% chiều rộng video)
      const ratio = faceWidth / videoRef.value.videoWidth;
      return ratio > 0.25;
    }
    return faceWidth > 220; // Fallback
  }
  
  return true;
};

const getDescriptor = async (timeout = 8000, actionType = 'none') => {
  const faceapi = await loadModels();
  const startTime = Date.now();
  let detection = null;
  let foundFaceButInvalid = false;

  while (Date.now() - startTime < timeout) {
    if (!videoRef.value || !isCameraActive.value) {
      throw new Error('Camera chưa sẵn sàng.');
    }

    try {
      detection = await faceapi
        .detectSingleFace(videoRef.value, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        if (actionType === 'none' || validateFaceAction(detection.landmarks, actionType)) {
          break;
        } else {
          foundFaceButInvalid = true;
          detection = null;
        }
      }
    } catch (err) {
      // Ignore inner errors and retry
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  if (!detection) {
    if (foundFaceButInvalid) {
       throw new Error('INVALID_ACTION');
    }
    throw new Error('NO_FACE');
  }

  return Array.from(detection.descriptor);
};

const registerFace = async () => {
  if (!selectedAdminId.value) {
    errorMessage.value = 'Vui lòng chọn nhân sự trước khi ghi mẫu.';
    return;
  }
  const currentSession = ++activeScanSession;

  await runFaceAction(async () => {
    const descriptors = [];
    const maxSamples = 5 - (profile.value?.sample_count || 0);
    const actionMapping = ['straight', 'left', 'right', 'up', 'closer'];

    isRegistering.value = true;
    for (let i = 1; i <= maxSamples; i++) {
      currentRegStep.value = (profile.value?.sample_count || 0) + i - 1;
      const currentActionType = actionMapping[currentRegStep.value] || 'none';
      
      // Delay for user to adjust their face
      resultType.value = 'info';
      resultMessage.value = `Sẵn sàng lấy mẫu ${i}/${maxSamples}...`;
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let descriptor = null;
      while (isRegistering.value && activeScanSession === currentSession) {
        resultType.value = 'info';
        resultMessage.value = `ĐANG CHỜ: ${registrationSteps[currentRegStep.value]}`;
        
        try {
          descriptor = await getDescriptor(3000, currentActionType);
          break; // Success!
        } catch (err) {
          if (err.message === 'INVALID_ACTION') {
            resultType.value = 'warning';
            resultMessage.value = `Chưa đúng tư thế: ${registrationSteps[currentRegStep.value]}`;
            await new Promise(resolve => setTimeout(resolve, 800));
          } else if (err.message === 'NO_FACE') {
            resultType.value = 'danger';
            resultMessage.value = 'Không tìm thấy khuôn mặt rõ trong khung hình.';
            await new Promise(resolve => setTimeout(resolve, 800));
          } else {
            throw err;
          }
        }
      }
      
      if (activeScanSession !== currentSession || !isRegistering.value) return;
      
      descriptors.push(descriptor);
      resultType.value = 'success';
      resultMessage.value = `✓ Đã lấy mẫu ${i}`;
      scanProgress.value = i / maxSamples;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    isRegistering.value = false;

    if (descriptors.length === 0) {
      throw new Error('Không thể lấy được mẫu khuôn mặt hợp lệ nào. Vui lòng thử lại.');
    }

    resultMessage.value = 'Đang gửi dữ liệu định danh lên máy chủ...';

    const response = await apiClient.post('/admin/face-recognition/register', {
      admin_id: selectedAdminId.value,
      descriptors,
      model_name: MODEL_NAME,
      model_version: MODEL_VERSION,
    });
    if (activeScanSession !== currentSession) return;

    resultType.value = 'success';
    resultMessage.value = response.data?.message || 'Đã lưu mẫu khuôn mặt.';
    await fetchAdmins();
  });
};

const verifyFace = async () => {
  const currentSession = ++activeScanSession;
  await runFaceAction(async () => {
    const descriptor = await getDescriptor();
    if (activeScanSession !== currentSession) return;
    const response = await apiClient.post('/admin/face-recognition/verify', {
      descriptor,
    });
    if (activeScanSession !== currentSession) return;

    const data = response.data?.data || {};
    applyRecognitionData(data);
    resultType.value = data.is_matched ? 'success' : 'warning';
    resultMessage.value = response.data?.message || 'Đã quét thử khuôn mặt.';
    
    scanProgress.value = 1;
    
    if (data.is_matched && data.matched_admin) {
      selectedAdminId.value = data.matched_admin.id;
      searchQuery.value = data.matched_admin.fullname || data.matched_admin.email || '';
      pagination.value.currentPage = 1;
      await fetchProfile();
    }
    await fetchAdmins();
  });
};

const attendanceByFace = async (confirmCheckout = false, options = {}) => {
  const currentSession = ++activeScanSession;
  await runFaceAction(async () => {
    const descriptor = await getDescriptor();
    if (activeScanSession !== currentSession) return;
    const response = await apiClient.post('/admin/face-recognition/attendance', {
      descriptor,
      confirm_checkout: confirmCheckout,
    });
    if (activeScanSession !== currentSession) return;

    const data = response.data?.data || {};
    applyRecognitionData(data);

    if (data.requires_confirmation) {
      stopAutoScan();
      resultType.value = 'warning';
      resultMessage.value = response.data?.message || 'Cần xác nhận tan ca.';

      const result = await Swal.fire({
        title: 'Xác nhận tan ca?',
        html: identityConfirmHtml(data.matched_admin, 'Bạn có chắc muốn tan ca cho nhân sự này không?'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Có, tan ca',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        if (activeScanSession !== currentSession) return;
        const confirmedResponse = await apiClient.post('/admin/face-recognition/attendance', {
          descriptor,
          confirm_checkout: true,
        });
        if (activeScanSession !== currentSession) return;
        const confirmedData = confirmedResponse.data?.data || {};
        applyRecognitionData(confirmedData);
        resultType.value = 'success';
        resultMessage.value = confirmedResponse.data?.message || 'Đã check-out bằng khuôn mặt.';
        scanProgress.value = 1;
        await showRecognitionAlert(confirmedData.matched_admin || data.matched_admin, {
          title: 'Check-out thành công',
          message: resultMessage.value,
          distance: confirmedData.distance ?? data.distance,
        });
        emit('attendance-success');
        stopScanningMode();
        if (isManageMode.value) {
          await fetchAdmins();
        }
      } else {
        scanProgress.value = 0;
        startAutoScan(); // Resume scanning if cancelled
      }
      return;
    }

    resultType.value = data.is_matched ? 'success' : 'warning';
    resultMessage.value = response.data?.message || 'Đã xử lý chấm công bằng khuôn mặt.';

    if (response.data?.success && data.action) {
      stopAutoScan();
      scanProgress.value = 1;
      await showRecognitionAlert(data.matched_admin, {
        title: data.action === 'check_out' ? 'Check-out thành công' : 'Check-in thành công',
        message: resultMessage.value,
        distance: data.distance,
      });
      emit('attendance-success');
      stopScanningMode();
    }

    if (isManageMode.value) {
      await fetchAdmins();
    }
  });
};

const resetFaceProfile = async () => {
  if (!selectedAdminId.value) return;

  const result = await Swal.fire({
    title: 'Xóa hồ sơ khuôn mặt?',
    text: `Định danh khuôn mặt của ${selectedAdminLabel.value} sẽ bị xóa và cần đăng ký lại nếu muốn tiếp tục chấm công bằng khuôn mặt.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Xóa hồ sơ',
    cancelButtonText: 'Hủy',
  });

  if (!result.isConfirmed) return;

  await runFaceAction(async () => {
    const response = await apiClient.delete(`/admin/face-recognition/profile/${selectedAdminId.value}`);
    resultType.value = 'success';
    resultMessage.value = response.data?.message || 'Đã xóa hồ sơ khuôn mặt.';
    await fetchAdmins();
    await fetchProfile();
  });
};

const applyRecognitionData = (data) => {
  lastDistance.value = data.distance;
  matchedAdmin.value = data.matched_admin;
};

const runFaceAction = async (action) => {
  if (isProcessing.value) return;
  clearMessages();
  isProcessing.value = true;

  try {
    await action();
  } catch (error) {
    const data = error.response?.data?.data;
    const msg = error.response?.data?.message || error.message || 'Không thể xử lý khuôn mặt.';
    
    if (data) {
      applyRecognitionData(data);
      resultType.value = 'warning';
    }
    
    if (error.message === 'NO_FACE') {
      resultType.value = 'warning';
      resultMessage.value = 'Chưa phát hiện khuôn mặt rõ trong khung. Hãy điều chỉnh vị trí rồi quét lại.';
    } else {
      errorMessage.value = msg;
    }
    
    if (data?.action === 'blocked') {
      stopAutoScan();
      Swal.fire({
        title: 'Từ chối chấm công',
        text: msg,
        icon: 'error',
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: '#dc3545'
      }).then(() => {
        startAutoScan();
      });
    }
  } finally {
    isProcessing.value = false;
    isRegistering.value = false;
  }
};

const faceProfileStatus = (faceProfile) => {
  if (!faceProfile) return 'chưa đăng ký';
  return faceProfile.requires_reset ? 'cần đăng ký lại' : 'đã đăng ký';
};

const displayAdminName = (admin) => {
  if (!admin) return '--';
  return admin.fullname || admin.email || `Admin #${admin.id}`;
};

const displayAdminEmail = (admin) => admin?.email || 'Chưa có email';

const displayAdminPhone = (admin) => admin?.phone || 'Chưa có số điện thoại';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const identityConfirmHtml = (admin, message) => `
  <div class="text-start">
    <p class="mb-3 text-center">${escapeHtml(message)}</p>
    <div class="rounded-3 border bg-light p-3">
      <div class="fw-bold fs-5 text-dark mb-2">${escapeHtml(displayAdminName(admin))}</div>
      <div class="small text-muted mb-1">
        <i class="bi bi-envelope me-2"></i>${escapeHtml(displayAdminEmail(admin))}
      </div>
      <div class="small text-muted">
        <i class="bi bi-telephone me-2"></i>${escapeHtml(displayAdminPhone(admin))}
      </div>
      <div class="small text-muted mt-1">
        <i class="bi bi-clock me-2"></i>${escapeHtml(formatDate(new Date()))}
      </div>
    </div>
  </div>
`;

const recognitionAlertHtml = (admin, options = {}) => `
  <div class="face-alert-result text-start">
    <div class="face-alert-card">
      <div class="face-alert-avatar">
        <i class="bi bi-person-check"></i>
      </div>
      <div class="min-w-0">
        <div class="text-muted small mb-1">Xin chào</div>
        <div class="fw-bold fs-4 text-dark mb-2">${escapeHtml(displayAdminName(admin))}</div>
        <div class="face-alert-line">
          <i class="bi bi-envelope"></i>
          <span>${escapeHtml(displayAdminEmail(admin))}</span>
        </div>
        <div class="face-alert-line">
          <i class="bi bi-telephone"></i>
          <span>${escapeHtml(displayAdminPhone(admin))}</span>
        </div>
        <div class="face-alert-line">
          <i class="bi bi-clock"></i>
          <span>${escapeHtml(formatDate(new Date()))}</span>
        </div>
        ${options.distance !== undefined && options.distance !== null ? `
          <div class="face-alert-line">
            <i class="bi bi-bullseye"></i>
            <span>Khoảng cách đối chiếu: ${escapeHtml(Number(options.distance).toFixed(4))}</span>
          </div>
        ` : ''}
      </div>
    </div>
    ${options.message ? `<div class="face-alert-note">${escapeHtml(options.message)}</div>` : ''}
  </div>
`;

const showRecognitionAlert = async (admin, options = {}) => {
  if (!admin) return;

  await Swal.fire({
    icon: 'success',
    title: options.title || 'Định danh thành công',
    html: recognitionAlertHtml(admin, options),
    confirmButtonText: 'Đã rõ',
    confirmButtonColor: '#009981',
    customClass: {
      popup: 'face-alert-popup',
    },
  });
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('vi-VN');
};

defineExpose({ openModal, closeModal });

onUnmounted(() => {
  if (adminSearchTimer) {
    window.clearTimeout(adminSearchTimer);
  }
  stopCamera();
});
</script>

<style scoped>
.face-id-overlay {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.face-id-wrapper {
  position: relative;
  overflow: hidden;
}

.face-id-setup {
  width: 100vw;
  height: 100dvh;
  max-height: none;
  transition: all 0.3s ease;
}

.face-manager-header {
  flex: 0 0 auto;
}

.face-manager-header h6 {
  font-size: 1.05rem;
}

.face-manager-header p {
  font-size: 0.78rem;
}

.face-manager-content {
  min-height: 0;
}

.face-manager-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.face-manager-search {
  width: min(100%, 440px);
}

.min-w-0 {
  min-width: 0;
}

.staff-select-control {
  width: 24px;
  height: 24px;
  border: 1px solid #ced4da;
  cursor: pointer;
  margin: 0;
  transition: all 0.2s ease;
}

.staff-select-control:checked {
  border-color: #009981;
  background: #009981;
}

.staff-select-control:focus-visible {
  outline: 2px solid rgba(0, 153, 129, 0.35);
  outline-offset: 2px;
}

.face-manager-table thead th {
  padding: 0.9rem 1rem;
  border-bottom-color: #e8ecef;
  background: #f8fafb;
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.face-manager-table tbody td {
  padding: 1rem;
}

.face-manager-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.face-manager-row:hover {
  background: rgba(0, 153, 129, 0.05);
}

.face-manager-row.is-selected {
  background: rgba(0, 153, 129, 0.1);
  box-shadow: inset 3px 0 0 #009981;
}

.face-manager-pagination {
  background: #fff;
}

.face-manager-refreshing {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(0, 153, 129, 0.16);
  border-radius: 50rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 0.25rem 0.75rem rgba(33, 37, 41, 0.08);
  color: #007a67;
  font-size: 0.75rem;
  font-weight: 600;
}

.profile-sample-status {
  background: #f2faf8;
  border: 1px solid rgba(0, 153, 129, 0.16);
}

@media (min-width: 1400px) {
  .face-manager-grid {
    min-height: calc(100dvh - 176px);
  }
}

@media (max-width: 575.98px) {
  .face-manager-header {
    align-items: flex-start !important;
  }

  .face-manager-header .btn {
    font-size: 0;
    width: 38px;
    height: 38px;
    padding: 0;
  }

  .face-manager-header .btn i {
    margin: 0 !important;
    font-size: 1rem;
  }

  .face-manager-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .face-manager-search {
    width: 100%;
  }
}

.face-id-scanner {
  background: #000;
  animation: fadeIn 0.4s ease forwards;
}

.btn-close-scanner {
  filter: invert(1) grayscale(100%) brightness(200%);
  opacity: 0.8;
}

.btn-close-scanner:hover {
  opacity: 1;
}

.face-id-ring-container {
  width: min(75vw, 320px);
  aspect-ratio: 100 / 136;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.face-id-ring-container.zoom-closer {
  transform: scale(1.18);
}

.face-id-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.face-id-svg ellipse {
  fill: none;
  stroke-width: 3;
}

.ring-bg {
  stroke: rgba(255, 255, 255, 0.15);
}

.ring-progress {
  stroke: #009981; /* primary color */
  stroke-dasharray: 360.4; 
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
}

.ring-progress.is-success { stroke: #28a745; }
.ring-progress.is-warning { stroke: #ffc107; }
.ring-progress.is-danger { stroke: #dc3545; }

.face-id-camera-wrapper {
  position: absolute;
  width: 96%;
  height: 97.058%;
  top: 1.471%;
  left: 2%;
  border-radius: 50%;
  overflow: hidden;
  background: #111;
  z-index: 1;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.scanner-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.scanner-registration-identity {
  position: absolute;
  top: 50%;
  left: clamp(1.25rem, 4vw, 4rem);
  width: min(280px, 22vw);
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateY(-50%);
  backdrop-filter: blur(8px);
}

.scanner-verification-result {
  position: absolute;
  top: 6.25rem;
  left: 1.5rem;
  width: min(300px, calc(100vw - 3rem));
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid rgba(75, 224, 200, 0.4);
  border-radius: 1rem;
  background: rgba(0, 153, 129, 0.16);
  color: #fff;
  backdrop-filter: blur(8px);
}

.scanner-identity-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 153, 129, 0.2);
  color: #4be0c8;
  font-size: 1.2rem;
}

.scanner-identity-label {
  margin-bottom: 0.2rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.scanner-identity-name {
  margin-bottom: 0.45rem;
  font-size: 1rem;
  font-weight: 700;
}

.scanner-identity-detail {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
  line-height: 1.7;
}

.scanner-registration-identity-mobile {
  width: min(88vw, 360px);
  margin-right: auto;
  margin-left: auto;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.78rem;
}

.scanner-registration-identity-mobile span {
  display: block;
  margin-top: 0.15rem;
  color: rgba(255, 255, 255, 0.62);
}

.scanner-retry-control {
  min-width: 116px;
}

.scanner-footer {
  height: 100px;
  flex: 0 0 100px;
}

.scanner-camera-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: min(88vw, 360px);
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.scanner-camera-picker select {
  min-width: 0;
  max-width: 280px;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font-size: 0.85rem;
}

.scanner-camera-picker option {
  color: #212529;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s ease, transform 0.3s ease;
}

.step-dot.is-active {
  background: #009981;
  transform: scale(1.2);
}

.face-fade-enter-active,
.face-fade-leave-active {
  transition: opacity 0.3s ease;
}
.face-fade-enter-from,
.face-fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

:global(.swal2-container) {
  z-index: 3005 !important;
}

/* Restored Brand CSS */
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.btn-brand { background-color: #009981; border-color: #009981; }
.btn-brand:hover:not(:disabled) { background-color: #007a67; border-color: #007a67; }
.btn-outline-brand { color: #009981; border-color: #009981; }
.btn-outline-brand:hover:not(:disabled) { color: #fff; background-color: #009981; border-color: #009981; }
.bg-brand-soft { background-color: rgba(0, 153, 129, 0.08); }

</style>
