# SORA ThinkHub

Ứng dụng gồm backend Laravel trong `backend` và frontend Vue 3/Vite trong `frontend`.

## Yêu cầu

- PHP 8.2 trở lên và Composer
- Node.js 20.19 trở lên (hoặc 22.12 trở lên) và npm
- SQLite (mặc định) hoặc MySQL

## Khởi tạo sau khi clone

Các file `.env` chứa cấu hình riêng trên máy và không được commit. Tạo chúng từ file mẫu ở thư mục gốc bằng PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Nếu dùng Git Bash/macOS/Linux, thay bằng:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend (`backend/.env`)

File mẫu đã cấu hình các địa chỉ local cơ bản:

```dotenv
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=sqlite
```

- `APP_KEY` để trống trong file mẫu; tạo khóa sau khi cài dependencies bằng `php artisan key:generate`.
- Mặc định ứng dụng dùng SQLite tại `backend/database/database.sqlite`. Chạy migration bên dưới để khởi tạo cơ sở dữ liệu.
- Nếu muốn dùng MySQL, tạo database trước, đổi `DB_CONNECTION=mysql` và bỏ dấu `#` ở các dòng `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` trong `backend/.env`; điền thông tin MySQL của máy bạn.

### Frontend (`frontend/.env`)

Các giá trị local được điền sẵn trong file mẫu:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STORAGE_URL=
VITE_FRONTEND_URL=http://localhost:5173
```

- `VITE_API_BASE_URL` là bắt buộc và phải trỏ tới API backend, bao gồm `/api`.
- Để `VITE_STORAGE_URL` trống để frontend tự dùng `http://127.0.0.1:8000/storage`; chỉ điền giá trị khác khi backend chạy ở địa chỉ riêng.
- `VITE_FRONTEND_URL` là địa chỉ frontend. Nếu đổi host/port frontend, cập nhật biến này và `FRONTEND_URL` trong `backend/.env` cho khớp.
- Các biến cho Mapbox, Reverb, thanh toán, AI và dịch vụ bên ngoài chỉ cần cấu hình khi sử dụng chức năng tương ứng. Không dùng khóa thật trong môi trường local chia sẻ và không commit các khóa này.

## Cài đặt và chạy

Tại thư mục `backend`:

```sh
composer install
php artisan key:generate
php artisan migrate --seed
```

Tại thư mục `frontend`:

```sh
npm install
npm run dev
```

Lệnh `npm run dev` của frontend khởi động Vite cùng các tiến trình backend được cấu hình trong package script; mặc định giao diện ở `http://localhost:5173` và Laravel API ở `http://127.0.0.1:8000`.

Sau khi chỉnh `.env`, khởi động lại các tiến trình đang chạy để ứng dụng nạp cấu hình mới.

## Cấu hình deploy

Trong repo có `backend/.env-deploy` và `frontend/.env-deploy` để tham khảo cấu hình deploy. Đây không phải file cấu hình được tự động nạp đầy đủ:

- Laravel đọc `backend/.env` hoặc các biến môi trường do máy chủ/CI cung cấp.
- Vite đọc `.env` và các file theo mode build; `frontend/.env-deploy` không tự động được nạp khi chạy `npm run build`. Riêng cấu hình Vite hiện có cơ chế đọc dự phòng `VITE_RECAPTCHA_SITE_KEY` từ file này.
- Nên khai báo giá trị production trong secret manager/Environment Variables của nền tảng deploy. Nếu cần tạo file `.env` trên máy chủ, tạo trực tiếp trên máy chủ, giới hạn quyền đọc và không đưa file hoặc nội dung bí mật vào Git/log.

### Những giá trị cần rà soát

Thay mọi địa chỉ local, giá trị mẫu hoặc giá trị của môi trường cũ bằng giá trị đúng của môi trường mới:

| Phía | Biến cần kiểm tra | Lưu ý |
| --- | --- | --- |
| Backend | `APP_ENV`, `APP_DEBUG`, `APP_URL`, `APP_KEY` | Dùng `production`, tắt debug. Tạo `APP_KEY` một lần cho ứng dụng mới, sau đó giữ nguyên giữa các lần deploy; không chia sẻ khóa giữa các ứng dụng/môi trường. |
| Backend | `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Dùng database production riêng, tài khoản ít quyền nhất cần thiết; không dùng database SQLite/local khi triển khai nhiều tiến trình hoặc nhiều máy chủ. |
| Backend | `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS` | Khai báo đúng origin frontend, không thêm dấu `/` cuối origin và không dùng wildcard nếu có gửi credential/cookie. |
| Backend | `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`, `PAYMENT_CALLBACK_BASE_URL` | Cookie chỉ dùng HTTPS ở production; callback thanh toán phải là URL HTTPS công khai của backend mà cổng thanh toán truy cập được. |
| Backend | `MAIL_*`, `GOOGLE_*`, `MOMO_*`, `VNPAY_*`, `AI_*`, `RECAPTCHA_SECRET_KEY` | Chỉ cấu hình dịch vụ thực sự sử dụng. Dùng credential/key của đúng môi trường (sandbox hoặc production); secret chỉ ở backend. |
| Backend/frontend | `BROADCAST_CONNECTION`, `REVERB_*` hoặc `PUSHER_*` | Chọn một nhà cung cấp realtime và đồng bộ cấu hình hai phía. Đặt origin cho phép chính xác, dùng TLS/HTTPS. |
| Frontend | `VITE_API_BASE_URL`, `VITE_BACKEND_URL`, `VITE_STORAGE_URL`, `VITE_FRONTEND_URL` | Điền origin HTTPS production; `VITE_API_BASE_URL` phải gồm `/api`. Nếu để trống `VITE_STORAGE_URL`, frontend suy ra từ URL backend. |
| Frontend | `VITE_RECAPTCHA_SITE_KEY`, `VITE_MAPBOX_TOKEN`, `VITE_REVERB_*`, `VITE_PUSHER_*` | Những giá trị có tiền tố `VITE_` sẽ được đóng gói vào mã frontend và người dùng có thể xem được. Chỉ đưa public key vào đây, tuyệt đối không đặt secret/private key. |

### Công cụ và các bước deploy cơ bản

Chuẩn bị domain và DNS, chứng chỉ HTTPS, máy chủ/hosting có PHP 8.2+ cùng extension Laravel yêu cầu, Composer, Node.js/npm để build frontend, database production và nơi lưu file bền vững. Nếu dùng queue, cache/rate limit trên nhiều tiến trình hoặc realtime, cần thêm Redis và worker/process manager; nếu gửi email hoặc thanh toán, cần cấu hình SMTP và tài khoản nhà cung cấp tương ứng. SSH, công cụ quản lý secrets của hosting/CI, giám sát log và sao lưu database cũng cần được thiết lập.

Ví dụ quy trình triển khai (chạy tại đúng thư mục của từng ứng dụng, sau khi đã đưa code và cấu hình production lên máy chủ):

1. Đặt backend secrets trong môi trường của máy chủ. Cài dependencies tại `backend`:

   ```sh
   composer install --no-dev --prefer-dist --optimize-autoloader
   php artisan optimize:clear
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   php artisan event:cache
   ```

   Chỉ chạy `storage:link` khi symlink chưa tồn tại. Lệnh migrate thay đổi schema database: sao lưu trước khi chạy và chạy một lần theo quy trình release.

2. Đặt các biến `VITE_*` production trong môi trường build hoặc file local không được commit tại `frontend`, sau đó build:

   ```sh
   npm ci
   npm run build
   ```

   Publish nội dung `frontend/dist` bằng static hosting/web server HTTPS. Mỗi lần đổi biến `VITE_*` cần build lại và deploy bundle mới. Không chạy `npm run dev` trên production.

3. Cấu hình web server trỏ backend tới `backend/public`, bật HTTPS, chỉ cho phép frontend origin cần thiết, và khởi động/restart queue worker, scheduler cùng tiến trình Reverb nếu sử dụng. Cấu hình scheduler của Laravel chạy `php artisan schedule:run` mỗi phút bằng scheduler của hệ điều hành/hosting.

### Lưu ý an toàn trước và sau deploy

- Không commit, gửi qua chat/email, ghi vào log hoặc đưa secret vào mã frontend. Kiểm tra `.env`, `.env-deploy`, file build và lịch sử Git trước khi chia sẻ repo; nếu lộ credential, thu hồi/rotate ngay.
- Không sao chép nguyên `.env-deploy` lên production mà chưa rà soát từng biến. Xác nhận domain, database, callback, CORS, cookie, storage, dịch vụ ngoài và môi trường sandbox/production; không dùng credential production trên máy local.
- Giữ `APP_DEBUG=false`, bật HTTPS, đặt `SESSION_SECURE_COOKIE=true`, giới hạn quyền truy cập file `.env` và dùng tài khoản dịch vụ/database với quyền tối thiểu.
- Sao lưu database và xác nhận có thể khôi phục trước migration hoặc thay đổi cấu hình quan trọng. Không chạy lệnh xóa/reset database trên dữ liệu production.
- Sau deploy, kiểm tra đăng nhập user/admin, API, tải ảnh/file, email, queue/scheduler, realtime và callback thanh toán; theo dõi log nhưng không ghi token, cookie, mật khẩu hoặc request nhạy cảm.
- Các lệnh cache có thể giữ lại giá trị cấu hình cũ nếu chạy trước khi nạp đúng biến production. Đặt cấu hình cuối cùng trước khi cache và restart các tiến trình dài hạn sau deploy.
