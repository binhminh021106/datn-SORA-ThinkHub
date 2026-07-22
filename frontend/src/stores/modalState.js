import { reactive } from 'vue';

export const globalModalState = reactive({
  // Trạng thái cho Quick Add
  quickAddProduct: null,
  quickAddTrigger: 0, 

  openQuickAdd(product) {
    this.quickAddProduct = product;
    this.quickAddTrigger++; // Tăng biến đếm để kích hoạt Watcher trong Modal
  },

  // Trạng thái cho So Sánh (Compare)
  compareProduct: null,
  compareTrigger: 0,

  openCompare(product) {
    this.compareProduct = product;
    this.compareTrigger++; // Tăng biến đếm để kích hoạt Watcher trong Modal
  }
});