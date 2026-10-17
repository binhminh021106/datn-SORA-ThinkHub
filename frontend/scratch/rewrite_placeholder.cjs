const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/admin/setting/Index.vue');
let content = fs.readFileSync(filePath, 'utf8');

const uiStart = content.indexOf('<div :class="activeTab === \'placeholder\' ? \'tab-pane-active\' : \'tab-pane-inactive\'" style="grid-area: 1 / 1;">');
const cropperModalIndex = content.indexOf('<div class="modal fade" id="cropperModal"', uiStart);

if (uiStart !== -1 && cropperModalIndex !== -1) {
    const beforeUI = content.substring(0, uiStart);
    const afterUI = content.substring(cropperModalIndex);
    
    const newUI = `<div :class="activeTab === 'placeholder' ? 'tab-pane-active' : 'tab-pane-inactive'" style="grid-area: 1 / 1;">
        <div class="p-4">
          <div class="row g-4">
            
            <!-- CLIENT PLACEHOLDER SECTION -->
            <div class="col-lg-6">
              <div class="card border shadow-none h-100 rounded-4">
                <div class="card-header bg-primary text-white border-bottom-0 pt-3 pb-3 rounded-top-4 d-flex justify-content-between align-items-center">
                  <h6 class="fw-bold mb-0"><i class="bi bi-display me-2"></i> Ảnh thay thế Client (Website)</h6>
                </div>
                <div class="card-body bg-light">
                  <div class="text-center mb-3">
                    <div class="border border-2 border-primary rounded-3 p-2 bg-white mx-auto position-relative" style="width: 150px; height: 150px; background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 10px 10px;">
                      <img :src="activePlaceholderClientUrl" class="img-fluid h-100 object-fit-contain" alt="Client Placeholder">
                    </div>
                  </div>
                  
                  <div class="border border-dashed border-2 rounded-4 p-3 text-center bg-white hover-bg-light transition-all cursor-pointer position-relative">
                     <i class="bi bi-cloud-arrow-up fs-4 text-primary d-block mb-2"></i>
                     <span class="fw-bold text-dark font-size-sm">Tải ảnh mới cho Client</span>
                     <input type="file" accept="image/png, image/webp, image/jpeg" @change="e => onPlaceholderFileChange(e, 'client')" class="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer">
                  </div>

                  <div v-if="clientPlaceholderToUpload" class="mt-3 border border-success rounded p-2 bg-white d-flex align-items-center gap-2">
                    <img :src="clientPlaceholderToUpload.base64" style="width: 40px; height: 40px; object-fit: contain;">
                    <span class="small fw-bold text-truncate">{{ clientPlaceholderToUpload.name }}</span>
                    <button class="btn btn-sm btn-success ms-auto py-1 px-2" @click="uploadPlaceholder('client')" :disabled="isUploadingPlaceholder">
                      <AdminLoadingSpinner v-if="isUploadingPlaceholder && uploadingTarget === 'client'" size="16" /> Tải lên
                    </button>
                  </div>
                  
                  <div class="mt-3 text-center">
                    <button class="btn btn-sm btn-outline-secondary" @click="selectDefaultPlaceholder('client')"><i class="bi bi-arrow-counterclockwise"></i> Dùng ảnh mặc định</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ADMIN PLACEHOLDER SECTION -->
            <div class="col-lg-6">
              <div class="card border shadow-none h-100 rounded-4">
                <div class="card-header bg-info text-white border-bottom-0 pt-3 pb-3 rounded-top-4 d-flex justify-content-between align-items-center">
                  <h6 class="fw-bold mb-0"><i class="bi bi-speedometer2 me-2"></i> Ảnh thay thế Admin</h6>
                </div>
                <div class="card-body bg-light">
                  <div class="text-center mb-3">
                    <div class="border border-2 border-info rounded-3 p-2 bg-white mx-auto position-relative" style="width: 150px; height: 150px; background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 10px 10px;">
                      <img :src="activePlaceholderAdminUrl" class="img-fluid h-100 object-fit-contain" alt="Admin Placeholder">
                    </div>
                  </div>
                  
                  <div class="border border-dashed border-2 rounded-4 p-3 text-center bg-white hover-bg-light transition-all cursor-pointer position-relative">
                     <i class="bi bi-cloud-arrow-up fs-4 text-info d-block mb-2"></i>
                     <span class="fw-bold text-dark font-size-sm">Tải ảnh mới cho Admin</span>
                     <input type="file" accept="image/png, image/webp, image/jpeg" @change="e => onPlaceholderFileChange(e, 'admin')" class="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer">
                  </div>

                  <div v-if="adminPlaceholderToUpload" class="mt-3 border border-success rounded p-2 bg-white d-flex align-items-center gap-2">
                    <img :src="adminPlaceholderToUpload.base64" style="width: 40px; height: 40px; object-fit: contain;">
                    <span class="small fw-bold text-truncate">{{ adminPlaceholderToUpload.name }}</span>
                    <button class="btn btn-sm btn-success ms-auto py-1 px-2" @click="uploadPlaceholder('admin')" :disabled="isUploadingPlaceholder">
                      <AdminLoadingSpinner v-if="isUploadingPlaceholder && uploadingTarget === 'admin'" size="16" /> Tải lên
                    </button>
                  </div>

                  <div class="mt-3 text-center">
                    <button class="btn btn-sm btn-outline-secondary" @click="selectDefaultPlaceholder('admin')"><i class="bi bi-arrow-counterclockwise"></i> Dùng ảnh mặc định</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div class="bg-light p-3 text-end border-top">
            <button @click="savePlaceholderSettings" type="button" class="btn btn-primary rounded-pill px-3 py-2 fw-bold shadow-sm" :disabled="isSavingPlaceholder || !isInitialized">
               <AdminLoadingSpinner v-if="isSavingPlaceholder" class="me-2" size="16" />
               <i v-else class="bi bi-save me-2"></i> LƯU CẤU HÌNH ẢNH THAY THẾ
            </button>
        </div>
      </div>
    </div>
  </div>
  
  `;
    
    content = beforeUI + newUI + afterUI;
}

// Replace JS logic
content = content.replace(/const placeholderGalleryImages = ref\(\[\]\);[\s\S]*?\/\/ -------------- END PLACEHOLDER LOGIC --------------/m, `
// -------------- PLACEHOLDER LOGIC --------------
const defaultPlaceholder = '/Sora-placeholder.png';

const placeholderClientUrl = ref('');
const placeholderAdminUrl = ref('');

const clientPlaceholderToUpload = ref(null);
const adminPlaceholderToUpload = ref(null);
const uploadingTarget = ref('');
const isUploadingPlaceholder = ref(false);
const isSavingPlaceholder = ref(false);

const activePlaceholderClientUrl = computed(() => {
    if (placeholderClientUrl.value) return placeholderClientUrl.value;
    return settingsStore.settings.placeholder_client_active || defaultPlaceholder;
});

const activePlaceholderAdminUrl = computed(() => {
    if (placeholderAdminUrl.value) return placeholderAdminUrl.value;
    return settingsStore.settings.placeholder_admin_active || defaultPlaceholder;
});

const onPlaceholderFileChange = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Lỗi', 'Kích thước file không được vượt quá 5MB.', 'error');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        if (target === 'client') {
            clientPlaceholderToUpload.value = { base64: event.target.result, name: file.name };
        } else {
            adminPlaceholderToUpload.value = { base64: event.target.result, name: file.name };
        }
    };
    reader.readAsDataURL(file);
};

const uploadPlaceholder = async (target) => {
    const data = target === 'client' ? clientPlaceholderToUpload.value : adminPlaceholderToUpload.value;
    if (!data) return;

    isUploadingPlaceholder.value = true;
    uploadingTarget.value = target;

    try {
        const res = await axios.post(\`\${BACKEND_URL}/admin/settings/placeholders/upload\`, {
            image: data.base64
        }, { headers: getHeaders() });

        const url = res.data.url;
        
        if (target === 'client') {
            placeholderClientUrl.value = url;
            clientPlaceholderToUpload.value = null;
        } else {
            placeholderAdminUrl.value = url;
            adminPlaceholderToUpload.value = null;
        }
        
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã tải lên! Nhớ bấm Lưu Cấu Hình.', showConfirmButton: false, timer: 3000 });
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể tải lên ảnh.', 'error');
    } finally {
        isUploadingPlaceholder.value = false;
        uploadingTarget.value = '';
    }
};

const selectDefaultPlaceholder = (target) => {
    if (target === 'client') {
        placeholderClientUrl.value = defaultPlaceholder;
        clientPlaceholderToUpload.value = null;
    } else {
        placeholderAdminUrl.value = defaultPlaceholder;
        adminPlaceholderToUpload.value = null;
    }
};

const savePlaceholderSettings = async () => {
    isSavingPlaceholder.value = true;
    try {
        const updatePayload = { settings: [] };

        const urlToSaveClient = activePlaceholderClientUrl.value === defaultPlaceholder ? '' : (activePlaceholderClientUrl.value.includes('settings/placeholders') ? activePlaceholderClientUrl.value.substring(activePlaceholderClientUrl.value.indexOf('settings/placeholders')) : activePlaceholderClientUrl.value);
        updatePayload.settings.push({ key: 'placeholder_client_active', value: urlToSaveClient, type: 'image' });

        const urlToSaveAdmin = activePlaceholderAdminUrl.value === defaultPlaceholder ? '' : (activePlaceholderAdminUrl.value.includes('settings/placeholders') ? activePlaceholderAdminUrl.value.substring(activePlaceholderAdminUrl.value.indexOf('settings/placeholders')) : activePlaceholderAdminUrl.value);
        updatePayload.settings.push({ key: 'placeholder_admin_active', value: urlToSaveAdmin, type: 'image' });

        await axios.post(\`\${BACKEND_URL}/admin/settings/batch\`, updatePayload, { headers: getHeaders() });
        await settingsStore.fetchSettings();

        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã lưu cấu hình ảnh thay thế!', showConfirmButton: false, timer: 2000 });
    } catch (err) {
        console.error('Save placeholder settings failed', err);
        Swal.fire('Thất bại', 'Đã xảy ra lỗi khi lưu cấu hình.', 'error');
    } finally {
        isSavingPlaceholder.value = false;
    }
};
// -------------- END PLACEHOLDER LOGIC --------------
`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully rewrote placeholder tab with fixed closing tags');
