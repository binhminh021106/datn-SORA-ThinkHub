<template>
  <div class="vietnam-address-picker">
    <div class="row g-3">
      <div :class="effectiveColumnClass">
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

      <div :class="effectiveColumnClass">
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

const ADDRESS_API_BASE = 'https://34tinhthanh.com/api';
const CENTRAL_CITY_CODES = new Set(['01', '31', '46', '48', '79', '92']);
const LEGACY_PROVINCE_CODE_BY_NAME = {
  'ha giang': '08',
  'yen bai': '15',
  'bac kan': '19',
  'vinh phuc': '25',
  'hoa binh': '25',
  'bac giang': '24',
  'thai binh': '33',
  'hai duong': '31',
  'ha nam': '37',
  'nam dinh': '37',
  'quang binh': '44',
  'quang nam': '48',
  'kon tum': '51',
  'binh dinh': '52',
  'ninh thuan': '56',
  'phu yen': '66',
  'dak nong': '68',
  'binh thuan': '68',
  'binh phuoc': '75',
  'ba ria vung tau': '79',
  'binh duong': '79',
  'long an': '80',
  'ben tre': '86',
  'tra vinh': '86',
  'tien giang': '82',
  'soc trang': '92',
  'hau giang': '92',
  'kien giang': '91',
  'bac lieu': '96',
};

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
const wards = ref([]);
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);
const hasDistrictLevel = ref(false);
const loadError = ref(false);
const isSyncingExternal = ref(false);

const openDropdown = ref('');
const provinceSearchInput = ref(null);
const wardSearchInput = ref(null);

const search = reactive({
  province: '',
  ward: '',
});

const effectiveColumnClass = computed(() => (
  props.columnClass === 'col-md-4' ? 'col-md-6' : props.columnClass
));
const selectedProvinceName = computed(() => selectedProvince.value?.name || props.province || '');
const selectedWardName = computed(() => selectedWard.value?.name || props.ward || '');

const canSelectWard = computed(() => Boolean(selectedProvince.value && (!hasDistrictLevel.value || selectedDistrict.value) && wards.value.length));

const filteredProvinces = computed(() => filterBySearch(provinces.value, search.province));
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
  return item?.full_name || item?.ward_name || item?.name || item?.Name || item?.ten || item?.title || '';
};

const getId = (item) => {
  return String(
    item?.id
    || item?.ward_code
    || item?.province_code
    || item?.code
    || item?.Id
    || item?.ma
    || getDisplayName(item),
  );
};

const getCode = (item) => {
  return String(
    item?.ward_code
    || item?.province_code
    || item?.code
    || item?.id
    || item?.Id
    || item?.ma
    || getDisplayName(item),
  );
};

const normalizeItems = (items = [], source = '') => {
  return items
    .map((item) => {
      const code = getCode(item);
      let name = getDisplayName(item).replace(/\s+/g, ' ').trim();
      if (source === 'province' && !/^(Tỉnh|Thành phố)\s/i.test(name)) {
        name = `${CENTRAL_CITY_CODES.has(code) ? 'Thành phố' : 'Tỉnh'} ${name}`;
      }
      const aliases = Array.isArray(item?.old_units) ? item.old_units : [];
      return {
        id: getId(item),
        code,
        name,
        searchText: normalizeText([name, ...aliases].join(' ')),
        aliases,
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
  const payload = await response.json();
  if (Number(payload?.error) === 1) {
    throw new Error(payload?.error_text || `Invalid address response: ${url}`);
  }
  return payload;
};

const loadProvinces = async () => {
  if (provincesCache) return provincesCache;
  if (!provincesPromise) {
    provincesPromise = (async () => {
      const payload = await fetchJson(`${ADDRESS_API_BASE}/provinces`);
      const data = normalizeItems(responseData(payload), 'province');
      if (data.length !== 34) {
        throw new Error(`Expected 34 provinces, received ${data.length}`);
      }
      provincesCache = data;
      return data;
    })().catch((error) => {
    provincesPromise = null;
     throw error;
   });
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

const loadChildren = async (provinceItem) => {
  if (!provinceItem) return { kind: 'none', items: [] };
  const cacheKey = `province:${provinceItem.code}`;
  if (childrenCache.has(cacheKey)) return childrenCache.get(cacheKey);

  const embedded = normalizeItems(extractEmbeddedChildren(provinceItem), provinceItem.source);
  if (embedded.length) {
    const result = { kind: 'wards', items: embedded };
    childrenCache.set(cacheKey, result);
    return result;
  }

  const payload = await fetchJson(
    `${ADDRESS_API_BASE}/wards?province_code=${encodeURIComponent(provinceItem.code)}`,
  );
  const items = normalizeItems(responseData(payload), 'ward');
  const result = { kind: 'wards', items };
  childrenCache.set(cacheKey, result);
  return result;
};

const findOption = (items, name, code) => {
  const normalizedName = normalizeText(name);
  const normalizedCode = String(code || '');
  return items.find((item) => {
    return (normalizedCode && (item.id === normalizedCode || item.code === normalizedCode))
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

const findProvinceOption = (items, provinceName = '', provinceCode = '', addressText = '') => {
  const directMatch = findOption(items, provinceName, provinceCode);
  if (directMatch) return directMatch;

  const candidates = buildAddressCandidates(provinceName, addressText);
  for (const candidate of candidates) {
    const legacyCode = LEGACY_PROVINCE_CODE_BY_NAME[stripAdministrativePrefix(candidate)];
    if (legacyCode) {
      const mergedProvince = items.find((item) => item.code === legacyCode);
      if (mergedProvince) return mergedProvince;
    }
  }

  return findBestOption(items, candidates, provinceCode);
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
  emit('update:provinceCode', item?.code || '');
};

const emitDistrict = (item) => {
  emit('update:district', item?.name || '');
  emit('update:districtCode', item?.code || '');
};

const emitWard = (item) => {
  emit('update:ward', item?.name || '');
  emit('update:wardCode', item?.code || '');
};

const resetDistrictAndWard = () => {
  selectedDistrict.value = null;
  selectedWard.value = null;
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
  hasDistrictLevel.value = false;
  wards.value = childResult.items;
  if (!silent) emitDistrict(null);

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

    const provinceItem = findProvinceOption(
      provinces.value,
      province,
      props.provinceCode,
      addressText,
    );
    if (!provinceItem) {
      return { resolved: false, province: null, district: null, ward: null, hasDistrictLevel: hasDistrictLevel.value };
    }

    await selectProvince(provinceItem, true);

    const aliasWard = getMergedWardAlias(provinceItem.name, ward);
    const wardCandidates = buildAddressCandidates(aliasWard, ward, district, addressText);
    const wardItem = findBestOption(wards.value, wardCandidates, props.wardCode);

    if (wardItem) {
      selectWard(wardItem, true);
    } else {
      selectedWard.value = null;
    }

    emitProvince(provinceItem);
    emitDistrict(null);
    emitWard(wardItem);
    emitSelection();

    return {
      resolved: Boolean(provinceItem && wardItem),
      province: provinceItem,
      district: null,
      ward: wardItem,
      hasDistrictLevel: hasDistrictLevel.value,
    };
  } catch {
    loadError.value = true;
    return { resolved: false, province: null, district: null, ward: null, hasDistrictLevel: hasDistrictLevel.value };
  }
};

const toggleDropdown = async (name) => {
  if (name === 'ward' && !canSelectWard.value) return;
  openDropdown.value = openDropdown.value === name ? '' : name;

  await nextTick();
  if (openDropdown.value === 'province') provinceSearchInput.value?.focus();
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
      wards.value = [];
      hasDistrictLevel.value = false;
      emitDistrict(null);
      return;
    }

    const provinceItem = findProvinceOption(
      provinces.value,
      props.province,
      props.provinceCode,
      props.addressText,
    );
    if (provinceItem && provinceItem.id !== selectedProvince.value?.id) {
      await selectProvince(provinceItem, true);
    }

    selectedDistrict.value = null;
    emitDistrict(null);

    const aliasWard = selectedProvince.value ? getMergedWardAlias(selectedProvince.value.name, props.ward) : '';
    const wardItem = findOption(wards.value, props.ward, props.wardCode)
      || findBestOption(wards.value, buildAddressCandidates(aliasWard, props.district, props.addressText), props.wardCode);
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
  } catch {
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
