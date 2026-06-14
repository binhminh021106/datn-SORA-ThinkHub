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

          <div class="face-test-body">
            <div class="face-workspace">
              <section class="face-camera-card">
                <div class="camera-toolbar">
                  <div class="d-flex align-items-center gap-2 min-w-0">
                    <span class="camera-live-dot" :class="{ 'is-active': isCameraActive }"></span>
                    <div class="min-w-0">
                      <div class="fw-bold text-dark text-truncate">Khung camera định danh</div>
                      <div class="small text-muted text-truncate">{{ helperText }}</div>
                    </div>
                  </div>
                  <span class="camera-status-pill" :class="{ 'is-active': isReady }">
                    {{ isReady ? 'Sẵn sàng quét' : 'Đang chuẩn bị' }}
                  </span>
                </div>

                <div class="camera-panel position-relative overflow-hidden" :style="cameraPanelStyle">
                  <video
                    ref="videoRef"
                    class="camera-video"
                    autoplay
                    muted
                    playsinline
                    @loadedmetadata="syncVideoAspect"
                  ></video>
                  <div class="scan-frame" aria-hidden="true">
                    <span class="scan-corner corner-top-left"></span>
                    <span class="scan-corner corner-top-right"></span>
                    <span class="scan-corner corner-bottom-left"></span>
                    <span class="scan-corner corner-bottom-right"></span>
                  </div>

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

                <div class="message-stack">
                  <div class="alert mb-0" :class="resultClass" v-if="resultMessage">
                    {{ resultMessage }}
                  </div>

                  <div class="alert alert-danger mb-0" v-if="errorMessage">
                    {{ errorMessage }}
                  </div>
                </div>

                <div class="scan-feedback-grid">
                  <div v-if="matchedAdmin || nearestAdmin" class="recognition-summary" :class="matchedAdmin ? 'is-match' : 'is-near'">
                    <div class="d-flex align-items-start gap-3">
                      <div class="summary-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi" :class="matchedAdmin ? 'bi-check-lg' : 'bi-exclamation-lg'"></i>
                      </div>
                      <div class="min-w-0 flex-grow-1">
                        <div class="small text-uppercase fw-bold opacity-75 mb-1">
                          {{ matchedAdmin ? 'Đã định danh' : 'Chưa đủ ngưỡng định danh' }}
                        </div>
                        <h4 class="fw-bold mb-1 text-truncate">{{ displayAdminName(matchedAdmin || nearestAdmin) }}</h4>
                        <div class="identity-detail small d-flex flex-column gap-1 mb-2">
                          <span class="d-flex align-items-center gap-2 min-w-0">
                            <i class="bi bi-envelope"></i>
                            <span class="text-truncate">{{ displayAdminEmail(matchedAdmin || nearestAdmin) }}</span>
                          </span>
                          <span class="d-flex align-items-center gap-2 min-w-0">
                            <i class="bi bi-telephone"></i>
                            <span class="text-truncate">{{ displayAdminPhone(matchedAdmin || nearestAdmin) }}</span>
                          </span>
                        </div>
                        <div class="small">
                          Khoảng cách: <strong>{{ formattedDistance }}</strong>
                          <span class="opacity-75 ms-1">ngưỡng {{ THRESHOLD }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="activity-card">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                      <div class="fw-bold text-dark">Nhật ký xử lý</div>
                      <span class="small text-muted">{{ formatDate(new Date()) }}</span>
                    </div>
                    <div class="activity-list">
                      <div class="activity-row">
                        <span class="activity-dot" :class="{ 'is-success': isCameraActive }"></span>
                        <div>
                          <div class="fw-semibold">Camera</div>
                          <small class="text-muted">{{ isCameraActive ? 'Đang nhận hình ảnh trực tiếp.' : 'Chưa bật hoặc chưa được cấp quyền.' }}</small>
                        </div>
                      </div>
                      <div class="activity-row">
                        <span class="activity-dot" :class="{ 'is-success': !isLoadingModels, 'is-warning': isLoadingModels }"></span>
                        <div>
                          <div class="fw-semibold">Face model</div>
                          <small class="text-muted">{{ isLoadingModels ? 'Đang tải model nhận diện.' : 'Model đã sẵn sàng.' }}</small>
                        </div>
                      </div>
                      <div class="activity-row">
                        <span class="activity-dot" :class="{ 'is-warning': isProcessing, 'is-success': resultMessage && !errorMessage, 'is-danger': errorMessage }"></span>
                        <div class="min-w-0">
                          <div class="fw-semibold">Kết quả gần nhất</div>
                          <small class="text-muted d-block text-truncate">{{ errorMessage || resultMessage || 'Chưa có lượt quét nào trong phiên này.' }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

              <aside class="face-control-card">
                <template v-if="isManageMode">
                  <div class="control-section">
                    <label class="form-label fw-bold text-dark mb-1">Chọn nhân sự để quản lý định danh</label>
                    <div class="custom-select-container position-relative">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="searchQuery" 
                        @input="onSearchInput"
                        placeholder="Tìm kiếm tên hoặc email..." 
                        @focus="isDropdownOpen = true" 
                        @blur="closeDropdownDelayed"
                      />
                      <div v-if="isDropdownOpen" class="custom-dropdown-menu position-absolute w-100 bg-white border rounded shadow-sm mt-1" style="max-height: 250px; overflow-y: auto; z-index: 1050;">
                        <div 
                          v-for="admin in filteredAdmins" 
                          :key="admin.id" 
                          class="dropdown-item p-2 border-bottom" 
                          style="cursor: pointer;"
                          @click.stop="selectAdmin(admin.id)"
                          :class="{'bg-light': selectedAdminId === admin.id}"
                        >
                          <div class="d-flex justify-content-between align-items-center mb-1">
                            <div class="fw-bold text-dark">{{ admin.fullname || 'Chưa có tên' }}</div>
                            <span class="badge" :class="admin.face_profile?.requires_reset ? 'bg-warning text-dark' : (admin.face_profile ? 'bg-success' : 'bg-secondary')">
                              {{ faceProfileStatus(admin.face_profile) }}
                            </span>
                          </div>
                          <div class="small text-muted d-flex align-items-center gap-1">
                            <i class="bi bi-envelope"></i>
                            <span class="text-truncate">{{ admin.email }}</span>
                          </div>
                        </div>
                        <div v-if="filteredAdmins.length === 0" class="p-2 text-center text-muted small">
                          Không tìm thấy nhân sự
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="profile-card">
                    <div class="d-flex align-items-center justify-content-between mb-2 gap-3">
                      <span class="fw-bold text-dark">Hồ sơ khuôn mặt</span>
                      <span class="badge" :class="profileBadgeClass">
                        {{ profileStatusLabel }}
                      </span>
                    </div>
                    <div class="small text-muted">
                      Nhân sự: <strong class="text-dark">{{ selectedAdminLabel }}</strong>
                    </div>
                    <div class="small text-muted">
                      Định danh đã lưu: <strong class="text-dark">{{ profile.sample_count || 0 }}/5</strong>
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
                  <div class="profile-card attendance-card">
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

                  <div class="attendance-guidance">
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

                <div class="face-action-panel">
                  <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <div class="fw-bold text-dark">Thao tác nhanh</div>
                      <div class="small text-muted">Bật camera rồi thực hiện quét hoặc ghi mẫu.</div>
                    </div>
                    <span class="camera-status-pill" :class="{ 'is-active': isReady }">
                      {{ isReady ? 'Online' : 'Offline' }}
                    </span>
                  </div>

                  <div class="face-action-bar">
                    <button class="btn btn-outline-secondary fw-semibold" @click="startCamera" :disabled="isLoadingModels || isProcessing">
                      <i class="bi bi-camera-video me-2"></i>
                      Bật camera
                    </button>
                    <button
                      v-if="isAttendanceMode"
                      class="btn fw-bold"
                      :class="isAutoScanEnabled ? 'btn-outline-danger' : 'btn-outline-brand'"
                      @click="toggleAutoScan"
                      :disabled="!isCameraActive || isLoadingModels"
                    >
                      <i class="bi me-2" :class="isAutoScanEnabled ? 'bi-pause-circle' : 'bi-radar'"></i>
                      {{ isAutoScanEnabled ? 'Dừng tự quét' : 'Tự động quét' }}
                    </button>
                    <button v-if="isManageMode" class="btn btn-brand fw-bold text-white" @click="registerFace" :disabled="!canRegister">
                      <i class="bi bi-database-add me-2"></i>
                      Đăng ký
                    </button>
                    <button v-if="isManageMode" class="btn btn-outline-brand fw-bold" @click="verifyFace" :disabled="!isReady">
                      <i class="bi bi-search me-2"></i>
                      Đối chiếu
                    </button>
                    <button v-if="isManageMode" class="btn btn-outline-danger fw-bold" @click="resetFaceProfile" :disabled="!canResetProfile">
                      <i class="bi bi-trash3 me-2"></i>
                      Xóa hồ sơ
                    </button>
                    <button v-else class="btn btn-brand fw-bold text-white primary-scan-action" @click="attendanceByFace()" :disabled="!isReady">
                      <i class="bi bi-person-check me-2"></i>
                      Quét chấm công
                    </button>
                  </div>
                </div>

                <div v-if="isManageMode && candidates.length" class="candidate-list">
                  <div class="fw-bold text-dark mb-2">Đối chiếu gần nhất</div>
                  <div v-for="candidate in candidates" :key="candidate.admin?.id || candidate.distance" class="candidate-row">
                    <span class="text-truncate">{{ displayAdminName(candidate.admin) }}</span>
                    <strong>{{ Number(candidate.distance).toFixed(4) }}</strong>
                  </div>
                </div>

              </aside>
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
const cameraAspectRatio = ref('4 / 3');
const admins = ref([]);
const selectedAdminId = ref('');
const searchQuery = ref('');
const isDropdownOpen = ref(false);
const profile = ref({ has_profile: false, sample_count: 0, requires_reset: false });
const modalMode = ref('manage');
const resultMessage = ref('');
const resultType = ref('info');
const errorMessage = ref('');
const matchedAdmin = ref(null);
const nearestAdmin = ref(null);
const candidates = ref([]);
const lastDistance = ref(null);
const isAutoScanEnabled = ref(false);

let modelLoadPromise = null;
let faceApiModule = null;
let autoScanTimer = null;

const filteredAdmins = computed(() => {
  if (!searchQuery.value) return admins.value;
  const q = searchQuery.value.toLowerCase();
  return admins.value.filter(a => 
    (a.fullname && a.fullname.toLowerCase().includes(q)) || 
    (a.email && a.email.toLowerCase().includes(q))
  );
});

const selectAdmin = (id) => {
  selectedAdminId.value = id;
  const admin = admins.value.find(a => a.id === id);
  if (admin) {
    searchQuery.value = admin.fullname || admin.email;
  }
  isDropdownOpen.value = false;
  fetchProfile();
};

const closeDropdownDelayed = () => {
  setTimeout(() => {
    isDropdownOpen.value = false;
  }, 200);
};

const onSearchInput = () => {
  isDropdownOpen.value = true;
};

const emit = defineEmits(['attendance-success']);
const isManageMode = computed(() => modalMode.value === 'manage');
const isAttendanceMode = computed(() => modalMode.value === 'attendance');
const isReady = computed(() => isCameraActive.value && !isLoadingModels.value && !isProcessing.value);
const cameraPanelStyle = computed(() => ({
  aspectRatio: cameraAspectRatio.value,
}));
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
    : 'Mỗi tài khoản chỉ lưu một định danh. Muốn thay đổi cần xóa định danh cũ.'
));

const openModal = async (mode = 'manage') => {
  modalMode.value = mode;
  stopAutoScan();
  isVisible.value = true;
  clearMessages();
  await nextTick();
  if (isManageMode.value) {
    await fetchAdmins();
  }
  await startCamera();
};

const closeModal = () => {
  stopAutoScan();
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

    if (selectedAdminId.value) {
      const admin = admins.value.find(a => a.id === selectedAdminId.value);
      if (admin && !isDropdownOpen.value) {
        searchQuery.value = admin.fullname || admin.email;
      }
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
      syncVideoAspect();
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
      syncVideoAspect();
    }
    isCameraActive.value = true;
  } catch (error) {
    isCameraActive.value = false;
    errorMessage.value = error.message || 'Không thể bật camera hoặc tải model nhận diện.';
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
    const descriptors = [];
    const maxSamples = 5;

    for (let i = 1; i <= maxSamples; i++) {
      resultType.value = 'info';
      resultMessage.value = `Đang lấy mẫu ${i}/${maxSamples}... Vui lòng giữ khuôn mặt và hơi cử động nhẹ đầu.`;
      
      const descriptor = await getDescriptor();
      descriptors.push(descriptor);
      
      if (i < maxSamples) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    resultMessage.value = 'Đang gửi dữ liệu định danh lên máy chủ...';

    const response = await apiClient.post('/admin/face-recognition/register', {
      admin_id: selectedAdminId.value,
      descriptors,
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
    if (data.is_matched && data.matched_admin) {
      selectedAdminId.value = data.matched_admin.id;
      const admin = admins.value.find(a => a.id === data.matched_admin.id);
      if (admin) {
        searchQuery.value = admin.fullname || admin.email;
      }
      await fetchProfile();

      await showRecognitionAlert(data.matched_admin, {
        title: 'Định danh thành công',
        message: resultMessage.value,
        distance: data.distance,
      });
    }
    await fetchAdmins();
  });
};

const attendanceByFace = async (confirmCheckout = false, options = {}) => {
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
        const confirmedResponse = await apiClient.post('/admin/face-recognition/attendance', {
          descriptor,
          threshold: THRESHOLD,
          confirm_checkout: true,
        });
        const confirmedData = confirmedResponse.data?.data || {};
        applyRecognitionData(confirmedData);
        resultType.value = 'success';
        resultMessage.value = confirmedResponse.data?.message || 'Đã check-out bằng khuôn mặt.';
        await showRecognitionAlert(confirmedData.matched_admin || data.matched_admin, {
          title: 'Check-out thành công',
          message: resultMessage.value,
          distance: confirmedData.distance ?? data.distance,
        });
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
      stopAutoScan();
      await showRecognitionAlert(data.matched_admin, {
        title: data.action === 'check_out' ? 'Check-out thành công' : 'Check-in thành công',
        message: resultMessage.value,
        distance: data.distance,
      });
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
            <span>Khoảng cách ${escapeHtml(Number(options.distance).toFixed(4))} / ngưỡng ${escapeHtml(THRESHOLD)}</span>
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

:global(.face-alert-popup) {
  border-radius: 1.25rem !important;
  padding: 1.5rem !important;
}

:global(.face-alert-result) {
  color: #343a40;
}

:global(.face-alert-card) {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 153, 129, 0.18);
  border-radius: 1rem;
  background: linear-gradient(135deg, #e8f8f4 0%, #fbfffe 100%);
}

:global(.face-alert-avatar) {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #009981;
  border-radius: 999px;
  font-size: 1.5rem;
  box-shadow: 0 10px 24px rgba(0, 153, 129, 0.2);
}

:global(.face-alert-line) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #42635d;
  font-size: 0.95rem;
  margin-top: 0.35rem;
}

:global(.face-alert-line i) {
  color: #009981;
}

:global(.face-alert-note) {
  margin-top: 0.85rem;
  padding: 0.75rem 0.9rem;
  color: #006b5b;
  background: rgba(0, 153, 129, 0.08);
  border-radius: 0.85rem;
  font-size: 0.95rem;
}

.face-test-modal {
  width: min(1180px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}

.face-test-header {
  flex: 0 0 auto;
}

.face-test-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.25rem;
  background: #f4f8f7;
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

.face-workspace {
  display: grid;
  grid-template-columns: minmax(420px, 650px) minmax(330px, 390px);
  gap: 1rem;
  justify-content: center;
  min-height: 0;
  width: min(100%, 1060px);
  margin: 0 auto;
}

.face-camera-card,
.face-control-card,
.activity-card {
  border: 1px solid rgba(0, 153, 129, 0.14);
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

.face-camera-card {
  min-width: 0;
  padding: 1rem;
}

.face-control-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 1rem;
}

.camera-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.camera-live-dot {
  width: 0.75rem;
  height: 0.75rem;
  flex: 0 0 0.75rem;
  border-radius: 999px;
  background: #adb5bd;
  box-shadow: 0 0 0 4px rgba(173, 181, 189, 0.16);
}

.camera-live-dot.is-active {
  background: #009981;
  box-shadow: 0 0 0 4px rgba(0, 153, 129, 0.14);
}

.camera-status-pill {
  flex: 0 0 auto;
  color: #6c757d;
  background: #f1f3f5;
  border: 1px solid #e9ecef;
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.camera-status-pill.is-active {
  color: #006b5b;
  background: #e4f8f3;
  border-color: rgba(0, 153, 129, 0.22);
}

.camera-panel {
  aspect-ratio: 4 / 3;
  width: min(100%, 620px);
  min-height: 0;
  margin: 0 auto;
  border-radius: 1rem;
  background:
    radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.12), transparent 28%),
    #0f1418;
}

.camera-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: scaleX(-1);
}

.scan-frame {
  position: absolute;
  inset: 8%;
  z-index: 1;
  pointer-events: none;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.28));
}

.scan-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.scan-corner {
  position: absolute;
  width: clamp(38px, 8vw, 62px);
  height: clamp(38px, 8vw, 62px);
  border-color: rgba(255, 255, 255, 0.95);
  border-style: solid;
}

.corner-top-left {
  top: 0;
  left: 0;
  border-width: 5px 0 0 5px;
}

.corner-top-right {
  top: 0;
  right: 0;
  border-width: 5px 5px 0 0;
}

.corner-bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 5px 5px;
}

.corner-bottom-right {
  right: 0;
  bottom: 0;
  border-width: 0 5px 5px 0;
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

.profile-card,
.candidate-list,
.attendance-guidance {
  background: #f8fffd;
  border: 1px solid rgba(0, 153, 129, 0.14);
  border-radius: 1rem;
  padding: 1rem;
}

.attendance-card {
  border-color: rgba(0, 153, 129, 0.22) !important;
}

.recognition-summary {
  color: #063f34;
  border: 1px solid rgba(0, 153, 129, 0.25);
  border-radius: 1rem;
  background: linear-gradient(135deg, #dff8f1 0%, #f6fffc 100%);
  box-shadow: 0 10px 24px rgba(0, 153, 129, 0.12);
  padding: 1rem;
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

.identity-detail {
  color: rgba(6, 63, 52, 0.78);
}

.recognition-summary.is-near .identity-detail {
  color: rgba(95, 63, 0, 0.78);
}

.min-w-0 {
  min-width: 0;
}

.scan-feedback-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.9fr);
  gap: 1rem;
  margin-top: 1rem;
}

.activity-card {
  padding: 1rem;
}

.activity-list {
  display: grid;
  gap: 0.75rem;
}

.activity-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.65rem;
  align-items: start;
  font-size: 0.9rem;
}

.activity-dot {
  width: 0.65rem;
  height: 0.65rem;
  margin-top: 0.38rem;
  border-radius: 999px;
  background: #adb5bd;
}

.activity-dot.is-success {
  background: #009981;
  box-shadow: 0 0 0 4px rgba(0, 153, 129, 0.12);
}

.activity-dot.is-warning {
  background: #f59f00;
  box-shadow: 0 0 0 4px rgba(245, 159, 0, 0.12);
}

.activity-dot.is-danger {
  background: #dc3545;
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}

.message-stack {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.face-action-panel {
  border: 1px solid rgba(0, 153, 129, 0.16);
  border-radius: 1rem;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.candidate-list {
  flex: 1 1 auto;
  min-height: 100px;
  overflow-y: auto;
}

.candidate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
  border-top: 1px solid rgba(0, 153, 129, 0.1);
  font-size: 0.9rem;
}

.candidate-row:first-of-type {
  border-top: 0;
}

.face-action-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.face-action-bar .btn {
  min-height: 44px;
  border-radius: 0.8rem;
}

.face-action-bar .btn:only-child {
  grid-column: 1 / -1;
}

.face-action-bar .primary-scan-action {
  grid-column: 1 / -1;
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
    max-height: calc(100vh - 1rem);
  }

  .face-test-body {
    overflow-y: auto;
  }

  .face-workspace {
    grid-template-columns: 1fr;
  }

  .camera-panel {
    max-height: none;
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

  .face-test-body {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }

  .camera-toolbar,
  .scan-feedback-grid {
    grid-template-columns: 1fr;
  }

  .camera-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .camera-panel {
    border-radius: 0.85rem;
  }

  .face-action-bar {
    grid-template-columns: 1fr;
  }
}
</style>
