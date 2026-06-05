<template>
  <div class="vietnam-address-picker">
    <div class="row g-3">
      <div :class="columnClass">
        <label v-if="showLabels" class="form-label" :class="labelClass">
          {{ provinceLabel }} <span v-if="required" class="text-danger">*</span>
        </label>
        <div class="address-select" :class="{ 'is-open': openDropdown === 'province', 'is-invalid': invalidProvince }" @click.stop>
          <button type="button" class="address-select-toggle" :class="inputClass" @click="toggleDropdown('province')">
            <span :class="{ 'address-placeholder': !selectedProvinceName }">
              {{ selectedProvinceName || provincePlaceholder }}
            </span>
            <i class="bi bi-chevron-down"></i>
          </button>
          <div v-if="openDropdown === 'province'" class="address-select-menu">
            <div class="address-search-box">
              <i class="bi bi-search"></i>
              <input
                ref="provinceSearchInput"
                v-model="search.province"
                type="text"
                class="form-control"
                placeholder="Tìm tỉnh/thành..."
                @keydown.stop
              >
            </div>
            <div class="address-options">
              <button
                v-for="item in filteredProvinces"
                :key="item.id"
                type="button"
                class="address-option"
                :class="{ active: item.id === selectedProvince?.id }"
                @click="selectProvince(item)"
              >
                <span>{{ item.name }}</span>
                <i v-if="item.id === selectedProvince?.id" class="bi bi-check2"></i>
              </button>
              <div v-if="!filteredProvinces.length" class="address-empty">
                Không tìm thấy tỉnh/thành phù hợp
              </div>
            </div>
          </div>
        </div>
      </div>

      <div :class="columnClass">
        <label v-if="showLabels" class="form-label" :class="labelClass">
          {{ districtLabel }} <span v-if="required && hasDistrictLevel" class="text-danger">*</span>
        </label>
        <div class="address-select" :class="{ 'is-open': openDropdown === 'district', 'is-disabled': !canSelectDistrict, 'is-invalid': invalidDistrict }" @click.stop>
          <button
            type="button"
            class="address-select-toggle"
            :class="inputClass"
            :disabled="!canSelectDistrict"
            @click="toggleDropdown('district')"
          >
            <span :class="{ 'address-placeholder': !selectedDistrictName }">
              {{ districtDisplayText }}
            </span>
            <i class="bi bi-chevron-down"></i>
          </button>
          <div v-if="openDropdown === 'district'" class="address-select-menu">
            <div class="address-search-box">
              <i class="bi bi-search"></i>
              <input
                ref="districtSearchInput"
                v-model="search.district"
                type="text"
                class="form-control"
                placeholder="Tìm quận/huyện..."
                @keydown.stop
              >
            </div>
            <div class="address-options">
              <button
                v-for="item in filteredDistricts"
                :key="item.id"
                type="button"
                class="address-option"
                :class="{ active: item.id === selectedDistrict?.id }"
                @click="selectDistrict(item)"
              >
                <span>{{ item.name }}</span>
                <i v-if="item.id === selectedDistrict?.id" class="bi bi-check2"></i>
              </button>
              <div v-if="!filteredDistricts.length" class="address-empty">
                Không tìm thấy quận/huyện phù hợp
              </div>
            </div>
          </div>
        </div>
      </div>

      <div :class="columnClass">
        <label v-if="showLabels" class="form-label" :class="labelClass">
          {{ wardLabel }} <span v-if="required" class="text-danger">*</span>
        </label>
        <div class="address-select" :class="{ 'is-open': openDropdown === 'ward', 'is-disabled': !canSelectWard, 'is-invalid': invalidWard }" @click.stop>
          <button
            type="button"
            class="address-select-toggle"
            :class="inputClass"
            :disabled="!canSelectWard"
            @click="toggleDropdown('ward')"
          >
            <span :class="{ 'address-placeholder': !selectedWardName }">
              {{ selectedWardName || wardPlaceholder }}
            </span>
            <i class="bi bi-chevron-down"></i>
          </button>
          <div v-if="openDropdown === 'ward'" class="address-select-menu">
            <div class="address-search-box">
              <i class="bi bi-search"></i>
              <input
                ref="wardSearchInput"
                v-model="search.ward"
                type="text"
                class="form-control"
                placeholder="Tìm phường/xã..."
                @keydown.stop
              >
            </div>
            <div class="address-options">
              <button
                v-for="item in filteredWards"
                :key="item.id"
                type="button"
                class="address-option"
                :class="{ active: item.id === selectedWard?.id }"
                @click="selectWard(item)"
              >
                <span>{{ item.name }}</span>
                <i v-if="item.id === selectedWard?.id" class="bi bi-check2"></i>
              </button>
              <div v-if="!filteredWards.length" class="address-empty">
                Không tìm thấy phường/xã phù hợp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="loadError" class="address-load-error mb-0 mt-2">
      <i class="bi bi-exclamation-triangle me-1"></i>
      Không tải được dữ liệu tỉnh thành. Vui lòng thử lại sau.
    </p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

const NEW_API_BASE = 'https://esgoo.net/api-tinhthanh-new';
const LEGACY_API_BASE = 'https://esgoo.net/api-tinhthanh';

let provincesCache = null;
let provincesPromise = null;
const childrenCache = new Map();

const props = defineProps({
  province: { type: String, default: '' },
  district: { type: String, default: '' },
  ward: { type: String, default: '' },
  provinceCode: { type: [String, Number], default: '' },
  districtCode: { type: [String, Number], default: '' },
  wardCode: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  showLabels: { type: Boolean, default: true },
  columnClass: { type: String, default: 'col-md-4' },
  inputClass: { type: [String, Array, Object], default: '' },
  labelClass: { type: [String, Array, Object], default: '' },
  provinceLabel: { type: String, default: 'Tỉnh/Thành phố' },
  districtLabel: { type: String, default: 'Quận/Huyện' },
  wardLabel: { type: String, default: 'Phường/Xã' },
  provincePlaceholder: { type: String, default: 'Chọn Tỉnh/Thành' },
  districtPlaceholder: { type: String, default: 'Chọn Quận/Huyện' },
  wardPlaceholder: { type: String, default: 'Chọn Phường/Xã' },
  addressText: { type: String, default: '' },
  invalidProvince: { type: Boolean, default: false },
  invalidDistrict: { type: Boolean, default: false },
  invalidWard: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:province',
  'update:district',
  'update:ward',
  'update:provinceCode',
  'update:districtCode',
  'update:wardCode',
  'change',
]);

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);
const hasDistrictLevel = ref(false);
const loadError = ref(false);
const isSyncingExternal = ref(false);

const openDropdown = ref('');
const provinceSearchInput = ref(null);
const districtSearchInput = ref(null);
const wardSearchInput = ref(null);

const search = reactive({
  province: '',
  district: '',
  ward: '',
});

const selectedProvinceName = computed(() => selectedProvince.value?.name || props.province || '');
const selectedDistrictName = computed(() => selectedDistrict.value?.name || props.district || '');
const selectedWardName = computed(() => selectedWard.value?.name || props.ward || '');

const canSelectDistrict = computed(() => Boolean(selectedProvince.value && hasDistrictLevel.value && districts.value.length));
const canSelectWard = computed(() => Boolean(selectedProvince.value && (!hasDistrictLevel.value || selectedDistrict.value) && wards.value.length));
const districtDisplayText = computed(() => {
  if (!selectedProvince.value) return props.districtPlaceholder;
  if (!hasDistrictLevel.value) return 'Không áp dụng sau sáp nhập';
  return selectedDistrictName.value || props.districtPlaceholder;
});

const filteredProvinces = computed(() => filterBySearch(provinces.value, search.province));
const filteredDistricts = computed(() => filterBySearch(districts.value, search.district));
const filteredWards = computed(() => filterBySearch(wards.value, search.ward));

const normalizeText = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const stripAdministrativePrefix = (value) => {
  return normalizeText(value)
    .replace(/\b(tinh|thanh pho|tp|quan|huyen|thi xa|xa|phuong|thi tran)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const splitAddressText = (value) => {
  return String(value || '')
    .split(/[,|-]/)
    .map((part) => part.trim())
    .filter(Boolean);
};

const filterBySearch = (items, keyword) => {
  const q = normalizeText(keyword);
  if (!q) return items;
  return items.filter((item) => item.searchText.includes(q));
};

const getDisplayName = (item) => {
  return item?.full_name || item?.name || item?.Name || item?.ten || item?.title || '';
};

const getId = (item) => {
  return String(item?.id || item?.code || item?.Id || item?.ma || getDisplayName(item));
};

const normalizeItems = (items = [], source = '') => {
  return items
    .map((item) => {
      const name = getDisplayName(item);
      return {
        id: getId(item),
        code: getId(item),
        name,
        searchText: normalizeText(name),
        source,
        raw: item,
      };
    })
    .filter((item) => item.name);
};

const responseData = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${url}`);
  return response.json();
};

const loadProvinces = async () => {
  if (provincesCache) return provincesCache;
  if (!provincesPromise) {
    provincesPromise = (async () => {
      // Ưu tiên legacy API để province ID khớp với district API (legacy/2/{id}.htm)
      try {
        const legacyPayload = await fetchJson(`${LEGACY_API_BASE}/1/0.htm`);
        const legacyData = normalizeItems(responseData(legacyPayload), 'legacy');
        if (legacyData.length) {
          provincesCache = legacyData;
          return legacyData;
        }
      } catch (error) {
        // Fallback sang new API nếu legacy lỗi.
      }

      const payload = await fetchJson(`${NEW_API_BASE}/1/0.htm`);
      const data = normalizeItems(responseData(payload), 'new');
      provincesCache = data;
      return data;
    })();
  }

  return provincesPromise;
};

const extractEmbeddedChildren = (item) => {
  const raw = item?.raw || item || {};
  return responseData(raw.children)
    .concat(responseData(raw.childs))
    .concat(responseData(raw.districts))
    .concat(responseData(raw.wards))
    .concat(responseData(raw.xa_phuong))
    .concat(responseData(raw.phuong_xa));
};

const looksLikeDistrict = (item) => {
  const name = normalizeText(item.name);
  return /\b(quan|huyen|thi xa|tp|thanh pho)\b/.test(name);
};

const loadChildren = async (provinceItem) => {
  if (!provinceItem) return { kind: 'none', items: [] };
  const cacheKey = `province:${provinceItem.id}`;
  if (childrenCache.has(cacheKey)) return childrenCache.get(cacheKey);

  const embedded = normalizeItems(extractEmbeddedChildren(provinceItem), provinceItem.source);
  if (embedded.length) {
    const result = embedded.some(looksLikeDistrict)
      ? { kind: 'districts', items: embedded }
      : { kind: 'wards', items: embedded };
    childrenCache.set(cacheKey, result);
    return result;
  }

  // Luôn thử legacy API trước (có districts) để giữ hasDistrictLevel=true cho các tỉnh còn quận/huyện.
  // Nếu legacy trả về rỗng (tỉnh đã sáp nhập hoàn toàn), mới fall back sang new API (trả về wards trực tiếp).
  const attempts = [
    { url: `${LEGACY_API_BASE}/2/${provinceItem.id}.htm`, kind: 'districts', source: 'legacy' },
    { url: `${NEW_API_BASE}/2/${provinceItem.id}.htm`, kind: 'wards', source: 'new' },
  ];

  for (const attempt of attempts) {
    try {
      const payload = await fetchJson(attempt.url);
      const items = normalizeItems(responseData(payload), attempt.source);
      if (items.length) {
        const result = { kind: attempt.kind, items };
        childrenCache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      // Thử endpoint kế tiếp.
    }
  }

  const result = { kind: 'none', items: [] };
  childrenCache.set(cacheKey, result);
  return result;
};

const loadWardsForDistrict = async (districtItem) => {
  if (!districtItem) return [];
  const cacheKey = `district:${districtItem.id}`;
  if (childrenCache.has(cacheKey)) return childrenCache.get(cacheKey).items || [];

  const embedded = normalizeItems(extractEmbeddedChildren(districtItem), districtItem.source);
  if (embedded.length) {
    childrenCache.set(cacheKey, { kind: 'wards', items: embedded });
    return embedded;
  }

  try {
    const payload = await fetchJson(`${LEGACY_API_BASE}/3/${districtItem.id}.htm`);
    const items = normalizeItems(responseData(payload), 'legacy');
    childrenCache.set(cacheKey, { kind: 'wards', items });
    return items;
  } catch (error) {
    childrenCache.set(cacheKey, { kind: 'wards', items: [] });
    return [];
  }
};

const findOption = (items, name, code) => {
  const normalizedName = normalizeText(name);
  const normalizedCode = String(code || '');
  return items.find((item) => {
    return (normalizedCode && item.id === normalizedCode)
      || (normalizedName && (item.searchText === normalizedName || item.searchText.includes(normalizedName) || normalizedName.includes(item.searchText)));
  }) || null;
};

const scoreOptionAgainstText = (item, text) => {
  const itemText = item.searchText;
  const itemShortText = stripAdministrativePrefix(item.name);
  const candidateText = normalizeText(text);
  const candidateShortText = stripAdministrativePrefix(text);

  if (!candidateText) return 0;
  if (itemText === candidateText || itemShortText === candidateShortText) return 100;
  if (candidateText.includes(itemText) || candidateShortText.includes(itemShortText)) return 92;
  if (itemText.includes(candidateText) || itemShortText.includes(candidateShortText)) return 78;

  const itemTokens = itemShortText.split(' ').filter((token) => token.length > 1);
  const candidateTokens = candidateShortText.split(' ').filter((token) => token.length > 1);
  if (!itemTokens.length || !candidateTokens.length) return 0;

  const matchedTokens = itemTokens.filter((token) => candidateTokens.includes(token)).length;
  if (!matchedTokens) return 0;

  return Math.round((matchedTokens / itemTokens.length) * 70);
};

const findBestOption = (items, candidates = [], code = '') => {
  const byNameOrCode = candidates
    .map((candidate) => findOption(items, candidate, code))
    .find(Boolean);

  if (byNameOrCode) return byNameOrCode;

  let best = null;
  let bestScore = 0;

  items.forEach((item) => {
    candidates.forEach((candidate) => {
      const score = scoreOptionAgainstText(item, candidate);
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    });
  });

  return bestScore >= 60 ? best : null;
};

const getMergedWardAlias = (provinceName, wardName) => {
  const key = `${stripAdministrativePrefix(provinceName)}|${stripAdministrativePrefix(wardName)}`;
  const aliases = {
    'dak lak|cu kbang': 'Ea Rốk',
    'dak lak|cu k bang': 'Ea Rốk',
  };

  return aliases[key] || '';
};

const buildAddressCandidates = (...values) => {
  const candidates = [];

  values.forEach((value) => {
    if (!value) return;
    candidates.push(value);
    candidates.push(...splitAddressText(value));
  });

  return [...new Set(candidates.map((item) => String(item).trim()).filter(Boolean))];
};

const emitSelection = () => {
  emit('change', {
    province: selectedProvince.value,
    district: selectedDistrict.value,
    ward: selectedWard.value,
    hasDistrictLevel: hasDistrictLevel.value,
  });
};

const emitProvince = (item) => {
  emit('update:province', item?.name || '');
  emit('update:provinceCode', item?.id || '');
};

const emitDistrict = (item) => {
  emit('update:district', item?.name || '');
  emit('update:districtCode', item?.id || '');
};

const emitWard = (item) => {
  emit('update:ward', item?.name || '');
  emit('update:wardCode', item?.id || '');
};

const resetDistrictAndWard = () => {
  selectedDistrict.value = null;
  selectedWard.value = null;
  districts.value = [];
  wards.value = [];
  emitDistrict(null);
  emitWard(null);
};

const selectProvince = async (item, silent = false) => {
  selectedProvince.value = item;
  openDropdown.value = '';
  search.province = '';

  if (!silent) {
    emitProvince(item);
    resetDistrictAndWard();
  }

  loadError.value = false;
  const childResult = await loadChildren(item);
  hasDistrictLevel.value = childResult.kind === 'districts';

  if (childResult.kind === 'districts') {
    districts.value = childResult.items;
    wards.value = [];
  } else {
    districts.value = [];
    wards.value = childResult.items;
    if (!silent) emitDistrict(null);
  }

  if (!silent) emitSelection();
};

const selectDistrict = async (item, silent = false) => {
  selectedDistrict.value = item;
  openDropdown.value = '';
  search.district = '';

  if (!silent) {
    emitDistrict(item);
    selectedWard.value = null;
    emitWard(null);
  }

  wards.value = await loadWardsForDistrict(item);
  if (!silent) emitSelection();
};

const selectWard = (item, silent = false) => {
  selectedWard.value = item;
  openDropdown.value = '';
  search.ward = '';
  if (!silent) {
    emitWard(item);
    emitSelection();
  }
};

const resolveAddress = async ({ province = '', district = '', ward = '', addressText = '' } = {}) => {
  loadError.value = false;

  try {
    if (!provinces.value.length) {
      provinces.value = await loadProvinces();
    }

    const provinceCandidates = buildAddressCandidates(province, addressText);
    const provinceItem = findBestOption(provinces.value, provinceCandidates, props.provinceCode);
    if (!provinceItem) {
      return { resolved: false, province: null, district: null, ward: null, hasDistrictLevel: hasDistrictLevel.value };
    }

    await selectProvince(provinceItem, true);

    let districtItem = null;
    if (hasDistrictLevel.value && districts.value.length) {
      // Try matching district name directly first (without noisy addressText)
      if (district) {
        const directCandidates = buildAddressCandidates(district);
        districtItem = findBestOption(districts.value, directCandidates, props.districtCode);
      }
      // If direct match failed, try extracting district from addressText parts
      if (!districtItem && addressText) {
        const addressParts = splitAddressText(addressText);
        // Try each part individually to avoid matching noise
        for (const part of addressParts) {
          const candidate = findBestOption(districts.value, [part], '');
          if (candidate) {
            districtItem = candidate;
            break;
          }
        }
      }
      if (districtItem) {
        await selectDistrict(districtItem, true);
      }
    }

    const aliasWard = getMergedWardAlias(provinceItem.name, ward);
    const wardCandidates = buildAddressCandidates(aliasWard, ward, addressText);
    const wardItem = findBestOption(wards.value, wardCandidates, props.wardCode);

    if (wardItem) {
      selectWard(wardItem, true);
    } else {
      selectedWard.value = null;
    }

    emitProvince(provinceItem);
    emitDistrict(hasDistrictLevel.value ? districtItem : null);
    emitWard(wardItem);
    emitSelection();

    return {
      resolved: Boolean(provinceItem && wardItem),
      province: provinceItem,
      district: hasDistrictLevel.value ? districtItem : null,
      ward: wardItem,
      hasDistrictLevel: hasDistrictLevel.value,
    };
  } catch (error) {
    loadError.value = true;
    return { resolved: false, province: null, district: null, ward: null, hasDistrictLevel: hasDistrictLevel.value };
  }
};

const toggleDropdown = async (name) => {
  if (name === 'district' && !canSelectDistrict.value) return;
  if (name === 'ward' && !canSelectWard.value) return;
  openDropdown.value = openDropdown.value === name ? '' : name;

  await nextTick();
  if (openDropdown.value === 'province') provinceSearchInput.value?.focus();
  if (openDropdown.value === 'district') districtSearchInput.value?.focus();
  if (openDropdown.value === 'ward') wardSearchInput.value?.focus();
};

const closeDropdown = () => {
  openDropdown.value = '';
};

const syncFromProps = async () => {
  if (!provinces.value.length || isSyncingExternal.value) return;
  isSyncingExternal.value = true;

  try {
    if (!props.province && !props.provinceCode) {
      selectedProvince.value = null;
      selectedDistrict.value = null;
      selectedWard.value = null;
      districts.value = [];
      wards.value = [];
      hasDistrictLevel.value = false;
      return;
    }

    const provinceItem = findOption(provinces.value, props.province, props.provinceCode)
      || findBestOption(provinces.value, buildAddressCandidates(props.addressText), props.provinceCode);
    if (provinceItem && provinceItem.id !== selectedProvince.value?.id) {
      await selectProvince(provinceItem, true);
    }

    if (hasDistrictLevel.value) {
      const districtItem = findOption(districts.value, props.district, props.districtCode)
        || (props.district ? findBestOption(districts.value, buildAddressCandidates(props.district), props.districtCode) : null);
      if (districtItem && districtItem.id !== selectedDistrict.value?.id) {
        await selectDistrict(districtItem, true);
      }
    } else {
      selectedDistrict.value = null;
    }

    const aliasWard = selectedProvince.value ? getMergedWardAlias(selectedProvince.value.name, props.ward) : '';
    const wardItem = findOption(wards.value, props.ward, props.wardCode)
      || findBestOption(wards.value, buildAddressCandidates(aliasWard, props.addressText), props.wardCode);
    if (wardItem && wardItem.id !== selectedWard.value?.id) {
      selectWard(wardItem, true);
    }

    emitSelection();
  } finally {
    isSyncingExternal.value = false;
  }
};

watch(
  () => [props.province, props.district, props.ward, props.provinceCode, props.districtCode, props.wardCode, props.addressText],
  () => {
    syncFromProps();
  },
);

defineExpose({
  resolveAddress,
});

onMounted(async () => {
  document.addEventListener('click', closeDropdown);
  try {
    provinces.value = await loadProvinces();
    await syncFromProps();
  } catch (error) {
    loadError.value = true;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.vietnam-address-picker {
  position: relative;
}

.address-select {
  position: relative;
}

.address-select-toggle {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #212529;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.75rem;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.address-select-toggle:hover,
.address-select.is-open .address-select-toggle {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.12);
}

.address-select-toggle:disabled {
  color: #8a8f96;
  background: #f8f9fa;
  cursor: not-allowed;
}

.address-select.is-invalid .address-select-toggle {
  border-color: #dc3545;
}

.address-placeholder {
  color: #8a8f96;
}

.address-select-menu {
  position: absolute;
  top: calc(100% + 0.45rem);
  left: 0;
  right: 0;
  z-index: 1080;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(159, 39, 59, 0.18);
  border-radius: 1rem;
  box-shadow: 0 18px 45px rgba(33, 37, 41, 0.16);
}

.address-search-box {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f1e4e7;
}

.address-search-box i {
  color: #9f273b;
}

.address-search-box .form-control {
  min-height: 40px;
  border: 1px solid #f0dce1;
  border-radius: 999px;
  box-shadow: none;
}

.address-search-box .form-control:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.1);
}

.address-options {
  max-height: 260px;
  overflow-y: auto;
  padding: 0.35rem;
}

.address-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.72rem 0.85rem;
  color: #3d3d3d;
  background: transparent;
  border: 0;
  border-radius: 0.75rem;
  text-align: left;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.address-option:hover,
.address-option.active {
  color: #9f273b;
  background: #fff5f6;
}

.address-empty {
  padding: 1rem;
  color: #8a8f96;
  font-size: 0.9rem;
  text-align: center;
}

.address-load-error {
  color: #b42318;
  font-size: 0.875rem;
}
</style>
