<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from '../components/admin/Sidebar.vue';
import Header from '../components/admin/Header.vue';
import Footer from '../components/admin/Footer.vue';
import { useAdminRealtimeSync } from '../composables/useAdminRealtimeSync';

import Swal from 'sweetalert2';

useAdminRealtimeSync();

import { useSettingsStore } from '@/stores/settingsStore';
const settingsStore = useSettingsStore();
settingsStore.fetchSettings();
settingsStore.listenToRealtimeUpdates();

const isSidebarCollapsed = ref(false);

const handleNewOrderAlert = (e) => {
    const payload = e.detail;
    if (payload && payload.orderCode) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Đơn hàng mới: #${payload.orderCode}`,
            text: `Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(payload.totalAmount)}đ`,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            background: '#e0f7fa',
            color: '#006064',
            iconColor: '#0097a7',
            customClass: {
                popup: 'shadow-lg rounded-3 border-start border-4 border-info'
            }
        });
    }
};

onMounted(() => {
    window.addEventListener('admin-new-order', handleNewOrderAlert);
});

onBeforeUnmount(() => {
    window.removeEventListener('admin-new-order', handleNewOrderAlert);
});
</script>

<template>
  <div class="admin-layout-wrapper d-flex" :class="{ 'sidebar-collapsed': isSidebarCollapsed }" style="min-height: 100vh;">
    
    <Sidebar @toggle-collapse="isSidebarCollapsed = $event" />

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

<style scoped>
.admin-layout-wrapper {
  background-color: var(--bs-body-bg); 
  overflow-x: hidden; 
  position: relative;
}

.content-wrapper {
  min-height: 100vh;
  margin-left: 260px;
  width: calc(100% - 260px);
  transition: all 0.3s ease;
}

.admin-layout-wrapper.sidebar-collapsed .content-wrapper {
  margin-left: 80px;
  width: calc(100% - 80px);
}

:deep(.main-sidebar) {
  position: fixed !important;
  top: 0;
  left: 0;
  bottom: 0;
  height: 100vh !important;
  z-index: 1060 !important;
  overflow: visible !important;
  transition: transform 0.3s ease, width 0.3s ease !important;
}

:deep(.toggle-sidebar-btn) {
  display: flex !important;
  position: absolute !important;
  top: 14px !important;
  right: -16px !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background-color: #212529 !important;
  color: #fff !important;
  border: 2px solid #fff !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  padding: 0 !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

:deep(.toggle-sidebar-btn i) {
  font-size: 14px !important;
  transition: transform 0.3s ease !important;
}

:deep(.toggle-sidebar-btn:hover) {
  background-color: #009981 !important;
  transform: scale(1.1) !important;
}

@media (max-width: 767.98px) {
  .content-wrapper,
  .admin-layout-wrapper.sidebar-collapsed .content-wrapper {
    margin-left: 0 !important;
    width: 100% !important;
  }

  :deep(.main-sidebar) {
    width: 260px !important;
    transform: translateX(0);
    box-shadow: 5px 0 25px rgba(0,0,0,0.5) !important;
  }

  .admin-layout-wrapper.sidebar-collapsed :deep(.main-sidebar) {
    transform: translateX(-100%);
    box-shadow: none !important;
  }

  :deep(.toggle-sidebar-btn) {
    width: 32px !important;
    height: 32px !important;
    right: -16px !important; 
    top: 14px !important;
  }
  
  .admin-layout-wrapper.sidebar-collapsed :deep(.toggle-sidebar-btn i) {
    transform: translateX(6px) !important;
  }

  :deep(.brand-text) {
    display: inline-block !important;
  }
}

.main-content {
  background-color: var(--bs-body-bg);
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

[data-bs-theme="dark"] .text-dark {
    color: #f8f9fa !important;
}

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