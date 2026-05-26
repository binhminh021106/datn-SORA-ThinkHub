import Swal from 'sweetalert2';

/**
 * Centralized Toast configuration for SORA ThinkHub
 * Ensures consistent styling across all toast notifications
 */
const Toast = Swal.mixin({
  // cho nó cách top 1 khoảng để không đè lên header
  
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
    if (toast.parentElement) {
      toast.parentElement.style.zIndex = '10005';
      toast.parentElement.style.marginTop = '100px'; // Cách Header một khoảng
    }
  }
});

export default Toast;
