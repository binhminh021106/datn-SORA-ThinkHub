import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const SORA_ALERT_THEME = {
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  cancelButtonColor: '#6c757d',
  background: '#fffafa',
  color: '#9f273b',
};

export const createSoraAlert = (options = {}) => Swal.mixin({
  ...SORA_ALERT_THEME,
  ...options,
});

const soraAlert = createSoraAlert();

export default soraAlert;
