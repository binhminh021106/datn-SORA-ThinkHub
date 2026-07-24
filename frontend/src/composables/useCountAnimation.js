import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable đơn giản để animate số từ 0 đến giá trị target
 * @param {Number} targetValue - Giá trị target (ví dụ: 90)
 * @param {Number} duration - Thời gian animation (ms), mặc định 2500ms
 * @param {Number} delay - Delay trước khi bắt đầu (ms), mặc định 0ms
 * @returns {Object} { displayValue }
 */
export function useCountAnimation(targetValue, duration = 2500, delay = 0) {
  const displayValue = ref(0);
  let animationId = null;
  let timeoutId = null;

  const startAnimation = () => {
    const numValue = parseFloat(targetValue) || 0;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      displayValue.value = Math.floor(numValue * progress);

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

