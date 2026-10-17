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

        $origin = [
            'name' => 'SORA Jewelry (Kho Buôn Ma Thuột)',
            'lat' => 12.6667,
            'lng' => 108.0383
        ];

        $address = mb_strtolower($order->customer_address);
        
        $provinces = [
            'an giang' => ['lat' => 10.3711, 'lng' => 105.4323],
            'bà rịa' => ['lat' => 10.4960, 'lng' => 107.1683],
            'bạc liêu' => ['lat' => 9.2941, 'lng' => 105.7278],
            'bắc giang' => ['lat' => 21.2731, 'lng' => 106.1946],
            'bắc kạn' => ['lat' => 22.1470, 'lng' => 105.8348],
            'bắc ninh' => ['lat' => 21.1861, 'lng' => 106.0763],
            'bến tre' => ['lat' => 10.2449, 'lng' => 106.3753],
            'bình định' => ['lat' => 13.7829, 'lng' => 109.2197],
            'bình dương' => ['lat' => 11.0630, 'lng' => 106.6625],
            'bình phước' => ['lat' => 11.7514, 'lng' => 106.9272],
            'bình thuận' => ['lat' => 10.9333, 'lng' => 108.1000],
            'cà mau' => ['lat' => 9.1769, 'lng' => 105.1500],
            'cần thơ' => ['lat' => 10.0451, 'lng' => 105.7468],
            'cao bằng' => ['lat' => 22.6667, 'lng' => 106.2500],
            'đà nẵng' => ['lat' => 16.0544, 'lng' => 108.2021],
            'đắk lắk' => ['lat' => 12.6667, 'lng' => 108.0383],
            'đắk nông' => ['lat' => 12.2281, 'lng' => 107.7225],
            'điện biên' => ['lat' => 21.3853, 'lng' => 103.0159],
            'đồng nai' => ['lat' => 10.9405, 'lng' => 106.8208],
            'đồng tháp' => ['lat' => 10.4633, 'lng' => 105.6806],
            'gia lai' => ['lat' => 13.9833, 'lng' => 108.0000],
            'hà giang' => ['lat' => 22.8233, 'lng' => 104.9833],
            'hà nam' => ['lat' => 20.5453, 'lng' => 105.9122],
            'hà nội' => ['lat' => 21.0285, 'lng' => 105.8048],
            'hà tĩnh' => ['lat' => 18.3333, 'lng' => 105.9000],
            'hải dương' => ['lat' => 20.9333, 'lng' => 106.3167],
            'hải phòng' => ['lat' => 20.8449, 'lng' => 106.6880],
            'hậu giang' => ['lat' => 9.7681, 'lng' => 105.6322],
            'hòa bình' => ['lat' => 20.8133, 'lng' => 105.3383],
            'hưng yên' => ['lat' => 20.6464, 'lng' => 106.0511],
            'khánh hòa' => ['lat' => 12.2500, 'lng' => 109.1833],
            'nha trang' => ['lat' => 12.2458, 'lng' => 109.1943],
            'kiên giang' => ['lat' => 10.0125, 'lng' => 105.0809],
            'kon tum' => ['lat' => 14.3500, 'lng' => 108.0000],
            'lai châu' => ['lat' => 22.3969, 'lng' => 103.4617],
            'lâm đồng' => ['lat' => 11.5833, 'lng' => 108.1333],
            'đà lạt'    => ['lat' => 11.9404, 'lng' => 108.4583],
            'lạng sơn' => ['lat' => 21.8333, 'lng' => 106.7667],
            'lào cai' => ['lat' => 22.4833, 'lng' => 103.9667],
            'long an' => ['lat' => 10.5333, 'lng' => 106.4000],
            'nam định' => ['lat' => 20.4333, 'lng' => 106.1667],
            'nghệ an' => ['lat' => 18.6733, 'lng' => 105.6813],
            'ninh bình' => ['lat' => 20.2539, 'lng' => 105.9750],
            'ninh thuận' => ['lat' => 11.5667, 'lng' => 108.9833],
            'phú thọ' => ['lat' => 21.3167, 'lng' => 105.2167],
            'phú yên' => ['lat' => 13.0833, 'lng' => 109.3000],
            'quảng bình' => ['lat' => 17.4833, 'lng' => 106.2667],
            'quảng nam' => ['lat' => 15.5833, 'lng' => 107.9833],
            'quảng ngãi' => ['lat' => 15.1167, 'lng' => 108.8000],
            'quảng ninh' => ['lat' => 21.0366, 'lng' => 107.1905],
            'quảng trị' => ['lat' => 16.7500, 'lng' => 107.1833],
            'sóc trăng' => ['lat' => 9.6000, 'lng' => 105.9833],
            'sơn la' => ['lat' => 21.3333, 'lng' => 103.9000],
            'tây ninh' => ['lat' => 11.3667, 'lng' => 106.1000],
            'thái bình' => ['lat' => 20.4500, 'lng' => 106.3333],
            'thái nguyên' => ['lat' => 21.6000, 'lng' => 105.8333],
            'thanh hóa' => ['lat' => 19.8000, 'lng' => 105.7667],
            'thừa thiên huế' => ['lat' => 16.4637, 'lng' => 107.5905],
            'huế'       => ['lat' => 16.4637, 'lng' => 107.5905],
            'tiền giang' => ['lat' => 10.4167, 'lng' => 106.2500],
            'trà vinh' => ['lat' => 9.9167, 'lng' => 106.3333],
            'tuyên quang' => ['lat' => 21.8167, 'lng' => 105.2167],
            'vĩnh long' => ['lat' => 10.2500, 'lng' => 105.9667],
            'vĩnh phúc' => ['lat' => 21.3000, 'lng' => 105.6000],
            'yên bái' => ['lat' => 21.7000, 'lng' => 104.8667],
            'hồ chí minh'=>['lat' => 10.7626, 'lng' => 106.6601]
        ];

        $destination = ['name' => $order->customer_address, 'lat' => 10.7626, 'lng' => 106.6601]; 

        foreach ($provinces as $key => $coords) {
            if (strpos($address, $key) !== false) {
                $destination = [
                    'name' => $order->customer_address,
                    'lat' => $coords['lat'],
                    'lng' => $coords['lng']
                ];
                break;
            }
        }


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