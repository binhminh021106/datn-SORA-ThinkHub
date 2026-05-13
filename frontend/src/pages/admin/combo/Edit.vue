<template>
  <div class="combo-edit-wrapper pb-5 mb-5">
    <div class="container-fluid py-4" v-if="!isPageLoading">
      
      <!-- HEADER -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-8 d-flex align-items-center">
          <router-link :to="{ name: 'admin-combos' }" class="btn btn-light shadow-sm me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left fw-bold"></i>
          </router-link>
          <div class="d-flex flex-column">
            <h3 class="fw-bold text-dark mb-0">Cập nhật Combo</h3>
            <p class="text-muted small mb-0 mt-1">Chỉnh sửa thông tin, giá bán và cấu trúc sản phẩm của gói</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitCombo">
        <div class="row g-4">
          
          <!-- CỘT TRÁI -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-4 text-brand border-bottom pb-2"><i class="bi bi-info-circle-fill me-2"></i>Thông tin Gói</h6>
                
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label fw-bold">Tên Combo <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.name" @input="generateSlug" required>
                  </div>
                  
                  <div class="col-md-12">
                    <label class="form-label fw-bold text-muted small">Đường dẫn (Slug)</label>
                    <input type="text" class="form-control bg-light text-muted font-monospace" v-model="form.slug" readonly>
                  </div>

                  <div class="col-md-12">
                    <label class="form-label fw-bold text-muted small">Mô tả ngắn</label>
                    <textarea class="form-control" v-model="form.description" rows="3"></textarea>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold text-muted small">Phân loại đối tượng <span class="text-danger">*</span></label>
                    <select class="form-select fw-semibold" v-model="form.target_gender" required>
                      <option value="unisex">Dùng chung (Unisex)</option>
                      <option value="female">Nữ giới</option>
                      <option value="male">Nam giới</option>
                      <option value="couple">Cặp đôi (Couple)</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold text-muted small">Độ tuổi</label>
                    <input type="text" class="form-control" v-model="form.target_age_group">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold text-muted small">Chủ đề / Dịp</label>
                    <input type="text" class="form-control" v-model="form.theme">
                  </div>
                </div>
              </div>
            </div>

            <!-- BẢNG DANH SÁCH MÓN ĐỒ -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold text-brand mb-0"><i class="bi bi-box-seam-fill me-2"></i>Thành phần Gói Sản phẩm</h6>
                <button type="button" class="btn btn-sm btn-outline-brand fw-bold rounded-pill px-3" @click="addItemRow">
                  <i class="bi bi-plus-lg me-1"></i> Thêm món
                </button>
              </div>
              <div class="card-body p-0">
                <div class="alert alert-danger m-3 bg-opacity-10 border-danger text-dark small" v-if="comboItems.length < 2">
                  <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i> Combo cần có ít nhất 2 sản phẩm.
                </div>

                <div class="table-responsive" v-else>
                  <table class="table table-bordered align-middle mb-0">
                    <thead class="bg-light text-muted small text-center text-uppercase">
                      <tr>
                        <th style="width: 45%;">Sản phẩm</th>
                        <th style="width: 30%;">Biến thể (Size/Màu)</th>
                        <th style="width: 15%;">Số lượng</th>
                        <th style="width: 10%;">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in comboItems" :key="index">
                        <td class="p-2">
                          <select class="form-select form-select-sm fw-semibold" v-model="item.product_id" required @change="handleProductSelect(index, false)">
                            <option value="">-- Chọn sản phẩm --</option>
                            <option v-for="p in eligibleProducts" :key="p.id" :value="p.id" :disabled="isProductAlreadySelected(p.id, index)">
                              {{ p.name }} ({{ formatCurrency(p.base_price) }})
                            </option>
                          </select>
                        </td>
                        
                        <td class="p-2 text-center">
                          <div v-if="item.isLoadingVariants" class="spinner-border spinner-border-sm text-brand"></div>
                          <span v-else-if="!item.product_id" class="text-muted small fst-italic">---</span>
                          <select v-else class="form-select form-select-sm" v-model="item.product_variant_id">
                            <option :value="null" class="text-success fw-bold">[Khách hàng tự do chọn Size]</option>
                            <option v-for="v in item.available_variants" :key="v.id" :value="v.id">
                              SKU: {{ v.sku }} ({{ formatCurrency(v.price) }})
                            </option>
                          </select>
                        </td>
                        
                        <td class="p-2">
                          <input type="number" class="form-control form-control-sm text-center fw-bold" v-model.number="item.quantity" min="1" required>
                        </td>
                        <td class="p-2 text-center">
                          <button type="button" class="btn btn-sm text-danger border-0 bg-transparent hover-bg-danger" @click="removeItemRow(index)">
                            <i class="bi bi-trash-fill fs-6"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- CỘT PHẢI: QUẢN LÝ ITEMS & BẢNG TÍNH LỢI NHUẬN -->
          <div class="col-lg-4">
            
            <div class="card border-0 shadow-sm rounded-4 mb-4 text-center p-4">
              <h6 class="fw-bold mb-3 text-start"><i class="bi bi-image me-2"></i>Ảnh Đại Diện Combo <span class="text-danger">*</span></h6>
              <div class="mb-3 position-relative border rounded-4 overflow-hidden bg-white shadow-sm mx-auto" style="width: 100%; height: 200px;">
                <img v-if="thumbnailPreview" :src="thumbnailPreview" class="w-100 h-100 object-fit-cover">
                <div v-else class="d-flex flex-column justify-content-center align-items-center h-100 text-muted bg-light">
                  <i class="bi bi-images fs-1 mb-2 opacity-50"></i>
                </div>
              </div>
              <input type="file" class="d-none" id="comboUpload" accept="image/*" @change="handleThumbnailUpload">
              <label for="comboUpload" class="btn btn-outline-brand rounded-pill w-100 fw-semibold cursor-pointer">
                <i class="bi bi-upload me-1"></i> {{ thumbnailFile ? 'Đổi ảnh khác' : 'Tải ảnh mới lên' }}
              </label>
            </div>

            <!-- SMART CALCULATOR BOX -->
            <div class="card border-brand border-2 shadow-sm rounded-4 mb-4">
              <div class="card-header bg-brand text-white border-0 py-3 rounded-top-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-calculator-fill me-2"></i>Bảng tính Lợi nhuận</h6>
              </div>
              <div class="card-body p-4 bg-light">
                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Hình thức giảm giá</label>
                  <select class="form-select bg-white fw-semibold" v-model="form.discount_type">
                    <option value="percentage">Giảm theo Phần trăm (%)</option>
                    <option value="fixed_amount">Trừ thẳng tiền (VNĐ)</option>
                  </select>
                </div>
                
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark small">Mức giảm</label>
                  <div class="input-group shadow-sm">
                    <input type="number" class="form-control fw-bold text-danger fs-5 text-end" v-model.number="form.discount_value" min="0" required>
                    <span class="input-group-text bg-white fw-bold">{{ form.discount_type === 'percentage' ? '%' : 'VNĐ' }}</span>
                  </div>
                </div>

                <hr class="opacity-25 border-secondary my-4">

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted fw-semibold">Tổng giá gốc (Ước tính):</span>
                  <span class="fw-bold text-secondary text-decoration-line-through">{{ formatCurrency(originalTotal) }}</span>
                </div>
                <div class="d-flex justify-content-between p-3 mt-3 bg-white border border-brand rounded-3 shadow-sm">
                  <span class="fw-bold text-dark">KHÁCH MUA GIÁ:</span>
                  <span class="fw-bold fs-5 text-brand">{{ formatCurrency(finalEstimatedPrice) }}</span>
                </div>
                <div class="text-center mt-3">
                  <div class="badge bg-success px-3 py-2 rounded-pill w-100 shadow-sm">
                    <i class="bi bi-piggy-bank-fill me-1"></i> Khách tiết kiệm: {{ savingsPercentage }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- OPTIONS KÈM THÊM LỊCH FLATPICKR XỊN XÒ -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-gear me-2"></i>Cài đặt Khác</h6>
                
                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Giới hạn số lần bán (Tùy chọn)</label>
                  <input type="number" class="form-control form-control-sm" v-model.number="form.usage_limit" min="1" placeholder="Để trống nếu không giới hạn">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Bắt đầu bán từ</label>
                  <div class="input-group shadow-sm">
                    <span class="input-group-text bg-white text-brand border-end-0"><i class="bi bi-calendar-event"></i></span>
                    <input type="datetime-local" id="start_date" class="form-control fw-semibold border-start-0 ps-0 bg-white cursor-pointer" v-model="form.start_date">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-dark small">Kết thúc vào</label>
                  <div class="input-group shadow-sm">
                    <span class="input-group-text bg-white text-danger border-end-0"><i class="bi bi-calendar-x"></i></span>
                    <input type="datetime-local" id="end_date" class="form-control fw-semibold border-start-0 ps-0 bg-white cursor-pointer" v-model="form.end_date">
                  </div>
                </div>
                <hr class="opacity-25 border-secondary my-3">

                <div class="form-check form-switch mb-3">
                  <input class="form-check-input cursor-pointer border-secondary" type="checkbox" id="stackable" v-model="form.is_discount_stackable">
                  <label class="form-check-label fw-semibold cursor-pointer text-dark" for="stackable">Cho phép áp Voucher ngoài</label>
                </div>

                <div class="mb-2">
                  <label class="form-label fw-bold text-dark small">Trạng thái hiển thị</label>
                  <select class="form-select" v-model="form.isActive">
                    <option :value="true">Đang hoạt động (Active)</option>
                    <option :value="false">Lưu nháp / Ẩn (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="border-top pt-4 text-end mt-2">
          <router-link :to="{ name: 'admin-combos' }" class="btn btn-light px-4 me-2 border fw-semibold">Hủy bỏ</router-link>
          <button type="submit" class="btn btn-brand px-5 py-2 fw-bold text-white shadow-sm rounded-pill" :disabled="isSaving || comboItems.length < 2">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> 
            LƯU THAY ĐỔI COMBO
          </button>
        </div>
      </form>
    </div>

    <!-- MÀN HÌNH CHỜ -->
    <div v-else class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
      <h1 class="logo-shimmer mb-3">ThinkHub</h1>
      <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">Đang tải dữ liệu Combo...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();
const comboId = route.params.id;

const isPageLoading = ref(true);
const isSaving = ref(false);

const allProducts = ref([]);
const thumbnailFile = ref(null);
const thumbnailPreview = ref(null);

const form = ref({
  name: '', slug: '', description: '',
  target_gender: 'unisex', target_age_group: '', theme: '',
  discount_type: 'percentage', discount_value: 0, is_discount_stackable: false,
  usage_limit: null, start_date: '', end_date: '',
  isActive: true
});

const comboItems = ref([]);

const getHeaders = () => ({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` });

const eligibleProducts = computed(() => {
    return allProducts.value.filter(p => p.deleted_at === null && p.status === 'published' && p.variants_count > 0);
});

const isProductAlreadySelected = (productId, currentIndex) => {
    return comboItems.value.some((item, index) => item.product_id === productId && index !== currentIndex);
};

const originalTotal = computed(() => {
  let total = 0;
  comboItems.value.forEach(item => {
    if (item.product_id) {
      if (item.product_variant_id && item.available_variants.length > 0) {
        const variant = item.available_variants.find(v => v.id === item.product_variant_id);
        if (variant) { total += parseFloat(variant.price) * item.quantity; return; }
      }
      const product = eligibleProducts.value.find(p => p.id === item.product_id);
      if (product) total += parseFloat(product.base_price) * item.quantity;
    }
  });
  return total;
});

const finalEstimatedPrice = computed(() => {
  let final = originalTotal.value;
  let discountVal = parseFloat(form.value.discount_value) || 0;
  if (form.value.discount_type === 'percentage') {
    if (discountVal > 100) discountVal = 100;
    final = final - (final * (discountVal / 100));
  } else {
    final = final - discountVal;
    if (final < 0) final = 0;
  }
  return final;
});

const savingsPercentage = computed(() => {
  if (originalTotal.value === 0) return 0;
  const savings = originalTotal.value - finalEstimatedPrice.value;
  return Math.round((savings / originalTotal.value) * 100);
});

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);

const generateSlug = () => {
  let s = form.value.name.toLowerCase();
  s = s.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a').replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e').replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i').replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o').replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u').replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y').replace(/đ/gi, 'd');
  form.value.slug = s.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-\-+/g, '-');
};

const handleThumbnailUpload = (e) => {
  const f = e.target.files[0];
  if(f) { 
      if(f.size > 15 * 1024 * 1024) { Swal.fire('Lỗi', 'Ảnh tối đa 15MB', 'error'); return; }
      thumbnailFile.value = f; 
      thumbnailPreview.value = URL.createObjectURL(f); 
  }
};

const addItemRow = () => comboItems.value.push({ product_id: '', product_variant_id: null, quantity: 1, available_variants: [], isLoadingVariants: false });
const removeItemRow = (index) => { if (comboItems.value.length <= 2) Swal.fire('Chú ý', 'Combo phải chứa ít nhất 2 sản phẩm!', 'warning'); else comboItems.value.splice(index, 1); };

const handleProductSelect = async (index, isInit = false) => {
  const item = comboItems.value[index];
  if (!isInit) item.product_variant_id = null; 
  item.available_variants = [];
  
  if (!item.product_id) return;
  item.isLoadingVariants = true;
  try {
    const res = await axios.get(`${API_URL}/admin/products/${item.product_id}`, { headers: getHeaders() });
    if (res.data.success && res.data.data.variants) {
       item.available_variants = res.data.data.variants;
    }
  } catch (error) { console.error('Lỗi lấy biến thể', error); } 
  finally { item.isLoadingVariants = false; }
};

const loadFlatpickr = () => {
  if (!document.querySelector('#fp-css')) {
    const link = document.createElement('link');
    link.id = 'fp-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
    document.head.appendChild(link);
  }

  if (!window.flatpickr) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
    script.onload = initPickers;
    document.head.appendChild(script);
  } else {
    initPickers();
  }
};

const initPickers = () => {
  const config = {
    enableTime: true,
    time_24hr: true,
    dateFormat: "Y-m-d H:i",
    disableMobile: true,
  };

  try {
    window.flatpickr("#start_date", { ...config, onChange: (dates, str) => form.value.start_date = str });
    window.flatpickr("#end_date", { ...config, onChange: (dates, str) => form.value.end_date = str });
  } catch (e) {
    console.warn("Flatpickr failed to init, fallback to native datetime-local");
  }
};

const formatFromDBDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
};

const formatToDBDate = (str) => {
    if (!str) return '';
    let cleanStr = str.split('.')[0].replace('Z', '').replace('T', ' ');
    if (cleanStr.length === 16) cleanStr += ':00';
    return cleanStr;
};

const fetchInitialData = async () => {
  try {
    const [resProducts, resCombo] = await Promise.all([
        axios.get(`${API_URL}/admin/products`, { headers: getHeaders() }),
        axios.get(`${API_URL}/admin/combos/${comboId}`, { headers: getHeaders() })
    ]);
    
    const pData = resProducts.data.data;
    allProducts.value = Array.isArray(pData.data) ? pData.data : pData;

    const c = resCombo.data.data;
    form.value = {
        name: c.name, slug: c.slug, description: c.description || '',
        target_gender: c.target_gender, target_age_group: c.target_age_group || '', theme: c.theme || '',
        discount_type: c.discount_type, discount_value: parseFloat(c.discount_value), is_discount_stackable: !!c.is_discount_stackable,
        usage_limit: c.usage_limit || null,
        
        start_date: formatFromDBDate(c.start_date),
        end_date: formatFromDBDate(c.end_date),
        
        isActive: c.status === 'active'
    };
    thumbnailPreview.value = c.thumbnail_image ? `${API_URL}/storage/${c.thumbnail_image}` : null;

    comboItems.value = c.items.map(i => ({
        product_id: i.product_id,
        product_variant_id: i.product_variant_id,
        quantity: i.quantity,
        available_variants: [],
        isLoadingVariants: false
    }));

    for (let i = 0; i < comboItems.value.length; i++) {
        await handleProductSelect(i, true);
    }

  } catch (error) {
    Swal.fire('Lỗi', 'Không thể tải dữ liệu Combo', 'error').then(() => router.push({ name: 'admin-combos' }));
  } finally {
    isPageLoading.value = false;
    setTimeout(() => loadFlatpickr(), 500); 
  }
};

const submitCombo = async () => {
  const hasEmptyProduct = comboItems.value.some(item => item.product_id === '');
  if (hasEmptyProduct) { Swal.fire('Lỗi', 'Vui lòng chọn Sản phẩm cho tất cả các dòng.', 'error'); return; }
  if (form.value.discount_type === 'percentage' && form.value.discount_value > 100) { Swal.fire('Lỗi', 'Giảm giá tối đa 100%', 'error'); return; }

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT'); 
    
    formData.append('name', form.value.name);
    formData.append('slug', form.value.slug);
    if(form.value.description) formData.append('description', form.value.description);
    formData.append('target_gender', form.value.target_gender);
    if(form.value.target_age_group) formData.append('target_age_group', form.value.target_age_group);
    if(form.value.theme) formData.append('theme', form.value.theme);
    formData.append('discount_type', form.value.discount_type);
    formData.append('discount_value', form.value.discount_value);
    formData.append('is_discount_stackable', form.value.is_discount_stackable ? 1 : 0);
    
    if (form.value.usage_limit) formData.append('usage_limit', form.value.usage_limit);
    
    if (form.value.start_date) formData.append('start_date', formatToDBDate(form.value.start_date));
    if (form.value.end_date) formData.append('end_date', formatToDBDate(form.value.end_date));

    formData.append('status', form.value.isActive ? 'active' : 'hidden');
    
    if (thumbnailFile.value) formData.append('thumbnail_image', thumbnailFile.value);
    
    const cleanItems = comboItems.value.map(i => ({
        product_id: i.product_id,
        product_variant_id: i.product_variant_id,
        quantity: i.quantity
    }));
    formData.append('items_data', JSON.stringify(cleanItems));

    await axios.post(`${API_URL}/admin/combos/${comboId}`, formData, { headers: getHeaders() });
    
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 }).then(() => {
        router.push({ name: 'admin-combos' });
    });
  } catch (error) {
    const errorMsg = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join('\n') : 'Lỗi Server';
    Swal.fire('Lỗi Cập nhật', errorMsg, 'error');
  } finally { isSaving.value = false; }
};

onMounted(() => fetchInitialData());
</script>

<style scoped>
.bg-brand { background-color: #009981 !important; }
.text-brand { color: #009981 !important; }
.border-brand { border-color: #009981 !important; }

.btn-brand { background-color: #009981; border: none; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; color: white; }
.btn-outline-brand { color: #009981; border-color: #009981; transition: 0.2s; background: transparent; }
.btn-outline-brand:hover { background-color: #009981; color: white; }

.form-control:focus, .form-select:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
.cursor-pointer { cursor: pointer; }
.hover-bg-danger:hover { color: #dc3545 !important; background-color: #fff5f5; border-radius: 4px; }

/* GHI ĐÈ MÀU XANH CHO LỊCH FLATPICKR ĐỂ ĐỒNG BỘ THEME THINKHUB */
:deep(.flatpickr-calendar) { box-shadow: 0 15px 30px rgba(0,0,0,0.1); border: none; border-radius: 12px; font-family: inherit; }
:deep(.flatpickr-day.selected),
:deep(.flatpickr-day.startRange),
:deep(.flatpickr-day.endRange),
:deep(.flatpickr-day.selected:focus),
:deep(.flatpickr-day.selected:hover) { background: #009981 !important; border-color: #009981 !important; }
:deep(.flatpickr-time input:hover),
:deep(.flatpickr-time input:focus) { background: #e6f5f2; }

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
@keyframes shine { to { background-position: 200% center; } }
</style>