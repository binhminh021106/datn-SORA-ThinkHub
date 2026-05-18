<template>
  <transition name="fade">
    <div v-if="show" class="size-guide-modal-overlay" @click.self="$emit('close')">
      <div class="size-guide-modal">
        <div class="size-guide-modal-header">
          <h3><i class="bi bi-rulers text-gold me-2"></i>Hướng Dẫn Kích Cỡ Nhẫn</h3>
          <button class="close-btn" @click="$emit('close')" type="button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="size-guide-modal-body">
          <div class="size-chart-section">
            <h4 class="section-title">Bảng Kích Cỡ Tiêu Chuẩn</h4>
            <p class="section-desc">Những kích cỡ bên dưới là những thông số tiêu chuẩn cho nhẫn nữ. Kích cỡ có thể thay đổi tùy theo yêu cầu riêng của từng khách hàng.</p>

            <div class="size-table">
              <div class="table-header">
                <div class="table-cell">Kích Cỡ Nhẫn</div>
                <div class="table-cell">Đường Kính (mm)</div>
                <div class="table-cell">Chu Vi (mm)</div>
              </div>
              <div v-for="size in sizeGuideData" :key="size.size" class="table-row">
                <div class="table-cell">{{ size.size }}</div>
                <div class="table-cell">{{ size.diameter }} mm</div>
                <div class="table-cell">{{ size.circumference }} mm</div>
              </div>
            </div>
          </div>

          <div class="measurement-guide-section mt-5">
            <h4 class="section-title">Cách Đo Kích Cỡ Nhẫn</h4>
            <ul class="measurement-steps">
              <li>
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Sử dụng một sợi dây mềm hoặc giấy</strong> - Quấn xung quanh ngón tay của bạn, vị trí mà bạn sẽ đeo nhẫn
                </div>
              </li>
              <li>
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Đánh dấu vị trí giao nhau</strong> - Ghi dấu ở điểm hai đầu sợi dây/giấy gặp nhau
                </div>
              </li>
              <li>
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Đo chu vi</strong> - Dùng thước đo chu vi của sợi dây từ điểm đầu đến điểm cuối (tính bằng mm)
                </div>
              </li>
              <li>
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Đối chiếu với bảng</strong> - Tìm chu vi gần nhất trong bảng kích cỡ phía trên để xác định size nhẫn của bạn
                </div>
              </li>
            </ul>
          </div>

          <div class="tips-section mt-5 p-4">
            <h4 class="section-title mb-3" style="margin-top: 0;"><i class="bi bi-lightbulb-fill text-warning me-2"></i> Lưu Ý Quan Trọng</h4>
            <ul class="tips-list">
              <li>Đo kích cỡ khi tay bạn ở nhiệt độ bình thường (không lạnh)</li>
              <li>Đeo nhẫn vào ngón tay ít nhất 30 phút trước khi mua để chắc chắn kích cỡ phù hợp</li>
              <li>Nếu bạn không chắc chắn, hãy liên hệ với đội hỗ trợ của chúng tôi để được tư vấn</li>
              <li>Sau khi mua, bạn có thể thay đổi kích cỡ nhẫn miễn phí trong 30 ngày đầu</li>
            </ul>
          </div>
        </div>

        <div class="size-guide-modal-footer">
          <button class="btn-close-guide" @click="$emit('close')">Đóng</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const sizeGuideData = [
  { size: '5', diameter: 15.7, circumference: 50 },
  { size: '6', diameter: 16.5, circumference: 52 },
  { size: '7', diameter: 17.4, circumference: 54 },
  { size: '8', diameter: 18.3, circumference: 57 },
  { size: '9', diameter: 19.1, circumference: 60 },
  { size: '10', diameter: 20.0, circumference: 62.5 },
  { size: '11', diameter: 20.9, circumference: 65 },
  { size: '12', diameter: 21.8, circumference: 68 },
  { size: '13', diameter: 22.6, circumference: 71 },
  { size: '14', diameter: 23.5, circumference: 74 },
  { size: '15', diameter: 24.4, circumference: 76.5 },
];
</script>

<style scoped>
/* OVERLAY & MODAL */
.size-guide-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.size-guide-modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.size-guide-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
  border-radius: 12px 12px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.size-guide-modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #222;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #222;
}

.size-guide-modal-body {
  padding: 28px;
  font-size: 15px;
  color: #555;
  line-height: 1.6;
}

/* SECTION TITLES */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
  font-style: italic;
}

/* SIZE TABLE */
.size-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #9f273b;
  color: white;
  font-weight: 600;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 14px 12px;
  font-size: 14px;
}

.table-header .table-cell {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px;
}

/* MEASUREMENT GUIDE */
.measurement-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.measurement-steps li {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #9f273b;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-content strong {
  color: #222;
}

/* TIPS SECTION */
.tips-section {
  background: #f8f9fa;
  border-left: 4px solid #9f273b;
  border-radius: 8px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 10px 0;
  color: #666;
  font-size: 14px;
  position: relative;
  padding-left: 24px;
}

.tips-list li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #9f273b;
  font-weight: bold;
}

/* FOOTER */
.size-guide-modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-close-guide {
  padding: 10px 28px;
  background: #9f273b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn-close-guide:hover {
  background: #cc1e2e;
  box-shadow: 0 4px 12px rgba(159, 39, 59, 0.25);
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .size-guide-modal {
    max-height: 95vh;
  }

  .size-guide-modal-header {
    padding: 16px;
  }

  .size-guide-modal-header h3 {
    font-size: 18px;
  }

  .size-guide-modal-body {
    padding: 16px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 0.8fr 1fr 1fr;
  }

  .table-cell {
    padding: 10px 6px;
    font-size: 12px;
  }

  .section-title {
    font-size: 14px;
  }

  .measurement-steps li {
    gap: 12px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
