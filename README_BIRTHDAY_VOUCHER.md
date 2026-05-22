# Hệ Thống Tự Động Gửi Email Sinh Nhật Kèm Voucher

Hệ thống đã được tích hợp thành công vào dự án hiện tại với đầy đủ các thành phần: Migrations, Models, Mail, In-app Notification, Command xử lý logic và Admin Dashboard.

## 1. Cấu hình Email (SMTP)

Để hệ thống có thể gửi email, bạn cần cấu hình SMTP trong file `.env` của thư mục `backend`. Dưới đây là mẫu cấu hình sử dụng Gmail:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Lưu ý:**
- `MAIL_PASSWORD`: Không dùng mật khẩu đăng nhập Gmail thông thường. Bạn cần bật **Bảo mật 2 lớp (2FA)** cho tài khoản Google, sau đó tạo **Mật khẩu ứng dụng (App Password)** và dán vào đây.

## 2. Kiểm tra & Chạy thử Command

Lệnh Command đã được thiết lập để chạy tự động mỗi ngày lúc 07:00 sáng. Tuy nhiên, để kiểm tra thử (Test) ngay lập tức, bạn có thể chạy lệnh Artisan sau:

```bash
cd backend
php artisan emails:send-birthday
```

Lệnh sẽ quét các User có ngày sinh là hôm nay, có lịch sử đơn hàng, và chưa nhận email trong năm nay, sau đó tiến hành cấp Voucher và gửi Email.

Để tự động hóa hoàn toàn trên server Production, hãy đảm bảo bạn đã cấu hình Cronjob cho Laravel (gọi `php artisan schedule:run` mỗi phút).

## 3. Xem Giao Diện Quản Trị (Admin View)

- Truy cập đường dẫn: `http://[domain-cua-ban]/admin/birthday-vouchers` (ví dụ `http://localhost:8000/admin/birthday-vouchers` tuỳ thuộc vào host của bạn đang chạy).
- Giao diện cung cấp các thẻ thống kê trực quan (Tổng gửi, tổng voucher, số lượng gửi hôm nay) và Bảng danh sách trạng thái từng email kèm phân trang.
