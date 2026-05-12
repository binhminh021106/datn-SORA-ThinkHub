<template>
  <div>
    <!-- BOTTOM BAR: Danh sách đang so sánh -->
    <transition name="slide-up">
      <div v-if="compareList.length > 0" class="compare-bottom-bar">
        <div class="compare-inner">
          <div class="compare-info">
            <h4>So sánh sản phẩm ({{ compareList.length }}/4)</h4>
          </div>
          <div class="compare-items">
            <div v-for="n in 4" :key="n" class="compare-item" :class="{ empty: !compareList[n-1] }">
              <template v-if="compareList[n-1]">
                <img :src="compareList[n-1].image" :alt="compareList[n-1].name" @error="handleImageError">
                <button class="remove-compare" @click="removeFromCompare(compareList[n-1].id)">
                  <i class="bi bi-x"></i>
                </button>
              </template>
              <span v-else><i class="bi bi-plus text-muted"></i></span>
            </div>
          </div>
          <div class="compare-actions">
            <button class="btn-clear-compare" @click="clearCompare">Xóa tất cả</button>
            <button class="btn-go-compare" :disabled="compareList.length < 2" @click="goToComparePage">So sánh ngay</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- POPUP THÊM SẢN PHẨM SO SÁNH -->
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
              <div v-if="isLoadingCompareSuggestions" class="text-center py-4">
                <div class="spinner small-spinner mx-auto" style="margin: 0 auto;"></div>
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
              <div v-else-if="isLoadingFavourites" class="text-center py-4">
                <div class="spinner small-spinner mx-auto" style="margin: 0 auto;"></div>
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

          <div class="compare-modal-footer">
            <button class="btn-outline" @click="closeComparePopup">Đóng</button>
            <button class="btn-primary" :disabled="compareList.length < 2" @click="goToComparePage">Xem so sánh ({{ compareList.length }})</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineProps, defineEmits, defineExpose } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const props = defineProps({
  shopSlug: { type: String, default: 'sora' },
  baseProductId: { type: [Number, String], default: null }
});

const emit = defineEmits(['update-list']);
const router = useRouter();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const compareList = ref([]);
const showComparePopup = ref(false);
const comparePopupTab = ref('suggestions');
const searchQuery = ref('');
const compareSuggestions = ref([]);
const isLoadingCompareSuggestions = ref(false);
const favouriteProducts = ref([]);
const isLoadingFavourites = ref(false);
let searchTimeout = null;

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#fffafa',
  color: '#9f273b',
  iconColor: '#9f273b'
});

const getImageUrl = (path) => {
    if (!path) return '/Sora-placeholder.png';
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('storage/')) return `${BACKEND_URL}/${cleanPath}`;
    return `${BACKEND_URL}/storage/${cleanPath}`;
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
        emit('update-list', compareList.value);
    }
  } catch (e) { compareList.value = []; }
};

watch(compareList, (newVal) => {
  localStorage.setItem(`compare_list_${props.shopSlug}`, JSON.stringify(newVal));
  emit('update-list', newVal);
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
    let url = new URL(`${API_BASE_URL}/shop/${props.shopSlug}/products`);
    url.searchParams.append('per_page', query ? '20' : '10');
    url.searchParams.append('sort', 'new'); 
    if (props.baseProductId) url.searchParams.append('exclude_id', props.baseProductId);
    if (query) url.searchParams.append('search', query);

    const response = await fetch(url.toString());
    const result = await response.json();
    if (result.success && result.data?.data) compareSuggestions.value = result.data.data;
  } catch (error) { console.error("Lỗi tải sản phẩm gợi ý:", error); } 
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
  if (isInCompare(prod.id)) removeFromCompare(prod.id);
  else {
    if (compareList.value.length >= 4) return Toast.fire({ icon: 'warning', title: 'Chỉ được so sánh tối đa 4 sản phẩm' });
    const item = {
        id: prod.id,
        name: prod.name,
        image: prod.image || getImageUrl(prod.thumbnail_image)
    };
    compareList.value.push(item);
    Toast.fire({ icon: 'success', title: 'Đã thêm vào danh sách so sánh' });
    if (!showComparePopup.value) openComparePopup();
  }
};

const removeFromCompare = (id) => compareList.value = compareList.value.filter(item => item.id !== id);
const clearCompare = () => compareList.value = [];

const goToComparePage = () => {
  if (compareList.value.length < 2) return Toast.fire({ icon: 'info', title: 'Vui lòng chọn ít nhất 2 sản phẩm' });
  showComparePopup.value = false;
  const spGocId = props.baseProductId || compareList.value[0].id;
  router.push({ path: `/shop/${props.shopSlug}/compare`, query: { spGoc: spGocId } });
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/client/favourites`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const result = await response.json();
    if (result.status && result.data) favouriteProducts.value = result.data.map(item => item.product).filter(p => p !== null);
  } catch (error) { console.error("Lỗi lấy danh sách yêu thích:", error); } 
  finally { isLoadingFavourites.value = false; }
};

// Expose để cha (Index.vue) có thể gọi hàm toggle từ Component con
defineExpose({
    toggleCompare: toggleCompareItem,
    isInCompare
});
</script>

<style scoped>
/* CSS SO SÁNH BOTTOM BAR */
.compare-bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding: 15px 20px; z-index: 9999; border-top: 2px solid rgb(159,39,59); }
.compare-inner { max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 20px; }
.compare-info h4 { font-size: 15px; margin-bottom: 2px; color: #333; }
.compare-items { display: flex; gap: 15px; }
.compare-item { width: 60px; height: 60px; border: 1px solid #ddd; border-radius: 6px; position: relative; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
.compare-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.compare-item.empty span { font-size: 24px; color: #ccc; }
.remove-compare { position: absolute; top: -8px; right: -8px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.compare-actions { display: flex; gap: 15px; }
.btn-clear-compare { background: transparent; border: none; text-decoration: underline; color: #777; cursor: pointer; }
.btn-go-compare { background: rgb(159,39,59); color: #fff; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-go-compare:disabled { background: #ccc; cursor: not-allowed; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 60px) {
  .compare-inner { flex-direction: column; gap: 15px; }
  .compare-actions { width: 100%; justify-content: space-between; }
  .btn-go-compare { flex: 1; margin-left: 15px; }
}

/* CSS POPUP SO SÁNH */
.compare-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
.compare-modal { background: #fff; border-radius: 12px; width: 90%; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.compare-modal-header { padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; }
.compare-modal-header h3 { font-size: 18px; margin: 0; color: #222; font-weight: 600; white-space: nowrap;}
.header-search-wrap { display: flex; align-items: center; gap: 15px; flex: 1; justify-content: flex-end; }
.modal-search-input { padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 13px; width: 100%; max-width: 250px; transition: border-color 0.3s, box-shadow 0.3s; }
.modal-search-input:focus { border-color: rgb(159,39,59); box-shadow: 0 0 5px rgba(159,39,59,0.2); }
.close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; color: #888; transition: color 0.2s;}
.close-btn:hover { color: rgb(159,39,59); }
.compare-modal-body { padding: 20px 25px; overflow-y: auto; flex: 1; }
.compare-suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
.suggestion-card { border: 1px solid #eee; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; }
.suggestion-card:hover { border-color: rgb(159,39,59); transform: translateY(-3px); }
.suggestion-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; background: #f9f9f9;}
.suggestion-info { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; }
.suggestion-name { font-size: 13px; font-weight: 500; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #333; line-height: 1.4;}
.suggestion-price { font-size: 14px; font-weight: 600; color: rgb(159,39,59); margin-bottom: 10px; }
.btn-add-suggestion { background: transparent; border: 1px solid rgb(159,39,59); color: rgb(159,39,59); padding: 6px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; width: 100%; }
.btn-add-suggestion:hover { background: rgb(159,39,59); color: #fff; }
.btn-add-suggestion.is-added { background: rgb(159,39,59); color: #fff; }
.compare-modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 15px; background: #fdfdfd; border-radius: 0 0 12px 12px; }
.btn-outline { background: transparent; border: 1px solid #ccc; padding: 10px 20px; border-radius: 6px; cursor: pointer; color: #555; font-weight: 600; transition: background 0.2s; }
.btn-outline:hover { background: #eee; }
.btn-primary { background: rgb(159,39,59); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; color: #fff; font-weight: 600; transition: opacity 0.2s; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }
.compare-modal-tabs { display: flex; border-bottom: 1px solid #eee; background: #fafafa; }
.compare-modal-tabs button { flex: 1; padding: 12px 15px; background: transparent; border: none; font-size: 14px; font-weight: 600; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
.compare-modal-tabs button.active { color: #9f273b; border-bottom-color: #9f273b; background: #fff; }
.compare-modal-tabs button:hover:not(.active) { background: #f0f0f0; }
.not-logged-in-msg, .empty-msg { text-align: center; padding: 40px 20px; color: #888; font-style: italic; }
.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #9f273b; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>