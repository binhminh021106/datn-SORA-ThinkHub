import { ref, onMounted, onUnmounted, watch, isRef } from 'vue';

/**
 * Composable đơn giản để animate số từ 0 đến giá trị target
 * @param {Number|Ref|Function} targetValue - Giá trị target (ví dụ: 90)
 * @param {Number} duration - Thời gian animation (ms), mặc định 2500ms
 * @param {Number} delay - Delay trước khi bắt đầu (ms), mặc định 0ms
 * @returns {Object} { displayValue }
 */
export function useCountAnimation(targetValue, duration = 2500, delay = 0) {
  const displayValue = ref(0);
  let animationId = null;
  let timeoutId = null;

  const getTarget = () => {
    if (typeof targetValue === 'function') return targetValue();
    if (isRef(targetValue)) return targetValue.value;
    return targetValue;
  };

  const startAnimation = () => {
    // Cancel previous
    if (animationId) cancelAnimationFrame(animationId);
    if (timeoutId) clearTimeout(timeoutId);

    const numValue = parseFloat(getTarget()) || 0;
    const startTime = Date.now();
    const startValue = displayValue.value; // animate from current value instead of 0

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      displayValue.value = Math.floor(startValue + (numValue - startValue) * progress);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        displayValue.value = numValue;
      }
    };

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        animationId = requestAnimationFrame(animate);
      }, delay);
    } else {
      animationId = requestAnimationFrame(animate);
    }
  };

  watch(
    () => getTarget(),
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        delay = 0; // No delay for updates
        startAnimation();
      }
    }
  );

  onMounted(() => {
    startAnimation();
  });

  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return {
    displayValue
  };
}

