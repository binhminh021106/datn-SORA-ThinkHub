<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="custom-qr-overlay d-flex align-items-center justify-content-center" @click.self="closeModal">
        <div class="custom-qr-modal bg-white rounded-4 overflow-hidden shadow-lg">
          
          <!-- Header -->
          <div class="modal-header border-0 bg-brand text-white px-4 py-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="icon-box-small bg-white text-brand rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 32px; height: 32px;">
                <i class="bi bi-camera-video fs-5"></i>
              </div>
              <h5 class="modal-title fw-bold mb-0">Quét Mã Điểm Danh</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body qr-modal-body text-center p-4">
            <p class="text-muted small fw-semibold mb-3">
              Hướng Camera về phía <span class="text-brand fw-bold">Màn hình Máy Chủ (Lễ tân)</span> hoặc tải ảnh lên để điểm danh.
            </p>
            <!-- Khung Camera -->
            <div class="scanner-container mx-auto position-relative rounded-4 overflow-hidden bg-dark mb-3">
              <div id="reader"></div>
              <!-- Ngăn chặn click để html5-qrcode không tự động pause -->
              <div class="position-absolute top-0 start-0 w-100 h-100" style="z-index: 5;" @click.stop.prevent></div>
              <div class="qr-scan-frame" aria-hidden="true">
                <span class="qr-scan-corner corner-top-left"></span>
                <span class="qr-scan-corner corner-top-right"></span>
                <span class="qr-scan-corner corner-bottom-left"></span>
                <span class="qr-scan-corner corner-bottom-right"></span>
              </div>
              <!-- Hiệu ứng Scanning (Chỉ hiện khi đang quét) -->
              <div v-if="isScanning" class="scan-line"></div>
              
              <div v-if="isProcessing" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark bg-opacity-75" style="z-index: 10;">
                <div class="spinner-border text-brand" role="status"></div>
                <span class="text-white mt-2 small fw-bold">Đang xử lý dữ liệu...</span>
              </div>
            </div>

            <!-- Công cụ test (Upload / Paste) -->
            <div class="test-controls qr-upload-panel p-3 rounded-3 border">
              <label class="small fw-bold text-dark d-block mb-2" for="qr-upload-input">
                Tải ảnh QR hoặc paste ảnh bằng Ctrl+V
              </label>
              <input id="qr-upload-input" type="file" ref="fileInput" class="form-control form-control-sm mx-auto shadow-none" accept="image/*" @change="handleFileUpload">
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import Swal from 'sweetalert2';

const emit = defineEmits(['success']);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('admin_token');

const fileInput = ref(null);
const isScanning = ref(false);
const isProcessing = ref(false);
const isVisible = ref(false);
const html5QrCode = ref(null);
let autoResumeInterval = null;

let audioContext = null;

// Hàm phát âm thanh Beep (bọc try/catch để tránh lỗi trình duyệt chặn AudioContext)
const playBeep = (type = 'success') => {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.warn('AudioContext resume blocked:', e));
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Tiếng thanh
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } else {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime); // Tiếng trầm báo lỗi
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.warn("Không thể phát âm thanh beep:", error);
  }
};

// Hàm xử lý Logic gọi API thông minh
const processAttendance = async (qrTokenString) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  playBeep('success');

  try {
    // encodeURIComponent giúp giữ nguyên dấu + của Base64 an toàn khi gửi qua GET
    const safeToken = encodeURIComponent(qrTokenString);
    const statusRes = await axios.get(`${API_URL}/admin/attendances/status?qr_token=${safeToken}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const state = statusRes.data.state; 
    let resultMsg = '';

    if (state === 'ready') {
      const inRes = await axios.post(`${API_URL}/admin/attendances/check-in`, { qr_token: qrTokenString }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      resultMsg = inRes.data.message || 'Vào ca thành công!';
    } 
    else if (state === 'working' || state === 'hanging') {
      const outRes = await axios.post(`${API_URL}/admin/attendances/check-out`, { qr_token: qrTokenString }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      resultMsg = outRes.data.message || 'Kết thúc ca thành công!';
    } 
    else {
      throw new Error('Hôm nay bạn đã hoàn thành ca làm việc rồi.');
    }

    Swal.fire({ icon: 'success', title: 'Thành công', text: resultMsg, confirmButtonColor: '#009981' });
    emit('success');
    closeModal();

  } catch (err) {
    playBeep('error');
    Swal.fire({
      icon: 'error',
      title: 'Lỗi điểm danh',
      text: err.response?.data?.message || err.message || 'Mã QR không hợp lệ hoặc đã hết hạn.',
      confirmButtonColor: '#009981'
    });
  } finally {
    isProcessing.value = false;
    setTimeout(() => {
      if (fileInput.value) fileInput.value.value = '';
    }, 2000);
  }
};

// Callback khi Camera quét thành công
const onScanSuccess = (decodedText) => {
  if (isProcessing.value) return;
  processAttendance(decodedText);
};

// Bật Camera
const startScanner = async () => {
  try {
    if (!html5QrCode.value) {
      html5QrCode.value = new Html5Qrcode("reader");
    }
    
    await html5QrCode.value.start(
      { facingMode: "environment" },
      { fps: 20, disableFlip: false, aspectRatio: 1.0 },
      onScanSuccess,
      () => {} 
    );
    isScanning.value = true;

    // Tự động resume nếu bị tạm dừng (ví dụ khi Phone Link mở popup làm mất focus)
    autoResumeInterval = setInterval(() => {
      if (html5QrCode.value && html5QrCode.value.getState() === 3) {
        html5QrCode.value.resume();
      }
    }, 1000);

  } catch (err) {
    console.warn("Không thể bật Camera. Vui lòng cấp quyền hoặc dùng tính năng Upload/Paste ảnh.", err);
  }
};

const stopScanner = async () => {
  if (autoResumeInterval) {
    clearInterval(autoResumeInterval);
    autoResumeInterval = null;
  }

  if (html5QrCode.value) {
    if (html5QrCode.value.isScanning) {
      await html5QrCode.value.stop().catch(e => console.warn(e));
    }
    html5QrCode.value.clear();
    // Reset để tránh xung đột DOM khi đóng mở Modal nhiều lần
    html5QrCode.value = null; 
  }
  isScanning.value = false;
};

// Xử lý Upload file từ thẻ Input
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  await scanImageFile(file);
};

// Xử lý sự kiện Paste (Ctrl+V)
const handlePaste = async (event) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      await scanImageFile(file);
      break;
    }
  }
};

// Logic lõi quét ảnh
const scanImageFile = async (file) => {
  if (isProcessing.value) return;
  
  try {
    isProcessing.value = true;

    if (html5QrCode.value && html5QrCode.value.isScanning) {
      await html5QrCode.value.stop();
      isScanning.value = false;
    }

    if (!html5QrCode.value) html5QrCode.value = new Html5Qrcode("reader");
    // false: Không rọi ảnh đè lên div
    const decodedText = await html5QrCode.value.scanFile(file, false);
    
    // SỬA LỖI: Cần tắt cờ isProcessing tạm thời để hàm processAttendance không bị return sớm
    isProcessing.value = false;
    await processAttendance(decodedText);

  } catch (err) {
    playBeep('error');
    Swal.fire({ icon: 'warning', title: 'Không quét được', text: 'Không tìm thấy mã QR hợp lệ trong ảnh này. Mã quá mờ hoặc có quá nhiều chấm nhỏ.', confirmButtonColor: '#009981' });
  } finally {
    isProcessing.value = false;
    if (fileInput.value) fileInput.value.value = '';
    startScanner();
  }
};

const onModalHidden = () => {
  stopScanner();
  window.removeEventListener('paste', handlePaste);
};

// Public method để đóng Modal bằng Nút
const closeModal = () => {
  isVisible.value = false;
  onModalHidden();
};

const openModal = async () => {
  isVisible.value = true;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  window.addEventListener('paste', handlePaste);
  
  setTimeout(() => {
    startScanner();
  }, 300);
};

defineExpose({ openModal, closeModal });

onUnmounted(() => {
  onModalHidden();
});
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }

:deep(video) {
  object-fit: cover !important;
  width: 100% !important;
  height: 100% !important;
}

/* Hiệu ứng tia quét xanh lá */
.scan-line {
  position: absolute;
  top: 12%;
  left: 12%;
  width: 76%;
  height: 3px;
  background-color: #009981;
  box-shadow: 0 0 10px #009981, 0 0 20px #009981;
  animation: scan 2s linear infinite;
  z-index: 5;
}

@keyframes scan {
  0% { top: 12%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 88%; opacity: 0; }
}

/* Custom Vue Overlay Modal */
.custom-qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  z-index: 1050;
  backdrop-filter: blur(3px);
}

.custom-qr-modal {
  width: min(450px, calc(100vw - 1rem));
  max-height: calc(100vh - 2rem);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
}

.qr-modal-body {
  overflow-y: auto;
  overscroll-behavior: contain;
}

#reader {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Ẩn UI "Scanner paused" của thư viện nếu nó kịp hiện ra */
:deep(#reader > div:nth-child(n+2)) {
  display: none !important;
}

.scanner-container {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  min-height: 0;
  position: relative;
}

.qr-scan-frame {
  position: absolute;
  inset: 12%;
  z-index: 6;
  pointer-events: none;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.25));
}

.qr-scan-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.qr-scan-corner {
  position: absolute;
  width: 38px;
  height: 38px;
  border-color: rgba(255, 255, 255, 0.96);
  border-style: solid;
}

.corner-top-left {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
}

.corner-top-right {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
}

.corner-bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
}

.corner-bottom-right {
  right: 0;
  bottom: 0;
  border-width: 0 4px 4px 0;
}

.qr-upload-panel {
  background: #f8fffd;
  border-color: rgba(0, 153, 129, 0.16) !important;
}

.qr-upload-panel .form-control {
  max-width: 280px;
  border-color: rgba(0, 153, 129, 0.2);
}

.qr-upload-panel .form-control:focus {
  border-color: #009981;
  box-shadow: 0 0 0 0.2rem rgba(0, 153, 129, 0.12);
}

@media (max-width: 575.98px) {
  .custom-qr-overlay {
    padding: 0.5rem;
  }

  .custom-qr-modal {
    max-height: calc(100vh - 1rem);
  }

  .qr-modal-body {
    padding: 1rem !important;
  }

  .scanner-container {
    max-width: 260px;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
