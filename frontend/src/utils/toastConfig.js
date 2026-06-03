import Swal from 'sweetalert2';

const TOAST_HEADER_GAP = 12;

const getVisibleHeaderBottom = () => {
  const header = document.querySelector('.site-header');
  if (!header) return 0;

  const rect = header.getBoundingClientRect();
  const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

  return isVisible ? Math.max(0, rect.bottom) : 0;
};

const updateToastOffset = (toast) => {
  const container = toast.parentElement;
  if (!container) return;

  const headerBottom = getVisibleHeaderBottom();
  container.style.zIndex = '10005';
  container.style.marginTop = headerBottom > 0 ? `${Math.ceil(headerBottom + TOAST_HEADER_GAP)}px` : '';
};

/**
 * Centralized Toast configuration for SORA ThinkHub
 * Ensures consistent styling across all toast notifications
 */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  background: '#fffafa',
  color: '#9f273b',
  iconColor: '#9f273b',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
    const updateOffset = () => updateToastOffset(toast);
    toast.soraToastOffsetHandler = updateOffset;
    updateOffset();
    window.addEventListener('scroll', updateOffset, { passive: true });
    window.addEventListener('resize', updateOffset);
  },
  willClose: (toast) => {
    if (!toast.soraToastOffsetHandler) return;
    window.removeEventListener('scroll', toast.soraToastOffsetHandler);
    window.removeEventListener('resize', toast.soraToastOffsetHandler);
  }
});

export default Toast;
