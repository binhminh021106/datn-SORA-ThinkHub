<template>
  <Teleport to="body">
    <Transition name="face-fade">
      <div v-if="isVisible" class="face-test-overlay d-flex align-items-center justify-content-center" @click.self="closeModal">
        <div class="face-test-modal bg-white rounded-4 shadow-lg overflow-hidden">
          <div class="face-test-header bg-brand text-white px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="fw-bold mb-1">{{ modalTitle }}</h5>
              <p class="small mb-0 text-white-50">{{ modalSubtitle }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeModal"></button>
          </div>

          <div class="face-test-body p-4">
            <div class="row g-4 h-100">
              <div class="col-lg-7 d-flex flex-column">
                <div class="camera-panel position-relative rounded-4 overflow-hidden bg-dark">
                  <video ref="videoRef" class="camera-video" autoplay muted playsinline></video>

                  <div v-if="!isCameraActive" class="camera-empty text-white text-center px-4">
                    <i class="bi bi-person-bounding-box display-4 d-block mb-3"></i>
                    <p class="fw-semibold mb-1">{{ cameraHint }}</p>
                    <small class="text-white-50">Cần cấp quyền camera để lấy face descriptor.</small>
                  </div>

                  <div v-if="isLoadingModels || isProcessing" class="camera-loading">
                    <div class="spinner-border text-brand mb-3"></div>
                    <div class="fw-bold text-white">{{ loadingText }}</div>
                  </div>
                </div>

                <div class="camera-result-area mt-3">
                  <div v-if="matchedAdmin || nearestAdmin" class="recognition-summary rounded-4 p-3 mb-3" :class="matchedAdmin ? 'is-match' : 'is-near'">
                    <div class="d-flex align-items-start gap-3">
                      <div class="summary-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi" :class="matchedAdmin ? 'bi-check-lg' : 'bi-exclamation-lg'"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="small text-uppercase fw-bold opacity-75 mb-1">
                          {{ matchedAdmin ? 'Đã định danh' : 'Chưa đủ ngưỡng định danh' }}
                        </div>
                        <h4 class="fw-bold mb-1 text-truncate">{{ displayAdminName(matchedAdmin || nearestAdmin) }}</h4>
                        <div class="small">
                          Khoảng cách: <strong>{{ formattedDistance }}</strong>
                          <span class="opacity-75 ms-1">ngưỡng {{ THRESHOLD }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="alert mb-3" :class="resultClass" v-if="resultMessage">
                    {{ resultMessage }}
                  </div>

                  <div class="alert alert-danger mb-3" v-if="errorMessage">
                    {{ errorMessage }}
                  </div>

                  <div v-if="isManageMode && candidates.length" class="candidate-list rounded-4 border p-3">
                    <div class="fw-bold text-dark mb-2">Top khoảng cách gần nhất</div>
                    <div v-for="candidate in candidates" :key="candidate.admin?.id || candidate.distance" class="d-flex justify-content-between gap-3 small py-1">
                      <span class="text-truncate">{{ displayAdminName(candidate.admin) }}</span>
                      <strong>{{ Number(candidate.distance).toFixed(4) }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-5 d-flex flex-column min-h-0">
                <div class="face-result-panel d-flex flex-column min-h-0">
                  <template v-if="isManageMode">
                    <label class="form-label fw-bold text-dark">Chọn nhân sự để quản lý định danh</label>
                    <select class="form-select mb-3" v-model="selectedAdminId" @change="fetchProfile">
                      <option disabled value="">Chọn tài khoản admin/nhân sự</option>
                      <option v-for="admin in admins" :key="admin.id" :value="admin.id">
                        {{ admin.fullname || admin.email }} - {{ faceProfileStatus(admin.face_profile) }}
                      </option>
                    </select>

                    <div class="profile-card rounded-4 border p-3 mb-3 flex-shrink-0">
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="fw-bold text-dark">Hồ sơ khuôn mặt đang chọn</span>
                        <span class="badge" :class="profileBadgeClass">
                          {{ profileStatusLabel }}
                        </span>
                      </div>
                      <div class="small text-muted">
                        Nhân sự: <strong class="text-dark">{{ selectedAdminLabel }}</strong>
                      </div>
                      <div class="small text-muted">
                        Định danh đã lưu: <strong class="text-dark">{{ profile.sample_count || 0 }}/1</strong>
                      </div>
                      <div v-if="profile.requires_reset" class="small text-danger fw-semibold mt-2">
                        Hồ sơ cũ có nhiều mẫu và cần được xóa trước khi đăng ký lại.
                      </div>
                      <div v-if="profile.last_verified_at" class="small text-muted mt-1">
                        Lần đối chiếu gần nhất: {{ formatDate(profile.last_verified_at) }}
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="profile-card attendance-card rounded-4 border p-3 mb-3 flex-shrink-0">
                      <div class="d-flex align-items-start gap-3">
                        <div class="summary-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i class="bi bi-person-check"></i>
                        </div>
                        <div>
                          <div class="fw-bold text-dark mb-1">Chấm công bằng khuôn mặt</div>
                          <div class="small text-muted">
                            Camera sẽ định danh nhân sự từ hồ sơ đã đăng ký và ghi nhận vào ca làm hợp lệ.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="attendance-guidance rounded-4 border p-3 mb-3">
                      <div class="d-flex gap-2 small text-muted mb-2">
                        <i class="bi bi-check2-circle text-brand"></i>
                        <span>Check-in được ghi nhận ngay sau khi định danh thành công.</span>
                      </div>
                      <div class="d-flex gap-2 small text-muted mb-2">
                        <i class="bi bi-shield-check text-brand"></i>
                        <span>Check-out sẽ hỏi xác nhận tan ca trước khi lưu.</span>
                      </div>
                      <div class="d-flex gap-2 small text-muted">
                        <i class="bi bi-calendar2-check text-brand"></i>
                        <span>Không tạo bản ghi nếu nhân sự chưa có ca làm hợp lệ.</span>
                      </div>
                    </div>
                  </template>

                  <div class="face-scroll-area">
                    <p class="small text-muted mb-0">
                      {{ helperText }}
                    </p>
                  </div>

                  <div class="face-action-bar d-grid gap-2 mt-3">
                    <button class="btn btn-outline-secondary rounded-3 fw-semibold" @click="startCamera" :disabled="isLoadingModels || isProcessing">
                      <i class="bi bi-camera-video me-2"></i>
                      Bật camera
                    </button>
                    <button v-if="isManageMode" class="btn btn-brand rounded-3 fw-bold text-white" @click="registerFace" :disabled="!canRegister">
                      <i class="bi bi-database-add me-2"></i>
                      Đăng ký định danh khuôn mặt
                    </button>
                    <button v-if="isManageMode" class="btn btn-outline-danger rounded-3 fw-bold" @click="resetFaceProfile" :disabled="!canResetProfile">
                      <i class="bi bi-trash3 me-2"></i>
                      Xóa hồ sơ khuôn mặt
                    </button>
                    <button v-if="isManageMode" class="btn btn-outline-brand rounded-3 fw-bold" @click="verifyFace" :disabled="!isReady">
                      <i class="bi bi-search me-2"></i>
                      Đối chiếu định danh
                    </button>
                    <button v-else class="btn btn-brand rounded-3 fw-bold text-white" @click="attendanceByFace()" :disabled="!isReady">
                      <i class="bi bi-person-check me-2"></i>
                      Quét mặt để chấm công
                    </button>
                  </div>
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

const MODEL_URL = '/face-api-models';
const MODEL_NAME = 'face-api.js';
const MODEL_VERSION = '0.22.2';
const THRESHOLD = 0.48;

const isVisible = ref(false);
const isLoadingModels = ref(false);
const isProcessing = ref(false);
const isCameraActive = ref(false);
const videoRef = ref(null);
const streamRef = ref(null);
const admins = ref([]);
const selectedAdminId = ref('');
const profile = ref({ has_profile: false, sample_count: 0, requires_reset: false });
const modalMode = ref('manage');
const resultMessage = ref('');
const resultType = ref('info');
const errorMessage = ref('');
const matchedAdmin = ref(null);
const nearestAdmin = ref(null);
const candidates = ref([]);
const lastDistance = ref(null);

let modelLoadPromise = null;
let faceApiModule = null;

const emit = defineEmits(['attendance-success']);
const isManageMode = computed(() => modalMode.value === 'manage');
const isAttendanceMode = computed(() => modalMode.value === 'attendance');
const isReady = computed(() => isCameraActive.value && !isLoadingModels.value && !isProcessing.value);
const canRegister = computed(() => isReady.value && !!selectedAdminId.value && !profile.value?.has_profile);
const canResetProfile = computed(() => !!selectedAdminId.value && !!profile.value?.has_profile && !isProcessing.value);
const selectedAdmin = computed(() => admins.value.find((admin) => String(admin.id) === String(selectedAdminId.value)));
const selectedAdminLabel = computed(() => selectedAdmin.value ? displayAdminName(selectedAdmin.value) : 'Chưa chọn');
const profileStatusLabel = computed(() => {
  if (profile.value?.requires_reset) return 'Cần đăng ký lại';
  return profile.value?.has_profile ? 'Đã đăng ký' : 'Chưa đăng ký';
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
    : 'Mỗi tài khoản chỉ lưu một định danh khuôn mặt. Muốn thay đổi cần xóa hồ sơ cũ trước khi đăng ký lại.'
));

const openModal = async (mode = 'manage') => {
  modalMode.value = mode;
  isVisible.value = true;
  clearMessages();
  await nextTick();
  if (isManageMode.value) {
    await fetchAdmins();
  }
  await startCamera();
};

const closeModal = () => {
  stopCamera();
  isVisible.value = false;
};

const clearMessages = () => {
  resultMessage.value = '';
  errorMessage.value = '';
  matchedAdmin.value = null;
  nearestAdmin.value = null;
  candidates.value = [];
  lastDistance.value = null;
};

const fetchAdmins = async () => {
  try {
    const response = await apiClient.get('/admin/face-recognition/admins');
    admins.value = response.data?.data || [];

    if (!selectedAdminId.value && admins.value.length) {
      selectedAdminId.value = admins.value[0].id;
    }

    await fetchProfile();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Không thể tải danh sách nhân sự.';
  }
};

const fetchProfile = async () => {
  if (!selectedAdminId.value) {
    profile.value = { has_profile: false, sample_count: 0, requires_reset: false };
    return;
  }

  try {
    const response = await apiClient.get('/admin/face-recognition/profile', {
      params: { admin_id: selectedAdminId.value },
    });
    profile.value = response.data?.data || { has_profile: false, sample_count: 0, requires_reset: false };
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Không thể tải trạng thái mẫu khuôn mặt.';
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
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    streamRef.value = stream;
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      await videoRef.value.play();
    }
    isCameraActive.value = true;
  } catch (error) {
    isCameraActive.value = false;
    errorMessage.value = error.message || 'Không thể bật camera hoặc tải model nhận diện.';
  }
};

const stopCamera = () => {
  if (streamRef.value) {
    streamRef.value.getTracks().forEach((track) => track.stop());
    streamRef.value = null;
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }

  isCameraActive.value = false;
};

const getDescriptor = async () => {
  const faceapi = await loadModels();

  if (!videoRef.value || !isCameraActive.value) {
    throw new Error('Camera chưa sẵn sàng.');
  }

  const detection = await faceapi
    .detectSingleFace(videoRef.value, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error('Không tìm thấy khuôn mặt rõ trong khung hình.');
  }

  return Array.from(detection.descriptor);
};

const registerFace = async () => {
  if (!selectedAdminId.value) {
    errorMessage.value = 'Vui lòng chọn nhân sự trước khi ghi mẫu.';
    return;
  }

  await runFaceAction(async () => {
    const descriptor = await getDescriptor();
    const response = await apiClient.post('/admin/face-recognition/register', {
      admin_id: selectedAdminId.value,
      descriptor,
      model_name: MODEL_NAME,
      model_version: MODEL_VERSION,
    });

    resultType.value = 'success';
    resultMessage.value = response.data?.message || 'Đã lưu mẫu khuôn mặt.';
    await fetchAdmins();
  });
};

const verifyFace = async () => {
  await runFaceAction(async () => {
    const descriptor = await getDescriptor();
    const response = await apiClient.post('/admin/face-recognition/verify', {
      descriptor,
      threshold: THRESHOLD,
    });

    const data = response.data?.data || {};
    applyRecognitionData(data);
    resultType.value = data.is_matched ? 'success' : 'warning';
    resultMessage.value = response.data?.message || 'Đã quét thử khuôn mặt.';
    await fetchAdmins();
  });
};

const attendanceByFace = async (confirmCheckout = false) => {
  await runFaceAction(async () => {
    const descriptor = await getDescriptor();
    const response = await apiClient.post('/admin/face-recognition/attendance', {
      descriptor,
      threshold: THRESHOLD,
      confirm_checkout: confirmCheckout,
    });

    const data = response.data?.data || {};
    applyRecognitionData(data);

    if (data.requires_confirmation) {
      resultType.value = 'warning';
      resultMessage.value = response.data?.message || 'Cần xác nhận tan ca.';

      const result = await Swal.fire({
        title: 'Xác nhận tan ca?',
        text: `Bạn có chắc muốn tan ca cho ${displayAdminName(data.matched_admin)} không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Có, tan ca',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        const confirmedResponse = await apiClient.post('/admin/face-recognition/attendance', {
          descriptor,
          threshold: THRESHOLD,
          confirm_checkout: true,
        });
        const confirmedData = confirmedResponse.data?.data || {};
        applyRecognitionData(confirmedData);
        resultType.value = 'success';
        resultMessage.value = confirmedResponse.data?.message || 'Đã check-out bằng khuôn mặt.';
        emit('attendance-success');
        if (isManageMode.value) {
          await fetchAdmins();
        }
      }
      return;
    }

    resultType.value = data.is_matched ? 'success' : 'warning';
    resultMessage.value = response.data?.message || 'Đã xử lý chấm công bằng khuôn mặt.';

    if (response.data?.success && data.action) {
      emit('attendance-success');
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
  nearestAdmin.value = data.nearest_admin;
  candidates.value = data.candidates || [];
};

const runFaceAction = async (action) => {
  if (isProcessing.value) return;
  clearMessages();
  isProcessing.value = true;

  try {
    await action();
  } catch (error) {
    const data = error.response?.data?.data;
    if (data) {
      applyRecognitionData(data);
      resultType.value = 'warning';
    }
    errorMessage.value = error.response?.data?.message || error.message || 'Không thể xử lý khuôn mặt.';
  } finally {
    isProcessing.value = false;
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

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('vi-VN');
};

defineExpose({ openModal, closeModal });

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.face-test-overlay {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(4px);
  padding: 1rem;
}

:global(.swal2-container) {
  z-index: 3005 !important;
}

.face-test-modal {
  width: min(1080px, 100%);
  height: min(820px, calc(100vh - 2rem));
  display: flex;
  flex-direction: column;
}

.face-test-header {
  flex: 0 0 auto;
}

.face-test-body {
  flex: 1 1 auto;
  overflow: hidden;
}

.min-h-0 {
  min-height: 0;
}

.bg-brand {
  background-color: #009981 !important;
}

.text-brand {
  color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  border-color: #009981;
}

.btn-brand:hover:not(:disabled) {
  background-color: #007a67;
  border-color: #007a67;
}

.btn-outline-brand {
  color: #009981;
  border-color: #009981;
}

.btn-outline-brand:hover:not(:disabled) {
  color: #fff;
  background-color: #009981;
  border-color: #009981;
}

.camera-panel {
  height: min(430px, calc(100vh - 360px));
  min-height: 300px;
}

.camera-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-empty,
.camera-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.camera-loading {
  z-index: 2;
}

.face-result-panel {
  height: 100%;
}

.camera-result-area {
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.face-scroll-area {
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.face-action-bar {
  flex: 0 0 auto;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 153, 129, 0.14);
  background: #fff;
}

.profile-card,
.candidate-list,
.attendance-guidance {
  background: #f8fffd;
}

.attendance-card {
  border-color: rgba(0, 153, 129, 0.22) !important;
}

.recognition-summary {
  color: #063f34;
  border: 1px solid rgba(0, 153, 129, 0.25);
  background: linear-gradient(135deg, #dff8f1 0%, #f6fffc 100%);
  box-shadow: 0 10px 24px rgba(0, 153, 129, 0.12);
}

.recognition-summary.is-near {
  color: #5f3f00;
  border-color: rgba(255, 193, 7, 0.35);
  background: linear-gradient(135deg, #fff5d6 0%, #fffdf5 100%);
  box-shadow: 0 10px 24px rgba(255, 193, 7, 0.12);
}

.summary-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  color: #fff;
  background: #009981;
  font-size: 1.35rem;
}

.recognition-summary.is-near .summary-icon {
  background: #f59f00;
}

.min-w-0 {
  min-width: 0;
}

.face-fade-enter-active,
.face-fade-leave-active {
  transition: opacity 0.2s ease;
}

.face-fade-enter-from,
.face-fade-leave-to {
  opacity: 0;
}

@media (max-width: 991.98px) {
  .face-test-modal {
    height: calc(100vh - 1rem);
  }

  .face-test-body {
    overflow-y: auto;
  }

  .camera-panel {
    height: 300px;
    min-height: 300px;
  }

  .face-result-panel {
    height: auto;
  }
}

@media (max-width: 575.98px) {
  .face-test-overlay {
    padding: 0.5rem;
  }

  .face-test-modal {
    border-radius: 1rem !important;
  }

  .face-test-header,
  .face-test-body {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  .camera-panel {
    height: 240px;
    min-height: 240px;
  }
}
</style>
