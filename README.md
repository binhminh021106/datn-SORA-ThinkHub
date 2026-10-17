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
