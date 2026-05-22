<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý Gửi Mã Giảm Giá Sinh Nhật</title>
    <!-- Thêm Bootstrap hoặc CSS cơ bản -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8f9fa; }
        .stat-card { border-radius: 10px; padding: 20px; color: white; margin-bottom: 20px; }
        .bg-primary-custom { background: linear-gradient(45deg, #4e73df, #224abe); }
        .bg-success-custom { background: linear-gradient(45deg, #1cc88a, #13855c); }
        .bg-info-custom { background: linear-gradient(45deg, #36b9cc, #258391); }
        .table-container { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15); }
    </style>
</head>
<body>

<div class="container mt-5">
    <h2 class="mb-4">🎂 Lịch Sử Gửi Voucher Sinh Nhật</h2>

    <!-- Các thẻ thống kê -->
    <div class="row">
        <div class="col-md-4">
            <div class="stat-card bg-primary-custom shadow">
                <h5>Tổng mail đã gửi</h5>
                <h2>{{ number_format($totalSent) }}</h2>
            </div>
        </div>
        <div class="col-md-4">
            <div class="stat-card bg-success-custom shadow">
                <h5>Số voucher đã cấp</h5>
                <h2>{{ number_format($totalVouchers) }}</h2>
            </div>
        </div>
        <div class="col-md-4">
            <div class="stat-card bg-info-custom shadow">
                <h5>Số gửi hôm nay</h5>
                <h2>{{ number_format($sentToday) }}</h2>
            </div>
        </div>
    </div>

    <!-- Bảng danh sách lịch sử -->
    <div class="table-container mt-4">
        <h5 class="mb-3">Danh sách chi tiết</h5>
        <div class="table-responsive">
            <table class="table table-hover table-bordered align-middle">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Email</th>
                        <th>Mã Voucher</th>
                        <th>Thời gian gửi</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú lỗi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($logs as $log)
                        <tr>
                            <td>{{ $log->id }}</td>
                            <td>{{ $log->user ? $log->user->fullName : 'N/A' }}</td>
                            <td>{{ $log->email }}</td>
                            <td>
                                @if($log->coupon)
                                    <span class="badge bg-secondary">{{ $log->coupon->code }}</span>
                                @else
                                    <span class="text-muted">Không có</span>
                                @endif
                            </td>
                            <td>{{ $log->sent_at ? $log->sent_at->format('d/m/Y H:i:s') : 'N/A' }}</td>
                            <td>
                                @if($log->status == 'success')
                                    <span class="badge bg-success">Thành công</span>
                                @else
                                    <span class="badge bg-danger">Thất bại</span>
                                @endif
                            </td>
                            <td>{{ $log->error_message }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted">Chưa có dữ liệu gửi email.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <!-- Phân trang -->
        <div class="d-flex justify-content-end mt-3">
            {{ $logs->links('pagination::bootstrap-5') }}
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
