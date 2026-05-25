<template>
  <footer class="app-footer admin-footer-complex-gradient border-top py-3 text-sm overflow-hidden d-flex justify-content-between align-items-center px-3" style="min-height: 50px;">
    
    <!-- Bên trái (Nội dung chính - Marquee vô cực) -->
    <div class="marquee-container flex-grow-1 position-relative me-4" style="height: 20px;">
      <!-- Khối chữ 1 -->
      <div class="marquee-content">
        <span class="marquee-item text-white mx-4 fw-bold">
          ThinkHub <span class="text-light fw-normal opacity-75 mx-1">| DỰ ÁN TRANG SỨC SORA |</span> <span class="text-warning fw-bold">Version 36</span>
        </span>
        <span class="marquee-item text-white mx-4 fw-bold">
          ThinkHub <span class="text-light fw-normal opacity-75 mx-1">| DỰ ÁN TRANG SỨC SORA |</span> <span class="text-warning fw-bold">Version 36</span>
        </span>
        <span class="marquee-item text-white mx-4 fw-bold">
          ThinkHub <span class="text-light fw-normal opacity-75 mx-1">| DỰ ÁN TRANG SỨC SORA |</span> <span class="text-warning fw-bold">Version 36</span>
        </span>
      </div>
      <!-- Khối chữ 2 (Nhân bản để tạo hiệu ứng nối đuôi vô cực) -->
      <div class="marquee-content" aria-hidden="true">
        <span class="marquee-item text-white mx-4 fw-bold">
          ThinkHub <span class="text-light fw-normal opacity-75 mx-1">| DỰ ÁN TRANG SỨC SORA |</span> <span class="text-warning fw-bold">Version 36</span>
        </span>
        <span class="marquee-item text-white mx-4 fw-bold">
          ThinkHub <span class="text-light fw-normal opacity-75 mx-1">| DỰ ÁN TRANG SỨC SORA |</span> <span class="text-warning fw-bold">Version 36</span>
        </span>
        <span class="marquee-item text-white mx-4 fw-bold">
          ThinkHub <span class="text-light fw-normal opacity-75 mx-1">| DỰ ÁN TRANG SỨC SORA |</span> <span class="text-warning fw-bold">Version 36</span>
        </span>
      </div>
    </div>

    <!-- Bên phải (Dashboard) -->
    <div class="d-flex align-items-center gap-3 ms-auto z-1">
      <div class="d-none d-sm-flex align-items-center opacity-100 fw-semibold text-white whitespace-nowrap admin-badge">
        <i class="bi bi-speedometer2 me-2 fs-6"></i> Dashboard
      </div>
    </div>
    
  </footer>
</template>

<script setup>
// Footer thuần giao diện cho Admin Dashboard dự án SORA, không cần logic JS
</script>

<style scoped>
.app-footer.admin-footer-complex-gradient {
  /* Giữ nguyên hệ thống Layered Gradient phức tạp cho SORA */
  background: 
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%),
    radial-gradient(ellipse at 15% 50%, rgba(0, 235, 196, 0.3) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 120%, rgba(255, 193, 7, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
    linear-gradient(135deg, #0a1f1a 0%, #009981 50%, #004d40 100%) !important;
  color: #ffffff;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 153, 129, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
}

/* --- LOGIC CSS MỚI CHO MARQUEE VÔ CỰC --- */
.marquee-container {
  display: flex;
  overflow: hidden;
  white-space: nowrap;
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
}

.marquee-content {
  display: flex;
  flex-shrink: 0;
  min-width: 100%;
  animation: marquee 20s linear infinite; /* Không dừng lại khi hover */
}

.marquee-item {
  display: inline-block;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); } 
}
/* -------------------------------------- */

.admin-badge {
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
</style>