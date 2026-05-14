import { ref, computed } from 'vue';

const getStock = (variant) => {
  if (!variant) return 0;
  return variant.stock_quantity ?? variant.stock ?? 0;
};

export const useProductVariants = (productRef) => {
  const selectedAttributes = ref({});
  const selectedQuantity = ref(1);

  /**
   * Tìm các variant khả dụng dựa trên các attribute đã chọn hiện tại
   * Dùng để enable/disable các option của attribute khác
   */
  const getAvailableVariants = () => {
    if (!productRef.value?.variants) return [];
    return productRef.value.variants.filter(v => {
      const variantAttrs = v.formatted_attributes || v.attributes || {};
      for (const [attrName, selectedOptionId] of Object.entries(selectedAttributes.value)) {
        if (String(variantAttrs[attrName]) !== String(selectedOptionId)) {
          return false;
        }
      }
      return true;
    });
  };

  /**
   * Kiểm tra một option của attribute có khả dụng không
   * Dùng để disable button nếu không có variant nào khớp
   */
  const isOptionAvailable = (attrName, optionId) => {
    if (!productRef.value?.variants) return true;
    
    const tempSelection = { ...selectedAttributes.value, [attrName]: optionId };
    
    return productRef.value.variants.some(v => {
      const variantAttrs = v.formatted_attributes || v.attributes || {};
      for (const [name, id] of Object.entries(tempSelection)) {
        if (String(variantAttrs[name]) !== String(id)) {
          return false;
        }
      }
      return true;
    });
  };

  const isAllAttributesSelected = computed(() => {
    if (!productRef.value?.attributes) return false;
    const requiredAttrs = Object.keys(productRef.value.attributes);
    if (requiredAttrs.length === 0) return true;
    return requiredAttrs.every(attr => selectedAttributes.value[attr] !== undefined);
  });

  const currentVariant = computed(() => {
    if (!productRef.value?.variants || !isAllAttributesSelected.value) return null;
    return getAvailableVariants()[0];
  });

  const currentStock = computed(() => {
    if (!isAllAttributesSelected.value || !currentVariant.value) return null;
    return getStock(currentVariant.value);
  });

  const stockProgressWidth = computed(() => {
    const stock = currentStock.value;
    if (!stock) return 0;
    const percent = (stock / 15) * 100;
    return percent > 100 ? 100 : percent;
  });

  const selectAttribute = (attrName, optionId) => {
    if (selectedAttributes.value[attrName] === optionId) {
      delete selectedAttributes.value[attrName];
    } else {
      selectedAttributes.value[attrName] = optionId;
    }
    selectedQuantity.value = 1;
  };

  const updateQuantity = (delta, Toast) => {
    if (!isAllAttributesSelected.value || !currentVariant.value) {
      return Toast.fire({ icon: 'info', title: 'Vui lòng chọn phân loại' });
    }
    let newQty = selectedQuantity.value + delta;
    const stock = currentStock.value;
    if (newQty < 1) newQty = 1;
    if (newQty > stock) {
      Toast.fire({ icon: 'warning', title: 'Đã quá số lượng trong kho' });
      newQty = stock;
    }
    selectedQuantity.value = newQty;
  };

  const validateQuantity = (Toast) => {
    if (!isAllAttributesSelected.value || !currentVariant.value) {
      Toast.fire({ icon: 'info', title: 'Vui lòng chọn phân loại' });
      return selectedQuantity.value = 1;
    }
    let qty = parseInt(selectedQuantity.value);
    const stock = currentStock.value;
    if (isNaN(qty) || qty < 1) return selectedQuantity.value = 1;
    if (qty > stock) {
      Toast.fire({ icon: 'warning', title: 'Đã quá số lượng trong kho' });
      selectedQuantity.value = stock;
    }
  };

  return {
    selectedAttributes,
    selectedQuantity,
    isAllAttributesSelected,
    currentVariant,
    currentStock,
    stockProgressWidth,
    selectAttribute,
    updateQuantity,
    validateQuantity,
    getAvailableVariants,
    isOptionAvailable,
    getStock
  };
};
