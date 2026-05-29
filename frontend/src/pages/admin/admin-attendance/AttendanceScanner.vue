<template>
  <div class="station-wrapper d-flex flex-column vh-100 bg-dark text-white position-relative">
    
    <!-- HEADER -->
    <div class="station-header d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
      <div class="d-flex align-items-center">
        <!-- Nút Back về màn hình trước -->
        <a href="javascript:history.back()" class="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
          <i class="bi bi-arrow-left"></i>
        </a>
        <div>
          <h4 class="mb-0 fw-bold">Trạm Phát Mã Chấm Công</h4>
          <p class="mb-0 text-white-50 small">Nhân viên sử dụng tính năng "Quét Mã" trên điện thoại để quét mã này</p>
        </div>
      </div>
      <!-- Nút Copy dùng cho sinh viên Test -->
      <button class="btn btn-sm btn-outline-light rounded-pill px-3" @click="copyToken">
        <i class="bi bi-clipboard me-2"></i>Copy Token Test
      </button>
    </div>

    <!-- MAIN AREA -->
    <div class="station-body flex-grow-1 d-flex align-items-center justify-content-center position-relative p-4">
      
      <div class="row w-100 max-w-1200 h-100">
        <!-- CỘT TRÁI: MÃ QR -->
        <div class="col-lg-7 d-flex flex-column align-items-center justify-content-center border-end border-secondary">
          
          <!-- Trạng thái Loading lúc đầu -->
          <div v-if="isLoading && !qrToken" class="py-5 d-flex flex-column align-items-center">
            <div class="spinner-border text-brand" role="status" style="width: 4rem; height: 4rem;"></div>
            <p class="mt-3 text-white-50 fw-semibold fs-5">Đang khởi tạo mã an toàn...</p>
          </div>

          <!-- Vùng hiển thị QR Code -->
          <div v-else class="text-center">
            <div class="qr-container bg-white p-4 rounded-4 shadow-lg mb-4 position-relative mx-auto" style="width: 350px; height: 350px;">
              <!-- Mã QR Level L để dễ quét bằng ảnh -->
              <qrcode-vue :value="qrToken" :size="300" level="L" foreground="#000000" background="#ffffff" />
              
              <!-- Lớp phủ Loading khi đang làm mới mã -->
              <div v-if="isLoading" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded-4">
                <div class="spinner-border text-brand" role="status"></div>
              </div>
            </div>

            <!-- Thanh đếm ngược vòng tròn (Timer) -->
            <div class="timer-section mb-4 d-flex flex-column align-items-center">
              <h3 class="fw-bold mb-2" :class="timeLeft <= 5 ? 'text-danger' : 'text-brand'">{{ timeLeft }}s</h3>
              <div class="progress" style="height: 8px; width: 280px; background-color: #333; border-radius: 10px;">
                <div class="progress-bar transition-all" 
                     :class="timeLeft <= 5 ? 'bg-danger' : 'bg-brand'" 
                     role="progressbar" 
                     :style="{ width: progressPercent + '%' }"></div>
              </div>
              <small class="text-white-50 mt-2 d-block">Mã sẽ tự động làm mới sau mỗi 25 giây</small>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: HOẠT ĐỘNG ĐIỂM DANH TRỰC TIẾP (LIVE FEED) -->
        <div class="col-lg-5 d-flex flex-column ps-lg-5 py-4">
          <div class="d-flex align-items-center mb-4">
            <div class="live-indicator me-3"></div>
            <h4 class="fw-bold mb-0">Hoạt động trực tiếp</h4>
          </div>

          <div class="live-feed-container flex-grow-1 overflow-hidden">
            <div v-if="recentLogs.length === 0" class="text-white-50 text-center mt-5 pt-5">
              <i class="bi bi-clock-history" style="font-size: 3rem;"></i>
              <p class="mt-3">Chưa có ai điểm danh gần đây.</p>
            </div>

            <TransitionGroup name="list" tag="div" class="d-flex flex-column gap-3">
              <div v-for="log in recentLogs" :key="log.id" class="live-log-item bg-secondary bg-opacity-25 p-3 rounded-4 border-start border-4 shadow-sm"
                   :class="log.type === 'in' ? 'border-success' : 'border-info'">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-circle bg-white text-dark fw-bold d-flex align-items-center justify-content-center rounded-circle fs-5" style="width: 45px; height: 45px;">
                      {{ log.name.charAt(0) }}
                    </div>
                    <div>
                      <h6 class="mb-1 fw-bold">{{ log.name }}</h6>
                      <span class="badge" :class="log.type === 'in' ? 'bg-success text-white' : 'bg-info text-dark'">
                        {{ log.type === 'in' ? 'Vào ca (Check-in)' : 'Tan ca (Check-out)' }}
                      </span>
                    </div>
                  </div>
                  <div class="text-white-50 small fw-semibold">
                    <i class="bi bi-clock me-1"></i> {{ log.time }}
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import QrcodeVue from 'qrcode.vue'; 

const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('admin_token'); 

// --- QUẢN LÝ QR CODE ---
const isLoading = ref(true);
const qrToken = ref('');
const timeLeft = ref(25);
const MAX_TIME = 25;
let timerInterval = null;

const progressPercent = computed(() => {
  return (timeLeft.value / MAX_TIME) * 100;
});

const fetchQrToken = async () => {
  isLoading.value = true;
  stopTimer(); 
  
  try {
    const response = await axios.get(`${API_URL}/admin/attendances/qr-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      qrToken.value = response.data.data.qr_token;
      startTimer(); 
    }
  } catch (error) {
    console.error('Lỗi khi lấy mã QR:', error);
    qrToken.value = 'ERROR';
  } finally {
    isLoading.value = false;
  }
};

const copyToken = () => {
  navigator.clipboard.writeText(qrToken.value).then(() => {
    alert("Đã sao chép Token thành công! Bạn có thể dán vào Modal Quét trên thiết bị khác để test.");
  });
};

const startTimer = () => {
  stopTimer();
  timeLeft.value = MAX_TIME;
  timerInterval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      fetchQrToken(); 
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// --- QUẢN LÝ HOẠT ĐỘNG TRỰC TIẾP (LIVE POLLING) ---
const recentLogs = ref([]);
let previousState = [];
let pollingInterval = null;

// Hàm phát âm thanh khi có người check-in/out
const playStationBeep = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  if (type === 'in') {
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // Tít tiếng thanh cao (In)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } else {
    osc.frequency.setValueAtTime(600, audioCtx.currentTime); // Tít tiếng trầm thấp (Out)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }
};

const triggerStationAlert = (name, type) => {
  playStationBeep(type);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Đẩy hoạt động mới lên đầu danh sách
  recentLogs.value.unshift({
    id: Date.now(),
    name: name,
    type: type, // 'in' hoặc 'out'
    time: timeStr
  });

  // Chỉ giữ lại 5 hoạt động gần nhất để giao diện không bị đầy
  if (recentLogs.value.length > 5) {
    recentLogs.value.pop();
  }
};

// Hàm "Lắng nghe" liên tục API Status
const fetchLiveStatus = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/attendances/daily-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.data.success) {
      const currentAdmins = res.data.data;

      // So sánh dữ liệu mới với dữ liệu cũ để tìm ra ai vừa thao tác
      if (previousState.length > 0) {
        currentAdmins.forEach(admin => {
          const prevAdmin = previousState.find(a => a.id === admin.id);
          
          // Lấy record điểm danh của nhân sự đó
          const currAtt = Array.isArray(admin.attendance) ? admin.attendance[0] : admin.attendance;
          const prevAtt = prevAdmin ? (Array.isArray(prevAdmin.attendance) ? prevAdmin.attendance[0] : prevAdmin.attendance) : null;

          if (currAtt) {
            // Trường hợp 1: Có dữ liệu mới mà trước đó chưa có -> VỪA CHECK-IN
            if (!prevAtt && currAtt.clock_in) {
              triggerStationAlert(admin.fullname, 'in');
            }
            // Trường hợp 2: Trạng thái chuyển từ pending sang completed -> VỪA CHECK-OUT
            else if (prevAtt && prevAtt.checkout_status === 'pending' && currAtt.checkout_status === 'completed') {
              triggerStationAlert(admin.fullname, 'out');
            }
          }
        });
      }
      
      // Lưu lại trạng thái để so sánh cho vòng lặp tiếp theo
      previousState = currentAdmins;
    }
  } catch (err) {
    console.warn("Lỗi Polling Live Feed:", err);
  }
};

onMounted(() => {
  fetchQrToken();
  // Khởi chạy Polling: Cứ 3 giây hỏi API một lần
  pollingInterval = setInterval(fetchLiveStatus, 3000);
});

onUnmounted(() => {
  stopTimer();
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.transition-all { transition: all 1s linear; }

.max-w-1200 { max-width: 1200px; margin: 0 auto; }

/* Tránh cuộn trang làm xấu UI máy Kiosk */
.station-wrapper {
  overflow: hidden;
  user-select: none;
}

/* Đèn báo nhấp nháy trực tiếp (Live Indicator) */
.live-indicator {
  width: 12px;
  height: 12px;
  background-color: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Hiệu ứng thêm phần tử vào Live Feed */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>