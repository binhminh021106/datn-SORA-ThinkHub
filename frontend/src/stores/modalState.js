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
  
  // Dữ liệu danh sách compare toàn cục
  compareList: [],
  isCompareInitialized: false,

  initCompareList(shopSlug = 'sora') {
    if (!this.isCompareInitialized) {
      try {
        const stored = localStorage.getItem(`compare_list_${shopSlug}`);
        if (stored) {
            this.compareList = JSON.parse(stored).slice(0, 3);
        }
      } catch (e) { this.compareList = []; }
      this.isCompareInitialized = true;
    }
  },

  updateCompareList(newList, shopSlug = 'sora') {
    this.compareList = newList;
    localStorage.setItem(`compare_list_${shopSlug}`, JSON.stringify(this.compareList));
  },

  openCompare(product) {
    this.compareProduct = product;
    this.compareTrigger++; // Tăng biến đếm để kích hoạt Watcher trong Modal
  }
});