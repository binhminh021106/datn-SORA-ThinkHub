import Swal from 'sweetalert2';

/**
 * Centralized Toast configuration for SORA ThinkHub
 * Ensures consistent styling across all toast notifications
 */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#fffafa',
  color: '#9f273b',
  iconColor: '#9f273b',
  didOpen: (toast) => {
    if (toast.parentElement) {
      toast.parentElement.style.zIndex = '10005';
    }
  }
});

export default Toast;
