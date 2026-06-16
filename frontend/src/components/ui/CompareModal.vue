<template>
  <div>
    <transition name="slide-up">
      <button v-if="compareList.length > 0 && isBottomBarMinimized" class="minimized-compare-btn" @click="isBottomBarMinimized = false" title="Mở danh sách so sánh">
        <i class="bi bi-arrow-left-right"></i>
        <span class="compare-badge">{{ compareList.length }}</span>
      </button>
    </transition>

    <!-- BOTTOM BAR: Danh sách đang so sánh -->
    <transition name="slide-up">
      <div v-if="compareList.length > 0 && !isBottomBarMinimized" class="compare-bottom-bar">
        
        <div class="compare-header-row">
          <span class="compare-title">SO SÁNH SẢN PHẨM</span>
          <button class="close-bar-btn" @click="isBottomBarMinimized = true" title="Tạm ẩn thanh so sánh">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>

        <div class="compare-inner">
          <div class="compare-left">
            <div class="compare-items">
              <div v-for="n in 4" :key="n" class="compare-item" :class="{ empty: !compareList[n-1] }">
                <template v-if="compareList[n-1]">
                  <img class="compare-item-img" :src="compareList[n-1].image" :alt="compareList[n-1].name" @error="handleImageError">
                  <button class="remove-compare" @click="removeFromCompare(compareList[n-1].id)">
                    <i class="bi bi-x"></i>
                  </button>
                </template>
                <template v-else>
                  <button class="compare-empty-btn" type="button" @click="openComparePopup" aria-label="Thêm sản phẩm so sánh">
                    <i class="bi bi-plus" aria-hidden="true"></i>
                  </button>
                </template>
              </div>
            </div>
          </div>

          <div class="compare-right">
            <div class="compare-divider hidden-mobile"></div>

            <div class="compare-status-container hidden-mobile">
              <div class="compare-status">
                <span class="selected-count"><strong>{{ compareList.length }}/4</strong> Đã chọn</span>
                <span class="hint-text" v-if="compareList.length < 2">Chọn ít nhất 2 sản phẩm</span>
              </div>
            </div>

            <div class="compare-actions">
              <button class="editorial-btn btn-go-compare" :disabled="compareList.length < 2" @click="goToComparePage">So sánh</button>
              <button class="editorial-btn btn-clear-compare" @click="clearCompare">Xóa tất cả</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- LIST BAR: Danh sách đang so sánh -->
    <transition name="fade">
      <div v-if="showComparePopup" class="compare-modal-overlay" @click.self="closeComparePopup">
        <div class="compare-modal">
          <div class="compare-modal-header">
            <h3>Thêm sản phẩm so sánh</h3>
            <div class="header-search-wrap">
              <input type="text" v-model="searchQuery" @input="handleSearchInput" placeholder="Tìm tên sản phẩm..." class="modal-search-input">
            </div>
            <button class="close-btn" @click="closeComparePopup"><i class="bi bi-x-lg"></i></button>
          </div>

          <div class="compare-modal-tabs">
            <button :class="{ active: comparePopupTab === 'suggestions' }" @click="comparePopupTab = 'suggestions'">Gợi ý</button>
            <button :class="{ active: comparePopupTab === 'favourites' }" @click="fetchFavouritesForCompare">Yêu thích</button>
          </div>

          <div class="compare-modal-body">
            <!-- TAB GỢI Ý -->
            <div v-if="comparePopupTab === 'suggestions'">
              <div v-if="isLoadingCompareSuggestions" class="compare-suggestions-grid">
                <div v-for="i in 4" :key="i" class="suggestion-card">
                  <SoraSkeleton variant="image" width="100%" height="auto" radius="6px" class="mb-2" style="aspect-ratio: 1/1;" />
                  <div class="suggestion-info d-flex flex-column h-100">
                    <div class="mb-2">
                      <SoraSkeleton width="100%" height="13px" class="mb-1" radius="2px" />
                      <SoraSkeleton width="70%" height="13px" radius="2px" />
                    </div>
                    <SoraSkeleton width="60%" height="16px" class="mb-2" radius="2px" />
                    <SoraSkeleton width="100%" height="28px" class="mt-auto" radius="4px" />
                  </div>
                </div>
              </div>
              <div v-else-if="filteredSuggestions.length > 0" class="compare-suggestions-grid">
                <div v-for="item in filteredSuggestions" :key="item.id" class="suggestion-card">
                  <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" class="suggestion-img" @error="handleImageError">
                  <div class="suggestion-info">
                    <div class="suggestion-name" :title="item.name">{{ item.name }}</div>
                    <div class="suggestion-price">{{ formatMoney(item.promotional_price || item.base_price) }}</div>
                    <button class="btn-add-suggestion" :class="{ 'is-added': isInCompare(item.id) }" @click="toggleCompareItem(item)">
                      {{ isInCompare(item.id) ? 'Đã thêm' : 'Thêm' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-msg">Không tìm thấy sản phẩm gợi ý.</div>
            </div>

            <!-- TAB YÊU THÍCH -->
            <div v-if="comparePopupTab === 'favourites'">
              <div v-if="!isLoggedIn" class="not-logged-in-msg">Vui lòng đăng nhập để xem danh sách yêu thích.</div>
              <div v-else-if="isLoadingFavourites" class="compare-suggestions-grid">
                <div v-for="i in 4" :key="i" class="suggestion-card">
                  <SoraSkeleton variant="image" width="100%" height="auto" radius="6px" class="mb-2" style="aspect-ratio: 1/1;" />
                  <div class="suggestion-info d-flex flex-column h-100">
                    <div class="mb-2">
                      <SoraSkeleton width="100%" height="13px" class="mb-1" radius="2px" />
                      <SoraSkeleton width="70%" height="13px" radius="2px" />
                    </div>
                    <SoraSkeleton width="60%" height="16px" class="mb-2" radius="2px" />
                    <SoraSkeleton width="100%" height="28px" class="mt-auto" radius="4px" />
                  </div>
                </div>
              </div>
              <div v-else-if="filteredFavourites.length > 0" class="compare-suggestions-grid">
                <div v-for="item in filteredFavourites" :key="item.id" class="suggestion-card">
                  <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" class="suggestion-img" @error="handleImageError">
                  <div class="suggestion-info">
                    <div class="suggestion-name" :title="item.name">{{ item.name }}</div>
                    <div class="suggestion-price">{{ formatMoney(item.promotional_price || item.base_price) }}</div>
                    <button class="btn-add-suggestion" :class="{ 'is-added': isInCompare(item.id) }" @click="toggleCompareItem(item)">
                      {{ isInCompare(item.id) ? 'Đã thêm' : 'Thêm' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-msg">Danh sách yêu thích đang trống.</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import apiClient from '@/utils/apiClient';
import Toast from '@/utils/toastConfig';
import { globalModalState } from '@/stores/modalState';
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
import { getStorageUrl } from '@/utils/env';

const props = defineProps({
  shopSlug: { type: String, default: 'sora' }
});

const router = useRouter();

const compareList = ref([]);
const showComparePopup = ref(false);
const comparePopupTab = ref('suggestions');
const searchQuery = ref('');
const compareSuggestions = ref([]);
const isLoadingCompareSuggestions = ref(false);
const favouriteProducts = ref([]);
const isLoadingFavourites = ref(false);
let searchTimeout = null;

const isBottomBarMinimized = ref(false);

watch(() => globalModalState.compareTrigger, () => {
    if (globalModalState.compareProduct) {
        toggleCompareItem(globalModalState.compareProduct);
    }
});

const getImageUrl = (path) => {
    return getStorageUrl(path);
};

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };
const formatMoney = (amount) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' ₫' : '0 ₫';

const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val; 
  }
  return '';
};

const isLoggedIn = computed(() => !!getToken());

const loadCompareList = () => {
  try {
    const stored = localStorage.getItem(`compare_list_${props.shopSlug}`);
    if (stored) {
        compareList.value = JSON.parse(stored);
    }
  } catch (e) { compareList.value = []; }
};

watch(compareList, (newVal) => {
  localStorage.setItem(`compare_list_${props.shopSlug}`, JSON.stringify(newVal));
}, { deep: true });

onMounted(() => {
  loadCompareList();
});

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return compareSuggestions.value;
  const lowerQ = searchQuery.value.toLowerCase();
  return compareSuggestions.value.filter(p => p.name.toLowerCase().includes(lowerQ));
});

const filteredFavourites = computed(() => {
  if (!searchQuery.value) return favouriteProducts.value;
  const lowerQ = searchQuery.value.toLowerCase();
  return favouriteProducts.value.filter(p => p.name.toLowerCase().includes(lowerQ));
});

const fetchCompareSuggestions = async (query = '') => {
  isLoadingCompareSuggestions.value = true;
  try {
    const params = {
      per_page: query ? 20 : 10,
      sort: 'new'
    };
    if (query) params.search = query;

    const data = await apiClient.get(`/shop/${props.shopSlug}/products`, { params });
    if (data.data?.success && data.data?.data?.data) compareSuggestions.value = data.data.data.data;
  } catch (error) {} 
  finally { isLoadingCompareSuggestions.value = false; }
};

const handleSearchInput = () => {
  if (comparePopupTab.value === 'suggestions') {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { fetchCompareSuggestions(searchQuery.value); }, 500); 
  }
};

const isInCompare = (id) => compareList.value.some(item => item.id === id);

const toggleCompareItem = (prod) => {
  if (isInCompare(prod.id)) {
    removeFromCompare(prod.id);
  } else {
    if (compareList.value.length >= 4) return Toast.fire({ icon: 'warning', title: 'Chỉ được so sánh tối đa 4 sản phẩm' });
    const item = {
        id: prod.id,
        name: prod.name,
        image: prod.image || getImageUrl(prod.thumbnail_image)
    };
    compareList.value.push(item);
    Toast.fire({ icon: 'success', title: 'Đã thêm vào danh sách so sánh' });
  }
  // Mở lại Bottom Bar nếu đang bị thu nhỏ
  isBottomBarMinimized.value = false;
};

const removeFromCompare = (id) => {
  compareList.value = compareList.value.filter(item => item.id !== id);
};

const clearCompare = () => {
  compareList.value = [];
  isBottomBarMinimized.value = false; // Đặt lại trạng thái khi xóa sạch
};

const goToComparePage = () => {
  if (compareList.value.length < 2) return Toast.fire({ icon: 'info', title: 'Vui lòng chọn ít nhất 2 sản phẩm' });
  showComparePopup.value = false;
  router.push({ path: `/shop/${props.shopSlug}/compare`, query: { spGoc: compareList.value[0].id } });
};

const openComparePopup = async () => {
  showComparePopup.value = true; comparePopupTab.value = 'suggestions'; searchQuery.value = '';
  if (compareSuggestions.value.length === 0) await fetchCompareSuggestions();
};

const closeComparePopup = () => showComparePopup.value = false;

const fetchFavouritesForCompare = async () => {
  comparePopupTab.value = 'favourites';
  if(!isLoggedIn.value || favouriteProducts.value.length > 0) return;
  isLoadingFavourites.value = true;
  try {
    const result = await apiClient.get('/client/favourites');
    if (result.data?.status && result.data?.data) favouriteProducts.value = result.data.data.map(item => item.product).filter(p => p !== null);
  } catch (error) {} 
  finally { isLoadingFavourites.value = false; }
};
</script>

<style scoped>
/* KHU VỰC BOTTOM BAR MỚI ĐÃ ĐƯỢC CẢI TIẾN */
.compare-bottom-bar { 
  position: fixed; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  background: #fff; 
  box-shadow: 0 -4px 15px rgba(0,0,0,0.1); 
  padding: 15px 20px; 
  z-index: 9999; 
  border-top: 2px solid rgb(159,39,59); 
  pointer-events: auto; 
}

/* Nút bong bóng hiển thị khi Bottom bar bị thu gọn (Giao diện mới) */
.minimized-compare-btn {
  position: fixed;
  bottom: 24px;
  left: 24px; /* Chuyển sang trái để không đè nút Chat bên phải */
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9f273b, #7a1c2d);
  border: 2px solid #e7ce7d;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.24);
  z-index: 9999;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.minimized-compare-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.28);
}
.minimized-compare-btn i {
  font-size: 22px;
  color: #fff;
}

/* Badge số lượng trên nút tròn */
.compare-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #9f273b;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

/* Phần tiêu đề giống hình */
.compare-header-row {
  max-width: 1300px;
  margin: 0 auto 15px auto;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 13px;
  letter-spacing: 1px;
}
.compare-title {
  text-transform: uppercase;
}

/* Nút đóng UI mới: Giống button, có nền và bo viền */
.close-bar-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.2s ease;
}
.close-bar-btn:hover {
  background: #e5e5e5;
  color: #d32f2f;
  border-color: #d32f2f;
}

.compare-inner { 
  max-width: 1300px; 
  margin: 0 auto; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  gap: 24px; 
}

.compare-left { 
  display: flex; 
  align-items: center; 
}

/* Fix Product Slots Spacing */
.compare-items { 
  display: flex; 
  flex-direction: row;
  gap: 16px; /* gap-4 */
}

/* Bỏ overflow: hidden, thêm border-radius 8px */
.compare-item { 
  width: 86px; 
  height: 86px; 
  border: 1px solid #e5e5e5; 
  border-radius: 8px; /* Distinct rounded corners */
  position: relative; 
  background: #fff; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}

.compare-item-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  border-radius: 8px; /* Bo góc riêng cho hình ảnh */
}

.compare-item.empty { background: #fafafa; }
.compare-empty-btn { width: 100%; height: 100%; border: none; background: #f7f6f4; color: #b0b0b0; display: grid; place-items: center; font-size: 1.4rem; cursor: pointer; border-radius: 8px; transition: background 0.2s, color 0.2s; }
.compare-empty-btn:hover { background: #efebe7; color: #9f273b; }

/* Fix Red Delete Badge */
.remove-compare { 
  position: absolute; 
  top: -8px; 
  right: -8px; 
  background: #dc3545; /* Red Badge */
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 22px; 
  height: 22px; 
  font-size: 14px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
  z-index: 10;
}

/* Bố cục bên phải: Divider, Text và Nút ngang hàng */
.compare-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.compare-divider {
  width: 1px;
  height: 50px;
  background-color: #e5e5e5;
}

.compare-status-container {
  display: flex;
  flex-direction: column;
}
.compare-status {
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hint-text {
  color: #888;
}
.selected-count strong {
  color: #333;
}

/* Fix Action Buttons: Nằm ngang (row), w-auto */
.compare-actions { 
  display: flex; 
  flex-direction: row; 
  gap: 16px; 
  align-items: center; 
}

.editorial-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  background: var(--sora-primary, #9f273b);
  color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb, 231, 206, 125), 0.5);
  border-radius: 14px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.editorial-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.editorial-btn:hover {
  background: var(--sora-accent, #cc1e2e);
  color: #fff;
  border-color: var(--sora-secondary, #e7ce7d);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.editorial-btn:hover::after {
  transform: rotate(45deg) translateY(200%);
}

.btn-clear-compare { width: auto; background: #fff; color: #9f273b; border: 1px solid #9f273b; cursor: pointer; padding: 10px 24px; border-radius: 14px; font-weight: 600; transition: all 0.2s; white-space: nowrap; }
.btn-clear-compare:hover,
.editorial-btn.btn-clear-compare:hover {
  background: #f8f0ef;
  color: #9f273b;
  border-color: #9f273b;
  transform: none;
  box-shadow: none;
}

.btn-go-compare { width: auto; background: var(--sora-primary, #9f273b); color: #fff; border: 1px solid transparent; padding: 10px 24px; border-radius: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 16px rgba(159,39,59,0.16); white-space: nowrap; }
.btn-go-compare:disabled { background: #d1d1d1; color: #fff; cursor: not-allowed; box-shadow: none; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 768px) {
  .compare-inner { flex-direction: column; gap: 15px; align-items: stretch; }
  .compare-left { justify-content: center; }
  .compare-right { flex-direction: column; align-items: stretch; gap: 12px; }
  .compare-actions { width: 100%; display: flex; gap: 10px; justify-content: space-between; }
  .btn-clear-compare, .btn-go-compare { flex: 1; padding: 10px; text-align: center; }
  .hidden-mobile { display: none; }
}

/* KHU VỰC POPUP MODAL (Giữ nguyên) */
.compare-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9998; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); padding-bottom: 140px; }
.compare-modal { background: #fff; border-radius: 12px; width: 90%; max-width: 800px; max-height: 70vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.compare-modal-header { padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; }
.compare-modal-header h3 { font-size: 18px; margin: 0; color: #222; font-weight: 600; white-space: nowrap;}
.header-search-wrap { display: flex; align-items: center; gap: 15px; flex: 1; justify-content: flex-end; }
.modal-search-input { padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 13px; width: 100%; max-width: 250px; transition: border-color 0.3s, box-shadow 0.3s; }
.modal-search-input:focus { border-color: rgb(159,39,59); box-shadow: 0 0 5px rgba(159,39,59,0.2); }
.close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; color: #888; transition: color 0.2s;}
.close-btn:hover { color: rgb(159,39,59); }
.compare-modal-body { padding: 20px 25px; overflow-y: auto; flex: 1; }
.compare-suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
.suggestion-card { border: 1px solid #eee; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; min-height: 260px; }
.suggestion-card:hover { border-color: rgb(159,39,59); transform: translateY(-3px); }
.suggestion-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; background: #f9f9f9;}
.suggestion-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.suggestion-name { font-size: 13px; font-weight: 500; margin-bottom: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; color: #333; line-height: 1.4;}
.suggestion-price { font-size: 14px; font-weight: 600; color: rgb(159,39,59); margin: 8px 0 0 0; }
.btn-add-suggestion { background: transparent; border: 1px solid rgb(159,39,59); color: rgb(159,39,59); padding: 6px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; width: 100%; margin-top: 8px; }
.btn-add-suggestion:hover { background: rgb(159,39,59); color: #fff; }
.btn-add-suggestion.is-added { background: rgb(159,39,59); color: #fff; }
  
.compare-modal-tabs { display: flex; border-bottom: 1px solid #eee; background: #fafafa; }
.compare-modal-tabs button { flex: 1; padding: 12px 15px; background: transparent; border: none; font-size: 14px; font-weight: 600; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
.compare-modal-tabs button.active { color: #9f273b; border-bottom-color: #9f273b; background: #fff; }
.compare-modal-tabs button:hover:not(.active) { background: #f0f0f0; }
.not-logged-in-msg, .empty-msg { text-align: center; padding: 40px 20px; color: #888; font-style: italic; }
</style>