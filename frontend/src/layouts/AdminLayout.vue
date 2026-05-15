<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from '../components/admin/Sidebar.vue';
import Header from '../components/admin/Header.vue';
import Footer from '../components/admin/Footer.vue';

// Biến lưu trữ trạng thái thu/mở của Sidebar
const isSidebarCollapsed = ref(false);

onMounted(() => {
  if (window.Echo) {
    const adminChannel = window.Echo.private('admin');
    adminChannel.listen('.AdminRefresh', (data) => {
      window.dispatchEvent(new CustomEvent('admin-refresh', { detail: data }));
    });
  }
});

onBeforeUnmount(() => {
  if (window.Echo) {
    window.Echo.leave('admin');
  }
});
</script>

<template>
  <!-- Gắn class động 'sidebar-collapsed' vào thẻ cha ngoài cùng -->
  <div class="admin-layout-wrapper d-flex" :class="{ 'sidebar-collapsed': isSidebarCollapsed }" style="min-height: 100vh;">
    
    <!-- Lắng nghe sự kiện toggle-collapse từ Sidebar -->
    <Sidebar @toggle-collapse="isSidebarCollapsed = $event" />

    <!-- Dùng margin-left để đẩy content sang phải khi Sidebar bị Fixed -->
    <div class="content-wrapper flex-grow-1 d-flex flex-column"
         :style="{ 
            marginLeft: isSidebarCollapsed ? '80px' : '260px',
            width: isSidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)', 
            transition: 'all 0.3s ease' 
         }">
      
      <Header />

      <main class="main-content flex-grow-1">
        <div class="container-fluid">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>

      <Footer />
      
    </div>
  </div>
</template>

<!-- STYLE SCOPED: Chỉ áp dụng cho Layout này -->
<style scoped>
.admin-layout-wrapper {
  background-color: var(--bs-body-bg); 
  overflow-x: hidden; 
  position: relative;
}

/* =======================================================
   1. GIAO DIỆN DESKTOP (Mặc định)
======================================================== */
.content-wrapper {
  min-height: 100vh;
  margin-left: 260px;
  width: calc(100% - 260px);
  transition: all 0.3s ease;
}

/* Khi thu gọn Sidebar ở Desktop */
.admin-layout-wrapper.sidebar-collapsed .content-wrapper {
  margin-left: 80px;
  width: calc(100% - 80px);
}

/* Cố định Sidebar bằng position: fixed */
:deep(.main-sidebar) {
  position: fixed !important;
  top: 0;
  left: 0;
  bottom: 0;
  height: 100vh !important;
  z-index: 1060 !important;
  overflow: visible !important; /* QUAN TRỌNG: Để nút thò ra không bị cắt */
  transition: transform 0.3s ease, width 0.3s ease !important;
}

/* =======================================================
   NÚT TOGGLE CHUYÊN NGHIỆP (HÌNH TRÒN)
======================================================== */
:deep(.toggle-sidebar-btn) {
  display: flex !important; /* Ghi đè mọi class ẩn của Bootstrap (d-none) */
  position: absolute !important;
  top: 14px !important; /* Căn giữa Header (Header cao ~60px) */
  right: -16px !important; /* Thò ra ngoài chính xác 1 nửa width (32px/2) */
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important; /* Hình tròn hoàn hảo như trong ảnh */
  background-color: #212529 !important; /* Màu đen tối sang trọng */
  color: #fff !important;
  border: 2px solid #fff !important; /* Viền trắng tách biệt */
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important; /* Đảm bảo luôn nằm trên cùng mọi thứ */
  padding: 0 !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

:deep(.toggle-sidebar-btn i) {
  font-size: 14px !important;
  transition: transform 0.3s ease !important; /* Hiệu ứng trượt mũi tên mượt mà */
}

:deep(.toggle-sidebar-btn:hover) {
  background-color: #009981 !important; /* Đổi màu xanh SORA khi hover */
  transform: scale(1.1) !important;
}

/* =======================================================
   2. GIAO DIỆN MOBILE (Dưới 768px) - TỐI ƯU ƯU TIÊN
======================================================== */
@media (max-width: 767.98px) {
  
  /* Mobile: Nội dung luôn chiếm 100% màn hình */
  .content-wrapper,
  .admin-layout-wrapper.sidebar-collapsed .content-wrapper {
    margin-left: 0 !important;
    width: 100% !important;
  }

  /* Mobile: Khi Sidebar mở -> Hiển thị đè lên nội dung (Overlay) */
  :deep(.main-sidebar) {
    width: 260px !important;
    transform: translateX(0); /* Nằm nguyên vị trí */
    box-shadow: 5px 0 25px rgba(0,0,0,0.5) !important;
  }

  /* Mobile: Khi Sidebar ẩn -> Trượt tuột 100% sang trái, biến mất hoàn toàn */
  .admin-layout-wrapper.sidebar-collapsed :deep(.main-sidebar) {
    transform: translateX(-100%);
    box-shadow: none !important;
  }

  /* Nút Mobile to ra một chút để ngón tay dễ bấm */
  :deep(.toggle-sidebar-btn) {
    width: 32px !important;
    height: 32px !important;
    right: -16px !important; 
    top: 14px !important;
  }
  
  /* FIX TINH TẾ CỦA BẠN NẰM Ở ĐÂY: 
     Khi Sidebar ẩn, nút bị cắt làm đôi -> Đẩy icon dịch sang phải 6px 
     để nó nằm chính giữa phần thò ra (Bán nguyệt) */
  .admin-layout-wrapper.sidebar-collapsed :deep(.toggle-sidebar-btn i) {
    transform: translateX(6px) !important;
  }

  /* Ép hiển thị lại text Logo khi mở trên mobile */
  :deep(.brand-text) {
    display: inline-block !important;
  }
}

.main-content {
  background-color: var(--bs-body-bg);
  padding-bottom: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<!-- STYLE KHÔNG SCOPED: Chứa css dark mode gốc của bạn -->
<style>
[data-bs-theme="dark"] body {
    background-color: #121416 !important;
    color: #e0e0e0 !important;
}

[data-bs-theme="dark"] .bg-white,
[data-bs-theme="dark"] .bg-light,
[data-bs-theme="dark"] .card {
    background-color: #1e2125 !important;
    color: #e0e0e0 !important;
}

/* Cứu cánh cho các chữ bị tàng hình (chữ đen -> chữ trắng) */
[data-bs-theme="dark"] .text-dark {
    color: #f8f9fa !important;
}

/* FIX LỖI ẢNH CỦA BẠN: Thêm class text-black-50 vào đây để nó sáng lên cùng text-muted */
[data-bs-theme="dark"] .text-muted,
[data-bs-theme="dark"] .text-black-50 {
    color: #adb5bd !important;
}

[data-bs-theme="dark"] .border,
[data-bs-theme="dark"] .border-bottom,
[data-bs-theme="dark"] .border-top,
[data-bs-theme="dark"] .border-light-subtle {
    border-color: #2b3035 !important;
}

[data-bs-theme="dark"] .form-control,
[data-bs-theme="dark"] .form-select {
    background-color: #121416 !important;
    border-color: #373b3e !important;
    color: #f8f9fa !important;
}

[data-bs-theme="dark"] .form-control:focus,
[data-bs-theme="dark"] .form-select:focus {
    background-color: #1e2125 !important;
    border-color: #009981 !important;
}

[data-bs-theme="dark"] .btn-light {
    background-color: #2b3035 !important;
    border-color: #373b3e !important;
    color: #f8f9fa !important;
}

[data-bs-theme="dark"] .btn-light:hover {
    background-color: #343a40 !important;
    border-color: #495057 !important;
    color: #ffffff !important;
}

/* Đảm bảo cái nút cũng đẹp khi ở giao diện Dark Mode */
[data-bs-theme="dark"] .toggle-sidebar-btn {
    background-color: #121416 !important;
    border-color: #373b3e !important;
    color: #e0e0e0 !important;
}
[data-bs-theme="dark"] .toggle-sidebar-btn:hover {
    background-color: #009981 !important;
    border-color: #009981 !important;
    color: #fff !important;
}

[data-bs-theme="dark"] .table {
    --bs-table-bg: transparent;
    --bs-table-color: #e0e0e0;
    --bs-table-border-color: #373b3e;
    --bs-table-striped-bg: rgba(255, 255, 255, 0.02);
    --bs-table-hover-bg: rgba(255, 255, 255, 0.05);
}

[data-bs-theme="dark"] .modal-content {
    background-color: #1e2125 !important;
    border-color: #373b3e !important;
}

[data-bs-theme="dark"] .modal-header,
[data-bs-theme="dark"] .modal-footer {
    border-color: #373b3e !important;
}
</style>