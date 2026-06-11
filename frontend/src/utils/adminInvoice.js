import axios from 'axios';
import Swal from 'sweetalert2';
import { BACKEND_URL } from '@/utils/env';

export const downloadAdminInvoice = async ({ orderId, orderCode, apiBaseUrl = BACKEND_URL, token = localStorage.getItem('admin_token') }) => {
  Swal.fire({
    title: 'Đang xuất hóa đơn...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const res = await axios.get(`${apiBaseUrl}/api/admin/orders/${orderId}/invoice`, {
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${token}`
      },
      responseType: 'blob'
    });

    const fileName = orderCode ? `Hoa_Don_${orderCode}.pdf` : `hoa-don-${orderId}.pdf`;
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    Swal.close();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi xuất hóa đơn',
      text: error.response?.data?.message || 'Không thể xuất hóa đơn lúc này.',
      confirmButtonColor: '#009981'
    });
  }
};
