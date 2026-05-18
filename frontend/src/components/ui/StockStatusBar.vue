<template>
  <div class="stock-progress-wrapper mb-4">
    <template v-if="isAllAttributesSelected && currentVariant">
      <div v-if="currentStock > 0 && currentStock < 10" class="stock-alert critical">
        <p class="stock-text">Only <strong>{{ currentStock }}</strong> item(s) left in stock! (Chỉ còn {{ currentStock }} sản phẩm)</p>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill red-fill" :style="{ width: stockProgressWidth + '%' }"></div>
        </div>
      </div>
      
      <div v-else-if="currentStock >= 10 && currentStock < 15" class="stock-alert warning">
        <p class="stock-text">Sắp hết hàng (Còn {{ currentStock }} sản phẩm)</p>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill orange-fill" :style="{ width: stockProgressWidth + '%' }"></div>
        </div>
      </div>

      <div v-else class="stock-status-luxury">
        <span :class="currentStock > 0 ? 'in-stock' : 'out-of-stock'">
          <i class="bi" :class="currentStock > 0 ? 'bi-box-seam-fill' : 'bi-box-seam'"></i> 
          {{ currentStock > 0 ? `Còn ${currentStock} sản phẩm` : 'Pre-Order (Đặt trước / Hết hàng)' }}
        </span>
      </div>
    </template>
    
    <template v-else>
      <span class="text-muted fst-italic" style="font-size: 0.9rem; color: #888;">
        <i class="bi bi-info-circle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại để xem số lượng
      </span>
    </template>
  </div>
</template>

<script setup>
defineProps({
  isAllAttributesSelected: {
    type: Boolean,
    required: true
  },
  currentVariant: {
    type: Object,
    default: null
  },
  currentStock: {
    type: Number,
    default: null
  },
  stockProgressWidth: {
    type: Number,
    default: 0
  }
});
</script>

<style scoped>
.stock-progress-wrapper { margin-top: 10px; }
.stock-alert { display: flex; flex-direction: column; gap: 8px; }
.stock-text { font-size: 13px; color: #666; margin: 0; }
.stock-text strong { font-size: 14px; color: #333; }
.progress-bar-bg { width: 100%; height: 6px; background-color: #e4e7ed; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease-in-out; }
.red-fill { background-color: #F56C6C; }
.orange-fill { background-color: #E6A23C; }
.stock-status-luxury { font-size: 14px; font-weight: 500; }
.in-stock { color: rgb(159,39,59); } 
.out-of-stock { color: #999; }
</style>
