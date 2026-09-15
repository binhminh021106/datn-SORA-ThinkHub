<template>
  <Teleport to="body">
    <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.75); z-index: 999999;">
    <div class="modal-dialog modal-dialog-centered" :class="isAvatar ? '' : 'modal-lg'">
      <div class="modal-content shadow-lg border-0 rounded-4" :class="{'is-avatar-cropper': isAvatar}" :style="{ '--theme-color': themeColor }">
        <div class="modal-header bg-light border-bottom-0 rounded-top-4 py-2 px-3">
          <h5 class="modal-title fw-bold text-dark fs-6">
            <i class="bi bi-crop me-2" :style="{ color: themeColor }"></i> {{ title || 'Cắt & Chỉnh sửa ảnh' }}
          </h5>
          <button type="button" class="btn-close btn-sm" @click="closeModal" aria-label="Close"></button>
        </div>
        
        <div class="modal-body p-0 bg-dark position-relative" :style="{ minHeight: isAvatar ? '250px' : '350px', maxHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }">
          <img ref="imageRef" :src="imageUrl" style="max-width: 100%; max-height: 60vh; display: block;" alt="Image to crop">
        </div>

        <div class="modal-footer bg-light border-top-0 rounded-bottom-4 d-flex justify-content-between align-items-center py-2">
          <div class="cropper-controls d-flex gap-2">
             <button class="btn btn-outline-secondary btn-sm" @click="rotateLeft" title="Xoay trái">
               <i class="bi bi-arrow-counterclockwise"></i>
             </button>
             <button class="btn btn-outline-secondary btn-sm" @click="rotateRight" title="Xoay phải">
               <i class="bi bi-arrow-clockwise"></i>
             </button>
             <button class="btn btn-outline-secondary btn-sm" @click="resetCrop" title="Đặt lại">
               <i class="bi bi-arrow-repeat"></i>
             </button>
             <div class="btn-group ms-3" v-if="allowRatioChange && !isAvatar">
                <button class="btn btn-outline-main btn-sm" :class="{active: currentRatio === 1}" @click="setRatio(1)">1:1</button>
                <button class="btn btn-outline-main btn-sm" :class="{active: currentRatio === 16/9}" @click="setRatio(16/9)">16:9</button>
                <button class="btn btn-outline-main btn-sm" :class="{active: currentRatio === 9/16}" @click="setRatio(9/16)">9:16</button>
                <button class="btn btn-outline-main btn-sm" :class="{active: isNaN(currentRatio)}" @click="setRatio(NaN)">Tự do</button>
             </div>
          </div>
          
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-secondary px-3 py-1 fw-medium btn-sm" @click="closeModal">Hủy</button>
            <button type="button" class="btn btn-main px-3 py-1 fw-medium shadow-sm btn-sm" @click="cropImage">
              Xác nhận
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps({
  show: { type: Boolean, default: false },
  imageUrl: { type: String, required: true },
  aspectRatio: { type: Number, default: NaN }, // Mặc định tự do
  title: { type: String, default: '' },
  allowRatioChange: { type: Boolean, default: false }, // Cho phép admin đổi tỉ lệ hay không
  fileName: { type: String, default: 'cropped-image.jpg' },
  maxSizeKb: { type: Number, default: 0 }, // Nếu > 0 sẽ nén cho đến khi đạt mức dung lượng này
  isAvatar: { type: Boolean, default: false }, // Bật chế độ crop khung tròn cho Avatar
  themeColor: { type: String, default: '#009981' } // Màu chủ đạo của nút (mặc định Admin xanh lá)
});

const emit = defineEmits(['close', 'crop']);

const imageRef = ref(null);
let cropperInstance = null;
const currentRatio = ref(props.aspectRatio);

const initCropper = () => {
  if (cropperInstance) {
    cropperInstance.destroy();
  }
  
  if (imageRef.value) {
    cropperInstance = new Cropper(imageRef.value, {
      aspectRatio: currentRatio.value,
      viewMode: 1, // Restrict the crop box to not exceed the size of the canvas
      dragMode: 'move',
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
};

watch(() => props.show, async (newVal) => {
  if (newVal) {
    currentRatio.value = props.aspectRatio;
    await nextTick();
    // Đợi 1 chút để DOM và image load xong trước khi init cropper
    setTimeout(() => {
       initCropper();
    }, 100);
  } else {
    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }
  }
});

watch(() => props.imageUrl, () => {
  if (props.show && cropperInstance) {
     cropperInstance.replace(props.imageUrl);
  }
});

const setRatio = (ratio) => {
  currentRatio.value = ratio;
  if (cropperInstance) {
    cropperInstance.setAspectRatio(ratio);
  }
};

const rotateLeft = () => cropperInstance && cropperInstance.rotate(-90);
const rotateRight = () => cropperInstance && cropperInstance.rotate(90);
const resetCrop = () => cropperInstance && cropperInstance.reset();

const cropImage = () => {
  if (!cropperInstance) return;
  
  // Tạo canvas (tự động thu nhỏ nếu ảnh quá lớn để tối ưu dung lượng)
  const canvas = cropperInstance.getCroppedCanvas({
    maxWidth: 2048,
    maxHeight: 2048,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  if (!canvas) return;

  const handleBlob = (blob) => {
    if (!blob) {
      console.error('Canvas is empty');
      return;
    }
    // Tạo file thật từ blob để form upload như file bình thường
    const file = new File([blob], props.fileName, { type: 'image/jpeg', lastModified: new Date().getTime() });
    
    // Gửi sự kiện trả về kèm url dạng blob (để preview) và file gốc (để upload api)
    emit('crop', {
      blobUrl: URL.createObjectURL(blob),
      file: file
    });
  };

  if (props.maxSizeKb > 0) {
    let quality = 0.85;
    const targetSize = props.maxSizeKb * 1024;
    
    const attemptCompress = () => {
      canvas.toBlob((blob) => {
        if (blob && (blob.size <= targetSize || quality <= 0.1)) {
          handleBlob(blob);
        } else {
          quality -= 0.15; // Giảm dần mỗi lần thử
          if (quality < 0.1) quality = 0.1; // Đảm bảo không lỗi
          attemptCompress();
        }
      }, 'image/jpeg', quality);
    };
    
    attemptCompress();
  } else {
    // Render mặc định 85% chất lượng
    canvas.toBlob((blob) => handleBlob(blob), 'image/jpeg', 0.85);
  }
};

const closeModal = () => {
  emit('close');
};

onBeforeUnmount(() => {
  if (cropperInstance) {
    cropperInstance.destroy();
  }
});
</script>

<style scoped>
/* Ẩn ảnh gốc phía sau vùng lưới */
:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 4px;
}

/* Khung tròn cho Avatar */
:deep(.is-avatar-cropper .cropper-view-box),
:deep(.is-avatar-cropper .cropper-face) {
  border-radius: 50% !important;
}

/* Custom Buttons Theme Variables */
.btn-main {
  background-color: var(--theme-color);
  color: white;
  border: 1px solid var(--theme-color);
  transition: all 0.2s;
}
.btn-main:hover {
  filter: brightness(0.85);
  border-color: var(--theme-color);
  color: white;
}
.btn-outline-main {
  color: var(--theme-color);
  border-color: var(--theme-color);
  background-color: transparent;
  transition: all 0.2s;
}
.btn-outline-main:hover, .btn-outline-main.active {
  background-color: var(--theme-color);
  color: white;
}
</style>
