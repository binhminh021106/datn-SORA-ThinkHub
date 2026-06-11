<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderSimulationController extends Controller
{
    public function getSimulationData($id)
    {
        $order = Order::findOrFail($id);

        // 1. Tọa độ kho hàng mặc định (SORA Boutique - Buôn Ma Thuột)
        $origin = [
            'name' => 'SORA Jewelry (Kho Buôn Ma Thuột)',
            'lat' => 12.6667,
            'lng' => 108.0383
        ];

        // 2. Phân tích địa chỉ khách để lấy tọa độ tương đối
        $address = mb_strtolower($order->customer_address);
        
        // Bộ từ điển tọa độ trung tâm của các tỉnh/thành chính
        // (Thêm càng nhiều tỉnh, hệ thống nhúng bản đồ càng chuẩn xác)
        $provinces = [
            'bắc giang' => ['lat' => 21.2731, 'lng' => 106.1946],
            'hà nội'    => ['lat' => 21.0285, 'lng' => 105.8048],
            'hải phòng' => ['lat' => 20.8449, 'lng' => 106.6880],
            'quảng ninh'=> ['lat' => 21.0366, 'lng' => 107.1905],
            'nghệ an'   => ['lat' => 18.6733, 'lng' => 105.6813],
            'đà nẵng'   => ['lat' => 16.0544, 'lng' => 108.2021],
            'huế'       => ['lat' => 16.4637, 'lng' => 107.5905],
            'nha trang' => ['lat' => 12.2458, 'lng' => 109.1943],
            'đà lạt'    => ['lat' => 11.9404, 'lng' => 108.4583],
            'đắk lắk'   => ['lat' => 12.6667, 'lng' => 108.0383],
            'cần thơ'   => ['lat' => 10.0451, 'lng' => 105.7468],
            'bình dương'=> ['lat' => 11.0630, 'lng' => 106.6625],
            'đồng nai'  => ['lat' => 10.9405, 'lng' => 106.8208],
            'hồ chí minh'=>['lat' => 10.7626, 'lng' => 106.6601]
        ];

        // Mặc định là TP.Hồ Chí Minh nếu địa chỉ quá lạ (Không map được)
        $destination = ['name' => $order->customer_address, 'lat' => 10.7626, 'lng' => 106.6601]; 

        foreach ($provinces as $key => $coords) {
            if (strpos($address, $key) !== false) {
                $destination = [
                    'name' => $order->customer_address,
                    'lat' => $coords['lat'],
                    'lng' => $coords['lng']
                ];
                break; // Dừng lại ngay khi tìm thấy tỉnh khớp
            }
        }

        // =========================================================================
        // QUAN TRỌNG: ĐÃ XÓA HÀM rand(-10, 10)
        // Việc cộng trừ ngẫu nhiên sẽ đẩy tọa độ ra giữa khu vực không có đường bộ.
        // Dẫn đến API OSRM (định vị đường bộ) ở Frontend tìm đường thất bại, 
        // buộc phải tự vẽ đường thẳng (chim bay) như lỗi bạn vừa gặp.
        // =========================================================================

        return response()->json([
            'success' => true,
            'data' => [
                'order_code' => $order->order_code,
                'status' => $order->status,
                'origin' => $origin,
                'destination' => $destination
            ]
        ]);
    }
}