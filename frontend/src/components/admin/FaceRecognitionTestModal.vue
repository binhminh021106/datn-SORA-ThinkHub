<template>
  <Teleport to="body">
    <Transition name="face-fade">
      <div v-if="isVisible" class="face-id-overlay d-flex align-items-center justify-content-center" @click.self="closeModal">
        <div class="face-id-wrapper w-100 h-100 d-flex align-items-center justify-content-center">
          
          <!-- SETUP STATE -->
          <div v-if="uiState === 'setup'" class="face-id-setup bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column" style="width: min(800px, 95vw); max-height: 90vh;">
            <div class="p-4 border-bottom d-flex justify-content-between align-items-center bg-brand text-white">
              <div>
                <h5 class="fw-bold mb-1">{{ modalTitle }}</h5>
                <p class="small mb-0 text-white-50">{{ modalSubtitle }}</p>
              </div>
              <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeModal"></button>
            </div>
            
            <div class="p-4 flex-grow-1 overflow-auto bg-light">
              <template v-if="isManageMode">
                <div class="row g-4 h-100">
                  <!-- Cột trái: Tìm kiếm và danh sách -->
                  <div class="col-12 col-md-6 d-flex flex-column h-100">
                    <label class="form-label fw-bold text-dark mb-2">Chọn nhân sự để quản lý</label>
                    <input type="text" class="form-control form-control-lg rounded-3 mb-3" v-model="searchQuery" placeholder="Tìm kiếm tên hoặc email..." />
                    
                    <div class="admin-list border rounded-3 bg-white overflow-auto shadow-sm flex-grow-1" style="max-height: 350px;">
                      <div v-for="admin in filteredAdmins" :key="admin.id" class="p-3 border-bottom list-item-hover" style="cursor: pointer; transition: all 0.2s;" @click="selectAdmin(admin.id)" :class="{'bg-brand-soft': selectedAdminId === admin.id}">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <div class="fw-bold" :class="selectedAdminId === admin.id ? 'text-brand' : 'text-dark'">{{ admin.fullname || 'Chưa có tên' }}</div>
                          <span class="badge" :class="admin.face_profile?.requires_reset ? 'bg-warning text-dark' : (admin.face_profile ? 'bg-success' : 'bg-secondary')">{{ faceProfileStatus(admin.face_profile) }}</span>
                        </div>
                        <div class="small text-muted"><i class="bi bi-envelope me-1"></i>{{ admin.email }}</div>
                      </div>
                      <div v-if="filteredAdmins.length === 0" class="p-4 text-center text-muted">
                        Không tìm thấy nhân sự nào
                      </div>
                    </div>
                  </div>

                  <!-- Cột phải: Hồ sơ và thao tác -->
                  <div class="col-12 col-md-6 d-flex flex-column justify-content-center">
                    <div class="card border-0 shadow-sm rounded-4 h-100" v-if="selectedAdminId">
                      <div class="card-body p-4 text-center d-flex flex-column justify-content-center">
                        <div class="avatar bg-brand-soft text-brand rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width:72px; height:72px; font-size:28px;">
                          <i class="bi bi-person-bounding-box"></i>
                        </div>
                        <h5 class="fw-bold text-dark">{{ selectedAdminLabel }}</h5>
                        <p class="text-muted small mb-4">Định danh đã lưu: <strong class="text-dark">{{ profile.sample_count || 0 }}/5</strong></p>
                        
                        <div class="d-flex flex-column gap-3 justify-content-center px-3">
                          <button class="btn btn-brand btn-lg fw-bold rounded-pill text-white shadow-sm" @click="startScanningMode('register')" :disabled="!canRegister">
                            <i class="bi bi-person-add me-2"></i> Bắt đầu Đăng ký
                          </button>
                          <button class="btn btn-outline-brand fw-bold rounded-pill" @click="startScanningMode('verify')">
                            <i class="bi bi-search me-2"></i> Đối chiếu Thử
                          </button>
                          <button class="btn btn-outline-danger fw-bold rounded-pill mt-2" @click="resetFaceProfile" :disabled="!canResetProfile">
                            <i class="bi bi-trash3 me-1"></i> Xóa hồ sơ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
            <button type="button" class="btn-close-scanner btn-close btn-close-white position-absolute top-0 end-0 m-4 z-3" aria-label="Close" @click="stopScanningMode"></button>
            
            <div class="scanner-header text-center mb-5 z-2 position-relative" style="margin-top: -5vh;">
              <h3 class="text-white fw-bold mb-1">{{ scanningTitle }}</h3>
              <p class="text-white-50 fs-6 mb-0">{{ scanningSubtitle }}</p>
            </div>

            <div class="face-id-ring-container position-relative">
              <!-- SVG Dashed Ring -->
              <svg class="face-id-svg" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="48"></circle>
                <circle class="ring-progress" :class="{'is-success': resultType === 'success', 'is-warning': resultType === 'warning', 'is-danger': !!errorMessage}" cx="50" cy="50" r="48" :style="{ strokeDashoffset: ringDashoffset }"></circle>
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

            <div class="scanner-footer text-center mt-5 z-2 position-relative" style="min-height: 100px;">
              <Transition name="fade" mode="out-in">
                <div :key="resultMessage || errorMessage" class="fw-bold fs-5 px-4" :class="messageColorClass">
                  {{ errorMessage || resultMessage || 'Đang chuẩn bị camera...' }}
                </div>
              </Transition>
              <div class="mt-4" v-if="isRegistering">
                <div class="d-flex justify-content-center gap-3">
                  <div v-for="n in 5" :key="n" class="step-dot" :class="{'is-active': currentRegStep >= n - 1}"></div>
                </div>
              </div>
              <div class="mt-4" v-if="!isRegistering && !isLoadingModels">
                 <button class="btn btn-outline-light rounded-pill px-4" @click="stopScanningMode">Hủy bỏ</button>
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

const registrationSteps = [
  "Vui lòng nhìn thẳng vào camera",
  "Hơi quay mặt sang TRÁI",
  "Hơi quay mặt sang PHẢI",
  "Hơi ngước mặt lên trên",
  "Nhìn thẳng và mỉm cười tự nhiên"
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
  const c = 2 * Math.PI * 48; // circumference ~301.59
  return c * (1 - scanProgress.value);
});
const messageColorClass = computed(() => {
  if (errorMessage.value || resultType.value === 'danger') return 'text-danger';
  if (resultType.value === 'success') return 'text-success';
  if (resultType.value === 'warning') return 'text-warning';
  return 'text-white';
});

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
const canRegister = computed(() => !!selectedAdminId.value && (!profile.value?.has_profile || profile.value.requires_reset || profile.value.sample_count < 5) && !isProcessing.value);
const canResetProfile = computed(() => !!selectedAdminId.value && !!profile.value?.has_profile && !isProcessing.value);
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

const openModal = async (mode = 'manage') => {
  modalMode.value = mode;
  uiState.value = 'setup';
  stopAutoScan();
  isVisible.value = true;
  clearMessages();
  await nextTick();
  if (isManageMode.value) {
    await fetchAdmins();
  }
};

const closeModal = () => {
  stopScanningMode();
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
      // Do nothing to searchQuery
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

const getDescriptor = async (timeout = 8000) => {
  const faceapi = await loadModels();
  const startTime = Date.now();
  let detection = null;

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
        break;
      }
    } catch (err) {
      // Ignore inner errors and retry
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

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
  const currentSession = ++activeScanSession;

  await runFaceAction(async () => {
    const descriptors = [];
    const maxSamples = 5 - (profile.value?.sample_count || 0);
    const maxRetries = 3;

    isRegistering.value = true;
    for (let i = 1; i <= maxSamples; i++) {
      currentRegStep.value = (profile.value?.sample_count || 0) + i - 1;
      
      // Delay for user to adjust their face
      resultType.value = 'info';
      resultMessage.value = `Chuẩn bị lấy mẫu ${i}/${maxSamples}...`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      resultMessage.value = `Đang lấy mẫu: ${registrationSteps[currentRegStep.value]}`;
      
      let success = false;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const descriptor = await getDescriptor();
          if (activeScanSession !== currentSession) return;
          descriptors.push(descriptor);
          success = true;
          // Play a small success feedback if possible, or just delay
          resultType.value = 'success';
          resultMessage.value = `✓ Đã lấy mẫu ${i}`;
          scanProgress.value = i / maxSamples;
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        } catch (err) {
          console.warn(`Lấy mẫu ${i} thất bại (lần ${attempt}/${maxRetries}):`, err);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      }
      
      if (!success) {
        throw new Error(`Không thể lấy mẫu ${i} sau ${maxRetries} lần thử. Vui lòng đảm bảo mặt ở trong khung elip và đủ sáng.`);
      }
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
      threshold: THRESHOLD,
    });
    if (activeScanSession !== currentSession) return;

    const data = response.data?.data || {};
    applyRecognitionData(data);
    resultType.value = data.is_matched ? 'success' : 'warning';
    resultMessage.value = response.data?.message || 'Đã quét thử khuôn mặt.';
    
    scanProgress.value = 1;
    
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
  const currentSession = ++activeScanSession;
  await runFaceAction(async () => {
    const descriptor = await getDescriptor();
    if (activeScanSession !== currentSession) return;
    const response = await apiClient.post('/admin/face-recognition/attendance', {
      descriptor,
      threshold: THRESHOLD,
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
          threshold: THRESHOLD,
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
  transition: all 0.3s ease;
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
  width: min(85vw, 400px);
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face-id-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  z-index: 2;
  pointer-events: none;
}

.face-id-svg circle {
  fill: none;
  stroke-width: 3;
}

.ring-bg {
  stroke: rgba(255, 255, 255, 0.15);
}

.ring-progress {
  stroke: #009981; /* primary color */
  stroke-dasharray: 301.59; /* 2 * PI * 48 */
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
}

.ring-progress.is-success { stroke: #28a745; }
.ring-progress.is-warning { stroke: #ffc107; }
.ring-progress.is-danger { stroke: #dc3545; }

.face-id-camera-wrapper {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
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

.list-item-hover:hover {
  background-color: #f8f9fa;
}
</style>
