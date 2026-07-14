<template>
  <div class="settings-page">
    <!-- Lần tải đầu tiên và dữ liệu hoàn toàn trống trong cache -->
    <div v-if="(isLoadingGallery || settingsStore.isLoading) && isFirstLoad" class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải cấu hình...</p>
    </div>

    <div class="settings-wrapper min-vh-100 p-3 p-xl-4" v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bolder text-dark mb-1">Cấu hình Website</h4>
          <span class="text-muted font-size-sm">Quản lý Thư viện Logo, Header và Footer</span>
        </div>
      </div>

      <!-- LOGO CONFIGURATION -->
      <div class="card custom-card border-0 shadow-sm rounded-4 mb-5">
        <div class="card-header bg-primary-soft border-bottom pt-3 pb-3 px-4 d-flex align-items-center gap-2">
          <div class="icon-circle bg-white text-primary flex-shrink-0 border" style="width: 32px; height: 32px;">
            <i class="bi bi-images"></i>
          </div>
          <h5 class="fw-bold mb-0 text-dark">1. Cấu hình Thư viện Logo & Header</h5>
        </div>
        <div class="card-body p-4">
          <div class="row g-4">
            <!-- Logo Gallery -->
            <div class="col-lg-7">
              <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
                Thư viện Logo 
                <span v-if="isFetchingGallery && !isLoadingGallery" class="spinner-border spinner-border-sm text-primary"></span>
              </h6>
              <div class="row g-3 pb-2" style="max-height: 400px; overflow-y: auto; overflow-x: hidden; padding-top: 5px; padding-right: 5px;">
                <!-- Default Logo Card -->
                <div class="col-6 col-md-4">
                   <div class="border border-2 rounded-3 p-2 text-center cursor-pointer transition-all position-relative"
                        :class="activeLogoUrl === defaultLogo ? 'border-primary bg-primary-soft shadow-sm' : 'border-transparent hover-bg-light'"
                        @click="selectLogo(defaultLogo)" style="height: 100px;">
                      
                      <span v-if="activeLogoUrl === defaultLogo" class="position-absolute badge rounded-pill bg-primary shadow-sm" style="top: -8px; right: -8px; font-size: 0.8rem; z-index: 10;"><i class="bi bi-check-lg"></i></span>
                      
                      <img :src="defaultLogo" class="img-fluid h-100 object-fit-contain" alt="Default">
                      <div class="position-absolute bottom-0 start-0 w-100 bg-white bg-opacity-75 small fw-bold text-muted rounded-bottom-3" style="font-size: 0.7rem; pointer-events: none;">MẶC ĐỊNH</div>
                   </div>
                </div>

                <!-- Uploaded Logos -->
                <div class="col-6 col-md-4" v-for="(url, index) in galleryImages" :key="index">
                   <div class="border border-2 rounded-3 p-2 text-center cursor-pointer transition-all position-relative"
                        :class="activeLogoUrl === url ? 'border-primary bg-primary-soft shadow-sm' : 'border-transparent hover-bg-light'"
                        @click="selectLogo(url)" style="height: 100px; background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 10px 10px;">
                      
                      <span v-if="activeLogoUrl === url" class="position-absolute badge rounded-pill bg-primary shadow-sm" style="top: -8px; right: -8px; font-size: 0.8rem; z-index: 10;"><i class="bi bi-check-lg"></i></span>
                      
                      <img :src="url" class="img-fluid h-100 object-fit-contain" alt="Uploaded Logo">
                      
                      <!-- Crop Button -->
                      <button class="btn btn-sm btn-light border position-absolute bottom-0 end-0 m-1 px-2 py-0" style="z-index: 5;" @click.stop="cropGalleryImage(url)" title="Cắt lại ảnh này">
                          <i class="bi bi-crop text-secondary" style="font-size: 0.75rem;"></i>
                      </button>
                      <!-- Delete Button -->
                      <button class="btn btn-sm btn-danger position-absolute top-0 start-0 m-1 px-1 py-0" style="z-index: 5; opacity: 0.8;" @click.stop="deleteGalleryImage(url)" title="Xóa ảnh này">
                          <i class="bi bi-x" style="font-size: 0.8rem;"></i>
                      </button>
                   </div>
                </div>
              </div>
              
              <div class="alert alert-info mt-3 py-2 px-3 small mb-0 d-flex align-items-center gap-2">
                 <i class="bi bi-lightbulb-fill text-warning fs-5"></i>
                 <span><strong>Mẹo:</strong> Hãy sử dụng file PNG có <strong>nền trong suốt (transparent)</strong>. Tránh dùng JPG có nền trắng để logo hiển thị đẹp nhất trên các nền màu tối.</span>
              </div>
            </div>

            <!-- Upload New Logo -->
            <div class="col-lg-5">
               <h6 class="fw-bold mb-3">Tải lên / Chỉnh sửa Logo</h6>
               
               <!-- Tải ảnh mới lên -->
               <div v-if="!hasImageToCrop" class="position-relative border border-dashed border-2 rounded-4 p-4 text-center bg-light-soft hover-bg-light transition-all cursor-pointer d-flex flex-column justify-content-center align-items-center" style="min-height: 150px;">
                  <div class="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px;">
                     <i class="bi bi-cloud-arrow-up fs-4 text-primary"></i>
                  </div>
                  <span class="fw-bold text-dark mb-1">Click để tải ảnh lên</span>
                  <span class="text-muted font-size-xs">Định dạng: PNG, WEBP (Tối đa 5MB)</span>
                  <input type="file" accept="image/png, image/webp, image/jpeg" @change="onFileChange" class="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer">
               </div>
               
               <!-- Preview & Action Box -->
               <div v-else class="border border-primary border-2 rounded-4 p-3 bg-white shadow-sm d-flex flex-column mb-3">
                   <div class="d-flex align-items-center gap-3 mb-3">
                      <div class="bg-light rounded p-2 text-center border" style="width: 60px; height: 60px; flex-shrink:0; background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 5px 5px;">
                         <img :src="rawImageBase64" class="img-fluid rounded h-100 object-fit-contain">
                      </div>
                      <div class="overflow-hidden">
                         <h6 class="fw-bold mb-1 text-dark">Ảnh đang được chọn</h6>
                         <p class="text-muted font-size-xs mb-0 text-truncate" style="max-width: 150px;">{{ selectedFileName }}</p>
                      </div>
                      <button class="btn btn-sm btn-light border ms-auto rounded-circle" @click="cancelImageSelection" style="width: 32px; height: 32px;"><i class="bi bi-x-lg"></i></button>
                   </div>
                   <div class="d-flex gap-2">
                      <button type="button" @click="uploadRawImage" class="btn btn-info text-white fw-semibold flex-grow-1 shadow-sm" :disabled="isUploadingRaw" v-if="!isFromGallery">
                         <span v-if="isUploadingRaw" class="spinner-border spinner-border-sm me-1"></span> Tải Gốc Lên
                      </button>
                      <button type="button" @click="openCropperModal" class="btn btn-primary fw-semibold flex-grow-1 shadow-sm"><i class="bi bi-crop me-1"></i> Mở Trình Cắt</button>
                   </div>
               </div>
               
               <!-- Cấu hình Mục tiêu Áp dụng -->
               <div class="mt-4 border rounded-4 p-3 bg-white shadow-sm border-primary">
                   <h6 class="fw-bold mb-3 text-dark"><i class="bi bi-sliders me-2 text-primary"></i>Phạm vi Áp dụng Logo:</h6>
                   <div class="d-flex flex-column gap-2 ps-2">
                      <div class="form-check">
                         <input class="form-check-input" type="radio" name="logoApply" id="applyBoth" value="both" v-model="logoApplyTarget">
                         <label class="form-check-label fw-semibold" for="applyBoth">Áp dụng cho Cả Header & Footer</label>
                      </div>
                      <div class="form-check">
                         <input class="form-check-input" type="radio" name="logoApply" id="applyHeader" value="header" v-model="logoApplyTarget">
                         <label class="form-check-label fw-semibold" for="applyHeader">Chỉ áp dụng Header (Footer giữ nguyên)</label>
                      </div>
                      <div class="form-check">
                         <input class="form-check-input" type="radio" name="logoApply" id="applyFooter" value="footer" v-model="logoApplyTarget">
                         <label class="form-check-label fw-semibold text-danger" for="applyFooter">Chỉ áp dụng Footer (Nền tối)</label>
                      </div>
                   </div>
               </div>
            </div>
          </div>

          <!-- Live Header Preview -->
          <div class="mt-5 border rounded-4 overflow-hidden shadow-sm">
             <div class="bg-dark text-white pt-2 pb-2 px-3 d-flex justify-content-between align-items-center">
                <span class="fw-bold font-size-xs text-uppercase letter-spacing-1"><i class="bi bi-display me-2"></i>Live Preview Header</span>
                <span class="badge bg-success">Real-time</span>
             </div>
             <div class="w-100 overflow-x-auto bg-light border-bottom">
                <div class="min-w-100 pointer-events-none" style="pointer-events: none;">
                    <SoraHeader :preview-data="liveHeaderData" />
                </div>
             </div>
          </div>
        </div>
        <div class="card-footer bg-white p-3 text-end">
            <button @click="saveLogoSettings" type="button" class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" :disabled="isSavingHeader">
               <span v-if="isSavingHeader" class="spinner-border spinner-border-sm me-2"></span>
               <i v-else class="bi bi-save me-2"></i> LƯU CẤU HÌNH LOGO
            </button>
        </div>
      </div>


      <!-- FOOTER BUILDER -->
      <div class="card custom-card border-0 shadow-sm rounded-4 mb-5">
        <div class="card-header bg-info-soft border-bottom pt-3 pb-3 px-4 d-flex align-items-center gap-2">
          <div class="icon-circle bg-white text-info flex-shrink-0 border" style="width: 32px; height: 32px;">
            <i class="bi bi-layout-text-window-reverse"></i>
          </div>
          <h5 class="fw-bold mb-0 text-dark">2. Xây dựng Nội dung Footer</h5>
        </div>
        <div class="card-body p-4">
           
           <div class="row g-4 mb-4">
             <div class="col-lg-12">
               <label class="form-label fw-semibold font-size-sm">Slogan (Dưới Logo Footer)</label>
               <textarea v-model="footerBrandDesc" rows="2" class="form-control bg-light" placeholder="Nhập đoạn giới thiệu ngắn..."></textarea>
             </div>
             <div class="col-lg-4">
               <label class="form-label fw-semibold font-size-sm">Địa chỉ hiển thị</label>
               <input type="text" v-model="footerAddress" class="form-control bg-light" placeholder="123 Đường Ngọc Hồi, Hà Nội">
             </div>
             <div class="col-lg-4">
               <label class="form-label fw-semibold font-size-sm">Email hiển thị</label>
               <input type="text" v-model="footerEmail" class="form-control bg-light" placeholder="SORA@GMAIL.COM">
             </div>
             <div class="col-lg-4">
               <label class="form-label fw-semibold font-size-sm">Nội dung Bản quyền (Copyright)</label>
               <input type="text" v-model="footerCopyright" class="form-control bg-light" placeholder="© 2026 SORA JEWELRY...">
             </div>
           </div>

           <hr class="text-muted opacity-25 mb-4">

           <h6 class="fw-bold mb-3">Thanh Tiếp Thị (4 mục trên dải màu Be)</h6>
           <div class="row g-3 mb-4">
             <div class="col-lg-3 col-md-6" v-for="(item, index) in footerTrustItems" :key="'trust-'+index">
                <div class="border rounded-3 p-3 bg-light-soft h-100 border-top border-3 border-warning">
                   <div class="d-flex align-items-center gap-2 mb-3">
                     <span class="badge bg-warning text-dark rounded-circle p-2">{{ index + 1 }}</span>
                     <div class="input-group input-group-sm">
                         <span class="input-group-text bg-white"><i :class="item.icon" class="text-primary"></i></span>
                         <input type="text" v-model="item.icon" class="form-control font-monospace text-primary" placeholder="Icon class (vd: bi-truck)">
                     </div>
                   </div>
                   <input type="text" v-model="item.title" class="form-control form-control-sm fw-bold mb-2 text-uppercase" placeholder="Tiêu đề (Vd: GIAO HÀNG)">
                   <input type="text" v-model="item.subtitle" class="form-control form-control-sm text-muted" placeholder="Mô tả phụ...">
                </div>
             </div>
           </div>

           <hr class="text-muted opacity-25 mb-4">

           <h6 class="fw-bold mb-3">Mạng xã hội (Cột phải cùng)</h6>
           <div class="row g-3">
             <div class="col-lg-3 col-md-6" v-for="(social, sIndex) in footerSocials" :key="'soc-'+sIndex">
                <div class="border rounded-3 p-3 bg-light-soft d-flex flex-column gap-2">
                  <div class="d-flex gap-2">
                     <div class="bg-white border rounded d-flex align-items-center justify-content-center flex-shrink-0" style="width: 38px; height: 38px;">
                        <i :class="social.icon" class="text-primary fs-5"></i>
                     </div>
                     <select v-model="social.icon" class="form-select form-select-sm fw-semibold font-monospace">
                       <option value="bi bi-facebook">Facebook</option>
                       <option value="bi bi-youtube">YouTube</option>
                       <option value="bi bi-instagram">Instagram</option>
                       <option value="bi bi-tiktok">TikTok</option>
                       <option value="bi bi-twitter-x">Twitter (X)</option>
                       <option value="bi bi-globe">Website</option>
                     </select>
                  </div>
                  <input type="text" v-model="social.title" class="form-control form-control-sm" placeholder="Tiêu đề (Vd: Theo dõi Facebook)">
                  <input type="text" v-model="social.url" class="form-control form-control-sm font-monospace text-primary" placeholder="https://...">
                </div>
             </div>
           </div>

           <!-- LIVE PREVIEW FOOTER -->
           <div class="mt-5 border rounded-4 overflow-hidden shadow-sm">
              <div class="bg-dark text-white pt-2 pb-2 px-3 d-flex justify-content-between align-items-center">
                 <span class="fw-bold font-size-xs text-uppercase letter-spacing-1"><i class="bi bi-display me-2"></i>Live Preview Footer</span>
                 <span class="badge bg-success">Real-time</span>
              </div>
              <div class="w-100 overflow-x-auto bg-white">
                 <div class="min-w-100 pointer-events-none" style="pointer-events: none;">
                     <SoraFooter :preview-data="liveFooterData" />
                 </div>
              </div>
           </div>
        </div>
        <div class="card-footer bg-white p-3 text-end">
            <button @click="saveFooterSettings" type="button" class="btn btn-info text-white rounded-pill px-4 py-2 fw-bold shadow-sm" :disabled="isSavingFooter">
               <span v-if="isSavingFooter" class="spinner-border spinner-border-sm me-2"></span>
               <i v-else class="bi bi-save me-2"></i> LƯU CẤU HÌNH FOOTER
            </button>
        </div>
      </div>
      
      <!-- Modal Cropper (Full Screen) -->
      <div class="modal fade" id="cropperModal" tabindex="-1" aria-labelledby="cropperModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content border-0">
            <div class="modal-header bg-dark text-white border-bottom-0 rounded-0">
              <h5 class="modal-title fw-bold" id="cropperModalLabel"><i class="bi bi-crop me-2"></i>Công cụ Cắt Ảnh Logo</h5>
              <button type="button" class="btn-close btn-close-white" @click="cancelCropModal"></button>
            </div>
            <div class="d-flex flex-grow-1 overflow-hidden" style="min-height: 0;">
              <!-- Vùng cắt ảnh (Bên trái) -->
              <div class="modal-body p-0 bg-dark d-flex align-items-center justify-content-center position-relative flex-grow-1">
                <img ref="cropImageRef" style="display: block; max-width: 100%; max-height: 100vh;">
              </div>
              
              <!-- Thanh công cụ (Bên phải) -->
              <div class="bg-light border-start d-flex flex-column p-4 shadow-sm z-3" style="width: 320px; flex-shrink: 0; overflow-y: auto;">
                <h6 class="fw-bold mb-4 text-dark border-bottom pb-2"><i class="bi bi-sliders me-2"></i>Thông số cắt</h6>
                
                <div class="mb-4">
                    <span class="fw-bold text-muted font-size-sm d-block mb-3">Chọn tỷ lệ khung hình:</span>
                    <div class="d-flex flex-column gap-2">
                        <button type="button" class="btn text-start fw-semibold" :class="isNaN(currentRatio) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'" @click="setCropperRatio(NaN)"><i class="bi bi-aspect-ratio me-2"></i>Tự do (Free)</button>
                        <button type="button" class="btn text-start fw-semibold" :class="currentRatio === 1 ? 'btn-primary shadow-sm' : 'btn-outline-secondary'" @click="setCropperRatio(1)"><i class="bi bi-square me-2"></i>Vuông (1:1)</button>
                        <button type="button" class="btn text-start fw-semibold" :class="currentRatio === 4/3 ? 'btn-primary shadow-sm' : 'btn-outline-secondary'" @click="setCropperRatio(4/3)"><i class="bi bi-display me-2"></i>Ngang (4:3)</button>
                        <button type="button" class="btn text-start fw-semibold" :class="currentRatio === 16/9 ? 'btn-primary shadow-sm' : 'btn-outline-secondary'" @click="setCropperRatio(16/9)"><i class="bi bi-tv me-2"></i>Màn hình rộng (16:9)</button>
                    </div>
                </div>
                
                <div class="mt-auto d-flex flex-column gap-3 pt-4 border-top">
                    <button type="button" class="btn btn-primary fw-bold w-100 shadow-sm py-2" @click="saveCropAndUpload" :disabled="isUploadingCrop">
                      <span v-if="isUploadingCrop" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-cloud-upload me-2"></i>Lưu & Tải lên
                    </button>
                    <button type="button" class="btn btn-light border fw-semibold w-100 py-2" @click="cancelCropModal" :disabled="isUploadingCrop">Hủy bỏ thao tác</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Modal } from 'bootstrap';
import SoraFooter from '@/components/user/Footer.vue';
import SoraHeader from '@/components/user/Header.vue';

const settingsStore = useSettingsStore();
const queryClient = useQueryClient();
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

// --- GLOBAL STATE ---
const isFirstLoad = ref(true);

const getHeaders = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('adminToken') || localStorage.getItem('auth_token');
  return { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };
};

const defaultLogo = settingsStore.defaultLogo;

// TANSTACK QUERY: Đọc thư viện Logo
const { data: galleryData, isLoading: isLoadingGallery, isFetching: isFetchingGallery } = useQuery({
  queryKey: ['admin-gallery-logos'],
  queryFn: async () => {
    const res = await axios.get(`${BACKEND_URL}/admin/settings/logos`, { headers: getHeaders() });
    return res.data.data || [];
  },
  staleTime: 5 * 60 * 1000, // Cache trong 5 phút
});

// --- HEADER & LOGO GALLERY STATE ---
const galleryImages = ref([]);
const activeLogoUrl = ref('');
const logoApplyTarget = ref('header'); // 'both', 'header', 'footer'
const isUploadingCrop = ref(false);
const isUploadingRaw = ref(false);
const isSavingHeader = ref(false);

const rawImageBase64 = ref('');
const hasImageToCrop = ref(false);
const isFromGallery = ref(false);
const selectedFileName = ref('');

const cropImageRef = ref(null);
let cropperInstance = null;
let cropperModalInstance = null;
const currentRatio = ref(NaN);

const liveHeaderData = computed(() => {
    const isApplyingToHeader = logoApplyTarget.value === 'both' || logoApplyTarget.value === 'header';
    return {
        site_logo: isApplyingToHeader ? activeLogoUrl.value : (settingsStore.settings.site_logo || defaultLogo)
    };
});

// --- FOOTER STATE ---
const footerBrandDesc = ref('');
const footerCopyright = ref('');
const footerAddress = ref('');
const footerEmail = ref('');
const footerTrustItems = ref([]);
const footerSocials = ref([]);
const isSavingFooter = ref(false);

const liveFooterData = computed(() => {
    const isApplyingToFooter = logoApplyTarget.value === 'both' || logoApplyTarget.value === 'footer';
    return {
        site_logo: settingsStore.settings.site_logo,
        logo_footer: isApplyingToFooter ? activeLogoUrl.value : settingsStore.settings.logo_footer,
        footer_brand_desc: footerBrandDesc.value,
        footer_copyright: footerCopyright.value,
        footer_address: footerAddress.value,
        footer_email: footerEmail.value,
        footer_trust_items: footerTrustItems.value,
        footer_socials: footerSocials.value
    };
});

watch(galleryData, (newVal) => {
  if (newVal) {
    galleryImages.value = newVal;
    isFirstLoad.value = false;
  }
}, { immediate: true });

// --- LIFECYCLE ---
onMounted(async () => {
    await settingsStore.fetchSettings();
    const s = settingsStore.settings;

    // Load active logo (prefer footer logo if it exists, otherwise header logo)
    activeLogoUrl.value = s.logo_footer || s.site_logo || defaultLogo;

    // Load Footer Form
    footerBrandDesc.value = s.footer_brand_desc;
    footerCopyright.value = s.footer_copyright;
    footerAddress.value = s.footer_address;
    footerEmail.value = s.footer_email;
    
    footerTrustItems.value = Array.isArray(s.footer_trust_items) && s.footer_trust_items.length > 0 ? JSON.parse(JSON.stringify(s.footer_trust_items)) : [];
    while(footerTrustItems.value.length < 4) footerTrustItems.value.push({icon: '', title: '', subtitle: ''});

    footerSocials.value = Array.isArray(s.footer_socials) && s.footer_socials.length > 0 ? JSON.parse(JSON.stringify(s.footer_socials)) : [];
    while(footerSocials.value.length < 4) footerSocials.value.push({icon: 'bi bi-link', url: '', title: ''});

    const modalEl = document.getElementById('cropperModal');
    cropperModalInstance = new Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
    });

    modalEl.addEventListener('shown.bs.modal', () => {
        if (cropImageRef.value && cropImageRef.value.src) {
            // Đảm bảo Cropper init đúng cách khi modal đã hoàn toàn hiện ra
            if (cropperInstance) cropperInstance.destroy();
            cropperInstance = new Cropper(cropImageRef.value, {
                viewMode: 1,
                dragMode: 'move',
                aspectRatio: isNaN(currentRatio.value) ? NaN : currentRatio.value,
                autoCropArea: 0.9,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        }
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
    });

    const modalBody = modalEl.querySelector('.modal-body');
    if(modalBody) {
        modalBody.addEventListener('wheel', (e) => {
            if (e.ctrlKey && cropperInstance) {
                e.preventDefault();
                cropperInstance.zoom(e.deltaY > 0 ? -0.1 : 0.1);
            }
        }, { passive: false });
    }
});

// --- METHODS: LOGO GALLERY & HEADER ---
const selectLogo = (url) => {
    activeLogoUrl.value = url;
};

const deleteGalleryImage = async (url) => {
    const result = await Swal.fire({
        title: 'Xóa Logo?',
        text: 'Bạn có chắc chắn muốn xóa logo này khỏi thư viện không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đồng ý, Xóa!',
        cancelButtonText: 'Hủy'
    });
    
    if (result.isConfirmed) {
        try {
            const res = await axios.delete(`${BACKEND_URL}/admin/settings/logos`, {
                headers: getHeaders(),
                data: { url: url }
            });
            if(res.data.status === 'success') {
                galleryImages.value = galleryImages.value.filter(img => img !== url);
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã xóa logo!', showConfirmButton: false, timer: 2000 });
                if (activeLogoUrl.value === url) {
                    activeLogoUrl.value = defaultLogo;
                }
            }
        } catch(e) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể xóa logo lúc này!' });
        }
    }
};

const cropGalleryImage = async (url) => {
    selectedFileName.value = url.split('/').pop() || 'Từ thư viện';
    isFromGallery.value = true;
    
    try {
        // Lấy ảnh dạng base64 từ server để bypass lỗi CORS của CropperJS
        const res = await axios.post(`${BACKEND_URL}/admin/settings/logos/base64`, { url: url }, { headers: getHeaders() });
        if(res.data.status === 'success') {
            rawImageBase64.value = res.data.base64;
            hasImageToCrop.value = true;
        } else {
            throw new Error('Lỗi lấy ảnh');
        }
    } catch(e) {
        console.error("CORS bypass failed:", e);
        // Fallback
        rawImageBase64.value = url;
        hasImageToCrop.value = true;
    }
};

const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if(!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            Swal.fire({ icon: 'error', title: 'Lỗi định dạng', text: 'Chỉ hỗ trợ JPG, PNG, WEBP' });
            return;
        }
        if(file.size > 5 * 1024 * 1024) {
            Swal.fire({ icon: 'error', title: 'Ảnh quá lớn', text: 'Vui lòng chọn ảnh < 5MB' });
            return;
        }
        
        selectedFileName.value = file.name;
        isFromGallery.value = false;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            rawImageBase64.value = event.target.result;
            hasImageToCrop.value = true;
        };
        reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = '';
};

const cancelImageSelection = () => {
    hasImageToCrop.value = false;
    rawImageBase64.value = '';
    selectedFileName.value = '';
};

const openCropperModal = async () => {
    if (cropImageRef.value) {
        // Gán src trước khi hiện modal để ảnh load xong
        cropImageRef.value.src = rawImageBase64.value;
    }
    cropperModalInstance.show();
};

const cancelCropModal = () => {
    cropperModalInstance.hide();
};

const setCropperRatio = (ratio) => {
    currentRatio.value = ratio;
    if (cropperInstance) {
        cropperInstance.setAspectRatio(isNaN(ratio) ? NaN : ratio);
    }
};

const uploadRawImage = async () => {
    isUploadingRaw.value = true;
    try {
        const res = await axios.post(`${BACKEND_URL}/admin/settings/logos/upload`, { image: rawImageBase64.value }, { headers: getHeaders() });
        if(res.data.status === 'success') {
            queryClient.invalidateQueries(['admin-gallery-logos']);
            galleryImages.value.unshift(res.data.url);
            activeLogoUrl.value = res.data.url;
            cancelImageSelection();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Tải ảnh gốc lên Thư viện thành công!', showConfirmButton: false, timer: 2000 });
        }
    } catch(e) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Tải ảnh lên thất bại!' });
    } finally {
        isUploadingRaw.value = false;
    }
};

const saveCropAndUpload = async () => {
    if (!cropperInstance) return;
    const base64 = cropperInstance.getCroppedCanvas({
        maxWidth: 1024,
        maxHeight: 1024
    }).toDataURL('image/png');
    
    isUploadingCrop.value = true;

    try {
        const res = await axios.post(`${BACKEND_URL}/admin/settings/logos/upload`, { image: base64 }, { headers: getHeaders() });
        if(res.data.status === 'success') {
            queryClient.invalidateQueries(['admin-gallery-logos']);
            galleryImages.value.unshift(res.data.url);
            activeLogoUrl.value = res.data.url;
            
            cancelCropModal();
            cancelImageSelection();
            
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Tải ảnh cắt lên Thư viện thành công!', showConfirmButton: false, timer: 2000 });
        }
    } catch(e) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Tải ảnh lên thất bại!' });
    } finally {
        isUploadingCrop.value = false;
    }
};

const saveLogoSettings = async () => {
    isSavingHeader.value = true;
    try {
        const value = activeLogoUrl.value === defaultLogo ? '' : activeLogoUrl.value;
        const settingsToUpdate = [];
        
        if (logoApplyTarget.value === 'both' || logoApplyTarget.value === 'header') {
            settingsToUpdate.push({ key: 'logo_header', value: value, type: 'image' });
        }
        if (logoApplyTarget.value === 'both' || logoApplyTarget.value === 'footer') {
            settingsToUpdate.push({ key: 'logo_footer', value: value, type: 'image' });
        }

        const payload = { settings: settingsToUpdate };
        const res = await axios.post(`${BACKEND_URL}/admin/settings`, payload, { headers: getHeaders() });
        if (res.data && res.data.status === 'success') {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật Logo thành công!', showConfirmButton: false, timer: 2000 });
            await settingsStore.fetchSettings(); 
        } else {
            throw new Error('Failed');
        }
    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Đã có lỗi xảy ra khi lưu Logo!' });
    } finally {
        isSavingHeader.value = false;
    }
};

const saveFooterSettings = async () => {
    isSavingFooter.value = true;
    try {
        const payload = {
            settings: [
                { key: 'footer_brand_desc', value: footerBrandDesc.value, type: 'string' },
                { key: 'footer_copyright', value: footerCopyright.value, type: 'string' },
                { key: 'footer_address', value: footerAddress.value, type: 'string' },
                { key: 'footer_email', value: footerEmail.value, type: 'string' },
                { key: 'footer_trust_items', value: footerTrustItems.value, type: 'json' },
                { key: 'footer_socials', value: footerSocials.value, type: 'json' }
            ]
        };
        const res = await axios.post(`${BACKEND_URL}/admin/settings`, payload, { headers: getHeaders() });
        if (res.data && res.data.status === 'success') {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật Footer thành công!', showConfirmButton: false, timer: 2000 });
            await settingsStore.fetchSettings(); 
        } else {
            throw new Error('Failed');
        }
    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Đã có lỗi xảy ra khi lưu Footer!' });
    } finally {
        isSavingFooter.value = false;
    }
};
</script>

<style scoped>
.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #009981 30%, #4dffdf 50%, #009981 70%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 1.5s linear infinite;
}
@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.hover-bg-light:hover { background-color: #f8f9fa !important; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
.icon-circle { border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.bg-light-soft { background-color: #f8fafc; }
.bg-primary-soft { background-color: #eff6ff; }
.bg-info-soft { background-color: #ecfeff; }
.bg-success-soft { background-color: #f0fdf4; }
.text-primary { color: #3b82f6 !important; }
.text-info { color: #06b6d4 !important; }
.text-success { color: #22c55e !important; }

.border-transparent { border-color: transparent !important; }

/* Pointer events none for preview to avoid clicking links */
.pointer-events-none {
    pointer-events: none;
}

/* Fix z-index for Modal to always be above Sidebar */
:deep(.modal) {
    z-index: 10600 !important;
}
:deep(.modal-backdrop) {
    z-index: 10590 !important;
}
</style>
