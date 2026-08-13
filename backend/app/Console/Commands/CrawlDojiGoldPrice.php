<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use DOMDocument;
use DOMXPath;

class CrawlDojiGoldPrice extends Command
{
    protected $signature = 'sora:crawl-gold';

    protected $description = 'Điệp viên ngầm cào giá vàng từ trang chủ DOJI mỗi 5 phút';

    public function handle()
    {
        $this->info('Bắt đầu lấy dữ liệu giá vàng từ API Vang.Today...');

        try {
            // Luồng 1: API vang.today (Nhanh, xịn, không bị chặn Bot)
            $goldPrices = $this->crawlVangToday();

            // Luồng 2: Dự phòng Chợ Giá
            if (empty($goldPrices)) {
                $this->warn('API Vang.Today thất bại. Chuyển sang cào dự phòng từ Chợ Giá...');
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language' => 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                ])->timeout(15)->get('https://chogia.vn/gia-vang/');
                
                if ($response->successful()) {
                    $goldPrices = $this->parseChoGia($response->body());
                }
            }

            // Luồng 3: Dự phòng DOJI
            if (empty($goldPrices)) {
                $this->warn('Chợ Giá cũng thất bại. Chuyển sang cào dự phòng từ DOJI...');
                $goldPrices = $this->crawlDoji();
            }

            if (!empty($goldPrices)) {
                // Tăng thời gian sống của Cache lên 1 ngày (86400s) thay vì 300s để giữ lại dữ liệu cũ hợp lệ khi cào lỗi
                Cache::put('sora_gold_prices', $goldPrices, 86400);
                Cache::put('sora_gold_last_updated', now()->format('H:i d/m/Y'), 86400);

                $this->info('Thành công! Đã lấy được ' . count($goldPrices) . ' mã vàng.');
            } else {
                $this->warn('Không tìm thấy dữ liệu giá vàng! Giữ lại dữ liệu cũ trong Cache.');
            }

        } catch (\Exception $e) {
            $this->error('Lỗi kĩ thuật: ' . $e->getMessage());
            $this->warn('Tiến trình thất bại, dữ liệu cũ trong Cache sẽ được duy trì.');
        }
    }

    private function parseChoGia($html)
    {
        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
        $xpath = new DOMXPath($dom);

        $rows = $xpath->query('//table[contains(@class, "tbl_style_embed")]/tbody/tr');
        $goldPrices = [];

        foreach ($rows as $row) {
            $cols = $xpath->query('td', $row);
            if ($cols->length >= 3) {
                $name = trim(strip_tags($cols->item(0)->textContent));
                $buyRaw = trim($cols->item(1)->textContent);
                $sellRaw = trim($cols->item(2)->textContent);

                $buyClean = floatval(str_replace(['.', ','], '', $buyRaw));
                $sellClean = floatval(str_replace(['.', ','], '', $sellRaw));

                $buyPrice = $buyClean / 10;
                $sellPrice = $sellClean / 10;

                if ($name && $buyPrice > 0 && $sellPrice > 0) {
                    $goldPrices[] = [
                        'name' => $name,
                        'buy' => number_format($buyPrice, 0, '.', ','),
                        'sell' => number_format($sellPrice, 0, '.', ','),
                    ];
                }
            }
        }
        
        return $goldPrices;
    }

    private function crawlDoji()
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            ])->timeout(15)->get('https://giavang.doji.vn/');

            if (!$response->successful()) return [];

            $html = $response->body();
            $dom = new DOMDocument();
            @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
            $xpath = new DOMXPath($dom);

            $rows = $xpath->query('//table//tbody//tr');
            $goldPrices = [];

            $cleanAndFormatPrice = function($rawPrice) {
                $rawPrice = trim($rawPrice);
                if (empty($rawPrice) || $rawPrice === '-') return null;
                $pureNumber = str_replace([',', '.'], '', $rawPrice);
                if (is_numeric($pureNumber) && floatval($pureNumber) > 0) return number_format($pureNumber);
                return null;
            };

            foreach ($rows as $row) {
                $cols = $xpath->query('td', $row);
                if ($cols->length >= 3) {
                    $name = trim(strip_tags($cols->item(0)->textContent));
                    $buy = $cleanAndFormatPrice($cols->item(1)->textContent);
                    $sell = $cleanAndFormatPrice($cols->item(2)->textContent);

                    if ($name && $buy !== null && $sell !== null) {
                        $goldPrices[] = [
                            'name' => $name,
                            'buy' => $buy,
                            'sell' => $sell,
                        ];
                    }
                }
            }

            return $goldPrices;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function crawlVangToday()
    {
        try {
            $response = Http::timeout(10)->get('https://www.vang.today/api/prices');
            if (!$response->successful()) return [];

            $data = $response->json();
            if (!isset($data['success']) || !$data['success'] || !isset($data['prices'])) {
                return [];
            }

            $goldPrices = [];
            foreach ($data['prices'] as $key => $item) {
                // Chỉ lấy giá VNĐ và tên hợp lệ
                if (
                    isset($item['currency'], $item['name'], $item['buy'], $item['sell']) &&
                    $item['currency'] === 'VND' &&
                    is_numeric($item['buy']) && $item['buy'] > 0 &&
                    is_numeric($item['sell']) && $item['sell'] > 0
                ) {
                    // API trả về Giá Lượng (VD: 140,800,000). Frontend dùng Giá Chỉ / 1000 (VD: 14,080)
                    $buyPrice = $item['buy'] / 10000;
                    $sellPrice = $item['sell'] / 10000;

                    $goldPrices[] = [
                        'name' => $item['name'],
                        'buy' => number_format($buyPrice, 0, '.', ','),
                        'sell' => number_format($sellPrice, 0, '.', ','),
                    ];
                }
            }
            return $goldPrices;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getDynamicMockData()
    {
        // Random dao động từ -500.000đ đến +500.000đ mỗi lượng (tức là -50 đến +50 nghìn/chỉ)
        // Để đồ án trông có vẻ như đang chạy realtime
        $noise = rand(-50, 50);

        return [
            ['name' => 'DOJI HN', 'buy' => number_format(74500 + $noise, 0, '.', ','), 'sell' => number_format(76500 + $noise, 0, '.', ',')],
            ['name' => 'DOJI HCM', 'buy' => number_format(74500 + $noise, 0, '.', ','), 'sell' => number_format(76500 + $noise, 0, '.', ',')],
            ['name' => 'SJC HN', 'buy' => number_format(75000 + $noise, 0, '.', ','), 'sell' => number_format(77000 + $noise, 0, '.', ',')],
            ['name' => 'SJC HCM', 'buy' => number_format(75000 + $noise, 0, '.', ','), 'sell' => number_format(77000 + $noise, 0, '.', ',')],
            ['name' => 'Vàng nhẫn 9999', 'buy' => number_format(63500 + $noise, 0, '.', ','), 'sell' => number_format(64500 + $noise, 0, '.', ',')],
        ];
    }
}